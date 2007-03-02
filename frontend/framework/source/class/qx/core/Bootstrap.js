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

#module(core)
#ignore(auto-require)
#ignore(auto-use)
#use(qx.lang.Core)
#use(qx.lang.Generics)
#use(qx.core.Log)
#use(qx.core.Client)
#use(qx.lang.Object)
#use(qx.lang.String)
#use(qx.lang.Array)
#use(qx.lang.Function)

************************************************************************ */

/**
 * Create namespace
 */
qx =
{
  /**
   * Bootstrap qx.Class to create myself later
   * This is needed for the API browser etc. to let them detect me
   */
  Class :
  {
    /**
     * TODOC
     *
     * @type map
     * @param name {var} TODOC
     * @param object {var} TODOC
     * @return {var} TODOC
     */
    createNamespace : function(name, object)
    {
      var splits = name.split(".");
      var parent = window;
      var part = splits[0];

      for (var i=0, len=splits.length - 1; i<len; i++, part=splits[i])
      {
        if (!parent[part]) {
          parent[part] = {};
        }

        parent = parent[part];
      }

      parent[part] = object;

      // return last part name (e.g. classname)
      return part;
    },


    /**
     * TODOC
     *
     * @type map
     * @param name {var} TODOC
     * @param config {var} TODOC
     * @return {void}
     */
    define : function(name, config)
    {
      if (!config) {
        var config = { statics : {} };
      }

      this.createNamespace(name, config.statics);

      if (config.defer) {
        config.defer(config.statics);
      }
    }
  }
};


/**
 * Bootstrap helper class
 */
qx.Class.define("qx.core.Bootstrap",
{
  statics :
  {
    /** Timestamp of qooxdoo based application startup */
    LOADSTART : new Date
  }
});
