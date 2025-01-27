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
package org.auraframework.impl.expression.functions;

import static org.auraframework.impl.expression.functions.BooleanFunctions.AND;
import static org.auraframework.impl.expression.functions.BooleanFunctions.NOT;
import static org.auraframework.impl.expression.functions.BooleanFunctions.OR;
import static org.auraframework.impl.expression.functions.BooleanFunctions.TERNARY;
import static org.auraframework.impl.expression.functions.MathFunctions.ABSOLUTE;
import static org.auraframework.impl.expression.functions.MathFunctions.DIVIDE;
import static org.auraframework.impl.expression.functions.MathFunctions.MODULUS;
import static org.auraframework.impl.expression.functions.MathFunctions.MULTIPLY;
import static org.auraframework.impl.expression.functions.MathFunctions.NEGATE;
import static org.auraframework.impl.expression.functions.MathFunctions.SUBTRACT;
import static org.auraframework.impl.expression.functions.MultiFunctions.ADD;
import static org.auraframework.impl.expression.functions.MultiFunctions.EQUALS;
import static org.auraframework.impl.expression.functions.MultiFunctions.NOTEQUALS;
import static org.auraframework.impl.expression.functions.MultiFunctions.GREATER_THAN;
import static org.auraframework.impl.expression.functions.MultiFunctions.GREATER_THAN_OR_EQUAL;
import static org.auraframework.impl.expression.functions.MultiFunctions.LESS_THAN;
import static org.auraframework.impl.expression.functions.MultiFunctions.LESS_THAN_OR_EQUAL;
import static org.auraframework.impl.expression.functions.UtilFunctions.EMPTY;
import static org.auraframework.impl.expression.functions.UtilFunctions.FORMAT;

import java.util.Date;
import java.util.List;
import java.util.Map;

import org.auraframework.impl.expression.AuraImplExpressionTestCase;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * Basic tests of functions
 *
 */
public class FunctionsTest extends AuraImplExpressionTestCase {
    public FunctionsTest(String name) {
        super(name);
    }

    private Object evaluate(Function f, Object... args) {
        return f.evaluate(Lists.newArrayList(args));
    }

    /* ADD 
     * we try to make sure ADD() on java side give us the same output as add() on JS side
     * tests on js side are in expressionTest/functions.cmp
     * here every test function (more or less) is a equivalent to a test cmp (expressionTest:test) in function.cmp.
     * 'skip' in the comment means we cannot test the same thing on the other side
     * 'diff' means js side give us different output
     * just fyi: m.integer = 411; v.integer=7; v.double=3.1; v.doubleString="2.1"; v.string="Component"; v.list=[1,2,3]
              v.emptyString"="";  v.Infinity=Infinity; v.NegativeInfinity=-Infinity; v.NaN=NaN; v.object={};
    
    Note: Add has two keys : 'add' and 'concat', they are the same, that's why we have test like this on JS side
    <expressionTest:test expression="{!concat(4.1,v.integer)}" exprText="concat(4.1,v.integer)" expected="11.1"/>
    I don't see people using concat, why we have two anyway
   */

    //<expressionTest:test expression="{!m.date + 5}" exprText="m.date + 5" expected="'2004-09-23T16:30:00.000Z5'"/>
    //diff : on JS side we actually resolve the date, here we just output [object Object]
    public void testAddDateAndInt() throws Exception {
    	Date d = new Date(1095957000000L);
    	assertEquals("[object Object]5", evaluate(ADD, d, 5));
    }
    
    //<expressionTest:test expression="{!m.date + '8'}" exprText="m.date + '8'" expected="'2004-09-23T16:30:00.000Z8'"/>
    //diff : on JS side we actually resolve the date, here we just output [object Object]
    public void testAddDateAndString() throws Exception {
    	Date d = new Date(1095957000000L);
    	assertEquals("[object Object]8", evaluate(ADD, d, "8"));
    }
    
    //<expressionTest:test expression="{!3146431.43266 + 937.1652}" exprText="3146431.43266 + 937.1652" expected="3147368.59786"/>
    public void testAddTwoDoubles() throws Exception {
        assertEquals(3146431.43266 + 937.1652, evaluate(ADD, 3146431.43266, 937.1652));
    }

    //<expressionTest:test expression="{!'a' + 'x'}" exprText="'a' + 'x'" expected="'ax'"/>
    //<expressionTest:test expression="{!'3' + '3'}" exprText="'3' + '3'" expected="'33'"/>
    //<expressionTest:test expression="{!m.emptyString + '3'}" exprText="m.emptyString + '3'" expected="'3'"/>
    public void testAddTwoStrings() throws Exception {
        assertEquals("12", evaluate(ADD, "1", "2"));
    }

    //<expressionTest:test expression="{!add(m.integer, 2.0)}" exprText="add(m.integer, 2.0)" expected="413"/>
    public void testAddIntAndDouble() throws Exception {
        assertEquals(314 + 3146431.43266, evaluate(ADD, 314, 3146431.43266));
    }

    //<expressionTest:test expression="{!0 + 0}" exprText="0 + 0" expected="0"/>
    public void testAddTwoInts() throws Exception {
        assertEquals(235639, evaluate(ADD, 314, 235325));
    }

    //<expressionTest:test expression="{!1 + v.NaN}" exprText="1 + v.NaN" expected="NaN"/>
    public void testAddIntAndNaN() throws Exception {
        assertEquals(Double.NaN, evaluate(ADD, 314, Double.NaN));
    }

    //skip: we don't support Number.MAX_VALUE in markup
    public void testAddOverflow() throws Exception {
        assertEquals(Double.MAX_VALUE, evaluate(ADD, Double.MAX_VALUE, 2.0));
    }

    //<expressionTest:test expression="{!'a' + v.double}" exprText="'a' + v.double" expected="'a3.1'"/>
    public void testAddStringAndDouble() throws Exception {
        assertEquals("0937.1652", evaluate(ADD, "0", 937.1652));
    }

    //<expressionTest:test expression="{!0 + 'x'}" exprText="0 + 'x'" expected="'0x'"/>
    public void testAddZeroAndString() throws Exception {
        assertEquals("01", evaluate(ADD, 0, "1"));
    }

    //<expressionTest:test expression="{!3 + ''}" exprText="3 + ''" expected="'3'"/>
    public void testAddIntAndEmptyString() throws Exception {
        assertEquals("314", evaluate(ADD, 314, ""));
    }

    //<expressionTest:test expression="{!'' + 3}" exprText="3 + ''" expected="'3'"/>
    public void testAddEmptyStringAndInt() throws Exception {
        assertEquals("314", evaluate(ADD, "", 314));
    }
    
    //<expressionTest:test expression="{!v.Infinity + 2}" exprText="v.Infinity + 2" expected="Infinity"/>
    public void testAddInfinityAndInt() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(ADD, Double.POSITIVE_INFINITY, 235325));
        assertEquals(Double.POSITIVE_INFINITY, evaluate(ADD, Float.POSITIVE_INFINITY, 235325));
    }

   //<expressionTest:test expression="{!v.Infinity + v.NegativeInfinity}" exprText="v.Infinity + v.NegativeInfinity" expected="NaN"/>
    public void testAddInfinityAndNegativeInfinity() throws Exception {
        assertEquals(Double.NaN, evaluate(ADD, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY));
        assertEquals(Double.NaN, evaluate(ADD, Float.POSITIVE_INFINITY, Float.NEGATIVE_INFINITY));
    }

    //<expressionTest:test expression="{!v.Infinity + 'AndBeyond'}" exprText="v.Infinity + 'AndBeyond'" expected="'InfinityAndBeyond'"/>
    public void testAddInfinityAndString() throws Exception {
        assertEquals("InfinityAndBeyond", evaluate(ADD, Double.POSITIVE_INFINITY, "AndBeyond"));
    }

    //<expressionTest:test expression="{!'To' + v.NegativeInfinity}" exprText="'To' + v.NegativeInfinity" expected="'To-Infinity'"/>
    public void testAddStringAndNegativeInfinity() throws Exception {
        assertEquals("Random-Infinity", evaluate(ADD, "Random", Double.NEGATIVE_INFINITY));
    }

    
    //<expressionTest:test expression="{!'100' + v.NaN}" exprText="'100' + v.NaN" expected="'100NaN'"/>
    public void testAddStringAndNaN() throws Exception {
        assertEquals("1NaN", evaluate(ADD, "1", Double.NaN));
    }

    //<expressionTest:test expression="{!v.nullObj + 1}" exprText="v.nullObj + 1" expected="1"/>
    public void testAddNullAndInt() throws Exception {
        assertEquals(1, evaluate(ADD, null, 1));
    }

    //diff: <expressionTest:test expression="{!v.nullObj + 'b'}" exprText="v.nullObj + 'b'" expected="'b'"/>
    public void testAddNullAndString() throws Exception {
        assertEquals("nullb", evaluate(ADD, null, "b"));
    }
    
    //diff: <expressionTest:test expression="{!'b' + !v.nullObj}" exprText="'b' + v.nullObj" expected="'b'"/>
    public void testAddStringAndNull() throws Exception {
        assertEquals("cnull", evaluate(ADD, "c", null));
    }

    //<expressionTest:test expression="{!v.nullObj + 2.5}" exprText="v.nullObj + 2.5" expected="2.5"/>
    public void testAddNullAndDouble() throws Exception {
        assertEquals(2.5, evaluate(ADD, null, 2.5));
    }

    //diff: <expressionTest:test expression="{!v.nullObj + v.nullObj}" exprText="v.nullObj + v.nullObj" expected="''"/>
    public void testAddTwoNulls() throws Exception {
        assertEquals(0, evaluate(ADD, null, null));
    }

    //diff: <expressionTest:test expression="{!'' + (-0.0)}" exprText="'' + (-0.0)" expected="'0'"/>
    public void testAddStringAndNegativeZero() throws Exception {
    	assertEquals("-0", evaluate(ADD, "", -0.0));
    }

    //<expressionTest:test expression="{!v.nullList + 'a'}" exprText="v.nullObj + 'a'" expected="'a'"/>
    public void testAddListNullAndString() throws Exception {
        List<Object> nullList = Lists.newArrayList();
        nullList.add(null);
        assertEquals("a", evaluate(ADD, nullList, "a"));
    }

    //<expressionTest:test expression="{!v.list + 'a'}" exprText="v.list + 'a'" expected="'1,2,3a'"/>
    public void testAddList123AndString() throws Exception {
        assertEquals("1,2,3a", evaluate(ADD, Lists.newArrayList(1, 2, 3), "a"));
    }

    //<expressionTest:test expression="{!v.listWithNull + ''}" exprText="v.listWithNull + ''" expected="',a'"/>
    public void testAddListNullStringAndEmptyString() throws Exception {
        List<Object> list = Lists.newArrayList();
        list.add(null);
        list.add("a");
        assertEquals(",a", evaluate(ADD, list, ""));
    }

    //diff: <expressionTest:test expression="{!v.listWithList + ''}" exprText="v.listWithList + ''" expected="'a,,b,c'"/>
    public void testAddNestedListNullStringAndEmptyString() throws Exception {
        List<Object> list = Lists.newArrayList();
        List<Object> nested = Lists.newArrayList();
        list.add("a");
        list.add(nested);
        nested.add("b");
        nested.add("c");
        assertEquals("a,b,c", evaluate(ADD, list, ""));
    }

    //diff: <expressionTest:test expression="{!v.listWithNested4Layers + ''}" exprText="v.listWithNested4Layers + ''" expected="'6,7,4,5,2,3,0,1,b'"/>
    public void testAddTooDeep() throws Exception {
        List<Object> list = Lists.newArrayList();
        List<Object> nested = Lists.newArrayList();
        List<Object> nested2 = Lists.newArrayList();
        List<Object> nested3 = Lists.newArrayList();
        List<Object> nested4 = Lists.newArrayList();
        list.add("a");
        list.add(nested);
        nested.add(nested2);
        nested2.add(nested3);
        nested3.add(nested4);
        nested4.add("d");
        nested.add("b");
        nested.add("c");
        assertEquals("a,Too Deep,b,c", evaluate(ADD, list, ""));
    }

    //diff: <expressionTest:test expression="{!v.listWithLoop + ''}" exprText="v.listWithLoop + ''" expected="'0,1,'"/>
    public void testAddLoop() throws Exception {
        List<Object> list = Lists.newArrayList();
        List<Object> nested = Lists.newArrayList();
        list.add("a");
        list.add(nested);
        nested.add(list);
        assertEquals("a,a,Too Deep", evaluate(ADD, list, ""));
    }

    //<expressionTest:test expression="{!v.map + ''}" exprText="v.map + ''" expected="'[object Object]'"/>
    public void testAddMapAndEmptyString() throws Exception {
        Map<Object,Object> map = Maps.newHashMap();
        map.put("a", null);
        map.put("b", "c");
        assertEquals("[object Object]", evaluate(ADD, map, ""));
    }

    // EQUALS

    public void testEqualsSameIntAndDouble() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, 2, 2.0));
    }

    public void testEqualsSameString() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, "bum", "bum"));
    }

    public void testEqualsStringsDifferentCapitalization() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, "Bum", "bum"));
    }

    public void testEqualsDifferentInts() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, 1, 3));
    }

    public void testEqualsDifferentBooleans() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, Boolean.TRUE, Boolean.FALSE));
    }

    public void testEqualsSameBooleans() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, Boolean.FALSE, Boolean.FALSE));
    }

    public void testEqualsEmptyStringAndFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, "", Boolean.FALSE));
    }

    public void testEqualsPositiveInfinity() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
        assertEquals(Boolean.TRUE, evaluate(EQUALS, Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY));
    }

    public void testEqualsNegativeInfinity() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, Double.NEGATIVE_INFINITY, Double.NEGATIVE_INFINITY));
        assertEquals(Boolean.TRUE, evaluate(EQUALS, Float.NEGATIVE_INFINITY, Float.NEGATIVE_INFINITY));
    }

    public void testEqualsPositiveAndNegativeInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY));
        assertEquals(Boolean.FALSE, evaluate(EQUALS, Float.POSITIVE_INFINITY, Float.NEGATIVE_INFINITY));
    }

    public void testEqualsDoubleInfinityAndFloatInfinity() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, Double.POSITIVE_INFINITY, Float.POSITIVE_INFINITY));
    }

    public void testEqualsNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, Double.NaN, Double.NaN));
    }

    public void testEqualsStringNullAndNull() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, "null", null));
    }

    public void testEqualsNullAndBooleanTrue() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, null, Boolean.TRUE));
    }

    public void testEqualsNullAndBooleanFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, null, Boolean.FALSE));
    }

    public void testEqualsNullAndEmptyString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, null, ""));
    }

    public void testEqualsNullAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, null, 0));
    }

    public void testEqualsNullAndNull() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EQUALS, null, null));
    }

    public void testEqualsNullAndStringNull() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EQUALS, null, "null"));
    }

    // NOTEQUALS

    public void testNotEqualsDifferentBooleans() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOTEQUALS, Boolean.FALSE, Boolean.TRUE));
    }

    public void testNotEqualsSameBoolean() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOTEQUALS, Boolean.FALSE, Boolean.FALSE));
    }

    public void testNotEqualsZeroAndStringZero() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOTEQUALS, 0, "0"));
    }

    public void testNotEqualsZeroAndBoolean() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOTEQUALS, 0, Boolean.FALSE));
    }

    public void testNotEqualsTwoNaNs() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOTEQUALS, Double.NaN, Double.NaN));
    }

    public void testNotEqualsTwoNulls() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOTEQUALS, null, null));
    }

    // TERNARY

    public void testTernaryTrueReturnString() throws Exception {
        assertEquals("1", evaluate(TERNARY, Boolean.TRUE, "1", "2"));
    }

    public void testTernaryFalseReturnString() throws Exception {
        assertEquals("2", evaluate(TERNARY, Boolean.FALSE, "1", "2"));
    }

    public void testTernaryTrueReturnNull() throws Exception {
        assertEquals(null, evaluate(TERNARY, Boolean.TRUE, null, "2"));
    }

    public void testTernaryFalseReturnNull() throws Exception {
        assertEquals(null, evaluate(TERNARY, Boolean.FALSE, "1", null));
    }

    public void testTernaryNull() throws Exception {
        assertEquals("2", evaluate(TERNARY, null, "1", "2"));
    }

    public void testTernaryStringTrue() throws Exception {
        assertEquals("1", evaluate(TERNARY, "true", "1", "2"));
    }

    public void testTernaryZero() throws Exception {
        assertEquals("2", evaluate(TERNARY, 0, "1", "2"));
    }

    public void testTernaryDouble() throws Exception {
        assertEquals("1", evaluate(TERNARY, 3146431.43266, "1", "2"));
    }

    public void testTernaryStringZero() throws Exception {
        assertEquals("1", evaluate(TERNARY, "0", "1", "2"));
    }

    public void testTernaryStringFalse() throws Exception {
        assertEquals("1", evaluate(TERNARY, "false", "1", "2"));
    }

    public void testTernaryEmptyString() throws Exception {
        assertEquals("2", evaluate(TERNARY, "", "1", "2"));
    }

    public void testTernaryNaN() throws Exception {
        assertEquals("2", evaluate(TERNARY, Double.NaN, "1", "2"));
    }

    // SUBTRACT

    public void testSubtractDoubleAndNegativeDouble() throws Exception {
        assertEquals(937.1652 - -8426.6, evaluate(SUBTRACT, 937.1652, -8426.6));
    }

    public void testSubtractPositiveInfinity() throws Exception {
        assertEquals(Double.NaN, evaluate(SUBTRACT, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
        assertEquals(Double.NaN, evaluate(SUBTRACT, Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY));
    }

    public void testSubtractIntAndStringInt() throws Exception {
        assertEquals(0.0, evaluate(SUBTRACT, 1, "1"));
    }

    public void testSubtractIntAndDouble() throws Exception {
        assertEquals(0.0, evaluate(SUBTRACT, 2, 2.0));
    }

    public void testSubtractInfinityAndInt() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(SUBTRACT, Double.POSITIVE_INFINITY, 2));
    }

    public void testSubtractIntAndInfinity() throws Exception {
        assertEquals(Double.NEGATIVE_INFINITY, evaluate(SUBTRACT, 3, Double.POSITIVE_INFINITY));
    }

    public void testSubtractIntAndNaN() throws Exception {
        assertEquals(Double.NaN, evaluate(SUBTRACT, 3, Double.NaN));
    }

    public void testSubtractIntAndString() throws Exception {
        assertEquals(Double.NaN, evaluate(SUBTRACT, 3, "5c"));
    }

    public void testSubtractIntAndEmptyString() throws Exception {
        assertEquals(3.0, evaluate(SUBTRACT, 3, ""));
    }

    public void testSubtractStringAndInt() throws Exception {
        assertEquals(Double.NaN, evaluate(SUBTRACT, "5c", 3));
    }

    public void testSubtractEmptyStringAndInt() throws Exception {
        assertEquals(-3.0, evaluate(SUBTRACT, "", 3));
    }

    public void testSubtractTwoEmptyStrings() throws Exception {
        assertEquals(0.0, evaluate(SUBTRACT, "", ""));
    }

    public void testSubtractStringIntAndInt() throws Exception {
        assertEquals(3.0, evaluate(SUBTRACT, "4", 1));
    }

    public void testSubtractTwoStringInts() throws Exception {
        assertEquals(-2.0, evaluate(SUBTRACT, "3", "5"));
    }

    public void testSubtractIntAndNull() throws Exception {
        assertEquals(2.0, evaluate(SUBTRACT, 2, null));
    }

    public void testSubtractNullAndDouble() throws Exception {
        assertEquals(-3.1, evaluate(SUBTRACT, null, 3.1));
    }

    public void testSubtractTwoNulls() throws Exception {
        assertEquals(0.0, evaluate(SUBTRACT, null, null));
    }

    // MULTIPLY

    public void testMultiplyIntAndDouble() throws Exception {
        assertEquals(1.1, evaluate(MULTIPLY, 1, 1.1));
    }

    public void testMultiplyZeroAndInt() throws Exception {
        assertEquals(0.0, evaluate(MULTIPLY, 0, 3));
    }

    public void testMultiplyNegativeIntAndNegativeDouble() throws Exception {
        assertEquals(0.2, evaluate(MULTIPLY, -2, -0.1));
    }

    public void testMultiplyToGetToInfinity() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(MULTIPLY, 1e200, 1e200));
    }

    public void testMultiplyToGetToNegativeInfinity() throws Exception {
        assertEquals(Double.NEGATIVE_INFINITY, evaluate(MULTIPLY, -1e200, 1e200));
    }

    public void testMultiplyPositiveInfinity() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(MULTIPLY, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
    }

    public void testMultiplyZeroAndInfinity() throws Exception {
        assertEquals(Double.NaN, evaluate(MULTIPLY, 0, Double.POSITIVE_INFINITY));
    }

    public void testMultiplyIntAndNaN() throws Exception {
        assertEquals(Double.NaN, evaluate(MULTIPLY, 1, Double.NaN));
    }

    public void testMultiplyIntAndString() throws Exception {
        assertEquals(Double.NaN, evaluate(MULTIPLY, 5, "5o"));
    }

    public void testMultiplyStringAndInt() throws Exception {
        assertEquals(Double.NaN, evaluate(MULTIPLY, "5o", 9));
    }

    public void testMultiplyTwoStrings() throws Exception {
        assertEquals(Double.NaN, evaluate(MULTIPLY, "5o", "5o"));
    }

    public void testMultiplyIntAndStringDouble() throws Exception {
        assertEquals(2.2, evaluate(MULTIPLY, 2, "1.1"));
    }

    public void testMultiplyStringIntAndStringDouble() throws Exception {
        assertEquals(21.7, evaluate(MULTIPLY, "7", "3.1"));
    }

    public void testMultiplyIntAndNull() throws Exception {
        assertEquals(0.0, evaluate(MULTIPLY, 3, null));
    }

    public void testMultiplyNullAndNegativeDouble() throws Exception {
        assertEquals(-0.0, evaluate(MULTIPLY, null, -0.1));
    }

    public void testMultiplyTwoNulls() throws Exception {
        assertEquals(0.0, evaluate(MULTIPLY, null, null));
    }

    // DIVIDE

    public void testDivideDoubleAndNegativeDouble() throws Exception {
        assertEquals(3146431.43266 / -8426.6, evaluate(DIVIDE, 3146431.43266, -8426.6));
    }

    public void testDivideTwoInts() throws Exception {
        assertEquals(1.5, evaluate(DIVIDE, 3, 2));
    }

    public void testDivideTwoZeros() throws Exception {
        assertEquals(Double.NaN, evaluate(DIVIDE, 0, 0));
    }

    public void testDivideIntAndZero() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(DIVIDE, 5, 0));
    }

    public void testDivideNegativeIntAndZero() throws Exception {
        assertEquals(Double.NEGATIVE_INFINITY, evaluate(DIVIDE, -5, 0));
    }

    public void testDivideTwoInfinity() throws Exception {
        assertEquals(Double.NaN, evaluate(DIVIDE, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
    }

    public void testDivideIntAndNaN() throws Exception {
        assertEquals(Double.NaN, evaluate(DIVIDE, 1, Double.NaN));
    }

    public void testDivideStringAndInt() throws Exception {
        assertEquals(Double.NaN, evaluate(DIVIDE, "5o", 3));
    }

    public void testDivideIntAndString() throws Exception {
        assertEquals(Double.NaN, evaluate(DIVIDE, 3, "5o"));
    }

    public void testDivideTwoStringDoubles() throws Exception {
        assertEquals(5.0, evaluate(DIVIDE, "5.5", "1.1"));
    }

    public void testDivideIntByNegativeZeroString() throws Exception {
        assertEquals(Double.NEGATIVE_INFINITY, evaluate(DIVIDE, 1, "-0"));
    }

    public void testDivideIntAndInfinity() throws Exception {
        assertEquals(-0.0, evaluate(DIVIDE, 5, Double.NEGATIVE_INFINITY));
    }

    public void testDivideIntAndNull() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(DIVIDE, 3, null));
    }

    public void testDivideNullAndInt() throws Exception {
        assertEquals(0.0, evaluate(DIVIDE, null, 3));
    }

    public void testDivideTwoNulls() throws Exception {
        assertEquals(Double.NaN, evaluate(DIVIDE, null, null));
    }

    // MODULUS

    public void testModulusDoubleAndNegativeDouble() throws Exception {
        assertEquals(3146431.43266 % -8426.6, evaluate(MODULUS, 3146431.43266, -8426.6));
    }

    public void testModulusIntAndZero() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, 3, 0));
    }

    public void testModulusZeroAndInt() throws Exception {
        assertEquals(0.0, evaluate(MODULUS, 0, 3));
    }

    public void testModulusTwoZeros() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, 0, 0));
    }

    public void testModulusIntAndInfinity() throws Exception {
        assertEquals(3.0, evaluate(MODULUS, 3, Double.POSITIVE_INFINITY));
    }

    public void testModulusInfinityAndInt() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, Double.POSITIVE_INFINITY, 3));
    }

    public void testModulusIntAndNaN() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, 1, Double.NaN));
    }

    public void testModulusIntAndString() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, 3, "5o"));
    }

    public void testModulusTwoStrings() throws Exception {
        assertEquals(3.0, evaluate(MODULUS, "23", "4"));
    }

    public void testModulusIntAndNull() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, 3, null));
    }

    public void testModulusNullAndInt() throws Exception {
        assertEquals(0.0, evaluate(MODULUS, null, 3));
    }

    public void testModulusTwoNulls() throws Exception {
        assertEquals(Double.NaN, evaluate(MODULUS, null, null));
    }

    // ABSOLUTE

    public void testAbsoluteValueDouble() throws Exception {
        assertEquals(Math.abs(3146431.43266), evaluate(ABSOLUTE, 3146431.43266));
    }

    public void testAbsoluteValueNegativeDouble() throws Exception {
        assertEquals(Math.abs(-8426.6), evaluate(ABSOLUTE, -8426.6));
    }

    public void testAbsoluteValueNegativeInfinity() throws Exception {
        assertEquals(Double.POSITIVE_INFINITY, evaluate(ABSOLUTE, Double.NEGATIVE_INFINITY));
    }

    public void testAbsoluteValueNaN() throws Exception {
        assertEquals(Double.NaN, evaluate(ABSOLUTE, Double.NaN));
    }

    public void testAbsoluteValueNegativeIntString() throws Exception {
        assertEquals(5.0, evaluate(ABSOLUTE, "-5"));
    }

    public void testAbsoluteValueString() throws Exception {
        assertEquals(Double.NaN, evaluate(ABSOLUTE, "-5o"));
    }

    public void testAbsoluteValueEmptyString() throws Exception {
        assertEquals(0.0, evaluate(ABSOLUTE, ""));
    }

    public void testAbsoluteValueNull() throws Exception {
        assertEquals(0.0, evaluate(ABSOLUTE, (Object) null));
    }

    // NEGATE

    public void testNegatePositiveDouble() throws Exception {
        assertEquals(-3146431.43266, evaluate(NEGATE, 3146431.43266));
    }

    public void testNegateNegativeDouble() throws Exception {
        assertEquals(8426.6, evaluate(NEGATE, -8426.6));
    }

    public void testNegateInfinity() throws Exception {
        assertEquals(Double.NEGATIVE_INFINITY, evaluate(NEGATE, Double.POSITIVE_INFINITY));
    }

    public void testNegateNaN() throws Exception {
        assertEquals(Double.NaN, evaluate(NEGATE, Double.NaN));
    }

    public void testNegateString() throws Exception {
        assertEquals(Double.NaN, evaluate(NEGATE, "5o"));
    }

    public void testNegateStringInt() throws Exception {
        assertEquals(-5.0, evaluate(NEGATE, "5"));
    }

    public void testNegateStringEmptyString() throws Exception {
        assertEquals(-0.0, evaluate(NEGATE, ""));
    }

    public void testNegateStringNull() throws Exception {
        assertEquals(-0.0, evaluate(NEGATE, (Object) null));
    }

    // GREATER_THAN

    public void testGreaterThanTwoDoubles() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, 3146431.43266, 937.1652));
    }

    public void testGreaterThanSameDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, 3146431.43266, 3146431.43266));
    }

    public void testGreaterThanNegativeDoubleAndDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, -8426.6, 937.1652));
    }

    public void testGreaterThanInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
    }

    public void testGreaterThanPositiveInfinityAndNegativeInfinity() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY));
    }

    public void testGreaterThanZeroAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, 0, Double.NaN));
    }

    public void testGreaterThanInfinityAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, Double.POSITIVE_INFINITY, Double.NaN));
    }

    public void testGreaterThanNaNAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, Double.NaN, 0));
    }

    public void testGreaterThanNaNAndInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, Double.NaN, Double.POSITIVE_INFINITY));
    }

    public void testGreaterThanIntAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, 9000, "5o"));
    }

    public void testGreaterThanStringAndInt() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, "5o", 4));
    }

    public void testGreaterThanTwoStrings() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, "5o", "4o"));
    }

    public void testGreaterThanTwoStringInts() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, "5", "3.9"));
    }

    public void testGreaterThanTwoStringsDifferentCapitalization() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, "5A", "5a"));
    }

    public void testGreaterThanZeroAndEmptyString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, 0, ""));
    }

    public void testGreaterThanStringAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, "zz", Double.NaN));
    }

    public void testGreaterThanNaNAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, Double.NaN, "5o"));
    }

    public void testGreaterThanBooleanTrueAndBooleanFalse() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, Boolean.TRUE, Boolean.FALSE));
    }

    public void testGreaterThanBooleanTrueAndZero() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, Boolean.TRUE, 0));
    }

    public void testGreaterThanBooleanTrueAndInt() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, Boolean.TRUE, 1));
    }

    public void testGreaterThanIntAndNull() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN, 1, null));
    }

    public void testGreaterThanNullAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, null, 0));
    }

    public void testGreaterThanTwoNulls() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN, null, null));
    }

    // GREATER_THAN_OR_EQUAL

    public void testGreaterThanOrEqualTwoDoubles() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, 3146431.43266, 937.1652));
    }

    public void testGreaterThanOrEqualSameDouble() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, 937.1652, 937.1652));
    }

    public void testGreaterThanOrEqualNegativeDoubleAndPositiveDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, -8426.6, 937.1652));
    }

    public void testGreaterThanOrEqualInfinity() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
    }

    public void testGreaterThanOrEqualPositiveInfintyAndNegativeInfinity() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY));
    }

    public void testGreaterThanOrEqualZeroAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, 0, Double.NaN));
    }

    public void testGreaterThanOrEqualInfinityAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, Double.POSITIVE_INFINITY, Double.NaN));
    }

    public void testGreaterThanOrEqualNaNAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, Double.NaN, 0));
    }

    public void testGreaterThanOrEqualNaNAndInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, Double.NaN, Double.POSITIVE_INFINITY));
    }

    public void testGreaterThanOrEqualIntAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, 9000, "5o"));
    }

    public void testGreaterThanOrEqualStringAndInt() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, "5o", 4));
    }

    public void testGreaterThanOrEqualTwoStrings() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, "5o", "4o"));
    }

    public void testGreaterThanOrEqualStringIntAndStringDouble() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, "5", "3.9"));
    }

    public void testGreaterThanOrEqualTwoStringsDifferentCapitalization() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, "5A", "5a"));
    }

    public void testGreaterThanOrEqualZeroAndEmptyString() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, 0, ""));
    }

    public void testGreaterThanOrEqualStringAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, "zz", Double.NaN));
    }

    public void testGreaterThanOrEqualNaNAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(GREATER_THAN_OR_EQUAL, Double.NaN, "5o"));
    }

    public void testGreaterThanOrEqualBooleanTrueAndBooleanFalse() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, Boolean.TRUE, Boolean.FALSE));
    }

    public void testGreaterThanOrEqualBooleanTrueAndZero() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, Boolean.TRUE, 0));
    }

    public void testGreaterThanOrEqualBooleanTrueAndInt() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, Boolean.TRUE, 1));
    }

    public void testGreaterThanOrEqualIntAndNull() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, 1, null));
    }

    public void testGreaterThanOrEqualNullAndZero() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, null, 0));
    }

    public void testGreaterThanOrEqualNullAndNull() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(GREATER_THAN_OR_EQUAL, null, null));
    }

    // LESS_THAN

    public void testLessThanTwoDoubles() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, 3146431.43266, 937.1652));
    }

    public void testLessThanSameDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, -8426.6, -8426.6));
    }

    public void testLessThanNegativeDoubleAndPositiveDouble() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN, -8426.6, 937.1652));
    }

    public void testLessThanInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
    }

    public void testLessThanPositiveInfinityAndNegativeInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY));
    }

    public void testLessThanZeroAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, 0, Double.NaN));
    }

    public void testLessThanInfinityAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Double.POSITIVE_INFINITY, Double.NaN));
    }

    public void testLessThanNaNAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Double.NaN, 0));
    }

    public void testLessThanNaNAndInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Double.NaN, Double.POSITIVE_INFINITY));
    }

    public void testLessThanIntAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, 9000, "5o"));
    }

    public void testLessThanStringAndInt() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, "5o", 4));
    }

    public void testLessThanTwoStrings() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, "5o", "4o"));
    }

    public void testLessThanStringIntAndStringDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, "5", "3.9"));
    }

    public void testLessThanTwoStringsDifferentCapitalization() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN, "5A", "5a"));
    }

    public void testLessThanZeroAndEmptyString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, 0, ""));
    }

    public void testLessThanStringAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, "zz", Double.NaN));
    }

    public void testLessThanNaNAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Double.NaN, "5o"));
    }

    public void testLessThanBooleanTrueAndBooleanFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Boolean.TRUE, Boolean.FALSE));
    }

    public void testLessThanBooleanTrueAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Boolean.TRUE, 0));
    }

    public void testLessThanBooleanTrueAndInt() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, Boolean.TRUE, 1));
    }

    public void testLessThanZeroAndNull() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, 0, null));
    }

    public void testLessThanNullAndInt() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN, null, 1));
    }

    public void testLessThanTwoNulls() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN, null, null));
    }

    // LESS_THAN_OR_EQUAL

    public void testLessThanOrEqualTwoDoubles() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, 3146431.43266, 937.1652));
    }

    public void testLessThanOrEqualSameDouble() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, -8426.6, -8426.6));
    }

    public void testLessThanOrEqualNegativeDoubleAndPositiveDouble() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, -8426.6, 937.1652));
    }

    public void testLessThanOrEqualInfinity() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, Double.POSITIVE_INFINITY, Double.POSITIVE_INFINITY));
    }

    public void testLessThanOrEqualPositiveInfinityAndNegativeInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY));
    }

    public void testLessThanOrEqualZeroAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, 0, Double.NaN));
    }

    public void testLessThanOrEqualInfinityAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, Double.POSITIVE_INFINITY, Double.NaN));
    }

    public void testLessThanOrEqualNaNAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, Double.NaN, 0));
    }

    public void testLessThanOrEqualNaNAndInfinity() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, Double.NaN, Double.POSITIVE_INFINITY));
    }

    public void testLessThanOrEqualIntAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, 9000, "5o"));
    }

    public void testLessThanOrEqualStringAndInt() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, "5o", 4));
    }

    public void testLessThanOrEqualTwoStrings() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, "5o", "4o"));
    }

    public void testLessThanOrEqualStringIntAndStringDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, "5", "3.9"));
    }

    public void testLessThanOrEqualTwoStringsDifferentCapitalization() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, "5A", "5a"));
    }

    public void testLessThanOrEqualZeroAndEmptyString() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, 0, ""));
    }

    public void testLessThanOrEqualStringAndNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, "zz", Double.NaN));
    }

    public void testLessThanOrEqualNaNAndString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, Double.NaN, "5o"));
    }

    public void testLessThanOrEqualBooleanTrueAndBooleanFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, Boolean.TRUE, Boolean.FALSE));
    }

    public void testLessThanOrEqualBooleanTrueAndZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, Boolean.TRUE, 0));
    }

    public void testLessThanOrEqualBooleanTrueAndInt() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, Boolean.TRUE, 1));
    }

    public void testLessThanOrEqualIntAndNull() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(LESS_THAN_OR_EQUAL, 1, null));
    }

    public void testLessThanOrEqualNullAndZero() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, null, 0));
    }

    public void testLessThanOrEqualTwoNulls() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(LESS_THAN_OR_EQUAL, null, null));
    }

    // AND

    public void testAndBooleanTrueAndBooleanFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(AND, Boolean.TRUE, Boolean.FALSE));
    }

    public void testAndTwoBooleanTrue() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(AND, Boolean.TRUE, Boolean.TRUE));
    }

    public void testAndBooleanTrueAndNull() throws Exception {
        assertEquals(null, evaluate(AND, Boolean.TRUE, null));
    }

    public void testAndNullAndBooleanTrue() throws Exception {
        assertEquals(null, evaluate(AND, null, Boolean.TRUE));
    }

    public void testAndTwoNulls() throws Exception {
        assertEquals(null, evaluate(AND, null, null));
    }

    public void testAndTwoInts() throws Exception {
        assertEquals(235325, evaluate(AND, 314, 235325));
    }

    public void testAndZeroAndInt() throws Exception {
        assertEquals(0, evaluate(AND, 0, 314));
    }

    public void testAndStringZeroAndInt() throws Exception {
        assertEquals(314, evaluate(AND, "0", 314));
    }

    public void testAndStringFalseAndInt() throws Exception {
        assertEquals(314, evaluate(AND, "false", 314));
    }

    public void testAndEmptyStringAndInt() throws Exception {
        assertEquals("", evaluate(AND, "", 314));
    }

    public void testAndNaNAndInt() throws Exception {
        assertEquals(Double.NaN, evaluate(AND, Double.NaN, 314));
    }

    public void testAndIntAndEmptyString() throws Exception {
        assertEquals("", evaluate(AND, 314, ""));
    }

    // OR

    public void testOrBooleanTrueAndBooleanFalse() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(OR, Boolean.TRUE, Boolean.FALSE));
    }

    public void testOrTwoBooleanFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(OR, Boolean.FALSE, Boolean.FALSE));
    }

    public void testOrBooleanFalseAndBooleanTrue() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(OR, Boolean.FALSE, Boolean.TRUE));
    }

    public void testOrBooleanFalseAndNull() throws Exception {
        assertEquals(null, evaluate(OR, Boolean.FALSE, null));
    }

    public void testOrTwoNulls() throws Exception {
        assertEquals(null, evaluate(OR, null, null));
    }

    public void testOrNullAndBooleanTrue() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(OR, null, Boolean.TRUE));
    }

    public void testOrZeroAndInt() throws Exception {
        assertEquals(314, evaluate(OR, 0, 314));
    }

    public void testOrTwoInts() throws Exception {
        assertEquals(314, evaluate(OR, 314, 235325));
    }

    public void testOrStringZeroAndInt() throws Exception {
        assertEquals("0", evaluate(OR, "0", 314));
    }

    public void testOrStringFalseAndInt() throws Exception {
        assertEquals("false", evaluate(OR, "false", 314));
    }

    public void testOrEmptyStringAndInt() throws Exception {
        assertEquals(314, evaluate(OR, "", 314));
    }

    public void testOrNaNAndString() throws Exception {
        assertEquals("Random", evaluate(OR, Double.NaN, "Random"));
    }

    // NOT

    public void testNotBooleanTrue() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOT, Boolean.TRUE));
    }

    public void testNotBooleanFalse() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOT, Boolean.FALSE));
    }

    public void testNotEmptyString() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOT, ""));
    }

    public void testNotString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOT, "Random"));
    }

    public void testNotStringFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOT, "false"));
    }

    public void testNotStringZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOT, "0"));
    }

    public void testNotNull() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOT, (Object) null));
    }

    public void testNotObject() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOT, new Object()));
    }

    public void testNotDoubleZero() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOT, 0.0));
    }

    public void testNotDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(NOT, 1.0));
    }

    public void testNotNaN() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(NOT, Double.NaN));
        assertEquals(Boolean.TRUE, evaluate(NOT, Float.NaN));
    }

    // EMPTY

    public void testIsEmptyNull() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EMPTY, (Object) null));
    }

    public void testIsEmptyBooleanTrue() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EMPTY, Boolean.TRUE));
    }

    public void testIsEmptyBooleanFalse() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EMPTY, Boolean.FALSE));
    }

    public void testIsEmptyZero() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EMPTY, 0));
    }

    public void testIsEmptyDouble() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EMPTY, 0.0));
    }

    public void testIsEmptyNaN() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EMPTY, Double.NaN));
        assertEquals(Boolean.FALSE, evaluate(EMPTY, Float.NaN));
    }

    public void testIsEmptyWithEmptyString() throws Exception {
        assertEquals(Boolean.TRUE, evaluate(EMPTY, ""));
    }

    public void testIsEmptyWithString() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EMPTY, "Random"));
    }

    public void testIsEmptyWithEmptyList() throws Exception {
        List<Object> list = Lists.newArrayList();

        assertEquals(Boolean.TRUE, evaluate(EMPTY, list));
    }

    public void testIsEmptyWithList() throws Exception {
        List<Object> list = Lists.newArrayList();
        list.add("a");
        list.add("b");

        assertEquals(Boolean.FALSE, evaluate(EMPTY, list));
    }

    public void testIsEmptyObject() throws Exception {
        assertEquals(Boolean.FALSE, evaluate(EMPTY, new Object()));
    }

    // FORMAT: template type
    /* we try to make sure FORMAT() on java side give us the same output as format() on js side
    tests on js side are in expressionTest/functions.cmp
    here every test function (more or less) is a equivalent to a test cmp (expressionTest:test) in function.cmp.
    'skip' in the comment means we cannot test the same thing on the other side
    'diff' means js side give us different output
    just fyi: v.label1 = "Hello {0}", v.label2 = "Hello {0} and {1}"
    */

    //<expressionTest:test expression="{!format()}" exprText="format()" expected="''"/>
    public void testFormatNoArguments() throws Exception {
        assertEquals("", evaluate(FORMAT));
    }

    //<expressionTest:test expression="{!format(null)}" exprText="format(null)" expected="''"/>
    public void testFormatNull() throws Exception {
        assertEquals("", evaluate(FORMAT, (Object) null));
    }
    
    //skip: java doesn't have 'undefined'
    //<expressionTest:test expression="{!format(undefined)}" exprText="format(undefined)" expected="''"/>

    //<expressionTest:test expression="{!format(true)}" exprText="format(true)" expected="'true'"/>
    public void testFormatBooleanTrue() throws Exception {
        assertEquals("true", evaluate(FORMAT, Boolean.TRUE));
    }

    //<expressionTest:test expression="{!format(false)}" exprText="format(false)" expected="'false'"/>
    public void testFormatBooleanFalse() throws Exception {
        assertEquals("false", evaluate(FORMAT, Boolean.FALSE));
    }

    //<expressionTest:test expression="{!format(0)}" exprText="format(0)" expected="'0'"/>
    public void testFormatZero() throws Exception {
        assertEquals("0", evaluate(FORMAT, 0));
    }

    //<expressionTest:test expression="{!format(0.0)}" exprText="format(0.0)" expected="'0'"/>
    //<expressionTest:test expression="{!format(123)}" exprText="format(123)" expected="'123'"/>
    //<expressionTest:test expression="{!format(123.4)}" exprText="format(123.4)" expected="'123.4'"/>
    public void testFormatDouble() throws Exception {
        assertEquals("0", evaluate(FORMAT, 0.0));
    }

    //<expressionTest:test expression="{!format(NaN)}" exprText="format(NaN)" expected="''"/>
    public void testFormatNaN() throws Exception {
        assertEquals("NaN", evaluate(FORMAT, Double.NaN));
        assertEquals("NaN", evaluate(FORMAT, Float.NaN));
    }

    //<expressionTest:test expression="{!format('')}" exprText="format('')" expected="''"/>
    public void testFormatWithEmptyString() throws Exception {
        assertEquals("", evaluate(FORMAT, ""));
    }

    //<expressionTest:test expression="{!format('abc')}" exprText="format('abc')" expected="'abc'"/>
    //<expressionTest:test expression="{!format(v.label0)}" exprText="format(v.label0)" expected="'Hello'"/>
    public void testFormatWithString() throws Exception {
        assertEquals("Random", evaluate(FORMAT, "Random"));
    }

    //skip: cannot have format([1,2,3...])
    public void testFormatWithEmptyList() throws Exception {
        assertEquals("", evaluate(FORMAT, Lists.newArrayList()));
    }

    //skip: cannot have format([1,2,3...])
    public void testFormatWithList() throws Exception {
        List<Object> list = Lists.newArrayList();
        list.add("a");
        list.add("b");

        assertEquals("a,b", evaluate(FORMAT, list));
    }

    //skip: cannot have format({key: value})
    public void testFormatObject() throws Exception {
        assertEquals("[object Object]", evaluate(FORMAT, new Object()));
    }

    // FORMAT: argument type

    //<expressionTest:test expression="{!format(v.label2, null, undefined)}" exprText="format(v.label2, null, undefined" expected="'Hello  and '"/>
	public void testFormatArgNull() throws Exception {
	    assertEquals("X", evaluate(FORMAT, "X{0}", (Object) null));
	}

	//<expressionTest:test expression="{!format(v.label2, true, false)}" exprText="format(v.label2, v.true, false)" expected="'Hello true and false'"/>
    public void testFormatArgBoolean() throws Exception {
        assertEquals("XtrueYfalse", evaluate(FORMAT, "X{0}Y{1}", Boolean.TRUE, Boolean.FALSE));
    }

    //<expressionTest:test expression="{!format(v.label2, 0, 0.0)}" exprText="format(v.label2, 0, 0.0)" expected="'Hello 0 and 0'"/>
    //<expressionTest:test expression="{!format(v.label2, 123, 123.4)}" exprText="format(v.label2, 123, 123.4)" expected="'Hello 123 and 123.4'"/>
    public void testFormatArgZero() throws Exception {
        assertEquals("X0Y0", evaluate(FORMAT, "X{0}Y{1}", 0, 0.0));
    }

    //<expressionTest:test expression="{!format(v.label1, NaN)}" exprText="format(v.label1, NaN)" expected="'Hello '"/>
    public void testFormatArgNaN() throws Exception {
        assertEquals("XNaNYNaN", evaluate(FORMAT, "X{0}Y{1}", Double.NaN, Float.NaN));
    }

    //<expressionTest:test expression="{!format(v.label2, m.stringEmpty, m.string)}" exprText="format(v.label2, m.stringEmpty, m.string)" expected="'Hello  and Model'"/>
    //<expressionTest:test expression="{!format(v.label1, v.string)}" exprText="format(v.label1, v.string)" expected="'Hello Component'"/>
    public void testFormatArgString() throws Exception {
        assertEquals("XYRandom", evaluate(FORMAT, "X{0}Y{1}", "", "Random"));
    }

    //<expressionTest:test expression="{!format(v.label2, m.emptyList, m.stringList)}" exprText="format(v.label2, m.emptyList, m.stringList)" expected="'Hello  and one,two,three'"/>
    public void testFormatArgList() throws Exception {
        List<Object> list = Lists.newArrayList();
        list.add("a");
        list.add("b");

        assertEquals("XYa,b", evaluate(FORMAT, "X{0}Y{1}", Lists.newArrayList(), list));
    }

    //diff: <expressionTest:test expression="{!format(v.label2, m.objectNull, m.object)}" exprText="format(v.label2, m.objectNull, m.object)" expected="'Hello  and '"/>
    public void testFormatArgObject() throws Exception {
        assertEquals("X[object Object]Y", evaluate(FORMAT, "X{0}Y", new Object()));
    }
    
    //<expressionTest:test expression="{!format(v.label1, v.string, v.integer)}" exprText="format(v.label1, v.string, v.integer)" expected="'Hello Component'"/>
    public void testFormatMoreArgThanExpect() throws Exception {
    	assertEquals("X0Y", evaluate(FORMAT, "X{0}Y", 0, 1, 2));
    }
    
    //<expressionTest:test expression="{!format(v.label1)}" exprText="format(v.label1)" expected="'Hello {0}'"/>
    //<expressionTest:test expression="{!format(v.label2)}" exprText="format(v.label2)" expected="'Hello {0} and {1}'"/>
    public void testFormatLessArgThanExpect() throws Exception {
    	assertEquals("X{0}Y", evaluate(FORMAT, "X{0}Y"));
    }
    
}
