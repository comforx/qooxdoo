/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 David Pérez Carmona
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * David Perez Carmona (david-perez)
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Provides resizing behavior to any widget.
 */
qx.Mixin.define("qx.ui.core.MResizable",
{
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    // Register listeners
    this.addListener("mousedown", this.__onResizeMouseDown, this, true);
    this.addListener("mouseup", this.__onResizeMouseUp, this);
    this.addListener("mousemove", this.__onResizeMouseMove, this);
    this.addListener("losecapture", this.__onResizeLoseCapture, this);
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Whether the widget is resizable */
    resizable :
    {
      check : "Boolean",
      init : true,
      apply : "_applyResizable"
    },

    /**
     * Which edges are function as resizable handles.
     *
     * Enabled means that all edges are enabled for resizing (Windows mode)
     * Disabled means that only the right/bottom edges are enabled (Mac mode)
     */
    resizeAllEdges :
    {
      check : "Boolean",
      init : true
    },

    /** The tolerance to activate resizing */
    resizeSensitivity :
    {
      check : "Integer",
      init : 8
    },

    /** Whether a frame replacement should be used during the resize sequence */
    useResizeFrame :
    {
      check : "Boolean",
      init : true
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
      CORE FEATURES
    ---------------------------------------------------------------------------
    */

    /**
     * Get the widget, which draws the resize/move frame. The resize frame is
     * shared by all widgets and is added to the root widget.
     *
     * @return {qx.ui.core.Widget} The resize frame
     */
    __getResizeFrame : function()
    {
      var frame = this.__resizeFrame;
      if (!frame)
      {
        frame = this.__resizeFrame = new qx.ui.core.Widget();
        frame.setAppearance("resize-frame");
        frame.exclude();

        qx.core.Init.getApplication().getRoot().add(frame);
      }

      return frame;
    },


    /**
     * Creates, shows and syncs the frame with the widget.
     */
    __showResizeFrame : function()
    {
      var bounds = this.getBounds();
      var frame = this.__getResizeFrame();
      frame.setUserBounds(bounds.left, bounds.top, bounds.width, bounds.height);
      frame.show();
      frame.setZIndex(this.getZIndex()+1);
    },




    /*
    ---------------------------------------------------------------------------
      RESIZE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Computes the new boundaries at each interval
     * of the resize sequence.
     *
     * @param e {qx.event.type.Mouse} Last mouse event
     */
    __computeResizeResult : function(e)
    {
      // Detect mode
      var resizeActive = this._resizeActive;

      // Read size hint
      var hint = this.getSizeHint();

      // Read original values
      var start = this.__resizeStart;
      var width = start.width;
      var height = start.height;
      var left = start.left;
      var top = start.top;

      // North or south
      if (resizeActive&1 || resizeActive&2)
      {
        var diff = e.getDocumentTop() - this.__resizeTop;

        if (resizeActive&1) {
          height -= diff;
        } else {
          height += diff;
        }

        if (height < hint.minHeight) {
          height = hint.minHeight;
        } else if (height > hint.maxHeight) {
          height = hint.maxHeight;
        }

        if (resizeActive&1) {
          top += start.height - height;
        }
      }

      // West or east
      if (resizeActive&4 || resizeActive&8)
      {
        var diff = e.getDocumentLeft() - this.__resizeLeft;

        if (resizeActive&4) {
          width -= diff;
        } else {
          width += diff;
        }

        if (width < hint.minWidth) {
          width = hint.minWidth;
        } else if (width > hint.maxWidth) {
          width = hint.maxWidth;
        }

        if (resizeActive&4) {
          left += start.width - width;
        }
      }

      return {
        left : left,
        top : top,
        width : width,
        height : height
      };
    },


    /** {Map} Maps internal states to cursor symbols to use */
    __resizeCursors :
    {
      1  : "n-resize",
      2  : "s-resize",
      4  : "w-resize",
      8  : "e-resize",

      5  : "nw-resize",
      6  : "sw-resize",
      9  : "ne-resize",
      10 : "se-resize"
    },


    /**
     * Updates the internally stored resize mode
     *
     * @param e {qx.event.type.Mouse} Last mouse event
     */
    __computeResizeMode : function(e)
    {
      var contentLocation = this.getContentLocation();

      var resizeAll = this.getResizeAllEdges();
      var mouseTolerance = this.getResizeSensitivity();

      var mouseLeft = e.getDocumentLeft();
      var mouseTop = e.getDocumentTop();

      var resizeActive = 0;

      if (resizeAll && Math.abs(contentLocation.top - mouseTop) < mouseTolerance) {
        resizeActive += 1;
      } else if (Math.abs(contentLocation.bottom - mouseTop) < mouseTolerance) {
        resizeActive += 2;
      }

      if (resizeAll && Math.abs(contentLocation.left - mouseLeft) < mouseTolerance) {
        resizeActive += 4;
      } else if (Math.abs(contentLocation.right - mouseLeft) < mouseTolerance) {
        resizeActive += 8;
      }

      this._resizeActive = resizeActive;
    },





    /*
    ---------------------------------------------------------------------------
      RESIZE EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for the mouse down event
     *
     * @param e {qx.event.type.Mouse} The mouse event instance
     */
    __onResizeMouseDown : function(e)
    {
      // Check for active resize
      if (!this._resizeActive) {
        return;
      }

      // Add resize state
      this.addState("resize");

      // Enable capturing
      this.capture();

      // Store mouse coordinates
      this.__resizeLeft = e.getDocumentLeft();
      this.__resizeTop = e.getDocumentTop();

      // Cache bounds
      this.__resizeStart = qx.lang.Object.copy(this.getBounds());

      // Show frame if configured this way
      if (this.getUseResizeFrame()) {
        this.__showResizeFrame();
      }

      // Stop event
      e.stop();
    },


    /**
     * Event handler for the mouse up event
     *
     * @type member
     * @param e {qx.event.type.Mouse} The mouse event instance
     * @return {void}
     */
    __onResizeMouseUp : function(e)
    {
      // Check for active resize
      if (!this._resizeActive) {
        return;
      }

      // Hide frame afterwards
      if (this.getUseResizeFrame()) {
        this.__getResizeFrame().exclude();
      }

      // Compute bounds
      var bounds = this.__computeResizeResult(e);

      // Sync with widget
      this.setWidth(bounds.width);
      this.setHeight(bounds.height);

      // Update coordinate in canvas
      this.setLayoutProperties({
        left : bounds.left,
        top : bounds.top
      });

      // Clear mode
      this._resizeActive = 0;

      // Remove resize state
      this.removeState("resize");

      // Reset cursor
      this.resetCursor();

      // Disable capturing
      this.releaseCapture();
    },


    /**
     * Event listener for <code>losecapture</code> event.
     *
     * @param e {qx.event.type.Event} Lose capture event
     */
    __onResizeLoseCapture : function(e)
    {
      // Check for active resize
      if (!this._resizeActive) {
        return;
      }

      // Reset cursor
      this.resetCursor();

      // Remove drag state
      this.removeState("move");

      // Hide frame afterwards
      if (this.getUseMoveFrame()) {
        this.__getMoveFrame().exclude();
      }
    },


    /**
     * Event handler for the mouse move event
     *
     * @type member
     * @param e {qx.event.type.Mouse} The mouse event instance
     * @return {void}
     */
    __onResizeMouseMove : function(e)
    {
      if (this.hasState("resize"))
      {
        var bounds = this.__computeResizeResult(e);

        // Update widget
        if (this.getUseResizeFrame())
        {
          // Sync new bounds to frame
          var frame = this.__getResizeFrame();
          frame.setUserBounds(bounds.left, bounds.top, bounds.width, bounds.height);
        }
        else
        {
          // Update size
          this.setWidth(bounds.width);
          this.setHeight(bounds.height);

          // Update coordinate in canvas
          this.setLayoutProperties({
            left : bounds.left,
            top : bounds.top
          });
        }
      }
      else if (!this.hasState("maximized"))
      {
        this.__computeResizeMode(e);

        var resizeActive = this._resizeActive;
        if (resizeActive) {
          this.setCursor(this.__resizeCursors[resizeActive]);
        } else {
          this.resetCursor();
        }
      }
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__resizeFrame");
  }
});
