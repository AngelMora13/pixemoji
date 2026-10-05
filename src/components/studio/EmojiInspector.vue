<template>
  <div class="space-y-4 relative" data-purpose="emoji-inspector-wrapper">
    <!-- Backdrop para cerrar al hacer clic fuera del popover -->
    <div
      v-if="isPickerOpen"
      class="fixed inset-0 z-40 bg-black/15 backdrop-blur-[0.5px]"
      @click="closePicker"
    ></div>

    <!-- 1. Emoji Actual & Atajo de Emojis Rápidos -->
    <div class="p-3 bg-stone-50 border border-app-border rounded-2xl space-y-2.5 relative">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5">
          <span>✨</span>
          <span>Cambiar Emoji</span>
        </span>
        <button
          type="button"
          @click="togglePicker"
          class="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>{{ isPickerOpen ? 'Cerrar selector' : '🔍 Selector Completo' }}</span>
        </button>
      </div>

      <!-- Emoji activo preview -->
      <div
        @click="openPicker"
        class="flex items-center gap-3 p-2 bg-white border border-app-border rounded-xl cursor-pointer hover:border-primary-400 hover:bg-stone-50/50 transition-colors"
        title="Clic para cambiar emoji con el buscador"
      >
        <div class="w-12 h-12 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center text-3xl shadow-2xs shrink-0 select-none">
          {{ activeEmojiChar }}
        </div>
        <div class="min-w-0 flex-1">
          <span class="block text-xs font-bold text-text-main truncate">
            Emoji Activo: {{ activeEmojiChar }}
          </span>
          <span class="block text-[11px] text-text-muted">
            Haz clic aquí o en los atajos
          </span>
        </div>
      </div>

      <!-- Reemplazo Rápido: Grid de Opciones Preconfiguradas (Máx 10, FIFO) -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-bold text-text-subtle uppercase tracking-wider">
            Opciones Rápidas (Máx 10):
          </span>
          <span class="text-[10px] text-text-muted font-mono font-medium">
            {{ shortcutEmojis.length }}/10
          </span>
        </div>
        <div class="grid grid-cols-5 gap-1.5">
          <button
            v-for="char in shortcutEmojis"
            :key="char"
            type="button"
            @click="selectEmojiChar(char)"
            :class="[
              'h-9 rounded-xl border transition-all flex items-center justify-center cursor-pointer select-none text-xl hover:scale-115 active:scale-95 shadow-2xs',
              activeEmojiChar === char
                ? 'bg-primary-100 border-primary-500 scale-105 ring-1 ring-primary-500'
                : 'bg-white border-app-border hover:bg-primary-50'
            ]"
            :title="`Usar ${char}`"
          >
            <span>{{ char }}</span>
          </button>
        </div>
      </div>

      <!-- Popover Flotante de Selector de Emojis -->
      <div
        v-if="isPickerOpen"
        class="absolute top-12 left-0 right-0 z-50 bg-white border border-app-border rounded-2xl shadow-2xl p-2.5 space-y-2 animate-fade-in"
      >
        <div class="flex items-center justify-between px-1 pb-1 border-b border-app-border">
          <span class="text-xs font-bold text-text-main flex items-center gap-1.5">
            <span>🔍</span>
            <span>Buscador Completo</span>
          </span>
          <button
            type="button"
            @click="closePicker"
            class="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
          >
            Listo / Guardar
          </button>
        </div>

        <div class="w-full flex justify-center overflow-hidden">
          <EmojiPickerModal
            :is-open="isPickerOpen"
            @select="onPickerSelect"
            @close="closePicker"
          />
        </div>
      </div>
    </div>

    <!-- 2. Efectos 1-Clic para Emoji -->
    <EffectPresetsGrid mode="object" />

    <hr class="border-app-border" />

    <!-- 3. Orientación & Posición -->
    <TransformActionsGrid />

    <hr class="border-app-border" />

    <!-- 4. Sombra 2D & Resplandor -->
    <div class="space-y-2.5">
      <span class="block text-xs font-bold text-text-main uppercase tracking-wider text-[11px]">
        Sombra & Dirección 2D:
      </span>
      <ShadowPad />
    </div>

    <!-- 5. Filtros: Desenfoque & Contraste -->
    <FilterControls />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';
import EmojiPickerModal from '../common/EmojiPickerModal.vue';
import ShadowPad from './ShadowPad.vue';
import FilterControls from './FilterControls.vue';
import EffectPresetsGrid from '../common/EffectPresetsGrid.vue';
import TransformActionsGrid from '../common/TransformActionsGrid.vue';

const studio = useCanvasStudio();

const isPickerOpen = ref(false);
const pendingEmoji = ref<string | null>(null);

const DEFAULT_PRECONFIGURED_EMOJIS = [
  '😂', '🔥', '❤️', '👍', '🚀', '✨', '🎉', '💯', '💀', '👀'
];

const STORAGE_KEY = 'pixemoji_shortcut_emojis';

const shortcutEmojis = ref<string[]>([...DEFAULT_PRECONFIGURED_EMOJIS]);

onMounted(() => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
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

const activeEmojiChar = computed(() => {
  const nodeText = studio?.activeElement.value?.text || '';
  return nodeText || '🧁';
});

const selectEmojiChar = (char: string) => {
  studio?.change('text', char);
};

const openPicker = () => {
  pendingEmoji.value = null;
  isPickerOpen.value = true;
};

const togglePicker = () => {
  if (isPickerOpen.value) {
    closePicker();
  } else {
    openPicker();
  }
};

const onPickerSelect = (char: string) => {
  pendingEmoji.value = char;
  selectEmojiChar(char);
  // No se cierra ni se suma a shortcuts de inmediato mientras sigue decidiendo
};

const closePicker = () => {
  if (pendingEmoji.value) {
    commitEmojiToShortcuts(pendingEmoji.value);
    pendingEmoji.value = null;
  }
  isPickerOpen.value = false;
};

const commitEmojiToShortcuts = (char: string) => {
  const list = [...shortcutEmojis.value];
  const idx = list.indexOf(char);
  if (idx !== -1) {
    list.splice(idx, 1);
  }
  list.push(char);
  while (list.length > 10) {
    list.shift(); // FIFO: de haber más de 10 elimina el primero
  }
  shortcutEmojis.value = list;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Error saving emoji shortcuts:', err);
  }
};
</script>
