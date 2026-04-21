// src/presets/types.ts

export type TokenGroup = 'display' | 'heading' | 'body' | 'label' | 'code' | 'caption' | 'overline';
export type FontFamily = 'heading' | 'body' | 'mono';
export type ColorRole = 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
export type PresetCategory = 'enterprise' | 'web' | 'mobile' | 'modern' | 'custom';

export interface FontSystem {
  heading: string;
  body: string;
  mono: string;
  /** Ordered fallback list if mono font not available in Penpot */
  monoFallbacks: string[];
}

export interface ColorEntry {
  name: string;
  hex: string;
  role: ColorRole;
}

export interface TypeRole {
  /** Token path suffix: "display/2xl", "heading/h1", "body/md", "label/sm", etc. */
  path: string;
  size: number;         // px
  weight: string;       // CSS numeric weight
  lineHeight: number;   // unitless multiplier
  letterSpacing: string; // em value e.g. "-0.025em" or "0em"
  family: FontFamily;
  group: TokenGroup;
}

export interface ShadowConfig {
  name: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  opacity: number;
  inset?: boolean;
}

export interface RadiusConfig {
  name: string;
  value: number;
}

export interface Preset {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: PresetCategory;
  fonts: FontSystem;
  colors: ColorEntry[];
  typeRoles: TypeRole[];
  spacing: number[];
  radii: RadiusConfig[];
  shadows: ShadowConfig[];
}
