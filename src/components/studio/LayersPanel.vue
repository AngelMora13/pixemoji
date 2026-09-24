<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between mb-1">
      <span class="text-xs font-bold uppercase tracking-wider text-[#523e32] flex items-center gap-1.5">
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
    <p class="text-[11px] text-[#8a6e60] mb-2 flex items-center justify-between">
      <span>Arrastra <strong class="text-[#d97736]">⋮⋮</strong> para reordenar (arriba = al frente):</span>
    </p>

    <!-- Lista de Capas con Drag & Drop -->
    <div class="space-y-1.5 max-h-72 overflow-y-auto pr-1">
      <div
        v-for="(layer, index) in layers"
        :key="layer.id"
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
            ? 'bg-amber-100 border-[#d97736] shadow-xs font-bold ring-1 ring-[#d97736]/30'
            : layer.isLocked
              ? 'bg-stone-50/90 border-stone-200 opacity-80'
              : 'bg-white/80 border-[#ebd8ca] hover:bg-amber-50/60',
          dropTargetIndex === index && draggedIndex !== index
            ? 'ring-2 ring-[#d97736] bg-amber-100/90 border-[#d97736] scale-[1.02]'
            : '',
          draggedIndex === index ? 'opacity-40 border-dashed border-[#d97736]' : ''
        ]"
      >
        <!-- Grip handle & Info de la capa -->
        <div class="flex items-center gap-2 min-w-0">
          <span
            class="text-[#debfa8] hover:text-[#d97736] cursor-grab active:cursor-grabbing text-sm font-mono select-none px-0.5"
            title="Arrastra para reordenar esta capa"
          >
            ⋮⋮
          </span>

          <span class="text-sm shrink-0">{{ layer.icon }}</span>

          <span class="truncate text-[11px] text-[#2b1e1a]">
            {{ layer.label }}
          </span>

          <span
            v-if="layer.isLocked"
            class="text-[9px] px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-bold shrink-0"
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
            class="w-6 h-6 rounded flex items-center justify-center text-[11px] hover:bg-amber-200 cursor-pointer"
            :title="layer.isLocked ? 'Desbloquear capa' : 'Bloquear capa'"
          >
            {{ layer.isLocked ? '🔒' : '🔓' }}
          </button>

          <!-- Duplicar -->
          <button
            type="button"
            @click.stop="$emit('duplicate', layer.raw)"
            class="w-6 h-6 rounded flex items-center justify-center text-[11px] hover:bg-amber-200 cursor-pointer"
            title="Duplicar capa"
          >
            📋
          </button>

          <!-- Subir / Bajar nivel botones accesibles -->
          <button
            type="button"
            @click.stop="$emit('moveUp', layer.raw)"
            :disabled="index === 0"
            class="w-5 h-5 rounded flex items-center justify-center text-[9px] bg-stone-100 hover:bg-amber-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
            title="Subir al frente"
          >
            ▲
          </button>
          <button
            type="button"
            @click.stop="$emit('moveDown', layer.raw)"
            :disabled="index === layers.length - 1"
            class="w-5 h-5 rounded flex items-center justify-center text-[9px] bg-stone-100 hover:bg-amber-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
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

      <div v-if="layers.length === 0" class="text-center py-6 text-xs text-[#8a6e60] bg-white/50 rounded-xl border border-dashed border-[#ebd8ca]">
        No hay elementos en el lienzo todavía. Añade un emoji, texto o imagen para comenzar.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { LayerItem } from '../../composables/useKonvaLayers';

defineProps<{
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
</script>
