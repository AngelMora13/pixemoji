<template>
  <div
    class="lg:hidden fixed inset-0 z-40 flex flex-col justify-end"
    :class="[
      isOpen && (isExpanded || !persistent)
        ? 'pointer-events-auto'
        : 'pointer-events-none'
    ]"
    data-purpose="bottom-sheet-modal"
  >
    <!-- Backdrop con transición suave de opacidad -->
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ease-out"
      :class="[
        isOpen && (isExpanded || (!persistent && isOpen))
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      ]"
      @click="handleBackdropClick"
    ></div>

    <!-- Contenedor Bottom Sheet con animación suave por Transform (hardware-accelerated) -->
    <div
      class="relative w-full max-h-[85dvh] bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex flex-col z-10 overflow-hidden border border-b-0 border-app-border isolate transition-transform duration-300 ease-out pointer-events-auto pb-[env(safe-area-inset-bottom,0px)]"
      :style="sheetTransformStyle"
    >
      <!-- Cabecera / Handle Bar unificada (sin fondos que sobresalgan de los bordes redondeados) -->
      <div
        class="bg-white border-b border-app-border shrink-0 select-none flex flex-col cursor-pointer"
        @click="toggleExpand"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <!-- Tirador táctil (drag handle) -->
        <div class="w-full pt-2 pb-1 flex justify-center touch-none">
          <div class="w-10 h-1.5 rounded-full bg-stone-300"></div>
        </div>

        <!-- Barra de título y acciones -->
        <div class="px-4 pb-2.5 pt-0.5 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <span v-if="icon" class="text-base select-none shrink-0">{{ icon }}</span>
            <span class="text-sm font-extrabold text-text-main truncate">{{ title }}</span>
          </div>

          <!-- Acciones de cabecera con slots y fallback por defecto -->
          <div class="flex items-center gap-2 shrink-0" @click.stop>
            <slot name="header-extra" :is-expanded="isExpanded" />

            <slot
              name="header-actions"
              :is-expanded="isExpanded"
              :toggle="toggleExpand"
              :collapse="collapse"
              :expand="expand"
            >
              <!-- Botón Subir/Bajar por defecto si es persistent -->
              <button
                v-if="persistent"
                type="button"
                @click="toggleExpand"
                class="px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                :class="[
                  isExpanded
                    ? 'bg-stone-100 hover:bg-stone-200 text-text-muted hover:text-text-main'
                    : 'bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200'
                ]"
              >
                <span>{{ isExpanded ? '▼ Bajar' : '▲ Opciones' }}</span>
              </button>

              <!-- Botón Cerrar (✕) por defecto si es modal estándar -->
              <button
                v-else
                type="button"
                @click="$emit('close')"
                class="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-xs font-bold text-text-muted hover:text-text-main cursor-pointer transition-colors"
                title="Cerrar ventana"
              >
                ✕
              </button>
            </slot>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="overflow-y-auto max-h-[calc(85dvh-58px-env(safe-area-inset-bottom,0px))] p-4 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] overscroll-contain">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    isExpanded?: boolean;
    persistent?: boolean;
    title?: string;
    icon?: string;
    peekHeight?: number;
  }>(),
  {
    isOpen: false,
    isExpanded: false,
    persistent: false,
    title: '',
    icon: '',
    peekHeight: 58
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:isExpanded', val: boolean): void;
}>();

const toggleExpand = () => {
  if (!props.persistent) return;
  emit('update:isExpanded', !props.isExpanded);
};

const collapse = () => {
  if (!props.persistent) {
    emit('close');
    return;
  }
  emit('update:isExpanded', false);
};

const expand = () => {
  emit('update:isExpanded', true);
};

const handleBackdropClick = () => {
  if (props.persistent) {
    collapse();
  } else {
    emit('close');
  }
};

const sheetTransformStyle = computed(() => {
  // If not open (e.g. canvas < 40% or modal closed): completely hidden offscreen
  if (!props.isOpen) {
    return { transform: 'translateY(100%)' };
  }
  // If persistent and collapsed: dock at bottom leaving only peekHeight visible above safe area
  if (props.persistent && !props.isExpanded) {
    return { transform: `translateY(calc(100% - ${props.peekHeight}px - env(safe-area-inset-bottom, 0px)))` };
  }
  // Expanded or normal open modal: full view
  return { transform: 'translateY(0%)' };
});

// Touch gesture handling for smooth swipe
let touchStartY = 0;
let touchStartX = 0;

const onTouchStart = (e: TouchEvent) => {
  if (e.touches.length > 0) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
  }
};

const onTouchEnd = (e: TouchEvent) => {
  if (e.changedTouches.length > 0) {
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX);
    if (Math.abs(deltaY) > deltaX && Math.abs(deltaY) > 30) {
      if (props.persistent) {
        if (!props.isExpanded && deltaY < 0) {
          expand();
        } else if (props.isExpanded && deltaY > 0) {
          collapse();
        }
      }
    }
  }
};
</script>
