import { supabase } from "@/integrations/supabase/client";

let cachedPublicKey: string | null = null;

async function getVapidPublicKey(): Promise<string | null> {
  if (cachedPublicKey) return cachedPublicKey;
  try {
    const { data, error } = await supabase.functions.invoke("vapid-public-key");
    if (error) throw error;
    cachedPublicKey = data?.publicKey || null;
    return cachedPublicKey;
  } catch (err) {
    console.error("Failed to fetch VAPID key:", err);
    return null;
  }
}

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

    const vapidKey = await getVapidPublicKey();
    if (!vapidKey) {
      console.error("VAPID public key not available");
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });
    }

    if (!subscription) {
      console.log("Could not create push subscription");
      return false;
    }

    const subJson = subscription.toJSON();

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
