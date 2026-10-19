-- القافية | مُجيب ومِضمار — نفّذ مرة واحدة في Supabase SQL Editor بعد أخذ نسخة احتياطية.
-- هذه الهجرة إضافية: لا تحذف ولا تعدل جداول الموقع الحالية.
create extension if not exists pgcrypto;

create or replace function public.qafiyah_is_director()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admin_users a where a.user_id=auth.uid() and a.is_active is true and a.role in ('owner','manager'));
$$;
revoke all on function public.qafiyah_is_director() from public, anon;
grant execute on function public.qafiyah_is_director() to anon,authenticated;

create table if not exists public.qafiyah_mujeeb_settings (
  id integer primary key default 1 check (id=1),
  enabled boolean not null default true,
  title text not null default 'مُجيب',
  greeting text not null default 'مرحباً! أنا مُجيب، رفيقك في الشعر والأدب العربي. بماذا أساعدك؟',
  system_prompt text not null default 'أنت مُجيب، مساعد موقع القافية المتخصص بالشعر والأدب العربي. تحدث بالعربية الواضحة. لا تنسب بيتاً إلى شاعر دون مصدر مؤكد. ميز بين التأليف والاقتباس، وبيّن الشك في الوزن والقافية، واستند إلى المراجع المرفقة عند توافرها.',
  updated_at timestamptz not null default now(),
  updated_by uuid
);
insert into public.qafiyah_mujeeb_settings(id) values(1) on conflict(id) do nothing;
alter table public.qafiyah_mujeeb_settings enable row level security;
drop policy if exists "mujeeb settings public read" on public.qafiyah_mujeeb_settings;
create policy "mujeeb settings public read" on public.qafiyah_mujeeb_settings for select to anon,authenticated using (true);
drop policy if exists "mujeeb settings director edit" on public.qafiyah_mujeeb_settings;
create policy "mujeeb settings director edit" on public.qafiyah_mujeeb_settings for all to authenticated using(public.qafiyah_is_director()) with check(public.qafiyah_is_director());
grant select on public.qafiyah_mujeeb_settings to anon,authenticated;
grant insert,update,delete on public.qafiyah_mujeeb_settings to authenticated;

create table if not exists public.qafiyah_challenges (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(title) between 3 and 160),
 description text not null default '',
 kind text not null default 'quiz' check(kind in ('quiz','riddle','complete','truefalse')),
 category text not null default 'الشعر والأدب',
 published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.qafiyah_game_questions (
 id uuid primary key default gen_random_uuid(),
 challenge_id uuid not null references public.qafiyah_challenges(id) on delete cascade,
 question_text text not null check(char_length(question_text) between 3 and 1500),
 options jsonb not null default '[]'::jsonb check(jsonb_typeof(options)='array' and jsonb_array_length(options) between 2 and 6),
 answer_index smallint not null check(answer_index between 0 and 5),
 explanation text not null default '',
 points smallint not null default 10 check(points between 1 and 100),
 position integer not null default 0,
 created_at timestamptz not null default now(),
 constraint answer_exists check(answer_index < jsonb_array_length(options))
);
create index if not exists qafiyah_questions_by_challenge on public.qafiyah_game_questions(challenge_id,position);
create table if not exists public.qafiyah_game_teams (
 id uuid primary key default gen_random_uuid(),
 name text not null unique check(char_length(name) between 2 and 45),
 captain uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
create table if not exists public.qafiyah_game_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 team_id uuid not null references public.qafiyah_game_teams(id) on delete cascade,
 joined_at timestamptz not null default now()
);
create index if not exists qafiyah_game_members_team on public.qafiyah_game_members(team_id);
create table if not exists public.qafiyah_game_answers (
 user_id uuid not null references auth.users(id) on delete cascade,
 question_id uuid not null references public.qafiyah_game_questions(id) on delete cascade,
 team_id uuid references public.qafiyah_game_teams(id) on delete set null,
 is_correct boolean not null,
 points integer not null,
 answered_at timestamptz not null default now(),
 primary key(user_id,question_id)
);
create index if not exists qafiyah_game_answers_team on public.qafiyah_game_answers(team_id);

alter table public.qafiyah_challenges enable row level security;
alter table public.qafiyah_game_questions enable row level security;
alter table public.qafiyah_game_teams enable row level security;
alter table public.qafiyah_game_members enable row level security;
alter table public.qafiyah_game_answers enable row level security;

-- اللاعب يرى التحديات المنشورة؛ المالك والمدير فقط يديران المحتوى.
drop policy if exists "challenges public" on public.qafiyah_challenges;
create policy "challenges public" on public.qafiyah_challenges for select to anon,authenticated using(published or public.qafiyah_is_director());
drop policy if exists "challenges director" on public.qafiyah_challenges;
create policy "challenges director" on public.qafiyah_challenges for all to authenticated using(public.qafiyah_is_director()) with check(public.qafiyah_is_director());
drop policy if exists "questions directors only" on public.qafiyah_game_questions;
create policy "questions directors only" on public.qafiyah_game_questions for all to authenticated using(public.qafiyah_is_director()) with check(public.qafiyah_is_director());

-- لا تكشف إجابات الأسئلة الصحيحة للمتسابقين: واجهة العرض تُسقط عمود الإجابة.
create or replace view public.qafiyah_game_questions_public with (security_barrier=true) as
 select q.id,q.challenge_id,q.question_text,q.options,q.points,q.position
 from public.qafiyah_game_questions q join public.qafiyah_challenges c on c.id=q.challenge_id
 where c.published is true;
revoke all on public.qafiyah_game_questions_public from public;
grant select on public.qafiyah_game_questions_public to anon,authenticated;

drop policy if exists "teams read" on public.qafiyah_game_teams;
create policy "teams read" on public.qafiyah_game_teams for select to anon,authenticated using(true);
drop policy if exists "teams create" on public.qafiyah_game_teams;
create policy "teams create" on public.qafiyah_game_teams for insert to authenticated with check(auth.uid()=captain);
drop policy if exists "teams manage" on public.qafiyah_game_teams;
create policy "teams manage" on public.qafiyah_game_teams for update to authenticated using(captain=auth.uid() or public.qafiyah_is_director()) with check(captain=auth.uid() or public.qafiyah_is_director());
drop policy if exists "teams delete" on public.qafiyah_game_teams;
create policy "teams delete" on public.qafiyah_game_teams for delete to authenticated using(captain=auth.uid() or public.qafiyah_is_director());
drop policy if exists "members read" on public.qafiyah_game_members;
create policy "members read" on public.qafiyah_game_members for select to authenticated using(true);
drop policy if exists "members join" on public.qafiyah_game_members;
create policy "members join" on public.qafiyah_game_members for insert to authenticated with check(user_id=auth.uid());
drop policy if exists "members leave" on public.qafiyah_game_members;
create policy "members leave" on public.qafiyah_game_members for delete to authenticated using(user_id=auth.uid() or public.qafiyah_is_director());
drop policy if exists "answers self read" on public.qafiyah_game_answers;
create policy "answers self read" on public.qafiyah_game_answers for select to authenticated using(user_id=auth.uid() or public.qafiyah_is_director());

-- RPC تحسب الإجابة والنقاط بالخادم، ولا تسمح بتكرار الإجابة.
create or replace function public.qafiyah_submit_game_answer(p_question uuid, p_index integer)
returns jsonb language plpgsql security definer set search_path=public as $$
declare q record; t uuid; won boolean; score integer;
begin
 if auth.uid() is null then raise exception 'يجب تسجيل الدخول للمشاركة في النقاط'; end if;
 select a.id,a.answer_index,a.points,a.explanation into q from public.qafiyah_game_questions a
 join public.qafiyah_challenges c on a.challenge_id=c.id
 where a.id=p_question and c.published is true;
 if not found then raise exception 'السؤال غير متاح'; end if;
 if p_index is null or p_index<0 or p_index>5 then raise exception 'إجابة غير صحيحة'; end if;
 select team_id into t from public.qafiyah_game_members where user_id=auth.uid();
 won := (q.answer_index=p_index);
 score := case when won then q.points else 0 end;
 insert into public.qafiyah_game_answers(user_id,question_id,team_id,is_correct,points)
 values(auth.uid(),p_question,t,won,score);
 return jsonb_build_object('correct',won,'correct_index',q.answer_index,'explanation',q.explanation,'points',score);
 exception when unique_violation then raise exception 'أجبت عن هذا السؤال من قبل';
end $$;
revoke all on function public.qafiyah_submit_game_answer(uuid,integer) from public,anon;
grant execute on function public.qafiyah_submit_game_answer(uuid,integer) to authenticated;

-- لوحة الترتيب تعرض الأسماء الاختيارية للمستخدمين بدلاً من البريد.
create or replace function public.qafiyah_game_leaderboard()
returns table(player text, points bigint) language sql stable security definer set search_path=public as $$
 select coalesce(nullif(left(u.raw_user_meta_data->>'full_name',60),''),nullif(left(u.raw_user_meta_data->>'name',60),''),'متسابق') as player,
 sum(a.points)::bigint as points
 from public.qafiyah_game_answers a join auth.users u on u.id=a.user_id
 group by a.user_id,u.raw_user_meta_data
 order by points desc limit 30;
$$;
revoke all on function public.qafiyah_game_leaderboard() from public;
grant execute on function public.qafiyah_game_leaderboard() to anon,authenticated;

create or replace function public.qafiyah_game_team_leaderboard()
returns table(team text, points bigint, members bigint) language sql stable security definer set search_path=public as $$
 select t.name,coalesce(s.total,0)::bigint,coalesce(m.total,0)::bigint
 from public.qafiyah_game_teams t
 left join (select team_id,sum(points)::bigint as total from public.qafiyah_game_answers group by team_id) s on s.team_id=t.id
 left join (select team_id,count(*)::bigint as total from public.qafiyah_game_members group by team_id) m on m.team_id=t.id
 order by 2 desc limit 30;
$$;
revoke all on function public.qafiyah_game_team_leaderboard() from public;
grant execute on function public.qafiyah_game_team_leaderboard() to anon,authenticated;

grant select on public.qafiyah_challenges,public.qafiyah_game_teams to anon,authenticated;
grant insert,update,delete on public.qafiyah_challenges,public.qafiyah_game_questions to authenticated;
grant select on public.qafiyah_game_questions to authenticated;
grant insert,update,delete on public.qafiyah_game_teams to authenticated;
grant select,insert,delete on public.qafiyah_game_members to authenticated;
grant select on public.qafiyah_game_answers to authenticated;
-- هام: لا تمنح INSERT/UPDATE/DELETE مباشرة لجدول الإجابات. الكتابة عبر RPC فقط.

-- تحديات افتتاحية أصلية قابلة للتحرير أو الحذف من لوحة الإدارة.
insert into public.qafiyah_challenges(id,title,description,kind,category,published) values
('10000000-0000-4000-8000-000000000001','موسوعة الشعراء','أسئلة عن الشعراء والعصور والألقاب الأدبية.','quiz','الشعراء',true),
('10000000-0000-4000-8000-000000000002','ألغاز القافية','ألغاز في البحور والبلاغة والمصطلحات الشعرية.','riddle','علم العروض',true),
('10000000-0000-4000-8000-000000000003','أكمل البيت','أكمل أبياتاً عربية معروفة من التراث.','complete','قصائد فصيحة',true),
('10000000-0000-4000-8000-000000000004','صح أم خطأ؟','اختبر معلوماتك عن تاريخ الأدب العربي.','truefalse','الثقافة الأدبية',true)
on conflict (id) do nothing;

insert into public.qafiyah_game_questions(id,challenge_id,question_text,options,answer_index,explanation,points,position) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','من الشاعر الملقب بأبي الطيب؟','["المتنبي","أبو تمام","البحتري","الفرزدق"]',0,'أبو الطيب أحمد بن الحسين هو المتنبي.',10,1),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','في أي عصر عاش أبو نواس؟','["الجاهلي","العباسي","الأموي","العثماني"]',1,'أبو نواس من أبرز شعراء العصر العباسي.',10,2),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','من صاحب ديوان «لزوم ما لا يلزم»؟','["أبو العلاء المعري","المتنبي","ابن زيدون","امرؤ القيس"]',0,'صاحب اللزوميات هو أبو العلاء المعري.',10,3),
('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','من صاحبة مرثية «قذى بعينك أم بالعين عوار»؟','["الخنساء","ولادة بنت المستكفي","رابعة العدوية","ليلى الأخيلية"]',0,'اشتهرت الخنساء برثاء أخويها، وخاصة صخر.',10,4),
('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000002','ما اسم العلم الذي يدرس أوزان الشعر العربي؟','["العروض","الصرف","البيان","النحو"]',0,'وضع الخليل بن أحمد الفراهيدي قواعد علم العروض.',10,1),
('20000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000002','ما اسم الحرف الذي تُبنى عليه القصيدة وتلتزمه أبياتها؟','["الروي","المد","المطلع","الحشو"]',0,'حرف الروي هو الحرف الرئيس الذي تُنسب إليه القصيدة الرائية أو اللامية ونحوهما.',10,2),
('20000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000002','أي المصطلحات يدل على الشطر الأول من البيت؟','["الصدر","العجز","الروي","الضرب"]',0,'الصدر هو الشطر الأول والعجز هو الشطر الثاني.',10,3),
('20000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000002','أي فن يقوم على تشبيه شيء بشيء مع أداة ظاهرة أو مقدّرة؟','["التشبيه","الطباق","الجناس","السجع"]',0,'التشبيه بيان مشاركة شيء لشيء في صفة.',10,4),
('20000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000003','أكمل قول المتنبي: «على قدر أهل العزم تأتي ...»','["العزائم","المكارم","الكرائم","الغنائم"]',0,'البيت: على قدر أهل العزم تأتي العزائمُ، وتأتي على قدر الكرام المكارمُ.',10,1),
('20000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000003','أكمل: «ومن يتهيب صعود الجبال ...»','["يعش أبد الدهر بين الحفر","فلا يبلغ المجد في السفر","ينل أعلى المراتب","يحب الحياة ويكره السفر"]',0,'البيت لأبي القاسم الشابي، في قصيدته إرادة الحياة.',10,2),
('20000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000003','أكمل قول الشافعي المنسوب إليه: «دع الأيام تفعل ما ...»','["تشاء","تريد","تقول","تسر"]',0,'الصيغة الشائعة: دع الأيام تفعل ما تشاءُ، وطب نفساً إذا حكم القضاءُ. قد تختلف نسبة بعض النصوص المتداولة.',10,3),
('20000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000003','أكمل قول المتنبي: «الخيل والليل والبيداء ...»','["تعرفني","تذكرني","ترقبني","تنتظرني"]',0,'من أشهر أبيات المتنبي: الخيل والليل والبيداء تعرفني.',10,4),
('20000000-0000-4000-8000-000000000013','10000000-0000-4000-8000-000000000004','الخليل بن أحمد الفراهيدي واضع علم العروض.','["صح","خطأ"]',0,'ينسب إليه وضع أصول علم العروض.',10,1),
('20000000-0000-4000-8000-000000000014','10000000-0000-4000-8000-000000000004','الشطر الثاني من البيت الشعري يسمى الصدر.','["صح","خطأ"]',1,'الشطر الثاني يسمى العجز.',10,2),
('20000000-0000-4000-8000-000000000015','10000000-0000-4000-8000-000000000004','المعلقات من أشهر قصائد الشعر العربي القديم.','["صح","خطأ"]',0,'المعلقات قصائد مشهورة من الشعر العربي الجاهلي.',10,3),
('20000000-0000-4000-8000-000000000016','10000000-0000-4000-8000-000000000004','المتنبي شاعر من العصر الأندلسي.','["صح","خطأ"]',1,'المتنبي عاش في القرن الرابع الهجري ضمن العصر العباسي.',10,4)
on conflict(id) do nothing;
