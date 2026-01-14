/**
 * Utility to fix color values for html2canvas PDF generation
 * Replaces unsupported color functions (lab, oklch, color-mix) with safe hex/rgb values
 */

// Map of common Tailwind zinc colors to hex equivalents
const ZINC_COLOR_MAP: Record<string, string> = {
    'rgb(9, 9, 11)': '#09090b',      // zinc-950
    'rgb(24, 24, 27)': '#18181b',    // zinc-900
    'rgb(39, 39, 42)': '#27272a',    // zinc-800
    'rgb(63, 63, 70)': '#3f3f46',    // zinc-700
    'rgb(82, 82, 91)': '#52525b',    // zinc-600
    'rgb(113, 113, 122)': '#71717a', // zinc-500
    'rgb(161, 161, 170)': '#a1a1aa', // zinc-400
    'rgb(212, 212, 216)': '#d4d4d8', // zinc-300
    'rgb(228, 228, 231)': '#e4e4e7', // zinc-200
    'rgb(244, 244, 245)': '#f4f4f5', // zinc-100
    'rgb(250, 250, 250)': '#fafafa',  // zinc-50
    'rgb(255, 255, 255)': '#ffffff',  // white
    'rgb(0, 0, 0)': '#000000',        // black
    'rgb(239, 68, 68)': '#ef4444',    // red-500
    'rgb(34, 197, 94)': '#22c55e',    // green-500
    'rgb(16, 185, 129)': '#10b981',   // emerald-600
    'rgba(0, 0, 0, 0)': 'transparent', // transparent
    'transparent': 'transparent',
    'none': 'none',
}

/**
 * Sanitize a color value to ensure it's html2canvas compatible
 */
function sanitizeColor(colorValue: string): string {
    if (!colorValue) return colorValue

    // If it's already a hex color, return as-is
    if (colorValue.startsWith('#')) return colorValue

    // Check if it's in our map
    if (ZINC_COLOR_MAP[colorValue]) {
        return ZINC_COLOR_MAP[colorValue]
    }

    // Convert to lowercase for case-insensitive comparison
    const lowerValue = colorValue.toLowerCase()

    // If it contains lab, lch, oklch, oklab, or color-mix functions (case-insensitive)
    if (lowerValue.includes('lab(') ||
        lowerValue.includes('lch(') ||
        lowerValue.includes('oklch(') ||
        lowerValue.includes('oklab(') ||
        lowerValue.includes('color-mix(') ||
        lowerValue.startsWith('lab ') ||
        lowerValue.startsWith('lch ') ||
        lowerValue.startsWith('oklch ') ||
        lowerValue.startsWith('oklab ')) {
        // These are problematic - return a safe default
        console.warn(`Problematic color detected: ${colorValue}`)
        return '#09090b' // Default to zinc-950
    }

    // Return as-is if it's rgb/rgba or other safe format
    return colorValue
}

/**
 * Recursively apply inline styles to all elements to override any computed lab/oklch colors
 */
export function applyPdfSafeStyles(element: HTMLElement) {
    const computedStyle = window.getComputedStyle(element)

    // Properties that might contain colors
    const colorProperties = [
        'color',
        'backgroundColor',
        'borderColor',
        'borderTopColor',
        'borderRightColor',
        'borderBottomColor',
        'borderLeftColor',
        'outlineColor',
        'fill',
        'stroke',
    ]

    // Apply safe inline styles
    colorProperties.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop)
        if (value && value !== 'transparent' && value !== 'none') {
            const safeProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase()
            const safeValue = sanitizeColor(value)
            element.style.setProperty(safeProp, safeValue, 'important')
        }
    })

    // Recursively process children
    Array.from(element.children).forEach(child => {
        if (child instanceof HTMLElement) {
            applyPdfSafeStyles(child)
        }
    })
}

/**
 * Remove the inline styles applied by applyPdfSafeStyles
 */
export function removePdfSafeStyles(element: HTMLElement) {
    const colorProperties = [
        'color',
        'background-color',
        'border-color',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
        'outline-color',
        'fill',
        'stroke',
    ]

    // Remove inline styles
    colorProperties.forEach(prop => {
        element.style.removeProperty(prop)
    })

    // Recursively process children
    Array.from(element.children).forEach(child => {
        if (child instanceof HTMLElement) {
            removePdfSafeStyles(child)
        }
    })
}
