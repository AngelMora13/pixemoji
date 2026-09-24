<template>
  <div class="space-y-5">
    <!-- SECCIÓN 1: AÑADIR TEXTO -->
    <div class="p-3.5 bg-white/85 border border-[#ebd8ca] rounded-2xl space-y-3 shadow-2xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-[#523e32] flex items-center gap-1.5">
          <span>🔤</span>
          <span>Añadir Texto</span>
        </span>
        <button
          type="button"
          @click="textContent = textContent.toUpperCase()"
          class="text-[10px] font-bold text-[#d97736] uppercase tracking-wider hover:underline cursor-pointer"
        >
          ⚡ MAYÚSCULAS
        </button>
      </div>

      <div class="space-y-2">
        <textarea
          v-model="textContent"
          rows="2"
          placeholder="Escribe tu texto o meme..."
          class="w-full p-2.5 bg-white border border-[#debfa8] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#d97736] resize-none"
        ></textarea>

        <div class="flex gap-2 items-center">
          <select
            v-model="fontFamily"
            class="flex-1 h-9 px-2.5 bg-white border border-[#debfa8] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#d97736] cursor-pointer"
          >
            <option value="Impact">Impact (Meme)</option>
            <option value="Anton">Anton (Bold)</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Outfit">Outfit</option>
            <option value="Caveat">Caveat (Cómic)</option>
            <option value="Arial">Arial</option>
          </select>

          <button
            type="button"
            @click="handleAddText"
            class="h-9 px-4 rounded-xl bg-gradient-to-r from-[#d97736] to-amber-600 hover:from-[#c46527] hover:to-amber-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>➕</span>
            <span>Añadir</span>
          </button>
        </div>
      </div>
    </div>

    <!-- SECCIÓN 2: AÑADIR EMOJIS -->
    <div class="p-3.5 bg-white/85 border border-[#ebd8ca] rounded-2xl space-y-2.5 shadow-2xs">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-[#523e32] flex items-center gap-1.5">
          <span>✨</span>
          <span>Añadir Emojis</span>
        </span>
        <button
          type="button"
          @click="$emit('togglePicker')"
          class="text-[11px] font-semibold text-[#d97736] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>{{ isPickerOpen ? 'Ocultar' : '🔍 Selector Completo' }}</span>
        </button>
      </div>

      <div class="grid grid-cols-5 gap-1.5">
        <button
          v-for="item in quickEmojis"
          :key="item.name"
          type="button"
          @click="$emit('selectEmoji', item.char)"
          class="p-2 rounded-xl bg-amber-50/70 border border-[#ebd8ca] hover:bg-amber-100 hover:border-[#d97736] transition-all flex flex-col items-center justify-center cursor-pointer select-none group"
          :title="item.name"
        >
          <span class="text-2xl transition-transform group-hover:scale-125">{{ item.char }}</span>
        </button>
      </div>
    </div>

    <!-- SECCIÓN 3: SUBIR IMAGEN -->
    <div class="p-3.5 bg-white/85 border border-[#ebd8ca] rounded-2xl space-y-2.5 shadow-2xs">
      <span class="text-xs font-bold uppercase tracking-wider text-[#523e32] flex items-center gap-1.5">
        <span>🖼️</span>
        <span>Subir Foto o Imagen</span>
      </span>

      <!-- Local upload drop zone -->
      <label class="border-2 border-dashed border-[#debfa8] hover:border-[#d97736] rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer bg-white/60 hover:bg-amber-50/50 transition-all text-center">
        <svg class="w-6 h-6 text-[#d97736]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-xs font-semibold text-[#523e32]">Haz clic para subir imagen</span>
        <span class="text-[10px] text-[#8a6e60]">PNG, JPG, WEBP, SVG</span>
        <input type="file" accept="image/*" @change="onFileChange" class="hidden" />
      </label>

      <!-- URL input -->
      <div class="flex gap-1.5 pt-1">
        <input
          v-model="imageUrlInput"
          type="url"
          placeholder="O pega URL (https://...)"
          class="flex-1 h-8 px-2.5 bg-white border border-[#debfa8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#d97736]"
        />
        <button
          type="button"
          @click="addImageFromUrl"
          class="px-3 h-8 rounded-xl bg-white border border-[#debfa8] text-[#523e32] hover:bg-amber-50 font-bold text-xs transition-colors cursor-pointer shrink-0"
        >
          Cargar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TextNodeOptions } from '../../composables/useKonvaLayers';

defineProps<{
  quickEmojis: { name: string; char: string }[];
  isPickerOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'addText', options: TextNodeOptions): void;
  (e: 'selectEmoji', char: string): void;
  (e: 'togglePicker'): void;
  (e: 'addImage', url: string): void;
}>();

const textContent = ref('TEXTO DE MEME');
const fontFamily = ref('Impact');
const imageUrlInput = ref('');

const handleAddText = () => {
  if (!textContent.value.trim()) return;
  emit('addText', {
    text: textContent.value,
    fontFamily: fontFamily.value,
    fontSize: 44,
    textColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 3
  });
};

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (loadEvt) => {
    const dataUrl = loadEvt.target?.result as string;
    if (dataUrl) {
      emit('addImage', dataUrl);
    }
  };
  reader.readAsDataURL(file);
  target.value = '';
};

const addImageFromUrl = () => {
  if (!imageUrlInput.value.trim()) return;
  emit('addImage', imageUrlInput.value.trim());
  imageUrlInput.value = '';
};
</script>
