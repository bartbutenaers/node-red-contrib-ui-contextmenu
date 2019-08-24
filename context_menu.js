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
                            font-size: 14px;
                            padding: 10px 40px 10px 20px;
                            cursor: pointer;

                            &:hover {
                                background: rgba(0, 0, 0, 0.2);
                            }
                        }
                    }
                }
            </style>
            <div id='contextmenu_` + config.id + `' ng-init='init(` + configAsJson + `)' class="menu" display='none';>
                <ul class="menu-options">
                    <li class="menu-option">Back</li>
                    <li class="menu-option">Reload</li>
                    <li class="menu-option">Save</li>
                    <li class="menu-option">Save As</li>
                    <li class="menu-option">Inspect</li>
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
         try {
            var node = this;
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
                        //debugger;
                        return { msg: msg };
                    },
                    beforeSend: function (msg, orig) {
                        if (orig) {
                            return orig.msg;
                        }
                    },
                    initController: function($scope, events) {
                        //debugger;
                        $scope.flag = true;
                        //console.log("initController")
                        $scope.init = function (config) {
                            $scope.config = config;
                            $scope.contextMenu = document.getElementById("contextmenu_" + config.id);
                            
                            // When menu items available in the config screen, add those to the menu already
                            var menuItems = $scope.config.menuItems || [];
                            /*
                            for (var i = min; i<=max; i++){
                                var opt = document.createElement('option');
                                opt.value = i;
                                opt.class="menu-option";
                                opt.innerHTML = i;
                                
                                
                                opt.addEventListener('click', function() {
                                    node.send({payload: waarde});
                                });
                                
                                select.appendChild(opt);
                            }
                            */
                        }

                        $scope.$watch('msg', function(msg) {
                            // Ignore undefined messages.
                            if (!msg) {
                                return;
                            }
                            
                            debugger;
                            
                            // TODO allow msg overriding the config screen settings
                            // msg should also be able to disable or hide menu items from $scope.config.menuItems
                            var position = $scope.config.position; // "fixed" or "msg"
                            var unit = $scope.config.unit; // "perc" or "pix"
                            var xCoordinate = $scope.config.xCoordinate;
                            var yCoordinate = $scope.config.yCoordinate;
                            var menu = $scope.config.menu; // "fixed" or "msg"
                            var menuItems = $scope.config.menuItems || [];
                            
                            if (unit === "perc") {
                                unit = "%";
                            }
                            else { // "pix"
                                unit = "px";
                            }
                            
                            $scope.contextMenu.style.display = "block";

                            $scope.contextMenu.style.left = xCoordinate + unit;
                            $scope.contextMenu.style.top =  yCoordinate + unit;
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