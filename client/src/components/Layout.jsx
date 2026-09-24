import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/auth";
import Logo from "./Logo";
import useAuth from "../hooks/useAuth";

// أقسام القائمة بحسب نظام عمل المحل
const navSections = [
  {
    title: "الرئيسية",
    items: [
      { path: "/dashboard", label: "لوحة التحكم", roles: ["admin", "assistant", "accountant", "supervisor", "picker"] },
    ],
  },
  {
    title: "المبيعات",
    items: [
      { path: "/pos", label: "نقطة البيع", roles: ["admin", "assistant", "accountant"] },
      { path: "/orders", label: "فواتير البيع", roles: ["admin", "assistant", "accountant", "supervisor", "picker"] },
    ],
  },
  {
    title: "الطلبات",
    items: [
      { path: "/orders?status=pending", label: "طلب غير مجهز", roles: ["admin", "assistant", "supervisor"] },
      { path: "/orders?status=assigned", label: "قيد التجهيز", roles: ["admin", "assistant", "supervisor", "picker"] },
      { path: "/orders?status=picked", label: "جاهز للشحن", roles: ["admin", "assistant", "supervisor", "picker"] },
    ],
  },
  {
    title: "المستودع",
    items: [
      { path: "/inventory", label: "جرد المستودع", roles: ["admin", "assistant"] },
      { path: "/materials", label: "المواد المطلوبة", roles: ["admin", "assistant"] },
      { path: "/purchases", label: "قوائم الشراء", roles: ["admin", "assistant"] },
    ],
  },
  {
    title: "الإدارة",
    items: [
      { path: "/users", label: "المستخدمين", roles: ["admin", "assistant"] },
      { path: "/debts", label: "الديون", roles: ["admin", "assistant", "accountant"] },
    ],
  },
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

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => auth.hasRole(...item.roles)),
    }))
    .filter((section) => section.items.length > 0);

  const isActive = (path) => {
    const [p, query] = path.split("?");
    if (query) {
      return location.pathname === p && location.search.includes(query);
    }
    return location.pathname === p;
  };

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
          <nav className="p-4 space-y-4">
            {filteredSections.map((section) => (
              <div key={section.title}>
                <p className="px-4 pb-1 text-xs font-bold text-primary-300 uppercase tracking-wide">{section.title}</p>
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`block px-4 py-2 rounded-lg transition text-sm ${
                        isActive(item.path) ? "bg-primary-400 text-white" : "hover:bg-primary-600"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
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