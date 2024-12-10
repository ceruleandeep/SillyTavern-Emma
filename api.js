// API related functions
import { getContext } from '../../../extensions.js';

export async function checkAPIAvailable() {
    try {
        const context = getContext();
        const response = await fetch('/api/plugins/emm/probe', {
            method: 'GET',
            headers: context.getRequestHeaders(),
        });
        return response.status === 204;
    } catch (error) {
        console.debug('Extension Manager: API probe failed', error);
        return false;
    }
}

export async function openExtensionWithAPI(extensionName, editor) {
    const context = getContext();

    const response = await fetch('/api/plugins/emm/open', {
        method: 'POST',
        headers: context.getRequestHeaders(),
        body: JSON.stringify({
            editor: editor || 'code',
            extensionName: extensionName.replace(/^\//, ''), // Remove leading slash
        }),
    });

    if (!response.ok) {
        // Try to get error details from response
        const errorData = await response.json();
        if (errorData.error && errorData.details) {
            toastr.error(`${errorData.error}: ${errorData.details}`);
        }
        throw new Error('API call failed');
    }
}

export async function createNewExtension(name, displayName, author, email) {
    const context = getContext();

    try {
        const response = await fetch('/api/plugins/emm/create', {
            method: 'POST',
            headers: context.getRequestHeaders(),
            body: JSON.stringify({
                name,
                display_name: displayName,
                author,
                email,
            }),
        });

        if (!response.ok) {
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    toastr.error(errorData.error);
                    return;
                }
            } catch (parseError) {
                console.debug('Extension Manager: Failed to parse error response', parseError);
            }
            toastr.error('Failed to create extension');
            return;
        }

        const manifest = await response.json();

        toastr.success(`Extension "${manifest.display_name}" by ${manifest.author} (version ${manifest.version}) has been created successfully!`, 'Extension creation successful');
        console.debug(`Extension "${manifest.display_name}" has been installed successfully at ${manifest.extensionPath}`);

        return manifest;
    } catch (error) {
        console.error('Extension Manager: Failed to create extension', error);
        toastr.error('Failed to create extension');
        throw error;
    }
}
