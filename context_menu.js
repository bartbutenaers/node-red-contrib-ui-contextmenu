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

module.exports = function(RED) {
    var settings = RED.settings;

    function HTML(config) {
        // The configuration is a Javascript object, which needs to be converted to a JSON string
        var configAsJson = JSON.stringify(config);  
        var html = " \
            <div id='div_" + config.id + "' ng-init='init(" + configAsJson + ")' class='menu' display='none';> \
            </div> ";
        return html;
    };

    function checkConfig(node, conf) {
        if (!conf || !conf.hasOwnProperty("group")) {
            node.error(RED._("heat-map.error.no-group")); // TODO
            return false;
        }
        return true;
    }

    var ui = undefined;
    
    function ContextMenuNode(config) {
        var node = this;
            
        try {
            if(ui === undefined) {
                ui = RED.require("node-red-dashboard")(RED);
            }
            RED.nodes.createNode(this, config);
            if (checkConfig(node, config)) { 
                var html = HTML(config);
                var done = ui.addWidget({
                    node: node,
                    group: config.group,
                    width: config.width,
                    height: config.height,
                    format: html,
                    templateScope: "local",
                    emitOnlyNewValues: false,
                    forwardInputMessages: false,
                    storeFrontEndInputAsState: false,
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
                        //debugger;
                        try {
                            if (!orig || !orig.msg) {
                                return;//TODO: what to do if empty? Currently, halt flow by returning nothing
                            }
                            var newMsg = {
                                menuId: orig.msg.menuItem.id,
                                menuindex: orig.msg.menuItem.index,
                                topic: orig.msg.menuItem.topic,
                                payload: orig.msg.menuItem.payload
                            };
                            RED.util.evaluateNodeProperty(orig.msg.menuItem.payload,orig.msg.menuItem.payloadType,node,orig.msg,(err,value) => {
                                if (err) {
                                    throw err;//is this an erro object? or should I create new Error(err)?
                                } else {
                                    //setResult(newMsg, node.outputField, value); 
                                    newMsg.payload = value;
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
                            return {clientX: xp, clientY: yp};
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
                        function findMenuItemByKey(o, id) {
                            //Early return
                            if( o[id] && typeof o[id] == "object" ){
                              return o[id];
                            }
                            var result, p; 
                            if(o.items){
                                for (p in o.items) {
                                    if(typeof o[p] === "object" && o[p].items){
                                        result = findMenuItemByKey(o[p].items, id);
                                    if(result){
                                        return result;
                                    }
                                    }
                                }
                            }
                            return result;
                        }
                        
                        function createMenu(scope, menuItems, callback){
                            
                            var menu; 
                            var options = {
                                callback: function(evt, item) {
                                    debugger
                                    //let item = findMenuItemByKey(options.items, key) || {};
                                    let menuItem = {
                                        index: item.index,
                                        id: item.id || item.path,
                                        icon: item.icon,
                                        enabled: item.enabled === false ? false : true,
                                        visible: item.visible === false ? false : true,
                                        label: item.label || item.text,
                                        text: item.label || item.text,
                                        payload: item.payload || item.text,
                                        payloadType: item.payload || "str",
                                        topic:  item.topic || item.path
                                    }
                                    scope.send({menuItem: menuItem});                                    
                                }
                            }
                            if(scope.config.fontSize)
                                options.fontSize = scope.config.fontSize + "px";

                            try {
                                if(window.ContextMenu){
                                    menu = new ContextMenu(menuItems,options); 
                                    callback(menu);   
                                    return;
                                } else {
                                    var urls = [
                                        '/ui_context_menu/lib/contextMenu.js',
                                        '/ui_context_menu/lib/contextMenu.css'
                                    ];
                                    loadJavascriptAndCssFiles(urls, 
                                        function(){
                                            //success
                                            menu = new ContextMenu(menuItems,options); 
                                            callback(menu);   
                                        },
                                        function(){
                                            //fail
                                        });
                                }
                                
                            } catch (error) {
                                console.error(error)
                            }
                        } 

                        $scope.flag = true;

                        $scope.init = function (config) {
                            console.log("ui_context_menu: ui_contextmenu.initController > $scope.init()")
                            $scope.config   = config;
                            $scope.config.contextmenuItems = null;
                        }

                        $scope.$watch('msg', function(msg) {
                            console.log("ui_context_menu: ui_contextmenu.initController > $scope.$watch('msg'...)")
                            var scope = $scope;

                            // Ignore undefined messages.
                            if (!msg) {
                                return;
                            }
                            if (!scope.config) {
                                console.log("ui_context_menu: $scope.config is empty :(")
                                return;
                            }
                                        
                            var showOptions = getPosition($scope, msg);//determine postion top/left
                            showOptions.target = document;
                            

                            if(scope.config.menu === "msg"){
                                //As msg.menu is source - just assign it to scope.config.contextmenuItems
                                scope.config.contextmenuItems = msg.menu;
                            } else if (scope.config.menuItems && scope.config.menu === "fixed" && !scope.config.contextmenuItems){
                                //As the menu is fixed items, generate a compatable contextmenuItems object from scope.config.menuItems
                                scope.config.contextmenuItems = [];
                                var index = 0;
                                scope.config.menuItems.forEach(function(menuItem) {
                                    var id=menuItem.id || index;
                                    if(menuItem.label.startsWith("--")){
                                        scope.config.contextmenuItems.push({text: "---"});
                                    } else {
                                        scope.config.contextmenuItems.push({
                                            index: index,
                                            id: menuItem.id,
                                            icon: menuItem.icon,
                                            enabled: menuItem.enabled,
                                            visible: menuItem.visible,
                                            label: menuItem.label,
                                            text: menuItem.label,
                                            payload: menuItem.payload,
                                            payloadType: menuItem.payload,
                                            topic:  menuItem.topic
                                        })
                                    }
                                    index++;
                                });
                            } 

                            if(scope.config.builtMenu){
                                scope.config.builtMenu.reload();
                                scope.config.builtMenu.display(showOptions);
                            } else {
                                createMenu(scope, scope.config.contextmenuItems, function (theMenu) {
                                    scope.config.builtMenu = theMenu;
                                    scope.config.builtMenu.display(showOptions);
                                });
                            }

                        });                        
                    }
                });
            }
        }
        catch (e) {
            console.log(e);
        }
		
        node.on("close", function() {
            if (done) {
                done();
            }
        });
    }

    RED.nodes.registerType("ui_context_menu", ContextMenuNode);

        // Make all the static resources from this node public available (i.e. third party JQuery plugin tableHeadFixer.js).
    // TODO is dit nodig?  of gewoon een script file includen op de html
    RED.httpAdmin.get('/ui_context_menu/*', function(req, res){
        var options = {
            root: __dirname /*+ '/static/'*/,
            dotfiles: 'deny'
        };
       
        // Send the requested file to the client (in this case it will be tableHeadFixer.js)
        res.sendFile(req.params[0], options)
    });
}
