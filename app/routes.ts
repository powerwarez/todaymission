import {
  type RouteConfig,
  route,
  index,
  layout,
} from "@react-router/dev/routes";
import { redirect } from "react-router";
import Login, { loader as loginLoader } from "./routes/login";
import Dashboard, { loader as dashboardLoader } from "./routes/_dashboard";
import TodayMission, {
  loader as todayMissionLoader,
  action as todayMissionAction,
} from "./routes/_dashboard.dashboard";
import HallOfFame, {
  loader as hallOfFameLoader,
} from "./routes/_dashboard.hall-of-fame";
import Challenges, {
  loader as challengesLoader,
  action as challengesAction,
} from "./routes/_dashboard.challenges";
import AuthCallback from "./routes/auth-callback";

// 로그인 페이지
export { default as Login } from "./routes/login";
export { loader as loginLoader } from "./routes/login";

// 인증 콜백 페이지
export { default as AuthCallback } from "./routes/auth-callback";

// 루트 경로 리디렉션
async function rootLoader() {
  return redirect("/dashboard");
}

// 대시보드 레이아웃
export { default as Dashboard } from "./routes/_dashboard";
export { loader as dashboardLoader } from "./routes/_dashboard";

// 오늘의 미션 페이지
export { default as TodayMission } from "./routes/_dashboard.dashboard";
export { loader as todayMissionLoader } from "./routes/_dashboard.dashboard";
export { action as todayMissionAction } from "./routes/_dashboard.dashboard";

// 명예의 전당 페이지
export { default as HallOfFame } from "./routes/_dashboard.hall-of-fame";
export { loader as hallOfFameLoader } from "./routes/_dashboard.hall-of-fame";

// 도전과제 설정 페이지
export { default as Challenges } from "./routes/_dashboard.challenges";
export { loader as challengesLoader } from "./routes/_dashboard.challenges";
export { action as challengesAction } from "./routes/_dashboard.challenges";

// React Router 7.5의 Framework 모드에서는 route, index, layout 함수를 사용하여 경로를 정의합니다.
export default [
  // 로그인 페이지
  route("login", "./routes/login.tsx"),

  // 인증 콜백 처리 라우트
  route("auth-callback", "./routes/auth-callback.tsx"),

  // 기본 경로에서 대시보드로 리디렉트
  route("/", "./routes/index.ts"),

  // 대시보드 레이아웃과 하위 라우트
  route("dashboard", "./routes/_dashboard.tsx", [
    // 대시보드 인덱스 페이지 (오늘의 미션)
    index("./routes/_dashboard.dashboard.tsx"),

    // 명예의 전당 페이지
    route("hall-of-fame", "./routes/_dashboard.hall-of-fame.tsx"),

    // 도전과제 설정 페이지
    route("challenges", "./routes/_dashboard.challenges.tsx"),
  ]),
] satisfies RouteConfig;
