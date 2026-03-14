import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Trash2, BellRing, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppNotification, getCategoryLabel } from "@/hooks/useNotifications";

interface Props {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClear: () => void;
  permissionGranted: boolean;
  onEnableBrowser: () => void;
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
  return `${Math.floor(diff / 86400)} ي`;
}

const TYPE_COLORS: Record<string, string> = {
  support: "bg-warning/15 text-warning",
  report: "bg-destructive/15 text-destructive",
  vip: "bg-primary/15 text-primary",
  store: "bg-success/15 text-success",
  monitor: "bg-accent/15 text-accent-foreground",
  system: "bg-muted text-muted-foreground",
};

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClear,
  permissionGranted,
  onEnableBrowser,
}: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleClick = (notif: AppNotification) => {
    onMarkAsRead(notif.id);
    if (notif.link) {
      setOpen(false);
      navigate(notif.link);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center relative transition-all active:scale-90"
      >
        <Bell className="w-[18px] h-[18px] text-muted-foreground" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 badge-pulse"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 left-4 right-4 sm:absolute sm:top-12 sm:left-auto sm:right-0 sm:w-[340px] max-h-[70vh] rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden z-50"
            style={{ direction: "rtl" }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border/30 px-4 py-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={onMarkAllAsRead} className="text-[10px] text-primary font-medium flex items-center gap-1 hover:opacity-80">
                    <CheckCheck className="w-3 h-3" /> قراءة الكل
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={onClear} className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> مسح
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">الإشعارات</h3>
                {unreadCount > 0 && (
                  <span className="min-w-[20px] h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>

            {/* Browser notification prompt */}
            {!permissionGranted && (
              <button
                onClick={onEnableBrowser}
                className="w-full px-4 py-2.5 flex items-center justify-center gap-2 text-[11px] font-medium text-primary bg-primary/5 hover:bg-primary/10 border-b border-border/20 transition-colors"
              >
                <BellRing className="w-3.5 h-3.5" /> فعّل إشعارات المتصفح لتصلك التنبيهات فوراً
              </button>
            )}

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[calc(70vh-60px)] overscroll-contain">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground/60">لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map((notif, i) => (
                  <motion.button
                    key={notif.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleClick(notif)}
                    className={`w-full text-right px-4 py-3 flex items-start gap-3 border-b border-border/10 transition-colors hover:bg-secondary/50 ${
                      !notif.read ? "bg-primary/[0.03]" : ""
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="mt-1.5 shrink-0">
                      {!notif.read ? (
                        <span className="block w-2 h-2 rounded-full bg-primary badge-pulse" />
                      ) : (
                        <Check className="w-3 h-3 text-muted-foreground/30" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="text-[10px] text-muted-foreground">{timeAgo(notif.time)}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${TYPE_COLORS[notif.category] || "bg-muted text-muted-foreground"}`}>
                            {getCategoryLabel(notif.category)}
                          </span>
                          <span className={`text-[12px] font-bold ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                            {notif.title}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground/80 truncate">{notif.body}</p>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
