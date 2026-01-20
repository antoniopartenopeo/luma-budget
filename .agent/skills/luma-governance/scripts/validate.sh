#!/bin/bash

# ============================================
# Luma Governance Validator
# Checks for common rule violations
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo "🔍 Luma Governance Validator"
echo "============================"
echo ""

# --------------------------------------------
# 1. Check for parseFloat on monetary values
# --------------------------------------------
echo "📌 Checking for parseFloat usage..."

PARSE_FLOAT=$(grep -rn "parseFloat" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v ".test." || true)

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
# --------------------------------------------
echo ""
echo "📌 Checking for inline styles..."

INLINE_STYLES=$(grep -rn 'style={{' src/ --include="*.tsx" 2>/dev/null | grep -v "node_modules" || true)

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
# --------------------------------------------
echo ""
echo "📌 Checking for arbitrary Tailwind values..."

ARBITRARY=$(grep -rn '\[.*px\]' src/ --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -10 || true)

if [ -n "$ARBITRARY" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Arbitrary values found (use standard spacing)${NC}"
    echo "$ARBITRARY"
    echo ""
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No arbitrary values${NC}"
fi

# --------------------------------------------
# 5. Check for direct Math.abs usage on amountCents
# --------------------------------------------
echo ""
echo "📌 Checking for inline expense calculations..."

INLINE_CALCS=$(grep -rn 'reduce.*Math.abs' src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v "financial-math" | grep -v ".test." || true)

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
