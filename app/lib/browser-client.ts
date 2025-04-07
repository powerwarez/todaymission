import { createClient } from "@supabase/supabase-js";

// 브라우저 환경에서만 사용되는 Supabase 클라이언트
// localStorage를 사용하여 세션 유지를 보장
let browserClient: ReturnType<typeof createClient> | null = null;

export function getBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error(
      "getBrowserClient는 브라우저 환경에서만 사용할 수 있습니다."
    );
  }

  if (!browserClient) {
    // Supabase 환경 변수 가져오기
    const supabaseUrl =
      import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";

    const supabaseAnonKey =
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      "";

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase URL 또는 Anon Key가 제공되지 않았습니다.");
      throw new Error("Supabase 설정이 올바르지 않습니다.");
    }

    // 브라우저 환경에 최적화된 클라이언트 생성
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        storage: window.localStorage, // 명시적으로 localStorage 사용
      },
    });

    console.log("브라우저 Supabase 클라이언트가 초기화되었습니다.");
  }

  return browserClient;
}

export async function handleAuthChanges(
  callback: (event: "SIGNED_IN" | "SIGNED_OUT", session: any) => void
) {
  const client = getBrowserClient();

  client.auth.onAuthStateChange((event, session) => {
    console.log("Auth state changed:", event);
    if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
      callback(event, session);
    }
  });
}
