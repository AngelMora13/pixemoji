<template>
  <section
    ref="viewportRef"
    class="flex-1 bg-app-canvas flex flex-col relative overflow-hidden bg-grid-pattern min-w-0 h-full select-none touch-none"
    :class="{
      'cursor-grab': (activeTool === 'hand' || isSpacePressed) && !isPanning,
      'cursor-grabbing': isPanning
    }"
    data-purpose="canvas-viewport"
    @pointerdown="onViewportPointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
    @wheel.prevent="onWheel"
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

    <!-- Main Working Stage (Konva Canvas Pan & Zoom) -->
    <div class="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center pointer-events-none">
      <div
        class="will-change-transform pointer-events-auto"
        :class="{ 'transition-transform duration-150 ease-out': !isPanning && !isTouchPinching }"
        :style="{
          transform: `translate3d(${panX}px, ${panY}px, 0px) scale(${zoomLevel})`,
          transformOrigin: 'center center'
        }"
      >
        <KonvaStage
          container-id="konva-meme-stage"
          :width="width"
          :height="height"
          :is-transparent="isTransparent"
          :bg-color="bgColor"
          :frame="frame"
        />
      </div>
    </div>

    <!-- Floating Bottom Zoom, Move Tool & Templates Bar Component -->
    <CanvasBottomBar
      :zoom-level="zoomLevel"
      :templates="templates"
      :active-tool="activeTool"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @reset-zoom="resetZoom"
      @toggle-tool="setTool($event)"
      @select-template="$emit('select-template', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import KonvaStage from './KonvaStage.vue';
import CanvasToolbar from './CanvasToolbar.vue';
import CanvasBottomBar from '../studio/CanvasBottomBar.vue';
import { useViewportPanZoom } from '../../composables/useViewportPanZoom';
import type { useCanvasFrame } from '../../composables/useCanvasFrame';

const props = defineProps<{
  width: number;
  height: number;
  ratioLabel: string;
  isTransparent: boolean;
  bgColor: string;
  canUndo: boolean;
  canRedo: boolean;
  templates: any[];
  frame?: ReturnType<typeof useCanvasFrame>;
}>();

defineEmits<{
  (e: 'undo'): void;
  (e: 'redo'): void;
  (e: 'open-inspector'): void;
  (e: 'select-template', templateId: string): void;
}>();

const viewportRef = ref<HTMLElement | null>(null);
const hasUserManuallyInteracted = ref(false);
let resizeObserver: ResizeObserver | null = null;

const {
  zoomLevel,
  panX,
  panY,
  isPanning,
  isTouchPinching,
  isSpacePressed,
  activeTool,
  fitToViewport,
  zoomIn,
  zoomOut,
  resetZoom,
  setTool,
  handleWheel,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd
} = useViewportPanZoom();

const triggerFit = () => {
  if (!viewportRef.value) return;
  const rect = viewportRef.value.getBoundingClientRect();
  fitToViewport(rect.width, rect.height, props.width, props.height);
};

// Pointer and Wheel Event Handlers
const onViewportPointerDown = (e: PointerEvent) => {
  const target = e.target as HTMLElement;
  if (target.closest('button, a, input, select, textarea, [data-purpose="canvas-bottom-bar"], [data-purpose="canvas-toolbar"]')) {
    return;
  }

  hasUserManuallyInteracted.value = true;
  const isStageContent = !!target.closest('#konva-meme-stage');
  const isBackground = !isStageContent || activeTool.value === 'hand';

  handlePointerDown(e, isBackground);
};

const onWheel = (e: WheelEvent) => {
  hasUserManuallyInteracted.value = true;
  handleWheel(e, viewportRef.value);
};

const onTouchStart = (e: TouchEvent) => {
  handleTouchStart(e);
};

const onTouchMove = (e: TouchEvent) => {
  handleTouchMove(e);
};

const onTouchEnd = (e: TouchEvent) => {
  handleTouchEnd(e);
};

// Watch resolution or screen changes
watch([() => props.width, () => props.height], () => {
  triggerFit();
});

onMounted(() => {
  // Ajuste inicial adaptativo según la pantalla del dispositivo
  triggerFit();

  if (typeof ResizeObserver !== 'undefined' && viewportRef.value) {
    resizeObserver = new ResizeObserver(() => {
      if (!hasUserManuallyInteracted.value) {
        triggerFit();
      }
    });
    resizeObserver.observe(viewportRef.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});
</script>
