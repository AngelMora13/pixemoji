<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <label class="block text-xs font-bold uppercase tracking-wider text-text-main">
        Efectos Visuales
      </label>
      <span v-if="selectedInfo" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 border border-primary-200 truncate max-w-[140px]">
        {{ selectedInfo.label }}
      </span>
    </div>

    <!-- Si no hay nada seleccionado -->
    <div v-if="!selectedInfo" class="p-6 text-center bg-white/60 border border-dashed border-app-border-strong rounded-2xl space-y-2">
      <span class="text-3xl block">✨</span>
      <p class="text-xs font-semibold text-text-main">Ningún elemento seleccionado</p>
      <p class="text-[11px] text-text-subtle">
        Haz clic en cualquier emoji, texto o imagen en el lienzo para aplicarle efectos de pegatina, resplandor neón o reflejarlo.
      </p>
    </div>

    <!-- Controles de Efectos cuando hay selección -->
    <div v-else class="space-y-4">
      <!-- 1. EFECTO STICKER / TROQUELADO -->
      <div class="p-3 bg-white border border-app-border rounded-2xl space-y-2.5 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-text-main flex items-center gap-1">
            <span>🏷️</span>
            <span>Efecto Pegatina / Sticker</span>
          </span>
          <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary-100 text-primary-800 border border-primary-200">Troquelado</span>
        </div>
        <p class="text-[10px] text-text-subtle">
          Borde grueso y sombra suave para darle aspecto de pegatina física de vinilo.
        </p>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="onApplySticker"
            class="flex-1 py-2 px-3 rounded-xl bg-primary-gradient hover:opacity-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
          >
            <span>✨</span>
            <span>Aplicar Borde Sticker</span>
          </button>
        </div>

        <!-- Opciones de Sticker: Grosor y Color de Trazo -->
        <div class="grid grid-cols-2 gap-2 pt-1">
          <div>
            <span class="text-[10px] text-text-subtle block mb-1">Grosor borde ({{ stickerWidth }}px):</span>
            <input
              v-model.number="stickerWidth"
              @input="onApplySticker"
              type="range"
              min="4"
              max="24"
              class="w-full accent-primary-600 cursor-pointer"
            />
          </div>
          <div>
            <span class="text-[10px] text-text-subtle block mb-1">Color borde:</span>
            <div class="flex items-center gap-1.5">
              <input
                v-model="stickerColor"
                @input="onApplySticker"
                type="color"
                class="w-7 h-7 rounded-lg border border-app-border-strong cursor-pointer"
              />
              <button
                v-for="c in ['#ffffff', '#fef08a', '#67e8f9', '#f472b6']"
                :key="c"
                type="button"
                @click="stickerColor = c; onApplySticker()"
                class="w-5 h-5 rounded-md border border-stone-300 cursor-pointer shadow-2xs hover:scale-110"
                :style="{ backgroundColor: c }"
              ></button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. RESPLANDOR NEÓN / GLOW -->
      <div class="p-3 bg-white border border-app-border rounded-2xl space-y-2.5 shadow-2xs">
        <span class="text-xs font-bold text-text-main flex items-center gap-1">
          <span>💡</span>
          <span>Resplandor Neón / Glow</span>
        </span>

        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="glow in glowPresets"
            :key="glow.id"
            type="button"
            @click="onSelectGlow(glow.color)"
            class="py-1 px-2 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 hover:scale-105"
            :style="{ borderColor: glow.color, backgroundColor: glow.color + '15', color: glow.textColor || '#2b1e1a' }"
          >
            <span>{{ glow.icon }}</span>
            <span>{{ glow.name }}</span>
          </button>
        </div>

        <div class="flex items-center justify-between pt-1">
          <span class="text-[10px] text-text-subtle">Intensidad / Blur ({{ glowBlur }}px):</span>
          <input
            v-model.number="glowBlur"
            @input="onGlowBlurChange"
            type="range"
            min="6"
            max="45"
            class="w-32 accent-primary-600 cursor-pointer"
          />
        </div>
      </div>

      <!-- 3. GIRO, REFLEJO & POSICIÓN -->
      <div class="p-3 bg-white border border-app-border rounded-2xl space-y-2 shadow-2xs">
        <span class="text-xs font-bold text-text-main block">
          Orientación & Alineación
        </span>
        <div class="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            @click="$emit('flipH')"
            class="py-1.5 px-2 rounded-xl bg-primary-50 hover:bg-primary-100 border border-app-border-strong text-text-main text-xs font-semibold cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
            title="Reflejar horizontalmente"
          >
            <span>↔️</span>
            <span>Giro Horizontal</span>
          </button>
          <button
            type="button"
            @click="$emit('flipV')"
            class="py-1.5 px-2 rounded-xl bg-primary-50 hover:bg-primary-100 border border-app-border-strong text-text-main text-xs font-semibold cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
            title="Reflejar verticalmente"
          >
            <span>↕️</span>
            <span>Giro Vertical</span>
          </button>
          <button
            type="button"
            @click="$emit('rotate')"
            class="py-1.5 px-2 rounded-xl bg-primary-50 hover:bg-primary-100 border border-app-border-strong text-text-main text-xs font-semibold cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
            title="Girar 90 grados"
          >
            <span>🔄</span>
            <span>Rotar 90°</span>
          </button>
          <button
            type="button"
            @click="$emit('center')"
            class="py-1.5 px-2 rounded-xl bg-primary-50 hover:bg-primary-100 border border-app-border-strong text-text-main text-xs font-semibold cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
            title="Centrar en el lienzo"
          >
            <span>🎯</span>
            <span>Centrar</span>
          </button>
        </div>
      </div>

      <!-- 4. BLOQUEO & LIMPIEZA -->
      <div class="flex gap-2">
        <button
          type="button"
          @click="$emit('toggleLock')"
          :class="[
            'flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5',
            selectedInfo?.isLocked
              ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
              : 'bg-white text-text-main border-app-border-strong hover:bg-primary-50'
          ]"
        >
          <span>{{ selectedInfo?.isLocked ? '🔒' : '🔓' }}</span>
          <span>{{ selectedInfo?.isLocked ? 'Desbloquear' : 'Bloquear Capa' }}</span>
        </button>

        <button
          type="button"
          @click="$emit('removeEffects')"
          class="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 text-xs font-semibold cursor-pointer flex items-center gap-1"
          title="Eliminar bordes y sombras"
        >
          <span>🧹</span>
          <span>Quitar Efectos</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  selectedInfo: { label: string; type: string; isLocked: boolean } | null;
}>();

const emit = defineEmits<{
  (e: 'applySticker', options: { strokeColor: string; strokeWidth: number }): void;
  (e: 'applyGlow', options: { color: string; blur: number }): void;
  (e: 'flipH'): void;
  (e: 'flipV'): void;
  (e: 'rotate'): void;
  (e: 'center'): void;
  (e: 'toggleLock'): void;
  (e: 'removeEffects'): void;
}>();

const stickerWidth = ref(12);
const stickerColor = ref('#ffffff');
const glowBlur = ref(24);
const currentGlowColor = ref('#ff007f');

const glowPresets = [
  { id: 'pink', name: 'Rosa Neón', color: '#ff007f', icon: '💖' },
  { id: 'cyan', name: 'Cyan Cyber', color: '#00f0ff', icon: '💎' },
  { id: 'gold', name: 'Oro Solar', color: '#ffd700', icon: '⚡' },
  { id: 'green', name: 'Verde Matrix', color: '#10b981', icon: '🍀' },
  { id: 'dark', name: 'Sombra Suave', color: 'rgba(0,0,0,0.45)', icon: '🌑' }
];

const onApplySticker = () => {
  emit('applySticker', {
    strokeColor: stickerColor.value,
    strokeWidth: stickerWidth.value
  });
};

const onSelectGlow = (color: string) => {
  currentGlowColor.value = color;
  emit('applyGlow', {
    color,
    blur: glowBlur.value
  });
};

const onGlowBlurChange = () => {
  emit('applyGlow', {
    color: currentGlowColor.value,
    blur: glowBlur.value
  });
};
</script>
