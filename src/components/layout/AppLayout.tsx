'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--nu-navy)' }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-64">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1400px] w-full mx-auto px-8 py-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
