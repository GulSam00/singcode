#!/usr/bin/env node
/**
 * 빌드 산출물이 Google Play의 targetSdk 요구사항을 만족하는지 검사한다.
 *
 * Google Play는 2026-08-31부터 API 36(Android 16) 이상을 타겟하는 앱만 업데이트를 허용한다.
 * targetSdkVersion은 Bubblewrap 템플릿에 하드코딩되어 있어 twa-manifest.json으로 제어할 수 없고,
 * app/build.gradle은 .gitignore 대상이라 커밋으로 고정할 수도 없다. 즉 이 값은 CLI 버전
 * (1.25.0부터 36)과 재생성 여부에만 좌우된다. 이 스크립트는 그 결과가 실제 산출물까지
 * 도달했는지 빌드 후 마지막으로 확인하는 안전망이다.
 *
 * 사용법: node scripts/verify-target-sdk.mjs
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_TARGET_SDK = 36;

const twaRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const gradlePath = join(twaRoot, 'app', 'build.gradle');
const manifestPath = join(twaRoot, 'twa-manifest.json');
const apkPath = join(twaRoot, 'app-release-signed.apk');

const log = (message) => console.log(`[target-sdk] ${message}`);
const fail = (message) => {
  console.error(`[target-sdk] ❌ ${message}`);
  process.exit(1);
};

/** 빌드된 apk의 실제 targetSdk를 aapt2로 읽는다. 도구를 못 찾으면 null. */
function readApkTargetSdk() {
  if (!existsSync(apkPath)) return null;

  let sdkPath = process.env.ANDROID_HOME;
  try {
    const config = JSON.parse(readFileSync(join(homedir(), '.bubblewrap', 'config.json'), 'utf8'));
    sdkPath = config.androidSdkPath ?? sdkPath;
  } catch {
    // bubblewrap 설정이 없으면 ANDROID_HOME으로 대체한다.
  }
  if (!sdkPath) return null;

  const buildToolsDir = join(sdkPath, 'build-tools');
  if (!existsSync(buildToolsDir)) return null;

  const latest = readdirSync(buildToolsDir).sort().pop();
  if (!latest) return null;

  const aapt2 = join(buildToolsDir, latest, process.platform === 'win32' ? 'aapt2.exe' : 'aapt2');
  if (!existsSync(aapt2)) return null;

  try {
    const badging = execFileSync(aapt2, ['dump', 'badging', apkPath], { encoding: 'utf8' });
    return Number(badging.match(/targetSdkVersion:'(\d+)'/)?.[1]);
  } catch {
    return null;
  }
}

if (!existsSync(gradlePath)) {
  fail('app/build.gradle을 찾을 수 없습니다. 빌드가 실패했을 수 있습니다.');
}

const gradleSource = readFileSync(gradlePath, 'utf8');
const gradleTargetSdk = Number(gradleSource.match(/targetSdkVersion\s+(\d+)/)?.[1]);
const gradleVersionCode = Number(gradleSource.match(/versionCode\s+(\d+)/)?.[1]);
const { appVersionCode } = JSON.parse(readFileSync(manifestPath, 'utf8'));

if (gradleTargetSdk !== REQUIRED_TARGET_SDK) {
  fail(
    `app/build.gradle의 targetSdkVersion이 ${gradleTargetSdk}입니다 (필요: ${REQUIRED_TARGET_SDK}).\n` +
      `   @bubblewrap/cli가 1.25.0 이상인지 확인하고, 빌드 중 재생성 프롬프트에 Yes로 답하세요.`,
  );
}

if (gradleVersionCode !== appVersionCode) {
  fail(
    `versionCode 불일치 — app/build.gradle(${gradleVersionCode}) vs twa-manifest.json(${appVersionCode}).\n` +
      `   twa-manifest.json을 수정했다면 build 중 재생성 프롬프트에 Yes로 답해 반영하세요.`,
  );
}

const apkTargetSdk = readApkTargetSdk();
if (apkTargetSdk === null) {
  log('⚠️  aapt2를 찾지 못해 산출물 검증은 건너뜁니다 (app/build.gradle 기준으로는 정상).');
} else if (apkTargetSdk !== REQUIRED_TARGET_SDK) {
  fail(`빌드된 apk의 targetSdkVersion이 ${apkTargetSdk}입니다 (필요: ${REQUIRED_TARGET_SDK}).`);
} else {
  log(`산출물 검증 통과: apk targetSdkVersion ${apkTargetSdk}.`);
}

log(`✅ targetSdk ${REQUIRED_TARGET_SDK}, versionCode ${appVersionCode} 확인.`);
