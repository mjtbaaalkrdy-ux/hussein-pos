import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const roleNames = { admin: "مدير", assistant: "مساعد مدير", accountant: "محاسب", supervisor: "رئيس عمال", picker: "مجهز" };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "picker" });

  const fetchUsers = useCallback(async () => {
    const { data } = await api.get("/users");
    setUsers(data);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", password: "", role: "picker" });
    setEdit(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (edit) { await api.put(`/users/${edit.id}`, form); } else { await api.post("/users", form); }
      resetForm();
      fetchUsers();
    } catch (err) { alert(err.response?.data?.message || "خطأ"); }
  };

  const handleEdit = (u) => {
    setForm({ name: u.name, email: u.email, phone: u.phone, password: "", role: u.role });
    setEdit(u);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد؟")) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">المستخدمين</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary">{showForm ? "إغلاق" : "إضافة مستخدم"}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">الاسم</label>
            <input placeholder="اكتب اسم المستخدم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">البريد الإلكتروني</label>
            <input type="email" placeholder="مثال: name@mail.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">رقم الهاتف</label>
            <input placeholder="مثال: 07701234567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">كلمة المرور</label>
            <input type="password" placeholder={edit ? "اتركه فارغاً إذا لم ترد التغيير" : "اكتب كلمة المرور"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" required={!edit} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">الدور</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
              {Object.entries(roleNames).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex gap-2 items-end">
            <button type="submit" className="btn-primary">{edit ? "تحديث" : "إضافة"}</button>
            <button type="button" onClick={resetForm} className="btn-danger">إلغاء</button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-right">
              <th className="py-2 px-2">الاسم</th>
              <th className="py-2 px-2">البريد</th>
              <th className="py-2 px-2">الهاتف</th>
              <th className="py-2 px-2">الدور</th>
              <th className="py-2 px-2">الحالة</th>
              <th className="py-2 px-2">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-2 font-medium">{u.name}</td>
                <td className="py-2 px-2 text-gray-500">{u.email}</td>
                <td className="py-2 px-2">{u.phone || "---"}</td>
                <td className="py-2 px-2">{roleNames[u.role]}</td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${u.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{u.active ? "نشط" : "موقوف"}</span>
                </td>
                <td className="py-2 px-2">
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(u)} className="text-primary-500 hover:underline text-xs">تعديل</button>
                    {u.role !== "admin" && <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800 text-xs">حذف</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
