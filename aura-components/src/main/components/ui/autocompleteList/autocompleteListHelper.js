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
    /**
     * Find out the current highlighted option.
     * @return the index of the highlighted component; -1 if no opton is highlighted now.
     */
    findHighlightedOptionIndex: function(iters) {
        for (var i = 0; i < iters.length; i++) {
            var optionCmp = iters[i];
            if (optionCmp.get("v.visible") === true && optionCmp.get("v.highlighted") === true) {
                return i;
                break;
            }
        }
        return -1;
    },

    /**
     * Notify that the matching is done.
     */
    fireMatchDoneEvent: function(component, items) {
        var size = 0;
        for (var i = 0; i < items.length; i++) {
            if (items[i].visible === true) {
                size++;
            }
        }
        var evt = component.get("e.matchDone");
        if (evt) {
            evt.setParams({
                size: size
            });
            evt.fire();
        }
    },

    getEventSourceOptionComponent: function(component, event) {
        //option could be a compound component so look for the right option
        var element = event.target || event.srcElement;
        var targetCmp;
        do {
            var htmlCmp = $A.componentService.getRenderingComponentForElement(element);
            if ($A.util.isUndefinedOrNull(htmlCmp)) {
                return null;
            }
            targetCmp = htmlCmp.getComponentValueProvider().getConcreteComponent();
            element = targetCmp.getElement().parentElement;
        } while (!targetCmp.isInstanceOf("ui:autocompleteOptionTemplate"));
        return targetCmp;
    },

    getNextVisibleOption: function(iters, k) {
        var next = -1;
        var start = k >= iters.length - 1 ? 0 : k + 1;
        for (var i = start; i < iters.length; i++) {
            var optionCmp = iters[i];
            if (optionCmp.get("v.visible") === true) {
                next = i;
                break;
            }
        }
        
        if (next < 0) { // If no visible is found below the current highlighted,  let's start from top.
            for (var j = 0; j < k; j++) {
                var optCmp = iters[j];
                if (optCmp.get("v.visible") === true) {
                    next = j;
                    break;
                }
            }
        }
        return next;
    },

    getOnClickEndFunction : function(component) {
        if ($A.util.isUndefined(component._onClickEndFunc)) {
            var helper = this;
            var i;
            var f = function(event) {
                // ignore gestures/swipes; only run the click handler if it's a click or tap
                var clickEndEvent;

                if (helper.getOnClickEventProp("isTouchDevice")) {
                    var touchIdFound = false;
                    for (i = 0; i < event.changedTouches.length; i++) {
                        clickEndEvent = event.changedTouches[i];
                        if (clickEndEvent.identifier === component._onStartId) {
                            touchIdFound = true;
                            break;
                        }
                    }

                    if (helper.getOnClickEventProp("isTouchDevice") && !touchIdFound) {
                        return;
                    }
                } else {
                    clickEndEvent = event;
                }

                var startX = component._onStartX, startY = component._onStartY;
                var endX = clickEndEvent.clientX, endY = clickEndEvent.clientY;

                if (Math.abs(endX - startX) > 0 || Math.abs(endY - startY) > 0) {
                    return;
                }

                var listElems = component.getElements();
                var ignoreElements = component.get("v.ignoredElements");
                var clickOutside = true;
                if (listElems) {
                    var ret = true;
                    for (i = 0; ret; i++) {
                        ret = listElems[i];
                        if (ret && helper.isHTMLElement(ret) && $A.util.contains(ret, event.target)) {
                            clickOutside = false;
                            break;
                        }
                    }
                }
                if (ignoreElements && clickOutside === true) {
                    var ret2 = true;
                    for (var j = 0; ret2; j++) {
                        ret2 = ignoreElements[j];
                        if (ret2 && helper.isHTMLElement(ret2) && $A.util.contains(ret2, event.target)) {
                            clickOutside = false;
                            break;
                        }
                    }
                }
                if (clickOutside === true) {
                    // Collapse the menu
                    component.set("v.visible", false);
                }
            };
            component._onClickEndFunc = f;
        }
        return component._onClickEndFunc;
    },

    getOnClickEventProp: function(prop) {
        // create the cache
        if ($A.util.isUndefined(this.getOnClickEventProp.cache)) {
            this.getOnClickEventProp.cache = {};
        }

        // check the cache
        var cached = this.getOnClickEventProp.cache[prop];
        if (!$A.util.isUndefined(cached)) {
            return cached;
        }

        // fill the cache
        this.getOnClickEventProp.cache["isTouchDevice"] = !$A.util.isUndefined(document.ontouchstart);
        if (this.getOnClickEventProp.cache["isTouchDevice"]) {
            this.getOnClickEventProp.cache["onClickStartEvent"] = "touchstart";
            this.getOnClickEventProp.cache["onClickEndEvent"] = "touchend";
        } else {
            this.getOnClickEventProp.cache["onClickStartEvent"] = "mousedown";
            this.getOnClickEventProp.cache["onClickEndEvent"] = "mouseup";
        }
        return this.getOnClickEventProp.cache[prop];
    },

    getOnClickStartFunction: function(component) {
        if ($A.util.isUndefined(component._onClickStartFunc)) {
            var helper = this;
            var f = function(event) {
                if (helper.getOnClickEventProp("isTouchDevice")) {
                    var touch = event.changedTouches[0];
                    // record the ID to ensure it's the same finger on a multi-touch device
                    component._onStartId = touch.identifier;
                    component._onStartX = touch.clientX;
                    component._onStartY = touch.clientY;
                } else {
                    component._onStartX = event.clientX;
                    component._onStartY = event.clientY;
                }
            };
            component._onClickStartFunc = f;
        }
        return component._onClickStartFunc;
    },

    getPrevVisibleOption: function(iters, k) {
        var prev = iters.length;
        var start = k <= 0 ? iters.length - 1 : k - 1;
        for (var i = start; i >= 0; i--) {
            var optionCmp = iters[i];
            if (optionCmp.get("v.visible") === true) {
                prev = i;
                break;
            }
        }
        if (prev >= iters.length) { // If no visible is found above the current highlighted,  let's start from bottom.
            for (var j = iters.length - 1; j > k; j--) {
                var optCmp = iters[j];
                if (optCmp.get("v.visible") === true) {
                    prev = j;
                    break;
                }
            }
        }
        return prev;
    },

    handleDataChange: function(component, event) {
        var concreteCmp = component.getConcreteComponent();

        // Refactor this component:
        // We want to update the internal v.items, but without udating iteration just yet
        // since customer might have thir own matchText function
        concreteCmp.set("v.items", event.getParam("data"), true/*ignore changes, dont notify*/); 

        this.matchText(concreteCmp, event.getParam("data"));
    },

    handleEsckeydown: function(component) {
        component.set("v.visible", false);
    },

    handleKeydown: function(component, event) {
        var keyCode = event.keyCode;
        if (keyCode === 39 || keyCode === 40) {  // right or down arrow key
            event.preventDefault();
            this.setFocusToNextItem(component, event);
        } else if (keyCode === 37 || keyCode === 38) {  // left or up arrow key
            event.preventDefault();
            this.setFocusToPreviousItem(component, event);
        } else if (keyCode === 27) {  // Esc key
            event.stopPropagation();
            this.handleEsckeydown(component, event);
        } else if (keyCode === 9) {  // tab key: dismiss the list
            this.handleTabkeydown(component, event);
        }
    },

    handleListHighlight: function(component, event) {
        var activeIndex = -1;
        var iterCmp = component.find("iter");
        if (iterCmp) {
            var iters = iterCmp.get("v.body");
            var highlightedIndex = this.findHighlightedOptionIndex(iters);
            var index = event.getParam("activeIndex");
            if (index < 0) { // highlight previous visible option
                activeIndex = highlightedIndex < 0 ? this.getPrevVisibleOption(iters, iters.length)
                                                   : this.getPrevVisibleOption(iters, highlightedIndex);
            } else { // highlight next visible option
                activeIndex = highlightedIndex < 0 ? this.getNextVisibleOption(iters, -1)
                                                   : this.getNextVisibleOption(iters, highlightedIndex);
            }
            if (activeIndex >= 0 && activeIndex < iters.length && activeIndex !== highlightedIndex) {
                if (highlightedIndex >= 0) {
                    iters[highlightedIndex].set("v.highlighted", false);
                }
                
                var highlightedCmp = iters[activeIndex];
                highlightedCmp.set("v.highlighted", true);
                var highlightedElement = highlightedCmp.getElement();
                if (highlightedElement) {
                    if (highlightedElement.scrollIntoViewIfNeeded) {
                        highlightedElement.scrollIntoViewIfNeeded();
                    } else {
                        highlightedElement.scrollIntoView(false);
                    }
                }
                this.updateAriaAttributes(component, highlightedCmp);
            }
        }
    },

    handlePressOnHighlighted: function(component) {
        var iterCmp = component.find("iter");
        if (iterCmp) {
            var iters = iterCmp.get("v.body");
            var highlightedIndex = this.findHighlightedOptionIndex(iters);
            if (highlightedIndex >= 0) {
                var targetCmp = iters[highlightedIndex];
                var selectEvt = component.get("e.selectListOption");
                selectEvt.setParams({
                    option: targetCmp
                });
                selectEvt.fire();
            }
        }
    },

    handleTabkeydown: function(component) {
        component.set("v.visible", false);
    },
    
    hasVisibleOption : function(items) {
        var hasVisibleOption = false;
        for (var i = 0; i < items.length; i++) {
            if (items[i].visible === true) {
                hasVisibleOption = true;
                break;
            }
        }
        
        return hasVisibleOption;
    },

    /**
     * Checks if the object is an HTML element.
     * @param {Object} obj
     * @returns {Boolean} True if the object is an HTMLElement object, or false otherwise.
     */
    isHTMLElement: function(obj) {
        if (typeof HTMLElement === "object") {
            return obj instanceof HTMLElement;
        } else {
            return typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName==="string";
        }
    },

    matchFunc: function(component, items) {
        items = items || component.get('v.items');
        var keyword = component.get("v.keyword");
        var propertyToMatch = component.get("v.propertyToMatch");
        var regex;
        try {
            regex = new RegExp(keyword, "i");
            for (var j = 0; j < items.length; j++) {
                items[j].keyword = keyword;
                var label = items[j][propertyToMatch];
                var searchResult = regex.exec(label);
                if (searchResult && searchResult[0].length > 0) { // Has a match
                    items[j].visible = true;
                } else {
                    items[j].visible = false;
                }
            }
        } catch (e) { // if keyword is not a legal regular expression, don't show anything
            for (var i = 0; i < items.length; i++) {
                items[i].keyword = keyword;
                items[i].visible = false;
            }
        }
    },

    matchFuncDone: function(component, items) {
        items = items || component.get('v.items');
        this.fireMatchDoneEvent(component, items);
        this.toggleListVisibility(component, items);
        this.showLoading(component, false);

        // Finally we update the v.items so iteration can 
        // create the final items here.
        component.set("v.items", items);
        
        //this.updateEmptyListContent(component);
        //JBUCH: HALO: HACK: WTF: FIXME THIS WHOLE COMPONENT
        var itemCmps=component.find("iter").get("v.body");
        for(var i=0;i<itemCmps.length;i++){
            $A.util.toggleClass(itemCmps[i],"force");
        }


    },

    matchText: function(component, items) {
        var action = component.get("v.matchFunc");
        if (action) {
            action.setCallback(this, function(result) {
                //@dval: Refactor all this nonsense:
                // - it should not be an action but js function
                // - it should not have the responsability to set the items directly
                // - we should not fire yet another stupid event since we are in the callback

                //this.matchFunc(component, items);
                this.matchFuncDone(component, items);
            });
            action.setParams({items: items});
            $A.enqueueAction(action);
        } else {
            this.matchFunc(component, items);
            this.matchFuncDone(component, items);
        }
    },

    toggleListVisibility: function(component, items) {
        var showEmptyListContent = !$A.util.isEmpty(component.get("v.emptyListContent")) &&
                !$A.util.isEmpty(component.get("v.keyword")); 

        var hasVisibleOption = this.hasVisibleOption(items);
        
        // Should no longer be necessary, as the class attribute is now adds "visible" if v.visible is true.
        //var list = component.find("list");
        //$A.util.toggleClass(list, "visible", hasVisibleOption);
        
        component.set("v.visible", hasVisibleOption || showEmptyListContent);
    },

    updateAriaAttributes: function(component, highlightedCmp) {
        var updateAriaEvt = component.get("e.updateAriaAttributes");
        if (updateAriaEvt) {
            var obj = {
                "aria-activedescendant": highlightedCmp.get("v.domId")
            };
            updateAriaEvt.setParams({
                attrs: obj
            });
            updateAriaEvt.fire();
        }
    },
    
    updateEmptyListContent: function (component) {
        var visible = component.getConcreteComponent().get("v.visible");
        var items = component.getConcreteComponent().get("v.items");
        var hasVisibleOption = this.hasVisibleOption(items);
        
        $A.util.toggleClass(component, "showEmptyContent", visible && !hasVisibleOption);
    },
    
    showLoading:function (component, visible) {
        $A.util.toggleClass(component, "loading", visible);

        // Originally, no loading indicator was shown. Making it only appear when specified in the facet.
        if (!$A.util.isEmpty(component.get("v.loadingIndicator"))) {
            var list = component.find("list");
            $A.util.toggleClass(list, "invisible", !visible);
        }
    },

    setUpEvents: function (component) {
        if (component.isRendered()) {
            var obj = {};
            var visible = component.get("v.visible");

            // Should no longer be necessary. We do this in an expression now on the list
            //var list = component.find("list");
            //$A.util.toggleClass(list, "visible", visible);

            // auto complete list is hidden.
            if (visible === false) {
                // Remove loading indicator
                obj["aria-activedescendant"] = "";
                obj["aria-expanded"] = false;
                // De-register list expand/collapse events
                $A.util.removeOn(document.body, this.getOnClickEventProp("onClickStartEvent"), this.getOnClickStartFunction(component));
                $A.util.removeOn(document.body, this.getOnClickEventProp("onClickEndEvent"), this.getOnClickEndFunction(component));
            } else { // Register list expand/collapse events
                obj["aria-expanded"] = true;
                $A.util.on(document.body, this.getOnClickEventProp("onClickStartEvent"), this.getOnClickStartFunction(component));
                $A.util.on(document.body, this.getOnClickEventProp("onClickEndEvent"), this.getOnClickEndFunction(component));

                //push this even to the end of the queue to ensure that the interation in the component body is complete
                window.setTimeout($A.getCallback(function () {
                    component.get("e.listExpand").fire();
                }, 0));

            }


            // Update accessibility attributes
            var updateAriaEvt = component.get("e.updateAriaAttributes");
            if (updateAriaEvt) {
                updateAriaEvt.setParams({
                    attrs: obj
                });
                updateAriaEvt.fire();
            }
        }
    }
})// eslint-disable-line semi
