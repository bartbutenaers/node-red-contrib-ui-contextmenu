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
        
        // Based on a codepen from Ryan Morr (see https://codepen.io/ryanmorr/pen/JdOvYR)
        var html = String.raw`
        	<style>
                .menu {
                    position: fixed;
                    width: 200px;
                    padding: 2px;
                    margin: 0;
                    border: 1px solid #bbb;
                    background: #eee;
                    background: -webkit-linear-gradient(to bottom, #fff 0%, #e5e5e5 100px, #e5e5e5 100%);
                    background: linear-gradient(to bottom, #fff 0%, #e5e5e5 100px, #e5e5e5 100%);
                    z-index: 99000 !important;
                    border-radius: 3px;
                    box-shadow: 1px 1px 4px rgba(0,0,0,.2);
                    opacity: 0;
                    -webkit-transform: translate(0, 15px) scale(.95);
                    transform: translate(0, 15px) scale(.95);
                    transition: transform 0.1s ease-out, opacity 0.1s ease-out;
                    pointer-events: none;
                }

                .menu-item {
                    display: block;
                    position: relative;
                    margin: 0;
                    padding: 0;
                    white-space: nowrap;
                }

                .menu-btn { 
                    display: block;
                    color: #444;
                    font-family: 'Roboto', sans-serif;
                    font-size: 18px;
                    cursor: pointer;
                    border: 1px solid transparent;
                    white-space: nowrap;
                    padding: 6px 8px;
                    border-radius: 3px;
                }

                button.menu-btn {
                    background: none;
                    line-height: normal;
                    overflow: visible;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    width: 100%;
                    text-align: left;
                }

                a.menu-btn {
                    outline: 0 none;
                    text-decoration: none;
                }

                .menu-text {
                    margin-left: 25px;
                }

                .menu-btn .fa {
                    position: absolute;
                    left: 8px;
                    top: 50%;
                    -webkit-transform: translateY(-50%);
                    transform: translateY(-50%);
                }

                .menu-item:hover > .menu-btn { 
                    color: #fff; 
                    outline: none; 
                    background-color: #2E3940;
                    background: -webkit-linear-gradient(to bottom, #5D6D79, #2E3940);
                    background: linear-gradient(to bottom, #5D6D79, #2E3940);
                    border: 1px solid #2E3940;
                }

                .menu-item-disabled {
                    opacity: .5;
                    pointer-events: none;
                }

                .menu-item-disabled .menu-btn {
                    cursor: default;
                }

                .menu-separator {
                    display:block;
                    margin: 7px 5px;
                    height:1px;
                    border-bottom: 1px solid #fff;
                    background-color: #aaa;
                }

                .menu-item-submenu::after {
                    content: "";
                    position: absolute;
                    right: 6px;
                    top: 50%;
                    -webkit-transform: translateY(-50%);
                    transform: translateY(-50%);
                    border: 5px solid transparent;
                    border-left-color: #808080; 
                }

                .menu-item-submenu:hover::after {
                    border-left-color: #fff;
                }

                .menu .menu {
                    top: 4px;
                    left: 99%;
                }

                .menu-show,
                .menu-item:hover > .menu {
                    opacity: 1;
                    -webkit-transform: translate(0, 0) scale(1);
                    transform: translate(0, 0) scale(1);
                    pointer-events: auto;
                }

                .menu-item:hover > .menu {
                    -webkit-transition-delay: 300ms;
                    transition-delay: 300ms;
                }
            </style>
            <div id='div_` + config.id + `' ng-init='init(` + configAsJson + `)'>
                <ul class="menu">
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
                                var listItem = document.createElement('li');
                                
                                listItem.classList.add("menu-item");
                                
                                if (menuItem.enabled) {
                                    listItem.classList.remove("menu-item-disabled");
                                }
                                else {
                                    listItem.classList.add("menu-item-disabled");
                                }

                                if (menuItem.visible) {
                                    listItem.style.display = "block";
                                }
                                else {
                                    listItem.style.display = "none";
                                }                                
                      
                                $scope.menuList.appendChild(listItem);
                                
                                var button = document.createElement('button');
                                button.classList.add("menu-btn");
                                listItem.appendChild(button);
                                
                                button.addEventListener('click', function() {
                                    $scope.menuList.classList.remove('menu-show');
                                    
                                    node.send({payload: command});
                                });
                                
                                var innerHtml = "";
                               
                                if (menuItem.icon && menuItem.icon != "") {
                                    innerHtml += '<i class="fa ' + menuItem.icon + '"></i>';
                                }
                                
                                // TODO what if both icon and command are empty ...
                                if (menuItem.command && menuItem.command != "") {
                                    innerHtml += '<span class="menu-text">' + menuItem.command + '</span>';
                                }
                                
                                button.innerHTML = innerHtml;
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
                            $scope.menuList.classList.add('menu-show');
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
