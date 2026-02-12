#!/bin/bash

# Large Diff Management Test Script
# Tests all scenarios for the new diff size management features

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_test() {
    echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Test: $1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
}

print_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    exit 1
}

cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up test files...${NC}"
    git restore --staged . 2>/dev/null || true
    rm -f test-*.ts test-*.txt test-*.json massive-*.ts output.json 2>/dev/null || true
    git restore . 2>/dev/null || true
}

trap cleanup EXIT

echo -e "${GREEN}🔮 Nostradiffmus - Large Diff Management Test Suite${NC}"
echo -e "${GREEN}================================================${NC}\n"

# Ensure clean state
cleanup

# Build first
echo "Building project..."
npm run build > /dev/null 2>&1 || print_fail "Build failed"
print_pass "Project built successfully"

# Test 1: Small Diff (No Warnings)
print_test "1. Small Diff - No Warnings"
echo "// Small test change" >> src/index.ts
git add src/index.ts

OUTPUT=$(npm run dev -- --staged --json 2>&1)
echo "$OUTPUT" | jq -e '.metadata.diffSizeKB < 1' > /dev/null || print_fail "Metadata missing or incorrect"
echo "$OUTPUT" | jq -e '.metadata.wasTruncatedForCopilot == false' > /dev/null || print_fail "Should not be truncated"

git restore --staged src/index.ts
git restore src/index.ts
print_pass "Small diff handled correctly"

# Test 2: Medium Diff (Copilot Truncation)
print_test "2. Medium Diff - Copilot Truncation (4KB)"
cat > test-medium.ts << 'EOF'
// Medium size test file
export const mediumData = {
EOF

for i in {1..200}; do
    echo "  item$i: 'This is test data line $i with sufficient content to exceed 4KB'," >> test-medium.ts
done
echo "};" >> test-medium.ts

git add test-medium.ts

OUTPUT=$(npm run dev -- --staged --json 2>&1)
TRUNCATED=$(echo "$OUTPUT" | jq -r '.metadata.wasTruncatedForCopilot')

if [ "$TRUNCATED" = "true" ]; then
    print_pass "Copilot truncation works correctly"
else
    print_fail "Expected truncation for Copilot but got: $TRUNCATED"
fi

SIZE_KB=$(echo "$OUTPUT" | jq -r '.metadata.diffSizeKB')
echo "  → Diff size: ${SIZE_KB}KB"

git restore --staged test-medium.ts
rm test-medium.ts

# Test 3: Large Diff (Warning Threshold)
print_test "3. Large Diff - Warning at 100KB"
cat > test-large.ts << 'EOF'
// Large test file
export const largeData = {
EOF

for i in {1..2500}; do
    echo "  line$i: 'This is test data line number $i with extra content to exceed 100KB warning threshold'," >> test-large.ts
done
echo "};" >> test-large.ts

git add test-large.ts

# Capture both stdout and stderr
OUTPUT=$(npm run dev -- --staged 2>&1)

if echo "$OUTPUT" | grep -q "Large diff detected"; then
    print_pass "Warning threshold works correctly"
else
    print_fail "Expected warning for large diff"
fi

git restore --staged test-large.ts
rm test-large.ts

# Test 4: Custom Environment Variables
print_test "4. Custom Environment Variables"

echo "// Custom threshold test" >> src/types.ts
git add src/types.ts

# Test very low warning threshold
OUTPUT=$(NOSTRADIFFMUS_WARN_THRESHOLD=100 npm run dev -- --staged 2>&1)

if echo "$OUTPUT" | grep -q "Large diff detected"; then
    print_pass "Custom WARN_THRESHOLD respected"
else
    print_fail "Custom threshold not working"
fi

# Test custom Copilot limit
OUTPUT=$(NOSTRADIFFMUS_COPILOT_CHARS=50 npm run dev -- --staged --json 2>&1)
TRUNCATED=$(echo "$OUTPUT" | jq -r '.metadata.wasTruncatedForCopilot')

if [ "$TRUNCATED" = "true" ]; then
    print_pass "Custom COPILOT_CHARS respected"
else
    print_fail "Custom Copilot limit not working"
fi

git restore --staged src/types.ts
git restore src/types.ts

# Test 5: Multiple Files
print_test "5. Multiple Files - File Count in Metadata"

for i in {1..5}; do
    echo "// Test file $i" > "test-multi-$i.ts"
    echo "export const data$i = { value: $i };" >> "test-multi-$i.ts"
    git add "test-multi-$i.ts"
done

OUTPUT=$(npm run dev -- --staged --json 2>&1)
FILE_COUNT=$(echo "$OUTPUT" | jq -r '.metadata.filesChanged')

if [ "$FILE_COUNT" = "5" ]; then
    print_pass "Multiple files counted correctly: $FILE_COUNT"
else
    print_fail "Expected 5 files, got: $FILE_COUNT"
fi

git restore --staged test-multi-*.ts
rm test-multi-*.ts

# Test 6: Quiet Mode
print_test "6. Quiet Mode - Suppress Warnings"

cat > test-quiet.ts << 'EOF'
// Quiet mode test
export const quietData = {
EOF

for i in {1..2500}; do
    echo "  line$i: 'data'," >> test-quiet.ts
done
echo "};" >> test-quiet.ts

git add test-quiet.ts

OUTPUT=$(npm run dev -- --staged --quiet 2>&1)

if echo "$OUTPUT" | grep -q "Large diff detected"; then
    print_fail "Quiet mode should suppress warnings"
else
    print_pass "Quiet mode suppresses warnings correctly"
fi

git restore --staged test-quiet.ts
rm test-quiet.ts

# Test 7: JSON Mode (Metadata Complete)
print_test "7. JSON Mode - Complete Metadata"

echo "// JSON metadata test" >> src/index.ts
git add src/index.ts

OUTPUT=$(npm run dev -- --staged --json 2>&1)

echo "$OUTPUT" | jq -e '.metadata.diffSizeChars' > /dev/null || print_fail "Missing diffSizeChars"
echo "$OUTPUT" | jq -e '.metadata.diffSizeKB' > /dev/null || print_fail "Missing diffSizeKB"
echo "$OUTPUT" | jq -e '.metadata.wasTruncatedForCopilot' > /dev/null || print_fail "Missing wasTruncatedForCopilot"
echo "$OUTPUT" | jq -e '.metadata.filesChanged' > /dev/null || print_fail "Missing filesChanged"

print_pass "All metadata fields present"

git restore --staged src/index.ts
git restore src/index.ts

# Test 8: Hard Limit (Max Diff Size)
print_test "8. Hard Limit - Reject Massive Diffs"

cat > massive-test.ts << 'EOF'
// Massive file to exceed hard limit
export const massive = {
EOF

# Create ~600KB file (exceeds 500KB default)
for i in {1..13000}; do
    echo "  hugeLine$i: 'Very long line with lots of content to push past 500KB limit for testing'," >> massive-test.ts
done
echo "};" >> massive-test.ts

git add massive-test.ts

# Should fail with error
if npm run dev -- --staged 2>&1 | grep -q "Diff too large"; then
    print_pass "Hard limit enforced correctly"
else
    print_fail "Expected error for massive diff"
fi

# Test overriding the limit
OUTPUT=$(NOSTRADIFFMUS_MAX_DIFF_CHARS=1000000 npm run dev -- --staged --json 2>&1)

if echo "$OUTPUT" | jq -e '.metadata' > /dev/null 2>&1; then
    print_pass "Custom MAX_DIFF_CHARS override works"
else
    print_fail "Failed to override max diff chars"
fi

git restore --staged massive-test.ts
rm massive-test.ts

# Test 9: Unit Tests
print_test "9. Unit Tests - Truncation Logic"

npm test > /dev/null 2>&1 || print_fail "Unit tests failed"

TESTS=$(npm test 2>&1 | grep "Tests.*passed")
echo "  → $TESTS"
print_pass "All unit tests pass"

# Summary
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ All Tests Passed! ✨${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo "Tests completed:"
echo "  ✅ Small diff handling"
echo "  ✅ Copilot truncation (4KB)"
echo "  ✅ Warning threshold (100KB)"
echo "  ✅ Custom environment variables"
echo "  ✅ Multiple file tracking"
echo "  ✅ Quiet mode"
echo "  ✅ JSON metadata"
echo "  ✅ Hard limit enforcement"
echo "  ✅ Unit test coverage"

echo -e "\n${GREEN}🎉 Large diff management is working correctly!${NC}\n"
