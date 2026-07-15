export default function Logo({ size = 48, showText = true }) {
  return (
    <div className="flex items-center gap-2">
      <img src="/logo.jpeg" alt="شعار حسين" width={size} height={size} className="rounded-lg flex-shrink-0 object-contain" style={{ width: size, height: size }} />
      {showText && <span className="font-bold text-primary-500" style={{ fontSize: size * 0.45 }}>نظام حسين</span>}
    </div>
  );
}
