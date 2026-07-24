import { Container, Stack, Typography, Box } from "@mui/material";
import { Github, Globe, Link, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import M3SocialCard from "@/components/M3SocialCard";


const DEVELOPER_NAME = "Thinakaran Manokaran";

const SOCIAL_LINKS = [
  { label: "Portfolio", url: "https://thinakaran.dev", icon: <Globe size={20} /> },
  { label: "GitHub", url: "https://github.com/thinakaranmanokaran", icon: <Github size={20} /> },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/thinakaran-manohar", icon: <Link size={20} /> },
  { label: "Instagram", url: "https://instagram.com/thinakaranmanokaran", icon: <Instagram size={20} /> },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export default function DeveloperPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Stack spacing={0}>
        {/* Header */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <Stack alignItems="center" sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={800} textAlign="center">
              {DEVELOPER_NAME}
            </Typography>
            <Typography variant="body1" color="primary.main" fontWeight={500} sx={{ mt: 0.5 }}>
              Software Developer
            </Typography>
          </Stack>
        </motion.div>

        {/* About Bio */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
          <Box sx={{ px: 1, mb: 4 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
              About
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
              Thinakaran Manokaran is a Software Developer passionate about
              designing and building modern, reliable, and user-focused digital
              experiences. He enjoys creating applications that combine clean
              architecture, intuitive interfaces, and efficient performance across
              web, mobile, and desktop platforms.
            </Typography>
            <Typography variant="body1" color="text.secondary" lineHeight={1.7} sx={{ mt: 2 }}>
              His technical expertise includes Rust, TypeScript, React,
              Tauri, Node.js, and modern web technologies. He is also
              interested in software architecture, automation, artificial
              intelligence, developer tools, and continuously learning
              emerging technologies to build practical solutions.
            </Typography>
          </Box>
        </motion.div>

        {/* Social Links Grid */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, px: 1 }}>
            {SOCIAL_LINKS.map((link) => (
              <M3SocialCard key={link.label} icon={link.icon} label={link.label} url={link.url} />
            ))}
          </Box>
        </motion.div>
      </Stack>
    </Container>
  );
}
