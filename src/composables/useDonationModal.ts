import { ref, provide, inject, onMounted, onUnmounted, type InjectionKey, type Ref } from 'vue';
import { DONATION_CONFIG } from '../utils/donationConfig';

export interface DonationContext {
  isOpen: Ref<boolean>;
  openModal: () => void;
  closeModal: () => void;
}

export const DONATION_CONTEXT_KEY: InjectionKey<DonationContext> = Symbol('DONATION_CONTEXT_KEY');

export function checkSupporterStatus(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(DONATION_CONFIG.storageKey) === 'true';
  } catch {
    return false;
  }
}

export function useSupporter() {
  const isSupporter = ref(false);

  const update = () => {
    isSupporter.value = checkSupporterStatus();
  };

  onMounted(() => {
    update();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', update);
      window.addEventListener('pixemoji:supporter-updated', update);
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', update);
      window.removeEventListener('pixemoji:supporter-updated', update);
    }
  });

  if (typeof window !== 'undefined') {
    isSupporter.value = checkSupporterStatus();
  }

  const markAsSupporter = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DONATION_CONFIG.storageKey, 'true');
        window.dispatchEvent(new CustomEvent('pixemoji:supporter-updated'));
      } catch (err) {
        console.warn('Error saving supporter status:', err);
      }
    }
    isSupporter.value = true;
  };

  return { isSupporter, markAsSupporter };
}

/**
 * Proveedor para los componentes raíces (EmojiExporterView y MemeStudioView).
 * Permite que cualquier componente hijo (como el banner de exportación)
 * abra el modal montado en el root mediante useDonationModal().
 */
export function provideDonationModal(): DonationContext {
  const isOpen = ref(false);
  const openModal = () => {
    isOpen.value = true;
  };
  const closeModal = () => {
    isOpen.value = false;
  };

  const context: DonationContext = {
    isOpen,
    openModal,
    closeModal
  };

  provide(DONATION_CONTEXT_KEY, context);
  return context;
}

/**
 * Consumidor para componentes hijos (DonationInlineBanner, etc.)
 */
export function useDonationModal(): DonationContext | null {
  return inject(DONATION_CONTEXT_KEY, null);
}
