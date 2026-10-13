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
          <!-- 1x y 2x -->
          <button
            v-for="scale in ([1, 2] as const)"
            :key="scale"
            type="button"
            @click="selectPresetScale(scale)"
            :class="[
              'p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
              !isCustomMode && exportScale === scale
                ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                : 'bg-white text-text-main border-app-border-strong hover:bg-stone-50'
            ]"
          >
            <span class="block text-xs">{{ scale === 1 ? '1x' : '2x Ultra' }}</span>
            <span class="text-[9px] font-mono block opacity-85 leading-tight">{{ canvasWidth * scale }}&times;{{ canvasHeight * scale }}</span>
          </button>

          <!-- 3er Botón Custom Nx -->
          <button
            type="button"
            @click="selectCustom"
            :class="[
              'p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
              isCustomMode
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

        <!-- Input editable para el multiplicador Nx (solo visible al presionar custom) -->
        <div
          v-if="isCustomMode"
          class="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-app-border text-xs animate-fade-in"
        >
          <div class="flex items-center gap-1.5 text-text-muted">
            <span>📐</span>
            <span class="text-[11px] font-semibold">Multiplicador Nx:</span>
          </div>
          <div class="flex items-center gap-1">
            <input
              type="number"
              :value="customMultiplier"
              @input="onCustomInput"
              @blur="onCustomBlur"
              min="1"
              step="0.01"
              class="w-20 px-2 py-0.5 bg-white border border-app-border-strong rounded-lg text-xs font-mono font-bold text-center text-text-main focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Ej. 3.75"
            />
            <span class="font-bold text-xs text-text-muted">x</span>
          </div>
        </div>

        <!-- Alerta de escala alta (> 2x o > 4x) -->
        <div
          v-if="exportScale > 2"
          :class="[
            'p-2 rounded-xl text-[10.5px] flex items-start gap-1.5 animate-fade-in border',
            exportScale > 4 ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-amber-50 border-amber-200 text-amber-900'
          ]"
        >
          <span class="text-xs leading-none shrink-0">{{ exportScale > 4 ? '🚨' : '⚠️' }}</span>
          <span>{{ exportScale > 4 ? `Escalas ultra altas (${exportScale}x) pueden demorar bastante tiempo o agotar la memoria del navegador.` : 'Escalas superiores a 2x requieren mayor memoria y tiempo de renderizado.' }}</span>
        </div>
      </div>

      <!-- Tipo de Imagen -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-text-main">
            Tipo de Imagen
          </label>
          <span class="text-[10px] font-mono font-bold uppercase text-primary-600">
            .{{ (imageFormat || 'png') === 'jpeg' ? 'jpg' : (imageFormat || 'png') }}
          </span>
        </div>

        <div class="grid grid-cols-3 gap-1.5">
          <button
            v-for="fmt in formatOptions"
            :key="fmt.val"
            type="button"
            @click="selectFormat(fmt.val)"
            :class="[
              'p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center select-none flex flex-col items-center justify-center gap-0.5',
              (imageFormat || 'png') === fmt.val
                ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                : 'bg-white text-text-main border-app-border-strong hover:bg-stone-50'
            ]"
          >
            <span class="block text-xs font-mono font-bold">{{ fmt.label }}</span>
            <span :class="['text-[9px] font-semibold block leading-tight', (imageFormat || 'png') === fmt.val ? 'text-primary-100' : 'text-text-subtle']">
              {{ fmt.tag }}
            </span>
          </button>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="pt-1">
        <ExportActions
          :copied="copied"
          :download-text="`Descargar Imagen ${imageFormat?.toUpperCase() || 'PNG'}`"
          @download="$emit('download')"
          @copy="$emit('copy')"
        />
      </div>

      <p class="text-[10px] text-center text-text-subtle pt-0.5">
        🔒 Solo tu tienes acceso
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ExportActions from './ExportActions.vue';

export type ExportImageFormat = 'png' | 'webp' | 'jpeg';

export interface FormatOption {
  label: string;
  val: ExportImageFormat;
  tag: string;
}

const formatOptions: FormatOption[] = [
  { label: 'PNG', val: 'png', tag: 'Transparente' },
  { label: 'WEBP', val: 'webp', tag: 'Ligero' },
  { label: 'JPEG', val: 'jpeg', tag: 'Fondo Blanco' }
];

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    exportScale: number;
    canvasWidth: number;
    canvasHeight: number;
    copied: boolean;
    suggestedScale?: number;
    imageFormat?: ExportImageFormat;
  }>(),
  {
    imageFormat: 'png'
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:exportScale', scale: number): void;
  (e: 'update:imageFormat', format: ExportImageFormat): void;
  (e: 'download'): void;
  (e: 'copy'): void;
}>();

const selectFormat = (fmt: ExportImageFormat) => {
  emit('update:imageFormat', fmt);
};

const isCustomMode = ref(props.exportScale !== 1 && props.exportScale !== 2);
const customMultiplier = ref(
  Math.max(1, props.suggestedScale ?? (props.exportScale > 2 ? props.exportScale : 4))
);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (props.suggestedScale && props.suggestedScale > 1) {
        if (props.suggestedScale === 2) {
          isCustomMode.value = false;
          emit('update:exportScale', 2);
        } else {
          customMultiplier.value = Math.max(1, props.suggestedScale);
          isCustomMode.value = true;
          emit('update:exportScale', customMultiplier.value);
        }
      } else {
        isCustomMode.value = props.exportScale !== 1 && props.exportScale !== 2;
      }
    }
  }
);

watch(
  () => props.suggestedScale,
  (scale) => {
    if (scale && scale > 1) {
      customMultiplier.value = Math.max(1, scale);
    }
  }
);

const selectPresetScale = (scale: 1 | 2) => {
  isCustomMode.value = false;
  emit('update:exportScale', scale);
};

const selectCustom = () => {
  isCustomMode.value = true;
  emit('update:exportScale', customMultiplier.value);
};

const onCustomInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const rawStr = target.value;
  if (!rawStr) return;

  const normalized = rawStr.replace(',', '.');
  const num = parseFloat(normalized);
  if (isNaN(num)) return;

  // 1. Validar que las Nx no puedan ser menores a 1
  if (num < 1) {
    customMultiplier.value = 1;
    target.value = '1';
    emit('update:exportScale', 1);
    return;
  }

  // 2. Validar máximo 2 decimales.
  // Si se coloca un decimal de más (> 2), pasar al siguiente número entero con toFixed(0)
  const parts = normalized.split('.');
  if (parts.length > 1 && parts[1].length > 2) {
    const nextInt = Math.ceil(num) > num ? Math.ceil(num) : Math.floor(num) + 1;
    const fixedVal = Number(nextInt.toFixed(0));
    customMultiplier.value = fixedVal;
    target.value = String(fixedVal);
    emit('update:exportScale', fixedVal);
    return;
  }

  // Hasta 2 decimales válidos
  const val = Math.round(num * 100) / 100;
  customMultiplier.value = val;
  emit('update:exportScale', val);
};

const onCustomBlur = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const rawStr = target.value;
  const num = parseFloat(rawStr.replace(',', '.'));
  if (isNaN(num) || num < 1) {
    customMultiplier.value = 1;
    target.value = '1';
    emit('update:exportScale', 1);
  } else {
    target.value = String(customMultiplier.value);
  }
};
</script>

