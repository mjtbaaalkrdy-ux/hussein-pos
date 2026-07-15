import { Router } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/roles.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, authorize("admin", "assistant"), async (_, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, phone: true, role: true, active: true, createdAt: true },
    orderBy: { id: "asc" },
  });
  res.json(users);
});

router.post("/", authenticate, authorize("admin", "assistant"), async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, phone, password: hash, role },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "البريد الإلكتروني موجود مسبقاً" });
  }
});

router.put("/:id", authenticate, authorize("admin", "assistant"), async (req, res) => {
  const { name, email, phone, role, active, password } = req.body;
  const data = {};
  if (name) data.name = name;
  if (email) data.email = email;
  if (phone !== undefined) data.phone = phone;
  if (role) data.role = role;
  if (active !== undefined) data.active = active;
  if (password) data.password = await bcrypt.hash(password, 10);
  const user = await prisma.user.update({
    where: { id: parseInt(req.params.id) },
    data,
    select: { id: true, name: true, email: true, phone: true, role: true, active: true },
  });
  res.json(user);
});

router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: "تم الحذف" });
});

export default router;
