#!/usr/bin/env bash
set -e
cd /var/www/khoj
node ops/scripts/run_executor.js
node ops/scripts/run_tracker.js
node ops/scripts/run_publish.js
node ops/scripts/run_reporter.js
echo "[cycle] executor -> tracker -> publish -> reporter completed"
