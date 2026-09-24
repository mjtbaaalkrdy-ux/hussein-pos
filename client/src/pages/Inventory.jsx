import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [edit, setEdit] = useState(null);
  const auth = useAuth();
  const [form, setForm] = useState({ name: "", barcode: "", costPrice: "", sellPrice: "", piecesStock: "0", cartonsStock: "0", minStock: "0", warehouse: "رئيسي", section: "" });

  const fetchProducts = useCallback(async () => {
    const { data } = await api.get(auth.canViewCostPrice ? "/products/all" : "/products");
    setProducts(data);
  }, [auth.canViewCostPrice]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const resetForm = () => {
    setForm({ name: "", barcode: "", costPrice: "", sellPrice: "", piecesStock: "0", cartonsStock: "0", minStock: "0", warehouse: "رئيسي", section: "" });
    setEdit(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, costPrice: parseFloat(form.costPrice) || 0, sellPrice: parseFloat(form.sellPrice) || 0, piecesStock: parseInt(form.piecesStock) || 0, cartonsStock: parseInt(form.cartonsStock) || 0, minStock: parseInt(form.minStock) || 0 };
    if (edit) { await api.put(`/products/${edit.id}`, data); } else { await api.post("/products", data); }
    resetForm();
    fetchProducts();
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, barcode: p.barcode, costPrice: p.costPrice, sellPrice: p.sellPrice, piecesStock: p.piecesStock, cartonsStock: p.cartonsStock, minStock: p.minStock, warehouse: p.warehouse, section: p.section });
    setEdit(p);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد؟")) return;
    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  // حساب إجمالي القطع (قطع + كراتين × عدد القطع في الكرتون تقديرياً = نفسها للعرض)
  const totalStock = (p) => p.piecesStock + p.cartonsStock * 10;
  const isLow = (p) => p.piecesStock + p.cartonsStock < p.minStock;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">جرد المستودع</h1>
        {auth.canManageProducts && <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary">{showForm ? "إغلاق" : "إضافة سلعة"}</button>}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">اسم السلعة</label>
            <input placeholder="اسم السلعة" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">الباركود</label>
            <input placeholder="الباركود" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="input-field" />
          </div>
          {auth.canViewCostPrice && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">سعر التكلفة</label>
              <input type="number" step="0.01" placeholder="سعر التكلفة" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} className="input-field" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">سعر البيع</label>
            <input type="number" step="0.01" placeholder="سعر البيع" value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">عدد القطع</label>
            <input type="number" placeholder="عدد القطع" value={form.piecesStock} onChange={(e) => setForm({ ...form, piecesStock: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">عدد الكراتين</label>
            <input type="number" placeholder="عدد الكراتين" value={form.cartonsStock} onChange={(e) => setForm({ ...form, cartonsStock: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">الحد الأدنى (تنبيه النقص)</label>
            <input type="number" placeholder="الحد الأدنى" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">المخزن</label>
            <input placeholder="المخزن" value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">الموقع (الرف)</label>
            <input placeholder="الموقع (الرف)" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="input-field" />
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
              <th className="py-2 px-2">السلعة</th>
              <th className="py-2 px-2">الباركود</th>
              {auth.canViewCostPrice && <th className="py-2 px-2">سعر التكلفة</th>}
              <th className="py-2 px-2">سعر البيع</th>
              <th className="py-2 px-2">قطع</th>
              <th className="py-2 px-2">كراتين</th>
              <th className="py-2 px-2">الحد الأدنى</th>
              <th className="py-2 px-2">الحالة</th>
              <th className="py-2 px-2">المخزن</th>
              <th className="py-2 px-2">الموقع</th>
              {auth.canManageProducts && <th className="py-2 px-2">إجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-2 font-medium">{p.name}</td>
                <td className="py-2 px-2 text-gray-500">{p.barcode || "---"}</td>
                {auth.canViewCostPrice && <td className="py-2 px-2 text-red-600">{p.costPrice?.toFixed(2)}</td>}
                <td className="py-2 px-2 text-green-600">{p.sellPrice?.toFixed(2)}</td>
                <td className="py-2 px-2">{p.piecesStock}</td>
                <td className="py-2 px-2">{p.cartonsStock}</td>
                <td className="py-2 px-2 text-gray-500">{p.minStock}</td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${isLow(p) ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                    {isLow(p) ? "ناقص" : "متوفر"}
                  </span>
                </td>
                <td className="py-2 px-2">{p.warehouse}</td>
                <td className="py-2 px-2">{p.section || "---"}</td>
                {auth.canManageProducts && (
                  <td className="py-2 px-2">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(p)} className="text-primary-500 hover:underline text-xs">تعديل</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 text-xs">حذف</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}