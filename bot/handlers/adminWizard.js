// Admin "film qo'shish" yoki "bitta maydonni tahrirlash" jarayonida
// kelgan matn xabarlarni qayta ishlaydi. messages.js bu yerga
// yo'naltiradi (agar foydalanuvchi wizard holatida bo'lsa).

const { Markup } = require('telegraf');
const { getWizard, clearWizard, advanceAddWizard } = require('../state/adminWizardState');
const movieService = require('../../services/movieService');
const logger = require('../../utils/logger');

const NUMERIC_FIELDS = ['year', 'rating', 'duration'];

function validateAddData(rawData) {
  const errors = [];
  const clean = {};

  const title = (rawData.title || '').toString().trim();
  if (!title) errors.push('Film nomi bo\'sh bo\'lishi mumkin emas.');
  if (title.length > 200) errors.push('Film nomi juda uzun (200 belgidan kam bo\'lsin).');
  clean.title = title;

  clean.alternative_title = rawData.alternative_title ? rawData.alternative_title.trim() : null;
  clean.description = rawData.description ? rawData.description.trim() : null;
  clean.genre = rawData.genre ? rawData.genre.trim() : null;
  clean.poster_url = rawData.poster_url ? rawData.poster_url.trim() : null;
  clean.trailer_url = rawData.trailer_url ? rawData.trailer_url.trim() : null;
  clean.watch_url = rawData.watch_url ? rawData.watch_url.trim() : null;

  if (rawData.year) {
    const year = parseInt(rawData.year, 10);
    if (Number.isNaN(year) || year < 1888 || year > 2100) {
      errors.push('Yil noto\'g\'ri (1888–2100 oralig\'ida bo\'lsin).');
    } else {
      clean.year = year;
    }
  } else {
    clean.year = null;
  }

  if (rawData.rating) {
    const rating = parseFloat(rawData.rating);
    if (Number.isNaN(rating) || rating < 0 || rating > 10) {
      errors.push('Reyting 0 dan 10 gacha bo\'lishi kerak.');
    } else {
      clean.rating = rating;
    }
  } else {
    clean.rating = 0;
  }

  if (rawData.duration) {
    const duration = parseInt(rawData.duration, 10);
    if (Number.isNaN(duration) || duration < 0 || duration > 1000) {
      errors.push('Davomiylik noto\'g\'ri.');
    } else {
      clean.duration = duration;
    }
  } else {
    clean.duration = null;
  }

  return { errors, clean };
}

/**
 * Wizard matn xabarini qayta ishlaydi.
 * @returns {boolean} true bo'lsa — xabar shu yerda "ishlatildi" (boshqa handlerga o'tmasin)
 */
async function handleAdminWizardText(ctx) {
  const telegramId = ctx.from.id;
  const wizard = getWizard(telegramId);
  if (!wizard) return false;

  const text = (ctx.message.text || '').trim();

  // ---------- ADD WIZARD ----------
  if (wizard.mode === 'add') {
    const currentField = require('../state/adminWizardState').ADD_STEPS[wizard.stepIndex].field;
    const result = advanceAddWizard(telegramId, currentField, text);

    if (!result.done) {
      await ctx.reply(result.nextPrompt);
      return true;
    }

    // Barcha savollar tugadi — validatsiya va turi so'raladi.
    const { errors, clean } = validateAddData(result.data);
    if (errors.length > 0) {
      clearWizard(telegramId);
      await ctx.reply(`😕 Xatolik:\n${errors.join('\n')}\n\nQaytadan boshlash uchun /admin ni bosing.`);
      return true;
    }

    // Turini vaqtincha saqlaymiz, tugmalar orqali tanlanadi.
    wizard.mode = 'add_await_type';
    wizard.finalData = clean;

    await ctx.reply(
      'Turini tanlang:',
      Markup.inlineKeyboard([
        [Markup.button.callback('🎬 Movie', 'admin_type_movie')],
        [Markup.button.callback('📺 Series', 'admin_type_series')],
      ])
    );
    return true;
  }

  // ---------- SINGLE FIELD EDIT ----------
  if (wizard.mode === 'edit_field') {
    const { movieId, field } = wizard;
    let value = text === '-' ? null : text;

    if (NUMERIC_FIELDS.includes(field) && value !== null) {
      const num = field === 'rating' ? parseFloat(value) : parseInt(value, 10);
      if (Number.isNaN(num)) {
        await ctx.reply('😕 Raqam kiriting. Qayta urinib ko\'ring:');
        return true;
      }
      value = num;
    }

    const updated = await movieService.updateMovie(movieId, { [field]: value });
    clearWizard(telegramId);

    if (!updated) {
      await ctx.reply('😕 Yangilashda xatolik yuz berdi.');
      return true;
    }

    await ctx.reply(`✅ Yangilandi: ${field} = ${value === null ? '(bo\'sh)' : value}`);
    return true;
  }

  return false;
}

module.exports = { handleAdminWizardText, validateAddData };
