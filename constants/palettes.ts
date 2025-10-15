
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
    name: 'Forest',
    light: {
      primary: '22 163 74' /* green-600 */,
      'primary-content': '255 255 255',
      secondary: '34 197 94' /* green-500 */,
      accent: '20 184 166' /* teal-500 */,
      'text-base': '23 23 23' /* neutral-900 */,
      'text-muted': '82 82 82' /* neutral-600 */,
      'bg-base': '250 250 250' /* neutral-50 */,
      'bg-muted': '245 245 245' /* neutral-100 */,
      'bg-subtle': '229 229 229' /* neutral-200 */,
      border: '212 212 212' /* neutral-300 */,
    },
    dark: {
      primary: '74 222 128' /* green-400 */,
      'primary-content': '23 23 23',
      secondary: '34 197 94' /* green-500 */,
      accent: '45 212 191' /* teal-400 */,
      'text-base': '245 245 245' /* neutral-100 */,
      'text-muted': '163 163 163' /* neutral-400 */,
      'bg-base': '10 10 10' /* neutral-950 */,
      'bg-muted': '23 23 23' /* neutral-900 */,
      'bg-subtle': '38 38 38' /* neutral-800 */,
      border: '64 64 64' /* neutral-700 */,
    },
  },
  {
    name: 'Ocean',
    light: {
      primary: '37 99 235' /* blue-600 */,
      'primary-content': '255 255 255',
      secondary: '59 130 246' /* blue-500 */,
      accent: '6 182 212' /* cyan-500 */,
      'text-base': '23 23 23',
      'text-muted': '82 82 82',
      'bg-base': '248 250 252' /* slate-50 */,
      'bg-muted': '241 245 249' /* slate-100 */,
      'bg-subtle': '226 232 240' /* slate-200 */,
      border: '203 213 225' /* slate-300 */,
    },
    dark: {
      primary: '96 165 250' /* blue-400 */,
      'primary-content': '23 23 23',
      secondary: '59 130 246' /* blue-500 */,
      accent: '34 211 238' /* cyan-400 */,
      'text-base': '241 245 249' /* slate-100 */,
      'text-muted': '148 163 184' /* slate-400 */,
      'bg-base': '2 6 23' /* slate-950 */,
      'bg-muted': '15 23 42' /* slate-900 */,
      'bg-subtle': '30 41 59' /* slate-800 */,
      border: '51 65 85' /* slate-700 */,
    },
  },
  {
    name: 'Sunset',
    light: {
      primary: '234 88 12' /* orange-600 */,
      'primary-content': '255 255 255',
      secondary: '249 115 22' /* orange-500 */,
      accent: '220 38 38' /* red-600 */,
      'text-base': '28 25 23' /* stone-900 */,
      'text-muted': '87 83 78' /* stone-600 */,
      'bg-base': '254 252 251' /* stone-50 */,
      'bg-muted': '245 245 244' /* stone-100 */,
      'bg-subtle': '231 229 228' /* stone-200 */,
      border: '214 211 209' /* stone-300 */,
    },
    dark: {
      primary: '251 146 60' /* orange-400 */,
      'primary-content': '23 23 23',
      secondary: '249 115 22' /* orange-500 */,
      accent: '248 113 113' /* red-400 */,
      'text-base': '245 245 244' /* stone-100 */,
      'text-muted': '168 162 158' /* stone-400 */,
      'bg-base': '12 10 9' /* stone-950 */,
      'bg-muted': '28 25 23' /* stone-900 */,
      'bg-subtle': '41 37 36' /* stone-800 */,
      border: '68 64 60' /* stone-700 */,
    },
  },
  {
    name: 'Amethyst',
    light: {
      primary: '126 34 206' /* purple-700 */,
      'primary-content': '255 255 255',
      secondary: '147 51 234' /* purple-600 */,
      accent: '219 39 119' /* pink-600 */,
      'text-base': '28 25 23',
      'text-muted': '87 83 78',
      'bg-base': '250 250 250',
      'bg-muted': '245 245 245',
      'bg-subtle': '229 229 229',
      border: '212 212 212',
    },
    dark: {
      primary: '167 139 250' /* violet-400 */,
      'primary-content': '23 23 23',
      secondary: '192 132 252' /* fuchsia-400 */,
      accent: '244 114 182' /* pink-400 */,
      'text-base': '245 245 245',
      'text-muted': '163 163 163',
      'bg-base': '10 10 10',
      'bg-muted': '23 23 23',
      'bg-subtle': '38 38 38',
      border: '64 64 64',
    },
  },
];