<template>
  <div class="space-y-4 relative" data-purpose="emoji-inspector-wrapper">
    <!-- 1. Emoji Actual & Atajo de Emojis Rápidos -->
    <EmojiQuickSelector
      :model-value="activeEmojiChar"
      title="Cambiar Emoji"
      icon="✨"
      storage-key="pixemoji_shortcut_emojis"
      @select="selectEmojiChar"
    />

    <!-- 2. Efectos 1-Clic para Emoji -->
    <EffectPresetsGrid mode="object" />

    <hr class="border-app-border" />

    <!-- 3. Orientación & Posición -->
    <TransformActionsGrid />

    <hr class="border-app-border" />

    <!-- 4. Sombra 2D & Resplandor -->
    <div class="space-y-2.5">
      <span class="block text-xs font-bold text-text-main uppercase tracking-wider text-[11px]">
        Sombra & Dirección 2D:
      </span>
      <ShadowPad />
    </div>

    <!-- 5. Filtros: Desenfoque & Contraste -->
    <FilterControls />

    <!-- 6. Recorte de Dimensiones (Crop) -->
    <CropControls />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';
import EmojiQuickSelector from '../common/EmojiQuickSelector.vue';
import ShadowPad from './ShadowPad.vue';
import FilterControls from './FilterControls.vue';
import CropControls from './CropControls.vue';
import EffectPresetsGrid from '../common/EffectPresetsGrid.vue';
import TransformActionsGrid from '../common/TransformActionsGrid.vue';

const studio = useCanvasStudio();

const activeEmojiChar = computed(() => {
  const nodeText = studio?.activeElement.value?.text || '';
  return nodeText || '🧁';
});

const selectEmojiChar = (char: string) => {
  studio?.change('text', char);
};
</script>
