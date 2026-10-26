// @ts-check
// SessionStart 훅: docs/issues 의 열린 이슈를 한 줄씩 출력한다.
// - 어떤 에러가 나도 메시지만 출력하고 exit 0 으로 끝낸다. 훅 실패가 세션 시작을 막으면 안 된다.
// - 외부 의존성 없이 node 내장 모듈만 쓴다.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/** @typedef {'todo' | 'doing' | 'later' | 'done'} Status */
/** @typedef {'high' | 'medium' | 'low'} Priority */
/** @typedef {{ id: string, title: string, status: Status, priority: Priority, file: string }} Issue */
/** @typedef {{ file: string, reason: string }} IssueError */

/** @type {readonly Status[]} */
const STATUSES = ['todo', 'doing', 'later', 'done'];
/** @type {readonly Priority[]} */
const PRIORITIES = ['high', 'medium', 'low'];

/** 열린 이슈의 표시 순서 (앞일수록 먼저). */
/** @type {Record<string, number>} */
const STATUS_ORDER = { doing: 0, todo: 1, later: 2 };
/** @type {Record<string, number>} */
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const ID_PATTERN = /^\d{8}-\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FETCH_TIMEOUT_MS = 3000;

/**
 * 파일 맨 위 `---` 블록을 `key: value` 쌍으로 읽는다. 값의 앞뒤 따옴표는 벗긴다.
 * @param {string} raw
 * @returns {Record<string, string> | null}
 */
function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(raw);
  if (!match) return null;

  /** @type {Record<string, string>} */
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!pair) continue;
    fields[pair[1]] = pair[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return fields;
}

/**
 * @param {string} file
 * @param {string} raw
 * @returns {{ issue: Issue } | { error: IssueError }}
 */
function toIssue(file, raw) {
  const fields = parseFrontmatter(raw);
  if (!fields) return { error: { file, reason: 'frontmatter(---)가 없습니다' } };

  const { id, title, status, priority } = fields;
  if (!id || !ID_PATTERN.test(id)) {
    return { error: { file, reason: `id 형식이 잘못됐습니다 (${id || '없음'})` } };
  }
  if (id !== file.replace(/\.md$/, '')) {
    return { error: { file, reason: `id(${id})가 파일명과 다릅니다` } };
  }
  if (!title) return { error: { file, reason: 'title이 없습니다' } };
  if (!STATUSES.includes(/** @type {Status} */ (status))) {
    return { error: { file, reason: `status 값이 잘못됐습니다 (${status || '없음'})` } };
  }
  if (!PRIORITIES.includes(/** @type {Priority} */ (priority))) {
    return { error: { file, reason: `priority 값이 잘못됐습니다 (${priority || '없음'})` } };
  }

  return {
    issue: {
      id,
      title,
      status: /** @type {Status} */ (status),
      priority: /** @type {Priority} */ (priority),
      file,
    },
  };
}

/**
 * 이슈 폴더를 읽는다. 파일 하나가 깨져도 나머지는 계속 읽는다.
 * @param {string} dir
 * @returns {{ issues: Issue[], errors: IssueError[] }}
 */
function readIssues(dir) {
  /** @type {Issue[]} */
  const issues = [];
  /** @type {IssueError[]} */
  const errors = [];
  if (!existsSync(dir)) return { issues, errors };

  const files = readdirSync(dir).filter(name => name.endsWith('.md') && name !== 'README.md');
  for (const file of files) {
    try {
      const result = toIssue(file, readFileSync(join(dir, file), 'utf-8'));
      if ('issue' in result) issues.push(result.issue);
      else errors.push(result.error);
    } catch (error) {
      errors.push({ file, reason: error instanceof Error ? error.message : String(error) });
    }
  }
  return { issues, errors };
}

/**
 * @param {Issue} a
 * @param {Issue} b
 */
function compareIssues(a, b) {
  return (
    STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
    PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
    a.id.localeCompare(b.id)
  );
}

/**
 * @param {string[]} args
 * @param {string} cwd
 * @returns {string}
 */
const git = (args, cwd) =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf-8',
    timeout: FETCH_TIMEOUT_MS,
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();

/**
 * fetch 후 upstream보다 뒤처졌으면 경고 문구를 돌려준다. 자동 pull은 하지 않는다.
 * 오프라인이거나 upstream이 없거나 git이 실패하면 null — 경고 없이 로컬 기준으로 진행한다.
 * @param {string} cwd
 * @returns {string | null}
 */
function getBehindWarning(cwd) {
  try {
    const upstream = git(['rev-parse', '--abbrev-ref', '@{u}'], cwd);
    git(['fetch', '--quiet'], cwd);
    const behind = Number(git(['rev-list', '--count', `HEAD..${upstream}`], cwd));
    return behind > 0
      ? `⚠ 현재 브랜치가 ${upstream}보다 ${behind}커밋 뒤처져 있습니다. 이슈 목록이 최신이 아닐 수 있으니 git pull 을 확인하세요.`
      : null;
  } catch {
    return null;
  }
}

function main() {
  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const { issues, errors } = readIssues(join(root, 'docs', 'issues'));
  const open = issues.filter(issue => issue.status !== 'done').sort(compareIssues);

  const warning = getBehindWarning(root);
  if (warning) console.log(warning);

  if (open.length === 0) {
    console.log('열린 이슈가 없습니다. (docs/issues)');
  } else {
    console.log(`열린 이슈 ${open.length}건 (docs/issues)`);
    for (const issue of open) {
      console.log(`[${issue.status}][${issue.priority}] ${issue.id} — ${issue.title}`);
    }
  }

  if (errors.length > 0) {
    console.log(`\n형식 오류 ${errors.length}건 (목록에서 제외됨)`);
    for (const { file, reason } of errors) console.log(`- ${file}: ${reason}`);
  }
}

try {
  main();
} catch (error) {
  console.log(`[issues] 목록을 읽지 못했습니다: ${error instanceof Error ? error.message : error}`);
}
process.exit(0);
