import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Outlet } from "react-router-dom";
import SignInModal from "../../components/SignInModal";

const Layout: React.FC = () => {
  const { isLoggedIn } = useSelector((state: RootState) => state.global);
  const [isAuthModal, setIsAuthModal] = useState<boolean>(false)

  if (!isLoggedIn) {
    // Render the modal, or any fallback component, while the user is not logged in.
    return <SignInModal isOpen={isAuthModal} onClose={() => setIsAuthModal(false)} />;
  }

  return <Outlet />;
};

export default Layout;
