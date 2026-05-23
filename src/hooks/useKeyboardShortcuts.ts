import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const useKeyboardShortcuts = () => {
  const { 
    setIsTaskModalOpen, 
    setIsCustomizerOpen, 
    setSelectedTask,
    isTaskModalOpen,
    isCustomizerOpen
  } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key shortcuts if user is currently typing inside input or textarea elements
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          setSelectedTask(null);
          setIsTaskModalOpen(true);
          break;
        case 'p':
          e.preventDefault();
          setIsCustomizerOpen(true);
          break;
        case 'escape':
          e.preventDefault();
          if (isTaskModalOpen) setIsTaskModalOpen(false);
          if (isCustomizerOpen) setIsCustomizerOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTaskModalOpen, isCustomizerOpen, setIsTaskModalOpen, setIsCustomizerOpen, setSelectedTask]);
};
