/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.tree.FolderOpenButton",
{
  extend : qx.ui.basic.Image,
  include : qx.ui.core.MExecutable,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.initOpen();

    this.addListener("keydown", this._onKeydown);
    this.addListener("click", this._onClick);
    this.addListener("mousedown", this._stopPropagation, this);
    this.addListener("mouseup", this._stopPropagation, this);
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    open :
    {
      check : "Boolean",
      init : false,
      event : "changeOpen",
      apply : "_applyOpen"
    },

    appearance :
    {
      refine : true,
      init : "folder-open-button"
    }
  },


  members :
  {
    _applyOpen : function(value, old)
    {
      value ? this.addState("opened") : this.removeState("opened");
      this.execute();
    },


    /**
     * Listener method for "keydown" event.<br/>
     * Removes "abandoned" and adds "pressed" state
     * for the keys "Enter" or "Space"
     *
     * @type member
     * @param e {qx.ui.event.KeySequence} Key event
     */
    _onKeydown : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Enter":
        case "Space":
          this.toggleOpen();
          e.stopPropagation();
      }
    },


    _stopPropagation : function(e) {
      e.stopPropagation();
    },


    /**
     * Mouse click event listener
     *
     * @param e {qx.ui.event.Mouse} Mouse event
     */
    _onClick : function(e) {
      this.toggleOpen();
      e.stopPropagation();
    }
  }
});
