import { createAuthClient } from "@neondatabase/auth/next";
import { createClient } from "@neondatabase/neon-js";

const neonBaseUrl = process.env.NEXT_PUBLIC_NEON_URL;

if (!neonBaseUrl) {
  console.warn(
    "NEXT_PUBLIC_NEON_URL is missing. Neon requests will fail until it is configured."
  );
}

const authClient = createAuthClient();

function getDataApiUrl(baseUrl: string) {
  const url = new URL(baseUrl);
  const labels = url.hostname.split(".");
  labels.splice(1, 0, "apirest");
  url.hostname = labels.join(".");
  url.pathname = `${url.pathname.replace(/\/$/, "")}/rest/v1`;
  return url.toString();
}

async function getAccessToken() {
  const { data, error } = await authClient.token();
  if (error) return null;
  return data?.token ?? null;
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
