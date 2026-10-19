-- القافية | سِجال | تحديث أدوات إدارة المتنافسين فقط
-- نفّذ هذا الملف مرة واحدة بعد ترقية QAFIYAH-SIJAL-UPGRADE.sql السابقة.
-- آمن لإعادة التنفيذ: يحتفظ بالتعديلات المحفوظة ولا يحذف الإجابات والجولات الأصلية.
-- يتطلب تنفيذ هذا الملف من SQL Editor بصلاحيات مالك قاعدة البيانات.

-- تصحيحات منفصلة عن الإجابات والجولات الأصلية، حتى لا تضيع سجلات اللعب.
create table if not exists public.qafiyah_sijal_player_corrections (
    user_id uuid primary key references auth.users(id) on delete cascade,
    points_delta bigint not null default 0,
    rounds_delta bigint not null default 0,
    answers_delta bigint not null default 0,
    correct_delta bigint not null default 0,
    updated_at timestamptz not null default now(),
    updated_by uuid references auth.users(id) on delete set null
);
alter table public.qafiyah_sijal_player_corrections enable row level security;
revoke all on public.qafiyah_sijal_player_corrections from public, anon, authenticated;
-- لا نضيف سياسات RLS: الجدول غير قابل للقراءة أو الكتابة مباشرة من واجهة الزوار.
-- التعديل يتم عبر دالة مقيّدة بحق المالك والمدير فقط.

create or replace function public.qafiyah_sijal_adjust_player(
    p_user uuid,
    p_metric text,
    p_action text,
    p_value bigint default 0
)
returns jsonb
language plpgsql security definer set search_path=public
as $$
declare
    base_points bigint := 0;
    base_rounds bigint := 0;
    base_answers bigint := 0;
    base_correct bigint := 0;
    prev public.qafiyah_sijal_player_corrections%rowtype;
    updated public.qafiyah_sijal_player_corrections%rowtype;
begin
    if not public.qafiyah_sijal_director() then
        raise exception 'لا تملك صلاحية إدارة المتسابقين';
    end if;
    if p_user is null or not exists(select 1 from auth.users where id=p_user) then
        raise exception 'المتسابق غير موجود';
    end if;
    if p_metric not in ('points','rounds','answers','correct','all') or p_metric is null then
        raise exception 'المؤشر المطلوب غير صالح';
    end if;
    if p_action not in ('reset','adjust') or p_action is null then
        raise exception 'نوع العملية غير صالح';
    end if;
    if p_metric='all' and p_action<>'reset' then
        raise exception 'تعديل جميع المؤشرات غير متاح؛ اختر مؤشراً بعينه';
    end if;
    if p_action='adjust' and (p_value is null or p_value=0 or abs(p_value)>1000000000) then
        raise exception 'أدخل مقدار إضافة أو خصم صحيحاً بين 1 ومليار';
    end if;

    -- قفل صف اللاعب لتسلسل التغييرات الإدارية المتزامنة.
    insert into public.qafiyah_sijal_player_corrections(user_id,updated_by)
    values(p_user,auth.uid()) on conflict(user_id) do nothing;
    select * into prev from public.qafiyah_sijal_player_corrections
    where user_id=p_user for update;

    select coalesce(sum(points),0)::bigint,
           count(*)::bigint,
           count(*) filter (where is_correct)::bigint
    into base_points,base_answers,base_correct
    from public.qafiyah_game_answers
    where user_id=p_user and team_id is null;
    select count(*)::bigint into base_rounds
    from public.qafiyah_sijal_sessions
    where user_id=p_user and finished_at is not null;

    update public.qafiyah_sijal_player_corrections set
      points_delta=case
        when p_metric in ('points','all') and p_action='reset' then -base_points
        when p_metric='points' and p_action='adjust' then greatest(-base_points,prev.points_delta+p_value)
        else prev.points_delta end,
      rounds_delta=case
        when p_metric in ('rounds','all') and p_action='reset' then -base_rounds
        when p_metric='rounds' and p_action='adjust' then greatest(-base_rounds,prev.rounds_delta+p_value)
        else prev.rounds_delta end,
      answers_delta=case
        when p_metric in ('answers','all') and p_action='reset' then -base_answers
        when p_metric='answers' and p_action='adjust' then greatest(-base_answers,prev.answers_delta+p_value)
        else prev.answers_delta end,
      correct_delta=case
        when p_metric in ('correct','all') and p_action='reset' then -base_correct
        when p_metric='correct' and p_action='adjust' then greatest(-base_correct,prev.correct_delta+p_value)
        else prev.correct_delta end,
      updated_at=now(),updated_by=auth.uid()
    where user_id=p_user returning * into updated;

    return jsonb_build_object(
      'points',greatest(0,base_points+updated.points_delta),
      'rounds',greatest(0,base_rounds+updated.rounds_delta),
      'answers',greatest(0,base_answers+updated.answers_delta),
      'correct',greatest(0,base_correct+updated.correct_delta)
    );
end;
$$;
revoke all on function public.qafiyah_sijal_adjust_player(uuid,text,text,bigint) from public, anon;
grant execute on function public.qafiyah_sijal_adjust_player(uuid,text,text,bigint) to authenticated;

-- يظهر التصنيف الفردي النقاط بعد إضافة/خصم/تصفير المدير.
-- نقاط الفرق والجولات الجماعية لا تدخل التصنيف.
create or replace function public.qafiyah_game_leaderboard()
returns table(player text,points bigint)
language sql stable security definer set search_path=public
as $$
 with base as (
   select user_id,coalesce(sum(points),0)::bigint as score
   from public.qafiyah_game_answers where team_id is null group by user_id
 ), people as (
   select user_id from base
   union
   select user_id from public.qafiyah_sijal_player_corrections
 )
 select coalesce(nullif(left(u.raw_user_meta_data->>'full_name',60),''),
                 nullif(left(u.raw_user_meta_data->>'name',60),''),'متسابق'),
        greatest(0,coalesce(b.score,0)+coalesce(c.points_delta,0))::bigint as points
 from people x
 join auth.users u on u.id=x.user_id
 left join base b on b.user_id=x.user_id
 left join public.qafiyah_sijal_player_corrections c on c.user_id=x.user_id
 where not exists(select 1 from public.qafiyah_sijal_hidden_players h where h.user_id=x.user_id)
 and exists(select 1 from public.qafiyah_sijal_settings s where s.id=1 and s.enabled and s.leaderboard_enabled)
 order by points desc,1 limit 100;
$$;
revoke all on function public.qafiyah_game_leaderboard() from public;
grant execute on function public.qafiyah_game_leaderboard() to anon,authenticated;

-- تعرض اللوحة القيم المعدلة مع الاحتفاظ بالسجل التاريخي الأصلي.
create or replace function public.qafiyah_sijal_admin_players()
returns table(user_id uuid,player text,email text,rounds bigint,answers bigint,correct bigint,points bigint,last_played timestamptz,hidden boolean)
language sql stable security definer set search_path=public
as $$
 select u.id,
        coalesce(nullif(left(u.raw_user_meta_data->>'full_name',90),''),
                 nullif(left(u.raw_user_meta_data->>'name',90),''),'متسابق'),
        u.email::text,
        greatest(0,coalesce(s.rounds,0)+coalesce(c.rounds_delta,0))::bigint,
        greatest(0,coalesce(a.answers,0)+coalesce(c.answers_delta,0))::bigint,
        greatest(0,coalesce(a.correct,0)+coalesce(c.correct_delta,0))::bigint,
        greatest(0,coalesce(a.points,0)+coalesce(c.points_delta,0))::bigint,
        greatest(a.last_played,s.last_played),
        exists(select 1 from public.qafiyah_sijal_hidden_players h where h.user_id=u.id)
 from auth.users u
 left join lateral (
   select count(*) filter(where finished_at is not null)::bigint as rounds,
          max(coalesce(finished_at,started_at)) as last_played
   from public.qafiyah_sijal_sessions where user_id=u.id
 ) s on true
 left join lateral (
   select count(*)::bigint as answers,
          count(*) filter(where is_correct)::bigint as correct,
          coalesce(sum(points),0)::bigint as points,
          max(answered_at) as last_played
   from public.qafiyah_game_answers where user_id=u.id and team_id is null
 ) a on true
 left join public.qafiyah_sijal_player_corrections c on c.user_id=u.id
 where public.qafiyah_sijal_director() and
       (coalesce(a.answers,0)>0 or coalesce(s.rounds,0)>0 or
        c.points_delta<>0 or c.rounds_delta<>0 or c.answers_delta<>0 or c.correct_delta<>0)
 order by 7 desc,greatest(a.last_played,s.last_played) desc nulls last
 limit 1000;
$$;
revoke all on function public.qafiyah_sijal_admin_players() from public;
grant execute on function public.qafiyah_sijal_admin_players() to authenticated;
