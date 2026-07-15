import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";
import { authorize, hideCostPrice } from "../middleware/roles.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, hideCostPrice, async (req, res) => {
  const products = await prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } });
  res.json(products);
});

router.get("/all", authenticate, authorize("admin", "assistant"), async (_, res) => {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  res.json(products);
});

router.get("/:id", authenticate, hideCostPrice, async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!product) return res.status(404).json({ message: "المنتج غير موجود" });
  res.json(product);
});

router.post("/", authenticate, authorize("admin", "assistant"), async (req, res) => {
  const { name, barcode, costPrice, sellPrice, piecesStock, cartonsStock, warehouse, section } = req.body;
  const product = await prisma.product.create({
    data: { name, barcode: barcode || "", costPrice: costPrice || 0, sellPrice: sellPrice || 0, piecesStock: piecesStock || 0, cartonsStock: cartonsStock || 0, warehouse: warehouse || "رئيسي", section: section || "" },
  });
  res.json(product);
});

router.put("/:id", authenticate, authorize("admin", "assistant"), async (req, res) => {
  const product = await prisma.product.update({
    where: { id: parseInt(req.params.id) },
    data: req.body,
  });
  res.json(product);
});

router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  await prisma.product.update({
    where: { id: parseInt(req.params.id) },
    data: { active: false },
  });
  res.json({ message: "تم التعطيل" });
});

export default router;
