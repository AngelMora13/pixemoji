<template>
  <div class="space-y-3 p-3 bg-amber-50/70 border border-[#debfa8] rounded-2xl">
    <div class="flex items-center justify-between text-xs">
      <span class="font-bold text-[#523e32] flex items-center gap-1.5">
        <span>🌑</span>
        <span>Dirección & Posición de Sombra (2D)</span>
      </span>
      <button
        type="button"
        @click="resetOffset"
        class="text-[10px] font-bold text-[#d97736] hover:underline cursor-pointer"
        title="Centrar sombra a (0, 0)"
      >
        Centrar (0, 0)
      </button>
    </div>

    <!-- Pad 2D y Sliders en fila -->
    <div class="flex items-center gap-4">
      <!-- 2D Interactive Joystick / Pad -->
      <div class="flex flex-col items-center gap-1 shrink-0">
        <div
          ref="padRef"
          @pointerdown="startDrag"
          class="relative w-24 h-24 rounded-2xl bg-white border-2 border-[#debfa8] shadow-inner cursor-crosshair select-none touch-none overflow-hidden flex items-center justify-center group"
          title="Arrastra el punto para orientar la sombra en cualquier dirección"
        >
          <!-- Eje central X / Y -->
          <div class="absolute inset-x-0 top-1/2 h-[1px] bg-stone-200 pointer-events-none"></div>
          <div class="absolute inset-y-0 left-1/2 w-[1px] bg-stone-200 pointer-events-none"></div>

          <!-- Círculos concéntricos guía -->
          <div class="absolute w-12 h-12 rounded-full border border-dashed border-stone-200 pointer-events-none"></div>

          <!-- Bola interactiva -->
          <div
            class="absolute w-5 h-5 rounded-full bg-gradient-to-tr from-[#d97736] to-amber-400 border-2 border-white shadow-md transition-transform pointer-events-none"
            :style="{
              transform: `translate(${ballX}px, ${ballY}px)`
            }"
          ></div>
        </div>

        <span class="text-[10px] font-mono text-[#735a4d]">
          X: <strong class="text-[#d97736]">{{ Math.round(offsetX) }}</strong> · Y: <strong class="text-[#d97736]">{{ Math.round(offsetY) }}</strong>
        </span>
      </div>

      <!-- Controles de Blur y Color -->
      <div class="flex-1 space-y-2 text-xs">
        <!-- Difuminado (Blur) -->
        <div>
          <div class="flex justify-between items-center text-[10px] font-bold uppercase text-[#523e32] mb-0.5">
            <span>Difuminado (Blur)</span>
            <span class="text-[#d97736] font-mono">{{ blur }}px</span>
          </div>
          <input
            :value="blur"
            @input="onBlurInput"
            type="range"
            min="0"
            max="40"
            class="w-full accent-[#d97736] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
          />
        </div>

        <!-- Color & Opacidad de sombra -->
        <div>
          <div class="flex justify-between items-center text-[10px] font-bold uppercase text-[#523e32] mb-1">
            <span>Color & Opacidad</span>
            <span class="text-[#d97736] font-mono">{{ Math.round(opacity * 100) }}%</span>
          </div>
          <div class="flex items-center gap-2">
            <input
              :value="hexColor"
              @input="onColorInput"
              type="color"
              class="w-7 h-7 p-0 rounded-md border border-[#debfa8] cursor-pointer bg-white shrink-0"
            />
            <input
              :value="opacity"
              @input="onOpacityInput"
              type="range"
              min="0"
              max="1"
              step="0.05"
              class="w-full accent-[#d97736] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
              title="Opacidad de la sombra"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    offsetX?: number;
    offsetY?: number;
    blur?: number;
    color?: string;
    opacity?: number;
    maxOffset?: number;
  }>(),
  {
    offsetX: 0,
    offsetY: 4,
    blur: 10,
    color: '#000000',
    opacity: 0.6,
    maxOffset: 25
  }
);

const emit = defineEmits<{
  (e: 'update', opts: { offsetX: number; offsetY: number; blur: number; color: string; opacity: number }): void;
}>();

const padRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);

const localOffsetX = ref(props.offsetX ?? 0);
const localOffsetY = ref(props.offsetY ?? 0);

watch(
  () => [props.offsetX, props.offsetY],
  ([newX, newY]) => {
    if (!isDragging.value) {
      localOffsetX.value = Number(newX) || 0;
      localOffsetY.value = Number(newY) || 0;
    }
  },
  { immediate: true }
);

const hexColor = computed(() => {
  if (!props.color) return '#000000';
  const c = props.color.trim();
  if (c.startsWith('#')) {
    if (c.length === 4) {
      return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`;
    }
    return c.slice(0, 7);
  }
  const match = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (match) {
    const r = Math.min(255, Math.max(0, Number(match[1]))).toString(16).padStart(2, '0');
    const g = Math.min(255, Math.max(0, Number(match[2]))).toString(16).padStart(2, '0');
    const b = Math.min(255, Math.max(0, Number(match[3]))).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
  return '#000000';
});

// Usable radius inside 96px container
const PAD_RADIUS = 36;

const ballX = computed(() => {
  const ratio = (localOffsetX.value || 0) / props.maxOffset;
  return Math.max(-PAD_RADIUS, Math.min(PAD_RADIUS, ratio * PAD_RADIUS));
});

const ballY = computed(() => {
  const ratio = (localOffsetY.value || 0) / props.maxOffset;
  return Math.max(-PAD_RADIUS, Math.min(PAD_RADIUS, ratio * PAD_RADIUS));
});

const handlePadPointer = (e: PointerEvent) => {
  if (!padRef.value) return;
  const rect = padRef.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const dx = e.clientX - centerX;
  const dy = e.clientY - centerY;

  const clampedX = Math.max(-PAD_RADIUS, Math.min(PAD_RADIUS, dx));
  const clampedY = Math.max(-PAD_RADIUS, Math.min(PAD_RADIUS, dy));

  const newOffsetX = Math.round((clampedX / PAD_RADIUS) * props.maxOffset);
  const newOffsetY = Math.round((clampedY / PAD_RADIUS) * props.maxOffset);

  localOffsetX.value = newOffsetX;
  localOffsetY.value = newOffsetY;

  emit('update', {
    offsetX: newOffsetX,
    offsetY: newOffsetY,
    blur: props.blur,
    color: props.color || '#000000',
    opacity: props.opacity
  });
};

const startDrag = (e: PointerEvent) => {
  isDragging.value = true;
  handlePadPointer(e);

  const onPointerMove = (ev: PointerEvent) => {
    if (!isDragging.value) return;
    handlePadPointer(ev);
  };

  const onPointerUp = () => {
    isDragging.value = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
};

const resetOffset = () => {
  localOffsetX.value = 0;
  localOffsetY.value = 0;
  emit('update', {
    offsetX: 0,
    offsetY: 0,
    blur: props.blur,
    color: props.color || '#000000',
    opacity: props.opacity
  });
};

const onBlurInput = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value);
  emit('update', {
    offsetX: localOffsetX.value,
    offsetY: localOffsetY.value,
    blur: val,
    color: props.color || '#000000',
    opacity: props.opacity
  });
};

const onColorInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  emit('update', {
    offsetX: localOffsetX.value,
    offsetY: localOffsetY.value,
    blur: props.blur,
    color: val,
    opacity: props.opacity
  });
};

const onOpacityInput = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value);
  emit('update', {
    offsetX: localOffsetX.value,
    offsetY: localOffsetY.value,
    blur: props.blur,
    color: props.color || '#000000',
    opacity: val
  });
};
</script>
