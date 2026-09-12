// Design tokens ported from the "Industry" design system
// (project/_ds/industry-ad04d498-0155-4162-9e42-85c5597eb5a1/styles.css).
// A wireframe system: steel-blue accent on a light technical ground,
// Barlow Condensed headings over Barlow body text, square corners with
// "+" registration marks on cards/figures/the primary button.

export const color = {
  bg: '#f2f2f3',
  surface: '#e9e9ea',
  text: '#1d1f20',
  accent: '#5980a6',
  accent2: '#728fab',
  divider: 'rgba(29,31,32,0.16)',

  neutral100: '#f5f5f8',
  neutral200: '#e7e7ea',
  neutral300: '#d4d4d7',
  neutral400: '#b7b7ba',
  neutral500: '#98989b',
  neutral600: '#7a7a7d',
  neutral700: '#5d5d60',
  neutral800: '#424244',
  neutral900: '#2b2b2d',

  accent100: '#eef6ff',
  accent200: '#d6ebff',
  accent300: '#b5d9fd',
  accent400: '#94bce3',
  accent500: '#749dc4',
  accent600: '#597ea3',
  accent700: '#416180',
  accent800: '#2c455d',
  accent900: '#1d2d3d',

  warn: '#a8562f',
  warnBg: 'rgba(168,86,47,0.05)',
  white: '#ffffff',
};

export const font = {
  heading: 'BarlowCondensed_600SemiBold',
  headingRegular: 'BarlowCondensed_400Regular',
  body: 'Barlow_400Regular',
  bodyMedium: 'Barlow_500Medium',
  bodySemiBold: 'Barlow_600SemiBold',
  bodyBold: 'Barlow_700Bold',
};

export const space = {
  s1: 3,
  s2: 7,
  s3: 10,
  s4: 14,
  s6: 20,
  s8: 27,
};

export const shadow = {
  sm: {
    shadowColor: '#2b2b2d',
    shadowOpacity: 0.14,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: '#2b2b2d',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  lg: {
    shadowColor: '#2b2b2d',
    shadowOpacity: 0.22,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
};

export {
  BarlowCondensed_400Regular,
  BarlowCondensed_600SemiBold,
} from '@expo-google-fonts/barlow-condensed';
export {
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
  Barlow_700Bold,
} from '@expo-google-fonts/barlow';

