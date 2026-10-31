<template>
  <div class="space-y-2 select-none" data-purpose="effect-presets-grid">
    <div class="flex items-center justify-between text-xs font-bold text-text-main">
      <span class="text-[11px] uppercase tracking-wider">{{ title }}</span>
    </div>

    <!-- 4 Efectos Instantáneos 1-Clic (Compartido para Texto, Emojis e Imágenes) -->
    <div class="grid grid-cols-2 gap-2" id="effects-grid">
      <!-- 1. Borde Sticker WhatsApp -->
      <button
        type="button"
        @click="applyPreset('sticker')"
        class="flex items-center gap-2 p-2 rounded-2xl border border-[#E8DEC9] hover:border-primary-400 bg-[#FFF5EE] text-text-main font-bold text-xs shadow-2xs text-left active:scale-95 transition-all cursor-pointer group"
      >
        <span class="w-7 h-7 rounded-xl bg-gradient-to-br from-primary-500 to-amber-500 text-white flex items-center justify-center text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
          ✨
        </span>
        <div class="leading-tight min-w-0">
          <div class="truncate">Borde Sticker</div>
          <span class="text-[10px] text-text-muted font-medium truncate block">Borde blanco WA</span>
        </div>
      </button>

      <!-- 2. Neón Cyan -->
      <button
        type="button"
        @click="applyPreset({ preset: 'neon', color: '#00D1FF' })"
        class="flex items-center gap-2 p-2 rounded-2xl border border-[#E8DEC9] hover:border-cyan-400 bg-[#FAF6EE] text-text-main font-bold text-xs shadow-2xs text-left active:scale-95 transition-all cursor-pointer group"
      >
        <span class="w-7 h-7 rounded-xl bg-[#E0F8FF] text-cyan-600 flex items-center justify-center text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
          💎
        </span>
        <div class="leading-tight min-w-0">
          <div class="truncate">Neón Cyan</div>
          <span class="text-[10px] text-text-muted font-medium truncate block">Resplandor 3D</span>
        </div>
      </button>

      <!-- 3. Neón Rosa -->
      <button
        type="button"
        @click="applyPreset({ preset: 'neon', color: '#FF4D8D' })"
        class="flex items-center gap-2 p-2 rounded-2xl border border-[#E8DEC9] hover:border-pink-400 bg-[#FAF6EE] text-text-main font-bold text-xs shadow-2xs text-left active:scale-95 transition-all cursor-pointer group"
      >
        <span class="w-7 h-7 rounded-xl bg-[#FFEAF3] text-pink-600 flex items-center justify-center text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
          💖
        </span>
        <div class="leading-tight min-w-0">
          <div class="truncate">Neón Rosa</div>
          <span class="text-[10px] text-text-muted font-medium truncate block">Vibrante</span>
        </div>
      </button>

      <!-- 4. Limpio / Plano -->
      <button
        type="button"
        @click="applyPreset('clean')"
        class="flex items-center gap-2 p-2 rounded-2xl border border-[#E8DEC9] hover:border-stone-400 bg-[#FAF6EE] text-text-main font-bold text-xs shadow-2xs text-left active:scale-95 transition-all cursor-pointer group"
      >
        <span class="w-7 h-7 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
          🫧
        </span>
        <div class="leading-tight min-w-0">
          <div class="truncate">Limpio / Plano</div>
          <span class="text-[10px] text-text-muted font-medium truncate block">Original HD</span>
        </div>
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
    title: '⚡ Efectos Instantáneos 1-Clic'
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
