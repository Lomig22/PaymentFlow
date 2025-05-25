// context/AbonnementContext.tsx
import React, { createContext, useContext, useState } from "react";
import useAbonnementCheck from "../../hooks/useAbonnementCheck";
import ModalAbonnementExpiré from "../ModalAbonnementExpiré";

const AbonnementContext = createContext<{
  checkAbonnement: () => boolean;
  loading: boolean;
} | null>(null);

export const AbonnementProvider = ({ children }: { children: React.ReactNode }) => {
  const { isExpired, loading } = useAbonnementCheck();
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
    <AbonnementContext.Provider value={{ checkAbonnement, loading }}>
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
