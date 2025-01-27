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
    afterRender: function(component, helper) {
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        _helper.displayValue(component);
        _helper.toggleClearButton(component);

        var datePicker = concreteCmp.find("datePicker");
        if (!$A.util.isUndefinedOrNull(datePicker)) {
            datePicker.set("v.referenceElement", concreteCmp.find("inputText").getElement());
        }
        _helper.toggleOpenIconVisibility(component);
        return this.superAfterRender();
	},

	rerender: function(component, helper) {
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        _helper.displayValue(component);
        _helper.toggleClearButton(component);
        _helper.toggleOpenIconVisibility(component);
        return this.superRerender();
    }
})// eslint-disable-line semi
