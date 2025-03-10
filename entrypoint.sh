#!/bin/sh
set -e

if [ "$CI" = "true" ]; then
  npx quartz build
else
  npx quartz build --serve
fi