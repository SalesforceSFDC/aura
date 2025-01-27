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
package org.auraframework.impl.clientlibrary;

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverTestCase.CheckAccessibility;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import com.ibm.icu.util.Calendar;

@CheckAccessibility(false)
public class ClientLibraryTagUITest extends WebDriverTestCase {
    public ClientLibraryTagUITest(String name) {
        super(name);
    }

    /**
     * Verify that Javascript and Style resources marked as combinable are available at the client.
     * clientLibraryTest:clientLibraryTest Moment, Walltime, js://clientLibraryTest.clientLibraryTest are marked as
     * combinable JS resources. css://clientLibraryTest.clientLibraryTest is marked as combinable CSS resource
     * 
     * @throws Exception
     */
    public void testCombinableResources() throws Exception {
        open("/clientLibraryTest/clientLibraryTest.app");
        waitForAuraFrameworkReady();
        Object minuteThruMoment = auraUITestingUtil.getEval("return moment(new Date()).minutes()");
        assertNotNull(minuteThruMoment);
        assertEquals(Calendar.getInstance().get(Calendar.MINUTE), ((Long) minuteThruMoment).intValue());

        Boolean walltime = (Boolean)auraUITestingUtil.getEval("return !!WallTime");
        assertTrue(walltime);

        assertEquals("awesome", auraUITestingUtil.getEval("return clientLibraryTest.cool;"));

        WebElement div = findDomElement(By.cssSelector("div[class~='identifier']"));
        String divCss = div.getCssValue("background-color");
        assertEquals("CSS not loaded from combinable resource", "rgba(255, 0, 0, 1)", divCss);

    }

    /**
     * Verify that Javascript and Style resources marked as uncombinable are available at the client. WalltimeLocale is
     * an uncombinable JS resource.
     * 
     * @throws Exception
     */
    public void testNonCombinableResources() throws Exception {
        open("/clientLibraryTest/clientLibraryTest.app");
        waitForAuraFrameworkReady();
        Boolean walltimeLocale = (Boolean)auraUITestingUtil.getEval("return !!WallTime");
        assertTrue(walltimeLocale);
    }

    /**
     * Verify that resource change depending on Mode. Mixture of combinable and uncombinable resources
     */
    public void testModeDependentResources() throws Exception {
        open("/clientLibraryTest/clientLibraryTest.app", Mode.PTEST);

        // Mode independent resources
        Object minuteThruMoment = auraUITestingUtil.getEval("return moment(new Date()).minutes()");
        assertNotNull(minuteThruMoment);
        assertEquals( Calendar.getInstance().get(Calendar.MINUTE), ((Long) minuteThruMoment).intValue());

        Boolean walltime = (Boolean)auraUITestingUtil.getEval("return !!WallTime");
        assertTrue(walltime);

        assertEquals("awesome", auraUITestingUtil.getEval("return clientLibraryTest.cool;"));
    }
}
