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
package org.auraframework.def;

import java.util.List;

import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */
public interface ApplicationDef extends BaseComponentDef {
    @Override
    DefDescriptor<ApplicationDef> getDescriptor();

    @Override
    DefDescriptor<ApplicationDef> getExtendsDescriptor();

    DefDescriptor<EventDef> getLocationChangeEventDescriptor() throws QuickFixException;

    Boolean isAppcacheEnabled() throws QuickFixException;

    List<String> getAdditionalAppCacheURLs() throws QuickFixException;

    Boolean isOnePageApp() throws QuickFixException;

    /**
     * Gets the application-wide token overrides, if present.
     */
    List<DefDescriptor<TokensDef>> getTokenDescriptors();

    /**
     * Gets the {@link FlavorAssortmentDef} representing the default flavor overrides and replacements.
     */
    DefDescriptor<FlavorAssortmentDef> getAppFlavors();
}
