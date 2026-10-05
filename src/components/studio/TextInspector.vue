<template>
  <div class="space-y-4" data-purpose="text-inspector-wrapper">
    <!-- 1. Editor de Texto Enriquecido TipTap (Contenido, Fuentes, Peso, Cursiva, Listas y Color) -->
    <RichTextEditor />

    <hr class="border-app-border" />

    <!-- 2. Estilos 1-Clic para Texto -->
    <EffectPresetsGrid mode="text" title="Estilos 1-Clic:" @select="applyTextPreset" />

    <hr class="border-app-border" />

    <!-- 3. Orientación & Posición -->
    <TransformActionsGrid />

    <hr class="border-app-border" />

    <!-- 4. Borde / Trazo Exterior -->
    <CollapsibleSection
      title="Borde (Trazo)"
      v-model="hasStroke"
      empty-text="Sin borde exterior."
      @change="onToggleStroke"
    >
      <template #icon>
        <span class="w-3.5 h-3.5 rounded-md border-2 border-stone-700"></span>
      </template>

      <div class="flex items-center gap-3">
        <ColorPalettePicker
          :current-color="strokeColor"
          compact
          popover-align="left"
          title="Color de borde / contorno"
          @live-change="onStrokeColorChange"
          @commit-change="onStrokeColorChange"
        />
        <div class="flex-1">
          <SliderControl
            label="Grosor de contorno"
            v-model="strokeWidth"
            :min="1"
            :max="15"
            :step="0.5"
            unit="px"
            @change="onStrokeChange"
          />
        </div>
      </div>
    </CollapsibleSection>

    <!-- 5. Efecto 3D (Extrusión) -->
    <Text3DControls />

    <!-- 6. Sombra Exterior -->
    <CollapsibleSection
      title="Sombra (Shadow)"
      v-model="hasShadow"
      dot-color="#9333ea"
      empty-text="Sin sombra proyectada."
      @change="onToggleShadow"
    >
      <ShadowPad />
    </CollapsibleSection>

    <!-- 7. Filtros: Desenfoque & Contraste -->
    <FilterControls />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';
import RichTextEditor from './RichTextEditor.vue';
import ShadowPad from './ShadowPad.vue';
import ColorPalettePicker from '../common/ColorPalettePicker.vue';
import Text3DControls from './Text3DControls.vue';
import FilterControls from './FilterControls.vue';
import EffectPresetsGrid from '../common/EffectPresetsGrid.vue';
import TransformActionsGrid from '../common/TransformActionsGrid.vue';
import CollapsibleSection from '../common/CollapsibleSection.vue';
import SliderControl from '../common/SliderControl.vue';

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
