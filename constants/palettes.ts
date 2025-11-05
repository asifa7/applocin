

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
    name: 'Monochrome',
    light: {
      primary: '10 10 10' /* near black */,
      'primary-content': '255 255 255'  /* white */,
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
      'primary-content': '10 10 10' /* near black */,
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
];