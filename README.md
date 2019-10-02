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

```diff
! CAUTION: The context menu will only appear when the dashboard group (see config screen) is currently visible !
```

A short demo to demonstrate the result:

![contextmenu_demo](https://user-images.githubusercontent.com/14224149/65722808-587c0e80-e0ad-11e9-91cb-8ad14510f03f.gif)

## Node properties

### Font size
The font size of the menu items 

### Position
Specify how the position of the context menu on the screen will be specified:

+ *Message Based*: The input message must contain a ```msg.position.x``` and a ```msg.position.y``` field, which allows dynamic positions.

+ *Fixed*: Two input fields will be displayed (X Coordinate and Y Coordinate), to enter the fixed coordinates.

### Output To
Specify where the payload output from clicking a menu item should appear in the `msg`. 
NOTE: for a *msg based menu*, this can be set per menu item via the property `outputField` (see Message Based example below)

### Menu
Specify how the menu items of the context menu will be specified:

+ *Message Based*: when selected, the input message must contain a ```msg.menu``` field which holds the array of menu items.

   An example input message:
   ```
   "menu": [
                {
                    "text": "Options",
                    "icon": "fa-list",
                    "sub": [
                        {
                            "text": "Edit",
                            "icon": "fa-edit",
                            "topic": "edit",
                            "payload": [ 1, 2, 3, 4, 5 ],
                            "payloadType": "JSON",
                            "outputField" : "editArray"
                        },
                        {
                            "text": "Cut",
                            "icon": "fa-cut",
                            "enabled": true,
                            "topic": "cut",
                            "payload": "true",
                            "payloadType": "bool"
                        }
                    ]
                },
                {
                    "text": "---"
                },
                {
                    "text": "Delete",
                    "icon": "fa-trash",
                    "enabled": true,
                    "payload": "12",
                    "payloadType": "num"
                },
                {
                    "text": "---"
                },
                {
                    "text": "Quit",
                    "icon": "fa-times",
                    "enabled": false
                }
            ]
   ```
   
   Example flow with nested sub-menu:
   
   ![nested menu flow](https://user-images.githubusercontent.com/14224149/66081594-9626de80-e568-11e9-96b0-0c70006202d4.png)
   
   ```
   [{"id":"fd05877e.cb0588","type":"ui_svg_graphics","z":"60ad596.8120ba8","group":"9f5b4cff.15cd3","order":1,"width":"14","height":"10","svgString":"<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:svg=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" preserveAspectRatio=\"none\" x=\"0\" y=\"0\" viewBox=\"0 0 900 710\" width=\"100%\" height=\"100%\">\n  <rect id=\"svgEditorBackground\" x=\"0\" y=\"0\" width=\"900\" height=\"710\" style=\"fill:none;stroke:none;\" />\n  <image width=\"889\" height=\"703\" id=\"background\" xlink:href=\"https://www.roomsketcher.com/wp-content/uploads/2016/10/1-Bedroom-Floor-Plans.jpg\" />\n  <circle id=\"mycircle\" cx=\"182.901\" cy=\"91.4841\" style=\"fill:rosybrown;stroke:black;stroke-width:1px;\" r=\"48\" /></svg>","clickableShapes":[{"targetId":"#mycircle","action":"click","payload":"camera_living","payloadType":"str","topic":"camera_living"}],"smilAnimations":[],"bindings":[{"selector":"#banner","bindSource":"payload.title","bindType":"text","attribute":""},{"selector":"#camera_living","bindSource":"payload.position.x","bindType":"attr","attribute":"x"},{"selector":"#camera_living","bindSource":"payload.camera.colour","bindType":"attr","attribute":"fill"}],"showCoordinates":false,"autoFormatAfterEdit":false,"outputField":"","editorUrl":"http://drawsvg.org/drawsvg.html","directory":"","name":"","x":920,"y":120,"wires":[["a4c84c93.c001d"]]},{"id":"c65edd5a.1c031","type":"ui_context_menu","z":"60ad596.8120ba8","group":"9f5b4cff.15cd3","order":5,"width":0,"height":-1,"fontSize":16,"position":"msg","outputField":"payload","xCoordinate":50,"yCoordinate":50,"menu":"msg","menuItems":[],"colors":"native","textColor":"#000000","backgroundColor":"#ffffff","borderColor":"#626262","name":"","x":1360,"y":120,"wires":[[]]},{"id":"a4c84c93.c001d","type":"change","z":"60ad596.8120ba8","name":"","rules":[{"t":"set","p":"menu","pt":"msg","to":"[{\"text\":\"Options\",\"icon\":\"fa-list\",\"sub\":[{\"text\":\"Edit\",\"icon\":\"fa-edit\",\"topic\":\"edit\",\"payload\":[1,2,3,4,5],\"payloadType\":\"JSON\",\"outputField\":\"editArray\"},{\"text\":\"Cut\",\"icon\":\"fa-cut\",\"enabled\":true,\"topic\":\"cut\",\"payload\":\"true\",\"payloadType\":\"bool\"}]},{\"text\":\"---\"},{\"text\":\"Delete\",\"icon\":\"fa-trash\",\"enabled\":true,\"payload\":\"12\",\"payloadType\":\"num\"},{\"text\":\"---\"},{\"text\":\"Quit\",\"icon\":\"fa-times\",\"enabled\":false}]","tot":"json"}],"action":"","property":"","from":"","to":"","reg":false,"x":1140,"y":120,"wires":[["c65edd5a.1c031"]]},{"id":"9f5b4cff.15cd3","type":"ui_group","z":"","name":"Floorplan test","tab":"dabfe25b.13bc1","disp":true,"width":"14","collapse":false},{"id":"dabfe25b.13bc1","type":"ui_tab","z":"","name":"SVG","icon":"dashboard","disabled":false,"hidden":false}]
   ```
   
   + Nested menus are possible when the menu is supplied by `msg.menu`
   + *text*: The label that will be displayed in the context menu. NOTE: To create a separator, use "---" as the text value (all other fields can be left blank).
   + *icon*: (optional) The FontAwesome icon that will be displayed in the context menu.
   + *sub*: (optional) An array of sub menu items
   + *topic*: (optional) The `msg.topic` that will be send in the output message. If left empty, `topic` will default the the `path` of this menu item.
   + *payload*: The `msg.payload` that will be send in the output message. If left empty, `message` will default the the `text` of this menu item.
   + *payloadType*: The type of `msg.payload`. Allowable types are 'JSON', 'str', 'bool', 'num'. `payload` will be converted to this type.
   + *outputField*: (optional) It is possible to override the "Output to" field. This property will permit the `payload` to be send to an alternative property of `msg` 
   + ** *text* is the only** mandatory field.  

+ *Fixed*: A table will be displayed, to enter the menu items.  The following properties can be set for every menu item:
   + *ID*: The id of the menu item (which won't be displayed).
   + *Label*: The label that will be displayed in the context menu. Set the Label to "---" to create a seperator (all other fields can be left blank). 
   + *Icon*: The FontAwesome icon that will be displayed in the context menu.
   + *Topic*: The `msg.topic` that will be send in the output message.
   + *Payload*: The `msg.payload` that will be send in the output message.  NOTE: if the "Output to" field is set to something other than "payload", then the output will appear in that property of `msg` 
   
The message-based approach has the advantage that it offers ***nested menu items***, which is currently not available in the config screen!

The label an icon are both optional.  This means you can use both or only one of them, to achieve various effects.

### Menu
Specify how the colors of the context menu should look like:

+ *Native*: The default CSS colors of this node will be used.
+ *Custom*: Three color pickers will be displayed, which allow you to specify your custom colors.
+ *Match dashboard theme*: The colors of the currently selected dashboard theme will be used.

### Output message
As soon as a menu item has been clicked, an output message will be send.  It is up to the next nodes in the flow, to determine how the menu item should be handled.  

The output message will contain following fields:
+ *payload*: This will contain the payload value that has been specified in the menu item, or by default a string containing the key of clicked item. NOTE: if the "Output to" field is set to something other than "payload", then the output will appear in that property of `msg`. This can also be overriden per menu item by setting `outputField` in the menu item
+ *topic*: This will contain the topic value that has been specified in the menu item, or by default a string containing the path of menu clicked item.


### Thanks to
dsaul whose menu this node is based on https://github.com/dsaul/contextmenujs/
