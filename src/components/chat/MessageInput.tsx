import { useRef, useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../../lib/utils";

interface Props {
  receiverId: string;
}

export function MessageInput({ receiverId }: Props) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isSending } = useChatStore();

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { toast.error("Imagem máx. 4 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!text.trim() && !imagePreview) return;
    await sendMessage(receiverId, {
      text: text.trim() || undefined,
      image: imagePreview || undefined,
    });
    setText("");
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-border bg-card">
      {imagePreview && (
        <div className="relative inline-block mb-2">
          <img src={imagePreview} alt="preview" className="h-16 w-16 rounded-lg object-cover" />
          <button
            onClick={() => { setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
            className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-foreground text-background flex items-center justify-center"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

        <button
          onClick={() => fileRef.current?.click()}
          className={cn(
            "shrink-0 h-9 w-9 flex items-center justify-center rounded-lg border border-input transition-colors hover:bg-accent mb-0.5",
            imagePreview && "text-primary border-primary"
          )}
        >
          <Image className="h-4 w-4" />
        </button>

        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mensagem…"
          rows={1}
          className="flex-1 min-h-[36px] max-h-32 py-2 leading-5 overflow-y-auto"
          style={{ height: "auto" }}
          onInput={e => {
            const t = e.currentTarget;
            t.style.height = "auto";
            t.style.height = Math.min(t.scrollHeight, 128) + "px";
          }}
        />

        <Button
          onClick={handleSend}
          disabled={isSending || (!text.trim() && !imagePreview)}
          size="icon"
          className="h-9 w-9 shrink-0 mb-0.5"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
