import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Outlet } from "react-router-dom";
import SignInModal from "../../components/SignInModal";

const Layout: React.FC = () => {
  const { isLoggedIn } = useSelector((state: RootState) => state.global);
  const [isAuthModal, setIsAuthModal] = useState<boolean>(false)

  useEffect(() => {
    let metaRobots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = 'noindex, nofollow';

    return () => {
      if (metaRobots) {
        metaRobots.content = 'index, follow';
      }
    };
  }, []);

  if (!isLoggedIn) {
    return <SignInModal isOpen={isAuthModal} onClose={() => setIsAuthModal(false)} />;
  }

  return <Outlet />;
};

export default Layout;
