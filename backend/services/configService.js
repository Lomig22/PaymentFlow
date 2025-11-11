let sageConfig = null;

function setSageConfig(cfg) {
  // Stocker uniquement les valeurs non vides; ownerId conservé pour un futur usage multi‑tenant
  sageConfig = {
    baseUrl: cfg?.baseUrl || null,
    apiToken: cfg?.apiToken || null,
    ownerId: cfg?.ownerId || null,
  };
}

function getSageConfig() {
  return sageConfig;
}

module.exports = {
  setSageConfig,
  getSageConfig,
};
