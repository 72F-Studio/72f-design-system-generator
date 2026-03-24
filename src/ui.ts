// src/ui.ts - Unit Two UI Logic v221 (Custom Architecture)
import { PRESETS, Preset } from './presets/data';
import { getContrastRatio, getWCAGLevel, ensureContrast } from './utils/accessibility';

const presetSelect = document.getElementById('preset-select') as HTMLSelectElement;
const foundationsThemeView = document.getElementById('foundations-theme-view') as HTMLElement;
const foundationsSetContainer = document.getElementById('foundations-set-container') as HTMLDivElement;
const customSetContainer = document.getElementById('custom-set-container') as HTMLDivElement;
const activeThemeNameDisplay = document.getElementById('active-theme-name') as HTMLSpanElement;
const customThemeNameInput = document.getElementById('custom-theme-name') as HTMLInputElement;
const addCustomSetBtn = document.getElementById('add-custom-set-btn') as HTMLButtonElement;
const commitBtn = document.getElementById('commit-btn') as HTMLButtonElement;
const summaryEl = document.getElementById('summary') as HTMLDivElement;

const spacingSummary = document.getElementById('spacing-summary') as HTMLSpanElement;
const radiiSummary = document.getElementById('radii-summary') as HTMLSpanElement;
const shadowsSummary = document.getElementById('shadows-summary') as HTMLSpanElement;

const setTemplate = document.getElementById('set-template') as HTMLTemplateElement;
const fontTemplate = document.getElementById('font-row') as HTMLTemplateElement;
const colorTemplate = document.getElementById('color-row') as HTMLTemplateElement;

let availableFonts: string[] = [];
let selectedPreset: Preset | null = null;
let activeGeneratorTab: 'foundations' | 'architect' = 'foundations';

// ── TABS LOGIC ────────────────────────────────────────────────────────
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.onclick = () => {
        const target = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${target}`)?.classList.add('active');
    };
});

// ── SUB-TABS LOGIC ────────────────────────────────────────────────────
const subTabBtns = document.querySelectorAll('.sub-tab-btn');
const subTabContents = document.querySelectorAll('.sub-tab-content');

subTabBtns.forEach(btn => {
    btn.onclick = () => {
        const target = btn.getAttribute('data-sub-tab') as 'foundations' | 'architect';
        activeGeneratorTab = target;
        subTabBtns.forEach(b => b.classList.remove('active'));
        subTabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`sub-tab-${target}`)?.classList.add('active');
        updateSummary();
    };
});

// ── LOG TOGGLE ────────────────────────────────────────────────────────
const logContainer = document.getElementById('log-container') as HTMLDivElement;
const toggleLogBtn = document.getElementById('toggle-log') as HTMLButtonElement;
logContainer.classList.add('hidden'); // Hide by default

toggleLogBtn.onclick = () => {
    logContainer.classList.toggle('hidden');
};

function log(msg: string, level: 'info' | 'error' | 'success' | 'system' = 'info') {
    const logContainer = document.getElementById('log-container');
    if (logContainer) {
        const div = document.createElement('div');
        div.className = `log-entry log-${level}`;
        div.textContent = `> ${msg}`;
        logContainer.prepend(div);
    }
}

function hexToName(hex: string): string {
    const hexClean = hex.replace("#", "");
    const r = parseInt(hexClean.substr(0, 2), 16) || 0;
    const g = parseInt(hexClean.substr(2, 2), 16) || 0;
    const b = parseInt(hexClean.substr(4, 2), 16) || 0;
    if (r === g && g === b) return r < 50 ? "Black" : (r > 200 ? "White" : "Gray");
    if (r > g && r > b) return "Red";
    if (g > r && g > b) return "Green";
    if (b > r && b > g) return "Blue";
    return "Accent";
}

// ── GENERATOR LOGIC ───────────────────────────────────────────────────
function initPresets() {
    presetSelect.innerHTML = '<option value="">Select Foundation...</option>';
    const categories: Record<string, string> = {
        'enterprise': 'Enterprise Systems',
        'web': 'Web & Cloud',
        'mobile': 'Mobile First',
        'modern': 'Modern Figma-First'
    };

    Object.entries(categories).forEach(([id, label]) => {
        const group = document.createElement('optgroup');
        group.label = label;
        PRESETS.filter(p => p.category === id).forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = (p.icon || "🏛️") + " " + p.name;
            group.appendChild(opt);
        });
        if (group.children.length > 0) presetSelect.appendChild(group);
    });

    presetSelect.onchange = () => {
        selectedPreset = PRESETS.find(p => p.id === presetSelect.value) || null;
        if (selectedPreset) {
            foundationsThemeView.classList.remove('hidden');
            activeThemeNameDisplay.textContent = `${selectedPreset.name} Theme`;
            foundationsSetContainer.innerHTML = "";
            createSetBlock(foundationsSetContainer, "Light Semantic Set", "light");
            createSetBlock(foundationsSetContainer, "Dark Semantic Set", "dark");
        } else {
            foundationsThemeView.classList.add('hidden');
        }
        updateSummary();
    };
}

function createSetBlock(container: HTMLDivElement, name = "New Set", mode: 'light' | 'dark' | 'custom' = 'light') {
    const clone = setTemplate.content.cloneNode(true) as HTMLElement;
    const block = clone.querySelector('.set-block') as HTMLDivElement;
    const nameInput = block.querySelector('.set-name-input') as HTMLInputElement;
    const fontList = block.querySelector('.font-list-container') as HTMLDivElement;
    const colorList = block.querySelector('.color-list-container') as HTMLDivElement;
    const addFontBtn = block.querySelector('.add-font-btn') as HTMLButtonElement;
    const addColorBtn = block.querySelector('.add-color-btn') as HTMLButtonElement;
    const removeBtn = block.querySelector('.remove-btn') as HTMLButtonElement;

    nameInput.value = name;
    
    const refreshSetContrast = () => {
        const rows = Array.from(colorList.querySelectorAll('.dynamic-row'));
        const bgRow = rows.find(r => (r.querySelector('.name-input') as HTMLInputElement).value.toLowerCase().includes('background'));
        const bgHex = bgRow ? (bgRow.querySelector('.picker') as HTMLInputElement).value : "#ffffff";

        rows.forEach(row => {
            const picker = row.querySelector('.picker') as HTMLInputElement;
            const badge = row.querySelector('.contrast-badge') as HTMLElement;
            if (!badge) return;
            if (row === bgRow) {
                const ratio = getContrastRatio(picker.value, "#ffffff");
                badge.textContent = `BG (${ratio.toFixed(1)}:1)`;
                badge.style.opacity = '0.4';
                return;
            }
            const ratio = getContrastRatio(picker.value, bgHex);
            const level = getWCAGLevel(ratio);
            badge.textContent = `${level} (${ratio.toFixed(1)}:1)`;
            badge.style.color = level === 'Fail' ? '#dc2626' : '#059669';
            badge.style.opacity = '1';
        });
    };

    addFontBtn.onclick = () => createFontRow(fontList);
    addColorBtn.onclick = () => {
        createColorRow(colorList, "", "#3b82f6", refreshSetContrast);
        refreshSetContrast();
    };
    removeBtn.onclick = () => { block.remove(); updateSummary(); };

    // Initial population (Only if using Presets)
    if (selectedPreset && activeGeneratorTab === 'foundations') {
        Object.entries(selectedPreset.defaults.fonts).forEach(([role, family]) => createFontRow(fontList, role, family));
        let bgHex = (mode === 'dark') ? "#111111" : (selectedPreset.defaults.colors.find(c => c.name.toLowerCase().includes('background'))?.hex || "#ffffff");
        const colors = [...selectedPreset.defaults.colors];
        const hasColor = (n: string) => colors.some(c => c.name.toLowerCase().includes(n));
        const primary = colors.find(c => c.name.toLowerCase().includes('primary') || c.name.toLowerCase().includes('brand'))?.hex || '#3B82F6';
        if (!hasColor('success')) colors.push({ name: 'Success', hex: '#10B981' });
        if (!hasColor('error')) colors.push({ name: 'Error', hex: '#EF4444' });
        if (!hasColor('warning')) colors.push({ name: 'Warning', hex: '#F59E0B' });
        if (!hasColor('info')) colors.push({ name: 'Info', hex: '#3B82F6' });
        if (!hasColor('link')) colors.push({ name: 'Link', hex: primary });

        colors.forEach(c => {
            let fHex = c.name.toLowerCase().includes('background') ? bgHex : (c.name.toLowerCase().includes('foreground') ? (mode === 'dark' ? "#eeeeee" : "#111111") : ensureContrast(c.hex, bgHex));
            createColorRow(colorList, c.name, fHex, refreshSetContrast);
        });
        setTimeout(refreshSetContrast, 100);
    }

    container.appendChild(block);
    updateSummary();
}

function createFontRow(container: HTMLDivElement, role = "body", val = "") {
    const clone = fontTemplate.content.cloneNode(true) as HTMLElement;
    const row = clone.querySelector('.dynamic-row-container') as HTMLElement;
    const select = row.querySelector('.font-select') as HTMLSelectElement;
    const roleSelect = row.querySelector('.role-select') as HTMLSelectElement;
    const removeBtn = row.querySelector('.remove-btn') as HTMLButtonElement;
    roleSelect.value = role;
    const populate = () => {
        select.innerHTML = '<option value="">Select...</option>';
        availableFonts.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f; opt.textContent = f;
            if (f === val) opt.selected = true;
            select.appendChild(opt);
        });
    };
    populate();
    removeBtn.onclick = () => { row.remove(); updateSummary(); };
    select.onchange = () => updateSummary();
    container.appendChild(row);
}

function createColorRow(container: HTMLDivElement, name = "", hex = "#3b82f6", onUpdate?: () => void) {
    const clone = colorTemplate.content.cloneNode(true) as HTMLElement;
    const row = clone.querySelector('.dynamic-row') as HTMLElement;
    const picker = row.querySelector('.picker') as HTMLInputElement;
    const input = row.querySelector('.name-input') as HTMLInputElement;
    const removeBtn = row.querySelector('.remove-btn') as HTMLButtonElement;
    const contrastBadge = document.createElement('span');
    contrastBadge.className = 'contrast-badge';
    row.insertBefore(contrastBadge, removeBtn);
    picker.value = hex; input.value = name;
    removeBtn.onclick = () => { row.remove(); updateSummary(); if (onUpdate) onUpdate(); };
    input.oninput = () => { updateSummary(); if (onUpdate) onUpdate(); };
    picker.oninput = () => {
        updateSummary();
        if (onUpdate) onUpdate();
    };
    container.appendChild(row);
}

addCustomSetBtn.onclick = () => createSetBlock(customSetContainer, "New Set", "custom");

function updateSummary() {
    if (activeGeneratorTab === 'foundations') {
        if (!selectedPreset) { summaryEl.textContent = "Select foundation..."; commitBtn.disabled = true; return; }
        summaryEl.textContent = `${selectedPreset.name} Ready.`;
        commitBtn.disabled = false;
    } else {
        const sets = customSetContainer.querySelectorAll('.set-block').length;
        summaryEl.textContent = `Custom Architect | ${sets} Sets Ready.`;
        commitBtn.disabled = sets === 0;
    }
}

function applyTypeScale(preset: Preset): Preset {
    const scale = parseFloat((document.getElementById('type-scale-select') as HTMLSelectElement).value);
    const baseSize = 16;
    const roles = [...preset.typography.roles];
    roles.forEach(r => {
        if (r.name === 'Caption') r.size = Math.round(baseSize / scale);
        if (r.name === 'Body') r.size = baseSize;
        if (r.name === 'Heading') r.size = Math.round(baseSize * Math.pow(scale, 2));
        if (r.name === 'Display') r.size = Math.round(baseSize * Math.pow(scale, 4));
    });
    return { ...preset, typography: { roles } };
}

commitBtn.onclick = () => {
    let finalPreset = activeGeneratorTab === 'foundations' ? selectedPreset! : PRESETS[0]; // Use custom-empty as base
    if (activeGeneratorTab === 'architect') finalPreset = applyTypeScale(finalPreset);

    const themeName = activeGeneratorTab === 'foundations' 
        ? (activeThemeNameDisplay.textContent || "System Theme")
        : (customThemeNameInput.value || "Custom Theme");

    const activeContainer = activeGeneratorTab === 'foundations' ? foundationsSetContainer : customSetContainer;
    
    const setsData = Array.from(activeContainer.querySelectorAll('.set-block')).map(sBlock => {
        const setName = (sBlock.querySelector('.set-name-input') as HTMLInputElement).value;
        const colors = Array.from(sBlock.querySelectorAll('.color-list-container .dynamic-row')).map(row => ({
            name: (row.querySelector('.name-input') as HTMLInputElement).value || hexToName((row.querySelector('.picker') as HTMLInputElement).value),
            hex: (row.querySelector('.picker') as HTMLInputElement).value
        }));
        const fonts: Record<string, string[]> = {};
        Array.from(sBlock.querySelectorAll('.font-list-container .dynamic-row-container')).forEach(row => {
            const role = (row.querySelector('.role-select') as HTMLSelectElement).value;
            const family = (row.querySelector('.font-select') as HTMLSelectElement).value;
            if (family) { if (!fonts[role]) fonts[role] = []; fonts[role].push(family); }
        });
        return { name: setName, colors, fonts };
    });

    const density = parseFloat((document.getElementById('density-select') as HTMLSelectElement).value);
    const gridCols = parseInt((document.getElementById('grid-type-select') as HTMLSelectElement).value);

    window.parent.postMessage({ type: 'GENERATE_SYSTEM', preset: finalPreset, themeName, sets: setsData, layout: { density, gridCols } }, '*');
};

// ── MANAGER LOGIC ─────────────────────────────────────────────────────
function renderLibraryManager(sets: any[], themes: any[]) {
    const setsContainer = document.getElementById('existing-sets-container')!;
    const themesContainer = document.getElementById('existing-themes-container')!;
    setsContainer.innerHTML = sets.length ? "" : '<p style="font-size: 11px; color: #999;">No Design Sets found.</p>';
    sets.forEach(s => {
        const item = document.createElement('div');
        item.className = 'library-item';
        item.innerHTML = `<span>${s.name}</span><button class="icon-btn" data-id="${s.id}">🗑️</button>`;
        item.querySelector('button')!.onclick = () => window.parent.postMessage({ type: 'DELETE_SET', id: s.id }, '*');
        setsContainer.appendChild(item);
    });
    themesContainer.innerHTML = themes.length ? "" : '<p style="font-size: 11px; color: #999;">No Themes found.</p>';
    themes.forEach(t => {
        const item = document.createElement('div');
        item.className = 'library-item';
        item.innerHTML = `<span>[${t.group}] ${t.name}</span><button class="icon-btn" data-id="${t.id}">🗑️</button>`;
        item.querySelector('button')!.onclick = () => window.parent.postMessage({ type: 'DELETE_THEME', id: t.id }, '*');
        themesContainer.appendChild(item);
    });
}

window.onmessage = (e) => {
    const msg = e.data;
    if (msg.type === 'available-fonts') availableFonts = msg.data;
    if (msg.type === 'library-data') renderLibraryManager(msg.sets, msg.themes);
    if (msg.type === 'log') log(msg.message, msg.level);
};

initPresets();
window.parent.postMessage({ type: 'UI_READY' }, '*');
