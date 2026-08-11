// 座位地图·格子数据接口(需要口令)
// 只返回 category/zone/row_number/seat_number,绝不会把联系方式一起返回
// 这样即使有人拿到口令看到了地图,也只能看到"这个座位被点亮了",看不到是谁

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

  const { password, category, zone } = body;

  if (!password || password !== process.env.SEATMAP_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: '口令不对' }) };
  }

  let query = supabase
    .from('seatmap_entries')
    .select('category, zone, row_number, seat_number');

  if (category) query = query.eq('category', category);
  if (zone) query = query.eq('zone', zone);

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
