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
	clearValue: function(component, event, helper) {
		component.set("v.value", "");
	},

	click: function(component, event, helper) {
        event.preventDefault();
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        _helper.displayDatePicker(component);
    },

    doInit: function(component, event, helper) {
    	// only add the placeholder when there is no date picker opener.
        if ($A.get("$Browser.formFactor") == "DESKTOP" && !component.get("v.displayDatePicker")) {
            var concreteCmp = component.getConcreteComponent();
            var format = concreteCmp.get("v.format");
            if (!format) {
                format = $A.get("$Locale.dateFormat");
            }
            component.set("v.placeholder", format);
        }
    },

    openDatePicker: function(component, event, helper) {
        var concreteCmp = component.getConcreteComponent();
        var _helper = concreteCmp.getDef().getHelper();
        _helper.displayDatePicker(component);
    },

    inputDateFocus: function(component, event, helper) {
        var inputText = component.find("inputText").getElement().value;

        if ($A.util.isEmpty(inputText) && !component.get("v.disabled") && component.get("v.displayDatePicker")) {
            helper.displayDatePicker(component);
        }
    },

    setValue: function(component, event, helper) {
        var dateValue = event.getParam("value");
        if (dateValue) {
            component.set("v.value", dateValue);
        }
    }
})// eslint-disable-line semi