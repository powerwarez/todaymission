import { redirect } from "react-router";
import { supabase } from "../lib/server";
import { useEffect, useState } from "react";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 해시 프래그먼트에서 토큰 처리
    const handleAuthCallback = async () => {
      try {
        // Supabase가 URL 해시에서 토큰을 감지하고 처리하도록 함
        const { data, error: sessionError } = await supabase.auth.getSession();

        // 콘솔에 디버그 정보 출력
        console.log(
          "Auth callback session check:",
          data?.session ? "Session exists" : "No session"
        );

        if (sessionError) {
          console.error("Auth callback error:", sessionError.message);
          setError("로그인 처리 중 오류가 발생했습니다.");
          return;
        }

        if (data.session) {
          // 세션이 설정되었으면 대시보드로 이동
          window.location.href = "/dashboard";
        } else {
          // URL에서 OAuth 토큰 처리 시도
          if (
            window.location.hash &&
            window.location.hash.includes("access_token")
          ) {
            const hashParams = new URLSearchParams(
              window.location.hash.substring(1) // '#' 문자 제거
            );

            const accessToken = hashParams.get("access_token");
            const refreshToken = hashParams.get("refresh_token");
            const expiresIn = hashParams.get("expires_in");

            if (accessToken) {
              console.log(
                "Found access token in URL, setting session manually"
              );

              // 세션 설정 시도
              const { data: sessionData, error: setSessionError } =
                await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || "",
                });

              if (setSessionError) {
                console.error(
                  "Error setting session:",
                  setSessionError.message
                );
                setError("세션 설정에 실패했습니다.");
                return;
              }

              if (sessionData.session) {
                // 세션이 성공적으로 설정되면 대시보드로 이동
                window.location.href = "/dashboard";
                return;
              }
            }
          }

          // 그 외의 경우 로그인 페이지로 이동
          console.log(
            "No session found after auth callback, redirecting to login"
          );
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Auth callback exception:", err);
        setError("예기치 않은 오류가 발생했습니다.");
      }
    };

    // 페이지 로드 시 인증 콜백 처리 실행
    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">로그인 처리 중...</p>
          </>
        )}
      </div>
    </div>
  );
}
