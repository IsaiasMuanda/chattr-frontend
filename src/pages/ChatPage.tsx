import { Sidebar } from "../components/chat/Sidebar";
import { ChatWindow } from "../components/chat/ChatWindow";
import { useChatStore } from "../store/chatStore";

export default function ChatPage() {
  const { selectedUser } = useChatStore();

  return (
    <div className="flex h-full overflow-hidden">
      {/* Mobile: mostra sidebar OU chat. Desktop: mostra os dois */}
      <div className={`${selectedUser ? "hidden md:flex" : "flex"} w-full md:w-72 shrink-0`}>
        <Sidebar />
      </div>
      <div className={`${selectedUser ? "flex" : "hidden md:flex"} flex-1 min-w-0`}>
        <ChatWindow />
      </div>
    </div>
  );
}
