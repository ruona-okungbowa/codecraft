export interface LearningResource {
  title: string;
  url: string;
  type: "course" | "docs" | "video" | "tutorial" | "article" | "practice";
  platform: string;
  duration?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  free: boolean;
}

export const learningResources: Record<string, LearningResource[]> = {
  React: [
    {
      title: "React Official Documentation",
      url: "https://react.dev",
      type: "docs",
      platform: "React.dev",
      difficulty: "beginner",
      free: true,
    },
    {
      title: "React - The Complete Guide",
      url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
      type: "course",
      platform: "Udemy",
      duration: "48 hours",
      difficulty: "intermediate",
      free: false,
    },
    {
      title: "React Challenges",
      url: "https://reactchallenges.live/",
      type: "practice",
      platform: "React Challenges",
      difficulty: "intermediate",
      free: true,
    },
  ],
  TypeScript: [
    {
      title: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/handbook/intro.html",
      type: "docs",
      platform: "TypeScript",
      difficulty: "beginner",
      free: true,
    },
    {
      title: "Type Challenges",
      url: "https://github.com/type-challenges/type-challenges",
      type: "practice",
      platform: "GitHub",
      difficulty: "intermediate",
      free: true,
    },
  ],
  "Node.js": [
    {
      title: "Node.js Official Docs",
      url: "https://nodejs.org/docs/latest/api/",
      type: "docs",
      platform: "Node.js",
      difficulty: "beginner",
      free: true,
    },
    {
      title: "Node.js Best Practices",
      url: "https://github.com/goldbergyoni/nodebestpractices",
      type: "article",
      platform: "GitHub",
      difficulty: "intermediate",
      free: true,
    },
  ],
  Docker: [
    {
      title: "Docker Getting Started",
      url: "https://docs.docker.com/get-started/",
      type: "docs",
      platform: "Docker",
      difficulty: "beginner",
      free: true,
    },
    {
      title: "Docker Mastery",
      url: "https://www.udemy.com/course/docker-mastery/",
      type: "course",
      platform: "Udemy",
      duration: "19 hours",
      difficulty: "intermediate",
      free: false,
    },
  ],
  Kubernetes: [
    {
      title: "Kubernetes Documentation",
      url: "https://kubernetes.io/docs/home/",
      type: "docs",
      platform: "Kubernetes",
      difficulty: "intermediate",
      free: true,
    },
    {
      title: "Kubernetes for Beginners",
      url: "https://www.youtube.com/watch?v=X48VuDVv0do",
      type: "video",
      platform: "YouTube",
      duration: "4 hours",
      difficulty: "beginner",
      free: true,
    },
  ],
  AWS: [
    {
      title: "AWS Free Tier",
      url: "https://aws.amazon.com/free/",
      type: "practice",
      platform: "AWS",
      difficulty: "beginner",
      free: true,
    },
    {
      title: "AWS Certified Solutions Architect",
      url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
      type: "course",
      platform: "AWS",
      difficulty: "intermediate",
      free: false,
    },
  ],
  Python: [
    {
      title: "Python Official Tutorial",
      url: "https://docs.python.org/3/tutorial/",
      type: "docs",
      platform: "Python",
      difficulty: "beginner",
      free: true,
    },
    {
      title: "Real Python Tutorials",
      url: "https://realpython.com/",
      type: "tutorial",
      platform: "Real Python",
      difficulty: "intermediate",
      free: true,
    },
  ],
  GraphQL: [
    {
      title: "GraphQL Official Tutorial",
      url: "https://graphql.org/learn/",
      type: "docs",
      platform: "GraphQL",
      difficulty: "beginner",
      free: true,
    },
    {
      title: "How to GraphQL",
      url: "https://www.howtographql.com/",
      type: "tutorial",
      platform: "How to GraphQL",
      difficulty: "intermediate",
      free: true,
    },
  ],
  PostgreSQL: [
    {
      title: "PostgreSQL Tutorial",
      url: "https://www.postgresqltutorial.com/",
      type: "tutorial",
      platform: "PostgreSQL Tutorial",
      difficulty: "beginner",
      free: true,
    },
  ],
  MongoDB: [
    {
      title: "MongoDB University",
      url: "https://university.mongodb.com/",
      type: "course",
      platform: "MongoDB",
      difficulty: "beginner",
      free: true,
    },
  ],
  Redis: [
    {
      title: "Redis University",
      url: "https://university.redis.com/",
      type: "course",
      platform: "Redis",
      difficulty: "beginner",
      free: true,
    },
  ],
  "System Design": [
    {
      title: "System Design Primer",
      url: "https://github.com/donnemartin/system-design-primer",
      type: "article",
      platform: "GitHub",
      difficulty: "intermediate",
      free: true,
    },
    {
      title: "Designing Data-Intensive Applications",
      url: "https://dataintensive.net/",
      type: "article",
      platform: "Book",
      difficulty: "advanced",
      free: false,
    },
  ],
  Git: [
    {
      title: "Git Documentation",
      url: "https://git-scm.com/doc",
      type: "docs",
      platform: "Git",
      difficulty: "beginner",
      free: true,
    },
    {
      title: "Learn Git Branching",
      url: "https://learngitbranching.js.org/",
      type: "practice",
      platform: "Interactive",
      difficulty: "beginner",
      free: true,
    },
  ],
};

export function getLearningResources(skill: string): LearningResource[] {
  const normalizedSkill = skill.trim();

  // Direct match
  if (learningResources[normalizedSkill]) {
    return learningResources[normalizedSkill];
  }

  // Fuzzy match
  const lowerSkill = normalizedSkill.toLowerCase();
  for (const [key, resources] of Object.entries(learningResources)) {
    if (
      key.toLowerCase().includes(lowerSkill) ||
      lowerSkill.includes(key.toLowerCase())
    ) {
      return resources;
    }
  }

  // Generic resources
  return [
    {
      title: `${normalizedSkill} on freeCodeCamp`,
      url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(normalizedSkill)}`,
      type: "tutorial",
      platform: "freeCodeCamp",
      difficulty: "beginner",
      free: true,
    },
    {
      title: `${normalizedSkill} on YouTube`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(normalizedSkill + " tutorial")}`,
      type: "video",
      platform: "YouTube",
      difficulty: "beginner",
      free: true,
    },
    {
      title: `${normalizedSkill} Documentation`,
      url: `https://www.google.com/search?q=${encodeURIComponent(normalizedSkill + " official documentation")}`,
      type: "docs",
      platform: "Official Docs",
      difficulty: "beginner",
      free: true,
    },
  ];
}
