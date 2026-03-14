import { useState, useEffect } from "react";
import { Trash2, RotateCcw, XCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function TrashPage() {
  const { isOwner } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTrash(); }, []);

  const loadTrash = async () => {
    setLoading(true);
    try {
      const res = await api.trashList();
      if (res.success) setItems(res.items || []);
    } catch {}
    setLoading(false);
  };

  const restore = async (id: string) => {
    try {
      await api.trashRestore(id);
      toast({ title: "✅ تم الاستعادة" });
      loadTrash();
    } catch {}
  };

  const deletePerm = async (id: string) => {
    if (!confirm("حذف نهائي؟")) return;
    try {
      await api.trashDelete(id);
      toast({ title: "🗑️ تم الحذف النهائي" });
      loadTrash();
    } catch {}
  };

  if (!isOwner()) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <PageHeader title="سلة المحذوفات" showBack />
        <div className="text-center py-20 text-muted-foreground">🔒 خاص بالمالك</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="🗑️ سلة المحذوفات" showBack />
      <div className="px-4 mt-4 space-y-2">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trash2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>السلة فارغة</p>
          </div>
        ) : (
          items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-3 bg-card rounded-xl border border-border"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                    {item.type === "admin_account" ? "حساب أدمن" : item.type === "chat_message" ? "رسالة" : item.type}
                  </span>
                  <p className="text-sm mt-1">{item.data?.name || item.data?.text || item.data?.username || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">حذف بواسطة: {item.deleted_by} · {item.deleted_at}</p>
                </div>
                <div className="flex gap-1">
                  {!item.restored && (
                    <button onClick={() => restore(item.id)} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => deletePerm(item.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
