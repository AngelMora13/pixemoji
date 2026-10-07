import { ref, computed } from 'vue';
import type { useKonvaStage } from './useKonvaStage';
import { applyFrameToExport, type useCanvasFrame } from './useCanvasFrame';

export function useCanvasExport(
  stageContext: ReturnType<typeof useKonvaStage>,
  frameContext?: ReturnType<typeof useCanvasFrame>
) {
  const { stageInstance, layerInstance, transformerInstance, selectedNode, canvasWidth, canvasHeight } = stageContext;

  const exportScale = ref(2); // Por defecto 2x HD para redes sociales
  const copied = ref(false);

  const effectiveWidth = computed(() => {
    return canvasWidth.value;
  });

  const effectiveHeight = computed(() => {
    return canvasHeight.value;
  });

  const exportResolutionLabel = computed(() => {
    const w = effectiveWidth.value * exportScale.value;
    const h = effectiveHeight.value * exportScale.value;
    return `${w}×${h}px`;
  });

  const getCanvasDataUrl = async (): Promise<string | null> => {
    if (!stageInstance.value || !layerInstance.value) return null;

    // Ocultar temporalmente el transformer antes de la captura
    const activeNode = selectedNode.value;
    if (transformerInstance.value) {
      transformerInstance.value.nodes([]);
      layerInstance.value.draw();
    }

    const rawDataUrl = stageInstance.value.toDataURL({
      pixelRatio: exportScale.value,
      mimeType: 'image/png'
    });

    // Restaurar transformer si había un nodo activo
    if (transformerInstance.value && activeNode) {
      transformerInstance.value.nodes([activeNode]);
      layerInstance.value.draw();
    }

    // Aplicar recorte suave con border-radius si corresponde
    const r = frameContext?.borderRadius.value ?? 0;
    const isFrameActive = frameContext?.active.value ?? false;
    const m = frameContext?.margin.value ?? 0;
    if (r > 0) {
      return await applyFrameToExport(
        rawDataUrl,
        stageInstance.value.width(),
        stageInstance.value.height(),
        exportScale.value,
        r,
        isFrameActive,
        m
      );
    }

    return rawDataUrl;
  };

  const downloadPng = async (fileNamePrefix = 'pixemoji') => {
    const dataUrl = await getCanvasDataUrl();
    if (!dataUrl) return;

    const cleanName = fileNamePrefix.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${cleanName}-${exportResolutionLabel.value}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyToClipboard = async () => {
    const dataUrl = await getCanvasDataUrl();
    if (!dataUrl) return;

    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2500);
    } catch {
      alert('Tu navegador no permitió copiar la imagen directamente al portapapeles.');
    }
  };

  return {
    exportScale,
    copied,
    exportResolutionLabel,
    effectiveWidth,
    effectiveHeight,
    getCanvasDataUrl,
    downloadPng,
    copyToClipboard
  };
}
