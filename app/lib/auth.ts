import { supabase } from "./server";
import { redirect } from "react-router";

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("세션 확인 중 오류:", error.message);
      return null;
    }

    return data.session;
  } catch (err) {
    console.error("세션 확인 중 예외 발생:", err);
    return null;
  }
}

export async function getUserId() {
  const session = await getSession();
  return session?.user?.id;
}

export async function requireAuth() {
  try {
    const session = await getSession();

    if (!session) {
      console.log("인증이 필요합니다. 로그인 페이지로 리다이렉트합니다.");
      throw redirect("/login");
    }

    return session;
  } catch (error) {
    if (error instanceof Response) {
      throw error; // redirect 응답은 그대로 전달
    }
    console.error("인증 확인 중 오류:", error);
    throw redirect("/login");
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return redirect("/login");
}

// OAuth 토큰을 URL에서 추출하고 세션 설정 (클라이언트용)
export async function setSessionFromHash(urlFragment: string) {
  if (!urlFragment) {
    return { success: false, error: "URL 파라미터가 없습니다." };
  }

  try {
    // URL 파라미터에서 토큰 추출
    let accessToken: string | null = null;
    let refreshToken: string | null = null;
    let provider = "kakao";

    console.log(
      "토큰 추출 시도 중, URL 파라미터:",
      urlFragment.substring(0, 20) + "..."
    );

    // Case 1: 해시로 시작하는 경우 (#access_token=...)
    if (urlFragment.startsWith("#")) {
      const hashParams = new URLSearchParams(urlFragment.substring(1));
      accessToken = hashParams.get("access_token");
      refreshToken = hashParams.get("refresh_token");
      provider = hashParams.get("provider") || "kakao";
    }
    // Case 2: 쿼리 파라미터로 시작하는 경우 (?access_token=...)
    else if (urlFragment.startsWith("?")) {
      const queryParams = new URLSearchParams(urlFragment);
      accessToken = queryParams.get("access_token");
      refreshToken = queryParams.get("refresh_token");
      provider = queryParams.get("provider") || "kakao";
    }
    // Case 3: 경로에 토큰이 있는 경우 (/access_token=...)
    else if (urlFragment.includes("access_token")) {
      const pathParams = new URLSearchParams(urlFragment);
      accessToken = pathParams.get("access_token");
      refreshToken = pathParams.get("refresh_token");
      provider = pathParams.get("provider") || "kakao";
    }

    if (!accessToken) {
      return { success: false, error: "토큰을 추출할 수 없습니다." };
    }

    console.log("토큰 추출 성공, 세션 설정 시도 중");

    // Supabase 세션 설정
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || "",
    });

    if (error) {
      console.error("세션 설정 중 오류:", error.message);
      return { success: false, error: error.message };
    }

    if (!data.session) {
      return {
        success: false,
        error: "세션 설정에 성공했으나 세션이 없습니다.",
      };
    }

    return { success: true, session: data.session };
  } catch (err) {
    console.error("세션 설정 중 예외 발생:", err);
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}
