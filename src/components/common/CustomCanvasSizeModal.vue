<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-md bg-white rounded-3xl border border-app-border-strong shadow-2xl p-5 sm:p-6 space-y-3.5 animate-scale-up"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-size-title"
    >
      <!-- Cabecera -->
      <div class="flex items-center justify-between pb-2 border-b border-app-border">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-primary-100 border border-primary-200 flex items-center justify-center text-lg">
            📐
          </div>
          <div>
            <h3 id="custom-size-title" class="text-sm font-extrabold text-text-main">
              Tamaño Personalizado
            </h3>
            <p class="text-[11px] text-text-muted">
              Define ancho y alto deseados (resolución libre)
            </p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('close')"
          class="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-text-muted hover:text-text-main text-xs font-bold transition-colors cursor-pointer"
          title="Cerrar ventana"
        >
          ✕
        </button>
      </div>

      <!-- Inputs de Ancho y Alto con botón de intercambio -->
      <div class="space-y-2.5">
        <div class="flex items-center gap-2">
          <!-- Campo Ancho -->
          <div class="flex-1 space-y-1">
            <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Ancho Objetivo
            </label>
            <div class="relative flex items-center">
              <input
                type="number"
                v-model.number="width"
                min="50"
                step="10"
                class="w-full px-3 py-2 bg-stone-50 border border-app-border-strong rounded-xl text-sm font-mono font-bold text-text-main focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Ancho en px"
              />
              <span class="absolute right-3 text-xs font-semibold text-text-hint pointer-events-none">
                px
              </span>
            </div>
          </div>

          <!-- Botón intercambiar (Swap W / H) -->
          <div class="pt-5 shrink-0">
            <button
              type="button"
              @click="swapDimensions"
              class="w-9 h-9 rounded-xl border border-app-border hover:border-primary-400 bg-white hover:bg-stone-50 flex items-center justify-center text-text-muted hover:text-primary-600 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Intercambiar ancho y alto"
            >
              ⇄
            </button>
          </div>

          <!-- Campo Alto -->
          <div class="flex-1 space-y-1">
            <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Alto Objetivo
            </label>
            <div class="relative flex items-center">
              <input
                type="number"
                v-model.number="height"
                min="50"
                step="10"
                class="w-full px-3 py-2 bg-stone-50 border border-app-border-strong rounded-xl text-sm font-mono font-bold text-text-main focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Alto en px"
              />
              <span class="absolute right-3 text-xs font-semibold text-text-hint pointer-events-none">
                px
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tarjeta de Normalización con Base 512px y Escala -->
      <div class="p-3 bg-stone-50 border border-app-border rounded-2xl space-y-2">
        <div class="flex items-center justify-between text-xs font-bold text-text-main pb-1 border-b border-app-border/70">
          <span class="flex items-center gap-1.5">
            <span>✨</span>
            <span>Escala Adaptativa (Base 512px)</span>
          </span>
          <span class="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-primary-100 border border-primary-200 text-primary-800">
            {{ customCalc.targetScale }}x Deseado
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-[11px]">
          <div class="p-2 rounded-xl bg-white border border-app-border shadow-2xs">
            <span class="block text-[10px] font-bold text-text-subtle uppercase">Lienzo de Edición</span>
            <span class="font-mono font-black text-text-main text-xs">{{ customCalc.baseWidth }} &times; {{ customCalc.baseHeight }} px</span>
            <span class="block text-[9px] text-text-muted mt-0.5">Rápido a 60 FPS y controles nítidos</span>
          </div>

          <div class="p-2 rounded-xl bg-white border border-app-border shadow-2xs">
            <span class="block text-[10px] font-bold text-text-subtle uppercase">Resolución Final</span>
            <span class="font-mono font-black text-primary-600 text-xs">{{ customCalc.targetWidth }} &times; {{ customCalc.targetHeight }} px</span>
            <span class="block text-[9px] text-text-muted mt-0.5">Ratio: {{ calculatedRatio }}</span>
          </div>
        </div>
      </div>

      <!-- Alerta cuando la escala supera los 2x o ultra alta (> 4x / 8x / 16x) -->
      <div
        v-if="customCalc.targetScale > 2"
        :class="[
          'p-2.5 rounded-2xl flex items-start gap-2 animate-fade-in text-[11px] leading-snug',
          customCalc.targetScale > 4
            ? 'bg-rose-50 border border-rose-200 text-rose-950'
            : 'bg-amber-50/90 border border-amber-200/90 text-amber-950'
        ]"
      >
        <span class="text-base leading-none shrink-0">{{ customCalc.targetScale > 4 ? '🚨' : '⚠️' }}</span>
        <div class="space-y-0.5">
          <span class="font-extrabold block">
            {{ customCalc.targetScale > 4 ? `Aviso de Ultra Resolución (${customCalc.targetScale}x)` : `Aviso de Alta Resolución (${customCalc.targetScale}x)` }}
          </span>
          <p :class="customCalc.targetScale > 4 ? 'text-rose-900 text-[10px]' : 'text-amber-800 text-[10px]'">
            {{
              customCalc.targetScale > 4
                ? 'Exportar a escalas ultra altas (8x, 16x o más) puede demorar bastante tiempo o fallar si el navegador agota el límite de memoria gráfica del lienzo. Además, la nitidez dependerá de la calidad de los assets utilizados.'
                : 'Exportar por encima de 2x tomará más tiempo de procesamiento. La calidad final dependerá de los assets usados (las imágenes de baja resolución añadidas no ganarán definición original).'
            }}
          </p>
        </div>
      </div>

      <!-- Atajos Rápidos de Medidas Populares -->
      <div class="space-y-1">
        <span class="block text-[10px] font-bold uppercase tracking-wider text-text-subtle">
          Sugerencias rápidas:
        </span>
        <div class="grid grid-cols-3 gap-1.5">
          <button
            v-for="chip in popularPresets"
            :key="chip.label"
            type="button"
            @click="setDimensions(chip.w, chip.h)"
            :class="[
              'px-2 py-1.5 rounded-xl border text-center transition-all cursor-pointer text-[10px] flex flex-col items-center shadow-2xs',
              width === chip.w && height === chip.h
                ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500 text-primary-900 font-bold'
                : 'bg-white border-app-border hover:bg-stone-50 text-text-muted'
            ]"
          >
            <span class="font-mono font-bold text-[11px] text-text-main">{{ chip.w }} &times; {{ chip.h }}</span>
            <span class="text-[9px] opacity-80">{{ chip.label }}</span>
          </button>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="pt-2 border-t border-app-border flex items-center justify-end gap-2">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 rounded-xl border border-app-border text-xs font-bold text-text-muted hover:text-text-main hover:bg-stone-100 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          @click="handleApply"
          :disabled="!isValid"
          class="px-5 py-2 rounded-xl bg-primary-gradient text-white font-bold text-xs shadow-md shadow-primary-600/20 hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          Aplicar y Guardar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { calculateCustomDimensions } from '../../composables/useSocialPresets';

const props = defineProps<{
  isOpen: boolean;
  initialWidth?: number;
  initialHeight?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'apply', size: { width: number; height: number }): void;
}>();

const width = ref(props.initialWidth ?? 1024);
const height = ref(props.initialHeight ?? 1024);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.initialWidth) width.value = props.initialWidth;
      if (props.initialHeight) height.value = props.initialHeight;
    }
  }
);

const customCalc = computed(() => {
  return calculateCustomDimensions(width.value || 512, height.value || 512);
});

const popularPresets = [
  { w: 2048, h: 2048, label: 'Feed HD (4x)' },
  { w: 4096, h: 4096, label: 'Ultra 4K (8x)' },
  { w: 8192, h: 8192, label: 'Ultra 8K (16x)' },
  { w: 1920, h: 1080, label: 'Full HD 16:9' },
  { w: 1080, h: 1920, label: 'Stories / Reels' },
  { w: 512, h: 512, label: 'Base 1:1 (1x)' }
];

const setDimensions = (w: number, h: number) => {
  width.value = w;
  height.value = h;
};

const swapDimensions = () => {
  const temp = width.value;
  width.value = height.value;
  height.value = temp;
};

const isValid = computed(() => {
  return (
    Number.isFinite(width.value) &&
    Number.isFinite(height.value) &&
    width.value >= 50 &&
    height.value >= 50
  );
});

const calculatedRatio = computed(() => {
  if (!width.value || !height.value) return '-';
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(width.value), Math.round(height.value));
  const rW = Math.round(width.value) / divisor;
  const rH = Math.round(height.value) / divisor;
  const decimal = (width.value / height.value).toFixed(2);
  return `${rW}:${rH} (~${decimal})`;
});

const handleApply = () => {
  if (!isValid.value) return;
  emit('apply', {
    width: Math.round(width.value),
    height: Math.round(height.value)
  });
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (props.isOpen && e.key === 'Escape') {
    emit('close');
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown);
  }
});
</script>


