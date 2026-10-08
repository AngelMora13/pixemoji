<template>
  <div class="w-full h-full flex flex-col overflow-hidden bg-app-bg text-text-main select-none">
    <!-- Studio Header Bar: Selector de formato y botón de exportar -->
    <StudioHeader
      :current-preset="currentPreset"
      :format-presets="formatPresets"
      @select-preset="handlePresetSelect"
      @open-custom-modal="isCustomModalOpen = true"
      @open-export="isExportModalOpen = true"
    />

    <!-- Main Workspace 3-Column Layout -->
    <div class="flex-1 flex overflow-hidden relative select-none w-full min-h-0" data-purpose="main-editor-container">
      <!-- COLUMN 1: LEFT SIDEBAR (Desktop) -->
      <aside
        v-if="isLeftSidebarOpen"
        class="hidden lg:flex w-80 shrink-0 bg-white border-r border-app-border flex-col h-full overflow-hidden z-10 shadow-xs transition-all duration-300"
        data-purpose="left-tools-panel"
      >
        <ToolsSidebarContent
          show-close-button
          @close="isLeftSidebarOpen = false"
          @add-text="handleAddText"
          @select-emoji="handleAddEmoji"
          @add-image="handleAddImage"
        />
      </aside>

      <!-- Expand Left Sidebar Tab Button when Collapsed (Desktop) -->
      <button
        v-else
        type="button"
        @click="isLeftSidebarOpen = true"
        class="hidden lg:flex absolute top-4 left-4 z-20 items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-app-border-strong shadow-md text-xs font-bold text-text-main hover:bg-primary-50 hover:text-primary-600 transition-all cursor-pointer"
        title="Mostrar herramientas"
      >
        <span>🛠️</span>
        <span>Herramientas</span>
        <svg class="w-3.5 h-3.5 text-text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- COLUMN 2: CENTER FIXED CANVAS VIEWPORT -->
      <CanvasViewport
        :width="stage.canvasWidth.value"
        :height="stage.canvasHeight.value"
        :ratio-label="currentPreset.ratioLabel"
        :is-transparent="stage.isBgTransparent.value"
        :bg-color="stage.bgColor.value"
        :can-undo="history.canUndo.value"
        :can-redo="history.canRedo.value"
        :templates="templates.availableTemplates"
        :frame="frame"
        @undo="history.undo"
        @redo="history.redo"
        @open-inspector="openInspectorPanel"
        @select-template="handleTemplateSelect"
      />

      <!-- Expand Right Sidebar Tab Button when Collapsed (Desktop) -->
      <button
        v-if="!isRightSidebarOpen"
        type="button"
        @click="isRightSidebarOpen = true"
        class="hidden lg:flex absolute top-4 right-4 z-20 items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-app-border-strong shadow-md text-xs font-bold text-text-main hover:bg-primary-50 hover:text-primary-600 transition-all cursor-pointer"
        title="Mostrar inspector de propiedades"
      >
        <svg class="w-3.5 h-3.5 text-text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Inspector</span>
        <span>⚙️</span>
      </button>

      <!-- COLUMN 3: PROPERTIES INSPECTOR PANEL (Desktop) -->
      <aside
        v-if="isRightSidebarOpen"
        class="hidden lg:flex w-80 xl:w-96 shrink-0 bg-white border-l border-app-border flex-col h-full overflow-hidden shadow-lg z-20 transition-all duration-300"
        data-purpose="right-inspector-panel"
      >
        <InspectorPanel
          @close-panel="isRightSidebarOpen = false"
          @quick-add="handleQuickAdd"
        />
      </aside>
    </div>

    <!-- Mobile Drawers & FABs -->
    <StudioMobileDrawers
      ref="mobileDrawersRef"
      @add-text="handleAddText"
      @select-emoji="handleAddEmoji"
      @add-image="handleAddImage"
      @quick-add="handleQuickAdd"
    />

    <!-- Global Modals -->
    <EmojiPickerModal />

    <ExportModal
      :is-open="isExportModalOpen"
      :export-scale="exporter.exportScale.value"
      :canvas-width="exporter.effectiveWidth.value"
      :canvas-height="exporter.effectiveHeight.value"
      :copied="exporter.copied.value"
      @close="isExportModalOpen = false"
      @update:export-scale="exporter.exportScale.value = $event"
      @download="handleDownload"
      @copy="exporter.copyToClipboard"
    />

    <!-- Custom Canvas Size Modal -->
    <CustomCanvasSizeModal
      :is-open="isCustomModalOpen"
      :initial-width="customDimensions.width"
      :initial-height="customDimensions.height"
      @close="isCustomModalOpen = false"
      @apply="handleCustomSizeApply"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useSocialPresets, type FormatPreset } from '../composables/useSocialPresets';
import { useKonvaStage } from '../composables/useKonvaStage';
import { useKonvaLayers, type TextNodeOptions } from '../composables/useKonvaLayers';
import { useKonvaEffects } from '../composables/useKonvaEffects';
import { useKonvaTemplates } from '../composables/useKonvaTemplates';
import { useCanvasExport } from '../composables/useCanvasExport';
import { useCanvasFrame } from '../composables/useCanvasFrame';
import { useHistoryUndo } from '../composables/useHistoryUndo';
import { useStudioShortcuts } from '../composables/useStudioShortcuts';
import { createStudioContext, provideCanvasStudio } from '../composables/useCanvasStudioContext';
import { PLACEHOLDER_IMAGE_URL } from '../utils/index.ts';

// Modular Components
import StudioHeader from './studio/StudioHeader.vue';
import CanvasViewport from './canvas/CanvasViewport.vue';
import InspectorPanel from './studio/InspectorPanel.vue';
import ToolsSidebarContent from './studio/ToolsSidebarContent.vue';
import StudioMobileDrawers from './studio/StudioMobileDrawers.vue';
import EmojiPickerModal from './common/EmojiPickerModal.vue';
import ExportModal from './common/ExportModal.vue';
import CustomCanvasSizeModal from './common/CustomCanvasSizeModal.vue';

// Composables & State
const { currentPreset, formatPresets, customDimensions, selectPreset, setCustomDimensions } = useSocialPresets();
const stage = useKonvaStage();
const layers = useKonvaLayers(stage);
const effects = useKonvaEffects(stage, layers);
const frame = useCanvasFrame();
const exporter = useCanvasExport(stage, frame);
const history = useHistoryUndo(stage, layers);

// Centralized Studio Context
const studio = createStudioContext(stage, layers, history, frame);
provideCanvasStudio(studio);

const templates = useKonvaTemplates(
  stage,
  layers,
  effects,
  (width, height, presetId) => {
    const found = formatPresets.value.find((p) => p.id === presetId || (presetId === 'stories-reels' && p.id === 'story-reels'));
    if (found) selectPreset(found);
    stage.changeDimensions(width, height);
  }
);

// Sidebar & Drawer States
const isLeftSidebarOpen = ref(true);
const isRightSidebarOpen = ref(true);
const mobileDrawersRef = ref<InstanceType<typeof StudioMobileDrawers> | null>(null);
const isExportModalOpen = ref(false);
const isCustomModalOpen = ref(false);

// Auto-open right inspector when a node is selected on desktop
watch(
  () => stage.selectedNode.value,
  (node) => {
    if (node && !isRightSidebarOpen.value && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      isRightSidebarOpen.value = true;
    }
  }
);

const openInspectorPanel = () => {
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    mobileDrawersRef.value?.openInspector();
  } else {
    isRightSidebarOpen.value = true;
  }
};

const handlePresetSelect = (preset: FormatPreset) => {
  selectPreset(preset);
  stage.changeDimensions(preset.baseWidth, preset.baseHeight);
  if (frame.active.value && stage.stageInstance.value && stage.layerInstance.value) {
    frame.syncFrame(
      stage.stageInstance.value,
      stage.layerInstance.value,
      preset.baseWidth,
      preset.baseHeight,
      stage.transformerInstance.value,
      stage.bgRectNode.value
    );
    stage.canvasWidth.value = stage.stageInstance.value.width();
    stage.canvasHeight.value = stage.stageInstance.value.height();
  }
};

const handleCustomSizeApply = (size: { width: number; height: number }) => {
  const updatedPreset = setCustomDimensions(size.width, size.height);
  handlePresetSelect(updatedPreset);
  isCustomModalOpen.value = false;
};

const handleTemplateSelect = (templateId: string) => {
  templates.applyTemplate(templateId);
  history.saveState(true);
};

const handleAddEmoji = (char: string) => {
  layers.addEmoji(char);
  history.saveState(true);
};

const handleAddText = (opts: TextNodeOptions) => {
  layers.addText(opts);
  history.saveState(true);
};

const handleAddImage = (url: string) => {
  layers.addImage(url);
  setTimeout(() => history.saveState(true), 120);
};

const handleQuickAdd = (type: 'text' | 'emoji' | 'image') => {
  if (type === 'text') {
    handleAddText({
      text: 'Escribe tu texto...',
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 44,
      textColor: '#1e293b',
      strokeWidth: 0,
      strokeColor: undefined,
      fontStyle: 'normal'
    });
  } else if (type === 'emoji') {
    handleAddEmoji('🧁');
  } else if (type === 'image') {
    handleAddImage(PLACEHOLDER_IMAGE_URL);
  }
};

const handleDownload = () => {
  const cleanName = currentPreset.value.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  exporter.downloadPng(`pixemoji-${cleanName}`);
};

// Global Studio Keyboard Shortcuts
useStudioShortcuts({
  onDelete: () => studio.change('delete'),
  onUndo: history.undo,
  onRedo: history.redo,
  canDelete: () => Boolean(stage.selectedNode.value)
});

onMounted(async () => {
  await stage.initStage({
    containerId: 'konva-meme-stage',
    initialWidth: currentPreset.value.baseWidth,
    initialHeight: currentPreset.value.baseHeight
  });

  if (stage.stageInstance.value && stage.layerInstance.value && stage.KonvaModule.value) {
    frame.initFrameNode(stage.KonvaModule.value, stage.stageInstance.value, stage.layerInstance.value);
    stage.stageInstance.value.on('dragend transformend', () => {
      history.saveState();
    });
  }

  layers.addEmoji('🧁');
  history.saveState(true);
});

onUnmounted(() => {
  stage.destroyStage();
});
</script>
