import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";

export default function Dashboard() {
  const [stats, setStats] = useState({ orders: 0, products: 0, debtTotal: 0, recentOrders: [], sales: { daily: { amount: 0, count: 0 }, weekly: { amount: 0, count: 0 }, monthly: { amount: 0, count: 0 }, yearly: { amount: 0, count: 0 } } });
  const [modal, setModal] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [debtsModal, setDebtsModal] = useState(null);
  const auth = useAuth();
  const user = auth.user;

  const openDetails = async (period, label) => {
    try {
      const { data } = await api.get(`/orders/stats?period=${period}`);
      setModal({ label, amount: data.amount, count: data.count, orders: data.orders });
    } catch {}
  };

  const openDebts = async () => {
    try {
      const { data } = await api.get("/debts");
      setDebtsModal(data);
    } catch {}
  };

  const deleteDebt = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الدين؟")) return;
    try {
      await api.delete(`/debts/${id}`);
      const { data } = await api.get("/debts");
      setDebtsModal(data);
      fetchStats();
    } catch {}
  };

  const fetchStats = useCallback(async () => {
    try {
      const [ordersRes, productsRes, debtsRes, salesRes] = await Promise.all([
        api.get("/orders"),
        api.get("/products"),
        api.get("/debts"),
        (auth.isAdmin || auth.isAccountant) ? api.get("/orders/stats") : Promise.resolve({ data: null }),
      ]);
      const orders = ordersRes.data;
      const stats = {
        orders: orders.length,
        totalAmount: orders.reduce((s, o) => s + o.totalAmount, 0),
        products: productsRes.data.length,
        debtTotal: debtsRes.data.reduce((s, d) => s + (d.amount - d.paid), 0),
        recentOrders: orders.slice(0, 5),
        sales: salesRes?.data || { daily: { amount: 0, count: 0 }, weekly: { amount: 0, count: 0 }, monthly: { amount: 0, count: 0 }, yearly: { amount: 0, count: 0 } },
      };
      setStats(stats);
    } catch {}
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useSocket({
    "order:new": fetchStats,
    "order:assigned": fetchStats,
    "order:picked": fetchStats,
    "order:completed": fetchStats,
    "order:cancelled": fetchStats,
  });

  const roleColors = {
    admin: "bg-purple-600", assistant: "bg-purple-500",
    accountant: "bg-blue-600", supervisor: "bg-green-600", picker: "bg-orange-500",
  };

  const statusLabels = {
    pending: "قيد الانتظار", assigned: "قيد التجهيز", picked: "تم التجميع", completed: "مكتمل", cancelled: "ملغي",
  };
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800", assigned: "bg-blue-100 text-blue-800",
    picked: "bg-orange-100 text-orange-800", completed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${roleColors[user?.role] || "bg-gray-500"}`} />
        <h1 className="text-2xl font-bold text-gray-800">مرحباً، {user?.name}</h1>
      </div>

      {(auth.isAdmin || auth.isAccountant) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => openDetails("daily", "مبيعات اليوم")} className="card text-center border-r-4 border-r-blue-500 hover:shadow-md transition cursor-pointer text-right">
            <p className="text-gray-500 text-xs">مبيعات اليوم</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.sales.daily.amount.toFixed(2)}</p>
            <p className="text-xs text-gray-400">{stats.sales.daily.count} طلب</p>
          </button>
          <button onClick={() => openDetails("weekly", "مبيعات الأسبوع")} className="card text-center border-r-4 border-r-green-500 hover:shadow-md transition cursor-pointer text-right">
            <p className="text-gray-500 text-xs">مبيعات الأسبوع</p>
            <p className="text-xl md:text-2xl font-bold text-green-600">{stats.sales.weekly.amount.toFixed(2)}</p>
            <p className="text-xs text-gray-400">{stats.sales.weekly.count} طلب</p>
          </button>
          <button onClick={() => openDetails("monthly", "مبيعات الشهر")} className="card text-center border-r-4 border-r-orange-500 hover:shadow-md transition cursor-pointer text-right">
            <p className="text-gray-500 text-xs">مبيعات الشهر</p>
            <p className="text-xl md:text-2xl font-bold text-orange-600">{stats.sales.monthly.amount.toFixed(2)}</p>
            <p className="text-xs text-gray-400">{stats.sales.monthly.count} طلب</p>
          </button>
          <button onClick={() => openDetails("yearly", "مبيعات السنة")} className="card text-center border-r-4 border-r-purple-500 hover:shadow-md transition cursor-pointer text-right">
            <p className="text-gray-500 text-xs">مبيعات السنة</p>
            <p className="text-xl md:text-2xl font-bold text-purple-600">{stats.sales.yearly.amount.toFixed(2)}</p>
            <p className="text-xs text-gray-400">{stats.sales.yearly.count} طلب</p>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-gray-500 text-sm">إجمالي الطلبات</p>
          <p className="text-3xl font-bold text-primary-500">{stats.orders}</p>
        </div>
        <div className="card text-center">
          <p className="text-gray-500 text-sm">المنتجات</p>
          <p className="text-3xl font-bold text-green-600">{stats.products}</p>
        </div>
        {(auth.isAdmin || auth.isAccountant) && (
          <button onClick={openDebts} className="card text-center hover:shadow-md transition cursor-pointer text-right">
            <p className="text-gray-500 text-sm">إجمالي الديون</p>
            <p className="text-3xl font-bold text-red-600" dir="ltr">{Number(stats.debtTotal || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س</p>
          </button>
        )}
      </div>

      {(auth.isAdmin || auth.isAccountant) && stats.recentOrders.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-700 mb-4">آخر الطلبات</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-right">
                  <th className="py-2 px-2">#</th>
                  <th className="py-2 px-2">الزبون</th>
                  <th className="py-2 px-2">المبلغ</th>
                  <th className="py-2 px-2">الحالة</th>
                  <th className="py-2 px-2">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2">{o.id}</td>
                    <td className="py-2 px-2">{o.customerName || "---"}</td>
                    <td className="py-2 px-2">{o.totalAmount?.toFixed(2)}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[o.status]}`}>
                        {statusLabels[o.status]}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-500">{new Date(o.createdAt).toLocaleDateString("ar-SA")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {debtsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDebtsModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">الديون</h2>
              <button onClick={() => setDebtsModal(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              {debtsModal.length === 0 ? (
                <p className="text-center text-gray-400 py-8">لا توجد ديون</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-right">
                      <th className="py-2 px-2">النوع</th>
                      <th className="py-2 px-2">الاسم</th>
                      <th className="py-2 px-2">الهاتف</th>
                      <th className="py-2 px-2">المبلغ</th>
                      <th className="py-2 px-2">المدفوع</th>
                      <th className="py-2 px-2">المتبقي</th>
                      {auth.isAdmin && <th className="py-2 px-2">حذف</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {debtsModal.map((d) => (
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
                        {auth.isAdmin && (
                          <td className="py-2 px-2">
                            <button onClick={() => deleteDebt(d.id)} className="text-red-600 hover:text-red-800 text-lg">&times;</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setModal(null); setSelectedOrder(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              {selectedOrder ? (
                <button onClick={() => setSelectedOrder(null)} className="text-primary-500 hover:text-primary-700 font-medium text-sm">&rarr; رجوع للقائمة</button>
              ) : (
                <h2 className="text-lg font-bold text-gray-800">{modal.label} - <span className="text-primary-500">{modal.amount.toFixed(2)} ر.س</span> ({modal.count} طلب)</h2>
              )}
              <button onClick={() => { setModal(null); setSelectedOrder(null); }} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              {selectedOrder ? (
                <div className="space-y-4">
                  <div className="flex items-start border-b-2 border-primary-500 pb-3 mb-2">
                    <img src="/logo.jpeg" alt="شعار" className="w-24 h-24 rounded-xl object-contain ml-4 shadow-sm" />
                    <div>
                      <h3 className="text-lg font-bold text-primary-500">متجر حسين</h3>
                      <p className="text-xs text-gray-500">نظام إدارة المتاجر والمخازن</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="font-medium">الزبون:</span> {selectedOrder.customerName || "---"}</div>
                    <div><span className="font-medium">الهاتف:</span> {selectedOrder.customerPhone || "---"}</div>
                    <div><span className="font-medium">التاريخ:</span> {new Date(selectedOrder.createdAt).toLocaleDateString("ar-SA")}</div>
                    <div><span className="font-medium">رقم التسلسل:</span> #{selectedOrder.id}</div>
                    <div><span className="font-medium">الحالة:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[selectedOrder.status]}`}>{statusLabels[selectedOrder.status]}</span></div>
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-right bg-gray-50">
                        <th className="py-2 px-2">ت</th>
                        <th className="py-2 px-2">المنتج</th>
                        <th className="py-2 px-2 text-center">قطع</th>
                        <th className="py-2 px-2 text-center">كرتون</th>
                        <th className="py-2 px-2 text-center">سعر القطعة</th>
                        <th className="py-2 px-2 text-center">المجموع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, i) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-2 px-2">{i + 1}</td>
                          <td className="py-2 px-2 font-medium">{item.productName}</td>
                          <td className="py-2 px-2 text-center">{item.pieces}</td>
                          <td className="py-2 px-2 text-center">{item.cartons}</td>
                          <td className="py-2 px-2 text-center">{item.unitPrice?.toFixed(2)}</td>
                          <td className="py-2 px-2 text-center font-bold">{item.total?.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300 font-bold text-base">
                        <td colSpan={2} className="py-2 px-2">الإجمالي</td>
                        <td className="py-2 px-2 text-center">{selectedOrder.totalPieces}</td>
                        <td className="py-2 px-2 text-center">{selectedOrder.totalCartons}</td>
                        <td></td>
                        <td className="py-2 px-2 text-center text-primary-500">{selectedOrder.totalAmount?.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                modal.orders?.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">لا توجد طلبات في هذه الفترة</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-right">
                        <th className="py-2 px-2">#</th>
                        <th className="py-2 px-2">الزبون</th>
                        <th className="py-2 px-2">قطع</th>
                        <th className="py-2 px-2">كرتون</th>
                        <th className="py-2 px-2">المبلغ</th>
                        <th className="py-2 px-2">الحالة</th>
                        <th className="py-2 px-2">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modal.orders.map((o) => (
                        <tr key={o.id} onClick={() => setSelectedOrder(o)} className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition">
                          <td className="py-2 px-2">{o.id}</td>
                          <td className="py-2 px-2">{o.customerName || "---"}</td>
                          <td className="py-2 px-2">{o.totalPieces}</td>
                          <td className="py-2 px-2">{o.totalCartons}</td>
                          <td className="py-2 px-2 font-bold">{o.totalAmount?.toFixed(2)}</td>
                          <td className="py-2 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[o.status]}`}>{statusLabels[o.status]}</span>
                          </td>
                          <td className="py-2 px-2 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString("ar-SA")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
