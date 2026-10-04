import { Mark, mergeAttributes } from '@tiptap/vue-3';

// Custom TipTap marks for selection-based styling
export const ColorMark = Mark.create({
  name: 'textColor',
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (el) => el.style.color,
        renderHTML: (attrs) => (attrs.color ? { style: `color: ${attrs.color}` } : {})
      }
    };
  },
  parseHTML() {
    return [{ tag: 'span[style*="color"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  }
});

export const WeightMark = Mark.create({
  name: 'textWeight',
  addAttributes() {
    return {
      weight: {
        default: null,
        parseHTML: (el) => el.style.fontWeight,
        renderHTML: (attrs) => (attrs.weight ? { style: `font-weight: ${attrs.weight}` } : {})
      }
    };
  },
  parseHTML() {
    return [{ tag: 'span[style*="font-weight"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  }
});

export function getFormattedTextFromDoc(node: any): string {
  if (!node) return '';
  const processNode = (n: any): string => {
    if (n.type === 'text') return n.text || '';
    if (n.type === 'paragraph') return (n.content || []).map((c: any) => processNode(c)).join('');
    if (n.type === 'bulletList') return (n.content || []).map((item: any) => `• ${processNode(item)}`).join('\n');
    if (n.type === 'orderedList') return (n.content || []).map((item: any, idx: number) => `${idx + 1}. ${processNode(item)}`).join('\n');
    if (n.type === 'listItem') return (n.content || []).map((c: any) => processNode(c)).join(' ').trim();
    if (n.type === 'doc') return (n.content || []).map((child: any) => processNode(child)).join('\n');
    return '';
  };
  return processNode(node);
}

export function textToTipTapDoc(text: string): any {
  if (!text || !text.trim()) return { type: 'doc', content: [{ type: 'paragraph' }] };
  const lines = text.split('\n');
  const content: any[] = [];
  let currentList: { type: 'bulletList' | 'orderedList'; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    content.push({
      type: currentList.type,
      content: currentList.items.map((itemText) => ({
        type: 'listItem',
        content: [{ type: 'paragraph', content: itemText ? [{ type: 'text', text: itemText }] : [] }]
      }))
    });
    currentList = null;
  };

  for (const line of lines) {
    const bulletMatch = line.match(/^[•\-\*]\s*(.*)$/);
    const orderedMatch = line.match(/^(\d+)[\.\)]\s*(.*)$/);

    if (bulletMatch) {
      if (currentList && currentList.type !== 'bulletList') flushList();
      if (!currentList) currentList = { type: 'bulletList', items: [] };
      currentList.items.push(bulletMatch[1]);
    } else if (orderedMatch) {
      if (currentList && currentList.type !== 'orderedList') flushList();
      if (!currentList) currentList = { type: 'orderedList', items: [] };
      currentList.items.push(orderedMatch[2]);
    } else {
      flushList();
      content.push({
        type: 'paragraph',
        content: line ? [{ type: 'text', text: line }] : []
      });
    }
  }

  flushList();
  return { type: 'doc', content };
}

export const WEIGHT_OPTIONS = [
  { value: '100', label: 'Muy Fina (100)' },
  { value: '200', label: 'Extra Fina (200)' },
  { value: '300', label: 'Fina (300)' },
  { value: '400', label: 'Normal o Regular (400)' },
  { value: '500', label: 'Mediana (500)' },
  { value: '600', label: 'Seminegrita (600)' },
  { value: '700', label: 'Negrita (700)' },
  { value: '800', label: 'Extranegrita (800)' },
  { value: '900', label: 'Negra o Black (900)' }
];
