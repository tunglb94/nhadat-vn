import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "blue" | "green" | "red" | "yellow" | "gray";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    blue:    "bg-blue-50 text-blue-700",
    green:   "bg-green-50 text-green-700",
    red:     "bg-red-50 text-red-700",
    yellow:  "bg-yellow-50 text-yellow-700",
    gray:    "bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
