import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { UserAvatar } from "../UserAvatar";
import { formatDate } from "../../lib/utils";
import { MessageSquare } from "lucide-react";

export function ChatWindow() {
  const { selectedUser, messages, isLoadingMessages, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { authUser, onlineUsers, socket } = useAuthStore(); const bottomRef = useRef<HTMLDivElement>(null);

  // const { socket } = useAuthStore();

  useEffect(() => {
    if (!socket) return;
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center bg-background">
        <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-sm">Nenhuma conversa selecionada</p>
          <p className="text-xs text-muted-foreground mt-0.5">Escolha um contato para começar</p>
        </div>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);

  // Group messages by date
  const grouped: { date: string; messages: typeof messages }[] = [];
  messages.forEach(msg => {
    const label = formatDate(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last?.date === label) last.messages.push(msg);
    else grouped.push({ date: label, messages: [msg] });
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3 shrink-0">
        <UserAvatar name={selectedUser.fullName} src={selectedUser.profilePic} size="sm" online={isOnline} />
        <div>
          <p className="text-sm font-semibold leading-none">{selectedUser.fullName}</p>
          <p className={`text-[11px] mt-1 ${isOnline ? "text-online" : "text-muted-foreground"}`}>
            {isOnline ? "online" : "offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
        {isLoadingMessages ? (
          <div className="space-y-3 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className={`h-8 rounded-2xl bg-muted animate-pulse ${i % 3 === 0 ? "w-48" : i % 3 === 1 ? "w-32" : "w-64"}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted-foreground">Nenhuma mensagem. Diga olá!</p>
          </div>
        ) : (
          <>
            {grouped.map(({ date, messages: dayMsgs }) => (
              <div key={date} className="space-y-3">
                <div className="flex justify-center my-3">
                  <span className="text-[11px] text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {date}
                  </span>
                </div>
                {dayMsgs.map(msg => (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isSent={msg.senderId === authUser?._id}
                  />
                ))}
              </div>
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput receiverId={selectedUser._id} />
    </div>
  );
}
