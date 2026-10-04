<template>
  <div class="space-y-4" data-purpose="text-inspector-wrapper">
    <!-- 1. Editor de Texto Enriquecido TipTap (Contenido, Fuentes, Peso, Cursiva, Listas y Color) -->
    <RichTextEditor />

    <hr class="border-app-border" />

    <!-- 2. Estilos 1-Clic para Texto -->
    <div class="space-y-2.5">
      <span class="block text-xs font-bold text-text-main uppercase tracking-wider text-[11px]">
        Estilos 1-Clic:
      </span>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          @click="applyTextPreset('meme')"
          class="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-98"
        >
          <span>💥</span>
          <span>Meme Clásico</span>
        </button>
        <button
          type="button"
          @click="applyTextPreset('sticker')"
          class="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-900 border border-primary-300 font-bold text-xs transition-colors cursor-pointer active:scale-98"
        >
          <span>✨</span>
          <span>Sticker</span>
        </button>
        <button
          type="button"
          @click="applyTextPreset('neon')"
          class="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 font-bold text-xs transition-colors cursor-pointer active:scale-98"
        >
          <span>💡</span>
          <span>Neón</span>
        </button>
        <button
          type="button"
          @click="applyTextPreset('soft-shadow')"
          class="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-bold text-xs transition-colors cursor-pointer active:scale-98"
        >
          <span>🌑</span>
          <span>Sombra</span>
        </button>
        <button
          type="button"
          @click="applyTextPreset('clean')"
          class="col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs transition-colors cursor-pointer active:scale-98"
        >
          <span>🌸</span>
          <span>Plano Limpio</span>
        </button>
      </div>
    </div>

    <hr class="border-app-border" />

    <!-- 3. Orientación & Posición (Sumado a texto igual que en emoji/imagen) -->
    <div class="space-y-2.5">
      <span class="block text-xs font-bold text-text-main uppercase tracking-wider text-[11px]">
        Orientación & Posición:
      </span>
      <div class="grid grid-cols-4 gap-1.5">
        <button
          type="button"
          @click="studio?.change('flipH')"
          class="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white border border-app-border hover:bg-primary-50 hover:border-primary-400 text-text-main text-[11px] font-semibold cursor-pointer shadow-2xs transition-colors"
          title="Reflejar Horizontalmente"
        >
          <span class="text-sm">↔️</span>
          <span>Reflejar</span>
        </button>
        <button
          type="button"
          @click="studio?.change('flipV')"
          class="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white border border-app-border hover:bg-primary-50 hover:border-primary-400 text-text-main text-[11px] font-semibold cursor-pointer shadow-2xs transition-colors"
          title="Invertir Verticalmente"
        >
          <span class="text-sm">↕️</span>
          <span>Invertir</span>
        </button>
        <button
          type="button"
          @click="studio?.change('center')"
          class="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white border border-app-border hover:bg-primary-50 hover:border-primary-400 text-text-main text-[11px] font-semibold cursor-pointer shadow-2xs transition-colors"
          title="Centrar en el lienzo"
        >
          <span class="text-sm">🎯</span>
          <span>Centrar</span>
        </button>
        <button
          type="button"
          @click="studio?.change('rotate', 90)"
          class="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white border border-app-border hover:bg-primary-50 hover:border-primary-400 text-text-main text-[11px] font-semibold cursor-pointer shadow-2xs transition-colors"
          title="Girar 90 grados"
        >
          <span class="text-sm">🔄</span>
          <span>Rotar 90°</span>
        </button>
      </div>
    </div>

    <hr class="border-app-border" />

    <!-- 4. Borde / Trazo Exterior -->
    <div class="p-3.5 rounded-2xl bg-app-header/60 border border-app-border space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-3.5 h-3.5 rounded-md border-2 border-stone-700"></span>
          <span class="text-xs font-bold text-text-main">Borde (Trazo)</span>
        </div>
        <label class="inline-flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="hasStroke"
            @change="onToggleStroke"
            class="rounded border-stone-300 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5 accent-primary-600 cursor-pointer"
          />
          <span :class="['text-xs font-bold', hasStroke ? 'text-primary-600' : 'text-text-muted']">
            {{ hasStroke ? 'Activo' : 'Desactivado' }}
          </span>
        </label>
      </div>

      <div v-if="hasStroke" class="pt-1 space-y-2.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-text-muted font-medium">Grosor de contorno</span>
          <span class="font-mono font-bold text-primary-600">{{ strokeWidth }}px</span>
        </div>
        <div class="flex items-center gap-3">
          <ColorPalettePicker
            :current-color="strokeColor"
            compact
            popover-align="left"
            title="Color de borde / contorno"
            @live-change="onStrokeColorChange"
            @commit-change="onStrokeColorChange"
          />
          <input
            type="range"
            v-model.number="strokeWidth"
            @input="onStrokeChange"
            min="1"
            max="15"
            step="0.5"
            class="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
        </div>
      </div>
      <p v-else class="text-xs text-text-subtle italic">Sin borde exterior.</p>
    </div>

    <!-- 5. Efecto 3D (Extrusión) -->
    <Text3DControls />

    <!-- 6. Sombra Exterior -->
    <div class="p-3.5 rounded-2xl bg-app-header/60 border border-app-border space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-3.5 h-3.5 rounded-full bg-purple-600 shadow-md"></span>
          <span class="text-xs font-bold text-text-main">Sombra (Shadow)</span>
        </div>
        <label class="inline-flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            v-model="hasShadow"
            @change="onToggleShadow"
            class="rounded border-stone-300 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5 accent-primary-600 cursor-pointer"
          />
          <span :class="['text-xs font-bold', hasShadow ? 'text-primary-600' : 'text-text-muted']">
            {{ hasShadow ? 'Activa' : 'Desactivada' }}
          </span>
        </label>
      </div>

      <div v-if="hasShadow" class="pt-1">
        <ShadowPad />
      </div>
      <p v-else class="text-xs text-text-subtle italic">Sin sombra proyectada.</p>
    </div>

    <!-- 7. Filtros: Desenfoque & Contraste -->
    <FilterControls />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';
import RichTextEditor from './RichTextEditor.vue';
import ShadowPad from './ShadowPad.vue';
import ColorPalettePicker from './ColorPalettePicker.vue';
import Text3DControls from './Text3DControls.vue';
import FilterControls from './FilterControls.vue';

const studio = useCanvasStudio();

const hasStroke = ref(false);
const strokeColor = ref('#000000');
const strokeWidth = ref(3);

const hasShadow = ref(false);

watch(
  () => studio?.activeElement.value,
  (el) => {
    if (!el || el.type !== 'Texto') return;
    hasStroke.value = Boolean(el.hasStroke && el.stroke);
    strokeColor.value = el.stroke || '#000000';
    strokeWidth.value = el.strokeWidth || 3;
    hasShadow.value = Boolean(el.hasShadow);
  },
  { immediate: true }
);

const onToggleStroke = () => {
  studio?.change('stroke', {
    hasStroke: hasStroke.value,
    color: strokeColor.value,
    width: hasStroke.value ? strokeWidth.value : 0
  });
};

const onStrokeChange = () => {
  studio?.change('stroke', {
    hasStroke: true,
    color: strokeColor.value,
    width: strokeWidth.value
  });
};

const onStrokeColorChange = (newColor: string) => {
  strokeColor.value = newColor;
  studio?.change('stroke', {
    hasStroke: true,
    color: newColor,
    width: strokeWidth.value
  });
};

const onToggleShadow = () => {
  if (hasShadow.value) {
    studio?.change('shadow', {
      enabled: true,
      offsetX: studio?.activeElement.value?.shadowOffsetX || 0,
      offsetY: studio?.activeElement.value?.shadowOffsetY || 4,
      blur: studio?.activeElement.value?.shadowBlur || 10,
      color: studio?.activeElement.value?.shadowColor || '#000000',
      opacity: studio?.activeElement.value?.shadowOpacity || 0.6
    });
  } else {
    studio?.change('shadow', { enabled: false });
  }
};

const applyTextPreset = (preset: string) => {
  studio?.change('textPreset', preset);
  setTimeout(() => {
    if (studio?.activeElement.value) {
      hasStroke.value = Boolean(studio.activeElement.value.hasStroke);
      strokeColor.value = studio.activeElement.value.stroke || '#000000';
      strokeWidth.value = studio.activeElement.value.strokeWidth || 3;
      hasShadow.value = Boolean(studio.activeElement.value.hasShadow);
    }
  }, 40);
};
</script>
