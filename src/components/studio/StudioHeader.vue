<template>
  <header
    class="w-full bg-white/90 backdrop-blur-md border-b border-app-border px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shrink-0 z-20"
    data-purpose="editor-toolbar"
  >
    <!-- Aspect Ratio Dropdown & Custom Edit Button -->
    <div class="relative flex items-center gap-1.5">
      <select
        :value="currentPreset.id"
        @change="onPresetSelect"
        class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-app-border-strong hover:border-text-muted rounded-xl text-xs font-semibold text-text-main shadow-2xs transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500"
        title="Proporción / Formato del lienzo"
      >
        <option v-for="p in formatPresets" :key="p.id" :value="p.id">
          {{ p.icon }} {{ p.name }} ({{ p.ratioLabel }})
        </option>
      </select>

      <!-- Botón para modificar medidas cuando el preset activo es personalizado -->
      <button
        v-if="currentPreset.id === 'custom'"
        type="button"
        @click="$emit('openCustomModal')"
        class="flex items-center gap-1 px-2.5 py-1.5 bg-primary-50 hover:bg-primary-100 border border-primary-300 text-primary-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
        title="Cambiar medidas personalizadas de ancho y alto"
      >
        <span>📐</span>
        <span class="hidden sm:inline text-[11px]">Medidas</span>
      </button>
    </div>

    <!-- Download Button -->
    <button
      type="button"
      @click="$emit('openExport')"
      class="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl bg-primary-gradient hover:opacity-95 text-white font-bold text-xs shadow-md shadow-primary-600/25 active:scale-95 transition-all cursor-pointer shrink-0"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
      </svg>
      <span class="hidden sm:inline">Descargar</span>
    </button>
  </header>
</template>

<script setup lang="ts">
import type { FormatPreset } from '../../composables/useSocialPresets';

const props = defineProps<{
  currentPreset: FormatPreset;
  formatPresets: FormatPreset[];
}>();

const emit = defineEmits<{
  (e: 'selectPreset', preset: FormatPreset): void;
  (e: 'openCustomModal'): void;
  (e: 'openExport'): void;
}>();

const onPresetSelect = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const found = props.formatPresets.find((p) => p.id === target.value);
  if (found) {
    emit('selectPreset', found);
    if (found.id === 'custom') {
      emit('openCustomModal');
    }
  }
};
</script>

