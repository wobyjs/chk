/**
 * @file Environment-agnostic snapshot utilities that work in both browser and CLI environments.
 * This file provides functions for loading and saving snapshots that automatically adapt
 * to the current runtime environment.
 */

// Environment detection
const isBrowser = typeof window !== 'undefined' && !((window as any).isDeno)
// const isDeno = typeof (globalThis as any).Deno !== 'undefined'
const isNode = !isBrowser

// In-memory storage for snapshots in all environments
const memorySnapshots: Record<string, { props: string, html: string }> = {}

// Base directory for snapshot files (only used in CLI environments)
let snapshotBaseDir = ''

// Set default base directory for CLI environments
if (!isBrowser && typeof process !== 'undefined' && process.cwd) {
    snapshotBaseDir = process.cwd()
}

/**
 * Sets the base directory for snapshot files.
 * Only works in CLI environments (Node.js/Deno).
 * @param dir The base directory path
 */
export function setSnapshotBaseDir(dir: string) {
    if (!isBrowser) {
        snapshotBaseDir = dir
    }
}

/**
 * Gets the file path for a snapshot
 * @param id The snapshot identifier
 * @returns The full file path
 */
async function getSnapshotFilePath(id: string): Promise<string> {
    // Only use file system in CLI environments
    if (isBrowser) {
        return ''
    }

    try {
        const path = await import('node:path')
        // Normalize the ID to create a valid file path
        const normalizedId = id.replace(/[^a-zA-Z0-9/_\-\.]/g, '_')
        return path.resolve(snapshotBaseDir, '.snapshots', `${normalizedId}.snapshot.json`)
    } catch (e) {
        return ''
    }
}

/**
 * Ensures the snapshot directory exists
 * @param filePath The full file path
 */
async function ensureSnapshotDirectory(filePath: string) {
    // Only use file system in CLI environments
    if (isBrowser || !filePath) {
        return
    }

    try {
        const fs = await import('node:fs')
        const path = await import('node:path')
        const dir = path.dirname(filePath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
    } catch (e) {
        // Ignore errors
    }
}

/**
 * Loads a snapshot from storage based on the current environment.
 * In browser environments, uses fetch API to communicate with the snapshot server.
 * In CLI environments, uses memory storage and file system.
 * 
 * @param id The unique identifier for the snapshot
 * @returns A promise that resolves to the snapshot content, or undefined if not found
 */
export async function loadSnapshot(id: string): Promise<{ props: string, html: string } | undefined> {
    if (isBrowser) {
        // Browser environment - use fetch API
        try {
            const res = await fetch(`/@snapshot-api?id=${encodeURIComponent(id)}`)
            if (!res.ok) {
                return undefined
            }
            const text = await res.text()
            try {
                const json = JSON.parse(text)
                return json
            } catch (e) {
                console.error(`%c${(e as Error).message}`, 'color: red; font-weight: bold;')
                return undefined
            }
        } catch (e) {
            console.error(`%c${(e as Error).message}`, 'color: red; font-weight: bold;')
            return undefined
        }
    } else {
        // Node.js/Deno environment - check memory first, then file system
        if (memorySnapshots[id]) {
            return memorySnapshots[id]
        }

        // Try to load from file system
        try {
            const fs = await import('node:fs')
            const filePath = await getSnapshotFilePath(id)
            if (filePath && fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8')
                const snapshot = JSON.parse(content)
                // Store in memory for faster access next time
                memorySnapshots[id] = snapshot
                return snapshot
            }
            return undefined
        } catch (e) {
            console.error(`%c${(e as Error).message}`, 'color: red; font-weight: bold;')
            return undefined
        }
    }
}

/**
 * Saves a snapshot to storage based on the current environment.
 * In browser environments, uses fetch API to communicate with the snapshot server.
 * In CLI environments, saves to memory and file system.
 * 
 * @param id The unique identifier for the snapshot
 * @param props The serialized props
 * @param html The rendered HTML content
 * @returns A promise that resolves when the snapshot is saved
 */
export async function saveSnapshot(id: string, props: string, html: string): Promise<void> {
    if (isBrowser) {
        // Browser environment - use fetch API
        try {
            await fetch(`/@snapshot-api?id=${encodeURIComponent(id)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ props, html })
            })
        } catch (e) {
            console.error(`%c${(e as Error).message}`, 'color: red; font-weight: bold;')
            throw e
        }
    } else {
        // Node.js/Deno environment - save to memory and file system
        const snapshot = { props, html }
        memorySnapshots[id] = snapshot

        // Save to file system
        try {
            const fs = await import('node:fs')
            const filePath = await getSnapshotFilePath(id)
            if (filePath) {
                await ensureSnapshotDirectory(filePath)
                fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8')
                console.log(`[snapshot] Saved snapshot for '${id}' to ${filePath}`)
            }
        } catch (e) {
            console.error(`%cFailed to save snapshot to file system: ${(e as Error).message}`, 'color: red; font-weight: bold;')
            // We still have it in memory, so don't throw
        }
    }
}

/**
 * Deletes a snapshot from storage based on the current environment.
 * 
 * @param id The unique identifier for the snapshot
 * @returns A promise that resolves when the snapshot is deleted
 */
export async function deleteSnapshot(id: string): Promise<void> {
    if (isBrowser) {
        // Browser environment - use fetch API
        try {
            await fetch(`/@snapshot-api?id=${encodeURIComponent(id)}`, {
                method: 'DELETE'
            })
        } catch (e) {
            console.error(`%c${(e as Error).message}`, 'color: red; font-weight: bold;')
            throw e
        }
    } else {
        // Node.js/Deno environment - delete from memory and file system
        delete memorySnapshots[id]

        // Delete from file system
        try {
            const fs = await import('node:fs')
            const filePath = await getSnapshotFilePath(id)
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
                console.log(`[snapshot] Deleted snapshot for '${id}' from ${filePath}`)
            }
        } catch (e) {
            console.error(`%cFailed to delete snapshot from file system: ${(e as Error).message}`, 'color: red; font-weight: bold;')
            // Don't throw as this is not critical
        }
    }
}