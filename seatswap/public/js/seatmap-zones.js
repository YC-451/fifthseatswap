// 座位地图专用的分区数据 —— 只有强攻区/主攻区,跟换座网站的 zones-data.js 是分开的,互不影响
window.SEATMAP_CATEGORIES = [
  { name:'强攻区', color:'#e2266e', zones:[
    'VIP2区','VIP5区','VIP6区','A3区','A4区',
    '二层西A3区','二层西03区','二层西02区','二层西01区','二层北32区',
    '四层西A3区','四层西03区','四层西02区','四层西01区','四层北32区',
  ]},
  { name:'主攻区', color:'#f0b23e', zones:[
    'B4区','B5区','B6区','C4区','C5区','C6区',
    '二层西06区','二层西05区','二层北29区','二层北31区','二层北30区',
    '四层西06区','四层西05区','四层北29区','四层北31区','四层北30区',
  ]},
];

// 排数范围:二层 1-32排,四层 33-72排,内场(VIP/A/B/C)暂按1-40排估算(没有官方依据,留点余量)
window.getSeatmapRowRange = function(zoneName){
  if(zoneName.startsWith('二层')) return [1, 32];
  if(zoneName.startsWith('四层')) return [33, 72];
  return [1, 40];
};

window.SEATMAP_COLS_PER_ROW = 100;
