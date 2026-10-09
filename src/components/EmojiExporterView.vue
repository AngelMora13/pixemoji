<template>
  <div class="w-full max-w-5xl mx-auto space-y-8">
    <!-- Header -->
    <div class="text-center space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 border border-primary-200 text-primary-800 text-xs font-semibold uppercase tracking-wider mb-1">
        <span class="inline-block w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
        Lienzo Interactivo con Emojis
      </div>
      <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-text-main">
        Exportador de Emojis en Alta Resolución
      </h2>
      <p class="text-sm md:text-base text-text-muted max-w-2xl mx-auto">
        Posiciona, escala o rota tu emoji libremente en el lienzo interactivo de 250x250 px. Usa el selector completo con decenas de emojis o elige uno de la galería rápida.
      </p>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Controls: Emoji Selector, Resolution & Format -->
      <div class="lg:col-span-7">
        <EmojiControlsPanel
          :selected-char="selectedChar"
          v-model:target-resolution="targetResolution"
          v-model:image-format="imageFormat"
          @update:selected-char="onSelectEmoji"
        />
      </div>

      <!-- Right: Interactive Canvas & Export Actions -->
      <div class="lg:col-span-5 glass-card rounded-3xl p-6 md:p-7 border border-app-border shadow-soft space-y-6 flex flex-col items-center text-center">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-text-main">
            Lienzo Konva (250 &times; 250 px)
          </span>
          <p class="text-[11px] text-text-subtle mt-0.5">
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
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-50 border border-primary-200 text-[11px] text-text-muted">
          <span class="font-mono font-bold text-base leading-none text-primary-600">{{ selectedChar }}</span>
          <span>&bull;</span>
          <span class="font-semibold text-text-main">{{ fileName }}.{{ fileExtension }}</span>
          <span>&bull;</span>
          <span class="font-mono">{{ targetResolution }}&times;{{ targetResolution }}px</span>
          <span>&bull;</span>
          <span class="font-bold uppercase text-primary-600">{{ imageFormat }}</span>
        </div>

        <!-- Action Buttons -->
        <ExportActions
          :download-text="`Descargar ${fileName}.${fileExtension}`"
          :copied="copied"
          @download="handleDownload"
          @copy="handleCopy"
        />
      </div>
    </div>

    <!-- Global Emoji Picker Modal -->
    <EmojiPickerModal />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { emojiFallback } from './icons';
import { useKonvaStage } from '../composables/useKonvaStage';
import { patchKonvaEmojiShadow, patchKonvaEmojiBounds, syncEmojiMetrics } from '../composables/useKonvaEmojiFix';

// Modular Subcomponents
import KonvaStage from './canvas/KonvaStage.vue';
import ExportActions from './common/ExportActions.vue';
import EmojiControlsPanel, { type ExportImageFormat } from './common/EmojiControlsPanel.vue';
import EmojiPickerModal from './common/EmojiPickerModal.vue';

const selectedChar = ref('🧁');
const targetResolution = ref<number>(512);
const imageFormat = ref<ExportImageFormat>('png');
const copied = ref(false);

const stage = useKonvaStage();
let emojiNode: any = null;

const CANVAS_SIZE = 250;

const charToNameMap = Object.entries(emojiFallback).reduce<Record<string, string>>((acc, [name, char]) => {
  acc[char] = name;
  return acc;
}, {});

const fileName = computed(() => {
  const char = selectedChar.value;
  if (charToNameMap[char]) return charToNameMap[char];
  const codePoints = Array.from(char).map(c => c.codePointAt(0)?.toString(16)).filter(Boolean);
  return codePoints.length ? `emoji_${codePoints.join('_')}` : 'emoji';
});

const fileExtension = computed(() => (imageFormat.value === 'jpeg' ? 'jpg' : imageFormat.value));

const onSelectEmoji = (char: string) => {
  selectedChar.value = char;
  updateEmoji(char);
};

const updateEmoji = (char: string) => {
  if (!emojiNode || !stage.layerInstance.value) return;
  emojiNode.text(char);
  syncEmojiMetrics(emojiNode, char);
  stage.transformerInstance.value?.forceUpdate();
  stage.layerInstance.value.draw();
};

const handleDownload = () => {
  if (!stage.stageInstance.value || !stage.layerInstance.value) return;

  stage.clearSelection();
  const multiplier = targetResolution.value / CANVAS_SIZE;
  const mimeType = imageFormat.value === 'jpeg' ? 'image/jpeg' : imageFormat.value === 'webp' ? 'image/webp' : 'image/png';

  let tempBg: any = null;
  if (imageFormat.value === 'jpeg' && stage.KonvaModule.value) {
    tempBg = new stage.KonvaModule.value.Rect({
      x: 0,
      y: 0,
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      fill: '#ffffff',
      listening: false
    });
    stage.layerInstance.value.add(tempBg);
    tempBg.moveToBottom();
    stage.layerInstance.value.draw();
  }

  const dataUrl = stage.stageInstance.value.toDataURL({
    pixelRatio: multiplier,
    mimeType
  });

  if (tempBg) {
    tempBg.destroy();
    stage.layerInstance.value.draw();
  }

  stage.selectNode(emojiNode);

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${fileName.value}-${targetResolution.value}x${targetResolution.value}.${fileExtension.value}`;
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

  patchKonvaEmojiShadow(stage.KonvaModule.value);
  patchKonvaEmojiBounds(stage.KonvaModule.value);

  emojiNode = new stage.KonvaModule.value.Text({
    x: CANVAS_SIZE / 2,
    y: CANVAS_SIZE / 2,
    text: selectedChar.value,
    fontSize: 130,
    fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
    draggable: true,
    name: 'selectable',
    nodeType: 'emoji'
  });
  emojiNode.setAttr('nodeType', 'emoji');
  syncEmojiMetrics(emojiNode, selectedChar.value, 130);

  stage.layerInstance.value.add(emojiNode);
  stage.selectNode(emojiNode);
});

onUnmounted(() => {
  stage.destroyStage();
});
</script>
