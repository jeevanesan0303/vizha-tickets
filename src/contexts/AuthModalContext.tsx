
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthModalView = "login" | "register";

type AuthModalContextValue = {
  isOpen: boolean;
  view: AuthModalView;
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
  switchView: (view: AuthModalView) => void;
};

const AuthModalContext =
  createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const [view, setView] =
    useState<AuthModalView>("login");

  const openLogin = useCallback(() => {
    setView("login");
    setIsOpen(true);
  }, []);

  const openRegister = useCallback(() => {
    setView("register");
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const switchView = useCallback(
    (nextView: AuthModalView) => {
      setView(nextView);
      setIsOpen(true);
    },
    []
  );

  const value = useMemo(
    () => ({
      isOpen,
      view,
      openLogin,
      openRegister,
      closeModal,
      switchView,
    }),
    [
      isOpen,
      view,
      openLogin,
      openRegister,
      closeModal,
      switchView,
    ]
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);

  if (!context) {
    throw new Error(
      "useAuthModal must be used inside AuthModalProvider"
    );
  }

  return context;
}
