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
package org.auraframework.builder;

import org.auraframework.def.*;

/**
 */
public interface ApplicationDefBuilder extends BaseComponentDefBuilder<ApplicationDef> {

    /**
     * Specifies a {@link TokensDef} as an override across the whole application. Tokens specified in this def will
     * override default tokens values throughout all components used in the application.
     *
     */
    ApplicationDefBuilder appendTokensDescriptor(DefDescriptor<TokensDef> descriptor);

    /**
     * Specifies the {@link FlavorAssortmentDef} containing the flavors to use as defaults.
     */
    ApplicationDefBuilder setFlavorAssortmentDescriptor(DefDescriptor<FlavorAssortmentDef> flavors);
}
