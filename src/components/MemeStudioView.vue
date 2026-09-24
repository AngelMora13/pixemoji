<template>
  <div class="w-full max-w-7xl mx-auto space-y-5">
    <!-- Studio Header Bar: Brand, History, Aspect Ratio, and Export -->
    <StudioHeader
      :can-undo="history.canUndo.value"
      :can-redo="history.canRedo.value"
      :current-preset="currentPreset"
      :format-presets="formatPresets"
      @undo="history.undo"
      @redo="history.redo"
      @select-preset="handlePresetSelect"
      @open-export="isExportModalOpen = true"
    />

    <!-- Main Workspace Layout: 2 Columns (Sidebar + Expansive Canvas) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Toolset Sidebar (4 cols) -->
      <aside class="lg:col-span-4 xl:col-span-4 glass-card rounded-3xl p-4 sm:p-5 border border-[#e8d2c0] shadow-xl shadow-[#523e32]/5 space-y-4">
        <!-- 4 Essential Tabs Navigation -->
        <nav class="grid grid-cols-4 gap-1 p-1 bg-amber-100/70 rounded-2xl border border-amber-200">
          <button
            v-for="tab in tabList"
            :key="tab.id"
            type="button"
            @click="activeTab = tab.id"
            :class="[
              'py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer text-center',
              activeTab === tab.id
                ? 'bg-white text-[#d97736] shadow-xs ring-1 ring-[#d97736]/20'
                : 'text-[#735a4d] hover:text-[#2b1e1a]'
            ]"
          >
            <span class="text-sm leading-none">{{ tab.icon }}</span>
            <span class="text-[11px] leading-tight">{{ tab.label }}</span>
          </button>
        </nav>

        <!-- TAB 1: PLANTILLAS -->
        <div v-show="activeTab === 'templates'">
          <TemplatesTool
            :templates="templates.availableTemplates"
            @select-template="handleTemplateSelect"
          />
        </div>

        <!-- TAB 2: AÑADIR -->
        <div v-show="activeTab === 'add'" class="space-y-4">
          <AddTool
            :quick-emojis="quickEmojiList"
            :is-picker-open="showPicker"
            @add-text="handleAddText"
            @select-emoji="handleAddEmoji"
            @toggle-picker="showPicker = !showPicker"
            @add-image="handleAddImage"
          />
        </div>

        <!-- TAB 3: FONDO -->
        <div v-show="activeTab === 'bg'">
          <BackgroundTool
            :is-transparent="stage.isBgTransparent.value"
            :bg-mode="stage.bgMode.value"
            :bg-color="stage.bgColor.value"
            :active-gradient="stage.activeGradient.value"
            :gradient-presets="stage.gradientPresets"
            @set-transparent="stage.setBgTransparent"
            @set-color="stage.setBgColor"
            @set-gradient="stage.setBgGradient"
            @fill-pattern="handleFillPattern"
            @clear-pattern="layers.clearEmojiPattern"
          />
        </div>

        <!-- TAB 4: CAPAS -->
        <div v-show="activeTab === 'layers'">
          <LayersPanel
            :layers="layers.layersListReversed.value"
            :selected-node="stage.selectedNode.value"
            @select="stage.selectNode"
            @toggle-lock="handleToggleLock"
            @duplicate="handleDuplicateNode"
            @move-up="layers.moveLayerUp"
            @move-down="layers.moveLayerDown"
            @reorder="handleReorderLayer"
            @remove="layers.removeLayer"
            @clear-all="handleClearAll"
          />
        </div>
      </aside>

      <!-- Center / Right Column: Expansive Canvas Protagonist (8 cols) -->
      <main class="lg:col-span-8 xl:col-span-8 glass-card rounded-3xl p-4 sm:p-6 border border-[#e8d2c0] shadow-xl shadow-[#523e32]/5 flex flex-col items-center space-y-4 min-w-0">
        <!-- Contextual Toolbar (Appears whenever an element is touched) -->
        <CanvasToolbar
          :selected-info="layers.selectedNodeInfo.value"
          @update-text="handleUpdateText"
          @apply-text-preset="handleApplyTextPreset"
          @apply-image-preset="handleApplyImagePreset"
          @update-shadow="handleUpdateShadow"
          @update-stroke="handleUpdateStroke"
          @flip-h="effects.flipHorizontal"
          @flip-v="effects.flipVertical"
          @center="effects.centerNode"
          @toggle-lock="handleToggleLock"
          @delete="handleDeleteSelected"
          @open-bg-tab="activeTab = 'bg'"
        />

        <!-- Canvas Frame Container -->
        <div class="w-full flex justify-center items-center p-3 sm:p-6 bg-[#f4ece3]/60 border border-[#debfa8]/80 rounded-2xl overflow-auto max-w-full">
          <KonvaStage
            container-id="konva-meme-stage"
            :width="stage.canvasWidth.value"
            :height="stage.canvasHeight.value"
            :is-transparent="stage.isBgTransparent.value"
            :bg-color="stage.bgColor.value"
          />
        </div>

        <!-- Canvas Info Footer -->
        <div class="flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#8a6e60] font-medium text-center">
          <span class="font-mono font-bold text-[#523e32]">
            {{ stage.canvasWidth.value }}&times;{{ stage.canvasHeight.value }}px ({{ currentPreset.ratioLabel }})
          </span>
          <span>&bull;</span>
          <span>Atajos: <kbd class="px-1.5 py-0.5 bg-amber-100 rounded border border-amber-300 font-mono text-[10px]">Supr</kbd> borrar &bull; <kbd class="px-1.5 py-0.5 bg-amber-100 rounded border border-amber-300 font-mono text-[10px]">Ctrl+Z</kbd> deshacer</span>
          <span>&bull;</span>
          <span>Usa los tiradores para rotar y escalar</span>
        </div>
      </main>
    </div>

    <!-- Modals -->
    <EmojiPickerModal
      :is-open="showPicker"
      @select="onPickerSelect"
      @close="showPicker = false"
    />

    <ExportModal
      :is-open="isExportModalOpen"
      :export-scale="exporter.exportScale.value"
      :canvas-width="stage.canvasWidth.value"
      :canvas-height="stage.canvasHeight.value"
      :copied="exporter.copied.value"
      @close="isExportModalOpen = false"
      @update:export-scale="exporter.exportScale.value = $event"
      @download="handleDownload"
      @copy="exporter.copyToClipboard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { emojiFallback } from './icons';
import { useSocialPresets, type FormatPreset } from '../composables/useSocialPresets';
import { useKonvaStage } from '../composables/useKonvaStage';
import { useKonvaLayers, type TextNodeOptions } from '../composables/useKonvaLayers';
import { useKonvaEffects } from '../composables/useKonvaEffects';
import { useKonvaTemplates } from '../composables/useKonvaTemplates';
import { useCanvasExport } from '../composables/useCanvasExport';
import { useHistoryUndo } from '../composables/useHistoryUndo';

// Subcomponents per DEVELOPMENT_GUIDELINES
import StudioHeader from './studio/StudioHeader.vue';
import KonvaStage from './canvas/KonvaStage.vue';
import CanvasToolbar from './canvas/CanvasToolbar.vue';
import AddTool from './studio/AddTool.vue';
import BackgroundTool from './studio/BackgroundTool.vue';
import TemplatesTool from './studio/TemplatesTool.vue';
import LayersPanel from './studio/LayersPanel.vue';
import EmojiPickerModal from './common/EmojiPickerModal.vue';
import ExportModal from './common/ExportModal.vue';

// State & Composables
const { currentPreset, formatPresets, selectPreset } = useSocialPresets();
const stage = useKonvaStage();
const layers = useKonvaLayers(stage);
const effects = useKonvaEffects(stage, () => {
  layers.refreshLayersList();
  layers.triggerNodeUpdate();
});
const exporter = useCanvasExport(stage);

const history = useHistoryUndo(
  () => stage.layerInstance.value,
  () => stage.transformerInstance.value,
  () => {
    layers.refreshLayersList();
    layers.triggerNodeUpdate();
  }
);

const templates = useKonvaTemplates(
  stage,
  layers,
  effects,
  (width, height, presetId) => {
    const found = formatPresets.find((p) => p.id === presetId);
    if (found) selectPreset(found);
    stage.changeDimensions(width, height);
  }
);

// 4 Essential Tabs
const activeTab = ref<'templates' | 'add' | 'bg' | 'layers'>('templates');
const showPicker = ref(false);
const isExportModalOpen = ref(false);

const tabList = [
  { id: 'templates', label: 'Plantillas', icon: '📋' },
  { id: 'add', label: 'Añadir', icon: '➕' },
  { id: 'bg', label: 'Fondo', icon: '🎨' },
  { id: 'layers', label: 'Capas', icon: '📚' }
] as const;

const quickEmojiList = Object.entries(emojiFallback).map(([name, char]) => ({
  name,
  char
}));

const handlePresetSelect = (preset: FormatPreset) => {
  selectPreset(preset);
  stage.changeDimensions(preset.baseWidth, preset.baseHeight);
};

const handleTemplateSelect = (templateId: string) => {
  templates.applyTemplate(templateId);
  setTimeout(() => history.saveState(), 80);
};

const handleAddEmoji = (char: string) => {
  layers.addEmoji(char);
  setTimeout(() => history.saveState(), 50);
};

const onPickerSelect = (char: string) => {
  handleAddEmoji(char);
};

const handleAddText = (opts: TextNodeOptions) => {
  layers.addText(opts);
  setTimeout(() => history.saveState(), 50);
};

const handleAddImage = (url: string) => {
  layers.addImage(url);
  setTimeout(() => history.saveState(), 100);
};

const handleUpdateText = (options: any) => {
  layers.updateSelectedText(options);
  history.saveState();
};

const handleApplyTextPreset = (preset: any) => {
  layers.applyTextPreset(preset);
  history.saveState();
};

const handleApplyImagePreset = (preset: any, customColor?: string) => {
  effects.applyImagePreset(preset, customColor);
  layers.refreshLayersList();
  layers.triggerNodeUpdate();
  history.saveState();
};

const handleUpdateShadow = (opts: any) => {
  layers.updateSelectedShadow(opts);
  history.saveState();
};

const handleUpdateStroke = (opts: any) => {
  layers.updateSelectedStroke(opts);
  history.saveState();
};

const handleReorderLayer = (payload: { fromIndex: number; toIndex: number }) => {
  layers.reorderLayerByIndex(payload.fromIndex, payload.toIndex);
  history.saveState();
};

const handleToggleLock = (node?: any) => {
  effects.toggleLock(node || stage.selectedNode.value);
  layers.refreshLayersList();
  history.saveState();
};

const handleDuplicateNode = (node: any) => {
  stage.selectNode(node);
  layers.duplicateSelected();
  setTimeout(() => history.saveState(), 50);
};

const handleDeleteSelected = () => {
  layers.deleteSelected();
  history.saveState();
};

const handleFillPattern = (emojiChar: string) => {
  layers.fillEmojiPattern(emojiChar);
  history.saveState();
};

const handleClearAll = () => {
  if (confirm('¿Estás seguro de que deseas vaciar todas las capas del lienzo?')) {
    layers.clearAll();
    history.saveState();
  }
};

const handleDownload = () => {
  const cleanName = currentPreset.value.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  exporter.downloadPng(`pixemoji-${cleanName}`);
};

const handleKeyDown = (e: KeyboardEvent) => {
  const activeEl = document.activeElement;
  const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

  if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
    if (stage.selectedNode.value) {
      e.preventDefault();
      handleDeleteSelected();
    }
  }

  if ((e.ctrlKey || e.metaKey) && !isTyping) {
    if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      if (e.shiftKey) history.redo();
      else history.undo();
    } else if (e.key === 'y' || e.key === 'Y') {
      e.preventDefault();
      history.redo();
    }
  }
};

onMounted(async () => {
  await stage.initStage({
    containerId: 'konva-meme-stage',
    initialWidth: currentPreset.value.baseWidth,
    initialHeight: currentPreset.value.baseHeight
  });

  if (stage.stageInstance.value) {
    stage.stageInstance.value.on('dragend transformend', () => {
      history.saveState();
    });
  }

  layers.addEmoji('🧁');
  setTimeout(() => history.saveState(), 100);

  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown);
  }
  stage.destroyStage();
});
</script>
