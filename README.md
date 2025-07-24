# chk: A Modern TypeScript Testing Toolkit

`chk` is a powerful and flexible testing toolkit designed to streamline unit and integration testing in TypeScript projects. It offers a comprehensive suite of utilities for writing robust and reliable tests with an intuitive, fluent API that will feel familiar to users of modern testing frameworks like Jest or Vitest.

Whether you're building a simple library or a complex application, `chk` provides the tools you need to ensure your code is working as expected. From simple value assertions to complex mocking and spying, `chk` has you covered.

## Features

*   **Intuitive `expect` API:** A rich set of matchers for making assertions about your code.
*   **Powerful Mocking:** Easily create mock functions and modules to isolate your code under test.
*   **Flexible Spying:** Spy on object methods and properties to verify interactions.
*   **Async Support:** First-class support for testing asynchronous code with `async/await`.
*   **Familiar Syntax:** A testing API that is easy to learn and use, inspired by popular testing frameworks.

## Installation

To get started with `chk`, install it as a dev dependency in your project:

```bash
npm install chk --save-dev
```

## Configuration

`chk` is designed to work with modern build tools like Vite. Here is an example of how to configure Vite to use `chk` for your tests:

```typescript
// vite.config.mts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
```

In this configuration:

*   `globals: true` allows you to use the `chk` API (`expect`, `test`, etc.) in your test files without importing them.
*   `environment: 'jsdom'` sets up a simulated browser environment for testing components.
*   `setupFiles` allows you to specify a setup file to run before your tests, which is a great place for global setup and configuration.

## Usage

Here is a simple example of how to write a test with `chk`:

```typescript
// src/example.test.ts
import { expect, test } from 'chk';

function sum(a: number, b: number) {
  return a + b;
}

test('should sum two numbers', () => {
  expect(sum(1, 2)).toBe(3);
});
```

## API Documentation

*   [Expect API](./docs/expect.md)
*   [Mock API](./docs/mock.md)
*   [Test API](./docs/test.md)
*   [Fn API](./docs/fn.md)
*   [SpyOn API](./docs/spyOn.md)