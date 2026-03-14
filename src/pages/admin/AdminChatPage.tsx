import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Send, ArrowRight, CheckCheck, Users, Plus, User, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { UserAvatar } from "@/components/UserAvatar";
import { PageHeader } from "@/components/PageHeader";

interface Chat {
  id: string;
  name: string;
  type: string;
  members: string[];
  last_message: { text: string; sender_name: string; time: string } | null;
  unread: number;
}

interface Message {
  id: string;
  sender: string;
  sender_name: string;
  text: string;
  type: string;
  time: string;
}

export default function AdminChatPage() {
  const navigate = useNavigate();
  const { name, isOwner, isSuperAdmin } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const username = localStorage.getItem("ghala_username") || localStorage.getItem("ghala_name") || "";

  const ADMIN_NAMES: Record<string, string> = {
    naz: "ناز", janjoon: "جنجون", fransi: "فرنسي", miftah: "مفتاح",
    mars: "مارس", hamzawi: "حمزوي", relax: "ريلاكس", mali: "مالي شبيه",
    bilal: "بلال", karamela: "كراميلا", mila: "ميلا", rofan: "روفان",
    assaf_admin: "عساف", khamr: "خمر", rita: "ريتا", maha: "مها", marleen: "مارلين",
  };
  const getArabicName = (uname: string) => ADMIN_NAMES[uname] || uname;

  // Load chat list
  const loadChats = useCallback(async () => {
    try {
      const res = await api.chatList();
      if (res.success) setChats(res.chats || []);
    } catch {}
    setLoading(false);
  }, []);

  // Load messages for active chat
  const loadMessages = useCallback(async () => {
    if (!activeChat) return;
    try {
      const res = await api.chatMessages(activeChat);
      if (res.success) setMessages(res.messages || []);
    } catch {}
  }, [activeChat]);

  useEffect(() => { loadChats(); }, [loadChats]);
  useEffect(() => { loadMessages(); }, [loadMessages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  // Auto-refresh every 5s
  useEffect(() => {
    if (!activeChat) return;
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [activeChat, loadMessages]);

  const handleSend = async () => {
    if (!input.trim() || !activeChat) return;
    const msg = input;
    setInput("");

    // Optimistic add
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      sender: username,
      sender_name: name || "أنا",
      text: msg,
      type: "text",
      time: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await api.chatSend(activeChat, msg);
      if (res.success && res.message) {
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? res.message : m));
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    }
    inputRef.current?.focus();
  };

  // Create default chats for owner
  const createChat = async (chatId: string) => {
    await api.chatSend(chatId, "مرحباً 👋");
    setActiveChat(chatId);
    loadChats();
    loadMessages();
  };

  const isMe = (sender: string) => sender === username || sender === name;

  const formatTime = (t: string) => {
    try {
      const d = new Date(t);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      if (diff < 60000) return "الآن";
      if (diff < 3600000) return `${Math.floor(diff/60000)}د`;
      return d.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
    } catch { return t; }
  };

  const getChatIcon = (type: string) => {
    if (type === "owner_super") return Crown;
    if (type === "super_group") return Users;
    return User;
  };

  // ─── CHAT LIST VIEW ───
  if (!activeChat) {
    // Available chats to create (for owner)
    const superAdmins = ["janjoon", "fransi", "miftah", "mars", "hamzawi", "relax", "mali", "bilal"];
    const existingChatIds = chats.map(c => c.id);

    return (
      <div className="min-h-screen bg-background pb-24">
        <PageHeader title="💬 الدردشات" showBack />
        
        <div className="px-4 mt-4 space-y-2">
          {/* Existing chats */}
          {chats.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              لا توجد دردشات بعد
            </div>
          )}

          {chats.map(chat => {
            const Icon = getChatIcon(chat.type);
            return (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setActiveChat(chat.id)}
                className="w-full flex items-center gap-3 p-3 bg-card rounded-xl border border-border text-right"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">{chat.name}</span>
                    {chat.last_message && (
                      <span className="text-[10px] text-muted-foreground">{formatTime(chat.last_message.time)}</span>
                    )}
                  </div>
                  {chat.last_message && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {chat.last_message.sender_name}: {chat.last_message.text}
                    </p>
                  )}
                </div>
                {chat.unread > 0 && (
                  <span className="min-w-[20px] h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                    {chat.unread}
                  </span>
                )}
              </motion.button>
            );
          })}

          {/* Quick-create buttons */}
          {isOwner() && (
            <div className="pt-4 space-y-2">
              <p className="text-xs text-muted-foreground px-1">بدء دردشة جديدة:</p>
              
              {!existingChatIds.includes("super_group") && (
                <button onClick={() => createChat("super_group")}
                  className="w-full flex items-center gap-3 p-3 bg-card/50 rounded-xl border border-dashed border-border">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">مجموعة الإدارة (كل السوبر أدمن)</span>
                </button>
              )}

              {superAdmins.filter(sa => !existingChatIds.includes(`owner_${sa}`)).slice(0, 3).map(sa => (
                <button key={sa} onClick={() => createChat(`owner_${sa}`)}
                  className="w-full flex items-center gap-3 p-3 bg-card/50 rounded-xl border border-dashed border-border">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">دردشة مع {getArabicName(sa)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── CHAT MESSAGES VIEW ───
  const currentChat = chats.find(c => c.id === activeChat);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-3 py-2.5 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => { setActiveChat(null); loadChats(); }} className="p-1 -mr-1">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          {(() => { const Icon = getChatIcon(currentChat?.type || ""); return <Icon className="w-4 h-4 text-primary" />; })()}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">{currentChat?.name || activeChat}</h3>
          <p className="text-[10px] text-muted-foreground">{currentChat?.members?.length || 0} أعضاء</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <AnimatePresence>
          {messages.map((msg, i) => {
            const mine = isMe(msg.sender);
            const showName = !mine && (i === 0 || messages[i-1]?.sender !== msg.sender);

            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                  mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
                }`}>
                  {showName && <p className="text-[10px] font-bold mb-0.5 text-primary">{msg.sender_name}</p>}
                  <p className="text-[13px] leading-relaxed">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className="text-[10px] opacity-70">{formatTime(msg.time)}</span>
                    {mine && <CheckCheck className="w-3 h-3 opacity-60" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] mb-14">
        <div className="flex gap-2">
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="اكتب رسالة..." className="flex-1 h-10 rounded-full bg-secondary px-4 text-sm" />
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30">
            <Send className="w-4 h-4 rtl:-scale-x-100" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
