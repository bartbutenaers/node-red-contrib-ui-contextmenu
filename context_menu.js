/**
 * Copyright 2019 Bart Butenaers, Stephen McLaughlin
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
var path = require('path');
module.exports = function(RED) {
    var settings = RED.settings;

    function setResult(msg, field, value) {
        field = field ? field : "payload";
        const keys = field.split('.');
        const lastKey = keys.pop();
        const lastObj = keys.reduce((obj, key) => obj[key] = obj[key] || {}, msg); 
        lastObj[lastKey] = value;
    };

    // Version 4.0 : https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors

    /**
     * pSBC = perform Shading, Blending, Conversion.  See examples below..
     *
     * @param {Number} p - Percent or adjust -1.0 ~ 1.0
     * @param {String|Object} c0 - From colour
     * @param {String|Object|Boolean} c1 - To Color
     * @param {Boolean} l - Linear / Log blending.  true for Linear Blending, false for log blending
     * @returns new color string.  This can be either #xxxxxx?? or RBG(x,x,x,?) depending on input
     * @example 
     *  let color1 = "rgb(20,60,200)";
     *  let color2 = "rgba(20,60,200,0.67423)";
     *  let color3 = "#67DAF0";
     *  let color4 = "#5567DAF0";
     *  let color5 = "#F3A";
     *  let color6 = "#F3A9";
     *  let color7 = "rgb(200,60,20)";
     *  let color8 = "rgba(200,60,20,0.98631)";
     *  
     *  // ##########  Log Blending  ########## //
     *  // Shade (Lighten or Darken)
     *  pSBC ( 0.42, color1 ); // rgb(20,60,200) + [42% Lighter] => rgb(166,171,225)
     *  pSBC ( -0.4, color5 ); // #F3A + [40% Darker] => #c62884
     *  pSBC ( 0.42, color8 ); // rgba(200,60,20,0.98631) + [42% Lighter] => rgba(225,171,166,0.98631)
     *  
     *  // Shade with Conversion (use "c" as your "to" color)
     *  pSBC ( 0.42, color2, "c" ); // rgba(20,60,200,0.67423) + [42% Lighter] + [Convert] => #a6abe1ac
     *  
     *  // RGB2Hex & Hex2RGB Conversion Only (set percentage to zero)
     *  pSBC ( 0, color6, "c" ); // #F3A9 + [Convert] => rgba(255,51,170,0.6)
     *  
     *  // Blending
     *  pSBC ( -0.5, color2, color8 ); // rgba(20,60,200,0.67423) + rgba(200,60,20,0.98631) + [50% Blend] => rgba(142,60,142,0.83)
     *  pSBC ( 0.7, color2, color7 ); // rgba(20,60,200,0.67423) + rgb(200,60,20) + [70% Blend] => rgba(168,60,111,0.67423)
     *  pSBC ( 0.25, color3, color7 ); // #67DAF0 + rgb(200,60,20) + [25% Blend] => rgb(134,191,208)
     *  pSBC ( 0.75, color7, color3 ); // rgb(200,60,20) + #67DAF0 + [75% Blend] => #86bfd0
     *  
     *  // ##########  Linear Blending  ########## //
     *  // Shade (Lighten or Darken)
     *  pSBC ( 0.42, color1, false, true ); // rgb(20,60,200) + [42% Lighter] => rgb(119,142,223)
     *  pSBC ( -0.4, color5, false, true ); // #F3A + [40% Darker] => #991f66
     *  pSBC ( 0.42, color8, false, true ); // rgba(200,60,20,0.98631) + [42% Lighter] => rgba(223,142,119,0.98631)
     *  
     *  // Shade with Conversion (use "c" as your "to" color)
     *  pSBC ( 0.42, color2, "c", true ); // rgba(20,60,200,0.67423) + [42% Lighter] + [Convert] => #778edfac
     *  
     *  // RGB2Hex & Hex2RGB Conversion Only (set percentage to zero)
     *  pSBC ( 0, color6, "c", true ); // #F3A9 + [Convert] => rgba(255,51,170,0.6)
     *  
     *  // Blending
     *  pSBC ( -0.5, color2, color8, true ); // rgba(20,60,200,0.67423) + rgba(200,60,20,0.98631) + [50% Blend] => rgba(110,60,110,0.83)
     *  pSBC ( 0.7, color2, color7, true ); // rgba(20,60,200,0.67423) + rgb(200,60,20) + [70% Blend] => rgba(146,60,74,0.67423)
     *  pSBC ( 0.25, color3, color7, true ); // #67DAF0 + rgb(200,60,20) + [25% Blend] => rgb(127,179,185)
     *  pSBC ( 0.75, color7, color3, true ); // rgb(200,60,20) + #67DAF0 + [75% Blend] => #7fb3b9
     */
    const pSBC=(p,c0,c1,l)=>{
        let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
        if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
        if(!this.pSBCr)this.pSBCr=(d)=>{
            let n=d.length,x={};
            if(n>9){
                [r,g,b,a]=d=d.split(","),n=d.length;
                if(n<3||n>4)return null;
                x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
            }else{
                if(n==8||n==6||n<4)return null;
                if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
                d=i(d.slice(1),16);
                if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
                else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
            }return x};
        h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=pSBCr(c0),P=p<0,t=c1&&c1!="c"?pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
        if(!f||!t)return null;
        if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
        else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
        a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
        if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
        else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
    }
    //https://awik.io/determine-color-bright-dark-using-javascript/
    function lightOrDark(color) {
        var r, g, b, hsp;// Variables for red, green, blue values
        // Check the format of the color, HEX or RGB?
        if (color.match(/^rgb/)) {
            // If HEX --> store the red, green, blue values in separate variables
            color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
            r = color[1];            g = color[2];            b = color[3];
        } else {
            // If RGB --> Convert it to HEX: http://gist.github.com/983661
            color = +("0x" + color.slice(1).replace( 
            color.length < 5 && /./g, '$&$&'));
            r = color >> 16;            g = color >> 8 & 255;            b = color & 255;
        }
        // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
        hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b)        );
        if (hsp>127.5) {   
            return 'light';
        } else {    
            return 'dark';
        }
    }
    function HTML(node) {
        // The configuration is a Javascript object, which needs to be converted to a JSON string
        var configAsJson = JSON.stringify(node.config);  
        var className = "custom-" + node.id.replace(".","");
        var style = "";
        //generate custom styles if user has selected non-native
        if(node.colors !== "native"){
            let cm_ul_color = node.textColor || "#0";//text colour
            let cm_ul_background_color = node.backgroundColor || "#ffffff"; //fill colour
            let cm_ul_box_shadow = "0 0 5px " + (node.borderColor ||  "#626262");//border colour
            let cm_li_hover_color = node.hoverColor || "#b0b0b0";//hover colour
            let cm_li_disabled_color = node.disabledColor || "#777"; 

            style = String.raw`
            <style>
              .${className}.cm_container ul{
                color: ${cm_ul_color};
                background-color: ${cm_ul_background_color};
                box-shadow: ${cm_ul_box_shadow};
              }
              .${className}.cm_container li:hover{
                background-color: ${cm_li_hover_color};
              }
              .${className}.cm_container li[disabled=""]{
                color: ${cm_li_disabled_color};
              }
              .${className}.cm_container li[disabled=""]:hover{
                background-color: inherit;
              }
            </style>`
        }   
        var html =  style + " \
            <div id='div_" + node.config.id + "' ng-init='init(" + configAsJson + ")' class='menu' display='none';> \
            </div> ";
        return html;
    };


    var ui = undefined;
    function ContextMenuNode(config) {
        var node = this;
        node.config = config;
        node.outputField = config.outputField;
        
        if(ui === undefined) {
            ui = RED.require("node-red-dashboard")(RED);
        }
        node.colors = config.colors || "native";
        node.textColor = config.textColor || "#0";
        node.backgroundColor = config.backgroundColor || "#ffffff";
        node.hoverColor = config.borderColor || "#626262";

        // When the user has selected to use theme colors, then just that ...
        if (node.colors === "theme") {
            if(ui.getTheme){
                var theme = ui.getTheme();
                node.textColor = theme["widget-textColor"].value || node.textColor;
                node.backgroundColor = theme["group-backgroundColor"].value || node.backgroundColor;
                node.hoverColor = theme["widget-backgroundColor"].value || node.borderColor;
            } else {
                node.colors = "native"//default to native
                node.warn("ui.getTheme() not avaiable. Check dashboard version is up to date");
                //TODO: consider removing theme option from dropdown if not available?
                //Currently, native colors will be used if old dashboard present.
            }
        } 

        if(node.colors !== "native"){
            let ColDif = lightOrDark(node.hoverColor) == "light" ? -0.1/*10% darker*/ : 0.1/*10% lighter*/
            node.borderColor = pSBC(ColDif, node.hoverColor ); //lighten/darken border color 10% to hover color
            node.disabledColor = pSBC(0.5, node.textColor, node.backgroundColor ); //blend 50% from textColor towards background color    
        }
        
        RED.nodes.createNode(this, config);
        
        var html = HTML(node);
        
        var done = ui.addWidget({
            node: node,
            group: config.group,
            order: config.order || 0,
            width: config.width,
            height: config.height,
            format: html,
            templateScope: "local",
            emitOnlyNewValues: false,
            forwardInputMessages: false,
            storeFrontEndInputAsState: false,
            // Avoid contextmenu to appear automatically after deploy.
            // (see https://github.com/node-red/node-red-dashboard/pull/558)
            persistantFrontEndValue: false,
            convertBack: function (value) {
                return value;
            },
            beforeEmit: function(msg, value) {   
                // ******************************************************************************************
                // Server side validation of input messages.
                // ******************************************************************************************
                // Would like to ignore invalid input messages, but that seems not to possible in UI nodes:
                // See https://discourse.nodered.org/t/custom-ui-node-not-visible-in-dashboard-sidebar/9666
                // We will workaround it by sending 'null' message fields to the dashboard.
                
                if (config.position === "msg") {
                    if (!msg.position || !msg.position.x || !msg.position.y || isNaN(msg.position.x) || isNaN(msg.position.y)) {
                        node.error("When using message based position, the msg.position should x and y numbers");
                        msg.position = null;
                    }
                }
    
                if (config.menu === "msg") {
                    if (!msg.menu || typeof msg.menu != "object" ) {
                        node.error("When using message based menu items, the msg.menu should contain an object containing menu items");
                        msg.position = null;
                    }
                }
                    
                return { msg: msg };
            },
            beforeSend: function (msg, orig) {
                try {
                    if (!orig || !orig.msg) {
                        return;//TODO: what to do if empty? Currently, halt flow by returning nothing
                    }
                    var newMsg = {
                        menuId: orig.msg.menuItem.id,
                        menuindex: orig.msg.menuItem.index,
                        topic: orig.msg.menuItem.topic,
                        payload: orig.msg.menuItem.payload,
                        sourceMsg: orig.msg.sourceMsg // The original input message
                    };
                    RED.util.evaluateNodeProperty(orig.msg.menuItem.payload,orig.msg.menuItem.payloadType,node,orig.msg,(err,value) => {
                        if (err) {
                            throw err;//TODO: is this an error object? or should I create new Error(err)?
                        } else {
                            setResult(newMsg, node.outputField || orig.msg.menuItem.outputField, value); 
                        }
                    }); 
                    return newMsg;
                } catch (error) {
                    node.error(error);
                }
               
            },
            initController: function($scope, events) {
                // Remark: all client-side functions should be added here!  
                // If added above, it will be server-side functions which are not available at the client-side ...
                console.log("ui_context_menu: ui_contextmenu.initController()")

                //IE
                if (!String.prototype.endsWith) {
                    String.prototype.endsWith = function(searchString, position) {
                        var subjectString = this.toString();
                        if (typeof position !== 'number' || !isFinite(position) 
                            || Math.floor(position) !== position || position > subjectString.length) {
                            position = subjectString.length;
                        }
                        position -= searchString.length;
                        var lastIndex = subjectString.indexOf(searchString, position);
                        return lastIndex !== -1 && lastIndex === position;
                    };
                }
                
                function getPosition(scope, msg){
                    var xp = 0,yp = 0;
                    if (scope.config.position === "msg" && msg && msg.position) {
                        // Position the context menu based on the coordinates in the message
                        xp = msg.position.x;
                        yp  = msg.position.y;
                    }
                    else {
                        // Position the context menu based on the coordinates in the config screen
                        xp = scope.config.xCoordinate;
                        yp  = scope.config.yCoordinate;
                    }
                    return {clientX: parseInt(xp), clientY: parseInt(yp)};
                }

                //https://stackoverflow.com/questions/14919894/getscript-but-for-stylesheets-in-jquery
                function loadJavascriptAndCssFiles(urls, successCallback, failureCallback) {
                    $.when.apply($,
                        $.map(urls, function(url) {
                            if(url.endsWith(".css")) {
                                return $.get(url, function(css) {
                                    $("<style>" + css + "</style>").appendTo("head");
                                });
                            } else {
                                return $.getScript(url);
                            }
                        })
                    ).then(function() {
                        if (typeof successCallback === 'function') successCallback();
                    }).fail(function() {
                        if (typeof failureCallback === 'function') failureCallback();
                    });
                }
                
                // Adjust a colour with a specified amount
                // See https://stackoverflow.com/a/57401891
                function adjust(color, amount) {
                    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
                }

                $scope.flag = true;

                $scope.init = function (config) {
                    console.log("ui_context_menu: ui_contextmenu.initController > $scope.init()")
                    $scope.config = config;
                    $scope.contextmenuItems = null;
                    
                    // Migrate older nodes, which had no auto hide functionality
                    if(!$scope.config.hasOwnProperty('intervalLength')) {
                        $scope.config.intervalLength = 0;
                    }
                    if(!$scope.config.hasOwnProperty('intervalUnit')) {
                        $scope.config.intervalUnit = "secs";
                    }
                    if(!$scope.config.hasOwnProperty('startTimerAtOpen')) {
                        $scope.config.startTimerAtOpen = false;
                    }
                    if(!$scope.config.hasOwnProperty('startTimerAtLeave')) {
                        $scope.config.startTimerAtLeave = true;
                    }
                    if(!$scope.config.hasOwnProperty('stopTimerAtEnter')) {
                        $scope.config.stopTimerAtEnter = true;
                    }
                    
                    // Convert the 'intervalLength' value to milliseconds (based on the selected time unit)
                    switch($scope.config.intervalUnit) {
                        case "msecs":
                            $scope.intervalLengthMsecs = $scope.config.intervalLength;
                            break;
                        case "secs":
                            $scope.intervalLengthMsecs = $scope.config.intervalLength * 1000;
                            break;
                        case "mins":
                            $scope.intervalLengthMsecs = $scope.config.intervalLength * 1000 * 60;
                            break;          
                    }
                    
                    var options = {
                        default_text: "",
                        allow_blank_item: true,
                        callback: function(evt, item) {
                            let menuItem = {
                                index: item.index,
                                id: item.id || item.path,
                                icon: item.icon,
                                enabled: item.enabled === false ? false : true,
                                visible: item.visible === false ? false : true,
                                label: item.label || item.text,
                                text: item.label || item.text,
                                payload: item.payload || item.text,
                                payloadType: item.payloadType || "str",
                                topic:  item.topic || item.path,
                                outputField: item.outputField
                            }
                            
                            // Show the clicked menu item and the last received msg to the server
                            $scope.send({ menuItem: menuItem, sourceMsg : $scope.msg || {} });                                    
                        }
                    }
                    
                    if($scope.config.fontSize) {
                        options.fontSize = $scope.config.fontSize + "px";
                    }
                   
                    if (!$scope.contextMenu) {
                        // The ContextMenu instance creates a container, which is a DIV element that contains an UL list (of menu items).
                        // Since there is no ContextMenu instance (anymore), all old containers should be removed from the DOM.
                        // These containers are added directly under the 'body', so we have to make sure we don't delete similar other nodes.
                        // Therefore we delete DIV elements with id starting with 'cm_' and class 'cm_container'.
                        var contextMenuContainers = document.querySelectorAll("div[id^='cm_'].cm_container");
                        Array.prototype.forEach.call( contextMenuContainers, function( node ) {
                            node.parentNode.removeChild( node );
                        });
                        
                        try {
                            // Only load the context menu libraries from the server, when not loaded yet
                            if(window.ContextMenu){
                                $scope.contextMenu = new ContextMenu([],options); 
                            }
                            else {
                                var urls = [
                                    'ui_context_menu/contextmenu.js',
                                    'ui_context_menu/contextmenu.css'
                                ];
                                loadJavascriptAndCssFiles(urls, 
                                    function(){
                                        //success
                                        $scope.contextMenu = new ContextMenu([],options);  
                                    },
                                    function(){
                                        //fail
                                    });
                            }
                        }
                        catch (error) {
                            console.error(error)
                        }
                    }
                   
                }

                $scope.$watch('msg', function(msg) {
                    // Ignore undefined messages.
                    if (!msg) {
                        return;
                    }
debugger;
                    if (!$scope.config) {
                        console.log("ui_context_menu: $scope.config is empty :(")
                        return;
                    }
                                
                    var showOptions = getPosition($scope, msg);//determine postion top/left
                    showOptions.target = document;

                    console.log("ui_context_menu: msg received")
                    
                    if($scope.config.menu === "msg"){
                        //As msg.menu is source - just assign it to $scope.contextmenuItems
                        $scope.contextmenuItems = msg.menu;
                    } else if ($scope.config.menuItems && $scope.config.menu === "fixed" && !$scope.contextmenuItems){
                        //As the menu is fixed items, generate a compatable contextmenuItems object from $scope.config.menuItems
                        $scope.contextmenuItems = [];
                        var index = 0;
                        $scope.config.menuItems.forEach(function(menuItem) {
                            var id=menuItem.id || index;
                            if(menuItem.label.startsWith("--")){
                                $scope.contextmenuItems.push({text: "---"});
                            } else {
                                $scope.contextmenuItems.push({
                                    index: index,
                                    id: menuItem.id,
                                    icon: menuItem.icon,
                                    enabled: menuItem.enabled,
                                    visible: menuItem.visible,
                                    label: menuItem.label,
                                    text: menuItem.label,
                                    payload: menuItem.payload,
                                    payloadType: menuItem.payload,
                                    topic:  menuItem.topic,
                                    outputField: menuItem.outputField
                                })
                            }
                            index++;
                        });
                    } 

                    if($scope.contextMenu) {
                        $scope.contextMenu.menu = $scope.contextmenuItems;
                        $scope.contextMenu.reload();
                        $scope.contextMenu.display(showOptions);
                        
                        // If a timer of the previous context menu exist, then remove it to make sure it doesn't hide our new contextmenu
                        if ($scope.autoHideTimer) {
                            clearTimeout($scope.autoHideTimer);
                            $scope.autoHideTimer = null;
                        }
                        
                        var contextMenuNum = $scope.contextMenu.num;
                        var contextMenuDiv = document.getElementById('cm_' + contextMenuNum);
                        var ulElements = contextMenuDiv.querySelectorAll('ul');
                            
                        // When the auto hide interval is 0, then there is no auto hiding.
                        // Otherwise the context menu should be hidden after the specified interval.
                        // We will start counting the seconds, from the moment on the context menu has been left ...
                        if ($scope.intervalLengthMsecs > 0) {
                            // When required, start the timer immediately
                            if ($scope.config.startTimerAtOpen) {
                                if (!$scope.autoHideTimer) {
                                    $scope.autoHideTimer = setTimeout(function() { 
                                        $scope.contextMenu.hide();
                                        $scope.autoHideTimer = null;
                                    }, $scope.intervalLengthMsecs);
                                }
                            }
                            
                            // When required, start the timer when the mouse leaves the context menu.
                            if ($scope.config.startTimerAtLeave) {
                                for (var i = 0; i < ulElements.length; i++) {
                                    ulElements[i].addEventListener('mouseleave', function() {
                                        if (!$scope.autoHideTimer) {
                                            $scope.autoHideTimer = setTimeout(function() { 
                                                $scope.contextMenu.hide();
                                                $scope.autoHideTimer = null;
                                            }, $scope.intervalLengthMsecs);
                                        }
                                    });
                                }
                            }
                            
                            // When required, stop the timer when the mouse enters the context menu again.
                            if ($scope.config.stopTimerAtEnter) {
                                for (var i = 0; i < ulElements.length; i++) {
                                    ulElements[i].addEventListener('mouseenter', function() {
                                        if ($scope.autoHideTimer) {
                                            clearTimeout($scope.autoHideTimer);
                                            $scope.autoHideTimer = null;
                                        }
                                    });
                                }
                            }
                        }
                        
                        // Only override the CSS colors when no 'native' colors selected
                        if ($scope.config.colors !== "native") {   
                            $scope.config.cls = "custom-" + $scope.config.id.replace(".",""); //compute the clas name      
                            $(contextMenuDiv).addClass($scope.config.cls); //add class name
                        }
                    }
                });                        
            }
        });

		
        node.on("close", function() {
            if (done) {
                done();
            }
        });
    }

    RED.nodes.registerType("ui_context_menu", ContextMenuNode);
	
    // By default the UI path in the settings.js file will be in comment:
    //     //ui: { path: "ui" },
    // But as soon as the user has specified a custom UI path there, we will need to use that path:
    //     ui: { path: "mypath" },
    var uiPath = ((RED.settings.ui || {}).path) || 'ui';
	
    // Create the complete server-side path
    uiPath = '/' + uiPath + '/ui_context_menu/*';
    
    // Replace a sequence of multiple slashes (e.g. // or ///) by a single one
    uiPath = uiPath.replace(/\/+/g, '/');
	 
    RED.httpNode.get(uiPath, function (req, res) {
        var options = {
            root: __dirname + '/lib/',
            dotfiles: 'deny'
        };
        res.sendFile(req.params[0], options)
    });
}
