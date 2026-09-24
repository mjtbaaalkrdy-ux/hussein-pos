import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export default function Materials() {
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createdId, setCreatedId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, purRes] = await Promise.all([api.get("/products/all"), api.get("/purchases")]);
      setProducts(prodRes.data);
      setPurchases(purRes.data);
    } catch {}
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // السلع الناقصة (المتوفر أقل من الحد الأدنى)
  const lowProducts = products.filter((p) => p.piecesStock + p.cartonsStock < p.minStock);

  const createPurchaseList = async () => {
    if (lowProducts.length === 0) return alert("لا توجد مواد ناقصة حالياً");
    if (!confirm("إنشاء قائمة شراء تحتوي كل المواد الناقصة؟")) return;
    setIsCreating(true);
    try {
      const items = lowProducts.map((p) => ({
        productId: p.id,
        productName: p.name,
        quantity: p.minStock - (p.piecesStock + p.cartonsStock),
        unitCost: p.costPrice || 0,
      }));
      const { data } = await api.post("/purchases", { supplier: "", notes: "مواد مطلوبة تلقائياً", items });
      setCreatedId(data.id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "خطأ");
    }
    setIsCreating(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">المواد المطلوبة</h1>
        <button onClick={createPurchaseList} disabled={isCreating || lowProducts.length === 0} className="btn-primary disabled:opacity-50">
          {isCreating ? "جاري الإنشاء..." : "إنشاء قائمة شراء للمواد الناقصة"}
        </button>
      </div>

      {createdId && (
        <div className="bg-green-100 border border-green-300 text-green-800 p-3 rounded-lg text-sm">
          ✅ تم إنشاء قائمة الشراء رقم #{createdId} — اذهب إلى <a href="#/purchases" className="underline font-bold">قوائم الشراء</a> لإكمالها
        </div>
      )}

      <div className="card overflow-x-auto">
        {lowProducts.length === 0 ? (
          <p className="text-center text-gray-400 py-8">✅ كل المواد متوفرة — لا توجد مادة ناقصة حالياً</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-right">
                <th className="py-2 px-2">السلعة</th>
                <th className="py-2 px-2">المتوفر (قطع + كراتين)</th>
                <th className="py-2 px-2">الحد الأدنى</th>
                <th className="py-2 px-2">الناقص</th>
              </tr>
            </thead>
            <tbody>
              {lowProducts.map((p) => {
                const available = p.piecesStock + p.cartonsStock;
                const shortage = p.minStock - available;
                return (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium">{p.name}</td>
                    <td className="py-2 px-2 text-red-600 font-bold">{available}</td>
                    <td className="py-2 px-2 text-gray-500">{p.minStock}</td>
                    <td className="py-2 px-2 font-bold text-red-700">{shortage}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}