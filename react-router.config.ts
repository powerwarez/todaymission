import type { Config } from "@react-router/dev/config";

export default {
  future: {},
  basename: "",
  
  // 애플리케이션 라우트 구성
  appDirectory: "app", // 앱 디렉토리 경로
  
  // SSR 설정
  ssr: true,
  
  // 라우트 구성 대신 파일 기반 라우팅 사용
} satisfies Config;
