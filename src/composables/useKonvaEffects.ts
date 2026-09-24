import { computed } from 'vue';
import type { useKonvaStage } from './useKonvaStage';
import type { useKonvaLayers, StickerOptions, CustomShadowOptions } from './useKonvaLayers';

export type { StickerOptions, CustomShadowOptions };

export interface GlowOptions {
  color?: string;
  blur?: number;
  opacity?: number;
}

export function useKonvaEffects(
  stageContext: ReturnType<typeof useKonvaStage>,
  layersContext: ReturnType<typeof useKonvaLayers>
) {
  return {
    isNodeSelected: computed(() => !!stageContext.selectedNode.value),
    isNodeLocked: computed(() => stageContext.selectedNode.value?.hasName('locked') ?? false),
    flipHorizontal: layersContext.flipHorizontal,
    flipVertical: layersContext.flipVertical,
    rotateCW: layersContext.rotateCW,
    centerNode: layersContext.centerNode,
    applyStickerEffect: layersContext.applyStickerEffect,
    applyGlowEffect: layersContext.applyGlowEffect,
    setCustomShadow: layersContext.setCustomShadow,
    applyImagePreset: layersContext.applyImagePreset,
    removeEffects: layersContext.removeEffects,
    toggleLock: layersContext.toggleLock
  };
}
