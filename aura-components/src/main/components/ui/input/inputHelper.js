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
    buildBody : function(component) {
        var innerBody = component.get("v.body");
        var labelAttribute = component.get("v.label");
        if (!$A.util.isEmpty(labelAttribute)) {
            //create label
            var domId = component.get("v.domId");
            if (!domId) {
                domId = component.getConcreteComponent().getGlobalId();
            }
            var labelPositionAttribute = this.checkValidPosition(component.get("v.labelPosition"));
            var labelClass = component.get("v.labelClass") + " uiLabel-" + labelPositionAttribute + " form-element__label";
            var labelDisplay = labelPositionAttribute != "hidden";
            var requiredIndicator = labelDisplay && component.get("v.required") ? component.get("v.requiredIndicator") : null;
            var labelComponent = $A.newCmp({
                    componentDef: {descriptor: 'markup://ui:label'},
                    localId: 'inputLabel',
                    attributes: {values: {
                        label: labelAttribute,
                        "class": labelClass,
                        "for": domId,
                        labelDisplay: labelDisplay,
                        title: component.get("v.labelTitle"),
                        requiredIndicator: requiredIndicator}}},
                    component );
            if (labelPositionAttribute == 'left' || labelPositionAttribute == 'top') {
                innerBody.unshift(labelComponent);
            } else if (labelPositionAttribute == 'right' || labelPositionAttribute == 'bottom' || labelPositionAttribute == 'hidden') {
                innerBody.push(labelComponent);
            }
            var divComponent = $A.newCmp({
                    componentDef: {descriptor: 'markup://aura:html'},
                    attributes: {values: {
                        body: innerBody,
                        tag: 'div',
                        "class": "form-element"
                    }}}
            );

            var body = [];
            body.push(divComponent);
            component.set("v.body", body);
        }
    },

    resetLabelPosition : function (component) {
        var labelPositionAttribute = this.checkValidPosition(component.get("v.labelPosition"));
        if (labelPositionAttribute == 'hidden') {
            var labelComponent = component.find("inputLabel");
            if (!$A.util.isUndefinedOrNull(labelComponent)) {
                labelComponent.set("v.labelDisplay", labelPositionAttribute != "hidden");
            }
            return;
        }

        var body = component.get("v.body");
        if ($A.util.isArray(body) && body[0].isInstanceOf("aura:html")) {
            var htmlBody = body[0].get("v.body");

            //remove label
            var label;
            if ($A.util.isArray(htmlBody)) {
                for (var i=0; i<htmlBody.length; i++) {
                    if (htmlBody[i].isInstanceOf("ui:label")) {
                        label = htmlBody[i];
                        htmlBody.splice(i,1);
                    }
                }
            }

            if (label) {
                label.set("v.labelDisplay", labelPositionAttribute != "hidden");
                if (labelPositionAttribute == 'left' || labelPositionAttribute == 'top') {
                    htmlBody.unshift(label);
                } else if (labelPositionAttribute == 'right' || labelPositionAttribute == 'bottom') {
                    htmlBody.push(label);
                }
                body[0].set("v.body", htmlBody);
            }
        }
    },

    /**
     * Helper method that will check to make sure that we are looking at a valid position.
     * Otherwise it defaults to left
     */
    checkValidPosition : function(passedInPosition){
        var positionMap={"top":1,"right":1,"bottom":1,"left":1,"hidden":1};
        return positionMap[passedInPosition] ? passedInPosition : "left";
    },

    /**
     * @Override
     */
    addDomHandler : function(component, event) {
        var el = this.getInputElement(component);
        $A.util.on(el, event, this.lib.interactive.domEventHandler);
    },

    /**
     * Adds an event handler for input specific DOM event for which this input has a Aura-equivalent handler
     */
    addInputDomEvents : function(component) {
        var events = ["input", "change", "paste", "copy", "cut"];

        for (var i=0, len=events.length; i < len; i++) {
            if (component.hasEventHandler(events[i])) {
                this.addDomHandler(component, events[i]);
            }
        }

        var updateOn = this.getUpdateOn(component);
        if (updateOn) {
            var handledEvents = this.lib.interactive.getHandledDOMEvents(component);
            for (var j=0, lenj=updateOn.length; j < lenj; j++) {
                if (handledEvents[updateOn[j]] !== true) {
                    this.addDomHandler(component, updateOn[j]);
                }
            }

        }
    },

    /**
     * Returns the array of lower-case event names on which this input should update its bound value object
     */
    getUpdateOn : function(component) {
        var ret = [];
        var updateOn = component.get("v.updateOn");

        if(!updateOn) {
            return ret;
        }

        updateOn = updateOn.toLowerCase().split(/[\W,]+/); // split on whitespace or commas

        var domEvents = this.lib.interactive.getDomEvents(component);
        for(var i=0, len=domEvents.length; i < len; i++){
            for (var j=0, lenj=updateOn.length; j < lenj; j++) {
                if(domEvents[i].toLowerCase()===updateOn[j]){
                    ret.push(updateOn[j]);
                }
            }
        }

        // fall back on the default updateOn value if an invalid one is supplied
        return (ret.length > 0) ? ret : component.getDef().getAttributeDefs().getDef("updateOn").getDefault();
    },

    /**
     * Obtains the current value from the DOM element.  May be overridden by extensions.
     */
    getDomElementValue : function (element) {
        return element.value;
    },

    getHandledDOMEvents : function(component) {
        return this.lib.interactive.getHandledDOMEvents(component);
    },

    /**
     * Update this component's bound value object.
     *
     * This hook allows extensions of ui:input to augment or override update behaviour
     */
    doUpdate : function(component, value) {
        component.set("v.value", value);
    },

    /**
     * Pre-process the event before we fire it.
     */
    preEventFiring : function(component, event) {
        this.handleUpdate(component, event);
    },

    /**
     * Fire the equivalent Aura event for DOM one.
     * This can be overridden by extended component
     *
     * @param event must be a DOM event
     */
     fireEvent : function (component, event, helper) {
         this.lib.interactive.fireEvent(component, event, helper);
     },

    /**
     * handle the value update.
     */
    handleUpdate : function(component, event) {
        var helper = component.getDef().getHelper();
        var updateOn = helper.getUpdateOn(component);

        // if this is an event we're supposed to update on, call this component's update implementation
        if (updateOn.indexOf(event.type) > -1) {
            helper.doUpdate(component, helper.getDomElementValue(this.getInputElement(component)));
        }
    },

    /**
     * Set event's parameters with the value from DOM event.
     * The event's parameter name should be the same as the property name in DOM event.
     */
    setEventParams : function(e, DOMEvent) {
        this.lib.interactive.setEventParams(e, DOMEvent);
    },


    /**
     * Returns the input dom element in the component. If there are multiple input elements, only the first one is return.
     */
    getInputElement : function(component) {
        var element;

        if (this.hasLabel(component)) {
            var el = component.getElement();
            element = el.getElementsByTagName('input')[0] ||  el.getElementsByTagName('select')[0] ||  el.getElementsByTagName('textarea')[0] || el;
        } else {
            element = component.getElement();
        }

        return element;
    },

    /**
     * Show or update the error messages.
     */
    updateError : function(component, errors) {

        var errorCmp = component.get("v.errorComponent")[0];

        if (errorCmp) {
            // Update error component.
            errorCmp.set("v.errors", errors);
            var concreteHelper = component.getConcreteComponent().getDef().getHelper();
            concreteHelper.updateAriaDescribedBy(component, errorCmp.getGlobalId());
        } else {
            // Do nothing if no error component AND no error.
            if ($A.util.isEmpty(errors)) {
                return;
            }

            // Create error component.
            $A.componentService.newComponentAsync(
                this,
                function(errorCmp) {
                    component.set("v.errorComponent", errorCmp);
                    var concreteHelper = component.getConcreteComponent().getDef().getHelper();
                    concreteHelper.updateAriaDescribedBy(component, errorCmp.getGlobalId());
                },
                {
                    "componentDef": "markup://ui:inputDefaultError",
                    "attributes": {
                        "values": {
                            "errors" : errors
                        }
                    }
                }
            );
        }
    },

    updateAriaDescribedBy : function(component, errorCmpId) {
        var ariaDesc = component.get("v.ariaDescribedBy");
        var errors = component.get("v.errors");
        if (!$A.util.isEmpty(errors)) {
            ariaDesc = this.addTokenToString(ariaDesc, errorCmpId);
        } else {
            ariaDesc = this.removeTokenFromString(ariaDesc, errorCmpId);
        }
        component.set("v.ariaDescribedBy", ariaDesc);
    },

    updateErrorElement : function(component) {
        var errors = component.get("v.errors");
        var hasError = !$A.util.isEmpty(errors);

        if (this.hasLabel(component)) {
            $A.util.toggleClass(component.getElement(), "has-error", hasError);
        } else {
            $A.util.toggleClass(component, "has-error", hasError);
        }
    },

    addClass: function(component, className) {
        $A.util.addClass(component, className);
    },

    removeClass: function(component, className) {
        $A.util.removeClass(component, className);
    },

    /**
     * Returns true if the browser supports HTML5 inputs of specified type, false otherwise
     *
     * Caches results to avoid recomputation.
     */
    isHTML5Input : function(type) {
        // create the cache
        if ($A.util.isUndefined(this.isHTML5Input.cache)) {
            this.isHTML5Input.cache = {};
        }

        // check the cache
        var cached = this.isHTML5Input.cache[type];
        if (!$A.util.isUndefined(cached)) {
            return cached;
        }

        // fill the cache by checking if an new input of "type" comes out with that type
        var test = document.createElement("input");
        test.setAttribute("type", type);
        return (this.isHTML5Input.cache[type] = (test.type === type));
    },

    isEventSupported: function(eventName) {
        // create the cache
        if ($A.util.isUndefined(this.isEventSupported.cache)) {
            this.isEventSupported.cache = {};
        }

        // check the cache
        var cached = this.isEventSupported.cache[eventName];
        if (!$A.util.isUndefined(cached)) {
            return cached;
        }

        var el = document.createElement('input');
        var _eventName = 'on' + eventName;
        var isSupported = (_eventName in el);
        if (!isSupported) {
            el.setAttribute(_eventName, 'return;');
            isSupported = typeof el[_eventName] == 'function';
        }
        $A.util.removeElement(el);
        return (this.isEventSupported.cache[eventName] = isSupported);
    },

    setAttribute: function(cmp, attr) {
        cmp.set("v."+attr.key,attr.value,attr.commit);
    },

    addTokenToString: function(str, token) {
        token = $A.util.trim(token);
        str = $A.util.trim(str);
        if (str > '') {
            if ((' ' + str + ' ').indexOf(' ' + token + ' ') === -1) {
                str += ' ' + token;
            }
        } else {
            str = token;
        }
        return str;
    },

    removeTokenFromString: function(str, token) {
        token = $A.util.trim(token);
        str = $A.util.trim(str);
        if (str > '') {
            var start = (' ' + str + ' ').indexOf(' ' + token + ' ');
            if (start > -1) {
                str = str.substr(0, start) + str.substr(start + token.length + 1);
            }
        }
        return str;
    },

    hasLabel: function(cmp) {
        var label = cmp.get('v.label');
        return !!(label && label.length > 0);
    },

    setDisabled: function(component, disabled, disabledCss) {
        this.lib.interactive.setEventParams(component, disabled, disabledCss);
    },

    getDomEvents : function(component) {
        return this.lib.interactive.getDomEvents(component);
    },

    domEventHandler : function (event) {
        this.lib.interactive.domEventHandler(event);
    }
})// eslint-disable-line semi
