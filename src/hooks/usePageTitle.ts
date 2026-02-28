import { useEffect } from 'react';

const SITE_NAME = 'Elite Blog';

export const usePageTitle = (title: string, includesSiteName = false) => {
    useEffect(() => {
        const fullTitle = includesSiteName ? title : `${title} | ${SITE_NAME}`;
        document.title = fullTitle;
        
        return () => {
            document.title = SITE_NAME;
        };
    }, [title, includesSiteName]);
};

export default usePageTitle;
