<template>
  <div class="space-y-2.5" data-purpose="effect-presets-grid">
    <span class="block text-xs font-bold text-text-main uppercase tracking-wider text-[11px]">
      {{ title }}
    </span>

    <!-- Presets para Emojis e Imágenes (Objeto) -->
    <div v-if="mode === 'object'" class="grid grid-cols-2 gap-2">
      <button
        type="button"
        @click="applyPreset('sticker')"
        class="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-gradient text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer active:scale-98"
      >
        <span>✨</span>
        <span>Borde Sticker</span>
      </button>

      <button
        type="button"
        @click="applyPreset({ preset: 'neon', color: '#00f0ff' })"
        class="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-100 hover:bg-cyan-200 border border-cyan-400 text-cyan-900 font-bold text-xs transition-colors cursor-pointer active:scale-98"
      >
        <span>💎</span>
        <span>Neón Cyan</span>
      </button>

      <button
        type="button"
        @click="applyPreset({ preset: 'neon', color: '#ff007f' })"
        class="flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-100 hover:bg-pink-200 border border-pink-400 text-pink-900 font-bold text-xs transition-colors cursor-pointer active:scale-98"
      >
        <span>💖</span>
        <span>Neón Rosa</span>
      </button>

      <button
        type="button"
        @click="applyPreset('soft-shadow')"
        class="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 font-bold text-xs transition-colors cursor-pointer active:scale-98"
      >
        <span>🌑</span>
        <span>Sombra</span>
      </button>

      <button
        type="button"
        @click="applyPreset('clean')"
        class="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-primary-50 border border-app-border-strong text-stone-700 font-bold text-xs transition-colors cursor-pointer active:scale-98"
      >
        <span>🧼</span>
        <span>Normal / Limpio</span>
      </button>
    </div>

    <!-- Presets para Texto -->
    <div v-else class="grid grid-cols-2 gap-2">
      <button
        type="button"
        @click="applyPreset('meme')"
        class="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-98"
      >
        <span>💥</span>
        <span>Meme Clásico</span>
      </button>

      <button
        type="button"
        @click="applyPreset('sticker')"
        class="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-900 border border-primary-300 font-bold text-xs transition-colors cursor-pointer active:scale-98"
      >
        <span>✨</span>
        <span>Sticker</span>
      </button>

      <button
        type="button"
        @click="applyPreset('neon')"
        class="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold text-xs transition-colors cursor-pointer active:scale-98"
      >
        <span>💡</span>
        <span>Neón</span>
      </button>

      <button
        type="button"
        @click="applyPreset('soft-shadow')"
        class="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-bold text-xs transition-colors cursor-pointer active:scale-98"
      >
        <span>🌑</span>
        <span>Sombra</span>
      </button>

      <button
        type="button"
        @click="applyPreset('clean')"
        class="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs transition-colors cursor-pointer active:scale-98"
      >
        <span>🌸</span>
        <span>Plano Limpio</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';

const props = withDefaults(
  defineProps<{
    mode?: 'object' | 'text';
    title?: string;
  }>(),
  {
    mode: 'object',
    title: 'Efectos 1-Clic:'
  }
);

const emit = defineEmits<{
  (e: 'select', preset: any): void;
}>();

const studio = useCanvasStudio();

const applyPreset = (preset: any) => {
  if (props.mode === 'text') {
    studio?.change('textPreset', preset);
  } else {
    studio?.change('imagePreset', preset);
  }
  emit('select', preset);
};
</script>
