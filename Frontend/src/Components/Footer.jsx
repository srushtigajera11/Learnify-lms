import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Link,
  Divider,
  Stack,
  Container,
} from "@mui/material";

function Footer() {
  return (
    <Box
      sx={{
        bgcolor: "#0f172a",
        color: "#ffffffcc",
        mt: 5,
        pt: 5,
        pb: 3,
        px: { xs: 2, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Typography variant="h6" color="#fff" gutterBottom>
              Learnify
            </Typography>
            <Typography variant="body2" sx={{ color: "#ffffff99" }}>
              Master new skills and grow your career.
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography fontWeight="bold" gutterBottom color="#fff">
              Company
            </Typography>
            <Stack spacing={0.5}>
              <Link to="/about" component={RouterLink} color="inherit">About</Link>
              <Link to="/blog" component={RouterLink} color="inherit">Blog</Link>
            </Stack>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography fontWeight="bold" gutterBottom color="#fff">
              Support
            </Typography>
            <Stack spacing={0.5}>
              <Link to="/help" component={RouterLink} color="inherit">Help Center</Link>
              <Link to="/faq" component={RouterLink} color="inherit">FAQs</Link>
            </Stack>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography fontWeight="bold" gutterBottom color="#fff">
              Legal
            </Typography>
            <Stack spacing={0.5}>
              <Link to="/terms" component={RouterLink} color="inherit">Terms</Link>
              <Link to="/privacy" component={RouterLink} color="inherit">Privacy</Link>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: "#ffffff22" }} />

        <Box display="flex" justifyContent="space-between" flexWrap="wrap">
          <Typography variant="caption" color="#ffffff88">
            © {new Date().getFullYear()} Learnify Inc.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Link href="https://facebook.com" target="_blank" color="inherit">Facebook</Link>
            <Link href="https://linkedin.com" target="_blank" color="inherit">LinkedIn</Link>
            <Link href="https://twitter.com" target="_blank" color="inherit">Twitter</Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
