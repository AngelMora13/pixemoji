export type ExportImageFormat = 'png' | 'webp' | 'jpeg';

export interface FormatOption {
  label: string;
  val: ExportImageFormat;
  tag: string;
}

export const formatOptions: FormatOption[] = [
  { label: 'PNG', val: 'png', tag: 'Transparente' },
  { label: 'WEBP', val: 'webp', tag: 'Ligero' },
  { label: 'JPEG', val: 'jpeg', tag: 'Fondo Blanco' }
];

export const getFormatExtension = (format?: ExportImageFormat | null): string => {
  if (!format) return 'png';
  return format === 'jpeg' ? 'jpg' : format;
};
