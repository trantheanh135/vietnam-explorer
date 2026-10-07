// Beautiful places around Vietnam.
// Coordinates are approximate (good enough for a map pin); the Google Maps
// links search by name, so Google resolves the exact location.

export const TRAVEL_TAGS = {
  nature: { en: 'Nature', vi: 'Thiên nhiên' },
  beach: { en: 'Beach & island', vi: 'Biển đảo' },
  mountain: { en: 'Mountains', vi: 'Núi rừng' },
  heritage: { en: 'Heritage', vi: 'Di sản' },
  city: { en: 'City', vi: 'Thành phố' },
}

export const TRAVEL = [
  // ---------------- North ----------------
  {
    id: 'ha-long-bay', name: 'Ha Long Bay', nameVi: 'Vịnh Hạ Long', region: 'north', province: 'Quảng Ninh',
    lat: 20.9101, lng: 107.1839, tags: ['nature', 'beach', 'heritage'],
    desc: {
      en: 'Nearly 2,000 limestone islands rising from emerald water — a UNESCO World Heritage Site. Cruise overnight, kayak into hidden lagoons and explore caves such as Sửng Sốt.',
      vi: 'Gần 2.000 đảo đá vôi nhô lên từ làn nước xanh ngọc — Di sản Thiên nhiên Thế giới UNESCO. Ngủ đêm trên du thuyền, chèo kayak vào các hang và khám phá động Sửng Sốt.',
    },
    bestTime: { en: 'Oct – Apr (calm seas, clear skies)', vi: 'Tháng 10 – 4 (biển êm, trời trong)' },
  },
  {
    id: 'lan-ha-bay', name: 'Cat Ba & Lan Ha Bay', nameVi: 'Cát Bà & Vịnh Lan Hạ', region: 'north', province: 'Hải Phòng',
    lat: 20.7276, lng: 107.0476, tags: ['nature', 'beach'],
    desc: {
      en: 'A quieter neighbour of Ha Long with white-sand coves, floating fishing villages and a national park for hiking.',
      vi: 'Người láng giềng yên tĩnh hơn của Hạ Long, có những bãi cát trắng nhỏ, làng chài nổi và vườn quốc gia để leo núi.',
    },
    bestTime: { en: 'Apr – Oct for swimming', vi: 'Tháng 4 – 10 để tắm biển' },
  },
  {
    id: 'sa-pa', name: 'Sa Pa', nameVi: 'Sa Pa', region: 'north', province: 'Lào Cai',
    lat: 22.3364, lng: 103.8438, tags: ['mountain', 'nature'],
    desc: {
      en: 'Misty mountain town surrounded by rice terraces and villages of the Hmong and Dao people. Take the cable car up Fansipan, the highest peak in Indochina (3,143 m).',
      vi: 'Thị trấn trong sương bao quanh bởi ruộng bậc thang và bản làng người Mông, người Dao. Đi cáp treo lên Fansipan — nóc nhà Đông Dương (3.143 m).',
    },
    bestTime: { en: 'Sep – Oct (golden rice), Mar – May', vi: 'Tháng 9 – 10 (lúa chín), tháng 3 – 5' },
  },
  {
    id: 'ma-pi-leng', name: 'Ma Pi Leng Pass, Ha Giang', nameVi: 'Đèo Mã Pí Lèng, Hà Giang', region: 'north', province: 'Hà Giang (Tuyên Quang)',
    lat: 23.243, lng: 105.411, tags: ['mountain', 'nature'],
    desc: {
      en: 'The highlight of the famous Ha Giang Loop: a dramatic road carved into cliffs above the jade-green Nho Que River.',
      vi: 'Điểm nhấn của cung đường Hà Giang Loop: con đèo hiểm trở men theo vách núi, phía dưới là dòng sông Nho Quế xanh ngọc.',
    },
    bestTime: { en: 'Oct – Nov (buckwheat flowers)', vi: 'Tháng 10 – 11 (mùa hoa tam giác mạch)' },
  },
  {
    id: 'ban-gioc', name: 'Ban Gioc Waterfall', nameVi: 'Thác Bản Giốc', region: 'north', province: 'Cao Bằng',
    lat: 22.855, lng: 106.723, tags: ['nature'],
    desc: {
      en: 'One of Asia\'s widest waterfalls, tumbling in tiers on the border with China, surrounded by rice fields and karst hills.',
      vi: 'Một trong những thác nước rộng nhất châu Á, đổ xuống nhiều tầng ở biên giới Việt – Trung, giữa ruộng lúa và núi đá vôi.',
    },
    bestTime: { en: 'Aug – Oct (most water)', vi: 'Tháng 8 – 10 (nhiều nước nhất)' },
  },
  {
    id: 'ba-be', name: 'Ba Be Lake', nameVi: 'Hồ Ba Bể', region: 'north', province: 'Bắc Kạn (Thái Nguyên)',
    lat: 22.417, lng: 105.617, tags: ['nature'],
    desc: {
      en: 'A large natural freshwater lake inside a national park. Stay in a Tay stilt house and take a boat through caves and forests.',
      vi: 'Hồ nước ngọt tự nhiên lớn trong vườn quốc gia. Nghỉ nhà sàn của người Tày và đi thuyền qua hang động, rừng nguyên sinh.',
    },
    bestTime: { en: 'Apr – Oct', vi: 'Tháng 4 – 10' },
  },
  {
    id: 'mu-cang-chai', name: 'Mu Cang Chai Rice Terraces', nameVi: 'Ruộng bậc thang Mù Cang Chải', region: 'north', province: 'Yên Bái (Lào Cai)',
    lat: 21.851, lng: 104.089, tags: ['mountain', 'nature'],
    desc: {
      en: 'Hillsides sculpted into endless rice terraces — among the most photographed landscapes in Vietnam.',
      vi: 'Những sườn đồi được tạc thành ruộng bậc thang trải dài — một trong những khung cảnh được chụp nhiều nhất Việt Nam.',
    },
    bestTime: { en: 'Late Sep (harvest), May – Jun (water season)', vi: 'Cuối tháng 9 (lúa chín), tháng 5 – 6 (mùa nước đổ)' },
  },
  {
    id: 'moc-chau', name: 'Moc Chau Plateau', nameVi: 'Cao nguyên Mộc Châu', region: 'north', province: 'Sơn La',
    lat: 20.85, lng: 104.65, tags: ['mountain', 'nature'],
    desc: {
      en: 'Rolling tea hills, plum and white mustard blossoms, and cool weather — an easy escape from Hanoi.',
      vi: 'Đồi chè xanh mướt, hoa mận và hoa cải trắng, khí hậu mát mẻ — điểm đi chơi gần Hà Nội.',
    },
    bestTime: { en: 'Dec – Feb (flowers)', vi: 'Tháng 12 – 2 (mùa hoa)' },
  },
  {
    id: 'trang-an', name: 'Trang An, Ninh Binh', nameVi: 'Tràng An, Ninh Bình', region: 'north', province: 'Ninh Bình',
    lat: 20.2525, lng: 105.9147, tags: ['nature', 'heritage'],
    desc: {
      en: '"Ha Long Bay on land": row a sampan along rivers through limestone caves and past ancient temples. A UNESCO mixed heritage site.',
      vi: '"Hạ Long trên cạn": ngồi thuyền xuôi dòng qua hang động đá vôi và đền cổ. Di sản Văn hoá và Thiên nhiên Thế giới.',
    },
    bestTime: { en: 'May – Jun (golden rice in Tam Coc)', vi: 'Tháng 5 – 6 (lúa chín ở Tam Cốc)' },
  },
  {
    id: 'hoan-kiem', name: 'Hoan Kiem Lake & Old Quarter', nameVi: 'Hồ Hoàn Kiếm & Phố cổ', region: 'north', province: 'Hà Nội',
    lat: 21.0287, lng: 105.8524, tags: ['city', 'heritage'],
    desc: {
      en: 'The heart of Hanoi: the red Huc Bridge, Ngoc Son Temple and 36 old streets full of street food. Weekend evenings are car-free.',
      vi: 'Trái tim Hà Nội: cầu Thê Húc đỏ, đền Ngọc Sơn và 36 phố phường đầy món ngon. Tối cuối tuần có phố đi bộ.',
    },
    bestTime: { en: 'Oct – Dec (autumn)', vi: 'Tháng 10 – 12 (mùa thu Hà Nội)' },
  },
  // ---------------- Central ----------------
  {
    id: 'phong-nha', name: 'Phong Nha – Ke Bang', nameVi: 'Phong Nha – Kẻ Bàng', region: 'central', province: 'Quảng Bình (Quảng Trị)',
    lat: 17.59, lng: 106.283, tags: ['nature', 'heritage'],
    desc: {
      en: 'A UNESCO national park with spectacular caves — Phong Nha, Paradise Cave and, for expeditions, Son Doong, the world\'s largest cave passage.',
      vi: 'Vườn quốc gia UNESCO với hệ thống hang động kỳ vĩ — động Phong Nha, động Thiên Đường và Sơn Đoòng, hang động lớn nhất thế giới.',
    },
    bestTime: { en: 'Mar – Aug', vi: 'Tháng 3 – 8' },
  },
  {
    id: 'hue', name: 'Hue Imperial City', nameVi: 'Đại Nội Huế', region: 'central', province: 'Huế',
    lat: 16.469, lng: 107.577, tags: ['heritage', 'city'],
    desc: {
      en: 'The former capital of the Nguyen dynasty: walled citadel, royal tombs along the Perfume River and a gentle, poetic atmosphere.',
      vi: 'Kinh đô triều Nguyễn: hoàng thành cổ kính, lăng tẩm bên dòng sông Hương và không khí trầm mặc, thơ mộng.',
    },
    bestTime: { en: 'Jan – Apr', vi: 'Tháng 1 – 4' },
  },
  {
    id: 'hai-van', name: 'Hai Van Pass', nameVi: 'Đèo Hải Vân', region: 'central', province: 'Đà Nẵng – Huế',
    lat: 16.199, lng: 108.131, tags: ['mountain', 'nature'],
    desc: {
      en: 'A winding coastal pass between Hue and Da Nang with sweeping views of the sea — a favourite motorbike ride.',
      vi: 'Con đèo uốn lượn ven biển giữa Huế và Đà Nẵng, ngắm toàn cảnh biển trời — cung đường xe máy được yêu thích.',
    },
    bestTime: { en: 'Feb – Aug', vi: 'Tháng 2 – 8' },
  },
  {
    id: 'my-khe', name: 'My Khe Beach', nameVi: 'Biển Mỹ Khê', region: 'central', province: 'Đà Nẵng',
    lat: 16.06, lng: 108.247, tags: ['beach', 'city'],
    desc: {
      en: 'A long, clean city beach with soft sand and warm water, perfect for a sunrise swim before a bowl of mì Quảng.',
      vi: 'Bãi biển thành phố dài, sạch, cát mịn, nước ấm — lý tưởng để bơi lúc bình minh rồi ăn tô mì Quảng.',
    },
    bestTime: { en: 'Apr – Aug', vi: 'Tháng 4 – 8' },
  },
  {
    id: 'ba-na', name: 'Ba Na Hills & Golden Bridge', nameVi: 'Bà Nà Hills & Cầu Vàng', region: 'central', province: 'Đà Nẵng',
    lat: 15.995, lng: 107.996, tags: ['mountain'],
    desc: {
      en: 'A mountaintop resort reached by a record-breaking cable car, famous for the Golden Bridge held up by giant stone hands.',
      vi: 'Khu du lịch trên đỉnh núi với tuyến cáp treo kỷ lục, nổi tiếng với Cầu Vàng được nâng bởi đôi bàn tay khổng lồ.',
    },
    bestTime: { en: 'Mar – Aug (go early to beat the crowds)', vi: 'Tháng 3 – 8 (đi sớm để tránh đông)' },
  },
  {
    id: 'hoi-an', name: 'Hoi An Ancient Town', nameVi: 'Phố cổ Hội An', region: 'central', province: 'Quảng Nam (Đà Nẵng)',
    lat: 15.877, lng: 108.326, tags: ['heritage', 'city'],
    desc: {
      en: 'A beautifully preserved trading port with yellow houses, the Japanese Covered Bridge and thousands of silk lanterns glowing at night.',
      vi: 'Thương cảng xưa được bảo tồn nguyên vẹn với những ngôi nhà vàng, Chùa Cầu và hàng nghìn chiếc đèn lồng lung linh về đêm.',
    },
    bestTime: { en: 'Feb – Apr; full-moon lantern nights', vi: 'Tháng 2 – 4; đêm rằm thả đèn hoa đăng' },
  },
  {
    id: 'my-son', name: 'My Son Sanctuary', nameVi: 'Thánh địa Mỹ Sơn', region: 'central', province: 'Quảng Nam (Đà Nẵng)',
    lat: 15.764, lng: 108.124, tags: ['heritage'],
    desc: {
      en: 'Ruins of Hindu temple towers built by the Cham kingdom between the 4th and 13th centuries, set in a jungle valley.',
      vi: 'Quần thể đền tháp Hindu của vương quốc Chăm Pa (thế kỷ 4 – 13) nằm trong thung lũng rừng xanh.',
    },
    bestTime: { en: 'Early morning, Feb – Apr', vi: 'Sáng sớm, tháng 2 – 4' },
  },
  {
    id: 'ly-son', name: 'Ly Son Island', nameVi: 'Đảo Lý Sơn', region: 'central', province: 'Quảng Ngãi',
    lat: 15.38, lng: 109.12, tags: ['beach', 'nature'],
    desc: {
      en: 'A volcanic island with crystal-clear water, dramatic cliffs and fields of garlic — Vietnam\'s "garlic kingdom".',
      vi: 'Hòn đảo núi lửa với nước biển trong vắt, vách đá ấn tượng và những cánh đồng tỏi — "vương quốc tỏi" của Việt Nam.',
    },
    bestTime: { en: 'Apr – Aug', vi: 'Tháng 4 – 8' },
  },
  {
    id: 'nha-trang', name: 'Nha Trang Bay', nameVi: 'Vịnh Nha Trang', region: 'central', province: 'Khánh Hoà',
    lat: 12.2388, lng: 109.1967, tags: ['beach', 'city'],
    desc: {
      en: 'A lively beach city with island-hopping, snorkelling, mud baths and the Cham Po Nagar towers.',
      vi: 'Thành phố biển sôi động: đi tour đảo, lặn ngắm san hô, tắm bùn và tham quan tháp Bà Ponagar.',
    },
    bestTime: { en: 'Jan – Aug', vi: 'Tháng 1 – 8' },
  },
  {
    id: 'mui-ne', name: 'Mui Ne Sand Dunes', nameVi: 'Đồi cát Mũi Né', region: 'central', province: 'Bình Thuận (Lâm Đồng)',
    lat: 10.95, lng: 108.3, tags: ['nature', 'beach'],
    desc: {
      en: 'Red and white sand dunes by the sea — magical at sunrise. Also a top spot for kitesurfing.',
      vi: 'Đồi cát đỏ và cát trắng ven biển — đẹp kỳ ảo lúc bình minh. Cũng là thiên đường lướt ván diều.',
    },
    bestTime: { en: 'Nov – Apr', vi: 'Tháng 11 – 4' },
  },
  {
    id: 'da-lat', name: 'Da Lat', nameVi: 'Đà Lạt', region: 'central', province: 'Lâm Đồng',
    lat: 11.942, lng: 108.442, tags: ['mountain', 'city', 'nature'],
    desc: {
      en: 'The "city of eternal spring" in the Central Highlands: pine forests, flower gardens, French villas and cool nights.',
      vi: '"Thành phố ngàn hoa" trên cao nguyên: rừng thông, vườn hoa, biệt thự Pháp và những đêm se lạnh.',
    },
    bestTime: { en: 'Nov – Mar (dry, flowers)', vi: 'Tháng 11 – 3 (mùa khô, mùa hoa)' },
  },
  // ---------------- South ----------------
  {
    id: 'saigon', name: 'Saigon City Centre', nameVi: 'Trung tâm Sài Gòn', region: 'south', province: 'TP. Hồ Chí Minh',
    lat: 10.7798, lng: 106.699, tags: ['city', 'heritage'],
    desc: {
      en: 'Notre-Dame Cathedral, the Central Post Office, Nguyen Hue walking street and rooftop bars — Vietnam\'s most energetic city.',
      vi: 'Nhà thờ Đức Bà, Bưu điện Thành phố, phố đi bộ Nguyễn Huệ và các quán bar sân thượng — thành phố năng động nhất Việt Nam.',
    },
    bestTime: { en: 'Dec – Apr (dry season)', vi: 'Tháng 12 – 4 (mùa khô)' },
  },
  {
    id: 'cu-chi', name: 'Cu Chi Tunnels', nameVi: 'Địa đạo Củ Chi', region: 'south', province: 'TP. Hồ Chí Minh',
    lat: 11.143, lng: 106.463, tags: ['heritage'],
    desc: {
      en: 'An underground network of over 200 km of tunnels used during the war. Crawl through a section to feel its history.',
      vi: 'Hệ thống đường hầm dài hơn 200 km dưới lòng đất thời chiến tranh. Thử bò qua một đoạn để cảm nhận lịch sử.',
    },
    bestTime: { en: 'Year-round, mornings', vi: 'Quanh năm, nên đi buổi sáng' },
  },
  {
    id: 'ba-den', name: 'Ba Den Mountain', nameVi: 'Núi Bà Đen', region: 'south', province: 'Tây Ninh',
    lat: 11.38, lng: 106.17, tags: ['mountain', 'heritage'],
    desc: {
      en: 'The highest peak in southern Vietnam, with pagodas, a giant bronze Buddha statue and a cable car to the summit.',
      vi: 'Đỉnh núi cao nhất Nam Bộ với chùa chiền, tượng Phật bằng đồng khổng lồ và cáp treo lên đỉnh.',
    },
    bestTime: { en: 'Dec – Apr', vi: 'Tháng 12 – 4' },
  },
  {
    id: 'cai-rang', name: 'Cai Rang Floating Market', nameVi: 'Chợ nổi Cái Răng', region: 'south', province: 'Cần Thơ',
    lat: 10.0034, lng: 105.7472, tags: ['heritage', 'nature'],
    desc: {
      en: 'At dawn, boats piled with fruit and vegetables trade on the Mekong. Eat a bowl of hủ tiếu served from a boat.',
      vi: 'Lúc bình minh, ghe thuyền chất đầy trái cây, rau củ buôn bán trên sông. Thưởng thức tô hủ tiếu bán trên ghe.',
    },
    bestTime: { en: 'Arrive by 6 a.m.; year-round', vi: 'Đến trước 6 giờ sáng; quanh năm' },
  },
  {
    id: 'tra-su', name: 'Tra Su Cajuput Forest', nameVi: 'Rừng tràm Trà Sư', region: 'south', province: 'An Giang',
    lat: 10.583, lng: 105.057, tags: ['nature'],
    desc: {
      en: 'Glide by boat through a flooded forest carpeted with green duckweed, home to storks and herons.',
      vi: 'Đi xuồng xuyên qua khu rừng ngập nước phủ bèo xanh, nơi cư trú của cò, diệc và nhiều loài chim.',
    },
    bestTime: { en: 'Sep – Nov (flood season)', vi: 'Tháng 9 – 11 (mùa nước nổi)' },
  },
  {
    id: 'phu-quoc', name: 'Phu Quoc Island', nameVi: 'Đảo Phú Quốc', region: 'south', province: 'Kiên Giang (An Giang)',
    lat: 10.2899, lng: 103.984, tags: ['beach'],
    desc: {
      en: 'Vietnam\'s largest island: powdery beaches such as Sao Beach, sunset night markets, fish-sauce houses and the An Thoi islands.',
      vi: 'Hòn đảo lớn nhất Việt Nam: bãi Sao cát mịn, chợ đêm, nhà thùng nước mắm và quần đảo An Thới.',
    },
    bestTime: { en: 'Nov – Apr', vi: 'Tháng 11 – 4' },
  },
  {
    id: 'con-dao', name: 'Con Dao Islands', nameVi: 'Côn Đảo', region: 'south', province: 'Bà Rịa – Vũng Tàu (TP. Hồ Chí Minh)',
    lat: 8.682, lng: 106.609, tags: ['beach', 'nature', 'heritage'],
    desc: {
      en: 'Remote islands with pristine beaches, coral reefs, nesting sea turtles and moving history at the former prisons.',
      vi: 'Quần đảo hoang sơ với bãi biển nguyên vẹn, rạn san hô, rùa biển lên đẻ trứng và di tích nhà tù đầy xúc động.',
    },
    bestTime: { en: 'Mar – Sep', vi: 'Tháng 3 – 9' },
  },
]
