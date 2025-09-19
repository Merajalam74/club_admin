import React, { useState, useEffect } from "react";
import Card from "../components/Card.jsx";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

export default function MessagePanel({ messages, setMessages }) {
  const [newMessage, setNewMessage] = useState("");
  const [clubs, setClubs] = useState([]);
  const [senders, setSenders] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [selectedSender, setSelectedSender] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`${API_BASE}/api/config`);
        const data = await res.json();

        // prepend the special options
        setClubs([
          "All Students",
          "Technical Board",
          "Cultural Board",
          ...(data.clubs || [])
        ]);

        setSenders(data.senders || []);
      } catch (err) {
        console.error("❌ Failed to load config:", err);
      }
    }
    loadConfig();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedClub || !selectedSender) {
      return alert("Please enter message, club, and sender!");
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newMessage,
          club: selectedClub,      // can now be "All Students", "Technical Board", "Cultural Board", or individual club
          sentBy: selectedSender
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [data.message, ...prev]);
        setNewMessage("");
        setSelectedClub("");
        setSelectedSender("");
        alert(`✅ Message sent to ${data.recipients} students!`);
      } else {
        alert("❌ Failed to send message.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Error sending message.");
    }

    setLoading(false);
  };

  return (
    <Card>
      <h2 className="text-xl font-bold">Message Panel</h2>

      {/* Club selection */}
      <select
        value={selectedClub}
        onChange={e => setSelectedClub(e.target.value)}
        className="w-full p-2 border rounded mt-3"
      >
        <option value="">-- Select Club/Group --</option>
        {clubs.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Sender selection */}
      <select
        value={selectedSender}
        onChange={e => setSelectedSender(e.target.value)}
        className="w-full p-2 border rounded mt-3"
      >
        <option value="">-- Select Sender --</option>
        {senders.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Message box */}
      <textarea
        className="w-full p-2 border rounded mt-3"
        rows="3"
        placeholder="Type your message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      ></textarea>

      <button
        onClick={sendMessage}
        disabled={loading}
        className="btn btn-primary mt-3"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>

      {/* History */}
      <h3 className="mt-6 text-lg font-semibold">📜 Message History</h3>
      <ul className="mt-2 space-y-2">
        {messages.map((msg) => (
          <li key={msg._id} className="p-2 border rounded">
            <p><strong>{msg.sentBy}</strong> ({msg.club})</p>
            <p>{msg.text}</p>
            <small className="text-gray-500">
              {new Date(msg.createdAt).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
    </Card>
  );
}