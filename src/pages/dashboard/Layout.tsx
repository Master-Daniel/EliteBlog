import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setIsModalOpen } from "../../redux/slices/globalSlice";
import { Outlet } from "react-router-dom";
import SignInModal from "../../components/SignInModal";

const Layout: React.FC = () => {
  const { isLoggedIn, isModalOpen } = useSelector((state: RootState) => state.global);
  const dispatch = useDispatch();

  useEffect(() => {
    // When not logged in, ensure the modal is open.
    if (!isLoggedIn && !isModalOpen) {
      dispatch(setIsModalOpen(true));
    }
  }, [isLoggedIn, isModalOpen, dispatch]);

  if (!isLoggedIn) {
    // Render the modal, or any fallback component, while the user is not logged in.
    return <SignInModal isOpen={isModalOpen} onClose={() => dispatch(setIsModalOpen(false))} />;
  }

  return <Outlet />;
};

export default Layout;
