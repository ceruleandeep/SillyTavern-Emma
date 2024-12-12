import { settingsKey, EXTENSION_NAME, DEFAULT_EDITORS } from '../consts.js';
import { addPathButtonsToGlobalExtensions, updateNewExtensionButton } from './controls.js';
import { createPluginInstallLink } from './components.js';
import { getEditorsList, isAPIAvailable } from '../api.js';

const t = SillyTavern.getContext().t;

function createInlineDrawer(context) {
    const inlineDrawer = document.createElement('div');
    inlineDrawer.classList.add('inline-drawer');

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

    return { inlineDrawer, inlineDrawerContent };
}

function createEnabledCheckbox(context, settings) {
    const enabledCheckboxContainer = document.createElement('div');

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

    enabledCheckboxContainer.appendChild(enabledCheckboxLabel);
    enabledCheckboxContainer.classList.add('marginTopBot5');
    return enabledCheckboxContainer;
}

async function createEditorSelection(context, settings) {
    const editorContainer = document.createElement('div');
    editorContainer.classList.add('marginTopBot5');

    const editorLabel = document.createElement('label');
    editorLabel.htmlFor = `${settingsKey}-editor`;
    editorLabel.textContent = context.t`Editor`;
    editorContainer.appendChild(editorLabel);

    const editorSelect = document.createElement('select');
    editorSelect.id = `${settingsKey}-editor`;
    editorSelect.classList.add('text_pole');

    try {
        const editors = isAPIAvailable() ? await getEditorsList() : DEFAULT_EDITORS;

        editors.forEach(editor => {
            const option = document.createElement('option');
            option.value = editor;
            option.textContent = editor;
            option.selected = settings.editor === editor;
            editorSelect.appendChild(option);
        });

        editorSelect.addEventListener('change', () => {
            settings.editor = editorSelect.value;
            context.saveSettingsDebounced();
        });

        editorContainer.appendChild(editorSelect);
    } catch (error) {
        console.error(`[${EXTENSION_NAME}]`, context.t`Failed to get editors list`, error);
        const message = document.createElement('div');
        message.classList.add('warning');
        message.textContent = context.t`Failed to get editors list`;
        editorContainer.appendChild(message);
    }

    return editorContainer;
}

function createBasePathInput(context, settings) {
    const basePathContainer = document.createElement('div');
    basePathContainer.classList.add('marginTopBot5');

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

    basePathContainer.append(basePathLabel, basePathInput);
    return basePathContainer;
}


function createInstallLinkRow() {
    const apiUnavailableMessageRow = document.createElement('div');
    apiUnavailableMessageRow.classList.add('flex', 'marginTopBot5', 'justifySpaceBetween', 'alignItemsCenter');
    const apiUnavailableMessage = document.createElement('div');
    apiUnavailableMessage.textContent = t`API unavailable`;
    apiUnavailableMessage.classList.add('warning');
    const apiInstallLink = createPluginInstallLink();
    apiUnavailableMessageRow.append(apiUnavailableMessage, apiInstallLink);
    return apiUnavailableMessageRow;
}

export async function renderExtensionSettings() {
    const context = SillyTavern.getContext();
    const settingsElementId = `${settingsKey}-settings`;
    const settingsContainer = document.getElementById(settingsElementId) ?? document.getElementById('extensions_settings2');

    if (!settingsContainer) {
        return;
    }

    const settings = context.extensionSettings[settingsKey];
    const { inlineDrawer, inlineDrawerContent } = createInlineDrawer(context);
    settingsContainer.append(inlineDrawer);

    // Add API install link if API is unavailable
    !isAPIAvailable() && inlineDrawerContent.appendChild(createInstallLinkRow());

    // Add enabled checkbox
    const enabledCheckbox = createEnabledCheckbox(context, settings);
    inlineDrawerContent.appendChild(enabledCheckbox);

    // Add editor selection
    const editorSelection = await createEditorSelection(context, settings);
    inlineDrawerContent.appendChild(editorSelection);

    // Add base path input
    isAPIAvailable() || inlineDrawerContent.appendChild(createBasePathInput(context, settings));

    // Add Github username input
    const githubContainer = document.createElement('div');
    githubContainer.classList.add('marginTopBot5');

    const githubLabel = document.createElement('label');
    githubLabel.htmlFor = `${settingsKey}-github`;
    githubLabel.textContent = context.t`Github Username`;

    const githubInput = document.createElement('input');
    githubInput.type = 'text';
    githubInput.id = `${settingsKey}-github`;
    githubInput.classList.add('text_pole');
    githubInput.value = settings.githubUsername || '';
    githubInput.placeholder = 'username';

    githubInput.addEventListener('input', () => {
        settings.githubUsername = githubInput.value || null;
        context.saveSettingsDebounced();
    });

    githubContainer.append(githubLabel, githubInput);
    inlineDrawerContent.appendChild(githubContainer);
}
