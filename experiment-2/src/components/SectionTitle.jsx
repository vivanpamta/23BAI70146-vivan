import { Stack, Typography } from "@mui/material";

export default function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <Stack spacing={1} sx={{ mb: 3 }}>
      {eyebrow && (
        <Typography variant="overline" sx={{ letterSpacing: "0.16em", opacity: 0.8 }}>
          {eyebrow}
        </Typography>
      )}
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  );
}
