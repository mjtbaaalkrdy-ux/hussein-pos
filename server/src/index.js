import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";
import { PORT } from "./config.js";
import { setupSocket } from "./socket/index.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";
import productRoutes from "./routes/products.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import debtRoutes from "./routes/debts.routes.js";
import purchaseRoutes from "./routes/purchases.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/purchases", purchaseRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const clientDist = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (_, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.set("io", io);
setupSocket(io);

server.listen(PORT, () => {
  console.log(`\x1b[32m✓ سيرفر حسين يعمل على المنفذ: ${PORT}\x1b[0m`);
});
