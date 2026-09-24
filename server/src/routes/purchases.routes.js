import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/roles.js";

const router = Router();
const prisma = new PrismaClient();

// قائمة بكل قوائم الشراء
router.get("/", authenticate, authorize("admin", "assistant"), async (_, res) => {
  const purchases = await prisma.purchase.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(purchases);
});

// إنشاء قائمة شراء جديدة
router.post("/", authenticate, authorize("admin", "assistant"), async (req, res) => {
  const { supplier, notes, items } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ message: "يجب إضافة صنف واحد على الأقل" });

  let total = 0;
  const purchaseItems = items.map((item) => {
    const quantity = parseInt(item.quantity) || 0;
    const unitCost = parseFloat(item.unitCost) || 0;
    const t = quantity * unitCost;
    total += t;
    return {
      productId: item.productId ? parseInt(item.productId) : null,
      productName: item.productName || "منتج",
      quantity,
      unitCost,
      total: t,
    };
  });

  const purchase = await prisma.purchase.create({
    data: {
      supplier: supplier || "",
      notes: notes || "",
      items: { create: purchaseItems },
    },
    include: { items: true },
  });

  res.json(purchase);
});

// تحديث قائمة شراء (عادةً: تغيير الحالة)
router.put("/:id", authenticate, authorize("admin", "assistant"), async (req, res) => {
  const { supplier, notes, status } = req.body;
  const purchase = await prisma.purchase.update({
    where: { id: parseInt(req.params.id) },
    data: { supplier, notes, status },
    include: { items: true },
  });
  res.json(purchase);
});

// حذف قائمة شراء
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  await prisma.purchase.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: "تم الحذف" });
});

export default router;