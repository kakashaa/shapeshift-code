import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(): Promise<boolean> {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push not supported");
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return false;
    }

    const registration = await navigator.serviceWorker.ready;

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription && VAPID_PUBLIC_KEY) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
    }

    if (!subscription) {
      console.log("Could not create push subscription");
      return false;
    }

    const subJson = subscription.toJSON();

    // Store in database
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        endpoint: subJson.endpoint!,
        p256dh: subJson.keys!.p256dh!,
        auth: subJson.keys!.auth!,
        user_agent: navigator.userAgent,
      },
      { onConflict: "endpoint" }
    );

    if (error) {
      console.error("Failed to save subscription:", error);
      return false;
    }

    console.log("Push subscription saved successfully");
    return true;
  } catch (err) {
    console.error("Push subscription error:", err);
    return false;
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", endpoint);
    }
    return true;
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return false;
  }
}

export async function sendPushNotification(
  title: string,
  body: string,
  options?: { url?: string; tag?: string }
): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke("send-push", {
      body: { title, body, url: options?.url, tag: options?.tag },
    });

    if (error) throw error;
    return data?.success ?? false;
  } catch (err) {
    console.error("Send push error:", err);
    return false;
  }
}
