# node-red-contrib-ui-contextmenu
A Node-RED node to display a popup contextmenu in the Node-RED dashboard

Special thanks to [Stephen McLaughlin](https://github.com/Steve-Mcl), my partner in crime for this node!

## Install
Run the following npm command in your Node-RED user directory (typically ~/.node-red):
```
npm install bartbutenaers/node-red-contrib-ui-contextmenu
```

***!!!!! USE THE ABOVE COMMAND TO INSTALL IT DIRECTLY FROM GITHUB (NOT AVAILABLE ON NPM YET) !!!!***

***!!!!! ONLY USE IT FOR TESTING PURPOSES !!!!***

***!!!!! PROBABLY THE API WILL BE CHANGED SOON, WHICH MEANS SVG DATA WILL BE LOST !!!!***

***!!!!! HAVE A LOOK AT THE ISSUES LIST (ABOVE), BEFORE REGISTERING A NEW ISSUE !!!!***

## Node usage
Although this node can display a context menu on top of any other dashboard widget, in fact we implemented this node to be used in combination with our [node-red-contrib-ui-svg](https://github.com/bartbutenaers/node-red-contrib-ui-svg) node.

Therefore the demo will explain how both nodes can be combined to show a context menu on top of a vector graphics drawing in the Node-RED dashboard:

![svg flow](https://user-images.githubusercontent.com/14224149/65722072-c45d7780-e0ab-11e9-99fd-1c0068566d53.png)

1. The SVG node display a vector graphics drawing in the Node-RED dashboard, including a clickable light-bulb icon.
1. As soon as the user clicks the light-bulb icon, the SVG node will send an output message (incl. ```msg.position``` which contains the X/Y position of the mouse click)!
1. The message enters the contextmenu-node and will trigger a contextmenu popup displayed at the location specified in ```msg.position```.  Remark: it would make more sense to determine the list of context menu items, based on the ```msg.topic``` which contains the information about which SVG element has been clicked).
1. As soon as the user clicks on one of the menu items, the contextmenu-node will send an output message (containing information about the clicked menu item).
1. The next nodes in the flow can handle the clicked menu item ...

A short demo to demonstrate the result:

![contextmenu_demo](https://user-images.githubusercontent.com/14224149/65722808-587c0e80-e0ad-11e9-91cb-8ad14510f03f.gif)

## Node properties

### Font size
The font size of the menu items 

### Position
Specify how the position of the context menu on the screen will be specified:

+ *Message Based*: The input message must contain a ```msg.position.x``` and a ```msg.position.y``` field, which allows dynamic positions.

+ *Fixed*: Two input fields will be displayed (X Coordinate and Y Coordinate), to enter the fixed coordinates.

### Menu
Specify how the menu items of the context menu will be specified:

+ *Message Based*: when selected, the input message must contain a ```msg.menu``` field which holds the menu items.

   An example input message:
   ```
   "menu": {
        "edit": {
            "name": "Edit",
            "icon": "fa-edit",
            "topic": "edit",
            "payload": [1,2,3,4,5],
            "payloadType": "JSON"
        },
        "cut": {
            "name": "Cut",
            "icon": "fa-cut",
            "topic": "cut",
            "payload": "cut",
            "payloadType": "str"
        },
        "sep1": "---------",
        "quit": {
            "name": "Quit",
            "icon": "fa-quit"
        },
        "sep2": "---------",
        "fold1": {
            "name": "Sub group",
            "items": {
                "fold1-key1": { "name": "fred"  },
                "fold1-key2": { "name": "george"}
            }
        }
   }
   ```

+ *Fixed*: A table will be displayed, to enter the menu items.  The following properties can be set for every menu item:
   + *ID*: The id of the menu item (which won't be displayed).
   + *Label*: The label that will be displayed in the context menu.
   + *Icon*: The FontAwesome icon that will be displayed in the context menu.
   + *Topic*: The ```msg.topic``` that will be send in the output message.
   + *Payload*: The ```msg.payload``` that will be send in the output message.
   
The message-based approach has the advantage that it offers both ***separators*** and ***nested menu items***, which is currently not available in the config screen!

The label an icon are both optional.  This means you can use both or only one of them, to achieve various effects.

### Output message
As soon as a menu item has been clicked, an output message will be send.  It is up to the next nodes in the flow, to determine how the menu item should be handled.  

The output message will contain following fields:
+ *payload*: This will contain the payload value that has been specified in the menu item, or by default a string containing the key of clicked item.
+ *topic*: This will contain the topic value that has been specified in the menu item, or by default a string containing the key of clicked item.
