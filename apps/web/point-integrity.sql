-- 포인트 무결성 (이슈 20261113-0104-point-integrity)
--
-- 목표: 포인트가 바뀌는 길을 SECURITY DEFINER 함수 몇 개로만 좁힌다.
--   - 출석:      daily_check_in()          KST 하루 한 번, last_check_in 갱신 + 30P를 한 트랜잭션으로
--   - 투표:      cast_artist_vote()        잔액 잠금 → 검사 → artist_votes 반영 → 차감/환불
--   - 곡 홍보:   create_song_promotion()   잔액 잠금 → 검사 → song_promotions 등록 → 차감
--   - 홍보 취소: cancel_song_promotion()   홍보 행 잠금 → 소유·시작일 검사 → 삭제 → 환불
-- 브라우저(anon 키)로 users.point, artist_votes, point_logs, song_promotions를 직접 쓰는 길과
-- record_point_change를 직접 부르는 길은 막는다.
--
-- 실행 순서 (중요)
--   0) 섹션 0 조회만 먼저 실행해 결과를 확인한다. 섹션 2의 일부 문장은 그 결과에 따라 고쳐야 한다.
--   1) 섹션 1 (새 함수) 실행 → 웹 배포 전에 반드시. 새 라우트가 이 함수들을 부른다.
--   2) 웹 코드 배포
--   3) 섹션 2 (권한 회수) 실행 → 배포 직후. 배포 전에 실행하면 옛 라우트(출석·투표·홍보)가
--      record_point_change / users.update / artist_votes upsert 권한을 잃어 배포 때까지 실패한다
--      (데이터가 망가지지는 않는다).
--   4) 섹션 3 (과거 악용 감사) 조회
--
-- 섹션 1·2는 여러 번 실행해도 안전하다 (create or replace / drop ... if exists / revoke·grant).

-- ============================================================================
-- 0. 사전 확인 (읽기 전용) — 결과를 보고 섹션 2의 [확인 필요] 표시 문장을 맞춘다
-- ============================================================================

-- 0-1. record_point_change 정의와 SECURITY DEFINER 여부. 오버로드가 여럿이면 모두 나온다.
--      prosecdef = true 이고 본문에 auth.uid() 검사가 없으면, 아래 0-2의 권한만으로 남의 포인트를 바꿀 수 있었다.
select p.oid::regprocedure as signature,
       p.prosecdef         as security_definer,
       pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'record_point_change';

-- 0-2. record_point_change EXECUTE 권한. anon / authenticated가 true면 섹션 2-1이 필요하다.
select p.oid::regprocedure as signature,
       has_function_privilege('anon', p.oid, 'execute')          as anon,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated,
       has_function_privilege('service_role', p.oid, 'execute')  as service_role
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'record_point_change';

-- 0-3. 관련 테이블 RLS 활성 여부와 정책 전체.
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('users', 'artist_votes', 'point_logs', 'song_promotions');

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('users', 'artist_votes', 'point_logs', 'song_promotions')
order by tablename, cmd, policyname;

-- 0-4. 테이블 단위 권한. Supabase 기본값은 anon/authenticated에 모든 권한(ALL)이 있다.
--      테이블 단위 UPDATE가 있으면 "revoke update (point)" 같은 컬럼 단위 revoke는 아무 효과가 없다.
--      그래서 섹션 2-2는 테이블 단위로 회수하고 안전한 컬럼만 컬럼 단위로 다시 준다.
select table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('users', 'artist_votes', 'point_logs', 'song_promotions')
  and grantee in ('anon', 'authenticated')
group by table_name, grantee
order by table_name, grantee;

-- 0-5. users 컬럼 단위 권한 (이미 컬럼 단위로 관리 중인지).
select column_name, grantee, privilege_type
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'users'
  and grantee in ('anon', 'authenticated')
order by column_name, grantee, privilege_type;

-- 0-6. 컬럼과 타입. 확인할 것:
--      - users.last_check_in 이 timestamptz인지 (timestamp/date면 아래 daily_check_in의 KST 변환을 다시 봐야 한다)
--      - users.point 기본값 (섹션 3의 잔액 대조에서 시작값으로 쓴다)
--      - users에 nickname 말고 브라우저가 고쳐야 하는 컬럼이 있는지 (섹션 2-2 grant 목록)
--      - songs.id, song_promotions.id 타입 (함수 인자는 %type으로 따라가므로 확인만)
select table_name, column_name, data_type, column_default, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('users', 'point_logs', 'artist_votes', 'song_promotions')
order by table_name, ordinal_position;

-- 0-7. users / point_logs / artist_votes / song_promotions에 걸린 트리거 (포인트를 건드리는 게 있는지).
select c.relname as table_name, t.tgname, pg_get_triggerdef(t.oid) as definition
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('users', 'point_logs', 'artist_votes', 'song_promotions')
  and not t.tgisinternal;

-- 0-8. 같은 이름의 함수가 이미 있는지 (있으면 섹션 1이 덮어쓴다).
select p.oid::regprocedure
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('apply_point_change_internal', 'daily_check_in', 'cast_artist_vote',
                    'create_song_promotion', 'cancel_song_promotion');

-- ============================================================================
-- 1. 새 함수
-- ============================================================================
--
-- 공통 규칙
--   - 사용자는 항상 auth.uid()에서 꺼낸다. 사용자 id를 인자로 받지 않는다.
--   - 포인트를 바꾸기 전에 users 행을 "select ... for update"로 잠근다. 같은 사용자의 출석·투표·홍보
--     요청이 이 행에서 한 줄로 서므로, 동시에 보내도 잔액 검사를 함께 통과할 수 없다.
--     잠금 순서는 언제나 users → (artist_votes | song_promotions)로 같아 교착이 생기지 않는다.
--   - 실패는 raise exception으로 알린다. message는 웹 라우트가 분기하는 고정 키이고
--     (src/utils/pointRpcError.ts), 포인트 부족이면 detail에 {"required":n,"balance":n} JSON을 싣는다.
--     예외가 나면 그때까지의 변경은 모두 롤백된다.
--
-- 포인트 기록을 record_point_change 대신 apply_point_change_internal로 하는 이유
--   record_point_change는 정의가 레포에 없다. 잠금을 잡은 상태에서 잔액·balance_after가 어떻게
--   계산되는지 보장할 수 없고, 섹션 2에서 실행 권한도 회수한다. 새 함수들은 잠금·검사·기록을
--   직접 소유하고, point_logs 형식(user_id, description, amount, balance_after)은
--   기존 기록과 같게 맞춘다.

-- 1-0. 내부 헬퍼: users.point를 바꾸고 point_logs에 한 줄 남긴다. 바뀐 잔액을 돌려준다.
--      호출자가 이미 users 행을 잠갔다는 전제다. SECURITY INVOKER(기본값)로 두고 실행 권한을
--      모두 회수해, 아래 definer 함수 안에서만(소유자 권한으로) 쓰이게 한다.
create or replace function public.apply_point_change_internal(
  p_user_id uuid,
  p_amount integer,
  p_description text
)
returns integer
language plpgsql
set search_path = public
as $$
declare
  v_balance integer;
begin
  update public.users
     set point = coalesce(point, 0) + p_amount
   where id = p_user_id
  returning point into v_balance;

  if not found then
    raise exception 'user_not_found';
  end if;

  -- 호출자가 이미 검사하지만, 음수 잔액은 어떤 경로로도 남기지 않는다.
  if v_balance < 0 then
    raise exception 'insufficient_points'
      using detail = json_build_object('required', -p_amount, 'balance', v_balance - p_amount)::text;
  end if;

  insert into public.point_logs (user_id, description, amount, balance_after)
  values (p_user_id, p_description, p_amount, v_balance);

  return v_balance;
end;
$$;

revoke all on function public.apply_point_change_internal(uuid, integer, text)
  from public, anon, authenticated;

-- 1-1. 출석 체크. KST 달력 기준 하루 한 번, 멱등.
--      이미 오늘 출석했으면 적립 없이 awarded=false로 성공을 돌려준다 (앱 진입 시 자동 호출).
--      반환: {"awarded": bool, "last_check_in": timestamptz, "point": int}
create or replace function public.daily_check_in()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_now timestamptz := now();
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_last timestamptz;
  v_balance integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select last_check_in, coalesce(point, 0)
    into v_last, v_balance
    from public.users
   where id = v_uid
     for update;

  if not found then
    raise exception 'user_not_found';
  end if;

  -- '>=': 시계가 어긋나 미래 시각이 들어가 있어도 오늘 출석한 것으로 본다.
  if v_last is not null and (v_last at time zone 'Asia/Seoul')::date >= v_today then
    return json_build_object('awarded', false, 'last_check_in', v_last, 'point', v_balance);
  end if;

  update public.users set last_check_in = v_now where id = v_uid;
  v_balance := public.apply_point_change_internal(v_uid, 30, '출석 체크');

  return json_build_object('awarded', true, 'last_check_in', v_now, 'point', v_balance);
end;
$$;

revoke all on function public.daily_check_in() from public, anon;
grant execute on function public.daily_check_in() to authenticated;

-- 1-2. 아티스트 투표. PUT /api/artist-vote 의 의미를 그대로 옮겼다.
--      p_amount는 "이번 달 이 아티스트에 걸어둘 총 포인트"(절대값)다. 기존 값과의 차액만큼
--      차감/환불하고, 0이면 행을 지워 전액 환불한다. 투표 월은 서버가 KST로 계산한 이번 달뿐이다.
--      반환: {"changed": bool, "balance": int}
create or replace function public.cast_artist_vote(p_artist text, p_amount integer)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_artist text := btrim(p_artist);
  v_month date := date_trunc('month', now() at time zone 'Asia/Seoul')::date;
  v_balance integer;
  v_current integer;
  v_diff integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if v_artist is null or v_artist = '' then
    raise exception 'invalid_artist';
  end if;
  if p_amount is null or p_amount < 0 then
    raise exception 'invalid_amount';
  end if;

  select coalesce(point, 0) into v_balance from public.users where id = v_uid for update;
  if not found then
    raise exception 'user_not_found';
  end if;

  -- artist_votes.artist는 artists.name FK다. 삭제(0)가 아니면 미리 걸러 원인을 분명히 한다.
  if p_amount > 0 and not exists (select 1 from public.artists where name = v_artist) then
    raise exception 'artist_not_found';
  end if;

  select amount into v_current
    from public.artist_votes
   where user_id = v_uid and artist = v_artist and vote_month = v_month
     for update;

  v_diff := p_amount - coalesce(v_current, 0);

  if v_diff = 0 then
    return json_build_object('changed', false, 'balance', v_balance);
  end if;

  if v_diff > 0 and v_balance < v_diff then
    raise exception 'insufficient_points'
      using detail = json_build_object('required', v_diff, 'balance', v_balance)::text;
  end if;

  if p_amount = 0 then
    delete from public.artist_votes
     where user_id = v_uid and artist = v_artist and vote_month = v_month;
  else
    insert into public.artist_votes (user_id, artist, vote_month, amount, updated_at)
    values (v_uid, v_artist, v_month, p_amount, now())
    on conflict (user_id, artist, vote_month)
    do update set amount = excluded.amount, updated_at = excluded.updated_at;
  end if;

  -- 설명 문구는 기존 라우트와 같다. 섹션 3-2 감사 쿼리가 이 형식을 파싱한다.
  v_balance := public.apply_point_change_internal(
    v_uid,
    -v_diff,
    case
      when v_diff > 0 then format('아티스트 투표: %s (+%sP)', v_artist, v_diff)
      else format('아티스트 투표 조정: %s (%sP)', v_artist, v_diff)
    end
  );

  return json_build_object('changed', true, 'balance', v_balance);
end;
$$;

revoke all on function public.cast_artist_vote(text, integer) from public, anon;
grant execute on function public.cast_artist_vote(text, integer) to authenticated;

-- 1-3. 곡 홍보 등록. POST /api/songs/promotions 의 의미를 그대로 옮겼다.
--      비용 = (종료일 - 시작일 + 1)일 × 15P. 시작일은 KST 내일 이후, 내용은 50자 이내.
--      인자 타입은 컬럼 타입을 따라간다(%type) — songs.id가 uuid가 아니어도 그대로 맞는다.
--      반환: {"id": 홍보 id, "cost": int, "balance": int}
create or replace function public.create_song_promotion(
  p_song_id public.songs.id%type,
  p_content text,
  p_start_date date,
  p_end_date date
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_tomorrow date := (now() at time zone 'Asia/Seoul')::date + 1;
  v_title text;
  v_artist text;
  v_cost integer;
  v_balance integer;
  v_id public.song_promotions.id%type;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_content is null or p_content = '' or char_length(p_content) > 50 then
    raise exception 'invalid_content';
  end if;
  if p_start_date is null or p_end_date is null then
    raise exception 'invalid_date';
  end if;
  if p_start_date < v_tomorrow then
    raise exception 'start_date_too_early';
  end if;
  if p_end_date < p_start_date then
    raise exception 'end_before_start';
  end if;

  select title, artist into v_title, v_artist from public.songs where id = p_song_id;
  if not found then
    raise exception 'song_not_found';
  end if;

  v_cost := ((p_end_date - p_start_date) + 1) * 15;

  select coalesce(point, 0) into v_balance from public.users where id = v_uid for update;
  if not found then
    raise exception 'user_not_found';
  end if;

  if v_balance < v_cost then
    raise exception 'insufficient_points'
      using detail = json_build_object('required', v_cost, 'balance', v_balance)::text;
  end if;

  insert into public.song_promotions (song_id, user_id, content, start_date, end_date)
  values (p_song_id, v_uid, p_content, p_start_date, p_end_date)
  returning id into v_id;

  v_balance := public.apply_point_change_internal(
    v_uid,
    -v_cost,
    format('홍보 등록: %s - %s', coalesce(v_title, ''), coalesce(v_artist, ''))
  );

  return json_build_object('id', v_id, 'cost', v_cost, 'balance', v_balance);
end;
$$;

revoke all on function public.create_song_promotion(public.songs.id%type, text, date, date)
  from public, anon;
grant execute on function public.create_song_promotion(public.songs.id%type, text, date, date)
  to authenticated;

-- 1-4. 홍보 취소. DELETE /api/user/promotions 의 의미를 그대로 옮겼다.
--      기존 라우트는 삭제와 환불이 따로라, 같은 취소 요청을 동시에 두 번 보내면 둘 다 환불됐다
--      (두 번째 delete가 0행이어도 오류가 아니다). 홍보 행을 잠그고 그 안에서 삭제·환불한다.
--      또 섹션 2에서 record_point_change 실행 권한을 회수하므로 이 경로도 함수가 필요하다.
--      반환: {"refund": int, "balance": int}
create or replace function public.cancel_song_promotion(
  p_promotion_id public.song_promotions.id%type
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_owner uuid;
  v_start date;
  v_end date;
  v_title text;
  v_artist text;
  v_refund integer;
  v_balance integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  -- 잠금 순서를 다른 함수와 같게(users 먼저) 맞춘다.
  perform 1 from public.users where id = v_uid for update;
  if not found then
    raise exception 'user_not_found';
  end if;

  select p.user_id, p.start_date, p.end_date, s.title, s.artist
    into v_owner, v_start, v_end, v_title, v_artist
    from public.song_promotions p
    left join public.songs s on s.id = p.song_id
   where p.id = p_promotion_id
     for update of p;

  if not found then
    raise exception 'promotion_not_found';
  end if;
  if v_owner is distinct from v_uid then
    raise exception 'not_owner';
  end if;
  if v_start <= v_today then
    raise exception 'promotion_started';
  end if;

  delete from public.song_promotions where id = p_promotion_id;

  v_refund := ((v_end - v_start) + 1) * 15;
  v_balance := public.apply_point_change_internal(
    v_uid,
    v_refund,
    format('홍보 취소: %s - %s', coalesce(v_title, ''), coalesce(v_artist, ''))
  );

  return json_build_object('refund', v_refund, 'balance', v_balance);
end;
$$;

revoke all on function public.cancel_song_promotion(public.song_promotions.id%type)
  from public, anon;
grant execute on function public.cancel_song_promotion(public.song_promotions.id%type)
  to authenticated;

-- PostgREST가 새 함수를 바로 보도록 스키마 캐시를 다시 읽힌다 (Supabase는 보통 자동이지만 확실히 하려고).
notify pgrst, 'reload schema';

-- ============================================================================
-- 2. 권한 회수 — 웹 배포 직후 실행
-- ============================================================================

-- 2-1. record_point_change: 브라우저/세션에서 직접 부르지 못하게 한다. 오버로드가 몇 개든 모두.
--      service_role(배치)은 그대로 쓸 수 있다. 새 웹 코드는 이 함수를 부르지 않는다.
--      [확인 필요: 0-1] 다른 SECURITY INVOKER 함수나 트리거가 authenticated 권한으로 이 함수를
--      부르고 있다면 그 경로가 막힌다. 0-1 / 0-7 결과에 그런 호출이 없는지 본다.
do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'record_point_change'
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', r.signature);
  end loop;
end;
$$;

-- 2-2. users: point / last_check_in 을 브라우저가 고치지 못하게 한다.
--      테이블 단위 UPDATE가 남아 있으면 컬럼 단위 revoke는 효과가 없으므로(0-4 참고),
--      테이블 단위로 회수한 뒤 브라우저가 실제로 고치는 컬럼만 다시 준다.
--      브라우저가 users를 고치는 곳은 useAuthStore.changeNickname(nickname) 하나다.
--      [확인 필요: 0-6] 브라우저가 고쳐야 하는 다른 컬럼이 있으면 grant 목록에 더한다.
revoke update on table public.users from anon, authenticated;
grant update (nickname) on table public.users to authenticated;

--      가입 직후 useAuthStore.insertUser가 { id }만 insert한다. point/last_check_in을 실어
--      처음부터 많은 포인트로 가입하는 길을 막는다. 나머지 컬럼은 기본값으로 채워진다.
--      [확인 필요: 0-6] users에 NOT NULL이면서 기본값 없는 컬럼이 있으면 insertUser가 이미 실패하고
--      있을 테니 그 상태와 같다. 0-3 insert 정책이 auth.uid() = id 를 검사하는지도 본다.
revoke insert on table public.users from anon, authenticated;
grant insert (id) on table public.users to authenticated;

revoke truncate on table public.users from anon, authenticated;

-- 2-3. artist_votes: 쓰기는 cast_artist_vote(SECURITY DEFINER)로만. select 정책은 유지한다.
drop policy if exists "artist_votes_insert_own" on public.artist_votes;
drop policy if exists "artist_votes_update_own" on public.artist_votes;
drop policy if exists "artist_votes_delete_own" on public.artist_votes;
revoke insert, update, delete, truncate on table public.artist_votes from anon, authenticated;

-- 2-4. song_promotions: 등록·취소는 create/cancel_song_promotion으로만. 조회는 그대로 둔다.
--      지금은 브라우저가 anon 키로 song_promotions에 직접 insert하면 포인트 차감 없이 홍보가 걸린다
--      (artist_votes와 같은 구조). 정책 이름을 몰라도 되도록 권한으로 막는다.
--      [확인 필요: 0-3] 남은 insert/update/delete 정책은 권한이 없으면 쓰이지 않는다. 정리하려면 0-3에서
--      이름을 보고 drop policy 한다.
revoke insert, update, delete, truncate on table public.song_promotions from anon, authenticated;

-- 2-5. point_logs: 기록은 함수(소유자 권한)만 남긴다. 사용자는 본인 기록 조회만.
--      [확인 필요: 0-3] point_logs select 정책이 auth.uid() = user_id 로 본인 행만 보이는지 확인한다.
revoke insert, update, delete, truncate on table public.point_logs from anon, authenticated;

-- ============================================================================
-- 3. 과거 악용 감사 (읽기 전용)
-- ============================================================================

-- 3-1. 출석을 KST 하루 두 번 이상 받은 기록.
select user_id,
       (created_at at time zone 'Asia/Seoul')::date as kst_date,
       count(*)    as check_ins,
       sum(amount) as total
from public.point_logs
where description = '출석 체크'
group by user_id, (created_at at time zone 'Asia/Seoul')::date
having count(*) > 1
order by check_ins desc, kst_date desc;

-- 3-1b. 사용자별 중복 출석 요약 (초과 적립액).
select user_id, sum(check_ins - 1) as extra_check_ins, sum((check_ins - 1) * 30) as extra_points
from (
  select user_id, (created_at at time zone 'Asia/Seoul')::date as kst_date, count(*) as check_ins
  from public.point_logs
  where description = '출석 체크'
  group by 1, 2
) t
where check_ins > 1
group by user_id
order by extra_points desc;

-- 3-2. 이번 달·지난 달 artist_votes.amount 와 point_logs 투표 차감 합계가 다른 (사용자, 아티스트, 월).
--      설명 문구 형식: '아티스트 투표: {이름} (+{n}P)' (차감, amount = -n)
--                     '아티스트 투표 조정: {이름} ({-n}P)' (환불, amount = +n)
--      월은 기록 시각의 KST 달로 본다. 투표 행 없이 차감만 있거나(삭제 후 0원이면 정상),
--      차감 없이 투표 행만 있는 경우(직접 insert 악용)가 모두 잡히도록 full join 한다.
--      한계: 아티스트 이름에 ' (' 가 들어 있어도 정규식이 마지막 괄호를 기준으로 자르므로 대부분 맞지만,
--      record_point_change가 description을 바꿔 저장했다면 맞지 않는다.
with logs as (
  select user_id,
         m.parts[1] as artist,
         date_trunc('month', created_at at time zone 'Asia/Seoul')::date as vote_month,
         -sum(amount) as deducted
  from public.point_logs,
       regexp_match(description, '^아티스트 투표(?: 조정)?: (.*) \([+-]?\d+P\)$') as m(parts)
  where description like '아티스트 투표%'
    and m.parts is not null
  group by 1, 2, 3
)
select coalesce(v.user_id, l.user_id)       as user_id,
       coalesce(v.artist, l.artist)         as artist,
       coalesce(v.vote_month, l.vote_month) as vote_month,
       coalesce(v.amount, 0)                as voted_amount,
       coalesce(l.deducted, 0)              as deducted_points,
       coalesce(v.amount, 0) - coalesce(l.deducted, 0) as unpaid
from public.artist_votes v
full join logs l
  on l.user_id = v.user_id and l.artist = v.artist and l.vote_month = v.vote_month
where coalesce(v.amount, 0) <> coalesce(l.deducted, 0)
order by unpaid desc;

-- 3-3. 출처 불명 적립: 알려진 적립 사유가 아닌 양수 기록. PATCH /api/user/point 악용이 여기 잡힌다
--      (그 라우트는 클라이언트가 보낸 description을 그대로 썼다).
select user_id, created_at, amount, balance_after, description
from public.point_logs
where amount > 0
  and description <> '출석 체크'
  and description not like '아티스트 투표 조정: %'
  and description not like '홍보 취소: %'
order by amount desc, created_at desc;

-- 3-4. 잔액과 기록 합계가 맞지 않는 사용자: users.point를 REST로 직접 고친 흔적.
--      users.point 기본값(0-6)이 0이 아니면 diff에서 그만큼 빼고 본다.
select u.id, u.nickname, u.point,
       coalesce(sum(l.amount), 0) as logged_total,
       u.point - coalesce(sum(l.amount), 0) as diff
from public.users u
left join public.point_logs l on l.user_id = u.id
group by u.id, u.nickname, u.point
having u.point <> coalesce(sum(l.amount), 0)
order by abs(u.point - coalesce(sum(l.amount), 0)) desc;

-- 3-5. 포인트 차감 기록이 없는 홍보 (song_promotions 직접 insert 악용).
select p.id, p.user_id, p.start_date, p.end_date, p.content
from public.song_promotions p
where not exists (
  select 1 from public.point_logs l
  where l.user_id = p.user_id
    and l.description like '홍보 등록: %'
    and l.amount = -(((p.end_date - p.start_date) + 1) * 15)
)
order by p.start_date desc;

-- ============================================================================
-- 4. 되돌리기 (필요할 때만 주석을 풀어 실행)
-- ============================================================================
-- 웹 코드를 이전 버전으로 되돌렸다면 섹션 2만 되돌리면 옛 라우트가 다시 동작한다.
-- 섹션 1 함수는 남겨 둬도 해가 없다.
--
-- -- 2-1 되돌리기 (0-2에서 authenticated가 true였던 경우에만)
-- -- grant execute on function public.record_point_change(<0-1의 시그니처 인자>) to authenticated;
--
-- -- 2-2 되돌리기
-- -- grant update, insert, truncate on table public.users to anon, authenticated;
--
-- -- 2-3 되돌리기 (artist-vote-schema.sql 이전 버전의 정책)
-- -- grant insert, update, delete, truncate on table public.artist_votes to anon, authenticated;
-- -- create policy "artist_votes_insert_own" on public.artist_votes
-- --   for insert with check (auth.uid() = user_id);
-- -- create policy "artist_votes_update_own" on public.artist_votes
-- --   for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- -- create policy "artist_votes_delete_own" on public.artist_votes
-- --   for delete using (auth.uid() = user_id);
--
-- -- 2-4, 2-5 되돌리기
-- -- grant insert, update, delete, truncate on table public.song_promotions to anon, authenticated;
-- -- grant insert, update, delete, truncate on table public.point_logs to anon, authenticated;
--
-- -- 섹션 1 함수 삭제
-- -- drop function if exists public.cancel_song_promotion(public.song_promotions.id%type);
-- -- drop function if exists public.create_song_promotion(public.songs.id%type, text, date, date);
-- -- drop function if exists public.cast_artist_vote(text, integer);
-- -- drop function if exists public.daily_check_in();
-- -- drop function if exists public.apply_point_change_internal(uuid, integer, text);
