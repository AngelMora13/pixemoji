import { ref, computed } from 'vue';

export function useHistoryUndo(
  layerInstanceGetter: () => any,
  transformerInstanceGetter: () => any,
  onRestoreCallback: () => void
) {
  const historyStack = ref<string[]>([]);
  const historyStep = ref(-1);
  const maxHistorySteps = 20;
  let isPerformingUndoRedo = false;

  const canUndo = computed(() => historyStep.value > 0);
  const canRedo = computed(() => historyStep.value < historyStack.value.length - 1);

  const saveState = () => {
    if (isPerformingUndoRedo) return;
    const layer = layerInstanceGetter();
    if (!layer) return;

    // Snapshot of user elements (excluding transformer and background rect)
    const nodes = layer.getChildren((n: any) => {
      return n.hasName('selectable') || n.hasName('locked') || n.hasName('patternItem');
    });

    const payload = JSON.stringify(nodes.map((n: any) => n.toObject()));

    // Discard any forward steps if we're branching from the past
    if (historyStep.value < historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, historyStep.value + 1);
    }

    // Avoid duplicate adjacent states
    if (historyStack.value.length > 0 && historyStack.value[historyStack.value.length - 1] === payload) {
      return;
    }

    historyStack.value.push(payload);
    if (historyStack.value.length > maxHistorySteps) {
      historyStack.value.shift();
    } else {
      historyStep.value++;
    }
  };

  const undo = () => {
    if (!canUndo.value) return;
    const layer = layerInstanceGetter();
    if (!layer) return;

    isPerformingUndoRedo = true;
    historyStep.value--;
    const state = historyStack.value[historyStep.value];
    if (state) {
      restoreState(state);
    }
    isPerformingUndoRedo = false;
  };

  const redo = () => {
    if (!canRedo.value) return;
    const layer = layerInstanceGetter();
    if (!layer) return;

    isPerformingUndoRedo = true;
    historyStep.value++;
    const state = historyStack.value[historyStep.value];
    if (state) {
      restoreState(state);
    }
    isPerformingUndoRedo = false;
  };

  const restoreState = (jsonString: string) => {
    const layer = layerInstanceGetter();
    const transformer = transformerInstanceGetter();
    if (!layer) return;

    // Clear active transformer selection
    if (transformer) {
      transformer.nodes([]);
    }

    // Destroy existing user nodes
    const existing = layer.getChildren((n: any) => {
      return n.hasName('selectable') || n.hasName('locked') || n.hasName('patternItem');
    });
    existing.forEach((n: any) => n.destroy());

    // Recreate nodes from payload
    try {
      const nodesData = JSON.parse(jsonString);
      const Konva = (window as any).Konva;
      if (Konva && Array.isArray(nodesData)) {
        nodesData.forEach((nodeObj: any) => {
          const node = Konva.Node.create(nodeObj);
          layer.add(node);
        });
      }

      if (transformer) {
        transformer.moveToTop();
      }

      layer.draw();
      onRestoreCallback();
    } catch (e) {
      console.error('Error restoring state in undo/redo:', e);
    }
  };

  return {
    canUndo,
    canRedo,
    saveState,
    undo,
    redo
  };
}
