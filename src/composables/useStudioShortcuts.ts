import { onMounted, onUnmounted } from 'vue';

export interface StudioShortcutsOptions {
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canDelete: () => boolean;
}

/**
 * Global keyboard shortcuts handler for Meme Studio:
 * - Delete / Backspace: Delete active layer (prevented while typing in form inputs)
 * - Ctrl+Z / Cmd+Z: Undo (or Redo if Shift is held)
 * - Ctrl+Y / Cmd+Y: Redo
 */
export function useStudioShortcuts(options: StudioShortcutsOptions) {
  const handleKeyDown = (e: KeyboardEvent) => {
    const activeEl = document.activeElement as HTMLElement | null;
    const inputType = activeEl && activeEl.tagName === 'INPUT' ? (activeEl as HTMLInputElement).type?.toLowerCase() : '';
    const isNonTextInput = ['checkbox', 'radio', 'range', 'color', 'button', 'submit'].includes(inputType);
    const isTyping = activeEl && !isNonTextInput && (
      activeEl.tagName === 'INPUT' ||
      activeEl.tagName === 'TEXTAREA' ||
      activeEl.isContentEditable ||
      Boolean(activeEl.closest?.('[contenteditable="true"]')) ||
      Boolean(activeEl.closest?.('.tiptap')) ||
      Boolean(activeEl.closest?.('.ProseMirror'))
    );

    if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
      if (options.canDelete()) {
        e.preventDefault();
        options.onDelete();
      }
    }

    if ((e.ctrlKey || e.metaKey) && !isTyping) {
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        if (e.shiftKey) options.onRedo();
        else options.onUndo();
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        options.onRedo();
      }
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyDown);
    }
  });
}
