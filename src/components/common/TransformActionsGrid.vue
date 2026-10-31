<template>
  <div class="flex items-center justify-between gap-1.5 pt-0.5 select-none" data-purpose="quick-orientation-buttons">
    <!-- Reflejar -->
    <button
      type="button"
      @click="triggerAction('flipH')"
      class="flex-1 py-2 px-2 bg-control-bg hover:bg-control-bg-hover border border-control-border rounded-xl text-xs font-bold text-text-main flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs cursor-pointer"
      title="Reflejar horizontalmente"
    >
      <svg class="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
      </svg>
      <span>Reflejar</span>
    </button>

    <!-- Girar 90° -->
    <button
      type="button"
      @click="triggerAction('rotate', 90)"
      class="flex-1 py-2 px-2 bg-control-bg hover:bg-control-bg-hover border border-control-border rounded-xl text-xs font-bold text-text-main flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs cursor-pointer"
      title="Girar 90 grados"
    >
      <svg class="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        ></path>
      </svg>
      <span>Girar 90°</span>
    </button>

    <!-- Limpiar -->
    <button
      type="button"
      @click="triggerAction('resetOrientation')"
      class="flex-1 py-2 px-2 bg-control-bg hover:bg-control-bg-hover border border-control-border rounded-xl text-xs font-bold text-text-main flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs cursor-pointer"
      title="Restablecer a 0° y sin reflejo"
    >
      <svg class="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6" />
      </svg>
      <span>Limpiar</span>
    </button>
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
