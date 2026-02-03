import { Avatar, Card, CardContent, Stack, Typography, Chip } from "@mui/material";
import SectionTitle from "./SectionTitle";

function initials(name) {
  return name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase();
}

export default function Speakers({ items }) {
  return (
    <div id="speakers" className="section-pad">
      <div className="container">
        <SectionTitle
          eyebrow="Meet the mentors"
          title="Speakers & Guests"
          subtitle="Minimal, modern speaker cards with clear hierarchy."
        />

        <div className="row g-3">
          {items.map((sp) => (
            <div className="col-12 col-md-4" key={sp.name}>
              <Card className="glass" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={1.2}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: "primary.main" }}>{initials(sp.name)}</Avatar>
                      <Stack>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {sp.name}
                        </Typography>
                        <Typography color="text.secondary">
                          {sp.role} • {sp.org}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Chip label={`Talk: ${sp.topic}`} variant="outlined" />
                  </Stack>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
