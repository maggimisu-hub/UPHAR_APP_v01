import { Outlet } from "react-router-dom";

import Footer from "./Footer";
import Navbar from "./Navbar";
import VoiceAssistant from "./VoiceAssistant";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background-light">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <VoiceAssistant />
    </div>
  );
}

