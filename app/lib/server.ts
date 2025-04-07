import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

// 기본 Supabase 클라이언트 - 단순 인증 체크 용도로 사용
export const supabase = createClient(
  process.env.SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL ||
    "https://example.supabase.co",
  process.env.SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "your-anon-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

// 서버 환경에서 쿠키 기반 Supabase 클라이언트 생성
export const getServerClient = (request: Request) => {
  const headers = new Headers();
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          const cookies = request.headers.get("Cookie") || "";
          const cookie = cookies
            .split(";")
            .find((c) => c.trim().startsWith(`${name}=`));

          if (!cookie) return null;

          const value = cookie.split("=")[1];
          return decodeURIComponent(value);
        },
        set(name, value, options) {
          headers.append(
            "Set-Cookie",
            `${name}=${encodeURIComponent(value)}; Path=/; ${
              options?.maxAge ? `Max-Age=${options.maxAge};` : ""
            } ${options?.domain ? `Domain=${options.domain};` : ""} ${
              options?.sameSite ? `SameSite=${options.sameSite};` : ""
            } ${options?.httpOnly ? "HttpOnly;" : ""} ${
              options?.secure ? "Secure;" : ""
            }`
          );
        },
        remove(name, options) {
          headers.append(
            "Set-Cookie",
            `${name}=; Max-Age=0; Path=/; ${
              options?.domain ? `Domain=${options.domain};` : ""
            } ${options?.sameSite ? `SameSite=${options.sameSite};` : ""} ${
              options?.httpOnly ? "HttpOnly;" : ""
            } ${options?.secure ? "Secure;" : ""}`
          );
        },
      },
    }
  );

  return { supabase, headers };
};

// 타입 정의
export type Mission = {
  id: number;
  user_id: string;
  title: string;
  weekday: "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
  completed: boolean;
  created_at: string;
};

export type Badge = {
  id: number;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
};

export type UserBadge = {
  id: number;
  user_id: string;
  badge_id: number;
  acquired_at: string;
  badge?: Badge;
};

export type MissionHistory = {
  id: number;
  user_id: string;
  mission_id: number;
  completed_at: string;
  week_number: number;
  year: number;
  mission?: Mission;
};

export type Challenge = {
  id: number;
  title: string;
  description: string;
  badge_id: number;
  conditions: {
    type: string;
    count: number;
  };
  badge?: Badge;
};
