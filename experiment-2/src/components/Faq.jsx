import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SectionTitle from "./SectionTitle";

export default function Faq({ items }) {
  return (
    <div id="faq" className="section-pad">
      <div className="container">
        <SectionTitle
          eyebrow="Help"
          title="Frequently Asked Questions"
          subtitle="Simple accordion UX, consistent with the theme."
        />

        {items.map((f) => (
          <Accordion key={f.q} className="glass" disableGutters sx={{ mb: 1, "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 700 }}>{f.q}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{f.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </div>
  );
}
