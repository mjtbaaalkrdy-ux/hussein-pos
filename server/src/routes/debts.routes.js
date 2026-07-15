import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/roles.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, authorize("admin", "assistant", "accountant"), async (req, res) => {
  const debts = await prisma.debt.findMany({ orderBy: { createdAt: "desc" } });
  res.json(debts);
});

router.post("/", authenticate, authorize("admin", "assistant"), async (req, res) => {
  const debt = await prisma.debt.create({ data: req.body });
  res.json(debt);
});

router.put("/:id", authenticate, authorize("admin", "assistant"), async (req, res) => {
  const debt = await prisma.debt.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  res.json(debt);
});

router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  await prisma.debt.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: "تم الحذف" });
});

export default router;
