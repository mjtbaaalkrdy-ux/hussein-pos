import useAuthStore from "../store/auth";

export default function useAuth() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  const hasRole = (...roles) => roles.includes(role);

  const canViewCostPrice = role === "admin" || role === "assistant";

  const canManageUsers = role === "admin" || role === "assistant";

  const canManageProducts = role === "admin" || role === "assistant";

  const canCreateOrder = role === "admin" || role === "assistant" || role === "accountant";

  const canAssignPicker = role === "admin" || role === "assistant" || role === "supervisor";

  const canApproveOrder = role === "admin" || role === "assistant" || role === "supervisor";

  const isPicker = role === "picker";

  const isAccountant = role === "accountant";

  const isSupervisor = role === "supervisor";

  const isAdmin = role === "admin" || role === "assistant";

  return {
    user,
    role,
    hasRole,
    canViewCostPrice,
    canManageUsers,
    canManageProducts,
    canCreateOrder,
    canAssignPicker,
    canApproveOrder,
    isPicker,
    isAccountant,
    isSupervisor,
    isAdmin,
  };
}
