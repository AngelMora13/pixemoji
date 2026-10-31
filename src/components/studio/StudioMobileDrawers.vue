<template>
  <div class="lg:hidden select-none">
    <!-- Hidden file input for uploading images -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFileSelected"
    />

    <!-- 1. DRAGGABLE MOBILE BOTTOM SHEET (Above Bottom Action Bar) -->
    <section
      v-show="isSheetOpen"
      class="fixed inset-x-0 bottom-[54px] z-30 bg-white rounded-t-[28px] border-t border-[#EAE1D2] shadow-sheet flex flex-col transition-[height] duration-150 ease-out"
      :style="{ height: `${sheetHeight}vh` }"
      data-purpose="mobile-bottom-sheet-controls"
    >
      <!-- Drag Handle / Grab indicator -->
      <div
        class="w-full pt-2 pb-1.5 flex justify-center cursor-grab active:cursor-grabbing touch-none shrink-0"
        @mousedown="onDragStart"
        @touchstart="onDragStart"
        title="Arrastra para ajustar la altura del panel"
      >
        <div class="w-12 h-1.2 bg-stone-300 hover:bg-stone-400 rounded-full transition-colors"></div>
      </div>

      <!-- Header row with navigation & actions -->
      <div class="px-4 py-2 border-b border-[#F0E6D8] flex items-center justify-between shrink-0 bg-[#FFFDF9]/80">
        <!-- Left: Context title or Back buttons -->
        <div class="flex items-center gap-2 min-w-0">
          <!-- Back from Background to Layers -->
          <button
            v-if="sheetTab === 'background'"
            type="button"
            @click="sheetTab = 'layers'"
            class="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
          >
            <span>&larr;</span>
            <span>Volver a Capas</span>
          </button>

          <!-- Back from Layers to Element (if element selected) -->
          <button
            v-else-if="sheetTab === 'layers' && hasSelectedNode"
            type="button"
            @click="sheetTab = 'element'"
            class="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
          >
            <span>&larr;</span>
            <span>Volver a {{ activeElement?.type || 'Elemento' }}</span>
          </button>

          <!-- Standard title when in Element mode -->
          <div v-else-if="sheetTab === 'element' && activeElement" class="flex items-center gap-1.5 min-w-0">
            <span class="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary-100 text-primary-800 border border-primary-200 shrink-0">
              {{ activeElement.type }}
            </span>
            <span class="text-xs font-bold text-text-main truncate max-w-[150px]">
              {{ activeElement.label }}
            </span>
          </div>

          <!-- Title for Layers tab without active element -->
          <div v-else class="flex items-center gap-1.5">
            <span class="text-sm">📚</span>
            <span class="text-xs font-bold text-text-main">
              Capas del Lienzo
            </span>
          </div>
        </div>

        <!-- Right: Close / Collapse sheet button -->
        <button
          type="button"
          @click="isSheetOpen = false"
          class="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-xs font-bold text-text-subtle hover:text-text-main transition-colors cursor-pointer"
          title="Ocultar panel"
        >
          ✕
        </button>
      </div>

      <!-- Scrollable Tab Content Container -->
      <div class="px-4 py-3 space-y-4 overflow-y-auto no-scrollbar flex-1" id="tab-content-container">
        <!-- TAB 1: ELEMENT PROPERTIES INSPECTOR -->
        <div v-if="sheetTab === 'element'">
          <TextInspector v-if="activeElement && activeElement.type === 'Texto'" />
          <EmojiInspector v-else-if="activeElement && activeElement.type === 'Emoji'" />
          <ImageInspector v-else-if="activeElement && (activeElement.type === 'Imagen' || activeElement.type === 'Objeto')" />
          <div v-else class="text-center py-6 space-y-2 text-text-muted">
            <span class="text-3xl block">👆</span>
            <p class="text-xs font-semibold">Toca cualquier elemento del lienzo para editarlo aquí.</p>
          </div>
        </div>

        <!-- TAB 2: LAYERS LIST -->
        <div v-else-if="sheetTab === 'layers'" class="space-y-3">
          <LayersPanel
            :layers="currentLayersList"
            :selected-node="currentSelectedNode"
            @select="onSelectLayer"
            @toggle-lock="onToggleLock"
            @duplicate="onDuplicate"
            @move-up="onMoveUp"
            @move-down="onMoveDown"
            @reorder="onReorder"
            @remove="onRemove"
            @clear-all="onClearAll"
          />

          <!-- Canvas Background Trigger Button at the end of Layers -->
          <div class="pt-2 border-t border-app-border">
            <button
              type="button"
              @click="sheetTab = 'background'"
              class="w-full p-2.5 rounded-2xl border border-app-border bg-stone-50 hover:bg-primary-50/80 hover:border-primary-300 transition-all flex items-center justify-between text-xs font-bold text-text-main cursor-pointer shadow-2xs group"
              title="Configurar color, degradado o fondo transparente"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-white border border-app-border flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform">
                  🎨
                </div>
                <div class="text-left">
                  <span class="block text-xs font-bold text-text-main">Fondo del Lienzo</span>
                  <span class="block text-[10px] text-text-muted font-medium">
                    {{ currentIsBgTransparent ? 'Transparente' : currentBgMode === 'gradient' ? 'Degradado activo' : 'Color ' + currentBgColor }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-1 text-[11px] text-primary-600 font-bold group-hover:translate-x-0.5 transition-transform">
                <span>Modificar</span>
                <span>&rarr;</span>
              </div>
            </button>
          </div>
        </div>

        <!-- TAB 3: CANVAS BACKGROUND EDITOR -->
        <div v-else-if="sheetTab === 'background'" class="space-y-3">
          <BackgroundTool
            :is-transparent="currentIsBgTransparent"
            :bg-mode="currentBgMode"
            :bgColor="currentBgColor"
            :active-gradient="currentActiveGradient"
            :gradient-presets="currentGradientPresets"
            :frame="studio?.frame"
            @set-transparent="onSetTransparent"
            @set-color="onSetColor"
            @set-gradient="onSetGradient"
            @fill-pattern="onFillPattern"
            @clear-pattern="onClearPattern"
          />
        </div>
      </div>
    </section>

    <!-- 2. FIXED BOTTOM ACTION BAR (Outside of the bottom sheet) -->
    <nav
      class="fixed bottom-0 inset-x-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#F0E6D8] py-1 px-4 flex items-center justify-around pb-safe shadow-lg"
      data-purpose="mobile-bottom-action-bar"
    >
      <!-- Action 1: Emoji -->
      <button
        type="button"
        @click="onAddEmojiClick"
        class="flex flex-col items-center justify-center py-1 px-3 text-text-muted hover:text-primary-600 active:scale-95 transition-all cursor-pointer"
        title="Añadir emoji"
      >
        <span class="text-xl">🧁</span>
        <span class="text-[10px] font-bold mt-0.5">Emoji</span>
      </button>

      <!-- Action 2: Imagen -->
      <button
        type="button"
        @click="onAddImageClick"
        class="flex flex-col items-center justify-center py-1 px-3 text-text-muted hover:text-primary-600 active:scale-95 transition-all cursor-pointer"
        title="Subir o añadir imagen"
      >
        <span class="text-xl">🖼️</span>
        <span class="text-[10px] font-bold mt-0.5">Imagen</span>
      </button>

      <!-- Action 3: Texto -->
      <button
        type="button"
        @click="onAddTextClick"
        class="flex flex-col items-center justify-center py-1 px-3 text-text-muted hover:text-primary-600 active:scale-95 transition-all cursor-pointer"
        title="Añadir texto"
      >
        <span class="text-xl">💬</span>
        <span class="text-[10px] font-bold mt-0.5">Texto</span>
      </button>

      <!-- Action 4: Ajustes (Capas & Fondo) -->
      <button
        type="button"
        @click="openSettings"
        :class="[
          'flex flex-col items-center justify-center py-1 px-3 active:scale-95 transition-all cursor-pointer',
          isSheetOpen && (sheetTab === 'layers' || sheetTab === 'background')
            ? 'text-primary-600 font-bold'
            : 'text-text-muted hover:text-primary-600'
        ]"
        title="Ajustes de capas y fondo"
      >
        <span class="text-xl">⚙️</span>
        <span class="text-[10px] font-bold mt-0.5">Ajustes</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { TextNodeOptions } from '../../composables/useKonvaLayers';
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';
import TextInspector from './TextInspector.vue';
import EmojiInspector from './EmojiInspector.vue';
import ImageInspector from './ImageInspector.vue';
import LayersPanel from './LayersPanel.vue';
import BackgroundTool from './BackgroundTool.vue';
import type { EmojiPatternOptions } from '../../composables/useKonvaLayers';

const studio = useCanvasStudio();

const emit = defineEmits<{
  (e: 'add-text', opts: TextNodeOptions): void;
  (e: 'select-emoji', char: string): void;
  (e: 'add-image', url: string): void;
  (e: 'quick-add', type: 'text' | 'emoji' | 'image'): void;
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);

// Bottom Sheet State
const isSheetOpen = ref(false);
const sheetTab = ref<'element' | 'layers' | 'background'>('element');
const sheetHeight = ref(40); // default 40%

const STORAGE_KEY = 'pixemoji_mobile_sheet_height';

onMounted(() => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const val = parseInt(saved, 10);
        if (val >= 25 && val <= 85) {
          sheetHeight.value = val;
        }
      }
    } catch (_) {}
  }
});

// Drag to Resize Logic
const onDragStart = (e: MouseEvent | TouchEvent) => {
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  const startY = clientY;
  const startHeight = sheetHeight.value;

  const onDragMove = (ev: MouseEvent | TouchEvent) => {
    const currentY = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
    const deltaY = startY - currentY;
    const deltaVh = (deltaY / window.innerHeight) * 100;
    const newHeight = Math.min(85, Math.max(25, Math.round(startHeight + deltaVh)));
    sheetHeight.value = newHeight;
  };

  const onDragEnd = () => {
    window.removeEventListener('mousemove', onDragMove);
    window.removeEventListener('mouseup', onDragEnd);
    window.removeEventListener('touchmove', onDragMove);
    window.removeEventListener('touchend', onDragEnd);
    try {
      localStorage.setItem(STORAGE_KEY, sheetHeight.value.toString());
    } catch (_) {}
  };

  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);
  window.addEventListener('touchmove', onDragMove, { passive: true });
  window.addEventListener('touchend', onDragEnd);
};

// Computed references for elements & layers
const activeElement = computed(() => studio?.activeElement.value ?? null);
const hasSelectedNode = computed(() => Boolean(studio?.stage.selectedNode.value));

const currentLayersList = computed(() => studio?.layersListReversed.value ?? []);
const currentSelectedNode = computed(() => studio?.stage.selectedNode.value ?? null);
const currentIsBgTransparent = computed(() => studio?.stage.isBgTransparent.value ?? false);
const currentBgMode = computed(() => studio?.stage.bgMode.value ?? 'solid');
const currentBgColor = computed(() => studio?.stage.bgColor.value ?? '#ffffff');
const currentActiveGradient = computed(() => studio?.stage.activeGradient.value ?? null);
const currentGradientPresets = computed(() => studio?.stage.gradientPresets ?? []);

// Automatically open sheet when an element is selected on mobile
watch(
  () => studio?.stage.selectedNode.value,
  (node) => {
    if (node) {
      isSheetOpen.value = true;
      sheetTab.value = 'element';
    }
  }
);

// Navigation & Actions
const openInspector = () => {
  isSheetOpen.value = true;
  sheetTab.value = 'element';
};

const openTools = () => {
  isSheetOpen.value = true;
  sheetTab.value = 'layers';
};

const openSettings = () => {
  if (isSheetOpen.value && (sheetTab.value === 'layers' || sheetTab.value === 'background')) {
    isSheetOpen.value = false;
  } else {
    isSheetOpen.value = true;
    sheetTab.value = 'layers';
  }
};

const onAddEmojiClick = () => {
  emit('select-emoji', '🧁');
  isSheetOpen.value = true;
  sheetTab.value = 'element';
};

const onAddTextClick = () => {
  emit('add-text', {
    text: 'Escribe tu texto...',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 44,
    textColor: '#1e293b',
    strokeWidth: 0,
    fontStyle: 'normal'
  });
  isSheetOpen.value = true;
  sheetTab.value = 'element';
};

const onAddImageClick = () => {
  fileInputRef.value?.click();
};

const onFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target?.result as string;
    if (dataUrl) {
      emit('add-image', dataUrl);
      isSheetOpen.value = true;
      sheetTab.value = 'element';
    }
  };
  reader.readAsDataURL(file);
  target.value = '';
};

// Layer operations
const onSelectLayer = (node: any) => {
  if (studio) studio.selectNode(node);
  sheetTab.value = 'element';
};

const onToggleLock = (node?: any) => {
  studio?.change('toggleLock', node || studio.stage.selectedNode.value);
};

const onDuplicate = (node: any) => {
  if (studio) {
    studio.selectNode(node);
    studio.change('duplicate');
  }
};

const onMoveUp = (id: string) => {
  studio?.layers.moveLayerUp(id);
};

const onMoveDown = (id: string) => {
  studio?.layers.moveLayerDown(id);
};

const onReorder = (payload: { fromIndex: number; toIndex: number }) => {
  studio?.change('reorder', payload);
};

const onRemove = (id: string) => {
  studio?.layers.removeLayer(id);
};

const onClearAll = () => {
  studio?.change('clearAll');
};

// Background operations
const onSetTransparent = () => {
  studio?.stage.setBgTransparent();
  studio?.history.saveState(true);
};

const onSetColor = (color: string) => {
  studio?.stage.setBgColor(color);
  studio?.history.saveState(true);
};

const onSetGradient = (gradient: any) => {
  studio?.stage.setBgGradient(gradient);
  studio?.history.saveState(true);
};

const onFillPattern = (emoji: string, options?: EmojiPatternOptions) => {
  studio?.layers.fillEmojiPattern(emoji, options);
  studio?.history.saveState(true);
};

const onClearPattern = () => {
  studio?.layers.clearEmojiPattern();
  studio?.history.saveState(true);
};

defineExpose({
  openInspector,
  openTools
});
</script>
