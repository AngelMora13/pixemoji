<template>
  <!-- Floating Contextual Bar for Active Selected Element -->
  <div v-if="selectedInfo">
    <div
      class="absolute top-16 sm:top-[68px] left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 sm:gap-1.5 px-3.5 py-1.5 bg-neutral-900/95 text-white rounded-full shadow-2xl text-xs backdrop-blur-md border border-neutral-700/80 animate-fade-in select-none"
      data-purpose="floating-context-bar"
    >
      <!-- Element Type Badge -->
      <span class="font-extrabold text-[11px] text-primary-400 uppercase tracking-wider pl-1">
        {{ selectedInfo.type }}
      </span>

      <span class="text-neutral-400 text-xs font-semibold max-w-[120px] truncate hidden md:inline">
        {{ selectedInfo.label }}
      </span>

      <div class="h-3.5 w-px bg-neutral-700 mx-1"></div>

      <!-- Duplicate Button -->
      <button
        type="button"
        @click="trigger('duplicate')"
        class="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-300 hover:text-white cursor-pointer"
        title="Duplicar elemento"
      >
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect height="13" rx="2" stroke-width="2" width="13" x="9" y="9"></rect>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke-width="2"></path>
        </svg>
      </button>

      <!-- Lock/Unlock Button -->
      <button
        type="button"
        @click="trigger('toggleLock')"
        :class="[
          'p-1.5 rounded-lg transition-colors cursor-pointer',
          selectedInfo.isLocked ? 'text-amber-400 bg-amber-900/40' : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
        ]"
        :title="selectedInfo.isLocked ? 'Desbloquear posición' : 'Bloquear posición'"
      >
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        class="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-300 hover:text-white cursor-pointer"
        title="Traer al frente"
      >
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M5 10l7-7m0 0l7 7m-7-7v18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
        </svg>
      </button>

      <!-- Crop Button for Image & Emoji -->
      <button
        v-if="selectedInfo.type === 'Imagen' || selectedInfo.type === 'Emoji'"
        type="button"
        @click="isCropModalOpen = true"
        class="p-1.5 hover:bg-neutral-800 rounded-lg transition-colors text-amber-400 hover:text-amber-300 cursor-pointer flex items-center gap-1"
        title="Recortar dimensiones (Crop)"
      >
        <span class="text-sm leading-none">✂️</span>
        <span class="text-[11px] font-bold hidden sm:inline">Recortar</span>
      </button>

      <div class="h-3.5 w-px bg-neutral-700 mx-1"></div>

      <!-- Delete Button -->
      <button
        type="button"
        @click="trigger('delete')"
        class="p-1.5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
        title="Eliminar elemento (Supr)"
      >
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          ></path>
        </svg>
      </button>
    </div>

    <!-- Reusable Crop Modal Triggered from Floating Bar -->
    <CropModal
      :is-open="isCropModalOpen"
      :type="selectedInfo?.type === 'Emoji' ? 'emoji' : 'image'"
      :image-src="imageSrc"
      :emoji-char="selectedEmojiChar"
      :initial-crop="currentCrop"
      :content-width="contentDimensions.width"
      :content-height="contentDimensions.height"
      @apply="onApplyCrop"
      @close="isCropModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCanvasStudio, type StudioAction } from '../../composables/useCanvasStudioContext';
import type { CropInset } from '../../composables/useKonvaCrop';
import CropModal from '../common/CropModal.vue';

const studio = useCanvasStudio();

const isCropModalOpen = ref(false);

const selectedInfo = computed(() => {
  const el = studio?.activeElement.value;
  if (!el) return null;
  return {
    type: el.type,
    label: el.label,
    isLocked: el.isLocked
  };
});

const currentCrop = computed<CropInset>(() => {
  return studio?.activeElement.value?.cropInset || { top: 0, right: 0, bottom: 0, left: 0 };
});

const selectedEmojiChar = computed(() => {
  return studio?.activeElement.value?.text || '✨';
});

const imageSrc = computed(() => {
  const node = studio?.activeElement.value?.raw;
  if (!node) return '';
  const src = node.getAttr?.('src');
  if (src) return src;
  const imgObj = node.image && typeof node.image === 'function' ? node.image() : null;
  return imgObj?.src || '';
});

const contentDimensions = computed(() => {
  const node = studio?.activeElement.value?.raw;
  if (!node) return { width: 300, height: 300 };
  const w = typeof node.width === 'function' ? node.width() : 300;
  const h = typeof node.height === 'function' ? node.height() : 300;
  return { width: Math.max(1, w), height: Math.max(1, h) };
});

const trigger = (action: StudioAction, payload?: any) => {
  studio?.change(action, payload);
};

const onApplyCrop = (crop: CropInset) => {
  if (!studio) return;
  studio.change('crop', crop);
  studio.history.saveState(true);
};
</script>
