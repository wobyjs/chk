@echo off
deno --watch --unstable-sloppy-imports --allow-read --allow-net --allow-env --allow-sys --allow-write --allow-ffi --allow-run %~dp0src\bin\chk.ts %*