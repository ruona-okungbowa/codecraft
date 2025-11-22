"use client";

import { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Lightbulb,
  Description,
  TrendingUp,
  WorkOutline,
  Language,
  Mic,
  Sync,
  GitHub,
  Folder,
  Menu as MenuIcon,
  Settings,
} from "@mui/icons-material";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";

const drawerWidth = 280;

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projects, setProjects] = useState<
    Array<{ id: number; name: string; language: string; stars: number }>
  >([]);
  const [portfolioScore, setPortfolioScore] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Fetch repos from GitHub and store in database
      const reposResponse = await fetch("/api/github/repos");
      if (!reposResponse.ok) {
        throw new Error("Failed to sync repositories");
      }
      await reposResponse.json();

      // Fetch stored projects from database
      const projectsResponse = await fetch("/api/projects");
      if (!projectsResponse.ok) {
        throw new Error("Failed to fetch projects");
      }
      const projectsData = await projectsResponse.json();

      // Transform projects to match component state
      const transformedProjects = projectsData.projects.map(
        (project: {
          id: number;
          name: string;
          languages: Record<string, number>;
          stars: number;
        }) => ({
          id: project.id,
          name: project.name,
          language: Object.keys(project.languages || {})[0] || "Unknown",
          stars: project.stars || 0,
        })
      );

      setProjects(transformedProjects);

      // Calculate portfolio score
      const scoreResponse = await fetch("/api/analysis/portfolio-score");
      if (scoreResponse.ok) {
        const scoreData = await scoreResponse.json();
        setPortfolioScore(Math.round(scoreData.overallScore));
      }
    } catch (error) {
      console.error("Error syncing:", error);
      alert("Failed to sync repositories. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const navigationItems = [
    {
      text: "Project Recommendations",
      icon: <Lightbulb />,
      href: "/project-recommendations",
    },
    {
      text: "Generate Resume",
      icon: <Description />,
      href: "/generate-resume",
    },
    { text: "Skill Gap Analysis", icon: <TrendingUp />, href: "/skill-gap" },
    { text: "Job Match Scoring", icon: <WorkOutline />, href: "/job-match" },
    { text: "Portfolio Website", icon: <Language />, href: "/portfolio" },
    { text: "Mock Interview", icon: <Mic />, href: "/mock-interview" },
    { text: "Settings", icon: <Settings />, href: "/settings" },
  ];

  const drawer = (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#0f0f0f",
        borderRight: `1px solid ${alpha("#667eea", 0.2)}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            src={user?.user_metadata?.avatar_url}
            alt={user?.user_metadata?.user_name || "User"}
            sx={{
              mr: 1.5,
              width: 40,
              height: 40,
              border: `2px solid ${alpha("#667eea", 0.3)}`,
            }}
          >
            <GitHub sx={{ color: "#667eea", fontSize: 24 }} />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "1.3rem",
                lineHeight: 1.2,
              }}
            >
              GitStory
            </Typography>
            <Typography
              variant="caption"
              color="#808080"
              sx={{ fontSize: "0.75rem" }}
            >
              Dashboard
            </Typography>
          </Box>
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha("#667eea", 0.08),
            border: `1px solid ${alpha("#667eea", 0.2)}`,
          }}
        >
          <Typography
            variant="caption"
            color="#b0b0b0"
            sx={{
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Logged in as
          </Typography>
          <Typography
            variant="body2"
            color="#ffffff"
            fontWeight={600}
            sx={{ mt: 0.5 }}
          >
            {user?.user_metadata?.user_name || user?.email?.split("@")[0]}
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ px: 2 }}>
        <Typography
          variant="overline"
          sx={{
            px: 2,
            py: 1,
            color: "#808080",
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: 1.5,
          }}
        >
          TOOLS
        </Typography>
      </Box>

      <List sx={{ px: 2, py: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1.5 }}>
            <ListItemButton
              component={Link}
              href={item.href}
              sx={{
                borderRadius: 3,
                color: "#c0c0c0",
                py: 2,
                px: 2.5,
                transition: "all 0.2s ease",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  bgcolor: "#667eea",
                  transform: "scaleY(0)",
                  transition: "transform 0.2s ease",
                },
                "&:hover": {
                  bgcolor: alpha("#667eea", 0.12),
                  color: "#ffffff",
                  transform: "translateX(4px)",
                  "&::before": {
                    transform: "scaleY(1)",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "#667eea",
                    transform: "scale(1.1)",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  minWidth: 48,
                  transition: "all 0.2s ease",
                }}
              >
                <Box
                  sx={{
                    fontSize: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  letterSpacing: 0.2,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#0a0a0a",
        }}
      >
        <CircularProgress sx={{ color: "#667eea" }} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#0a0a0a",
        }}
      >
        <Typography variant="h5" color="#e0e0e0">
          Please log in
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0a0a0a" }}>
      {/* Mobile Menu Button */}
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1300,
          display: { sm: "none" },
          bgcolor: alpha("#2a2a2a", 0.9),
          color: "#667eea",
          "&:hover": { bgcolor: alpha("#2a2a2a", 1) },
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Side Navigation */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: "#0f0f0f",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: "#0f0f0f",
              borderRight: "none",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, sm: 0 },
        }}
      >
        {/* Header with Portfolio Score */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "#ffffff",
              fontSize: { xs: "2rem", md: "2.5rem" },
            }}
          >
            Your Projects
          </Typography>

          {portfolioScore !== null && (
            <Paper
              elevation={0}
              sx={{
                px: 3,
                py: 2,
                borderRadius: 3,
                bgcolor: "#1a1a1a",
                border: `2px solid ${alpha("#667eea", 0.3)}`,
                boxShadow: `0 4px 20px ${alpha("#000000", 0.3)}`,
              }}
            >
              <Typography variant="body2" color="#b0b0b0" gutterBottom>
                Portfolio Score
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {portfolioScore}
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Sync Button */}
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            startIcon={
              syncing ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Sync />
              )
            }
            onClick={handleSync}
            disabled={syncing}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: `0 4px 20px ${alpha("#667eea", 0.3)}`,
              "&:hover": {
                boxShadow: `0 6px 30px ${alpha("#667eea", 0.4)}`,
              },
              "&:disabled": {
                background: alpha("#667eea", 0.5),
              },
            }}
          >
            {syncing ? "Syncing..." : "Sync with GitHub"}
          </Button>
        </Box>

        {/* Projects Grid or Empty State */}
        {projects.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: "center",
              borderRadius: 4,
              bgcolor: "#1a1a1a",
              border: `2px dashed ${alpha("#667eea", 0.3)}`,
              minHeight: "calc(100vh - 300px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <GitHub
              sx={{ fontSize: 80, color: alpha("#667eea", 0.5), mb: 3 }}
            />
            <Typography
              variant="h5"
              color="#e0e0e0"
              gutterBottom
              fontWeight={700}
            >
              No Projects Yet
            </Typography>
            <Typography variant="body1" color="#b0b0b0" sx={{ mb: 3 }}>
              Sync with GitHub to load your repositories and start building your
              portfolio
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Sync />}
              onClick={handleSync}
              disabled={syncing}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                borderWidth: 2,
                borderColor: "#667eea",
                color: "#667eea",
                "&:hover": {
                  borderWidth: 2,
                  bgcolor: alpha("#667eea", 0.1),
                },
              }}
            >
              Sync with GitHub
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
                <Card
                  sx={{
                    height: "100%",
                    minHeight: 180,
                    borderRadius: 4,
                    bgcolor: "#1a1a1a",
                    border: `2px solid ${alpha("#667eea", 0.3)}`,
                    transition: "all 0.3s ease",
                    boxShadow: `0 4px 20px ${alpha("#000000", 0.3)}`,
                    "&:hover": {
                      borderColor: alpha("#667eea", 0.6),
                      bgcolor: "#222222",
                      boxShadow: `0 8px 30px ${alpha("#667eea", 0.3)}`,
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha("#667eea", 0.2),
                          color: "#667eea",
                          mr: 2,
                          width: 56,
                          height: 56,
                        }}
                      >
                        <Folder sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="h6"
                          color="#ffffff"
                          fontWeight={700}
                        >
                          {project.name}
                        </Typography>
                        <Typography variant="body2" color="#b0b0b0">
                          {project.language}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={`⭐ ${project.stars} stars`}
                      size="small"
                      sx={{
                        bgcolor: alpha("#667eea", 0.2),
                        color: "#667eea",
                        fontWeight: 600,
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
