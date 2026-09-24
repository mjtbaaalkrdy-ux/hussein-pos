import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";

const statusLabels = {
  pending: "غير مجهز", assigned: "قيد التجهيز", picked: "جاهز للشحن",
  completed: "مكتمل", cancelled: "ملغي",
};
const statusColors = {
  pending: "bg-yellow-100 text-yellow-800", assigned: "bg-blue-100 text-blue-800",
  picked: "bg-orange-100 text-orange-800", completed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "all";
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const auth = useAuth();

  const tabs = [
    { key: "all", label: "كل الطلبات" },
    { key: "pending", label: "غير مجهز" },
    { key: "assigned", label: "قيد التجهيز" },
    { key: "picked", label: "جاهز للشحن" },
    { key: "completed", label: "مكتمل" },
  ];

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, usersRes] = await Promise.all([api.get("/orders"), api.get("/users")]);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
    } catch {}
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useSocket({
    "order:new": fetchData, "order:assigned": fetchData,
    "order:picked": fetchData, "order:completed": fetchData, "order:cancelled": fetchData,
  });

  const pickers = users.filter((u) => u.role === "picker" && u.active);

  const handleAssign = async (orderId, pickerId) => {
    if (!pickerId) return;
    await api.put(`/orders/${orderId}/assign`, { pickerId: parseInt(pickerId) });
    fetchData();
  };

  const handlePick = async (orderId) => {
    await api.put(`/orders/${orderId}/pick`);
    fetchData();
  };

  const handleApprove = async (orderId) => {
    await api.put(`/orders/${orderId}/approve`);
    fetchData();
  };

  const handleCancel = async (orderId) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الوصل؟")) return;
    await api.put(`/orders/${orderId}/cancel`);
    fetchData();
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search && !o.id.toString().includes(search)) return false;
    return true;
  });

  const groupByDate = (orders) => {
    const groups = {};
    orders.forEach((o) => {
      const d = new Date(o.createdAt).toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "numeric", day: "numeric" });
      if (!groups[d]) groups[d] = [];
      groups[d].push(o);
    });
    return groups;
  };

  const grouped = groupByDate(filteredOrders);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">فواتير البيع</h1>
        <div className="relative">
          <input type="text" placeholder="🔍 ابحث برقم الوصل..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pr-8 w-full md:w-64" />
          {search && <button onClick={() => setSearch("")} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">&times;</button>}
        </div>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setSearchParams(t.key === "all" ? {} : { status: t.key })} className={`px-4 py-2 rounded-md text-sm font-medium transition ${statusFilter === t.key ? "bg-white text-primary-500 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="card space-y-6">
        {Object.entries(grouped).length === 0 ? (
          <p className="text-center text-gray-400 py-8">لا توجد طلبات في هذا القسم</p>
        ) : (
          Object.entries(grouped).map(([date, dateOrders]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold text-gray-500">📅 {date}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="space-y-2">
                {dateOrders.map((o) => (
                  <div key={o.id} className="flex items-center gap-2 bg-gray-50 hover:bg-blue-50 rounded-lg p-3 transition cursor-pointer border border-gray-100" onClick={() => setSelectedOrder(o)}>
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                      <span className="font-bold text-primary-500">#{o.id}</span>
                      <span className="truncate">{o.customerName || "---"}</span>
                      <span className="font-bold" dir="ltr">{Number(o.totalAmount || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ع</span>
                      <span><span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[o.status]}`}>{statusLabels[o.status]}</span></span>
                      <span className="text-gray-400 text-xs">{o.creator?.name || ""}</span>
                    </div>
                    <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {o.status === "pending" && auth.canAssignPicker && (
                        <select onChange={(e) => handleAssign(o.id, e.target.value)} className="text-xs border rounded px-1 py-1" defaultValue="" onClick={(e) => e.stopPropagation()}>
                          <option value="" disabled>اختر مجهز</option>
                          {pickers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      )}
                      {o.status === "assigned" && auth.isPicker && o.pickerId === auth.user?.id && (
                        <button onClick={() => handlePick(o.id)} className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700">تم التجميع</button>
                      )}
                      {o.status === "picked" && auth.canApproveOrder && (
                        <button onClick={() => handleApprove(o.id)} className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700">تأكيد</button>
                      )}
                      {(o.status === "pending" || o.status === "assigned") && auth.isAdmin && (
                        <button onClick={() => handleCancel(o.id)} className="text-red-600 hover:text-red-800 text-xs px-2 py-1">إلغاء</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">تفاصيل الوصل #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              <div className="flex items-start border-b-2 border-primary-500 pb-3 mb-3">
                <img src="/logo.jpeg" alt="شعار" className="w-20 h-20 rounded-xl object-contain ml-3 shadow-sm" />
                <div>
                  <h3 className="text-xl font-bold text-primary-500">متجر حسين</h3>
                  <p className="text-xs text-gray-500">نظام إدارة المتاجر والمخازن</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div><span className="font-medium">الزبون:</span> {selectedOrder.customerName || "---"}</div>
                <div><span className="font-medium">الهاتف:</span> {selectedOrder.customerPhone || "---"}</div>
                <div><span className="font-medium">الموقع:</span> {selectedOrder.customerLocation || "---"}</div>
                <div><span className="font-medium">التاريخ:</span> {new Date(selectedOrder.createdAt).toLocaleDateString("ar-SA")}</div>
                <div><span className="font-medium">الحالة:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[selectedOrder.status]}`}>{statusLabels[selectedOrder.status]}</span></div>
                <div><span className="font-medium">رقم التسلسل:</span> #{selectedOrder.id}</div>
                <div><span className="font-medium">المُنشئ:</span> {selectedOrder.creator?.name || "---"}</div>
                <div><span className="font-medium">المُجهز:</span> {selectedOrder.picker?.name || "---"}</div>
              </div>

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-primary-500 text-white">
                    <th className="py-2 px-2 text-center">ت</th>
                    <th className="py-2 px-2 text-right">المنتج</th>
                    <th className="py-2 px-2 text-center">الإيتم</th>
                    <th className="py-2 px-2 text-center">قطع</th>
                    <th className="py-2 px-2 text-center">كرتون</th>
                    <th className="py-2 px-2 text-center">سعر القطعة</th>
                    <th className="py-2 px-2 text-center">المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, i) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-2 px-2 text-center">{i + 1}</td>
                      <td className="py-2 px-2">{item.productName}</td>
                      <td className="py-2 px-2 text-center" dir="ltr">{item.barcode || "-"}</td>
                      <td className="py-2 px-2 text-center">{item.pieces}</td>
                      <td className="py-2 px-2 text-center">{item.cartons}</td>
                      <td className="py-2 px-2 text-center" dir="ltr">{Number(item.unitPrice || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2 px-2 text-center font-bold" dir="ltr">{Number(item.total || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-primary-500 font-bold text-base">
                    <td colSpan={2} className="py-2 px-2">الإجمالي</td>
                    <td className="py-2 px-2 text-center">{selectedOrder.totalPieces}</td>
                    <td className="py-2 px-2 text-center">{selectedOrder.totalCartons}</td>
                    <td></td>
                    <td className="py-2 px-2 text-center text-primary-500" dir="ltr">{Number(selectedOrder.totalAmount || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ع</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
