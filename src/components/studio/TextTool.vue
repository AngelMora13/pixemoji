<template>
  <div class="space-y-4">
    <div>
      <label class="block text-xs font-bold uppercase tracking-wider text-text-main mb-1.5">
        Contenido del Texto
      </label>
      <textarea
        v-model="textContent"
        rows="2"
        placeholder="Ej: CUANDO TU CÓDIGO FUNCIONA A LA PRIMERA"
        class="w-full p-3 bg-white border border-app-border-strong rounded-xl text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none shadow-2xs"
      ></textarea>
      <div class="flex justify-end mt-1">
        <button
          type="button"
          @click="textContent = textContent.toUpperCase()"
          class="text-[10px] font-bold text-primary-600 uppercase tracking-wider hover:underline cursor-pointer"
        >
          ⚡ Convertir a Mayúsculas (Estilo Meme)
        </button>
      </div>
    </div>

    <!-- Font Family Selector -->
    <div>
      <label class="block text-xs font-bold uppercase tracking-wider text-text-main mb-1.5">
        Tipografía
      </label>
      <select
        v-model="fontFamily"
        class="w-full h-10 px-3 bg-white border border-app-border-strong rounded-xl text-sm font-semibold text-text-main focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer shadow-2xs"
      >
        <option value="Impact">Impact (Clásico Meme)</option>
        <option value="Anton">Anton (Ultra Bold)</option>
        <option value="Montserrat">Montserrat (Moderno)</option>
        <option value="Outfit">Outfit (PixEmoji)</option>
        <option value="Caveat">Caveat (Manuscrito / Cómico)</option>
        <option value="Arial">Arial (Neutro)</option>
      </select>
    </div>

    <!-- Text Color & Stroke Color -->
    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-text-main mb-1">
          Color Relleno
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model="textColor"
            type="color"
            class="w-9 h-9 p-0.5 rounded-lg border border-app-border-strong cursor-pointer bg-white"
          />
          <span class="text-xs font-mono font-medium text-text-main">{{ textColor }}</span>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-text-main mb-1">
          Color Borde (Stroke)
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model="strokeColor"
            type="color"
            class="w-9 h-9 p-0.5 rounded-lg border border-app-border-strong cursor-pointer bg-white"
          />
          <span class="text-xs font-mono font-medium text-text-main">{{ strokeColor }}</span>
        </div>
      </div>
    </div>

    <!-- Stroke width slider -->
    <div>
      <div class="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-text-main mb-1">
        <span>Grosor de Borde Meme</span>
        <span class="text-primary-600 font-mono">{{ strokeWidth }}px</span>
      </div>
      <input
        v-model.number="strokeWidth"
        type="range"
        min="0"
        max="8"
        step="1"
        class="w-full accent-primary-600 cursor-pointer h-2 bg-stone-200 rounded-lg appearance-none"
      />
    </div>

    <button
      type="button"
      @click="handleAdd"
      class="w-full py-2.5 px-4 rounded-xl bg-primary-gradient hover:opacity-95 text-white font-bold text-xs shadow-md shadow-primary-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
    >
      <span>➕</span>
      <span>Añadir Texto al Lienzo</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TextNodeOptions } from '../../composables/useKonvaLayers';

const emit = defineEmits<{
  (e: 'addText', options: TextNodeOptions): void;
}>();

const textContent = ref('TEXTO DE MEME');
const fontFamily = ref('Impact');
const textColor = ref('#ffffff');
const strokeColor = ref('#000000');
const strokeWidth = ref(4);

const handleAdd = () => {
  if (!textContent.value.trim()) return;
  emit('addText', {
    text: textContent.value,
    fontFamily: fontFamily.value,
    fontSize: 48,
    textColor: textColor.value,
    strokeColor: strokeColor.value,
    strokeWidth: strokeWidth.value
  });
};
</script>
