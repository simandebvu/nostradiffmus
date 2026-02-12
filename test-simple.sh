#!/bin/bash

# Simplified Test Script - No external dependencies required
# Tests core large diff management features

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

cleanup() {
    git restore --staged . 2>/dev/null || true
    rm -f test-*.ts test-*.txt massive-*.ts output.json 2>/dev/null || true
    git restore . 2>/dev/null || true
}

trap cleanup EXIT

echo -e "${GREEN}🔮 Nostradiffmus - Simple Test Suite${NC}\n"

cleanup

# Build
echo "Building..."
npm run build > /dev/null 2>&1 || { echo -e "${RED}❌ Build failed${NC}"; exit 1; }
echo -e "${GREEN}✅ Build successful${NC}\n"

# Test 1: Small diff with metadata
echo -e "${YELLOW}Test 1: Small diff with metadata${NC}"
echo "// Small test" >> src/index.ts
git add src/index.ts

npm run dev -- --staged --json > output.json 2>&1

if grep -q '"metadata"' output.json; then
    echo -e "${GREEN}✅ Metadata present in JSON output${NC}"
else
    echo -e "${RED}❌ Metadata missing${NC}"
    cat output.json
    exit 1
fi

git restore --staged src/index.ts
git restore src/index.ts
rm output.json

# Test 2: Warning for large diff
echo -e "\n${YELLOW}Test 2: Warning for large diff (>100KB)${NC}"
cat > test-large.ts << 'EOF'
export const largeData = {
EOF

for i in {1..2500}; do
    echo "  line$i: 'This is test data line $i with content'," >> test-large.ts
done
echo "};" >> test-large.ts

git add test-large.ts

OUTPUT=$(npm run dev -- --staged 2>&1)

if echo "$OUTPUT" | grep -q "Large diff detected"; then
    echo -e "${GREEN}✅ Warning displayed for large diff${NC}"
    SIZE=$(echo "$OUTPUT" | grep "Large diff" | grep -oP '\d+\.\d+KB' || echo "size shown")
    echo "   Size: $SIZE"
else
    echo -e "${RED}❌ Warning not displayed${NC}"
    exit 1
fi

git restore --staged test-large.ts
rm test-large.ts

# Test 3: Custom threshold
echo -e "\n${YELLOW}Test 3: Custom warning threshold${NC}"
echo "// Tiny change" >> src/types.ts
git add src/types.ts

OUTPUT=$(NOSTRADIFFMUS_WARN_THRESHOLD=1 npm run dev -- --staged 2>&1)

if echo "$OUTPUT" | grep -q "Large diff detected"; then
    echo -e "${GREEN}✅ Custom threshold respected${NC}"
else
    echo -e "${RED}❌ Custom threshold ignored${NC}"
    exit 1
fi

git restore --staged src/types.ts
git restore src/types.ts

# Test 4: Quiet mode suppresses warnings
echo -e "\n${YELLOW}Test 4: Quiet mode suppresses warnings${NC}"
cat > test-quiet.ts << 'EOF'
export const quietData = {
EOF

for i in {1..2500}; do
    echo "  line$i: 'data'," >> test-quiet.ts
done
echo "};" >> test-quiet.ts

git add test-quiet.ts

OUTPUT=$(npm run dev -- --staged --quiet 2>&1)

if echo "$OUTPUT" | grep -q "Large diff detected"; then
    echo -e "${RED}❌ Quiet mode not working (warning shown)${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Quiet mode suppresses warnings${NC}"
fi

git restore --staged test-quiet.ts
rm test-quiet.ts

# Test 5: Hard limit
echo -e "\n${YELLOW}Test 5: Hard limit enforcement (>500KB)${NC}"
cat > massive-test.ts << 'EOF'
export const massive = {
EOF

for i in {1..13000}; do
    echo "  line$i: 'Very long line with content to exceed 500KB limit'," >> massive-test.ts
done
echo "};" >> massive-test.ts

git add massive-test.ts

OUTPUT=$(npm run dev -- --staged 2>&1 || true)

if echo "$OUTPUT" | grep -q "Diff too large"; then
    echo -e "${GREEN}✅ Hard limit enforced${NC}"
else
    echo -e "${RED}❌ Hard limit not enforced${NC}"
    exit 1
fi

# Test override
OUTPUT=$(NOSTRADIFFMUS_MAX_DIFF_CHARS=1000000 npm run dev -- --staged --json 2>&1)

if echo "$OUTPUT" | grep -q '"metadata"'; then
    echo -e "${GREEN}✅ Hard limit can be overridden${NC}"
else
    echo -e "${RED}❌ Override failed${NC}"
    exit 1
fi

git restore --staged massive-test.ts
rm massive-test.ts

# Test 6: Unit tests
echo -e "\n${YELLOW}Test 6: Unit tests${NC}"
TEST_OUTPUT=$(npm test 2>&1)

if echo "$TEST_OUTPUT" | grep -q "9 passed"; then
    echo -e "${GREEN}✅ All 9 unit tests pass${NC}"
else
    echo -e "${RED}❌ Unit tests failed${NC}"
    echo "$TEST_OUTPUT"
    exit 1
fi

# Summary
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ All Tests Passed! ✨${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo "Verified:"
echo "  ✅ JSON metadata output"
echo "  ✅ Large diff warnings (>100KB)"
echo "  ✅ Custom environment variables"
echo "  ✅ Quiet mode"
echo "  ✅ Hard limit enforcement (>500KB)"
echo "  ✅ Unit test coverage"

echo -e "\n${GREEN}🎉 Large diff management is working!${NC}\n"
