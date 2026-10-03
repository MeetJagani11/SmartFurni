/**
 * furnitureDimensions.js
 * Intelligently infers real-world 3D and 2D dimensions (in meters),
 * categories, and color palettes from product data.
 */

export const FURNITURE_CATEGORIES = {
    SOFA_3_SEATER: 'sofa_3_seater',
    SOFA_2_SEATER: 'sofa_2_seater',
    RECLINER: 'recliner',
    ARMCHAIR: 'armchair',
    BED_KING: 'bed_king',
    BED_QUEEN: 'bed_queen',
    BED_SINGLE: 'bed_single',
    DINING_TABLE: 'dining_table',
    COFFEE_TABLE: 'coffee_table',
    SIDE_TABLE: 'side_table',
    NIGHTSTAND: 'nightstand',
    WARDROBE: 'wardrobe',
    CABINET: 'cabinet',
    TV_UNIT: 'tv_unit',
    CHAIR: 'chair',
    OFFICE_CHAIR: 'office_chair',
    DESK: 'desk',
    BOOKSHELF: 'bookshelf',
    GENERIC: 'generic'
};

/**
 * Categorize a product based on name, category, and subcategory
 */
export function detectFurnitureCategory(product = {}) {
    const text = `${product.name || ''} ${product.category || ''} ${product.subcategory || ''}`.toLowerCase();

    if (text.includes('recliner')) return FURNITURE_CATEGORIES.RECLINER;
    if (text.includes('3 + 2') || text.includes('3 seater') || text.includes('3-seater') || text.includes('sectional') || text.includes('corner sofa') || text.includes('l shape')) {
        return FURNITURE_CATEGORIES.SOFA_3_SEATER;
    }
    if (text.includes('2 seater') || text.includes('2-seater') || text.includes('loveseat')) {
        return FURNITURE_CATEGORIES.SOFA_2_SEATER;
    }
    if (text.includes('sofa') || text.includes('couch') || text.includes('divan')) {
        return FURNITURE_CATEGORIES.SOFA_3_SEATER;
    }
    if (text.includes('armchair') || text.includes('lounge chair') || text.includes('accent chair')) {
        return FURNITURE_CATEGORIES.ARMCHAIR;
    }
    if (text.includes('king') && text.includes('bed')) return FURNITURE_CATEGORIES.BED_KING;
    if (text.includes('single') && text.includes('bed')) return FURNITURE_CATEGORIES.BED_SINGLE;
    if (text.includes('bed') || text.includes('mattress') || text.includes('cot')) return FURNITURE_CATEGORIES.BED_QUEEN;
    if (text.includes('dining') || (text.includes('table') && (text.includes('6 seater') || text.includes('4 seater') || text.includes('8 seater')))) {
        return FURNITURE_CATEGORIES.DINING_TABLE;
    }
    if (text.includes('coffee') || text.includes('center table') || text.includes('tea table')) {
        return FURNITURE_CATEGORIES.COFFEE_TABLE;
    }
    if (text.includes('nightstand') || text.includes('bedside')) return FURNITURE_CATEGORIES.NIGHTSTAND;
    if (text.includes('side table') || text.includes('end table')) return FURNITURE_CATEGORIES.SIDE_TABLE;
    if (text.includes('tv') || text.includes('media console') || text.includes('entertainment')) {
        return FURNITURE_CATEGORIES.TV_UNIT;
    }
    if (text.includes('wardrobe') || text.includes('almirah') || text.includes('closet')) {
        return FURNITURE_CATEGORIES.WARDROBE;
    }
    if (text.includes('cabinet') || text.includes('cupboard') || text.includes('sideboard') || text.includes('credenza') || text.includes('storage')) {
        return FURNITURE_CATEGORIES.CABINET;
    }
    if (text.includes('bookshelf') || text.includes('bookcase') || text.includes('shelf')) {
        return FURNITURE_CATEGORIES.BOOKSHELF;
    }
    if (text.includes('office chair') || text.includes('ergonomic chair') || text.includes('desk chair')) {
        return FURNITURE_CATEGORIES.OFFICE_CHAIR;
    }
    if (text.includes('desk') || text.includes('study table') || text.includes('workstation')) {
        return FURNITURE_CATEGORIES.DESK;
    }
    if (text.includes('chair') || text.includes('stool')) return FURNITURE_CATEGORIES.CHAIR;
    if (text.includes('table')) return FURNITURE_CATEGORIES.COFFEE_TABLE;

    return FURNITURE_CATEGORIES.GENERIC;
}

/**
 * Standard realistic dimensions (Width, Depth/Length, Height) in meters
 */
const DEFAULT_DIMENSIONS = {
    [FURNITURE_CATEGORIES.SOFA_3_SEATER]: { width: 2.15, length: 0.92, height: 0.86 },
    [FURNITURE_CATEGORIES.SOFA_2_SEATER]: { width: 1.55, length: 0.88, height: 0.86 },
    [FURNITURE_CATEGORIES.RECLINER]: { width: 0.95, length: 0.95, height: 0.98 },
    [FURNITURE_CATEGORIES.ARMCHAIR]: { width: 0.85, length: 0.82, height: 0.84 },
    [FURNITURE_CATEGORIES.BED_KING]: { width: 1.95, length: 2.15, height: 1.05 },
    [FURNITURE_CATEGORIES.BED_QUEEN]: { width: 1.65, length: 2.05, height: 1.02 },
    [FURNITURE_CATEGORIES.BED_SINGLE]: { width: 1.05, length: 1.95, height: 0.92 },
    [FURNITURE_CATEGORIES.DINING_TABLE]: { width: 1.60, length: 0.90, height: 0.76 },
    [FURNITURE_CATEGORIES.COFFEE_TABLE]: { width: 1.15, length: 0.60, height: 0.44 },
    [FURNITURE_CATEGORIES.SIDE_TABLE]: { width: 0.50, length: 0.50, height: 0.55 },
    [FURNITURE_CATEGORIES.NIGHTSTAND]: { width: 0.52, length: 0.42, height: 0.52 },
    [FURNITURE_CATEGORIES.WARDROBE]: { width: 1.25, length: 0.60, height: 1.95 },
    [FURNITURE_CATEGORIES.CABINET]: { width: 1.20, length: 0.45, height: 0.85 },
    [FURNITURE_CATEGORIES.TV_UNIT]: { width: 1.80, length: 0.42, height: 0.48 },
    [FURNITURE_CATEGORIES.CHAIR]: { width: 0.52, length: 0.52, height: 0.86 },
    [FURNITURE_CATEGORIES.OFFICE_CHAIR]: { width: 0.62, length: 0.62, height: 0.96 },
    [FURNITURE_CATEGORIES.DESK]: { width: 1.25, length: 0.65, height: 0.76 },
    [FURNITURE_CATEGORIES.BOOKSHELF]: { width: 0.85, length: 0.35, height: 1.80 },
    [FURNITURE_CATEGORIES.GENERIC]: { width: 0.80, length: 0.80, height: 0.75 }
};

/**
 * Returns realistic width, length (depth), height in meters
 */
export function getRealisticDimensions(product = {}) {
    const category = detectFurnitureCategory(product);
    const defaults = DEFAULT_DIMENSIONS[category] || DEFAULT_DIMENSIONS[FURNITURE_CATEGORIES.GENERIC];

    const rawW = Number(product.width);
    const rawL = Number(product.length);
    const rawH = Number(product.height);

    // If explicit non-fallback dimensions exist and are realistic (e.g. > 0.3m and not default 0.5m unless requested)
    const isValidDim = (val) => typeof val === 'number' && !isNaN(val) && val > 0.25;

    let width = isValidDim(rawW) ? rawW : defaults.width;
    let length = isValidDim(rawL) ? rawL : defaults.length;
    let height = isValidDim(rawH) ? rawH : defaults.height;

    // Guard against millimeter values accidentally stored without conversion (e.g. 1800mm -> 1.8m)
    if (width > 50) width = width / 1000;
    if (length > 50) length = length / 1000;
    if (height > 50) height = height / 1000;

    return {
        width: Math.round(width * 100) / 100,
        length: Math.round(length * 100) / 100,
        height: Math.round(height * 100) / 100,
        category
    };
}

/**
 * Extracts a tasteful architectural color palette from the product name/category/color
 */
export function getFurnitureColorPalette(product = {}) {
    const text = `${product.name || ''} ${product.category || ''} ${product.description || ''} ${product.color || ''}`.toLowerCase();

    // Default primary & secondary colors
    let primary = '#3b4252'; // Sophisticated charcoal slate
    let secondary = '#4c566a';
    let wood = '#5c4033'; // Warm teak / walnut
    let metal = '#2e3440';
    let accent = '#d08770';

    if (text.includes('yellow') || text.includes('mustard')) {
        primary = '#d99b26';
        secondary = '#b8811b';
        accent = '#4c566a';
        wood = '#3d2817';
    } else if (text.includes('blue') || text.includes('navy') || text.includes('indigo')) {
        primary = '#2b4c6f';
        secondary = '#1e3550';
        accent = '#d08770';
        wood = '#4a3728';
    } else if (text.includes('green') || text.includes('emerald') || text.includes('olive')) {
        primary = '#2d5a43';
        secondary = '#1e3d2d';
        accent = '#d4a373';
        wood = '#422817';
    } else if (text.includes('beige') || text.includes('cream') || text.includes('ivory') || text.includes('sand')) {
        primary = '#dfd7ca';
        secondary = '#c8beaf';
        accent = '#8c7860';
        wood = '#6b4f38';
    } else if (text.includes('brown') || text.includes('tan') || text.includes('leather') || text.includes('cognac')) {
        primary = '#8b5a2b';
        secondary = '#6d421d';
        accent = '#dfd7ca';
        wood = '#3b2210';
    } else if (text.includes('grey') || text.includes('gray') || text.includes('charcoal')) {
        primary = '#4a5568';
        secondary = '#2d3748';
        accent = '#dd6b20';
        wood = '#3d2d24';
    } else if (text.includes('white')) {
        primary = '#f7fafc';
        secondary = '#e2e8f0';
        accent = '#718096';
        wood = '#71553f';
    } else if (text.includes('black') || text.includes('ebony')) {
        primary = '#1a202c';
        secondary = '#111827';
        accent = '#e2e8f0';
        wood = '#1c1917';
    } else if (text.includes('sheesham') || text.includes('teak') || text.includes('walnut') || text.includes('wood')) {
        primary = '#633a1e';
        secondary = '#4a2b15';
        accent = '#fef3c7';
        wood = '#532e16';
    }

    if (text.includes('marble') || text.includes('onyx')) {
        primary = '#f1f5f9';
        secondary = '#cbd5e1';
        accent = '#e2e8f0';
    }

    return { primary, secondary, wood, metal, accent };
}
