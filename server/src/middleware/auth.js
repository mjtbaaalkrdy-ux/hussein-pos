import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "غير مصرح به" });
  }
  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "انتهت الجلسة، سجل دخول مرة أخرى" });
  }
};
