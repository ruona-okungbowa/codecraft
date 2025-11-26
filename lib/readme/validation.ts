import {
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from "@/types/readme";

export function validateMarkdown(
  content: string,
  type: "project" | "profile"
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Run all validation checks
  validateHeadingHierarchy(content, errors);
  validateCodeBlocks(content, errors, warnings);
  validateBadgeUrls(content, warnings);
  validateRequiredSections(content, type, errors);

  // Calculate quality score
  const score = calculateQualityScore(errors, warnings);

  return {
    valid: score >= 60,
    score,
    errors,
    warnings,
    suggestions: generateSuggestions(errors, warnings, type),
  };
}

/**
 * Validates that heading hierarchy doesn't skip levels
 * Example: # followed by ### is invalid (skips ##)
 */
function validateHeadingHierarchy(
  content: string,
  errors: ValidationError[]
): void {
  const lines = content.split("\n");
  const headingLevels: number[] = [];

  lines.forEach((line, index) => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      headingLevels.push(level);

      // Check if we skipped a level
      if (headingLevels.length > 1) {
        const previousLevel = headingLevels[headingLevels.length - 2];
        if (level > previousLevel + 1) {
          errors.push({
            type: "invalid_markdown",
            message: `Heading level skipped: went from h${previousLevel} to h${level}`,
            line: index + 1,
          });
        }
      }
    }
  });
}

/**
 * Validates that all code blocks are properly closed
 */
function validateCodeBlocks(
  content: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const codeBlockPattern = /```/g;
  const matches = content.match(codeBlockPattern);

  if (matches && matches.length % 2 !== 0) {
    errors.push({
      type: "invalid_markdown",
      message: "Unclosed code block detected - missing closing ```",
    });
  }

  // Check for code blocks with language tags
  const codeBlocksWithLang = content.match(/```(\w+)/g);
  const totalCodeBlocks = matches ? matches.length / 2 : 0;
  const blocksWithLang = codeBlocksWithLang ? codeBlocksWithLang.length : 0;

  if (totalCodeBlocks > 0 && blocksWithLang < totalCodeBlocks) {
    warnings.push({
      type: "missing_language_tag",
      message: `${totalCodeBlocks - blocksWithLang} code block(s) missing language specification`,
    });
  }
}

/**
 * Validates that badge URLs are properly formatted
 */
function validateBadgeUrls(
  content: string,
  warnings: ValidationWarning[]
): void {
  // Match markdown image syntax: ![alt](url)
  const badgePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = badgePattern.exec(content)) !== null) {
    const url = match[2];

    // Check if URL starts with https://
    if (!url.startsWith("https://") && !url.startsWith("http://")) {
      warnings.push({
        type: "invalid_badge",
        message: `Badge URL should use HTTPS: ${url}`,
      });
    }

    // Check for common badge services
    const validBadgeServices = [
      "shields.io",
      "img.shields.io",
      "badge.fury.io",
      "travis-ci.org",
      "github.com",
    ];

    const isValidBadgeService = validBadgeServices.some((service) =>
      url.includes(service)
    );

    if (!isValidBadgeService && url.startsWith("http")) {
      warnings.push({
        type: "unknown_badge_service",
        message: `Badge URL uses unknown service: ${url}`,
      });
    }
  }
}

/**
 * Validates that all required sections are present
 */
function validateRequiredSections(
  content: string,
  type: "project" | "profile",
  errors: ValidationError[]
): void {
  const requiredSections =
    type === "project"
      ? [
          ["overview", "about", "description"],
          ["features", "functionality"],
          ["tech stack", "technologies", "built with"],
          ["installation", "setup", "getting started"],
          ["usage", "how to use", "examples"],
        ]
      : [
          ["about", "about me", "introduction", "bio"],
          ["projects", "my projects", "portfolio"],
          ["skills", "technologies", "tech stack"],
          ["contact", "reach me", "connect"],
        ];

  const contentLower = content.toLowerCase();

  requiredSections.forEach((sectionAliases) => {
    const hasSomeAlias = sectionAliases.some((alias) =>
      contentLower.includes(alias)
    );

    if (!hasSomeAlias) {
      errors.push({
        type: "missing_section",
        message: `Missing required section: ${sectionAliases[0]} (or similar)`,
      });
    }
  });
}

/**
 * Calculates quality score based on errors and warnings
 * Starts at 100 and deducts points for issues
 */
function calculateQualityScore(
  errors: ValidationError[],
  warnings: ValidationWarning[]
): number {
  let score = 100;

  // Deduct 10 points per error
  score -= errors.length * 10;

  // Deduct 5 points per warning
  score -= warnings.length * 5;

  // Ensure score doesn't go below 0
  return Math.max(0, score);
}

/**
 * Generates helpful suggestions based on validation results
 */
function generateSuggestions(
  errors: ValidationError[],
  warnings: ValidationWarning[],
  type: "project" | "profile"
): string[] {
  const suggestions: string[] = [];

  // Suggestions based on errors
  const missingSections = errors.filter((e) => e.type === "missing_section");
  if (missingSections.length > 0) {
    suggestions.push(
      `Add missing sections: ${missingSections.map((e) => e.message).join(", ")}`
    );
  }

  const markdownErrors = errors.filter((e) => e.type === "invalid_markdown");
  if (markdownErrors.length > 0) {
    suggestions.push("Fix markdown syntax errors for better rendering");
  }

  // Suggestions based on warnings
  if (warnings.length > 0) {
    suggestions.push("Consider addressing warnings to improve README quality");
  }

  // General suggestions
  if (type === "project") {
    suggestions.push("Add screenshots or GIFs to showcase your project");
    suggestions.push("Include badges for build status, version, and license");
  } else {
    suggestions.push("Add GitHub stats widgets to showcase your activity");
    suggestions.push("Include links to your best projects");
  }

  return suggestions;
}
