/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';

const { GObject, St } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Gio = imports.gi.Gio;

const Util = imports.misc.util;

const _ = ExtensionUtils.gettext;

const GLib = imports.gi.GLib;


const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Wireguard Indicator'));

        let gicon = Gio.icon_new_for_string(Me.path + "/wireguard_logo.png");


        this.add_child(new St.Icon({
            gicon,
            style_class: 'wireguard-logo'
        }));


        let item0 = new PopupMenu.PopupMenuItem(_('Check my ip'));
        item0.connect('activate', () => {
            Util.spawn(['/bin/bash', '-c', 'curl ifconfig.me | xargs notify-send '])
        });
        this.menu.addMenuItem(item0);

        let item1 = new PopupMenu.PopupMenuItem(_('Activate Wireguard'));
        item1.connect('activate', () => {
            Util.spawn(['/bin/bash', '-c', "pkexec wg-quick up wg0 "])
            Main.notify(_('Wireguard up'));
        });
        this.menu.addMenuItem(item1);

        let item2 = new PopupMenu.PopupMenuItem(_('Deactivate Wireguard'));
        item2.connect('activate', () => {
            Util.spawn(['/bin/bash', '-c', "pkexec wg-quick down wg0 "])
            Main.notify(_('Wireguard down'));
        });
        this.menu.addMenuItem(item2);
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
