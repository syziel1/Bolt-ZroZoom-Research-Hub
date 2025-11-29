import { render, screen } from '@testing-library/react';
import { DashboardHeader } from '../DashboardHeader';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

describe('DashboardHeader', () => {
    it('renders logged in state correctly', () => {
        render(
            <BrowserRouter>
                <DashboardHeader
                    isGuestMode={false}
                    userRole="user"
                    onOpenSidebar={() => { }}
                    onSignOut={() => { }}
                    onOpenAdmin={() => { }}
                    onOpenAddResource={() => { }}
                />
            </BrowserRouter>
        );

        expect(screen.getByText(/Wyloguj się/i)).toBeInTheDocument();
    });

    it('renders guest mode correctly', () => {
        render(
            <BrowserRouter>
                <DashboardHeader
                    isGuestMode={true}
                    userRole=""
                    onOpenSidebar={() => { }}
                    onSignOut={() => { }}
                    onOpenAdmin={() => { }}
                    onOpenAddResource={() => { }}
                />
            </BrowserRouter>
        );

        expect(screen.getByText(/Zaloguj się/i)).toBeInTheDocument();
    });
});
