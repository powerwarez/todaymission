import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type Request as ExpressRequest, type Response as ExpressResponse } from "express";

export function createSupabaseServerClient(req: ExpressRequest, res: ExpressResponse) {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(key: string) {
          return req.cookies[key];
        },
        set(key: string, value: string, options: CookieOptions) {
          res.cookie(key, value, options);
        },
        remove(key: string, options: CookieOptions) {
          res.clearCookie(key, options);
        },
      },
    },
  );
} 