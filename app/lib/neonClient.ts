import { createInternalNeonAuth } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";
import { createClient } from "@neondatabase/neon-js";

const neonBaseUrl = process.env.NEXT_PUBLIC_NEON_URL;

if (!neonBaseUrl) {
  console.warn(
    "NEXT_PUBLIC_NEON_URL is missing. Neon requests will fail until it is configured."
  );
}

// Pin browser auth to our same-origin proxy. The SDK's automatic URL
// discovery can pick up an unrelated Better Auth URL from the deployment
// environment, producing a misleading HTTP 404 during getSession().
const authBaseUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/auth`
    : "http://localhost/api/auth";
const authRuntime = createInternalNeonAuth(authBaseUrl, {
  adapter: BetterAuthReactAdapter(),
});
const authClient = authRuntime.adapter;

function getDataApiUrl(baseUrl: string) {
  const url = new URL(baseUrl);

  // Accept either the Neon endpoint (`...neon.tech/neondb`) or the full
  // Data API endpoint (`...apirest.../neondb/rest/v1`). This keeps Vercel
  // configuration compatible with the URL copied from Neon’s dashboard.
  if (url.hostname.split(".").includes("apirest") || url.pathname.endsWith("/rest/v1")) {
    return url.toString().replace(/\/$/, "");
  }

  const labels = url.hostname.split(".");
  labels.splice(1, 0, "apirest");
  url.hostname = labels.join(".");
  url.pathname = `${url.pathname.replace(/\/$/, "")}/rest/v1`;
  return url.toString();
}

async function getAccessToken() {
  // Neon Data API requires the JWT issued by Neon Auth. Better Auth's
  // `token()` response is not the Data API JWT; use the Neon adapter's
  // documented JWT accessor instead.
  return (await authRuntime.getJWTToken()) ?? null;
}

const dataClient = createClient({
  dataApi: {
    url: neonBaseUrl
      ? getDataApiUrl(neonBaseUrl)
      : "https://placeholder.invalid/rest/v1",
    getToken: getAccessToken,
  },
});

export async function syncPendingProfile(user: { id: string; email: string }) {
  if (typeof window === "undefined") return;

  const raw = localStorage.getItem("jl_pending_profile");
  if (!raw) return;

  try {
    const pending = JSON.parse(raw) as {
      email?: string;
      full_name?: string;
      student_id?: string;
    };
    if (pending.email?.toLowerCase() !== user.email.toLowerCase()) return;

    const { error } = await dataClient.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: pending.full_name?.trim() || null,
      student_id: pending.student_id?.trim() || null,
    });
    if (!error) localStorage.removeItem("jl_pending_profile");
  } catch {
    localStorage.removeItem("jl_pending_profile");
  }
}

async function getCompatibleSession() {
  const { data, error } = await authClient.getSession();
  if (error || !data?.user) {
    return { data: { session: null }, error: error ?? null };
  }

  const accessToken = await getAccessToken();
  return {
    data: {
      session: {
        ...data.session,
        user: data.user,
        access_token: accessToken ?? "",
      },
    },
    error: null,
  };
}

export const neon = {
  auth: {
    async signUp({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: {
        emailRedirectTo?: string;
        data?: { full_name?: string; student_id?: string };
      };
    }) {
      const result = await authClient.signUp.email({
        email,
        password,
        name: options?.data?.full_name?.trim() || email,
        callbackURL: options?.emailRedirectTo,
      });
      if (result.error) return { data: null, error: result.error };
      const session = await getCompatibleSession();
      return {
        data: {
          user: result.data?.user ?? session.data.session?.user ?? null,
          session: session.data.session,
        },
        error: null,
      };
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) return { data: { user: null, session: null }, error: result.error };
      const session = await getCompatibleSession();
      return {
        data: {
          user: session.data.session?.user ?? result.data?.user ?? null,
          session: session.data.session,
        },
        error: session.error,
      };
    },

    getSession: getCompatibleSession,

    async getUser() {
      const { data, error } = await getCompatibleSession();
      return { data: { user: data.session?.user ?? null }, error };
    },

    async signOut() {
      const { data, error } = await authClient.signOut();
      return { data, error };
    },
  },

  from: dataClient.from.bind(dataClient),
};
