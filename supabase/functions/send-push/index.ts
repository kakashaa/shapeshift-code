import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Web Push helpers using Web Crypto API
async function importVapidKeys(publicKeyB64: string, privateKeyB64: string) {
  const privateKeyRaw = base64UrlToUint8Array(privateKeyB64);
  const publicKeyRaw = base64UrlToUint8Array(publicKeyB64);
  
  // Build JWK from raw keys
  const jwk = {
    kty: "EC",
    crv: "P-256",
    x: uint8ArrayToBase64Url(publicKeyRaw.slice(1, 33)),
    y: uint8ArrayToBase64Url(publicKeyRaw.slice(33, 65)),
    d: uint8ArrayToBase64Url(privateKeyRaw),
  };

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  return key;
}

function base64UrlToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(b64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function uint8ArrayToBase64Url(arr: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createJwt(privateKey: CryptoKey, audience: string): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60,
    sub: "mailto:admin@ghalat.live",
  };

  const encodedHeader = uint8ArrayToBase64Url(
    new TextEncoder().encode(JSON.stringify(header))
  );
  const encodedPayload = uint8ArrayToBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  );

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(signingInput)
  );

  // Convert DER signature to raw r||s format
  const rawSig = derToRaw(new Uint8Array(signature));
  const encodedSignature = uint8ArrayToBase64Url(rawSig);

  return `${signingInput}.${encodedSignature}`;
}

function derToRaw(der: Uint8Array): Uint8Array {
  // Sometimes crypto.subtle returns raw format directly (64 bytes)
  if (der.length === 64) return der;
  
  const raw = new Uint8Array(64);
  let offset = 2;
  
  let rLen = der[offset + 1];
  let rOffset = offset + 2;
  if (rLen === 33) { rOffset++; rLen = 32; }
  raw.set(der.slice(rOffset, rOffset + 32), 0);
  
  offset = rOffset + rLen;
  let sLen = der[offset + 1];
  let sOffset = offset + 2;
  if (sLen === 33) { sOffset++; sLen = 32; }
  raw.set(der.slice(sOffset, sOffset + 32), 32);
  
  return raw;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error("VAPID keys not configured");
    }

    const { title, body, icon, url, tag } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all subscriptions
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (error) throw error;
    if (!subscriptions?.length) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No subscriptions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const privateKey = await importVapidKeys(VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    
    const payload = JSON.stringify({
      title: title || "GhalaLive",
      body: body || "إشعار جديد",
      icon: icon || "/pwa-192x192.png",
      data: { url: url || "/" },
      tag: tag || "default",
    });

    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        const endpoint = sub.endpoint;
        const audience = new URL(endpoint).origin;
        const jwt = await createJwt(privateKey, audience);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Encoding": "aes128gcm",
            Authorization: `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
            TTL: "86400",
          },
          body: new TextEncoder().encode(payload),
        });

        if (response.status === 201 || response.status === 200) {
          sent++;
        } else if (response.status === 404 || response.status === 410) {
          expiredEndpoints.push(sub.endpoint);
          failed++;
        } else {
          console.error(`Push failed for ${endpoint}: ${response.status}`);
          failed++;
        }
        await response.text(); // consume body
      } catch (e) {
        console.error("Push error:", e);
        failed++;
      }
    }

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);
    }

    return new Response(
      JSON.stringify({ success: true, sent, failed, total: subscriptions.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
