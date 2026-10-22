import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { getTodayKST } from '@repo/constants';

import { Manifest, ManifestPost, manifestFileName } from '../instagram/manifest';
import { buildRecentSongPosts } from '../instagram/recentSongPosts';
import type { InstaSong, Post } from '../instagram/recentSongPosts';
import { Edition, renderSlideJpeg } from '../instagram/renderSlide';
import {
  DEFAULT_CYCLE_ANCHOR,
  DEFAULT_CYCLE_DAYS,
  formatPeriodLabel,
  getPeriod,
  isPostingDay,
} from '../instagram/schedule';
import { getClient } from '../supabase/getClient';

/**
 * 최근 며칠간 들어온 TJ 신곡으로 인스타그램용 이미지를 만든다.
 * - 3일(IG_CYCLE_DAYS)마다 한 번, TJ용과 KY용을 같은 날 함께 만든다. 기간은 게시일 전날부터 3일 전까지다.
 * - KY용은 그 기간 신곡 중 KY 번호가 확인된 곡만 담는다.
 * - 일본곡과 그 외는 서로 다른 게시물(이미지 묶음)로 나눈다.
 * - 해당 번호의 신곡이 없으면 그 번호는 건너뛴다. 모두 없으면 아무것도 만들지 않는다.
 * - 만든 이미지마다 어떤 데이터를 넣었는지 manifest.json으로 남긴다. 게시(Instagram API)는 별도 단계다.
 *
 * IG_POST_DATE=YYYY-MM-DD  게시일을 지정한다 (기본: 오늘 KST). 기간은 이 날짜에서 거꾸로 계산한다.
 * IG_ENFORCE_CYCLE=true    게시일이 아니면 아무것도 하지 않는다. 워크플로우는 매일 돌리고 이 값으로 3일 간격을 지킨다.
 * IG_CYCLE_DAYS=3          게시 간격(일).
 * IG_CYCLE_ANCHOR=날짜      게시 간격을 세는 기준일.
 * IG_EDITIONS=TJ,KY        만들 번호 종류 (기본: TJ,KY).
 * IG_OUT_DIR=out/instagram 출력 폴더 (결과는 <폴더>/<게시일>/ 아래에 쌓인다).
 * IG_FROM_MANIFEST=<경로>  DB를 조회하지 않고 manifest.json 내용으로 이미지를 다시 만든다.
 *                          곡 정보를 JSON에서 고친 뒤 재생성할 때 쓴다.
 */
const NUMBER_COLUMN: Record<Edition, 'num_tj' | 'num_ky'> = { TJ: 'num_tj', KY: 'num_ky' };

const parseEditions = (): Edition[] => {
  const requested = (process.env.IG_EDITIONS || 'TJ,KY').split(',').map(value => value.trim());
  return (['TJ', 'KY'] as const).filter(edition => requested.includes(edition));
};

async function fetchSongs(period: Manifest['period'], edition: Edition): Promise<InstaSong[]> {
  const { data, error } = await getClient()
    .from('songs')
    .select('id, title, artist, title_ko, artist_ko, num_tj, num_ky')
    .gte('release', period.from)
    .lte('release', period.to)
    .not(NUMBER_COLUMN[edition], 'is', null)
    .order('release', { ascending: true })
    .order('id', { ascending: true });

  if (error) throw error;
  return (data ?? []) as InstaSong[];
}

async function renderPost(
  post: Pick<Post, 'kind' | 'total' | 'omittedCount' | 'slides'>,
  edition: Edition,
  period: Manifest['period'],
  files: string[],
  dir: string,
) {
  const periodLabel = formatPeriodLabel(period.from, period.to);

  for (const [index, songs] of post.slides.entries()) {
    const jpeg = await renderSlideJpeg(songs, {
      edition,
      kind: post.kind,
      periodLabel,
      total: post.total,
      omittedCount: post.omittedCount,
      pageIndex: index,
      pageCount: post.slides.length,
    });
    writeFileSync(join(dir, files[index]), jpeg);
  }
}

async function generate(postDate: string, outDir: string) {
  const cycleDays = Number(process.env.IG_CYCLE_DAYS) || DEFAULT_CYCLE_DAYS;
  const anchor = process.env.IG_CYCLE_ANCHOR || DEFAULT_CYCLE_ANCHOR;

  if (process.env.IG_ENFORCE_CYCLE === 'true' && !isPostingDay(postDate, anchor, cycleDays)) {
    console.log(
      `[instagram] ${postDate}은 게시일이 아니어서 건너뜁니다. (${cycleDays}일 간격, 기준 ${anchor})`,
    );
    return;
  }

  const period = getPeriod(postDate, cycleDays);
  const editions = parseEditions();
  const dir = join(outDir, postDate);
  const posts: ManifestPost[] = [];
  const emptyEditions: Edition[] = [];

  console.log(`[instagram] 게시일 ${postDate} / 신곡 기간 ${period.from} ~ ${period.to}`);

  for (const edition of editions) {
    const built = buildRecentSongPosts(await fetchSongs(period, edition));

    if (built.length === 0) {
      emptyEditions.push(edition);
      console.log(`[instagram] ${edition} 신곡이 없어 건너뜁니다.`);
      continue;
    }

    mkdirSync(dir, { recursive: true });
    for (const post of built) {
      const files = post.slides.map((_, i) => `${edition}-${post.kind}-${i + 1}.jpg`);
      await renderPost(post, edition, period, files, dir);
      posts.push({
        edition,
        kind: post.kind,
        total: post.total,
        omittedCount: post.omittedCount,
        slides: post.slides,
        files,
      });
      console.log(
        `[instagram] ${edition} ${post.kind} ${post.total}곡 → ${files.length}장 (생략 ${post.omittedCount}곡)`,
      );
    }
  }

  if (posts.length === 0) {
    console.log('[instagram] 만들 이미지가 없습니다.');
    return;
  }

  const manifest: Manifest = {
    postDate,
    period,
    generatedAt: new Date().toISOString(),
    query: { editions },
    emptyEditions,
    posts,
  };
  writeFileSync(join(dir, manifestFileName), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`[instagram] 데이터 기록: ${join(dir, manifestFileName)}`);
}

/** 곡 정보를 고친 매니페스트로 같은 파일명의 이미지를 덮어써서 다시 만든다. */
async function regenerate(manifestPath: string) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as Manifest;
  const dir = dirname(manifestPath);

  for (const post of manifest.posts) {
    await renderPost(post, post.edition, manifest.period, post.files, dir);
    console.log(`[instagram] 재생성 ${post.edition} ${post.kind} ${post.files.length}장`);
  }

  manifest.regeneratedAt = new Date().toISOString();
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

async function main() {
  if (process.env.IG_FROM_MANIFEST) {
    await regenerate(process.env.IG_FROM_MANIFEST);
    return;
  }
  await generate(
    process.env.IG_POST_DATE || getTodayKST(),
    process.env.IG_OUT_DIR || 'out/instagram',
  );
}

main().catch(error => {
  console.error('[instagram] 이미지 생성 실패:', error);
  process.exit(1);
});
