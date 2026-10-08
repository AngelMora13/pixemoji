import { ref, computed } from 'vue';
import type { useKonvaStage } from './useKonvaStage';
import { applyFrameToExport, type useCanvasFrame } from './useCanvasFrame';

export type CanvasExportFormat = 'png' | 'webp' | 'jpeg';

export function useCanvasExport(
  stageContext: ReturnType<typeof useKonvaStage>,
  frameContext?: ReturnType<typeof useCanvasFrame>
) {
  const { stageInstance, layerInstance, transformerInstance, selectedNode, canvasWidth, canvasHeight } = stageContext;

  const exportScale = ref(2); // Por defecto 2x HD para redes sociales
  const exportFormat = ref<CanvasExportFormat>('png');
  const copied = ref(false);

  const effectiveWidth = computed(() => {
    return canvasWidth.value;
  });

  const effectiveHeight = computed(() => {
    return canvasHeight.value;
  });

  const exportResolutionLabel = computed(() => {
    const w = Math.round(effectiveWidth.value * exportScale.value);
    const h = Math.round(effectiveHeight.value * exportScale.value);
    return `${w}×${h}px`;
  });

  const getCanvasDataUrl = async (format: CanvasExportFormat = exportFormat.value): Promise<string | null> => {
    if (!stageInstance.value || !layerInstance.value) return null;

    const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';

    // Ocultar temporalmente el transformer antes de la captura
    const activeNode = selectedNode.value;
    if (transformerInstance.value) {
      transformerInstance.value.nodes([]);
      layerInstance.value.draw();
    }

    // Para JPEG con fondo transparente: inyectar temporalmente un fondo blanco sólido
    let tempBg: any = null;
    if (format === 'jpeg' && stageContext.KonvaModule.value && stageContext.isBgTransparent.value) {
      tempBg = new stageContext.KonvaModule.value.Rect({
        x: 0,
        y: 0,
        width: stageInstance.value.width(),
        height: stageInstance.value.height(),
        fill: '#ffffff',
        listening: false
      });
      layerInstance.value.add(tempBg);
      tempBg.moveToBottom();
      layerInstance.value.draw();
    }

    const rawDataUrl = stageInstance.value.toDataURL({
      pixelRatio: exportScale.value,
      mimeType
    });

    if (tempBg) {
      tempBg.destroy();
      layerInstance.value.draw();
    }

    // Restaurar transformer si había un nodo activo
    if (transformerInstance.value && activeNode) {
      transformerInstance.value.nodes([activeNode]);
      layerInstance.value.draw();
    }

    // Aplicar recorte suave con border-radius si corresponde
    const r = frameContext?.borderRadius.value ?? 0;
    const isFrameActive = frameContext?.active.value ?? false;
    const m = frameContext?.margin.value ?? 0;
    if (r > 0 && format !== 'jpeg') {
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

  const downloadImage = async (fileNamePrefix = 'pixemoji', format: CanvasExportFormat = exportFormat.value) => {
    const dataUrl = await getCanvasDataUrl(format);
    if (!dataUrl) return;

    const ext = format === 'jpeg' ? 'jpg' : format;
    const cleanName = fileNamePrefix.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${cleanName}-${exportResolutionLabel.value}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadPng = async (fileNamePrefix = 'pixemoji') => {
    return downloadImage(fileNamePrefix, exportFormat.value);
  };

  const copyToClipboard = async () => {
    // La API del portapapeles del navegador requiere universalmente image/png
    const dataUrl = await getCanvasDataUrl('png');
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
    exportFormat,
    copied,
    exportResolutionLabel,
    effectiveWidth,
    effectiveHeight,
    getCanvasDataUrl,
    downloadImage,
    downloadPng,
    copyToClipboard
  };
}
