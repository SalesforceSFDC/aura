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
package org.auraframework.impl.css.parser;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavoredStyleDef;
import org.auraframework.impl.css.flavor.FlavoredStyleDefImpl;
import org.auraframework.impl.css.parser.CssPreprocessor.ParserConfiguration;
import org.auraframework.impl.css.parser.CssPreprocessor.ParserResult;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Iterables;

/**
 * Flavored CSS style parser.
 */
public final class FlavoredStyleParser implements Parser<FlavoredStyleDef> {
    public FlavoredStyleParser() {
    }

    @Override
    public FlavoredStyleDef parse(DefDescriptor<FlavoredStyleDef> descriptor,
            Source<FlavoredStyleDef> source) throws QuickFixException {
        ParserConfiguration parserConfig = CssPreprocessor
                .initial()
                .source(source.getContents())
                .resourceName(source.getSystemId())
                .allowedConditions(Iterables.concat(StyleParser.ALLOWED_CONDITIONS,
                            Aura.getStyleAdapter().getExtraAllowedConditions()));

        FlavoredStyleDefImpl.Builder builder = new FlavoredStyleDefImpl.Builder();
        builder.setDescriptor(descriptor);
        builder.setLocation(source.getSystemId(), source.getLastModified());
        builder.setOwnHash(source.getHash());

        ParserResult result = parserConfig.tokens(descriptor).flavors(descriptor).parse();

        builder.setContent(result.content());
        builder.setTokenExpressions(result.expressions());
        builder.setFlavorAnnotations(result.flavorAnnotations());
        return builder.build();
    }
}
