# Extensions Manager Manager

Helper for local development of SillyTavern extensions.

## Real features

* Open the extension for editing in your IDE with a single click! And then 4 more clicks and a paste.

## Imaginary features

* Create a new local extension
* Convert local-only extensions to distributable, updatable extensions
* Convert shallow git clones of installed extensions to full editable copies
* Clone a starter template for a new extension
* Configure the extension's manifest
* Sort and filter the list of extensions
* Extension tagging and categorisation
* Button to prompt Coding Sensei to write the extension for you

## Usage

From Extensions Manager, click the folder icon next to the extension you want to edit. 
Click the copy icon to copy the path or IDE opener command to the clipboard.

## Requirements

SillyTavern 1.12.8 and above.

## How to install

Use this URL with the [extension installer](https://docs.sillytavern.app/extensions/):

```
https://github.com/ceruleandeep/SillyTavern-ExtensionsManagerManager
```

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
