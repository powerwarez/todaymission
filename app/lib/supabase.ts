import { createClient } from "@supabase/supabase-js";

const createSupabaseClient = () => {
  // Vite의 환경 변수 접근
  let supabaseUrl: string | undefined;
  let supabaseAnonKey: string | undefined;

  try {
    // 브라우저와 서버 모두에서 환경 변수 접근 시도
    supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  } catch (error) {
    console.error("환경 변수 접근 중 오류 발생:", error);
    throw new Error("환경 변수에 접근할 수 없습니다.");
  }

  // 환경 변수 유효성 검사
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Supabase 환경 변수가 설정되지 않았습니다. (.env 파일을 확인해주세요)"
    );
    console.error(
      "다음 환경 변수가 필요합니다: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY"
    );
    throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
  }

  // 유효한 환경 변수가 있으면 실제 클라이언트 생성
  return createClient(supabaseUrl, supabaseAnonKey);
};

// 클라이언트 생성
export const supabase = createSupabaseClient();

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
