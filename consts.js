const settingsKey = 'sillytavern-emma';
const EXTENSION_NAME = 'Emma';

const DEFAULT_EDITORS = ['code', 'webstorm', 'atom', 'sublime', 'notepad++'];

const SORT_OPTIONS = {
    LOAD_ORDER: 'load',
    DISPLAY_NAME: 'display',
    INTERNAL_NAME: 'name',
    TYPE: 'type',
    ENABLED: 'enabled',
    UPDATE: 'update',
};

const EDITOR_POPUP_REASONS = {
    API_NOT_AVAILABLE: 'api_not_available',
    API_FAILED: 'api_failed',
};

export { settingsKey, EXTENSION_NAME, SORT_OPTIONS, DEFAULT_EDITORS, EDITOR_POPUP_REASONS };
