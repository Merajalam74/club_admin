import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SearchByRegNo from "./pages/SearchByRegNo.jsx";
import SearchByClub from "./pages/SearchByClub.jsx";
import JoinedAtLeastOneClub from "./pages/JoinedAtLeastOneClub.jsx";
import NotResponded from "./pages/NotResponded.jsx";
import DuplicateRegistrations from "./pages/DuplicateRegistrations.jsx";
import MessagePanel from "./pages/MessagePanel.jsx";

import { fetchCSVText, parseCSV } from "./utils/DataUtils.js";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [responses, setResponses] = useState([]);
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await fetch(`${API_BASE}/api/messages`);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("❌ Failed to load messages:", err);
      }
    }
    loadMessages();
    // load CSVs from backend endpoints
    async function load() {
      try {
        // Get sheet URLs and form URL from backend
        const configResp = await fetch(`${API_BASE}/api/config`);
        const { responsesSheetUrl, studentsSheetUrl, formUrl } = await configResp.json();

        // Fetch CSV directly from Google Sheets
        const [respCSV, studentsCSV] = await Promise.all([
          fetch(responsesSheetUrl).then(r => r.text()),
          fetch(studentsSheetUrl).then(r => r.text())
        ]);

        setResponses(parseCSV(respCSV));
        setStudents(parseCSV(studentsCSV));
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    }
    load();
  }, []);

  return (
    <Router>
      <div className="app-root">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="main-column">
          <header className="topbar md:hidden">
            <button className="hamburger" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div className="topbar-title">Club Dashboard</div>
          </header>

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard responses={responses} allStudents={students} />} />
              <Route path="/search-by-regno" element={<SearchByRegNo responses={responses} />} />
              <Route path="/search-by-club" element={<SearchByClub responses={responses} allStudents={students} />} />
              <Route path="/joined-students" element={<JoinedAtLeastOneClub responses={responses} />} />
              <Route path="/not-responded" element={<NotResponded responses={responses} allStudents={students} />} />
              <Route path="/duplicates" element={<DuplicateRegistrations responses={responses} />} />
              <Route path="/message-panel" element={<MessagePanel messages={messages} setMessages={setMessages} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}