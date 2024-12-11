// API related functions

import { EXTENSION_NAME } from './consts.js';
const t = SillyTavern.getContext().t;

export async function getEditorsList() {
    const context = SillyTavern.getContext();
    
    if (!window.apiAvailable) {
        return DEFAULT_EDITORS;
    }

    try {
        const response = await fetch('/api/plugins/emma/editors', {
            headers: context.getRequestHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch editors');
        }

        return await response.json();
    } catch (error) {
        console.debug(`[${EXTENSION_NAME}]`, t`Failed to fetch editors`, error);
        throw error;
    }
}

export async function checkAPIAvailable() {
    try {
        const context = SillyTavern.getContext();
        const response = await fetch('/api/plugins/emma/probe', {
            method: 'GET',
            headers: context.getRequestHeaders(),
        });
        return response.status === 204;
    } catch (error) {
        console.debug(`[${EXTENSION_NAME}]`, t`API probe failed`, error);
        return false;
    }
}

export async function openExtensionWithAPI(extensionName, editor) {
    const context = SillyTavern.getContext();
    const response = await fetch('/api/plugins/emma/open', {
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
    const context = SillyTavern.getContext();

    try {
        const response = await fetch('/api/plugins/emma/create', {
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
                console.debug(`[${EXTENSION_NAME}]`, t`Failed to parse error response`, parseError);
            }
            toastr.error(t`Failed to create extension`);
            return;
        }

        const manifest = await response.json();

        toastr.success(t`Extension "${manifest.display_name}" by ${manifest.author} (version ${manifest.version}) has been created successfully!`, t`Extension creation successful`);
        console.debug(`[${EXTENSION_NAME}]`, t`Extension "${manifest.display_name}" installed at ${manifest.extensionPath}`);

        return manifest;
    } catch (error) {
        console.error(`[${EXTENSION_NAME}]`, t`Failed to create extension`, error);
        toastr.error(t`Failed to create extension`);
        throw error;
    }
}
