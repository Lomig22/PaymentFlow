import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

declare global {
  interface Window {
    chtlConfig?: any;
  }
}

export default function CalendlyAndChatlingLoader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
    });
    const CHATLING_SCRIPT_ID = "chatling-embed-script";

    let observer: MutationObserver | null = null;

    const removeChatlingElements = () => {
      // Supprime le script
      const script = document.getElementById(CHATLING_SCRIPT_ID);
      if (script) script.remove();

      // Supprime la config globale
      delete window.chtlConfig;

      // Supprime les iframes
      const iframe = document.querySelector("iframe[src*='chatling']");
      if (iframe) iframe.remove();

      // Supprime les boutons flottants Chatling
      const chatlingButtonContainer = Array.from(
        document.querySelectorAll("div")
      ).find(
        (div) =>
          div.style.position === "fixed" &&
          div.innerHTML.includes("chtl-open-chat-icon")
      );
      if (chatlingButtonContainer) chatlingButtonContainer.remove();
    };

    if (!user) {
      // Ajouter le script si non connecté
      if (!document.getElementById(CHATLING_SCRIPT_ID)) {
        const script = document.createElement("script");
        script.src = "https://chatling.ai/js/embed.js";
        script.async = true;
        script.id = CHATLING_SCRIPT_ID;
        script.setAttribute("data-id", "4596411993");
        document.body.appendChild(script);

        window.chtlConfig = { chatbotId: "4596411993" };
      }
    } else {
      removeChatlingElements();

      // Observer si quelque chose est injecté après coup
      observer = new MutationObserver(() => {
        const iframe = document.querySelector("iframe[src*='chatling']");
        const chatIcon = document.getElementById("chtl-open-chat-icon");

        if (iframe || chatIcon) {
          removeChatlingElements();
          if (observer) observer.disconnect();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [user]);

  return null;
}
