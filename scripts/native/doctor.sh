#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

check_cmd() {
  local name="$1"
  local cmd="$2"
  shift 2
  if ! command -v "$cmd" >/dev/null 2>&1; then
    printf "MISSING %-15s -> install required\n" "$name"
    return
  fi

  local output
  if output="$("$cmd" "$@" 2>&1 | head -n 1)"; then
    printf "OK    %-18s -> %s\n" "$name" "$output"
  else
    printf "MISCONFIG %-13s -> %s\n" "$name" "${output:-detected but not configured}"
  fi
}

echo "NUMA Native Doctor"
echo "Workspace: $ROOT_DIR"
echo

check_cmd "Node" "node" "--version"
check_cmd "npm" "npm" "--version"
check_cmd "Capacitor CLI" "npx" "cap" "--version"
check_cmd "Xcode" "xcodebuild" "-version"
check_cmd "Android adb" "adb" "--version"
check_cmd "Android sdkmanager" "sdkmanager" "--version"

echo
echo "Capacitor config preview:"
npx cap --version >/dev/null 2>&1 && npx cap config || echo "Capacitor CLI not ready"
