import { Divider, Stack, Typography, Link } from "@mui/material";

export default function Footer() {
  return (
    <div className="section-pad">
      <div className="container">
        <Divider sx={{ mb: 3, opacity: 0.2 }} />
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Chandigarh University 2026
          </Typography>
          <Typography color="text.secondary">
            Built for a college fest UI experiment (MUI + Bootstrap).
          </Typography>
          <Typography color="text.secondary">
            Contact:{" "}
            <Link href="mailto:event@college.edu" underline="hover">
              event@college.edu
            </Link>{" "}
            • Instagram:{" "}
            <Link href="#" underline="hover">
              @aurora_fest
            </Link>
          </Typography>
          <Typography color="text.secondary" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} Campus Events Committee
          </Typography>
        </Stack>
      </div>
    </div>
  );
}
