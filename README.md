# node-red-contrib-ui-contextmenu
A Node-RED node to display a popup contextmenu in the Node-RED dashboard

Special thanks to [Stephen McLaughlin](https://github.com/Steve-Mcl), my partner in crime for this node!

## Install
Run the following npm command in your Node-RED user directory (typically ~/.node-red):
```
npm install node-red-contrib-ui-contextmenu
```
:warning: ***CAUTION:***
+ It is advised to use ***Dashboard version 2.19.4 or above***, to make sure the contextmenu doesn't appear automatically after deploy or refresh.
+ The context menu will ***only appear when its dashboard group (see config screen) is currently visible***!  This is important when being used in combination with other nodes: e.g. an SVG node and ContextMenu node always need to be on the same dashboard group, otherwise the contextmenu will never appear!
+ The output messages from the ***SVG node 2.x.x contains a breaking change***, which will cause context menus not appearing anymore!  See [readme](https://github.com/bartbutenaers/node-red-contrib-ui-svg/) of the SVG node for guidelines.

Remark: all below examples are also available via the Import menu of the Node-RED flow editor.

## Node usage

There are a few common ways to use this node:

+ Basically this node can be used to display a context menu (on top of any other dashboard widget), totally independent of other nodes.  The following flow demonstrates how to show a contextmenu at some location.  Both the location and the menu structure can be fixed or dynamic (via an input message):

   ![Basic flow](https://user-images.githubusercontent.com/14224149/87234469-909cd580-c3d1-11ea-9a1b-862797a2211f.png)
   
   ```
   [{"id":"98f5ee2c.61f16","type":"inject","z":"86187643.ae75e8","name":"Inject menu + position","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"showConfirmation":false,"confirmationLabel":"","x":280,"y":840,"wires":[["131ffbe2.c2f544"]]},{"id":"51a8f9b.d4a2008","type":"change","z":"86187643.ae75e8","name":"","rules":[{"t":"set","p":"position","pt":"msg","to":"{\"x\":100,\"y\":150}","tot":"json"}],"action":"","property":"","from":"","to":"","reg":false,"x":740,"y":840,"wires":[["dc8a767c.3a3d38"]]},{"id":"131ffbe2.c2f544","type":"change","z":"86187643.ae75e8","name":"","rules":[{"t":"set","p":"menu","pt":"msg","to":"[{\"text\":\"Options\",\"icon\":\"fa-list\",\"sub\":[{\"text\":\"Edit\",\"icon\":\"fa-edit\",\"topic\":\"edit\",\"payload\":[1,2,3,4,5],\"payloadType\":\"JSON\",\"outputField\":\"editArray\"},{\"text\":\"Cut\",\"icon\":\"fa-cut\",\"enabled\":true,\"topic\":\"cut\",\"payload\":\"true\",\"payloadType\":\"bool\"}]},{\"text\":\"---\"},{\"text\":\"Delete\",\"icon\":\"fa-trash\",\"enabled\":true,\"payload\":\"12\",\"payloadType\":\"num\"},{\"text\":\"---\"},{\"text\":\"Quit\",\"icon\":\"fa-times\",\"enabled\":false}]","tot":"json"}],"action":"","property":"","from":"","to":"","reg":false,"x":520,"y":840,"wires":[["51a8f9b.d4a2008"]]},{"id":"e5e8a905.5a2448","type":"inject","z":"86187643.ae75e8","name":"Inject menu","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"showConfirmation":false,"confirmationLabel":"","x":530,"y":760,"wires":[["7b5faf00.a6b4a"]]},{"id":"912cb88c.2b6e28","type":"inject","z":"86187643.ae75e8","name":"Inject nothing","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"showConfirmation":false,"confirmationLabel":"","x":750,"y":720,"wires":[["c6b11b3e.1d3508"]]},{"id":"7b5faf00.a6b4a","type":"change","z":"86187643.ae75e8","name":"","rules":[{"t":"set","p":"menu","pt":"msg","to":"[{\"text\":\"Options\",\"icon\":\"fa-list\",\"sub\":[{\"text\":\"Edit\",\"icon\":\"fa-edit\",\"topic\":\"edit\",\"payload\":[1,2,3,4,5],\"payloadType\":\"JSON\",\"outputField\":\"editArray\"},{\"text\":\"Cut\",\"icon\":\"fa-cut\",\"enabled\":true,\"topic\":\"cut\",\"payload\":\"true\",\"payloadType\":\"bool\"}]},{\"text\":\"---\"},{\"text\":\"Delete\",\"icon\":\"fa-trash\",\"enabled\":true,\"payload\":\"12\",\"payloadType\":\"num\"},{\"text\":\"---\"},{\"text\":\"Quit\",\"icon\":\"fa-times\",\"enabled\":false}]","tot":"json"}],"action":"","property":"","from":"","to":"","reg":false,"x":740,"y":760,"wires":[["a1697f44.2f4c8"]]},{"id":"c6b11b3e.1d3508","type":"ui_context_menu","z":"86187643.ae75e8","group":"22787703.a0e968","order":5,"width":0,"height":-1,"fontSize":16,"inputPositionXField":"50","inputPositionXType":"num","inputPositionYField":"60","inputPositionYType":"num","outputField":"payload","inputMenuField":"menu","inputMenuType":"fixed","menuItems":[{"id":"myid","icon":"fa-glass","label":"mylabel","topic":"mytopic","payload":"mypayload","payloadType":"str","visible":true,"enabled":true}],"colors":"native","textColor":"#000000","backgroundColor":"#ffffff","borderColor":"#626262","intervalLength":0,"intervalUnit":"secs","startTimerAtOpen":false,"startTimerAtLeave":true,"stopTimerAtEnter":true,"name":"","x":960,"y":720,"wires":[[]]},{"id":"a1697f44.2f4c8","type":"ui_context_menu","z":"86187643.ae75e8","group":"22787703.a0e968","order":5,"width":0,"height":-1,"fontSize":16,"inputPositionXField":"50","inputPositionXType":"num","inputPositionYField":"60","inputPositionYType":"num","outputField":"payload","inputMenuField":"menu","inputMenuType":"msg","menuItems":[],"colors":"native","textColor":"#000000","backgroundColor":"#ffffff","borderColor":"#626262","intervalLength":0,"intervalUnit":"secs","startTimerAtOpen":false,"startTimerAtLeave":true,"stopTimerAtEnter":true,"name":"","x":960,"y":760,"wires":[[]]},{"id":"66f558a1.128238","type":"inject","z":"86187643.ae75e8","name":"Inject position","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"showConfirmation":false,"confirmationLabel":"","x":530,"y":800,"wires":[["1d3334da.ce9ffb"]]},{"id":"75ccccc.2eca634","type":"ui_context_menu","z":"86187643.ae75e8","group":"22787703.a0e968","order":5,"width":0,"height":-1,"fontSize":16,"inputPositionXField":"position.x","inputPositionXType":"msg","inputPositionYField":"position.y","inputPositionYType":"msg","outputField":"payload","inputMenuField":"menu","inputMenuType":"fixed","menuItems":[{"id":"myid2","icon":"fa-search","label":"mylabel2","topic":"mytopic2","payload":"mypayload2","payloadType":"str","visible":true,"enabled":true}],"colors":"native","textColor":"#000000","backgroundColor":"#ffffff","borderColor":"#626262","intervalLength":0,"intervalUnit":"secs","startTimerAtOpen":false,"startTimerAtLeave":true,"stopTimerAtEnter":true,"name":"","x":960,"y":800,"wires":[[]]},{"id":"dc8a767c.3a3d38","type":"ui_context_menu","z":"86187643.ae75e8","group":"22787703.a0e968","order":5,"width":0,"height":-1,"fontSize":16,"inputPositionXField":"position.x","inputPositionXType":"msg","inputPositionYField":"position.y","inputPositionYType":"msg","outputField":"payload","inputMenuField":"menu","inputMenuType":"msg","menuItems":[],"colors":"native","textColor":"#000000","backgroundColor":"#ffffff","borderColor":"#626262","intervalLength":0,"intervalUnit":"secs","startTimerAtOpen":false,"startTimerAtLeave":true,"stopTimerAtEnter":true,"name":"","x":960,"y":840,"wires":[[]]},{"id":"1d3334da.ce9ffb","type":"change","z":"86187643.ae75e8","name":"","rules":[{"t":"set","p":"position","pt":"msg","to":"{\"x\":100,\"y\":150}","tot":"json"}],"action":"","property":"","from":"","to":"","reg":false,"x":740,"y":800,"wires":[["75ccccc.2eca634"]]},{"id":"22787703.a0e968","type":"ui_group","z":"","name":"Web push notifications","tab":"80f0e178.bbf4a","order":1,"disp":true,"width":"6","collapse":false},{"id":"80f0e178.bbf4a","type":"ui_tab","z":"","name":"Home","icon":"dashboard","order":1,"disabled":false,"hidden":false}]
   ```
   
+ Initially we implemented this node to be used in combination with our [node-red-contrib-ui-svg](https://github.com/bartbutenaers/node-red-contrib-ui-svg) node.  The following flow explains how a context menu can be displayed on top of a vector graphics drawing:

   ![SVG flow](https://user-images.githubusercontent.com/14224149/87234469-909cd580-c3d1-11ea-9a1b-862797a2211f.png)
   ```
   [{"id":"2d30cf4e.41547","type":"ui_svg_graphics","z":"86187643.ae75e8","group":"2908388b.8114b8","order":1,"width":"14","height":"10","svgString":"<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:svg=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" preserveAspectRatio=\"none\" x=\"0\" y=\"0\" viewBox=\"0 -0.05780346691608429 900 710.1156005859375\" width=\"100%\" height=\"100%\">\n  <rect id=\"svgEditorBackground\" x=\"0\" y=\"0\" width=\"900\" height=\"710\" style=\"fill: none; stroke: none;\" />\n  <image width=\"889\" height=\"703\" id=\"background\" xlink:href=\"https://www.roomsketcher.com/wp-content/uploads/2016/10/1-Bedroom-Floor-Plans.jpg\" />\n  <text id=\"light_bulb_kitchen\" style=\"fill:blue;\" x=\"180\" y=\"110\" font-family=\"FontAwesome\" fill=\"blue\" stroke=\"black\" font-size=\"60\" text-anchor=\"middle\" alignment-baseline=\"middle\" stroke-width=\"1\">fa-lightbulb-o </text>\n</svg>","clickableShapes":[{"targetId":"#light_bulb_kitchen","action":"click","payload":"light_icon_clicked","payloadType":"str","topic":"light_icon_clicked"}],"smilAnimations":[],"bindings":[{"selector":"#banner","bindSource":"payload.title","bindType":"text","attribute":""},{"selector":"#camera_living","bindSource":"payload.position.x","bindType":"attr","attribute":"x"},{"selector":"#camera_living","bindSource":"payload.camera.colour","bindType":"attr","attribute":"fill"}],"showCoordinates":false,"autoFormatAfterEdit":false,"showBrowserErrors":false,"outputField":"my_output_field","editorUrl":"http://drawsvg.org/drawsvg.html","directory":"","panning":"disabled","zooming":"disabled","panOnlyWhenZoomed":false,"doubleClickZoomEnabled":false,"mouseWheelZoomEnabled":false,"name":"","x":600,"y":1480,"wires":[["24952289.cacf1e","2e6ffce7.748b34"]]},{"id":"24952289.cacf1e","type":"debug","z":"86187643.ae75e8","name":"Clicked SVG shape","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":830,"y":1540,"wires":[]},{"id":"2e6ffce7.748b34","type":"ui_context_menu","z":"86187643.ae75e8","group":"2908388b.8114b8","order":5,"width":0,"height":-1,"fontSize":16,"inputPositionXField":"event.pageX","inputPositionXType":"msg","inputPositionYField":"event.pageY","inputPositionYType":"msg","outputField":"payload","inputMenuField":"","inputMenuType":"fixed","menuItems":[{"id":"ON","icon":"fa-toggle-on","label":"Light on","topic":"light_kitchen_on","payload":"light_kitchen_on","payloadType":"str","visible":true,"enabled":true},{"id":"OFF","icon":"fa-toggle-off","label":"Light off","topic":"light_kitchen_off","payload":"light_kitchen_off","payloadType":"str","visible":true,"enabled":true}],"colors":"native","textColor":"#000000","backgroundColor":"#ffffff","borderColor":"#626262","intervalLength":"0","intervalUnit":"secs","startTimerAtOpen":false,"startTimerAtLeave":true,"stopTimerAtEnter":true,"name":"","x":820,"y":1480,"wires":[["14b0feb6.5bea51"]]},{"id":"14b0feb6.5bea51","type":"debug","z":"86187643.ae75e8","name":"Clicked menu item","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"true","targetType":"full","x":1050,"y":1480,"wires":[]},{"id":"2908388b.8114b8","type":"ui_group","z":"","name":"Floorplan test","tab":"a28ff08f.3a822","order":1,"disp":true,"width":"14","collapse":false},{"id":"a28ff08f.3a822","type":"ui_tab","z":"","name":"SVG","icon":"dashboard","disabled":false,"hidden":false}]
   ```

   1. The SVG node display a vector graphics drawing in the Node-RED dashboard, including a clickable light-bulb icon.
   1. As soon as the user clicks the light-bulb icon, the SVG node will send an output message (incl. ```msg.event.pageX``` and ```msg.event.pageY``` which define the mouse click position)!
   1. The message enters the contextmenu-node and will trigger a contextmenu popup displayed at the mouse click position.  Remark: it would make more sense to determine the list of context menu items, based on the ```msg.topic``` which contains the information about which SVG element has been clicked).
   1. As soon as the user clicks on one of the menu items, the contextmenu-node will send an output message (containing information about the clicked menu item).
   1. The next nodes in the flow can handle the clicked menu item ...

   A short demo to demonstrate the result:

   ![contextmenu_demo](https://user-images.githubusercontent.com/14224149/65722808-587c0e80-e0ad-11e9-91cb-8ad14510f03f.gif)
   
+ Other UI nodes (like Button and node-red-contrib-ui-state-trail nodes) also have a ```msg.event``` in their output messages, which means a contextmenu can be displayed when such a UI node is being clicked.

   Thanks to [Paul Reed](https://github.com/Paul-Reed) for demonstrating how to use a contextmenu - in combination with a dashboard button - to create a hierarchical dashboard menu:
   
   ![contextmenu_paul_reed](https://user-images.githubusercontent.com/14224149/87257213-70d0e480-c499-11ea-816b-1ebf196e6254.gif)

   The following (simplified) flow explains how to accomplish something like this, based on the bounding box of the clicked element:
   
   ![bbox flow](https://user-images.githubusercontent.com/14224149/87257236-c86f5000-c499-11ea-980f-c83562c9713f.png)
   ```
      [{"id":"45f42449.b3c8dc","type":"ui_button","z":"86187643.ae75e8","name":"","group":"2908388b.8114b8","order":9,"width":"1","height":"1","passthru":false,"label":"","tooltip":"","color":"","bgcolor":"","icon":"fa-bars","payload":"button_clicked","payloadType":"str","topic":"","x":590,"y":1640,"wires":[["5b2478ff.043158"]]},{"id":"5b2478ff.043158","type":"change","z":"86187643.ae75e8","name":"Get X and Y from bbox","rules":[{"t":"set","p":"position.x","pt":"msg","to":"event.bbox[2]-9","tot":"jsonata"},{"t":"set","p":"position.y","pt":"msg","to":"event.bbox[3]+18","tot":"jsonata"}],"action":"","property":"","from":"","to":"","reg":false,"x":780,"y":1640,"wires":[["b3b5bcfc.cf079"]]},{"id":"b3b5bcfc.cf079","type":"ui_context_menu","z":"86187643.ae75e8","group":"2908388b.8114b8","order":5,"width":0,"height":-1,"fontSize":16,"inputPositionXField":"position.x","inputPositionXType":"msg","inputPositionYField":"position.y","inputPositionYType":"msg","outputField":"payload","inputMenuField":"","inputMenuType":"fixed","menuItems":[{"id":"ZOOM_OUT","icon":"fa-search-minus","label":"Light on","topic":"zoom out","payload":"zoom out","payloadType":"str","visible":true,"enabled":true},{"id":"ZOOM_IN","icon":"fa-search-plus","label":"Light off","topic":"zoom in","payload":"zoom in","payloadType":"str","visible":true,"enabled":true}],"colors":"native","textColor":"#000000","backgroundColor":"#ffffff","borderColor":"#626262","intervalLength":"0","intervalUnit":"secs","startTimerAtOpen":false,"startTimerAtLeave":true,"stopTimerAtEnter":true,"name":"","x":1000,"y":1640,"wires":[[]]},{"id":"2908388b.8114b8","type":"ui_group","z":"","name":"Floorplan test","tab":"a28ff08f.3a822","order":1,"disp":true,"width":"14","collapse":false},{"id":"a28ff08f.3a822","type":"ui_tab","z":"","name":"SVG","icon":"dashboard","disabled":false,"hidden":false}]
   ```
   Remark: in this case it might be useful to hide the standard Node-RED dashboard hamburger menu icon:
   
   ![Hide titlebar](https://user-images.githubusercontent.com/14224149/88464796-e8e9d200-cebd-11ea-9ad4-75b5dbfba5a4.png)
   
## Node properties

### Font size
The font size of the menu items 

### X/Y coordinate
Specify how the position of the context menu on the screen will be specified:

+ *Msg*: The input message must contain the X/Y coordinate number in the specified msg field.  This way the the menu position can be updated dynamically.

+ *Num*: The fixed X/Y coordinate number must be specified on the config screen.

### Output To
Specify where the payload output from clicking a menu item should appear in the `msg`. 
NOTE: for a *msg based menu*, this can be set per menu item via the property `outputField` (see Message Based example below)

### Menu
Specify how the menu items of the context menu will be specified:

+ ***Fixed***: A table will be displayed, to enter the menu items.  The following properties can be set for every menu item:
   + *ID*: The id of the menu item (which won't be displayed).
   + *Label*: The label that will be displayed in the context menu. Set the Label to "---" to create a seperator (all other fields can be left blank). 
   + *Icon*: The FontAwesome icon that will be displayed in the context menu.
   + *Topic*: The `msg.topic` that will be send in the output message.
   + *Payload*: The `msg.payload` that will be send in the output message.  NOTE: if the "Output to" field is set to something other than "payload", then the output will appear in that property of `msg` 
   
+ ***Msg***: the input message must contain the menu (as a JSON array of menu items) in the specified msg field.  This way the the menu structure can be updated dynamically.

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
   
   + Nested menus are possible when the menu is supplied via *"msg"*:
      + *text*: The label that will be displayed in the context menu. NOTE: To create a separator, use "---" as the text value (all other fields can be left blank).
      + *icon*: (optional) The FontAwesome icon that will be displayed in the context menu.
      + *sub*: (optional) An array of sub menu items
      + *topic*: (optional) The `msg.topic` that will be send in the output message. If left empty, `topic` will default the the `path` of this menu item.
      + *payload*: The `msg.payload` that will be send in the output message. If left empty, `message` will default the the `text` of this menu item.
      + *payloadType*: The type of `msg.payload`. Allowable types are 'JSON', 'str', 'bool', 'num'. `payload` will be converted to this type.
      + *outputField*: (optional) It is possible to override the "Output to" field. This property will permit the `payload` to be send to an alternative property of `msg` 
      + ** *text* is the only** mandatory field.  
   
The message-based approach has the advantage that it offers ***nested menu items***, which is currently not available in the config screen!

The label an icon are both optional.  This means you can use both or only one of them, to achieve various effects.

### Auto hide
+ When this value is ```0``` the context menu will stay visible, until a menu item is selected or outside the menu is being clicked.  
+ When this value is e.g. <code>3 seconds</code> this means that the context menu will automatically disappear when the context menu is out of focus during at least 3 seconds.  
   + So as long as the mouse cursors is on top of the menu, the user has time to think about which action he wants to perform.  
   + As soon as the mouse cursor leaves the context menu, the timer will start counting.
   + But when the mouse cursor enters the context menu again, the timer will be reset.  This way the users has again extra time to think about the action he wants to perform.
   + When the mouse cursor is away from the context menu for the specified time interval, the context menu will automatically be hidden.
   
Demo of auto hide in 3 seconds (notice the timer status in the console):

![contextmenu_timer](https://user-images.githubusercontent.com/14224149/66244476-e50b7a00-e708-11e9-870c-36bde4e9a888.gif)


### Colors
Specify how the colors of the context menu should look like:

+ *Native*: The default CSS colors of this node will be used.
+ *Match dashboard theme*: The colors of the currently selected dashboard theme will be used.
+ *Custom*: Three color pickers will be displayed, which allow you to specify your custom colors.

   ![Custom colors](https://user-images.githubusercontent.com/14224149/66244438-b8576280-e708-11e9-9931-2399e414ef7c.png)

Demo for the dashboard's built-in *dark* theme (menu1=custom, menu2=theme, menu2=native):

![demo_dark_theme](https://user-images.githubusercontent.com/14224149/67512913-176e1e80-f69a-11e9-8618-38edb8447d9d.gif)

Demo for the dashboard's built-in *light* theme (menu1=custom, menu2=theme, menu2=native):

![demo_light_theme](https://user-images.githubusercontent.com/14224149/67512904-150bc480-f69a-11e9-9981-c49aa4e7cbeb.gif)

### Output message
As soon as a menu item has been clicked, an output message will be send.  It is up to the next nodes in the flow, to determine how the menu item should be handled.  

The output message will contain following fields:
+ *payload*: This will contain the payload value that has been specified in the menu item, or by default a string containing the key of clicked item. NOTE: if the "Output to" field is set to something other than "payload", then the output will appear in that property of `msg`. This can also be overriden per menu item by setting `outputField` in the menu item
+ *topic*: This will contain the topic value that has been specified in the menu item, or by default a string containing the path of menu clicked item.
+ *sourceMsg*: This will contain original input message, that has triggered the contextmenu to be displayed.

### Thanks to
dsaul whose menu this node is based on https://github.com/dsaul/contextmenujs/
