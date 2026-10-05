import { ref, shallowRef } from 'vue';
import { patchKonvaEmojiShadow, patchKonvaEmojiBounds } from './useKonvaEmojiFix';
import { patchKonvaCrop } from './useKonvaCrop';

export interface KonvaStageOptions {
  containerId: string;
  initialWidth?: number;
  initialHeight?: number;
  initialBgColor?: string;
}

export interface GradientPreset {
  id: string;
  name: string;
  colors: [string, string];
  cssPreview: string;
}

export const gradientPresets: GradientPreset[] = [
  { id: 'sunset', name: 'Instagram Sunset', colors: ['#833ab4', '#fd1d1d'], cssPreview: 'linear-gradient(135deg, #833ab4, #fd1d1d)' },
  { id: 'peach', name: 'Pastel Peach', colors: ['#ffecd2', '#fcb69f'], cssPreview: 'linear-gradient(135deg, #ffecd2, #fcb69f)' },
  { id: 'neon', name: 'Cyberpunk Cyan', colors: ['#00c6ff', '#0072ff'], cssPreview: 'linear-gradient(135deg, #00c6ff, #0072ff)' },
  { id: 'mint', name: 'Fresh Mint', colors: ['#a8ff78', '#78ffd6'], cssPreview: 'linear-gradient(135deg, #a8ff78, #78ffd6)' },
  { id: 'purple', name: 'Ultra Violet', colors: ['#7f00ff', '#e100ff'], cssPreview: 'linear-gradient(135deg, #7f00ff, #e100ff)' },
  { id: 'candy', name: 'Cotton Candy', colors: ['#ff9a9e', '#fecfef'], cssPreview: 'linear-gradient(135deg, #ff9a9e, #fecfef)' },
  { id: 'ocean', name: 'Ocean Drive', colors: ['#2b5876', '#4e4376'], cssPreview: 'linear-gradient(135deg, #2b5876, #4e4376)' },
  { id: 'fire', name: 'Warm Flame', colors: ['#ff0844', '#ffb199'], cssPreview: 'linear-gradient(135deg, #ff0844, #ffb199)' },
  { id: 'dark', name: 'Midnight Carbon', colors: ['#232526', '#414345'], cssPreview: 'linear-gradient(135deg, #232526, #414345)' }
];

export function useKonvaStage() {
  const stageInstance = shallowRef<any>(null);
  const layerInstance = shallowRef<any>(null);
  const transformerInstance = shallowRef<any>(null);
  const bgRectNode = shallowRef<any>(null);
  const KonvaModule = shallowRef<any>(null);

  const canvasWidth = ref(512);
  const canvasHeight = ref(512);
  const isBgTransparent = ref(true);
  const bgMode = ref<'transparent' | 'solid' | 'gradient'>('transparent');
  const bgColor = ref('#ffffff');
  const activeGradient = ref<GradientPreset | null>(null);
  const selectedNode = shallowRef<any>(null);

  const selectNode = (node: any) => {
    if (!layerInstance.value || !transformerInstance.value) return;
    if (selectedNode.value === node && (!node || transformerInstance.value.nodes().includes(node))) {
      return;
    }
    selectedNode.value = node;
    if (node) {
      if (node.hasName && node.hasName('locked')) {
        // El elemento bloqueado se selecciona para el inspector pero no se transforma ni arrastra
        transformerInstance.value.nodes([]);
      } else {
        transformerInstance.value.nodes([node]);
        transformerInstance.value.moveToTop();
      }
    } else {
      transformerInstance.value.nodes([]);
    }
    layerInstance.value.draw();
  };

  const initStage = async (options: KonvaStageOptions) => {
    if (typeof window === 'undefined') return;

    const konvaImport = await import('konva');
    KonvaModule.value = konvaImport.default || konvaImport;
    (window as any).Konva = KonvaModule.value;
    patchKonvaEmojiShadow(KonvaModule.value);
    patchKonvaEmojiBounds(KonvaModule.value);
    patchKonvaCrop(KonvaModule.value);

    const container = document.getElementById(options.containerId);
    if (!container) return;

    canvasWidth.value = options.initialWidth ?? 512;
    canvasHeight.value = options.initialHeight ?? 512;
    bgColor.value = options.initialBgColor ?? '#ffffff';

    const stage = new KonvaModule.value.Stage({
      container: options.containerId,
      width: canvasWidth.value,
      height: canvasHeight.value
    });

    const layer = new KonvaModule.value.Layer();
    stage.add(layer);

    // Background rect
    const bgRect = new KonvaModule.value.Rect({
      x: 0,
      y: 0,
      width: canvasWidth.value,
      height: canvasHeight.value,
      fill: bgColor.value,
      visible: !isBgTransparent.value,
      listening: false
    });
    layer.add(bgRect);

    // Transformer
    const tr = new KonvaModule.value.Transformer({
      rotateAnchorOffset: 20,
      anchorStroke: '#d97736',
      anchorFill: '#ffffff',
      anchorSize: 9,
      borderStroke: '#d97736',
      borderDash: [4, 4],
      boundBoxFunc: (oldBox: any, newBox: any) => {
        if (newBox.width < 15 || newBox.height < 15) return oldBox;
        return newBox;
      }
    });
    layer.add(tr);

    stageInstance.value = stage;
    layerInstance.value = layer;
    transformerInstance.value = tr;
    bgRectNode.value = bgRect;

    const findSelectableNode = (target: any) => {
      let curr = target;
      while (curr && curr !== stage) {
        if (curr.hasName && (curr.hasName('selectable') || curr.hasName('locked'))) {
          return curr;
        }
        curr = curr.parent;
      }
      return null;
    };

    // Auto-seleccionar de inmediato al presionar o tocar para que el Transformer
    // y el panel de propiedades se sincronicen antes o durante un arrastre
    stage.on('mousedown touchstart', (e: any) => {
      const selectable = findSelectableNode(e.target);
      if (selectable && selectedNode.value !== selectable) {
        selectNode(selectable);
      }
    });

    // En caso de que se inicie un arrastre directamente sobre un nodo no seleccionado
    stage.on('dragstart', (e: any) => {
      const selectable = findSelectableNode(e.target);
      if (selectable && selectedNode.value !== selectable) {
        selectNode(selectable);
      }
    });

    // Respaldo al terminar el arrastre para garantizar selección sincronizada
    stage.on('dragend', (e: any) => {
      const selectable = findSelectableNode(e.target);
      if (selectable && selectedNode.value !== selectable) {
        selectNode(selectable);
      }
    });

    // Clic/Tap para alternar elemento o deseleccionar al presionar el fondo vacío
    stage.on('click tap', (e: any) => {
      if (e.target === stage || e.target === bgRect) {
        selectNode(null);
        return;
      }

      const selectable = findSelectableNode(e.target);
      if (selectable) {
        selectNode(selectable);
      }
    });

    layer.draw();
  };

  const changeDimensions = (w: number, h: number) => {
    canvasWidth.value = w;
    canvasHeight.value = h;
    if (stageInstance.value && layerInstance.value) {
      stageInstance.value.size({ width: w, height: h });
      if (bgRectNode.value) {
        bgRectNode.value.size({ width: w, height: h });
        // Update gradient end point if active
        if (bgMode.value === 'gradient') {
          bgRectNode.value.fillLinearGradientEndPoint({ x: w, y: h });
        }
      }
      layerInstance.value.draw();
    }
  };

  const setBgTransparent = () => {
    isBgTransparent.value = true;
    bgMode.value = 'transparent';
    if (bgRectNode.value && layerInstance.value) {
      bgRectNode.value.visible(false);
      layerInstance.value.draw();
    }
  };

  const setBgColor = (color: string) => {
    isBgTransparent.value = false;
    bgMode.value = 'solid';
    bgColor.value = color;
    activeGradient.value = null;
    if (bgRectNode.value && layerInstance.value) {
      bgRectNode.value.fillPriority('color');
      bgRectNode.value.fill(color);
      bgRectNode.value.visible(true);
      bgRectNode.value.moveToBottom();
      layerInstance.value.draw();
    }
  };

  const setBgGradient = (preset: GradientPreset) => {
    isBgTransparent.value = false;
    bgMode.value = 'gradient';
    activeGradient.value = preset;
    if (bgRectNode.value && layerInstance.value) {
      bgRectNode.value.fillPriority('linear-gradient');
      bgRectNode.value.fillLinearGradientStartPoint({ x: 0, y: 0 });
      bgRectNode.value.fillLinearGradientEndPoint({ x: canvasWidth.value, y: canvasHeight.value });
      bgRectNode.value.fillLinearGradientColorStops([0, preset.colors[0], 1, preset.colors[1]]);
      bgRectNode.value.visible(true);
      bgRectNode.value.moveToBottom();
      layerInstance.value.draw();
    }
  };

  const clearSelection = () => {
    selectNode(null);
  };

  const destroyStage = () => {
    if (stageInstance.value) {
      stageInstance.value.destroy();
      stageInstance.value = null;
      layerInstance.value = null;
      transformerInstance.value = null;
      bgRectNode.value = null;
      selectedNode.value = null;
    }
  };

  return {
    stageInstance,
    layerInstance,
    transformerInstance,
    bgRectNode,
    KonvaModule,
    canvasWidth,
    canvasHeight,
    isBgTransparent,
    bgMode,
    bgColor,
    activeGradient,
    gradientPresets,
    selectedNode,
    initStage,
    changeDimensions,
    setBgTransparent,
    setBgColor,
    setBgGradient,
    selectNode,
    clearSelection,
    destroyStage
  };
}
