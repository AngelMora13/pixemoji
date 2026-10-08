<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in" @click.self="$emit('close')">
    <div
      class="w-full max-w-sm bg-white border border-app-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3.5 relative"
      @click.stop
    >
      <!-- Close button -->
      <button
        type="button"
        @click="$emit('close')"
        class="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
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

      <!-- Resoluciones de salida -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-text-main">
            Resolución de salida
          </label>
          <span class="text-[10px] font-mono font-bold text-primary-600">
            {{ Math.round(canvasWidth * exportScale) }} &times; {{ Math.round(canvasHeight * exportScale) }} px
          </span>
        </div>

        <div class="grid grid-cols-3 gap-1.5">
          <!-- 1x -->
          <button
            type="button"
            @click="selectScale(1)"
            :class="[
              'p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
              exportScale === 1
                ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                : 'bg-white text-text-main border-app-border-strong hover:bg-stone-50'
            ]"
          >
            <span class="block text-xs">1x</span>
            <span class="text-[9px] font-mono block opacity-85 leading-tight">{{ canvasWidth }}&times;{{ canvasHeight }}</span>
          </button>

          <!-- 2x -->
          <button
            type="button"
            @click="selectScale(2)"
            :class="[
              'p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
              exportScale === 2
                ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                : 'bg-white text-text-main border-app-border-strong hover:bg-stone-50'
            ]"
          >
            <span class="block text-xs">2x Ultra</span>
            <span class="text-[9px] font-mono block opacity-85 leading-tight">{{ canvasWidth * 2 }}&times;{{ canvasHeight * 2 }}</span>
          </button>

          <!-- 3er Botón Custom Nx -->
          <button
            type="button"
            @click="selectScale(customMultiplier)"
            :class="[
              'p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
              exportScale !== 1 && exportScale !== 2
                ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                : 'bg-white text-text-main border-app-border-strong hover:bg-stone-50'
            ]"
          >
            <span class="block text-xs">{{ customMultiplier }}x Custom</span>
            <span class="text-[9px] font-mono block opacity-85 leading-tight">
              {{ Math.round(canvasWidth * customMultiplier) }}&times;{{ Math.round(canvasHeight * customMultiplier) }}
            </span>
          </button>
        </div>

        <!-- Input editable para el multiplicador Nx (hasta 2 decimales y sin tope de 8x) -->
        <div class="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-app-border text-xs">
          <div class="flex items-center gap-1.5 text-text-muted">
            <span>📐</span>
            <span class="text-[11px] font-semibold">Multiplicador Nx:</span>
          </div>
          <div class="flex items-center gap-1">
            <input
              type="number"
              v-model.number="customMultiplier"
              @input="onCustomInput"
              min="0.1"
              step="0.01"
              class="w-20 px-2 py-0.5 bg-white border border-app-border-strong rounded-lg text-xs font-mono font-bold text-center text-text-main focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Ej. 3.75"
            />
            <span class="font-bold text-xs text-text-muted">x</span>
          </div>
        </div>

        <!-- Alerta de escala alta (> 2x o > 4x / 8x / 16x) -->
        <div
          v-if="exportScale > 4"
          class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[10.5px] text-rose-950 flex items-start gap-1.5 animate-fade-in"
        >
          <span class="text-xs leading-none shrink-0">🚨</span>
          <span>Escalas ultra altas ({{ exportScale }}x) pueden demorar bastante tiempo o fallar si el navegador agota el búfer de memoria del lienzo.</span>
        </div>
        <div
          v-else-if="exportScale > 2"
          class="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10.5px] text-amber-900 flex items-start gap-1.5 animate-fade-in"
        >
          <span class="text-xs leading-none shrink-0">⚠️</span>
          <span>Escalas superiores a 2x requieren mayor memoria y tiempo de renderizado en el navegador.</span>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="pt-1">
        <ExportActions
          :copied="copied"
          download-text="Descargar Imagen PNG"
          @download="$emit('download')"
          @copy="$emit('copy')"
        />
      </div>

      <p class="text-[10px] text-center text-text-subtle pt-0.5">
        🔒 Procesado 100% en tu navegador con Konva.js.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ExportActions from './ExportActions.vue';

const props = defineProps<{
  isOpen: boolean;
  exportScale: number;
  canvasWidth: number;
  canvasHeight: number;
  copied: boolean;
  suggestedScale?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:exportScale', scale: number): void;
  (e: 'download'): void;
  (e: 'copy'): void;
}>();

const customMultiplier = ref(props.suggestedScale ?? (props.exportScale > 2 ? props.exportScale : 4));

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.suggestedScale && props.suggestedScale > 1) {
        customMultiplier.value = props.suggestedScale;
        emit('update:exportScale', props.suggestedScale);
      }
    }
  }
);

watch(
  () => props.suggestedScale,
  (scale) => {
    if (scale && scale > 1) {
      customMultiplier.value = scale;
    }
  }
);

const selectScale = (scale: number) => {
  emit('update:exportScale', scale);
};

const onCustomInput = () => {
  const raw = Number(customMultiplier.value);
  if (Number.isFinite(raw) && raw > 0) {
    const val = Math.round(raw * 100) / 100;
    emit('update:exportScale', val);
  }
};
</script>

