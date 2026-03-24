// src/presets/data.ts - Unit Two Data v217 (Accessibility Refined)

export interface TypographyRole {
    name: string;
    size: number;
    weight: string;
    category: 'heading' | 'body' | 'mono' | 'ui';
}

export interface PresetDefaults {
    fonts: {
        heading: string;
        body: string;
        mono: string;
    };
    colors: { name: string; hex: string }[];
}

export interface ShadowDef {
    name: string;
    x: number;
    y: number;
    blur: number;
    spread: number;
    opacity: number;
}

export interface Preset {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: 'enterprise' | 'web' | 'mobile' | 'modern';
    typography: {
        roles: TypographyRole[];
    };
    defaults: PresetDefaults;
    spacing: number[];
    radii: { name: string; value: number }[];
    shadows: ShadowDef[];
    borderWidths?: { name: string; value: number }[];
    opacities?: { name: string; value: number }[];
}

export const PRESETS: Preset[] = [
    {
        id: "custom-empty",
        name: "Custom / Start from Scratch",
        icon: "🎨",
        description: "Define your own scales, typography, and colors from zero.",
        category: 'modern',
        typography: {
            roles: [
                { name: "Display", size: 48, weight: "700", category: "heading" },
                { name: "Heading", size: 32, weight: "600", category: "heading" },
                { name: "Body", size: 16, weight: "400", category: "body" },
                { name: "Caption", size: 12, weight: "400", category: "body" }
            ]
        },
        defaults: {
            fonts: { heading: "Inter", body: "Inter", mono: "Inter" },
            colors: [
                { name: "Background", hex: "#FFFFFF" },
                { name: "Foreground", hex: "#000000" },
                { name: "Primary", hex: "#2563EB" }
            ]
        },
        spacing: [0, 4, 8, 12, 16, 24, 32, 48, 64],
        radii: [ { name: "None", value: 0 }, { name: "Small", value: 4 }, { name: "Medium", value: 8 }, { name: "Full", value: 9999 } ],
        shadows: [ { name: "Default", x: 0, y: 2, blur: 4, spread: 0, opacity: 0.1 } ]
    },
    {
        id: "material-3",
        name: "Material Design 3",
        icon: "🤖",
        description: "Google's expressive system with tonal palettes.",
        category: 'mobile',
        typography: {
            roles: [
                { name: "Display/Large", size: 57, weight: "400", category: "heading" },
                { name: "Headline/Medium", size: 28, weight: "400", category: "heading" },
                { name: "Title/Medium", size: 16, weight: "500", category: "heading" },
                { name: "Label/Medium", size: 12, weight: "500", category: "ui" },
                { name: "Body/Large", size: 16, weight: "400", category: "body" }
            ]
        },
        defaults: {
            fonts: { heading: "Roboto", body: "Roboto", mono: "Roboto Mono" },
            colors: [
                { name: "Primary", hex: "#6750A4" }, { name: "Secondary", hex: "#625B71" },
                { name: "Background", hex: "#FFFBFE" }, { name: "Foreground", hex: "#1C1B1F" },
                { name: "Success", hex: "#1D6D1F" }, { name: "Warning", hex: "#8F4E00" },
                { name: "Error", hex: "#B3261E" }, { name: "Info", hex: "#00639B" }
            ]
        },
        spacing: [0, 4, 8, 12, 16, 24, 32, 48, 64],
        radii: [
            { name: "None", value: 0 }, { name: "XS", value: 4 }, { name: "SM", value: 8 },
            { name: "MD", value: 12 }, { name: "LG", value: 16 }, { name: "Full", value: 9999 }
        ],
        shadows: [
            { name: "Level 1", x: 0, y: 1, blur: 3, spread: 1, opacity: 0.15 },
            { name: "Level 2", x: 0, y: 2, blur: 6, spread: 2, opacity: 0.15 }
        ]
    },
    {
        id: "apple-hig",
        name: "Apple HIG",
        icon: "🍎",
        description: "The adaptive standard for iOS/macOS.",
        category: 'mobile',
        typography: {
            roles: [
                { name: "Large Title", size: 34, weight: "400", category: "heading" },
                { name: "Headline", size: 17, weight: "600", category: "heading" },
                { name: "Body", size: 17, weight: "400", category: "body" },
                { name: "Caption", size: 12, weight: "400", category: "body" }
            ]
        },
        defaults: {
            fonts: { heading: "SF Pro Display", body: "SF Pro Text", mono: "SF Mono" },
            colors: [
                { name: "Primary", hex: "#0071FF" }, { name: "Secondary", hex: "#5856D6" },
                { name: "Background", hex: "#FFFFFF" }, { name: "Foreground", hex: "#000000" },
                { name: "Success", hex: "#248A3D" }, { name: "Error", hex: "#FF3B30" },
                { name: "Warning", hex: "#C97B00" }, { name: "Info", hex: "#0071E3" }
            ]
        },
        spacing: [0, 4, 8, 12, 16, 20, 32, 40],
        radii: [ { name: "SM", value: 6 }, { name: "MD", value: 10 }, { name: "LG", value: 20 } ],
        shadows: [ { name: "Standard", x: 0, y: 2, blur: 10, spread: 0, opacity: 0.1 } ]
    },
    {
        id: "shopify-polaris",
        name: "Shopify Polaris",
        icon: "🛍️",
        description: "Merchant-focused system for e-commerce.",
        category: 'enterprise',
        typography: {
            roles: [
                { name: "Display/LG", size: 24, weight: "600", category: "heading" },
                { name: "Heading/MD", size: 20, weight: "600", category: "heading" },
                { name: "Body/MD", size: 16, weight: "400", category: "body" },
                { name: "Caption", size: 12, weight: "400", category: "body" }
            ]
        },
        defaults: {
            fonts: { heading: "Inter", body: "Inter", mono: "JetBrains Mono" },
            colors: [
                { name: "Primary", hex: "#008060" }, { name: "Background", hex: "#FFFFFF" },
                { name: "Foreground", hex: "#202223" }, { name: "Success", hex: "#008060" },
                { name: "Error", hex: "#D82C0D" }, { name: "Warning", hex: "#916A00" }
            ]
        },
        spacing: [0, 4, 8, 12, 16, 20, 24, 32],
        radii: [ { name: "XS", value: 2 }, { name: "SM", value: 4 }, { name: "MD", value: 8 }, { name: "Full", value: 9999 } ],
        shadows: [ { name: "Shadow 1", x: 0, y: 2, blur: 1, spread: -1, opacity: 0.2 } ]
    },
    {
        id: "untitled-ui",
        name: "Untitled UI",
        icon: "✨",
        description: "Modern, clean, and highly flexible Figma standard.",
        category: 'modern',
        typography: {
            roles: [
                { name: "Display/MD", size: 48, weight: "700", category: "heading" },
                { name: "Heading/LG", size: 30, weight: "600", category: "heading" },
                { name: "Body/MD", size: 16, weight: "400", category: "body" },
                { name: "Body/SM", size: 14, weight: "400", category: "body" }
            ]
        },
        defaults: {
            fonts: { heading: "Inter", body: "Inter", mono: "Fira Code" },
            colors: [
                { name: "Primary", hex: "#7C3AED" }, { name: "Gray", hex: "#475467" },
                { name: "Background", hex: "#FFFFFF" }, { name: "Foreground", hex: "#101828" },
                { name: "Success", hex: "#079455" }, { name: "Error", hex: "#D92D20" },
                { name: "Warning", hex: "#B54708" }, { name: "Info", hex: "#1570EF" }
            ]
        },
        spacing: [0, 4, 8, 12, 16, 24, 32, 48],
        radii: [ { name: "SM", value: 4 }, { name: "MD", value: 8 }, { name: "LG", value: 12 }, { name: "Full", value: 9999 } ],
        shadows: [ { name: "Shadow MD", x: 0, y: 4, blur: 8, spread: -2, opacity: 0.1 } ]
    },
    {
        id: "atlassian",
        name: "Atlassian",
        icon: "🟦",
        description: "Enterprise-grade collaboration system.",
        category: 'enterprise',
        typography: {
            roles: [
                { name: "Heading/XL", size: 29, weight: "600", category: "heading" },
                { name: "Heading/MD", size: 20, weight: "600", category: "heading" },
                { name: "Body/Default", size: 14, weight: "400", category: "body" }
            ]
        },
        defaults: {
            fonts: { heading: "Inter", body: "Inter", mono: "SF Mono" },
            colors: [
                { name: "Primary", hex: "#0052CC" }, { name: "Background", hex: "#FFFFFF" },
                { name: "Foreground", hex: "#172B4D" }, { name: "Success", hex: "#1D7F4D" },
                { name: "Error", hex: "#D7371F" }, { name: "Warning", hex: "#974F0C" },
                { name: "Info", hex: "#0052CC" }
            ]
        },
        spacing: [0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80],
        radii: [ { name: "SM", value: 3 }, { name: "MD", value: 6 }, { name: "LG", value: 10 } ],
        shadows: [ { name: "Raised", x: 0, y: 2, blur: 4, spread: 0, opacity: 0.1 } ]
    },
    {
        id: "microsoft-fluent",
        name: "Microsoft Fluent",
        icon: "🪟",
        description: "Adaptive design for Windows and beyond.",
        category: 'web',
        typography: {
            roles: [
                { name: "Title/Large", size: 40, weight: "600", category: "heading" },
                { name: "Subtitle/MD", size: 20, weight: "600", category: "heading" },
                { name: "Body/MD", size: 14, weight: "400", category: "body" }
            ]
        },
        defaults: {
            fonts: { heading: "Segoe UI", body: "Segoe UI", mono: "Cascadia Code" },
            colors: [
                { name: "Brand", hex: "#0078D4" }, { name: "Background", hex: "#FFFFFF" },
                { name: "Foreground", hex: "#242424" }, { name: "Success", hex: "#107C10" },
                { name: "Error", hex: "#A4262C" }, { name: "Warning", hex: "#9F6B00" }
            ]
        },
        spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40],
        radii: [ { name: "SM", value: 2 }, { name: "MD", value: 4 }, { name: "LG", value: 6 }, { name: "Full", value: 9999 } ],
        shadows: [ { name: "Shadow 8", x: 0, y: 4, blur: 8, spread: 0, opacity: 0.14 } ]
    },
    {
        id: "github-primer",
        name: "GitHub Primer",
        icon: "🐙",
        description: "The system powering the world's code.",
        category: 'web',
        typography: {
            roles: [
                { name: "Display/MD", size: 32, weight: "600", category: "heading" },
                { name: "Title/MD", size: 20, weight: "600", category: "heading" },
                { name: "Body/MD", size: 14, weight: "400", category: "body" }
            ]
        },
        defaults: {
            fonts: { heading: "Inter", body: "Inter", mono: "SFMono-Regular" },
            colors: [
                { name: "Accent", hex: "#0969DA" }, { name: "Background", hex: "#FFFFFF" },
                { name: "Foreground", hex: "#1F2328" }, { name: "Success", hex: "#1A7F37" },
                { name: "Error", hex: "#D1242F" }, { name: "Warning", hex: "#9A6700" }
            ]
        },
        spacing: [0, 4, 8, 16, 24, 32, 40, 48],
        radii: [ { name: "SM", value: 3 }, { name: "MD", value: 6 }, { name: "LG", value: 12 }, { name: "Full", value: 9999 } ],
        shadows: [ { name: "Medium", x: 0, y: 3, blur: 6, spread: 0, opacity: 0.15 } ]
    },
    {
        id: "salesforce-lightning",
        name: "Salesforce Lightning",
        icon: "⚡",
        description: "The standard for enterprise CRM experiences.",
        category: 'enterprise',
        typography: {
            roles: [
                { name: "Heading/LG", size: 32, weight: "400", category: "heading" },
                { name: "Heading/MD", size: 20, weight: "400", category: "heading" },
                { name: "Body/MD", size: 14, weight: "400", category: "body" }
            ]
        },
        defaults: {
            fonts: { heading: "Salesforce Sans", body: "Salesforce Sans", mono: "Monaco" },
            colors: [
                { name: "Brand", hex: "#0176D3" }, { name: "Background", hex: "#FFFFFF" },
                { name: "Foreground", hex: "#181818" }, { name: "Success", hex: "#2E844A" },
                { name: "Error", hex: "#EA001E" }, { name: "Warning", hex: "#8B5C00" }
            ]
        },
        spacing: [0, 2, 4, 8, 12, 16, 20, 24, 32, 48],
        radii: [ { name: "SM", value: 2 }, { name: "MD", value: 4 }, { name: "LG", value: 8 } ],
        shadows: [ { name: "Low", x: 0, y: 2, blur: 2, spread: 0, opacity: 0.1 } ]
    },
    {
        id: "adobe-spectrum",
        name: "Adobe Spectrum",
        icon: "🧱",
        description: "Adaptive, accessible system for creative tools.",
        category: 'modern',
        typography: {
            roles: [
                { name: "Display/LG", size: 36, weight: "700", category: "heading" },
                { name: "Heading/MD", size: 20, weight: "700", category: "heading" },
                { name: "Body/MD", size: 14, weight: "400", category: "body" }
            ]
        },
        defaults: {
            fonts: { heading: "Adobe Clean", body: "Adobe Clean", mono: "Source Code Pro" },
            colors: [
                { name: "Accent", hex: "#0265DC" }, { name: "Background", hex: "#FFFFFF" },
                { name: "Foreground", hex: "#222222" }, { name: "Success", hex: "#12805C" },
                { name: "Error", hex: "#D31510" }, { name: "Warning", hex: "#936300" }
            ]
        },
        spacing: [0, 4, 8, 16, 24, 32, 40, 48, 64, 80],
        radii: [ { name: "SM", value: 2 }, { name: "MD", value: 4 }, { name: "Full", value: 9999 } ],
        shadows: [ { name: "Shadow 100", x: 0, y: 1, blur: 4, spread: 0, opacity: 0.15 } ]
    },
    {
        id: "uber-base",
        name: "Uber Base",
        icon: "🚗",
        description: "Structured system for global movement.",
        category: 'modern',
        typography: {
            roles: [
                { name: "Display/LG", size: 44, weight: "700", category: "heading" },
                { name: "Heading/MD", size: 24, weight: "700", category: "heading" },
                { name: "Body/MD", size: 16, weight: "400", category: "body" }
            ]
        },
        defaults: {
            fonts: { heading: "Uber Move", body: "Uber Move Text", mono: "Uber Move Mono" },
            colors: [
                { name: "Accent", hex: "#276EF1" }, { name: "Background", hex: "#FFFFFF" },
                { name: "Foreground", hex: "#000000" }, { name: "Success", hex: "#05A357" },
                { name: "Error", hex: "#E11900" }, { name: "Warning", hex: "#966A00" }
            ]
        },
        spacing: [0, 4, 8, 12, 16, 24, 32, 48, 64],
        radii: [ { name: "SM", value: 4 }, { name: "MD", value: 8 }, { name: "LG", value: 12 }, { name: "Full", value: 9999 } ],
        shadows: [ { name: "Elevation 100", x: 0, y: 2, blur: 4, spread: 0, opacity: 0.1 } ]
    },
    {
        id: "ant-design",
        name: "Ant Design",
        icon: "🐜",
        description: "Enterprise-level UI design language.",
        category: 'enterprise',
        typography: {
            roles: [
                { name: "Heading/H1", size: 38, weight: "600", category: "heading" },
                { name: "Heading/H3", size: 24, weight: "600", category: "heading" },
                { name: "Text/Base", size: 14, weight: "400", category: "body" }
            ]
        },
        defaults: {
            fonts: { heading: "Inter", body: "Inter", mono: "Roboto Mono" },
            colors: [
                { name: "Primary", hex: "#1677FF" }, { name: "Background", hex: "#FFFFFF" },
                { name: "Foreground", hex: "#000000" }, { name: "Success", hex: "#389E0D" },
                { name: "Error", hex: "#CF1322" }, { name: "Warning", hex: "#D48806" }
            ]
        },
        spacing: [0, 4, 8, 12, 16, 20, 24, 32, 48],
        radii: [ { name: "SM", value: 2 }, { name: "MD", value: 4 }, { name: "LG", value: 6 }, { name: "XL", value: 8 } ],
        shadows: [ { name: "Low", x: 0, y: 2, blur: 8, spread: 0, opacity: 0.15 } ]
    },
    {
        id: "pinterest-gestalt",
        name: "Pinterest Gestalt",
        icon: "📌",
        description: "Consistency and accessibility for visual discovery.",
        category: 'modern',
        typography: {
            roles: [
                { name: "Heading/600", size: 36, weight: "600", category: "heading" },
                { name: "Heading/400", size: 20, weight: "600", category: "heading" },
                { name: "Body/300", size: 16, weight: "400", category: "body" }
            ]
        },
        defaults: {
            fonts: { heading: "Inter", body: "Inter", mono: "SF Mono" },
            colors: [
                { name: "Brand", hex: "#E60023" }, { name: "Background", hex: "#FFFFFF" },
                { name: "Foreground", hex: "#111111" }, { name: "Success", hex: "#008744" },
                { name: "Error", hex: "#CC0000" }, { name: "Warning", hex: "#A35200" }
            ]
        },
        spacing: [0, 4, 8, 12, 16, 24, 32, 48],
        radii: [ { name: "100", value: 4 }, { name: "200", value: 8 }, { name: "300", value: 12 }, { name: "Full", value: 9999 } ],
        shadows: [ { name: "Floating", x: 0, y: 0, blur: 8, spread: 0, opacity: 0.1 } ]
    }
];
