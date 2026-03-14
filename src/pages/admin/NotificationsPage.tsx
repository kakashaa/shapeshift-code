import { useState } from "react";
import { Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function NotificationsPage() {
  const [tab, setTab] = useState<"dm" | "broadcast">("dm");
  const [uuid, setUuid] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendDm = async () => {
    if (!uuid || !message) { toast({ title: "أدخل البيانات كاملة", variant: "destructive" }); return; }
    setSending(true);
    try { await api.sendDm(uuid, message); toast({ title: "✅ تم إرسال الرسالة" }); setMessage(""); setUuid(""); } catch (e: any) { toast({ title: "خطأ", description: e.message, variant: "destructive" }); } finally { setSending(false); }
  };

  const handleBroadcast = async () => {
    if (!message) { toast({ title: "أدخل الرسالة", variant: "destructive" }); return; }
    if (!confirm("هل أنت متأكد؟ سيتم إرسالها لجميع المستخدمين")) return;
    setSending(true);
    try { await api.broadcast(message); toast({ title: "✅ تم الإرسال للجميع" }); setMessage(""); } catch (e: any) { toast({ title: "خطأ", description: e.message, variant: "destructive" }); } finally { setSending(false); }
  };

  return (
    <div className="pb-20">
      <PageHeader title="إرسال إشعار" showBack />
      <div className="flex gap-2 p-4 pb-0">
        {(["dm", "broadcast"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 h-10 rounded-xl text-sm font-medium transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {t === "dm" ? "رسالة خاصة" : "إشعار عام"}
          </button>
        ))}
      </div>
      <div className="p-4 space-y-4">
        {tab === "dm" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">UUID المستقبل</label>
            <input value={uuid} onChange={e => setUuid(e.target.value)} placeholder="أدخل UUID" className="w-full h-12 rounded-xl bg-secondary px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary" dir="ltr" />
          </div>
        )}
        <div className="space-y-2">
          <label className="text-sm font-medium">الرسالة</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="اكتب الرسالة..." rows={4} className="w-full rounded-xl bg-secondary p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
        </div>
        {tab === "broadcast" && <p className="text-xs text-warning text-center">⚠️ سيتم إرسال هذه الرسالة لجميع مستخدمي التطبيق</p>}
        <button onClick={tab === "dm" ? handleSendDm : handleBroadcast} disabled={sending} className="w-full h-12 rounded-xl font-bold text-primary-foreground active:scale-[0.97] transition-transform disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "var(--gradient-button)" }}>
          <Send className="w-4 h-4" /> {sending ? "جاري الإرسال..." : tab === "dm" ? "إرسال" : "إرسال للجميع"}
        </button>
      </div>
    </div>
  );
}
