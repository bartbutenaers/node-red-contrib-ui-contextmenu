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
        
        // Based on the nice tutorial of Richard Umoffia (see https://dev.to/iamafro/how-to-create-a-custom-context-menu--5d7p)
        var html = String.raw`
            <div id='div_` + config.id + `' ng-init='init(` + configAsJson + `)' class="menu" display='none';>
            </div>
        `;
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
                            if (!msg.menu || !Array.isArray(msg.menu)) {
                                node.error("When using message based menu items, the msg.menu should contain an array of menu items");
                                msg.position = null;
                            }
                        }
                            
                        return { msg: msg };
                    },
                    beforeSend: function (msg, orig) {
                        if (orig) {
                            return orig.msg;
                        }
                    },
                    initController: function($scope, events) {
                        // Remark: all client-side functions should be added here!  
                        // If added above, it will be server-side functions which are not available at the client-side ...
                        console.log("ui_context_menu: ui_contextmenu.initController()")

                        function getPosition(scope, msg){
                            var xp = "0px",yp = "0px";
                            if (scope.config.position === "msg" && msg && msg.position) {
                                // Position the context menu based on the coordinates in the message
                                xp = msg.position.x + scope.unit;
                                yp  = msg.position.y + scope.unit;
                            }
                            else {
                                // Position the context menu based on the coordinates in the config screen
                                xp = scope.config.xCoordinate + scope.unit;
                                yp  = scope.config.yCoordinate + scope.unit;
                            }
                            return {x: xp, y: yp};
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
                        function createMenu(scope, selector, callback){
                            try {
                                $.contextMenu("destroy",selector);
                            } catch (error) {
                            }

                            // Make sure there are no previous menu options available
                            var items = {};
                            console.log("createMenu")
                            scope.config.menuItems.forEach(function(menuItem) {
                                items[menuItem.label] = {
                                    name: menuItem.label,
                                    icon: menuItem.icon,
                                    disabled: !menuItem.enabled
                                }
                            });

                            var menuConfig = {
                                callback: function(key, options) {
                                    scope.send({payload: key});
                                    $(scope.menuDivId).contextMenu("hide");
                                },
                                selector: selector,
                                zIndex: 9000,
                                trigger: "none",
                                position: function(opt, x, y){
                                    opt.$menu.css({top: y, left: x, position: "absolute"});
                                },
                                items: items
                            };

                            if($.contextMenu){
                                $.contextMenu(menuConfig);
                                callback();
                                return;
                            } else {
                                var urls = ['/ui_context_menu/lib/jquery.contextMenu.min.js', '/ui_context_menu/lib/jquery.contextMenu.min.css']
                                loadJavascriptAndCssFiles(urls, 
                                    function(){
                                        //success
                                        console.log("ui_context_menu: JQuery plugin loaded");
                                        $.contextMenu(menuConfig);
                                        callback();
                                    },
                                    function(){
                                        //fail
                                    });
                            }
                        } 
                            
                        $scope.flag = true;

                        $scope.init = function (config) {
                            console.log("ui_context_menu: ui_contextmenu.initController > $scope.init()")
                            $scope.config   = config;
                            
                            if ($scope.config.unit === "perc") {
                                $scope.unit = "%";
                            }
                            else { // "pix"
                                $scope.unit = "px";
                            }
                            $scope.menuDivId = "body > md-content"; //workaround as attaching to dynamic element results in error!
                            
                            //although this is a dashboard widget, we dont want or need it to be displayed 
                            //TODO: not working!
                            var div  = document.getElementById("div_" + config.id);
                            div.parentElement.style.width = "0px";
                            div.parentElement.style.height = "0px";
                            div.parentElement.style.left = "0px";
                            div.parentElement.style.top = "0px";
                            $(div.parentElement).removeClass("nr-dashboard-template");
                            div.parentElement.style.display = "hidden";
                      
                        }

                        $scope.$watch('msg', function(msg) {
                            console.log("ui_context_menu: ui_contextmenu.initController > $scope.$watch('msg'...)")

                            // Ignore undefined messages.
                            if (!msg) {
                                return;
                            }
                            if (!$scope.config) {
                                console.log("ui_context_menu: $scope.config is empty :(")
                                return;
                            }
                                        
                            var pos = getPosition($scope, msg);//determine postion top/left

                            if ($scope.config.menu === "msg" && msg.menu) {
                                // Show the menu items that have been specified in the input message
                                createMenu($scope, $scope.menuDivId, function(){
                                    $($scope.menuDivId).contextMenu({x:pos.left,y:pos.top}); // Show the menu
                                })                       
                            } else {
                            
                                //adding a contextMenu to dynamically added element 
                                //results in an error client side
                                //instead, I had to create it every time and attach it to a static element
                                //and since there may be more than one contextMenu, I have to destry and re-create!!!
                                // // When menu items available in the config screen, add those to the menu already
                                if ($scope.config.menuItems) {
                                    createMenu($scope, $scope.menuDivId, function(){
                                        $($scope.menuDivId).contextMenu({x:pos.x,y:pos.y}); // Show the menu
                                    });
                                }
                                                                
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
