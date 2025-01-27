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
    init: function(cmp) {
    	var closeAction = cmp.get("v.closeAction");
        //handler for tab key to trap the focus within the modal
        cmp._windowKeyHandler = this.lib.panelLibCore.getKeyEventListener(cmp, {closeOnEsc: true, trapFocus: true}, closeAction);
        this.initCloseBtn(cmp);
    },
    
    initCloseBtn: function(cmp) {
        if (cmp.get('v.showCloseButton')) {
        	var closeBtn = cmp.get('v.closeButton');
        	if ($A.util.isEmpty(closeBtn)) {
	        	//create default close button
	            $A.componentService.createComponent('ui:button', {
	                'body': $A.newCmp({componentDef: 'aura:unescapedHtml', attributes: {values: {value: '&times;'}}}),
	                'class': "closeBtn",
	                'press': cmp.getReference("c.onCloseBtnPressed"),
	                'label': cmp.get('v.closeDialogLabel'),
	                'labelDisplay': "false"
	            }, function(button){
	                cmp.set('v.closeButton', button);
	            });
        	} else if ($A.util.isComponent(closeBtn[0]) && closeBtn[0].isInstanceOf('ui:button') && !closeBtn[0].getHandledEvents()['press']) {
        		closeBtn[0].addHandler('press', cmp, 'c.onCloseBtnPressed');
        	}
        }
    },

    _getKeyHandler: function(cmp) {
        if (!cmp._keyHandler && cmp.isValid()) {
        	var closeAction = cmp.get("v.closeAction");
            cmp._keyHandler = this.lib.panelLibCore.getKeyEventListener(cmp, {closeOnEsc: true, trapFocus: true}, closeAction);
        }
        return cmp._keyHandler;
    },

    validateAnimationName: function(name) {
        return name.match(/top|left|right|bottom|center|pop/) ? true : false;
    },

    show: function(cmp, callback) {
        var self = this,
            containerEl = cmp.getElement(),
            autoFocus = $A.util.getBooleanValue(cmp.get('v.autoFocus')),
            useTransition = $A.util.getBooleanValue(cmp.get('v.useTransition')),
            panel = this._findContainedComponent(cmp, 'panel').getElement();

        if(useTransition) {
            useTransition = this.validateAnimationName(cmp.get('v.animation'));
        }
        this.mask(cmp);
        if(useTransition) {
            panel.style.opacity = 0;
            containerEl.style.display = 'block';
        }

        var config = {
            useTransition: useTransition,
            animationName: 'movefrom' + cmp.get('v.animation'),
            animationEl: panel,
            autoFocus: autoFocus,
            onFinish: function() {
            	var handler = self._getKeyHandler(cmp);
            	if ($A.util.isFunction(handler)) {
            		$A.util.on(containerEl, 'keydown', self._getKeyHandler(cmp));
            	}
                callback && callback();
            }
        };

        var self = this;
        if(useTransition) {
            setTimeout(function() {
                panel.style.opacity = 1;
                self.lib.panelLibCore.show(cmp, config);
            }, 50);
        } else {
            self.lib.panelLibCore.show(cmp, config);
        }
    },

    _findContainedComponent: function(cmp, id) {
        var p = cmp;
        var container = cmp.find(id);
        while (!container && p.isInstanceOf("ui:modal")) {
            p = p.getSuper();
            container = p.find(id);
        }
        return container;
    },

    close: function (cmp, callback) {
        cmp.hide(function () {
            if (cmp.isValid()) {
                cmp.getEvent('notify').setParams({
                    action: 'destroyPanel',
                    typeOf: 'ui:destroyPanel',
                    payload: {panelInstance: cmp.getGlobalId()}
                }).fire();
            }
            if ($A.util.isFunction(callback)) {
            	callback();
            }
        });
    },

    hide: function (cmp, callback) {
        var self = this,
            containerEl = cmp.getElement(),
            animationName = cmp.get('v.animation'),
            useTransition = $A.util.getBooleanValue(cmp.get('v.useTransition')),
            closeAnimation = cmp.get('v.closeAnimation'),
            panel = this._findContainedComponent(cmp, 'panel').getElement();
        
        this.unmask(cmp, useTransition, panel);

        if(closeAnimation) {
            animationName = closeAnimation;
        }

        var timeout;
        var onFinish = function() {
            clearTimeout(timeout);

            if ($A.util.isComponent(cmp) && cmp.isValid()) {

                var handler = self._getKeyHandler(cmp);
                if ($A.util.isFunction(handler)) {
                    $A.util.removeOn(containerEl, 'keydown', handler);
                }
            }
            
            if(callback) { //give time for all transitions to complete
                setTimeout(callback, 2);
            }
        };


        var config = {
            useTransition: useTransition,
            animationName: 'moveto' + animationName,
            animationEl: panel,
            onFinish: onFinish
        };

        // This makes sure cleanup happens in case onTransitionEnd
        // does not fire.
        timeout = setTimeout(onFinish, 600);

        if(closeAnimation) {
            config.animationName = 'moveto' + closeAnimation;
        }

        this.lib.panelLibCore.hide(cmp, config);
    },

    mask: function(cmp) {
        var useTransition = $A.util.getBooleanValue(cmp.get('v.useTransition'));
        var mask = this._findContainedComponent(cmp, 'modal-glass').getElement();
        
        if ($A.util.isUndefinedOrNull(this.global._originalOverflowStyle)) {
        	var overflowStyle = window.getComputedStyle(document.body, '').overflow;
        	this.global._originalOverflowStyle = overflowStyle;
            // prevent scrolling of the body when modals are open
            document.body.style.overflow = 'hidden';
        }
        
        $A.util.removeClass(mask, 'hidden');
        $A.util.addClass(mask, 'fadein');
        if(useTransition) {
            setTimeout(function() {
                mask.style.opacity = 0.8;
            },10);
        } else {
            mask.style.opacity = 1;
        }
    },
    
    unmask: function(cmp, useTransition, panel) {
    	var mask = this._findContainedComponent(cmp, 'modal-glass').getElement();
    	
        if(useTransition) {
            panel.style.opacity = '0';
            setTimeout(function() {
                 mask.style.opacity = '0';
            }, 50);
        }
        
        this.unsetOverflow(cmp);
    },
    
    unsetOverflow: function(cmp) {
    	 // remove overflow changes only when it's the last modal that's opened
        var openedMasks = document.querySelectorAll('.uiModal .modal-glass.fadein');
        if(openedMasks.length === 1 && !$A.util.isUndefinedOrNull(this.global._originalOverflowStyle)) {
            document.body.style.overflow = this.global._originalOverflowStyle;
            delete this.global._originalOverflowStyle;
        }
    },
    
    global: {}
})// eslint-disable-line semi