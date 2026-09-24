<template>
  <div class="space-y-4">
    <div>
      <label class="block text-xs font-bold uppercase tracking-wider text-[#523e32] mb-1.5">
        Contenido del Texto
      </label>
      <textarea
        v-model="textContent"
        rows="2"
        placeholder="Ej: CUANDO TU CÓDIGO FUNCIONA A LA PRIMERA"
        class="w-full p-3 bg-white border border-[#debfa8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97736] resize-none"
      ></textarea>
      <div class="flex justify-end mt-1">
        <button
          type="button"
          @click="textContent = textContent.toUpperCase()"
          class="text-[10px] font-bold text-[#d97736] uppercase tracking-wider hover:underline cursor-pointer"
        >
          ⚡ Convertir a Mayúsculas (Estilo Meme)
        </button>
      </div>
    </div>

    <!-- Font Family Selector -->
    <div>
      <label class="block text-xs font-bold uppercase tracking-wider text-[#523e32] mb-1.5">
        Tipografía
      </label>
      <select
        v-model="fontFamily"
        class="w-full h-10 px-3 bg-white border border-[#debfa8] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#d97736] cursor-pointer"
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
        <label class="block text-xs font-bold uppercase tracking-wider text-[#523e32] mb-1">
          Color Relleno
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model="textColor"
            type="color"
            class="w-9 h-9 p-0.5 rounded-lg border border-[#debfa8] cursor-pointer bg-white"
          />
          <span class="text-xs font-mono font-medium">{{ textColor }}</span>
        </div>
      </div>

      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-[#523e32] mb-1">
          Color Borde (Stroke)
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model="strokeColor"
            type="color"
            class="w-9 h-9 p-0.5 rounded-lg border border-[#debfa8] cursor-pointer bg-white"
          />
          <span class="text-xs font-mono font-medium">{{ strokeColor }}</span>
        </div>
      </div>
    </div>

    <!-- Stroke width slider -->
    <div>
      <div class="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#523e32] mb-1">
        <span>Grosor de Borde Meme</span>
        <span class="text-[#d97736] font-mono">{{ strokeWidth }}px</span>
      </div>
      <input
        v-model.number="strokeWidth"
        type="range"
        min="0"
        max="8"
        step="1"
        class="w-full accent-[#d97736] cursor-pointer h-2 bg-stone-200 rounded-lg appearance-none"
      />
    </div>

    <!-- Font Size Slider -->
    <div>
      <div class="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#523e32] mb-1">
        <span>Tamaño de Fuente</span>
        <span class="text-[#d97736] font-mono">{{ fontSize }}px</span>
      </div>
      <input
        v-model.number="fontSize"
        type="range"
        min="16"
        max="96"
        step="2"
        class="w-full accent-[#d97736] cursor-pointer h-2 bg-stone-200 rounded-lg appearance-none"
      />
    </div>

    <button
      type="button"
      @click="handleAdd"
      class="w-full py-2.5 px-4 rounded-xl bg-[#d97736] hover:bg-[#c46527] text-white font-bold text-xs shadow-md shadow-[#d97736]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
const strokeWidth = ref(3);
const fontSize = ref(44);

const handleAdd = () => {
  if (!textContent.value.trim()) return;
  emit('addText', {
    text: textContent.value,
    fontFamily: fontFamily.value,
    fontSize: fontSize.value,
    textColor: textColor.value,
    strokeColor: strokeColor.value,
    strokeWidth: strokeWidth.value
  });
};
</script>
