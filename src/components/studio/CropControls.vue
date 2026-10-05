<template>
  <div class="space-y-2" data-purpose="crop-controls">
    <!-- Card de Trigger para Abrir el Modal de Recorte -->
    <div class="p-3 bg-white border border-app-border rounded-2xl flex items-center justify-between shadow-2xs group hover:border-primary-300 transition-colors">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform">
          ✂️
        </div>
        <div class="text-left">
          <span class="block text-xs font-bold text-text-main">Recortar Dimensiones</span>
          <span class="block text-[10px] text-text-muted">
            {{ isCropped ? `Recorte activo (${visiblePercent}% visible)` : 'Sin recortar (100% visible)' }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <!-- Botón rápido de reset si ya está recortado -->
        <button
          v-if="isCropped"
          type="button"
          @click="resetCrop"
          class="p-1.5 rounded-lg text-text-muted hover:text-primary-600 hover:bg-stone-100 text-xs transition-colors cursor-pointer"
          title="Restablecer recorte a 100%"
        >
          🔄
        </button>

        <!-- Botón principal de abrir editor interactivo -->
        <button
          type="button"
          @click="isModalOpen = true"
          class="px-3 py-1.5 bg-primary-gradient text-white font-bold text-xs rounded-xl shadow-2xs hover:opacity-95 cursor-pointer transition-all active:scale-95 flex items-center gap-1"
        >
          <span>✂️</span>
          <span>Recortar</span>
        </button>
      </div>
    </div>

    <!-- Modal Interactivo de Recorte Reutilizable -->
    <CropModal
      :is-open="isModalOpen"
      :type="targetType"
      :image-src="imageSrc"
      :emoji-char="emojiChar"
      :font-size="emojiFontSize"
      :initial-crop="currentCrop"
      :content-width="contentDimensions.width"
      :content-height="contentDimensions.height"
      @apply="onApplyCrop"
      @close="isModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';
import type { CropInset } from '../../composables/useKonvaCrop';
import CropModal from '../common/CropModal.vue';

const studio = useCanvasStudio();

const isModalOpen = ref(false);

const element = computed(() => studio?.activeElement.value);

const targetType = computed<'image' | 'emoji'>(() => {
  return element.value?.type === 'Emoji' ? 'emoji' : 'image';
});

const emojiChar = computed(() => {
  return element.value?.text || '✨';
});

const emojiFontSize = computed(() => {
  const node = element.value?.raw;
  if (!node) return 110;
  return typeof node.fontSize === 'function' ? node.fontSize() : (node.getAttr?.('fontSize') || 110);
});

const imageSrc = computed(() => {
  const node = element.value?.raw;
  if (!node) return '';
  const src = node.getAttr?.('src');
  if (src) return src;
  const imgObj = node.image && typeof node.image === 'function' ? node.image() : null;
  return imgObj?.src || '';
});

const contentDimensions = computed(() => {
  const node = element.value?.raw;
  if (!node) return { width: 300, height: 300 };
  const w = typeof node.width === 'function' ? node.width() : 300;
  const h = typeof node.height === 'function' ? node.height() : 300;
  return { width: Math.max(1, w), height: Math.max(1, h) };
});

const currentCrop = computed<CropInset>(() => {
  return element.value?.cropInset || { top: 0, right: 0, bottom: 0, left: 0 };
});

const isCropped = computed(() => {
  return (
    (currentCrop.value.top || 0) > 0 ||
    (currentCrop.value.bottom || 0) > 0 ||
    (currentCrop.value.left || 0) > 0 ||
    (currentCrop.value.right || 0) > 0
  );
});

const visiblePercent = computed(() => {
  const w = Math.max(0, 100 - (currentCrop.value.left || 0) - (currentCrop.value.right || 0));
  const h = Math.max(0, 100 - (currentCrop.value.top || 0) - (currentCrop.value.bottom || 0));
  return Math.round((w * h) / 100);
});

const onApplyCrop = (crop: CropInset) => {
  if (!studio) return;
  studio.change('crop', crop);
  studio.history.saveState(true);
};

const resetCrop = () => {
  onApplyCrop({ top: 0, right: 0, bottom: 0, left: 0 });
};

defineExpose({
  openModal: () => { isModalOpen.value = true; }
});
</script>
