/**
 * The scroll layout is used internally by the scroll pane. Is is similar to
 * the {@link qx.ui2.layout.Basic} layout with only one child and the possibility
 * to shrink the content to its min size.
 *
 * @internal
 */
qx.Class.define("qx.ui2.layout.Scroll",
{
  extend : qx.ui2.layout.Abstract,

  properties :
  {
    /**
     * The content widget of the scroll layout.
     */
    content :
    {
      check : "qx.ui2.core.Widget",
      apply : "_applyContent",
      nullable : true
    }
  },

  members :
  {
    // property apply
    _applyContent : function(value, old)
    {
      if (old)
      {
        qx.lang.Array.remove(this._children, old);
        this._removeHelper(old);
      }

      if (value)
      {
        this._children.push(value);
        this._addHelper(value);
      }
    },

    // overridden
    _computeSizeHint : function()
    {
      var hint = this.getContent().getSizeHint();

      return {
        minWidth : 0,
        width : hint.width,
        maxWidth : Infinity,
        minHeight : 0,
        height : hint.height,
        maxHeight : Infinity
      };
    },

    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var content = this.getContent();
      var hint = content.getSizeHint();

      var width = Math.min(hint.width, Math.max(availWidth, hint.minWidth));
      var height = Math.min(hint.height, Math.max(availHeight, hint.minWidth));

      content.renderLayout(0, 0, width, height);
    }
  }
});
