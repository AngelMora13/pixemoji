import { ref, shallowRef } from 'vue';

export interface OpenEmojiPickerOptions {
  anchorEl?: HTMLElement | null;
  onSelect: (unicode: string, name: string) => void;
  onClose?: () => void;
}

const isOpen = ref(false);
const activeAnchor = shallowRef<HTMLElement | null>(null);
let selectHandler: ((unicode: string, name: string) => void) | null = null;
let closeHandler: (() => void) | null = null;

export function useGlobalEmojiPicker() {
  const openPicker = (options: OpenEmojiPickerOptions) => {
    activeAnchor.value = options.anchorEl || null;
    selectHandler = options.onSelect;
    closeHandler = options.onClose || null;
    isOpen.value = true;
  };

  const closePicker = () => {
    if (isOpen.value) {
      isOpen.value = false;
      if (closeHandler) {
        closeHandler();
        closeHandler = null;
      }
      selectHandler = null;
      activeAnchor.value = null;
    }
  };

  const handleSelect = (unicode: string, name: string) => {
    if (selectHandler) {
      selectHandler(unicode, name);
    }
    closePicker();
  };

  return {
    isOpen,
    activeAnchor,
    openPicker,
    closePicker,
    handleSelect
  };
}
