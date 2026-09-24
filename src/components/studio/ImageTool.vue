<template>
  <div class="space-y-4">
    <!-- Local upload -->
    <div>
      <label class="block text-xs font-bold uppercase tracking-wider text-[#523e32] mb-1.5">
        1. Subir imagen desde tu equipo
      </label>
      <label class="border-2 border-dashed border-[#debfa8] hover:border-[#d97736] rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white/70 hover:bg-amber-50/50 transition-all">
        <svg class="w-7 h-7 text-[#d97736]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-xs font-semibold text-[#523e32]">Haz clic para seleccionar imagen</span>
        <span class="text-[10px] text-[#8a6e60]">PNG, JPG, WEBP o SVG</span>
        <input type="file" accept="image/*" @change="onFileChange" class="hidden" />
      </label>
    </div>

    <!-- URL input -->
    <div class="pt-2 border-t border-[#ebd8ca]/80">
      <label class="block text-xs font-bold uppercase tracking-wider text-[#523e32] mb-1.5">
        2. O pegar enlace de imagen (URL)
      </label>
      <div class="flex gap-2">
        <input
          v-model="imageUrlInput"
          type="url"
          placeholder="https://ejemplo.com/imagen.png"
          class="flex-1 h-10 px-3 bg-white border border-[#debfa8] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#d97736]"
        />
        <button
          type="button"
          @click="addImageFromUrl"
          class="px-3.5 h-10 rounded-xl bg-white border border-[#debfa8] text-[#523e32] hover:bg-amber-50 font-bold text-xs transition-colors cursor-pointer"
        >
          Cargar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'addImage', url: string): void;
}>();

const imageUrlInput = ref('');

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
