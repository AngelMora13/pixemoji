<template>
  <div class="p-3 bg-stone-50 border border-app-border rounded-2xl space-y-3" data-purpose="filter-controls">
    <div class="flex items-center justify-between text-xs">
      <span class="font-bold text-text-main flex items-center gap-1.5">
        <span>🌫️</span>
        <span>Desenfoque & Contraste</span>
      </span>
      <button
        v-if="effectiveBlur > 0 || effectiveContrast !== 100"
        type="button"
        @click="resetFilters"
        class="text-[10px] font-bold text-primary-600 hover:underline cursor-pointer"
        title="Restablecer filtros a valores iniciales"
      >
        Restablecer
      </button>
    </div>

    <div class="space-y-2.5 text-xs">
      <!-- 1. Desenfoque (Blur) -->
      <div>
        <div class="flex justify-between items-center text-[10px] font-bold uppercase text-text-main mb-1">
          <span>Desenfoque (Blur)</span>
          <span class="font-mono font-bold text-primary-600">{{ effectiveBlur }}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="30"
          step="0.5"
          :value="effectiveBlur"
          @input="onBlurInput"
          class="w-full accent-primary-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
        />
      </div>

      <!-- 2. Contraste / Luminosidad (mínimo 0%) -->
      <div>
        <div class="flex justify-between items-center text-[10px] font-bold uppercase text-text-main mb-1">
          <span>Contraste & Luminosidad</span>
          <span class="font-mono font-bold text-primary-600">
            {{ effectiveContrast }}%
            <span v-if="effectiveContrast === 100" class="text-[9px] text-text-subtle font-normal">(Normal)</span>
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="250"
          step="5"
          :value="effectiveContrast"
          @input="onContrastInput"
          class="w-full accent-primary-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';

const studio = useCanvasStudio();

const effectiveBlur = computed(() => {
  const b = studio?.activeElement.value?.filterBlur;
  return (b !== undefined && !isNaN(Number(b))) ? Number(b) : 0;
});

const effectiveContrast = computed(() => {
  const c = studio?.activeElement.value?.filterContrast;
  return (c !== undefined && !isNaN(Number(c))) ? Number(c) : 100;
});

const onBlurInput = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value);
  studio?.change('filter', {
    blur: !isNaN(val) ? val : 0,
    contrast: effectiveContrast.value
  });
};

const onContrastInput = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value);
  studio?.change('filter', {
    blur: effectiveBlur.value,
    contrast: !isNaN(val) ? val : 100
  });
};

const resetFilters = () => {
  studio?.change('filter', {
    blur: 0,
    contrast: 100
  });
};
</script>
