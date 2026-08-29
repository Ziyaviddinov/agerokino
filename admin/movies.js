// "🎬 Filmlar" sahifasining to'liq logikasi:
// ro'yxat (qidiruv/filtr/pagination), qo'shish, tahrirlash, o'chirish, yashirish/ko'rsatish.

const token = localStorage.getItem('kinobot_admin_token');

if (!token) {
  window.location.href = 'login.html';
}

const state = {
  page: 1,
  search: '',
  type: '',
};

const tbody = document.getElementById('movies-tbody');
const emptyState = document.getElementById('empty-state');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');

const modalOverlay = document.getElementById('movie-modal-overlay');
const modalTitle = document.getElementById('modal-title');
const movieForm = document.getElementById('movie-form');
const modalError = document.getElementById('modal-error');

const deleteModalOverlay = document.getElementById('delete-modal-overlay');
let pendingDeleteId = null;

// ------- Boshlang'ich yuklash -------
init();

async function init() {
  await checkAuth();
  await loadMovies();
  attachEvents();
}

async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', { headers: authHeader() });
    if (!res.ok) throw new Error('yaroqsiz');
    const data = await res.json();
    document.getElementById('admin-name').textContent = data.admin.username;
  } catch (err) {
    localStorage.removeItem('kinobot_admin_token');
    window.location.href = 'login.html';
  }
}

function authHeader() {
  return { Authorization: `Bearer ${token}` };
}

// ------- Ro'yxatni yuklash -------
async function loadMovies() {
  const params = new URLSearchParams({
    page: state.page,
    search: state.search,
    type: state.type,
  });

  try {
    const res = await fetch(`/api/movies?${params.toString()}`, { headers: authHeader() });
    if (!res.ok) throw new Error('Ro\'yxat yuklanmadi');
    const data = await res.json();
    renderTable(data.movies);
    renderPagination(data.total, data.totalPages);
  } catch (err) {
    showToast('😕 Filmlar ro\'yxatini yuklab bo\'lmadi.');
  }
}

function renderTable(movies) {
  tbody.innerHTML = '';

  if (movies.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  movies.forEach((movie) => {
    const tr = document.createElement('tr');

    tr.appendChild(td(movie.title));
    tr.appendChild(td(movie.year || '—'));
    tr.appendChild(td(movie.genre || '—'));
    tr.appendChild(td(movie.rating || '—'));
    tr.appendChild(td(movie.type === 'series' ? 'Serial' : 'Film'));

    const statusTd = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = movie.is_published ? 'badge badge-success' : 'badge badge-muted';
    badge.textContent = movie.is_published ? 'Ko\'rinadi' : 'Yashirin';
    statusTd.appendChild(badge);
    tr.appendChild(statusTd);

    const actionsTd = document.createElement('td');
    actionsTd.className = 'actions-cell';

    const editBtn = actionButton('✏️', () => openEditModal(movie));
    const toggleBtn = actionButton(movie.is_published ? '🙈' : '👁', () => toggleVisibility(movie));
    const deleteBtn = actionButton('🗑', () => openDeleteModal(movie.id), true);

    actionsTd.append(editBtn, toggleBtn, deleteBtn);
    tr.appendChild(actionsTd);

    tbody.appendChild(tr);
  });
}

function td(text) {
  const cell = document.createElement('td');
  cell.textContent = text; // textContent ishlatiladi — XSS'dan himoya (18-band)
  return cell;
}

function actionButton(label, onClick, danger = false) {
  const btn = document.createElement('button');
  btn.className = `btn btn-inline ${danger ? 'btn-danger' : 'btn-secondary'}`;
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

function renderPagination(total, totalPages) {
  pagination.innerHTML = '';
  if (totalPages <= 1) return;

  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-inline btn-secondary';
  prevBtn.textContent = '⬅️';
  prevBtn.disabled = state.page <= 1;
  prevBtn.addEventListener('click', () => {
    state.page -= 1;
    loadMovies();
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-inline btn-secondary';
  nextBtn.textContent = '➡️';
  nextBtn.disabled = state.page >= totalPages;
  nextBtn.addEventListener('click', () => {
    state.page += 1;
    loadMovies();
  });

  const label = document.createElement('span');
  label.textContent = `${state.page} / ${totalPages} (jami ${total})`;

  pagination.append(prevBtn, label, nextBtn);
}

// ------- Qidiruv / filtr -------
let searchDebounce;
function attachEvents() {
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.search = searchInput.value.trim();
      state.page = 1;
      loadMovies();
    }, 350);
  });

  typeFilter.addEventListener('change', () => {
    state.type = typeFilter.value;
    state.page = 1;
    loadMovies();
  });

  document.getElementById('add-movie-btn').addEventListener('click', openAddModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeMovieModal);
  movieForm.addEventListener('submit', submitMovieForm);

  document.getElementById('delete-cancel-btn').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-confirm-btn').addEventListener('click', confirmDelete);

  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('kinobot_admin_token');
    window.location.href = 'login.html';
  });

  document.querySelectorAll('.sidebar a[href="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('🚧 Bu bo\'lim keyingi bosqichlarda qo\'shiladi.');
    });
  });
}

// ------- Qo'shish / Tahrirlash modali -------
function openAddModal() {
  modalTitle.textContent = '➕ Film qo\'shish';
  movieForm.reset();
  document.getElementById('movie-id').value = '';
  modalError.textContent = '';
  modalOverlay.classList.remove('hidden');
}

function openEditModal(movie) {
  modalTitle.textContent = '✏️ Filmni tahrirlash';
  document.getElementById('movie-id').value = movie.id;
  document.getElementById('f-title').value = movie.title || '';
  document.getElementById('f-alt-title').value = movie.alternative_title || '';
  document.getElementById('f-year').value = movie.year || '';
  document.getElementById('f-type').value = movie.type || 'movie';
  document.getElementById('f-genre').value = movie.genre || '';
  document.getElementById('f-rating').value = movie.rating || '';
  document.getElementById('f-duration').value = movie.duration || '';
  document.getElementById('f-poster').value = movie.poster_url || '';
  document.getElementById('f-trailer').value = movie.trailer_url || '';
  document.getElementById('f-watch').value = movie.watch_url || '';
  document.getElementById('f-description').value = movie.description || '';
  modalError.textContent = '';
  modalOverlay.classList.remove('hidden');
}

function closeMovieModal() {
  modalOverlay.classList.add('hidden');
}

async function submitMovieForm(e) {
  e.preventDefault();
  modalError.textContent = '';

  const id = document.getElementById('movie-id').value;
  const payload = {
    title: document.getElementById('f-title').value,
    alternative_title: document.getElementById('f-alt-title').value,
    year: document.getElementById('f-year').value,
    type: document.getElementById('f-type').value,
    genre: document.getElementById('f-genre').value,
    rating: document.getElementById('f-rating').value,
    duration: document.getElementById('f-duration').value,
    poster_url: document.getElementById('f-poster').value,
    trailer_url: document.getElementById('f-trailer').value,
    watch_url: document.getElementById('f-watch').value,
    description: document.getElementById('f-description').value,
  };

  const saveBtn = document.getElementById('modal-save-btn');
  saveBtn.disabled = true;

  try {
    const url = id ? `/api/movies/${id}` : '/api/movies';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      modalError.textContent = data.error || 'Saqlashda xatolik yuz berdi.';
      return;
    }

    closeMovieModal();
    showToast(id ? '✅ Film yangilandi' : '✅ Film qo\'shildi');
    loadMovies();
  } catch (err) {
    modalError.textContent = 'Serverga ulanib bo\'lmadi.';
  } finally {
    saveBtn.disabled = false;
  }
}

// ------- Yashirish / Ko'rsatish -------
async function toggleVisibility(movie) {
  try {
    const res = await fetch(`/api/movies/${movie.id}/visibility`, {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !movie.is_published }),
    });

    if (!res.ok) throw new Error('Holat yangilanmadi');

    showToast(movie.is_published ? '🙈 Film yashirildi' : '👁 Film ko\'rsatildi');
    loadMovies();
  } catch (err) {
    showToast('😕 Holatni o\'zgartirib bo\'lmadi.');
  }
}

// ------- O'chirish -------
function openDeleteModal(movieId) {
  pendingDeleteId = movieId;
  deleteModalOverlay.classList.remove('hidden');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  deleteModalOverlay.classList.add('hidden');
}

async function confirmDelete() {
  if (!pendingDeleteId) return;

  try {
    const res = await fetch(`/api/movies/${pendingDeleteId}`, {
      method: 'DELETE',
      headers: authHeader(),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || '😕 O\'chirib bo\'lmadi.');
      return;
    }

    showToast('🗑 Film o\'chirildi');
    closeDeleteModal();
    loadMovies();
  } catch (err) {
    showToast('😕 Serverga ulanib bo\'lmadi.');
  }
}

// ------- Toast -------
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}
