import { useEffect, useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { UserAvatar } from "../UserAvatar";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Sun, Moon, LogOut, Settings, Trash2, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";
import type { User } from "../../types";
import toast from "react-hot-toast";

export function Sidebar() {
  const { users, fetchUsers, selectUser, selectedUser, isLoadingUsers } = useChatStore();
  const { authUser, logout, updateProfile, deleteAccount, isLoading } = useAuthStore();
  const { onlineUsers } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const [search, setSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: authUser?.fullName ?? "",
    bio: authUser?.bio ?? "",
    password: "",
    profilePic: "",
  });

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { toast.error("Imagem máx. 4 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setProfileForm(f => ({ ...f, profilePic: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    const payload: Record<string, string> = {};
    if (profileForm.fullName && profileForm.fullName !== authUser?.fullName)
      payload.fullName = profileForm.fullName;
    if (profileForm.bio !== authUser?.bio) payload.bio = profileForm.bio;
    if (profileForm.password) payload.password = profileForm.password;
    if (profileForm.profilePic) payload.profilePic = profileForm.profilePic;
    if (!Object.keys(payload).length) { toast("Nenhuma alteração"); return; }
    await updateProfile(payload);
    setSettingsOpen(false);
    setProfileForm(f => ({ ...f, password: "", profilePic: "" }));
  };

  return (
    <aside className="flex flex-col h-full border-r border-border bg-card w-72 shrink-0">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-foreground flex items-center justify-center">
            <span className="text-background text-[10px] font-semibold font-mono">c</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">chattr</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={logout}>
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Search */}
      <div className="px-3 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-xs"
            placeholder="Pesquisar"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <p className="text-[11px] font-medium text-muted-foreground px-2 pb-2">
          Mensagens{" "}
          <span className="text-online font-medium">{onlineUsers.length - 1 > 0 ? `· ${onlineUsers.length - 1} online` : ""}</span>
        </p>

        {isLoadingUsers ? (
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded animate-pulse w-24" />
                  <div className="h-2.5 bg-muted rounded animate-pulse w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground px-3 py-4">
            {search ? "Nenhum resultado" : "Nenhum usuário encontrado"}
          </p>
        ) : (
          <div className="space-y-0.5">
            {filtered.map(user => (
              <UserRow
                key={user._id}
                user={user}
                isOnline={onlineUsers.includes(user._id)}
                isSelected={selectedUser?._id === user._id}
                onClick={() => selectUser(user)}
              />
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Current user */}
      <div className="px-3 py-3 flex items-center gap-2.5">
        <UserAvatar
          name={authUser?.fullName ?? ""}
          src={authUser?.profilePic}
          size="sm"
          online={true}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{authUser?.fullName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{authUser?.email}</p>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
            <DialogDescription>Atualize o seu perfil</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-3">
              <UserAvatar
                name={profileForm.fullName || authUser?.fullName || ""}
                src={profileForm.profilePic || authUser?.profilePic}
                size="lg"
              />
              <label className="cursor-pointer">
                <span className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
                  Alterar foto
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>

            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                value={profileForm.fullName}
                onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Textarea
                value={profileForm.bio}
                onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Sobre você…"
                rows={2}
                maxLength={300}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Nova senha <span className="text-muted-foreground">(opcional)</span></Label>
              <Input
                type="password"
                value={profileForm.password}
                onChange={e => setProfileForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Deixe em branco para manter"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button onClick={handleSaveProfile} disabled={isLoading} className="flex-1">
                {isLoading ? "Salvando…" : "Salvar"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => { setSettingsOpen(false); setDeleteOpen(true); }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete account dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Remover conta</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. Todos os dados serão apagados permanentemente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={async () => { await deleteAccount(); setDeleteOpen(false); }}
              disabled={isLoading}
            >
              {isLoading ? "Removendo…" : "Remover"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

function UserRow({
  user, isOnline, isSelected, onClick,
}: {
  user: User; isOnline: boolean; isSelected: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "sidebar-item w-full text-left",
        isSelected && "active"
      )}
    >
      <UserAvatar name={user.fullName} src={user.profilePic} size="md" online={isOnline} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate leading-none mb-1">{user.fullName}</p>
        <p className="text-[11px] text-muted-foreground truncate">
          {isOnline ? "online" : "offline"}
        </p>
      </div>
    </button>
  );
}
