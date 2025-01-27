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
        var ret = this.superAfterRender();
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        _helper.formatDateTime(component);
        _helper.toggleClearButton(component);

        var datePicker = concreteCmp.find("datePicker");
        if (!$A.util.isUndefinedOrNull(datePicker)) {
            datePicker.set("v.referenceElement", concreteCmp.find("inputDate").getElement());
        }
        var timePicker = concreteCmp.find("timePicker");
        if (!$A.util.isUndefinedOrNull(timePicker)) {
            timePicker.set("v.referenceElement", concreteCmp.find("inputTime").getElement());
        }
        return ret;
    },

    rerender: function(component, helper) {
    	var ret = this.superRerender();
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();

        if (component.isDirty("v.value")) {
            // on rerender, if an incorrect datetime is entered, do not change the display value so the user has a chance to fix the invalid input
            var currentDateString = _helper.getDateString(component);
            var currentTimeString = _helper.getTimeString(component);

            if (!_helper.isDesktopMode(component)
                || ($A.util.isEmpty(currentDateString) && $A.util.isEmpty(currentTimeString))
                || _helper.parseDateTimeInput(false, component, currentDateString, currentTimeString)) {

                _helper.formatDateTime(component);
            }
        }

        _helper.toggleClearButton(component);
        return ret;
    }
})// eslint-disable-line semi
