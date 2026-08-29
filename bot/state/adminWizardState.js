// Admin uchun "film qo'shish" va "bitta maydonni tahrirlash" savol-javob
// (wizard) holatini saqlaydi. searchState.js bilan bir xil oddiy yondashuv —
// xotirada saqlanadi, bot qayta ishga tushsa tozalanadi (bu normal).

const wizards = new Map();

// ADD wizard uchun maydonlar ketma-ketligi. Har biri: { field, prompt, optional }
const ADD_STEPS = [
  { field: 'title', prompt: '🎬 Film nomini yozing:', optional: false },
  { field: 'alternative_title', prompt: '🔤 Alternativ nomi (bo\'lmasa "-" yozing):', optional: true },
  { field: 'year', prompt: '📅 Yilini yozing (masalan 2024):', optional: true },
  { field: 'genre', prompt: '🎭 Janrini yozing (masalan: Action, Drama):', optional: true },
  { field: 'rating', prompt: '⭐️ Reytingini yozing (0-10, masalan 7.8):', optional: true },
  { field: 'duration', prompt: '⏱ Davomiyligini daqiqada yozing (masalan 120):', optional: true },
  { field: 'poster_url', prompt: '🖼 Poster URL manzilini yozing (bo\'lmasa "-"):', optional: true },
  { field: 'description', prompt: '📝 Qisqacha tavsifini yozing (bo\'lmasa "-"):', optional: true },
  { field: 'trailer_url', prompt: '🎞 Treyler URL manzilini yozing (bo\'lmasa "-"):', optional: true },
  { field: 'watch_url', prompt: '🔗 Qonuniy tomosha URL manzilini yozing (bo\'lmasa "-"):', optional: true },
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
    return { done: true, data: wizard.data };
  }

  const next = ADD_STEPS[wizard.stepIndex];
  return { done: false, nextPrompt: next.prompt, field: next.field };
}

module.exports = {
  ADD_STEPS,
  startAddWizard,
  startEditFieldWizard,
  getWizard,
  clearWizard,
  advanceAddWizard,
};
