-- القافية | ترقية مِضمار إلى «سِجال».
-- نفّذ بعد ملف QAFIYAH-MUJEEB-MIDMAR.sql القديم الذي نفّذته سابقاً.
-- لا يمس جداول القصائد أو المقالات أو مُجيب.
-- لا تنفّذ الملف كاملاً مراراً عشوائياً بعد تخصيص البيانات، رغم استخدام أوامر قابلة للإعادة.
create extension if not exists pgcrypto;

-- تحقق الأدوار على مستوى قاعدة البيانات (المالك والمدير فقط).
create or replace function public.qafiyah_sijal_director()
returns boolean language sql stable security definer set search_path=public as $$
  select auth.uid() is not null and exists
    (select 1 from public.admin_users a where a.user_id=auth.uid()
      and a.is_active is true and a.role in ('owner','manager'));
$$;
revoke all on function public.qafiyah_sijal_director() from public;
-- تحتاج سياسة عرض الألعاب العامة إلى تنفيذ الدالة للمستخدم المجهول أيضاً.
-- تعيد FALSE دائماً عندما auth.uid() غير موجود؛ لا تكشف بيانات الإدارة.
grant execute on function public.qafiyah_sijal_director() to anon,authenticated;

create table if not exists public.qafiyah_sijal_settings (
 id smallint primary key default 1 check(id=1),
 enabled boolean not null default true,
 leaderboard_enabled boolean not null default true,
 updated_at timestamptz not null default now(),
 updated_by uuid
);
insert into public.qafiyah_sijal_settings(id) values(1) on conflict(id) do nothing;
alter table public.qafiyah_sijal_settings enable row level security;
drop policy if exists "sijal settings read" on public.qafiyah_sijal_settings;
create policy "sijal settings read" on public.qafiyah_sijal_settings for select to anon,authenticated using(true);
drop policy if exists "sijal settings directors update" on public.qafiyah_sijal_settings;
create policy "sijal settings directors update" on public.qafiyah_sijal_settings for update to authenticated using(public.qafiyah_sijal_director()) with check(public.qafiyah_sijal_director());
grant select on public.qafiyah_sijal_settings to anon,authenticated;
grant update on public.qafiyah_sijal_settings to authenticated;

-- متابعة عدد الجولات المكتملة (يختلف عن عدد الأسئلة التي أجيب عنها).
-- لا تستطيع الواجهة إدخال سجلات الجولات مباشرة، بل عبر دوال مربوطة بالحساب.
create table if not exists public.qafiyah_sijal_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 started_at timestamptz not null default now(),
 finished_at timestamptz
);
create index if not exists qafiyah_sijal_sessions_by_user on public.qafiyah_sijal_sessions(user_id,finished_at);
alter table public.qafiyah_sijal_sessions enable row level security;
revoke all on public.qafiyah_sijal_sessions from anon,authenticated;
create or replace function public.qafiyah_sijal_start_session()
returns uuid language plpgsql security definer set search_path=public as $$
declare new_id uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.qafiyah_sijal_settings where id=1 and enabled=true)
 then raise exception 'الجولة غير متاحة'; end if;
 insert into public.qafiyah_sijal_sessions(user_id) values(auth.uid()) returning id into new_id;
 return new_id;
end $$;
revoke all on function public.qafiyah_sijal_start_session() from public;
grant execute on function public.qafiyah_sijal_start_session() to authenticated;
create or replace function public.qafiyah_sijal_finish_session(p_session uuid)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 update public.qafiyah_sijal_sessions set finished_at=now()
 where id=p_session and user_id=auth.uid() and finished_at is null;
 return found;
end $$;
revoke all on function public.qafiyah_sijal_finish_session(uuid) from public;
grant execute on function public.qafiyah_sijal_finish_session(uuid) to authenticated;

-- أنواع التحديات: أسئلة شبيهة بجولة أسئلة عامة، خمن الشاعر، من القائل، اكمل البيت، صح/خطأ، ألغاز.
alter table public.qafiyah_challenges drop constraint if exists qafiyah_challenges_kind_check;
alter table public.qafiyah_challenges add constraint qafiyah_challenges_kind_check
 check (kind in ('quiz','riddle','complete','truefalse','guesspoet','speaker'));
alter table public.qafiyah_game_questions add column if not exists media_url text;
alter table public.qafiyah_game_questions add column if not exists media_type text not null default 'none';
alter table public.qafiyah_game_questions drop constraint if exists qafiyah_game_questions_media_type_check;
alter table public.qafiyah_game_questions add constraint qafiyah_game_questions_media_type_check
 check(media_type in ('none','image','audio','video'));
alter table public.qafiyah_game_questions add column if not exists media_caption text not null default '';

-- منع حسابات معينة من الصدارة مع الإبقاء على بيانات المستخدم الأصلية دون حذف حسابه.
create table if not exists public.qafiyah_sijal_hidden_players (
 user_id uuid primary key references auth.users(id) on delete cascade,
 hidden_at timestamptz not null default now(),
 hidden_by uuid
);
alter table public.qafiyah_sijal_hidden_players enable row level security;
drop policy if exists "sijal hidden directors" on public.qafiyah_sijal_hidden_players;
create policy "sijal hidden directors" on public.qafiyah_sijal_hidden_players for all to authenticated
 using(public.qafiyah_sijal_director()) with check(public.qafiyah_sijal_director());
grant select,insert,delete on public.qafiyah_sijal_hidden_players to authenticated;

-- تخزين ملفات السؤال: القراءة عامة، الكتابة والحذف للمالك والمدير فقط.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('sijal-media','sijal-media',true,10485760,array[
 'image/jpeg','image/png','image/webp','image/gif',
 'audio/mpeg','audio/mp4','audio/ogg','audio/wav','audio/webm',
 'video/mp4','video/webm'])
on conflict(id) do update set public=true,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "sijal media view" on storage.objects;
create policy "sijal media view" on storage.objects for select to anon,authenticated using(bucket_id='sijal-media');
drop policy if exists "sijal media directors insert" on storage.objects;
create policy "sijal media directors insert" on storage.objects for insert to authenticated
 with check(bucket_id='sijal-media' and public.qafiyah_sijal_director());
drop policy if exists "sijal media directors delete" on storage.objects;
create policy "sijal media directors delete" on storage.objects for delete to authenticated
 using(bucket_id='sijal-media' and public.qafiyah_sijal_director());

-- عرض الأسئلة يخفي الإجابة، ولا يعرض الألعاب الموقوفة أو الموقع الموقوف.
create or replace view public.qafiyah_game_questions_public with (security_barrier=true) as
 select q.id,q.challenge_id,q.question_text,q.options,q.points,q.position,
        q.media_url,q.media_type,q.media_caption
 from public.qafiyah_game_questions q
 join public.qafiyah_challenges c on c.id=q.challenge_id
 where c.published=true and exists(select 1 from public.qafiyah_sijal_settings s where s.id=1 and s.enabled);
revoke all on public.qafiyah_game_questions_public from public;
grant select on public.qafiyah_game_questions_public to anon,authenticated;

-- تعديل سياسة عرض التحديات بحيث توقف سِجال لا يُظهر مسابقات للزوار.
drop policy if exists "challenges public" on public.qafiyah_challenges;
create policy "challenges public" on public.qafiyah_challenges for select to anon,authenticated
 using(public.qafiyah_sijal_director() or (
  published=true and exists(select 1 from public.qafiyah_sijal_settings s where s.id=1 and s.enabled)
 ));

-- الإجابة الفردية فقط تضيف نقاطاً موثوقة ومرة واحدة لكل سؤال لكل مستخدم.
create or replace function public.qafiyah_submit_game_answer(p_question uuid,p_index integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare q record; won boolean; awarded integer;
begin
 if auth.uid() is null then raise exception 'سجّل دخولك لاحتساب النقاط'; end if;
 if not exists(select 1 from public.qafiyah_sijal_settings where id=1 and enabled=true) then
  raise exception 'المسابقة متوقفة مؤقتاً'; end if;
 if exists(select 1 from public.qafiyah_sijal_hidden_players where user_id=auth.uid()) then
  raise exception 'الحساب موقوف عن التصنيف'; end if;
 select a.id,a.answer_index,a.points,a.explanation,jsonb_array_length(a.options) as num
 into q from public.qafiyah_game_questions a
 join public.qafiyah_challenges c on a.challenge_id=c.id
 where a.id=p_question and c.published=true;
 if not found then raise exception 'السؤال غير متاح'; end if;
 if p_index is null or p_index<0 or p_index>=q.num then raise exception 'إجابة غير صالحة'; end if;
 won := q.answer_index=p_index;
 awarded := case when won then q.points else 0 end;
 insert into public.qafiyah_game_answers(user_id,question_id,team_id,is_correct,points)
 values(auth.uid(),p_question,null,won,awarded);
 return jsonb_build_object('correct',won,'correct_index',q.answer_index,'explanation',q.explanation,'points',awarded);
 exception when unique_violation then raise exception 'سبق أن أجبت عن هذا السؤال';
end $$;
revoke all on function public.qafiyah_submit_game_answer(uuid,integer) from public;
grant execute on function public.qafiyah_submit_game_answer(uuid,integer) to authenticated;

-- تحقق الجولة الجماعية/التجريبية بلا تسجيل أو زيادة في ترتيب الأفراد.
create or replace function public.qafiyah_sijal_check_answer(p_question uuid,p_index integer)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare q record; won boolean;
begin
 if not exists(select 1 from public.qafiyah_sijal_settings where id=1 and enabled=true) then
  raise exception 'المسابقة متوقفة مؤقتاً'; end if;
 select a.answer_index,a.points,a.explanation,jsonb_array_length(a.options) as num
 into q from public.qafiyah_game_questions a
 join public.qafiyah_challenges c on a.challenge_id=c.id
 where a.id=p_question and c.published=true;
 if not found or p_index is null or p_index<0 or p_index>=q.num then raise exception 'إجابة غير صالحة'; end if;
 won := q.answer_index=p_index;
 return jsonb_build_object('correct',won,'correct_index',q.answer_index,'explanation',q.explanation,
    'points',case when won then q.points else 0 end);
end $$;
revoke all on function public.qafiyah_sijal_check_answer(uuid,integer) from public;
grant execute on function public.qafiyah_sijal_check_answer(uuid,integer) to anon,authenticated;

-- ترتيب الأفراد دائم من إجاباتهم فقط، ولا تدخل نقاط مباريات الفرق المؤقتة.
create or replace function public.qafiyah_game_leaderboard()
returns table(player text,points bigint) language sql stable security definer set search_path=public as $$
 select coalesce(nullif(left(u.raw_user_meta_data->>'full_name',60),''),
                 nullif(left(u.raw_user_meta_data->>'name',60),''),'متسابق') as player,
        sum(a.points)::bigint as points
 from public.qafiyah_game_answers a
 join auth.users u on u.id=a.user_id
 where a.team_id is null
   and not exists (select 1 from public.qafiyah_sijal_hidden_players h where h.user_id=a.user_id)
   and exists (select 1 from public.qafiyah_sijal_settings s where s.id=1 and s.enabled and s.leaderboard_enabled)
 group by a.user_id,u.raw_user_meta_data
 order by points desc,player limit 100;
$$;
revoke all on function public.qafiyah_game_leaderboard() from public;
grant execute on function public.qafiyah_game_leaderboard() to anon,authenticated;

-- تقدم المستخدمين: بيانات خاصة بلوحة إدارة سِجال فقط.
drop function if exists public.qafiyah_sijal_admin_players();
create or replace function public.qafiyah_sijal_admin_players()
returns table(user_id uuid,player text,email text,rounds bigint,answers bigint,correct bigint,points bigint,last_played timestamptz,hidden boolean)
language sql stable security definer set search_path=public as $$
 select u.id,
 coalesce(nullif(left(u.raw_user_meta_data->>'full_name',90),''),
          nullif(left(u.raw_user_meta_data->>'name',90),''),'متسابق'),
 u.email::text,coalesce(s.rounds,0)::bigint,coalesce(a.answers,0)::bigint,
 coalesce(a.correct,0)::bigint,coalesce(a.points,0)::bigint,
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
 where public.qafiyah_sijal_director() and (coalesce(a.answers,0)>0 or coalesce(s.rounds,0)>0)
 order by a.points desc nulls last,greatest(a.last_played,s.last_played) desc nulls last
 limit 1000;
$$;
revoke all on function public.qafiyah_sijal_admin_players() from public;
grant execute on function public.qafiyah_sijal_admin_players() to authenticated;

create or replace function public.qafiyah_sijal_set_hidden(p_user uuid,p_hidden boolean)
returns boolean language plpgsql security definer set search_path=public as $$
begin
 if not public.qafiyah_sijal_director() then raise exception 'غير مخوّل'; end if;
 if p_hidden then
 insert into public.qafiyah_sijal_hidden_players(user_id,hidden_by) values(p_user,auth.uid())
 on conflict(user_id) do nothing;
 else delete from public.qafiyah_sijal_hidden_players where user_id=p_user;
 end if;
 return true;
end $$;
revoke all on function public.qafiyah_sijal_set_hidden(uuid,boolean) from public;
grant execute on function public.qafiyah_sijal_set_hidden(uuid,boolean) to authenticated;

create or replace function public.qafiyah_sijal_reset_points(p_user uuid)
returns bigint language plpgsql security definer set search_path=public as $$
declare qty bigint;
begin
 if not public.qafiyah_sijal_director() then raise exception 'غير مخوّل'; end if;
 delete from public.qafiyah_game_answers where user_id=p_user;
 get diagnostics qty=row_count;
 return qty;
end $$;
revoke all on function public.qafiyah_sijal_reset_points(uuid) from public;
grant execute on function public.qafiyah_sijal_reset_points(uuid) to authenticated;

-- أمثلة افتتاحية للأنواع الإضافية، لا تكرر الإضافة إذا شغّلت SQL مرة ثانية.
insert into public.qafiyah_challenges(id,title,description,kind,category,published) values
('10000000-0000-4000-8000-000000000005','خمن الشاعر','استدل على الشاعر من سيرته وأعماله.','guesspoet','الشعراء',true),
('10000000-0000-4000-8000-000000000006','من القائل؟','تعرّف على أصحاب الأبيات المشهورة.','speaker','القصائد',true)
on conflict(id) do nothing;
insert into public.qafiyah_game_questions(id,challenge_id,question_text,options,answer_index,explanation,points,position) values
('20000000-0000-4000-8000-000000000017','10000000-0000-4000-8000-000000000005','شاعر عباسي لُقّب بأبي الطيب، واشتهر بقصيدة «على قدر أهل العزم». فمن هو؟','["المتنبي","أبو تمام","البحتري","أبو نواس"]',0,'هو أبو الطيب المتنبي.',10,1),
('20000000-0000-4000-8000-000000000018','10000000-0000-4000-8000-000000000005','شاعرة جاهلية عُرفت برثاء أخيها صخر، فمن هي؟','["الخنساء","ولّادة","ليلى الأخيلية","رابعة العدوية"]',0,'هي الخنساء تماضر بنت عمرو.',10,2),
('20000000-0000-4000-8000-000000000019','10000000-0000-4000-8000-000000000006','من القائل: «إذا الشعب يوماً أراد الحياة فلا بد أن يستجيب القدر»؟','["أبو القاسم الشابي","المتنبي","الشريف الرضي","إيليا أبو ماضي"]',0,'البيت للشاعر أبي القاسم الشابي.',10,1),
('20000000-0000-4000-8000-000000000020','10000000-0000-4000-8000-000000000006','من القائل: «على قدر أهل العزم تأتي العزائم»؟','["المتنبي","زهير بن أبي سلمى","أحمد شوقي","أبو تمام"]',0,'هو المتنبي.',10,2)
on conflict(id) do nothing;
