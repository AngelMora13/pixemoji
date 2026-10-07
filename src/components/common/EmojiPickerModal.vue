<template>
  <Teleport to="body">
    <div v-if="effectiveIsOpen" class="emoji-picker-teleport-root">
      <!-- Backdrop para cerrar al hacer clic fuera -->
      <div
        class="fixed inset-0 z-[9990] bg-black/25 backdrop-blur-[0.5px] transition-opacity"
        @click="handleClose"
      ></div>

      <!-- Contenedor flotante teleportado con su marco, texto y posición instantánea sin saltos -->
      <div
        ref="popoverEl"
        class="fixed z-[9999] p-2.5 bg-primary-50/95 border border-primary-200 rounded-2xl shadow-2xl flex flex-col items-center overflow-hidden transition-all duration-150 ease-out"
        :style="popoverStyle"
        @click.stop
      >
        <div class="w-full flex justify-between items-center mb-2 px-1">
          <span class="text-[11px] text-text-subtle font-medium">
            Buscador completo de Unicode:
          </span>
          <button
            type="button"
            @click="handleClose"
            class="text-[11px] font-bold text-primary-600 hover:underline cursor-pointer"
          >
            Cerrar
          </button>
        </div>

        <div class="w-full flex justify-center overflow-hidden">
          <emoji-picker
            ref="pickerEl"
            class="light"
            @emoji-click="onEmojiClick"
          ></emoji-picker>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useGlobalEmojiPicker } from '../../composables/useGlobalEmojiPicker';

const props = withDefaults(
  defineProps<{
    isOpen?: boolean;
    anchorEl?: HTMLElement | null;
  }>(),
  {
    isOpen: undefined,
    anchorEl: undefined
  }
);

const emit = defineEmits<{
  (e: 'select', unicode: string, name: string): void;
  (e: 'close'): void;
}>();

const globalPicker = useGlobalEmojiPicker();

const effectiveIsOpen = computed(() => {
  return (props.isOpen ?? false) || globalPicker.isOpen.value;
});

const effectiveAnchor = computed(() => {
  return props.anchorEl || globalPicker.activeAnchor.value;
});

const pickerEl = ref<any>(null);
const popoverEl = ref<HTMLElement | null>(null);

const computeStyle = (anchor: HTMLElement | null): Record<string, string> => {
  if (typeof window === 'undefined') return {};

  const pickerW = 350;
  const pickerH = 430;
  const margin = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (!anchor || vw < 640) {
    return {
      top: `${Math.max(12, Math.round((vh - pickerH) / 2))}px`,
      left: `${Math.max(12, Math.round((vw - pickerW) / 2))}px`,
      transform: 'none'
    };
  }

  const rect = anchor.getBoundingClientRect();
  let top = rect.top;
  let left = rect.left;

  if (rect.left < vw / 2) {
    if (rect.right + margin + pickerW <= vw) {
      left = rect.right + margin;
      top = Math.max(margin, Math.min(rect.top, vh - pickerH - margin));
    } else {
      top = rect.bottom + margin + pickerH <= vh ? rect.bottom + margin : Math.max(margin, rect.top - margin - pickerH);
      left = Math.max(margin, Math.min(rect.left, vw - pickerW - margin));
    }
  } else {
    if (rect.left - margin - pickerW >= 0) {
      left = rect.left - margin - pickerW;
      top = Math.max(margin, Math.min(rect.top, vh - pickerH - margin));
    } else {
      top = rect.bottom + margin + pickerH <= vh ? rect.bottom + margin : Math.max(margin, rect.top - margin - pickerH);
      left = Math.max(margin, Math.min(rect.left, vw - pickerW - margin));
    }
  }

  return {
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
    transform: 'none'
  };
};

const popoverStyle = ref<Record<string, string>>({});

const updatePosition = () => {
  popoverStyle.value = computeStyle(effectiveAnchor.value);
};

const handleClose = () => {
  if (globalPicker.isOpen.value) {
    globalPicker.closePicker();
  } else {
    emit('close');
  }
};

const onEmojiClick = (event: any) => {
  const char = event.detail?.unicode || event.detail?.emoji?.unicode;
  const name = event.detail?.emoji?.annotation || 'emoji';
  if (char) {
    if (globalPicker.isOpen.value) {
      globalPicker.handleSelect(char, name);
    } else {
      emit('select', char, name);
      emit('close');
    }
  }
};

watch(
  effectiveIsOpen,
  async (open) => {
    if (open) {
      // 1. Calcular posición de inmediato antes del renderizado (elimina el salto inicial)
      updatePosition();

      // 2. Cargar asíncronamente el paquete de emoji-picker solo cuando se abre
      if (typeof window !== 'undefined' && !customElements.get('emoji-picker')) {
        await import('emoji-picker-element');
      }

      nextTick(() => {
        updatePosition();
      });

      if (typeof window !== 'undefined') {
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
      }
    } else {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      }
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updatePosition);
    window.removeEventListener('scroll', updatePosition, true);
  }
});
</script>

<style scoped>
emoji-picker {
  width: 330px;
  max-width: calc(100vw - 36px);
  height: 380px;
  border-radius: 1rem;
  --num-columns: 8;
  --emoji-size: 1.5rem;
}
</style>
