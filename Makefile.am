AUTOMAKE_OPTIONS = foreign
ACLOCAL_AMFLAGS = -I m4 ${ACLOCAL_FLAGS}

SUBDIRS = src po

include include.mk

zip-file: all
	rm -Rf "$(builddir)/_build"
	rm -Rf "$(builddir)/zip-files"
	$(MKDIR_P) "$(builddir)/_build"; \
	$(MKDIR_P) "$(builddir)/zip-files"; \
	$(MAKE) install DESTDIR="$(abs_builddir)/_build"; \
	mv "$(builddir)/_build/$(extensiondir)" "$(builddir)/_build"/; \
	cp -r "$(builddir)/_build$(datadir)/locale" "$(builddir)/_build/$(uuid)"; \
	(cd "$(builddir)/_build/$(uuid)"; \
	zip -qr "$(abs_builddir)/zip-files/$(uuid).zip" .; \
	); \
	rm -Rf $(builddir)/_build

local_prefix = $(HOME)/.local/share/gnome-shell/extensions

local-install: zip-file
	zip_file="$(abs_builddir)/zip-files/$(uuid).zip"; \
	if [ -d "$(local_prefix)/$(uuid)" ]; then \
		rm -Rf "$(local_prefix)/$(uuid)"; \
	fi; \
	$(MKDIR_P) $(local_prefix)/$(uuid); \
	(cd $(local_prefix)/$(uuid); \
	unzip -q $${zip_file}; \
	);
