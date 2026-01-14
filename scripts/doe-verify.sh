#!/bin/bash

set -e

echo "🔍 [DOE] Starting Verification Protocol..."

# 1. Linting
echo "🧹 [1/3] Running Linter..."
npm run lint

# 2. Testing
echo "🧪 [2/3] Running Tests..."
npm run test:run

# 3. Pattern Policing (Anti-Legacy)
echo "👮 [3/3] Checking for Prohibited Patterns..."

# Define banned patterns
# 1. parseFloat (Use integer math!)
if grep -r "parseFloat" src --include="*.ts" --include="*.tsx" --exclude-dir="__tests__" --exclude="*.test.ts" --exclude="*.spec.ts"; then
    echo "❌ [DOE ERROR] 'parseFloat' detected in source code. Use integer cents (e.g. 1050 for €10.50)."
    exit 1
fi

# 2. float type usage in variable naming (heuristic) - optional but helpful
if grep -r "float" src --include="*.ts" --include="*.tsx" --exclude-dir="__tests__" --exclude-dir="node_modules"; then
     echo "⚠️  [DOE WARNING] 'float' terminology detected. Ensure you are not storing currency as floats."
     # We don't exit 1 here, just warn, as css floats or other contexts might exist.
fi

echo "✅ [DOE] Verification Passed. Ready to commit."
