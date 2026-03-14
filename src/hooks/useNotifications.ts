import { useState, useEffect, useCallback, useRef } from "react";

export interface AppNotification {
  id: string;
  type: "support" | "report" | "vip" | "store" | "monitor" | "system";
  title: string;
  body: string;
  time: Date;
  read: boolean;
  link?: string;
}

const TYPE_LABELS: Record<AppNotification["type"], string> = {
  support: "🎧 دعم",
  report: "🚨 بلاغ",
  vip: "⭐ VIP",
  store: "🛒 متجر",
  monitor: "👁 مراقبة",
  system: "⚙️ نظام",
};

export function getTypeLabel(type: AppNotification["type"]) {
  return TYPE_LABELS[type];
}

// Demo notifications pool
const DEMO_POOL: Omit<AppNotification, "id" | "time" | "read">[] = [
  { type: "support", title: "تذكرة دعم جديدة", body: "محمد أحمد: مرحبا عندي مشكلة بالشحن", link: "/support" },
  { type: "report", title: "بلاغ جديد", body: "بلاغ على المستخدم خالد بسبب إساءة", link: "/more/reports" },
  { type: "vip", title: "طلب VIP جديد", body: "سارة خالد تطلب ترقية حسابها لـ VIP", link: "/more/vip" },
  { type: "store", title: "طلب متجر جديد", body: "طلب شراء إطار ذهبي من فهد", link: "/more/store" },
  { type: "monitor", title: "رسالة مشبوهة", body: "رسالة تحتوي رقم واتساب بين أحمد ونورة", link: "/monitoring" },
  { type: "support", title: "رد على تذكرة #42", body: "العميل رد على تذكرة الدعم المفتوحة", link: "/support" },
  { type: "system", title: "مستخدم جديد", body: "تسجيل حساب جديد: علي محمد", link: "/more/registrations" },
  { type: "report", title: "بلاغ تحرش", body: "بلاغ جديد من نورة على مستخدم مجهول", link: "/more/reports" },
];

let notifCounter = 0;

function createDemoNotification(): AppNotification {
  const template = DEMO_POOL[Math.floor(Math.random() * DEMO_POOL.length)];
  return {
    ...template,
    id: `notif-${++notifCounter}`,
    time: new Date(),
    read: false,
  };
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

// Play notification sound
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

const STORAGE_KEY = "ghala_notifications";

function loadNotifications(): AppNotification[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((n: any) => ({ ...n, time: new Date(n.time) }));
  } catch {
    return [];
  }
}

function saveNotifications(notifs: AppNotification[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, 50)));
}

export function useNotifications(enabled = true) {
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);
  const [permissionGranted, setPermissionGranted] = useState(
    typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted"
  );
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notif: AppNotification) => {
    setNotifications(prev => {
      const updated = [notif, ...prev].slice(0, 50);
      saveNotifications(updated);
      return updated;
    });
    showBrowserNotification(notif);
    playSound();
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const enableBrowserNotifications = useCallback(async () => {
    const granted = await requestPermission();
    setPermissionGranted(granted);
    return granted;
  }, []);

  // Demo mode: generate random notifications every 15-30s
  useEffect(() => {
    if (!enabled) return;
    
    // Add initial demo notifications
    const isDemoMode = localStorage.getItem("ghala_demo") === "1";
    if (isDemoMode && notifications.length === 0) {
      const initial = Array.from({ length: 5 }, () => {
        const n = createDemoNotification();
        n.time = new Date(Date.now() - Math.random() * 3600000);
        return n;
      }).sort((a, b) => b.time.getTime() - a.time.getTime());
      setNotifications(initial);
      saveNotifications(initial);
    }

    if (isDemoMode) {
      intervalRef.current = setInterval(() => {
        const notif = createDemoNotification();
        addNotification(notif);
      }, 15000 + Math.random() * 15000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    permissionGranted,
    enableBrowserNotifications,
  };
}
