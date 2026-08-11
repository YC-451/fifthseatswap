// 批量导入接口(需要口令)—— 用来把 Excel 表格整理好之后的一批数据批量写入数据库
// 逐条登记(入口二网页表单)不需要口令,直接走 RLS 允许的 anon insert;
// 这个接口是给"一次性导入几十上百条 Excel 数据"这种批量场景用的额外保护,防止被刷。

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: '请求格式不对' }) };
  }

  const { password, rows } = body;

  if (!password || password !== process.env.INTERNAL_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: '口令不对' }) };
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: '没有可导入的数据' }) };
  }

  const payload = rows.map((r) => ({
    show_date: r.show_date,
    source_type: 'external',
    current_category: r.current_category,
    current_zone: r.current_zone,
    current_price: r.current_price,
    current_row: r.current_row || null,
    current_seat: r.current_seat || null,
    intent_zones: r.intent_zones || [],
    max_accept_price: r.max_accept_price || null,
    same_level_ok: r.same_level_ok || false,
    same_level_amount: r.same_level_amount || null,
    ticket_image_url: r.ticket_image_url || null,
    weibo_id: r.weibo_id || '/',
    weibo_link: r.weibo_link || '/',
    xhs_id: r.xhs_id || '/',
    dy_id: r.dy_id || '/',
  }));

  const { data, error } = await supabase.from('submissions').insert(payload).select('id');

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imported: data.length }),
  };
};
