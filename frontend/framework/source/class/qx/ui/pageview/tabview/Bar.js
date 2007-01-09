/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html
     EPL 1.0: http://www.eclipse.org/org/documents/epl-v10.php     

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_tabview)

************************************************************************ */

qx.OO.defineClass("qx.ui.pageview.tabview.Bar", qx.ui.pageview.AbstractBar,
function()
{
  qx.ui.pageview.AbstractBar.call(this);

  this.setZIndex(2);
});

qx.OO.changeProperty({ name : "appearance", type : "string", defaultValue : "tab-view-bar" });
