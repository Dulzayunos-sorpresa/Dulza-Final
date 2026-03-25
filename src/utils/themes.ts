import { SpecialLayout } from '../types';

export interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  text: string;
  heroBg: string;
  pattern?: string;
  emoji: string;
}

export const THEMES: Record<SpecialLayout, ThemeConfig> = {
  default: {
    name: 'Predeterminado',
    primary: 'text-brand-600',
    secondary: 'bg-brand-600',
    accent: 'border-brand-200',
    bg: 'bg-crema',
    text: 'text-texto',
    heroBg: 'bg-brand-50',
    emoji: '🎁'
  },
  father: {
    name: 'Día del Padre',
    primary: 'text-blue-700',
    secondary: 'bg-blue-700',
    accent: 'border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    heroBg: 'bg-blue-100',
    emoji: '👔'
  },
  mother: {
    name: 'Día de la Madre',
    primary: 'text-pink-600',
    secondary: 'bg-pink-600',
    accent: 'border-pink-200',
    bg: 'bg-pink-50',
    text: 'text-pink-900',
    heroBg: 'bg-pink-100',
    emoji: '🌸'
  },
  christmas: {
    name: 'Navidad',
    primary: 'text-red-700',
    secondary: 'bg-red-700',
    accent: 'border-green-200',
    bg: 'bg-stone-50',
    text: 'text-red-900',
    heroBg: 'bg-red-50',
    emoji: '🎄'
  },
  women: {
    name: 'Día de la Mujer',
    primary: 'text-purple-600',
    secondary: 'bg-purple-600',
    accent: 'border-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-900',
    heroBg: 'bg-purple-100',
    emoji: '💜'
  },
  easter: {
    name: 'Pascuas',
    primary: 'text-yellow-600',
    secondary: 'bg-yellow-600',
    accent: 'border-yellow-200',
    bg: 'bg-yellow-50',
    text: 'text-yellow-900',
    heroBg: 'bg-yellow-100',
    emoji: '🐰'
  },
  children: {
    name: 'Día del Niño',
    primary: 'text-orange-500',
    secondary: 'bg-orange-500',
    accent: 'border-orange-200',
    bg: 'bg-orange-50',
    text: 'text-orange-900',
    heroBg: 'bg-orange-100',
    emoji: '🎈'
  },
  friend: {
    name: 'Día del Amigo',
    primary: 'text-teal-600',
    secondary: 'bg-teal-600',
    accent: 'border-teal-200',
    bg: 'bg-teal-50',
    text: 'text-teal-900',
    heroBg: 'bg-teal-100',
    emoji: '🤝'
  }
};

export const getTheme = (layout?: SpecialLayout): ThemeConfig => {
  return THEMES[layout || 'default'] || THEMES.default;
};
