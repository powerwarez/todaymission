import { redirect } from 'react-router';

// 로그인 페이지
export { default as Login } from './routes/login';
export { loader as loginLoader } from './routes/login';

// 루트 경로 리디렉션
export async function loader() {
  return redirect('/dashboard');
}

// 대시보드 레이아웃
export { default as Dashboard } from './routes/_dashboard';
export { loader as dashboardLoader } from './routes/_dashboard';

// 오늘의 미션 페이지
export { default as TodayMission } from './routes/_dashboard.dashboard';
export { loader as todayMissionLoader } from './routes/_dashboard.dashboard';
export { action as todayMissionAction } from './routes/_dashboard.dashboard';

// 명예의 전당 페이지
export { default as HallOfFame } from './routes/_dashboard.hall-of-fame';
export { loader as hallOfFameLoader } from './routes/_dashboard.hall-of-fame';

// 도전과제 설정 페이지
export { default as Challenges } from './routes/_dashboard.challenges';
export { loader as challengesLoader } from './routes/_dashboard.challenges';
export { action as challengesAction } from './routes/_dashboard.challenges';
