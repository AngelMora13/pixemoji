/**
 * Configuración para el sistema de donaciones "Buy Me a Coffee" con Binance Pay.
 * Puedes editar fácilmente los datos de pago, montos, imágenes y textos aquí.
 */

export interface CoffeePreset {
  count: number;
  label: string;
  popular?: boolean;
}

export interface DonationConfig {
  /** Información de Binance Pay */
  binance: {
    /** Tu alias de Binance (User ID o Binance Pay ID) */
    alias: string;
    /** Tu ID de Binance (User ID o Binance Pay ID) */
    userId: string;
    /** Ruta de la imagen del código QR (usa '/logo.webp' como placeholder) */
    qrImage: string;
    /** URL web o deep link para abrir la app de Binance */
    appUrl: string;
    /** Nombre o alias a mostrar (opcional) */
    merchantName?: string;
  };

  /** Precios y opciones de cafés */
  pricing: {
    /** Precio en USD por cada café */
    pricePerCoffeeUsd: number;
    /** Símbolo de moneda */
    currencySymbol: string;
    /** Lista de opciones de cafés rápidas */
    presets: CoffeePreset[];
    /** Mínimo de cafés permitidos en modo personalizado */
    minCustomCoffees: number;
    /** Máximo de cafés permitidos en modo personalizado */
    maxCustomCoffees: number;
    /** Cantidad seleccionada por defecto */
    defaultCount: number;
  };

  /** Clave para guardar en localStorage el estatus de donador */
  storageKey: string;

  /** Textos y mensajes de la interfaz */
  texts: {
    /** Botón en el Header para usuario nuevo */
    headerButtonNew: string;
    /** Botón en el Header para usuario que ya aportó */
    headerButtonSupporter: string;

    /** Título del modal para usuario nuevo */
    modalTitleNew: string;
    /** Subtítulo del modal para usuario nuevo */
    modalSubtitleNew: string;

    /** Título del modal para usuario recurrente */
    modalTitleSupporter: string;
    /** Subtítulo del modal para usuario recurrente */
    modalSubtitleSupporter: string;

    /** Instrucción sobre el QR y Binance */
    scanInstruction: string;
    /** Texto para el botón de copiar ID */
    copyIdButton: string;
    /** Texto mostrado tras copiar el ID con éxito */
    copiedIdFeedback: string;
    /** Botón para abrir la app de Binance */
    openBinanceButton: string;

    /** Pregunta antes de confirmar el envío */
    confirmPrompt: string;
    /** Botón para confirmar que ya se envió el aporte */
    confirmButton: string;

    /** Título de la pantalla de agradecimiento */
    thankYouTitle: string;
    /** Mensaje de la pantalla de agradecimiento */
    thankYouMessage: string;
    /** Botón de cierre tras el agradecimiento */
    thankYouCloseButton: string;

    /** Frase corta para banners y llamadas a la acción inline */
    inlinePrompt: string;
    /** Texto del botón en banner inline */
    inlineButton: string;
  };
}

export const DONATION_CONFIG: DonationConfig = {
  binance: {
    alias: 'Indi13',
    userId: '312056582', // Reemplazar con tu ID real de Binance / Binance Pay
    qrImage: '/QR_Binance.jpg', // Placeholder: logo del proyecto. Reemplazar con '/tu-qr-binance.png'
    appUrl: 'https://app.binance.com/uni-qr/7x1vB7xi', // Enlace para abrir Binance o Binance Pay
    merchantName: 'PixEmoji Creator'
  },

  pricing: {
    pricePerCoffeeUsd: 1, // $1 USD por cada café
    currencySymbol: '$',
    presets: [
      { count: 1, label: '1 ☕' },
      { count: 3, label: '3 ☕', popular: true },
      { count: 5, label: '5 ☕' }
    ],
    minCustomCoffees: 1,
    maxCustomCoffees: 100,
    defaultCount: 1
  },

  storageKey: 'pixemoji_has_donated',

  texts: {
    headerButtonNew: 'Invítame un café',
    headerButtonSupporter: 'Coffee Lover',

    modalTitleNew: '¿Me invitas un café?',
    modalSubtitleNew: 'Apoya el desarrollo de PixEmoji con Binance Pay',

    modalTitleSupporter: '¡Hola de nuevo, Leyenda!',
    modalSubtitleSupporter: 'Gracias por tu apoyo anterior. ¿Otro café para hoy? ☕',

    scanInstruction: 'Escanea el código con Binance Pay o transfiere a este ID:',
    copyIdButton: 'Copiar ID',
    copiedIdFeedback: '¡ID Copiado!',
    openBinanceButton: 'Abrir Binance App',

    confirmPrompt: '¿Ya realizaste tu envío?',
    confirmButton: '🎉 ¡Ya envié mi aporte!',

    thankYouTitle: '¡MUCHAS GRACIAS! 🙌',
    thankYouMessage:
      'Tu apoyo significa el mundo para mí y me ayuda a mantener esta herramienta 100% gratuita, sin anuncios y en constante mejora. ¡Disfruta tu nuevo emoji!',
    thankYouCloseButton: 'Continuar creando',

    inlinePrompt: '¿Te sirvió la herramienta? Apoya el proyecto invitándome a un café en Binance ☕',
    inlineButton: 'Invitar un café'
  }
};
