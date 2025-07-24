/**
 * @file Implements the `Csf` component, which is designed to generate snapshot tests from a module of components or test functions.
 * It integrates with the `Chk` component to automatically create and manage browser-based snapshot tests for each exported component or test.
 */

import { Verify } from './verify'
import { JSX, Stack } from 'woby'

type Component = (props: any) => JSX.Element
type Module = Record<string, Component>

/**
 * A component that generates snapshot tests from a module of components or tests.
 * Each component is expected to have default parameters if it's to be rendered without explicit props.
 * Modules using the `test()` function will be rendered in the browser debugger for interactive testing.
 *
 * @param props - An object containing:
 *   - `module`: An object where keys are component names and values are the component functions.
 *   - `path`: An optional string to prepend to the snapshot name, useful for organizing tests.
 * @returns An array of `JSX.Child` elements, each representing a `Chk` component wrapping a component from the module.
 */
export function Csf({ module, path }: { module: Module, path?: string }): JSX.Child[] {
    const ret = []
    const s = new Stack('')
    for (const componentName in module) {
        if (Object.prototype.hasOwnProperty.call(module, componentName)) {
            const Component = module[componentName]
            if (typeof Component === 'function') {
                ret.push(() => <Verify name={(path ? path + '/' : '') + Component.name}>
                    <Component />
                </Verify>)
            }
        }
    }

    return ret
}