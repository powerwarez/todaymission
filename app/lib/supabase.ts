import { createClient } from "@supabase/supabase-js";

// 환경 변수에서 Supabase URL과 Anon Key 가져오기 (Vite의 환경 변수 접근 방식)
const supabaseUrl: string = process.env.SUPABASE_URL as string;
const supabaseAnonKey: string = process.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "필수 환경 변수가 누락되었습니다. VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 반드시 설정해주세요."
  );
}

console.log("Supabase URL 존재 여부:", !!supabaseUrl);
console.log("Supabase Anon Key 존재 여부:", !!supabaseAnonKey);

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
