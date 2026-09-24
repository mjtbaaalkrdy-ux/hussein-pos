import { forwardRef } from "react";

const Invoice = forwardRef(({ order, previousDebt = 0 }, ref) => {
  if (!order) return null;
  return (
    <div ref={ref} className="bg-white" style={{ direction: "rtl", fontFamily: "Tajawal, sans-serif", width: "80mm", padding: "4mm 5mm" }}>
      <div style={{ display: "flex", alignItems: "flex-start", borderBottom: "2px solid #1e3a5f", paddingBottom: "4mm", marginBottom: "3mm" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "18pt", fontWeight: 800, color: "#1e3a5f", margin: 0, lineHeight: 1.2 }}>متجر حسين</h1>
          <p style={{ fontSize: "8pt", color: "#666", margin: "2px 0" }}>نظام إدارة المتاجر والمخازن</p>
        </div>
        <img src="/logo.jpeg" alt="شعار" style={{ width: "28mm", height: "28mm", objectFit: "contain", borderRadius: "3mm", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
      </div>

      <div style={{ fontSize: "8pt", marginBottom: "3mm", borderBottom: "1px dashed #ccc", paddingBottom: "2mm" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr><td style={{ width: "50%", padding: "1mm 0" }}><strong>الزبون:</strong> {order.customerName || "------"}</td><td style={{ width: "50%", padding: "1mm 0", textAlign: "left" }}><strong>رقم التسلسل:</strong> #{order.id}</td></tr>
            <tr><td style={{ padding: "1mm 0" }}><strong>الهاتف:</strong> {order.customerPhone || "------"}</td><td style={{ padding: "1mm 0", textAlign: "left" }}><strong>التاريخ:</strong> {new Date(order.createdAt).toLocaleDateString("ar-SA")}</td></tr>
            <tr><td style={{ padding: "1mm 0" }}><strong>الموقع:</strong> {order.customerLocation || "------"}</td><td style={{ padding: "1mm 0", textAlign: "left" }}><strong>المنشئ:</strong> {order.creator?.name || "------"}</td></tr>
          </tbody>
        </table>
      </div>

      <table style={{ width: "100%", fontSize: "7.5pt", borderCollapse: "collapse", marginBottom: "3mm" }}>
        <thead>
          <tr style={{ backgroundColor: "#1e3a5f", color: "white" }}>
            <th style={{ padding: "1.5mm 1mm", textAlign: "center", width: "7%" }}>ت</th>
            <th style={{ padding: "1.5mm 1mm", textAlign: "right" }}>المنتج</th>
            <th style={{ padding: "1.5mm 1mm", textAlign: "center", width: "12%" }}>الإيتم</th>
            <th style={{ padding: "1.5mm 1mm", textAlign: "center", width: "8%" }}>قطع</th>
            <th style={{ padding: "1.5mm 1mm", textAlign: "center", width: "9%" }}>كرتون</th>
            <th style={{ padding: "1.5mm 1mm", textAlign: "center", width: "12%" }}>سعر القطعة</th>
            <th style={{ padding: "1.5mm 1mm", textAlign: "center", width: "14%" }}>المجموع</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item, i) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "1mm", textAlign: "center" }}>{i + 1}</td>
              <td style={{ padding: "1mm", textAlign: "right" }}>{item.productName}</td>
              <td style={{ padding: "1mm", textAlign: "center", direction: "ltr" }}>{item.barcode || "-"}</td>
              <td style={{ padding: "1mm", textAlign: "center" }}>{item.pieces || "-"}</td>
              <td style={{ padding: "1mm", textAlign: "center" }}>{item.cartons || "-"}</td>
              <td style={{ padding: "1mm", textAlign: "center" }}>{item.unitPrice?.toFixed(2)}</td>
              <td style={{ padding: "1mm", textAlign: "center", fontWeight: 700 }}>{item.total?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: "2px solid #1e3a5f", paddingTop: "2mm", marginBottom: "3mm" }}>
        <table style={{ width: "100%", fontSize: "9pt", fontWeight: 700 }}>
          <tbody>
            <tr>
              <td style={{ textAlign: "center", color: "#1e3a5f" }}>
                مجموع القطع: {order.totalPieces} | مجموع الكرتون: {order.totalCartons}
              </td>
            </tr>
            <tr>
              <td style={{ textAlign: "left", fontSize: "11pt", color: "#1e3a5f", paddingTop: "1mm" }}>
                الإجمالي: {Number(order.totalAmount || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ع
              </td>
            </tr>
            {previousDebt > 0 && (
              <tr>
                <td style={{ textAlign: "left", color: "#c0392b", paddingTop: "1mm" }}>
                  الدين السابق: {Number(previousDebt || 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ع
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ textAlign: "center", fontSize: "7pt", color: "#999", borderTop: "1px dashed #ccc", paddingTop: "2mm" }}>
        <p style={{ margin: "1mm 0", fontWeight: 700, color: "#1e3a5f", fontSize: "8pt" }}>شكراً لتسوقكم مع متجر حسين</p>
        <p style={{ margin: 0 }}>تمت الطباعة: {new Date().toLocaleString("ar-SA")}</p>
      </div>
    </div>
  );
});

Invoice.displayName = "Invoice";
export default Invoice;