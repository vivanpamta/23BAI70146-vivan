import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function Navbar({ onRegisterClick }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ background: "rgba(11,16,32,0.7)", backdropFilter: "blur(12px)" }}>
      <Toolbar className="container" sx={{ py: 1, gap: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            AURORA
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
          <Button color="inherit" onClick={() => scrollTo("highlights")}>Highlights</Button>
          <Button color="inherit" onClick={() => scrollTo("schedule")}>Schedule</Button>
          <Button color="inherit" onClick={() => scrollTo("speakers")}>Speakers</Button>
          <Button color="inherit" onClick={() => scrollTo("faq")}>FAQ</Button>
        </Stack>

        <Button variant="contained" onClick={onRegisterClick}>
          Register
        </Button>
      </Toolbar>
    </AppBar>
  );
}
