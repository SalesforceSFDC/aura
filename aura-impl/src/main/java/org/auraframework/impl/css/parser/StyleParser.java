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

import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.css.parser.CssPreprocessor.ParserConfiguration;
import org.auraframework.impl.css.parser.CssPreprocessor.ParserResult;
import org.auraframework.impl.css.style.StyleDefImpl;
import org.auraframework.impl.css.util.Styles;
import org.auraframework.system.Client;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;

/**
 * Basic CSS style parser.
 */
public final class StyleParser implements Parser<StyleDef> {
    public static final Set<String> ALLOWED_CONDITIONS;

    private final boolean validate;

    // build list of conditional permutations and allowed conditionals
    static {
        ImmutableSet.Builder<String> acBuilder = ImmutableSet.builder();
        for (Client.Type type : Client.Type.values()) {
            acBuilder.add(type.toString());
        }
        ALLOWED_CONDITIONS = acBuilder.build();
    }

    public StyleParser(boolean validate) {
        this.validate = validate;
    }

    @Override
    public StyleDef parse(DefDescriptor<StyleDef> descriptor, Source<StyleDef> source) throws QuickFixException {
        ParserConfiguration parserConfig = CssPreprocessor
                .initial()
                .source(source.getContents())
                .resourceName(source.getSystemId())
                .allowedConditions(Iterables.concat(ALLOWED_CONDITIONS, Aura.getStyleAdapter().getExtraAllowedConditions()));

        String className = Styles.buildClassName(descriptor);

        StyleDefImpl.Builder builder = new StyleDefImpl.Builder();
        builder.setDescriptor(descriptor);
        builder.setLocation(source.getSystemId(), source.getLastModified());
        builder.setClassName(className);
        builder.setOwnHash(source.getHash());
        boolean shouldValidate = validate
            && !descriptor.getName().toLowerCase().endsWith("template")
            && Aura.getConfigAdapter().validateCss();

        ParserResult result = parserConfig
                .componentClass(className, shouldValidate)
                .tokens(descriptor)
                .parse();

        builder.setContent(result.content());
        builder.setTokenExpressions(result.expressions());
        return builder.build();
    }
}
