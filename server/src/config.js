export const JWT_SECRET = "hussein-pos-secret-key-2024";
export const JWT_EXPIRES_IN = "7d";
export const PORT = process.env.PORT || 3001;
export const ROLES = {
  admin: { name: "مدير", level: 1 },
  assistant: { name: "مساعد مدير", level: 1 },
  accountant: { name: "محاسب", level: 2 },
  supervisor: { name: "رئيس عمال", level: 3 },
  picker: { name: "مجهز", level: 4 },
};
