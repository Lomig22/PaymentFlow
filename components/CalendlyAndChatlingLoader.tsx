'use client';
import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabase/supabase";
import { User } from "@supabase/supabase-js";

declare global {
  interface Window {
    chtlConfig?: any;
  }
}
const CHATLING_SCRIPT_ID = "chatling-embed-script";

export const removeChatlingElements = () => {
  const script = document.getElementById(CHATLING_SCRIPT_ID);
  if (script) script.remove();
  delete window.chtlConfig;
  const iframe = document.querySelector("iframe[src*='chatling']");
  if (iframe) iframe.remove();
  const chatlingButtonContainer = Array.from(
    document.querySelectorAll("div")
  ).find(
    (div) =>
      div.style.position === "fixed" &&
      div.innerHTML.includes("chtl-open-chat-icon")
  );
  if (chatlingButtonContainer) chatlingButtonContainer.remove();
};

export default function CalendlyAndChatlingLoader() {
  const [user, setUser] = useState<User | null>(null);

  // 1) S'abonner une seule fois aux changements d'auth, et se désabonner au démontage
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
    });
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 2) Gérer le chargement / suppression de Chatling selon l'état utilisateur
  useEffect(() => {
    let t1: number | null = null;
    let t2: number | null = null;


    if (!user) {
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
      // En mode connecté, on supprime Chatling si présent
      removeChatlingElements();
      // Au lieu d'un MutationObserver permanent (coûteux),
      // on effectue 2 nettoyages différés pour capturer d'éventuelles ré-injections tardives
      t1 = window.setTimeout(removeChatlingElements, 500);
      t2 = window.setTimeout(removeChatlingElements, 2000);
    }

    return () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [user]);

  return null;
}
