extension_id = $(PACKAGE)
extension_base = @azuri.free.fr
extension_version = $(VERSION)
shell_versions = 3.10

extension_url = http://github.com/HROMANO/$(extension_id)
uuid = $(extension_id)$(extension_base)
gettext_domain = $(extension_id)

extensiondir = $(datadir)/gnome-shell/extensions/$(uuid)
