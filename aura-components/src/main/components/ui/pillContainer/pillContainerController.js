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

    init : function(cmp, event, helper) {
        var pillInput = cmp.get("v.pillInput");
        if (!$A.util.isEmpty(pillInput)) {
            pillInput[0].addHandler("onItemSelected", cmp, "c.onItemSelected");
            pillInput[0].addHandler("onBackspacePressedWhenEmpty", cmp, "c.onBackspacePressedWhenEmpty");
        }
    },

    onItemSelected: function(cmp, event, helper) {
        var newItem = event.getParam('value');
        if (newItem) {
            helper.handleItemSelected(cmp, [newItem]);
        }
    },

    onBackspacePressedWhenEmpty: function(cmp, event, helper) {
        var pillItemData = cmp.get("v.items");

        if (pillItemData.length > 0) { // If there is any pill data present
            helper.focusItem(cmp, pillItemData, 0); // Focus on the last pill
        }
    },

    handlePillEvent : function(cmp, event, helper) {
        helper.handlePillEvent(cmp, event);
    },

    focusOnInputBox: function(cmp, event, helper) {
        helper.focusOnInputBox(cmp);
    },

    insertItems: function (cmp, event, helper) {
        var newItems = event.getParam('arguments').items;
        if (newItems) {
            helper.insertItems(cmp, newItems);
        }
    },

    onItemsChanged: function(cmp, event, helper) {
        helper.updateDisplayedItems(cmp);
    },

    onShowMore: function(cmp, event, helper) {
        helper.showMore(cmp);
    },

    onClickBackground: function(cmp, event, helper) {
        if (event.target === cmp.find("list").getElement()) {
            event.stopImmediatePropagation();
            event.preventDefault();
            helper.focusOnInputBox(cmp);
        }
    },

    onInputFocus: function(cmp, event, helper) {
        $A.util.addClass(cmp.getElement(), 'focused');
        var element = cmp.find("list").getElement();
        element.scrollTop = element.scrollHeight;
    },

    onInputBlur: function(cmp, event, helper) {
        $A.util.removeClass(cmp.getElement(), 'focused');
        cmp.find("list").getElement().scrollTop = 0;
    },

    pillIterationComplete: function(cmp, event, helper) {
        setTimeout($A.getCallback(function(){
            if (cmp.isValid()) {
                helper.adjustHeight(cmp);
            }
        }),0);
    },

    focus: function(cmp, event, helper) {
        helper.focusOnInputBox(cmp);
    }


})// eslint-disable-line semi