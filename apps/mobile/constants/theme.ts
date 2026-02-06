import { Platform } from 'react-native';

import { tokens } from '../../../packages/theme/src/tokens';

export const Colors = tokens.colors;
export const Typography = tokens.typography;
export const Spacing = tokens.spacing;
export const Radius = tokens.radius;
export const Motion = tokens.motion;

export const Shadow = {
  soft: {
    shadowColor: '#050A14',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  micro: {
    shadowColor: '#050A14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: tokens.fonts.body,
    serif: tokens.fonts.display,
    rounded: tokens.fonts.display,
    mono: tokens.fonts.mono,
  },
  default: {
    sans: tokens.fonts.body,
    serif: tokens.fonts.display,
    rounded: tokens.fonts.display,
    mono: tokens.fonts.mono,
  },
  web: {
    sans: tokens.fonts.body,
    serif: tokens.fonts.display,
    rounded: tokens.fonts.display,
    mono: tokens.fonts.mono,
  },
});
