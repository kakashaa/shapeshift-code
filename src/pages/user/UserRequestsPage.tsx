import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, ArrowRightLeft, ShoppingBag, MessageSquare, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";

const SERVICES = [
  { icon: Star, label: "طلب VIP", path: "/user/vip-request", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { icon: ArrowRightLeft, label: "تغيير الآيدي", path: "/user/id-change", color: "text-blue-400", bg: "bg-blue-400/10" },
  { icon: ShoppingBag, label: "طلبات المتجر", path: "/user/store", color: "text-purple-400", bg: "bg-purple-400/10" },
  { icon: MessageSquare, label: "الدعم الفني", path: "/user/support", color: "text-green-400", bg: "bg-green-400/10" },
  { icon: FileText, label: "طلباتي السابقة", path: "/user/my-requests", color: "text-gray-400", bg: "bg-gray-400/10" },
];

export default function UserRequestsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="الخدمات" />
      <div className="px-4 mt-4 space-y-2">
        {SERVICES.map((s, i) => (
          <motion.button
            key={s.path}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(s.path)}
            className="w-full flex items-center gap-3 p-4 bg-card rounded-xl border border-border"
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <span className="flex-1 text-sm font-medium text-right">{s.label}</span>
            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-180" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
