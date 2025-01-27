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
Function.RegisterNamespace("Test.Aura.Controller");

[Fixture]
Test.Aura.Controller.ActionTest = function() {
    var Aura = {
        "Controller": {}
    };

    Mocks.GetMocks(Object.Global(), {
        "Aura": Aura,
        "Action": function(){}
    })(function() {
        [Import("aura-impl/src/main/resources/aura/controller/Action.js")]
    });

    var targetNextActionId = 123;
    var mockActionId = function(during){
        Mocks.GetMock(Aura.Controller.Action.prototype, "nextActionId", targetNextActionId)(during);
    }

    // Just sets up the mocks before creating a new action.
    // No logic
    function newAction() {
        var action;
        Mocks.GetMocks(Object.Global(), {
            "$A": { getContext: function() {} },
            "Action": Aura.Controller.Action
        })(function(){
            action = new Action();
        });
        return action;
    }

    var mockActionDependencies = Mocks.GetMocks(Object.Global(), {
            "$A": { 
                getContext: function() { return null; },
                util: {
                    isFunction: function(value) {
                        return typeof value === "function";
                    }
                }
            },
            "Action": Aura.Controller.Action        
    });

    [ Fixture ]
    function Constructor() {
        [Fact]
        function SetsStateToNew() {
            // Arrange
            var target;
            var expected = "NEW";
            var actual;

            // Act
            mockActionDependencies(function(){
                target = new Action();
                actual = target.state;
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SetsActionId() {
            // Arrange
            var expected = targetNextActionId;
            var actual;

            // Act
            mockActionDependencies(function(){
                mockActionId(function() {
                    var target = new Aura.Controller.Action();
                    actual = target.actionId;
                }); 
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function IncrementsNextActionId() {
            // Arrange
            var expected = targetNextActionId + 1;
            var actual;

            // Act
            mockActionDependencies(function(){
                mockActionId(function() {
                    var target = new Aura.Controller.Action();
                    actual = Aura.Controller.Action.prototype.nextActionId;
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function GetId() {

        var targetContextNum = "expectedContextNum";
        
        [Fact]
        function ReturnsIdIfSet() {
            // Arrange
            var expected = "expected";
            var actual;

            // Act
            mockActionDependencies(function(){
                var target = new Aura.Controller.Action();
                target.id = expected;
                actual = target.getId();
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ConstructsIdIfNotSet() {
            // Arrange
            var expected = String.Format("{0};{1}", targetNextActionId, targetContextNum);
            var actual;

            // Act
            mockActionDependencies(function() {
                mockActionId(function() {
                    actual = new Aura.Controller.Action(null, targetContextNum).getId();
                });
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SetsConstructedIdOnAction() {
            // Arrange
            var expected = String.Format("{0};{1}", targetNextActionId, targetContextNum);
            var target;

            // Act
            mockActionDependencies(function() {
                mockActionId(function() {
                    target = new Aura.Controller.Action(null, targetContextNum);
                    target.getId();
                });
            });
            var actual = target.id;

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function GetNextGlobalId() {
        [Fact]
        function ReturnsOneIfNotSet() {
            // Arrange
            var expected = 1;
            var target = newAction();

            // Act
            var actual = target.getNextGlobalId();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsNextGlobalIdWhenSet() {
            // Arrange
            var expected = 123;
            var target = newAction();
            target.nextGlobalId = expected;

            // Act
            var actual = target.getNextGlobalId();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function IncrementsIdAfterUse() {
            // Arrange
            var expected = 100;
            var target = newAction();
            target.nextGlobalId = 99;

            // Act
            target.getNextGlobalId();
            var actual = target.nextGlobalId;

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function GetDef() {
        [Fact]
        function ReturnsDef() {
            // Arrange
            var expected = "expected";
            var target = newAction();
            target.def = expected;

            // Act
            var actual = target.getDef();

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function SetParams() {
        [Fact]
        function MapsKeyInParamDefsToConfig() {
            var data = "expected";
            var paramDefs = {
                key : 1
            };
            var expected = {
                key : data
            };
            var actual;

            mockActionDependencies(function(){
                var target = new Aura.Controller.Action(null, null, null, paramDefs);
                target.setParams({key: data});
                actual = target.params;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ClearsPreviouslySetParamsIfMissingFromConfig() {
            var paramDefs = {
                key1 : 1,
                key2 : 2
            };
            var config = {
                key2 : "new"
            };
            var expected = {
                key1 : undefined,
                key2 : "new"
            };
            var actual;

            mockActionDependencies(function(){
                var target = new Aura.Controller.Action(null, null, null, paramDefs);
                target.params["key1"] = "existing";
                target.setParams(config);
                actual = target.params;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function DoesNotSetParamsWithoutDefs() {
            var paramDefs = {
                key1 : 1,
                key2 : 2
            };
            var config = {
                key1 : "new",
                key3 : "ignored"
            };
            var expected = {
                key1 : "new",
                key2 : undefined
            };
            var actual;

            mockActionDependencies(function(){
                var target = new Aura.Controller.Action(null, null, null, paramDefs);
                target.setParams(config);
                actual = target.params;    
            });
            
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function GetParam() {
        [Fact]
        function ReturnsValueFromParamsIfKeyFound() {
            var expected = "expected";
            var paramsKey = "key";
            var target = newAction();
            target.params[paramsKey] = expected;

            var actual = target.getParam(paramsKey);

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsUndefinedIfKeyNotFound() {
            var paramsKey = "key";
            var target = newAction();
            target.params = {};

            var actual = target.getParam(paramsKey);

            Assert.Undefined(actual);
        }
    }

    [ Fixture ]
    function GetParams() {
        [Fact]
        function ReturnsParamsObject() {
            // Arrange
            var expected = "expected";
            var target = newAction();
            target.params = expected;

            // Act
            var actual = target.getParams();

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function GetComponent() {
        [Fact]
        function ReturnsCmpObject() {
            // Arrange
            var expected = "expected";
            var target = newAction();
            target.cmp = expected;

            // Act
            var actual = target.getComponent();

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function SetCallback() {
        [Fact]
        function SetsCallbackWhenNameSet() {
            // Arrange
            var expectedScope = "expectedScope";
            var expectedCallback = function expectedCallback(){};
            var name = "SUCCESS";
            var expected = {
                "SUCCESS" : {
                    s : expectedScope,
                    fn : expectedCallback
                }
            };
            var actual;

            // Act
            mockActionDependencies(function() {
                var target = new Aura.Controller.Action();
                target.setCallback(expectedScope, expectedCallback, name);
                actual = target.callbacks;
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ThrowsErrorWhenNameIsInvalid() {
            // Arrange
            var stubbedError = Stubs.GetMethod("msg", null);
            var name = "someInvalidName";
            var expected = "Action.setCallback(): Invalid callback name '" + name + "'";

            // Act
            mockActionDependencies(function(){
                var target = new Aura.Controller.Action();
                $A.error = stubbedError;
                target.setCallback(null, function(){}, name);
            });            

            // Assert
            Assert.Equal(expected, stubbedError.Calls[0].Arguments.msg);
        }

        [Fact]
        function SetsAllCallbacksAndScopeWhenNameUndefined() {
            // Arrange
            var expectedScope = "expectedScope";
            var expectedCallback = function expectedCallback(){};
            var expected = {
                s : expectedScope,
                fn : expectedCallback
            };
            var expected = {
                "SUCCESS" : expected,
                "ERROR" : expected,
                "INCOMPLETE" : expected
            };
            var actual;

            // Act
            mockActionDependencies(function() {
                var target = new Aura.Controller.Action();
                target.setCallback(expectedScope, expectedCallback);
                actual = target.callbacks;
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SetsAllCallbacksAndScopeWhenNameAll() {
            // Arrange
            var expectedScope = "expectedScope";
            var expectedCallback = function expectedCallback(){};
            var expected = {
                s : expectedScope,
                fn : expectedCallback
            };
            var expected = {
                "SUCCESS" : expected,
                "ERROR" : expected,
                "INCOMPLETE" : expected
            };
            var actual;

            // Act
            mockActionDependencies(function(){
                var target = new Aura.Controller.Action();
                target.setCallback(expectedScope, expectedCallback, "ALL");
                actual = target.callbacks;
            });
            

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ThrowsErrorIfCallbackNotAFunction() {
            // Arrange
            var expected = "Action.setCallback(): callback for 'bogus' must be a function";
            var actual;

            // Act
            mockActionDependencies(function(){
                $A.error = function(msg){ actual = msg; };
                var target = new Aura.Controller.Action();
                target.setCallback(undefined, undefined, "bogus");
            })

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function SetAllAboardCallback() {
        var mockContext = Mocks.GetMock(Object.Global(), "$A", {
            util : {
                isFunction : function() {
                    return true;
                }
            }
        });

        var mockErrorContext = Mocks.GetMock(Object.Global(), "$A", {
            util : {
                isFunction : function() {
                    return false;
                }
            }
        });

        [Fact]
        function ConstructorClearsCallback() {
            // Arrange
            var target = newAction();

            // Act
            // Assert
            Assert.Undefined(target.allAboardCallback);
        }

        [Fact]
        function SetsCallback() {
            // Arrange
            var expectedScope = "expectedScope";
            var expectedCallback = "expectedCallback";
            var target = newAction();

            // Act
            mockContext(function() {
                target.setAllAboardCallback(expectedScope, expectedCallback);
            });

            // Assert (we can't tell exactly what it is, so just look for set).
            Assert.False(target.allAboardCallback === undefined);
        }
    }

    [ Fixture ]
    function WrapCallback() {
        [Fact]
        function SetsCallbackToCurrentCallbackThenNewCallback() {
            // Arrange
            var expectedScope = "expectedScope";
            var outerCallbackFlag = false; // Set when function passed in as param is called
            var outerCallback = function() {
                outerCallbackFlag = true;
            }
            var target = newAction();
            target.getState = function() {
                return "STATE";
            };
            target.callbacks = {
                "STATE" : {
                    "fn" : function(scope, callback) {
                        if (outerCallbackFlag) {
                            Assert.Fail("New callback called before current callback");
                        }
                    }
                }
            };
            target.setCallback = function(scope, func) {
                func.call(scope); // Call what the new callback is set as to test logic inside
            }

            // Act
            target.wrapCallback(null, outerCallback);

            // Assert
            Assert.True(outerCallbackFlag);
        }
    }

    [ Fixture ]
    function RunDeprecated() {
        var mockGlobals = Mocks.GetMock(Object.Global(), "$A", {
            clientService : {
                inAuraLoop : function() {
                    return false;
                }
            },
            assert : function(param) {
            }
        });

        [Fact]
        function AssertsIsClientAction() {
            // Arrange
            var expected = "expected";
            var mockAura = Mocks.GetMock(Object.Global(), "$A", {
                getContext: function() {
                    return Test.Stubs.Aura.GetContext();
                },
                assert : function(param) {
                    actual = param;
                }
            });
            var def = {
                isClientAction : function() {
                    return expected;
                }
            };
            var cmp = {
                getDef : function() {
                    return {
                        getHelper : function() {
                        }
                    }
                }
            };
            var meth = {
                call : function() {
                }
            };
            var target = newAction();
            target.def = def;
            target.meth = meth;
            target.cmp = cmp;
            var actual = null;

            // Act
            mockAura(function() {
                target.runDeprecated();
            })

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function LogsFailMessageOnException() {
            // Arrange
            var expectedName = "expectedName";
            var expectedQualifiedName = "expectedQN";
            var expected = "Action failed: " + expectedQualifiedName + " -> " + expectedName;
            var reportErrorCalled = false;

            var mockAura = Mocks.GetMock(Object.Global(), "$A", {
                getContext: function() {
                    return Test.Stubs.Aura.GetContext();
                },
                assert : function(param) {
                },
                warning : function(msg) {
                    actual = msg;
                },
                get : function(actDesc) {
                    return {
                        setStorable : function() {
                        },
                        setAbortable : function() {
                        },
                        setParams : function() {
                        },
                        setCallback : function() {
                        }
                    };
                },
                clientService : {
                    inAuraLoop : function() {
                        return false;
                    }
                },
                logger : {
                    reportError : function() {
                        reportErrorCalled = true;
                    }
                }
            });
            var cmp = {
                getDef : function() {
                    return {
                        getDescriptor : function() {
                            return {
                                getQualifiedName : function() {
                                    return expectedQualifiedName;
                                }
                            }
                        }
                    }
                }
            };
            var target = newAction();
            target.cmp = cmp;
            target.def = {
                getDescriptor : function() {
                    return {
                        getQualifiedName : function() {
                            return expectedQualifiedName;
                        }
                    }
                },
                getName : function() {
                    return expectedName;
                },
                isClientAction : function() {
                }
            };
            var actual = null;

            // Act
            mockAura(function() {
                target.runDeprecated();
            })
            Assert.Equal(true, reportErrorCalled);

            // Assert
            // FIXME: re-enable after client side creation fixed.
            // Assert.Equal(expected, actual);
        }

        [Fact]
        function SetsStateToSuccess() {
            // Arrange
            var expectedState = "SUCCESS";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                getContext: function() { 
                    return Test.Stubs.Aura.GetContext();
                },
                assert : function(param) {
                }
            });
            var def = {
                isClientAction : function() {
                }
            };
            var cmp = {
                getDef : function() {
                    return {
                        getHelper : function() {
                        }
                    }
                }
            };
            var meth = {
                call : function() {
                }
            };
            var target = newAction();
            target.def = def;
            target.meth = meth;
            target.cmp = cmp;

            // Act
            mockAssert(function() {
                target.runDeprecated();
            })

            // Assert
            Assert.Equal(expectedState, target.state);
        }

        [Fact]
        function SetsStateToErrorOnException() {
            // Arrange
            var expectedState = "ERROR";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                getContext: function() { 
                    return Test.Stubs.Aura.GetContext();
                },
                assert : function(param) {},
                warning : function() {},
                get : function(actDesc) {
                    return {
                        setStorable : function() {},
                        setAbortable : function() {},
                        setParams : function() {},
                        setCallback : function() {}
                    };
                },
                clientService : {
                    inAuraLoop : function() {
                        return false;
                    }
                },
                logger : {
                    reportError : function() {}
                }
            });
            var target = newAction();
            target.cmp = Test.Stubs.Aura.GetComponent();
            target.def = {
                getDescriptor : function() {
                    return {
                        getQualifiedName : function() {
                            return "aura://ComponentController.reportFailedAction";
                        }
                    }
                },
                getName : function() {},
                isClientAction : function() {}
            };

            // Act
            mockAssert(function() {
                target.meth = null; // Fails cause there is no method to call
                target.runDeprecated();
            })

            // Assert
            Assert.Equal(expectedState, target.state);
        }

        [Fact]
        function ActionErrorsReportedToServer() {
            // Arrange
            var expectedState = "ERROR";
            // We also use this test to check that reportFailure failures are NOT re-sent
            var sentToServer = 0;

            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                getContext: function() { 
                    return Test.Stubs.Aura.GetContext();
                },
                assert : function(param) {},
                warning : function() {},
                get : function(actDesc) {
                    return Test.Stubs.Aura.GetAction();
                },
                clientService : {
                    inAuraLoop : function() {
                        return false;
                    }
                },
                logger : {
                    reportError : function() {
                        sentToServer++;
                    }
                }
            });
            var target = newAction();
            target.cmp = Test.Stubs.Aura.GetComponent();
            target.def = {
                getDescriptor : function() {
                    return {
                        getQualifiedName : function() {
                            return "aura://ComponentController.reportFailedAction";
                        }
                    }
                },
                getName : function() {},
                isClientAction : function() {}
            };

            // Act
            mockAssert(function() {
                target.meth = null; // Fails cause there is no method to call
                target.runDeprecated();
            })

            // Assert
            Assert.Equal(1, sentToServer);
        }
    }

    [ Fixture ]
    function GetState() {
        [Fact]
        function ReturnsState() {
            // Arrange
            var expected = "expected";
            var target = newAction();
            target.state = expected;

            // Act
            var actual = target.getState();

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function GetReturnValue() {
        [Fact]
        function ReturnsReturnValue() {
            // Arrange
            var expected = "expected";
            var target = newAction();
            target.returnValue = expected;

            // Act
            var actual = target.getReturnValue();

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function GetError() {
        [Fact]
        function ReturnsError() {
            // Arrange
            var expected = "expected";
            var target = newAction();
            target.error = expected;

            // Act
            var actual = target.getError();

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function IsBackground() {
        [Fact]
        function ReturnsTrueIfBackgroundSet() {
            // Arrange
            var target = newAction();
            target.background = true;

            // Act
            var actual = target.isBackground();

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function ReturnsFalseIfBackgroundNotSet() {
            // Arrange
            var target = newAction();

            // Act
            var actual = target.isBackground();

            // Assert
            Assert.False(actual);
        }

        [Fact]
        function ReturnsFalseIfBackgroundNotTrue() {
            // Arrange
            var target = newAction();
            target.background = "true";

            // Act
            var actual = target.isBackground();

            // Assert
            Assert.False(actual);
        }
    }

    [ Fixture ]
    function SetBackground() {
        [Fact]
        function SetsBackgroundToTrue() {
            // Arrange
            var target = newAction();

            // Act
            target.setBackground();
            var actual = target.background;

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function CannotSetBackgroundToFalse() {
            var target = newAction();
            target.background = true;

            target.setBackground(false);
            var actual = target.background;

            Assert.True(actual);
        }
    }

    [ Fixture ]
    function RunAfter() {
        [Fact]
        function AddsActionParamToQueue() {
            // Arrange
            var expectedReturn = "expectedReturn";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                getContext: function() { 
                    return Test.Stubs.Aura.GetContext();
                },
                assert : function(param) {
                },
                clientService : {
                    enqueueAction : function(param) {
                        actual = param;
                    }
                }
            });
            var target = newAction();
            var action = {
                def : {
                    isServerAction : function() {
                    }
                }
            };
            var actual = null;

            // Act
            mockAssert(function() {
                target.runAfter(action);
            })

            // Assert
            Assert.Equal(action, actual);
        }
    }

    [ Fixture ]
    function GetStored() {
        [Fact]
        function NullIfNotSuccessful() {
            // Arrange
            var target = newAction();
            target.storable = true;
            target.returnValue = "NONE";
            target.state = "FAILURE";
            target.responseState = "FAILURE";

            // Act
            var stored = target.getStored();

            // Assert
            Assert.Equal(null, stored);
        }

        [Fact]
        function NullIfNotStorable() {
            // Arrange
            var target = newAction();
            target.storable = false;
            target.returnValue = "NONE";
            target.state = "SUCCESS";
            target.responseState = "SUCCESS";

            // Act
            var stored = target.getStored();

            // Assert
            Assert.Equal(null, stored);
        }

        [Fact]
        function ActionGetStoredReturnsComponents() {
            // Arrange
            var expected = [Test.Stubs.Aura.GetComponent()];
            var target = newAction();
            target.storable = true;
            target.responseState = "SUCCESS";
            target.components = expected;

            // Act
            var stored = target.getStored();

            // Assert
            Assert.Equal(expected, stored.components);
        }

        [Fact]
        function ActionGetStoredReturnsCreatedTime() {
            // Arrange
            var target = newAction();
            target.storable = true;
            target.responseState = "SUCCESS";
            var expected = "NOW";
            var mockDateTime = Mocks.GetMock(Date.prototype, "getTime", function() { return expected; });
            var actual;

            // Act
            mockDateTime(function(){
                var stored = target.getStored();
                actual = stored.storage.created;
            });

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ActionGetStoredReturnsReturnValue() {
            // Arrange
            var target = newAction();
            target.storable = true;
            target.returnValueUnmodified = "NONE";
            target.state = "SUCCESS";
            target.responseState = "SUCCESS";

            // Act
            var stored = target.getStored();

            // Assert
            Assert.Equal("NONE", stored["returnValue"]);
        }

        [Fact]
        function ActionGetStoredReturnsState() {
            // Arrange
            var target = newAction();
            target.storable = true;
            target.state = "SUCCESS";
            target.responseState = "SUCCESS";

            // Act
            var stored = target.getStored();

            // Assert
            Assert.Equal("SUCCESS", stored["state"]);
        }
    }

    [ Fixture ]
    function UpdateFromResponse() {
        var mockContext = Mocks.GetMock(Object.Global(), "$A", {
            getContext: function() { 
                return Test.Stubs.Aura.GetContext();
            },
            util : {
                isArray : function(v) { return false; },
                isObject : function(v) { return true; },
                apply : function(base, obj, force, deep) {
                    return {foo:"bar"};
                }
            }
        });

        [Fact]
        function ReturnValueCopied() {
            // Arrange
            var target = newAction();
            target.storable = true;
            var response = {};
            response.state = "SUCCESS";
            response.returnValue = {foo:"bar"};

            // Act
            mockContext(function() {
                target.updateFromResponse(response);
            });
            target.returnValue.foo = "baz";

            // Assert
            Assert.Equal({foo:"bar"}, target.returnValueUnmodified);
        }

        [Fact]
        function ReturnValueNotCopiedIfNotSuccessful() {
            // Arrange
            var target = newAction();
            target.storable = true;
            var response = {};
            response.state = "ERROR";
            response.error = [];
            response.returnValue = {foo:"bar"};

            // Act
            mockContext(function() {
                target.updateFromResponse(response);
            });
            target.returnValue.foo = "baz";

            // Assert
            Assert.Equal(undefined, target.returnValueUnmodified);
        }

        [Fact]
        function ReturnValueNotCopiedIfNotStorable() {
            // Arrange
            var target = newAction();
            var response = {};
            response.state = "SUCCESS";
            response.returnValue = {foo:"bar"};

            // Act
            mockContext(function() {
                target.updateFromResponse(response);
            });
            target.returnValue.foo = "baz";

            // Assert
            Assert.Equal(undefined, target.returnValueUnmodified);
        }
    }

    [ Fixture ]
    function FinishAction() {
        var mockContext = function(inloop) {
            return Mocks.GetMock(Object.Global(), "$A", {
                getContext : function() {
                    return Test.Stubs.Aura.GetContext();
                },
                clientService : {
                    inAuraLoop : function() {
                        return inloop;
                    }
                },
                warning : function() {
                },
                error : Stubs.GetMethod("msg", "error", null),
                showErrors: function() {},
                util: {
                    isUndefinedOrNull: function(obj) {
                        return obj === undefined || obj === null;
                    }
                }
            });
        };

        [Fact]
        function CallsActionCallbackIfCmpIsValid() {
            // Arrange
            var target = newAction();
            target.sanitizeStoredResponse = function() {
            };
            delete target.originalResponse;
            target.getState = function() {
                return "NOTERRORSTATE"
            };
            target.cmp = {
                isValid : function() {
                    return true;
                }
            };
            target.callbacks = {
                "NOTERRORSTATE" : {
                    "fn" : function() {
                        actual = true;
                    }
                }
            };
            target.getStorage = function() {
                return false;
            }
            target.getId = function() {
                return "1";
            }
            var actual = false;

            // Act
            mockContext(false)(function() {
                target.finishAction({
                    setCurrentAccess: function(){},
                    releaseCurrentAccess: function(){},
                    setCurrentAction: function () {},
                    joinComponentConfigs: function () {},
                    finishComponentConfigs: function () {}
                });
            });

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function CallsContextFinishComponentsWithStorageFalse() {
            var target = newAction();
            var expectedId = "9955";
            var context = {
                setCurrentAccess: function(){},
                releaseCurrentAccess: function(){},
                joinComponentConfigs : function() {},
                setCurrentAction : function() {}
            };
            context.finishComponentConfigs = Stubs.GetMethod("id", null);
            context.clearComponentConfigs = Stubs.GetMethod("id", null);
            target.components = [ {
                "creationPath" : "hi"
            } ];
            target.getStorage = function() {
                return false;
            };
            target.getId = function() {
                return expectedId;
            };

            mockContext(false)(function() {
                target.finishAction(context);
            });

            Assert.Equal([ {
                Arguments : {
                    "id" : expectedId
                },
                ReturnValue : null
            } ], context.finishComponentConfigs.Calls);
        }

        [Fact]
        function CallsClearComponentsWithStorageTrueAndNoCB() {
            var target = newAction();
            var expectedId = "9955";
            var context = {
                setCurrentAccess: function(){},
                releaseCurrentAccess: function(){},
                joinComponentConfigs : function() {},
                setCurrentAction : function() {}
            };
            context.finishComponentConfigs = Stubs.GetMethod("id", null);
            context.clearComponentConfigs = Stubs.GetMethod("id", null);
            target.components = [ {
                "creationPath" : "hi"
            } ];
            target.getStorage = function() {
                return true;
            };
            target.storable = true;
            target.getId = function() {
                return expectedId;
            };

            mockContext(false)(function() {
                target.finishAction(context);
            });

            Assert.Equal([ {
                Arguments : {
                    "id" : expectedId
                },
                ReturnValue : null
            } ], context.clearComponentConfigs.Calls);
        }

        [Fact]
        function CallsContextFinishComponentsWithCB() {
            var target = newAction();
            var expectedId = "9955";
            var context = {
                setCurrentAccess: function(){},
                releaseCurrentAccess: function(){},
                joinComponentConfigs : function() {},
                setCurrentAction : function() {}
            };
            context.finishComponentConfigs = Stubs.GetMethod("id", null);
            context.clearComponentConfigs = Stubs.GetMethod("id", null);
            target.components = [ {
                "creationPath" : "hi"
            } ];
            target.getStorage = function() {
                return false;
            };
            target.getState = function() {
                return "FAKESTATE";
            };
            target.getId = function() {
                return expectedId;
            };
            target.callbacks = {
                "FAKESTATE" : {
                    "fn" : function() {
                    }
                }
            };

            mockContext(false)(function() {
                target.finishAction(context);
            });

            Assert.Equal([ {
                Arguments : {
                    "id" : expectedId
                },
                ReturnValue : null
            } ], context.finishComponentConfigs.Calls);
        }
    }

    [ Fixture ]
    function SetAbortable() {

        var mock = Mocks.GetMock(Object.Global(), "$A", {
            util : {
                isUndefinedOrNull : function(obj) {
                    return obj === undefined || obj === null;
                }
            }
        });

        [Fact]
        function SetsAbortableToTrueByDefault() {
            // Arrange
            var target = newAction();
            var abortable;

            // Act
            mock(function() {
                target.setAbortable();
                abortable = target.isAbortable();
            });

            // Assert
            Assert.True(abortable);
        }
        [Fact]
        function IsAbortableReturnsAbortableProperty() {
            // Arrange
            var target = newAction();
            var abortable;

            // Act
            mock(function() {
                target.setAbortable();
                abortable = target.isAbortable();
            });

            // Assert
            Assert.Equal(true, target.abortable);
        }

        [Fact]
        function SetsAbortableToTrue() {
            // Arrange
            var target = newAction();
            var abortable;

            // Act
            mock(function() {
                target.setAbortable(true);
                abortable = target.isAbortable();
            });

            // Assert
            Assert.True(abortable);
        }

        [Fact]
        function SetsAbortableToFalse() {
            // Arrange
            var target = newAction();
            var abortable;

            // Act
            mock(function() {
                target.setAbortable(false);
                abortable = target.isAbortable();
            });

            // Assert
            Assert.False(abortable);
        }

        [Fact]
        function SetsAbortableToNull() {
            // Arrange
            var target = newAction();
            var abortable;

            // Act
            mock(function() {
                target.setAbortable(null);
                abortable = target.isAbortable();
            });

            // Assert
            Assert.True(abortable);
        }

        [Fact]
        function SetsAbortableToNumber() {
            // Arrange
            var target = newAction();
            var abortable;

            // Act
            mock(function() {
                target.setAbortable(1);
                abortable = target.isAbortable();
            });

            // Assert
            Assert.True(abortable);
        }

        [Fact]
        function SetsAbortableToString() {
            // Arrange
            var target = newAction();
            var abortable;

            // Act
            mock(function() {
                target.setAbortable("false");
                abortable = target.isAbortable();
            });

            // Assert
            Assert.True(abortable);
        }
    }

    [ Fixture ]
    function IsAbortable() {

        var mock = Mocks.GetMock(Object.Global(), "$A", {
            util : {
                isUndefinedOrNull : function(obj) {
                    return obj === undefined || obj === null;
                }
            }
        });

        [Fact]
        function ReturnsFalseByDefault() {
            // Arrange
            var target = newAction();
            var abortable;

            // Act
            mock(function() {
                abortable = target.isAbortable();
            });

            // Assert
            Assert.False(abortable);
        }

        [Fact]
        function ReturnsTrueIfSetToTrue() {
            // Arrange
            var target = newAction();
            target.abortable = true;
            var actual;

            // Act
            mock(function() {
                actual = target.isAbortable();
            });

            // Assert
            Assert.True(actual);
        }
    }

    [ Fixture ]
    function SetExclusive() {
        [Fact]
        function SetsExclusiveTrueIfParamUndefined() {
            // Arrange
            var target = newAction();

            // Act
            target.setExclusive(undefined);

            // Assert
            Assert.True(target.exclusive);
        }

        [Fact]
        function SetsExclusiveToParamIfDefined() {
            // Arrange
            var expected = "expected";
            var target = newAction();

            // Act
            target.setExclusive(expected);
            var actual = target.exclusive;

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function IsExclusive() {
        [Fact]
        function ReturnsExclusiveIfSet() {
            // Arrange
            var expected = "expected";
            var target = newAction();
            target.exclusive = expected;

            // Act
            var actual = target.isExclusive();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsFalseIfExclusiveNotSet() {
            // Arrange
            var target = newAction();
            target.exclusive = undefined;

            // Act
            var actual = target.isExclusive();

            // Assert
            Assert.False(actual);
        }
    }

    [ Fixture ]
    function SetStorable() {

        var mock = Mocks.GetMock(Object.Global(), "$A", {
            util : {
                isUndefinedOrNull : function(obj) {
                    return obj === undefined || obj === null;
                }
            },
            assert : function() {
            }
        });

        [Fact]
        function SetsStorableToTrue() {
            // Arrange
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert : function() {
                }
            });
            var target = newAction();
            target.def = {
                isServerAction : function() {
                }
            };
            target.setAbortable = target.getStorageKey = function() {
            };
            var actual;

            // Act
            mockAssert(function() {
                target.setStorable();
                actual = target.storable;
            })

            // Assert
            Assert.True(actual);
        }

        [Fact]
        function SetsStorableConfigToParam() {
            // Arrange
            var expected = "expected";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert : function() {
                }
            });
            var target = newAction();
            target.def = {
                isServerAction : function() {
                }
            };
            target.setAbortable = target.getStorageKey = function() {
            };
            var actual;

            // Act
            mockAssert(function() {
                target.setStorable(expected);
                actual = target.storableConfig;
            })

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function StorableErrorHandlerFromParam() {
            // Arrange
            var expected = function expected() {
            };

            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert : function() {
                }
            });
            var target = newAction();
            target.def = {
                isServerAction : function() {
                }
            };
            target.setAbortable = target.getStorageKey = function() {
            };
            var actual;

            // Act
            mockAssert(function() {
                target.setStorable({
                    errorHandler : expected
                });
                actual = target.getStorageErrorHandler();
            })

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function SetsStorableCallsSetAbortable() {
            // Arrange
            var expected = "expected";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert : function() {
                }
            });
            var target = newAction();
            target.def = {
                isServerAction : function() {
                }
            };
            target.setAbortable = function() {
                actual = expected;
            };
            target.getStorageKey = function() {
            };
            var actual = null;

            // Act
            mockAssert(function() {
                target.setStorable();
            })

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function AssertsDefIsServerAction() {
            // Arrange
            var expected = "expected";
            var expectedReturn = "expectedReturn";
            var mockAssert = Mocks.GetMock(Object.Global(), "$A", {
                assert : function(param) {
                    if (param === expectedReturn) {
                        actual = expected;
                    }
                }
            });
            var target = newAction();
            target.def = {
                isServerAction : function() {
                    return expectedReturn;
                }
            };
            target.setAbortable = target.getStorageKey = function() {
            };
            var actual = null;

            // Act
            mockAssert(function() {
                target.setStorable();
            })

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function IsStorable() {
        [Fact]
        function ReturnsFalseWhenIgnoreExistingFlagSet() {
            // Arrange
            var target = newAction();
            target.storableConfig = {
                ignoreExisting : true
            };
            target._isStorable = function() {
                return true;
            }

            // Act
            var ret = target.isStorable();

            // Assert
            Assert.False(ret);
        }

        [Fact]
        function ReturnsFalseWhen_IsStorableFalse() {
            // Arrange
            var target = newAction();
            target._isStorable = function() {
                return false;
            }

            // Act
            var ret = target.isStorable();

            // Assert
            Assert.False(ret);
        }

        [Fact]
        function ReturnsTrueWhen_IsStorableTrue() {
            // Arrange
            var target = newAction();
            target._isStorable = function() {
                return true;
            }

            // Act
            var ret = target.isStorable();

            // Assert
            Assert.True(ret);
        }
    }

    [ Fixture ]
    function _IsStorable() {
        [Fact]
        function ReturnsStorableIfSet() {
            // Arrange
            var expected = "expected";
            var target = newAction();
            target.storable = expected;

            // Act
            var actual = target._isStorable();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsFalseIfStorableNotSet() {
            // Arrange
            var target = newAction();
            target.storable = undefined;

            // Act
            var actual = target._isStorable();

            // Assert
            Assert.False(actual);
        }
    }

    [ Fixture ]
    function getStorageKey() {
        [Fact]
        function ReturnsKeyAsDescriptorAndEncodedParams() {
            // Arrange
            var expectedEncode = "encodedString";
            var expectedDescriptor = "expectedDescriptor";
            var expected = expectedDescriptor + ":" + expectedEncode;
            var actual=null;
            var mockContext = Mocks.GetMocks(Object.Global(), {
                "$A": {
                    util : {
                        json : {
                            encode : function() {
                                return expectedEncode;
                            },
                            orderedEncode: function(){
                                return expectedEncode;
                            }
                        }
                    },
                },
                "Action": Aura.Controller.Action
            });
            var target = newAction();
            target.params = undefined;
            target.def = {
                getDescriptor : function() {
                    return {
                        toString : function() {
                            return expectedDescriptor;
                        }
                    }
                }
            };

            // Act
            mockContext(function() {
                actual = target.getStorageKey();
            });

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function IsFromStorage() {
        var mockContext = Mocks.GetMock(Object.Global(), "$A", {
            util : {
                isUndefinedOrNull : function(storage) {
                    return storage === undefined || storage === null;
                }
            }
        });

        [Fact]
        function ReturnsTrueIfStorageSet() {
            var target = newAction();
            target.storage = {};
            var actual = null;

            mockContext(function() {
                actual = target.isFromStorage();
            });

            Assert.True(actual);
        }

        [Fact]
        function ReturnsFalseIfStorageNotSet() {
            var target = newAction();
            delete target.storage;
            var actual = null;

            mockContext(function() {
                actual = target.isFromStorage();
            });

            Assert.False(actual);
        }

        [Fact]
        function ReturnsFalseIfStorageNull() {
            var target = newAction();
            target.storage = null;
            var actual = null;

            mockContext(function() {
                actual = target.isFromStorage();
            });

            Assert.False(actual);
        }
    }

    [ Fixture ]
    function SetChained() {
        [Fact]
        function SetsChainedTrue() {
            // Arrange
            var target = newAction();
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                enqueueAction : function() {
                }
            });

            // Act
            mockContext(function() {
                target.setChained();
            })

            // Assert
            Assert.True(target.chained);
        }

        [Fact]
        function ChainsCurrentAction() {
            // Arrange
            var target = newAction();
            var mockContext = Mocks.GetMock(Object.Global(), "$A", {
                enqueueAction : function(param) {
                    actual = param;
                }
            });
            var actual = null;

            // Act
            mockContext(function() {
                target.setChained();
            })

            // Assert
            Assert.Equal(target, actual);
        }
    }

    [ Fixture ]
    function IsChained() {
        [Fact]
        function ReturnsChainedIfSet() {
            // Arrange
            var expected = "expected";
            var target = newAction();
            target.chained = expected;

            // Act
            var actual = target.isChained();

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ReturnsFalseIfStorableNotSet() {
            // Arrange
            var target = newAction();
            target.chained = undefined;

            // Act
            var actual = target.isChained();

            // Assert
            Assert.False(actual);
        }
    }

    [ Fixture ]
    function ToJSON() {
        [Fact]
        function ReturnsMapOfIdDescriptorAndParams() {
            // Arrange
            var expectedId = "expectedId";
            var expectedDescriptor = "expectedDescriptor";
            var expectedParams = "expectedParams";
            var expected = {
                "id" : expectedId,
                "descriptor" : expectedDescriptor,
                "params" : expectedParams,
                "callingDescriptor": "UNKNOWN",
                "version": null
            };
            var target = newAction();
            target.getId = function() {
                return expectedId;
            }
            target.params = expectedParams;
            target.def = {
                getDescriptor : function() {
                    return expectedDescriptor;
                }
            };

            // Act
            var actual = target.toJSON();

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function GetStorage() {
        [Fact]
        function ReturnsStorageServiceGetStorage() {
            // Arrange
            var target = newAction();
            var mockStorageService = Mocks.GetMocks(Object.Global(), {
                "$A": {
                    storageService : {
                        getStorage : function(param) {
                            return param === "actions";
                        }
                    }
                },
                "Action": Aura.Controller.Action
            });
            var actual = false;

            // Act
            mockStorageService(function() {
                actual = target.getStorage();
            })

            // Assert
            Assert.True(actual);
        }
    }

    [ Fixture ]
    function ParseAndFireEvent() {
        [Fact]
        function CallsClientServiceWhenEventNotFoundByDescriptor() {
            // Arrange
            var expected = "expected";
            var mockClientService = Mocks.GetMock(Object.Global(), "$A", {
                clientService : {
                    parseAndFireEvent : function() {
                        actual = expected;
                    }
                }
            });
            var target = newAction();
            target.getComponent = function() {
                return {
                    getEventByDescriptor : function() {
                        return null;
                    }
                }
            }
            var actual = null;

            // Act
            mockClientService(function() {
                target.parseAndFireEvent("");
            })

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function CallsClientServiceWithNullComponent() {
            // Arrange
            var expected = "expected";
            var mockClientService = Mocks.GetMock(Object.Global(), "$A", {
                clientService : {
                    parseAndFireEvent : function() {
                        actual = expected;
                    }
                }
            });
            var target = newAction();
            target.getComponent = function() {
                return undefined;
            }
            var actual = null;

            // Act
            mockClientService(function() {
                target.parseAndFireEvent("");
            })

            // Assert
            Assert.Equal(expected, actual);
        }

        [Fact]
        function FiresEventWhenEventFoundByDescriptor() {
            // Arrange
            var expected = "expected";
            var evt = {
                fire : function() {
                    actual = expected;
                }
            }
            var target = newAction();
            target.getComponent = function() {
                return {
                    getEventByDescriptor : function() {
                        return evt;
                    }
                }
            }
            var actual = null;

            // Act
            target.parseAndFireEvent("");

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function FireRefreshEvent() {
        [Fact]
        function FiresRefreshEventIfImplementsRefreshObserver() {
            // Arrange
            var expected = "expected";
            var target = newAction();
            target.cmp = {
                isValid : function() {
                    return true;
                },
                isInstanceOf : function(param) {
                    return param === "auraStorage:refreshObserver";
                },
                getEvent : function() {
                    return {
                        setParams : function() {
                            return {
                                fire : function() {
                                    actual = expected;
                                }
                            }
                        }
                    }
                }
            }
            var actual = null;

            // Act
            target.fireRefreshEvent("refreshBegin");

            // Assert
            Assert.Equal(expected, actual);
        }
    }

    [ Fixture ]
    function Abort() {
        var mockGlobal = Mocks.GetMocks(Object.Global(), {
            "$A" : {
                util : {
                    isUndefinedOrNull : function(obj) {
                        return obj === undefined || obj === null;
                    },
                    json : {
                        encode : function(val) {
                            return val;
                        },
                        orderedEncode: function(val) {
                            return val;
                        }
                    }
                },
                log : function() {
                }
            },
            "Action": Aura.Controller.Action
        });

        [Fact]
        function SetsStateToAborted() {
            var target = newAction();

            mockGlobal(function() {
                target.abort();
            });

            Assert.Equal("ABORTED", target.state);
        }

        [Fact]
        function CallsAbortedCallback() {
            var target = newAction();
            var actual = false;
            target.callbacks = {
                "ABORTED" : {
                    fn : function() {
                        actual = true;
                    },
                    ss : null
                }
            };

            mockGlobal(function() {
                target.abort();
            });

            Assert.Equal(actual, true);
        }
    }

    [ Fixture ]
    function setParentAction() {
        var mockContext = Mocks.GetMocks(Object.Global(), {
            "Action": Aura.Controller.Action,
            "$A" : {
                util : {
                    isUndefinedOrNull : function(obj) {
                        return obj === undefined || obj === null;
                    },
                    isUndefined: function(obj) {
                        return obj === undefined;
                    }
                }
            }
        });

        [Fact]
        function SetsParentAction() {
            var target = newAction();
            var parent = newAction();
            var expected = "EXPECTED";
            var actual;

            mockContext(function() {
                parent.setAbortable(true);
                parent.setAbortableId(expected);
                target.setParentAction(parent);
                actual = target.abortableId;
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ThrowsIfParentIsUndefined() {
            var target = newAction();
            var expected = "Action.setParentAction(): The provided parent action must be a valid abortable Action: undefined";
            var actual;

            mockContext(function() {
                actual = Record.Exception(function() {
                    target.setParentAction();
                })
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ThrowsIfParentIsNull() {
            var target = newAction();
            var expected = "Action.setParentAction(): The provided parent action must be a valid abortable Action: null";
            var actual;

            mockContext(function() {
                actual = Record.Exception(function() {
                    target.setParentAction(null);
                })
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ThrowsIfParentIsNotAnAction() {
            var target = newAction();
            var expected = "Action.setParentAction(): The provided parent action must be a valid abortable Action: [object Object]";
            var actual;

            mockContext(function() {
                actual = Record.Exception(function() {
                    target.setParentAction({});
                })
            });

            Assert.Equal(expected, actual);
        }

        [Fact]
        function ThrowsIfParentNotAbortable() {
            var target = newAction();
            var expected = "Action.setParentAction(): The provided parent action must be a valid abortable Action: [object Object]";
            var actual;

            mockContext(function() {
                target.abortableId = true;
                target.getStorageKey = function(){ return "PROVIDED" };

                actual = Record.Exception(function() {
                    target.setParentAction({
                        abortable : false
                    });
                })
            });
            Assert.Equal(expected, actual);
        }

        [Fact]
        function ThrowsIfParentNotEnqueued() {
            var target = newAction();
            target.abortableId = true;
            target.getStorageKey = function(){ return "PROVIDED" };
            var parent = newAction();
            parent.setAbortable(true);
            var expected = "Action.setParentAction(): The provided parent action must be enqueued: [object Object]";
            var actual;

            mockContext(function() {

                actual = Record.Exception(function() {
                    target.setParentAction(parent);
                })
            });
            Assert.Equal(expected, actual);
        }


        [Fact]
        function ThrowsIfParentAlreadySet() {
            var target = newAction();
            var parent = newAction();
            parent.setAbortable(true);
            parent.setAbortableId("value");
            var expected = "Action.setParentAction(): The abortable group is already set, call setParentAction before enqueueing : PROVIDED";
            var actual;

            mockContext(function() {
                target.abortableId = true;
                target.getStorageKey = function(){ return "PROVIDED" };

                actual = Record.Exception(function() {
                    target.setParentAction(parent);
                })
            });

            Assert.Equal(expected, actual);
        }
    }
}
