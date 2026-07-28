import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../store/auth";
import Logo from "../components/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><img src="/logo.jpeg" alt="شعار حسين" className="w-32 h-32 rounded-2xl object-contain shadow-md" /></div>
          <h1 className="text-2xl font-bold text-primary-500">نظام حسين</h1>
          <p className="text-gray-500 mt-1">نظام إدارة المتاجر والمخازن</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required />
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-lg">
            {loading ? "...جاري الدخول" : "دخول"}
          </button>
        </form>


      </div>
    </div>
  );
}
