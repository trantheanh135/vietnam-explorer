export const T = {
  appName: { en: 'Vietnam Explorer', vi: 'Khám phá Việt Nam' },
  tagline: { en: 'Beautiful places & good food', vi: 'Cảnh đẹp & món ngon' },
  travel: { en: 'Travel', vi: 'Du lịch' },
  food: { en: 'Food', vi: 'Ẩm thực' },
  search: { en: 'Search places, dishes, cities…', vi: 'Tìm địa điểm, món ăn, thành phố…' },
  allTypes: { en: 'All types', vi: 'Tất cả' },
  results: { en: 'places', vi: 'địa điểm' },
  noResults: { en: 'No places match your search.', vi: 'Không tìm thấy địa điểm phù hợp.' },
  bestTime: { en: 'Best time to visit', vi: 'Thời điểm đẹp nhất' },
  mustTry: { en: 'Must try', vi: 'Nhất định phải thử' },
  price: { en: 'Price', vi: 'Giá' },
  ourRating: { en: 'Our rating', vi: 'Đánh giá của chúng tôi' },
  openMaps: { en: 'Open in Google Maps', vi: 'Mở Google Maps' },
  directions: { en: 'Directions', vi: 'Chỉ đường' },
  myReview: { en: 'My review', vi: 'Đánh giá của tôi' },
  myNote: { en: 'Your notes (saved on this device)…', vi: 'Ghi chú của bạn (lưu trên thiết bị này)…' },
  favourite: { en: 'Favourite', vi: 'Yêu thích' },
  visited: { en: 'Been there', vi: 'Đã đến' },
  favouritesOnly: { en: 'Favourites only', vi: 'Chỉ mục yêu thích' },
  back: { en: 'Back to list', vi: 'Quay lại danh sách' },
  showMap: { en: 'Map', vi: 'Bản đồ' },
  showList: { en: 'List', vi: 'Danh sách' },
  offline: { en: 'You are offline — the list works, the map needs internet.', vi: 'Bạn đang offline — danh sách vẫn dùng được, bản đồ cần Internet.' },
  approx: { en: 'Pin is approximate — Google Maps finds the exact address.', vi: 'Vị trí ghim là tương đối — Google Maps sẽ tìm địa chỉ chính xác.' },
  install: { en: 'Install app', vi: 'Cài ứng dụng' },
  updated: { en: 'A new version is available.', vi: 'Đã có phiên bản mới.' },
  reload: { en: 'Reload', vi: 'Tải lại' },
}

export function t(key, lang) {
  return T[key]?.[lang] ?? key
}
