import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "../lib/utils";
import { getInitials } from "../lib/utils";

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

export function UserAvatar({ name, src, size = "md", online, className }: UserAvatarProps) {
  return (
    <div className={cn("relative shrink-0", className)}>
      <Avatar className={sizeMap[size]}>
        <AvatarImage src={src} alt={name} />
        <AvatarFallback className="text-[11px]">{getInitials(name)}</AvatarFallback>
      </Avatar>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full border-2 border-background",
            size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5",
            online ? "bg-online" : "bg-muted-foreground/40"
          )}
        />
      )}
    </div>
  );
}
