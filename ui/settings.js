import { settingsKey, EXTENSION_NAME } from '../consts.js';
import { addPathButtonsToGlobalExtensions,  updateNewExtensionButton } from './controls.js';

export async function renderExtensionSettings() {
    const context = SillyTavern.getContext();
    const settingsElementId = `${settingsKey}-settings`;
    const settingsContainer = document.getElementById(settingsElementId) ?? document.getElementById('extensions_settings2');
    if (!settingsContainer) {
        return;
    }

    const inlineDrawer = document.createElement('div');
    inlineDrawer.classList.add('inline-drawer');
    settingsContainer.append(inlineDrawer);

    const inlineDrawerToggle = document.createElement('div');
    inlineDrawerToggle.classList.add('inline-drawer-toggle', 'inline-drawer-header');

    const extensionName = document.createElement('b');
    extensionName.textContent = context.t`${EXTENSION_NAME}`;

    const inlineDrawerIcon = document.createElement('div');
    inlineDrawerIcon.classList.add('inline-drawer-icon', 'fa-solid', 'fa-circle-chevron-down', 'down');

    inlineDrawerToggle.append(extensionName, inlineDrawerIcon);

    const inlineDrawerContent = document.createElement('div');
    inlineDrawerContent.classList.add('inline-drawer-content');

    inlineDrawer.append(inlineDrawerToggle, inlineDrawerContent);

    const settings = context.extensionSettings[settingsKey];

    // Enabled checkbox
    const enabledCheckboxLabel = document.createElement('label');
    enabledCheckboxLabel.classList.add('checkbox_label');
    enabledCheckboxLabel.htmlFor = `${settingsKey}-enabled`;
    const enabledCheckbox = document.createElement('input');
    enabledCheckbox.id = `${settingsKey}-enabled`;
    enabledCheckbox.type = 'checkbox';
    enabledCheckbox.checked = settings.enabled;
    enabledCheckbox.addEventListener('change', () => {
        settings.enabled = enabledCheckbox.checked;
        context.saveSettingsDebounced();
        updateNewExtensionButton();

        if (!settings.enabled) {
            document.querySelectorAll('.btn_path').forEach(button => button.remove());
        } else {
            addPathButtonsToGlobalExtensions();
        }
    });

    const enabledCheckboxText = document.createElement('span');
    enabledCheckboxText.textContent = context.t`Enabled`;
    enabledCheckboxLabel.append(enabledCheckbox, enabledCheckboxText);
    inlineDrawerContent.append(enabledCheckboxLabel);

    // Editor select
    const editorLabel = document.createElement('label');
    editorLabel.htmlFor = `${settingsKey}-editor`;
    editorLabel.textContent = context.t`Editor`;

    const editorSelect = document.createElement('select');
    editorSelect.id = `${settingsKey}-editor`;
    editorSelect.classList.add('text_pole');

    try {
        const response = await fetch('/api/plugins/emm/editors');
        if (response.ok) {
            const editors = await response.json();
            editors.forEach(editor => {
                const option = document.createElement('option');
                option.value = editor;
                option.textContent = editor;
                option.selected = settings.editor === editor;
                editorSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.debug('Extension Manager: Failed to fetch editors', error);
        const option = document.createElement('option');
        option.value = 'code';
        option.textContent = 'code';
        option.selected = true;
        editorSelect.appendChild(option);
    }

    editorSelect.addEventListener('change', () => {
        settings.editor = editorSelect.value;
        context.saveSettingsDebounced();
    });

    inlineDrawerContent.append(editorLabel, editorSelect);

    // Base path input
    const basePathLabel = document.createElement('label');
    basePathLabel.htmlFor = `${settingsKey}-basePath`;
    basePathLabel.textContent = context.t`Extensions base path`;

    const basePathInput = document.createElement('input');
    basePathInput.type = 'text';
    basePathInput.id = `${settingsKey}-basePath`;
    basePathInput.classList.add('text_pole');
    basePathInput.value = settings.basePath || '';
    basePathInput.placeholder = '/path/to/SillyTavern/extensions/third-party';
    basePathInput.addEventListener('input', () => {
        settings.basePath = basePathInput.value;
        context.saveSettingsDebounced();
    });

    inlineDrawerContent.append(basePathLabel, basePathInput);
}
