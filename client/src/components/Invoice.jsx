import { forwardRef } from "react";

const statusLabels = {
  pending: "غير مجهز",
  assigned: "قيد التجهيز",
  picked: "جاهز للشحن",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const Invoice = forwardRef(({ order, previousDebt = 0 }, ref) => {
  if (!order) return null;

  const fmt = (v) =>
    Number(v || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const subtotal = order.totalAmount || 0;
  const debt = Number(previousDebt || 0);
  const grand = subtotal + debt;
  const date = new Date(order.createdAt).toLocaleDateString("ar-SA");
  const invoiceNo = `INV-2026-${String(order.id).padStart(4, "0")}`;

  return (
    <div ref={ref} className="bg-white" style={{ direction: "rtl", fontFamily: "Tajawal, sans-serif", width: "277mm", padding: "6mm 8mm" }}>
      <style>{`@page { size: A4 landscape; margin: 8mm; }`}</style>

      {/* ===== الترويسة ===== */}
      <div style={{ display: "flex", alignItems: "flex-start", borderBottom: "3px solid #1e3a5f", paddingBottom: "4mm", marginBottom: "4mm" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "20pt", fontWeight: 800, color: "#1e3a5f", margin: 0, lineHeight: 1.2 }}>متجر حسين - قائمة شراء / فاتورة مبيعات</h1>
          <p style={{ fontSize: "10pt", color: "#666", margin: "2px 0" }}>نظام إدارة المتاجر والمخازن</p>
        </div>
        <img src="/logo.jpeg" alt="شعار" style={{ width: "30mm", height: "30mm", objectFit: "contain", borderRadius: "3mm", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
      </div>

      {/* ===== معلومات الزبون ===== */}
      <div style={{ fontSize: "10.5pt", marginBottom: "4mm", borderBottom: "1px dashed #ccc", paddingBottom: "3mm" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ width: "25%", padding: "1.5mm 0" }}><strong>اسم الزبون:</strong> {order.customerName || "------"}</td>
              <td style={{ width: "25%", padding: "1.5mm 0" }}><strong>تاريخ إنشاء الوصل:</strong> {date}</td>
              <td style={{ width: "25%", padding: "1.5mm 0" }}><strong>رقم الفاتورة:</strong> {invoiceNo}</td>
              <td style={{ width: "25%", padding: "1.5mm 0" }}><strong>حالة الطلب:</strong> {statusLabels[order.status] || order.status}</td>
            </tr>
            <tr>
              <td style={{ padding: "1.5mm 0" }}><strong>رقم الهاتف:</strong> {order.customerPhone || "------"}</td>
              <td style={{ padding: "1.5mm 0" }}><strong>المنشئ:</strong> {order.creator?.name || "------"}</td>
              <td colSpan={2} style={{ padding: "1.5mm 0" }}><strong>موقع / عنوان الزبون:</strong> {order.customerLocation || "------"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ===== جدول الأصناف ===== */}
      <table style={{ width: "100%", fontSize: "9.5pt", borderCollapse: "collapse", marginBottom: "3mm" }}>
        <thead>
          <tr style={{ backgroundColor: "#1e3a5f", color: "white" }}>
            <th style={{ padding: "2mm 1mm", textAlign: "center", width: "5%" }}>ت</th>
            <th style={{ padding: "2mm 1mm", textAlign: "center", width: "14%" }}>الإيتم (الرمز التعريفي)</th>
            <th style={{ padding: "2mm 1mm", textAlign: "right" }}>اسم المنتج</th>
            <th style={{ padding: "2mm 1mm", textAlign: "center", width: "12%" }}>سعر القطعة (د.ع)</th>
            <th style={{ padding: "2mm 1mm", textAlign: "center", width: "9%" }}>عدد القطع</th>
            <th style={{ padding: "2mm 1mm", textAlign: "center", width: "10%" }}>عدد الكراتين</th>
            <th style={{ padding: "2mm 1mm", textAlign: "center", width: "13%" }}>الإجمالي (د.ع)</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, i) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #eee", backgroundColor: i % 2 === 1 ? "#f2f6fa" : "transparent" }}>
              <td style={{ padding: "1.5mm 1mm", textAlign: "center" }}>{i + 1}</td>
              <td style={{ padding: "1.5mm 1mm", textAlign: "center", direction: "ltr" }}>{item.barcode || "-"}</td>
              <td style={{ padding: "1.5mm 1mm", textAlign: "right" }}>{item.productName}</td>
              <td style={{ padding: "1.5mm 1mm", textAlign: "center" }}>{fmt(item.unitPrice)}</td>
              <td style={{ padding: "1.5mm 1mm", textAlign: "center" }}>{item.pieces || "-"}</td>
              <td style={{ padding: "1.5mm 1mm", textAlign: "center" }}>{item.cartons || "-"}</td>
              <td style={{ padding: "1.5mm 1mm", textAlign: "center", fontWeight: 700 }}>{fmt(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ===== مجموعة الطلبية ===== */}
      <div style={{ marginBottom: "3mm" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ textAlign: "left", fontSize: "11pt", fontWeight: 700, color: "#1e3a5f", backgroundColor: "#fdebd0", border: "1px solid #bfbfbf", padding: "2mm" }}>
                مجموعة الطلبية الحالية (Subtotal): {fmt(subtotal)} د.ع
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ===== الملاحظات ===== */}
      <div style={{ fontSize: "9.5pt", marginBottom: "3mm", border: "1px solid #bfbfbf", padding: "2.5mm", borderRadius: "2mm" }}>
        <p style={{ margin: "0 0 1mm 0", fontWeight: 700, color: "#1e3a5f" }}>ملاحظات وتوقيع الإدارة:</p>
        <p style={{ margin: "0.5mm 0" }}>- البضاعة المباعة ترجع أو تستبدل خلال 3 أيام بشرط التغليف الأصلي.</p>
        <p style={{ margin: "0.5mm 0" }}>- يرجى مطابقة عدد الكراتين والقطع عند الاستلام.</p>
      </div>

      {/* ===== الإجماليات النهائية ===== */}
      <table style={{ width: "100%", fontSize: "10.5pt", borderCollapse: "collapse", marginBottom: "4mm" }}>
        <tbody>
          <tr>
            <td style={{ width: "40%", padding: "1.5mm", fontWeight: 700, border: "1px solid #bfbfbf" }}>إجمالي عدد القطع:</td>
            <td style={{ width: "10%", padding: "1.5mm", textAlign: "center", border: "1px solid #bfbfbf" }}>{order.totalPieces}</td>
            <td style={{ width: "40%", padding: "1.5mm", fontWeight: 700, border: "1px solid #bfbfbf" }}>إجمالي عدد الكراتين:</td>
            <td style={{ width: "10%", padding: "1.5mm", textAlign: "center", border: "1px solid #bfbfbf" }}>{order.totalCartons}</td>
          </tr>
          <tr>
            <td style={{ padding: "1.5mm", fontWeight: 700, border: "1px solid #bfbfbf" }}>الدين السابق (إن وجد):</td>
            <td style={{ padding: "1.5mm", textAlign: "center", border: "1px solid #bfbfbf" }}>{debt > 0 ? fmt(debt) : "---"}</td>
            <td style={{ padding: "1.5mm", fontWeight: 700, color: "#c0392b", border: "1px solid #bfbfbf" }}>المبلغ الإجمالي الكلي النهائي:</td>
            <td style={{ padding: "1.5mm", textAlign: "center", fontWeight: 800, color: "#c0392b", border: "1px solid #bfbfbf", backgroundColor: "#fdedec" }}>{fmt(grand)} د.ع</td>
          </tr>
        </tbody>
      </table>

      {/* ===== التوقيعات ===== */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4mm" }}>
        <div style={{ width: "48%" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "11pt", color: "#1e3a5f" }}>توقيع المستلم: ......................</p>
        </div>
        <div style={{ width: "48%" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "11pt", color: "#1e3a5f" }}>توقيع الإدارة: ......................</p>
        </div>
      </div>

      {/* ===== الخاتمة ===== */}
      <div style={{ textAlign: "center", fontSize: "8.5pt", color: "#999", borderTop: "1px dashed #ccc", paddingTop: "2mm" }}>
        <p style={{ margin: "1mm 0", fontWeight: 700, color: "#1e3a5f", fontSize: "10pt" }}>شكراً لتسوقكم مع متجر حسين</p>
        <p style={{ margin: 0 }}>تمت الطباعة: {new Date().toLocaleString("ar-SA")}</p>
      </div>
    </div>
  );
});

Invoice.displayName = "Invoice";
export default Invoice;