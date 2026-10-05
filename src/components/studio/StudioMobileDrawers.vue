<template>
  <div>
    <!-- Mobile Floating Action Bubbles (FABs) -->
    <div class="lg:hidden fixed bottom-4 inset-x-0 z-40 px-4 pointer-events-none flex items-center justify-between">
      <button
        type="button"
        @click="isLeftOpen = true"
        class="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-app-border-strong text-text-main shadow-xl hover:bg-primary-50 font-bold text-xs active:scale-95 transition-all cursor-pointer"
        title="Abrir herramientas y capas"
      >
        <span class="text-base leading-none">🛠️</span>
        <span>Herramientas</span>
        <span class="w-2 h-2 rounded-full bg-primary-500"></span>
      </button>

      <button
        type="button"
        @click="isRightOpen = true"
        :class="[
          'pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl font-bold text-xs active:scale-95 transition-all cursor-pointer',
          hasSelectedNode
            ? 'bg-primary-gradient text-white ring-4 ring-primary-300/40 animate-pulse'
            : 'bg-white/95 backdrop-blur-md border border-app-border-strong text-text-main hover:bg-primary-50'
        ]"
        title="Abrir inspector de propiedades"
      >
        <span class="text-base leading-none">
          {{ hasSelectedNode ? '✏️' : '⚙️' }}
        </span>
        <span>{{ hasSelectedNode ? 'Inspector' : 'Ajustes' }}</span>
      </button>
    </div>

    <!-- Mobile Drawer 1: Tools & Layers (BottomSheetModal) -->
    <BottomSheetModal
      :is-open="isLeftOpen"
      title="Herramientas & Capas"
      icon="🛠️"
      @close="isLeftOpen = false"
    >
      <ToolsSidebarContent
        @add-text="onAddText"
        @select-emoji="onSelectEmoji"
        @add-image="onAddImage"
        @select-layer="onSelectLayer"
      />
    </BottomSheetModal>

    <!-- Mobile Drawer 2: Properties Inspector (BottomSheetModal) -->
    <BottomSheetModal
      :is-open="isRightOpen"
      @close="isRightOpen = false"
    >
      <InspectorPanel
        @close-panel="isRightOpen = false"
        @quick-add="onQuickAdd"
      />
    </BottomSheetModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TextNodeOptions } from '../../composables/useKonvaLayers';
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';
import BottomSheetModal from '../common/BottomSheetModal.vue';
import ToolsSidebarContent from './ToolsSidebarContent.vue';
import InspectorPanel from './InspectorPanel.vue';

const studio = useCanvasStudio();

const emit = defineEmits<{
  (e: 'add-text', opts: TextNodeOptions): void;
  (e: 'select-emoji', char: string): void;
  (e: 'add-image', url: string): void;
  (e: 'quick-add', type: 'text' | 'emoji' | 'image'): void;
}>();

const isLeftOpen = ref(false);
const isRightOpen = ref(false);

const hasSelectedNode = computed(() => Boolean(studio?.stage.selectedNode.value));

const openInspector = () => {
  isRightOpen.value = true;
};

const openTools = () => {
  isLeftOpen.value = true;
};

const onAddText = (opts: TextNodeOptions) => {
  emit('add-text', opts);
  isLeftOpen.value = false;
  isRightOpen.value = true;
};

const onSelectEmoji = (char: string) => {
  emit('select-emoji', char);
  isLeftOpen.value = false;
  isRightOpen.value = true;
};

const onAddImage = (url: string) => {
  emit('add-image', url);
  isLeftOpen.value = false;
  isRightOpen.value = true;
};

const onSelectLayer = (node: any) => {
  if (studio) studio.selectNode(node);
  isLeftOpen.value = false;
  isRightOpen.value = true;
};

const onQuickAdd = (type: 'text' | 'emoji' | 'image') => {
  emit('quick-add', type);
  isRightOpen.value = true;
};

defineExpose({
  openInspector,
  openTools
});
</script>
