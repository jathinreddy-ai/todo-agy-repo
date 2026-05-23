import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Dashboard } from './Dashboard';
import { TaskList } from './TaskList';
import { ThemeCustomizer } from './ThemeCustomizer';
import { ToastContainer } from './ToastContainer';
import { TaskModal } from './TaskModal';
import { CloudConfigModal } from './CloudConfigModal';
import { AuthModal } from './AuthModal';
import { useApp } from '../context/AppContext';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cloudOpen, setCloudOpen] = useState(false);
  const { isAuthModalOpen, setIsAuthModalOpen } = useApp();

  return (
    <div className="min-h-screen flex relative overflow-hidden transition-colors duration-500">
      {/* Dynamic Futuristic Glowing Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-primary-500/10 dark:bg-primary-500/15 blur-[120px] pointer-events-none animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-pink-500/5 dark:bg-pink-500/10 blur-[150px] pointer-events-none animate-blob [animation-delay:3s]" />

      {/* Responsive Left Navigation Column */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onOpenCloud={() => setCloudOpen(true)} />

      {/* Main Workspace Frame */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'md:pl-64' : 'md:pl-20'
        }`}
      >
        {/* Search Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Scrollable Workspace Panels */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8 space-y-8 z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Stat Charts Dashboard */}
            <Dashboard />

            {/* Task rows */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200/40 dark:border-neutral-800/40 pb-2">
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                  Tasks Overview
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                  Drag items to manually reorder
                </span>
              </div>
              
              <TaskList />
            </div>
          </div>
        </main>
      </div>

      {/* Utility Panel drawers & Modal layers */}
      <ThemeCustomizer />
      <TaskModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CloudConfigModal isOpen={cloudOpen} onClose={() => setCloudOpen(false)} />
      <ToastContainer />
    </div>
  );
};
