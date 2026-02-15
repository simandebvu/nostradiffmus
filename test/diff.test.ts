import { describe, it, expect } from "vitest";
import { truncateDiff, getDiffFiles } from "../src/git/diff";

describe("truncateDiff", () => {
  it("should not truncate small diffs", () => {
    const smallDiff = "diff --git a/file.ts b/file.ts\n+added line";
    const result = truncateDiff(smallDiff, 1000);

    expect(result.wasTruncated).toBe(false);
    expect(result.truncated).toBe(smallDiff);
    expect(result.originalSize).toBe(smallDiff.length);
    expect(result.truncatedSize).toBe(smallDiff.length);
  });

  it("should truncate large diffs intelligently", () => {
    const largeDiff = `diff --git a/file1.ts b/file1.ts
index 1234567..abcdefg 100644
--- a/file1.ts
+++ b/file1.ts
@@ -1,5 +1,5 @@
${"+ added line\n".repeat(100)}
diff --git a/file2.ts b/file2.ts
index 7654321..gfedcba 100644
--- a/file2.ts
+++ b/file2.ts
@@ -1,5 +1,5 @@
${"- removed line\n".repeat(100)}`;

    const result = truncateDiff(largeDiff, 500);

    expect(result.wasTruncated).toBe(true);
    expect(result.truncatedSize).toBeLessThan(result.originalSize);
    expect(result.truncated).toContain("diff --git a/file1.ts b/file1.ts");
  });

  it("should preserve file headers when truncating", () => {
    const diff = `diff --git a/test.ts b/test.ts
index abc123..def456 100644
--- a/test.ts
+++ b/test.ts
@@ -1,10 +1,10 @@
${"+ line\n".repeat(50)}`;

    const result = truncateDiff(diff, 200);

    expect(result.truncated).toContain("diff --git a/test.ts b/test.ts");
    expect(result.truncated).toContain("index abc123..def456");
    expect(result.truncated).toContain("---");
    expect(result.truncated).toContain("+++");
  });
});

describe("getDiffFiles", () => {
  it("should extract file paths from diff", () => {
    const diff = `diff --git a/src/file1.ts b/src/file1.ts
index 1234567..abcdefg 100644
--- a/src/file1.ts
+++ b/src/file1.ts
diff --git a/test/file2.test.ts b/test/file2.test.ts
index 7654321..gfedcba 100644
--- a/test/file2.test.ts
+++ b/test/file2.test.ts`;

    const files = getDiffFiles(diff);

    expect(files).toEqual(["src/file1.ts", "test/file2.test.ts"]);
  });
});
