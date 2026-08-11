// 完整版数据查询接口
// 只有口令正确,才会用 service role key(只存在于服务器环境变量里,浏览器永远拿不到)去查全部数据
// 这样即使有人打开浏览器"查看网页源代码",也看不到口令或者高权限密钥

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 注意:这个必须是 service role key,不是 anon key
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

  const { password, showDate, category } = body;

  if (!password || password !== process.env.INTERNAL_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: '口令不对' }) };
  }

  let query = supabase
    .from('submissions')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (showDate) query = query.eq('show_date', showDate);
  if (category) query = query.eq('current_category', category);

  const { data, error } = await query;

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  };
};
