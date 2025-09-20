@echo off
deno --unstable-sloppy-imports --allow-read --allow-net --allow-env --allow-sys --allow-write  %~dp0src\bin\chk.ts %*