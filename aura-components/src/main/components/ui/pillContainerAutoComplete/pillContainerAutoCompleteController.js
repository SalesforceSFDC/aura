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
    init : function(component, event, helper) {
        component.addHandler("inputChange", component, "c.handleInputChange");
        component.addHandler("selectListOption", component, "c.onSelect");
        helper.initFetchParameters();
    },

    handleInputChange: function(component, event, helper) {
        helper.handleParameterChange(component, [{name:"keyword", value:event.getParam("value")}]);
    },

    onSelect: function (component, event, helper) {
        var optionCmp = event.getParam("option");

        var onItemSelected = component.getEvent("onItemSelected");
        var optionValue = optionCmp.get('v.value');

        var superComponent = component.getSuper();
        var inputElement = superComponent.find('input');
        if (inputElement) {
            inputElement.set('v.value', '');
        }
        onItemSelected.setParams({ value : optionValue }).fire();

        var list = superComponent.find("list");
        if (list) {
            list.set("v.visible", false);
        }

// JBUCH: THERE IS NO v.selectListOption, IT'S AN EVENT! AND WE'RE ALREADY HANDLING THAT EVENT IN THIS METHOD, SEE LINE 19
//        var onSelect = superComponent.get('v.selectListOption');
//        if (onSelect) {
//            $A.enqueueAction(onSelect);
//        }
    },

    focus: function(component, event, helper) {
        var inputElement = helper.getInputElement(component);
        if (inputElement) {
            inputElement.focus();
        }
    },

    updateParameters: function (component, event, helper) {
        var parameters = event.getParam('arguments').parameters;
        if (parameters) {
            helper.handleParameterChange(component, parameters);
        }
    }

})// eslint-disable-line semi