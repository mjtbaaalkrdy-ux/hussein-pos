import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";

export default function Debts() {
  const [debts, setDebts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const auth = useAuth();
  const [form, setForm] = useState({ type: "customer", name: "", phone: "", amount: "", paid: "0", notes: "" });

  const fetchDebts = useCallback(async () => {
    const { data } = await api.get("/debts");
    setDebts(data);
  }, []);

  useEffect(() => { fetchDebts(); }, [fetchDebts]);

  const resetForm = () => {
    setForm({ type: "customer", name: "", phone: "", amount: "", paid: "0", notes: "" });
    setEdit(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, amount: parseFloat(form.amount) || 0, paid: parseFloat(form.paid) || 0 };
    if (edit) { await api.put(`/debts/${edit.id}`, data); } else { await api.post("/debts", data); }
    resetForm();
    fetchDebts();
  };

  const handleEdit = (d) => {
    setForm({ type: d.type, name: d.name, phone: d.phone, amount: d.amount, paid: d.paid, notes: d.notes });
    setEdit(d);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد؟")) return;
    await api.delete(`/debts/${id}`);
    fetchDebts();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">الديون</h1>
        {auth.isAdmin && <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary">{showForm ? "إغلاق" : "إضافة دين"}</button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
              <option value="customer">دين على الزبون</option>
              <option value="supplier">دين على المحل (مورد)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
            <input placeholder="أدخل الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
            <input placeholder="أدخل رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (ر.س)</label>
            <input type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المدفوع (ر.س)</label>
            <input type="number" step="0.01" placeholder="0.00" value={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <input placeholder="أدخل ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-2 items-end md:col-span-3">
            <button type="submit" className="btn-primary">{edit ? "تحديث" : "إضافة"}</button>
            <button type="button" onClick={resetForm} className="btn-danger">إلغاء</button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-right">
              <th className="py-2 px-2">النوع</th>
              <th className="py-2 px-2">الاسم</th>
              <th className="py-2 px-2">الهاتف</th>
              <th className="py-2 px-2">المبلغ</th>
              <th className="py-2 px-2">المدفوع</th>
              <th className="py-2 px-2">المتبقي</th>
              <th className="py-2 px-2">ملاحظات</th>
              {auth.isAdmin && <th className="py-2 px-2">إجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {debts.map((d) => (
              <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${d.type === "customer" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                    {d.type === "customer" ? "على الزبون" : "على المحل"}
                  </span>
                </td>
                <td className="py-2 px-2 font-medium">{d.name}</td>
                <td className="py-2 px-2">{d.phone || "---"}</td>
                <td className="py-2 px-2" dir="ltr">{Number(d.amount || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س</td>
                <td className="py-2 px-2 text-green-600" dir="ltr">{Number(d.paid || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س</td>
                <td className="py-2 px-2 font-bold text-red-600" dir="ltr">{Number(d.amount - d.paid || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س</td>
                <td className="py-2 px-2 text-gray-500">{d.notes || "---"}</td>
                {auth.isAdmin && (
                  <td className="py-2 px-2">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(d)} className="text-primary-500 hover:underline text-xs">تعديل</button>
                      <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:text-red-800 text-xs">حذف</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {debts.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-gray-400">لا توجد ديون</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
