<template>
  <header
    class="bg-grid-pattern-tiny relative w-full bg-app-header/90 backdrop-blur-md border-b border-app-border px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-30 select-none shadow-xs"
    data-purpose="studio-unified-header"
  >
    <!-- Left: Brand Logo & Navigation Dropdown (Mobile) / Full Brand & Switcher (Desktop) -->
    <div class="flex items-center gap-2 sm:gap-4">
      <!-- Mobile: Logo Icon Button with Dropdown -->
      <div class="relative md:hidden">
        <button
          type="button"
          @click="isRouteMenuOpen = !isRouteMenuOpen"
          aria-label="Menú de rutas"
          class="w-9 h-9 rounded-2xl flex items-center justify-center text-lg shadow-md shadow-primary-600/20 active:scale-95 transition-transform cursor-pointer"
        >
          👾
        </button>

        <!-- Backdrop for mobile dropdown -->
        <div
          v-if="isRouteMenuOpen"
          class="fixed inset-0 z-40"
          @click="isRouteMenuOpen = false"
        ></div>

        <!-- Mobile Navigation Menu Popover -->
        <div
          v-if="isRouteMenuOpen"
          class="absolute top-full left-0 mt-2 w-64 bg-white/98 backdrop-blur-md border border-app-border-strong rounded-2xl shadow-xl p-2 z-50 animate-fade-in space-y-1"
        >
          <div class="px-3 py-1.5 border-b border-app-border">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-text-subtle">
              Navegación PixEmoji
            </span>
          </div>

          <a
            href="/"
            class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-main hover:bg-stone-50 hover:text-primary-600 transition-colors"
          >
            <span class="text-base">🧁</span>
            <div class="leading-tight">
              <div class="font-bold">Exportador Emoji</div>
              <span class="text-[10px] text-text-muted">PNG transparente HD</span>
            </div>
          </a>

          <div
            class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200"
          >
            <span class="text-base">🎨</span>
            <div class="leading-tight flex-1">
              <div>Meme & Sticker Studio</div>
              <span class="text-[10px] text-primary-500 font-medium">Editor actual</span>
            </div>
            <span class="text-[9px] uppercase px-1.5 py-0.5 bg-primary-gradient text-white rounded font-extrabold">
              Pro
            </span>
          </div>

          <div class="pt-1 border-t border-app-border space-y-1">
            <a
              href="https://buymeacoffee.com/angelmora"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
            >
              <span>☕</span>
              <span>Invitar un café</span>
            </a>
            <a
              :href="GITHUB_URL"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-text-muted hover:text-text-main hover:bg-stone-50 transition-colors"
            >
              <span>⭐</span>
              <span>Código abierto GitHub</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Desktop: Logo with Text & Navigation Switcher -->
      <div class="hidden md:flex items-center gap-4">
        <a href="/" class="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]">
          <div
            class="w-9 h-9 rounded-2xl flex items-center justify-center text-lg font-black shadow-md shadow-primary-600/20"
          >
            👾
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-bold text-base tracking-tight text-text-main group-hover:text-primary-600 transition-colors">
                PixEmoji
              </span>
              <span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-primary-100 border border-primary-300 text-primary-800">
                Studio
              </span>
            </div>
            <p class="text-[10px] text-text-muted">Sticker & Meme Studio</p>
          </div>
        </a>

        <!-- Desktop Mode Switcher -->
        <nav class="flex items-center p-1 bg-stone-100 rounded-xl border border-app-border text-xs">
          <a
            href="/"
            class="px-3 py-1 rounded-lg text-xs font-semibold text-text-muted hover:text-text-main hover:bg-white/60 transition-all flex items-center gap-1.5"
          >
            <span>🧁</span>
            <span>Exportador Emoji</span>
          </a>
          <span
            class="px-3 py-1 rounded-lg text-xs font-bold bg-white text-primary-600 shadow-2xs border border-app-border-strong flex items-center gap-1.5"
          >
            <span>🎨</span>
            <span>Meme Studio</span>
          </span>
        </nav>
      </div>
    </div>

    <!-- Right: Format Selector & Download Action -->
    <div class="flex items-center gap-1.5 sm:gap-2">
      <!-- Buy Me a Coffee on Tablet / Desktop -->
      <div class="hidden lg:flex items-center">
        <BuyMeCoffeeButton />
      </div>

      <!-- Quick Canvas Preset Selector -->
      <div class="relative flex items-center gap-1">
        <div class="relative flex items-center">
          <select
            id="format-select"
            :value="currentPreset.id"
            @change="onPresetSelect"
            aria-label="Seleccionar formato de lienzo"
            class="appearance-none pl-6 pr-6 sm:pr-8 py-1.5 bg-control-bg hover:bg-control-bg-hover border border-control-border text-text-main text-xs font-bold rounded-xl cursor-pointer shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            title="Formato y proporción del lienzo"
          >
            <option v-for="p in formatPresets" :key="p.id" :value="p.id">
              {{ p.icon }} {{ p.name }} ({{ p.ratioLabel }})
            </option>
          </select>

          <!-- Animated Pulse Dot -->
          <span class="absolute left-2.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse pointer-events-none"></span>

          <!-- Dropdown Chevron Icon -->
          <svg
            class="absolute right-2 w-3.5 h-3.5 text-text-muted pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <!-- Custom Canvas Size Edit Button -->
        <button
          v-if="currentPreset.id === 'custom'"
          type="button"
          @click="$emit('openCustomModal')"
          class="flex items-center gap-1 px-2 py-1.5 bg-primary-50 hover:bg-primary-100 border border-primary-300 text-primary-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
          title="Cambiar medidas personalizadas"
        >
          <span>📐</span>
          <span class="hidden sm:inline text-[11px]">Medidas</span>
        </button>
      </div>

      <!-- Quick Download Button -->
      <button
        type="button"
        @click="$emit('openExport')"
        aria-label="Descargar / Guardar"
        class="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-1.5 rounded-xl bg-primary-gradient hover:opacity-95 text-white font-bold text-xs shadow-md shadow-primary-600/25 active:scale-95 transition-all cursor-pointer shrink-0"
        title="Descargar o copiar sticker"
      >
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.3"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          ></path>
        </svg>
        <span class="hidden sm:inline">Descargar</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FormatPreset } from '../../composables/useSocialPresets';
import BuyMeCoffeeButton from '../common/BuyMeCoffeeButton.vue';
import { GITHUB_URL } from '../../utils/constant';

const props = defineProps<{
  currentPreset: FormatPreset;
  formatPresets: FormatPreset[];
}>();

const emit = defineEmits<{
  (e: 'selectPreset', preset: FormatPreset): void;
  (e: 'openCustomModal'): void;
  (e: 'openExport'): void;
}>();

const isRouteMenuOpen = ref(false);

const onPresetSelect = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const found = props.formatPresets.find((p) => p.id === target.value);
  if (found) {
    emit('selectPreset', found);
    if (found.id === 'custom') {
      emit('openCustomModal');
    }
  }
};
</script>

