import { useState } from "react";
import DashboardLayout from "./components/DashboardLayout";

import SystemMetrics from "./pages/SystemMetrics";
import LogsPage from "./pages/LogsPage";
import ErrorsPage from "./pages/ErrorsPage";
import UploadPage from "./pages/UploadPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const [active, setActive] = useState("metrics");

  const renderPage = () => {
    switch (active) {
      case "metrics":
        return <SystemMetrics />;
      case "logs":
        return <LogsPage />;
      case "errors":
        return <ErrorsPage />;
      case "upload":
        return <UploadPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <SystemMetrics />;
    }
  };

  return (
    <DashboardLayout active={active} setActive={setActive}>
      {renderPage()}
    </DashboardLayout>
  );
}
