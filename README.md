# Science Lab Data Platform

학교 과학 실험 데이터를 학생과 교사가 제출·조회·관리하는 웹앱. 자세한 기획은 `Science_Lab_Data_Platform_PRD_v1.2.md` 참고.

현재 구현 범위: **Phase 1~4** (프로젝트 초기화, Firebase 연결, Google 로그인, 최초 로그인 시 사용자 정보 등록). 실험 관리/파일 업로드/교사 대시보드 등은 아직 없음.

## ⚠️ 현재 단계의 보안 한계

**Firestore/Storage Security Rules는 아직 작성하지 않았다 (Phase 5에서 진행 예정).**

`role`(학생/교사) 판별은 `src/lib/userProfile.ts`의 `determineRole()`이 클라이언트에서 `config/teacherEmails` 문서를 읽어 수행하지만, Rules가 없는 상태에서는 이 판별을 아무도 강제하지 않는다. 즉 지금 단계에서는 사용자가 마음만 먹으면 임의로 `role: "teacher"`를 자기 문서에 써넣을 수 있다. 실제 학생 데이터를 다루기 전에 반드시 Phase 5(Security Rules)를 먼저 적용해야 한다.

## 1. Firebase 프로젝트 만들기

1. [Firebase 콘솔](https://console.firebase.google.com/)에서 새 프로젝트를 만든다.
2. **Authentication** → 로그인 방법 → **Google** 제공업체를 사용 설정한다.
3. **Firestore Database** 를 만든다. 이 단계에서는 아직 Rules가 없으므로, 개발 편의를 위해 **테스트 모드**로 생성한다. (테스트 모드는 30일 후 자동으로 잠기며, Phase 5에서 실제 Rules로 교체할 예정)
4. **Storage** 도 동일하게 테스트 모드로 생성한다.
5. 프로젝트 설정 → 내 앱 → 웹 앱 추가(`</>`) 후 나오는 config 값을 이 저장소의 `.env.local`에 채운다.
   ```bash
   cp .env.local.example .env.local
   # .env.local을 열어 Firebase 콘솔에서 복사한 값을 채운다
   ```

## 2. 교사 이메일 화이트리스트 등록 (PRD 6-2)

Firestore 콘솔에서 `config/teacherEmails` 문서를 수동으로 만든다.

- 컬렉션: `config`
- 문서 ID: `teacherEmails`
- 필드: `allowedEmails` (array of string) — 예: `["teacher1@school.ac.kr"]`

이 문서에 이메일을 등록한 계정으로 최초 로그인하면 `role: "teacher"`로, 그 외 계정은 `role: "student"`로 등록된다.

## 3. 로컬 실행

```bash
npm install
npm run dev
```

`npm run build`로 타입 체크 및 프로덕션 빌드를 확인할 수 있다.

## 폴더 구조

```text
src/
├── lib/          # firebase.ts (SDK 초기화), userProfile.ts (users/config 문서 접근)
├── contexts/     # AuthContext.tsx (로그인 상태 + 사용자 프로필)
├── pages/        # LoginPage, RegisterPage, HomePage
├── types/        # user.ts
└── App.tsx       # 라우팅 및 로그인/등록 여부에 따른 리다이렉트
```
