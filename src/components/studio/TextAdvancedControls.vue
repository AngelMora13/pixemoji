<template>
  <div class="p-3.5 bg-amber-50/70 border border-[#debfa8] rounded-2xl space-y-3">
    <!-- Grid de 3 columnas en desktop: Relleno | Borde | Sombra -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
      <!-- COLUMNA 1: COLOR DE RELLENO -->
      <div class="p-3 bg-white border border-[#ebd8ca] rounded-xl flex flex-col justify-between space-y-2 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#523e32] flex items-center gap-1">
            <span>🎨</span>
            <span>Relleno (Texto)</span>
          </span>
          <span class="font-mono text-[11px] font-bold text-[#d97736]">{{ liveFill }}</span>
        </div>

        <div class="flex items-center gap-2">
          <input
            v-model="liveFill"
            @input="$emit('updateFill', liveFill)"
            type="color"
            class="w-8 h-8 p-0 rounded-lg border border-[#debfa8] cursor-pointer bg-white shrink-0"
          />
          <div class="flex flex-wrap gap-1">
            <button
              v-for="c in ['#ffffff', '#000000', '#facc15', '#ef4444', '#3b82f6', '#10b981']"
              :key="c"
              type="button"
              @click="liveFill = c; $emit('updateFill', c)"
              class="w-5 h-5 rounded-md border border-stone-300 cursor-pointer shadow-2xs hover:scale-115 transition-transform"
              :style="{ backgroundColor: c }"
            ></button>
          </div>
        </div>
      </div>

      <!-- COLUMNA 2: BORDE / STROKE (CON TOGGLE) -->
      <div class="p-3 bg-white border border-[#ebd8ca] rounded-xl flex flex-col justify-between space-y-2 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#523e32] flex items-center gap-1">
            <span>🔲</span>
            <span>Borde (Trazo)</span>
          </span>
          <label class="flex items-center gap-1 text-[11px] font-bold text-[#d97736] cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="hasStroke"
              @change="onToggleStroke"
              class="rounded accent-[#d97736] cursor-pointer"
            />
            <span>{{ hasStroke ? 'Activo' : 'Desactivado' }}</span>
          </label>
        </div>

        <div v-if="hasStroke" class="space-y-1.5 pt-0.5">
          <div class="flex items-center gap-2">
            <input
              v-model="liveStrokeColor"
              @input="onStrokeChange"
              type="color"
              class="w-7 h-7 p-0 rounded-md border border-[#debfa8] cursor-pointer bg-white shrink-0"
            />
            <div class="flex-1">
              <div class="flex justify-between text-[10px] text-[#8a6e60] font-semibold mb-0.5">
                <span>Grosor</span>
                <span class="font-mono text-[#d97736] font-bold">{{ strokeWidth }}px</span>
              </div>
              <input
                v-model.number="strokeWidth"
                @input="onStrokeChange"
                type="range"
                min="1"
                max="6"
                step="0.5"
                class="w-full accent-[#d97736] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
              />
            </div>
          </div>
        </div>
        <div v-else class="text-[10px] text-[#8a6e60] italic py-1">
          Sin borde exterior.
        </div>
      </div>

      <!-- COLUMNA 3: SOMBRA (CON TOGGLE) -->
      <div class="p-3 bg-white border border-[#ebd8ca] rounded-xl flex flex-col justify-between space-y-2 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-[#523e32] flex items-center gap-1">
            <span>🌑</span>
            <span>Sombra (Shadow)</span>
          </span>
          <label class="flex items-center gap-1 text-[11px] font-bold text-[#d97736] cursor-pointer select-none">
            <input
              type="checkbox"
              v-model="hasShadow"
              @change="onToggleShadow"
              class="rounded accent-[#d97736] cursor-pointer"
            />
            <span>{{ hasShadow ? 'Activa' : 'Desactivada' }}</span>
          </label>
        </div>

        <div v-if="hasShadow" class="pt-0.5">
          <button
            type="button"
            @click="showShadowPad = !showShadowPad"
            class="w-full py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-[11px] flex items-center justify-between cursor-pointer"
          >
            <span>🎯 Dirección 2D (Pad)</span>
            <span>{{ showShadowPad ? '▲ Ocultar Pad' : '▼ Ajustar Dirección' }}</span>
          </button>
        </div>
        <div v-else class="text-[10px] text-[#8a6e60] italic py-1">
          Sin sombra proyectada.
        </div>
      </div>
    </div>

    <!-- PAD 2D DESPLEGABLE CUANDO LA SOMBRA ESTÁ ACTIVA -->
    <div v-if="hasShadow && showShadowPad" class="pt-1 animate-fade-in">
      <ShadowPad
        :offset-x="shadowOffsetX"
        :offset-y="shadowOffsetY"
        :blur="shadowBlur"
        :color="shadowColor"
        :opacity="shadowOpacity"
        @update="$emit('updateShadow', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import ShadowPad from './ShadowPad.vue';

const props = defineProps<{
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
}>();

const emit = defineEmits<{
  (e: 'updateFill', color: string): void;
  (e: 'updateStroke', opts: { hasStroke: boolean; color: string; width: number }): void;
  (e: 'updateShadow', opts: { enabled?: boolean; offsetX?: number; offsetY?: number; blur?: number; color?: string; opacity?: number }): void;
}>();

const liveFill = ref(props.fill || '#ffffff');
const hasStroke = ref(Boolean(props.stroke && (props.strokeWidth ?? 0) > 0));
const liveStrokeColor = ref(props.stroke || '#000000');
const strokeWidth = ref(props.strokeWidth && props.strokeWidth > 0 ? Math.min(props.strokeWidth, 6) : 3);

const hasShadow = ref(Boolean(props.shadowColor && (props.shadowBlur ?? 0) > 0));
const showShadowPad = ref(true);

watch(
  () => props.fill,
  (val) => { if (val) liveFill.value = val; }
);

watch(
  () => [props.stroke, props.strokeWidth],
  ([stroke, width]) => {
    hasStroke.value = Boolean(stroke && (Number(width) > 0));
    if (stroke) liveStrokeColor.value = String(stroke);
    if (Number(width) > 0) strokeWidth.value = Math.min(Number(width), 6);
  }
);

watch(
  () => [props.shadowColor, props.shadowBlur],
  ([color, blur]) => {
    hasShadow.value = Boolean(color && Number(blur) > 0);
  }
);

const onToggleStroke = () => {
  emit('updateStroke', {
    hasStroke: hasStroke.value,
    color: liveStrokeColor.value,
    width: hasStroke.value ? strokeWidth.value : 0
  });
};

const onStrokeChange = () => {
  emit('updateStroke', {
    hasStroke: true,
    color: liveStrokeColor.value,
    width: strokeWidth.value
  });
};

const onToggleShadow = () => {
  if (hasShadow.value) {
    emit('updateShadow', {
      enabled: true,
      offsetX: props.shadowOffsetX || 0,
      offsetY: props.shadowOffsetY || 4,
      blur: props.shadowBlur || 10,
      color: props.shadowColor || '#000000',
      opacity: props.shadowOpacity || 0.6
    });
  } else {
    emit('updateShadow', { enabled: false });
  }
};
</script>
