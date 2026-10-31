import { inject, provide, type InjectionKey, type ShallowRef, type Ref, type ComputedRef } from 'vue';
import type { useKonvaStage } from './useKonvaStage';
import type { useKonvaLayers, LayerItem, ActiveElementState, TextNodeOptions, CustomShadowOptions, StickerOptions } from './useKonvaLayers';
import type { useHistoryUndo } from './useHistoryUndo';
import type { useCanvasFrame } from './useCanvasFrame';

export type ActiveElementSnapshot = ActiveElementState;

export type StudioAction =
  | 'text'
  | 'font'
  | 'fontStyle'
  | 'textPreset'
  | 'imagePreset'
  | 'replaceImage'
  | 'crop'
  | 'shadow'
  | 'filter'
  | 'opacity'
  | 'text3D'
  | 'stroke'
  | 'fill'
  | 'flipH'
  | 'flipV'
  | 'rotate'
  | 'resetOrientation'
  | 'center'
  | 'lock'
  | 'toggleLock'
  | 'delete'
  | 'duplicate'
  | 'bringToFront'
  | 'sendToBack'
  | 'moveUp'
  | 'moveDown'
  | 'reorder'
  | 'clearAll';

export interface CanvasStudioContext {
  stage: ReturnType<typeof useKonvaStage>;
  layers: ReturnType<typeof useKonvaLayers>;
  history: ReturnType<typeof useHistoryUndo>;
  frame?: ReturnType<typeof useCanvasFrame>;
  activeElement: ShallowRef<ActiveElementSnapshot | null>;
  layersList: Ref<LayerItem[]>;
  layersListReversed: ComputedRef<LayerItem[]>;
  canUndo: ComputedRef<boolean>;
  canRedo: ComputedRef<boolean>;
  undo: () => void;
  redo: () => void;
  change: (action: StudioAction, payload?: any) => void;
  selectNode: (node: any) => void;
}

export const CANVAS_STUDIO_KEY: InjectionKey<CanvasStudioContext> = Symbol('CANVAS_STUDIO_CONTEXT');

export function createStudioContext(
  stage: ReturnType<typeof useKonvaStage>,
  layers: ReturnType<typeof useKonvaLayers>,
  history: ReturnType<typeof useHistoryUndo>,
  frame?: ReturnType<typeof useCanvasFrame>
): CanvasStudioContext {


  const change = (action: StudioAction, payload?: any) => {
    let isDiscrete = true;

    switch (action) {
      case 'text':
        if (typeof payload === 'string') {
          layers.updateSelectedText({ text: payload });
        } else {
          layers.updateSelectedText(payload);
        }
        isDiscrete = false;
        break;
      case 'font':
        layers.updateSelectedText({ fontFamily: payload });
        isDiscrete = true;
        break;
      case 'fontStyle':
        layers.updateSelectedText({ fontStyle: payload });
        isDiscrete = true;
        break;
      case 'replaceImage':
        layers.replaceSelectedImage(payload);
        isDiscrete = true;
        break;
      case 'textPreset':
        layers.applyTextPreset(payload);
        isDiscrete = true;
        break;
      case 'imagePreset':
        if (typeof payload === 'string') {
          layers.applyImagePreset(payload as any);
        } else if (payload && typeof payload === 'object') {
          layers.applyImagePreset(payload.preset, payload.color);
        }
        isDiscrete = true;
        break;
      case 'shadow':
        layers.updateSelectedShadow(payload);
        isDiscrete = false;
        break;
      case 'filter':
        layers.updateSelectedFilters(payload);
        isDiscrete = false;
        break;
      case 'opacity':
        layers.updateSelectedOpacity(payload);
        isDiscrete = false;
        break;
      case 'crop':
        layers.updateSelectedCrop(payload);
        isDiscrete = false;
        break;
      case 'text3D':
        layers.updateSelectedText3D(payload);
        isDiscrete = false;
        break;
      case 'stroke':
        layers.updateSelectedStroke(payload);
        isDiscrete = false;
        break;
      case 'fill':
        layers.updateSelectedText({ textColor: payload });
        isDiscrete = false;
        break;
      case 'flipH':
        layers.flipHorizontal();
        isDiscrete = true;
        break;
      case 'flipV':
        layers.flipVertical();
        isDiscrete = true;
        break;
      case 'rotate':
        layers.rotateCW(typeof payload === 'number' ? payload : 90);
        isDiscrete = true;
        break;
      case 'resetOrientation':
        layers.resetOrientation();
        isDiscrete = true;
        break;
      case 'center':
        layers.centerNode();
        isDiscrete = true;
        break;
      case 'lock':
      case 'toggleLock':
        layers.toggleLock(payload);
        isDiscrete = true;
        break;
      case 'delete':
        if (payload) {
          layers.removeLayer(payload);
        } else {
          layers.deleteSelected();
        }
        isDiscrete = true;
        break;
      case 'duplicate':
        layers.duplicateSelected();
        isDiscrete = true;
        break;
      case 'bringToFront':
        layers.bringToFront();
        isDiscrete = true;
        break;
      case 'sendToBack':
        layers.sendToBack();
        isDiscrete = true;
        break;
      case 'moveUp':
        layers.moveLayerUp(payload);
        isDiscrete = true;
        break;
      case 'moveDown':
        layers.moveLayerDown(payload);
        isDiscrete = true;
        break;
      case 'reorder':
        if (payload && typeof payload.fromIndex === 'number' && typeof payload.toIndex === 'number') {
          layers.reorderLayerByIndex(payload.fromIndex, payload.toIndex);
        }
        isDiscrete = true;
        break;
      case 'clearAll':
        layers.clearAll();
        isDiscrete = true;
        break;
    }

    history.saveState(isDiscrete);
  };

  return {
    stage,
    layers,
    history,
    frame,
    activeElement: layers.activeElement,
    layersList: layers.layersList,
    layersListReversed: layers.layersListReversed,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undo: history.undo,
    redo: history.redo,
    change,
    selectNode: stage.selectNode
  };
}

export function provideCanvasStudio(context: CanvasStudioContext) {
  provide(CANVAS_STUDIO_KEY, context);
}

export function useCanvasStudio(): CanvasStudioContext | null {
  return inject(CANVAS_STUDIO_KEY, null);
}
