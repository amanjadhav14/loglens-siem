// SAME IMPORTS
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#ff4d4d", "#8b5cf6", "#22c55e", "#64748b"];

function MapView() {
  return (
    <MapContainer center={[20, 78]} zoom={4} style={{ height: "300px" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[19.0760, 72.8777]}>
        <Popup>Mumbai Attack Source</Popup>
      </Marker>
    </MapContainer>
  );
}

const Card = ({ title, value }) => (
  <div style={{ flex: 1, padding: "18px", borderRadius: "18px", background: "rgba(15,23,42,0.5)" }}>
    <h4>{title}</h4>
    <h2>{value}</h2>
  </div>
);

const GlassCard = ({ children }) => (
  <div style={{ padding: "20px", borderRadius: "20px", background: "rgba(15,23,42,0.4)" }}>
    {children}
  </div>
);

function App() {
  const API = "https://loglens-siem.onrender.com";
  const [data, setData] = useState({ logs: [], top_attackers: {} });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [liveLogs, setLiveLogs] = useState([
    { time: "13:56:01", ip: "1.1.1.1", type: "brute_force" },
    { time: "13:56:03", ip: "8.8.8.8", type: "sql_injection" },
    { time: "13:56:05", ip: "192.168.1.1", type: "normal" },
  ]);

  const loadDemo = async () => {
    try {
      const res = await axios.get(`${API}/demo`);
      setData(res.data);
    } catch (err) {
      console.error("Error loading demo:", err);
    }
  };

  useEffect(() => {
    loadDemo();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const types = ["normal", "brute_force", "sql_injection"];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const newLog = {
        time: new Date().toLocaleTimeString(),
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        type: randomType,
      };
      setLiveLogs(prev => [...prev.slice(-9), newLog]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const exportCSV = () => {
    if (!data.logs.length) return;
    const headers = Object.keys(data.logs[0]).join(",");
    const rows = data.logs.map(log => Object.values(log).join(","));
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "loglens_report.csv";
    a.click();
  };

  const exportPDF = () => {
    if (!data.logs.length) return;
    const doc = new jsPDF();
    doc.text("LogLens Report", 14, 10);
    const rows = data.logs.map(log => [log.ip, log.attack, log.severity, log.timestamp]);
    autoTable(doc, {
      head: [["IP", "Attack", "Severity", "Time"]],
      body: rows,
    });
    doc.save("report.pdf");
  };

  const handleLogin = () => {
    if (username === "admin" && password === "1234") {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("Invalid credentials ❌");
    }
  };

  const uploadFile = async (e) => {
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    const res = await axios.post(`${API}/upload`, formData);
    setData(res.data);
  };

  const getAttackTypes = () => {
    const counts = {};
    data.logs.forEach(l => {
      const attack = l.attack || "normal";
      counts[attack] = (counts[attack] || 0) + 1;
    });
    const result = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return result.length === 0 ? [{ name: "no_data", value: 1 }] : result;
  };

  const getTopAttackers = () => {
    return Object.entries(data.top_attackers).map(([ip, count]) => ({ ip, count }));
  };

  const getTimelineData = () => {
    const counts = {};
    data.logs.forEach(log => {
      const time = log.timestamp?.slice(12, 17) || "00:00";
      counts[time] = (counts[time] || 0) + 1;
    });
    return Object.keys(counts).map(t => ({ time: t, attacks: counts[t] }));
  };

  if (!isLoggedIn) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#020617", color: "white" }}>
        <div style={{ padding: "40px", borderRadius: "16px", background: "rgba(15,23,42,0.9)", boxShadow: "0 0 30px rgba(124,58,237,0.2)", width: "300px" }}>
          <h2 style={{ marginBottom: "20px", textAlign: "center" }}>🔐 LogLens Login</h2>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "8px", border: "none" }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "8px", border: "none" }} />
          <button onClick={handleLogin} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "none", background: "linear-gradient(90deg,#7c3aed,#ec4899)", color: "white", fontWeight: "bold", cursor: "pointer" }}>Login</button>
          {error && <p style={{ color: "#ef4444", marginTop: "10px", textAlign: "center" }}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", minHeight: "100vh", color: "white",
      background: `radial-gradient(circle at 15% 20%, rgba(124,58,237,0.25), transparent 35%), radial-gradient(circle at 85% 25%, rgba(236,72,153,0.18), transparent 35%), radial-gradient(circle at 50% 80%, rgba(34,197,94,0.12), transparent 40%), radial-gradient(circle at 50% 50%, rgba(2,6,23,0.9), #020617 80%)`,
      boxShadow: "inset 0 0 200px rgba(0,0,0,0.9)", backgroundBlendMode: "screen"
    }}>
      <div style={{ position: "fixed", width: "100%", height: "100%", background: "url('https://www.transparenttextures.com/patterns/cubes.png')", opacity: 0.03, pointerEvents: "none", zIndex: 0 }} />
      
      {/* SIDEBAR */}
      <div style={{ width: "240px", padding: "20px", backdropFilter: "blur(20px)", background: "rgba(15,23,42,0.7)", boxShadow: "0 0 30px rgba(124,58,237,0.2)", borderRight: "1px solid rgba(255,255,255,0.05)", zIndex: 1 }}>
        <h2 style={{ marginBottom: "30px", color: "#a78bfa" }}>🛡️ LogLens</h2>
        {["dashboard", "alerts", "logs"].map(tab => (
          <div key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "12px", borderRadius: "10px", marginBottom: "10px", cursor: "pointer", background: activeTab === tab ? "linear-gradient(90deg,#7c3aed,#ec4899)" : "transparent", color: activeTab === tab ? "white" : "#9ca3af" }}>
            {tab.toUpperCase()}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: "25px", zIndex: 1 }}>
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", borderRadius: "18px", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2>⚡ SOC Dashboard</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <label style={{ cursor: "pointer", padding: "8px", background: "#1e293b", borderRadius: "8px" }}>📁 Browse<input type="file" onChange={uploadFile} hidden /></label>
            <button onClick={loadDemo}>Load Demo</button>
            <button onClick={exportCSV}>⬇ CSV</button>
            <button onClick={exportPDF}>📄 PDF</button>
            <button onClick={() => setIsLoggedIn(false)}>Logout</button>
          </div>
        </div>

        {activeTab === "dashboard" && (
          <div style={{ marginTop: "20px" }}>
            {data.logs.length === 0 && <div style={{ textAlign: "center", marginTop: "40px", color: "#9ca3af" }}>🚫 No logs uploaded yet</div>}

            <div style={{ display: "flex", gap: "12px" }}>
              <Card title="Total Logs" value={data.logs.length} />
              <Card title="High Severity" value={data.logs.filter(l => l.severity === "high").length} />
              <Card title="Attackers" value={Object.keys(data.top_attackers).length} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px", marginTop: "30px" }}>
              <GlassCard>
                <h4>Attack Types</h4>
                <div style={{ position: "relative", width: "100%", height: "260px" }}>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={getAttackTypes()} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={4}>
                        {getAttackTypes().map((entry, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" }}>
                    <div style={{ fontSize: "22px", fontWeight: "bold" }}>{data.logs.length}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>Total</div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard>
                <h4>Top Attackers</h4>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={getTopAttackers()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="ip" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid #7c3aed", borderRadius: "10px" }} />
                    <Bar dataKey="count" fill="#7c3aed" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>

              <GlassCard>
                <h4>Timeline</h4>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={getTimelineData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#020617", border: "1px solid #ec4899", borderRadius: "10px" }} />
                    <Line type="monotone" dataKey="attacks" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </GlassCard>
            </div>

            <div style={{ marginTop: "30px" }}>
              <GlassCard>
                <h4>📡 Live Logs</h4>
                <div style={{ maxHeight: "180px", overflowY: "auto", fontFamily: "monospace" }}>
                  {liveLogs.map((log, i) => (<div key={i}>[{log.time}] {log.ip} → {log.type}</div>))}
                </div>
              </GlassCard>
            </div>

            <div style={{ marginTop: "30px" }}>
              <GlassCard>
                <h4 style={{ color: "#ef4444" }}>🚨 Active Threat Alerts ({data.logs.filter(l => l.attack !== "normal").length})</h4>
                {data.logs.filter(log => log.attack !== "normal").slice(0, 6).map((log, i) => {
                  let severity = "MEDIUM", color = "#f59e0b", icon = "⚠️";
                  if (log.attack === "sql_injection") { severity = "CRITICAL"; color = "#ff4d4d"; icon = "💀"; }
                  else if (log.attack === "brute_force") { severity = "HIGH"; color = "#a855f7"; icon = "🔓"; }
                  return (
                    <div key={i} onClick={() => setSelectedAlert(log)} style={{ display: "flex", justifyContent: "space-between", padding: "12px", marginTop: "10px", borderRadius: "12px", border: `1px solid ${color}`, cursor: "pointer" }}>
                      <div>{icon} {log.attack} - {log.ip}</div>
                      <div style={{ background: color, padding: "4px 10px", borderRadius: "6px" }}>{severity}</div>
                    </div>
                  );
                })}
              </GlassCard>
            </div>

            <div style={{ marginTop: "30px" }}>
              <GlassCard>
                <h4>🌍 Global Threat Map</h4>
                <MapView />
              </GlassCard>
            </div>
          </div>
        )}

        {/* 🔥 POPUP */}
        {selectedAlert && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }}>
            <div style={{ background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #7c3aed" }}>
              <h3>Alert Details</h3>
              <p>Attack: {selectedAlert.attack}</p>
              <p>IP: {selectedAlert.ip}</p>
              <button onClick={() => setSelectedAlert(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
