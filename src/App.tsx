import React from 'react';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/Layout';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const AppContent: React.FC = () => {
  // Bind global keyboard hotkeys (N=New task, P=Aesthetics presets, Esc=Close panels)
  useKeyboardShortcuts();
  
  return <Layout />;
};

function App() {
  return (
    <AppProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AppProvider>
  );
}

export default App;
