# @woby/chk: A Modern TypeScript Testing Toolkit

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/wongchichong/verifies)

`@woby/chk` is a powerful and flexible testing toolkit designed to streamline unit and integration testing in TypeScript projects. It offers a comprehensive suite of utilities for writing robust and reliable tests with an intuitive, fluent API that will feel familiar to users of modern testing frameworks like Jest or Vitest.

Whether you're building a simple library or a complex application, `@woby/chk` provides the tools you need to ensure your code is working as expected. From simple value assertions to complex mocking and spying, `verifies` has you covered.

## Features

*   **Intuitive `expect` API:** A rich set of matchers for making assertions about your code.
*   **Powerful Mocking:** Easily create mock functions and modules to isolate your code under test.
*   **Flexible Spying:** Spy on object methods and properties to verify interactions.
*   **Async Support:** First-class support for testing asynchronous code with `async/await`.
*   **Familiar Syntax:** A testing API that is easy to learn and use, inspired by popular testing frameworks.

## Browser Testing Features

`@woby/chk` offers unique features for in-browser testing, providing a seamless and interactive testing experience that goes beyond traditional CLI-based test runners.

### Interactive Debugging and Code Highlighting

`@woby/chk` integrates directly with your browser's developer tools, allowing for interactive debugging of your tests. When a test fails or you set a breakpoint, you can inspect variables, step through your code, and utilize the full power of the browser's debugger. This is complemented by real-time code highlighting, making it easy to pinpoint the exact line of code being executed.

![Debugging Code Highlight](./docs/debugging%20code%20highlight.png)

### In-Browser Test Case Navigation

Unlike many other test frameworks that primarily run in a command-line interface, `@woby/chk` provides an intuitive in-browser interface for navigating through your test cases. You can easily jump between different test files and individual tests directly within your browser, making it highly efficient to focus on specific tests or re-run them without leaving the browser environment.

### Visual Snapshot Testing with Accept/Reject Workflow

`@woby/chk` extends snapshot testing to the browser, allowing you to visually compare and manage UI snapshots. When a snapshot test fails, `verifies` displays a side-by-side comparison of the expected and actual UI. You can then visually inspect the differences and, directly within the browser, choose to "Accept" the new snapshot (saving it as the new baseline) or "Reject" it (indicating a bug that needs fixing). This interactive workflow for managing snapshots is a significant advantage over CLI-only snapshot tools. The generated snapshot files are stored in the `example/.snapshots/` directory within the project.

![DOM Snapshot](./docs/dom%20snapshot.png)



## Installation

To get started with `verifies`, install it as a dev dependency in your project:

```bash
npm install @woby/chk --save-dev
```

## Configuration

`@woby/chk` is designed to work with modern build tools like Vite. Here is an example of how to configure Vite to use `verifies` for your tests:

```typescript
// vite.config.mts
import { defineConfig } from 'vite'
import { snapshotPlugin } from 'vite-plugin-snapshot'

export default defineConfig({
  plugins: [snapshotPlugin()]
  /// other settings
})
```

To verify the snapshot server is running after configuration, visit `http://localhost:5174/@snapshot-api/version` in your browser. You should see version information if it's active.

## Running the Example

To run the example tests, follow these steps:

1.  Clone the repository:

    ```bash
    git clone https://github.com/wongchichong/verifies.git
    ```

2.  Navigate to the `example` directory:

    ```bash
    cd verifies/example
    ```

3.  Install dependencies:

    ```bash
    pnpm i
    ```

4.  Run the tests:

    ```bash
    pnpm test
    ```

## Usage

Here is a simple example of how to write a test with `@woby/chk`:

```typescript
// src/example.test.ts
import { expect, test } from '@woby/chk';

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