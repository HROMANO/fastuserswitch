include $(top_srcdir)/include.mk

dist_extension_DATA = extension.js convenience.js
nodist_extension_DATA = metadata.json $(EXTRA_EXTENSION)

EXTRA_DIST = metadata.json.in

metadata.json: metadata.json.in $(top_builddir)/config.status
	$(AM_V_GEN) sed \
		-e "s|[@]extension_id@|$(extension_id)|" \
		-e "s|[@]uuid@|$(uuid)|" \
		-e "s|[@]gettext_domain@|$(extension_id)|" \
		-e "s|[@]shell_versions@|$(shell_versions)|" \
		-e "s|[@]extension_version@|$(extension_version)|" \
		-e "s|[@]url@|$(extension_url)|" \
		$< > $@

CLEANFILES = metadata.json
