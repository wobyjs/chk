/**
 * @file Provides serialization and deserialization utilities for component props and snapshot data.
 * This includes custom JSON replacers and revivers to handle special data types like Dates, Functions, and DOM elements,
 * ensuring consistent and accurate snapshot comparisons.
 */

/**
 * Defines the structure of snapshot data, containing serialized props and rendered HTML.
 */
interface SnapshotData {
    /** JSON string of serialized props. */
    props: string
    /** Rendered HTML string. */
    html: string
}

/** Symbol key for identifying serialized Date objects. */
const DATE_KEY = '__date__'
/** Symbol key for identifying serialized Function objects. */
const FUNCTION_KEY = '__function__'
/** Symbol key for identifying serialized DOM element references. */
const DOM_REF_KEY = '__dom_ref__' // For ref objects holding DOM elements

/**
 * Custom replacer function for `JSON.stringify`.
 * It handles serialization of `Date` objects, `Function` objects, `undefined` values,
 * and `HTMLElement`/`SVGElement` instances into a JSON-compatible format.
 * @param this The object being stringified.
 * @param key The key of the property being processed.
 * @param value The value of the property being processed.
 * @returns The serialized value, or a placeholder for special types.
 */
function replacer(this: any, key: string, value: any): any {
    // Handle Date objects
    if (this[key] instanceof Date) {
        return { [DATE_KEY]: this[key].toISOString() }
    }
    // Handle Functions
    if (typeof value === 'function') {
        return { [FUNCTION_KEY]: `[Function: ${value.name || 'anonymous'}]` }
    }
    // Handle undefined (JSON.stringify normally omits properties with undefined values)
    if (value === undefined) {
        return '__undefined__' // Placeholder string
    }
    // Handle DOM references that might be passed as props (unlikely but possible if refObject itself is a prop)
    // Or, more commonly, if a ref signal's current value is a DOM node.
    // The request implies "cache value instead of ref"
    // If `ref.current` is a DOM node, we don't want to serialize the node itself.
    // This logic is for *props* serialization, not for what `ref.current` *becomes*.
    // For props, if a prop *itself* is a DOM node, we'll mark it.
    if (value instanceof HTMLElement || value instanceof SVGElement) {
        return { [DOM_REF_KEY]: `[DOM Element: ${value.tagName}]` }
    }
    // Handle Woby signals that might hold DOM elements (though usually these are internal)
    // If a signal (like `ref`) holds a DOM node, we want to represent it.
    // For now, let's assume `ref` props are handled by Woby internally and don't
    // need special serialization here unless the *prop itself* is a DOM node.
    // The primary focus for "cache value instead of ref" is often
    // that the *rendered HTML* will implicitly contain the effects of the ref.
    // For *props*, we care about serializing what was *passed in*.

    return value
}

/**
 * Custom reviver function for `JSON.parse`.
 * It reconstructs `Date` objects and replaces placeholders for `Function` objects and DOM elements
 * with appropriate representations or `undefined`.
 * @param this The object being parsed.
 * @param key The key of the property being processed.
 * @param value The value of the property being processed.
 * @returns The deserialized value, or a reconstructed object for special types.
 */
function reviver(this: any, key: string, value: any): any {
    if (value && typeof value === 'object') {
        if (value[DATE_KEY]) {
            return new Date(value[DATE_KEY])
        }
        if (value[FUNCTION_KEY]) {
            // Cannot reconstruct original function, return a placeholder
            return () => { console.warn(`Attempted to call deserialized function: ${value[FUNCTION_KEY]}`) }
        }
        if (value[DOM_REF_KEY]) {
            // Cannot reconstruct DOM element, return a placeholder
            return null // Or a dummy object if needed, but null is safer for props
        }
    }
    if (value === '__undefined__') {
        return undefined
    }
    return value
}

/**
 * Serializes component props into a JSON string, handling special types using custom replacers.
 * @param props The props object to serialize.
 * @returns A JSON string representation of the props.
 */
export function serializeProps(props: Record<string, any>): string {
    // Deep clone to ensure we don't modify the original props object,
    // especially if the replacer needs to look at `this[key]`.
    const clonedProps = JSON.parse(JSON.stringify(props, replacer), reviver)
    return JSON.stringify(clonedProps, replacer, 2)
}

/**
 * Deserializes a JSON string back into a props object, reconstructing special types using custom revivers.
 * @param jsonString The JSON string of props to deserialize.
 * @returns The deserialized props object.
 */
export function deserializeProps(jsonString: string): Record<string, any> {
    return JSON.parse(jsonString, reviver)
}

/**
 * A simple deep equality checker for JavaScript objects.
 * Handles primitive types, arrays, objects, and specific types like Date.
 * This is crucial for comparing the *deserialized* props.
 * @param a The first value to compare.
 * @param b The second value to compare.
 * @returns `true` if the values are deeply equal, `false` otherwise.
 */
function deepEqual(a: any, b: any): boolean {
    if (a === b) return true

    if (a && typeof a === 'object' && b && typeof b === 'object') {
        if (a.constructor !== b.constructor) return false

        if (a instanceof Date && b instanceof Date) {
            return a.getTime() === b.getTime()
        }

        if (Array.isArray(a)) {
            if (a.length !== b.length) return false
            for (let i = 0; i < a.length; i++) {
                if (!deepEqual(a[i], b[i])) return false
            }
            return true
        }

        if (a instanceof Object) {
            const keysA = Object.keys(a)
            const keysB = Object.keys(b)
            if (keysA.length !== keysB.length) return false

            for (const key of keysA) {
                if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false
            }
            return true
        }
    }

    // Handle NaN equality
    if (Number.isNaN(a) && Number.isNaN(b)) return true

    return false
}

/**
 * Compares two snapshot objects and determines the type of difference.
 * @param snap1 The first snapshot data (can be null if no existing snapshot).
 * @param snap2 The second snapshot data to compare against.
 * @returns A string indicating the comparison result: 'no-diff', 'props-diff', 'content-diff', or 'new'.
 */
export function compareSnapshots(snap1: SnapshotData | null, snap2: SnapshotData): 'no-diff' | 'props-diff' | 'content-diff' | 'new' {
    if (!snap1) {
        return 'new' // No existing snapshot
    }

    const propsEqual = deepEqual(deserializeProps(snap1.props), deserializeProps(snap2.props))
    const htmlEqual = snap1.html === snap2.html

    if (propsEqual && htmlEqual) {
        return 'no-diff'
    } else if (!propsEqual && htmlEqual) {
        return 'props-diff'
    } else if (propsEqual && !htmlEqual) {
        return 'content-diff'
    } else {
        // If both props and content differ, we prioritize content diff for flagging.
        // Or, you could have a 'both-diff' type. For simplicity, we'll flag content diff here.
        return 'content-diff'
    }
}