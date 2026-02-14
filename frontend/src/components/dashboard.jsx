import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  AlertTriangle,
  Settings,
  LogOut,
  Upload,
  Bell,
  User,
} from "lucide-react";

export default function Dashboard({ user, onLogout }) {
  // Default page
  const [activeNav, setActiveNav] = useState("system_metrics");
  const [metrics, setMetrics] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const navItems = [
    { id: "system_metrics", label: "System Metrics", icon: <LayoutDashboard size={18} /> },
    { id: "logs", label: "Log Files", icon: <FileText size={18} /> },
    { id: "errors", label: "Errors & Alerts", icon: <AlertTriangle size={18} /> },
    { id: "upload", label: "Upload Logs", icon: <Upload size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  // ================= FETCH SYSTEM METRICS =================
  useEffect(() => {
    if (activeNav === "system_metrics") {
      fetch("http://localhost:4000/api/system-metrics")
        .then((res) => res.json())
        .then((data) => setMetrics(data))
        .catch((err) => console.error("Metrics error:", err));
    }
  }, [activeNav]);

  // ================= HANDLE LOG UPLOAD =================
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("logfile", selectedFile);

    try {
      const res = await fetch("http://localhost:4000/api/upload-log", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Log uploaded successfully!");
        setSelectedFile(null);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Server error while uploading");
    }
  };

  const cardStyle = {
    background: "#2a2a31",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background: "#1f1f23",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      {/* ================= SIDEBAR ================= */}
      <aside
        style={{
          width: "250px",
          background: "#2a2a31",
          display: "flex",
          flexDirection: "column",
          padding: "25px 20px",
          boxShadow: "2px 0 10px rgba(0,0,0,0.4)",
        }}
      >
        <h2 style={{ marginBottom: 30 }}>AI Log Analyzer</h2>

        <div style={{ flex: 1 }}>
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 8,
                cursor: "pointer",
                marginBottom: 10,
                background:
                  activeNav === item.id ? "#3a3a45" : "transparent",
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onLogout}
          style={{
            padding: 12,
            background: "#3a3a45",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* ================= MAIN SECTION ================= */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* HEADER */}
        <header
          style={{
            background: "#2a2a31",
            padding: "20px 30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #333",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>
              {activeNav.replace("_", " ")}
            </h2>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
              Welcome back, {user?.name}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Bell size={18} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14 }}>{user?.name}</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                {user?.email}
              </div>
            </div>
            <User size={22} />
          </div>
        </header>

        {/* ================= CONTENT ================= */}
        <main style={{ flex: 1, padding: 40, overflowY: "auto" }}>

          {/* ===== SYSTEM METRICS ===== */}
          {activeNav === "system_metrics" && (
            <>
              <h3 style={{ marginBottom: 20 }}>📊 System Metrics</h3>

              {!metrics ? (
                <p>Loading system metrics...</p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 20,
                  }}
                >
                  <div style={cardStyle}>
                    <h4>CPU Usage</h4>
                    <p>{metrics.cpuUsage}%</p>
                  </div>

                  <div style={cardStyle}>
                    <h4>CPU Temperature</h4>
                    <p>
                      {metrics.cpuTemp !== null
                        ? `${metrics.cpuTemp} °C`
                        : "Not Supported on this system"}
                    </p>
                  </div>

                  <div style={cardStyle}>
                    <h4>Memory Usage</h4>
                    <p>{metrics.usedMem} / {metrics.totalMem} GB</p>
                  </div>

                  <div style={cardStyle}>
                    <h4>Disk Usage</h4>
                    <p>{metrics.diskUsed} / {metrics.diskTotal} GB</p>
                  </div>

                  <div style={cardStyle}>
                    <h4>Active Processes</h4>
                    <p>{metrics.activeProcesses}</p>
                  </div>

                  <div style={cardStyle}>
                    <h4>System Uptime</h4>
                    <p>{Math.floor(metrics.uptime / 3600)} hrs</p>
                  </div>

                  <div style={cardStyle}>
                    <h4>Active Connections</h4>
                    <p>{metrics.activeConnections}</p>
                  </div>

                  <div style={cardStyle}>
                    <h4>Load Average</h4>
                    <p>{metrics.loadAverage}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== LOG UPLOAD ===== */}
          {activeNav === "upload" && (
            <div>
              <h3>⬆ Upload Log File</h3>

              <input
                type="file"
                accept=".log,.txt"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />

              <button
                onClick={handleUpload}
                style={{
                  marginTop: 10,
                  padding: 10,
                  background: "#3a3a45",
                  border: "none",
                  color: "#fff",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Upload
              </button>
            </div>
          )}

          {/* ===== OTHER PAGES ===== */}
          {activeNav === "logs" && <h3>📁 Log Files Section</h3>}
          {activeNav === "errors" && <h3>⚠ Error & Alert Monitoring</h3>}
          {activeNav === "settings" && <h3>⚙ System Settings</h3>}

        </main>
      </div>
    </div>
  );
}
