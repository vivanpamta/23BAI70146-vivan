import { useRef } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import EventHighlights from "./components/EventHighlights";
import ScheduleTimeline from "./components/ScheduleTimeline";
import Speakers from "./components/Speakers";
import Faq from "./components/Faq";
import RegisterForm from "./components/RegisterForm";

import Home from "./pages/Home";
import { eventInfo, highlights, schedule, speakers, faqs } from "./data/eventData";

export default function App() {
  const registerRef = useRef(null);

  const jumpToRegister = () => {
    const el = document.getElementById("register");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Navbar onRegisterClick={jumpToRegister} />

      <Home info={eventInfo} onRegisterClick={jumpToRegister} />

      <EventHighlights items={highlights} />
      <ScheduleTimeline items={schedule} />
      <Speakers items={speakers} />
      <Faq items={faqs} />

      <RegisterForm eventName={eventInfo.name} ref={registerRef} />

      <Footer />
    </>
  );
}
