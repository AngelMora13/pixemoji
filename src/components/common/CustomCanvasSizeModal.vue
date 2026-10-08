<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-md bg-white rounded-3xl border border-app-border-strong shadow-2xl p-5 sm:p-6 space-y-4 animate-scale-up"
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
              Define ancho y alto exactos en píxeles
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
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <!-- Campo Ancho -->
          <div class="flex-1 space-y-1">
            <label class="block text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Ancho (Width)
            </label>
            <div class="relative flex items-center">
              <input
                type="number"
                v-model.number="width"
                min="50"
                max="4096"
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
              Alto (Height)
            </label>
            <div class="relative flex items-center">
              <input
                type="number"
                v-model.number="height"
                min="50"
                max="4096"
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

        <!-- Indicador de Ratio Calculado -->
        <div class="flex items-center justify-between px-3 py-1.5 rounded-xl bg-stone-50 border border-app-border text-[11px] text-text-muted">
          <span>Proporción calculada:</span>
          <span class="font-mono font-bold text-text-main">
            {{ calculatedRatio }}
          </span>
        </div>
      </div>

      <!-- Atajos Rápidos de Medidas Populares -->
      <div class="space-y-1.5">
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

const props = defineProps<{
  isOpen: boolean;
  initialWidth?: number;
  initialHeight?: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'apply', size: { width: number; height: number }): void;
}>();

const width = ref(props.initialWidth ?? 800);
const height = ref(props.initialHeight ?? 600);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.initialWidth) width.value = props.initialWidth;
      if (props.initialHeight) height.value = props.initialHeight;
    }
  }
);

const popularPresets = [
  { w: 800, h: 600, label: '4:3 Estándar' },
  { w: 1200, h: 630, label: 'Facebook Post' },
  { w: 1280, h: 720, label: 'HD 720p' },
  { w: 1920, h: 1080, label: 'Full HD 16:9' },
  { w: 1080, h: 1350, label: 'Instagram 4:5' },
  { w: 500, h: 500, label: 'Sticker 1:1' }
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
    width.value <= 4096 &&
    height.value >= 50 &&
    height.value <= 4096
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
