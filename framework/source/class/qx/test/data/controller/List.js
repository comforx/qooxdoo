/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.data.controller.List", 
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    setUp : function()
    {
      this.__list = new qx.ui.form.List();
    },


    tearDown : function()
    {
      this.__controller = null;
      this.__model = null;
      this.__data = null;
      this.__list.dispose();
    },
    
    __setUpString: function(attribute) {
      this.__data = ["a", "b", "c", "d", "e"];
      // create a new array
      this.__model = new qx.data.Array(this.__data);
      
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list);     
    },
    
    
    testStringArray: function() {
      this.__setUpString();
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }
    },
    
    
    testStringElementRemove: function() {
      this.__setUpString();
      
      // remove the last elements
      this.__data.shift();
      this.__model.shift();
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }    
      // check the length  
      this.assertEquals(this.__data.length, this.__list.getChildren().length, "Wrong length!");
    },
    
    
    testStringElementAdd: function() {
      this.__setUpString();
      
      // remove the last elements
      this.__data.unshift("A");
      this.__model.unshift("A");
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }    
      // check the length  
      this.assertEquals(this.__data.length, this.__list.getChildren().length, "Wrong length!");
    },
    
    
    testChangeElement: function() {
      this.__setUpString();
      
      // change one element
      this.__data[0] = "A";
      this.__model.setItem(0, "A");
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }            
    },
    
    
    testChangeModelSmaller: function() {
      this.__setUpString();
      
      // change one element
      this.__data = ["f", "g", "h", "i"];
      this.__model = new qx.data.Array(this.__data);
      this.__controller.setModel(this.__model);
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }      
      // check the length  
      this.assertEquals(this.__data.length, this.__list.getChildren().length, "Wrong length!");      
    },
    
    
    testChangeModelBigger: function() {
      this.__setUpString();
      
      // change one element
      this.__data = ["f", "g", "h", "i", "j", "k"];
      this.__model = new qx.data.Array(this.__data);
      this.__controller.setModel(this.__model);
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }      
      // check the length  
      this.assertEquals(this.__data.length, this.__list.getChildren().length, "Wrong length!");      
    },
    
    
    testChangeTarget: function() {
      this.__setUpString();

      var list = new qx.ui.form.List();
      
      // change the target
      this.__controller.setTarget(list);
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }      
      // check the length of the old list
      this.assertEquals(0, this.__list.getChildren().length, "Wrong length!");            
    },
    
    
    testReverse: function() {
      this.__setUpString();
      
      // reverse the datas
      this.__data.reverse();
      this.__model.reverse();
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "Binding " + i + " is wrong!");
      }      
    },
    
    
    testBooleanArray: function() {
      this.__data = [true, false, false];
      // create a new array
      this.__model = new qx.data.Array(this.__data);
      
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list);    
      
      var checkArray = ["true", "false", "false"]; 
      // check the binding
      for (var i = 0; i < checkArray.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(checkArray[i], label, "Boolean-Binding " + i + " is wrong!");
      }
    },
    
    
    testNumberArray: function() {
      this.__data = [10, 20, -1, 50];
      // create a new array
      this.__model = new qx.data.Array(this.__data);
      
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list);
            
      var checkArray = ["10", "20", "-1", "50"]; 
      // check the binding
      for (var i = 0; i < checkArray.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(checkArray[i], label, "Boolean-Binding " + i + " is wrong!");
      }
    },
    
    
    testSelectBox: function() {
      this.__data = ["10", "20", "-1", "50"];
      // create a new array
      this.__model = new qx.data.Array(this.__data);
      
      // create the controller
      var box = new qx.ui.form.SelectBox();
      this.__controller = new qx.data.controller.List(this.__model, box);    
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = box.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "SelectBox-Binding " + i + " is wrong!");
      }
    },
    
    
    testComboBox: function() {
      this.__data = ["10", "20", "-1", "50"];
      // create a new array
      this.__model = new qx.data.Array(this.__data);
      
      // create the controller
      var box = new qx.ui.form.ComboBox();
      this.__controller = new qx.data.controller.List(this.__model, box);
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = box.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i], label, "ComboBox-Binding " + i + " is wrong!");
      }
    },
    
    
    testSelectionSingle: function() {
      this.__setUpString();
      
      // select the first object
      this.__list.addToSelection(this.__list.getChildren()[0]);
      // test the selection
      this.assertEquals(this.__model.getItem(0), this.__controller.getSelection().getItem(0), "Selection does not work.");
    
      // test for the length
      this.assertEquals(1, this.__controller.getSelection().length, "Selection length is wrong.");
      
      // select the second object
      this.__list.addToSelection(this.__list.getChildren()[1]);
      // test the selection
      this.assertEquals(this.__model.getItem(1), this.__controller.getSelection().getItem(0), "Selection does not work.");
    
      // test for the length
      this.assertEquals(1, this.__controller.getSelection().length, "Selection length is wrong.");      
    },
    
    
    testSelectionMultiple: function() {
      this.__setUpString();
      
      // select the second and third object
      this.__list.setSelectionMode("multi");
      this.__list.addToSelection(this.__list.getChildren()[1]);
      this.__list.addToSelection(this.__list.getChildren()[2]);

      // test the selection
      this.assertEquals(this.__model.getItem(1), this.__controller.getSelection().getItem(0), "Selection does not work.");      
      this.assertEquals(this.__model.getItem(2), this.__controller.getSelection().getItem(1), "Selection does not work.");      
      
      // test for the selection length
      this.assertEquals(2, this.__controller.getSelection().length, "Selection length is wrong.");      
    },
    
    
    testSelectionBackSingle: function() {
      this.__setUpString();
      
      // add the first element to the selection
      this.__controller.getSelection().push(this.__model.getItem(0));
      
      // test the selection
      this.assertEquals(this.__model.getItem(0), this.__controller.getSelection().getItem(0), "addToSelection does not work.");
    },
    
    
    testSelectionBackMultiple: function() {
      this.__setUpString();
      
      // select the second and third object
      this.__list.setSelectionMode("multi");    
      
      // add the some elements to the selection
      this.__controller.getSelection().push(this.__model.getItem(1));
      this.__controller.getSelection().push(this.__model.getItem(2));      
      
      // test the selection
      this.assertEquals(this.__model.getItem(1), this.__controller.getSelection().getItem(0), "addToSelection does not work.");
      this.assertEquals(this.__model.getItem(2), this.__controller.getSelection().getItem(1), "addToSelection does not work.");      
    },
    
    
    testSelectionArrayChange: function() {
      this.__setUpString();

      // set the selection in the array
      this.__controller.getSelection().push(this.__model.getItem(0));      
      // test the selection
      this.assertEquals(this.__model.getItem(0), this.__list.getSelection()[0].getLabel(), "Change the selection array does not work.");            
    },
    
    
    testSelectionAfterDelete: function() {
      this.__setUpString();

      // add c to the selection
      this.__controller.getSelection().push("c");
      // remove the c
      this.__model.splice(2, 1);
      
      // check if the selection is empty
      this.assertEquals(0, this.__controller.getSelection().length, "Remove from selection does not work!");

      // add b to the selection
      this.__controller.getSelection().push("b");
      // remove the first element of the controller 'a'
      this.__model.shift();

      // check if the selected item in the list is "b"
      this.assertTrue(this.__controller.getSelection().contains("b"), "Selection array wrong!");
      this.assertEquals("b", this.__list.getSelection()[0].getLabel(), "Remove from selection does not work!");      
    },
    
    
    testResetBug: function() {
      this.__setUpString();

      // create the test label
      var label = new qx.ui.basic.Label();
      this.__controller.bind("selection[0]", label, "content");
      
      // add stuff to the selection  
      this.__controller.getSelection().push("c");

      // remove the first element of the controller 'a'
      this.__model.shift();
      this.__model.shift();
      
      // check for the label
      this.assertEquals("c", label.getContent(), "Label has not the right value.");
      
      // remove the selected element
      this.__model.shift();

      // check for null
      this.assertNull(label.getContent(), "Label does still contain something!");
    },
    
    
    testDates: function() {
      this.__data = [new Date(0), new Date(100)];
      // create a new array
      this.__model = new qx.data.Array(this.__data);
      
      // create the controller
      this.__controller = new qx.data.controller.List(this.__model, this.__list);    
      
      // check the binding
      for (var i = 0; i < this.__data.length; i++) {
        var label = this.__list.getChildren()[i].getLabel();
        this.assertEquals(this.__data[i].toString(), label, "Date-Binding " + i + " is wrong!");
      }  
    }
  }
});
