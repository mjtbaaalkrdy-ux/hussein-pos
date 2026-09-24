import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";
import Invoice from "../components/Invoice";
import { useReactToPrint } from "react-to-print";

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerLocation, setCustomerLocation] = useState("");
  const [debts, setDebts] = useState([]);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [lastDebt, setLastDebt] = useState(0);
  const invoiceRef = useRef();
  const navigate = useNavigate();
  const auth = useAuth();

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch {}
  }, []);

  const fetchDebts = useCallback(async () => {
    try {
      const { data } = await api.get("/debts");
      setDebts(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  useEffect(() => { fetchProducts(); fetchDebts(); }, [fetchProducts, fetchDebts]);

  // الديون السابقة للزبون الحالي (بنفس رقم الهاتف)
  const previousDebt = customerPhone
    ? debts.filter((d) => d.phone && d.phone.replace(/\s/g, "") === customerPhone.replace(/\s/g, "")).reduce((s, d) => s + (d.amount - d.paid), 0)
    : 0;

  const filteredProducts = products.filter((p) =>
    p.name.includes(search) || p.barcode.includes(search)
  );

  const addToCart = (product) => {
    if (cart.length >= 20) return alert("الحد الأقصى 20 صنفاً في الوصل");
    const existing = cart.find((c) => c.productId === product.id);
    if (existing) {
      setCart(cart.map((c) => c.productId === product.id ? { ...c, pieces: c.pieces + 1 } : c));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        barcode: product.barcode || "",
        unitPrice: product.sellPrice,
        pieces: 1,
        cartons: 0,
        total: product.sellPrice,
      }]);
    }
  };

  const updateCartItem = (index, field, value) => {
    const newCart = [...cart];
    newCart[index][field] = parseInt(value) || 0;
    newCart[index].total = (newCart[index].pieces + newCart[index].cartons) * newCart[index].unitPrice;
    setCart(newCart);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const totalPieces = cart.reduce((s, c) => s + c.pieces, 0);
  const totalCartons = cart.reduce((s, c) => s + c.cartons, 0);
  const totalAmount = cart.reduce((s, c) => s + c.total, 0);

  const submitOrder = async () => {
    if (cart.length === 0) return alert("أضف منتجات للوصل");
    setSubmitting(true);
    try {
      const { data } = await api.post("/orders", {
        customerName, customerPhone, customerLocation,
        items: cart.map((c) => ({ productId: c.productId, pieces: c.pieces, cartons: c.cartons })),
      });
      setLastOrder(data);
      setLastDebt(previousDebt);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerLocation("");
    } catch (err) {
      alert(err.response?.data?.message || "خطأ في إرسال الطلب");
    }
    setSubmitting(false);
  };

  const handlePrint = useReactToPrint({ contentRef: invoiceRef, documentTitle: `وصل_${lastOrder?.id}` });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">نقطة البيع (الكاشير)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-gray-700">المنتجات</h2>
          <input type="text" placeholder="بحث عن منتج..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {filteredProducts.map((p) => (
              <button key={p.id} onClick={() => addToCart(p)} className="bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-lg p-2 text-right transition text-sm">
                <p className="font-bold text-primary-700 truncate">{p.name}</p>
                <p className="text-primary-500">{p.sellPrice?.toFixed(2)} د.ع</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-lg font-bold text-gray-700">الوصل</h2>

          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="اسم الزبون" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input-field" />
            <input type="text" placeholder="رقم الهاتف" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="input-field" />
          </div>
          <input type="text" placeholder="موقع الزبون (المحافظة / المنطقة)" value={customerLocation} onChange={(e) => setCustomerLocation(e.target.value)} className="input-field" />
          {previousDebt > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-2 flex items-center justify-between">
              <span>دين سابق لهذا الزبون:</span>
              <span className="font-bold" dir="ltr">{Number(previousDebt).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ع</span>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto space-y-2">
            {cart.map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg text-sm">
                <button onClick={() => removeFromCart(i)} className="text-red-500 hover:text-red-700 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex-1 min-w-0">
                  <span className="font-medium block truncate">{item.productName}</span>
                  <span className="text-xs text-gray-500" dir="ltr">الإيتم: {item.barcode || "---"}</span>
                </div>
                <input type="number" min="0" value={item.pieces} onChange={(e) => updateCartItem(i, "pieces", e.target.value)} className="w-14 border border-gray-300 rounded px-1 py-0.5 text-center" title="قطع" />
                <input type="number" min="0" value={item.cartons} onChange={(e) => updateCartItem(i, "cartons", e.target.value)} className="w-14 border border-gray-300 rounded px-1 py-0.5 text-center" title="كراتين" />
                <span className="w-16 text-left font-bold">{item.total?.toFixed(2)}</span>
              </div>
            ))}
            {cart.length === 0 && <p className="text-gray-400 text-center py-4">لم يتم إضافة منتجات بعد</p>}
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>إجمالي القطع:</span><span>{totalPieces}</span></div>
            <div className="flex justify-between"><span>إجمالي الكراتين:</span><span>{totalCartons}</span></div>
            {previousDebt > 0 && (
              <div className="flex justify-between text-red-600"><span>الدين السابق:</span><span dir="ltr">{Number(previousDebt).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ع</span></div>
            )}
            <div className="flex justify-between text-lg font-bold text-primary-500"><span>المجموع الكلي:</span><span>{totalAmount.toFixed(2)} د.ع</span></div>
          </div>

          <div className="flex gap-3">
            <button onClick={submitOrder} disabled={submitting || cart.length === 0} className="btn-primary flex-1 py-3 text-lg">
              {submitting ? "...جاري الإرسال" : "إرسال الوصل"}
            </button>
          </div>
        </div>
      </div>

      {lastOrder && (
        <div className="card text-center">
          <h2 className="text-lg font-bold text-green-600 mb-3">✓ تم إرسال الوصل رقم #{lastOrder.id}</h2>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { handlePrint(); }} className="btn-primary">طباعة الوصل</button>
            <button onClick={() => setLastOrder(null)} className="btn-success">وصل جديد</button>
          </div>
          <div className="hidden"><Invoice ref={invoiceRef} order={lastOrder} previousDebt={lastDebt} /></div>
        </div>
      )}
    </div>
  );
}
