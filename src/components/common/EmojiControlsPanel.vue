<template>
  <div class="glass-card rounded-3xl p-6 md:p-7 border border-app-border shadow-soft space-y-6">
    <!-- Emoji Selection Modes -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <label class="text-xs font-bold uppercase tracking-wider text-text-main">
          1. Selecciona tu Emoji
        </label>
        <button
          ref="pickerBtnRef"
          type="button"
          @click="togglePicker"
          :class="[
            'text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer',
            showPicker
              ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
              : 'bg-white text-primary-600 border-app-border-strong hover:bg-primary-50'
          ]"
        >
          <span>🔍</span>
          <span>{{ showPicker ? 'Cerrar Buscador' : 'Abrir Emoji Picker Completo' }}</span>
        </button>
      </div>

      <!-- Quick Presets Grid -->
      <div class="grid grid-cols-5 gap-2.5 mt-3">
        <button
          v-for="item in emojiList"
          :key="item.name"
          type="button"
          @click="$emit('select-preset', item)"
          :class="[
            'p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-150 cursor-pointer border select-none shadow-2xs',
            selectedChar === item.char && !isCustom
              ? 'bg-primary-100 border-primary-500 shadow-sm scale-105 ring-2 ring-primary-500/30'
              : 'bg-white border-app-border hover:bg-primary-50/70 hover:border-primary-300'
          ]"
        >
          <span class="text-3xl p-1 inline-flex items-center justify-center leading-none select-none">
            {{ item.char }}
          </span>
          <span class="text-[10px] font-semibold text-text-muted truncate max-w-full capitalize">
            {{ item.name }}
          </span>
        </button>
      </div>
    </div>

    <!-- Custom Emoji Direct Input -->
    <div class="pt-2 border-t border-app-border">
      <label class="block text-xs font-bold uppercase tracking-wider text-text-main mb-2">
        O escribe directamente cualquier emoji:
      </label>
      <div class="flex gap-2.5">
        <input
          :value="customInput"
          @input="onInputEmoji"
          type="text"
          maxlength="4"
          placeholder="🍕"
          class="w-20 h-11 px-3 bg-white border border-app-border-strong rounded-xl text-center text-xl text-text-main focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-xs"
        />
        <input
          :value="customName"
          @input="$emit('update:customName', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Nombre del archivo (ej: pizza)"
          class="flex-1 h-11 px-4 bg-white border border-app-border-strong rounded-xl text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-xs placeholder-text-hint"
        />
      </div>
    </div>

    <!-- Resolution & Alignment -->
    <div class="pt-2 border-t border-app-border space-y-4">
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-bold uppercase tracking-wider text-text-main">
            2. Resolución de Descarga PNG
          </label>
          <span class="text-[11px] text-text-subtle font-mono font-semibold">
            {{ targetResolution }} &times; {{ targetResolution }} px
          </span>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="item in resolutionOptions"
            :key="item.val"
            type="button"
            @click="$emit('update:targetResolution', item.val)"
            :class="[
              'py-2 px-1.5 rounded-xl border transition-all cursor-pointer text-center select-none flex flex-col items-center justify-center gap-0.5',
              targetResolution === item.val
                ? 'bg-primary-600 text-white border-primary-600 shadow-brand'
                : 'bg-white text-text-main border-app-border-strong hover:bg-primary-50/70'
            ]"
          >
            <span class="text-xs font-bold font-mono">{{ item.label }}</span>
            <span :class="['text-[9px] font-semibold', targetResolution === item.val ? 'text-primary-100' : 'text-text-subtle']">
              {{ item.tag }}
            </span>
          </button>
        </div>
      </div>

      <!-- Alignment Tools -->
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-text-main mb-2">
          Herramientas de Posicionamiento
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            @click="$emit('center')"
            class="px-3 py-2 rounded-xl bg-white border border-app-border-strong text-text-main hover:bg-primary-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Centrar Emoji</span>
          </button>

          <button
            type="button"
            @click="$emit('fit')"
            class="px-3 py-2 rounded-xl bg-white border border-app-border-strong text-text-main hover:bg-primary-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>Ajustar al Lienzo</span>
          </button>

          <button
            type="button"
            @click="$emit('reset-transform')"
            class="px-3 py-2 rounded-xl bg-white border border-app-border-strong text-text-main hover:bg-primary-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Resetear Rotación</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGlobalEmojiPicker } from '../../composables/useGlobalEmojiPicker';

export interface EmojiItem {
  name: string;
  char: string;
}

defineProps<{
  selectedChar: string;
  isCustom: boolean;
  customInput: string;
  customName: string;
  targetResolution: number;
  emojiList: EmojiItem[];
}>();

const emit = defineEmits<{
  (e: 'select-preset', item: EmojiItem): void;
  (e: 'update:customInput', val: string): void;
  (e: 'update:customName', val: string): void;
  (e: 'update:targetResolution', val: number): void;
  (e: 'custom-input-change'): void;
  (e: 'apply-picker', unicode: string, name: string): void;
  (e: 'center'): void;
  (e: 'fit'): void;
  (e: 'reset-transform'): void;
}>();

const globalPicker = useGlobalEmojiPicker();
const showPicker = computed(() => globalPicker.isOpen.value);
const pickerBtnRef = ref<HTMLElement | null>(null);

const togglePicker = () => {
  if (globalPicker.isOpen.value) {
    globalPicker.closePicker();
  } else {
    globalPicker.openPicker({
      anchorEl: pickerBtnRef.value,
      onSelect: onPickerSelect
    });
  }
};

const resolutionOptions = [
  { label: '128px', val: 128, tag: 'Icono' },
  { label: '256px', val: 256, tag: 'Estándar' },
  { label: '512px', val: 512, tag: 'HD' },
  { label: '1024px', val: 1024, tag: 'Ultra' }
];

const onInputEmoji = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  emit('update:customInput', val);
  emit('custom-input-change');
};

const onPickerSelect = (unicode: string, name: string) => {
  emit('apply-picker', unicode, name);
  showPicker.value = false;
};
</script>
