<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in select-none"
      @keydown.esc="$emit('close')"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl border border-app-border w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        <!-- Modal Header -->
        <div class="px-5 py-3.5 border-b border-app-border flex items-center justify-between bg-app-header shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-lg leading-none">✂️</span>
            <h3 class="text-sm font-bold text-text-main">
              Recortar {{ type === 'emoji' ? 'Emoji' : 'Imagen' }}
            </h3>
            <span class="text-[11px] px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-semibold font-mono">
              {{ visiblePercent }}% visible
            </span>
          </div>

          <button
            type="button"
            @click="$emit('close')"
            class="w-7 h-7 rounded-xl text-text-subtle hover:text-text-main hover:bg-stone-200/60 flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
            title="Cerrar modal"
          >
            &times;
          </button>
        </div>

        <!-- Interactive Canvas / Crop Area (Auto-fit to content aspect ratio without empty margins) -->
        <div class="flex-1 p-6 flex flex-col items-center justify-center bg-stone-900/95 overflow-hidden relative min-h-[320px]">
          <!-- Canvas Frame Container: Exact aspect ratio of image or trimmed emoji -->
          <div
            ref="containerRef"
            class="relative rounded-2xl bg-grid-pattern bg-white/5 border border-white/15 select-none overflow-hidden touch-none shadow-2xl flex items-center justify-center"
            :style="{
              width: `${containerDimensions.width}px`,
              height: `${containerDimensions.height}px`
            }"
            @pointermove="onPointerMove"
            @pointerup="activeDrag = null"
            @pointercancel="activeDrag = null"
          >
            <!-- Content Target: Rendered with zero letterboxing padding -->
            <img
              v-if="displayImageSrc"
              :src="displayImageSrc"
              @load="onImageLoad"
              alt="Elemento a recortar"
              class="w-full h-full object-fill block pointer-events-none select-none"
              crossorigin="anonymous"
            />

            <!-- Shaded Outside Crop Regions -->
            <div class="absolute inset-x-0 top-0 bg-neutral-950/75 pointer-events-none" :style="{ height: `${crop.top}%` }"></div>
            <div class="absolute inset-x-0 bottom-0 bg-neutral-950/75 pointer-events-none" :style="{ height: `${crop.bottom}%` }"></div>
            <div
              class="absolute inset-y-0 left-0 bg-neutral-950/75 pointer-events-none"
              :style="{ top: `${crop.top}%`, bottom: `${crop.bottom}%`, width: `${crop.left}%` }"
            ></div>
            <div
              class="absolute inset-y-0 right-0 bg-neutral-950/75 pointer-events-none"
              :style="{ top: `${crop.top}%`, bottom: `${crop.bottom}%`, width: `${crop.right}%` }"
            ></div>

            <!-- Active Draggable Crop Box with Rule of Thirds -->
            <div
              class="absolute border-2 border-white shadow-2xl pointer-events-auto"
              :style="{
                top: `${crop.top}%`,
                left: `${crop.left}%`,
                right: `${crop.right}%`,
                bottom: `${crop.bottom}%`
              }"
            >
              <div class="absolute inset-0 pointer-events-none opacity-20 grid grid-cols-3 grid-rows-3">
                <div v-for="i in 9" :key="i" class="border-r border-b border-white"></div>
              </div>

              <!-- Draggable Edge Handles -->
              <div
                v-for="h in EDGE_HANDLES"
                :key="h.id"
                @pointerdown.stop="startDrag(h.id, $event)"
                :class="[h.classes, 'absolute flex items-center justify-center bg-white border border-neutral-700 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform']"
              >
                <div :class="h.barClasses"></div>
              </div>

              <!-- Draggable Corner Handles -->
              <div
                v-for="c in CORNER_HANDLES"
                :key="c.id"
                @pointerdown.stop="startDrag(c.id, $event)"
                :class="[c.classes, 'absolute w-4 h-4 bg-primary-500 border-2 border-white rounded-md shadow-md hover:scale-125 transition-transform']"
              ></div>
            </div>
          </div>

          <p class="text-[11px] text-neutral-400 mt-3 text-center">
            Arrastra los controles blancos o esquinas naranjas para recortar sin márgenes vacíos.
          </p>
        </div>

        <!-- Presets Bar -->
        <div class="px-5 py-3 border-t border-app-border bg-app-header/60 flex items-center justify-between gap-2 shrink-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[10px] font-bold uppercase text-text-muted mr-1 hidden sm:inline">Presets:</span>
            <button
              v-for="p in CROP_PRESETS"
              :key="p.label"
              type="button"
              @click="crop = { ...p.crop }"
              class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-app-border hover:border-primary-400 hover:bg-primary-50 text-text-main transition-colors cursor-pointer shadow-2xs"
            >
              <span>{{ p.icon }}</span>
              <span class="ml-1">{{ p.label }}</span>
            </button>
          </div>

          <button
            type="button"
            @click="crop = { top: 0, right: 0, bottom: 0, left: 0 }"
            class="text-xs font-bold text-primary-600 hover:underline cursor-pointer shrink-0"
            title="Mostrar elemento completo al 100%"
          >
            🔄 Completo
          </button>
        </div>

        <!-- Modal Footer Actions -->
        <div class="px-5 py-3.5 border-t border-app-border flex items-center justify-end gap-2.5 bg-white shrink-0">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 rounded-xl border border-app-border-strong text-text-main text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            @click="commitCrop"
            class="px-5 py-2 rounded-xl bg-primary-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>✂️</span>
            <span>Aplicar Recorte</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { CropInset } from '../../composables/useKonvaCrop';
import {
  fitContainerDimensions,
  updateCropFromPointer,
  getEmojiGlyphMetrics,
  CROP_PRESETS,
  EDGE_HANDLES,
  CORNER_HANDLES,
  type DragId,
  type GlyphPixelBounds
} from '../../composables/useCropInteraction';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    type: 'image' | 'emoji';
    imageSrc?: string;
    emojiChar?: string;
    fontSize?: number;
    initialCrop?: CropInset;
    contentWidth?: number;
    contentHeight?: number;
  }>(),
  {
    isOpen: false,
    type: 'image',
    imageSrc: '',
    emojiChar: '✨',
    fontSize: 110,
    initialCrop: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    contentWidth: 300,
    contentHeight: 300
  }
);

const emit = defineEmits<{
  (e: 'apply', crop: CropInset): void;
  (e: 'close'): void;
}>();

const containerRef = ref<HTMLElement | null>(null);
const crop = ref<CropInset>({ top: 0, right: 0, bottom: 0, left: 0 });
const activeDrag = ref<DragId | null>(null);
const imageNaturalAspect = ref<number | null>(null);
const trimmedEmoji = ref<GlyphPixelBounds | null>(null);

const onImageLoad = (e: Event) => {
  if (props.type === 'image') {
    const img = e.target as HTMLImageElement;
    if (img && img.naturalWidth && img.naturalHeight) {
      imageNaturalAspect.value = img.naturalWidth / img.naturalHeight;
    }
  }
};

const displayImageSrc = computed(() => {
  if (props.type === 'emoji') {
    return trimmedEmoji.value?.url || '';
  }
  return props.imageSrc || '';
});

const aspect = computed(() => {
  if (props.type === 'emoji') {
    return trimmedEmoji.value?.aspect || 1;
  }
  if (imageNaturalAspect.value && !isNaN(imageNaturalAspect.value)) {
    return imageNaturalAspect.value;
  }
  if (props.contentWidth && props.contentHeight) {
    return props.contentWidth / props.contentHeight;
  }
  return 1;
});

const containerDimensions = computed(() => {
  return fitContainerDimensions(aspect.value, 280, 280);
});

watch(
  () => [props.isOpen, props.emojiChar, props.fontSize] as const,
  ([open, char, fs]) => {
    if (open) {
      imageNaturalAspect.value = null;
      crop.value = {
        top: props.initialCrop?.top ?? 0,
        right: props.initialCrop?.right ?? 0,
        bottom: props.initialCrop?.bottom ?? 0,
        left: props.initialCrop?.left ?? 0
      };
      if (props.type === 'emoji') {
        trimmedEmoji.value = getEmojiGlyphMetrics(char || '✨', fs || 110);
      }
    }
  },
  { immediate: true }
);

const visiblePercent = computed(() => {
  const w = Math.max(0, 100 - crop.value.left - crop.value.right);
  const h = Math.max(0, 100 - crop.value.top - crop.value.bottom);
  return Math.round((w * h) / 100);
});

const startDrag = (id: DragId, e: PointerEvent) => {
  activeDrag.value = id;
  (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
};

const onPointerMove = (e: PointerEvent) => {
  if (!activeDrag.value || !containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;
  const pctX = Math.round((Math.max(0, Math.min(rect.width, e.clientX - rect.left)) / rect.width) * 100);
  const pctY = Math.round((Math.max(0, Math.min(rect.height, e.clientY - rect.top)) / rect.height) * 100);
  updateCropFromPointer(activeDrag.value, pctX, pctY, crop.value);
};

const commitCrop = () => {
  emit('apply', { ...crop.value });
  emit('close');
};
</script>
