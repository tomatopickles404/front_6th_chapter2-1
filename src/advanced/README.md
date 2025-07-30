# Advanced React Cart

기존 JavaScript 쇼핑 카트 애플리케이션을 React로 마이그레이션한 버전입니다.

## 기술 스택

- **React 18** - 사용자 인터페이스 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **ESLint + Prettier** - 코드 품질 관리

## 개발 환경 설정

### 의존성 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

### 빌드

```bash
pnpm build
```

### 코드 포맷팅

```bash
pnpm format
```

### 린팅

```bash
pnpm lint
```

## 프로젝트 구조

```
src/
├── components/     # React 컴포넌트들
├── hooks/         # 커스텀 훅들
├── utils/         # 유틸리티 함수들
├── constants/     # 상수 데이터
├── types/         # TypeScript 타입 정의
├── App.tsx        # 메인 앱 컴포넌트
└── main.tsx       # 앱 진입점
```

## 마이그레이션 계획

1. ✅ React 환경 설정
2. 🔄 상태 관리 마이그레이션
3. 🔄 UI 컴포넌트 마이그레이션
4. 🔄 이벤트 핸들링 마이그레이션
5. 🔄 비즈니스 로직 통합
6. 🔄 테스트 작성
