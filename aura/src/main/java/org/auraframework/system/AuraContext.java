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
package org.auraframework.system;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.auraframework.css.StyleContext;
import org.auraframework.css.TokenOptimizer;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.TokensDef;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.instance.Action;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Event;
import org.auraframework.instance.GlobalValueProvider;
import org.auraframework.instance.InstanceStack;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonSerializable;
import org.auraframework.util.json.JsonSerializationContext;

import com.google.common.collect.ImmutableMap;

/**
 * AuraContext public interface
 */
public interface AuraContext {

    enum Mode {

        DEV(false, true, true, JavascriptGeneratorMode.DEVELOPMENT, true),
        STATS(true, false, true, JavascriptGeneratorMode.STATS, true),
        UTEST(true, false, true, JavascriptGeneratorMode.PRODUCTION, true),
        FTEST(true, false, true, JavascriptGeneratorMode.TESTING, true),
        JSTEST(true, false, false, JavascriptGeneratorMode.TESTING, false),
        AUTOJSTEST(true, false, false, JavascriptGeneratorMode.AUTOTESTING, false),
        JSTESTDEBUG(true, false, true, JavascriptGeneratorMode.TESTINGDEBUG, false),
        AUTOJSTESTDEBUG(true, false, true, JavascriptGeneratorMode.AUTOTESTINGDEBUG, false),
        PTEST(false, false, false, JavascriptGeneratorMode.PTEST, true),
        CADENCE(true, false, false, JavascriptGeneratorMode.PTEST, true),
        PRODDEBUG(false, false, true, JavascriptGeneratorMode.PRODUCTIONDEBUG, true),
        PROD(false, false, false, JavascriptGeneratorMode.PRODUCTION, true),
        SELENIUM(true, false, true, JavascriptGeneratorMode.AUTOTESTING, true),
        SELENIUMDEBUG(true, false, true, JavascriptGeneratorMode.AUTOTESTINGDEBUG, true);

        private final JavascriptGeneratorMode javascriptMode;
        private final boolean isTestMode;
        private final boolean isDevMode;
        private final boolean prettyPrint;
        private final boolean allowLocalRendering;

        Mode(boolean isTestMode, boolean isDevMode, boolean prettyPrint, JavascriptGeneratorMode jsMode,
                boolean allowLocalRendering) {
            this.isTestMode = isTestMode;
            this.isDevMode = isDevMode;
            this.javascriptMode = jsMode;
            this.prettyPrint = prettyPrint;
            this.allowLocalRendering = allowLocalRendering;
        }

        public boolean isTestMode() {
            return isTestMode;
        }

        public boolean isDevMode() {
            return isDevMode;
        }

        public boolean prettyPrint() {
            return prettyPrint;
        }

        public boolean allowLocalRendering() {
            return allowLocalRendering;
        }

        /**
         * @return Returns the jsMode.
         */
        public JavascriptGeneratorMode getJavascriptMode() {
            return javascriptMode;
        }
    }

    boolean isDebugToolEnabled = false;

    enum Format {
        MANIFEST, CSS, JS, JSON, HTML, SVG;
    }

    enum Authentication {
        UNAUTHENTICATED, AUTHENTICATED
    }

    enum Access {
        PUBLIC,
        GLOBAL,
        PRIVATE,
        INTERNAL
    }

    class GlobalValue implements JsonSerializable {
        private final boolean writable; // if not writable, the contextImpl must provide a mechanism to set
        private Object value;
        private Object defaultValue;
        private Object originalValue = null;

        public GlobalValue(boolean writable, Object defaultValue) {
            this.writable = writable;
            this.defaultValue = defaultValue;
        }
        
        public boolean isWritable() {
        	return this.writable;
        }
        
        public void setValue(Object value) {
        	// We only want to do it the first time. 
        	// It's expected that this is the value that is on the client.
        	// We'll serialize it down to the client so that when we do a merge
        	// we say, is the current value the original that we had on the server?
        	// If yes, then use this new value, otherwise the value was probably changed mid flight, don't reset.
        	if(this.originalValue == null && this.value != value) {
        		this.originalValue = this.value;
        	}
        	this.value = value;
        	
        }

        /**
         * Primarily used by tests.
         * @param defaultValue the value to specify for a global value if no value has been explicitly set.
         */
        public void setDefaultValue(Object defaultValue) {
        	this.defaultValue = defaultValue;
        }
        
        /**
         * We ALWAYS prioritize the clientValue.
         * Since thats the one that takes priority.
         * @return
         */
        public Object getValue() {
        	if(this.value != null) {
        		return this.value;
        	}
        	return this.defaultValue;
        }
        

        @Override
        public void serialize(Json json) throws IOException {
            json.writeMapBegin();
            json.writeMapEntry("writable", this.writable);
            json.writeMapEntry("defaultValue", this.defaultValue);
            json.writeMapEntry("value", this.value);
            if(this.originalValue != null) {
            	json.writeMapEntry("originalValue", this.originalValue);
            }
            json.writeMapEnd();
        }
    }
    
    /**
     * @return the master def registry
     */
    MasterDefRegistry getDefRegistry();

    /**
     * TODO: should have serialization contexts for any format, this shouldn't be tied to json
     * 
     * @return the json serialization context to use
     */
    JsonSerializationContext getJsonSerializationContext();

    /**
     * @return whether the descriptor has been checked for freshness in this thread
     */
    boolean hasChecked(DefDescriptor<?> d);

    /**
     * Sets that the given descriptor was checked for freshness, and so shouldn't be checked again
     * 
     * @param d descriptor that was checked
     */
    void setStaleCheck(DefDescriptor<?> d);

    /**
     * @return the current component being processed in the tree (for use by controllers and models)
     */
    BaseComponent<?, ?> getCurrentComponent();

    /**
     * Set the current component, so that the components controller can access it.
     * 
     * TODO: this is not handled as a stack, so it is almost certainly broken.
     * 
     * @param nextComponent The component to set.
     * @return the previous component
     */
    BaseComponent<?, ?> setCurrentComponent(BaseComponent<?, ?> nextComponent);

    /**
     * Get the currently processing action.
     * 
     * @return the current action being processed (for use by controllers)
     */
    Action getCurrentAction();

    /**
     * Set the current action, so that the components controller can access it
     * 
     * @param nextAction
     * @return the previous action
     */
    Action setCurrentAction(Action nextAction);

    void pushCallingDescriptor(DefDescriptor<?> descriptor);

    void popCallingDescriptor();

    /**
     * Get the current "calling" descriptor.
     */
    DefDescriptor<?> getCurrentCallingDescriptor();

    /**
     * If a qualifiedName for a DefDescriptor of the given type does not include a prefix (apex:// or java://, etc...),
     * this method on the context will be consulted to find out what the default prefix for the given DefType is.
     * 
     * @param defType
     * @return The default prefix for the given DefType in this context
     */
    String getDefaultPrefix(DefType defType);

    /**
     * Get the full set of default prefixes.
     */
    Map<DefType, String> getDefaultPrefixes();

    /**
     * Get the mode of execution.
     * 
     * This should be consistent across the entire request.
     */
    Mode getMode();

    /**
     * Shortcut to check if we are running in one of several testing modes. Use {@link #getMode()} to get the specific
     * mode.
     */
    boolean isTestMode();

    /**
     * Set the 'number' of this context.
     * 
     * This is used in component ids to guarantee that each global id is unique. This is passed in from the client, and
     * should never be set outside of Aura code during normal operation.
     * 
     * @param num The 'number' to use as an ID for this context.
     */
    void setNum(String num);

    /**
     * Get the context 'number'.
     */
    String getNum();

    Format getFormat();

    Authentication getAccess();

    Map<String, GlobalValueProvider> getGlobalProviders();

    String getContextPath();

    void setContextPath(String path);

    /**
     * Are we 'preloading'.
     * 
     * This is true if we are loading the set of definitions for app.css or app.js. This needs to be changed to do the
     * work related to breaking up app.xxx into 'system' vs. user definitions.
     * 
     * @return true if we are generating app.{js,css}
     */
    boolean isPreloading();

    /**
     * Set the context as preloading.
     * 
     * This really should be private, as no-one should ever call this.
     * 
     * @param p the new value to set.
     */
    void setPreloading(boolean p);

    /**
     * Add a 'dynamic' namespace.
     * 
     * Dynamic namespaces are namespaces that are created by the server and sent to the client. These are sent back to
     * the server with each request, so this should only be used for namespaces that are very expensive to generate.
     * 
     * @param namespace the namespace to mark as added.
     */
    void addDynamicNamespace(String namespace);

    /**
     * Set the incoming loaded descriptors.
     * 
     * @param clientLoaded the set of loaded descriptors from the client.
     */
    void setClientLoaded(Map<DefDescriptor<?>, String> clientLoaded);

    /**
     * Get the set of descriptors loaded on the client, and sent in the request.
     * 
     * @return a map of descriptor to UID, unmodifiable.
     */
    Map<DefDescriptor<?>, String> getClientLoaded();

    /**
     * Add a loaded descriptor+UID pair.
     * 
     * This routine will remember a descriptor in the set of loaded descriptors along with a uid for validating the load
     * (and 'timestamping' it). This should be used with care, as it will be serialized with every request, so size
     * should be a consideration.
     * 
     * @param descriptor The loaded descriptor.
     * @param uid the UID that was loaded.
     */
    void addLoaded(DefDescriptor<?> descriptor, String uid);

    /**
     * Drop a component from the set of loaded components.
     * 
     * Sober up our set. This can be used to remove a descriptor that is already covered by the set of loaded
     * components.
     * 
     * @param descriptor the previously marked 'loaded' descriptor.
     */
    void dropLoaded(DefDescriptor<?> descriptor);

    /**
     * Get the uid string for a descriptor.
     * 
     * @param descriptor the descriptor that we need a UID for.
     * @return the uid from the request (null if none).
     */
    String getUid(DefDescriptor<?> descriptor);

    /**
     * Get the set of loaded descriptors with the uid.
     * 
     * This set of descriptors should be the complete set of loaded descriptors that we choose to remember. Things
     * outside of the dependency set will be resent.
     * 
     * @return the map of descriptors to UIDs, UIDs are allowed to be null
     */
    Map<DefDescriptor<?>, String> getLoaded();

    /**
     * Check if a descriptor has been preloaded.
     */
    boolean isPreloaded(DefDescriptor<?> descriptor);

    /**
     * Get the application (or component) descriptor.
     * 
     * This returns the currently loaded application/component for this context. It can only be a component for
     * non-production mode.
     * 
     * @return the component or application (should rarely be null).
     */
    DefDescriptor<? extends BaseComponentDef> getApplicationDescriptor();

    /**
     * Set the application (or component) descriptor.
     * 
     * This sets the application. It should generally be used at context start time only, and will only allow certain
     * overrides.
     * 
     * @param appDesc the descriptor for the application/component.
     */
    void setApplicationDescriptor(DefDescriptor<? extends BaseComponentDef> appDesc);

    /**
     * Get the current 'loading' application descriptor.
     * 
     * This generally returns the application descriptor passed in from the client, but in dev mode, when a quick fix
     * exception occurs, this will be the quick fix rather than the application. That way we keep our context clean, but
     * remember that we have a quick fix.
     * 
     * @return the application descriptor.
     */
    DefDescriptor<? extends BaseComponentDef> getLoadingApplicationDescriptor();

    /**
     * Set the loading application (or component) descriptor.
     * 
     * This sets a descriptor to tell the app server that we are actually loading a different application/component than
     * the original one supplied. This is used to override the descriptor in the case of a quick fix (but could be used
     * for other things as well).
     * 
     * @param loadingAppDesc the descriptor for the application/component.
     */
    void setLoadingApplicationDescriptor(DefDescriptor<? extends BaseComponentDef> loadingAppDesc);

    /**
     * Set the definitions that the client should already have.
     * 
     * @param preloaded the actual set.
     */
    void setPreloadedDefinitions(Set<DefDescriptor<?>> preloaded);

    /**
     * Get the definitions that the client should already have.
     * 
     * @return the actual set (unmodifiable).
     */
    Set<DefDescriptor<?>> getPreloadedDefinitions();

    List<Locale> getRequestedLocales();

    void setRequestedLocales(List<Locale> requestedLocales);

    Client getClient();

    void setClient(Client client);

    /**
     * 
     * @param event - Instance of the {@link org.auraframework.instance.Event} to be fired at the client.
     * @throws Exception - If the {@link org.auraframework.def.EventType} is not APPLICATION or Event object's
     *             definition cannot be found.
     */
    void addClientApplicationEvent(Event event) throws Exception;

    List<Event> getClientEvents();

    boolean isDevMode();

    /**
     * Set the framework UID from the client (or server).
     * 
     * @param uid UID that we should set.
     */
    void setFrameworkUID(String uid);

    /**
     * Get the framework UID.
     * 
     * @return the context's idea of the UID.
     */
    String getFrameworkUID();

    /**
     * FIXME: This is busted!!!!
     */
    boolean getIsDebugToolEnabled();

    /**
     * Get the instance stack currently in use.
     * 
     * This could either be a 'local' instance stack for the context (deprecated behavior) or it could be from the
     * action.
     */
    InstanceStack getInstanceStack();

    String getCurrentNamespace();

    /**
     * Register a new component.
     * 
     * This is the entry point for adding a new component to the context. This delegates to the appropriate instance
     * stack.
     * 
     * @param component the component to register.
     */
    void registerComponent(BaseComponent<?, ?> component);

    /**
     * Get the next id for the context.
     */
    int getNextId();

    /**
     * Serialize out the components.
     */
    void serializeAsPart(Json json) throws IOException;

    /**
     * TODONM remove
     *
     * Prepends all app-specified {@link TokensDef} defs to this context.
     * <p>
     * The {@link TokensDef}s will be prepended <em>before</em> all {@link TokensDef}s added with
     * {@link #appendTokensDescriptor(DefDescriptor)}. This should only be called at most once per context instance.
     * <p>
     * <b>This is usually only called internally by the framework.</b> If you need to specify an override, most like you
     * want {@link #appendTokensDescriptor(DefDescriptor)} instead.
     */
    void addAppTokensDescriptors();

    /**
     * TODONM remove
     *
     * Explicitly appends a {@link TokensDef} override after other currently specified {@link TokensDef}s. This will
     * also be after any {@link TokensDef}s on the current application.
     *
     * @param tokenListDescriptor The override tokens.
     * @throws QuickFixException If there was a problem loading/validating/etc... the descriptor.
     */
    void appendTokensDescriptor(DefDescriptor<TokensDef> tokenListDescriptor) throws QuickFixException;

    /**
     * TODONM move to appdef
     *
     * Gets the list of overrides explicitly specified to this context. These are the tokens that are used to "override"
     * the default token values.
     * <p>
     * While usually the token overrides are specified on the application tag itself, in some situations the overrides
     * may be directly specified to this context, e.g., in some usages of the integration service.
     * <p>
     * The application's overrides are not implicitly included in this result by default. However, note that the
     * application's overrides are explicitly added to the context at one point during the request (See
     * {@link AuraBaseServlet#getStyles()}). Effectively this means that these <em>will</em> be included during
     * the actual CSS request itself. See {@link #addAppTokensDescriptors()}.
     */
    TokenOptimizer getTokenOptimizer();

    /**
     * Sets the {@link StyleContext}.
     * 
     * @param styleContext The style context instance.
     */
    void setStyleContext(StyleContext styleContext);

    /**
     * Sets the {@link StyleContext} from a config map. The map must follow a specific format. Most of the time you
     * should be using {@link #setStyleContext(StyleContext)} instead.
     * 
     * @param config The config map.
     */
    void setStyleContext(Map<String, Object> config);

    /**
     * Gets the {@link StyleContext}.
     * 
     * @return The {@link StyleContext} (never null, creates a new instance if necessary.
     */
    StyleContext getStyleContext();

    /**
     * Get a location stack for the current context at the current moment.
     */
    List<String> createComponentStack();

    /**
     * @return state of context Globals
     */
    ImmutableMap<String, AuraContext.GlobalValue> getGlobals();

    /**
     * @return state of a context Global Non-registered names will throw Registered names will never return null unless
     *         that is the defined default.
     */
    Object getGlobal(String approvedName) throws AuraRuntimeException;

    /**
     * validates the global's existence Non-registered names will return false
     */
    boolean validateGlobal(String approvedName);
    
    /**
     * @set Set the state of the global value from the server.
     */
    void setGlobalDefaultValue(String approvedName, Object defaultValue);
    /**
     * @set Set the state of the global value for the client, should only get set if the value has not changed since 
     */
    void setGlobalValue(String approvedName, Object value);


    /*
     * The encoding style for URLs.
     */
    enum EncodingStyle {
        Bare, // ! Minimal context, no UIDs
        Normal, // ! Standard encoding, include UIDs
        Css, // ! Token UIDs, Client and StyleContext info included
        Full // ! Everything
    };

    /**
     * Encode the context for use in json.
     * 
     * This allows the encoding style to be used, and returns a string, unlike the serialization service.
     */
    String serialize(EncodingStyle style);

    /**
     * Encode the context for a URL.
     * 
     * @param style the encoding style for the context that we need.
     */
    String getEncodedURL(EncodingStyle style);

    /**
     * Get the accessible version for a component.
     * 
     * Use this to toggle logic based on what version of the component is being requested. This returns null if no
     * requiredVersionDef or no version is found.
     */
    String getAccessVersion() throws QuickFixException;
}
