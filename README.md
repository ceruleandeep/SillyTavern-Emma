# Extensions Manager Manager

Helper for local development of SillyTavern extensions.

<img width="400" alt="manage-and-new" src="https://github.com/user-attachments/assets/aaa7698e-14e7-461d-b955-3a7f9b0bfcf0">

Create new [UI extensions](https://docs.sillytavern.app/for-contributors/writing-extensions) from SillyTavern and open in your code editor for editing. Breaking your user interface has never been easier!

<img width="400" alt="create-new-extension" src="https://github.com/user-attachments/assets/df548841-b042-4692-8ad3-d49142447928">

## Real features

* Create a new local extension
* Open the extension for editing in your IDE with a single click!
* Sort the installed extensions list

## Imaginary features

* ~~Clone a starter template for a new extension~~
* ~~Convert local-only extensions to distributable, updatable extensions~~
* ~~Convert shallow git clones of installed extensions to full editable copies~~
* ~~Configure the extension's manifest~~
* ~~Extension tagging and categorisation~~
* ~~Button to prompt Coding Sensei to just write the extension for you~~

## Configuration

* Editor: the command to run your IDE with the correct arguments to open the extension's directory. Currently available: `webstorm`, `code`, `open`.
* Extensions Base Path: the path to the `scripts/extensions/third-party` directory in your SillyTavern installation. Only used for the "no auto-open" fallback.

<img width="400" alt="emma-config" src="https://github.com/user-attachments/assets/70a5aa8a-4932-492c-98d0-28c38dedd2ed">

## Usage

* New extension: Click the "[Cube] New extension" button in the Extensions panel. Fill in the form:
  * Extension ID: the name of the extension's directory.
  * Display Name: the name of the extension as shown in the Extensions panel, for `display_name` in the [manifest](https://docs.sillytavern.app/for-contributors/writing-extensions/#manifestjson).
  * Author: your name or handle, for `author` in the manifest and `user.name` in git.
  * Email (optional): your contact email, if any, for `author` in the manifest and `user.email` in git.
* Edit extension: Click "[Cubes] Manage extensions" in the Extensions panel, then click the folder icon next to the extension you want to edit.
  * Auto-open: will run the IDE command to open the extension in your IDE.
  * No auto-open: will open a dialog with the path and IDE command to copy.
* Sort extensions: Click "[Cubes] Manage extensions" in the Extensions panel, then use the dropdown to sort as desired.

<img width="400" alt="installed-extensions" src="https://github.com/user-attachments/assets/ce824a1d-c196-4f86-a85a-a92c3487a169">

## Requirements

SillyTavern 1.12.8 and above.

## How to install

Use this URL with the [extension installer](https://docs.sillytavern.app/extensions/):

```
https://github.com/ceruleandeep/SillyTavern-ExtensionsManagerManager
```

Creating new extensions and single-click editing requires the [server plugin](https://github.com/ceruleandeep/SillyTavern-ExtensionsManagerManager-Plugin)
to [also be installed](https://docs.sillytavern.app/for-contributors/server-plugins/).

## Configuration options

Find "Extensions Manager Manager" in the extensions panel.

* "Enabled" – toggle the extension on and off.
* "Extensions Base Path" – the path to the `scripts/extensions/third-party` directory in your SillyTavern installation.
* "IDE Command Template" - the command to run your IDE with the correct arguments to open the extension's directory. 
    * `{path}` will be replaced with the path to the extension's directory.

### Just Webstorm Things

* For the love of gods, edit your extension by opening the main SillyTavern directory in Webstorm, not the extension directory.
* Use `webstorm "{path}/index.js"` to open the extension's main file inside an existing Webstorm window.
* Use `webstorm "{path}"` to open the extension in a new Webstorm window, whether or not Webstorm is already open.
* If you don't have `webstorm` in your path, they moved that configuration into Toolbox, go look there.
* Register your extension as a VCS root in Webstorm to enable version control features (Settings -> Version Control -> Directory Mappings, find the unregistered root, click +).

## Licence

AGPLv3
