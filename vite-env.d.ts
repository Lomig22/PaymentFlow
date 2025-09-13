/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_API_URL?: string;
  // Ajoute ici les autres variables d'environnement Vite nécessaires
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
