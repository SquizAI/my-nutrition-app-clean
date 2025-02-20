import { useEffect, useCallback } from 'react';

type ShortcutHandlers = {
  [key: string]: () => void;
};

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Get the key name
      let key = event.key.toLowerCase();

      // Handle special keys
      if (event.code === 'Space') {
        key = 'space';
        // Prevent page scroll on space
        event.preventDefault();
      }
      if (event.code === 'Escape') {
        key = 'escape';
      }
      if (event.code === 'Enter') {
        key = 'enter';
      }
      if (event.code === 'Backspace') {
        key = 'backspace';
      }

      // Check if we have a handler for this key
      const handler = handlers[key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    },
    [handlers]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
}; 