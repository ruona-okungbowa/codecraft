import { describe, it, expect } from "vitest";
import { validateMarkdown } from "@/lib/utils/validateMarkdown";

// Feature: CodeCraft, Property 9: README Markdown Validity
describe("Markdown Validation", () => {
  describe("Property 9: Valid Markdown", () => {
    it("validates correct markdown", () => {
      const validMarkdown = `
# Project Title

This is a description with more than 100 characters to ensure it passes the minimum length requirement.

## Features

- Feature 1
- Feature 2

\`\`\`javascript
const code = "example";
\`\`\`

## Installation

Run \`npm install\` to get started.
      `;

      const result = validateMarkdown(validMarkdown);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("detects missing headings", () => {
      const noHeadings =
        "This is just plain text without any headings or structure.";

      const result = validateMarkdown(noHeadings);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("No headings found");
    });

    it("detects content too short", () => {
      const shortContent = "# Title\n\nShort.";

      const result = validateMarkdown(shortContent);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Content too short");
    });

    it("detects unclosed code blocks", () => {
      const unclosedBlock = `
# Title

This has an unclosed code block:

\`\`\`javascript
const code = "example";

No closing backticks!
      `;

      const result = validateMarkdown(unclosedBlock);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Unclosed code block");
    });

    it("accepts properly closed code blocks", () => {
      const closedBlocks = `
# Title

This is a longer description to meet the minimum character requirement for validation.

\`\`\`javascript
const code1 = "example";
\`\`\`

Some text in between.

\`\`\`python
code2 = "another example"
\`\`\`
      `;

      const result = validateMarkdown(closedBlocks);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Minimum Length Validation", () => {
    it("requires at least 100 characters", () => {
      const tooShort = "# Title\n\nShort content.";

      const result = validateMarkdown(tooShort);

      expect(result.valid).toBe(false);
      expect(tooShort.length).toBeLessThan(100);
    });

    it("accepts content with exactly 100 characters", () => {
      const exactly100 = "# Title\n\n" + "a".repeat(92); // 10 + 92 = 102 chars

      const result = validateMarkdown(exactly100);

      expect(exactly100.length).toBeGreaterThanOrEqual(100);
      // Should pass length check (may fail heading check)
      expect(result.errors).not.toContain("Content too short");
    });

    it("accepts long content", () => {
      const longContent =
        "# Title\n\n" + "This is a very long description. ".repeat(10);

      const result = validateMarkdown(longContent);

      expect(result.errors).not.toContain("Content too short");
    });
  });

  describe("Heading Detection", () => {
    it("detects H1 headings", () => {
      const withH1 = "# Main Title\n\n" + "Content ".repeat(20);

      const result = validateMarkdown(withH1);

      expect(result.errors).not.toContain("No headings found");
    });

    it("detects H2 headings", () => {
      const withH2 = "## Section Title\n\n" + "Content ".repeat(20);

      const result = validateMarkdown(withH2);

      expect(result.errors).not.toContain("No headings found");
    });

    it("detects multiple heading levels", () => {
      const multiLevel = `
# Main Title
## Section
### Subsection
#### Details

${"Content ".repeat(20)}
      `;

      const result = validateMarkdown(multiLevel);

      expect(result.errors).not.toContain("No headings found");
    });

    it("rejects content without # symbol", () => {
      const noHash = "Title\n\n" + "Content ".repeat(20);

      const result = validateMarkdown(noHash);

      expect(result.errors).toContain("No headings found");
    });
  });

  describe("Code Block Validation", () => {
    it("accepts no code blocks", () => {
      const noBlocks =
        "# Title\n\n" + "Regular content without code blocks. ".repeat(10);

      const result = validateMarkdown(noBlocks);

      expect(result.errors).not.toContain("Unclosed code block");
    });

    it("accepts even number of code block markers", () => {
      const evenBlocks = `
# Title

\`\`\`
code1
\`\`\`

\`\`\`
code2
\`\`\`

${"Content ".repeat(10)}
      `;

      const result = validateMarkdown(evenBlocks);

      expect(result.errors).not.toContain("Unclosed code block");
    });

    it("rejects odd number of code block markers", () => {
      const oddBlocks = `
# Title

\`\`\`
code1
\`\`\`

\`\`\`
code2 (no closing)

${"Content ".repeat(10)}
      `;

      const result = validateMarkdown(oddBlocks);

      expect(result.errors).toContain("Unclosed code block");
    });

    it("handles inline code correctly", () => {
      const inlineCode = `
# Title

Use \`npm install\` to install dependencies.
Then run \`npm start\` to start the server.

${"More content ".repeat(10)}
      `;

      const result = validateMarkdown(inlineCode);

      // Inline code (single backticks) should not affect block validation
      expect(result.errors).not.toContain("Unclosed code block");
    });
  });

  describe("Multiple Errors", () => {
    it("reports all errors found", () => {
      const multipleIssues =
        "Short text with no headings and ```unclosed block";

      const result = validateMarkdown(multipleIssues);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain("No headings found");
      expect(result.errors).toContain("Content too short");
      expect(result.errors).toContain("Unclosed code block");
    });

    it("returns empty errors array for valid markdown", () => {
      const perfect = `
# Perfect README

This is a comprehensive README with proper structure and sufficient content length.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`javascript
const app = require('./app');
app.start();
\`\`\`

## Contributing

Pull requests are welcome!
      `;

      const result = validateMarkdown(perfect);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty string", () => {
      const result = validateMarkdown("");

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("handles whitespace-only string", () => {
      const result = validateMarkdown("   \n\n   \t\t   ");

      expect(result.valid).toBe(false);
    });

    it("handles very long markdown", () => {
      const veryLong = "# Title\n\n" + "Content paragraph. ".repeat(1000);

      const result = validateMarkdown(veryLong);

      // Should not crash or timeout
      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
    });

    it("handles markdown with special characters", () => {
      const specialChars = `
# Title with émojis 🚀

Content with **bold**, *italic*, and [links](https://example.com).

\`\`\`javascript
const special = "chars: <>&\"'";
\`\`\`

${"More content ".repeat(10)}
      `;

      const result = validateMarkdown(specialChars);

      expect(result.valid).toBe(true);
    });

    it("handles markdown with HTML", () => {
      const withHTML = `
# Title

<div>HTML content</div>

Regular markdown content continues here with sufficient length to pass validation.

\`\`\`html
<p>Code example</p>
\`\`\`
      `;

      const result = validateMarkdown(withHTML);

      expect(result.valid).toBe(true);
    });
  });
});
