<template>
  <div class="w-full max-w-5xl mx-auto space-y-8">
    <!-- Header info inside exporter -->
    <div class="text-center space-y-2">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-1">
        <span class="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        Canvas HD & Exportador PNG
      </div>
      <h2 class="text-3xl md:text-4xl font-extrabold tracking-tight text-[#2b1e1a]">
        Generador de Emojis en Alta Calidad
      </h2>
      <p class="text-sm md:text-base text-[#735a4d] max-w-2xl mx-auto">
        Selecciona o escribe cualquier emoji, calibra el margen de seguridad y resolución, y descárgalo con fondo 100% transparente sin recortes de glifos.
      </p>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Controls: Emoji Selector & Resolution -->
      <div class="lg:col-span-7 glass-card rounded-3xl p-6 md:p-7 border border-[#e8d2c0] shadow-xl shadow-[#523e32]/5 space-y-6">
        <!-- Emoji Selector Grid -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="text-xs font-bold uppercase tracking-wider text-[#523e32]">
              1. Selecciona un emoji del catálogo
            </label>
            <span class="text-[11px] text-[#8a6e60] font-medium">
              {{ emojiList.length }} disponibles
            </span>
          </div>
          <div class="grid grid-cols-5 gap-2.5">
            <button
              v-for="item in emojiList"
              :key="item.name"
              type="button"
              @click="selectEmoji(item)"
              :class="[
                'p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-150 cursor-pointer border select-none',
                selected.name === item.name && !isCustomActive
                  ? 'bg-amber-100/90 border-[#d97736] shadow-sm scale-105 ring-2 ring-[#d97736]/30'
                  : 'bg-white/80 border-[#ebd8ca] hover:bg-amber-50/70 hover:border-amber-300'
              ]"
              :title="item.name"
            >
              <span class="text-3xl p-1 inline-flex items-center justify-center leading-none select-none overflow-visible transition-transform duration-150 group-hover:scale-110">
                {{ item.char }}
              </span>
              <span class="text-[10px] font-semibold text-[#735a4d] truncate max-w-full capitalize">
                {{ item.name }}
              </span>
            </button>
          </div>
        </div>

        <!-- Custom Emoji Input -->
        <div class="pt-2 border-t border-[#ebd8ca]/80">
          <label class="block text-xs font-bold uppercase tracking-wider text-[#523e32] mb-2">
            O escribe cualquier otro emoji personalizado:
          </label>
          <div class="flex flex-col sm:flex-row gap-2.5">
            <div class="relative w-full sm:w-28">
              <input
                v-model="customChar"
                @input="onCustomCharInput"
                type="text"
                maxlength="6"
                placeholder="🍩"
                class="w-full h-11 px-3 bg-white/90 border border-[#debfa8] rounded-xl text-center text-xl font-normal focus:outline-none focus:ring-2 focus:ring-[#d97736] focus:border-transparent transition-all shadow-xs"
              />
            </div>
            <div class="relative flex-1">
              <input
                v-model="customName"
                @input="onCustomNameInput"
                type="text"
                placeholder="Nombre del archivo (ej: dona)"
                class="w-full h-11 px-4 bg-white/90 border border-[#debfa8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97736] focus:border-transparent transition-all shadow-xs placeholder-[#aa9384]"
              />
            </div>
          </div>
        </div>

        <!-- Resolution Selector -->
        <div class="pt-2 border-t border-[#ebd8ca]/80">
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-bold uppercase tracking-wider text-[#523e32]">
              2. Resolución de salida (PNG transparente)
            </label>
            <span class="text-[11px] text-[#8a6e60]">
              {{ size }} &times; {{ size }} px
            </span>
          </div>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="res in [128, 256, 512, 1024]"
              :key="res"
              type="button"
              @click="setSize(res)"
              :class="[
                'py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center select-none',
                size === res
                  ? 'bg-[#d97736] text-white border-[#d97736] shadow-md shadow-[#d97736]/20 ring-2 ring-[#d97736]/20'
                  : 'bg-white/80 text-[#523e32] border-[#debfa8] hover:bg-amber-50/70 hover:border-amber-300'
              ]"
            >
              {{ res }} &times; {{ res }}
            </button>
          </div>
        </div>

        <!-- Padding / Margen interno & Ajuste de Escala -->
        <div class="space-y-4 pt-2 border-t border-[#ebd8ca]/80">
          <div>
            <div class="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#523e32] mb-1.5">
              <span>Margen / Padding de seguridad</span>
              <span class="text-[#d97736] font-bold font-mono">{{ paddingPercent }}% ({{ Math.round((size * paddingPercent) / 100) }}px)</span>
            </div>
            <input
              v-model.number="paddingPercent"
              @input="renderCanvas"
              type="range"
              min="0"
              max="35"
              step="1"
              class="w-full accent-[#d97736] cursor-pointer h-2 bg-stone-200 rounded-lg appearance-none"
            />
            <div class="flex justify-between text-[11px] text-[#8a6e60] mt-1 font-medium">
              <span>Menos margen (emoji más grande)</span>
              <span>Más margen (evita cortes de bordes)</span>
            </div>
          </div>

          <!-- Escala adicional -->
          <div>
            <div class="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#523e32] mb-1.5">
              <span>Ajuste de escala fino</span>
              <span class="text-[#d97736] font-bold font-mono">{{ Math.round(scale * 100) }}%</span>
            </div>
            <input
              v-model.number="scale"
              @input="renderCanvas"
              type="range"
              min="0.6"
              max="2"
              step="0.02"
              class="w-full accent-[#d97736] cursor-pointer h-2 bg-stone-200 rounded-lg appearance-none"
            />
            <div class="flex justify-between text-[11px] text-[#8a6e60] mt-1 font-medium">
              <span>0.6x (reducido)</span>
              <span>1.0x (estándar)</span>
              <span>2.0x (amplificado)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Canvas Preview & Download -->
      <div class="lg:col-span-5 glass-card rounded-3xl p-6 md:p-7 border border-[#e8d2c0] shadow-xl shadow-[#523e32]/5 space-y-6 flex flex-col items-center text-center">
        <div>
          <div class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#523e32]">
            <span>Vista Previa en Tiempo Real</span>
          </div>
          <p class="text-[11px] text-[#8a6e60] mt-1">
            El cuadrante punteado representa los bordes exactos del PNG transparente final.
          </p>
        </div>

        <!-- Checkerboard Canvas Container -->
        <div
          class="relative w-full max-w-[280px] aspect-square rounded-2xl p-4 border-2 border-dashed border-[#d9bfae] flex items-center justify-center shadow-inner overflow-hidden"
          style="background-image: repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%); background-size: 16px 16px;"
        >
          <canvas
            ref="canvasRef"
            :width="size"
            :height="size"
            class="max-w-full max-h-full w-auto h-auto aspect-square rounded-lg select-none transition-transform duration-150 drop-shadow-sm"
          ></canvas>
        </div>

        <!-- Info pill -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-[#735a4d]">
          <span class="font-mono font-bold text-[#d97736]">{{ selected.char }}</span>
          <span>&bull;</span>
          <span class="font-semibold">{{ selected.name }}.png</span>
          <span>&bull;</span>
          <span class="font-mono">{{ size }}x{{ size }}px</span>
        </div>

        <!-- Action Buttons -->
        <div class="w-full space-y-3">
          <button
            type="button"
            @click="downloadPng"
            class="w-full py-3.5 px-4 rounded-2xl bg-[#d97736] hover:bg-[#c46527] text-white font-bold text-sm shadow-md shadow-[#d97736]/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Descargar {{ selected.name }}.png</span>
          </button>

          <button
            type="button"
            @click="copyToClipboard"
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
import { ref, onMounted, nextTick } from 'vue';
import { emojiFallback } from './icons';

interface EmojiItem {
  name: string;
  char: string;
}

const emojiList: EmojiItem[] = Object.entries(emojiFallback).map(([name, char]) => ({
  name,
  char
}));

const selected = ref<EmojiItem>(emojiList[0]);
const customChar = ref('');
const customName = ref('');
const isCustomActive = ref(false);
const size = ref<number>(512);
const paddingPercent = ref<number>(14); // 14% de margen de seguridad
const scale = ref<number>(0.92);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const copied = ref(false);

const selectEmoji = (item: EmojiItem) => {
  selected.value = item;
  customChar.value = '';
  customName.value = '';
  isCustomActive.value = false;
  renderCanvas();
};

const onCustomCharInput = () => {
  const char = customChar.value.trim();
  if (char) {
    isCustomActive.value = true;
    selected.value = {
      name: customName.value.trim() || 'emoji-custom',
      char: char
    };
    renderCanvas();
  }
};

const onCustomNameInput = () => {
  if (isCustomActive.value && selected.value) {
    selected.value.name = customName.value.trim() || 'emoji-custom';
  }
};

const setSize = (res: number) => {
  size.value = res;
  renderCanvas();
};

const draw = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Limpiar con canal alfa 100% transparente
  ctx.clearRect(0, 0, size.value, size.value);

  // Calcular el área segura considerando el padding
  const padding = (size.value * paddingPercent.value) / 100;
  const safeZone = size.value - padding * 1;
  const targetSize = safeZone * scale.value;

  let fontSize = Math.floor(targetSize);
  ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Android Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Ajustar si el ancho del glifo medido excede el área segura
  const metrics = ctx.measureText(selected.value.char);
  if (metrics.width > targetSize) {
    fontSize = Math.floor(fontSize * (targetSize / metrics.width));
    ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Android Emoji", sans-serif`;
  }

  const centerX = size.value / 2;
  let centerY = size.value / 2;

  // Centrado vertical óptico usando métricas reales de caja delimitadora
  if (metrics.actualBoundingBoxAscent !== undefined && metrics.actualBoundingBoxDescent !== undefined) {
    const glyphHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    centerY = (size.value - glyphHeight) / 2 + metrics.actualBoundingBoxAscent;
  }

  ctx.fillText(selected.value.char, centerX, centerY);
};

const renderCanvas = () => {
  nextTick(() => {
    draw();
  });
};

const downloadPng = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  draw();

  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  const cleanName = selected.value.name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'emoji';
  a.download = `${cleanName}-${size.value}x${size.value}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const copyToClipboard = async () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  draw();

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    try {
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
  });
};

onMounted(() => {
  renderCanvas();
});
</script>
