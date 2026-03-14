const API_BASE = "https://galachat.site/admin-panel-api.php";

export function isDemoMode(): boolean {
  return localStorage.getItem("ghala_demo") === "1";
}

export function setDemoMode(on: boolean) {
  if (on) localStorage.setItem("ghala_demo", "1");
  else localStorage.removeItem("ghala_demo");
}

function getToken(): string | null {
  return localStorage.getItem("ghala_token");
}

export function getSessionType(): "admin" | "user" | null {
  return localStorage.getItem("ghala_type") as "admin" | "user" | null;
}

export function getSessionName(): string {
  return localStorage.getItem("ghala_name") || "";
}

export function saveSession(token: string, type: string, name: string, extra?: Record<string, string>) {
  localStorage.setItem("ghala_token", token);
  localStorage.setItem("ghala_type", type);
  localStorage.setItem("ghala_name", name);
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => localStorage.setItem(`ghala_${k}`, v));
  }
}

export function clearSession() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith("ghala_"));
  keys.forEach(k => localStorage.removeItem(k));
  localStorage.removeItem("ghala_demo");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// Helper to safely extract array data from API response
function extractArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    // Try common wrapper keys
    for (const key of ["data", "list", "items", "results", "messages", "users", "charges", "reports", "requests"]) {
      if (Array.isArray(data[key])) return data[key];
    }
  }
  return [];
}

async function request<T>(action: string, params: Record<string, any> = {}, method: "GET" | "POST" = "GET"): Promise<T> {
  // In demo mode: POST actions return success, GET actions throw to trigger mock data in catch blocks
  if (isDemoMode()) {
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300));
    if (method === "POST") return { success: true, message: "تم (وضع تجريبي)" } as T;
    throw new Error("DEMO_MODE");
  }

  const token = getToken();
  
  const url = method === "GET"
    ? `${API_BASE}?${new URLSearchParams({ action, ...(token ? { token } : {}), ...params }).toString()}`
    : `${API_BASE}?action=${action}`;
  
  const options: RequestInit = method === "POST" ? {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, ...(token ? { token } : {}) }),
  } : {};

  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.success === false) {
    if (data.error === "unauthorized") {
      clearSession();
      window.location.href = "/login";
    }
    throw new Error(data.message || "حدث خطأ");
  }
  return data;
}

// Safe array request - ensures result is always an array
async function requestArray<T>(action: string, params: Record<string, any> = {}, method: "GET" | "POST" = "GET"): Promise<T[]> {
  const data = await request<any>(action, params, method);
  return extractArray(data) as T[];
}

// Auth
export const api = {
  // Login
  adminLogin: (username: string, password: string) =>
    request<{ success: boolean; token: string; name: string; role: string; type: string }>("login", { username, password }, "POST"),
  
  userLoginRequest: (uuid: string) =>
    request<{ success: boolean; message: string }>("user_login_request", { uuid }, "POST"),
  
  userLoginVerify: (uuid: string, code: string) =>
    request<{ success: boolean; token: string; name: string; uuid: string; avatar: string; type: string }>("user_login_verify", { uuid, code }, "POST"),

  // Dashboard
  dashboardStats: () =>
    request<{ online: number; charges_today: number; open_support: number; new_reports: number }>("dashboard_stats"),
  
  activityFeed: (limit = 20) =>
    requestArray<{ type: string; text: string; time: string; link: string }>("activity_feed", { limit }),

  // Badge counts
  badgeCounts: () =>
    request<{ reports: number; vip: number; store: number; admin_chat_unread: number }>("badge_counts"),

  // Support
  supportList: (status = "open") =>
    requestArray<any>("support_list", { status }),
  
  supportChat: (ticket_id: number) =>
    request<any>("support_chat", { ticket_id }),
  
  supportReply: (ticket_id: number, message: string) =>
    request<{ success: boolean }>("support_reply", { ticket_id, message }, "POST"),
  
  supportClose: (ticket_id: number) =>
    request<{ success: boolean }>("support_close", { ticket_id }, "POST"),

  // Suspicious messages
  suspiciousMessages: (limit = 50) =>
    requestArray<any>("suspicious_messages", { limit }),
  
  banUser: (uuid: string, reason: string) =>
    request<{ success: boolean; message: string }>("ban_user", { uuid, reason }, "POST"),
  
  ignoreMessage: (msg_id: number) =>
    request<{ success: boolean }>("ignore_message", { msg_id }, "POST"),

  // Finance
  charges: (date: string, type = "all") =>
    request<{ stats: { total_usd: number; count: number }; charges: Array<any> }>("charges", { date, type }),
  
  salaries: (month: string) =>
    request<{ stats: any; users: Array<any> }>("salaries", { month }),
  
  salaryDetail: (uuid: string, month: string) =>
    request<any>("salary_detail", { uuid, month }),

  // Notifications
  sendDm: (to_uuid: string, message: string) =>
    request<any>("send_dm", { to_uuid, message }, "POST"),
  
  broadcast: (message: string) =>
    request<any>("broadcast", { message }, "POST"),
  
  notificationLog: (limit = 50) =>
    requestArray<any>("notification_log", { limit }),

  // Gift audit
  giftSent: (uuid: string, from: string, to: string) =>
    request<any>("gift_sent", { uuid, from, to }),
  
  giftReceived: (uuid: string, from: string, to: string) =>
    request<any>("gift_received", { uuid, from, to }),

  // Admin chat
  adminChat: (since = 0, limit = 100) =>
    requestArray<any>("admin_chat", { since, limit }),
  
  adminChatSend: (message: string) =>
    request<{ success: boolean; id: number }>("admin_chat_send", { message }, "POST"),

  // Reports
  reports: (status = "pending") =>
    requestArray<any>("reports", { status }),
  
  reportAction: (report_id: number, action: "approve" | "reject") =>
    request<any>("report_action", { report_id, action }, "POST"),

  // VIP requests
  vipRequests: () =>
    requestArray<any>("vip_requests"),
  
  vipAction: (request_id: number, action: "approve" | "reject") =>
    request<any>("vip_action", { request_id, action }, "POST"),

  // Store requests
  storeRequests: (type = "all") =>
    requestArray<any>("store_requests", { type }),
  
  storeApprove: (request_id: number) =>
    request<any>("store_approve", { request_id }, "POST"),
  
  storeReject: (request_id: number, reason: string) =>
    request<any>("store_reject", { request_id, reason }, "POST"),

  // User search
  userSearch: (q: string) =>
    requestArray<any>("user_search", { q }),
  
  userDetail: (uuid: string) =>
    request<any>("user_detail", { uuid }),
  
  userBan: (uuid: string, reason: string) =>
    request<any>("user_ban", { uuid, reason }, "POST"),
  
  userUnban: (uuid: string) =>
    request<any>("user_unban", { uuid }, "POST"),
  
  addDiamonds: (uuid: string, amount: number) =>
    request<any>("add_diamonds", { uuid, amount }, "POST"),

  // Activity log
  activityLog: (admin = "all", date: string, limit = 100) =>
    requestArray<any>("activity_log", { admin, date, limit }),

  // User profile (for user type)
  userProfile: () =>
    request<any>("user_profile"),

  // ID change requests
  idChangeRequests: () =>
    requestArray<any>("id_change_requests"),
  
  idChangeAction: (request_id: number, action: "approve" | "reject") =>
    request<any>("id_change_action", { request_id, action }, "POST"),

  // New registrations
  newRegistrations: (limit = 50) =>
    requestArray<any>("new_registrations", { limit }),

  // Admin Notifications
  adminNotifications: (params: { limit?: number; category?: string } = {}) =>
    request<any>("admin_notifications", params),
  adminNotificationsUnread: () =>
    request<any>("admin_notifications_unread"),
  adminNotificationRead: (notification_id: string) =>
    request<any>("admin_notification_read", { notification_id }, "POST"),
  adminNotificationsReadAll: (category?: string) =>
    request<any>("admin_notifications_read_all", category ? { category } : {}, "POST"),

  // V2: User login with password (HMAC)
  userLoginPassword: (uuid: string, password: string) =>
    request<any>("user_login_password", { uuid, password }, "POST"),

  // V2: Password change
  changePassword: (old_password: string, new_password: string, phone?: string) =>
    request<any>("change_password", { old_password, new_password, ...(phone ? { phone } : {}) }, "POST"),

  // V2: Admin accounts (owner only)
  adminAccounts: () =>
    request<any>("admin_accounts"),
  adminAccountCreate: (data: Record<string, any>) =>
    request<any>("admin_account_create", data, "POST"),
  adminAccountUpdate: (username: string, data: Record<string, any>) =>
    request<any>("admin_account_update", { username, ...data }, "POST"),
  adminAccountDelete: (username: string) =>
    request<any>("admin_account_delete", { username }, "POST"),

  // V2: Admin notes (owner only)
  adminNotes: (target_type: string, target_id: string) =>
    request<any>("admin_notes", { target_type, target_id }),
  adminNoteAdd: (target_type: string, target_id: string, note: string) =>
    request<any>("admin_notes", { target_type, target_id, note }, "POST"),

  // V2: Trash (owner only)
  trashList: (type?: string) =>
    request<any>("trash_list", type ? { type } : {}),
  trashRestore: (trash_id: string) =>
    request<any>("trash_restore", { trash_id }, "POST"),
  trashDelete: (trash_id: string) =>
    request<any>("trash_delete", { trash_id }, "POST"),

  // V2: On duty
  onDuty: () =>
    request<any>("on_duty"),

  // V2: Chat system
  chatList: () =>
    request<any>("chat_list"),
  chatMessages: (chat_id: string, limit = 100) =>
    request<any>("chat_messages", { chat_id, limit }),
  chatSend: (chat_id: string, message: string, msg_type = "text", media_url = "") =>
    request<any>("chat_send", { chat_id, message, msg_type, media_url }, "POST"),
  chatRename: (chat_id: string, name: string) =>
    request<any>("chat_rename", { chat_id, name }, "POST"),
  chatDeleteMessage: (chat_id: string, message_id: string) =>
    request<any>("chat_delete_message", { chat_id, message_id }, "POST"),

  // V2: Request/Ticket system
  submitRequest: (type: string, description: string, priority = "normal") =>
    request<any>("submit_request", { type, description, priority }, "POST"),
  requestList: (status?: string) =>
    request<any>("request_list", status ? { status } : {}),
  requestRespond: (request_id: string, response: string, status?: string) =>
    request<any>("request_respond", { request_id, response, ...(status ? { status } : {}) }, "POST"),

  // V2: AI Assistant
  aiAssistant: (question: string) =>
    request<any>("ai_assistant", { question }, "POST"),
};
// rebuild 1773494525
