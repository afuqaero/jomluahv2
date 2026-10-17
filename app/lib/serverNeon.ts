import { createClient } from "@neondatabase/neon-js";
import { auth } from "./auth/server";

const dataApiUrl = process.env.NEON_DATA_API_URL;

export async function createRouteNeonClient() {
  const [{ data: session, error: sessionError }, tokenResult] = await Promise.all([
    auth.getSession(),
    auth.token(),
  ]);

  const accessToken = tokenResult.data?.token ?? null;
  const dataClient = createClient({
    dataApi: {
      url: dataApiUrl ?? "https://placeholder.invalid/rest/v1",
      getToken: async () => accessToken,
    },
  });

  return {
    auth: {
      async getUser() {
        return {
          data: { user: session?.user ?? null },
          error: sessionError ?? null,
        };
      },
    },
    from: dataClient.from.bind(dataClient),
  };
}
