import { redirect } from "react-router";
import { supabase } from "../lib/server";
import { setSessionFromHash } from "../lib/auth";
import { getBrowserClient } from "../lib/browser-client";
import { useEffect, useState } from "react";

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [processingState, setProcessingState] = useState<string>("초기화 중");
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const handleAuthCallback = async () => {
      // 디버그 정보 수집
      const urlInfo = {
        hash: window.location.hash || "해시 없음",
        search: window.location.search || "쿼리 파라미터 없음",
        href: window.location.href,
      };
      console.log("URL 정보:", urlInfo);
      setDebugInfo(JSON.stringify(urlInfo, null, 2));

      // 1. URL 해시 확인
      setProcessingState("URL 분석 중");

      let accessToken = null;
      let refreshToken = null;

      // 1-1. 해시에서 토큰 찾기 (#access_token=...)
      if (
        window.location.hash &&
        window.location.hash.includes("access_token")
      ) {
        console.log("해시에서 토큰을 찾는 중...");
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        accessToken = hashParams.get("access_token");
        refreshToken = hashParams.get("refresh_token") || "";
        console.log("해시에서 토큰 추출:", accessToken ? "성공" : "실패");
      }

      // 1-2. 쿼리 파라미터에서 토큰 찾기 (?access_token=...)
      if (!accessToken && window.location.search) {
        console.log("쿼리 파라미터에서 토큰을 찾는 중...");
        const searchParams = new URLSearchParams(window.location.search);
        accessToken = searchParams.get("access_token");
        refreshToken = searchParams.get("refresh_token") || "";
        console.log(
          "쿼리 파라미터에서 토큰 추출:",
          accessToken ? "성공" : "실패"
        );
      }

      // 1-3. URL 경로에 숨겨진 토큰 찾기 (/auth-callback#/)
      if (
        !accessToken &&
        window.location.hash &&
        window.location.hash.startsWith("#/")
      ) {
        console.log("URL 경로에서 토큰을 찾는 중...");
        // 해시 경로 추출 (예: #/access_token=...)
        const hashPath = window.location.hash.substring(2); // #/ 제거
        if (hashPath.includes("access_token")) {
          const hashPathParams = new URLSearchParams(hashPath);
          accessToken = hashPathParams.get("access_token");
          refreshToken = hashPathParams.get("refresh_token") || "";
          console.log("URL 경로에서 토큰 추출:", accessToken ? "성공" : "실패");
        }
      }

      // 토큰을 찾지 못한 경우
      if (!accessToken) {
        console.error("URL에서 액세스 토큰을 찾을 수 없습니다.");
        setError("URL에서 액세스 토큰을 찾을 수 없습니다.");

        // 마지막으로 쿠키에서 세션 확인
        try {
          setProcessingState("세션 확인 중");
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            console.log("세션이 이미 존재함, 대시보드로 이동");
            window.location.href = "/dashboard";
            return;
          }
        } catch (err) {
          console.error("세션 확인 중 오류:", err);
        }

        // 세션이 없으면 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          window.location.href = "/login";
        }, 5000);
        return;
      }

      try {
        // 브라우저 기반 클라이언트 사용
        const browserClient = getBrowserClient();

        // 브라우저 클라이언트를 사용하여 세션 설정
        setProcessingState("브라우저 세션 설정 중");
        const { data, error: sessionError } =
          await browserClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

        if (sessionError) {
          console.error("브라우저 세션 설정 오류:", sessionError.message);

          // 서버 클라이언트로 다시 시도
          setProcessingState("서버 세션 설정 시도 중");
          const result = await setSessionFromHash(
            window.location.hash || window.location.search
          );

          if (!result.success) {
            console.error("서버 세션 설정 실패:", result.error);
            setError(`세션 설정 실패: ${result.error}`);

            // 마지막 세션 확인 시도
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session) {
              window.location.href = "/dashboard";
              return;
            }

            // 모든 시도 실패 시 로그인으로 이동
            setTimeout(() => {
              window.location.href = "/login";
            }, 5000);
            return;
          }
        }

        // 세션 설정 성공 확인
        setProcessingState("세션 확인 중");
        const { data: sessionData } = await browserClient.auth.getSession();

        if (sessionData?.session) {
          console.log("Session confirmed, redirecting to dashboard");
          setProcessingState("인증 성공, 대시보드로 이동 중");

          // 세션 저장 확인을 위해 약간 지연 후 이동
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1000);
        } else {
          console.error("No session found after setting");
          setError("세션 설정은 성공했으나 세션을 찾을 수 없습니다.");

          // 로그인으로 리디렉션
          setTimeout(() => {
            window.location.href = "/login";
          }, 5000);
        }
      } catch (err) {
        console.error("Auth callback exception:", err);
        setError(
          `예기치 않은 오류가 발생했습니다: ${
            err instanceof Error ? err.message : String(err)
          }`
        );

        // 오류 발생 시 로그인 페이지로 지연 이동
        setTimeout(() => {
          window.location.href = "/login";
        }, 5000);
      }
    };

    // 페이지 로드 시 인증 콜백 처리 실행
    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="text-red-500 mb-2 font-semibold">오류 발생</div>
            <div className="text-gray-700 mb-4">{error}</div>
            <div className="text-gray-500 text-sm">
              잠시 후 로그인 페이지로 이동합니다...
            </div>
            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <details>
                  <summary className="text-sm text-gray-500 cursor-pointer">
                    디버그 정보
                  </summary>
                  <pre className="mt-2 text-xs text-left overflow-auto max-h-40 p-2 bg-gray-100 rounded">
                    {debugInfo}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-soft p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium mb-2">로그인 처리 중...</p>
            <p className="text-gray-500 text-sm">{processingState}</p>
          </div>
        )}
      </div>
    </div>
  );
}
