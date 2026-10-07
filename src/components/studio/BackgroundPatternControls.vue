<template>
  <div class="p-3 bg-white border border-app-border rounded-2xl space-y-3 shadow-2xs relative" data-purpose="pattern-controls">
    <!-- Backdrop flotante para cerrar selector al hacer clic fuera -->
    <div v-if="isPickerOpen" class="fixed inset-0 z-40 bg-black/15 backdrop-blur-[0.5px]" @click="isPickerOpen = false"></div>

    <!-- Cabecera con reset por defecto y limpiar -->
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold text-text-main flex items-center gap-1.5">
        <span>✨</span><span>Patrón de Emojis de Fondo</span>
      </span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="resetToDefaults"
          class="text-[10px] font-semibold text-text-muted hover:text-primary-600 transition-colors cursor-pointer flex items-center gap-0.5"
          title="Restablecer tamaño, separación, estilo y rotación a valores por defecto"
        >
          <span>↺</span><span>Por defecto</span>
        </button>
        <span class="text-stone-300 text-xs">|</span>
        <button type="button" @click="handleClear" class="text-[10px] font-semibold text-red-600 hover:underline cursor-pointer">
          Limpiar
        </button>
      </div>
    </div>

    <!-- 1. SELECTOR DE EMOJI -->
    <div class="p-2.5 bg-stone-50 border border-app-border rounded-xl space-y-2 relative">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Emoji Seleccionado</span>
        <button
          type="button"
          @click="isPickerOpen = !isPickerOpen"
          class="text-xs font-bold text-primary-600 hover:underline cursor-pointer"
        >
          {{ isPickerOpen ? 'Cerrar selector' : '🔍 Selector Completo' }}
        </button>
      </div>

      <!-- Preview del emoji activo -->
      <div
        @click="isPickerOpen = true"
        class="flex items-center gap-2.5 p-1.5 bg-white border border-app-border rounded-lg cursor-pointer hover:border-primary-400 hover:bg-stone-50/50 transition-colors"
        title="Clic para abrir selector completo"
      >
        <div class="w-10 h-10 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center text-2xl shadow-2xs shrink-0 select-none">
          {{ selectedEmoji }}
        </div>
        <div class="min-w-0 flex-1">
          <span class="block text-xs font-bold text-text-main truncate">Emoji: {{ selectedEmoji }}</span>
          <span class="block text-[10px] text-text-muted">Clic para abrir buscador Unicode</span>
        </div>
      </div>

      <!-- Atajos Rápidos (FIFO Máx 10) -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <span class="text-[9px] font-bold text-text-subtle uppercase tracking-wider">Opciones Rápidas:</span>
          <span class="text-[9px] text-text-muted font-mono">{{ shortcutEmojis.length }}/10</span>
        </div>
        <div class="grid grid-cols-5 gap-1">
          <button
            v-for="char in shortcutEmojis"
            :key="char"
            type="button"
            @click="onSelectEmoji(char)"
            :class="[
              'h-7 rounded-lg border transition-all flex items-center justify-center cursor-pointer select-none text-base hover:scale-110 active:scale-95 shadow-2xs',
              selectedEmoji === char ? 'bg-primary-100 border-primary-500 ring-1 ring-primary-500 scale-105' : 'bg-white border-app-border hover:bg-primary-50'
            ]"
            :title="`Usar ${char}`"
          >
            <span>{{ char }}</span>
          </button>
        </div>
      </div>

      <!-- Popover Flotante de Selector Completo -->
      <div v-if="isPickerOpen" class="absolute top-8 left-0 right-0 z-50 bg-white border border-app-border rounded-2xl shadow-2xl p-2.5 space-y-2 animate-fade-in">
        <div class="flex items-center justify-between px-1 pb-1 border-b border-app-border">
          <span class="text-xs font-bold text-text-main flex items-center gap-1.5">
            <span>🔍</span><span>Buscador Completo</span>
          </span>
          <button
            type="button"
            @click="isPickerOpen = false"
            class="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
          >
            Listo / Guardar
          </button>
        </div>
        <div class="w-full flex justify-center overflow-hidden">
          <EmojiPickerModal :is-open="isPickerOpen" @select="onPickerSelect" @close="isPickerOpen = false" />
        </div>
      </div>
    </div>

    <!-- 2. OPCIONES DE DISTRIBUCIÓN -->
    <div class="space-y-1.5">
      <label class="block text-[10px] font-bold uppercase tracking-wider text-text-main">Estilo de Patrón:</label>
      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="preset in PATTERN_LAYOUT_PRESETS"
          :key="preset.id"
          type="button"
          @click="layoutMode = preset.id; liveReapply()"
          :class="[
            'p-1.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 shadow-2xs',
            layoutMode === preset.id ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500' : 'bg-white border-app-border hover:bg-stone-50'
          ]"
          :title="preset.desc"
        >
          <span class="text-base select-none shrink-0">{{ preset.icon }}</span>
          <div class="min-w-0">
            <span class="block text-[11px] font-bold text-text-main truncate leading-tight">{{ preset.name }}</span>
            <span class="block text-[9px] text-text-muted truncate leading-tight">{{ preset.desc }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- 3. SLIDERS: TAMAÑO, SEPARACIÓN, OPACIDAD Y ROTACIÓN COMPLETA (HASTA 180°) -->
    <div class="space-y-2 pt-1 border-t border-app-border">
      <SliderControl label="Tamaño" :model-value="emojiSize" :min="14" :max="72" :step="2" unit="px" @update:model-value="updateSlider('size', $event)" />
      <SliderControl label="Separación" :model-value="emojiSpacing" :min="32" :max="140" :step="4" unit="px" @update:model-value="updateSlider('spacing', $event)" />
      <SliderControl label="Opacidad" :model-value="patternOpacity" :min="5" :max="80" :step="1" unit="%" @update:model-value="updateSlider('opacity', $event)" />
      <SliderControl label="Rotación" :model-value="emojiRotation" :min="-180" :max="180" :step="5" unit="°" @update:model-value="updateSlider('rotation', $event)" />
      
      <!-- Atajos rápidos de rotación -->
      <div class="flex items-center justify-between text-[10px] pt-0.5">
        <span class="text-text-subtle font-medium text-[9px]">Ángulos rápidos:</span>
        <div class="flex gap-1">
          <button
            v-for="deg in [0, 45, 90, 180, -90, -180]"
            :key="deg"
            type="button"
            @click="updateSlider('rotation', deg)"
            :class="[
              'px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer',
              emojiRotation === deg
                ? 'bg-primary-100 text-primary-700 border-primary-300'
                : 'bg-stone-50 text-text-muted border-stone-200 hover:bg-stone-100'
            ]"
          >
            {{ deg }}°
          </button>
        </div>
      </div>
    </div>

    <!-- 4. BOTÓN DE APLICAR O RE-LLENAR -->
    <button
      type="button"
      @click="triggerApply"
      class="w-full py-2 px-3 rounded-xl bg-primary-gradient text-white font-bold text-xs shadow-2xs hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
    >
      <span>{{ isPatternActive ? '🔄 Actualizar Patrón' : '✨ Llenar Fondo con Patrón' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import EmojiPickerModal from '../common/EmojiPickerModal.vue';
import SliderControl from '../common/SliderControl.vue';
import {
  PATTERN_LAYOUT_PRESETS,
  DEFAULT_PATTERN_OPTIONS,
  type PatternLayoutMode,
  type EmojiPatternOptions
} from '../../composables/useEmojiPattern';

const emit = defineEmits<{
  (e: 'applyPattern', payload: { emoji: string; options: EmojiPatternOptions }): void;
  (e: 'clearPattern'): void;
}>();

const STORAGE_KEY = 'pixemoji_pattern_shortcut_emojis';
const DEFAULT_SHORTCUTS = ['✨', '🧁', '🍕', '🚀', '🐱', '🔥', '💀', '💖', '🎉', '⭐'];

const selectedEmoji = ref('✨');
const shortcutEmojis = ref<string[]>([...DEFAULT_SHORTCUTS]);
const isPickerOpen = ref(false);
const isPatternActive = ref(false);

const emojiSize = ref(DEFAULT_PATTERN_OPTIONS.size);
const emojiSpacing = ref(DEFAULT_PATTERN_OPTIONS.spacing);
const patternOpacity = ref(Math.round(DEFAULT_PATTERN_OPTIONS.opacity * 100));
const emojiRotation = ref(DEFAULT_PATTERN_OPTIONS.rotation);
const layoutMode = ref<PatternLayoutMode>(DEFAULT_PATTERN_OPTIONS.layout);

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
      console.warn('Error loading pattern shortcuts:', err);
    }
  }
});

const getOptions = (): EmojiPatternOptions => ({
  size: emojiSize.value,
  spacing: emojiSpacing.value,
  opacity: patternOpacity.value / 100,
  rotation: emojiRotation.value,
  layout: layoutMode.value
});

const triggerApply = () => {
  isPatternActive.value = true;
  emit('applyPattern', { emoji: selectedEmoji.value, options: getOptions() });
};

const liveReapply = () => {
  if (isPatternActive.value) triggerApply();
};

const resetToDefaults = () => {
  emojiSize.value = DEFAULT_PATTERN_OPTIONS.size;
  emojiSpacing.value = DEFAULT_PATTERN_OPTIONS.spacing;
  patternOpacity.value = Math.round(DEFAULT_PATTERN_OPTIONS.opacity * 100);
  emojiRotation.value = DEFAULT_PATTERN_OPTIONS.rotation;
  layoutMode.value = DEFAULT_PATTERN_OPTIONS.layout;
  liveReapply();
};

const updateSlider = (field: 'size' | 'spacing' | 'opacity' | 'rotation', val: number) => {
  if (field === 'size') emojiSize.value = val;
  else if (field === 'spacing') emojiSpacing.value = val;
  else if (field === 'opacity') patternOpacity.value = val;
  else if (field === 'rotation') emojiRotation.value = val;
  liveReapply();
};

const onSelectEmoji = (char: string) => {
  selectedEmoji.value = char;
  triggerApply();
};

const onPickerSelect = (char: string) => {
  selectedEmoji.value = char;
  const list = [...shortcutEmojis.value];
  const idx = list.indexOf(char);
  if (idx !== -1) list.splice(idx, 1);
  list.push(char);
  while (list.length > 10) list.shift();
  shortcutEmojis.value = list;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Error saving pattern shortcuts:', err);
  }
  triggerApply();
};

const handleClear = () => {
  isPatternActive.value = false;
  emit('clearPattern');
};
</script>
