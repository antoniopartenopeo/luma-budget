#!/bin/bash

# ============================================
# Numa Governance Validator (v2.0)
# Posizione: .agent/skills/numa-governance-update/scripts/
# Checks for common rule violations
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "🔍 Numa Governance Validator"
echo "============================"
echo ""

# --------------------------------------------
# 1. Check for parseFloat on monetary values
# (Exclude import-csv/normalize.ts - legitimate CSV parsing)
# --------------------------------------------
echo "📌 Checking for parseFloat usage..."

PARSE_FLOAT=$(grep -rn "parseFloat" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v ".test." | grep -v "import-csv/core/normalize" || true)

if [ -n "$PARSE_FLOAT" ]; then
    echo -e "${RED}❌ VIOLATION: parseFloat found (may be used on currency)${NC}"
    echo "$PARSE_FLOAT"
    echo ""
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No parseFloat violations${NC}"
fi

# --------------------------------------------
# 2. Check for inline styles
# (Exclude: dynamic colors for charts, ECharts wrapper)
# --------------------------------------------
echo ""
echo "📌 Checking for inline styles..."

# Exclude patterns that legitimately need inline styles:
# - backgroundColor: hexColor (dynamic category colors)
# - ECharts wrapper (library requirement)
# - width percentage for progress bars
INLINE_STYLES=$(grep -rn 'style={{' src/ --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v "backgroundColor:" | grep -v "echarts" | grep -v "width:" || true)

if [ -n "$INLINE_STYLES" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Inline styles found (use Tailwind instead)${NC}"
    echo "$INLINE_STYLES"
    echo ""
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No inline styles${NC}"
fi

# --------------------------------------------
# 3. Check for console.log in production code
# --------------------------------------------
echo ""
echo "📌 Checking for console.log..."

CONSOLE_LOGS=$(grep -rn "console.log" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v ".test." || true)

if [ -n "$CONSOLE_LOGS" ]; then
    echo -e "${YELLOW}⚠️  WARNING: console.log found (remove before production)${NC}"
    echo "$CONSOLE_LOGS"
    echo ""
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No console.log statements${NC}"
fi

# --------------------------------------------
# 4. Check for arbitrary Tailwind values
# (Exclude: w-[100px] tables, text-[10px] small labels)
# --------------------------------------------
echo ""
echo "📌 Checking for arbitrary Tailwind values..."

# Focus only on truly problematic patterns, exclude common acceptable ones
# Excluded: text sizes, fixed widths, heights for charts/skeletons, blur effects, negative positioning
# Excluded: components/ui (Shadcn primitives), translate-y (hover effects), ring sizes
ARBITRARY=$(grep -rn '\[.*px\]' src/ --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v "components/ui" | grep -v "text-\[" | grep -v "w-\[" | grep -v "h-\[" | grep -v "blur-\[" | grep -v "top-\[" | grep -v "right-\[" | grep -v "bottom-\[" | grep -v "left-\[" | grep -v "min-w-\[" | grep -v "max-w-\[" | grep -v "pl-\[" | grep -v "translate-y-\[" | grep -v "ring-\[" | grep -v "p-\[" | head -10 || true)

if [ -n "$ARBITRARY" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Arbitrary values found (use standard spacing)${NC}"
    echo "$ARBITRARY"
    echo ""
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No arbitrary values${NC}"
fi

# --------------------------------------------
# 5. Check for inline expense calculations
# (Exclude: financial-math.ts itself, insights/utils.ts which IS centralized)
# --------------------------------------------
echo ""
echo "📌 Checking for inline expense calculations..."

# Exclude the source files that ARE the centralized utilities or use getSignedCents correctly
INLINE_CALCS=$(grep -rn 'reduce.*Math.abs' src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v "financial-math" | grep -v "insights/utils.ts" | grep -v "budget/utils" | grep -v ".test." || true)

if [ -n "$INLINE_CALCS" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Inline expense calculations (use financial-math.ts)${NC}"
    echo "$INLINE_CALCS"
    echo ""
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No inline expense calculations${NC}"
fi

# --------------------------------------------
# Summary
# --------------------------------------------
echo ""
echo "============================"
echo "📊 SUMMARY"
echo "============================"

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Errors: $ERRORS${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
fi

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
fi

echo ""

# Exit with error if critical violations found
if [ $ERRORS -gt 0 ]; then
    exit 1
fi

exit 0
