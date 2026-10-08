import { ref, onMounted, onUnmounted } from 'vue';

export interface ViewportPanZoomOptions {
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
}

export function useViewportPanZoom(options: ViewportPanZoomOptions = {}) {
  const minZoom = options.minZoom ?? 0.15;
  const maxZoom = options.maxZoom ?? 3.0;

  const zoomLevel = ref(options.initialZoom ?? 1.0);
  const panX = ref(0);
  const panY = ref(0);
  const fitScale = ref(1.0);

  const isPanning = ref(false);
  const isTouchPinching = ref(false);
  const isSpacePressed = ref(false);
  const activeTool = ref<'select' | 'hand'>('select');

  // Tracking coords
  let startX = 0;
  let startY = 0;
  let initialPinchDist = 0;
  let initialPinchZoom = 1.0;
  let lastTouchMidX = 0;
  let lastTouchMidY = 0;

  /**
   * Adapta automáticamente el lienzo al tamaño disponible de la pantalla/viewport
   * para que nunca se corte en dispositivos móviles o resoluciones pequeñas.
   */
  const fitToViewport = (
    vWidth: number,
    vHeight: number,
    cWidth: number,
    cHeight: number
  ) => {
    if (!vWidth || !vHeight || !cWidth || !cHeight) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    // Margen de seguridad cómodo para que el lienzo respire y no toque los bordes
    const paddingX = isMobile ? 32 : 80;
    const paddingY = isMobile ? 70 : 110;

    const availW = Math.max(80, vWidth - paddingX);
    const availH = Math.max(80, vHeight - paddingY);

    // Escalar hacia abajo si no cabe, pero sin agrandar innecesariamente si es pequeño
    const scale = Math.min(availW / cWidth, availH / cHeight, 1.0);
    const rounded = Math.max(minZoom, Math.round(scale * 100) / 100);

    fitScale.value = rounded;
    zoomLevel.value = rounded;
    panX.value = 0;
    panY.value = 0;
  };

  const zoomIn = () => {
    zoomLevel.value = Math.min(maxZoom, Math.round((zoomLevel.value + 0.1) * 10) / 10);
  };

  const zoomOut = () => {
    zoomLevel.value = Math.max(minZoom, Math.round((zoomLevel.value - 0.1) * 10) / 10);
  };

  const resetZoom = () => {
    zoomLevel.value = fitScale.value;
    panX.value = 0;
    panY.value = 0;
  };

  const setTool = (tool: 'select' | 'hand') => {
    activeTool.value = tool;
  };

  const toggleTool = () => {
    activeTool.value = activeTool.value === 'hand' ? 'select' : 'hand';
  };

  /**
   * Zoom con la rueda del ratón anclado a la posición del cursor
   */
  const handleWheel = (e: WheelEvent, viewportEl: HTMLElement | null) => {
    e.preventDefault();

    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const oldZoom = zoomLevel.value;
    const newZoom = Math.min(maxZoom, Math.max(minZoom, Math.round(oldZoom * zoomFactor * 100) / 100));

    if (newZoom === oldZoom) return;

    if (viewportEl) {
      const rect = viewportEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const mx = e.clientX - cx;
      const my = e.clientY - cy;

      panX.value = Math.round(mx - (mx - panX.value) * (newZoom / oldZoom));
      panY.value = Math.round(my - (my - panY.value) * (newZoom / oldZoom));
    }

    zoomLevel.value = newZoom;
  };

  /**
   * Inicio de arrastre (Mouse / Pointer)
   */
  const handlePointerDown = (e: PointerEvent, isBackground: boolean) => {
    const shouldPan =
      activeTool.value === 'hand' ||
      e.button === 1 || // Botón central / rueda
      isSpacePressed.value ||
      isBackground;

    if (!shouldPan) return;

    isPanning.value = true;
    startX = e.clientX - panX.value;
    startY = e.clientY - panY.value;

    try {
      (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isPanning.value) return;
    panX.value = e.clientX - startX;
    panY.value = e.clientY - startY;
  };

  const handlePointerUp = (e?: PointerEvent) => {
    if (!isPanning.value) return;
    isPanning.value = false;
    if (e?.target) {
      try {
        (e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId);
      } catch (_) {}
    }
  };

  // Métricas táctiles auxiliares
  const getDistance = (t1: Touch, t2: Touch) => Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  const getMidpoint = (t1: Touch, t2: Touch) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2
  });

  /**
   * Gestos táctiles de 2 dedos (Pinch to Zoom & Pan multitáctil)
   */
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      isTouchPinching.value = true;
      initialPinchDist = getDistance(e.touches[0], e.touches[1]);
      initialPinchZoom = zoomLevel.value;
      const mid = getMidpoint(e.touches[0], e.touches[1]);
      lastTouchMidX = mid.x;
      lastTouchMidY = mid.y;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && isTouchPinching.value) {
      e.preventDefault();
      const dist = getDistance(e.touches[0], e.touches[1]);
      const mid = getMidpoint(e.touches[0], e.touches[1]);

      if (initialPinchDist > 0) {
        const factor = dist / initialPinchDist;
        zoomLevel.value = Math.min(maxZoom, Math.max(minZoom, Math.round(initialPinchZoom * factor * 100) / 100));
      }

      panX.value += mid.x - lastTouchMidX;
      panY.value += mid.y - lastTouchMidY;
      lastTouchMidX = mid.x;
      lastTouchMidY = mid.y;
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) {
      isTouchPinching.value = false;
    }
  };

  // Atajos de teclado para Barra Espaciadora y H/V
  const isInputElement = (el: EventTarget | null) => {
    if (!el || !(el as HTMLElement).tagName) return false;
    const tag = (el as HTMLElement).tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || (el as HTMLElement).isContentEditable;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (isInputElement(e.target)) return;
    if (e.code === 'Space' && !e.repeat) {
      isSpacePressed.value = true;
    } else if (e.key === 'h' || e.key === 'H') {
      setTool('hand');
    } else if (e.key === 'v' || e.key === 'V') {
      setTool('select');
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      isSpacePressed.value = false;
    }
  };

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    }
  });

  return {
    zoomLevel,
    panX,
    panY,
    fitScale,
    isPanning,
    isTouchPinching,
    isSpacePressed,
    activeTool,
    fitToViewport,
    zoomIn,
    zoomOut,
    resetZoom,
    setTool,
    toggleTool,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}
