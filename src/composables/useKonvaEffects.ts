import { computed } from 'vue';
import type { useKonvaStage } from './useKonvaStage';

export interface StickerOptions {
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetY?: number;
}

export interface GlowOptions {
  color?: string;
  blur?: number;
  opacity?: number;
}

export interface CustomShadowOptions {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
}

export function useKonvaEffects(stageContext: ReturnType<typeof useKonvaStage>, onUpdate?: () => void) {
  const { selectedNode, layerInstance, transformerInstance, canvasWidth, canvasHeight } = stageContext;

  const isNodeSelected = computed(() => !!selectedNode.value);
  const isNodeLocked = computed(() => selectedNode.value?.hasName('locked') ?? false);

  const notifyChange = () => {
    onUpdate?.();
  };

  const flipHorizontal = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    const currentScale = selectedNode.value.scaleX() || 1;
    selectedNode.value.scaleX(currentScale * -1);
    layerInstance.value.draw();
    notifyChange();
  };

  const flipVertical = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    const currentScale = selectedNode.value.scaleY() || 1;
    selectedNode.value.scaleY(currentScale * -1);
    layerInstance.value.draw();
    notifyChange();
  };

  const rotateCW = (degrees = 90) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const currentRotation = selectedNode.value.rotation() || 0;
    selectedNode.value.rotation((currentRotation + degrees) % 360);
    layerInstance.value.draw();
    notifyChange();
  };

  const centerNode = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    selectedNode.value.x(canvasWidth.value / 2);
    selectedNode.value.y(canvasHeight.value / 2);
    layerInstance.value.draw();
    notifyChange();
  };

  const applyStickerEffect = (options?: StickerOptions) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;

    const strokeColor = options?.strokeColor ?? '#ffffff';
    const strokeWidth = options?.strokeWidth ?? 12;
    const shadowColor = options?.shadowColor ?? 'rgba(0, 0, 0, 0.4)';
    const shadowBlur = options?.shadowBlur ?? 14;
    const shadowOffsetY = options?.shadowOffsetY ?? 6;

    node.stroke(strokeColor);
    node.strokeWidth(strokeWidth);
    node.shadowColor(shadowColor);
    node.shadowBlur(shadowBlur);
    node.shadowOffsetX(0);
    node.shadowOffsetY(shadowOffsetY);
    node.shadowOpacity(0.75);

    layerInstance.value.draw();
    notifyChange();
  };

  const applyGlowEffect = (color = '#ff007f', blur = 24, opacity = 0.9) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;

    node.shadowColor(color);
    node.shadowBlur(blur);
    node.shadowOffsetX(0);
    node.shadowOffsetY(0);
    node.shadowOpacity(opacity);

    layerInstance.value.draw();
    notifyChange();
  };

  const setCustomShadow = (options: CustomShadowOptions) => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;

    node.shadowColor(options.color);
    node.shadowBlur(options.blur);
    node.shadowOffsetX(options.offsetX);
    node.shadowOffsetY(options.offsetY);
    node.shadowOpacity(options.opacity);

    layerInstance.value.draw();
    notifyChange();
  };

  const removeEffects = () => {
    if (!selectedNode.value || !layerInstance.value) return;
    const node = selectedNode.value;

    node.stroke(undefined);
    node.strokeWidth(0);
    node.shadowColor(undefined);
    node.shadowBlur(0);
    node.shadowOffsetX(0);
    node.shadowOffsetY(0);
    node.shadowOpacity(0);

    layerInstance.value.draw();
    notifyChange();
  };

  const toggleLock = (targetNode = selectedNode.value) => {
    if (!targetNode || !layerInstance.value) return;

    const isLocked = targetNode.hasName('locked');
    if (isLocked) {
      targetNode.removeName('locked');
      targetNode.addName('selectable');
      targetNode.draggable(true);
    } else {
      targetNode.removeName('selectable');
      targetNode.addName('locked');
      targetNode.draggable(false);
      if (transformerInstance.value?.nodes().includes(targetNode)) {
        transformerInstance.value.nodes([]);
      }
    }

    layerInstance.value.draw();
    notifyChange();
  };

  const applyImagePreset = (preset: 'sticker' | 'neon' | 'soft-shadow' | 'clean', customColor?: string) => {
    if (!selectedNode.value || !layerInstance.value) return;

    switch (preset) {
      case 'sticker':
        applyStickerEffect({
          strokeColor: '#ffffff',
          strokeWidth: 12,
          shadowColor: 'rgba(0, 0, 0, 0.35)',
          shadowBlur: 14,
          shadowOffsetY: 6
        });
        break;
      case 'neon':
        applyGlowEffect(customColor || '#00f0ff', 24, 0.9);
        break;
      case 'soft-shadow':
        setCustomShadow({
          color: 'rgba(0, 0, 0, 0.45)',
          blur: 18,
          offsetX: 0,
          offsetY: 8,
          opacity: 0.7
        });
        break;
      case 'clean':
        removeEffects();
        break;
    }
  };

  return {
    isNodeSelected,
    isNodeLocked,
    flipHorizontal,
    flipVertical,
    rotateCW,
    centerNode,
    applyStickerEffect,
    applyGlowEffect,
    setCustomShadow,
    applyImagePreset,
    removeEffects,
    toggleLock
  };
}
