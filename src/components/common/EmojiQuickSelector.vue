<template>
  <div class="p-3 bg-stone-50 border border-app-border rounded-2xl space-y-2.5 relative" data-purpose="emoji-quick-selector">
    <!-- Cabecera con botón Pegar rápido -->
    <div class="flex items-center justify-between">
      <span class="text-[11px] font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5">
        <span v-if="icon">{{ icon }}</span>
        <span>{{ title }}</span>
      </span>
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          @click="pasteFromClipboard"
          class="text-[10.5px] font-semibold px-2 py-0.5 rounded-lg bg-white border border-app-border hover:bg-primary-50 hover:border-primary-300 text-primary-600 flex items-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-95"
          :title="pasteSuccess ? '¡Emoji pegado con éxito!' : 'Pegar emoji copiado del portapapeles'"
        >
          <span>{{ pasteSuccess ? '✅' : '📋' }}</span>
          <span>{{ pasteSuccess ? '¡Pegado!' : 'Pegar' }}</span>
        </button>
        <span class="text-[10px] text-text-subtle font-mono">
          {{ shortcutEmojis.length }}/10
        </span>
      </div>
    </div>

    <!-- Preview del emoji activo: al hacer clic abre el selector global o Ctrl+V para pegar -->
    <div
      ref="pickerTriggerRef"
      tabindex="0"
      @click="openPicker"
      @paste="onPasteEvent"
      class="flex items-center gap-3 p-2 bg-white border border-app-border rounded-xl cursor-pointer hover:border-primary-400 hover:bg-stone-50/50 transition-colors shadow-2xs group focus:outline-none focus:ring-2 focus:ring-primary-500/30"
      title="Haz clic para abrir el buscador completo de emojis o presiona Ctrl+V para pegar"
    >
      <div class="w-11 h-11 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center text-3xl shadow-2xs shrink-0 select-none group-hover:scale-105 transition-transform">
        {{ modelValue }}
      </div>
      <div class="min-w-0 flex-1">
        <span class="block text-xs font-bold text-text-main truncate">
          Emoji: {{ modelValue }}
        </span>
        <span class="block text-[11px] text-text-muted">
          Haz clic para buscar o pega con Ctrl+V
        </span>
      </div>
    </div>

    <!-- Entrada directa / Soporte móvil (menú contextual o teclado nativo de emojis) -->
    <div class="flex items-center gap-1.5">
      <div class="relative flex-1">
        <input
          ref="directInputRef"
          type="text"
          v-model="inputQuery"
          @input="onInputQueryChange"
          @paste="onInputPaste"
          placeholder="O pega / escribe aquí cualquier emoji..."
          class="w-full h-8 px-2.5 pr-7 bg-white border border-app-border rounded-xl text-xs text-text-main placeholder-text-hint focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-2xs transition-colors"
        />
        <button
          v-if="inputQuery"
          type="button"
          @click="inputQuery = ''"
          class="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-text-subtle hover:text-text-main text-[11px] cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Reemplazo Rápido: Atajos FIFO (Máx 10) -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[10px] font-bold text-text-subtle uppercase tracking-wider">
          Opciones Rápidas:
        </span>
      </div>
      <div class="grid grid-cols-5 gap-1.5">
        <button
          v-for="char in shortcutEmojis"
          :key="char"
          type="button"
          @click="selectChar(char)"
          :class="[
            'h-8 rounded-xl border transition-all flex items-center justify-center cursor-pointer select-all text-lg hover:scale-115 active:scale-95 shadow-2xs',
            modelValue === char
              ? 'bg-primary-100 border-primary-500 scale-105 ring-1 ring-primary-500'
              : 'bg-white border-app-border hover:bg-primary-50'
          ]"
          :title="`Usar ${char}`"
        >
          <span>{{ char }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGlobalEmojiPicker } from '../../composables/useGlobalEmojiPicker';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    title?: string;
    icon?: string;
    storageKey?: string;
  }>(),
  {
    title: 'Emoji Seleccionado',
    icon: '✨',
    storageKey: 'pixemoji_shortcut_emojis'
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'select', value: string): void;
}>();

const globalPicker = useGlobalEmojiPicker();
const pickerTriggerRef = ref<HTMLElement | null>(null);
const directInputRef = ref<HTMLInputElement | null>(null);

const pasteSuccess = ref(false);
const inputQuery = ref('');

const DEFAULT_SHORTCUTS = ['😂', '🔥', '❤️', '👍', '🚀', '✨', '🎉', '💯', '💀', '👀'];
const shortcutEmojis = ref<string[]>([...DEFAULT_SHORTCUTS]);

onMounted(() => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(props.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          shortcutEmojis.value = parsed.slice(-10);
        }
      }
    } catch (err) {
      console.warn('Error loading emoji shortcuts:', err);
    }
  }
});

const commitToShortcuts = (char: string) => {
  // Si el emoji ya está en el listado, no cambiamos nada
  if (shortcutEmojis.value.includes(char)) {
    return;
  }

  // Si es nuevo, se agrega al final y los primeros van saliendo (FIFO)
  const list = [...shortcutEmojis.value, char];
  while (list.length > 10) {
    list.shift();
  }
  shortcutEmojis.value = list;
  try {
    localStorage.setItem(props.storageKey, JSON.stringify(list));
  } catch (err) {
    console.warn('Error saving emoji shortcuts:', err);
  }
};

const selectChar = (char: string) => {
  emit('update:modelValue', char);
  emit('select', char);
  commitToShortcuts(char);
};

const openPicker = () => {
  globalPicker.openPicker({
    anchorEl: pickerTriggerRef.value,
    onSelect: (char) => {
      selectChar(char);
    }
  });
};

function extractEmoji(text: string): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
    const segmenter = new (Intl as any).Segmenter('en', { granularity: 'grapheme' });
    for (const { segment } of segmenter.segment(trimmed)) {
      if (/\p{Extended_Pictographic}/u.test(segment)) {
        return segment;
      }
    }
  }

  const match = trimmed.match(/\p{Extended_Pictographic}/u);
  if (match) {
    return match[0];
  }
  return null;
}

const applyPastedText = (text: string): boolean => {
  const emoji = extractEmoji(text);
  if (emoji) {
    selectChar(emoji);
    pasteSuccess.value = true;
    setTimeout(() => {
      pasteSuccess.value = false;
    }, 2000);
    inputQuery.value = '';
    return true;
  }
  return false;
};

const pasteFromClipboard = async () => {
  try {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      directInputRef.value?.focus();
      return;
    }
    const text = await navigator.clipboard.readText();
    if (!text || !applyPastedText(text)) {
      directInputRef.value?.focus();
    }
  } catch {
    directInputRef.value?.focus();
  }
};

const onPasteEvent = (e: ClipboardEvent) => {
  const pasted = e.clipboardData?.getData('text');
  if (pasted && applyPastedText(pasted)) {
    e.preventDefault();
  }
};

const onInputPaste = (e: ClipboardEvent) => {
  const pasted = e.clipboardData?.getData('text');
  if (pasted && applyPastedText(pasted)) {
    e.preventDefault();
  }
};

const onInputQueryChange = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  if (val) {
    const emoji = extractEmoji(val);
    if (emoji) {
      selectChar(emoji);
      inputQuery.value = '';
    }
  }
};
</script>
