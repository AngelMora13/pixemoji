<template>
  <div class="w-full max-w-5xl mx-auto space-y-8">
    <!-- Header -->
    <div class="text-center space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-1">
        <span class="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        Lienzo Interactivo con Konva.js & Emojis Unicode
      </div>
      <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-[#2b1e1a]">
        Exportador de Emojis a PNG Transparente
      </h2>
      <p class="text-sm md:text-base text-[#735a4d] max-w-2xl mx-auto">
        Posiciona, escala o rota tu emoji libremente en el lienzo interactivo de 250x250 px. Usa el selector completo con miles de emojis o elige uno de la galería rápida.
      </p>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Controls: Emoji Selector & Alignment -->
      <div class="lg:col-span-7 glass-card rounded-3xl p-6 md:p-7 border border-[#e8d2c0] shadow-xl shadow-[#523e32]/5 space-y-6">
        <!-- Emoji Selection Modes -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="text-xs font-bold uppercase tracking-wider text-[#523e32]">
              1. Selecciona tu Emoji
            </label>
            <button
              type="button"
              @click="showPicker = !showPicker"
              :class="[
                'text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer',
                showPicker
                  ? 'bg-[#d97736] text-white border-[#d97736] shadow-xs'
                  : 'bg-white text-[#d97736] border-[#debfa8] hover:bg-amber-50'
              ]"
            >
              <span>🔍</span>
              <span>{{ showPicker ? 'Cerrar Buscador' : 'Abrir Emoji Picker Completo' }}</span>
            </button>
          </div>

          <!-- Emoji Picker Modal Component -->
          <EmojiPickerModal
            :is-open="showPicker"
            @select="applyFromPicker"
            @close="showPicker = false"
          />

          <!-- Quick Presets Grid -->
          <div class="grid grid-cols-5 gap-2.5 mt-3">
            <button
              v-for="item in emojiList"
              :key="item.name"
              type="button"
              @click="selectPreset(item)"
              :class="[
                'p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-150 cursor-pointer border select-none',
                selected.char === item.char && !isCustom
                  ? 'bg-amber-100/90 border-[#d97736] shadow-sm scale-105 ring-2 ring-[#d97736]/30'
                  : 'bg-white/80 border-[#ebd8ca] hover:bg-amber-50/70 hover:border-amber-300'
              ]"
            >
              <span class="text-3xl p-1 inline-flex items-center justify-center leading-none select-none">
                {{ item.char }}
              </span>
              <span class="text-[10px] font-semibold text-[#735a4d] truncate max-w-full capitalize">
                {{ item.name }}
              </span>
            </button>
          </div>
        </div>

        <!-- Custom Emoji Direct Input -->
        <div class="pt-2 border-t border-[#ebd8ca]/80">
          <label class="block text-xs font-bold uppercase tracking-wider text-[#523e32] mb-2">
            O escribe directamente cualquier emoji:
          </label>
          <div class="flex gap-2.5">
            <input
              v-model="customInput"
              @input="onCustomInputChange"
              type="text"
              maxlength="4"
              placeholder="🍕"
              class="w-20 h-11 px-3 bg-white/90 border border-[#debfa8] rounded-xl text-center text-xl focus:outline-none focus:ring-2 focus:ring-[#d97736] shadow-xs"
            />
            <input
              v-model="customName"
              type="text"
              placeholder="Nombre del archivo (ej: pizza)"
              class="flex-1 h-11 px-4 bg-white/90 border border-[#debfa8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97736] shadow-xs placeholder-[#aa9384]"
            />
          </div>
        </div>

        <!-- Resolution & Alignment -->
        <div class="pt-2 border-t border-[#ebd8ca]/80 space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-bold uppercase tracking-wider text-[#523e32]">
                2. Resolución de Descarga PNG
              </label>
              <span class="text-[11px] text-[#8a6e60] font-mono font-semibold">
                {{ targetResolution }} &times; {{ targetResolution }} px
              </span>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="item in resolutionOptions"
                :key="item.val"
                type="button"
                @click="targetResolution = item.val"
                :class="[
                  'py-2 px-1.5 rounded-xl border transition-all cursor-pointer text-center select-none flex flex-col items-center justify-center gap-0.5',
                  targetResolution === item.val
                    ? 'bg-[#d97736] text-white border-[#d97736] shadow-md shadow-[#d97736]/20'
                    : 'bg-white/80 text-[#523e32] border-[#debfa8] hover:bg-amber-50/70'
                ]"
              >
                <span class="text-xs font-bold font-mono">{{ item.label }}</span>
                <span :class="['text-[9px] font-semibold', targetResolution === item.val ? 'text-amber-100' : 'text-[#8a6e60]']">
                  {{ item.tag }}
                </span>
              </button>
            </div>
          </div>

          <!-- Alignment Tools -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#523e32] mb-2">
              Herramientas de Posicionamiento
            </label>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                @click="centerEmoji"
                class="px-3 py-2 rounded-xl bg-white border border-[#debfa8] text-[#523e32] hover:bg-amber-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4 text-[#d97736]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Centrar Emoji</span>
              </button>

              <button
                type="button"
                @click="fitEmoji"
                class="px-3 py-2 rounded-xl bg-white border border-[#debfa8] text-[#523e32] hover:bg-amber-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4 text-[#d97736]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>Ajustar al Lienzo</span>
              </button>

              <button
                type="button"
                @click="resetTransform"
                class="px-3 py-2 rounded-xl bg-white border border-[#debfa8] text-[#523e32] hover:bg-amber-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <svg class="w-4 h-4 text-[#d97736]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Resetear Rotación</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Interactive Canvas & Export Actions -->
      <div class="lg:col-span-5 glass-card rounded-3xl p-6 md:p-7 border border-[#e8d2c0] shadow-xl shadow-[#523e32]/5 space-y-6 flex flex-col items-center text-center">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-[#523e32]">
            Lienzo Konva (250 &times; 250 px)
          </span>
          <p class="text-[11px] text-[#8a6e60] mt-0.5">
            ¡Usa los controles para arrastrar, rotar y escalar libremente!
          </p>
        </div>

        <!-- Konva Stage Container Component -->
        <KonvaStage
          container-id="konva-home-stage"
          :width="250"
          :height="250"
          :is-transparent="true"
          bg-color="#ffffff"
        />

        <!-- Live Status Pill -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-[#735a4d]">
          <span class="font-mono font-bold text-base leading-none text-[#d97736]">{{ selected.char }}</span>
          <span>&bull;</span>
          <span class="font-semibold">{{ fileName }}.png</span>
          <span>&bull;</span>
          <span class="font-mono">{{ targetResolution }}&times;{{ targetResolution }}px</span>
        </div>

        <!-- Action Buttons -->
        <div class="w-full space-y-3">
          <button
            type="button"
            @click="handleDownload"
            class="w-full py-3.5 px-4 rounded-2xl bg-[#d97736] hover:bg-[#c46527] text-white font-bold text-sm shadow-md shadow-[#d97736]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Descargar {{ fileName }}.png</span>
          </button>

          <button
            type="button"
            @click="handleCopy"
            :class="[
              'w-full py-3 px-4 rounded-2xl border font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer',
              copied
                ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                : 'bg-white/90 border-[#debfa8] text-[#523e32] hover:bg-amber-50/80'
            ]"
          >
            <svg v-if="copied" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-4 h-4 text-[#735a4d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            <span>{{ copied ? '¡Copiado al portapapeles con éxito!' : 'Copiar imagen al portapapeles' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { emojiFallback } from './icons';
import { useKonvaStage } from '../composables/useKonvaStage';

// Subcomponents
import KonvaStage from './canvas/KonvaStage.vue';
import EmojiPickerModal from './common/EmojiPickerModal.vue';

interface EmojiItem {
  name: string;
  char: string;
}

const emojiList: EmojiItem[] = Object.entries(emojiFallback).map(([name, char]) => ({
  name,
  char
}));

const resolutionOptions = [
  { val: 256, label: '256px', tag: 'Sticker' },
  { val: 512, label: '512px', tag: 'HD Slack' },
  { val: 1024, label: '1024px', tag: 'Feed/Avatar' },
  { val: 2048, label: '2048px', tag: 'Ultra HD' }
];

const selected = ref<EmojiItem>(emojiList[0]);
const customInput = ref('');
const customName = ref('');
const isCustom = ref(false);
const showPicker = ref(false);
const targetResolution = ref<number>(512);
const copied = ref(false);

const stage = useKonvaStage();
let emojiNode: any = null;

const CANVAS_SIZE = 250;

const fileName = computed(() => {
  if (customName.value.trim()) {
    return customName.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }
  return selected.value.name || 'emoji';
});

const selectPreset = (item: EmojiItem) => {
  selected.value = item;
  customInput.value = '';
  customName.value = '';
  isCustom.value = false;
  updateEmoji(item.char);
};

const onCustomInputChange = () => {
  const val = customInput.value.trim();
  if (val) {
    isCustom.value = true;
    selected.value = {
      name: customName.value.trim() || 'emoji-custom',
      char: val
    };
    updateEmoji(val);
  }
};

const applyFromPicker = (unicode: string, name: string) => {
  isCustom.value = true;
  customInput.value = unicode;
  customName.value = name || 'emoji';
  selected.value = {
    name: name || 'emoji',
    char: unicode
  };
  showPicker.value = false;
  updateEmoji(unicode);
};

const updateEmoji = (char: string) => {
  if (!emojiNode || !stage.layerInstance.value) return;
  emojiNode.text(char);
  emojiNode.offsetX(emojiNode.width() / 2);
  emojiNode.offsetY(emojiNode.height() / 2);
  stage.layerInstance.value.draw();
};

const centerEmoji = () => {
  if (!emojiNode || !stage.layerInstance.value) return;
  emojiNode.position({ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 });
  stage.layerInstance.value.draw();
};

const fitEmoji = () => {
  if (!emojiNode || !stage.layerInstance.value) return;
  emojiNode.position({ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 });
  emojiNode.scale({ x: 1, y: 1 });
  emojiNode.fontSize(160);
  emojiNode.rotation(0);
  emojiNode.offsetX(emojiNode.width() / 2);
  emojiNode.offsetY(emojiNode.height() / 2);
  stage.layerInstance.value.draw();
};

const resetTransform = () => {
  if (!emojiNode || !stage.layerInstance.value) return;
  emojiNode.rotation(0);
  emojiNode.scale({ x: 1, y: 1 });
  stage.layerInstance.value.draw();
};

const handleDownload = () => {
  if (!stage.stageInstance.value || !stage.layerInstance.value) return;

  stage.clearSelection();
  const multiplier = targetResolution.value / CANVAS_SIZE;
  const dataUrl = stage.stageInstance.value.toDataURL({
    pixelRatio: multiplier,
    mimeType: 'image/png'
  });

  stage.selectNode(emojiNode);

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${fileName.value}-${targetResolution.value}x${targetResolution.value}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const handleCopy = async () => {
  if (!stage.stageInstance.value || !stage.layerInstance.value) return;

  stage.clearSelection();
  const multiplier = targetResolution.value / CANVAS_SIZE;
  const dataUrl = stage.stageInstance.value.toDataURL({
    pixelRatio: multiplier,
    mimeType: 'image/png'
  });

  stage.selectNode(emojiNode);

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch {
    alert('Tu navegador no permitió copiar la imagen directamente.');
  }
};

onMounted(async () => {
  await stage.initStage({
    containerId: 'konva-home-stage',
    initialWidth: CANVAS_SIZE,
    initialHeight: CANVAS_SIZE
  });

  if (!stage.KonvaModule.value || !stage.layerInstance.value) return;

  emojiNode = new stage.KonvaModule.value.Text({
    x: CANVAS_SIZE / 2,
    y: CANVAS_SIZE / 2,
    text: selected.value.char,
    fontSize: 130,
    fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
    draggable: true,
    name: 'selectable'
  });
  emojiNode.offsetX(emojiNode.width() / 2);
  emojiNode.offsetY(emojiNode.height() / 2);

  stage.layerInstance.value.add(emojiNode);
  stage.selectNode(emojiNode);
});

onUnmounted(() => {
  stage.destroyStage();
});
</script>
