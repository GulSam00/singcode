import { PostgrestError } from '@supabase/supabase-js';

/**
 * 포인트 RPC(daily_check_in, cast_artist_vote, create_song_promotion, cancel_song_promotion)는
 * 실패를 `raise exception '<키>'`로 알린다. PostgREST는 그 키를 error.message에, `using detail`을
 * error.details에 담아 돌려준다. 정의는 apps/web/point-integrity.sql.
 */
const POINT_RPC_ERRORS = {
  not_authenticated: { status: 401, message: 'User not authenticated' },
  user_not_found: { status: 404, message: '사용자 정보를 찾을 수 없습니다.' },
  insufficient_points: { status: 400, message: '포인트가 부족합니다.' },
  invalid_artist: { status: 400, message: 'artist is required' },
  invalid_amount: { status: 400, message: 'amount는 0 이상의 정수여야 합니다.' },
  artist_not_found: { status: 400, message: '존재하지 않는 아티스트입니다.' },
  invalid_content: { status: 400, message: '홍보 내용은 50자 이내로 작성해주세요.' },
  invalid_date: { status: 400, message: '유효하지 않은 날짜입니다.' },
  start_date_too_early: { status: 400, message: '홍보 시작일은 내일 이후여야 합니다.' },
  end_before_start: { status: 400, message: '종료일은 시작일 이후여야 합니다.' },
  song_not_found: { status: 400, message: '존재하지 않는 곡입니다.' },
  promotion_not_found: { status: 404, message: '홍보를 찾을 수 없습니다.' },
  not_owner: { status: 403, message: '본인의 홍보만 취소할 수 있습니다.' },
  promotion_started: { status: 400, message: '이미 시작된 홍보는 취소할 수 없습니다.' },
} as const;

type PointRpcErrorKey = keyof typeof POINT_RPC_ERRORS;

// '2026-02-31'처럼 형식은 맞지만 없는 날짜를 date 인자로 넘기면 Postgres가 형변환 단계에서 거절한다.
const INVALID_DATE_SQLSTATES = new Set(['22007', '22008']);

/** 문자열을 컬럼 타입(uuid 등)으로 바꾸지 못했을 때의 SQLSTATE. 잘못된 id가 여기에 걸린다. */
export const INVALID_TEXT_REPRESENTATION = '22P02';

export interface PointRpcErrorResponse {
  status: number;
  error: string;
}

const isPointRpcErrorKey = (value: string): value is PointRpcErrorKey =>
  Object.prototype.hasOwnProperty.call(POINT_RPC_ERRORS, value);

const parseInsufficientDetail = (details: string | null) => {
  if (!details) return null;
  try {
    const parsed: unknown = JSON.parse(details);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'required' in parsed &&
      'balance' in parsed &&
      typeof parsed.required === 'number' &&
      typeof parsed.balance === 'number'
    ) {
      return { required: parsed.required, balance: parsed.balance };
    }
    return null;
  } catch {
    // detail이 JSON이 아니면 금액 없이 일반 문구로 안내한다.
    return null;
  }
};

/**
 * RPC 오류를 라우트 응답(상태 코드 + 화면에 보일 문구)으로 바꾼다.
 * 포인트 RPC가 의도적으로 낸 오류가 아니면 null — 호출한 쪽이 500으로 처리한다.
 */
export function toPointRpcErrorResponse(error: PostgrestError): PointRpcErrorResponse | null {
  if (INVALID_DATE_SQLSTATES.has(error.code)) {
    const { status, message } = POINT_RPC_ERRORS.invalid_date;
    return { status, error: message };
  }

  if (!isPointRpcErrorKey(error.message)) return null;

  const { status, message } = POINT_RPC_ERRORS[error.message];

  if (error.message === 'insufficient_points') {
    const detail = parseInsufficientDetail(error.details);
    if (detail) {
      return {
        status,
        error: `포인트가 부족합니다. 필요: ${detail.required}P, 보유: ${detail.balance}P`,
      };
    }
  }

  return { status, error: message };
}
