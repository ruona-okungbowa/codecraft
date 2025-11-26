export function generatePortfolioReadme(
  name: string,
  githubUsername: string,
  siteUrl: string,
  projectCount: number
): string {
  const repoName = "portfolio-website";
  return `# ${name}'s Portfolio Website

[![Live Site](https://img.shields.io/badge/Live-Site-blue?style=for-the-badge)](${siteUrl})
[![GitHub](https://img.shields.io/badge/GitHub-Profile-black?style=for-the-badge&logo=github)](https://github.com/${githubUsername})
[![Repository](https://img.shields.io/badge/Repository-portfolio--website-green?style=for-the-badge&logo=github)](https://github.com/${githubUsername}/${repoName})

> A modern, responsive portfolio website showcasing my projects and skills

## 🌟 Features

- **Responsive Design**: Looks great on desktop, tablet, and mobile
- **Animated Background**: Subtle particle effects for visual interest
- **Project Showcase**: Highlighting ${projectCount} featured projects
- **Skills Display**: Interactive skill badges with hover effects
- **Fast Loading**: Optimized for performance
- **SEO Optimized**: Meta tags for better search engine visibility

## 🎨 Customization Guide

This portfolio is fully customizable! Here's how to make it your own:

### 1. Update Personal Information

Open \`index.html\` and look for these sections:

**Your Name & Title** (around line 60):
\`\`\`html
<h1>Your Name Here</h1>
<p>Software Engineer</p>
\`\`\`

**Your Bio** (around line 70):
\`\`\`html
<p>Your bio text here...</p>
\`\`\`

### 2. Customize Colors

Find the \`<style>\` section (around line 40) and modify:

\`\`\`css
body {
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  /* Change these hex colors to your preference */
}
\`\`\`

**Popular Color Schemes:**
- Dark Blue: \`#0f172a\` → \`#1e293b\`
- Purple: \`#1e1b4b\` → \`#312e81\`
- Green: \`#064e3b\` → \`#065f46\`
- Red: \`#7f1d1d\` → \`#991b1b\`

### 3. Add/Remove Projects

Projects are in the "Featured Projects" section (around line 200).

**To add a project:**
1. Copy an existing project card
2. Update the project name, description, and URL
3. Change the tech stack badges
4. Update stats (stars, forks)

**To remove a project:**
1. Find the project card div
2. Delete the entire \`<div class="sticky top-20 mb-16...">\` block

### 4. Update Skills

Skills are in the "Skills & Technologies" section (around line 400).

**To add a skill:**
\`\`\`html
<div class="skill-badge...">
  <i class="devicon-javascript-plain skill-icon colored"></i>
  <span>JavaScript</span>
</div>
\`\`\`

Find icon classes at: [devicon.dev](https://devicon.dev)

**To remove a skill:**
Delete the entire \`skill-badge\` div

### 5. Update Social Links

Find the "About Me" section (around line 500):

\`\`\`html
<a href="https://github.com/${githubUsername}">GitHub</a>
<a href="mailto:your.email@example.com">Email</a>
\`\`\`

Add more social links:
- LinkedIn: \`https://linkedin.com/in/yourprofile\`
- Twitter: \`https://twitter.com/yourhandle\`
- Portfolio: \`https://yourwebsite.com\`

## 🚀 Deployment

This site is automatically deployed to GitHub Pages at:
**${siteUrl}**

### Manual Deployment

If you make changes:

1. **Edit \`index.html\`** with your changes
2. **Commit and push**:
   \`\`\`bash
   git add index.html
   git commit -m "Update portfolio"
   git push origin main
   \`\`\`
3. **Wait 1-2 minutes** for GitHub Pages to rebuild

### Local Development

To preview changes locally:

1. **Clone the repository**:
   \`\`\`bash
   git clone https://github.com/${githubUsername}/${repoName}.git
   cd ${repoName}
   \`\`\`

2. **Open in browser**:
   - Simply open \`index.html\` in your browser
   - Or use a local server:
     \`\`\`bash
     python -m http.server 8000
     # Visit http://localhost:8000
     \`\`\`

## 📝 File Structure

\`\`\`
.
├── index.html          # Main portfolio page (EDIT THIS!)
└── README.md          # This file
\`\`\`

## 🎯 Quick Edits Checklist

- [ ] Update name and title
- [ ] Change bio text
- [ ] Update GitHub username in links
- [ ] Add/remove projects
- [ ] Update skills list
- [ ] Add social media links
- [ ] Customize colors (optional)
- [ ] Add your email (optional)
- [ ] Update meta tags for SEO (optional)

## 💡 Tips & Tricks

### Change Font
Add to the \`<head>\` section:
\`\`\`html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
\`\`\`

Then update CSS:
\`\`\`css
body {
  font-family: 'Inter', sans-serif;
}
\`\`\`

### Add Google Analytics
Add before \`</head>\`:
\`\`\`html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-GA-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR-GA-ID');
</script>
\`\`\`

### Add Favicon
Add to \`<head>\`:
\`\`\`html
<link rel="icon" type="image/png" href="favicon.png">
\`\`\`

Then add a \`favicon.png\` file to your repository.

## 🐛 Troubleshooting

### Site not updating?
- Wait 2-3 minutes after pushing changes
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check GitHub Actions tab for build status

### Broken layout?
- Ensure you didn't accidentally delete closing tags
- Check browser console for errors (F12)
- Validate HTML at [validator.w3.org](https://validator.w3.org/)

### Icons not showing?
- Check devicon class names at [devicon.dev](https://devicon.dev)
- Ensure the devicon CDN link is in \`<head>\`

## 📚 Resources

- **Tailwind CSS Docs**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Devicon Icons**: [devicon.dev](https://devicon.dev)
- **GitHub Pages Docs**: [docs.github.com/pages](https://docs.github.com/en/pages)
- **HTML/CSS Reference**: [developer.mozilla.org](https://developer.mozilla.org)

## 🤝 Contributing

This is a personal portfolio, but feel free to:
- Fork it for your own use
- Submit issues if you find bugs
- Suggest improvements

## 📄 License

This portfolio is open source and available under the [MIT License](LICENSE).

## 🙏 Credits

- Generated with [CodeCraft](https://codecraft.dev)
- Icons from [Devicon](https://devicon.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)

---

**Made with ❤️ by ${name}**

*Last updated: ${new Date().toLocaleDateString()}*
`;
}
