/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

({
    activateTab: function (cmp, index, focus) {
        var tabItems = this.getTabItems(cmp);
        if ($A.util.isNumber(index) && tabItems[index]) {
        	if (cmp.get("v.useOverflowMenu") && index != (tabItems.length - 1) 
        			&& this.isInOverflow(cmp, index) && focus != false) {
        		this.updateOverflowTab(cmp, index);
        	}
        	
            this.deactivateTab(cmp, tabItems[index]);
            tabItems[index].get("e.activateTab").setParams({"active": true, "focus": focus}).fire();
        }
    },

    /**
     * Close given tab item
     */
    closeTab: function (cmp, index) {
        var closed = false, tabItems = this.getTabItems(cmp);
        if ($A.util.isNumber(index) && index >= 0 && index < tabItems.length) {
            var item = tabItems.splice(index, 1);
            item[0].destroy();
            closed = true;
        }
        return closed;
    },

    getTabItems: function (cmp) {
        return cmp.find("tabItemsContainer").get("v.body") || [];
    },

    /**
     * Add new tab item to the tabBar
     * TODO: overflow integration
     */
    addTab: function (cmp, index, tab) {
        var self = this, items = this.getTabItems(cmp);
        if ($A.util.isNumber(index) && index >= 0 && index <= items.length) {
            var tabValues = [tab];
            var itemsContainer = cmp.find("tabItemsContainer");
            this.createComponents(cmp, tabValues, function (newItems) {
                items.splice.apply(items, [index, 0].concat(newItems));
                itemsContainer.set("v.body", items);
                if (newItems[0].get("v.active")) {
                    self.activateTab(cmp, index);
                }
            });
        }
    },

    /**
     * @private
     * Deactivate the active tab
     */
    deactivateTab: function (cmp, activeTab) {
        if (cmp._activeTab === activeTab) {
            return;
        }
        if (cmp._activeTab && cmp._activeTab.isValid()) {
            var e = cmp._activeTab.get("e.activateTab");
            e.setParams({active: false}).fire();
        }
        cmp._activeTab = activeTab;
    },

    onKeyDown: function (cmp, domEvent) {
        var srcElement = domEvent.srcElement || domEvent.target, keyCode = domEvent.keyCode;

        if (srcElement.hasAttribute("aria-selected") && keyCode >= 37 && keyCode <= 40) {
            var tabItems = this.getTabItems(cmp), len = tabItems.length;
            var index = this.getTabIndex(cmp, srcElement);
            
            if (index < 0 || index >= len) {
                return;
            }
            
            var overflowData, overflowMenuIndex;
            if (cmp.get("v.useOverflowMenu")) {
            	overflowData = this.getOverflowData(cmp);
            	overflowMenuIndex = -1;
            }
            
            var oldTab = index;
            if (keyCode === 37 || keyCode === 38) {
                //left or up arrow key
            	if (overflowData && index === overflowData.overflowTabIndex) {
            		index = overflowData.startIndex - 1;
            	} else if (index === 0) {
                    index = len - 1;
                } else {
                    index--;
                }
            } else if (keyCode === 39 || keyCode === 40) {
                //right or down arrow key
            	if (overflowData && index === overflowData.startIndex - 1) {
            		index = overflowData.overflowTabIndex;
            	} else if (overflowData && index === overflowData.overflowTabIndex) {
            		index = len - 1;
            		overflowMenuIndex = 0;
            	} else if (index === len - 1) {
                    index = 0;
                } else {
                    index++;
                }
            }
            
            if (overflowData && index == len - 1) {
            	tabItems[index].get("e.activateTab").setParams({"active" : true, "index" : overflowMenuIndex}).fire();
            } else {
            	cmp.get('e.onTabActivated').setParams({"index": index, "oldTab": oldTab}).fire();
            }
            $A.util.squash(domEvent, true);
        }
    },


    /**
     * Get element position index
     * @private
     */
    getTabIndex: function (cmp, element) {
        var index = -1, container = cmp.find("tabItemsContainer").getElement();
        var el = element;
        while (el.parentNode) {
            if (el.parentNode === container) {
                index = Array.prototype.indexOf.call(container.children, el);
                break;
            }
            el = el.parentNode;
        }
        return index;
    },

    /**
     * @private
     */
    setTabItems: function (cmp) {
        this.createComponents(cmp, cmp.get("v.tabs"), function (items) {
            cmp.find('tabItemsContainer').set("v.body", items);
        });
    },

    /**
     * @private
     */
    createComponents: function (cmp, tabValues, callback) {
        var items = [],
            len = tabValues.length,
            counter = len;

        var fn = function (newCmp) {
            counter--;
            newCmp.addHandler("onActivate", cmp, "c.onTabActivated");
            newCmp.addHandler("onClose", cmp, "c.onTabClosed");
            newCmp.addHandler("onTabHover", cmp, "c.onTabHover");
            newCmp.addHandler("onTabUnhover", cmp, "c.onTabUnhover");
            items.push(newCmp);
            if (counter === 0 && callback) {
                callback(items);
            }
        };

        for (var i = 0; i < len; i++) {
            var config = tabValues.get ? tabValues.get(i) : tabValues[i];
            $A.componentService.newComponentAsync(this, fn, config, config.valueProvider);
        }
    },
    
    /**
     * Overflow
     */
    
    /**
     * Calculates the maximum number of tabs that should be in the tab bar.
     * If the tab bar contains more tabs, those will go into the overflow
     */
    calculateMaxTabs : function(cmp) {
    	var barWidth = cmp.get("v.barWidth") || 0,
			tabWidth = cmp.get("v.tabItemWidth") || barWidth;
    	
		return Math.floor(barWidth / tabWidth) || 0;
    },
    
    calculateOverflowStartIndex : function(cmp, maxTabs) {
    	var tabItems = this.getTabItems(cmp),
    		startIndex = -1;
    	
    	if (tabItems.length > maxTabs) {
    		startIndex = maxTabs - 2;
    		
    		if (startIndex < 0) {
    			startIndex = 0;
    		}
    	}
    	
    	return startIndex;
    },
    
    /**
     * Initializes overflow data and creates the overflow menu
     * starting at the specified startIndex
     */
    initializeOverflowData : function(cmp, startIndex) {
		var tabCache = {},
			menuItems = [],
			tabItems = this.getTabItems(cmp);
		
		// Hide all overflowing tabs first
		for (var i = startIndex; i < tabItems.length; i++) {
			var title = tabItems[i].get("v.title"),
				key = this.getTabName(tabItems[i]);
			
			tabCache[key] = i;
			
			if (i != startIndex) {
				tabItems[i].set("v.hidden", true);
				menuItems.push(this.createMenuItem(key, title));
			}
		}
		
		// Create overflow menu tab
		$A.createComponent("ui:tabOverflowMenuItem", { "title" : cmp.get("v.overflowLabel") }, function(newMenuTab) {
			newMenuTab.set("v.menuItems", menuItems);
			newMenuTab.addHandler("onTabSelection", cmp, "c.onOverflowSelection");
			
			tabItems.push(newMenuTab);
			cmp.find("tabItemsContainer").set("v.body", tabItems);
			cmp.find("tabItemsContainer").rerender(); // Workaround for tabs not rerendering and updating their 'hidden' status
		});

		cmp.set("v.overflowData", {
					tabCache : tabCache,
					overflowTabIndex : startIndex,
					startIndex : startIndex
		});

	},
	
	/**
	 * Swaps the last tab with the tab at the specified index
	 */
	updateOverflowTab: function(cmp, index) {
		var overflowData = this.getOverflowData(cmp),
			tabItems = this.getTabItems(cmp),
			oldIndex = overflowData.overflowTabIndex,
			oldTab = tabItems[oldIndex],
			newTab = tabItems[index];
		
		if (index != oldIndex) {
			var overflowTab = tabItems[tabItems.length - 1];
			
			this.swapOverflowTabs(cmp, overflowTab, oldTab, newTab);
			
			this.toggleTab(oldTab, true);
			this.toggleTab(newTab, false);
			
			overflowData.overflowTabIndex = index;
			cmp.set("v.overflowData", overflowData, true);
		}
	},
	
	/**
	 * Remove the newTab from the overflow menu and add the oldTab as
	 * the top menu item.
	 * 
	 * TODO: Move the add/remove functionality into the methods on the tabOverflowMenuItem?
	 */
	swapOverflowTabs: function(cmp, overflowTab, oldTab, newTab) {
		var self = this,
			menuList = overflowTab.get("v.menuItems");
		
		menuList = menuList.filter(function(menuItem) {
			return menuItem.id != self.getTabName(newTab);
		});
		
		menuList.splice(0, 0, self.createMenuItemFromTab(oldTab));
		
		overflowTab.set("v.menuItems", menuList);
	},

	/**
	 * Private helper methods
	 */
	toggleTab : function(tab, condition) {
		if (condition == undefined) {
			condition = !tab.get("v.hidden");
		}
		
		tab.set("v.hidden", condition);
		$A.util.toggleClass(tab, "hidden", condition);
	},
	
	isInOverflow : function(cmp, index) {
		var overflowData = this.getOverflowData(cmp);
		return overflowData ? index >= overflowData.startIndex : false;
	},
	
	getTabName : function(tab) {
		return tab.get("v.name") || tab.get("v.title").toLowerCase() || "";
	},
	
	getOverflowData : function(cmp) {
		return cmp.get("v.overflowData");
	},
	
	createMenuItemFromTab: function(tab) {
		var name = this.getTabName(tab);
		return this.createMenuItem(name, tab.get("v.title") || name);
	},
	
	createMenuItem : function(id, label) {
		return {id : id, label : label};
	},
})// eslint-disable-line semi