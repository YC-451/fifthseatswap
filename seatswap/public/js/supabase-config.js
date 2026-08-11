// ⚠️ 部署前必填:去 Supabase 项目后台 → Settings → API,把下面两个值换成你自己项目的
// SUPABASE_URL 例如:https://abcdefgh.supabase.co
// SUPABASE_ANON_KEY 是 "anon public" 那一串,不是 service_role(service_role 绝不能出现在前端代码里!)

window.SUPABASE_URL = 'https://ejzagqlhrkocgbjjkfqa.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqemFncWxocmtvY2diamprZnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MTIwODYsImV4cCI6MjEwMTk4ODA4Nn0.ignXwDe1Mit5BBFh8m1E039-YI0s3lQTx4v898-gUv8';

window.getSupabaseClient = function(){
  return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
};
