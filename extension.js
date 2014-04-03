const Lang = imports.lang;

const St = imports.gi.St;
const AccountsService = imports.gi.AccountsService;
const GLib = imports.gi.GLib;
const Gdm = imports.gi.Gdm;
const AuthPrompt = imports.gdm.authPrompt;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const Gettext = imports.gettext.domain('fastuserswitch');
const _ = Gettext.gettext;

const Clutter = imports.gi.Clutter; // For Clutter.ActorAlign.CENTER

const UserMenuItem = new Lang.Class({
	Name: 'FastUserSwitchMenu.UserMenuItem',
	Extends: PopupMenu.PopupBaseMenuItem,
	
	_init: function(user_manager, user) {
		this.parent();
		this.label = new St.Label({ text: user.get_real_name() });
		this.actor.add(this.label);
		this.actor.label_actor = this.label;
		this.user_manager = user_manager;
		this.user = user;
		
		let gdmClient = new Gdm.Client();
		this._authPrompt = new AuthPrompt.AuthPrompt(gdmClient, AuthPrompt.AuthPromptMode.UNLOCK_ONLY);
	},
	
	activate: function(event) {
		if (this.user.is_logged_in()) {
    		this._authPrompt.begin({ userName: this.user.get_user_name() });
		} else {
			// In case something is wrong, drop back to GDM login screen
			Gdm.goto_login_session_sync(null);
		}
		this.parent(event);
	}
});

const FastUserSwitchMenu = new Lang.Class({
	Name: 'FastUserSwitchMenu.FastUserSwitchMenu',
    Extends: PanelMenu.Button,
	
	_init: function() {
        this.parent(0.0, "Fast user switch");
        let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        let icon = new St.Icon({ icon_name: 'system-users-symbolic',
                                 style_class: 'system-status-icon' });
        hbox.add_child(icon);
        hbox.add_child(new St.Label({ text: '\u25BE',
                                      y_expand: true,
                                      y_align: Clutter.ActorAlign.CENTER }));
        this.actor.add_child(hbox);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
		this._users = [];
		this._items = [];
		this.actor.show();
		this._user_manager = AccountsService.UserManager.get_default();
		if (!this._user_manager.is_loaded) {
			this._user_manager_loaded_id = 
			    this._user_manager.connect('notify::is-loaded',
			        Lang.bind(this, this._onUserManagerLoaded));
		} else {
			this._onUserManagerLoaded();
		}
	},
	
	_onSwitchUserActivate: function() {
		Gdm.goto_login_session_sync(null);
	},
	
	_onUserManagerLoaded: function() {
		this._users = this._user_manager.list_users();
		this._updateMenu();
		this._user_manager.connect('user-is-logged-in-changed',
			Lang.bind(this, function(userManager, user) {
			    this._updateMenu();
		}));
	},
	
	_updateMenu: function() {
		this.menu.removeAll();
		this._items = [];
		let user_names = new Array();
		this._users.forEach(Lang.bind(this, function(item) {
			if (item.get_user_name() != GLib.get_user_name() && item.is_logged_in()) {
			this._items[item.get_real_name()] = item;
			user_names.push(item.get_real_name());
		}}));
		
		user_names.forEach(Lang.bind(this, function(item) {
			let menu_item = new UserMenuItem(this._user_manager, this._items[item]);
			this.menu.addMenuItem(menu_item);
		}));
		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
		this._switch_user_item = new PopupMenu.PopupMenuItem(_("Switch user"));
		this._switch_user_item.connect('activate', Lang.bind(this, this._onSwitchUserActivate));
		this.menu.addMenuItem(this._switch_user_item);
	},
	
	_onDestroy: function() {
		if (this._user_manager_loaded_id) {
			this._user_manager_disconnect(this._user_manager_loaded_id);
			this._user_manager_loaded_id = 0;
		}
		this.destroy();
	}
});

function init() {
	Convenience.initTranslations('fastuserswitch');
}

let _indicator;

function enable() {
	_indicator = new FastUserSwitchMenu();
	Main.panel.addToStatusArea('fastuserswitch-menu', _indicator);
}

function disable() {
	_indicator._onDestroy();
}
