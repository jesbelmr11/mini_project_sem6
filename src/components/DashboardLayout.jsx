import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children, active, setActive }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar active={active} setActive={setActive} />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
