"use client";

import { LogoutModal, SetTokenModal, SignInModal } from "@/components/layout/sign-in-modal";
import { useMounted } from "@/hooks/use-mounted";

export const ModalProvider = () => {
  const mounted = useMounted()

  if (!mounted) {
    return null;
  }

  return (
    <>
      <SignInModal />
      <SetTokenModal />
      <LogoutModal />
      {/* add your own modals here... */}
    </>
  );
};