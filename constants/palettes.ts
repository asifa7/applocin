
export type ColorTheme = {
  primary: string;
  'primary-content': string;
  secondary: string;
  accent: string;
  'text-base': string;
  'text-muted': string;
  'bg-base': string;
  'bg-muted': string;
  'bg-subtle': string;
  border: string;
};

export type Palette = {
  name: string;
  light: ColorTheme;
  dark: ColorTheme;
};

// RGB values as strings: "R G B"
export const palettes: Palette[] = [
  {
    name: 'Mono Light',
    light: {
      primary: '23 23 23' /* neutral-900 */,
      'primary-content': '255 255 255',
      secondary: '82 82 82' /* neutral-600 */,
      accent: '115 115 115' /* neutral-500 */,
      'text-base': '10 10 10' /* near black */,
      'text-muted': '82 82 82' /* neutral-600 */,
      'bg-base': '255 255 255' /* white */,
      'bg-muted': '245 245 245' /* neutral-100 */,
      'bg-subtle': '229 229 229' /* neutral-200 */,
      border: '212 212 212' /* neutral-300 */,
    },
    dark: {
      primary: '245 245 245' /* neutral-100 */,
      'primary-content': '10 10 10',
      secondary: '163 163 163' /* neutral-400 */,
      accent: '115 115 115' /* neutral-500 */,
      'text-base': '245 245 245' /* neutral-100 */,
      'text-muted': '163 163 163' /* neutral-400 */,
      'bg-base': '10 10 10' /* near black */,
      'bg-muted': '23 23 23' /* neutral-900 */,
      'bg-subtle': '38 38 38' /* neutral-800 */,
      border: '64 64 64' /* neutral-700 */,
    },
  },
  {
    name: 'Mono Dark',
    light: {
      primary: '245 245 245' /* neutral-100 */,
      'primary-content': '10 10 10',
      secondary: '163 163 163' /* neutral-400 */,
      accent: '115 115 115' /* neutral-500 */,
      'text-base': '245 245 245' /* neutral-100 */,
      'text-muted': '163 163 163' /* neutral-400 */,
      'bg-base': '10 10 10' /* near black */,
      'bg-muted': '23 23 23' /* neutral-900 */,
      'bg-subtle': '38 38 38' /* neutral-800 */,
      border: '64 64 64' /* neutral-700 */,
    },
    dark: {
      primary: '245 245 245' /* neutral-100 */,
      'primary-content': '10 10 10',
      secondary: '163 163 163' /* neutral-400 */,
      accent: '115 115 115' /* neutral-500 */,
      'text-base': '245 245 245' /* neutral-100 */,
      'text-muted': '163 163 163' /* neutral-400 */,
      'bg-base': '10 10 10' /* near black */,
      'bg-muted': '23 23 23' /* neutral-900 */,
      'bg-subtle': '38 38 38' /* neutral-800 */,
      border: '64 64 64' /* neutral-700 */,
    },
  },
  {
    name: 'Midnight',
    light: {
      primary: '59 130 246' /* blue-500 */,
      'primary-content': '255 255 255',
      secondary: '168 85 247' /* purple-500 */,
      accent: '20 184 166' /* teal-500 */,
      'text-base': '10 10 10',
      'text-muted': '82 82 82',
      'bg-base': '255 255 255',
      'bg-muted': '245 245 245',
      'bg-subtle': '229 229 229',
      border: '212 212 212',
    },
    dark: {
      primary: '96 165 250' /* blue-400 */,
      'primary-content': '23 23 23',
      secondary: '192 132 252' /* purple-400 */,
      accent: '45 212 191' /* teal-400 */,
      'text-base': '245 245 245',
      'text-muted': '163 163 163',
      'bg-base': '10 10 10',
      'bg-muted': '23 23 23',
      'bg-subtle': '38 38 38',
      border: '64 64 64',
    },
  },
  {
    name: 'Daylight',
    light: {
      primary: '14 165 233' /* sky-500 */,
      'primary-content': '255 255 255',
      secondary: '234 179 8' /* yellow-500 */,
      accent: '34 197 94' /* green-500 */,
      'text-base': '10 10 10',
      'text-muted': '82 82 82',
      'bg-base': '255 255 255',
      'bg-muted': '245 245 245',
      'bg-subtle': '229 229 229',
      border: '212 212 212',
    },
    dark: {
      primary: '56 189 248' /* sky-400 */,
      'primary-content': '23 23 23',
      secondary: '250 204 21' /* yellow-400 */,
      accent: '74 222 128' /* green-400 */,
      'text-base': '245 245 245',
      'text-muted': '163 163 163',
      'bg-base': '10 10 10',
      'bg-muted': '23 23 23',
      'bg-subtle': '38 38 38',
      border: '64 64 64',
    },
  },
];
