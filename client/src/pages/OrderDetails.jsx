import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Invoice from "../components/Invoice";
import { useReactToPrint } from "react-to-print";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const invoiceRef = useRef();

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data)).catch(() => {});
  }, [id]);

  const handlePrint = useReactToPrint({ contentRef: invoiceRef, documentTitle: `وصل_${id}` });

  if (!order) return <p className="text-center py-8 text-gray-500">جاري التحميل...</p>;

  const statusLabels = { pending: "قيد الانتظار", assigned: "قيد التجهيز", picked: "تم التجميع", completed: "مكتمل", cancelled: "ملغي" };
  const statusColors = { pending: "bg-yellow-100 text-yellow-800", assigned: "bg-blue-100 text-blue-800", picked: "bg-orange-100 text-orange-800", completed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800" };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/orders" className="text-primary-500 hover:underline">&larr; العودة للطلبات</Link>
        <h1 className="text-2xl font-bold text-gray-800">تفاصيل الوصل #{order.id}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card space-y-2">
          <h2 className="text-lg font-bold text-gray-700">معلومات الزبون</h2>
          <p><span className="font-medium">الاسم:</span> {order.customerName || "---"}</p>
          <p><span className="font-medium">الهاتف:</span> {order.customerPhone || "---"}</p>
          <p><span className="font-medium">التاريخ:</span> {new Date(order.createdAt).toLocaleString("ar-SA")}</p>
        </div>
        <div className="card space-y-2">
          <h2 className="text-lg font-bold text-gray-700">معلومات الطلب</h2>
          <p><span className="font-medium">الحالة:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[order.status]}`}>{statusLabels[order.status]}</span></p>
          <p><span className="font-medium">المُنشئ:</span> {order.creator?.name || "---"}</p>
          <p><span className="font-medium">المُجهز:</span> {order.picker?.name || "لم يُحدد بعد"}</p>
          <button onClick={handlePrint} className="btn-primary mt-2">طباعة الوصل</button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-right">
              <th className="py-2 px-2">ت</th>
              <th className="py-2 px-2">المنتج</th>
              <th className="py-2 px-2">القطع</th>
              <th className="py-2 px-2">الكراتين</th>
              <th className="py-2 px-2">سعر القطعة</th>
              <th className="py-2 px-2 text-left">المجموع</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, i) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-2 px-2">{i + 1}</td>
                <td className="py-2 px-2 font-medium">{item.productName}</td>
                <td className="py-2 px-2">{item.pieces}</td>
                <td className="py-2 px-2">{item.cartons}</td>
                <td className="py-2 px-2">{item.unitPrice?.toFixed(2)}</td>
                <td className="py-2 px-2 text-left font-bold">{item.total?.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300 font-bold text-lg">
              <td colSpan={2} className="py-2 px-2">المجموع الكلي</td>
              <td className="py-2 px-2">{order.totalPieces}</td>
              <td className="py-2 px-2">{order.totalCartons}</td>
              <td></td>
              <td className="py-2 px-2 text-left text-primary-500">{order.totalAmount?.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="hidden"><Invoice ref={invoiceRef} order={order} /></div>
    </div>
  );
}
