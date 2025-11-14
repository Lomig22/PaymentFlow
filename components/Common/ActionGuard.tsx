import React, { createContext, useContext, ReactNode } from "react";

export type ConfirmOptions = {
  title?: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
};

export type ActionGuardContextType = {
  confirm: (opts?: ConfirmOptions) => Promise<boolean>;
};

const ActionGuardContext = createContext<ActionGuardContextType>({
  // Par défaut, confirme toujours (à adapter si vous voulez forcer une confirmation)
  confirm: async () => true,
});

export function ActionGuardProvider({ children }: { children: ReactNode }) {
  const confirm = async (opts?: ConfirmOptions) => {
    const title = opts?.title ?? "Confirmer cette action ?";
    const text = opts?.text ?? "Cette opération peut être sensible.";
    try {
      // Minimaliste: utilise window.confirm pour éviter toute dépendance
      return window.confirm(`${title}${text ? "\n\n" + text : ""}`);
    } catch {
      return true;
    }
  };

  return (
    <ActionGuardContext.Provider value={{ confirm }}>
      {children}
    </ActionGuardContext.Provider>
  );
}

export function useActionGuard() {
  return useContext(ActionGuardContext);
}

// HOC pratique pour injecter confirm en prop
export function withActionGuard<P>(
  Component: React.ComponentType<P & { confirm: (opts?: ConfirmOptions) => Promise<boolean> }>
) {
  return function Wrapped(props: P) {
    const { confirm } = useActionGuard();
    return <Component {...props} confirm={confirm} />;
  };
}
