<template>
  <div class="space-y-4" data-purpose="image-inspector-wrapper">
    <!-- 1. Cambiar Imagen (Subir archivo o URL + Botón Cargar en ambos) -->
    <div class="p-3 bg-stone-50 border border-app-border rounded-2xl space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5">
          <span>🖼️</span>
          <span>Cambiar Imagen</span>
        </span>
        <span class="text-[10px] text-text-muted font-medium">Reemplazar capa</span>
      </div>

      <!-- Selector de Modo de Carga: Archivo o URL -->
      <div class="flex p-1 bg-stone-200/70 rounded-xl gap-1">
        <button
          type="button"
          @click="uploadMode = 'file'"
          :class="[
            'flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer text-center',
            uploadMode === 'file' ? 'bg-white text-primary-600 shadow-2xs' : 'text-text-muted hover:text-text-main'
          ]"
        >
          📁 Subir Archivo
        </button>
        <button
          type="button"
          @click="uploadMode = 'url'"
          :class="[
            'flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer text-center',
            uploadMode === 'url' ? 'bg-white text-primary-600 shadow-2xs' : 'text-text-muted hover:text-text-main'
          ]"
        >
          🔗 Por Enlace URL
        </button>
      </div>

      <!-- MODO 1: SUBIR ARCHIVO LOCAL -->
      <div v-if="uploadMode === 'file'" class="space-y-2">
        <label class="border-2 border-dashed border-app-border-strong hover:border-primary-500 rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer bg-white transition-all text-center group">
          <svg class="w-6 h-6 text-primary-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-xs font-semibold text-text-main truncate max-w-[200px]">
            {{ selectedFileName || 'Elegir nueva foto' }}
          </span>
          <span class="text-[10px] text-text-subtle">PNG, JPG, WEBP, SVG</span>
          <input type="file" accept="image/*" @change="onFileSelected" class="hidden" />
        </label>

        <button
          type="button"
          @click="loadSelectedFile"
          :disabled="!pendingFileDataUrl"
          :class="[
            'w-full h-8.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer',
            pendingFileDataUrl
              ? 'bg-primary-gradient text-white hover:opacity-95 active:scale-98'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          ]"
        >
          <span>🚀</span>
          <span>Cargar Imagen</span>
        </button>
      </div>

      <!-- MODO 2: PEGAR URL -->
      <div v-else class="space-y-2">
        <input
          v-model="imageUrlInput"
          type="url"
          placeholder="https://ejemplo.com/foto.png"
          class="w-full h-9 px-3 bg-white border border-app-border-strong rounded-xl text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-2xs"
          @keydown.enter="loadImageFromUrl"
        />

        <button
          type="button"
          @click="loadImageFromUrl"
          :disabled="!imageUrlInput.trim()"
          :class="[
            'w-full h-8.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer',
            imageUrlInput.trim()
              ? 'bg-primary-gradient text-white hover:opacity-95 active:scale-98'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          ]"
        >
          <span>🚀</span>
          <span>Cargar</span>
        </button>
      </div>
    </div>

    <!-- 2. Efectos 1-Clic para Imagen -->
    <EffectPresetsGrid mode="object" />

    <hr class="border-app-border" />

    <!-- 3. Orientación & Posición -->
    <TransformActionsGrid />

    <hr class="border-app-border" />

    <!-- 4. Sombra 2D & Resplandor -->
    <div class="space-y-2.5">
      <span class="block text-xs font-bold text-text-main uppercase tracking-wider text-[11px]">
        Sombra & Dirección 2D:
      </span>
      <ShadowPad />
    </div>

    <!-- 5. Filtros: Desenfoque & Contraste -->
    <FilterControls />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';
import ShadowPad from './ShadowPad.vue';
import FilterControls from './FilterControls.vue';
import EffectPresetsGrid from '../common/EffectPresetsGrid.vue';
import TransformActionsGrid from '../common/TransformActionsGrid.vue';

const studio = useCanvasStudio();

const uploadMode = ref<'file' | 'url'>('file');
const selectedFileName = ref('');
const pendingFileDataUrl = ref('');
const imageUrlInput = ref('');

const onFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  selectedFileName.value = file.name;
  const reader = new FileReader();
  reader.onload = (loadEvt) => {
    const dataUrl = loadEvt.target?.result as string;
    if (dataUrl) {
      pendingFileDataUrl.value = dataUrl;
    }
  };
  reader.readAsDataURL(file);
};

const loadSelectedFile = () => {
  if (!pendingFileDataUrl.value) return;
  studio?.change('replaceImage', pendingFileDataUrl.value);
  selectedFileName.value = '';
  pendingFileDataUrl.value = '';
};

const loadImageFromUrl = () => {
  const url = imageUrlInput.value.trim();
  if (!url) return;
  studio?.change('replaceImage', url);
  imageUrlInput.value = '';
};
</script>
