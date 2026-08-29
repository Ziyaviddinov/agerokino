// Dashboard sahifasi logikasi:
// 1) token tekshiruvi (route guard), 2) statistikani yuklash, 3) sidebar'dagi
// hali tayyor bo'lmagan bo'limlar uchun toast ko'rsatish.

const token = localStorage.getItem('kinobot_admin_token');

if (!token) {
  window.location.href = 'login.html';
} else {
  init();
}

async function init() {
  try {
    const meResponse = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!meResponse.ok) throw new Error('Token yaroqsiz');

    const meData = await meResponse.json();
    const nameEl = document.getElementById('admin-name');
    if (nameEl) nameEl.textContent = meData.admin.username;

    await loadStats();
  } catch (err) {
    localStorage.removeItem('kinobot_admin_token');
    localStorage.removeItem('kinobot_admin_info');
    window.location.href = 'login.html';
  }
}

async function loadStats() {
  const grid = document.getElementById('stats-grid');
  if (!grid) return; // Bu sahifada statistika kartalari yo'q (masalan login.html)

  try {
    const response = await fetch('/api/dashboard/summary', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Statistika yuklanmadi');

    const stats = await response.json();

    setText('stat-total-users', stats.totalUsers);
    setText('stat-today-users', stats.todayActiveUsers);
    setText('stat-total-movies', stats.totalMovies);
    setText('stat-total-series', stats.totalSeries);
    setText('stat-today-searches', stats.todaySearches);
    setText('stat-total-favorites', stats.totalFavorites);
  } catch (err) {
    showToast('😕 Statistikani yuklab bo\'lmadi.');
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// Sidebar'dagi hali tayyor bo'lmagan bo'limlar (STEP 12+ da haqiqiy sahifaga aylanadi).
document.querySelectorAll('.sidebar a[data-page]').forEach((link) => {
  if (link.getAttribute('href') === '#') {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('🚧 Bu bo\'lim keyingi bosqichlarda qo\'shiladi.');
    });
  }
});

const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('kinobot_admin_token');
    localStorage.removeItem('kinobot_admin_info');
    window.location.href = 'login.html';
  });
}
