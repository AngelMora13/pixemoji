<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
    <div
      class="w-full max-w-sm bg-white border border-app-border rounded-3xl p-6 shadow-2xl space-y-4 relative"
      @click.stop
    >
      <!-- Close button -->
      <button
        type="button"
        @click="$emit('close')"
        class="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
      >
        ✕
      </button>

      <!-- Header -->
      <div class="text-left space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-xl">💾</span>
          <h3 class="text-base font-extrabold text-text-main">Exportar Creación</h3>
        </div>
        <p class="text-xs text-text-muted">
          Descarga en formato PNG con máxima nitidez o cópialo directamente.
        </p>
      </div>

      <!-- Resoluciones -->
      <div class="space-y-1.5">
        <label class="block text-[11px] font-bold uppercase tracking-wider text-text-main">
          Resolución de salida
        </label>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            @click="$emit('update:exportScale', 1)"
            :class="[
              'py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
              exportScale === 1
                ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                : 'bg-white text-text-main border-app-border-strong hover:bg-primary-50'
            ]"
          >
            <span class="block">1x (Estándar)</span>
            <span class="text-[10px] font-mono opacity-85">{{ canvasWidth }}&times;{{ canvasHeight }}px</span>
          </button>

          <button
            type="button"
            @click="$emit('update:exportScale', 2)"
            :class="[
              'py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
              exportScale === 2
                ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                : 'bg-white text-text-main border-app-border-strong hover:bg-primary-50'
            ]"
          >
            <span class="block">2x (Ultra HD)</span>
            <span class="text-[10px] font-mono opacity-85">{{ canvasWidth * 2 }}&times;{{ canvasHeight * 2 }}px</span>
          </button>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="pt-2">
        <ExportActions
          :copied="copied"
          download-text="Descargar Imagen PNG"
          @download="$emit('download')"
          @copy="$emit('copy')"
        />
      </div>

      <p class="text-[10px] text-center text-text-subtle pt-1">
        🔒 Procesado 100% en tu navegador con Konva.js.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ExportActions from './ExportActions.vue';

defineProps<{
  isOpen: boolean;
  exportScale: number;
  canvasWidth: number;
  canvasHeight: number;
  copied: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'update:exportScale', scale: number): void;
  (e: 'download'): void;
  (e: 'copy'): void;
}>();
</script>
