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
        // TODO font size doesn't work
        var html = String.raw`
        	<style>
                .menu {
                    width: 120px;
                    box-shadow: 0 4px 5px 3px rgba(0, 0, 0, 0.2);
                    position: relative;
                    display: none;

                    .menu-options {
                        list-style: none;
                        padding: 10px 0;

                        .menu-option {
                            font-weight: 500;
                            font-size: ` + config.fontSize + `px;
                            padding: 10px 40px 10px 20px;
                            cursor: pointer;

                            &:hover {
                                background: rgba(0, 0, 0, 0.2);
                            }
                        }
                    }
                }
            </style>
            <div id='div_` + config.id + `' ng-init='init(` + configAsJson + `)' class="menu" display='none';>
                <ul class="menu-options">
                </ul>
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
                        
                        // Fill the menu with menu items
                        function setupMenu(menuItems) {
                            // Make sure there are no previous menu options available
                            $scope.menuList.innerHTML = "";;
                        
                            menuItems.forEach(function(menuItem) {
                                var optionElement = document.createElement('option');
                                
                                optionElement.value = menuItem.command || "undefined";
                                optionElement.class = "menu-option";
                                
                                if (menuItem.enabled) {
                                    optionElement.classList.remove("disabled");
                                }
                                else {
                                    optionElement.classList.remove("disabled");
                                }

                                if (menuItem.visible) {
                                    optionElement.style.display = "block";
                                }
                                else {
                                    optionElement.style.display = "none";
                                }                                
                                
                                if (menuItem.icon && menuItem.icon != "") {
                                    optionElement.innerHTML = '<i class="fa fa-heart"></i>' + menuItem.label;
                                }
                                else {
                                    optionElement.innerHTML = menuItem.label;
                                } 
                                
                                optionElement.addEventListener('click', function() {
                                    node.send({payload: command});
                                });
                                
                                $scope.menuList.appendChild(optionElement);
                            });
                        } 
                            
                        $scope.flag = true;

                        $scope.init = function (config) {
                            $scope.config   = config;
                            $scope.menuDiv  = document.getElementById("div_" + config.id);
                            $scope.menuList = $scope.menuDiv.querySelector('ul');
                            
                            if ($scope.config.unit === "perc") {
                                $scope.unit = "%";
                            }
                            else { // "pix"
                                $scope.unit = "px";
                            }
                            
                            // When menu items available in the config screen, add those to the menu already
                            if ($scope.config.menuItems) {
                                setupMenu($scope.config.menuItems);
                            }
                        }

                        $scope.$watch('msg', function(msg) {
                            // Ignore undefined messages.
                            if (!msg) {
                                return;
                            }
                            
                            debugger;
                            
                            // TODO msg should also be able to disable or hide menu items from $scope.config.menuItems

                            if ($scope.config.position === "msg" && msg.position) {
                                // Position the context menu based on the coordinates in the message
                                $scope.menuDiv.style.left = msg.position.x + $scope.unit;
                                $scope.menuDiv.style.top  = msg.position.y + $scope.unit;
                            }
                            else {
                                // Position the context menu based on the coordinates in the config screen
                                $scope.menuDiv.style.left = $scope.config.xCoordinate + $scope.unit;
                                $scope.menuDiv.style.top  = $scope.config.yCoordinate + $scope.unit;
                            }
            
                            if ($scope.config.menu === "msg" && msg.menu) {
                                // Show the menu items that have been specified in the input message
                                setupMenu(msg.menu);
                            }
                            
                            // Show the menu to the user
                            $scope.menuDiv.style.display = "block";
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
}
