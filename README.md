# demo-shop

Nx 모노레포 기반의 전시·쇼핑몰 관리 시스템입니다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 모노레포 | Nx |
| 백엔드 | NestJS, Prisma 7, PostgreSQL |
| 프론트엔드 | Angular 21, Tailwind CSS 4, DaisyUI 5 |
| 인증 | JWT (accessToken 1h / refreshToken 7d), bcrypt, Kakao OAuth |
| 파일 스토리지 | Supabase Storage |

## 프로젝트 구조

```
apps/
  server/       — NestJS API 서버 (포트 3000)
  admin/        — 관리자 패널 (포트 4200)
  client/       — 고객 공개 페이지 (포트 4201)
libs/
  common/       — 앱 간 공유 타입·상수 (PaginatedResult, PageInfo 등)
  api-client/   — API 호출 클라이언트
  ui/           — 공용 UI 컴포넌트
prisma/
  models/       — 모델별 분리된 스키마
  migrations/   — DB 마이그레이션 이력
  seed.ts       — 초기 관리자 계정 생성
```

## 앱별 기능

### server

| 모듈 | 엔드포인트 | 설명 |
|---|---|---|
| admin | `POST /admin/signin` | 관리자 로그인 |
| admin | `GET /admin/me` | 내 정보 조회 |
| admin | `POST /admin/refresh` | 액세스 토큰 재발급 |
| admin | `POST /admin/logout` | 로그아웃 |
| customer | `GET /client/kakao/login` | 카카오 로그인 URL 발급 |
| customer | `GET /client/kakao/callback` | 카카오 OAuth 콜백 |
| customer | `GET /client/me` | 내 정보 조회 |
| customer | `PATCH /client/me` | 닉네임 수정 |
| notice | `GET /notice/search` | 공지사항 목록 검색 (관리자) |
| notice | `GET /public/notices` | 공지사항 목록 (공개) |
| faq | `GET /faq/search` | FAQ 목록 검색 (관리자) |
| faq | `GET /public/faqs` | FAQ 목록 (공개) |
| inquiry | `POST /inquiry` | 문의 등록 (비밀글은 로그인 필요) |
| inquiry | `GET /inquiry/search` | 문의 목록 (관리자) |
| gallery | `GET /gallery/search` | 갤러리 목록 검색 |
| banner | `/banner/*` | 배너 CRUD |
| schedule | `/schedule/*` | 일정 CRUD |
| registration | `/registration/*` | 참가 신청 CRUD |
| exhibitor | `/exhibitor/*` | 참가사 CRUD |
| upload | `POST /upload/image` | 이미지 업로드 (Supabase) |

### admin

- 로그인 / 로그아웃
- 고객센터: 공지사항·FAQ·문의 관리 (CRUD + 고정·노출 토글)
- 전시: 갤러리·보도자료·일정·참가 신청·참가사 관리
- 사이트: 배너·약관 관리

### client

- 메인·소개 페이지
- 고객센터: 공지사항·FAQ·문의하기
- 갤러리·일정 조회
- 카카오 로그인 / 내 문의 조회

## 로컬 개발 환경

### 필수 조건

- Node.js
- PostgreSQL

### 환경 변수

`apps/server/.env` 파일 생성:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/demo_shop
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:4201

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
```

### 실행

```bash
# 의존성 설치
npm install

# DB 마이그레이션 및 시드
npm exec prisma migrate dev --config prisma.config.ts
npm exec prisma db seed --config prisma.config.ts

# 서버 실행 (터미널 1)
npm exec nx serve server

# 관리자 앱 실행 (터미널 2)
npm exec nx serve admin

# 고객 앱 실행 (터미널 3)
npm exec nx serve client
```

### Swagger

서버 실행 후 `http://localhost:3000/api` 에서 API 문서를 확인할 수 있습니다.

### Prisma Studio

```bash
npm exec prisma studio --config prisma.config.ts
```

## 브랜치 전략

```
main        — 배포 가능한 안정 상태
develop     — 통합 브랜치
feat/xxx    — 기능 개발
fix/xxx     — 버그 수정
```

작업은 `develop`에서 분기 → PR → `main` 병합 순서로 진행합니다.

## 유용한 명령어

```bash
# 전체 빌드
npm exec nx run-many -t build

# 서버만 빌드
npm exec nx run server:build

# 의존성 그래프 시각화
npm exec nx graph
```
