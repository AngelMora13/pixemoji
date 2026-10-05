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
      <SliderControl
        label="Desenfoque (Blur)"
        :model-value="effectiveBlur"
        :min="0"
        :max="30"
        :step="0.5"
        unit="px"
        @update:model-value="onBlurChange"
      />

      <!-- 2. Contraste / Luminosidad -->
      <SliderControl
        label="Contraste & Luminosidad"
        :model-value="effectiveContrast"
        :min="0"
        :max="250"
        :step="5"
        unit="%"
        :hint="effectiveContrast === 100 ? '(Normal)' : ''"
        @update:model-value="onContrastChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';
import SliderControl from '../common/SliderControl.vue';

const studio = useCanvasStudio();

const effectiveBlur = computed(() => {
  const b = studio?.activeElement.value?.filterBlur;
  return (b !== undefined && !isNaN(Number(b))) ? Number(b) : 0;
});

const effectiveContrast = computed(() => {
  const c = studio?.activeElement.value?.filterContrast;
  return (c !== undefined && !isNaN(Number(c))) ? Number(c) : 100;
});

const onBlurChange = (val: number) => {
  studio?.change('filter', {
    blur: !isNaN(val) ? val : 0,
    contrast: effectiveContrast.value
  });
};

const onContrastChange = (val: number) => {
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
