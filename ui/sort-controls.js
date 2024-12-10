import { sortExtensionsByName } from '../utils/sort.js';

export function createSortControls() {
    const container = document.createElement('div');
    container.classList.add('emm--sort-controls');

    const select = document.createElement('select');
    select.classList.add('text_pole');
    
    const options = [
        { value: 'load', text: 'Load Order' },
        { value: 'display', text: 'Display Name' },
        { value: 'name', text: 'Internal Name' },
        { value: 'type', text: 'Local/Global' }
    ];

    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        select.appendChild(option);
    });

    select.addEventListener('change', () => {
        const extensionsContainer = container.closest('.marginBot10');
        if (!extensionsContainer) return;

        const extensions = Array.from(extensionsContainer.querySelectorAll('.extension_block'));
        const parent = extensions[0]?.parentElement;
        if (!parent) return;

        extensions.sort((a, b) => {
            switch (select.value) {
                case 'display':
                    return sortExtensionsByName(a, b);
                case 'name':
                    return (a.dataset.name || '').localeCompare(b.dataset.name || '');
                case 'type':
                    const aGlobal = !!a.querySelector('.fa-server');
                    const bGlobal = !!b.querySelector('.fa-server');
                    return aGlobal === bGlobal ? sortExtensionsByName(a, b) : (aGlobal ? 1 : -1);
                default:
                    return 0; // Keep original order
            }
        });

        // Clear and re-append in new order
        extensions.forEach(ext => ext.remove());
        extensions.forEach(ext => parent.appendChild(ext));
    });

    const label = document.createElement('label');
    label.textContent = 'Sort by: ';
    label.appendChild(select);
    
    container.appendChild(label);
    return container;
}
