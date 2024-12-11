import { createNewExtension } from '../api.js';
import { loadExtensionSettings } from '../../../../extensions.js';

export async function showExtensionPathPopup(fullPath, ideCommand) {
    if (!fullPath) {
        console.error('Extension path is required');
        return;
    }

    const context = SillyTavern.getContext();
    const container = document.createElement('div');
    container.classList.add('emma--container');

    const title = document.createElement('h3');
    title.textContent = 'Edit Extension';
    title.classList.add('emma--title');

    // Path section
    const pathRow = document.createElement('div');
    pathRow.classList.add('emma--row');
    pathRow.setAttribute('aria-label', 'Extension path');

    const pathText = document.createElement('div');
    pathText.textContent = fullPath;
    pathText.classList.add('monospace');

    const copyPath = document.createElement('div');
    copyPath.classList.add('menu_button', 'fa-fw', 'fa-solid', 'fa-copy');
    copyPath.title = `Copy extension path: ${fullPath}`;
    copyPath.setAttribute('aria-label', 'Copy extension path to clipboard');
    copyPath.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(fullPath);
            copyPath.classList.add('emma--success');
            setTimeout(() => copyPath.classList.remove('emma--success'), 3000);
        } catch (error) {
            console.error('Failed to copy path:', error);
            toastr.error('Failed to copy path to clipboard');
        }
    });

    pathRow.append(pathText, copyPath);
    container.append(title, pathRow);

    // Command section - only show if ideCommand is provided
    if (ideCommand) {
        const commandRow = document.createElement('div');
        commandRow.classList.add('emma--row');
        commandRow.setAttribute('aria-label', 'Editor command');

        const commandText = document.createElement('div');
        commandText.textContent = ideCommand;
        commandText.classList.add('monospace');

        const copyCommand = document.createElement('div');
        copyCommand.classList.add('menu_button', 'fa-fw', 'fa-solid', 'fa-copy');
        copyCommand.title = `Copy editor command: ${ideCommand}`;
        copyCommand.setAttribute('aria-label', 'Copy editor command to clipboard');
        copyCommand.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(ideCommand);
                copyCommand.classList.add('emma--success');
                setTimeout(() => copyCommand.classList.remove('emma--success'), 3000);
            } catch (error) {
                console.error('Failed to copy command:', error);
                toastr.error('Failed to copy command to clipboard');
            }
        });

        commandRow.append(commandText, copyCommand);
        container.appendChild(commandRow);
    }

    return context.callGenericPopup(container, context.POPUP_TYPE.TEXT);
}

export async function showCreateExtensionDialog() {
    const context = SillyTavern.getContext();

    const container = document.createElement('div');
    container.classList.add('emma--container');

    const title = document.createElement('h3');
    title.textContent = 'Create New Extension';
    title.classList.add('emma--title');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.classList.add('text_pole');
    nameInput.placeholder = 'SillyTavern-MyExtension';

    const displayNameInput = document.createElement('input');
    displayNameInput.type = 'text';
    displayNameInput.classList.add('text_pole');
    displayNameInput.placeholder = 'My Extension';

    const authorInput = document.createElement('input');
    authorInput.type = 'text';
    authorInput.classList.add('text_pole');
    authorInput.placeholder = 'Your Name';

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.classList.add('text_pole');
    emailInput.placeholder = 'your.email@example.com (optional)';

    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Extension ID';
    const displayNameLabel = document.createElement('label');
    displayNameLabel.textContent = 'Display Name';
    const authorLabel = document.createElement('label');
    authorLabel.textContent = 'Author';
    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'Email (optional)';

    container.append(
        title,
        nameLabel, nameInput,
        displayNameLabel, displayNameInput,
        authorLabel, authorInput,
        emailLabel, emailInput,
    );

    const confirmation = await context.callGenericPopup(container, context.POPUP_TYPE.CONFIRM, '', {
        okButton: 'Create Extension',
        cancelButton: 'Cancel',
    });

    if (confirmation !== context.POPUP_RESULT.AFFIRMATIVE) {
        return;
    }

    const name = nameInput.value.trim();
    const displayName = displayNameInput.value.trim();
    const author = authorInput.value.trim();

    if (!name) {
        toastr.warning('Please enter an extension ID');
        return;
    }
    if (!displayName) {
        toastr.warning('Please enter a display name');
        return;
    }
    if (!author) {
        toastr.warning('Please enter an author name');
        return;
    }

    const email = emailInput.value.trim();
    const manifest = await createNewExtension(name, displayName, author, email);

    if (manifest) {
        await loadExtensionSettings({}, false, false);
        await context.eventSource.emit(context.eventTypes.EXTENSION_SETTINGS_LOADED);
    }
}
