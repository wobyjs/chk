@echo off
deno --watch --inspect-brk --unstable-sloppy-imports --allow-read --allow-net --allow-env --allow-sys %~dp0src\bin\chk.ts %*