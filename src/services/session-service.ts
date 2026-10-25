import { apiJson } from "@/services/http";

export type SessionResponse = { email: string | null };

export const sessionService = {
  get: () => apiJson<SessionResponse>("/api/session"),

  signIn: (email: string) =>
    apiJson<SessionResponse>("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),

  signOut: () =>
    apiJson<{ ok: boolean }>("/api/session", { method: "DELETE" }),
};
