// Kanalga obuna bo'lish so'ralganda ko'rsatiladigan Inline Keyboard.

const { Markup } = require('telegraf');

function subscribeKeyboard() {
  const channelUsername = (process.env.CHANNEL_USERNAME || '').replace('@', '');
  const channelUrl = `https://t.me/${channelUsername}`;

  return Markup.inlineKeyboard([
    [Markup.button.url('📢 Kanalga obuna bo\'lish', channelUrl)],
    [Markup.button.callback('✅ Obunani tekshirish', 'check_subscription')],
  ]);
}

module.exports = subscribeKeyboard;
