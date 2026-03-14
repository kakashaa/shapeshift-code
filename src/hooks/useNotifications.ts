import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";

export interface AppNotification {
  id: string;
  category: string;
  title: string;
  body: string;
  time: Date;
  read: boolean;
  extra?: Record<string, any>;
  link?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  eid_prize: "🎉 حدث العيد",
  big_charge: "💰 شحنات",
  big_gift: "🎁 هدايا",
  salary: "💵 رواتب",
  ban: "🚫 حظر",
  vip: "⭐ VIP",
  id_change: "🔄 تغيير آيدي",
  new_user: "👤 مستخدم جديد",
  custom_gift: "🎨 هدايا مخصصة",
  entry: "🚪 دخوليات",
  frame: "🖼️ إطارات",
  animated_photo: "📸 صور متحركة",
  hair: "💇 شعر",
  stars: "⭐ نجوم",
  support: "🎧 دعم",
  system: "⚙️ نظام",
};

const CATEGORY_LINKS: Record<string, string> = {
  eid_prize: "/more/analytics",
  big_charge: "/finance",
  big_gift: "/more/gift-audit",
  salary: "/finance/salaries",
  ban: "/monitoring",
  vip: "/more/vip",
  id_change: "/more/id-change",
  new_user: "/more/registrations",
  custom_gift: "/more/store",
  entry: "/more/store",
  frame: "/more/store",
  support: "/support",
  system: "/more/activity-log",
};

export function getCategoryLabel(category: string) {
  return CATEGORY_LABELS[category] || "📌 " + category;
}

// Browser notification permission
async function requestPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function showBrowserNotification(notif: AppNotification) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const n = new Notification(notif.title, {
    body: notif.body,
    icon: "/favicon.ico",
    tag: notif.id,
    silent: false,
  });
  n.onclick = () => {
    window.focus();
    if (notif.link) window.location.hash = notif.link;
    n.close();
  };
}

function playSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

export function useNotifications(enabled = true) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(
    typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted"
  );
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const lastFetchRef = useRef<string[]>([]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.adminNotifications({ limit: 50 });
      if (res.success && res.notifications) {
        const mapped: AppNotification[] = res.notifications.map((n: any) => ({
          id: n.id,
          category: n.category,
          title: n.title,
          body: n.body,
          time: new Date(n.time),
          read: n.is_read || false,
          extra: n.extra,
          link: CATEGORY_LINKS[n.category] || undefined,
        }));

        // Check for NEW notifications (not seen before)
        const newIds = mapped
          .filter(n => !n.read && !lastFetchRef.current.includes(n.id))
          .map(n => n.id);
        
        if (newIds.length > 0 && lastFetchRef.current.length > 0) {
          // New notification arrived — play sound & show browser notification
          const newest = mapped.find(n => n.id === newIds[0]);
          if (newest) {
            showBrowserNotification(newest);
            playSound();
          }
        }

        lastFetchRef.current = mapped.map(n => n.id);
        setNotifications(mapped);
        setUnreadCount(mapped.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, []);

  // Mark single as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.adminNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async (category?: string) => {
    try {
      await api.adminNotificationsReadAll(category);
      setNotifications(prev => prev.map(n => 
        (!category || n.category === category) ? { ...n, read: true } : n
      ));
      setUnreadCount(0);
    } catch {}
  }, []);

  const clearAll = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const enableBrowserNotifications = useCallback(async () => {
    const granted = await requestPermission();
    setPermissionGranted(granted);
    return granted;
  }, []);

  // Poll every 15 seconds
  useEffect(() => {
    if (!enabled) return;
    
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    addNotification: () => {}, // Not needed — API-driven
    markAsRead,
    markAllAsRead,
    clearAll,
    permissionGranted,
    enableBrowserNotifications,
  };
}
