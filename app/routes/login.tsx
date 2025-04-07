import { redirect } from "react-router";
import { supabase } from "../lib/server";
import { getSession } from "../lib/auth";
import { useEffect, useState } from "react";

export async function loader() {
  const session = await getSession();

  if (session) {
    return redirect("/dashboard");
  }

  return {};
}

export default function Login() {
  const [redirectUrl, setRedirectUrl] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 클라이언트 사이드에서만 window 객체 접근
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setRedirectUrl(`${window.location.origin}/dashboard`);
    }
    setIsLoading(false);
  }, []);

  const handleKakaoLogin = async () => {
    if (!redirectUrl) return;

    setIsLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary-100 to-primary-200 p-4">
      <div className="bg-white rounded-3xl p-8 shadow-soft max-w-md w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">
            오늘의 미션
          </h1>
          <p className="text-gray-600">매일매일 습관을 만들어가요!</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          isClient && (
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleKakaoLogin}
                className="w-full bg-[#FEE500] text-[#000000] py-3 px-4 rounded-full font-semibold flex items-center justify-center"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9 0.5C4.41 0.5 0.5 3.507 0.5 7.261C0.5 9.443 1.807 11.387 3.86 12.52C3.73 12.95 3.15 14.772 3.076 15.025C2.987 15.335 3.234 15.631 3.537 15.505C3.771 15.408 5.909 13.968 6.648 13.496C7.382 13.615 8.189 13.676 9 13.676C13.59 13.676 17.5 10.669 17.5 7.261C17.5 3.507 13.59 0.5 9 0.5Z"
                    fill="black"
                  />
                </svg>
                <span>카카오로 로그인</span>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
