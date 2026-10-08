<template>
  <div class="p-3 bg-stone-50 border border-app-border rounded-2xl space-y-3" data-purpose="filter-controls">
    <div class="flex items-center justify-between text-xs">
      <span class="font-bold text-text-main flex items-center gap-1.5">
        <span>✨</span>
        <span>Opacidad, Desenfoque & Filtros</span>
      </span>
      <button
        v-if="hasChanges"
        type="button"
        @click="resetFilters"
        class="text-[10px] font-bold text-primary-600 hover:underline cursor-pointer"
        title="Restablecer opacidad y filtros a valores iniciales"
      >
        Restablecer
      </button>
    </div>

    <div class="space-y-2.5 text-xs">
      <!-- 1. Opacidad -->
      <SliderControl
        label="Opacidad"
        :model-value="effectiveOpacity"
        :min="0"
        :max="100"
        :step="1"
        unit="%"
        :hint="effectiveOpacity === 100 ? '(100%)' : ''"
        @update:model-value="onOpacityChange"
      />

      <!-- 2. Desenfoque (Blur) -->
      <SliderControl
        label="Desenfoque (Blur)"
        :model-value="effectiveBlur"
        :min="0"
        :max="30"
        :step="0.5"
        unit="px"
        @update:model-value="onBlurChange"
      />

      <!-- 3. Contraste / Luminosidad -->
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

const effectiveOpacity = computed(() => {
  const op = studio?.activeElement.value?.opacity;
  const num = (op !== undefined && !isNaN(Number(op))) ? Number(op) : 1;
  return Math.round(num * 100);
});

const effectiveBlur = computed(() => {
  const b = studio?.activeElement.value?.filterBlur;
  return (b !== undefined && !isNaN(Number(b))) ? Number(b) : 0;
});

const effectiveContrast = computed(() => {
  const c = studio?.activeElement.value?.filterContrast;
  return (c !== undefined && !isNaN(Number(c))) ? Number(c) : 100;
});

const hasChanges = computed(() => {
  return effectiveOpacity.value !== 100 || effectiveBlur.value > 0 || effectiveContrast.value !== 100;
});

const onOpacityChange = (val: number) => {
  const norm = Math.max(0, Math.min(100, Number(val))) / 100;
  studio?.change('opacity', norm);
};

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
  studio?.change('opacity', 1);
  studio?.change('filter', {
    blur: 0,
    contrast: 100
  });
};
</script>
