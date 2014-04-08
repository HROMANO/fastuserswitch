AC_INIT([fastuserswitch], [2], [http://github.com/HROMANO/fastuserswitch/])

AC_CONFIG_MACRO_DIR([m4])
AC_CONFIG_AUX_DIR([config])

AM_INIT_AUTOMAKE

GETTEXT_PACKAGE=fastuserswitch
AC_SUBST(GETTEXT_PACKAGE)
AC_DEFINE_UNQUOTED(GETTEXT_PACKAGE, "$GETTEXT_PACKAGE",
                   [The prefix for our gettext translation domain.])

IT_PROG_INTLTOOL

AC_CONFIG_FILES([
  src/Makefile
  Makefile
  po/Makefile.in
])

AC_OUTPUT