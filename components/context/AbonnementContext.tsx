import React, { createContext, useContext, useState } from "react";
import useAbonnementCheck from "../../src/hooks/useAbonnementCheck";
import ModalAbonnementExpiré from "../ModalAbonnementExpiré";
import { fetchAbonnementInfo } from "../../src/lib/supabase/server";

const AbonnementContext = createContext<{
  checkAbonnement: () => boolean;
  loading: boolean;
} | null>(null);

export const AbonnementProvider = async ({ children }: { children: React.ReactNode }) => {
  const { isExpired } = await fetchAbonnementInfo();
  const [modalVisible, setModalVisible] = useState(false);

  const checkAbonnement = () => {
    console.log("Vérification de l'abonnement...");

    if (isExpired) {
      setModalVisible(true);
      return false;
    }
    return true;
  };

  return (
    <AbonnementContext.Provider value={{ checkAbonnement, loading: false }}>
      {children}
      <ModalAbonnementExpiré visible={modalVisible} onClose={() => setModalVisible(false)} />
    </AbonnementContext.Provider>
  );
};

export const useAbonnement = () => {
  const context = useContext(AbonnementContext);
  if (!context) {
    throw new Error("useAbonnement doit être utilisé dans AbonnementProvider");
  }
  return context;
};
