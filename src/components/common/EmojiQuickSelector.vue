<template>
  <div class="p-3 bg-stone-50 border border-app-border rounded-2xl space-y-2.5 relative" data-purpose="emoji-quick-selector">
    <!-- Cabecera sin botón togglePicker (no es necesario) -->
    <div class="flex items-center justify-between">
      <span class="text-[11px] font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5">
        <span v-if="icon">{{ icon }}</span>
        <span>{{ title }}</span>
      </span>
      <span class="text-[10px] text-text-subtle font-mono">
        {{ shortcutEmojis.length }}/10
      </span>
    </div>

    <!-- Preview del emoji activo: al hacer clic abre el selector global -->
    <div
      ref="pickerTriggerRef"
      @click="openPicker"
      class="flex items-center gap-3 p-2 bg-white border border-app-border rounded-xl cursor-pointer hover:border-primary-400 hover:bg-stone-50/50 transition-colors shadow-2xs group"
      title="Haz clic para abrir el buscador completo de emojis"
    >
      <div class="w-11 h-11 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center text-3xl shadow-2xs shrink-0 select-none group-hover:scale-105 transition-transform">
        {{ modelValue }}
      </div>
      <div class="min-w-0 flex-1">
        <span class="block text-xs font-bold text-text-main truncate">
          Emoji: {{ modelValue }}
        </span>
        <span class="block text-[11px] text-text-muted">
          Haz clic para abrir el buscador
        </span>
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
            'h-8 rounded-xl border transition-all flex items-center justify-center cursor-pointer select-none text-lg hover:scale-115 active:scale-95 shadow-2xs',
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
  const list = [...shortcutEmojis.value];
  const idx = list.indexOf(char);
  if (idx !== -1) {
    list.splice(idx, 1);
  }
  list.push(char);
  while (list.length > 10) {
    list.shift(); // FIFO
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
</script>
