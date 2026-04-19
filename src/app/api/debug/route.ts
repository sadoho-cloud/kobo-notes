export const runtime = "edge";

export async function GET() {
  return Response.json({
    has_AUTH_SECRET: !!process.env.AUTH_SECRET,
    has_AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
    has_AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    NODE_ENV: process.env.NODE_ENV,
  });
}
