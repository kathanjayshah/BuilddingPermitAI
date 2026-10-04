export const queryKeys = {
  session: ["session"] as const,
  permits: ["permits"] as const,
  norms: ["norms"] as const,
  reviews: ["reviews"] as const,
  highlights: (permitId: string) => ["highlights", permitId] as const,
  permitFile: (permitId: string) => ["permit-file", permitId] as const,
};
