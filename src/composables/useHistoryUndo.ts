import { ref, computed } from 'vue';
import { serializeCanvasState, restoreCanvasState } from '../utils/canvasHistorySerializer';

export function useHistoryUndo(
  stageContext: any,
  layersContext: any
) {
  const historyStack = ref<string[]>([]);
  const historyStep = ref(-1);
  const maxHistorySteps = 30;
  let isPerformingUndoRedo = false;
  let debounceTimer: any = null;

  const canUndo = computed(() => historyStep.value > 0);
  const canRedo = computed(() => historyStep.value < historyStack.value.length - 1);

  const captureCurrentPayload = (): string => {
    const layer = stageContext?.layerInstance?.value || stageContext?.layerInstance;
    const selected = stageContext?.selectedNode?.value || stageContext?.selectedNode || layersContext?.selectedNode?.value || layersContext?.selectedNode;
    return serializeCanvasState(layer, selected);
  };

  const saveStateImmediate = () => {
    if (isPerformingUndoRedo) return;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    const payload = captureCurrentPayload();

    // Si estamos en un paso anterior, descartar historial posterior
    if (historyStep.value < historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, historyStep.value + 1);
    }

    // Evitar estados duplicados si los nodos no cambiaron
    if (historyStack.value.length > 0) {
      const lastPayloadStr = historyStack.value[historyStack.value.length - 1];
      try {
        const lastSnapshot = JSON.parse(lastPayloadStr);
        const currSnapshot = JSON.parse(payload);
        if (JSON.stringify(lastSnapshot.nodes) === JSON.stringify(currSnapshot.nodes)) {
          lastSnapshot.selectedNodeIndex = currSnapshot.selectedNodeIndex;
          historyStack.value[historyStack.value.length - 1] = JSON.stringify(lastSnapshot);
          return;
        }
      } catch {
        if (lastPayloadStr === payload) return;
      }
    }

    historyStack.value.push(payload);
    if (historyStack.value.length > maxHistorySteps) {
      historyStack.value.shift();
    } else {
      historyStep.value++;
    }
  };

  const saveState = (immediate = false) => {
    if (isPerformingUndoRedo) return;
    if (immediate) {
      saveStateImmediate();
    } else {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        saveStateImmediate();
      }, 200);
    }
  };

  const flushPendingSave = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
      saveStateImmediate();
    }
  };

  const undo = () => {
    flushPendingSave();
    if (!canUndo.value) return;

    isPerformingUndoRedo = true;
    historyStep.value--;
    const state = historyStack.value[historyStep.value];
    if (state) {
      restoreCanvasState(state, stageContext, layersContext);
    }
    isPerformingUndoRedo = false;
  };

  const redo = () => {
    flushPendingSave();
    if (!canRedo.value) return;

    isPerformingUndoRedo = true;
    historyStep.value++;
    const state = historyStack.value[historyStep.value];
    if (state) {
      restoreCanvasState(state, stageContext, layersContext);
    }
    isPerformingUndoRedo = false;
  };

  return {
    canUndo,
    canRedo,
    historyStep,
    historyStack,
    saveState,
    flushPendingSave,
    undo,
    redo
  };
}
