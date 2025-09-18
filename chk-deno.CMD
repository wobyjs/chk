@echo off
deno run --unstable-sloppy-imports --allow-read --allow-net --allow-env %~dp0src\bin\chk.ts %*