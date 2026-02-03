import { Button, Chip, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";

export default function Home({ info, onRegisterClick }) {
  return (
    <div className="section-pad">
      <div className="container">
        <div className="row g-4 align-items-center">
          
          <div className="col-12 col-lg-8">
            <span className="hero-badge">
              <Chip size="small" label={info.theme} color="secondary" variant="outlined" />
              <Typography variant="body2" color="text.secondary">
                {info.college}
              </Typography>
            </span>

            <Typography variant="h2" sx={{ mt: 2, lineHeight: 1.05 }}>
              {info.name}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 2, fontSize: { xs: 16, md: 18 }, maxWidth: 680 }}
            >
              {info.tagline}. Join students from across departments for an
              exciting blend of innovation, technology, and creativity.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={onRegisterClick}
              >
                Register & Get Pass
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() =>
                  document.getElementById("highlights")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore Events
              </Button>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EventIcon color="primary" />
                <Typography color="text.secondary">{info.date}</Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <LocationOnIcon color="primary" />
                <Typography color="text.secondary">{info.venue}</Typography>
              </Stack>
            </Stack>
          </div>

        </div>
      </div>
    </div>
  );
}
