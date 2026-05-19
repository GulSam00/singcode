# apps/mobile (DEPRECATED — Frozen)

> **이 워크스페이스는 동결되었습니다.** 활성 개발은 `apps/twa`에서 진행됩니다.

## 동결 사유

- 본 앱은 `singcode.kr`을 `react-native-webview`로 래핑한 wrapper 앱입니다 (PR #203).
- [Google Play Minimum Functionality 정책](https://support.google.com/googleplay/android-developer/answer/9888379)상 단순 웹사이트 래퍼는 스토어 거절 위험이 큽니다.
- 대안으로 **TWA (Trusted Web Activity)** 방식을 채택했습니다. TWA는 Expo/RN 코드와 무관하므로 본 워크스페이스를 동결합니다.
- 미래에 PWA로 해결할 수 없는 네이티브 기능(생체 인증, 백그라운드 위치, 인앱 결제 등)이 필요해질 경우를 대비해 코드는 보존합니다.

## 동결 상태

- **Expo SDK**: 52
- **React / React Native**: 18.3.1 / 0.76.7
- **마지막 활성 PR**: [#203 — WebView로 singcode.kr 표시 구현](https://github.com/GulSam00/singcode/pull/203)
- **동결 이슈**: #204
- pnpm 워크스페이스에서 제외됨 (`pnpm-workspace.yaml`의 `'!apps/mobile'`)
- `pnpm install`, `pnpm build`, `pnpm lint`, `pnpm check-types` 대상에서 자동 제외

## 재활성화 절차

이 앱을 다시 활용해야 한다면:

1. `pnpm-workspace.yaml`에서 `'!apps/mobile'` 한 줄 제거
2. 레포 루트에서 `pnpm install` 실행
3. `apps/mobile/`에서 `pnpm start` (또는 `pnpm android` / `pnpm ios`)

> Expo SDK 52는 시간이 지나면서 deprecate됩니다. 재활성화 시점에는 SDK 업그레이드와 `package.json` 의존성 재정비가 선행되어야 할 수 있습니다.

## 후속 작업

- 신규 워크스페이스: `apps/twa` (별도 이슈로 진행)
- `apps/web` PWA 셋업: manifest, Service Worker, `.well-known/assetlinks.json`
