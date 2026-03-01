import { Outlet } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';

const RootLayout: React.FC = () => {
    return (
        <>
            <ScrollToTop />
            <Outlet />
        </>
    );
};

export default RootLayout;
