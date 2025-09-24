/**
 * @file Dynamically loads and runs all *.test.ts files in the project
 * This is the entry point for running tests in the browser environment
 */

import { runTests, renderTestComponents } from 'chk'

import * as tests from '../index.test'
renderTestComponents(tests)
runTests()