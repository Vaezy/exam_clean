/**
 * Supprime les balises HTML/JS des entrées utilisateur pour limiter les risques XSS.
 * @param {string} input
 * @returns {string}
 */
const sanitizeInput = (input) => {
  if (input == null) return input;
  return String(input).replace(/<[^>]*>/g, '').trim();
};

module.exports = { sanitizeInput };
