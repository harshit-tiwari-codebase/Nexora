const VERCEL_PROJECT_ORIGIN =
  /^https:\/\/nexora(?:-[a-z0-9-]+)?-coding-avenger\.vercel\.app$/i;

export const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const configuredOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((value) => value.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  return (
    configuredOrigins.includes(origin) ||
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin) ||
    VERCEL_PROJECT_ORIGIN.test(origin)
  );
};
