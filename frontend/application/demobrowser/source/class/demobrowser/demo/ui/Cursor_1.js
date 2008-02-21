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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.Template",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      doc = new qx.ui.root.Application(document);
      doc.setTextColor("black");
      doc.setBackgroundColor("white");

      var docLayout = new qx.ui.layout.HBox();
      docLayout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(docLayout);

      doc.add(container, 0, 0);

      docLayout.add(this.getGrid1());
    },


    getGrid1 : function()
    {
      var border = new qx.ui.decoration.Basic(1, "solid", "black");

      // auto size
      var box = (new qx.ui.core.Widget).set({decorator: border, backgroundColor: "yellow"});
      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(20);

      var cursors = [
        "default",
        "crosshair",
        "pointer",
        "move",
        "n-resize",
        "ne-resize",
        "e-resize",
        "se-resize",
        "s-resize",
        "sw-resize",
        "w-resize",
        "nw-resize",
        "text",
        "wait",
        "help "
      ];

      var i=0;
      for (var i=0; i<15; i++)
      {
        layout.add(new qx.ui.basic.Label(cursors[i]).set({
          decorator: border,
          backgroundColor: "green",
          cursor: cursors[i],
          padding: 5,
          height: 100,
          width: 100
        }), Math.floor(i/5), i%5);
      }

      box.setLayout(layout);

      return box;
    }

    }
  }
});
