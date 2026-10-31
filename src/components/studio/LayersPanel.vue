<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between mb-1">
      <span class="text-xs font-bold uppercase tracking-wider text-text-main flex items-center gap-1.5">
        <span>📚 Capas ({{ layers.length }})</span>
      </span>
      <button
        v-if="layers.length > 0"
        type="button"
        @click="$emit('clearAll')"
        class="text-[10px] text-red-600 hover:underline font-semibold cursor-pointer"
      >
        Vaciar lienzo
      </button>
    </div>
    <p class="text-[11px] text-text-subtle mb-2 flex items-center justify-between">
      <span>Arrastra <strong class="text-primary-600">⋮⋮</strong> para reordenar (arriba = al frente):</span>
    </p>

    <!-- Lista de Capas con Drag & Drop táctil y desktop -->
    <div class="space-y-1.5 max-h-72 overflow-y-auto pr-1">
      <div
        v-for="(layer, index) in layers"
        :key="layer.id"
        :data-layer-index="index"
        draggable="true"
        @dragstart="onDragStart(index, $event)"
        @dragover="onDragOver(index, $event)"
        @dragleave="onDragLeave(index)"
        @drop="onDrop(index, $event)"
        @dragend="onDragEnd"
        @click="$emit('select', layer.raw)"
        :class="[
          'p-2 rounded-xl border flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing transition-all text-xs select-none',
          selectedNode === layer.raw
            ? 'bg-primary-100 border-primary-500 shadow-xs font-bold ring-1 ring-primary-500/30'
            : layer.isLocked
              ? 'bg-stone-50/90 border-stone-200 opacity-80'
              : 'bg-white border-app-border hover:bg-primary-50/60',
          dropTargetIndex === index && draggedIndex !== index
            ? 'ring-2 ring-primary-500 bg-primary-100/90 border-primary-500 scale-[1.02]'
            : '',
          draggedIndex === index ? 'opacity-40 border-dashed border-primary-500' : ''
        ]"
      >
        <!-- Grip handle & Info de la capa -->
        <div class="flex items-center gap-2 min-w-0">
          <span
            @touchstart="onTouchStart(index, $event)"
            @touchmove="onTouchMove($event)"
            @touchend="onTouchEnd"
            @touchcancel="onTouchEnd"
            class="text-text-subtle hover:text-primary-600 cursor-grab active:cursor-grabbing text-sm font-mono select-none px-1.5 py-1 -my-1 touch-none"
            title="Arrastra para reordenar esta capa"
          >
            ⋮⋮
          </span>

          <span class="text-sm shrink-0">{{ layer.icon }}</span>

          <span class="truncate text-[11px] text-text-main">
            {{ layer.label }}
          </span>

          <span
            v-if="layer.isLocked"
            class="text-[9px] px-1 py-0.2 rounded bg-primary-200 text-primary-900 font-bold shrink-0"
          >
            Fijada
          </span>
        </div>

        <!-- Acciones rápidas por capa -->
        <div class="flex items-center gap-1 shrink-0">
          <!-- Bloquear / Desbloquear -->
          <button
            type="button"
            @click.stop="$emit('toggleLock', layer.raw)"
            class="w-6 h-6 rounded flex items-center justify-center text-[11px] hover:bg-primary-200 cursor-pointer"
            :title="layer.isLocked ? 'Desbloquear capa' : 'Bloquear capa'"
          >
            {{ layer.isLocked ? '🔒' : '🔓' }}
          </button>

          <!-- Duplicar -->
          <button
            type="button"
            @click.stop="$emit('duplicate', layer.raw)"
            class="w-6 h-6 rounded flex items-center justify-center text-[11px] hover:bg-primary-200 cursor-pointer"
            title="Duplicar capa"
          >
            📋
          </button>

          <!-- Subir / Bajar nivel botones accesibles -->
          <button
            type="button"
            @click.stop="$emit('moveUp', layer.raw)"
            :disabled="index === 0"
            class="w-5 h-5 rounded flex items-center justify-center text-[9px] bg-stone-100 hover:bg-primary-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
            title="Subir al frente"
          >
            ▲
          </button>
          <button
            type="button"
            @click.stop="$emit('moveDown', layer.raw)"
            :disabled="index === layers.length - 1"
            class="w-5 h-5 rounded flex items-center justify-center text-[9px] bg-stone-100 hover:bg-primary-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
            title="Bajar al fondo"
          >
            ▼
          </button>

          <!-- Eliminar -->
          <button
            type="button"
            @click.stop="$emit('remove', layer.raw)"
            class="w-6 h-6 rounded flex items-center justify-center text-xs text-red-600 hover:bg-red-100 cursor-pointer ml-0.5"
            title="Eliminar capa"
          >
            ✕
          </button>
        </div>
      </div>

      <div v-if="layers.length === 0" class="text-center py-6 text-xs text-text-subtle bg-white/50 rounded-xl border border-dashed border-app-border">
        No hay elementos en el lienzo todavía. Añade un emoji, texto o imagen para comenzar.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { LayerItem } from '../../composables/useKonvaLayers';

const props = defineProps<{
  layers: LayerItem[];
  selectedNode: any;
}>();

const emit = defineEmits<{
  (e: 'select', node: any): void;
  (e: 'toggleLock', node: any): void;
  (e: 'duplicate', node: any): void;
  (e: 'moveUp', node: any): void;
  (e: 'moveDown', node: any): void;
  (e: 'reorder', payload: { fromIndex: number; toIndex: number }): void;
  (e: 'remove', node: any): void;
  (e: 'clearAll'): void;
}>();

const draggedIndex = ref<number | null>(null);
const dropTargetIndex = ref<number | null>(null);

// ==========================================
// DESKTOP HTML5 DRAG & DROP
// ==========================================
const onDragStart = (index: number, e: DragEvent) => {
  draggedIndex.value = index;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }
};

const onDragOver = (index: number, e: DragEvent) => {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }
  dropTargetIndex.value = index;
};

const onDragLeave = (index: number) => {
  if (dropTargetIndex.value === index) {
    dropTargetIndex.value = null;
  }
};

const onDrop = (index: number, e: DragEvent) => {
  e.preventDefault();
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    emit('reorder', { fromIndex: draggedIndex.value, toIndex: index });
  }
  draggedIndex.value = null;
  dropTargetIndex.value = null;
};

const onDragEnd = () => {
  draggedIndex.value = null;
  dropTargetIndex.value = null;
};

// ==========================================
// MOBILE TOUCH DRAG & DROP
// ==========================================
const onTouchStart = (index: number, e: TouchEvent) => {
  draggedIndex.value = index;
  dropTargetIndex.value = index;
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(20); } catch {}
  }
};

const onTouchMove = (e: TouchEvent) => {
  if (draggedIndex.value === null) return;
  const touch = e.touches[0];
  if (!touch) return;

  const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
  if (!targetEl) return;

  const layerItemEl = targetEl.closest('[data-layer-index]');
  if (layerItemEl) {
    const targetIdx = parseInt(layerItemEl.getAttribute('data-layer-index') || '-1', 10);
    if (targetIdx >= 0 && targetIdx < props.layers.length) {
      if (dropTargetIndex.value !== targetIdx) {
        dropTargetIndex.value = targetIdx;
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate(10); } catch {}
        }
      }
    }
  }
};

const onTouchEnd = () => {
  if (draggedIndex.value !== null && dropTargetIndex.value !== null && draggedIndex.value !== dropTargetIndex.value) {
    emit('reorder', { fromIndex: draggedIndex.value, toIndex: dropTargetIndex.value });
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(30); } catch {}
    }
  }
  draggedIndex.value = null;
  dropTargetIndex.value = null;
};
</script>
