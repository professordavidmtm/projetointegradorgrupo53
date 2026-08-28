import React, { useState } from 'react';
import { Sidebar, type TabType } from './Sidebar.tsx';
import { Header } from './Header.tsx';
import { Toast } from '../UI/Toast.tsx';

interface LayoutProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onSelectTab,
  children,
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 font-sans antialiased">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        <Header
          currentTab={currentTab}
          onSelectTab={onSelectTab}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Toast Alerts */}
      <Toast />
    </div>
  );
};
