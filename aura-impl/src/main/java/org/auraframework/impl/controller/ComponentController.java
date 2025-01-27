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
package org.auraframework.impl.controller;

import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.java.controller.JavaAction;
import org.auraframework.impl.javascript.controller.JavascriptPseudoAction;
import org.auraframework.instance.Action;
import org.auraframework.instance.Application;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

@Controller
public class ComponentController {

    /**
     * A Java exception representing a <em>Javascript</em> error condition, as
     * reported from client to server for forensic logging.
     *
     * @since 194
     */
    public static class AuraClientException extends Exception {
        private static final long serialVersionUID = -5884312216684971013L;

        private final Action action;
        private final String jsStack;

        public AuraClientException(String desc, String id, String message, String jsStack) {
            super(message);
            Action action = null;
            if (desc != null && id != null) {
                try {
                    action = Aura.getInstanceService().getInstance(desc, ActionDef.class);
                } catch (QuickFixException e) {
                    // Uh... okay, we fell over running an action we now can't even define.
                }
                if (action instanceof JavascriptPseudoAction) {
                    JavascriptPseudoAction jpa = (JavascriptPseudoAction)action;
                    jpa.setId(id);
                    jpa.addError(this);
                } else if (action instanceof JavaAction) {
                    JavaAction ja = (JavaAction)action;
                    ja.setId(id);
                    ja.addException(this, Action.State.ERROR, false, false);
                }
            }

            this.action = action;
            this.jsStack = jsStack;
        }

        public Action getOriginalAction() {
            return action;
        }

        public String getClientStack() {
            return jsStack;
        }

    }

    @AuraEnabled
    public static Boolean loadLabels() throws QuickFixException {
        AuraContext ctx = Aura.getContextService().getCurrentContext();
        Map<DefDescriptor<? extends Definition>, Definition> defMap;

        ctx.getDefRegistry().getDef(ctx.getApplicationDescriptor());
        defMap = ctx.getDefRegistry().filterRegistry(null);
        for (Map.Entry<DefDescriptor<? extends Definition>, Definition> entry : defMap.entrySet()) {
            Definition def = entry.getValue();
            if (def != null) {
                def.retrieveLabels();
            }
        }
        return Boolean.TRUE;
    }

    private static <D extends BaseComponentDef, T extends BaseComponent<D, T>>
        T getBaseComponent(Class<T> type, Class<D> defType, String name,
                Map<String, Object> attributes, Boolean loadLabels) throws QuickFixException {

        DefinitionService definitionService = Aura.getDefinitionService();
        DefDescriptor<D> desc = definitionService.getDefDescriptor(name, defType);
        definitionService.updateLoaded(desc);
        T component =  Aura.getInstanceService().getInstance(desc, attributes);
        if (Boolean.TRUE.equals(loadLabels)) {
            ComponentController.loadLabels();
        }
        return component;
    }

    // Not aura enabled, but called from code. This is probably bad practice.
    public static Component getComponent(String name, Map<String, Object> attributes) throws QuickFixException {
        return  getBaseComponent(Component.class, ComponentDef.class, name, attributes, false);
    }

    @AuraEnabled
    public static Component getComponent(@Key(value = "name", loggable = true) String name,
            @Key("attributes") Map<String, Object> attributes,
            @Key(value = "chainLoadLabels", loggable = true) Boolean loadLabels) throws QuickFixException {
        return  getBaseComponent(Component.class, ComponentDef.class, name, attributes, loadLabels);
    }

    @AuraEnabled
    public static Application getApplication(@Key(value = "name", loggable = true) String name,
            @Key("attributes") Map<String, Object> attributes,
            @Key(value = "chainLoadLabels", loggable = true) Boolean loadLabels) throws QuickFixException {
        return getBaseComponent(Application.class, ApplicationDef.class, name, attributes, loadLabels);
    }

    /**
     * Called when the client-side code encounters a failed client-side action, to allow server-side
     * record of the code error.
     *
     * @param desc The name of the client action failing
     * @param id The id of the client action failing
     * @param error The javascript error message of the failure
     * @param stack Not always available (it's browser dependent), but if present, a browser-dependent
     *      string describing the Javascript stack for the error.  Some frames may be obfuscated,
     *      anonymous, omitted after inlining, etc., but it may help diagnosis.
     */
    @AuraEnabled
    public static void reportFailedAction(@Key(value = "failedAction") String desc, @Key("failedId") String id,
            @Key("clientError") String error, @Key("clientStack") String stack) {
        // Error reporting (of errors in prior client-side actions) are handled specially
        AuraClientException ace = new AuraClientException(desc, id, error, stack);
        Aura.getExceptionAdapter().handleException(ace, ace.getOriginalAction());
    }

    @AuraEnabled
    public static ComponentDef getComponentDef(@Key(value = "name", loggable = true) String name) throws QuickFixException {
        DefDescriptor<ComponentDef> desc = Aura.getDefinitionService().getDefDescriptor(name, ComponentDef.class);
        return Aura.getDefinitionService().getDefinition(desc);
    }

    @AuraEnabled
    public static ApplicationDef getApplicationDef(@Key(value = "name", loggable = true) String name) throws QuickFixException {
        DefDescriptor<ApplicationDef> desc = Aura.getDefinitionService().getDefDescriptor(name, ApplicationDef.class);
        return Aura.getDefinitionService().getDefinition(desc);
    }

    @AuraEnabled
    public static List<Component> getComponents(@Key("components") List<Map<String, Object>> components)
            throws QuickFixException {
        List<Component> ret = Lists.newArrayList();
        for (int i = 0; i < components.size(); i++) {
            Map<String, Object> cmp = components.get(i);
            String descriptor = (String)cmp.get("descriptor");
            @SuppressWarnings("unchecked")
            Map<String, Object> attributes = (Map<String, Object>) cmp.get("attributes");
            ret.add(getBaseComponent(Component.class, ComponentDef.class, descriptor, attributes, Boolean.FALSE));
        }
        return ret;
    }
}
