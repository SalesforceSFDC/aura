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
package org.auraframework.integration.test.def;

import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.impl.root.component.BaseComponentDefTest;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Sets;

public class ApplicationDefTest extends BaseComponentDefTest<ApplicationDef> {

    public ApplicationDefTest(String name) {
        super(name, ApplicationDef.class, "aura:application");
    }

    /**
     * App will inherit useAppcache='false' from aura:application if attribute not specified
     */
    public void testIsAppCacheEnabledInherited() throws Exception {
        DefDescriptor<ApplicationDef> parentDesc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, "useAppcache='true' extensible='true'", ""));
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, String.format("extends='%s'", parentDesc.getQualifiedName()), ""));
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.TRUE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value overrides value from aura:application
     */
    public void testIsAppCacheEnabledOverridesDefault() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, "useAppcache='true'", ""));
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.TRUE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value overrides value from parent app
     */
    public void testIsAppCacheEnabledOverridesExtends() throws Exception {
        DefDescriptor<ApplicationDef> parentDesc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, "useAppcache='true' extensible='true'", ""));
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class, String.format(baseTag,
                String.format("extends='%s' useAppcache='false'", parentDesc.getQualifiedName()), ""));
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value is empty
     */
    public void testIsAppCacheEnabledUseAppcacheEmpty() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application useAppCache=''/>");
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, appdef.isAppcacheEnabled());
    }

    /**
     * App's useAppcache attribute value is invalid
     */
    public void testIsAppCacheEnabledUseAppcacheInvalid() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                "<aura:application useAppCache='yes'/>");
        ApplicationDef appdef = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, appdef.isAppcacheEnabled());
    }

    /**
     * W-788745
     *
     * @throws Exception
     */
    public void testNonExistantNameSpace() throws Exception {
        try {
            Aura.getDefinitionService().getDefinition("auratest:test_Preload_ScrapNamespace", ApplicationDef.class);
            fail("Expected Exception");
        } catch (InvalidDefinitionException e) {
            assertEquals("Invalid dependency *://somecrap:*[COMPONENT]", e.getMessage());
        }
    }

    /**
     * Verify the isOnePageApp() API on ApplicationDef Applications who have the isOnePageApp attribute set, will have
     * the template cached.
     *
     * @throws Exception
     */
    public void testIsOnePageApp() throws Exception {
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class,
                String.format(baseTag, "isOnePageApp='true'", ""));
        ApplicationDef onePageApp = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.TRUE, onePageApp.isOnePageApp());

        desc = addSourceAutoCleanup(ApplicationDef.class, String.format(baseTag, "isOnePageApp='false'", ""));
        ApplicationDef nonOnePageApp = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, nonOnePageApp.isOnePageApp());

        // By default an application is not a onePageApp
        desc = addSourceAutoCleanup(ApplicationDef.class, String.format(baseTag, "", ""));
        ApplicationDef simpleApp = Aura.getDefinitionService().getDefinition(desc);
        assertEquals(Boolean.FALSE, simpleApp.isOnePageApp());
    }

    /** verify that we set tokens explicitly set on the tokens tag */
    public void testExplicitTokens() throws QuickFixException {
        DefDescriptor<TokensDef> tokens = addSourceAutoCleanup(TokensDef.class, "<aura:tokens></aura:tokens>");
        String src = String.format("<aura:application tokens=\"%s\"/>", tokens.getDescriptorName());
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class, src);
        assertEquals(1, desc.getDef().getTokenDescriptors().size());
        assertEquals(tokens, desc.getDef().getTokenDescriptors().get(0));
    }

    /** verify that we set the implicit namespace default app overrides */
    public void testImplicitTokenOverrides() throws QuickFixException {
        DefDescriptor<TokensDef> dummy = addSourceAutoCleanup(TokensDef.class, "<aura:tokens></aura:tokens>");

        DefDescriptor<TokensDef> nsTokens = DefDescriptorImpl.getInstance(
                String.format("%s:%sNamespace", dummy.getNamespace(), dummy.getNamespace()), TokensDef.class);
        addSourceAutoCleanup(nsTokens, "<aura:tokens></aura:tokens>");

        String src = "<aura:application/>";
        DefDescriptor<ApplicationDef> desc = DefDescriptorImpl.getInstance(
                String.format("%s:%s", dummy.getNamespace(), getAuraTestingUtil().getNonce(getName())),
                ApplicationDef.class);
        addSourceAutoCleanup(desc, src);
        assertEquals(1, desc.getDef().getTokenDescriptors().size());
        assertEquals(nsTokens, desc.getDef().getTokenDescriptors().get(0));
    }

    /** an empty value for the tokens attr means that you don't want any token overrides, even the implicit one */
    public void testTokensAttrIsEmptyString() throws QuickFixException {
        DefDescriptor<TokensDef> dummy = addSourceAutoCleanup(TokensDef.class, "<aura:tokens></aura:tokens>");

        DefDescriptor<TokensDef> nsTokens = DefDescriptorImpl.getInstance(
                String.format("%s:%sNamespace", dummy.getNamespace(), dummy.getNamespace()), TokensDef.class);
        addSourceAutoCleanup(nsTokens, "<aura:tokens></aura:tokens>");

        String src = "<aura:application tokens=''/>";
        DefDescriptor<ApplicationDef> desc = DefDescriptorImpl.getInstance(
                String.format("%s:%s", dummy.getNamespace(), getAuraTestingUtil().getNonce(getName())),
                ApplicationDef.class);
        addSourceAutoCleanup(desc, src);
        assertTrue(desc.getDef().getTokenDescriptors().isEmpty());
    }

    /** verify tokens descriptor is added to dependency set */
    public void testTokensAddedToDeps() throws QuickFixException {
        DefDescriptor<TokensDef> tokens = addSourceAutoCleanup(TokensDef.class, "<aura:tokens></aura:tokens>");
        String src = String.format("<aura:application tokens=\"%s\"/>", tokens.getDescriptorName());
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class, src);

        Set<DefDescriptor<?>> deps = Sets.newHashSet();
        desc.getDef().appendDependencies(deps);
        assertTrue(deps.contains(tokens));
    }

    /** verify tokens descriptor ref is validated */
    public void testInvalidTokensRef() throws QuickFixException {
        String src = String.format("<aura:application tokens=\"%s\"/>", "wall:maria");
        DefDescriptor<ApplicationDef> desc = addSourceAutoCleanup(ApplicationDef.class, src);

        try {
            desc.getDef().validateReferences();
            fail("expected to get an exception");
        } catch (Exception e) {
            checkExceptionContains(e, DefinitionNotFoundException.class, "No TOKENS");
        }
    }
}
