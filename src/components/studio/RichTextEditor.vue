<template>
  <div class="space-y-2.5 relative" data-purpose="rich-text-editor">
    <!-- Fila 1: Menú de Fuentes y Selector de Color (Componentes Modulares) -->
    <div class="grid grid-cols-2 gap-2 relative z-25">
      <FontFamilyPicker :current-font="currentFont" @select-font="applyFont" />
      <ColorPalettePicker
        :current-color="currentColor"
        @live-change="onColorLiveChange"
        @commit-change="onColorCommitChange"
      />
    </div>

    <!-- Fila 2: Formato Rápido (Bold Unificado + Menú de Pesos, Cursiva, Listas) -->
    <TextFormattingToolbar
      :current-weight="currentWeight"
      :is-italic="isItalic"
      :is-bullet-active="isBulletActive"
      :is-ordered-active="isOrderedActive"
      @toggle-bold="toggleBold"
      @select-weight="selectWeightOption"
      @toggle-italic="toggleItalic"
      @toggle-bullet-list="toggleBulletList"
      @toggle-ordered-list="toggleOrderedList"
    />

    <!-- Área de edición TipTap con estilo reactivo -->
    <div
      class="p-2.5 bg-white border border-app-border-strong rounded-2xl shadow-2xs min-h-[90px] focus-within:ring-1 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all relative z-10"
    >
      <editor-content
        :editor="editor"
        class="tiptap-wrapper text-xs leading-relaxed focus:outline-none"
        :style="{
          fontFamily: currentFont,
          fontWeight: currentWeight,
          fontStyle: isItalic ? 'italic' : 'normal',
          color: currentColor
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';
import FontFamilyPicker from './FontFamilyPicker.vue';
import ColorPalettePicker from './ColorPalettePicker.vue';
import TextFormattingToolbar from './TextFormattingToolbar.vue';
import {
  ColorMark,
  WeightMark,
  getFormattedTextFromDoc,
  textToTipTapDoc
} from '../../utils/tiptapHelpers';

const studio = useCanvasStudio();

const currentFont = ref('Plus Jakarta Sans');
const currentWeight = ref('400');
const isItalic = ref(false);
const currentColor = ref('#1e293b');
let isSyncingFromExternal = false;

const syncToCanvas = () => {
  if (!editor.value || isSyncingFromExternal) return;
  const formatted = getFormattedTextFromDoc(editor.value.getJSON());
  const html = editor.value.getHTML();
  studio?.change('text', { text: formatted, html });
};

const editor = useEditor({
  content: studio?.activeElement.value?.html || textToTipTapDoc(studio?.activeElement.value?.text || 'Escribe tu texto...'),
  extensions: [
    StarterKit.configure({
      heading: false,
      codeBlock: false
    }),
    ColorMark,
    WeightMark
  ],
  onUpdate: () => {
    syncToCanvas();
  }
});

watch(
  () => studio?.activeElement.value,
  (el) => {
    if (!el || el.type !== 'Texto') return;
    if (el.fontFamily) currentFont.value = el.fontFamily;
    if (el.fill) currentColor.value = el.fill;
    if (el.fontStyle) {
      isItalic.value = el.fontStyle.includes('italic');
      const wMatch = el.fontStyle.match(/\b\d{3}\b/);
      if (wMatch) currentWeight.value = wMatch[0];
    }
    const targetHtml = el.html || `<p>${el.text || ''}</p>`;
    if (editor.value && targetHtml) {
      const currentHtml = editor.value.getHTML();
      if (currentHtml !== targetHtml) {
        isSyncingFromExternal = true;
        editor.value.commands.setContent(targetHtml);
        isSyncingFromExternal = false;
      }
    }
  },
  { immediate: true, deep: true }
);

const isBulletActive = computed(() => Boolean(editor.value?.isActive('bulletList')));
const isOrderedActive = computed(() => Boolean(editor.value?.isActive('orderedList')));

const toggleBulletList = () => {
  editor.value?.chain().focus().toggleBulletList().run();
  syncToCanvas();
};

const toggleOrderedList = () => {
  editor.value?.chain().focus().toggleOrderedList().run();
  syncToCanvas();
};

const syncFontStyleToStudio = () => {
  const italicPrefix = isItalic.value ? 'italic ' : '';
  const styleString = `${italicPrefix}${currentWeight.value}`;
  studio?.change('fontStyle', styleString);
};

// Selection-aware formatters
const applyFont = (fontName: string) => {
  currentFont.value = fontName;
  studio?.change('font', fontName);
  if (editor.value) {
    const formatted = getFormattedTextFromDoc(editor.value.getJSON());
    const html = editor.value.getHTML();
    studio?.change('text', { text: formatted, html, fontFamily: fontName });
  }
};

const applyColor = (color: string) => {
  currentColor.value = color;
  if (!editor.value) return;

  const { from, to, empty } = editor.value.state.selection;
  if (!empty && from !== to) {
    editor.value.chain().focus().setMark('textColor', { color }).run();
  } else {
    editor.value.chain().focus().selectAll().setMark('textColor', { color }).setTextSelection(from).run();
    studio?.change('fill', color);
  }
  syncToCanvas();
};

const onColorLiveChange = (color: string) => {
  applyColor(color);
};

const onColorCommitChange = (color: string) => {
  applyColor(color);
};

const selectWeightOption = (weight: string) => {
  currentWeight.value = weight;
  if (!editor.value) return;
  const { from, to, empty } = editor.value.state.selection;
  if (!empty && from !== to) {
    editor.value.chain().focus().setMark('textWeight', { weight }).run();
  } else {
    editor.value.chain().focus().selectAll().setMark('textWeight', { weight }).setTextSelection(from).run();
    syncFontStyleToStudio();
  }
  syncToCanvas();
};

const toggleBold = () => {
  if (!editor.value) return;
  const { from, to, empty } = editor.value.state.selection;

  if (!empty && from !== to) {
    editor.value.chain().focus().toggleBold().run();
  } else {
    if (Number(currentWeight.value) >= 700) {
      selectWeightOption('400');
    } else {
      selectWeightOption('700');
    }
  }
};

const toggleItalic = () => {
  if (!editor.value) return;
  const { from, to, empty } = editor.value.state.selection;

  if (!empty && from !== to) {
    editor.value.chain().focus().toggleItalic().run();
  } else {
    isItalic.value = !isItalic.value;
    syncFontStyleToStudio();
  }
  syncToCanvas();
};

// Sync state when active element changes
watch(
  () => studio?.activeElement.value,
  (el) => {
    if (!el || el.type !== 'Texto') return;
    currentFont.value = el.fontFamily || 'Plus Jakarta Sans';
    currentColor.value = el.fill || '#1e293b';

    const rawStyle = el.fontStyle || '';
    isItalic.value = rawStyle.includes('italic');

    const weightMatch = rawStyle.match(/\b(100|200|300|400|500|600|700|800|900)\b/);
    if (weightMatch) {
      currentWeight.value = weightMatch[1];
    } else if (rawStyle.includes('bold')) {
      currentWeight.value = '700';
    } else {
      currentWeight.value = '400';
    }

    if (editor.value) {
      const currentDocHtml = editor.value.getHTML();
      if (el.html && el.html !== currentDocHtml) {
        editor.value.commands.setContent(el.html, false);
      } else if (el.text) {
        const currentDocText = getFormattedTextFromDoc(editor.value.getJSON());
        if (el.text !== currentDocText) {
          editor.value.commands.setContent(textToTipTapDoc(el.text), false);
        }
      }
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
:deep(.tiptap) {
  outline: none;
  min-height: 80px;
}
:deep(.tiptap p) {
  margin: 0.25rem 0;
}
:deep(.tiptap ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin: 0.25rem 0;
}
:deep(.tiptap ol) {
  list-style-type: decimal;
  padding-left: 1.25rem;
  margin: 0.25rem 0;
}
:deep(.tiptap li) {
  margin: 0.125rem 0;
}
</style>
