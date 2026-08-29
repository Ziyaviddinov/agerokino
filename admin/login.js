// Login sahifasining logikasi: forma yuborilganda /api/auth/login'ga so'rov yuboradi.

const form = document.getElementById('login-form');
const errorText = document.getElementById('error-text');
const loginBtn = document.getElementById('login-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorText.textContent = '';
  loginBtn.disabled = true;
  loginBtn.textContent = 'Kirilmoqda...';

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      errorText.textContent = data.error || 'Kirishda xatolik yuz berdi.';
      return;
    }

    // Token va admin ma'lumotini saqlaymiz — dashboard sahifalari shundan foydalanadi.
    localStorage.setItem('kinobot_admin_token', data.token);
    localStorage.setItem('kinobot_admin_info', JSON.stringify(data.admin));

    window.location.href = 'index.html';
  } catch (err) {
    errorText.textContent = 'Serverga ulanib bo\'lmadi. Internetni tekshiring.';
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'LOGIN';
  }
});
