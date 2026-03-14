import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  uuid?: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  online?: boolean;
  badge?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const onlineDotSizes = {
  xs: "w-1.5 h-1.5 border",
  sm: "w-2 h-2 border",
  md: "w-2.5 h-2.5 border-2",
  lg: "w-3 h-3 border-2",
  xl: "w-3.5 h-3.5 border-2",
};

// Generate a consistent avatar URL using DiceBear Avatars
function getAvatarUrl(name: string, uuid?: string): string {
  const seed = uuid || name;
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear`;
}

// Generate gradient based on name for fallback
function getGradient(name: string): string {
  const gradients = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-pink-500 to-rose-600",
    "from-indigo-500 to-blue-600",
    "from-teal-500 to-green-600",
    "from-fuchsia-500 to-pink-600",
  ];
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

export function UserAvatar({ name, uuid, src, size = "md", className, online, badge }: UserAvatarProps) {
  const avatarUrl = src || getAvatarUrl(name, uuid);
  const gradient = getGradient(name);

  return (
    <div className={cn("relative shrink-0", className)}>
      <Avatar className={cn(sizeClasses[size], "ring-1 ring-border/50")}>
        <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
        <AvatarFallback className={cn("bg-gradient-to-br text-white font-bold", gradient)}>
          {name.charAt(0)}
        </AvatarFallback>
      </Avatar>

      {/* Online indicator */}
      {online && (
        <div className={cn(
          "absolute bottom-0 right-0 rounded-full bg-emerald-400 border-background",
          onlineDotSizes[size]
        )} />
      )}

      {/* Badge (VIP, etc) */}
      {badge && (
        <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-[7px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
          {badge}
        </div>
      )}
    </div>
  );
}
