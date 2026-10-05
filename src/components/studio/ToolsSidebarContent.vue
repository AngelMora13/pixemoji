<template>
  <div class="flex flex-col h-full overflow-hidden select-none" data-purpose="tools-sidebar-content">
    <!-- Pestañas de Navegación: Añadir y Capas -->
    <div class="p-3 border-b border-app-border bg-app-header/70 flex items-center justify-between gap-2 shrink-0">
      <nav class="grid grid-cols-2 gap-1 p-1 bg-primary-100/70 rounded-xl text-xs font-semibold flex-1 border border-primary-200">
        <button
          v-for="tab in tabList"
          :key="tab.id"
          type="button"
          @click="activeTab = tab.id"
          :class="[
            'flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
            activeTab === tab.id
              ? 'bg-white text-primary-600 shadow-2xs ring-1 ring-app-border-strong'
              : 'text-text-muted hover:text-text-main'
          ]"
        >
          <span class="text-xs">{{ tab.icon }}</span>
          <span class="text-xs">{{ tab.label }}</span>
        </button>
      </nav>

      <!-- Botón opcional de cerrar (ej: en desktop o drawer) -->
      <button
        v-if="showCloseButton"
        type="button"
        @click="$emit('close')"
        class="p-1.5 rounded-lg text-text-subtle hover:text-text-main hover:bg-stone-100 transition-colors cursor-pointer text-xs shrink-0"
        title="Ocultar herramientas"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Contenido Scrollable de Herramientas -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- TAB 1: AÑADIR -->
      <div v-show="activeTab === 'add'" class="space-y-4">
        <AddTool
          @add-text="onAddText"
          @select-emoji="onSelectEmoji"
          @add-image="onAddImage"
        />
      </div>

      <!-- TAB 2: CAPAS (con opción interna de modificar fondo) -->
      <div v-show="activeTab === 'layers'" class="space-y-3">
        <!-- MODO A: LISTA DE CAPAS -->
        <div v-if="layersSubMode === 'layers'" class="space-y-3">
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

          <!-- Botón Fondo del lienzo colocado al final de la lista -->
          <div class="pt-2 border-t border-app-border">
            <button
              type="button"
              @click="layersSubMode = 'background'"
              class="w-full p-2.5 rounded-2xl border border-app-border bg-stone-50 hover:bg-primary-50/80 hover:border-primary-300 transition-all flex items-center justify-between text-xs font-bold text-text-main cursor-pointer shadow-2xs group"
              title="Configurar color, degradado o textura del fondo del lienzo"
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

        <!-- MODO B: MODIFICAR FONDO -->
        <div v-else class="space-y-3">
          <button
            type="button"
            @click="layersSubMode = 'layers'"
            class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50/70 hover:bg-primary-100 border border-primary-200 transition-all cursor-pointer"
            title="Regresar a la lista de capas"
          >
            <span>&larr;</span>
            <span>Volver a Capas</span>
          </button>

          <BackgroundTool
            :is-transparent="currentIsBgTransparent"
            :bg-mode="currentBgMode"
            :bgColor="currentBgColor"
            :active-gradient="currentActiveGradient"
            :gradient-presets="currentGradientPresets"
            @set-transparent="onSetTransparent"
            @set-color="onSetColor"
            @set-gradient="onSetGradient"
            @fill-pattern="onFillPattern"
            @clear-pattern="onClearPattern"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { TextNodeOptions } from '../../composables/useKonvaLayers';
import type { GradientPreset } from '../../composables/useKonvaStage';
import { useCanvasStudio } from '../../composables/useCanvasStudioContext';
import AddTool from './AddTool.vue';
import LayersPanel from './LayersPanel.vue';
import BackgroundTool from './BackgroundTool.vue';

const studio = useCanvasStudio();

const props = withDefaults(
  defineProps<{
    layersList?: any[];
    selectedNode?: any;
    isBgTransparent?: boolean;
    bgMode?: 'transparent' | 'solid' | 'gradient';
    bgColor?: string;
    activeGradient?: GradientPreset | null;
    gradientPresets?: GradientPreset[];
    showCloseButton?: boolean;
  }>(),
  {
    showCloseButton: false
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'add-text', opts: TextNodeOptions): void;
  (e: 'select-emoji', char: string): void;
  (e: 'add-image', url: string): void;
  (e: 'select-layer', node: any): void;
}>();

const currentLayersList = computed(() => props.layersList ?? studio?.layersListReversed.value ?? []);
const currentSelectedNode = computed(() => props.selectedNode ?? studio?.stage.selectedNode.value ?? null);
const currentIsBgTransparent = computed(() => props.isBgTransparent ?? studio?.stage.isBgTransparent.value ?? false);
const currentBgMode = computed(() => props.bgMode ?? studio?.stage.bgMode.value ?? 'solid');
const currentBgColor = computed(() => props.bgColor ?? studio?.stage.bgColor.value ?? '#ffffff');
const currentActiveGradient = computed(() => props.activeGradient ?? studio?.stage.activeGradient.value ?? null);
const currentGradientPresets = computed(() => props.gradientPresets ?? studio?.stage.gradientPresets ?? []);

const activeTab = ref<'add' | 'layers'>('layers');
const layersSubMode = ref<'layers' | 'background'>('layers');

const tabList = [
  { id: 'add', label: 'Añadir', icon: '➕' },
  { id: 'layers', label: 'Capas', icon: '📚' }
] as const;

watch(activeTab, () => {
  layersSubMode.value = 'layers';
});

const onAddText = (opts: TextNodeOptions) => {
  emit('add-text', opts);
};

const onSelectEmoji = (char: string) => {
  emit('select-emoji', char);
};

const onAddImage = (url: string) => {
  emit('add-image', url);
};

const onSelectLayer = (node: any) => {
  if (studio) studio.selectNode(node);
  emit('select-layer', node);
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
  if (confirm('¿Estás seguro de que deseas vaciar todas las capas del lienzo?')) {
    studio?.change('clearAll');
  }
};

const onSetTransparent = () => {
  studio?.stage.setBgTransparent();
};

const onSetColor = (color: string) => {
  studio?.stage.setBgColor(color);
};

const onSetGradient = (preset: GradientPreset) => {
  studio?.stage.setBgGradient(preset);
};

const onFillPattern = (emojiChar: string) => {
  studio?.layers.fillEmojiPattern(emojiChar);
  studio?.history.saveState();
};

const onClearPattern = () => {
  studio?.layers.clearEmojiPattern();
};
</script>
