/**
 * @file Provides mocking utilities for the `@woby/chk` testing framework, allowing for the creation and management of mocked modules.
 * This enables isolating units of code for testing by controlling their dependencies.
 */

import * as SS from "woby"
import { context } from 'woby'
import { TESTCONTEXT_SYMBOL } from "./testContext"
import { TextContext } from "./types"

/**
 * A map to store mocked modules, keyed by their module names.
 */
const mockedModules = new Map<string, any>()

/**
 * Imports a mocked module by its name.
 * This function is used within the test context to retrieve previously mocked modules.
 * @template T The expected type of the mocked module.
 * @param moduleName The name of the module to import.
 * @returns The mocked module, or `undefined` if not found.
 */
export const imp = <T>(moduleName: string): T => mockedModules.get(moduleName) as T

/**
 * An alias for `imp`, providing a `require`-like interface for importing mocked modules.
 */
export const req = imp

/**
 * Mocks a module, replacing its original implementation with a factory-generated mock.
 * The mocked module is stored internally and can be retrieved using `imp` or `req`.
 * 
 * @template T The type of the module being mocked.
 * @param moduleName The name of the module to mock.
 * @param factory A function that receives the current test context and returns the mocked implementation of the module.
 * @returns The mocked module, augmented with `__esModule: true` and `default` properties for compatibility.
 */
export function mock<T>(moduleName: string, factory: (p: TextContext<T>) => T): T & {
  __esModule: boolean
  default: T
} {
  const ctx = SS.context(TESTCONTEXT_SYMBOL) as TextContext<T>  //SS.context({ [TESTCONTEXT_SYMBOL]: { expect, test, subject, parent, import: createMockFromModule, require: createMockFromModule } }, async () => {

  const ret = Object.assign(factory(Object.assign(ctx, { import: imp, require: req })), { __esModule: true })

  mockedModules.set(moduleName, ret)
  return ret as any
}

/**
 * An alias for `mock`, providing a `doMock`-like interface for mocking modules.
 */
export const doMock = mock