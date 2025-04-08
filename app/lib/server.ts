import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

// 기본 Supabase 클라이언트 - 단순 인증 체크 용도로 사용
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ||
    "",
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "",
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
  
  // 환경 변수 읽기 (import.meta.env 사용)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("getServerClient Error: Missing Supabase environment variables (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)");
    // 환경 변수가 없으면 클라이언트 생성 불가 -> 오류 발생 또는 빈 클라이언트 반환 등의 처리 필요
    // 여기서는 오류를 던지거나, 빈 헤더와 함께 null 클라이언트를 반환하는 것을 고려할 수 있음
    // 임시로 빈 객체 반환 (오류를 유발할 수 있음)
    // throw new Error("Missing Supabase environment variables for server client");
    return { supabase: null, headers }; 
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name) {
          const cookies = request.headers.get("Cookie") || "";
          const cookie = cookies
            .split(";")
            .find((c) => c.trim().startsWith(`${name}=`));
          if (!cookie) return undefined; // @supabase/ssr v1.0 이상에서는 null 대신 undefined 반환 권장
          const value = cookie.split("=")[1];
          return decodeURIComponent(value);
        },
        set(name, value, options) {
          try {
            headers.append("Set-Cookie", `${name}=${encodeURIComponent(value)}; Path=${options.path || '/'}; Max-Age=${options.maxAge}; SameSite=${options.sameSite || 'Lax'}; HttpOnly=${options.httpOnly !== false}; Secure=${options.secure !== false}${options.domain ? `; Domain=${options.domain}` : ''}`);
          } catch (error) {
            console.error(`Failed to set cookie ${name}`, error);
          }
        },
        remove(name, options) {
          try {
            headers.append("Set-Cookie", `${name}=; Path=${options.path || '/'}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly=${options.httpOnly !== false}; Secure=${options.secure !== false}${options.domain ? `; Domain=${options.domain}` : ''}`);
          } catch (error) {
             console.error(`Failed to remove cookie ${name}`, error);
          }
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
