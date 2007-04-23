/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_core)
#optional(qx.ui.form.Button)
#embed(qx.icontheme/16/actions/format-color.png)

************************************************************************ */

qx.Class.define("qx.manager.object.ColorManager",
{
  type : "singleton",
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Stores the objects
    this.__themedObjects = {};

    // Create empty themed color map
    this.__themedColors = {};
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    colorTheme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyColorTheme",
      event : "changeColorTheme"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      COLOR VALUE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Processing a color and handle callback execution on theme updates.
     *
     * @param obj {Object} Any object
     * @param callback {String} Name of callback function which handles the
     *   apply of the resulting CSS valid value.
     * @param value {var} Any acceptable color value
     * @return {void}
     */
    connect : function(callback, obj, value)
    {
      // Store references for themed colors
      var key = "color" + obj.toHashCode() + "$" + qx.core.Object.toHashCode(callback);
      var reg = this.__themedObjects;

      if (value && this.__themedColors[value])
      {
        // Store reference for themed values
        reg[key] = { callback : callback, object : obj, value : value };
      }
      else if (reg[key])
      {
        // In all other cases try to remove previously created references
        delete reg[key];
      }

      // Finally executing given callback
      // Themed colors are able to overwrite the values of named and system colors
      // Simple return of all other named, system, hex, RGB strings
      // Validation is not done here.
      callback.call(obj, value ? this.__themedColors[value] || value : null);
    },

    themedColorToRgb : function(value) {
      return this.__themedColors[value];
    },

    isThemedColor : function(value) {
      return this.__themedColors[value] !== undefined;
    },






    /*
    ---------------------------------------------------------------------------
      COLOR THEME HANDLING
    ---------------------------------------------------------------------------
    */

    _applyColorTheme : function(value, old)
    {
      // Generating RGB strings from themed colors
      this._generateRgbStrings(value);

      // Inform objects which have registered
      // regarding the theme switch
      this._updateThemedObjects();
    },

    _generateRgbStrings : function(value)
    {
      var dest = this.__themedColors = {};

      if (value)
      {
        var source = value.colors;
        var util = qx.util.ColorUtil;

        for (var key in source) {
          dest[key] = util.rgbToRgbString(source[key]);
        }
      }
    },

    _updateThemedObjects : function()
    {
      var reg = this.__themedObjects;
      var dest = this.__themedColors;
      var entry;

      for (var key in reg)
      {
        entry = reg[key];
        entry.callback.call(entry.object, dest[entry.value]);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__themedObjects", "__themedColors");
  }
});
