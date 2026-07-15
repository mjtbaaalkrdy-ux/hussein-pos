import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("123456", 10);

  const users = [
    { name: "المدير", email: "admin@hussein.com", password: hash, role: "admin", phone: "0500000001" },
    { name: "مساعد المدير", email: "assistant@hussein.com", password: hash, role: "assistant", phone: "0500000002" },
    { name: "المحاسب أحمد", email: "accountant@hussein.com", password: hash, role: "accountant", phone: "0500000003" },
    { name: "رئيس العمال", email: "supervisor@hussein.com", password: hash, role: "supervisor", phone: "0500000004" },
    { name: "المجهز علي", email: "picker@hussein.com", password: hash, role: "picker", phone: "0500000005" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
  }

  const products = [
    { name: "ماء معدني صغير", barcode: "1001", costPrice: 3, sellPrice: 5, piecesStock: 500, cartonsStock: 20, warehouse: "رئيسي", section: "رف A1" },
    { name: "ماء معدني كبير", barcode: "1002", costPrice: 5, sellPrice: 8, piecesStock: 300, cartonsStock: 15, warehouse: "رئيسي", section: "رف A2" },
    { name: "بيبسي كولا قصدير", barcode: "1003", costPrice: 2, sellPrice: 4, piecesStock: 400, cartonsStock: 25, warehouse: "رئيسي", section: "رف B1" },
    { name: "بيبسي كولا زجاجة", barcode: "1004", costPrice: 4, sellPrice: 7, piecesStock: 250, cartonsStock: 12, warehouse: "رئيسي", section: "رف B2" },
    { name: "سفن اب قصدير", barcode: "1005", costPrice: 2, sellPrice: 4, piecesStock: 350, cartonsStock: 20, warehouse: "رئيسي", section: "رف B3" },
    { name: "شاي أحمر", barcode: "1006", costPrice: 8, sellPrice: 12, piecesStock: 150, cartonsStock: 10, warehouse: "مخزن 2", section: "رف C1" },
    { name: "شاي أخضر", barcode: "1007", costPrice: 10, sellPrice: 15, piecesStock: 120, cartonsStock: 8, warehouse: "مخزن 2", section: "رف C2" },
    { name: "قهوة سريعة", barcode: "1008", costPrice: 15, sellPrice: 22, piecesStock: 80, cartonsStock: 5, warehouse: "مخزن 2", section: "رف D1" },
    { name: "حليب مجفف", barcode: "1009", costPrice: 20, sellPrice: 30, piecesStock: 60, cartonsStock: 4, warehouse: "مخزن 2", section: "رف D2" },
    { name: "زيت طبخ 1 لتر", barcode: "1010", costPrice: 12, sellPrice: 18, piecesStock: 100, cartonsStock: 6, warehouse: "رئيسي", section: "رف E1" },
    { name: "سكر 1 كجم", barcode: "1011", costPrice: 7, sellPrice: 10, piecesStock: 200, cartonsStock: 10, warehouse: "رئيسي", section: "رف E2" },
    { name: "رز بسمتي 1 كجم", barcode: "1012", costPrice: 14, sellPrice: 20, piecesStock: 90, cartonsStock: 5, warehouse: "رئيسي", section: "رف F1" },
    { name: "معكرونة", barcode: "1013", costPrice: 4, sellPrice: 6, piecesStock: 180, cartonsStock: 8, warehouse: "رئيسي", section: "رف F2" },
    { name: "صلصة طماطم", barcode: "1014", costPrice: 5, sellPrice: 8, piecesStock: 120, cartonsStock: 6, warehouse: "رئيسي", section: "رف G1" },
    { name: "طحينة", barcode: "1015", costPrice: 10, sellPrice: 15, piecesStock: 70, cartonsStock: 4, warehouse: "مخزن 2", section: "رف G2" },
    { name: "عسل طبيعي", barcode: "1016", costPrice: 25, sellPrice: 40, piecesStock: 40, cartonsStock: 3, warehouse: "مخزن 2", section: "رف H1" },
    { name: "مربى مشكل", barcode: "1017", costPrice: 8, sellPrice: 12, piecesStock: 60, cartonsStock: 4, warehouse: "رئيسي", section: "رف H2" },
    { name: "جبنة مثلثات", barcode: "1018", costPrice: 6, sellPrice: 10, piecesStock: 100, cartonsStock: 5, warehouse: "مخزن 2", section: "رف I1" },
    { name: "لبن زبادي", barcode: "1019", costPrice: 3, sellPrice: 5, piecesStock: 200, cartonsStock: 10, warehouse: "مخزن 2", section: "رف I2" },
    { name: "عصير برتقال", barcode: "1020", costPrice: 6, sellPrice: 10, piecesStock: 80, cartonsStock: 4, warehouse: "رئيسي", section: "رف J1" },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  console.log("✓ تم إضافة البيانات التجريبية بنجاح");
  console.log("  ┌───────────────────────┬─────────────┐");
  console.log("  │ البريد الإلكتروني      │ كلمة المرور │");
  console.log("  ├───────────────────────┼─────────────┤");
  console.log("  │ admin@hussein.com     │ 123456      │");
  console.log("  │ assistant@hussein.com │ 123456      │");
  console.log("  │ accountant@hussein.com│ 123456      │");
  console.log("  │ supervisor@hussein.com│ 123456      │");
  console.log("  │ picker@hussein.com    │ 123456      │");
  console.log("  └───────────────────────┴─────────────┘");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
