<template>
  <div ref="triggerRef" class="relative inline-block" :class="compact ? 'shrink-0' : 'w-full'" data-purpose="color-palette-picker">
    <!-- Botón compacto para filas / inline -->
    <button
      v-if="compact"
      type="button"
      @click="toggleOpen"
      class="w-7 h-7 rounded-lg border border-app-border-strong cursor-pointer bg-white shrink-0 p-0.5 flex items-center justify-center hover:scale-105 transition-transform shadow-2xs"
      :title="title || 'Seleccionar color'"
    >
      <span
        class="w-full h-full rounded-md border border-stone-200"
        :style="{ backgroundColor: currentColor }"
      ></span>
    </button>

    <!-- Botón estándar para barras de herramientas -->
    <button
      v-else
      type="button"
      @click="toggleOpen"
      class="w-full h-8.5 px-2.5 bg-white border border-app-border-strong rounded-xl text-xs font-bold text-text-main flex items-center justify-between shadow-2xs hover:bg-stone-50 cursor-pointer transition-colors"
      :title="title || 'Seleccionar color'"
    >
      <div class="flex items-center gap-1.5 min-w-0">
        <span
          class="w-4 h-4 rounded-full border border-stone-300 shadow-2xs shrink-0"
          :style="{ backgroundColor: currentColor }"
        ></span>
        <span class="font-mono text-xs truncate">{{ currentColor }}</span>
      </div>
      <span class="text-[10px] text-text-subtle ml-1">▾</span>
    </button>

    <!-- Teleport al body para evitar recortes por overflow en contenedores scrollables -->
    <Teleport to="body" v-if="isMounted && isOpen">
      <!-- Backdrop transparente para cerrar al hacer clic fuera -->
      <div class="fixed inset-0 z-[9998]" @click="closePopover"></div>

      <!-- Popover de Colores con Posicionamiento Dinámico Inteligente (arriba/abajo/lados) -->
      <div
        ref="popoverEl"
        class="fixed z-[9999] w-64 bg-white border border-app-border rounded-2xl shadow-2xl p-3 space-y-2.5 animate-fade-in"
        :style="popoverStyle"
      >
        <div class="flex items-center justify-between text-xs">
          <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">
            Paleta y Guardados (Max 10)
          </span>
          <span class="font-mono font-bold text-primary-600 text-[11px]">{{ currentColor }}</span>
        </div>

        <!-- Cuadrícula con '+' de primero, luego guardados, luego base -->
        <div class="flex items-center gap-1.5 flex-wrap max-h-44 overflow-y-auto p-1">
          <!-- 1. Botón '+' nativo de primero -->
          <label
            class="w-7 h-7 rounded-xl bg-primary-gradient border border-primary-400 flex items-center justify-center text-xs text-white font-black cursor-pointer shadow-2xs hover:scale-110 transition-transform relative shrink-0"
            title="Selector personalizado (se guarda en tu lista al confirmar)"
          >
            <span>+</span>
            <input
              type="color"
              :value="currentColor"
              @click="startPickerSession"
              @input="handleLiveInput"
              @change="handleCommitChange"
              class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>

          <!-- 2. Colores Guardados en localStorage -->
          <button
            v-for="color in savedColors"
            :key="'saved-' + color"
            type="button"
            @click="selectSwatch(color)"
            :class="[
              'w-7 h-7 rounded-xl border shadow-2xs hover:scale-110 transition-transform cursor-pointer relative shrink-0',
              currentColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-primary-500 scale-105 border-primary-500' : 'border-stone-300'
            ]"
            :style="{ backgroundColor: color }"
            :title="'Guardado: ' + color"
          ></button>

          <!-- 3. Colores Base Predeterminados -->
          <button
            v-for="color in DEFAULT_BASE_PALETTE"
            :key="'base-' + color"
            type="button"
            @click="selectSwatch(color)"
            :class="[
              'w-7 h-7 rounded-xl border shadow-2xs hover:scale-110 transition-transform cursor-pointer shrink-0',
              currentColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-primary-500 scale-105 border-primary-500' : 'border-stone-300'
            ]"
            :style="{ backgroundColor: color }"
            :title="color"
          ></button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import {
  useCustomFontsAndColors,
  DEFAULT_BASE_PALETTE
} from '../../composables/useCustomFontsAndColors';

const props = withDefaults(
  defineProps<{
    currentColor: string;
    compact?: boolean;
    title?: string;
    popoverAlign?: 'left' | 'right';
  }>(),
  {
    compact: false,
    title: 'Seleccionar color',
    popoverAlign: 'right'
  }
);

const emit = defineEmits<{
  (e: 'liveChange', color: string): void;
  (e: 'commitChange', color: string): void;
}>();

const { savedColors, addCustomColor, replaceCustomColor } = useCustomFontsAndColors();

const isOpen = ref(false);
const isMounted = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const popoverEl = ref<HTMLElement | null>(null);
const popoverStyle = ref<Record<string, string>>({});

const sessionSavedColor = ref<string | null>(null);
const latestColor = ref<string | null>(null);

const updatePosition = () => {
  if (!triggerRef.value || typeof window === 'undefined') return;
  const rect = triggerRef.value.getBoundingClientRect();
  const popoverWidth = 264;
  const popoverHeight = popoverEl.value?.offsetHeight || 220;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const gap = 8;
  const margin = 10;

  // Posicionamiento Vertical: verificar si cabe abajo o arriba
  const spaceBelow = viewportHeight - rect.bottom - margin;
  const spaceAbove = rect.top - margin;

  let top = 0;
  if (spaceBelow >= popoverHeight) {
    top = rect.bottom + gap;
  } else if (spaceAbove >= popoverHeight) {
    top = rect.top - popoverHeight - gap;
  } else {
    top = spaceBelow >= spaceAbove ? rect.bottom + gap : rect.top - popoverHeight - gap;
    top = Math.max(margin, Math.min(top, viewportHeight - popoverHeight - margin));
  }

  // Posicionamiento Horizontal: alinear con trigger o desplazar dentro del viewport
  let left = 0;
  if (props.popoverAlign === 'left') {
    left = rect.left;
    if (left + popoverWidth > viewportWidth - margin) {
      left = rect.right - popoverWidth;
    }
  } else {
    left = rect.right - popoverWidth;
    if (left < margin) {
      left = rect.left;
    }
  }
  left = Math.max(margin, Math.min(left, viewportWidth - popoverWidth - margin));

  popoverStyle.value = {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`
  };
};

const toggleOpen = () => {
  if (isOpen.value) {
    closePopover();
  } else {
    isOpen.value = true;
    startPickerSession();
    nextTick(() => {
      updatePosition();
    });
  }
};

const startPickerSession = () => {
  sessionSavedColor.value = null;
  latestColor.value = null;
};

const commitColorToStorage = (color: string) => {
  if (!color) return;
  if (sessionSavedColor.value && sessionSavedColor.value.toLowerCase() !== color.toLowerCase()) {
    replaceCustomColor(sessionSavedColor.value, color);
  } else if (!sessionSavedColor.value) {
    addCustomColor(color);
  }
  sessionSavedColor.value = color;
};

const closePopover = () => {
  if (latestColor.value && latestColor.value !== sessionSavedColor.value) {
    commitColorToStorage(latestColor.value);
  }
  sessionSavedColor.value = null;
  latestColor.value = null;
  isOpen.value = false;
};

const handleLiveInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  latestColor.value = val;
  emit('liveChange', val);
};

const handleCommitChange = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  latestColor.value = val;
  emit('commitChange', val);
  commitColorToStorage(val);
};

const selectSwatch = (color: string) => {
  sessionSavedColor.value = null;
  latestColor.value = null;
  emit('liveChange', color);
  emit('commitChange', color);
};

watch(isOpen, (open) => {
  if (open) {
    nextTick(() => {
      updatePosition();
    });
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
  } else {
    window.removeEventListener('resize', updatePosition);
    window.removeEventListener('scroll', updatePosition, true);
  }
});

onMounted(() => {
  isMounted.value = true;
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updatePosition);
    window.removeEventListener('scroll', updatePosition, true);
  }
});
</script>
