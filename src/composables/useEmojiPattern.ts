export type PatternLayoutMode = 'grid' | 'stagger' | 'diagonal' | 'scatter';

export interface EmojiPatternOptions {
  size?: number;
  spacing?: number;
  layout?: PatternLayoutMode;
  opacity?: number;
  rotation?: number;
}

export const DEFAULT_PATTERN_OPTIONS: Required<EmojiPatternOptions> = {
  size: 28,
  spacing: 64,
  layout: 'grid',
  opacity: 0.18,
  rotation: 0
};

export const PATTERN_LAYOUT_PRESETS: { id: PatternLayoutMode; name: string; icon: string; desc: string }[] = [
  { id: 'grid', name: 'Ordenado', icon: '🔲', desc: 'Cuadrícula recta tradicional' },
  { id: 'stagger', name: 'Ladrillo', icon: '🧱', desc: 'Filas alternadas en zigzag' },
  { id: 'diagonal', name: 'Diagonal', icon: '📐', desc: 'Desplazamiento oblicuo dinámico' },
  { id: 'scatter', name: 'Disperso', icon: '🎲', desc: 'Distribución orgánica aleatoria' }
];

export function renderEmojiPattern({
  Konva,
  layer,
  bgRect,
  width,
  height,
  emoji,
  options = {}
}: {
  Konva: any;
  layer: any;
  bgRect?: any;
  width: number;
  height: number;
  emoji: string;
  options?: EmojiPatternOptions;
}) {
  if (!layer || !Konva || !emoji) return;

  const size = Math.max(12, Math.min(120, options.size ?? DEFAULT_PATTERN_OPTIONS.size));
  const spacing = Math.max(24, Math.min(250, options.spacing ?? DEFAULT_PATTERN_OPTIONS.spacing));
  const opacity = Math.max(0.02, Math.min(1, options.opacity ?? DEFAULT_PATTERN_OPTIONS.opacity));
  const layout = options.layout ?? DEFAULT_PATTERN_OPTIONS.layout;
  const baseRotation = options.rotation ?? DEFAULT_PATTERN_OPTIONS.rotation;

  const buffer = spacing * 1.2;
  const startX = -buffer;
  const endX = width + buffer;
  const startY = -buffer;
  const endY = height + buffer;

  const halfSize = size / 2;
  let rowIndex = 0;

  for (let y = startY; y <= endY; y += spacing) {
    let colIndex = 0;
    rowIndex++;

    for (let x = startX; x <= endX; x += spacing) {
      colIndex++;
      let posX = x;
      let posY = y;
      let rot = baseRotation;

      if (layout === 'stagger') {
        if (rowIndex % 2 !== 0) {
          posX += spacing / 2;
        }
      } else if (layout === 'diagonal') {
        posX += (rowIndex * (spacing * 0.5)) % spacing;
        const tilt = (rowIndex % 2 === 0 ? 1 : -1) * 12;
        rot = baseRotation + tilt;
      } else if (layout === 'scatter') {
        const seed = (colIndex * 374761393 + rowIndex * 668265263) ^ 0x5bf03635;
        const hash1 = Math.abs(Math.sin(seed) * 10000) % 1;
        const hash2 = Math.abs(Math.cos(seed) * 10000) % 1;
        const hash3 = Math.abs(Math.sin(seed * 1.5) * 10000) % 1;

        posX += (hash1 - 0.5) * (spacing * 0.65);
        posY += (hash2 - 0.5) * (spacing * 0.65);
        rot = baseRotation + (hash3 - 0.5) * 45;
      }

      if (posX < -size || posX > width + size || posY < -size || posY > height + size) {
        continue;
      }

      const item = new Konva.Text({
        x: posX,
        y: posY,
        text: emoji,
        fontSize: size,
        opacity,
        rotation: rot,
        draggable: false,
        listening: false,
        name: 'patternItem'
      });

      item.offsetX(halfSize);
      item.offsetY(halfSize);
      layer.add(item);
      item.moveToBottom();
    }
  }

  if (bgRect) {
    bgRect.moveToBottom();
  }
  layer.draw();
}
