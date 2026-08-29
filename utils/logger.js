// Sodda logger. Keyinchalik winston/pino kabi kutubxonaga almashtirish oson bo'lishi uchun
// hamma joyda console.log o'rniga shu logger ishlatiladi.

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info: (message) => {
    console.log(`[INFO] ${timestamp()} - ${message}`);
  },
  warn: (message) => {
    console.warn(`[WARNING] ${timestamp()} - ${message}`);
  },
  error: (message, error) => {
    console.error(`[ERROR] ${timestamp()} - ${message}`);
    if (error) {
      console.error(error);
    }
  },
};

module.exports = logger;
