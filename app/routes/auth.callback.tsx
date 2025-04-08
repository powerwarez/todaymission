import { redirect, type LoaderFunctionArgs } from "react-router";
import { getServerClient } from "../lib/server";

// 서버 측에서 코드 교환 및 리디렉션 처리
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard"; // 리디렉션 경로, 기본값은 /dashboard

  // 디버깅 로그
  console.log("AUTH CALLBACK LOADER: Received request", { url: request.url, code, next });

  if (code) {
    // 서버 클라이언트 생성 (요청 객체 전달)
    const { supabase, headers } = getServerClient(request);
    console.log("AUTH CALLBACK LOADER: Exchanging code for session...");

    // 코드를 세션으로 교환 시도
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.log("AUTH CALLBACK LOADER: Code exchange successful, redirecting to", next);
      // 성공 시 지정된 경로로 리디렉션 (Set-Cookie 헤더 포함)
      return redirect(next, {
        headers, // supabase 클라이언트가 설정한 Set-Cookie 헤더 전달
      });
    } else {
      console.error("AUTH CALLBACK LOADER: Code exchange error:", error);
      // 오류 발생 시 로그인 페이지로 리디렉션 (오류 메시지 전달 고려)
      // 에러 처리를 더 정교하게 할 수 있음 (예: 쿼리 파라미터로 에러 전달)
      return redirect("/login?error=auth_callback_failed");
    }
  }

  // 코드가 없는 경우 로그인 페이지로 리디렉션
  console.warn("AUTH CALLBACK LOADER: No code found, redirecting to login.");
  return redirect("/login?error=no_code_provided");
}

// 클라이언트 측 컴포넌트는 로딩 상태만 표시
export default function AuthCallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-primary-100 to-primary-200 p-4">
      <div className="bg-white rounded-3xl p-8 shadow-soft max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-2">인증 처리 중</h1>
          <p className="text-gray-600">잠시만 기다려 주세요...</p>
          <div className="mt-4">
            <div className="w-10 h-10 mx-auto rounded-full border-4 border-primary-300 border-t-transparent animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
