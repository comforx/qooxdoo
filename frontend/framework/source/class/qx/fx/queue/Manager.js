/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Jonathan Rass (jonathan_rass)

   ======================================================================

   This class contains code based on the following work:

   * script.aculo.us
       http://script.aculo.us/
       Version 1.8.1

     Copyright:
       (c) 2008 Thomas Fuchs

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Author:
       Thomas Fuchs

************************************************************************ */

/**
 * TODO
 */
qx.Class.define("qx.fx.queue.Manager",
{

  extend : qx.core.Object,

  type : "singleton",

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _instances : {},

    /**
     * Returns existing queue by name or creates a new queue object and returns it.
     * @param queueName {String} Name of queue.
     * @return {Class} The queue object.
     */
    getQueue : function(queueName)
    {
     if(typeof(this._instances[queueName]) == "object") {
       return this._instances[queueName];
     } else {
       return this._instances[queueName] = new qx.fx.queue.Queue;
     }
    },

    getDefaultQueue : function()
    {
      return this.getQueue("__default");
    }

  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeMap("_instances");
  }
});
