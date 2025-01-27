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
    afterRender: function (cmp, helper) {
        this.superAfterRender();
        var dom = cmp.getElement();
        var scrollables = dom.querySelectorAll('.scrollable');
        
        for (var i = 0; i < scrollables.length; i++) {
            helper.lib.panelLibCore.scopeScroll(scrollables[i]);
        }

    },
    rerender: function (cmp, helper) {

        /*
        This is to prevent losing the "state"
        classes when the component is re-rendered, because 
        the component uses class="{!v.class}" to set the class,
        but the helper adds and removes classes from the DOM,

        I've created W-2679769 to return to this and clean it up,
        for now this will fix the problem where teams that set 
        values in the panel after creation cause it to lose
        the "open" class

         */
    	var currentEl =cmp.getElement();
    	var classes = currentEl.className.split(' ');
    	this.superRerender();
        if(classes) {
            classes.forEach(function(cl) {
                currentEl.classList.add(cl);
            });
        }

    }
})// eslint-disable-line semi