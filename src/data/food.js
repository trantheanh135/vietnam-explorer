// Food reviews: a signature dish and a well-known place to eat it.
// Ratings are editorial and subjective; prices are approximate (VND).
// Pins are approximate — the Google Maps links search by name + address.

export const FOOD = [
  // ---------------- North ----------------
  {
    id: 'pho-thin', dish: 'Beef pho', dishVi: 'Phở bò', place: 'Phở Thìn Lò Đúc', address: '13 Lò Đúc, Hai Bà Trưng, Hà Nội',
    region: 'north', city: 'Hà Nội', lat: 21.0169, lng: 105.8558, rating: 4.5, price: '60.000 – 90.000₫',
    desc: {
      en: 'A Hanoi institution famous for beef stir-fried with garlic before it goes into the bowl, giving a smoky, rich broth. Simple room, always busy.',
      vi: 'Quán phở lâu đời nổi tiếng với thịt bò xào tái cùng tỏi trước khi cho vào bát, nước dùng thơm đậm vị khói. Quán giản dị, lúc nào cũng đông.',
    },
    mustTry: { en: 'Phở tái lăn (wok-seared beef) with a quẩy (fried dough stick)', vi: 'Phở tái lăn, ăn kèm quẩy' },
  },
  {
    id: 'bun-cha-huong-lien', dish: 'Bun cha', dishVi: 'Bún chả', place: 'Bún chả Hương Liên', address: '24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội',
    region: 'north', city: 'Hà Nội', lat: 21.0181, lng: 105.8536, rating: 4.0, price: '50.000 – 100.000₫',
    desc: {
      en: 'Grilled pork patties and belly in a sweet-sour fish-sauce dip with rice noodles and herbs. Made famous by a 2016 visit from a US president and a celebrity chef.',
      vi: 'Chả nướng và thịt ba chỉ ngâm trong nước chấm chua ngọt, ăn với bún và rau sống. Nổi tiếng sau chuyến ghé thăm năm 2016 của Tổng thống Mỹ và một đầu bếp nổi tiếng.',
    },
    mustTry: { en: 'The "combo" with a crab spring roll (nem cua bể)', vi: 'Suất "combo" kèm nem cua bể' },
  },
  {
    id: 'cha-ca', dish: 'Turmeric fish with dill', dishVi: 'Chả cá Lã Vọng', place: 'Chả Cá Lã Vọng', address: '14 Chả Cá, Hoàn Kiếm, Hà Nội',
    region: 'north', city: 'Hà Nội', lat: 21.0359, lng: 105.849, rating: 4.0, price: '150.000 – 200.000₫',
    desc: {
      en: 'The dish so famous the street is named after it: turmeric-marinated fish sizzled at your table with dill and spring onion, eaten with noodles, peanuts and shrimp paste.',
      vi: 'Món ăn nổi tiếng đến mức con phố được đặt theo tên nó: cá ướp nghệ rán ngay tại bàn với thì là, hành, ăn cùng bún, lạc rang và mắm tôm.',
    },
    mustTry: { en: 'Add plenty of dill at the end; try it with mắm tôm', vi: 'Cho nhiều thì là vào cuối, chấm mắm tôm' },
  },
  {
    id: 'cafe-giang', dish: 'Egg coffee', dishVi: 'Cà phê trứng', place: 'Café Giảng', address: '39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội',
    region: 'north', city: 'Hà Nội', lat: 21.0336, lng: 105.854, rating: 4.5, price: '35.000 – 50.000₫',
    desc: {
      en: 'Where egg coffee is said to have been invented in the 1940s: strong robusta topped with a thick, sweet egg-yolk foam that tastes like tiramisu.',
      vi: 'Nơi được cho là khai sinh cà phê trứng từ thập niên 1940: cà phê robusta đậm phủ lớp kem trứng béo ngọt như tiramisu.',
    },
    mustTry: { en: 'Hot egg coffee served in a bowl of hot water', vi: 'Cà phê trứng nóng đặt trong bát nước nóng' },
  },
  {
    id: 'banh-cuon', dish: 'Steamed rice rolls', dishVi: 'Bánh cuốn', place: 'Bánh cuốn Bà Hoành', address: '66 Tô Hiến Thành, Hai Bà Trưng, Hà Nội',
    region: 'north', city: 'Hà Nội', lat: 21.0156, lng: 105.8483, rating: 4.0, price: '40.000 – 70.000₫',
    desc: {
      en: 'Silky, paper-thin rice sheets rolled around minced pork and wood-ear mushroom, topped with fried shallots and served with chả lụa and warm dipping sauce.',
      vi: 'Bánh tráng mỏng mịn cuộn nhân thịt và mộc nhĩ, rắc hành phi, ăn kèm chả lụa và nước chấm ấm.',
    },
    mustTry: { en: 'Bánh cuốn with egg (bánh cuốn trứng)', vi: 'Bánh cuốn trứng' },
  },
  {
    id: 'banh-da-cua', dish: 'Crab noodle soup', dishVi: 'Bánh đa cua', place: 'Bánh đa cua Hải Phòng (Lê Lợi area)', address: 'Phố Lê Lợi, Ngô Quyền, Hải Phòng',
    region: 'north', city: 'Hải Phòng', lat: 20.8584, lng: 106.6875, rating: 4.0, price: '35.000 – 60.000₫',
    desc: {
      en: 'Hai Phong\'s favourite breakfast: chewy red rice noodles in a sweet field-crab broth with crab paste, fish cake and greens.',
      vi: 'Món sáng được yêu thích nhất Hải Phòng: bánh đa đỏ dai trong nước dùng cua đồng ngọt thanh, có gạch cua, chả lá lốt và rau.',
    },
    mustTry: { en: 'Ask for extra gạch cua (crab roe paste)', vi: 'Gọi thêm gạch cua' },
  },
  {
    id: 'de-nui', dish: 'Mountain goat & crispy rice', dishVi: 'Dê núi & cơm cháy', place: 'Dê núi Ninh Bình (Tràng An area)', address: 'Tràng An, Hoa Lư, Ninh Bình',
    region: 'north', city: 'Ninh Bình', lat: 20.258, lng: 105.93, rating: 4.0, price: '150.000 – 300.000₫',
    desc: {
      en: 'Ninh Binh\'s speciality: lean mountain goat served rare with herbs and sesame, plus golden crispy rice crackers topped with a savoury sauce.',
      vi: 'Đặc sản Ninh Bình: thịt dê núi tái chanh ăn với rau thơm và vừng, cùng cơm cháy giòn rụm chan nước sốt đậm đà.',
    },
    mustTry: { en: 'Dê tái chanh + cơm cháy chà bông', vi: 'Dê tái chanh và cơm cháy chà bông' },
  },
  {
    id: 'sapa-salmon', dish: 'Salmon & sturgeon hotpot', dishVi: 'Lẩu cá hồi Sa Pa', place: 'Lẩu cá hồi Sa Pa (town centre)', address: 'Thị xã Sa Pa, Lào Cai',
    region: 'north', city: 'Sa Pa', lat: 22.334, lng: 103.84, rating: 4.0, price: '200.000 – 400.000₫ / person',
    desc: {
      en: 'Cold mountain streams make Sa Pa a centre for farmed salmon and sturgeon. A sour hotpot with local vegetables is perfect on a chilly evening.',
      vi: 'Nước suối lạnh giúp Sa Pa trở thành nơi nuôi cá hồi, cá tầm. Lẩu chua với rau rừng là món tuyệt vời cho buổi tối se lạnh.',
    },
    mustTry: { en: 'Salmon sashimi starter, then the sour hotpot', vi: 'Gỏi cá hồi khai vị, rồi lẩu chua' },
  },
  // ---------------- Central ----------------
  {
    id: 'bun-bo-hue', dish: 'Hue spicy beef noodle soup', dishVi: 'Bún bò Huế', place: 'Bún bò Huế (local shops, Huế centre)', address: 'Trung tâm thành phố Huế',
    region: 'central', city: 'Huế', lat: 16.4637, lng: 107.5909, rating: 4.5, price: '35.000 – 60.000₫',
    desc: {
      en: 'Thick round noodles in a lemongrass-scented, chilli-red broth with beef shank, pork knuckle and blood cake. Bolder and spicier than pho.',
      vi: 'Sợi bún to trong nước dùng thơm sả, đỏ màu ớt, có bắp bò, giò heo và tiết. Đậm đà và cay hơn phở.',
    },
    mustTry: { en: 'Add mắm ruốc (shrimp paste) and fresh chilli', vi: 'Thêm chút mắm ruốc và ớt tươi' },
  },
  {
    id: 'com-hen', dish: 'Baby clam rice', dishVi: 'Cơm hến', place: 'Cơm hến Cồn Hến', address: 'Cồn Hến, Vỹ Dạ, Huế',
    region: 'central', city: 'Huế', lat: 16.476, lng: 107.59, rating: 4.0, price: '20.000 – 40.000₫',
    desc: {
      en: 'Humble Hue classic: cold rice with tiny river clams, crunchy pork crackling, peanuts, herbs and a ladle of hot clam broth.',
      vi: 'Món dân dã xứ Huế: cơm nguội trộn hến xào, tóp mỡ giòn, đậu phộng, rau thơm và chan nước hến nóng.',
    },
    mustTry: { en: 'Eat it on Con Hen islet where the clams come from', vi: 'Ăn ngay tại Cồn Hến — nơi khai thác hến' },
  },
  {
    id: 'mi-quang', dish: 'Quang noodles', dishVi: 'Mì Quảng', place: 'Mì Quảng Bà Mua', address: '19-21 Trần Bình Trọng, Hải Châu, Đà Nẵng',
    region: 'central', city: 'Đà Nẵng', lat: 16.0646, lng: 108.2163, rating: 4.0, price: '35.000 – 60.000₫',
    desc: {
      en: 'Wide turmeric noodles with just a little rich broth, shrimp, pork, quail egg and peanuts, topped with a sesame rice cracker.',
      vi: 'Sợi mì vàng nghệ bản to với chút nước dùng đậm, tôm, thịt, trứng cút, đậu phộng và bánh tráng mè giòn.',
    },
    mustTry: { en: 'Mì Quảng tôm thịt; crumble the cracker on top', vi: 'Mì Quảng tôm thịt, bẻ bánh tráng vào tô' },
  },
  {
    id: 'banh-trang-cuon', dish: 'Pork rolls in rice paper', dishVi: 'Bánh tráng cuốn thịt heo', place: 'Bánh tráng cuốn thịt heo Trần', address: 'Lê Duẩn, Hải Châu, Đà Nẵng',
    region: 'central', city: 'Đà Nẵng', lat: 16.0712, lng: 108.2187, rating: 4.0, price: '100.000 – 200.000₫',
    desc: {
      en: 'Roll your own: two-layer boiled pork, rice paper, piles of herbs and green banana, dipped in fermented anchovy sauce (mắm nêm).',
      vi: 'Tự cuốn: thịt heo hai đầu da luộc, bánh tráng, rau sống, chuối chát, chấm mắm nêm đậm đà.',
    },
    mustTry: { en: 'Don\'t skip the mắm nêm dip', vi: 'Nhất định phải chấm mắm nêm' },
  },
  {
    id: 'banh-mi-phuong', dish: 'Banh mi', dishVi: 'Bánh mì', place: 'Bánh Mì Phượng', address: '2B Phan Châu Trinh, Hội An',
    region: 'central', city: 'Hội An', lat: 15.8791, lng: 108.3304, rating: 4.5, price: '30.000 – 45.000₫',
    desc: {
      en: 'A crackly baguette stuffed with pâté, cold cuts, roast pork, pickles, herbs and a secret sauce. Often called one of the best banh mi in the world.',
      vi: 'Ổ bánh mì giòn rụm kẹp pa tê, chả, thịt nướng, đồ chua, rau thơm và nước sốt "bí truyền". Thường được gọi là một trong những ổ bánh mì ngon nhất thế giới.',
    },
    mustTry: { en: 'Bánh mì thập cẩm (mixed)', vi: 'Bánh mì thập cẩm' },
  },
  {
    id: 'com-ga-hoi-an', dish: 'Hoi An chicken rice', dishVi: 'Cơm gà Hội An', place: 'Cơm gà Bà Buội', address: '22 Phan Châu Trinh, Hội An',
    region: 'central', city: 'Hội An', lat: 15.8796, lng: 108.3298, rating: 4.0, price: '40.000 – 70.000₫',
    desc: {
      en: 'Rice cooked in chicken stock and turmeric, topped with shredded chicken tossed with herbs and onion, served with a bowl of broth.',
      vi: 'Cơm nấu bằng nước luộc gà và nghệ, phủ gà xé trộn rau răm, hành tây, kèm chén nước dùng.',
    },
    mustTry: { en: 'Cơm gà xé with the house chilli sauce', vi: 'Cơm gà xé với tương ớt nhà làm' },
  },
  {
    id: 'cao-lau', dish: 'Cao lau', dishVi: 'Cao lầu', place: 'Cao lầu (Hội An old town)', address: 'Phố cổ Hội An',
    region: 'central', city: 'Hội An', lat: 15.877, lng: 108.328, rating: 4.0, price: '30.000 – 50.000₫',
    desc: {
      en: 'Hoi An\'s signature noodles: firm, chewy noodles with char siu pork, greens and crunchy croutons, with only a spoonful of sauce.',
      vi: 'Món mì đặc trưng Hội An: sợi cao lầu dai, xá xíu, rau sống và tóp giòn, chỉ chan một chút nước sốt.',
    },
    mustTry: { en: 'Eat it in the old town at lunchtime', vi: 'Ăn trưa ngay trong phố cổ' },
  },
  {
    id: 'banh-xeo-tom-nhay', dish: 'Jumping-shrimp pancakes', dishVi: 'Bánh xèo tôm nhảy', place: 'Bánh xèo tôm nhảy Quy Nhơn', address: 'Diên Hồng, Quy Nhơn',
    region: 'central', city: 'Quy Nhơn', lat: 13.7757, lng: 109.2228, rating: 4.0, price: '30.000 – 60.000₫',
    desc: {
      en: 'Small crispy pancakes cooked in clay moulds with fresh, still-jumping shrimp, rolled in rice paper with green mango and herbs.',
      vi: 'Bánh xèo nhỏ giòn đổ khuôn đất với tôm tươi còn "nhảy", cuốn bánh tráng cùng xoài xanh và rau thơm.',
    },
    mustTry: { en: 'Dip in the peanut-and-liver sauce', vi: 'Chấm nước chấm đậu phộng gan heo' },
  },
  {
    id: 'bun-cha-ca-nha-trang', dish: 'Fish cake noodle soup', dishVi: 'Bún chả cá Nha Trang', place: 'Bún chả cá (Phan Bội Châu area)', address: 'Phan Bội Châu, Nha Trang',
    region: 'central', city: 'Nha Trang', lat: 12.2465, lng: 109.1915, rating: 4.0, price: '35.000 – 60.000₫',
    desc: {
      en: 'A clear, sweet fish broth with fried and steamed fish cakes, jellyfish and noodles — light, fresh and very Nha Trang.',
      vi: 'Nước dùng cá trong và ngọt, có chả cá chiên, chả hấp, sứa và bún — thanh nhẹ, đậm chất Nha Trang.',
    },
    mustTry: { en: 'Order with sứa (jellyfish)', vi: 'Gọi thêm sứa' },
  },
  {
    id: 'nem-nuong', dish: 'Grilled pork rolls', dishVi: 'Nem nướng Ninh Hoà', place: 'Nem nướng Đặng Văn Quyên', address: '16A Lãn Ông, Nha Trang',
    region: 'central', city: 'Nha Trang', lat: 12.2516, lng: 109.1904, rating: 4.5, price: '50.000 – 100.000₫',
    desc: {
      en: 'Grilled pork sausage rolled in rice paper with a crispy fried roll, cucumber, herbs and green banana, dipped in a thick, savoury sauce.',
      vi: 'Nem nướng cuốn bánh tráng với ram chiên giòn, dưa leo, rau sống và chuối chát, chấm nước sốt sệt đậm đà.',
    },
    mustTry: { en: 'The signature dipping sauce is the star', vi: 'Nước chấm đặc biệt là "linh hồn" của món ăn' },
  },
  {
    id: 'banh-trang-nuong', dish: 'Grilled rice paper "pizza"', dishVi: 'Bánh tráng nướng', place: 'Bánh tráng nướng (Đà Lạt night market)', address: 'Chợ đêm Đà Lạt',
    region: 'central', city: 'Đà Lạt', lat: 11.9428, lng: 108.4372, rating: 4.0, price: '20.000 – 40.000₫',
    desc: {
      en: 'Rice paper grilled over charcoal with quail egg, spring onion, dried shrimp and sausage — Da Lat\'s favourite night snack.',
      vi: 'Bánh tráng nướng trên than hồng với trứng cút, hành lá, tôm khô, xúc xích — món ăn vặt đêm được yêu thích ở Đà Lạt.',
    },
    mustTry: { en: 'Pair it with a cup of hot soy milk', vi: 'Uống kèm ly sữa đậu nành nóng' },
  },
  {
    id: 'lau-ga-la-e', dish: 'Chicken hotpot with e leaves', dishVi: 'Lẩu gà lá é', place: 'Lẩu gà lá é Tao Ngộ', address: '5 Đường 3/4, Đà Lạt',
    region: 'central', city: 'Đà Lạt', lat: 11.9355, lng: 108.4455, rating: 4.0, price: '250.000 – 400.000₫ / pot',
    desc: {
      en: 'Free-range chicken simmered with é, a peppery-lemony local herb. Cosy and warming on a cool Da Lat night.',
      vi: 'Gà ta nấu cùng lá é thơm cay nồng, chua nhẹ. Ấm áp hoàn hảo cho đêm Đà Lạt se lạnh.',
    },
    mustTry: { en: 'Dip chicken in salt-pepper-lime', vi: 'Chấm gà với muối tiêu chanh' },
  },
  // ---------------- South ----------------
  {
    id: 'banh-mi-huynh-hoa', dish: 'Loaded banh mi', dishVi: 'Bánh mì', place: 'Bánh mì Huỳnh Hoa', address: '26 Lê Thị Riêng, Quận 1, TP. Hồ Chí Minh',
    region: 'south', city: 'TP. Hồ Chí Minh', lat: 10.7714, lng: 106.6923, rating: 4.5, price: '60.000 – 80.000₫',
    desc: {
      en: 'Saigon\'s most famous — and heaviest — banh mi: generously packed with pâté, butter, several kinds of ham and pork floss. One is enough for two.',
      vi: 'Ổ bánh mì nổi tiếng — và "nặng ký" — nhất Sài Gòn: đầy ắp pa tê, bơ, nhiều loại chả, giăm bông và chà bông. Một ổ đủ cho hai người.',
    },
    mustTry: { en: 'Go in the late afternoon when it opens', vi: 'Đến vào chiều muộn khi tiệm vừa mở' },
  },
  {
    id: 'com-tam', dish: 'Broken rice', dishVi: 'Cơm tấm', place: 'Cơm tấm Ba Ghiền', address: '84 Đặng Văn Ngữ, Phú Nhuận, TP. Hồ Chí Minh',
    region: 'south', city: 'TP. Hồ Chí Minh', lat: 10.7955, lng: 106.6714, rating: 4.5, price: '70.000 – 130.000₫',
    desc: {
      en: 'Fragrant broken rice with a giant char-grilled pork chop, shredded pork skin, steamed egg meatloaf and sweet fish sauce.',
      vi: 'Cơm tấm thơm với miếng sườn nướng than khổng lồ, bì, chả trứng và nước mắm ngọt.',
    },
    mustTry: { en: 'Sườn bì chả with a fried egg', vi: 'Cơm sườn bì chả thêm trứng ốp la' },
  },
  {
    id: 'pho-hoa', dish: 'Southern-style pho', dishVi: 'Phở (kiểu miền Nam)', place: 'Phở Hoà Pasteur', address: '260C Pasteur, Quận 3, TP. Hồ Chí Minh',
    region: 'south', city: 'TP. Hồ Chí Minh', lat: 10.7879, lng: 106.6891, rating: 4.0, price: '80.000 – 120.000₫',
    desc: {
      en: 'Compare with Hanoi pho: a slightly sweeter broth, served with bean sprouts, Thai basil, hoisin and chilli sauce on the side.',
      vi: 'So sánh với phở Hà Nội: nước dùng ngọt hơn, ăn kèm giá, húng quế, tương đen và tương ớt.',
    },
    mustTry: { en: 'Phở tái nạm gầu', vi: 'Phở tái nạm gầu' },
  },
  {
    id: 'banh-xeo-46a', dish: 'Sizzling pancake', dishVi: 'Bánh xèo', place: 'Bánh xèo 46A Đinh Công Tráng', address: '46A Đinh Công Tráng, Quận 1, TP. Hồ Chí Minh',
    region: 'south', city: 'TP. Hồ Chí Minh', lat: 10.7919, lng: 106.6912, rating: 4.0, price: '100.000 – 150.000₫',
    desc: {
      en: 'Huge, crispy turmeric pancakes filled with shrimp, pork and bean sprouts. Wrap pieces in mustard leaves with herbs and dip in fish sauce.',
      vi: 'Bánh xèo vàng giòn cỡ lớn với tôm, thịt và giá. Cuốn với cải bẹ xanh, rau thơm và chấm nước mắm chua ngọt.',
    },
    mustTry: { en: 'Eat it with your hands — that\'s the point', vi: 'Ăn bằng tay mới đúng điệu' },
  },
  {
    id: 'oc-vinh-khanh', dish: 'Snails & shellfish', dishVi: 'Ốc', place: 'Phố ẩm thực Vĩnh Khánh', address: 'Vĩnh Khánh, Quận 4, TP. Hồ Chí Minh',
    region: 'south', city: 'TP. Hồ Chí Minh', lat: 10.7598, lng: 106.7045, rating: 4.0, price: '50.000 – 120.000₫ / dish',
    desc: {
      en: 'A lively food street lined with snail restaurants. Order several shellfish cooked in coconut milk, tamarind or salted egg and share with friends.',
      vi: 'Phố ẩm thực náo nhiệt với hàng loạt quán ốc. Gọi nhiều món ốc xào dừa, xào me, rang muối hột gà rồi cùng bạn bè thưởng thức.',
    },
    mustTry: { en: 'Ốc hương rang muối ớt, sò điệp nướng mỡ hành', vi: 'Ốc hương rang muối ớt, sò điệp nướng mỡ hành' },
  },
  {
    id: 'hu-tieu-cai-rang', dish: 'Hu tieu on the river', dishVi: 'Hủ tiếu trên ghe', place: 'Hủ tiếu chợ nổi Cái Răng', address: 'Chợ nổi Cái Răng, Cần Thơ',
    region: 'south', city: 'Cần Thơ', lat: 10.0045, lng: 105.749, rating: 4.0, price: '30.000 – 50.000₫',
    desc: {
      en: 'Noodle soup cooked and served from a small boat in the middle of the floating market — an unforgettable breakfast.',
      vi: 'Tô hủ tiếu nấu và bán ngay trên chiếc ghe nhỏ giữa chợ nổi — bữa sáng khó quên.',
    },
    mustTry: { en: 'Follow it with fresh fruit bought from the boats', vi: 'Ăn xong mua trái cây tươi từ ghe hàng' },
  },
  {
    id: 'lau-mam', dish: 'Fermented fish hotpot', dishVi: 'Lẩu mắm', place: 'Lẩu mắm (Ninh Kiều, Cần Thơ)', address: 'Ninh Kiều, Cần Thơ',
    region: 'south', city: 'Cần Thơ', lat: 10.0341, lng: 105.788, rating: 4.0, price: '200.000 – 350.000₫ / pot',
    desc: {
      en: 'The bold flavour of the Mekong Delta: a rich hotpot of fermented fish broth with seafood, pork and dozens of wild vegetables and flowers.',
      vi: 'Hương vị đậm đà miền Tây: nồi lẩu nước mắm cá, hải sản, thịt heo và hàng chục loại rau, bông điên điển, bông súng.',
    },
    mustTry: { en: 'Go in flood season for điên điển flowers', vi: 'Đi mùa nước nổi để ăn bông điên điển' },
  },
  {
    id: 'goi-ca-trich', dish: 'Raw herring salad', dishVi: 'Gỏi cá trích', place: 'Gỏi cá trích Phú Quốc', address: 'Dương Đông, Phú Quốc',
    region: 'south', city: 'Phú Quốc', lat: 10.217, lng: 103.96, rating: 4.5, price: '120.000 – 200.000₫',
    desc: {
      en: 'Phu Quoc\'s signature: fresh herring cured with lime, mixed with coconut, onion and herbs, rolled in rice paper and dipped in a peanut-chilli sauce.',
      vi: 'Đặc sản Phú Quốc: cá trích tươi tái chanh, trộn dừa nạo, hành tây, rau thơm, cuốn bánh tráng chấm nước chấm đậu phộng cay.',
    },
    mustTry: { en: 'Pair it with a Phu Quoc sunset', vi: 'Thưởng thức cùng hoàng hôn Phú Quốc' },
  },
]
