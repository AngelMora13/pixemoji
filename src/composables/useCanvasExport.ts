import { ref, computed } from 'vue';
import type { useKonvaStage } from './useKonvaStage';

export function useCanvasExport(stageContext: ReturnType<typeof useKonvaStage>) {
  const { stageInstance, layerInstance, transformerInstance, selectedNode, canvasWidth, canvasHeight } = stageContext;

  const exportScale = ref(2); // Por defecto 2x HD para redes sociales
  const copied = ref(false);

  const exportResolutionLabel = computed(() => {
    const w = canvasWidth.value * exportScale.value;
    const h = canvasHeight.value * exportScale.value;
    return `${w}×${h}px`;
  });

  const getCanvasDataUrl = () => {
    if (!stageInstance.value || !layerInstance.value) return null;

    // Ocultar temporalmente el transformer antes de la captura
    const activeNode = selectedNode.value;
    if (transformerInstance.value) {
      transformerInstance.value.nodes([]);
      layerInstance.value.draw();
    }

    const dataUrl = stageInstance.value.toDataURL({
      pixelRatio: exportScale.value,
      mimeType: 'image/png'
    });

    // Restaurar transformer si había un nodo activo
    if (transformerInstance.value && activeNode) {
      transformerInstance.value.nodes([activeNode]);
      layerInstance.value.draw();
    }

    return dataUrl;
  };

  const downloadPng = (fileNamePrefix = 'pixemoji') => {
    const dataUrl = getCanvasDataUrl();
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
    const dataUrl = getCanvasDataUrl();
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
    downloadPng,
    copyToClipboard
  };
}
