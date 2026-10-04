<template>
  <div class="space-y-3" data-purpose="sidebar-add-tools">
    <div class="px-1 pb-1">
      <span class="text-[11px] font-bold uppercase tracking-wider text-text-muted">
        Selecciona qué añadir al lienzo:
      </span>
    </div>

    <!-- 3 Botones en Columna -->
    <div class="flex flex-col gap-2.5">
      <!-- 1. Añadir Texto -->
      <button
        type="button"
        @click="handleAddDefaultText"
        class="w-full p-3.5 bg-white hover:bg-primary-50/70 border border-app-border hover:border-primary-400 rounded-2xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-between text-left group cursor-pointer active:scale-98"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
            🔤
          </div>
          <div>
            <span class="block text-xs font-bold text-text-main group-hover:text-primary-600 transition-colors">
              Añadir Texto
            </span>
            <span class="block text-[11px] text-text-muted">
              Tipografía enriquecida y colores
            </span>
          </div>
        </div>
        <div class="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-primary-500 group-hover:text-white text-text-subtle flex items-center justify-center text-xs font-bold transition-colors">
          ➕
        </div>
      </button>

      <!-- 2. Añadir Emoji -->
      <button
        type="button"
        @click="handleAddDefaultEmoji"
        class="w-full p-3.5 bg-white hover:bg-primary-50/70 border border-app-border hover:border-primary-400 rounded-2xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-between text-left group cursor-pointer active:scale-98"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
            🧁
          </div>
          <div>
            <span class="block text-xs font-bold text-text-main group-hover:text-primary-600 transition-colors">
              Añadir Emoji
            </span>
            <span class="block text-[11px] text-text-muted">
              Stickers y reacciones vectoriales
            </span>
          </div>
        </div>
        <div class="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-primary-500 group-hover:text-white text-text-subtle flex items-center justify-center text-xs font-bold transition-colors">
          ➕
        </div>
      </button>

      <!-- 3. Añadir Imagen -->
      <button
        type="button"
        @click="handleAddDefaultImage"
        class="w-full p-3.5 bg-white hover:bg-primary-50/70 border border-app-border hover:border-primary-400 rounded-2xl shadow-2xs hover:shadow-sm transition-all flex items-center justify-between text-left group cursor-pointer active:scale-98"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition-transform">
            🖼️
          </div>
          <div>
            <span class="block text-xs font-bold text-text-main group-hover:text-primary-600 transition-colors">
              Añadir Imagen
            </span>
            <span class="block text-[11px] text-text-muted">
              Sube fotos o carga por URL
            </span>
          </div>
        </div>
        <div class="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-primary-500 group-hover:text-white text-text-subtle flex items-center justify-center text-xs font-bold transition-colors">
          ➕
        </div>
      </button>
    </div>

    <!-- Tip box -->
    <div class="p-3 bg-stone-50 border border-app-border rounded-xl text-[11px] text-text-muted flex items-start gap-2">
      <span class="text-sm">💡</span>
      <p class="leading-relaxed">
        Configura tipografía, estilos, sombras, reemplazo de imágenes o selector de emojis desde el panel derecho de <strong>Propiedades</strong>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TextNodeOptions } from '../../composables/useKonvaLayers';
import { PLACEHOLDER_IMAGE_URL } from '../../utils';

const emit = defineEmits<{
  (e: 'addText', options: TextNodeOptions): void;
  (e: 'selectEmoji', char: string): void;
  (e: 'addImage', url: string): void;
}>();

const handleAddDefaultText = () => {
  emit('addText', {
    text: 'Escribe tu texto...',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 44,
    textColor: '#1e293b',
    strokeWidth: 0,
    strokeColor: undefined,
    fontStyle: 'normal'
  });
};

const handleAddDefaultEmoji = () => {
  emit('selectEmoji', '🧁');
};

const handleAddDefaultImage = () => {
  emit('addImage', PLACEHOLDER_IMAGE_URL);
};
</script>
