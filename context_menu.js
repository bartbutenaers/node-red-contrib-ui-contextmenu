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

    function setResult(msg, field, value) {
        field = field ? field : "payload";
        const keys = field.split('.');
        const lastKey = keys.pop();
        const lastObj = keys.reduce((obj, key) => obj[key] = obj[key] || {}, msg); 
        lastObj[lastKey] = value;
    };

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
        node.outputField = config.outputField;
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

                        $scope.flag = true;

                        $scope.init = function (config) {
                            console.log("ui_context_menu: ui_contextmenu.initController > $scope.init()")
                            $scope.config = config;
                            $scope.contextmenuItems = null;
                            
                            var options = {
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
                                    $scope.send({menuItem: menuItem});                                    
                                }
                            }
                            
                            if($scope.config.fontSize) {
                                options.fontSize = $scope.config.fontSize + "px";
                            }
                            
                            try {
                                if(window.ContextMenu){
                                    $scope.contextMenu = new ContextMenu([],options); 
                                }
                                else {
                                    var urls = [
                                        '/ui_context_menu/lib/contextmenu.js',
                                        '/ui_context_menu/lib/contextmenu.css'
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

                        $scope.$watch('msg', function(msg) {
                            // Ignore undefined messages.
                            if (!msg) {
                                return;
                            }
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
