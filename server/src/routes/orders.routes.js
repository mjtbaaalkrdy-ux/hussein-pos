import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/roles.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, async (req, res) => {
  let where = {};
  if (req.user.role === "picker") {
    where = { pickerId: req.user.id };
  } else if (req.user.role === "accountant") {
    where = { creatorId: req.user.id };
  } else if (req.user.role === "supervisor") {
    where = { status: { notIn: ["completed", "cancelled"] } };
  }
  const orders = await prisma.order.findMany({
    where,
    include: { items: true, creator: { select: { name: true } }, picker: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

router.get("/stats", authenticate, authorize("admin", "assistant", "accountant"), async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const periods = { daily: todayStart, weekly: weekStart, monthly: monthStart, yearly: yearStart };

  const getStats = async (startDate) => {
    const result = await prisma.order.aggregate({
      where: { status: { not: "cancelled" }, createdAt: { gte: startDate } },
      _sum: { totalAmount: true },
      _count: { id: true },
    });
    return { amount: result._sum.totalAmount || 0, count: result._count.id || 0 };
  };

  if (req.query.period && periods[req.query.period]) {
    const startDate = periods[req.query.period];
    const [stats, orders] = await Promise.all([
      getStats(startDate),
      prisma.order.findMany({
        where: { status: { not: "cancelled" }, createdAt: { gte: startDate } },
        include: { items: true, creator: { select: { name: true } }, picker: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    return res.json({ ...stats, orders });
  }

  const [daily, weekly, monthly, yearly] = await Promise.all([
    getStats(todayStart), getStats(weekStart), getStats(monthStart), getStats(yearStart),
  ]);
  res.json({ daily, weekly, monthly, yearly });
});

router.get("/:id", authenticate, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { items: true, creator: { select: { name: true } }, picker: { select: { name: true } } },
  });
  if (!order) return res.status(404).json({ message: "الوصل غير موجود" });
  res.json(order);
});

router.post("/", authenticate, authorize("admin", "assistant", "accountant"), async (req, res) => {
  const { customerName, customerPhone, customerLocation, items } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ message: "يجب إضافة منتج واحد على الأقل" });
  if (items.length > 20) return res.status(400).json({ message: "الحد الأقصى 20 صنفاً في الوصل" });

  let totalPieces = 0, totalCartons = 0, totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) continue;
    const pieces = parseInt(item.pieces) || 0;
    const cartons = parseInt(item.cartons) || 0;
    const total = (pieces + cartons) * product.sellPrice;
    totalPieces += pieces;
    totalCartons += cartons;
    totalAmount += total;
    orderItems.push({
      productId: product.id,
      productName: product.name,
      barcode: product.barcode || "",
      pieces,
      cartons,
      unitPrice: product.sellPrice,
      total,
    });
  }

  const order = await prisma.order.create({
    data: {
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      customerLocation: customerLocation || "",
      status: "pending",
      totalPieces, totalCartons, totalAmount,
      creatorId: req.user.id,
      items: { create: orderItems },
    },
    include: { items: true, creator: { select: { name: true } } },
  });

  const io = req.app.get("io");
  if (io) {
    io.emit("order:new", order);
  }

  res.json(order);
});

router.put("/:id/assign", authenticate, authorize("admin", "assistant", "supervisor"), async (req, res) => {
  const { pickerId } = req.body;
  const order = await prisma.order.update({
    where: { id: parseInt(req.params.id) },
    data: { pickerId: parseInt(pickerId), status: "assigned" },
    include: { items: true, creator: { select: { name: true } }, picker: { select: { name: true } } },
  });
  const io = req.app.get("io");
  if (io) io.emit("order:assigned", order);
  res.json(order);
});

router.put("/:id/pick", authenticate, authorize("picker"), async (req, res) => {
  const order = await prisma.order.update({
    where: { id: parseInt(req.params.id), pickerId: req.user.id },
    data: { status: "picked" },
    include: { items: true, creator: { select: { name: true } }, picker: { select: { name: true } } },
  });
  const io = req.app.get("io");
  if (io) io.emit("order:picked", order);
  res.json(order);
});

router.put("/:id/approve", authenticate, authorize("admin", "assistant", "supervisor"), async (req, res) => {
  const order = await prisma.order.update({
    where: { id: parseInt(req.params.id) },
    data: { status: "completed" },
    include: { items: true, creator: { select: { name: true } }, picker: { select: { name: true } } },
  });
  const io = req.app.get("io");
  if (io) io.emit("order:completed", order);
  res.json(order);
});

router.put("/:id/cancel", authenticate, authorize("admin", "assistant"), async (req, res) => {
  const order = await prisma.order.update({
    where: { id: parseInt(req.params.id) },
    data: { status: "cancelled" },
  });
  const io = req.app.get("io");
  if (io) io.emit("order:cancelled", order);
  res.json(order);
});

export default router;
