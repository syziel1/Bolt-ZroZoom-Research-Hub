import { render, screen } from '@testing-library/react';
import { DashboardHeader } from '../DashboardHeader';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

describe('DashboardHeader', () => {
    it('renders user name correctly', () => {
        render(
            <BrowserRouter>
                <DashboardHeader
                    isGuestMode={false}
                    userNick="TestUser"
                    userName="Jan Testowy"
                    userRole="user"
                    onOpenSidebar={() => { }}
                    onSignOut={() => { }}
                    onOpenAdmin={() => { }}
                    onOpenAddResource={() => { }}
                />
            </BrowserRouter>
        );

        expect(screen.getByText(/Witaj, Jan/i)).toBeInTheDocument();
    });

    it('renders guest mode correctly', () => {
        render(
            <BrowserRouter>
                <DashboardHeader
                    isGuestMode={true}
                    userNick=""
                    userName=""
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
