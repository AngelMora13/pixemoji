<template>
  <div
    class="absolute bottom-16 lg:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full border border-app-border-strong shadow-lg text-xs font-medium text-text-main select-none"
    data-purpose="canvas-bottom-bar"
  >
    <!-- Zoom Out -->
    <button
      type="button"
      @click="$emit('zoomOut')"
      class="w-6 h-6 rounded-full hover:bg-stone-100 flex items-center justify-center font-bold text-base text-text-muted hover:text-text-main transition-colors cursor-pointer"
      title="Alejar zoom"
    >
      -
    </button>

    <!-- Zoom Label -->
    <span class="px-2 font-mono font-semibold text-[11px] text-primary-600">
      {{ Math.round(zoomLevel * 100) }}%
    </span>

    <!-- Zoom In -->
    <button
      type="button"
      @click="$emit('zoomIn')"
      class="w-6 h-6 rounded-full hover:bg-stone-100 flex items-center justify-center font-bold text-base text-text-muted hover:text-text-main transition-colors cursor-pointer"
      title="Acercar zoom"
    >
      +
    </button>

    <div class="h-4 w-px bg-stone-200 mx-1"></div>

    <!-- Reset Zoom -->
    <button
      type="button"
      @click="$emit('resetZoom')"
      class="px-2 py-0.5 rounded-md hover:bg-stone-100 text-[11px] font-semibold text-text-muted hover:text-text-main transition-colors cursor-pointer"
      title="Restablecer tamaño original (100%)"
    >
      Ajustar
    </button>

    <div class="h-4 w-px bg-stone-200 mx-1"></div>

    <!-- Botón Plantillas con Popover Flotante -->
    <div class="relative" ref="templatesPopoverRef">
      <button
        type="button"
        @click="isTemplatesPopoverOpen = !isTemplatesPopoverOpen"
        :class="[
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer select-none',
          isTemplatesPopoverOpen
            ? 'bg-primary-600 text-white shadow-2xs'
            : 'text-text-muted hover:text-text-main hover:bg-stone-100'
        ]"
        title="Explorar plantillas de memes y stickers"
      >
        <span>📋</span>
        <span>Plantillas</span>
        <svg
          class="w-3 h-3 transition-transform duration-200"
          :class="{ 'rotate-180': isTemplatesPopoverOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Mini Popover Flotante hacia arriba con las opciones de plantillas -->
      <div
        v-if="isTemplatesPopoverOpen"
        class="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] max-h-[72vh] overflow-y-auto p-4 bg-white/98 backdrop-blur-xl rounded-3xl border border-app-border-strong shadow-2xl z-40 animate-fade-in"
      >
        <div class="flex items-center justify-between pb-2 mb-3 border-b border-app-border">
          <div class="flex items-center gap-2">
            <span class="text-base">📋</span>
            <span class="text-xs font-black uppercase tracking-wider text-text-main">
              Plantillas Rápidas
            </span>
          </div>
          <button
            type="button"
            @click="isTemplatesPopoverOpen = false"
            class="w-6 h-6 rounded-full hover:bg-stone-100 text-text-muted hover:text-text-main flex items-center justify-center text-xs font-bold cursor-pointer"
            title="Cerrar ventana de plantillas"
          >
            ✕
          </button>
        </div>

        <!-- Selector de Plantillas -->
        <TemplatesTool
          :templates="templates"
          @select-template="$emit('selectTemplate', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { StudioTemplate } from '../../composables/useKonvaTemplates';
import TemplatesTool from './TemplatesTool.vue';

defineProps<{
  zoomLevel: number;
  templates: StudioTemplate[];
}>();

defineEmits<{
  (e: 'zoomIn'): void;
  (e: 'zoomOut'): void;
  (e: 'resetZoom'): void;
  (e: 'selectTemplate', templateId: string): void;
}>();

const isTemplatesPopoverOpen = ref(false);
const templatesPopoverRef = ref<HTMLElement | null>(null);

const handleDocumentClick = (e: MouseEvent) => {
  if (
    isTemplatesPopoverOpen.value &&
    templatesPopoverRef.value &&
    !templatesPopoverRef.value.contains(e.target as Node)
  ) {
    isTemplatesPopoverOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleDocumentClick);
  }
});
</script>
