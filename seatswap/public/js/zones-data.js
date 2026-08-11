// 座位分类 / 分区 / 票价 —— 全站唯一数据来源,改场馆信息只需要改这一个文件
window.CATEGORY_DATA = [
  { name:'强攻区', color:'#e2266e', zones:[
    {name:'VIP2区',price:1680}, {name:'VIP5区',price:1680}, {name:'VIP6区',price:1680},
    {name:'A3区',price:1480}, {name:'A4区',price:1480},
    {name:'二层西A3区',price:980}, {name:'二层西03区',price:980},
    {name:'二层西02区',price:680}, {name:'二层西01区',price:680}, {name:'二层北32区',price:680},
    {name:'四层西A3区',price:980}, {name:'四层西03区',price:980},
    {name:'四层西02区',price:680}, {name:'四层西01区',price:680}, {name:'四层北32区',price:480},
  ]},
  { name:'主攻区', color:'#f0b23e', zones:[
    {name:'B4区',price:1480}, {name:'B5区',price:1480}, {name:'B6区',price:1480},
    {name:'C4区',price:1280}, {name:'C5区',price:1280}, {name:'C6区',price:1280},
    {name:'二层西06区',price:980}, {name:'二层西05区',price:980},
    {name:'二层北29区',price:480}, {name:'二层北31区',price:680}, {name:'二层北30区',price:480},
    {name:'四层西06区',price:980}, {name:'四层西05区',price:980},
    {name:'四层北29区',price:280}, {name:'四层北31区',price:480}, {name:'四层北30区',price:280},
  ]},
  { name:'非主攻区', color:'#3b9ee8', zones:[
    {name:'VIP1区',price:1680}, {name:'VIP3区',price:1680}, {name:'VIP4区',price:1680},
    {name:'A1区',price:1480}, {name:'A2区',price:1480},
    {name:'B1区',price:1480}, {name:'B2区',price:1480}, {name:'B3区',price:1480},
    {name:'C1区',price:1280}, {name:'C2区',price:1280}, {name:'C3区',price:1280},
    {name:'二层东18区',price:980}, {name:'二层东19区',price:980}, {name:'二层东20区',price:980},
    {name:'二层东21区',price:980}, {name:'二层东22区',price:980}, {name:'二层东23区',price:980},
    {name:'四层东18区',price:980}, {name:'四层东19区',price:980}, {name:'四层东20区',price:980},
    {name:'四层东21区',price:680}, {name:'四层东22区',price:680}, {name:'四层东23区',price:680},
    {name:'二层北24区',price:680}, {name:'二层北25区',price:680},
    {name:'二层北26区',price:480}, {name:'二层北27区',price:480},
    {name:'四层北24区',price:480}, {name:'四层北25区',price:480},
    {name:'四层北26区',price:280}, {name:'四层北27区',price:280},
  ]},
];

window.SHOW_DATES = ['8.13','8.14','8.16','8.17'];

window.findZone = function(name){
  for(const cat of window.CATEGORY_DATA){
    const z = cat.zones.find(z => z.name === name);
    if(z) return { ...z, category: cat.name, color: cat.color };
  }
  return null;
};
