# Quick Testing Guide

## 🚀 Run All Tests (Automated)

```bash
./test-large-diffs.sh
```

This automated script tests all 9 scenarios and takes ~30 seconds.

---

## 🔥 Manual Quick Tests (3 Minutes)

### 1. **Normal Diff** (baseline)
```bash
echo "test" > test.txt
git add test.txt
npm run dev -- --staged --json | jq '.metadata'
```

**Expected:**
```json
{
  "diffSizeChars": 5,
  "diffSizeKB": 0.0,
  "wasTruncatedForCopilot": false,
  "filesChanged": 1
}
```

**Cleanup:** `git restore --staged test.txt && rm test.txt`

---

### 2. **Copilot Truncation** (> 4KB)
```bash
# Create ~5KB file
for i in {1..200}; do
  echo "export const line$i = 'test data with enough content';"
done > medium.ts

git add medium.ts
npm run dev -- --staged --json | jq '.metadata.wasTruncatedForCopilot'
```

**Expected:** `true`

**Cleanup:** `git restore --staged medium.ts && rm medium.ts`

---

### 3. **Warning Threshold** (> 100KB)
```bash
# Create ~150KB file
for i in {1..3000}; do
  echo "export const data$i = 'line';"
done > large.ts

git add large.ts
npm run dev -- --staged 2>&1 | grep "Large diff"
```

**Expected:** Shows warning with size

**Cleanup:** `git restore --staged large.ts && rm large.ts`

---

### 4. **Custom Limits**
```bash
echo "test" > tiny.txt
git add tiny.txt

# Lower threshold to trigger warning on tiny file
NOSTRADIFFMUS_WARN_THRESHOLD=1 npm run dev -- --staged 2>&1
```

**Expected:** Warning appears even for tiny file

**Cleanup:** `git restore --staged tiny.txt && rm tiny.txt`

---

### 5. **Hard Limit** (> 500KB)
```bash
# Create ~600KB file
for i in {1..15000}; do
  echo "export const massive$i = 'very long line here';"
done > huge.ts

git add huge.ts
npm run dev -- --staged 2>&1
```

**Expected:** Error: "Diff too large"

**Try override:**
```bash
NOSTRADIFFMUS_MAX_DIFF_CHARS=1000000 npm run dev -- --staged --json
```

**Expected:** Works with higher limit

**Cleanup:** `git restore --staged huge.ts && rm huge.ts`

---

## ✅ Checklist

- [ ] Small diff: No warnings, metadata correct
- [ ] Medium diff: Copilot truncated
- [ ] Large diff: Warning shown
- [ ] Custom env vars: Respected
- [ ] Hard limit: Blocks massive diffs
- [ ] JSON output: Includes metadata
- [ ] Unit tests: `npm test` passes

---

## 🐛 If Tests Fail

1. **Build first:** `npm run build`
2. **Check dependencies:** `npm install`
3. **Clean git state:** `git restore --staged . && git restore .`
4. **Check Node version:** `node --version` (need v18+)
5. **Run with debug:** `NOSTRADIFFMUS_DEBUG=1 npm run dev -- --staged`

---

## 📊 Visual Test Results

After running `./test-large-diffs.sh`, you should see:

```
🔮 Nostradiffmus - Large Diff Management Test Suite
================================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test: 1. Small Diff - No Warnings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PASS: Small diff handled correctly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test: 2. Medium Diff - Copilot Truncation (4KB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PASS: Copilot truncation works correctly
  → Diff size: 5.2KB

[... 9 tests total ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ All Tests Passed! ✨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎯 One-Liner Tests

```bash
# Test warning
for i in {1..3000}; do echo "x"; done > big.txt && git add big.txt && npm run dev -- --staged 2>&1 | grep -q "Large diff" && echo "✅ Warning works" || echo "❌ Failed" ; git restore --staged big.txt ; rm big.txt

# Test metadata
echo "test" > t.txt && git add t.txt && npm run dev -- --staged --json | jq -e '.metadata' > /dev/null && echo "✅ Metadata works" || echo "❌ Failed" ; git restore --staged t.txt ; rm t.txt

# Test custom threshold
echo "x" > t.txt && git add t.txt && NOSTRADIFFMUS_WARN_THRESHOLD=1 npm run dev -- --staged 2>&1 | grep -q "Large diff" && echo "✅ Custom threshold works" || echo "❌ Failed" ; git restore --staged t.txt ; rm t.txt
```

---

**For full details, see [TESTING.md](./TESTING.md)**
