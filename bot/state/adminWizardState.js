// Admin uchun "film qo'shish" va "bitta maydonni tahrirlash" savol-javob
// (wizard) holatini saqlaydi. searchState.js bilan bir xil oddiy yondashuv —
// xotirada saqlanadi, bot qayta ishga tushsa tozalanadi (bu normal).

const wizards = new Map();

// ADD wizard uchun matn orqali so'raladigan maydonlar ketma-ketligi.
// DIQQAT: "poster" alohida — u matn emas, RASM sifatida yuboriladi,
// shuning uchun bu ro'yxatda emas, adminWizard.js'da alohida boshqariladi.
const ADD_STEPS = [
  { field: 'title', prompt: '🎬 Kino nomini yozing:', optional: false },
  { field: 'country', prompt: '🌍 Qaysi davlat ishlab chiqarganini yozing:', optional: true },
  { field: 'language', prompt: '🗣 Qaysi tilda ekanligini yozing:', optional: true },
  { field: 'year', prompt: '📅 Qaysi yilda ishlab chiqarilganini yozing:', optional: true },
  { field: 'genre', prompt: '🎭 Janrlarini yozing (masalan: Drama, Fantastika):', optional: true },
  { field: 'hashtags', prompt: '# Hesh teglar yuboring (masalan: #drama #2024):', optional: true },
  { field: 'trailer_url', prompt: '🎞 Treyler havolasini yuboring (Instagram/YouTube):', optional: true },
];

function startAddWizard(telegramId) {
  wizards.set(telegramId, { mode: 'add', stepIndex: 0, data: {} });
  return ADD_STEPS[0];
}

function startEditFieldWizard(telegramId, movieId, field, prompt) {
  wizards.set(telegramId, { mode: 'edit_field', movieId, field, prompt });
}

function getWizard(telegramId) {
  return wizards.get(telegramId) || null;
}

function clearWizard(telegramId) {
  wizards.delete(telegramId);
}

/**
 * ADD wizard'da bitta javobni saqlab, keyingi savolni qaytaradi.
 * @returns {{ done: boolean, nextPrompt?: string, data?: object }}
 */
function advanceAddWizard(telegramId, field, rawValue) {
  const wizard = wizards.get(telegramId);
  if (!wizard || wizard.mode !== 'add') return { done: true, data: {} };

  wizard.data[field] = rawValue === '-' ? null : rawValue;
  wizard.stepIndex += 1;

  if (wizard.stepIndex >= ADD_STEPS.length) {
    // Matn bosqichlari tugadi — endi poster rasmi so'raladi.
    wizard.mode = 'add_await_poster';
    return { done: true, data: wizard.data };
  }

  const next = ADD_STEPS[wizard.stepIndex];
  return { done: false, nextPrompt: next.prompt, field: next.field };
}

function setPosterAndFinish(telegramId, posterUrl) {
  const wizard = wizards.get(telegramId);
  if (!wizard || wizard.mode !== 'add_await_poster') return null;
  wizard.data.poster_url = posterUrl;
  wizard.mode = 'add_ready';
  return wizard.data;
}

module.exports = {
  ADD_STEPS,
  startAddWizard,
  startEditFieldWizard,
  getWizard,
  clearWizard,
  advanceAddWizard,
  setPosterAndFinish,
};
