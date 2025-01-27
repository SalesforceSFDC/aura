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
package org.auraframework.impl.adapter;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.instance.AuraValueProviderType;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.ValueProviderType;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.InvalidExpressionException;
import org.auraframework.throwable.quickfix.QuickFixException;


/**
 * $Global - context global value provider, backed by data on the context
 */
public class ContextValueProvider implements GlobalValueProvider {

    public ContextValueProvider() {
    }

    @Override
    public Object getValue(PropertyReference key) throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        return context.getGlobal(key.getRoot());
    }

    @Override
    public ValueProviderType getValueProviderKey() {
        return AuraValueProviderType.GLOBAL;
    }

    @Override
    public DefDescriptor<TypeDef> getReturnTypeDef() {
        return null;
    }

    @Override
    public void validate(PropertyReference expr) throws InvalidExpressionException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        if (context == null) {
            return;
        }

        if (expr.size() != 1 || !context.validateGlobal(expr.getRoot())) {
            throw new InvalidExpressionException("No property on $Global for key: " + expr, expr.getLocation());
        }
    }

    @Override
    public boolean isEmpty() {
        return false;
    }

    @Override
    public boolean refSupport() {
        // $Global may have serialization references.
        return true;
    }

    @Override
    public Map<String, ?> getData() {
        AuraContext context = Aura.getContextService().getCurrentContext();

        if (context == null) {
            Aura.getContextService().getAllowedGlobals();
        }

        return context.getGlobals();
    }

}
