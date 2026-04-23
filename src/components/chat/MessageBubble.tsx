import { cn, formatTime } from "../../lib/utils";
import type { Message } from "../../types";

interface Props {
  message: Message;
  isSent: boolean;
  showDate?: boolean;
  dateLabel?: string;
}

export function MessageBubble({ message, isSent, showDate, dateLabel }: Props) {
  return (
    <>
      {showDate && (
        <div className="flex justify-center my-3">
          <span className="text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {dateLabel}
          </span>
        </div>
      )}

      <div className={cn("w-full animate-fade-up flex flex-col gap-0.5", isSent ? "items-end" : "items-start")}>
        {message.image && (
          <img
            src={message.image}
            alt="imagem"
            className="max-w-[260px] rounded-xl object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => window.open(message.image, "_blank")}
          />
        )}
        {message.text && (
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-[15px] leading-relaxed break-words",
              isSent
                ? "bg-primary text-primary-foreground rounded-br-[4px]"
                : "bg-secondary text-secondary-foreground rounded-bl-[4px]"
            )}
            style={{ maxWidth: "min(72%, 520px)", wordBreak: "break-word" }}
          >
            {message.text}
          </div>
        )}
        <span className="text-[11px] text-muted-foreground px-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </>
  );
}
