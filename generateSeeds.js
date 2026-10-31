const fs = require('fs');
const path = require('path');

// 1. Parse ThingsToDo.txt
const content = fs.readFileSync(path.join(__dirname, 'ThingsToDo.txt'), 'utf8');
const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

const activities = lines.map((title, idx) => {
  let occasion = 'short';
  if (/整天|露營|離島|滑雪|遊樂園|日月潭|登山|爬山|農場|採草莓|不看時間|淨灘|滑翔翼/.test(title)) {
    occasion = 'wholeDay';
  } else if (/晚餐|夜市|星星|夕陽|宵夜|消夜|酒|電影|KTV|煙火|演唱會|睡前|溫泉|日劇|韓劇|港片|動畫|恐怖片|影集|相聲/.test(title)) {
    occasion = 'dateNight';
  }

  let budget = '$';
  if (/滑雪|清空購物車|買家具|出國|機票|住宿/.test(title)) {
    budget = '$$$$';
  } else if (/金工|SPA|演唱會|遊樂園|和服|滑翔翼|岩盤浴|空中瑜珈|皮拉提斯|音樂祭|最貴/.test(title)) {
    budget = '$$$';
  } else if (/餐廳|火鍋|拉麵|牛排|咖啡|下午茶|水族館|動物園|卡丁車|抱石|手做|自製香|捏陶|展覽|射飛鏢|桌遊|溜冰|採草莓|釣蝦|釣魚|保齡球|撞球/.test(title)) {
    budget = '$$';
  }

  let environment = 'indoor';
  if (/海邊|爬山|公園|野餐|騎腳踏車|放風箏|星星|日出|夕陽|戶外|淨灘|划船|採草莓|挖蛤蠣|沙灘|飛盤|落羽松|滑雪|賞櫻|花海|煙火|動物園|釣魚|日月潭|沙堡|騎馬|滑翔翼|農場|跑步|棒球|泥火山|摩天輪|直排輪/.test(title)) {
    environment = 'outdoor';
  } else if (/逛老街|逛夜市|傳統市場|漁港|拜拜|集章|市集/.test(title)) {
    environment = 'any';
  }

  return {
    id: 'act_' + (idx + 1),
    title,
    occasion,
    budget,
    environment,
    completed: false,
    completedAt: null
  };
});

// 2. All 28 destinations with normalized budget tiers and realistic projected costs
const trips = [
  {
    id: "trip_1793202088746",
    name: "加拿大班夫洛磯山脈公路巡禮🇨🇦",
    locationName: "Canada 🍁",
    lat: 51.1784,
    lng: -115.5708,
    minDays: 7,
    maxDays: 10,
    budget: "$$$$",
    costEstimate: "~NT$75,000 - 120,000 /人",
    seasons: ["summer", "autumn", "winter"],
    visited: false,
    tags: ["#班夫國家公園", "#露易絲湖", "#冰原大道", "#洛磯山脈", "#城堡飯店"],
    description: "自駕世界最美公路冰原大道，在翡翠般碧綠的露易絲湖划獨木舟，夜宿百年溫泉城堡飯店仰望無垠星空與雪山。"
  },
  {
    id: "trip_1793200447689",
    name: "高雄駁二文創港灣與旗津夕陽行",
    locationName: "Kaohsiung, Taiwan",
    lat: 22.6163,
    lng: 120.3358,
    minDays: 2,
    maxDays: 4,
    budget: "$",
    costEstimate: "~NT$4,000 - 8,000 /人",
    seasons: ["all"],
    visited: false,
    tags: ["#駁二藝術特區", "#大港橋旋轉", "#旗津夕陽", "#六合夜市", "#愛河漫遊"],
    description: "午後散步於大港橋與駁二藝術特區感受海港微風，搭渡輪前往旗津看橘紅落日沉入大海，夜晚在愛河畔聽爵士小酌。"
  },
  {
    id: 'trip_hokkaido',
    name: '北海道粉雪與小樽運河夢幻之旅',
    locationName: 'Hokkaido, Japan',
    lat: 43.0642,
    lng: 141.3469,
    minDays: 6,
    maxDays: 8,
    budget: '$$$',
    costEstimate: '~NT$45,000 - 68,000 /人',
    seasons: ['winter', 'summer'],
    visited: false,
    tags: ['#粉雪滑雪', '#小樽運河', '#雪見溫泉', '#帝王蟹', '#富良野薰衣草'],
    description: '漫步小樽運河瓦斯燈下的雪景，在二世谷體驗世界級粉雪滑雪與露天雪見溫泉，夏季則有富良野盛開的薰衣草花田。'
  },
  {
    id: 'trip_switzerland',
    name: '瑞士阿爾卑斯與少女峰冰川火車',
    locationName: 'Interlaken & Zermatt, Switzerland',
    lat: 46.6863,
    lng: 7.8632,
    minDays: 8,
    maxDays: 12,
    budget: '$$$$',
    costEstimate: '~NT$95,000 - 150,000 /人',
    seasons: ['summer', 'winter'],
    visited: false,
    tags: ['#阿爾卑斯山', '#少女峰', '#冰川快車', '#馬特洪峰', '#圖恩湖'],
    description: '搭乘全景景觀齒軌列車穿越雪山冰川，遠眺巍峨馬特洪峰倒影，在湖光山色的童話木屋小鎮品嚐正宗起司火鍋。'
  },
  {
    id: 'trip_perth',
    name: '西澳伯斯純淨海灘與短尾矮袋鼠島',
    locationName: 'Perth, Australia',
    lat: -31.9505,
    lng: 115.8605,
    minDays: 6,
    maxDays: 8,
    budget: '$$$$',
    costEstimate: '~NT$55,000 - 85,000 /人',
    seasons: ['spring', 'autumn', 'summer'],
    visited: false,
    tags: ['#短尾矮袋鼠', '#科特索海灘', '#天鵝河谷酒莊', '#印度洋日落', '#羅特尼斯島'],
    description: '在羅特尼斯島尋找世界上最快樂的短尾矮袋鼠Quokka合照，漫步科特索海灘欣賞印度洋壯麗落日，造訪天鵝河谷品味頂級白葡萄酒。'
  },
  {
    id: 'trip_sydney',
    name: '雪梨海港大橋漫步與邦代海岸巡禮',
    locationName: 'Sydney, Australia',
    lat: -33.8688,
    lng: 151.2093,
    minDays: 6,
    maxDays: 8,
    budget: '$$$$',
    costEstimate: '~NT$58,000 - 88,000 /人',
    seasons: ['spring', 'autumn', 'summer'],
    visited: false,
    tags: ['#雪梨歌劇院', '#海港大橋', '#邦代海岸步道', '#藍山國家公園', '#海鮮市場'],
    description: '乘渡輪掠過宏偉雪梨歌劇院與海港大橋，沿著邦代到庫吉海岸峭壁步道慢跑，日落時分在達令港海景露天酒吧微醺。'
  },
  {
    id: 'trip_paris',
    name: '巴黎塞納河畔藝術與左岸浪漫漫遊',
    locationName: 'Paris, France',
    lat: 48.8566,
    lng: 2.3522,
    minDays: 6,
    maxDays: 9,
    budget: '$$$$',
    costEstimate: '~NT$78,000 - 125,000 /人',
    seasons: ['spring', 'autumn'],
    visited: false,
    tags: ['#艾菲爾鐵塔', '#羅浮宮', '#塞納河遊船', '#左岸咖啡', '#蒙馬特聖心堂'],
    description: '在花神咖啡館享用法式可頌與歐蕾咖啡，黃昏搭乘塞納河遊船仰望艾菲爾鐵塔金色燈火，漫步蒙馬特石階俯瞰巴黎全景。'
  },
  {
    id: 'trip_hanoi',
    name: '越南河內古街慢活與下龍灣海上巡航',
    locationName: 'Hanoi, Vietnam',
    lat: 21.0285,
    lng: 105.8542,
    minDays: 4,
    maxDays: 6,
    budget: '$$',
    costEstimate: '~NT$15,000 - 24,000 /人',
    seasons: ['autumn', 'winter', 'spring'],
    visited: false,
    tags: ['#三十六古街', '#下龍灣過夜郵輪', '#越南蛋咖啡', '#法式越菜', '#還劍湖'],
    description: '穿梭充滿法式殖民風情的三十六古街品嚐濃郁蛋咖啡與道地生牛肉河粉，搭乘豪華郵輪在世界自然遺產下龍灣奇岩石林間划獨木舟。'
  },
  {
    id: 'trip_england',
    name: '英國倫敦泰晤士河與科茲窩童話鄉村',
    locationName: 'London & Cotswolds, England',
    lat: 51.5074,
    lng: -0.1278,
    minDays: 7,
    maxDays: 10,
    budget: '$$$$',
    costEstimate: '~NT$82,000 - 135,000 /人',
    seasons: ['summer', 'spring', 'autumn'],
    visited: false,
    tags: ['#倫敦眼', '#大笨鐘', '#科茲窩蜜糖石屋', '#大英博物館', '#英式下午茶'],
    description: '在倫敦眼座艙俯瞰泰晤士河晨光，體驗傳統三層英式下午茶，自駕深入科茲窩漫步於蜂蜜色古老石屋與玫瑰花園之間。'
  },
  {
    id: 'trip_newzealand',
    name: '紐西蘭皇后鎮冰川峽灣與瓦卡蒂普湖',
    locationName: 'Queenstown, New Zealand',
    lat: -45.0312,
    lng: 168.6626,
    minDays: 9,
    maxDays: 14,
    budget: '$$$$',
    costEstimate: '~NT$88,000 - 145,000 /人',
    seasons: ['summer', 'autumn', 'spring'],
    visited: false,
    tags: ['#米佛峽灣', '#皇后鎮纜車', '#瓦卡蒂普湖', '#魔戒取景地', '#極致星空'],
    description: '沿著世界最美高山公路開往米佛峽灣瀑布群，在瓦卡蒂普湖畔悠閒漫遊，夜晚在蒂卡波湖暗空保護區抬頭仰望南十字星與璀璨銀河。'
  },
  {
    id: 'trip_okinawa',
    name: '沖繩蔚藍跳島與古宇利海景自駕',
    locationName: 'Okinawa, Japan',
    lat: 26.2124,
    lng: 127.6809,
    minDays: 4,
    maxDays: 6,
    budget: '$$$',
    costEstimate: '~NT$28,000 - 45,000 /人',
    seasons: ['summer', 'spring', 'autumn'],
    visited: false,
    tags: ['#慶良間藍', '#古宇利大橋', '#海龜共游', '#海景自駕', '#石垣牛'],
    description: '開著車沿著古宇利跨海大橋奔馳，在世界級慶良間藍海域與海龜浮潛，傍晚在美國村落日海灘享用石垣牛美食。'
  },
  {
    id: 'trip_bali',
    name: '峇里島烏布叢林Villa與懸崖夕陽',
    locationName: 'Bali, Indonesia',
    lat: -8.5069,
    lng: 115.2625,
    minDays: 5,
    maxDays: 8,
    budget: '$$$',
    costEstimate: '~NT$32,000 - 52,000 /人',
    seasons: ['spring', 'summer', 'autumn'],
    visited: false,
    tags: ['#私人泳池Villa', '#梯田秘境', '#烏魯瓦圖夕陽', '#漂浮早餐', '#傳統熱石SPA'],
    description: '入住被熱帶雨林包圍的私人泳池Villa享用浪漫漂浮早餐，漫步梯田小徑，黃昏在烏魯瓦圖斷崖海景酒吧看印度洋落日。'
  },
  {
    id: 'trip_chiangmai',
    name: '清邁山城文青慢活與水燈夜市巡禮',
    locationName: 'Chiang Mai, Thailand',
    lat: 18.7883,
    lng: 98.9853,
    minDays: 4,
    maxDays: 6,
    budget: '$$',
    costEstimate: '~NT$16,000 - 26,000 /人',
    seasons: ['winter', 'autumn', 'spring'],
    visited: false,
    tags: ['#寧曼路咖啡', '#清邁夜市', '#平價泰式按摩', '#水燈節', '#大象友善營'],
    description: '在寧曼路林蔭小巷穿梭特色文青咖啡館，夜晚漫步手作夜市品嚐在地小吃，體驗平價又舒壓的雙人泰式草本SPA。'
  },
  {
    id: 'trip_kinmen',
    name: '金門戰地洋樓與古厝星空漫遊',
    locationName: 'Kinmen, Taiwan',
    lat: 24.4493,
    lng: 118.3766,
    minDays: 3,
    maxDays: 4,
    budget: '$$',
    costEstimate: '~NT$9,500 - 16,000 /人',
    seasons: ['autumn', 'spring', 'winter'],
    visited: false,
    tags: ['#水頭洋樓', '#翟山坑道', '#慈湖落日', '#金門高粱', '#閩南古厝'],
    description: '漫步得月樓與水頭聚落典雅洋樓群，在翟山坑道聆聽波光迴響，傍晚在慈湖欣賞廈門天際線壯麗落日，入住百年閩南古厝夜觀星空。'
  },
  {
    id: 'trip_penghu',
    name: '澎湖花火海風與雙心石滬跳島巡禮',
    locationName: 'Penghu, Taiwan',
    lat: 23.5711,
    lng: 119.5793,
    minDays: 3,
    maxDays: 5,
    budget: '$$',
    costEstimate: '~NT$11,000 - 19,000 /人',
    seasons: ['spring', 'summer'],
    visited: false,
    tags: ['#澎湖花火節', '#七美雙心石滬', '#奎壁山摩西分海', '#山水沙灘', '#仙人掌冰'],
    description: '初夏在觀音亭欣賞海灣綻放的絢爛花火，騎車前往七美見證雙心石滬的浪漫誓言，在奎壁山踏著退潮礫石路感受摩西分海奇景。'
  },
  {
    id: 'trip_xiaoliuqiu',
    name: '小琉球珊瑚海龜共游與落日環島',
    locationName: 'Xiaoliuqiu, Taiwan',
    lat: 22.3424,
    lng: 120.3703,
    minDays: 2,
    maxDays: 3,
    budget: '$',
    costEstimate: '~NT$4,500 - 8,500 /人',
    seasons: ['all'],
    visited: false,
    tags: ['#海龜共游', '#花瓶岩', '#落日亭夕陽', '#威尼斯沙灘', '#SUP立槳'],
    description: '戴上面鏡在花瓶岩清澈見底的海水中與溫柔海龜同游，傍晚在落日亭看橘紅晚霞墜入台灣海峽，夜晚吹著溫暖海風享受島嶼慢步調。'
  },
  {
    id: 'trip_lanyu',
    name: '蘭嶼達悟拼板舟與太平洋玻璃海秘境',
    locationName: 'Lanyu, Taiwan',
    lat: 22.0564,
    lng: 121.5508,
    minDays: 4,
    maxDays: 6,
    budget: '$$',
    costEstimate: '~NT$13,000 - 22,000 /人',
    seasons: ['spring', 'summer'],
    visited: false,
    tags: ['#達悟拼板舟', '#青青草原夕陽', '#東清灣日出', '#玻璃海浮潛', '#地下屋文化'],
    description: '清晨在東清灣迎接台灣第一道海上日出，在青青草原懸崖邊吹風看海浪拍打奇岩，潛入果凍般透明的太平洋海底欣賞繽紛珊瑚世界。'
  },
  {
    id: 'trip_tainan',
    name: '台南古都巷弄漫步與米其林甜點小吃',
    locationName: 'Tainan, Taiwan',
    lat: 22.9997,
    lng: 120.2270,
    minDays: 2,
    maxDays: 4,
    budget: '$',
    costEstimate: '~NT$4,000 - 8,000 /人',
    seasons: ['all'],
    visited: false,
    tags: ['#神農街文青巷', '#溫體牛肉湯', '#奇美博物館', '#安平夕陽', '#四草綠色隧道'],
    description: '牽手散步於神農街古色古香的燈籠小巷，清晨品嚐溫體現沖牛肉湯與傳統碗粿，午後走入奇美博物館凡爾賽宮殿與四草紅樹林隧道。'
  },
  {
    id: 'trip_sunmoonlake',
    name: '日月潭全球最美單車道與水映晨霧之旅',
    locationName: 'Nantou, Taiwan',
    lat: 23.8683,
    lng: 120.9158,
    minDays: 2,
    maxDays: 3,
    budget: '$$',
    costEstimate: '~NT$8,500 - 16,000 /人',
    seasons: ['all'],
    visited: false,
    tags: ['#向山水上單車道', '#湖畔晨霧', '#日月潭紅茶', '#水社碼頭遊船', '#文武廟景觀'],
    description: '清晨沿著被譽為全球最美的向山水上自行車道輕踩單車，看晨霧如輕紗般籠罩碧綠湖面，品味濃郁台茶18號紅玉紅茶與湖景下午茶。'
  },
  {
    id: 'trip_taitung',
    name: '台東太平洋蔚藍海岸與金黃稻浪縱谷',
    locationName: 'Taitung, Taiwan',
    lat: 22.7583,
    lng: 121.1444,
    minDays: 3,
    maxDays: 5,
    budget: '$$',
    costEstimate: '~NT$9,500 - 18,000 /人',
    seasons: ['summer', 'autumn', 'spring'],
    visited: false,
    tags: ['#池上伯朗大道', '#鹿野高台熱氣球', '#三仙台海景', '#鐵花村音樂', '#太麻里曙光'],
    description: '在池上伯朗大道騎單車穿越無垠的金黃稻浪，在鹿野高台看五彩熱氣球在縱谷晨光中升空，夜晚在鐵花村手繪燈海下聽原民歌聲悠揚。'
  },
  {
    id: 'trip_chiayi',
    name: '嘉義木都森林之歌與檜意森活村漫遊',
    locationName: 'Chiayi, Taiwan',
    lat: 23.4800,
    lng: 120.4491,
    minDays: 2,
    maxDays: 3,
    budget: '$',
    costEstimate: '~NT$3,500 - 7,000 /人',
    seasons: ['all'],
    visited: false,
    tags: ['#檜意森活村', '#嘉義市立美術館', '#文化路夜市', '#火雞肉飯', '#森林之歌'],
    description: '穿上日式浴衣漫步全台最大日式官舍群檜意森活村，造訪綠意盎然的嘉義市立美術館，品嚐油香四溢的正宗火雞肉飯與文化路夜市小吃。'
  },
  {
    id: 'trip_alishan',
    name: '阿里山高山神木鐵道與祝山日出雲海',
    locationName: 'Alishan, Chiayi',
    lat: 23.5113,
    lng: 120.8035,
    minDays: 2,
    maxDays: 3,
    budget: '$$',
    costEstimate: '~NT$8,500 - 16,500 /人',
    seasons: ['spring', 'autumn', 'winter'],
    visited: false,
    tags: ['#祝山日出火車', '#千年紅檜神木', '#雲海晚霞', '#春季櫻花季', '#高山烏龍茶'],
    description: '凌晨搭乘復古紅色小火車前往祝山看雲海翻騰間金光萬道，漫步巨木群棧道呼吸千年紅檜芬多精，春天更有如雪飄落的櫻花鐵道美景。'
  },
  {
    id: 'trip_taichung',
    name: '台中建築美學與高美濕地浪漫風車夕陽',
    locationName: 'Taichung, Taiwan',
    lat: 24.1477,
    lng: 120.6736,
    minDays: 2,
    maxDays: 3,
    budget: '$',
    costEstimate: '~NT$3,800 - 7,500 /人',
    seasons: ['all'],
    visited: false,
    tags: ['#高美濕地夕陽', '#台中國家歌劇院', '#審計新村文創', '#宮原眼科冰品', '#逢甲夜市'],
    description: '午後在台中國家歌劇院感受曲牆流動的光影美學，黃昏走上高美濕地木棧道赤腳看風車與天空之鏡金色倒影，夜晚在逢甲夜市大快朵頤。'
  },
  {
    id: 'trip_shanlinxi',
    name: '杉林溪水濂瀑布與黃金水杉森林秘境',
    locationName: 'Shanlinxi, Nantou',
    lat: 23.6331,
    lng: 120.7933,
    minDays: 2,
    maxDays: 3,
    budget: '$$',
    costEstimate: '~NT$8,000 - 15,000 /人',
    seasons: ['summer', 'autumn', 'spring'],
    visited: false,
    tags: ['#松瀧岩瀑布', '#黃金水杉林', '#鬱金香繡球花', '#忘憂森林', '#避暑芬多精'],
    description: '走入負離子滿溢的松瀧岩瀑布巨石水簾洞，秋季沉醉於全台最美黃金水杉林，夏季平均20度的涼爽山風中漫步夢幻繡球花海與忘憂森林。'
  },
  {
    id: 'trip_norway',
    name: '挪威蓋倫格峽灣遊船與羅弗敦極光木屋',
    locationName: 'Norway 🇳🇴',
    lat: 62.1015,
    lng: 7.0940,
    minDays: 7,
    maxDays: 12,
    budget: '$$$$',
    costEstimate: '~NT$90,000 - 145,000 /人',
    seasons: ['summer', 'winter', 'autumn'],
    visited: false,
    tags: ['#蓋倫格峽灣', '#羅弗敦群島', '#午夜太陽', '#北極光', '#紅色漁屋Rorbu'],
    description: '搭乘渡輪穿梭在世界遺產蓋倫格峽灣壯闊峭壁之間，夏季欣賞壯觀七姊妹瀑布與午夜太陽，冬季入住羅弗敦紅色海岸木屋仰望極光曼妙漫舞。'
  },
  {
    id: 'trip_iceland',
    name: '冰島一號公路自駕與藍湖溫泉極光之旅',
    locationName: 'Iceland 🇮🇸',
    lat: 64.1466,
    lng: -21.9426,
    minDays: 8,
    maxDays: 12,
    budget: '$$$$',
    costEstimate: '~NT$95,000 - 155,000 /人',
    seasons: ['winter', 'summer', 'autumn'],
    visited: false,
    tags: ['#藍湖溫泉', '#黑沙灘', '#一號公路自駕', '#瓦特納冰川健行', '#極光獵捕'],
    description: '在夢幻乳藍色的藍湖溫泉中享受泥膜與暖意，自駕一號公路探訪壯麗塞里雅蘭瀑布與黑沙灘，穿上冰爪漫步藍冰洞與瓦特納冰川，夜宿玻璃木屋看極光跳動。'
  },
  {
    id: 'trip_turkey',
    name: '土耳其卡帕多奇亞熱氣球與棉堡歐亞漫遊',
    locationName: 'Türkiye 🇹🇷',
    lat: 38.6431,
    lng: 34.8289,
    minDays: 7,
    maxDays: 10,
    budget: '$$$$',
    costEstimate: '~NT$58,000 - 92,000 /人',
    seasons: ['spring', 'autumn', 'summer'],
    visited: false,
    tags: ['#卡帕多奇亞熱氣球', '#洞穴飯店', '#棉堡石灰棚', '#博斯普魯斯海峽', '#藍色清真寺'],
    description: '清晨在卡帕多奇亞奇岩峽谷上空隨百顆熱氣球緩緩升空迎接第一道曙光，入住百年洞穴Villa，光腳漫步棉堡雪白石灰棚溫泉，在伊斯坦堡博斯普魯斯海峽遊船跨越歐亞兩洲。'
  },
  {
    id: 'trip_matsu',
    name: '馬祖藍眼淚銀河浪花與芹壁石屋慢活',
    locationName: 'Matsu, Taiwan',
    lat: 26.1558,
    lng: 119.9289,
    minDays: 3,
    maxDays: 4,
    budget: '$$',
    costEstimate: '~NT$10,500 - 18,500 /人',
    seasons: ['spring', 'summer', 'autumn'],
    visited: false,
    tags: ['#馬祖藍眼淚', '#北竿芹壁聚落', '#八八坑道老酒', '#東引國之北疆', '#踩星沙夜航'],
    description: '春夏夜晚在海灣尋訪如阿凡達銀河般夢幻的藍眼淚螢光浪潮，漫步依山傍海的北竿芹壁花崗岩石頭屋享受「馬祖地中海」咖啡時光，在八八坑道酒香中細品甘醇老酒。'
  }
];

const defaultDataJs = 'window.DEFAULT_ACTIVITIES = ' + JSON.stringify(activities) + ';\n' +
                      'window.DEFAULT_TRIPS = ' + JSON.stringify(trips) + ';\n';
fs.writeFileSync(path.join(__dirname, 'defaultData.js'), defaultDataJs, 'utf8');

console.log('Successfully generated defaultData.js with ' + activities.length + ' activities and ' + trips.length + ' destinations.');
