// "📈 Statistika" sahifasi: foydalanuvchilar o'sishi va eng ko'p ko'rilgan filmlar grafiklari.

const token = localStorage.getItem('kinobot_admin_token');

if (!token) {
  window.location.href = 'login.html';
} else {
  init();
}

function authHeader() {
  return { Authorization: `Bearer ${token}` };
}

async function init() {
  try {
    const meRes = await fetch('/api/auth/me', { headers: authHeader() });
    if (!meRes.ok) throw new Error('yaroqsiz');
    const meData = await meRes.json();
    document.getElementById('admin-name').textContent = meData.admin.username;
  } catch (err) {
    localStorage.removeItem('kinobot_admin_token');
    window.location.href = 'login.html';
    return;
  }

  await Promise.all([loadGrowthChart(), loadTopViewedChart()]);
  attachSidebarPlaceholders();
}

// Dark tema uchun mos ranglar (style.css'dagi CSS o'zgaruvchilarga mos)
const ACCENT = '#5b8cff';
const TEXT_MUTED = '#8b93a1';
const GRID_COLOR = 'rgba(139, 147, 161, 0.15)';

async function loadGrowthChart() {
  try {
    const res = await fetch('/api/dashboard/growth?days=14', { headers: authHeader() });
    if (!res.ok) throw new Error('Yuklanmadi');
    const { growth } = await res.json();

    const labels = growth.map((row) => row.date.slice(5)); // "MM-DD"
    const values = growth.map((row) => row.count);

    new Chart(document.getElementById('growth-chart'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Yangi foydalanuvchilar',
          data: values,
          borderColor: ACCENT,
          backgroundColor: 'rgba(91, 140, 255, 0.15)',
          fill: true,
          tension: 0.3,
          pointRadius: 2,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: TEXT_MUTED }, grid: { color: GRID_COLOR } },
          y: { ticks: { color: TEXT_MUTED, precision: 0 }, grid: { color: GRID_COLOR }, beginAtZero: true },
        },
      },
    });
  } catch (err) {
    showToast('😕 O\'sish grafigini yuklab bo\'lmadi.');
  }
}

async function loadTopViewedChart() {
  try {
    const res = await fetch('/api/dashboard/top-viewed?limit=5', { headers: authHeader() });
    if (!res.ok) throw new Error('Yuklanmadi');
    const { topViewed } = await res.json();

    if (topViewed.length === 0) {
      document.getElementById('top-viewed-empty').classList.remove('hidden');
      document.getElementById('top-viewed-chart').classList.add('hidden');
      return;
    }

    const labels = topViewed.map((row) => row.title);
    const values = topViewed.map((row) => row.views);

    new Chart(document.getElementById('top-viewed-chart'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Ko\'rishlar soni',
          data: values,
          backgroundColor: ACCENT,
          borderRadius: 6,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: TEXT_MUTED, precision: 0 }, grid: { color: GRID_COLOR }, beginAtZero: true },
          y: { ticks: { color: TEXT_MUTED }, grid: { display: false } },
        },
      },
    });
  } catch (err) {
    showToast('😕 Ko\'rishlar grafigini yuklab bo\'lmadi.');
  }
}

function attachSidebarPlaceholders() {
  document.querySelectorAll('.sidebar a[href="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('🚧 Bu bo\'lim keyingi bosqichlarda qo\'shiladi.');
    });
  });
}

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('kinobot_admin_token');
  window.location.href = 'login.html';
});

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}
