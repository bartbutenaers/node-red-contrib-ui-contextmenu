//adapted from https://raw.githubusercontent.com/dsaul/contextmenujs/master/contextmenu.js

/*
MIT License

Copyright (c) 2018 Matthias Thalmann

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* Changes....
- permit icon to be font-awesome
- permit visible option
- check preventDefault before calling
- convert text --- to separator
- add callback to options
- add path (pseudo topic / key)
*/

function ContextMenu(menu, options){
	console.log("ContextMenu()")
	var self = this;
	this.num = ContextMenu.count++;

	this.menu = menu;
	this.contextTarget = null;

	if(!(menu instanceof Array)){
		throw new Error("Parameter 1 must be of type Array");
	}

	if(typeof options !== "undefined"){
		if(typeof options !== "object"){
			throw new Error("Parameter 2 must be of type object");
		}
	}else{
		options = {};
	}

	window.addEventListener("resize", function(){
		if(ContextUtil.getProperty(options, "close_on_resize", true)){
			self.hide();
		}
	});

	this.setOptions = function(_options){
		if(typeof _options === "object"){
			options = _options;
		}else{
			throw new Error("Parameter 1 must be of type object")
		}
	}

	this.changeOption = function(option, value){
		if(typeof option === "string"){
			if(typeof value !== "undefined"){
				options[option] = value;
			}else{
				throw new Error("Parameter 2 must be set");
			}
		}else{
			throw new Error("Parameter 1 must be of type string");
		}
	}

	this.getOptions = function(){
		return options;
	}

	this.reload = function(){
		if(document.getElementById('cm_' + this.num) == null){
			var cnt = document.createElement("div");
			cnt.className = "cm_container";
			cnt.id = "cm_" + this.num;

			document.body.appendChild(cnt);
		}

		var container = document.getElementById('cm_' + this.num);
		container.innerHTML = "";
		var ulli = renderLevel(this.menu,"",0); 
		if(ulli){
			if(options.fontSize)
				ulli.style.fontSize = options.fontSize;
			container.appendChild(ulli);
		}
	}

	function renderLevel(level, path, depth){
		var ul_outer = document.createElement("ul");
		// if(depth){
		// 	ul_outer.classList.add("cm_sub");
		// 	if(depth % 2){
		// 		ul_outer.classList.add("cm_sub_odd");
		// 	} else {
		// 		ul_outer.classList.add("cm_sub_even");
		// 	}
		// } 
		level.path = path; 
		level.forEach(function(item){
			var text = ContextUtil.getProperty(item, "text", "");
			if(!text){
				return;
			}
			item.path = level.path;
			if(item.path) item.path += "/"
			item.path += text;
			var li = document.createElement("li");
			li.menu = self;
			if(text.startsWith("---") ) {
				li.className = "cm_divider";
			} else if(typeof item.type === "undefined"){
				var icon_span = document.createElement("span");
				icon_span.className = 'cm_icon_span';

				if(ContextUtil.getProperty(item, "icon", "") != ""){
					var icon = ContextUtil.getProperty(item, "icon", "");
					if(icon.startsWith("fa-")){
						icon = "<i class='fa " + icon + "'></i>";//assume fa. 
					} else  if(icon.startsWith("fa ") || icon.startsWith("fas ")){
						icon = "<i class='" + icon + "'></i>";
					}
					icon_span.innerHTML = icon;
				}else{
					icon_span.innerHTML = ContextUtil.getProperty(options, "default_icon", "");
				}

				var text_span = document.createElement("span");
				text_span.className = 'cm_text';

				if(ContextUtil.getProperty(item, "text", "") != ""){
					text_span.innerHTML = text;
				}else{
					text_span.innerHTML = ContextUtil.getProperty(options, "default_text", "item");
				}

				var sub_span = document.createElement("span");
				sub_span.className = 'cm_sub_span';

				if(typeof item.sub !== "undefined"){
					if(ContextUtil.getProperty(options, "sub_icon", "") != ""){
						sub_span.innerHTML = ContextUtil.getProperty(options, "sub_icon", "");
					}else{
						sub_span.innerHTML = '&#155;';
					}
				}

				li.appendChild(icon_span);
				li.appendChild(text_span);
				li.appendChild(sub_span);

				var visibility = ContextUtil.getProperty(item, "visible", true);
				li.style.display = visibility ? "inherit" : "none";
				
				if(!ContextUtil.getProperty(item, "enabled", true)){
					li.setAttribute("disabled", "");
				}else{
					if(typeof item.events === "object"){
						var keys = Object.keys(item.events);

						for(var i = 0; i < keys.length; i++){
							li.addEventListener(keys[i], item.events[keys[i]]);
						}
					}
					
					if(options.callback && !item.sub){
						li.addEventListener("click", function(e){
							console.log("ui_contextmenu: Item Clicked")
							//e.stopPropagation();
							options.callback(e, item); 
							if(ContextUtil.getProperty(options, "close_on_click", true)){
								document.body.dispatchEvent(new CustomEvent("contextmenu-close-all"));
							}
						})
					}					 

					if(typeof item.sub !== "undefined"){
						var liSub = renderLevel(item.sub, item.path, depth+1);
						if(liSub){
							li.appendChild(liSub);
						}
					}
				}
			}else{
				if(item.type == ContextMenu.DIVIDER){
					li.className = "cm_divider";
				}
			}

			ul_outer.appendChild(li);
		});

		return ul_outer;
	}


	function updatePosition(ul, depth, posX, posY, windowWidth, windowHeight, zindex){
		console.log(`updatePosition(ul,depth=${depth},posX=${posX},posY=${posY},windowWidth=${windowWidth},windowHeight=${windowHeight},zindex=${zindex})`)
		ul = $(ul);
		ul.css("z-index", zindex);
		let pad = 4;
		let w = ul.width();
		let h = ul.height();
		if(depth === 0){
			posX += w + pad;
			posY += h + pad;
		} else {
			let offsetY = ul.parent().height()
			if((posX + w + pad) > windowWidth){
				ul.removeClass("cm_sub_fly_right");
				ul.addClass("cm_sub_fly_left");
				posX -= (w*0.82);
			} else {
				ul.removeClass("cm_sub_fly_left");
				ul.addClass("cm_sub_fly_right");
				posX += (w*0.96);
			}
			if((posY + h + pad) > windowHeight){
				ul.removeClass("cm_sub_fly_down");
				ul.addClass("cm_sub_fly_up");
				
				posY = (posY - h) + offsetY;
			} else {
				ul.removeClass("cm_sub_fly_up");
				ul.addClass("cm_sub_fly_down");
				posY = (posY + h) - offsetY;
			}
		}
		
		let children = $(ul).children();
		children.each(function(idx, item){
			if(item.tagName === "LI"){
				let lichildren = $(item).children();
				lichildren.each(function(idx, childitem){
					if(childitem.tagName === "UL"){
						updatePosition(childitem, depth + 1, posX, posY, windowWidth, windowHeight, zindex + 1);
					}
				})
			}
		})

	}

	this.display = function (e, target) {
		console.log("ContextMenu.display()")
		document.body.dispatchEvent(new CustomEvent("contextmenu-close-all"));
		
		if(typeof target !== "undefined"){
			self.contextTarget = target;
		}else{
			self.contextTarget = e.target;
		}

		var menu = document.getElementById('cm_' + this.num);
				
		updatePositionsBeforeDisplay(menu, e, options.zIndex || 9000);

		function updatePositionsBeforeDisplay(menu, e, zindex){
			var clickCoords = {x: e.clientX, y: e.clientY};
			var clickCoordsX = clickCoords.x || 0;
			var clickCoordsY = clickCoords.y || 0;
	
			var menuWidth = menu.offsetWidth + 4;
			var menuHeight = menu.offsetHeight + 4;
		
			var windowWidth = window.innerWidth;
			var windowHeight = window.innerHeight;
			var mouseOffset = parseInt(ContextUtil.getProperty(options, "mouse_offset", 2));

			var ml, mt;
			if((windowWidth - clickCoordsX) < menuWidth){
				ml = windowWidth - menuWidth;
				if(ml<0) ml = 0;
				menu.style.left = ml +  "px";
			}else{
				ml = (clickCoordsX + mouseOffset);
				menu.style.left = (clickCoordsX + mouseOffset) + "px";
			}
	
			if((windowHeight - clickCoordsY) < menuHeight){
				mt = windowHeight - menuHeight;
				if(mt<mt) ml = 0;
				menu.style.top = mt + "px";
			}else{
				mt = (clickCoordsY + mouseOffset);
				menu.style.top = (clickCoordsY + mouseOffset) + "px";
			}
				
	
			// var sizes = ContextUtil.getSizes(menu);
	
			// if((windowWidth - clickCoordsX) < sizes.width){
			// 	menu.classList.add("cm_border_right");
			// }else{
			// 	menu.classList.remove("cm_border_right");
			// }
			
			// if((windowHeight - clickCoordsY) < sizes.height){
			// 	menu.classList.add("cm_border_bottom");
			// }else{
			// 	menu.classList.remove("cm_border_bottom");
			// }
			//debugger
			var firstUL = $(menu).children("UL")[0];
			updatePosition(firstUL, 0, ml, mt, window.innerWidth, window.innerHeight, zindex + 1 );
		}


		menu.classList.add("display");
		menu.style.pointerEvents = "auto";

		if(ContextUtil.getProperty(options, "close_on_click", true)){
			requestAnimationFrame(() => { // Animation frame allows using click to open it as well.
				window.addEventListener("click", documentClick);
				document.body.addEventListener("contextmenu-close-all", documentClick);
			});
		}

		if(e.preventDefault) e.preventDefault();
	}

	this.hide = function(){
		let e = document.getElementById('cm_' + this.num);
		if (e) { // In case the node was removed by somethign else.
			e.classList.remove("display");
			e.style.pointerEvents = "none";
			window.removeEventListener("click", documentClick);
			document.body.removeEventListener("contextmenu-close-all", documentClick);
		}
	}

	function documentClick(event){
		//ensure event came from outside the menu (prevent closing menu if clicking self)
		if (event && event.target.closest('#cm_' + self.num)) {
			//clicked self - dont hide
		} else {
			self.hide();
		}
	}

	this.reload();
}

ContextMenu.count = 0;
ContextMenu.DIVIDER = "cm_divider";

const ContextUtil = {
	getProperty: function(options, opt, def){
		if(typeof options[opt] !== "undefined"){
			return options[opt];
		}else{
			return def;
		}
	},

	getSizes: function(obj){
		var lis = obj.getElementsByTagName('li');

		var width_def = 0;
		var height_def = 0;

		for(var i = 0; i < lis.length; i++){
			var li = lis[i];

			if(li.offsetWidth > width_def){
				width_def = li.offsetWidth;
			}

			if(li.offsetHeight > height_def){
				height_def = li.offsetHeight;
			}
		}

		var width = width_def;
		var height = height_def;

		for(var i = 0; i < lis.length; i++){
			var li = lis[i];

			var ul = li.getElementsByTagName('ul');
			if(typeof ul[0] !== "undefined"){
				var ul_size = ContextUtil.getSizes(ul[0]);

				if(width_def + ul_size.width > width){
					width = width_def + ul_size.width;
				}

				if(height_def + ul_size.height > height){
					height = height_def + ul_size.height;
				}
			}
		}

		return {
			"width": width,
			"height": height
		};
	}
};
