<template>
  <div class="space-y-2.5" data-purpose="transform-actions-grid">
    <span v-if="showTitle" class="block text-xs font-bold text-text-main uppercase tracking-wider text-[11px]">
      {{ title }}
    </span>
    <div class="grid grid-cols-4 gap-1.5">
      <button
        type="button"
        @click="triggerAction('flipH')"
        class="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white border border-app-border hover:bg-primary-50 hover:border-primary-400 text-text-main text-[11px] font-semibold cursor-pointer shadow-2xs transition-colors"
        title="Reflejar Horizontalmente"
      >
        <span class="text-sm select-none">↔️</span>
        <span>Reflejar</span>
      </button>

      <button
        type="button"
        @click="triggerAction('flipV')"
        class="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white border border-app-border hover:bg-primary-50 hover:border-primary-400 text-text-main text-[11px] font-semibold cursor-pointer shadow-2xs transition-colors"
        title="Invertir Verticalmente"
      >
        <span class="text-sm select-none">↕️</span>
        <span>Invertir</span>
      </button>

      <button
        type="button"
        @click="triggerAction('center')"
        class="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white border border-app-border hover:bg-primary-50 hover:border-primary-400 text-text-main text-[11px] font-semibold cursor-pointer shadow-2xs transition-colors"
        title="Centrar en el lienzo"
      >
        <span class="text-sm select-none">🎯</span>
        <span>Centrar</span>
      </button>

      <button
        type="button"
        @click="triggerAction('rotate', 90)"
        class="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white border border-app-border hover:bg-primary-50 hover:border-primary-400 text-text-main text-[11px] font-semibold cursor-pointer shadow-2xs transition-colors"
        title="Girar 90 grados"
      >
        <span class="text-sm select-none">🔄</span>
        <span>Rotar 90°</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCanvasStudio, type StudioAction } from '../../composables/useCanvasStudioContext';

const props = withDefaults(
  defineProps<{
    title?: string;
    showTitle?: boolean;
  }>(),
  {
    title: 'Orientación & Posición:',
    showTitle: true
  }
);

const emit = defineEmits<{
  (e: 'action', action: StudioAction, payload?: any): void;
}>();

const studio = useCanvasStudio();

const triggerAction = (action: StudioAction, payload?: any) => {
  studio?.change(action, payload);
  emit('action', action, payload);
};
</script>
