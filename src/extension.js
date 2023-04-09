const {St,AccountsService,GLib,Gdm,GObject,Clutter} = imports.gi;

const AuthPrompt = imports.gdm.authPrompt;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const Gettext = imports.gettext.domain('fastuserswitch');
const _ = Gettext.gettext;


var UserMenuItem = GObject.registerClass(
	{GTypeName: 'FastUserSwitchMenu.UserMenuItem'},
class UserMenuItem extends PopupMenu.PopupBaseMenuItem{

  _init(user_manager, user) {
    super._init();
    this.label = new St.Label({ text: user.get_real_name() });
    this.add(this.label);
    this.label_actor = this.label;
    this.user_manager = user_manager;
    this.user = user;

    let gdmClient = new Gdm.Client();
    this._authPrompt = new AuthPrompt.AuthPrompt(gdmClient, AuthPrompt.AuthPromptMode.UNLOCK_ONLY);
  }

  activate(event) {
    if (this.user.is_logged_in()) {
      log(Date().substring(16,24)+' panel-user-switch/src/extension.js: '+'activate(event) for '+this.user.get_user_name());
      try{
      this._authPrompt.begin({ userName: this.user.get_user_name() });
      }
      catch(err){
        log(Date().substring(16,24)+' panel-user-switch/src/extension.js: '+err);
      }
    } else {
      // In case something is wrong, drop back to GDM login screen
      Gdm.goto_login_session_sync(null);
    }
  }
});

var FastUserSwitchMenu = GObject.registerClass(
	{GTypeName: 'FastUserSwitchMenu.FastUserSwitchMenu' },
 class FastUserSwitchMenu extends PanelMenu.Button{
  _init() {
    super._init(0.0, "Fast user switch");
    let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
    let icon = new St.Icon({ icon_name: 'system-users-symbolic',
                             style_class: 'system-status-icon' });
    hbox.add_child(icon);
    // hbox.add_child(new St.Label({ text: '\u25BE',
    //                               y_expand: true,
    //                               y_align: Clutter.ActorAlign.CENTER }));
    this.add_child(hbox);
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    this._users = [];
    this._items = [];
    this.show();
    this._user_manager = AccountsService.UserManager.get_default();
    if (!this._user_manager.is_loaded) {
      this._user_manager_loaded_id = 
          this._user_manager.connect('notify::is-loaded',this._onUserManagerLoaded.bind(this));
    } else {
      this._onUserManagerLoaded();
    }
  }

  _onSwitchUserActivate() {
    Gdm.goto_login_session_sync(null);
  }
	
  _onUserManagerLoaded() {
    this._users = this._user_manager.list_users();
    this._updateMenu();
    this._user_manager.connect('user-is-logged-in-changed', this._updateMenu.bind(this));
  }

  _updateMenu() {
    this.menu.removeAll();
    this._items = [];
    let user_names = new Array();
    this._users.forEach((item) => {
      if (item.get_user_name() != GLib.get_user_name() && item.is_logged_in()) {
        this._items[item.get_real_name()] = item;
        user_names.push(item.get_real_name());
      }
    });

    user_names.forEach((item) => {
      let menu_item = new UserMenuItem(this._user_manager, this._items[item]);
      this.menu.addMenuItem(menu_item);
    });
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    this._switch_user_item = new PopupMenu.PopupMenuItem(_("Login Screen"));
    this._switch_user_item.connect('activate', this._onSwitchUserActivate.bind(this));
    this.menu.addMenuItem(this._switch_user_item);
  }

  _onDestroy() {
    if (this._user_manager_loaded_id) {
      // this._user_manager_disconnect(this._user_manager_loaded_id); //investigate later
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