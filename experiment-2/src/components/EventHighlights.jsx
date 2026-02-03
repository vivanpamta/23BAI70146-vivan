import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import SectionTitle from "./SectionTitle";

export default function EventHighlights({ items }) {
  return (
    <div id="highlights" className="section-pad">
      <div className="container">
        <SectionTitle
          eyebrow="What’s inside"
          title="Events that feel real (not random)"
          subtitle="A balanced mix of tech, business, design, and culture—designed like a real college fest page."
        />

        <div className="row g-3">
          {items.map((it) => (
            <div className="col-12 col-md-6 col-lg-3" key={it.title}>
              <Card className="glass" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack spacing={1.2}>
                    <Chip label={it.chip} color="primary" variant="outlined" sx={{ width: "fit-content" }} />
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {it.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ minHeight: 68 }}>
                      {it.desc}
                    </Typography>
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
