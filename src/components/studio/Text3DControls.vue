<template>
  <CollapsibleSection
    title="Extrusión 3D (Bloque)"
    icon="🧊"
    :model-value="is3DActive"
    @change="toggle3D"
  >
    <!-- 1. Profundidad Slider -->
    <SliderControl
      label="Profundidad"
      :model-value="depth3D"
      :min="1"
      :max="25"
      :step="1"
      unit="px"
      @update:model-value="onDepthChange"
    />

      <!-- 2. Selector de Modo de Color 3D (Mismo color vs Color Fijo) -->
      <div>
        <span class="block text-[10px] font-bold uppercase text-text-main mb-1.5">Color del Relieve 3D</span>
        <div class="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-xl">
          <button
            type="button"
            @click="setColorMode('auto')"
            :class="[
              'py-1 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer',
              color3DMode === 'auto'
                ? 'bg-white text-primary-600 shadow-2xs border border-app-border'
                : 'text-text-muted hover:text-text-main'
            ]"
            title="Toma automáticamente los mismos colores del texto enriquecido"
          >
            <span>🎨</span>
            <span>Mismo color</span>
          </button>
          <button
            type="button"
            @click="setColorMode('custom')"
            :class="[
              'py-1 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer',
              color3DMode === 'custom'
                ? 'bg-white text-primary-600 shadow-2xs border border-app-border'
                : 'text-text-muted hover:text-text-main'
            ]"
            title="Usa un color plano personalizado"
          >
            <span>🖌️</span>
            <span>Color fijo</span>
          </button>
        </div>
      </div>

      <!-- 3. Sombreado de Profundidad (Modo Mismo Color) -->
      <div v-if="color3DMode === 'auto'" class="p-2.5 rounded-xl bg-white/70 border border-stone-200/70 space-y-1.5">
        <SliderControl
          label="Sombreado lateral (Relieve 3D)"
          :model-value="shading3D"
          :min="0"
          :max="80"
          :step="5"
          unit="%"
          @update:model-value="onShadingChange"
        />
        <p class="text-[10px] text-text-subtle leading-tight">
          Oscurece los laterales para dar perspectiva e iluminación tridimensional manteniendo los colores del texto.
        </p>
      </div>

      <!-- 4. Color Fijo Picker (si está en 'custom') & Dirección -->
      <div class="grid grid-cols-2 gap-2 pt-0.5 items-center">
        <!-- Color personalizado -->
        <div v-if="color3DMode === 'custom'">
          <span class="block text-[10px] font-bold uppercase text-text-main mb-1">Color 3D</span>
          <div class="flex items-center gap-2">
            <ColorPalettePicker
              :current-color="color3D"
              compact
              popover-align="left"
              title="Color de extrusión 3D"
              @live-change="onColorChange"
              @commit-change="onColorChange"
            />
            <span class="font-mono text-xs text-text-muted font-medium truncate">{{ color3D }}</span>
          </div>
        </div>
        <div v-else>
          <span class="block text-[10px] font-bold uppercase text-text-main mb-1">Tonalidad 3D</span>
          <span class="text-xs text-primary-600 font-bold flex items-center gap-1">
            <span>✨</span>
            <span>Heredada del texto</span>
          </span>
        </div>

        <!-- Dirección 2x2 -->
        <div>
          <span class="block text-[10px] font-bold uppercase text-text-main mb-1">Dirección</span>
          <div class="grid grid-cols-4 gap-1">
            <button
              v-for="d in directions"
              :key="d.id"
              type="button"
              @click="setDirection(d.dirX, d.dirY)"
              :class="[
                'p-1 text-xs rounded-lg border flex items-center justify-center font-bold cursor-pointer transition-all',
                currentDirX === d.dirX && currentDirY === d.dirY
                  ? 'bg-primary-500 text-white border-primary-600 shadow-2xs'
                  : 'bg-white text-stone-700 border-app-border hover:bg-stone-50'
              ]"
              :title="d.title"
            >
              <span>{{ d.symbol }}</span>
            </button>
          </div>
        </div>
      </div>
  </CollapsibleSection>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';
import ColorPalettePicker from '../common/ColorPalettePicker.vue';
import CollapsibleSection from '../common/CollapsibleSection.vue';
import SliderControl from '../common/SliderControl.vue';

const studio = useCanvasStudio();

const directions = [
  { id: 'br', symbol: '↘', dirX: 1, dirY: 1, title: 'Abajo a la derecha' },
  { id: 'bl', symbol: '↙', dirX: -1, dirY: 1, title: 'Abajo a la izquierda' },
  { id: 'tr', symbol: '↗', dirX: 1, dirY: -1, title: 'Arriba a la derecha' },
  { id: 'tl', symbol: '↖', dirX: -1, dirY: -1, title: 'Arriba a la izquierda' }
];

const is3DActive = computed(() => Boolean(studio?.activeElement.value?.is3D));
const depth3D = computed(() => {
  const d = studio?.activeElement.value?.depth3D;
  return (d !== undefined && !isNaN(Number(d))) ? Number(d) : 8;
});
const color3DMode = computed(() => studio?.activeElement.value?.color3DMode || 'auto');
const shading3D = computed(() => {
  const s = studio?.activeElement.value?.shading3D;
  return (s !== undefined && !isNaN(Number(s))) ? Number(s) : 35;
});
const color3D = computed(() => studio?.activeElement.value?.color3D || '#333333');
const currentDirX = computed(() => {
  const x = studio?.activeElement.value?.dirX3D;
  return (x !== undefined && !isNaN(Number(x))) ? Number(x) : 1;
});
const currentDirY = computed(() => {
  const y = studio?.activeElement.value?.dirY3D;
  return (y !== undefined && !isNaN(Number(y))) ? Number(y) : 1;
});

const toggle3D = (active: boolean | Event) => {
  const checked = typeof active === 'boolean' ? active : (active.target as HTMLInputElement).checked;
  studio?.change('text3D', {
    is3D: checked,
    depth: depth3D.value,
    colorMode: color3DMode.value,
    shading: shading3D.value,
    color: color3D.value,
    dirX: currentDirX.value,
    dirY: currentDirY.value
  });
};

const setColorMode = (mode: 'auto' | 'custom') => {
  studio?.change('text3D', {
    is3D: true,
    depth: depth3D.value,
    colorMode: mode,
    shading: shading3D.value,
    color: color3D.value,
    dirX: currentDirX.value,
    dirY: currentDirY.value
  });
};

const onShadingChange = (val: number) => {
  studio?.change('text3D', {
    is3D: true,
    depth: depth3D.value,
    colorMode: 'auto',
    shading: !isNaN(val) ? val : 35,
    color: color3D.value,
    dirX: currentDirX.value,
    dirY: currentDirY.value
  });
};

const onDepthChange = (val: number) => {
  studio?.change('text3D', {
    is3D: true,
    depth: !isNaN(val) ? val : 8,
    colorMode: color3DMode.value,
    shading: shading3D.value,
    color: color3D.value,
    dirX: currentDirX.value,
    dirY: currentDirY.value
  });
};

const onColorChange = (newColor: string) => {
  studio?.change('text3D', {
    is3D: true,
    depth: depth3D.value,
    colorMode: 'custom',
    shading: shading3D.value,
    color: newColor,
    dirX: currentDirX.value,
    dirY: currentDirY.value
  });
};

const setDirection = (dx: number, dy: number) => {
  studio?.change('text3D', {
    is3D: true,
    depth: depth3D.value,
    colorMode: color3DMode.value,
    shading: shading3D.value,
    color: color3D.value,
    dirX: dx,
    dirY: dy
  });
};
</script>
