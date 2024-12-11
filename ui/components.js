import { PLUGIN_INSTALL_URL } from '../consts.js';

const t = SillyTavern.getContext().t;

export function createPluginInstallLink() {
    const apiInstallLink = document.createElement('a');
    apiInstallLink.href = PLUGIN_INSTALL_URL;
    apiInstallLink.textContent = t`Install`;
    apiInstallLink.target = '_blank';

    const downloadIcon = document.createElement('i');
    downloadIcon.className = 'fa-fw fa-solid fa-download';

    const apiInstallButton = document.createElement('button');
    apiInstallButton.className = 'menu_button';
    apiInstallButton.title = t`Install Emma plugin`;
    apiInstallButton.append(downloadIcon, apiInstallLink);
    return apiInstallButton;
}
