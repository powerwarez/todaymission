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

# Today Mission

이 프로젝트는 React Router 7.5를 사용한 SSR 지원 웹 애플리케이션입니다.

## Netlify 배포 방법

이 프로젝트는 Netlify에 SPA 방식으로 배포할 수 있습니다:

1. Netlify 사이트에 프로젝트를 연결합니다.
2. 빌드 설정:
   - 빌드 명령어: `npm run build`
   - 배포 디렉토리: `build/client`
3. 환경 변수 설정 (필요한 경우)

### 주의사항

이 프로젝트는 원래 SSR을 지원하도록 설계되었지만, Netlify에서는 SPA 방식으로 배포됩니다. 따라서 SSR 기능은 사용할 수 없습니다. SSR을 지원하려면 Vercel이나 Railway 같은 다른 호스팅 서비스를 고려해보세요.

## 로컬 개발

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 빌드 서버 실행
npm start
```
