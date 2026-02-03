import { Card, CardContent, Stack, Typography } from "@mui/material";
import SectionTitle from "./SectionTitle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function ScheduleTimeline({ items }) {
  return (
    <div id="schedule" className="section-pad">
      <div className="container">
        <SectionTitle
          eyebrow="Plan your day"
          title="Schedule Timeline"
          subtitle="A clean timeline layout that stays readable on mobile."
        />

        <div className="row g-3">
          {items.map((it) => (
            <div className="col-12 col-md-6" key={it.time + it.title}>
              <Card className="glass" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <AccessTimeIcon color="primary" sx={{ mt: 0.3 }} />
                    <Stack spacing={0.4}>
                      <Typography variant="overline" sx={{ opacity: 0.85 }}>
                        {it.time}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {it.title}
                      </Typography>
                      <Typography color="text.secondary">{it.meta}</Typography>
                    </Stack>
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
