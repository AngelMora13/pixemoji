<template>
  <aside
    class="w-full h-full flex flex-col bg-white border-l border-app-border overflow-hidden select-none"
    data-purpose="right-inspector-panel"
  >
    <!-- Header with Element Type Badge & Action Buttons -->
    <div class="px-4 sm:px-5 py-3 border-b border-app-border bg-app-header/70 flex items-center justify-between shrink-0">
      <div v-if="activeElement" class="flex items-center gap-2 min-w-0">
        <!-- Candado en la posición 1 justo antes del tipo de elemento -->
        <button
          type="button"
          @click="handleToggleLock"
          :class="[
            'p-1.5 rounded-lg transition-colors cursor-pointer text-xs shrink-0',
            activeElement.isLocked
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'text-text-muted hover:text-text-main hover:bg-stone-100'
          ]"
          :title="activeElement.isLocked ? 'Desbloquear capa' : 'Fijar / Bloquear capa'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            ></path>
          </svg>
        </button>

        <span
          class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-primary-100 text-primary-800 border border-primary-200 shrink-0"
        >
          {{ activeElement.type }}
        </span>
        <span class="text-xs font-bold text-text-main truncate max-w-[130px]" :title="activeElement.label">
          {{ activeElement.label }}
        </span>
      </div>
      <div v-else class="flex items-center gap-2">
        <span class="text-sm">⚙️</span>
        <span class="text-xs font-bold text-text-main uppercase tracking-wider">
          Propiedades
        </span>
      </div>

      <!-- Quick Action Icons -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Close/Collapse Panel Button (Desktop & Mobile) -->
        <button
          type="button"
          @click="$emit('closePanel')"
          class="p-1.5 rounded-lg text-text-subtle hover:text-text-main hover:bg-stone-100 transition-colors cursor-pointer text-xs"
          title="Ocultar panel"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Inspector Scrollable Controls Area -->
    <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
      <!-- CASO A: TEXTO -->
      <TextInspector v-if="activeElement && activeElement.type === 'Texto'" />

      <!-- CASO B: EMOJI -->
      <EmojiInspector v-else-if="activeElement && activeElement.type === 'Emoji'" />

      <!-- CASO C: IMAGEN / OBJETO -->
      <ImageInspector v-else-if="activeElement && (activeElement.type === 'Imagen' || activeElement.type === 'Objeto')" />

      <!-- CASO D: SIN ELEMENTO SELECCIONADO (ESTADO VACÍO) -->
      <div v-else class="flex flex-col items-center justify-center text-center p-6 space-y-4 rounded-3xl bg-app-header/50 border border-app-border border-dashed">
        <div class="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-3xl shadow-sm border border-primary-200">
          🎨
        </div>
        <div>
          <h3 class="text-sm font-bold text-text-main">
            Inspector de Propiedades
          </h3>
          <p class="text-xs text-text-muted mt-1 leading-relaxed max-w-[240px]">
            Toca o haz clic en cualquier texto, emoji o imagen en el lienzo para editar su tipografía, efectos, colores y posición.
          </p>
        </div>

        <!-- Botones de inserción rápida -->
        <div class="w-full pt-2 space-y-2">
          <span class="block text-[10px] font-bold text-text-subtle uppercase tracking-wider text-left">
            Añadir rápido al lienzo:
          </span>
          <div class="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              @click="$emit('quickAdd', 'text')"
              class="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl bg-white hover:bg-primary-50 border border-app-border-strong text-text-main font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <span class="text-base">💬</span>
              <span class="text-[11px]">Texto</span>
            </button>
            <button
              type="button"
              @click="$emit('quickAdd', 'emoji')"
              class="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl bg-white hover:bg-primary-50 border border-app-border-strong text-text-main font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <span class="text-base">🧁</span>
              <span class="text-[11px]">Emoji</span>
            </button>
            <button
              type="button"
              @click="$emit('quickAdd', 'image')"
              class="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl bg-white hover:bg-primary-50 border border-app-border-strong text-text-main font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <span class="text-base">🖼️</span>
              <span class="text-[11px]">Imagen</span>
            </button>
          </div>
        </div>

        <!-- Shortcuts Hint Card -->
        <div class="w-full text-left p-3 rounded-2xl bg-white/80 border border-app-border text-[11px] space-y-1.5 text-text-muted">
          <span class="font-bold text-text-main flex items-center gap-1">
            <span>⌨️</span> Atajos de teclado:
          </span>
          <div class="flex items-center justify-between">
            <span>Borrar elemento</span>
            <kbd class="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-300 font-mono text-[10px] text-text-main">Supr</kbd>
          </div>
          <div class="flex items-center justify-between">
            <span>Deshacer</span>
            <kbd class="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-300 font-mono text-[10px] text-text-main">Ctrl + Z</kbd>
          </div>
          <div class="flex items-center justify-between">
            <span>Rehacer</span>
            <kbd class="px-1.5 py-0.5 rounded bg-stone-100 border border-stone-300 font-mono text-[10px] text-text-main">Ctrl + Y</kbd>
          </div>
        </div>
      </div>
    </div>

    <!-- Inspector Footer / Reset Section -->
    <div
      v-if="activeElement"
      class="p-3.5 border-t border-app-border bg-app-header/70 flex items-center justify-between shrink-0"
    >
      <button
        type="button"
        @click="resetEffects"
        class="text-xs font-semibold text-text-subtle hover:text-text-main transition-colors cursor-pointer"
      >
        Restablecer efectos
      </button>
      <button
        type="button"
        @click="handleDeselect"
        class="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
      >
        Listo
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';
import TextInspector from './TextInspector.vue';
import EmojiInspector from './EmojiInspector.vue';
import ImageInspector from './ImageInspector.vue';

const studio = useCanvasStudio();

defineEmits<{
  (e: 'closePanel'): void;
  (e: 'quickAdd', type: 'text' | 'emoji' | 'image'): void;
}>();

const activeElement = computed(() => studio?.activeElement.value ?? null);

const handleDeselect = () => {
  studio?.selectNode(null);
};

const handleToggleLock = () => {
  studio?.change('toggleLock');
};

const resetEffects = () => {
  if (activeElement.value?.type === 'Texto') {
    studio?.change('textPreset', 'clean');
  } else {
    studio?.change('imagePreset', 'clean');
  }
};
</script>
