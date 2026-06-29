// O'yin konstantlari
export const MIN_NUMBER = 1;
export const MAX_NUMBER = 90;

export const ROWS = 3;
export const COLS = 9;
export const NUMBERS_PER_ROW = 5;
export const TOTAL_NUMBERS = ROWS * NUMBERS_PER_ROW; // 15

// Har bir ustun uchun raqamlar diapazoni
export const COLUMN_RANGES = [
  { min: 1,  max: 9  },  // 1-ustun
  { min: 10, max: 19 },  // 2-ustun
  { min: 20, max: 29 },  // 3-ustun
  { min: 30, max: 39 },  // 4-ustun
  { min: 40, max: 49 },  // 5-ustun
  { min: 50, max: 59 },  // 6-ustun
  { min: 60, max: 69 },  // 7-ustun
  { min: 70, max: 79 },  // 8-ustun
  { min: 80, max: 90 },  // 9-ustun
];

// O'yin turlari
export const GAME_MODES = {
  SIMPLE: 'simple',     // Oddiy - qo'lda chiqarish
  FAST: 'fast',         // Tezkor - avtomatik 5s
};

export const FAST_DRAW_INTERVAL = 5000; // 5 soniya

// Yutuq darajalari
export const WIN_TYPES = {
  NONE: 'none',
  ROW: 'row',           // 1 ta qator to'lgan
  TWO_ROWS: 'two_rows', // 2 ta qator to'lgan
  FULL_HOUSE: 'full_house', // Barcha 15 raqam yopilgan
};

// Ranglar palitrasi
export const COLORS = {
  BG_DARK: '#1A1A2E',
  BG_MEDIUM: '#16213E',
  BG_CARD: '#0F3460',
  GOLD: '#FFD700',
  GREEN: '#4CAF50',
  RED: '#E53935',
  WHITE: '#FFFFFF',
  GRAY: '#9E9E9E',
  LIGHT_GRAY: '#BDBDBD',
  DARK_GRAY: '#424242',
  ORANGE: '#FF9800',
  BLUE_ACCENT: '#2196F3',
  CELL_EMPTY: '#2C2C54',
  CELL_MARKED: '#4CAF50',
  CELL_UNMARKED: '#3D3D6B',
};

// Storage kalitlari
export const STORAGE_KEYS = {
  STATS: '@loto_stats',
  SETTINGS: '@loto_settings',
  LAST_GAME: '@loto_last_game',
};

// Standart sozlamalar
export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  vibrationEnabled: true,
  language: 'uz',
  fastDrawInterval: 5000,
  cardCount: 1,
};
