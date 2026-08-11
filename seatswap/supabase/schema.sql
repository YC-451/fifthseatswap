-- ============================================================
-- 换座信息登记网站 · 数据库结构
-- 在 Supabase 项目的 SQL Editor 里,把这整个文件粘贴进去执行一次即可
-- ============================================================

create extension if not exists "pgcrypto"; -- 用于生成 uuid

-- ------------------------------------------------------------
-- 主表:submissions(每一条换座登记信息)
-- ------------------------------------------------------------
create table if not exists submissions (
  id             uuid primary key default gen_random_uuid(),
  edit_token     uuid not null default gen_random_uuid(), -- 专属管理链接用的令牌,不对外暴露给别人
  show_date      text not null check (show_date in ('8.13','8.14','8.16','8.17')),

  -- 来源:self = 博文家自己人(入口一登记,只能是"非主攻区");
  --      external = 别家人或志愿者通过入口二登记(只能是"主攻区/强攻区")
  source_type    text not null check (source_type in ('self','external')),

  -- 当前座位
  current_category text not null check (current_category in ('强攻区','主攻区','非主攻区')),
  current_zone      text not null,
  current_price     integer not null,
  current_row       text,
  current_seat      text,

  -- 意向分区,存成 JSON 数组,每一项形如:
  -- {"zone":"二层西05区","category":"主攻区","price":980,"row_limited":true,"row_pref":"5排以内"}
  intent_zones      jsonb not null default '[]'::jsonb,

  max_accept_price     integer,          -- 最高愿意补到哪个价位
  same_level_ok        boolean default false, -- 同价位换票是否接受补差价
  same_level_amount    integer,          -- 同价位最多愿意补多少钱

  ticket_image_url  text,               -- 票据截图(存 Supabase Storage 的公开地址)

  weibo_id     text not null default '/',
  weibo_link   text not null default '/',
  xhs_id       text not null default '/',
  dy_id        text not null default '/',

  status       text not null default 'active' check (status in ('active','matched')),

  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_submissions_lookup
  on submissions (show_date, current_category, current_price, status);

create index if not exists idx_submissions_edit_token
  on submissions (edit_token);

-- ------------------------------------------------------------
-- 举报表:flags(用于"两个不同的人标记同一条已完成"的机制)
-- ------------------------------------------------------------
create table if not exists match_flags (
  id             uuid primary key default gen_random_uuid(),
  submission_id  uuid not null references submissions(id) on delete cascade,
  flagger_token  text not null, -- 标记人的浏览器指纹/临时id,防止同一个人重复标记刷数量
  created_at     timestamptz not null default now(),
  unique (submission_id, flagger_token)
);

-- ------------------------------------------------------------
-- 触发器:updated_at 自动更新
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_submissions_updated_at on submissions;
create trigger trg_submissions_updated_at
  before update on submissions
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- 行级安全策略(RLS)—— 核心权限隔离在这里实现
-- ------------------------------------------------------------
alter table submissions enable row level security;
alter table match_flags enable row level security;

-- 1) 匿名用户(前端直接用 anon key 查询)只能看到:
--    本人自主登记 + 当前座位在"非主攻区" + 状态是 active 的数据
--    —— 这就是"对外查询版入口"能看到的全部内容
create policy "public_can_read_non_main_self_listings"
  on submissions for select
  to anon
  using (
    source_type = 'self'
    and current_category = '非主攻区'
    and status = 'active'
  );

-- 2) 匿名用户可以通过"入口一"登记自己的信息,但限定只能是"非主攻区"当前座位,
--    (强攻/主攻的人本来就不需要用这个网站换票)
create policy "entry1_self_register_non_main_only"
  on submissions for insert
  to anon
  with check (
    source_type = 'self'
    and current_category = '非主攻区'
  );

-- 2b) 匿名用户可以通过"入口二"登记(别家人自己填,或志愿者代填),
--     限定只能是"主攻区/强攻区"当前座位,这部分数据不会出现在入口二自己的查询里,
--     只有入口一(有口令)能看到 —— 这就是权限隔离生效的地方
create policy "entry2_external_register_main_only"
  on submissions for insert
  to anon
  with check (
    source_type = 'external'
    and current_category in ('主攻区','强攻区')
  );

-- 3) "完整版数据"(包含入口二收集的主攻/强攻区数据)不通过 anon 直接查询,
--    而是通过带口令验证的 Netlify Function,用 service role key 在服务器端查询后再返回,
--    所以这里 *不* 为 anon 开放"查看全部数据"的 select 策略。

-- match_flags:允许匿名插入(用于举报"对方已完成"),但不允许直接读取全部举报数据
create policy "anyone_can_flag"
  on match_flags for insert
  to anon
  with check (true);

-- ------------------------------------------------------------
-- RPC 函数:凭专属管理链接的 edit_token 查看自己那条信息
-- (普通的 RLS 规则不会让本人看到自己已经匹配完成/或分类不是非主攻区的信息,
--  所以单独开一个只认 token、不认分类的查询通道)
-- ------------------------------------------------------------
create or replace function get_submission_by_token(p_edit_token uuid)
returns setof submissions
security definer
set search_path = public
language sql
as $$
  select * from submissions where edit_token = p_edit_token;
$$;

grant execute on function get_submission_by_token(uuid) to anon;

-- ------------------------------------------------------------
-- RPC 函数:标记"已完成"
-- 用 SECURITY DEFINER,这样调用者不需要直接有 update 权限,
-- 但函数内部限制了只能改自己 token 对应的那一条
-- ------------------------------------------------------------
create or replace function mark_as_matched(p_edit_token uuid)
returns void
security definer
set search_path = public
language plpgsql
as $$
begin
  update submissions
  set status = 'matched'
  where edit_token = p_edit_token;
end;
$$;

-- ------------------------------------------------------------
-- RPC 函数:提交"标记恢复上架"(本人发现被误判时使用)
-- ------------------------------------------------------------
create or replace function reactivate_listing(p_edit_token uuid)
returns void
security definer
set search_path = public
language plpgsql
as $$
begin
  update submissions
  set status = 'active'
  where edit_token = p_edit_token;

  delete from match_flags
  where submission_id = (select id from submissions where edit_token = p_edit_token);
end;
$$;

-- ------------------------------------------------------------
-- RPC 函数:举报某条信息"对方已完成换票",累计到2个不同标记人自动下架
-- ------------------------------------------------------------
create or replace function flag_submission_matched(p_submission_id uuid, p_flagger_token text)
returns void
security definer
set search_path = public
language plpgsql
as $$
declare
  flag_count integer;
begin
  insert into match_flags (submission_id, flagger_token)
  values (p_submission_id, p_flagger_token)
  on conflict (submission_id, flagger_token) do nothing;

  select count(*) into flag_count
  from match_flags
  where submission_id = p_submission_id;

  if flag_count >= 2 then
    update submissions set status = 'matched' where id = p_submission_id;
  end if;
end;
$$;

-- 允许 anon 调用这几个 RPC 函数
grant execute on function mark_as_matched(uuid) to anon;
grant execute on function reactivate_listing(uuid) to anon;
grant execute on function flag_submission_matched(uuid, text) to anon;

-- ------------------------------------------------------------
-- Storage:票据截图存储桶(需要在 Supabase 后台 Storage 里手动建一个
-- 名为 ticket-screenshots 的 public bucket,这里给它配好读写策略)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('ticket-screenshots', 'ticket-screenshots', true)
on conflict (id) do nothing;

create policy "anyone_can_upload_ticket_screenshot"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'ticket-screenshots');

create policy "anyone_can_view_ticket_screenshot"
  on storage.objects for select
  to anon
  using (bucket_id = 'ticket-screenshots');
