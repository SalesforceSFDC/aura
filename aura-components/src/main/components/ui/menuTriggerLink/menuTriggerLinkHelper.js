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
    focus: function(component) {
        var linkCmp = this.getAnchorElement(component);
        var elem = linkCmp ? linkCmp.getElement() : null;
        if (elem && elem.focus) {
            elem.focus();
        }
    },

    getAnchorElement: function(component) {
        //Walk up the component ancestor to find the contained component by localId
        var localId = "link",
            cmp =  component.getConcreteComponent();
        var retCmp = null;
        while (cmp) {
            retCmp = cmp.find(localId);
            if (retCmp) {
                break;
            }
            cmp = cmp.getSuper();
        }
        return retCmp;
    },

    handleClick: function (component) {
        var concreteCmp = component.getConcreteComponent();
        this.handleTriggerPress(concreteCmp);
        this.fireMenuTriggerPress(concreteCmp);
    },

    fireMenuTriggerPress: function(component, index) {
        component.get("e.menuTriggerPress").fire();
    }

})// eslint-disable-line semi