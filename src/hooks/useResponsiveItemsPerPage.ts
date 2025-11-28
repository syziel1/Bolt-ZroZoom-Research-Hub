import { useState, useEffect } from 'react';

export function useResponsiveItemsPerPage() {
    const [itemsPerPage, setItemsPerPage] = useState(8);

    useEffect(() => {
        const calculateItemsPerPage = () => {
            const width = window.innerWidth;

            // Grid uses minmax(320px, 1fr)
            // < 640px: 1 column -> 2 rows = 2 items
            // 640px - 960px: 2 columns -> 2 rows = 4 items
            // 960px - 1280px: 3 columns -> 2 rows = 6 items
            // >= 1280px: 4 columns -> 2 rows = 8 items

            if (width < 640) {
                setItemsPerPage(2);
            } else if (width < 960) {
                setItemsPerPage(4);
            } else if (width < 1280) {
                setItemsPerPage(6);
            } else {
                setItemsPerPage(8);
            }
        };

        // Initial calculation
        calculateItemsPerPage();

        // Add event listener
        window.addEventListener('resize', calculateItemsPerPage);

        // Cleanup
        return () => window.removeEventListener('resize', calculateItemsPerPage);
    }, []);

    return itemsPerPage;
}
