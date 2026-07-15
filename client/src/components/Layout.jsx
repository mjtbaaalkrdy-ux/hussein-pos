import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/auth";
import Logo from "./Logo";
import useAuth from "../hooks/useAuth";

const navItems = [
  { path: "/dashboard", label: "لوحة التحكم", roles: ["admin", "assistant", "accountant", "supervisor"] },
  { path: "/pos", label: "نقطة البيع", roles: ["admin", "assistant", "accountant"] },
  { path: "/orders", label: "الطلبات", roles: ["admin", "assistant", "accountant", "supervisor", "picker"] },
  { path: "/products", label: "المنتجات", roles: ["admin", "assistant"] },
  { path: "/users", label: "المستخدمين", roles: ["admin", "assistant"] },
  { path: "/debts", label: "الديون", roles: ["admin", "assistant", "accountant"] },
];

const roleNames = {
  admin: "مدير", assistant: "مساعد مدير", accountant: "محاسب", supervisor: "رئيس عمال", picker: "مجهز",
};

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  const handleLogout = () => { logout(); navigate("/login"); };

  const filteredNav = navItems.filter((item) => auth.hasRole(...item.roles));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-primary-500 text-white shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 hover:bg-primary-400 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
              </button>
              <Logo size={42} showText={false} />
              <span className="font-bold text-lg hidden sm:block">نظام حسين</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm hidden md:block">{user?.name} ({roleNames[user?.role]})</span>
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-sm transition">
                خروج
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className={`${menuOpen ? "block" : "hidden"} lg:block bg-primary-700 text-white w-64 flex-shrink-0 no-print`}>
          <nav className="p-4 space-y-1">
            {filteredNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg transition text-sm ${
                  location.pathname === item.path ? "bg-primary-400 text-white" : "hover:bg-primary-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
