import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop — reset vị trí cuộn về đầu trang mỗi khi route thay đổi.
 *
 * Vấn đề: `.dashboard-main` dùng `overflow-y: auto` nên scroll container
 * là div đó, không phải window. React Router navigate() chỉ swap component
 * nhưng không reset scroll của div → trang mới mở ra ở vị trí cũ (cuối trang).
 *
 * Cách fix: Tìm element `.dashboard-main` trong DOM và gọi scrollTo(0,0).
 * Đặt component này bên trong <Router> để useLocation() hoạt động được.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset scroll của div.dashboard-main (scroll container thực sự)
    const mainEl = document.querySelector('.dashboard-main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Fallback: cũng reset window scroll phòng trường hợp layout thay đổi
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null; // Không render UI gì
}
