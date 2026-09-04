/**
 * Vérifie que les variables d'environnement sensibles sont correctement configurées.
 */
const validateEnv = () => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('JWT_SECRET est manquant dans le fichier .env');
    process.exit(1);
  }

  if (jwtSecret.length < 32) {
    console.warn(
      'Attention : JWT_SECRET est trop faible (< 32 caractères). ' +
        'En production, utilisez un secret aléatoire long, stocké hors du code source ' +
        '(variables d\'environnement du serveur, gestionnaire de secrets).'
    );
  }
};

module.exports = validateEnv;
