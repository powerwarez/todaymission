# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

# 오늘의 미션

5~10세 아동의 습관 형성을 위한 미션 관리 애플리케이션입니다.

## 주요 기능

- **로그인**: Supabase Auth와 Kakao OAuth를 통한 인증
- **오늘의 미션**: 평일(월~금)별 미션 목록 확인 및 완료 체크
- **명예의 전당**: 획득한 배지와 주간 미션 달성 기록 확인
- **도전과제 설정**: 미션 설정 및 도전과제 확인

## 기술 스택

- **프론트엔드**: React, TypeScript, Tailwind CSS
- **라우팅**: React Router 7.5
- **백엔드**: Supabase (인증, 데이터베이스, 스토리지)
- **UI 컴포넌트**: 커스텀 UI 컴포넌트

## 설치 및 실행

```bash
# 의존성 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 배포 서버 실행
npm run start
```

## 데이터베이스 구조

Supabase에 다음 테이블이 있습니다:

- **missions**: 사용자의 미션 목록
- **mission_history**: 미션 달성 기록
- **badges**: 도전과제 배지 정보
- **user_badges**: 사용자가 획득한 배지
- **challenges**: 도전과제 설정

## 배지 이미지

배지 이미지는 Supabase Storage의 `badges` 버킷에 업로드되어 있습니다.

## 성공 효과

미션 달성 시 confetti 효과와 소리가 재생됩니다. `/Users/powerwarez/Desktop/todaymission/public/sounds/high_rune.flac` 파일이 있습니다.
