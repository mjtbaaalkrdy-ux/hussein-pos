import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const statusLabels = { draft: "مسودة", ordered: "تم الطلب", received: "تم الاستلام" };
const statusColors = { draft: "bg-gray-100 text-gray-700", ordered: "bg-blue-100 text-blue-800", received: "bg-green-100 text-green-800" };

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitCost, setUnitCost] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [purRes, prodRes] = await Promise.all([api.get("/purchases"), api.get("/products/all")]);
      setPurchases(purRes.data);
      setProducts(prodRes.data);
    } catch {}
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => {
    setShowForm(false);
    setSupplier("");
    setNotes("");
    setItems([]);
    setProductId("");
    setQuantity(1);
    setUnitCost("");
  };

  const addItem = () => {
    const prod = products.find((p) => p.id === parseInt(productId));
    if (!prod) return alert("اختر سلعة");
    const qty = parseInt(quantity) || 0;
    const cost = parseFloat(unitCost) || prod.costPrice || 0;
    if (qty <= 0) return alert("أدخل كمية صحيحة");
    setItems([...items, { productId: prod.id, productName: prod.name, quantity: qty, unitCost: cost, total: qty * cost }]);
    setProductId("");
    setQuantity(1);
    setUnitCost("");
  };

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const totalAmount = items.reduce((s, i) => s + i.total, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return alert("أضف صنفاً واحداً على الأقل");
    try {
      await api.post("/purchases", { supplier, notes, items: items.map((i) => ({ productId: i.productId, productName: i.productName, quantity: i.quantity, unitCost: i.unitCost })) });
      resetForm();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "خطأ");
    }
  };

  const changeStatus = async (id, status) => {
    await api.put(`/purchases/${id}`, { status });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذه القائمة؟")) return;
    await api.delete(`/purchases/${id}`);
    fetchData();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">قوائم الشراء</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary">{showForm ? "إغلاق" : "قائمة شراء جديدة"}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">المورد</label>
              <input placeholder="اسم المورد" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ملاحظات</label>
              <input placeholder="ملاحظات (اختياري)" value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field" />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-bold text-gray-700">السلع في القائمة</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <select value={productId} onChange={(e) => setProductId(e.target.value)} className="input-field col-span-2">
                <option value="">اختر سلعة...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} (متوفر: {p.piecesStock + p.cartonsStock})</option>)}
              </select>
              <input type="number" min="1" placeholder="الكمية" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="input-field" />
              <input type="number" min="0" step="0.01" placeholder="سعر القطعة" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} className="input-field" />
            </div>
            <div className="flex items-center justify-between">
              <button type="button" onClick={addItem} className="bg-primary-500 text-white px-3 py-1.5 rounded text-sm hover:bg-primary-600">+ إضافة سلعة</button>
              <span className="text-sm font-bold text-primary-700">الإجمالي: {totalAmount.toFixed(2)} د.ع</span>
            </div>

            {items.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-right">
                    <th className="py-1 px-2">السلعة</th>
                    <th className="py-1 px-2">الكمية</th>
                    <th className="py-1 px-2">سعر القطعة</th>
                    <th className="py-1 px-2">الإجمالي</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-1 px-2">{item.productName}</td>
                      <td className="py-1 px-2">{item.quantity}</td>
                      <td className="py-1 px-2">{item.unitCost.toFixed(2)}</td>
                      <td className="py-1 px-2 font-bold">{item.total.toFixed(2)}</td>
                      <td className="py-1 px-2 text-left"><button type="button" onClick={() => removeItem(i)} className="text-red-600 hover:text-red-800 text-sm">&times;</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary">حفظ قائمة الشراء</button>
            <button type="button" onClick={resetForm} className="btn-danger">إلغاء</button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-right">
              <th className="py-2 px-2">#</th>
              <th className="py-2 px-2">المورد</th>
              <th className="py-2 px-2">السلع</th>
              <th className="py-2 px-2">الإجمالي</th>
              <th className="py-2 px-2">الحالة</th>
              <th className="py-2 px-2">التاريخ</th>
              <th className="py-2 px-2">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-2 font-bold text-primary-500">#{p.id}</td>
                <td className="py-2 px-2">{p.supplier || "---"}</td>
                <td className="py-2 px-2">
                  <span className="font-medium">{p.items.length}</span>
                  <div className="text-xs text-gray-400">{p.items.map((i) => i.productName).join("، ")}</div>
                </td>
                <td className="py-2 px-2 font-bold" dir="ltr">{p.items.reduce((s, i) => s + i.total, 0).toFixed(2)} د.ع</td>
                <td className="py-2 px-2">
                  <select value={p.status} onChange={(e) => changeStatus(p.id, e.target.value)} className="text-xs border rounded px-1 py-1">
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
                <td className="py-2 px-2 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString("ar-SA")}</td>
                <td className="py-2 px-2">
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 text-xs">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}