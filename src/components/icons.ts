export type EmojiName =
  | 'cupcake'   // 🧁
  | 'cake'      // 🍰
  | 'sparkles'  // ✨
  | 'warning'   // ⚠️
  | 'clock'     // ⏰
  | 'chat'      // 💬
  | 'delivery'  // 🛵
  | 'pin'       // 📍
  | 'lock'      // 🔐
  | 'star'      // ⭐
  | 'heart'     // ❤️
  | 'fire'      // 🔥
  | 'rocket'    // 🚀
  | 'party'     // 🎉
  | 'coffee';   // ☕

export const emojiFallback: Record<EmojiName, string> = {
  cupcake: '🧁',
  cake: '🍰',
  sparkles: '✨',
  warning: '⚠️',
  clock: '⏰',
  chat: '💬',
  delivery: '🛵',
  pin: '📍',
  lock: '🔐',
  star: '⭐',
  heart: '❤️',
  fire: '🔥',
  rocket: '🚀',
  party: '🎉',
  coffee: '☕'
};
