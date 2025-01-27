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
/*jslint sub: true */

/**
 * @description Creates an AttributeSet instance.
 * @param {Object}
 *            config Sets the values with the config object, if provided.
 * @param {Object}
 *            valueProvider Sets the value provider for the attributes.
 * @param {AttributeDefSet}
 *            attributeDefSet The metadata describing the attributes in the set.
 * @constructor
 * @protected
 */
function AttributeSet(attributes, attributeDefSet) {
	this.values = {};
    this.shadowValues={};
    this.decorators={};
	this.attributeDefSet = attributeDefSet;

	this.initialize(attributes);

	// #if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
	this["values"] = this.values;
	// #end
}

/**
 * Whether attribute exists
 *
 * @param {String}
 *            name - name of attribute
 * @returns {boolean} true if attribute exists
 * @private
 */
AttributeSet.prototype.hasAttribute = function(name) {
	return this.values.hasOwnProperty(name);
};

/**
 * Returns the highest extended reference of the attribute using property syntax.
 *
 * @param {String} key The data key to look up.
 * @param {Object} component The component hierarchy to investigate
 * @returns {Object} the attribute def
 * @protected
 *
 */
AttributeSet.prototype.getDef = function(key, component) {
    var def=[];
    var target=component.getConcreteComponent?component.getConcreteComponent():component;
    while(target){
        var tempDef=target.getDef?target.getDef().getAttributeDefs().getDef(key):target.getAttributeDefs().getDef(key);
        if(!tempDef){
            break;
        }
        def[0]=tempDef;
        def[1]=target;
        target=target.getSuper?target.getSuper():target.getSuperDef();
    }
    return def;
};
/**
 * Returns the value referenced using property syntax.
 *
 * @param {String}
 *            key The data key to look up.
 * @returns {Object} the value of the attribute
 * @protected
 *
 */
AttributeSet.prototype.get = function(key, component) {
	var value = undefined;
    var path = null;
    var attribute=key;
    key=key.replace(/^body\b/g,"body."+component.globalId);
    if(key.indexOf('.')>-1){
        path=key.split('.');
        attribute=path[0];
    }
    var defs=this.getDef(attribute,component);
    if(!$A.clientService.allowAccess(defs[0], defs[1])){
        // #if {"excludeModes" : ["PRODUCTION","AUTOTESTING"]}
        $A.warning("Access Check Failed! AttributeSet.get(): attribute '"+attribute+"' of component '"+component+"' is not visible to '"+$A.getContext().getCurrentAccess()+"'.");
        // #end
        return undefined;
    }
	if (!path) {
        var decorators=this.decorators[key];
        if(decorators&&decorators.length){
            if(decorators.decorating){
                value=decorators.value;
            }else{
                decorators.decorating=true;
                decorators.value=this.values[key];
                for(var i=0;i<decorators.length;i++){
                    var decorator=decorators[i];
                    value=decorator.value=decorators[i].evaluate();
                }
                decorators.decorating=false;
                decorators.value=null;
            }
        }else{
            value = this.values[key];
        }
	} else {
		value = aura.expressionService.resolve(key, this.values);
	}

	if (aura.util.isExpression(value)) {
		value = value.evaluate();
	}

    if(value instanceof ActionReferenceValue) {
        value = value.getAction();
    }

    if(this.shadowValues.hasOwnProperty(key)) {
        value += this.getShadowValue(key);
    }

	return value;
};

AttributeSet.prototype.getShadowValue=function(key){
    var value = aura.expressionService.resolve(key, this.values, true);
    if(value instanceof FunctionCallValue){
        if(this.shadowValues.hasOwnProperty(key)) {
            return this.shadowValues[key];
        }
        return '';
    }
    return undefined;
};


AttributeSet.prototype.setShadowValue=function(key,value){
    var oldValue = aura.expressionService.resolve(key, this.values, true);
    if(oldValue instanceof FunctionCallValue){
        this.shadowValues[key]=value;
    }
};

/**
 * Set the attribute of the given name to the given value.
 *
 * @param {String}
 *            key The key can be a path expression inside. E.g.
 *            attribute.nestedValue.value....}
 * @param {Object}
 *            value The value to be set.
 *
 * @protected
 *
 */
AttributeSet.prototype.set = function(key, value, component) {
    var target = this.values;
    var path = null;
    var attribute=key;
    key=key.replace(/^body\b/g,"body."+component.globalId);
    if(key.indexOf('.')>-1){
        path=key.split('.');
        attribute=path[0];
    }
    var defs=this.getDef(attribute,component);
    if(!$A.clientService.allowAccess(defs[0],defs[1])){
        // #if {"excludeModes" : ["PRODUCTION","AUTOTESTING"]}
        $A.warning("Access Check Failed! AttributeSet.set(): '"+attribute+"' of component '"+component+"' is not visible to '"+$A.getContext().getCurrentAccess()+"'.");
        // #end

        return;
    }
    if(!$A.util.isUndefinedOrNull(value) && !this.isValueValidForAttribute(key, value)) {
    	if(this.isTypeOfArray(key)) {
    		value = !$A.util.isArray(value) ? [value] : value;
    	} else {
    		//$A.warning("You set the attribute '" + key + "' to the value '" + value + "' which was the wrong data type for the attribute.");
            // Do we want to allow.
            //return;
    	}
    }

    // Process all keys except last one
    if (path) {
        var step = path.shift();
        while (path.length > 0) {
            var nextStep = path.shift();
            var nextTarget = target[step];
            if (nextTarget === undefined) {
                // Attempt to do the right thing: create an empty object or an array
                // depending if the next indice is an object or an array.
                if (isNaN(nextStep)) {
                    target[step] = {};
                } else {
                    target[step] = [];
                }
                target = target[step];
            } else {
                if ($A.util.isExpression(nextTarget)) {
                    target = nextTarget.evaluate();
                } else {
                    target = nextTarget;
                }
            }
            step = nextStep;
        }
        key = step;
    }

    // We don't want to update the GVP from a component.
    // We do that from inside the GVP using $A.set()
    // So clear the reference and change 
    if (target[key] instanceof PropertyReferenceValue && !target[key].isGlobal ) {
        target[key].set(value);
    } else if (!(target[key] instanceof FunctionCallValue)) {
        // HALO: TODO: JBUCH: I DON'T LIKE THIS...
        // Silently do nothing when you try to set on a FunctionCallValue,
        // which we need to support legacy old behaviour due to inheritance.
        target[key] = value;
    }
// #if {"excludeModes" : ["PRODUCTION", "STATS"]}
    else {
        $A.warning("AttributeSet.set(): unable to override the value for '" + key + "=" + target[key] + "'. FunctionCallValues declared in markup are constant.");
    }
// #end
};

/**
 * Clears a property reference value of the given name, and returns it. Does nothing if the attribute
 * does not exist or is not a property reference value.
 *
 * @param {String}
 *            key The key can be a path expression inside. E.g.
 *            attribute.nestedValue.value....}
 *
 * @returns {PropertyReferenceValue} the reference that was found and cleared, or null
 * @protected
 *
 */
AttributeSet.prototype.clearReference = function(key) {
    var oldValue;
    var target=this.values;
    var step=key;

    if (key.indexOf('.') >= 0) {
        var path = key.split('.');
        target = aura.expressionService.resolve(path.slice(0, path.length - 1), target);
        step=path[path.length-1];
    }
    if(target) {
        oldValue = target[step];
        if (oldValue instanceof PropertyReferenceValue) {
            target[step] = undefined;
            return oldValue;
        }
    }
    return null;
};

/**
 * Verifies if a value is valid for the type that the attribute is defined as.
 * Strings as strings, arrays as arrays, etc.
 */
AttributeSet.prototype.isValueValidForAttribute = function(attributeName, value) {
	var attributeDefSet = this.attributeDefSet;
	if(attributeName.indexOf(".")>=0){
		var path = attributeName.split(".");
		attributeName=path[0];
		if(attributeName!=="body"&&path.length > 1) {
			// We don't validate setting a value 2 levels deep. (v.prop.subprop)
			return true;
		}
	}

	var attributeDef = attributeDefSet.getDef(attributeName);
	if(!attributeDef) {

		// Attribute doesn't exist on the component
		return false;
	}

	var nativeType = attributeDef.getNativeType();

	// Do not validate property reference values or object types
	if($A.util.isExpression(value) || nativeType === "object") {
		return true;
	}

	// typeof [] == "object", so we need to do this one off for arrays.
	if(nativeType === "array") {
		return $A.util.isArray(value);
	}

	return typeof value === nativeType;
};


AttributeSet.prototype.isTypeOfArray = function(attributeName) {
	if(attributeName.indexOf(".")>=0){
		var path = attributeName.split(".");
		attributeName=path[0];
		if(attributeName!=="body"&&path.length > 1) {
			// We don't validate setting a value 2 levels deep. (v.prop.subprop)
			return false;
		}
	}
	var attributeDef = this.attributeDefSet.getDef(attributeName);
	return attributeDef && attributeDef.getNativeType() === "array";
};

/**
 * Reset the attribute set to point at a different def set.
 *
 * Allows us to change the set of attributes in a set when we inject a new
 * component. No checking is done here, if checking is desired, it should be
 * done by the caller.
 *
 * Doesn't check the current state of attributes because they don't matter. This
 * will create/update attributes based on new AttributeDefSet, provided
 * attribute config and current attribute values
 *
 * @param {AttributeDefSet}
 *            attributeDefSet the new def set to install.
 * @param {Object}
 *            attributes - new attributes configuration
 * @private
 */
AttributeSet.prototype.merge = function(attributes, attributeDefSet) {
	if(attributeDefSet){
        $A.assert(attributeDefSet instanceof AttributeDefSet, "AttributeSet.merge: A valid AttributeDefSet is required to merge attributes.");
        this.attributeDefSet = attributeDefSet;
    }

	// Reinitialize attribute values
	this.initialize(attributes);
};

/**
 * Gets default attribute value.
 *
 * @param {String}
 *            name - name of attribute
 * @private
 */
AttributeSet.prototype.getDefault = function(name) {
	if (name) {
		var attributeDef = this.attributeDefSet.getDef(name);
		if (attributeDef) {
            return attributeDef.getDefault();
		}
	}
	return null;
};

/**
 * Destroys the attributeset.
 *
 * @param {Boolean}
 *            async - whether to put in our own trashcan
 * @private
 */
AttributeSet.prototype.destroy = function(async) {
    var values = this.values;
    var expressions={};
    for (var k in values) {
        var v = values[k];

        // Body is special because it's a map
        // of bodies for each inheritance level
        // so we need to do a for( var in ) {} loop
        if(k === "body") {
        	for(var globalId in v) {
                var body = v[globalId];
                if(body) {
            		for(var j=0;j<body.length;j++) {
            			body[j].destroy(async);
            		}
                }
        	}
        	continue;
        }

        // KRIS: HALO:
        // HTML Elements store their attributes in the HTMLAttributes map.
        // Since we don't go recursively down the attributes we don't clean these.
        // We should at least destroy them, PRV's still don't release their references.
        // if(k === "HTMLAttributes") {
        //     for(var attribute in v) {
        //         if(v[attribute] && v[attribute].destroy) {
        //             v[attribute].destroy(async);
        //         }
        //     }
        // }

        if(!$A.util.isArray(v)){
            v=[v];
        }

        for(var i=0,value;i<v.length;i++){
            value = v[i];
            if($A.util.isExpression(value)){
                expressions[k]=value;
            } else if ($A.util.isComponent(value)) {
                value.destroy(async);
            }
        }
    }

    this.values = this.attributeDefSet = undefined;
    return expressions;
};

/**
 * Loop through AttributeDefSet and create or update value using provided config
 *
 * @param {Object}
 *            config - attribute configuration
 * @private
 */
AttributeSet.prototype.initialize = function(attributes) {
    var attributeDefs = this.attributeDefSet.getValues();
	var attributeNames = this.attributeDefSet.getNames();
	if (!attributeDefs || !attributeNames) {
		return;
	}

	var configValues = attributes || {};

    // Create known attributes and assign values or defaults
	for (var i = 0; i < attributeNames.length; i++) {
		var attributeDef = attributeDefs[attributeNames[i]];
		var name = attributeDef.getDescriptor().getName();
		var hasAttribute = this.hasAttribute(name);
		var hasValue = configValues.hasOwnProperty(name);
		var value = configValues[name];

		if (!hasValue && !hasAttribute) {
			value = this.getDefault(name);
			hasValue = value !== undefined;
		}

        if (attributeDef.isRequired && attributeDef.isRequired()) {
            if (!hasValue) {
//                throw new Error("Missing required attribute " + name);
            }
        }

		if ((hasValue && this.values[name]!==value) || !hasAttribute) {
            if(hasAttribute && value instanceof FunctionCallValue) {
                if (!this.decorators[name]) {
                    this.decorators[name] = [];
                }
                this.decorators[name].push(value);
            }else{
                if (!(value instanceof PropertyReferenceValue && value.equals(this.values[name]))) {
                    this.values[name] = value;
                }
            }
		}
	}

    // Guard against unknown attributes
    var unknownAttributes=[];
    for(var attribute in configValues){
        if(!this.hasAttribute(attribute)){
            unknownAttributes.push(attribute);
        }
    }

    $A.assert(unknownAttributes.length===0,"AttributeSet.initialize: The following unknown attributes could not be initialized: '"+unknownAttributes.join("', '")+"'. Please confirm the spelling and definition of these attributes.");
};

Aura.Attribute.AttributeSet = AttributeSet;
