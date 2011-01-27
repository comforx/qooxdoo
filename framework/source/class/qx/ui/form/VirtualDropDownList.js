/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * A drop-down (popup) widget which contains a virtual list for selection.
 * 
 * @childControl list {qx.ui.list.List} The virtual list.
 */
qx.Class.define("qx.ui.form.VirtualDropDownList",
{
  extend  : qx.ui.popup.Popup,


  /**
   * Creates the drop-down list.
   * 
   * @param target {qx.ui.form.AbstractVirtualPopupList} The composite widget.
   */
  construct : function(target)
  {
    qx.core.Assert.assertNotNull(target, "Invalid parameter 'target'!");
    qx.core.Assert.assertNotUndefined(target, "Invalid parameter 'target'!");
    qx.core.Assert.assertInterface(target, qx.ui.form.AbstractVirtualPopupList, "Invalid parameter 'target'!");

    this.base(arguments, new qx.ui.layout.VBox());

    this._target = target;

    var list = this._createChildControl("list");
    list.getSelection().addListener("change", this._onListChangeSelection, this);
    list.addListener("mousedown", this._handleMouse, this);

    this.addListener("changeVisibility", this.__onChangeVisibility, this);

    this.initSelection(new qx.data.Array());
  },


  properties :
  {
    // overridden
    autoHide :
    {
      refine : true,
      init : false
    },

    
    // overridden
    keepActive :
    {
      refine : true,
      init : true
    },


    /** Current selected items. */
    selection :
    {
      check : "qx.data.Array",
      event : "changeSelection",
      apply : "_applySelection",
      nullable : false,
      deferredInit : true
    }
  },


  members :
  {
    /** {qx.ui.form.AbstractVirtualPopupList} The composite widget. */
    _target : null,

    
    /** {var} The pre-selected model item. */
    _preselected : null,

    
    /** {Boolean} Indicator to ignore selection changes from the {@link #selection} array. */ 
    __ignoreSelection : false,


    /** {Boolean} Indicator to ignore selection changes from the list. */
    __ignoreListSelection : false,


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "list":
          control = new qx.ui.list.List().set({
            focusable: false,
            keepFocus: true,
            height: null,
            width: null,
            maxHeight: this._target.getMaxListHeight(),
            selectionMode: "one",
            quickSelection: true
          });

          this.add(control, {flex: 1});
          break;
      }

      return control || this.base(arguments, id);
    },



    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */


    /**
     * Shows the list drop-down.
     */
    open : function()
    {
      this.placeToWidget(this._target, true);
      this.show();
    },


    /**
     * Hides the list drop-down.
     */
    close : function() {
      this.hide();
    },


    /**
     * Toggles the drop-down visibility.
     */
    toggle : function()
    {
      if (this.isVisible()) {
        this.close();
      } else {
        this.open();
      }
    },


    /**
     * Selects the first item from the list.
     */
    selectFirst : function()
    {
      var model = this.getChildControl("list").getModel();
      this.__select(model, 0);
    },


    /**
     * Selects the last item from the list.
     */
    selectLast : function()
    {
      var model = this.getChildControl("list").getModel();
      this.__select(model, model.getLength() - 1);
    },


    /**
     * Selects the previous item from the list, depends on which item is currently
     * selected item.
     */
    selectPrevious : function()
    {
      var model = this.getChildControl("list").getModel();
      
      if (model.contains(this.getSelection().getItem(0)))
      {
        var index = model.indexOf(this.getSelection().getItem(0));
        index = index - 1;
        
        if (index < 0) {
          index = 0;
        }
        
        this.__select(model, index);
      }
    },


    /**
     * Selects the next item from the list, depends on which item is currently
     * selected item.
     */
    selectNext : function()
    {
      var model = this.getChildControl("list").getModel();
      var index = model.indexOf(this.getSelection().getItem(0));
      
      if (model.contains(this.getSelection().getItem(0)))
      {
        var index = model.indexOf(this.getSelection().getItem(0));
        index = index + 1;
        
        if (index >= model.getLength()) {
          index = model.getLength() - 1;
        }
        
        this.__select(model, index);
      }
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    
    // property apply
    _applySelection : function(value, old)
    {
      value.addListener("change", this.__onChangeSelection, this);
      
      if (old != null) {
        old.removeListener("change", this.__onChangeSelection, this);
      }

      this.__synchronizeSelection(value, this.getChildControl("list").getSelection(value));
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */


    /**
     * Handles the complete keyboard events dispatched on the widget.
     * 
     * @param event {qx.event.type.KeySequence} The keyboard event.
     */
    _handleKeyboard : function(event)
    {
      if (this.isVisible() && event.getKeyIdentifier() === "Enter") {
        this.__selectPreselected();
        return;
      }

      var clone = event.clone();
      clone.setTarget(this.getChildControl("list"));
      clone.setBubbles(false);

      this.getChildControl("list").dispatchEvent(clone);
    },


    /**
     * Handles all mouse events dispatched on the widget.
     * 
     * @param event {qx.event.type.Mouse} The mouse event.
     */
    _handleMouse : function(event) {
      this.__selectPreselected();
    },
    
    
    /**
     * Handler for the local selection change. The method is responsible for
     * the synchronization between the own selection and the selection
     * form the list.
     * 
     * @param event {qx.event.type.Data} The data event.
     */
    __onChangeSelection : function(event)
    {
      if (this.__ignoreSelection) {
        return;
      }

      var selection = this.getSelection();
      var listSelection = this.getChildControl("list").getSelection();

      this.__ignoreListSelection = true;
      this.__synchronizeSelection(selection, listSelection);
      this.__ignoreListSelection = false;

      this.__ignoreSelection = true;
      this.__synchronizeSelection(listSelection, selection);
      this.__ignoreSelection = false;
    },
    
    
    /**
     * Handler for the selection change on the list. The method is responsible for
     * the synchronization between the list selection and the own selection.
     * 
     * @param event {qx.event.type.Data} The data event.
     */
    _onListChangeSelection : function(event)
    {
      if (this.__ignoreListSelection) {
        return;
      }
      
      var listSelection = this.getChildControl("list").getSelection();
      var model = this.getChildControl("list").getModel();
      
      if (this.isVisible()) {
        this._preselected = listSelection.getItem(0);
      } else {
        this.__ignoreSelection = true;
        this.__synchronizeSelection(listSelection, this.getSelection());
        this.__ignoreSelection = false;
      }
    },
    
    
    /**
     * Handler for the own visibility changes. The method is responsible that
     * the list selects the current selected item.
     * 
     * @param event {qx.event.type.Data} The event.
     */
    __onChangeVisibility : function(event)
    {
      if (this.isVisible())
      {
        var selection = this.getSelection();
        var listSelection = this.getChildControl("list").getSelection();
        this.__synchronizeSelection(selection, listSelection);
      }
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */
    
    
    /**
     * Helper method to select passed index form the model.
     * 
     * @param model {qx.data.Array} The model for selection.
     * @param index {Integer} Index to select.
     */
    __select : function(model, index)
    {
      var selection = this.getSelection();
      
      if (model.getLength() > index)
      {
        var item = model.getItem(index);
        
        if (!selection.contains(item)) {
          selection.splice(0, 1, item);
        }
      }
    },
    
    
    /**
     * Helper method to select the current preselected item, 
     * also closes the drop-down.
     */
    __selectPreselected : function()
    {
      if (this._preselected != null)
      {
        var selection = this.getSelection();
        selection.splice(0, 1, this._preselected);
        this.close();
      }
    },


    /**
     * Helper method to synchronize both selection. The target selection
     * has the same selection like the source selection after the synchronization.
     * 
     * @param source {qx.data.Array} The source selection.
     * @param target {qx.data.Array} The target selection.
     */
    __synchronizeSelection : function(source, target)
    {
      if (source.equals(target)) {
        return;
      }
      
      var nativeArray = target.toArray();
      
      qx.lang.Array.removeAll(nativeArray);
      for (var i = 0; i < source.getLength(); i++) {
        nativeArray.push(source.getItem(i));
      }
      target.length = nativeArray.length;

      if (target.getLength() > 0)
      {
        var lastIndex = target.getLength() - 1;
        target.splice(lastIndex, 1, target.getItem(lastIndex));
      } else {
        target.removeAll();
      }
    }
  }
});
