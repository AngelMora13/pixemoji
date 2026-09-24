<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold uppercase tracking-wider text-[#523e32]">
        Exportar Creación
      </span>
      <span class="text-[10px] text-[#8a6e60] font-mono">
        {{ exportScale === 1 ? `${canvasWidth}×${canvasHeight}px` : `${canvasWidth * 2}×${canvasHeight * 2}px` }}
      </span>
    </div>

    <!-- Scale selector -->
    <div class="flex gap-2">
      <button
        type="button"
        @click="$emit('update:exportScale', 1)"
        :class="[
          'flex-1 py-1.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
          exportScale === 1
            ? 'bg-[#d97736] text-white border-[#d97736] shadow-2xs'
            : 'bg-white text-[#523e32] border-[#debfa8] hover:bg-amber-50'
        ]"
      >
        1x ({{ canvasWidth }}&times;{{ canvasHeight }})
      </button>

      <button
        type="button"
        @click="$emit('update:exportScale', 2)"
        :class="[
          'flex-1 py-1.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
          exportScale === 2
            ? 'bg-[#d97736] text-white border-[#d97736] shadow-2xs'
            : 'bg-white text-[#523e32] border-[#debfa8] hover:bg-amber-50'
        ]"
      >
        2x HD ({{ canvasWidth * 2 }}&times;{{ canvasHeight * 2 }})
      </button>
    </div>

    <!-- Download Button -->
    <button
      type="button"
      @click="$emit('download')"
      class="w-full py-3 px-4 rounded-2xl bg-[#d97736] hover:bg-[#c46527] text-white font-bold text-xs shadow-md shadow-[#d97736]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>Descargar PNG {{ targetLabel ? `(${targetLabel})` : '' }}</span>
    </button>

    <!-- Copy to Clipboard Button -->
    <button
      type="button"
      @click="$emit('copy')"
      :class="[
        'w-full py-2.5 px-4 rounded-2xl border font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer',
        copied
          ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs'
          : 'bg-white/90 border-[#debfa8] text-[#523e32] hover:bg-amber-50/80'
      ]"
    >
      <svg v-if="copied" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span>{{ copied ? '¡Copiado con éxito!' : 'Copiar al portapapeles' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  exportScale: number;
  canvasWidth: number;
  canvasHeight: number;
  copied: boolean;
  targetLabel?: string;
}>();

defineEmits<{
  (e: 'update:exportScale', val: number): void;
  (e: 'download'): void;
  (e: 'copy'): void;
}>();
</script>
