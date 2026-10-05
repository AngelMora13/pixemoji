<template>
  <section
    class="flex-1 bg-app-canvas flex flex-col relative overflow-hidden bg-grid-pattern min-w-0 h-full"
    data-purpose="canvas-viewport"
  >
    <!-- Floating Info Badge: Canvas Resolution & Ratio -->
    <div class="absolute top-4 left-4 lg:left-6 z-10 flex items-center gap-2 pointer-events-none">
      <div class="px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl border border-app-border shadow-xs text-xs font-semibold text-text-main flex items-center gap-2 select-none">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Lienzo: <strong>{{ width }} &times; {{ height }} px</strong> ({{ ratioLabel }})</span>
      </div>
    </div>

    <!-- Floating Undo / Redo History Controls -->
    <div class="absolute top-4 right-4 lg:right-6 z-10 flex items-center gap-1.5 select-none">
      <div class="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl border border-app-border-strong shadow-xs">
        <button
          type="button"
          @click="$emit('undo')"
          :disabled="!canUndo"
          class="p-1.5 rounded-lg hover:bg-stone-100 text-text-muted hover:text-text-main disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
          title="Deshacer (Ctrl + Z)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 10h10a5 5 0 015 5v2m0 0l-4-4m4 4l4-4M3 10l4-4m-4 4l4 4"></path>
          </svg>
        </button>
        <button
          type="button"
          @click="$emit('redo')"
          :disabled="!canRedo"
          class="p-1.5 rounded-lg hover:bg-stone-100 text-text-muted hover:text-text-main disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
          title="Rehacer (Ctrl + Y)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 10H11a5 5 0 00-5 5v2m0 0l4-4m-4 4l-4-4m21-6l-4-4m4 4l-4 4"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Contextual Quick-Action Floating Bar -->
    <CanvasToolbar @open-inspector="$emit('open-inspector')" />

    <!-- Main Working Stage (Konva Canvas) -->
    <div class="flex-1 w-full h-full flex items-center justify-center overflow-auto p-4 sm:p-8">
      <div
        :style="{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease'
        }"
      >
        <KonvaStage
          container-id="konva-meme-stage"
          :width="width"
          :height="height"
          :is-transparent="isTransparent"
          :bg-color="bgColor"
        />
      </div>
    </div>

    <!-- Floating Bottom Zoom & Templates Bar Component -->
    <CanvasBottomBar
      :zoom-level="zoomLevel"
      :templates="templates"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @reset-zoom="resetZoom"
      @select-template="$emit('select-template', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import KonvaStage from './KonvaStage.vue';
import CanvasToolbar from './CanvasToolbar.vue';
import CanvasBottomBar from '../studio/CanvasBottomBar.vue';

defineProps<{
  width: number;
  height: number;
  ratioLabel: string;
  isTransparent: boolean;
  bgColor: string;
  canUndo: boolean;
  canRedo: boolean;
  templates: any[];
}>();

defineEmits<{
  (e: 'undo'): void;
  (e: 'redo'): void;
  (e: 'open-inspector'): void;
  (e: 'select-template', templateId: string): void;
}>();

// Zoom Level state
const zoomLevel = ref(1.0);
const zoomIn = () => {
  zoomLevel.value = Math.min(2.5, Math.round((zoomLevel.value + 0.1) * 10) / 10);
};
const zoomOut = () => {
  zoomLevel.value = Math.max(0.4, Math.round((zoomLevel.value - 0.1) * 10) / 10);
};
const resetZoom = () => {
  zoomLevel.value = 1.0;
};
</script>
