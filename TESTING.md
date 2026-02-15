# Testing Guide: Large Diff Management

This guide walks you through testing all the new large diff management features.

---

## 🧪 Quick Test Setup

### 1. Build the Project

```bash
npm install
npm run build
```

### 2. Create Test Diffs

We'll create diffs of various sizes to test different scenarios.

---

## Test Scenarios

### ✅ Scenario 1: Small Diff (Normal Operation)

**Expected:** No warnings, metadata shows small size

```bash
# Create a small change
echo "// Small test change" >> src/index.ts
git add src/index.ts

# Run analysis
npm run dev -- --staged --json
```

**Verify:**
- No warnings displayed
- `metadata.diffSizeKB` is small (< 1KB)
- `metadata.wasTruncatedForCopilot` is `false`
- All signals work normally

**Cleanup:**
```bash
git restore --staged src/index.ts
git restore src/index.ts
```

---

### ✅ Scenario 2: Medium Diff (Warning Threshold)

**Expected:** Warning displayed, analysis works fine

```bash
# Create a medium-sized diff (>100KB by default)
cat > test-large-file.ts << 'EOF'
// This file will create a diff larger than 100KB
export const data = {
EOF

# Add ~2500 lines to exceed 100KB threshold
for i in {1..2500}; do
  echo "  line$i: 'This is test data line number $i with some extra content to make it bigger'," >> test-large-file.ts
done

echo "};" >> test-large-file.ts

git add test-large-file.ts

# Run analysis (should show warning)
npm run dev -- --staged
```

**Verify:**
- ⚠️ Warning message appears: "Large diff detected"
- Shows size in KB
- Analysis still completes
- `metadata.diffSizeKB` > 100

**Cleanup:**
```bash
git restore --staged test-large-file.ts
rm test-large-file.ts
```

---

### ✅ Scenario 3: Copilot Truncation (4KB Default)

**Expected:** Diff truncated for Copilot, metadata shows truncation

```bash
# Create a diff between 4KB and 100KB
cat > test-copilot-truncation.ts << 'EOF'
// This will exceed Copilot's 4KB limit but not warning threshold
export const truncationTest = {
EOF

for i in {1..150}; do
  echo "  item$i: 'Test data for Copilot truncation scenario with enough content to matter'," >> test-copilot-truncation.ts
done

echo "};" >> test-copilot-truncation.ts

git add test-copilot-truncation.ts

# Run with JSON to see metadata
npm run dev -- --staged --json
```

**Verify:**
- `metadata.wasTruncatedForCopilot` is `true`
- `metadata.diffSizeChars` > 4000
- Analysis completes successfully
- If Copilot is enabled, note shows "[Note: Diff truncated for size]"

**Cleanup:**
```bash
git restore --staged test-copilot-truncation.ts
rm test-copilot-truncation.ts
```

---

### ✅ Scenario 4: Custom Environment Variables

**Expected:** Custom limits are respected

```bash
# Create a small change
echo "// Custom limits test" >> src/types.ts
git add src/types.ts

# Test with custom warning threshold (very low)
NOSTRADIFFMUS_WARN_THRESHOLD=100 npm run dev -- --staged

# Should show warning even for tiny diff
```

**Verify:**
- Warning appears for very small diff
- Custom threshold is respected

**Test custom Copilot limit:**
```bash
# Set very low Copilot limit
NOSTRADIFFMUS_COPILOT_CHARS=500 npm run dev -- --staged --json
```

**Verify:**
- `metadata.wasTruncatedForCopilot` is `true` even for small diff

**Cleanup:**
```bash
git restore --staged src/types.ts
git restore src/types.ts
```

---

### ✅ Scenario 5: Maximum Diff Size (Hard Limit)

**Expected:** Error message, analysis fails

```bash
# Create a massive diff (>500KB default limit)
cat > massive-file.ts << 'EOF'
// This will exceed the hard limit
export const massive = {
EOF

# Add ~12,000 lines to exceed 500KB
for i in {1..12000}; do
  echo "  hugeLine$i: 'This is a very long line with lots of data to push past the hard limit of 500KB for testing purposes'," >> massive-file.ts
done

echo "};" >> massive-file.ts

git add massive-file.ts

# Run analysis (should fail with error)
npm run dev -- --staged 2>&1 | tee test-output.txt
```

**Verify:**
- Error message appears
- Mentions the size and limit
- Suggests adjusting `NOSTRADIFFMUS_MAX_DIFF_CHARS`
- Exit code is non-zero

**Test overriding the limit:**
```bash
# Increase limit and try again
NOSTRADIFFMUS_MAX_DIFF_CHARS=1000000 npm run dev -- --staged --json
```

**Verify:**
- Analysis completes with higher limit
- Metadata shows large size

**Cleanup:**
```bash
git restore --staged massive-file.ts
rm massive-file.ts
rm -f test-output.txt
```

---

### ✅ Scenario 6: Multiple Files (Broad Refactor)

**Expected:** Metadata shows correct file count, truncation preserves all file headers

```bash
# Create changes in multiple files
for i in {1..5}; do
  cat > "test-file-$i.ts" << EOF
// Test file $i
export const data$i = {
$(for j in {1..100}; do echo "  item$j: 'data'," ; done)
};
EOF
  git add "test-file-$i.ts"
done

# Run analysis
npm run dev -- --staged --json | jq '.metadata'
```

**Verify:**
- `metadata.filesChanged` equals 5
- All files are analyzed
- Signals detect "broad refactor"

**Cleanup:**
```bash
git restore --staged test-file-*.ts
rm test-file-*.ts
```

---

### ✅ Scenario 7: Quiet Mode (No Warnings)

**Expected:** Warnings suppressed in quiet mode

```bash
# Create medium diff
cat > quiet-test.ts << 'EOF'
// Large file for quiet mode test
export const quietData = {
EOF

for i in {1..2500}; do
  echo "  line$i: 'data'," >> quiet-test.ts
done

echo "};" >> quiet-test.ts

git add quiet-test.ts

# Run with --quiet flag
npm run dev -- --staged --quiet
```

**Verify:**
- No warning message displayed
- Only advice is shown
- Analysis completes normally

**Cleanup:**
```bash
git restore --staged quiet-test.ts
rm quiet-test.ts
```

---

### ✅ Scenario 8: JSON Mode (Metadata Included)

**Expected:** Full metadata in JSON output

```bash
# Create any change
echo "// JSON test" >> src/index.ts
git add src/index.ts

# Get JSON output
npm run dev -- --staged --json > output.json

# View metadata
cat output.json | jq '.metadata'
```

**Expected output:**
```json
{
  "diffSizeChars": 1234,
  "diffSizeKB": 1.2,
  "wasTruncatedForCopilot": false,
  "filesChanged": 1
}
```

**Cleanup:**
```bash
git restore --staged src/index.ts
git restore src/index.ts
rm output.json
```

---

### ✅ Scenario 9: Commit Analysis (vs Staged)

**Expected:** Works the same for commits

```bash
# Make a test commit
echo "// Commit test" >> src/types.ts
git add src/types.ts
git commit -m "test: large diff commit test"

# Analyze the commit
npm run dev -- --commit HEAD --json | jq '.metadata'
```

**Verify:**
- Metadata is populated
- Analysis works on commits

**Cleanup:**
```bash
git reset --soft HEAD~1
git restore --staged src/types.ts
git restore src/types.ts
```

---

## 🤖 Automated Test Suite

Run the existing unit tests:

```bash
npm test
```

**Verify:**
- All 9 tests pass
- New `diff.test.ts` tests pass
- Coverage includes truncation logic

---

## 🔍 Debug Mode Testing

**Expected:** Debug logs show internal behavior

```bash
# Create any change
echo "// Debug test" >> src/index.ts
git add src/index.ts

# Run with debug mode
NOSTRADIFFMUS_DEBUG=1 npm run dev -- --staged
```

**Verify:**
- Debug logs appear in stderr
- Shows Copilot attempts (if enabled)
- Shows timeout settings
- Shows truncation decisions

**Cleanup:**
```bash
git restore --staged src/index.ts
git restore src/index.ts
```

---

## 📊 Integration Testing Checklist

- [ ] Small diff (< 4KB): No warnings, no truncation
- [ ] Medium diff (4KB - 100KB): Truncated for Copilot, no warning
- [ ] Large diff (> 100KB): Warning shown, analysis works
- [ ] Massive diff (> 500KB): Hard limit error
- [ ] Custom `NOSTRADIFFMUS_WARN_THRESHOLD`: Respected
- [ ] Custom `NOSTRADIFFMUS_COPILOT_CHARS`: Respected
- [ ] Custom `NOSTRADIFFMUS_MAX_DIFF_CHARS`: Respected
- [ ] Multiple files: Correct count in metadata
- [ ] `--quiet` flag: Suppresses warnings
- [ ] `--json` flag: Includes metadata
- [ ] Commit analysis: Works same as staged
- [ ] Debug mode: Shows internal logs

---

## 🚨 Edge Cases

### Empty Diff
```bash
npm run dev -- --staged
# Expected: "No diff content found" error
```

### Binary Files
```bash
# Add a binary file
cp /bin/ls test-binary
git add test-binary
npm run dev -- --staged

# Expected: Analysis handles gracefully
git restore --staged test-binary
rm test-binary
```

### Very Long Lines
```bash
echo "export const x = '$(python3 -c "print('A' * 50000)")';" > long-line.ts
git add long-line.ts
npm run dev -- --staged --json

# Expected: Handles without crashing
git restore --staged long-line.ts
rm long-line.ts
```

---

## ✅ Success Criteria

All tests should:
1. **Not crash** - Handle all sizes gracefully
2. **Provide feedback** - Warnings at appropriate thresholds
3. **Include metadata** - JSON always has size/truncation info
4. **Respect config** - Environment variables work
5. **Maintain accuracy** - Signals and predictions still work
6. **Fail safely** - Hard limits prevent resource exhaustion

---

## 📝 CI/CD Testing

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml example
- name: Test large diff handling
  run: |
    # Create large test file
    for i in {1..3000}; do echo "line$i" >> large.txt; done
    git add large.txt

    # Should complete successfully
    npm run dev -- --staged --json

    # Should have metadata
    npm run dev -- --staged --json | jq -e '.metadata.diffSizeKB > 0'
```

---

## 🎯 Quick Validation Script

Save this as `test-diffs.sh`:

```bash
#!/bin/bash
set -e

echo "🧪 Testing Nostradiffmus Large Diff Management"
echo ""

# Test 1: Small diff
echo "Test 1: Small diff (no warnings)"
echo "test" > test.txt && git add test.txt
npm run dev -- --staged --quiet > /dev/null
echo "✅ Small diff works"
git restore --staged test.txt && rm test.txt

# Test 2: Warning threshold
echo "Test 2: Large diff (warnings)"
for i in {1..2500}; do echo "line$i: data" >> large.txt; done
git add large.txt
npm run dev -- --staged 2>&1 | grep -q "Large diff detected"
echo "✅ Warning threshold works"
git restore --staged large.txt && rm large.txt

# Test 3: JSON metadata
echo "Test 3: JSON metadata"
echo "test" > test.txt && git add test.txt
npm run dev -- --staged --json | jq -e '.metadata' > /dev/null
echo "✅ JSON metadata works"
git restore --staged test.txt && rm test.txt

echo ""
echo "🎉 All manual tests passed!"
```

Make it executable and run:
```bash
chmod +x test-diffs.sh
./test-diffs.sh
```

---

**Need help with any specific test scenario? Let me know!**
