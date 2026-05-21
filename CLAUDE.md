<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

## admin 앱 번들 기준 (2026-05-14 측정)

- 초기 번들: ~343 KB (transfer ~83 KB)
- Tiptap (gallery-form lazy chunk): ~379 KB (transfer ~103 KB) — `/event/gallery/new`, `/event/gallery/:id/edit` 진입 시에만 로드
- 각 페이지 컴포넌트: 2–7 KB (모두 `loadComponent`로 lazy 분리)

# component 는 HTML 분리하기
# DB 스키마 수정 사항과 확인할 때 generate 까지 자동 실행
# Read 작업은 내 승인 없이 바로 진행
# 서버, admin, client 빌드는 테스트도 묻지 않고 자동 진행하기
리팩토링 가이드
Signal(시그널) 기반 아키텍처에서는, 모던 아키텍처(Domain-Driven / Feature-Based)
Pretty Print 또는 Object Formatting 
TypeScript/ESLint의 max-len 규칙이나 Prettier의 printWidth 설정
printWidth 이내여도 multi-line 적용
일관성, 중복성, 메모리 누수 억제
코드의 의도를 주석으로 간략하게 표시
private, readonly 누락 없게
Agular, NestJS의 native 코드 우선 사용
let, any 사용 금지
type 명시
component 최대화
DTO 분리 원칙
DB 컬럼명, DTO 필드명, HTTP 응답 키가 일치
Controller → Service → DB 순으로 타입이 좁혀져야 함
□ Controller는 DTO만 받고 DTO만 반환
□ Service는 Prisma 타입을 Controller에 노출하지 않음
□ DB 필드 추가 시 → DTO → API 응답까지 함께 검토
□ 에러는 Service에서 NestJS 예외로 변환
□ 유효성 검사는 DTO에서만 (Service에서 중복 검사 금지)
가독성 위한 섹션 구성과 개행 
섹션: // ─── 섹션명 ─── — 관련 메서드 묶음 경계
메서드: /** 설명 */ (JSDoc) — 해당 메서드가 왜/무엇을 하는지