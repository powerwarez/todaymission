import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";
import { requireAuth, getClientSession } from "../lib/auth";
import { useTheme } from "../lib/theme-context";
import { cn } from "../lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "../lib/server";

export async function loader() {
  // 서버 측 인증 확인
  const session = await requireAuth();
  return {
    userId: session.user.id,
  };
}

export default function DashboardLayout() {
  const { themeColor } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  // 클라이언트 측에서도 세션 상태 확인
  useEffect(() => {
    async function checkSession() {
      try {
        setIsLoading(true);
        console.log("대시보드: 세션 확인 중...");

        // 세션이 있는지 확인
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          console.log(
            "대시보드: 세션이 존재하지 않음, 로그인 페이지로 리디렉션"
          );

          // 로컬 스토리지에서 클라이언트 세션 확인
          const clientSession = getClientSession();

          if (!clientSession) {
            console.log("대시보드: 클라이언트 세션도 없음");
            window.location.href = "/login";
            return;
          }

          console.log("대시보드: 로컬 스토리지에서 세션 발견, 세션 설정 시도");

          // 로컬 스토리지에 세션이 있다면 세션 복구 시도
          try {
            const { data: setSessionData, error: setSessionError } =
              await supabase.auth.setSession({
                access_token: clientSession.access_token,
                refresh_token: clientSession.refresh_token || "",
              });

            if (setSessionError) {
              console.error("대시보드: 세션 복구 실패", setSessionError);
              window.location.href = "/login";
              return;
            }

            if (setSessionData.session) {
              console.log("대시보드: 세션 복구 성공");
            } else {
              console.log("대시보드: 세션 복구 시도했지만 세션이 없음");
              window.location.href = "/login";
              return;
            }
          } catch (sessionErr) {
            console.error("대시보드: 세션 복구 중 오류", sessionErr);
            window.location.href = "/login";
            return;
          }
        } else {
          console.log(
            "대시보드: 세션 확인됨, 사용자 ID:",
            data.session.user.id
          );
        }

        setIsLoading(false);
      } catch (err) {
        console.error("대시보드: 세션 확인 중 오류", err);
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-primary-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary-300 border-t-transparent animate-spin mb-4"></div>
          <p className="text-primary-700">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-screen", `bg-theme-${themeColor}`)}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
