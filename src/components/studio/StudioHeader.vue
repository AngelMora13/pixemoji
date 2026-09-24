<template>
  <header class="w-full glass-card rounded-3xl p-4 sm:p-5 border border-[#e8d2c0] shadow-lg shadow-[#523e32]/5 flex flex-col md:flex-row items-center justify-between gap-4">
    <!-- Brand & Status -->
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#d97736] to-amber-400 flex items-center justify-center text-xl shadow-md shadow-[#d97736]/20">
        🎨
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-xl font-extrabold tracking-tight text-[#2b1e1a]">
            Meme & Sticker Studio
          </h1>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-[10px] font-bold uppercase tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
            Konva.js
          </span>
        </div>
        <p class="text-xs text-[#735a4d]">
          Crea memes y pegatinas con arrastre libre, tipografías y efectos instantáneos.
        </p>
      </div>
    </div>

    <!-- Quick Action Controls: Undo/Redo, Aspect Ratio, and Export Button -->
    <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
      <!-- Undo / Redo Cluster -->
      <div class="flex items-center p-1 bg-amber-100/60 rounded-xl border border-amber-200">
        <button
          type="button"
          @click="$emit('undo')"
          :disabled="!canUndo"
          class="w-8 h-8 rounded-lg bg-white border border-[#debfa8] flex items-center justify-center text-xs hover:bg-amber-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors"
          title="Deshacer (Ctrl + Z)"
        >
          ↩️
        </button>
        <button
          type="button"
          @click="$emit('redo')"
          :disabled="!canRedo"
          class="w-8 h-8 rounded-lg bg-white border border-[#debfa8] flex items-center justify-center text-xs hover:bg-amber-100 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-colors ml-1"
          title="Rehacer (Ctrl + Y)"
        >
          ↪️
        </button>
      </div>

      <!-- Aspect Ratio Quick Dropdown -->
      <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 border border-[#debfa8] rounded-xl shadow-2xs">
        <span class="text-xs">📐</span>
        <select
          :value="currentPreset.id"
          @change="onPresetSelect"
          class="bg-transparent text-xs font-bold text-[#523e32] focus:outline-none cursor-pointer"
          title="Proporción / Formato del lienzo"
        >
          <option v-for="p in formatPresets" :key="p.id" :value="p.id">
            {{ p.icon }} {{ p.name }} ({{ p.ratioLabel }})
          </option>
        </select>
      </div>

      <!-- Prominent Download Button -->
      <button
        type="button"
        @click="$emit('openExport')"
        class="py-2 px-4 rounded-xl bg-gradient-to-r from-[#d97736] to-amber-600 hover:from-[#c46527] hover:to-amber-700 text-white font-extrabold text-xs shadow-md shadow-[#d97736]/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Descargar</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { FormatPreset } from '../../composables/useSocialPresets';

const props = defineProps<{
  canUndo: boolean;
  canRedo: boolean;
  currentPreset: FormatPreset;
  formatPresets: FormatPreset[];
}>();

const emit = defineEmits<{
  (e: 'undo'): void;
  (e: 'redo'): void;
  (e: 'selectPreset', preset: FormatPreset): void;
  (e: 'openExport'): void;
}>();

const onPresetSelect = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const found = props.formatPresets.find((p) => p.id === target.value);
  if (found) emit('selectPreset', found);
};
</script>
