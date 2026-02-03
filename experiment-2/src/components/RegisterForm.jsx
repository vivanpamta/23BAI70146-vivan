import { useMemo, useState } from "react";
import { Button, Card, CardContent, Divider, Stack, TextField, Typography, Chip } from "@mui/material";
import SectionTitle from "./SectionTitle";
import ToastBar from "./ToastBar";

const STORAGE_KEY = "aurora_registrations_v1";

function loadRegs() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveRegs(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function RegisterForm({ eventName }) {
  const [form, setForm] = useState({ name: "", email: "", dept: "", year: "", team: "" });
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  const regCount = useMemo(() => loadRegs().length, []);

  const onChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    if (form.name.trim().length < 3) return "Name must be at least 3 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email";
    if (!form.dept.trim()) return "Department is required";
    if (!["1", "2", "3", "4"].includes(form.year.trim())) return "Year must be 1, 2, 3, or 4";
    return null;
  };

  const submit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setToast({ open: true, msg: err, severity: "error" });
      return;
    }

    const list = loadRegs();
    const already = list.some((x) => x.email.toLowerCase() === form.email.toLowerCase());
    if (already) {
      setToast({ open: true, msg: "This email is already registered.", severity: "warning" });
      return;
    }

    const entry = { ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    const next = [entry, ...list];
    saveRegs(next);

    setForm({ name: "", email: "", dept: "", year: "", team: "" });
    setToast({ open: true, msg: "Registered successfully! Check your email for updates.", severity: "success" });
  };

  return (
    <div id="register" className="section-pad">
      <div className="container">
        <div className="row g-3 align-items-stretch">
          <div className="col-12 col-lg-5">
            <SectionTitle
              eyebrow="Join the fest"
              title="Register Now"
              subtitle="Form saves entries in localStorage (so it behaves like a real app). One email = one entry."
            />

            <Card className="glass">
              <CardContent>
                <Stack spacing={1.2}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Seats are limited
                  </Typography>
                  <Typography color="text.secondary">
                    Register once and choose your participation: HackSprint / Pitch / Design Duel.
                  </Typography>
                  <Divider sx={{ opacity: 0.2 }} />
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip label={eventName} color="primary" variant="outlined" />
                    <Chip label={`Already registered: ${regCount}`} variant="outlined" />
                    <Chip label="Certificates + Prizes" color="secondary" variant="outlined" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </div>

          <div className="col-12 col-lg-7">
            <Card className="glass" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Participant Details
                </Typography>

                <form onSubmit={submit}>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <TextField fullWidth label="Full Name" value={form.name} onChange={onChange("name")} />
                    </div>
                    <div className="col-12 col-md-6">
                      <TextField fullWidth label="Email" value={form.email} onChange={onChange("email")} />
                    </div>
                    <div className="col-12 col-md-6">
                      <TextField fullWidth label="Department" value={form.dept} onChange={onChange("dept")} />
                    </div>
                    <div className="col-12 col-md-3">
                      <TextField fullWidth label="Year (1-4)" value={form.year} onChange={onChange("year")} />
                    </div>
                    <div className="col-12 col-md-3">
                      <TextField fullWidth label="Team Name (optional)" value={form.team} onChange={onChange("team")} />
                    </div>

                    <div className="col-12">
                      <Button type="submit" variant="contained" size="large" fullWidth>
                        Confirm Registration
                      </Button>
                      <Typography color="text.secondary" sx={{ mt: 1, fontSize: 13 }}>
                        Tip: Try registering the same email twice—validation will block duplicates.
                      </Typography>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <ToastBar
          open={toast.open}
          onClose={() => setToast((p) => ({ ...p, open: false }))}
          message={toast.msg}
          severity={toast.severity}
        />
      </div>
    </div>
  );
}
