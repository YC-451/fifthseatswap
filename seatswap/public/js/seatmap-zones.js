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

window.SEATMAP_COLS_PER_ROW = 80;

// 场馆示意布局:每个分区在场馆图上的相对位置(仿照座位划区图 + 大麦官方票价图摆的)
// category 为 null 的是"陪衬"分区,只是为了让内场区域看起来完整,不能点、不参与登记
window.VENUE_LAYOUT = {
  // 内场:VIP 区
  'VIP1区': { category: null,     row: '4/6',  col: '6/9' },
  'VIP2区': { category: '强攻区', row: '4/6',  col: '12/15' },
  'VIP3区': { category: null,     row: '6/8',  col: '5/7' },
  'VIP4区': { category: null,     row: '6/8',  col: '7/9' },
  'VIP5区': { category: '强攻区', row: '6/8',  col: '12/14' },
  'VIP6区': { category: '强攻区', row: '6/8',  col: '14/16' },
  // 内场:A 区
  'A1区': { category: null,     row: '8/10', col: '5/7' },
  'A2区': { category: null,     row: '8/10', col: '7/9' },
  'A3区': { category: '强攻区', row: '8/10', col: '12/14' },
  'A4区': { category: '强攻区', row: '8/10', col: '14/16' },
  // 内场:B 区
  'B1区': { category: null,     row: '10/12', col: '4/6' },
  'B2区': { category: null,     row: '10/12', col: '6/8' },
  'B3区': { category: null,     row: '10/12', col: '8/10' },
  'B4区': { category: '主攻区', row: '10/12', col: '12/14' },
  'B5区': { category: '主攻区', row: '10/12', col: '14/16' },
  'B6区': { category: '主攻区', row: '10/12', col: '16/18' },
  // 内场:C 区
  'C1区': { category: null,     row: '12/14', col: '4/6' },
  'C2区': { category: null,     row: '12/14', col: '6/8' },
  'C3区': { category: null,     row: '12/14', col: '8/10' },
  'C4区': { category: '主攻区', row: '12/14', col: '12/14' },
  'C5区': { category: '主攻区', row: '12/14', col: '14/16' },
  'C6区': { category: '主攻区', row: '12/14', col: '16/18' },

  // 西侧外圈(二层西 = 内圈,四层西 = 外圈),从靠近舞台往下排
  '二层西06区': { category: '主攻区', row: '4/6',  col: '18/20' },
  '二层西05区': { category: '主攻区', row: '6/8',  col: '18/20' },
  '二层西A3区': { category: '强攻区', row: '8/10', col: '18/20' },
  '二层西03区': { category: '强攻区', row: '10/12', col: '18/20' },
  '二层西02区': { category: '强攻区', row: '12/14', col: '18/20' },
  '二层西01区': { category: '强攻区', row: '14/16', col: '18/20' },

  '四层西06区': { category: '主攻区', row: '4/6',  col: '20/22' },
  '四层西05区': { category: '主攻区', row: '6/8',  col: '20/22' },
  '四层西A3区': { category: '强攻区', row: '8/10', col: '20/22' },
  '四层西03区': { category: '强攻区', row: '10/12', col: '20/22' },
  '四层西02区': { category: '强攻区', row: '12/14', col: '20/22' },
  '四层西01区': { category: '强攻区', row: '14/16', col: '20/22' },

  // 北侧外圈,西侧转过来接着往下弯
  '二层北32区': { category: '强攻区', row: '16/18', col: '16/18' },
  '二层北31区': { category: '主攻区', row: '16/18', col: '14/16' },
  '二层北30区': { category: '主攻区', row: '16/18', col: '12/14' },
  '二层北29区': { category: '主攻区', row: '16/18', col: '10/12' },

  '四层北32区': { category: '强攻区', row: '18/20', col: '16/18' },
  '四层北31区': { category: '主攻区', row: '18/20', col: '14/16' },
  '四层北30区': { category: '主攻区', row: '18/20', col: '12/14' },
  '四层北29区': { category: '主攻区', row: '18/20', col: '10/12' },
};
