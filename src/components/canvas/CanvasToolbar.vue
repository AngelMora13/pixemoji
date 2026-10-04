<template>
  <!-- Floating Contextual Bar for Active Selected Element (matching demo.html lines 377-418) -->
  <div
    v-if="selectedInfo"
    class="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/95 text-white rounded-full shadow-2xl text-xs backdrop-blur-md border border-neutral-700/80 animate-fade-in select-none"
    data-purpose="floating-context-bar"
  >
    <!-- Element Type Badge -->
    <span class="font-extrabold text-[10px] text-primary-400 uppercase tracking-wider pl-1">
      {{ selectedInfo.type }}
    </span>

    <span class="text-neutral-400 text-xs font-semibold max-w-[120px] truncate hidden md:inline">
      {{ selectedInfo.label }}
    </span>

    <div class="h-3 w-px bg-neutral-700 mx-0.5"></div>

    <!-- Duplicate Button -->
    <button
      type="button"
      @click="trigger('duplicate')"
      class="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-300 hover:text-white cursor-pointer"
      title="Duplicar elemento"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect height="13" rx="2" stroke-width="2" width="13" x="9" y="9"></rect>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke-width="2"></path>
      </svg>
    </button>

    <!-- Lock/Unlock Button -->
    <button
      type="button"
      @click="trigger('toggleLock')"
      :class="[
        'p-1 rounded transition-colors cursor-pointer',
        selectedInfo.isLocked ? 'text-amber-400 bg-amber-900/40' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
      ]"
      :title="selectedInfo.isLocked ? 'Desbloquear posición' : 'Bloquear posición'"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        ></path>
      </svg>
    </button>

    <!-- Bring to Front / Move Up -->
    <button
      type="button"
      @click="trigger('bringToFront')"
      class="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-300 hover:text-white cursor-pointer"
      title="Traer al frente"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M5 10l7-7m0 0l7 7m-7-7v18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
      </svg>
    </button>

    <!-- Open Properties Inspector -->
    <button
      type="button"
      @click="$emit('openInspector')"
      class="p-1 hover:bg-neutral-800 rounded transition-colors text-primary-400 hover:text-primary-300 cursor-pointer flex items-center gap-1"
      title="Abrir inspector de propiedades"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
      <span class="text-[10px] font-bold hidden sm:inline">Ajustes</span>
    </button>

    <div class="h-3 w-px bg-neutral-700 mx-0.5"></div>

    <!-- Delete Button -->
    <button
      type="button"
      @click="trigger('delete')"
      class="p-1 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors cursor-pointer"
      title="Eliminar elemento (Supr)"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        ></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCanvasStudio, type StudioAction } from '../../composables/useCanvasStudioContext';

const studio = useCanvasStudio();

defineEmits<{
  (e: 'openInspector'): void;
}>();

const selectedInfo = computed(() => {
  const el = studio?.activeElement.value;
  if (!el) return null;
  return {
    type: el.type,
    label: el.label,
    isLocked: el.isLocked
  };
});

const trigger = (action: StudioAction, payload?: any) => {
  studio?.change(action, payload);
};
</script>
