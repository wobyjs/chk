/**
 * @file Implements the `Chk` React component, which facilitates browser-based snapshot testing in a development environment.
 * This component captures the rendered output of its children and compares it against stored snapshots,
 * providing a visual diff and options to accept or reject changes.
 */

// Add vite/client types for import.meta.env
/// <reference types="vite/client"/>

import { type JSX, render, SYMBOL_STACK, StackTaggedFunction, useEffect, $, $$, useMemo, isPrimitive, DEBUGGER, customElement, ObservableMaybe, isObservable } from 'woby'
import { serializeProps, serializeOutput, normalizeComponentName } from './utils'
import { SnapshotTest } from './snapshotTest' // Import SnapshotTest

if (!window.isDeno)
    import('./index.css')

DEBUGGER.test = true

/**
 * Trims children by removing empty text nodes.
 * @param children The children to trim
 * @returns The trimmed children with empty text nodes removed
 */
export function trimChildren(children: JSX.Children): Element[] {
    if (!children) return children as any

    // Handle array of children
    if (Array.isArray(children)) {
        return children.filter(child => {
            // Keep non-string and non-text-node children
            if (typeof child !== 'string' && !(child && (child as any).nodeName === '#text')) return true
            // For string or text nodes, remove empty ones and whitespace-only ones
            const textContent = typeof child === 'string' ? child : (child as any).textContent || ''
            return textContent.trim() !== ''
        }) as any //as JSX.Element
    }

    // Handle single child
    if (typeof children === 'string' && (children as string).trim() === '') {
        return ['' as any]
    }

    // Handle single text node
    if (children && (children as any).nodeName === '#text') {
        const textContent = (children as any).textContent || ''
        if (textContent.trim() === '') {
            return ['' as any]
        }
    }

    return children as any
}

/**
 * Props for the `Chk` component.
 */
interface ChkProps {
    /** A unique name for this snapshot test, used to identify and store the snapshot. */
    name: ObservableMaybe<string>
    /** The React element(s) to be rendered and snapshotted. */
    children: ObservableMaybe<JSX.Element>
    /** Any other props passed to the wrapped component, which will be serialized and stored with the snapshot. */
    [key: string]: any
}

/**
 * The `Chk` component provides snapshot testing capabilities in a development environment.
 * It renders its children, captures their HTML output, and compares it against a stored snapshot.
 * In development mode, it displays a UI for reviewing and updating snapshots.
 * In production, it simply renders its children without any snapshot testing overhead.
 * 
 * @param props The properties for the `Chk` component, including the snapshot name and the children to be tested.
 * @returns The rendered children, wrapped with snapshot testing UI in development mode.
 */
export function Chk(props: ChkProps) {
    const { name, children, ...componentProps } = props
    const isDev = typeof import.meta.env !== 'undefined' && import.meta.env.DEV
    const rejected = $(false)

    // Trim children to remove empty text nodes
    const trimmedChildren = trimChildren(children)

    if (!!trimmedChildren && !(trimmedChildren as any as StackTaggedFunction)[SYMBOL_STACK])
        console.error('Debug/test info not available, please set woby.DEBUGGER.test = true')

    // const comp = extractNamedComponent((children as StackTaggedFunction)[SYMBOL_STACK]?.stack?.split('\n')[4])
    // const compName = comp ? comp + '/' + name : name

    if (trimmedChildren.length === 1 && !$$(name))
        if (isObservable(name))
            name(trimmedChildren[0].nodeName.toLowerCase())

    const compName = normalizeComponentName($$(name) ?? trimmedChildren[0].nodeName.toLowerCase())

    // if (isDev) {
    const renderedOutput = $<string>('') // Create a reactive observable for renderedOutput

    try {
        // Render the children to a detached DOM element to capture its output
        const container = document.createElement('div')

        if (typeof trimmedChildren !== 'function') {
            // Create a MutationObserver to detect child node additions
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            // Update renderedOutput when nodes are added
                            if (node instanceof Element) {
                                renderedOutput(serializeOutput(node.outerHTML))
                            }
                            // You can add specific logic here to handle added nodes
                        })
                    }
                }
            })

            // Configure the observer to watch for child node additions
            const observerConfig = {
                childList: true,
                subtree: true
            }

            // Start observing the container for child node additions
            observer.observe(container, observerConfig)
            render(trimmedChildren, container)
        }
        else {
            render(trimmedChildren, container)
            renderedOutput(serializeOutput(container.innerHTML))
        }
    } catch (e: any) {
        console.error(`[Chk] Error rendering component '${compName}' for snapshot:`, e)
        renderedOutput(`ERROR: ${e.message}`)
    }

    const serializedComponentProps = serializeProps(componentProps)

    const snapshot = useMemo(() => {
        // Create a new SnapshotTest instance
        const sp = new SnapshotTest(compName, serializedComponentProps, $$(renderedOutput), (trimmedChildren as any as StackTaggedFunction)[SYMBOL_STACK])

        // Add the SnapshotTest instance to window.checks.modules
        // This assumes window.checks is initialized and accessible.
        // In a real application, you might have a more controlled way to register tests.
        if (window.checks) {
            // Check if a test with this name already exists to avoid duplicates
            const existingTestIndex = window.checks.modules.findIndex(m => m.title === name && m instanceof SnapshotTest)
            if (existingTestIndex !== -1) {
                // If it exists, replace it with the new instance (for re-renders)
                window.checks.modules[existingTestIndex] = sp
            } else {
                // Otherwise, add it as a new test
                window.checks.modules.push(sp)
            }
            console.log(`[Chk Dev Mode] Registered/Updated snapshot test for '${name}'.`)
        } else {
            console.warn("[Chk Dev Mode] window.checks is not available. Snapshot test not registered.")
        }

        return sp
    })

    const ref = $<HTMLDivElement>()
    useEffect(() => {
        if (!$$(ref)) return
        const sp = $$(snapshot) as SnapshotTest
        if (!sp) return

        const s = $$(sp.loadedSnapshot)
        $$(sp.tested) //refresh trigger
        if (isPrimitive(s))
            $$(ref).innerHTML = s as string ?? "Loading Snapshot..."
        else
            $$(ref).replaceChildren(s as any)
    })

    const result = useMemo(() => $$($$(snapshot).tested) && $$(snapshot).result)

    const buttons = useMemo(() => {
        return ($$($$(snapshot).tested) && !$$(result) && !$$(rejected)) ?
            <div class="flex space-x-1">
                <button class="px-2 py-0.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 cursor-pointer" onClick={() => $$(snapshot).save()}>Accept</button>
                <button class="px-2 py-0.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 cursor-pointer" onClick={() => rejected(true)}>Reject</button>
            </div> : null
    })


    // The actual UI for accept/reject will be handled by the messenger/browser components
    // and triggered by the snapshotTest.ts module.
    return <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4">
        <div class="relative border rounded-md pt-6 pb-4 px-4 bg-white shadow-sm">
            <div class="absolute -top-3 left-4 right-4 flex justify-between items-center">
                <span class={["bg-white px-2 text-sm font-semibold ", () => $$(result) ? "text-green-800" : "text-red-800"]}><b>{name}</b></span>

                {/* <div class="flex space-x-1">
                        <button class="px-2 py-0.5 bg-green-600 text-white text-xs rounded hover:bg-green-700">Accept</button>
                        <button class="px-2 py-0.5 bg-red-600 text-white text-xs rounded hover:bg-red-700">Reject</button>
                    </div> */}
            </div>

            {trimmedChildren}
            {/* Placeholder for accept/reject buttons, to be rendered by the framework */}
        </div>
        <div class="relative border rounded-md pt-6 pb-4 px-4 bg-white shadow-sm">
            <div class="absolute -top-3 left-4 right-4 flex justify-between items-center">
                <span class={["bg-white px-2 text-sm font-semibold ", () => $$(result) ? "text-green-800" : "text-red-800"]}><b>{name}</b> Snapshot</span>
                {buttons}
            </div>
            <div ref={ref} />
        </div>
    </div>
    // } else {
    //     // In production, just render the children directly 
    //     return children
    // }
}

if (!customElements.get('woby-chk'))
    customElement('woby-chk', Chk, 'name')


if (!customElements.get('woby-test'))
    customElement('woby-test', Chk, 'name')