# CLAUDE.md — `apps/twa`

This file provides guidance to Claude Code (claude.ai/code) when working with the TWA (Trusted Web Activity) workspace.

## Overview

`apps/twa`는 **Singcode PWA를 Google Play Store에 배포하기 위한 Android 빌드 워크스페이스**다.
Bubblewrap CLI가 `https://www.singcode.kr`의 PWA Manifest를 받아 Android 프로젝트(.aab/.apk)를 생성한다.

- **Application ID**: `kr.singcode.app` — 한 번 결정되면 영구적이다. 변경 불가.
- **PWA URL**: `https://www.singcode.kr`
- **Manifest URL**: `https://www.singcode.kr/manifest.webmanifest`
- **Digital Asset Links**: `https://www.singcode.kr/.well-known/assetlinks.json`

## Prerequisites (로컬 1회성 셋업)

| 도구              | 버전 / 비고                                                           |
| ----------------- | --------------------------------------------------------------------- |
| Java JDK          | **17** (Bubblewrap 1.24.x 권장)                                       |
| Android SDK       | Android Studio 또는 `cmdline-tools` (`platform-tools`, `build-tools`) |
| `JAVA_HOME`       | JDK 17 경로                                                           |
| `ANDROID_HOME`    | Android SDK 경로                                                      |
| `@bubblewrap/cli` | `pnpm install` 시 자동 설치됨 (`devDependencies`에 등록)              |

설치 검증:

```bash
java -version          # openjdk 17.x.x
echo $ANDROID_HOME     # /path/to/android-sdk
pnpm --filter twa exec bubblewrap --version
```

> ⚠️ **`init`, `update`는 pnpm 내장 명령어와 충돌**한다. 반드시 `run` 키워드를 명시한다.
> `pnpm --filter twa init` ❌ → `pnpm --filter twa run init` ✅

## Commands

루트에서 실행:

```bash
# 워크스페이스 의존성 설치
pnpm install

# 초기 init (이미 twa-manifest.json이 존재하면 생략)
pnpm --filter twa run init

# Android 프로젝트 생성 + 서명된 .aab/.apk 빌드
pnpm --filter twa run build:android

# webmanifest 변경 사항을 twa-manifest.json에 반영
pnpm --filter twa run update

# app/build.gradle의 targetSdk / 버전이 올바른지만 확인
pnpm --filter twa run check-sdk
```

또는 `apps/twa/`에서 직접:

```bash
pnpm run build:android   # bubblewrap build + targetSdk 검증
```

## Build Workflow (재현 가능한 절차)

### 1. PWA 사전 점검

빌드 전 PWA가 정상인지 확인.

```bash
curl -sI https://www.singcode.kr/manifest.webmanifest         # 200
curl -s   https://www.singcode.kr/manifest.webmanifest | jq . # 유효한 JSON
```

`manifest.webmanifest`의 `icons[].purpose`에 `any`와 `maskable`이 모두 등록되어 있어야 한다.

### 2. (최초 1회) `bubblewrap init`

`twa-manifest.json`이 이미 커밋되어 있으면 **생략**한다. 새로 만드는 경우만:

```bash
pnpm --filter twa run init
```

대화형 프롬프트가 뜨면 다음을 따른다.

| 항목              | 값                                                |
| ----------------- | ------------------------------------------------- |
| Domain            | `www.singcode.kr`                                 |
| Application ID    | `kr.singcode.app` (영구)                          |
| Application name  | `Singcode - 당신의 노래방 메모장`                 |
| Launcher name     | `Singcode`                                        |
| Display mode      | `standalone`                                      |
| Orientation       | `portrait`                                        |
| Theme color       | `#1a1a2e`                                         |
| Splash background | `#1a1a2e`                                         |
| Icon URL          | `https://www.singcode.kr/icons/icon-512.png`          |
| Maskable icon URL | `https://www.singcode.kr/icons/icon-maskable-512.png` |
| Signing key alias | `singcode`                                        |

### 3. 키스토어 생성 (최초 1회, 사용자 직접 진행)

> ⚠️ **키스토어는 Play Store 배포의 영구 신원이다. 분실 시 같은 패키지 ID로 업데이트 불가.**
> Bubblewrap이 init 도중 키스토어를 생성하지 못했거나 별도 생성이 필요할 때 아래를 사용한다.

```bash
keytool -genkeypair \
  -v \
  -keystore apps/twa/android.keystore \
  -alias singcode \
  -keyalg RSA \
  -keysize 2048 \
  -validity 9125 \
  -storetype JKS
```

생성 직후 **반드시** 다음을 백업한다.

- `apps/twa/android.keystore` 파일 (이미 `.gitignore` 처리됨)
- 키스토어 비밀번호 (storepass)
- 키 비밀번호 (keypass)
- 별칭(alias): `singcode`

**백업 정책**: 1Password / 외장 드라이브 / 클라우드 중 **최소 2개** 위치에 분산 보관.

### 4. SHA-256 핑거프린트 추출

`assetlinks.json`에 등록할 인증서 지문을 추출한다.

```bash
keytool -list -v \
  -keystore apps/twa/android.keystore \
  -alias singcode \
  | grep "SHA256:"
```

출력 예: `SHA256: 4A:52:E2:11:...:3B:E9` — 이 값을 다음 단계에 사용한다.

### 5. `assetlinks.json` 등록 / 검증

`apps/web/public/.well-known/assetlinks.json`은 이미 커밋되어 있다. 키스토어가 변경되었거나 처음 생성한 경우, `sha256_cert_fingerprints` 값을 4단계에서 추출한 값으로 교체하고 PR을 분리해 배포한다.

배포 후 검증:

```bash
curl -sI https://www.singcode.kr/.well-known/assetlinks.json   # 200
```

[Statement List Tester](https://developers.google.com/digital-asset-links/tools/generator)에서 `https://www.singcode.kr` + `kr.singcode.app` + SHA-256으로 통과 확인.

### 6. `bubblewrap build`

```bash
pnpm --filter twa run build:android
```

빌드가 끝나면 `scripts/verify-target-sdk.mjs`가 산출물의 targetSdk와 versionCode를 검사한다.
검사에 실패하면 빌드 명령이 0이 아닌 코드로 종료되므로, 잘못된 산출물을 Play Console에 올릴 일이 없다.

> 💡 **build 도중 "regenerate Android project" 프롬프트가 뜨면 `Yes`를 선택한다.**
> `twa-manifest.json`을 수정하면 checksum이 달라져 이 프롬프트가 뜬다.
> Bubblewrap 1.25.0 템플릿은 `targetSdkVersion 36`이므로 재생성해도 안전하고,
> 오히려 `versionCode`/`versionName`이 `twa-manifest.json` 기준으로 갱신되어 반영된다.

버전은 `bubblewrap update`가 실행될 때 **자동으로 1씩 올라간다** (`Upgraded app version to versionName: N`).
수동으로 지정하려면 `twa-manifest.json`의 `appVersionCode`/`appVersionName`/`appVersion`을 수정한다.
`app/build.gradle`은 재생성 시 그 값으로 채워지므로 직접 편집하지 않는다.

<a id="target-sdk"></a>

#### targetSdkVersion 36 (Google Play 요구사항)

Google Play는 **2026-08-31**부터 API 36(Android 16) 미만을 타겟하는 앱의 업데이트를 거부한다.

`targetSdkVersion`은 Bubblewrap 템플릿(`template_project/app/build.gradle`)에
**리터럴로 하드코딩**되어 있다. `minSdkVersion`과 달리 `twa-manifest.json`으로 제어할 수 없고,
`app/build.gradle`은 `.gitignore` 대상이라 커밋으로 고정할 수도 없다.
따라서 **어떤 Bubblewrap 버전을 쓰느냐가 targetSdk를 결정한다.**

| 버전     | 템플릿의 targetSdkVersion |
| -------- | ------------------------- |
| ~1.24.1  | 35 ❌                     |
| 1.25.0~  | 36 ✅                     |

`@bubblewrap/cli`는 **1.25.0 이상**을 유지한다. 다운그레이드하면 targetSdk가 35로 돌아간다.
이미 생성된 `app/build.gradle`은 CLI를 올려도 자동으로 갱신되지 않으므로,
버전을 올린 뒤에는 빌드 시 재생성 프롬프트에 `Yes`로 답해 새 템플릿을 반영한다.

빌드와 무관하게 현재 상태만 확인하려면:

```bash
pnpm --filter twa run check-sdk
```

산출물:

- `app-release-bundle.aab` — Play Console 업로드용
- `app-release-signed.apk` — 디바이스 직접 설치용

빌드 산출물은 `.gitignore`로 차단되어 있다. **커밋 금지.**

### 7. 디바이스 검증

본인 Android 디바이스에서 USB 디버깅 활성화 후:

```bash
adb install -r apps/twa/app-release-signed.apk
```

체크리스트:

- [ ] 앱 실행 시 **풀스크린** (주소창이 뜨지 않음)
- [ ] `www.singcode.kr` 정상 로드 (오프라인 splash 후 메인 진입)
- [ ] 시스템 뒤로가기 동작 정상
- [ ] 카카오 로그인 정상 (브라우저 탭 전환 후 복귀)
- [ ] PWA 아이콘 (`icon-maskable-*`)이 흰 배경 마스킹 없이 표시

## Troubleshooting

### 주소창이 뜬다 (TWA가 Custom Tabs로 fallback)

원인: `assetlinks.json`의 SHA-256이 실제 서명 키스토어와 불일치.

```bash
# 1. 실제 APK가 어떤 SHA-256으로 서명됐는지 확인
keytool -printcert -jarfile apps/twa/app-release-signed.apk

# 2. 배포된 assetlinks.json 값 확인
curl -s https://www.singcode.kr/.well-known/assetlinks.json | jq .

# 3. 두 값이 동일한지 비교 — 다르면 assetlinks.json 갱신 후 재배포
```

배포 직후 디바이스에서 즉시 반영되지 않을 수 있다 → 앱 데이터 삭제 후 재설치.

### `EBUSY: resource busy or locked` — Gradle 데몬이 파일을 잡고 있다

```
cli ERROR EBUSY: resource busy or locked, unlink 'apps/twa/app/build/intermediates/.../classes.dex'
```

Gradle 데몬이 살아 있으면 Bubblewrap이 프로젝트를 재생성하지 못한다.
이 상태로 실패하면 `gradlew`, `settings.gradle` 등이 **부분적으로 삭제된 채 남을 수 있다.**

```bash
# 1. 데몬 종료 (gradlew가 남아 있으면 이 방법이 우선)
cd apps/twa && ./gradlew --stop

# 2. gradlew도 지워졌다면 Gradle 데몬 프로세스를 직접 종료
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"name='java.exe'\" | Where-Object { \$_.CommandLine -like '*GradleDaemon*' } | Select-Object ProcessId, CommandLine"
taskkill /PID <해당 PID> /F

# 3. 빌드 캐시 제거 후 재생성
rm -rf apps/twa/app/build
pnpm --filter twa run update
```

> IDE(Android Studio, VS Code Java 확장 등)가 `apps/twa`를 Gradle 프로젝트로 열어두면
> 자체 데몬을 유지한다. 반복해서 잠긴다면 해당 프로젝트를 IDE에서 닫는다.

### `bubblewrap build` 실패: SDK / build-tools 미발견

`ANDROID_HOME`과 `JAVA_HOME` 환경 변수가 설정되어 있는지, `cmdline-tools/latest/bin`이 PATH에 있는지 확인한다.

### `twa-manifest.json` 변경 후 반영

PWA의 webmanifest를 수정했다면:

```bash
pnpm --filter twa run update
```

또는 `twa-manifest.json`을 직접 편집한 후 `pnpm --filter twa run build:android`로 재빌드.
이때 checksum이 달라져 재생성 프롬프트가 뜨는데, **`Yes`를 선택**하면 변경된 버전이 반영된다.

### 빌드 후 targetSdk 검사에서 실패한다

```
[target-sdk] ❌ app/build.gradle의 targetSdkVersion이 35입니다 (필요: 36).
```

`app/build.gradle`이 1.24.x 이하 템플릿으로 생성된 상태다.
`pnpm --filter twa exec bubblewrap --version`으로 1.25.0 이상인지 확인한 뒤,
빌드 시 재생성 프롬프트에 `Yes`로 답해 새 템플릿을 반영한다.

```
[target-sdk] ❌ versionCode 불일치 — app/build.gradle(10) vs twa-manifest.json(11).
```

`twa-manifest.json`의 버전 변경이 아직 반영되지 않았다. 재생성 프롬프트에 `Yes`로 답해 다시 빌드한다.

## Files in this workspace

| 파일                  | 설명                                                       | 커밋 여부 |
| --------------------- | ---------------------------------------------------------- | --------- |
| `package.json`        | 워크스페이스 메타 + bubblewrap 스크립트                    | ✅ 커밋   |
| `twa-manifest.json`   | Bubblewrap 빌드 설정 (Application ID, 색상, 아이콘 URL 등) — **버전의 single source of truth** | ✅ 커밋   |
| `scripts/verify-target-sdk.mjs` | 빌드 산출물의 targetSdk 36 / versionCode 검사 ([설명](#target-sdk)) | ✅ 커밋   |
| `.gitignore`          | 키스토어, .aab/.apk, `android/`, `output/` 차단            | ✅ 커밋   |
| `CLAUDE.md`           | 본 문서                                                    | ✅ 커밋   |
| `android.keystore`    | 서명 키스토어 — **외부 백업 필수, 절대 커밋 금지**         | ❌ 차단   |
| `app-release-*.aab`   | Play Console 업로드 산출물                                 | ❌ 차단   |
| `app-release-*.apk`   | 디바이스 설치용 산출물                                     | ❌ 차단   |
| `android/`, `output/` | Bubblewrap 중간 산출물                                     | ❌ 차단   |

## Out of Scope

- Play Console 등록 / Internal testing 트랙 설정 (별도 이슈)
- CI/CD 빌드 자동화 (MVP 이후)
- 디바이스/OS 호환성 매트릭스 (출시 후 모니터링)

## References

- Bubblewrap CLI: https://github.com/GoogleChromeLabs/bubblewrap
- Digital Asset Links: https://developers.google.com/digital-asset-links
- Statement List Tester: https://developers.google.com/digital-asset-links/tools/generator
- TWA Quick Start: https://developer.chrome.com/docs/android/trusted-web-activity/quick-start
