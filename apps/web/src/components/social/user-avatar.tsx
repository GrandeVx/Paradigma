import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: {
    name: string | null;
    email?: string;
    image?: string | null;
  };
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-12 w-12",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const fallbackText = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() || "U";

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={user.image || ""} alt={user.name || ""} />
      <AvatarFallback className={cn(textSizeClasses[size])}>
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  );
}