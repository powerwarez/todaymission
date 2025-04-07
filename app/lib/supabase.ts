import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase URL과 Anon Key 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수 확인 로그
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key 존재 여부:', !!supabaseAnonKey);

// 환경 변수가 없을 경우 오류 메시지 표시
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.');
}

// Supabase 클라이언트 생성
export const supabase = createClient(
  supabaseUrl as string,
  supabaseAnonKey as string
);

export type Mission = {
  id: number;
  user_id: string;
  title: string;
  weekday: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
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