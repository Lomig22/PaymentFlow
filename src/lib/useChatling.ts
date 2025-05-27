import { useEffect } from "react";

const CHATLING_SCRIPT_ID = "chatling-script";

const useChatlingScript = () => {
  useEffect(() => {
    // Évite d'insérer plusieurs fois le script
    if (document.getElementById(CHATLING_SCRIPT_ID)) return;

    // Crée et configure le script
    const script = document.createElement("script");
    script.src = "https://chatling.ai/js/embed.js";
    script.async = true;
    script.id = CHATLING_SCRIPT_ID;
    script.setAttribute("data-id", "4596411993");

    // Définir la config avant l'ajout du script
    window.chtlConfig = { chatbotId: "4596411993" };

    // Ajout au DOM
    document.body.appendChild(script);

    // Optionnel : nettoyer au démontage si besoin
    return () => {
      const existingScript = document.getElementById(CHATLING_SCRIPT_ID);
      if (existingScript) {
        existingScript.remove();
      }
      delete window.chtlConfig;
    };
  }, []);
};

export default useChatlingScript;
