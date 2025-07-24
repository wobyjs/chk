/**
 * @file Implements the `Chk` React component, which facilitates browser-based snapshot testing in a development environment.
 * This component captures the rendered output of its children and compares it against stored snapshots,
 * providing a visual diff and options to accept or reject changes.
 */

// Add vite/client types for import.meta.env
/// <reference types="vite/client"/>

import { type JSX, render, SYMBOL_STACK, StackTaggedFunction, useEffect, $, $$, useMemo, isPrimitive, DEBUGGER } from 'woby'
import { serializeProps, serializeOutput } from './utils'
import { SnapshotTest } from './snapshotTest' // Import SnapshotTest
import './index.css'

DEBUGGER.test = true
/**
 * Props for the `Chk` component.
 */
interface ChkProps {
    /** A unique name for this snapshot test, used to identify and store the snapshot. */
    name: string
    /** The React element(s) to be rendered and snapshotted. */
    children: JSX.Element
    /** Any other props passed to the wrapped component, which will be serialized and stored with the snapshot. */
    [key: string]: any
}

// This will be a global registry for snapshot tests
// In a real framework, this would be more sophisticated,
// possibly integrated with the existing `Check` class.
// const snapshotTests: { [name: string]: { props: any, output: string, component: JSX.Element } } = {} // Removed, now handled by SnapshotTest instances

/**
 * Extracts a named component from a stack trace.
 * This is used to derive a more descriptive name for the snapshot based on the component being tested.
 * @param trace The stack trace string.
 * @returns The extracted component name, or `null` if not found or if it's a generic name.
 */
function extractNamedComponent(trace?: string): string | null {
    if (!trace) return null

    const match = trace.match(/at\s+([^\s]+)\s+\(/)
    const name = match?.[1]
    return name && !["Object", "<anonymous>", "Function"].includes(name) ? name : null
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

    if (!!children && !(children as StackTaggedFunction)[SYMBOL_STACK])
        console.error('Debug/test info not available, please set woby.DEBUGGER.test = true')

    const comp = extractNamedComponent((children as StackTaggedFunction)[SYMBOL_STACK]?.stack?.split('\n')[4])
    const compName = comp ? comp + '/' + name : name

    // if (isDev) {
    let renderedOutput: string
    try {
        // Render the children to a detached DOM element to capture its output
        const container = document.createElement('div')
        render(children, container)
        renderedOutput = serializeOutput(container.innerHTML) // Serialize the HTML output
    } catch (e: any) {
        console.error(`[Chk] Error rendering component '${compName}' for snapshot:`, e)
        renderedOutput = `ERROR: ${e.message}`
    }

    const serializedComponentProps = serializeProps(componentProps)

    // Create a new SnapshotTest instance
    const snapshot = new SnapshotTest(compName, serializedComponentProps, renderedOutput, (children as StackTaggedFunction)[SYMBOL_STACK])

    // Add the SnapshotTest instance to window.chk.modules
    // This assumes window.chk is initialized and accessible.
    // In a real application, you might have a more controlled way to register tests.
    if (window.chk) {
        // Check if a test with this name already exists to avoid duplicates
        const existingTestIndex = window.chk.modules.findIndex(m => m.title === name && m instanceof SnapshotTest)
        if (existingTestIndex !== -1) {
            // If it exists, replace it with the new instance (for re-renders)
            window.chk.modules[existingTestIndex] = snapshot
        } else {
            // Otherwise, add it as a new test
            window.chk.modules.push(snapshot)
        }
        console.log(`[Chk Dev Mode] Registered/Updated snapshot test for '${name}'.`)
    } else {
        console.warn("[Chk Dev Mode] window.chk is not available. Snapshot test not registered.")
    }

    const ref = $<HTMLDivElement>()
    useEffect(() => {
        if (!$$(ref)) return
        const s = $$(snapshot.loadedSnapshot)
        $$(snapshot.tested) //refresh trigger
        if (isPrimitive(s))
            $$(ref).innerHTML = s as string ?? "Loading Snapshot..."
        else
            $$(ref).replaceChildren(s as any)
    })

    const result = useMemo(() => $$(snapshot.tested) && snapshot.result)

    const buttons = useMemo(() => {
        return ($$(snapshot.tested) && !$$(result) && !$$(rejected)) ?
            <div class="flex space-x-1">
                <button class="px-2 py-0.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 cursor-pointer" onClick={() => snapshot.save()}>Accept</button>
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

            {children}
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