import { createRichTextShape } from './konvaRichText';
import { patchKonvaEmojiShadow } from '../composables/useKonvaEmojiFix';
import { attachNodeFilters } from '../composables/useKonvaLayers';

export interface SerializedNode {
  id?: string;
  nodeType: 'text' | 'emoji' | 'image' | 'patternItem';
  name: string;
  isLocked: boolean;
  x: number;
  y: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  offsetX?: number;
  offsetY?: number;
  text?: string;
  html?: string;
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
  fontStyle?: string;
  stroke?: string;
  strokeWidth?: number;
  is3D?: boolean;
  depth3D?: number;
  color3DMode?: 'auto' | 'custom';
  shading3D?: number;
  color3D?: string;
  dirX3D?: number;
  dirY3D?: number;
  src?: string;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
  filterBlur?: number;
  filterContrast?: number;
}

export interface CanvasHistorySnapshot {
  nodes: SerializedNode[];
  selectedNodeIndex: number;
}

const getProp = (node: any, prop: string, def: any = 0) =>
  typeof node[prop] === 'function' ? node[prop]() : (node.getAttr?.(prop) ?? node.attrs?.[prop] ?? def);

export function serializeCanvasState(layer: any, selectedNode: any): string {
  if (!layer) return '{"nodes":[],"selectedNodeIndex":-1}';

  const userNodes = layer.getChildren((n: any) =>
    n.hasName('selectable') || n.hasName('locked') || n.hasName('patternItem')
  );
  const selectedNodeIndex = selectedNode ? userNodes.indexOf(selectedNode) : -1;

  const nodes: SerializedNode[] = userNodes.map((node: any) => {
    const isPattern = node.hasName('patternItem');
    const isLocked = node.hasName('locked');
    const explicitType = node.getAttr?.('nodeType');

    let nodeType: 'text' | 'emoji' | 'image' | 'patternItem' = 'text';
    if (isPattern) nodeType = 'patternItem';
    else if (explicitType === 'emoji') nodeType = 'emoji';
    else if (explicitType === 'image' || node.className === 'Image') nodeType = 'image';
    else if (explicitType === 'text' || typeof node.html === 'function') nodeType = 'text';
    else if (typeof node.text === 'function') {
      const t = node.text();
      nodeType = ([...t].length <= 2 && /\p{Extended_Pictographic}/u.test(t)) ? 'emoji' : 'text';
    }

    const item: SerializedNode = {
      id: node._id ? String(node._id) : undefined,
      nodeType,
      name: isLocked ? 'locked' : (isPattern ? 'patternItem' : 'selectable'),
      isLocked,
      x: getProp(node, 'x', 0),
      y: getProp(node, 'y', 0),
      width: getProp(node, 'width', 0),
      height: getProp(node, 'height', 0),
      scaleX: getProp(node, 'scaleX', 1),
      scaleY: getProp(node, 'scaleY', 1),
      rotation: getProp(node, 'rotation', 0),
      offsetX: getProp(node, 'offsetX', 0),
      offsetY: getProp(node, 'offsetY', 0),
      shadowColor: getProp(node, 'shadowColor', undefined),
      shadowBlur: getProp(node, 'shadowBlur', 0),
      shadowOffsetX: getProp(node, 'shadowOffsetX', 0),
      shadowOffsetY: getProp(node, 'shadowOffsetY', 0),
      shadowOpacity: getProp(node, 'shadowOpacity', 1),
      filterBlur: node.getAttr?.('filterBlur') ?? 0,
      filterContrast: node.getAttr?.('filterContrast') ?? 100
    };

    if (nodeType === 'text') {
      item.text = getProp(node, 'text', '');
      item.html = typeof (node as any).html === 'function' ? (node as any).html() : (node.getAttr?.('html') || `<p>${item.text}</p>`);
      item.fontFamily = getProp(node, 'fontFamily', 'Plus Jakarta Sans');
      item.fontSize = getProp(node, 'fontSize', 44);
      item.fill = getProp(node, 'fill', '#1e293b');
      item.fontStyle = getProp(node, 'fontStyle', 'normal');
      item.stroke = getProp(node, 'stroke', undefined);
      item.strokeWidth = getProp(node, 'strokeWidth', 0);
      item.is3D = Boolean(node.getAttr?.('is3D'));
      item.depth3D = node.getAttr?.('depth3D') ?? 8;
      item.color3DMode = node.getAttr?.('color3DMode') || 'auto';
      item.shading3D = node.getAttr?.('shading3D') ?? 35;
      item.color3D = node.getAttr?.('color3D') || '#333333';
      item.dirX3D = node.getAttr?.('dirX3D') ?? 1;
      item.dirY3D = node.getAttr?.('dirY3D') ?? 1;
    } else if (nodeType === 'emoji' || nodeType === 'patternItem') {
      item.text = getProp(node, 'text', '✨');
      item.fontSize = getProp(node, 'fontSize', isPattern ? 26 : 110);
      item.fontFamily = getProp(node, 'fontFamily', '"Segoe UI Emoji", sans-serif');
    } else if (nodeType === 'image') {
      item.src = node.getAttr?.('src') || node.attrs?.src || node.image?.()?.src || '';
    }

    return item;
  });

  return JSON.stringify({ nodes, selectedNodeIndex });
}

const getShadowAttrs = (item: SerializedNode) => ({
  shadowColor: item.shadowColor,
  shadowBlur: item.shadowBlur ?? 0,
  shadowOffsetX: item.shadowOffsetX ?? 0,
  shadowOffsetY: item.shadowOffsetY ?? 0,
  shadowOpacity: item.shadowOpacity ?? 1
});

export function restoreCanvasState(jsonString: string, stage: any, layers: any) {
  const layer = stage?.layerInstance?.value || stage?.layerInstance;
  const transformer = stage?.transformerInstance?.value || stage?.transformerInstance;
  const Konva = stage?.KonvaModule?.value || stage?.KonvaModule || (window as any).Konva;
  if (!layer || !Konva) return;

  if (transformer) transformer.nodes([]);

  const existing = layer.getChildren((n: any) =>
    n.hasName('selectable') || n.hasName('locked') || n.hasName('patternItem')
  );
  existing.forEach((n: any) => n.destroy());

  let snapshot: CanvasHistorySnapshot;
  try {
    const parsed = JSON.parse(jsonString);
    snapshot = Array.isArray(parsed) ? { nodes: parsed, selectedNodeIndex: -1 } : parsed;
  } catch {
    return;
  }

  const restoredNodes: any[] = [];

  for (const item of snapshot.nodes || []) {
    const sAttrs = getShadowAttrs(item);
    if (item.nodeType === 'text') {
      const shape = createRichTextShape(Konva, {
        x: item.x, y: item.y, width: item.width || 340,
        text: item.text || 'Texto', html: item.html || `<p>${item.text || 'Texto'}</p>`,
        fontFamily: item.fontFamily || 'Plus Jakarta Sans', fontSize: item.fontSize || 44,
        fill: item.fill || '#1e293b', textColor: item.fill || '#1e293b',
        fontStyle: item.fontStyle || 'normal', strokeColor: item.stroke, strokeWidth: item.strokeWidth || 0
      }, {
        scaleX: item.scaleX ?? 1, scaleY: item.scaleY ?? 1, rotation: item.rotation ?? 0,
        ...sAttrs, is3D: item.is3D, depth3D: item.depth3D ?? 8, color3DMode: item.color3DMode || 'auto',
        shading3D: item.shading3D ?? 35, color3D: item.color3D || '#333333',
        dirX3D: item.dirX3D ?? 1, dirY3D: item.dirY3D ?? 1,
        filterBlur: item.filterBlur ?? 0, filterContrast: item.filterContrast ?? 100
      });

      if (item.isLocked) {
        shape.removeName('selectable');
        shape.addName('locked');
        shape.draggable(false);
      }
      layer.add(shape);
      restoredNodes.push(shape);
    } else if (item.nodeType === 'emoji') {
      patchKonvaEmojiShadow(Konva);
      const emoji = new Konva.Text({
        x: item.x, y: item.y, text: item.text || '✨', fontSize: item.fontSize || 110,
        fontFamily: item.fontFamily || '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
        draggable: !item.isLocked, name: item.isLocked ? 'locked' : 'selectable',
        nodeType: 'emoji', perfectDrawEnabled: true,
        scaleX: item.scaleX ?? 1, scaleY: item.scaleY ?? 1, rotation: item.rotation ?? 0,
        ...sAttrs
      });
      emoji.setAttr('nodeType', 'emoji');
      emoji.setAttr('filterBlur', item.filterBlur ?? 0);
      emoji.setAttr('filterContrast', item.filterContrast ?? 100);
      emoji.offsetX(item.offsetX || emoji.width() / 2);
      emoji.offsetY(item.offsetY || emoji.height() / 2);
      attachNodeFilters(emoji);
      layer.add(emoji);
      restoredNodes.push(emoji);
    } else if (item.nodeType === 'image') {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      const kImg = new Konva.Image({
        x: item.x, y: item.y, image: img, draggable: !item.isLocked,
        name: item.isLocked ? 'locked' : 'selectable', nodeType: 'image',
        scaleX: item.scaleX ?? 1, scaleY: item.scaleY ?? 1, rotation: item.rotation ?? 0,
        ...sAttrs
      });
      kImg.setAttr('nodeType', 'image');
      kImg.setAttr('src', item.src || '');
      kImg.setAttr('filterBlur', item.filterBlur ?? 0);
      kImg.setAttr('filterContrast', item.filterContrast ?? 100);
      kImg.offsetX(item.offsetX || 0);
      kImg.offsetY(item.offsetY || 0);
      attachNodeFilters(kImg);

      if (item.src) {
        img.onload = () => {
          kImg.image(img);
          if (!item.offsetX && !item.offsetY) {
            kImg.offsetX(kImg.width() / 2);
            kImg.offsetY(kImg.height() / 2);
          }
          layer.batchDraw();
        };
        img.src = item.src;
      }
      layer.add(kImg);
      restoredNodes.push(kImg);
    } else if (item.nodeType === 'patternItem') {
      const pattern = new Konva.Text({
        x: item.x, y: item.y, text: item.text || '✨', fontSize: item.fontSize || 26,
        opacity: 0.15, listening: false, name: 'patternItem'
      });
      pattern.offsetX(item.offsetX || 13);
      pattern.offsetY(item.offsetY || 13);
      layer.add(pattern);
      pattern.moveToBottom();
      restoredNodes.push(pattern);
    }
  }

  if (stage.bgRectNode?.value) stage.bgRectNode.value.moveToBottom();
  if (transformer) transformer.moveToTop();

  // 1. Refrescar lista de capas para que layersList contenga los nodos vivos recién recreados
  layers?.refreshLayersList?.();

  // 2. Restaurar selección previa en stage/layers
  const doSelect = (node: any) => {
    if (typeof stage?.selectNode === 'function') {
      stage.selectNode(node);
    } else if (typeof layers?.selectNode === 'function') {
      layers.selectNode(node);
    }
  };

  if (snapshot.selectedNodeIndex >= 0 && snapshot.selectedNodeIndex < restoredNodes.length) {
    const toSelect = restoredNodes[snapshot.selectedNodeIndex];
    if (toSelect && !toSelect.hasName('patternItem')) {
      doSelect(toSelect);
    } else {
      doSelect(null);
    }
  } else {
    doSelect(null);
  }

  layer.batchDraw();
  layers?.syncActiveElement?.();
}
