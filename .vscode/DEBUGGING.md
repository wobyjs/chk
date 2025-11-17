# Debugging @woby/chk CLI Tool

This document explains how to debug the @woby/chk CLI tool using VS Code.

## Available Debug Configurations

1. **Run @woby/chk CLI with app.test.tsx** - Run the CLI with app.test.tsx without debugging
2. **Run @woby/chk CLI with sample.test.ts** - Run the CLI with sample.test.ts without debugging
3. **Run @woby/chk CLI with multiple test files** - Run the CLI with multiple test files without debugging
4. **Debug @woby/chk CLI (Manual Chrome DevTools)** - Start debugging session with Chrome DevTools
5. **Attach to Deno Debugger** - Attach to an already running Deno debugging session

## Recommended Approach: Chrome DevTools

Since VS Code has limited support for Deno debugging, the recommended approach is to use Chrome DevTools:

1. Open a terminal in the project root directory
2. Run the debug command manually:
   ```bash
   deno run --unstable-sloppy-imports --allow-read --allow-net --allow-env --inspect-brk src/bin/chk.ts ../../example/src/app.test.tsx
   ```
3. Open Chrome and navigate to `chrome://inspect`
4. Click "inspect" under the Deno process
5. Set breakpoints in Chrome DevTools and resume execution

## VS Code Debug Configuration (Experimental)

If you want to try debugging directly in VS Code:

1. Make sure you have the Deno extension installed in VS Code
2. Select the "Debug @woby/chk CLI (Manual Chrome DevTools)" configuration
3. Press F5 to start debugging
4. When the debugger starts, VS Code will automatically open Chrome DevTools
5. Set breakpoints and debug as needed

## Troubleshooting

### Error: unexpected argument '--experimental-network-inspection'

This error occurs when VS Code tries to inject Node.js debugging arguments into Deno. To avoid this issue:

1. Use the manual approach with Chrome DevTools (recommended)
2. Make sure you have the Deno extension for VS Code installed
3. Ensure your VS Code is up to date

### Error: Cannot connect to debugger

If Chrome DevTools cannot connect to the debugger:

1. Make sure no other Deno processes are running:
   ```bash
   taskkill /F /IM deno.exe
   ```
2. Check that port 9229 is not blocked by firewall
3. Try using `--inspect-wait` instead of `--inspect-brk` in the configuration

## Manual Debugging Commands

You can also debug manually from the terminal:

```bash
# Run without debugging
deno run --unstable-sloppy-imports --allow-read --allow-net --allow-env src/bin/chk.ts ../../example/src/app.test.tsx

# Debug with Chrome DevTools
deno run --unstable-sloppy-imports --allow-read --allow-net --allow-env --inspect-brk src/bin/chk.ts ../../example/src/app.test.tsx

# Debug with wait (waits for debugger to attach)
deno run --unstable-sloppy-imports --allow-read --allow-net --allow-env --inspect-wait src/bin/chk.ts ../../example/src/app.test.tsx
```

Then open `chrome://inspect` in Chrome to connect to the debugger.