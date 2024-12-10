/**
 * Sort extensions by their display name
 * @param {Element} a First extension block element
 * @param {Element} b Second extension block element
 * @returns {number} Sort order
 */
export function sortExtensionsByName(a, b) {
    const nameA = a.querySelector('.extension_name')?.textContent?.toLowerCase() ?? '';
    const nameB = b.querySelector('.extension_name')?.textContent?.toLowerCase() ?? '';
    return nameA.localeCompare(nameB);
}

/**
 * Sort extensions by their enabled state
 * @param {Element} a First extension block element
 * @param {Element} b Second extension block element
 * @returns {number} Sort order
 */
export function sortExtensionsByEnabled(a, b) {
    const enabledA = !a.querySelector('.extension_toggle')?.checked;
    const enabledB = !b.querySelector('.extension_toggle')?.checked;

    if (enabledA === enabledB) {
        return sortExtensionsByName(a, b);
    }

    return enabledA ? 1 : -1;
}
