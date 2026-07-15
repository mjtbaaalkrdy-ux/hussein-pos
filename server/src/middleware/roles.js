import { ROLES } from "../config.js";

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "ليس لديك صلاحية" });
    }
    next();
  };
};

export const hideCostPrice = (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    if (req.user && (req.user.role === "admin" || req.user.role === "assistant")) {
      return originalJson(data);
    }
    if (data && Array.isArray(data)) {
      data = data.map((item) => {
        if (item.costPrice !== undefined) {
          const { costPrice, ...rest } = item;
          return rest;
        }
        return item;
      });
    } else if (data && data.costPrice !== undefined) {
      const { costPrice, ...rest } = data;
      data = rest;
    }
    return originalJson(data);
  };
  next();
};
