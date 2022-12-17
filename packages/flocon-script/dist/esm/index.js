import { parse } from 'acorn';
import { Option } from '@kizahasi/option';
import { mapToRecord } from '@flocon-trpg/utils';

class ScriptError extends Error {
    range;
    constructor(message, range) {
        super(message);
        this.range = range;
        this.name = 'ScriptError';
    }
    static notConstructorError(range) {
        return new ScriptError('Not a constructor', range);
    }
    static requiresNewError(range) {
        return new ScriptError('Need to call with `new` keyword', range);
    }
}

function* mapIterator(source, mapping) {
    for (const elem of source) {
        yield mapping(elem);
    }
}

var FType;
(function (FType) {
    FType.Boolean = 'Boolean';
    FType.Number = 'Number';
    FType.String = 'String';
    FType.Symbol = 'Symbol';
    // 通常のJavaScriptではtypeofで'array'が返されることはないが、このライブラリではArray.isArrayの判定に用いている
    FType.Array = 'Array';
    FType.Object = 'Object';
    FType.Function = 'Function';
})(FType || (FType = {}));

const tryToPropertyName = (value) => {
    switch (value?.type) {
        case FType.Number:
        case FType.String:
            return value.raw.toString();
        case FType.Symbol:
            return value.raw;
        default:
            return undefined;
    }
};

class FFunction {
    func;
    constructor(func) {
        this.func = func;
    }
    get type() {
        return FType.Function;
    }
    exec(params) {
        return this.func({ ...params });
    }
    onGetting(params) {
        return Option.none();
    }
    get({ property, astInfo }) {
        const key = tryToPropertyName(property);
        if (key == null) {
            return undefined;
        }
        const onGettingResult = this.onGetting({ key, astInfo });
        if (!onGettingResult.isNone) {
            return onGettingResult.value;
        }
        // TODO: 実装する。ただし、実装するものは注意して選んだほうがいい（結果としてどれも実装しないことになるかも）。
        return undefined;
    }
    set({ astInfo }) {
        throw new ScriptError('You cannot set any value to Function', astInfo?.range);
    }
    toPrimitiveAsString() {
        return (() => {
            return;
        }).toString();
    }
    toPrimitiveAsNumber() {
        return +(() => {
            return;
        });
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    toJObject() {
        return () => {
            throw new Error('Not supported');
        };
    }
}

class FString {
    raw;
    constructor(raw) {
        this.raw = raw;
    }
    static prepareInstanceMethod(isNew, astInfo) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }
    get type() {
        return FType.String;
    }
    get({ property, astInfo }) {
        const propertyName = tryToPropertyName(property);
        switch (propertyName) {
            // TODO: もっと実装する
            case 'toString':
                return new FFunction(({ isNew }) => {
                    FString.prepareInstanceMethod(isNew, astInfo);
                    return this;
                });
            default:
                return undefined;
        }
    }
    set({ astInfo }) {
        throw new ScriptError('You cannot set any value to String', astInfo?.range);
    }
    iterate() {
        return mapIterator(this.raw[Symbol.iterator](), x => new FString(x));
    }
    toPrimitiveAsString() {
        return this.raw.toString();
    }
    toPrimitiveAsNumber() {
        return +this.raw;
    }
    toPrimitiveAsDefault() {
        return this.raw.toString();
    }
    toJObject() {
        return this.raw;
    }
}

class Context {
    globalThis;
    /*
    let x = 1;
    let f = () => {
        let x = 2;
        return 2;
    }
    
    のようなとき、let f の括弧の外では [{ x: 1 }]、let x = 2 のすぐ上では [{ x: 1 }, {}]、下から ) までは [{ x: 1 }, { x: 2 }] となる。
    */
    varTables = [new Map()];
    constructor(globalThis) {
        this.globalThis = globalThis;
    }
    get(name, range) {
        const found = this.varTables
            .map(table => table.get(name))
            .filter(val => val !== undefined)
            .reverse()[0];
        if (found !== undefined) {
            return found.ref;
        }
        const prop = this.globalThis.get({
            property: new FString(name),
            astInfo: { range },
        });
        if (prop !== undefined) {
            return prop;
        }
        return undefined;
    }
    assign(name, newValue, range) {
        const found = this.varTables
            .map(table => table.get(name))
            .filter(val => val !== undefined)
            .reverse()[0];
        if (found !== undefined) {
            if (found.isConst) {
                throw new Error(`invalid assignment to const '${name}'`);
            }
            found.ref = newValue;
            return;
        }
        this.globalThis.set({
            property: new FString(name),
            newValue,
            astInfo: { range },
        });
    }
    declare(name, value, type) {
        const varTable = this.varTables[this.varTables.length - 1];
        if (varTable === undefined) {
            throw new Error('this should not happen');
        }
        const found = varTable.get(name);
        if (found !== undefined) {
            throw new Error(`redeclaration of ${type} ${name}`);
        }
        varTable.set(name, {
            ref: value,
            isConst: type === 'const',
        });
    }
    scopeIn() {
        this.varTables.push(new Map());
    }
    scopeOut() {
        if (this.varTables.length <= 1) {
            throw new Error('this.varTables must not be empty');
        }
        this.varTables.pop();
    }
}

function fRestElement(source) {
    return {
        ...source,
        argument: fPattern(source.argument),
    };
}
const fPattern = (pattern) => {
    switch (pattern.type) {
        case 'ArrayPattern':
            return {
                ...pattern,
                elements: pattern.elements.map(x => (x == null ? x : fPattern(x))),
            };
        case 'ObjectPattern':
            return {
                ...pattern,
                properties: pattern.properties.map(x => {
                    if (x.type === 'RestElement') {
                        return fRestElement(x);
                    }
                    return fProperty(x);
                }),
            };
        case 'AssignmentPattern':
            return {
                ...pattern,
                left: fPattern(pattern.left),
                right: fExpression(pattern.right),
            };
        case 'RestElement':
            // function f(...x) {return x;} の...xの部分で使われる
            return fRestElement(pattern);
        case 'Identifier':
            return pattern;
        case 'MemberExpression':
            return fMemberExpression(pattern);
    }
};

const toRange = (source) => {
    if (source == null) {
        return undefined;
    }
    // @types/estreeとacornでは型が異なる。このライブラリではacornを用いているため、それに合わせて型変換している。
    const range = source;
    if (typeof range.start === 'number' && typeof range.end === 'number') {
        return [range.start, range.end];
    }
    return undefined;
};

function fArrayExpression(expression) {
    return {
        ...expression,
        elements: expression.elements.map(e => {
            if (e == null) {
                return e;
            }
            if (e.type === 'SpreadElement') {
                return {
                    isSpread: true,
                    argument: fExpression(e.argument),
                };
            }
            return { isSpread: false, expression: fExpression(e) };
        }),
    };
}
function fArrowFuntionExpression(expression) {
    const params = expression.params.map(param => fPattern(param));
    let body;
    if (expression.body.type === 'BlockStatement') {
        body = fBlockStatement(expression.body);
    }
    else {
        body = fExpression(expression.body);
    }
    return {
        ...expression,
        body,
        params,
    };
}
function fAssignmentOperator(operator) {
    return operator;
}
function fAssignmentExpression(expression) {
    let left;
    switch (expression.left.type) {
        case 'Identifier':
            left = expression.left;
            break;
        case 'MemberExpression':
            left = fMemberExpression(expression.left);
            break;
        default:
            throw new ScriptError(`'${expression.left.type}' is not supported`, toRange(expression));
    }
    return {
        ...expression,
        operator: fAssignmentOperator(expression.operator),
        left,
        right: fExpression(expression.right),
    };
}
function fBaseCallExpression(expression) {
    if (expression.callee.type === 'Super') {
        throw new ScriptError(`'${expression.callee.type}' is not supported`, toRange(expression));
    }
    return {
        ...expression,
        callee: fExpression(expression.callee),
        arguments: expression.arguments.map(arg => {
            if (arg.type === 'SpreadElement') {
                throw new ScriptError(`'${arg.type} is not supported'`, toRange(arg));
            }
            return fExpression(arg);
        }),
    };
}
function fBinaryOperator(operator, range) {
    switch (operator) {
        case 'in':
        case 'instanceof':
            throw new ScriptError(`'${operator}' is not supported`, range);
        default:
            return operator;
    }
}
function fBinaryExpression(expression) {
    return {
        ...expression,
        operator: fBinaryOperator(expression.operator, toRange(expression)),
        left: fExpression(expression.left),
        right: fExpression(expression.right),
    };
}
function fChainExpression(expression) {
    if (expression.expression.type === 'CallExpression') {
        return {
            ...expression,
            expression: fSimpleCallExpression(expression.expression),
        };
    }
    return {
        ...expression,
        expression: fMemberExpression(expression.expression),
    };
}
function fConditionalExpression(expression) {
    return {
        ...expression,
        test: fExpression(expression.test),
        alternate: fExpression(expression.alternate),
        consequent: fExpression(expression.consequent),
    };
}
function fLiteral(expression) {
    if ('bigint' in expression) {
        throw new ScriptError(`'bigint' is not supported`, toRange(expression));
    }
    if ('regex' in expression) {
        throw new ScriptError(`'regex' is not supported`, toRange(expression));
    }
    return expression;
}
function fLogicalExpression(expression) {
    return {
        ...expression,
        left: fExpression(expression.left),
        right: fExpression(expression.right),
    };
}
function fMemberExpression(expression) {
    if (expression.object.type === 'Super') {
        throw new ScriptError("'Super' is not supported", toRange(expression));
    }
    if (expression.property.type === 'PrivateIdentifier') {
        // 用途が不明
        throw new ScriptError("'PrivateIdentifier' is not supported", toRange(expression));
    }
    return {
        ...expression,
        object: fExpression(expression.object),
        property: fExpression(expression.property),
    };
}
function fNewExpression(expression) {
    return {
        ...expression,
        ...fBaseCallExpression(expression),
        type: expression.type,
    };
}
function fObjectExpression(expression) {
    return {
        ...expression,
        properties: expression.properties.map(prop => {
            if (prop.type === 'SpreadElement') {
                return { isSpread: true, argument: fExpression(prop.argument) };
            }
            return { isSpread: false, property: fProperty(prop) };
        }),
    };
}
function fProperty(property) {
    let key;
    switch (property.key.type) {
        case 'Identifier':
            key = property.key;
            break;
        case 'Literal':
            key = fLiteral(property.key);
            break;
        default:
            throw new ScriptError(`'${property.key}' is not supported`, toRange(property.key));
    }
    switch (property.value.type) {
        case 'ArrayPattern':
        case 'ObjectPattern':
        case 'RestElement':
        case 'AssignmentPattern': {
            throw new ScriptError(`'${property.value.type}' is not supported`, toRange(property.value));
        }
    }
    switch (property.kind) {
        case 'init':
            break;
        default:
            throw new ScriptError(`'${property.kind}' is not supported`, toRange(property.value));
    }
    return {
        ...property,
        key,
        value: fExpression(property.value),
        kind: property.kind,
    };
}
function fSimpleCallExpression(expression) {
    return {
        ...expression,
        ...fBaseCallExpression(expression),
        type: expression.type,
    };
}
function fUnaryOperator(operator, range) {
    switch (operator) {
        case 'delete':
        case 'void':
            throw new ScriptError(`'${operator}' is not supported`, range);
        default:
            return operator;
    }
}
function fUnaryExpression(expression) {
    return {
        ...expression,
        operator: fUnaryOperator(expression.operator, toRange(expression)),
        argument: fExpression(expression.argument),
    };
}
function fUpdateExpression(expression) {
    switch (expression.argument.type) {
        case 'Identifier':
            return {
                ...expression,
                argument: expression.argument,
            };
        case 'MemberExpression':
            return {
                ...expression,
                argument: fMemberExpression(expression.argument),
            };
        default:
            // ここに来る状況があるかどうか不明
            throw new ScriptError('Invalid update expression argument', toRange(expression));
    }
}
function fExpression(expression) {
    switch (expression.type) {
        case 'ArrayExpression':
            return fArrayExpression(expression);
        case 'ArrowFunctionExpression':
            return fArrowFuntionExpression(expression);
        case 'AssignmentExpression':
            return fAssignmentExpression(expression);
        case 'BinaryExpression':
            return fBinaryExpression(expression);
        case 'CallExpression':
            return fSimpleCallExpression(expression);
        case 'ChainExpression':
            return fChainExpression(expression);
        case 'ConditionalExpression':
            return fConditionalExpression(expression);
        case 'Identifier':
            return expression;
        case 'Literal':
            return fLiteral(expression);
        case 'LogicalExpression':
            return fLogicalExpression(expression);
        case 'MemberExpression':
            return fMemberExpression(expression);
        case 'NewExpression':
            return fNewExpression(expression);
        case 'ObjectExpression':
            return fObjectExpression(expression);
        case 'ThisExpression':
            return expression;
        case 'UnaryExpression':
            return fUnaryExpression(expression);
        case 'UpdateExpression':
            return fUpdateExpression(expression);
        default:
            throw new ScriptError(`'${expression.type}' is not supported`, toRange(expression));
    }
}

function fBlockStatement(statement) {
    return {
        ...statement,
        body: statement.body.map(x => fStatement(x)),
    };
}
const fExpressionStatement = (statement) => {
    return {
        ...statement,
        expression: fExpression(statement.expression),
    };
};
const fVariableDeclaration = (statement) => {
    if (statement.kind === 'var') {
        throw new ScriptError(`'${statement.kind}' is not supported. Use 'let' instead.`, toRange(statement));
    }
    const declarations = statement.declarations.map(d => {
        return {
            ...d,
            id: fPattern(d.id),
            init: d.init == null ? d.init : fExpression(d.init),
        };
    });
    return {
        ...statement,
        kind: statement.kind,
        declarations,
    };
};
function fStatement(statement) {
    switch (statement.type) {
        case 'BlockStatement':
            return fBlockStatement(statement);
        case 'BreakStatement':
            if (statement.label != null) {
                throw new ScriptError('labels are not supported');
            }
            return statement;
        case 'ContinueStatement':
            if (statement.label != null) {
                throw new ScriptError('labels are not supported');
            }
            return statement;
        case 'ExpressionStatement':
            return fExpressionStatement(statement);
        case 'ForOfStatement':
            return {
                ...statement,
                left: statement.left.type === 'VariableDeclaration'
                    ? fVariableDeclaration(statement.left)
                    : fPattern(statement.left),
                right: fExpression(statement.right),
                body: fStatement(statement.body),
            };
        case 'ForStatement': {
            let init;
            if (statement.init == null) {
                init = statement.init;
            }
            else if (statement.init.type === 'VariableDeclaration') {
                init = fVariableDeclaration(statement.init);
            }
            else {
                init = fExpression(statement.init);
            }
            return {
                ...statement,
                init,
                test: statement.test == null ? statement.test : fExpression(statement.test),
                update: statement.update == null ? statement.update : fExpression(statement.update),
                body: fStatement(statement.body),
            };
        }
        case 'IfStatement':
            return {
                ...statement,
                alternate: statement.alternate == null
                    ? statement.alternate
                    : fStatement(statement.alternate),
                consequent: fStatement(statement.consequent),
                test: fExpression(statement.test),
            };
        case 'ReturnStatement':
            return {
                ...statement,
                argument: statement.argument == null
                    ? statement.argument
                    : fExpression(statement.argument),
            };
        case 'SwitchStatement': {
            return {
                ...statement,
                cases: statement.cases.map(c => ({
                    ...c,
                    consequent: c.consequent.map(s => fStatement(s)),
                    test: c.test == null ? c.test : fExpression(c.test),
                })),
                discriminant: fExpression(statement.discriminant),
            };
        }
        case 'VariableDeclaration':
            return fVariableDeclaration(statement);
        default:
            throw new ScriptError(`'${statement.type}' is not supported`, toRange(statement));
    }
}

const getRestValues = (iterator) => {
    const result = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const next = iterator.next();
        if (next.done) {
            return result;
        }
        result.push(next.value);
    }
};

// 単にsource?.toJObject() と書くと、source === nullのときにnullではなくundefinedとなってしまう。これでは困る場面があるため、この関数を定義している。
const toJObject = (source) => {
    if (source == null) {
        return source;
    }
    return source.toJObject();
};

class FBoolean {
    raw;
    constructor(raw) {
        this.raw = raw;
    }
    static prepareInstanceMethod(isNew, astInfo) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }
    get type() {
        return FType.Boolean;
    }
    get({ property, astInfo }) {
        const propertyName = tryToPropertyName(property);
        switch (propertyName) {
            case 'toString':
                return new FFunction(({ isNew }) => {
                    FBoolean.prepareInstanceMethod(isNew, astInfo);
                    return new FString(this.raw.toString());
                });
            default:
                return undefined;
        }
    }
    set({ astInfo }) {
        throw new ScriptError('You cannot set any value to Boolean', astInfo?.range);
    }
    toPrimitiveAsString() {
        return this.raw.toString();
    }
    toPrimitiveAsNumber() {
        return +this.raw;
    }
    toJObject() {
        return this.raw;
    }
}

class FNumber {
    raw;
    constructor(raw) {
        this.raw = raw;
    }
    static prepareInstanceMethod(isNew, astInfo) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }
    get type() {
        return FType.Number;
    }
    get({ property, astInfo }) {
        const propertyName = tryToPropertyName(property);
        switch (propertyName) {
            // TODO: もっと実装する
            case 'toString':
                return new FFunction(({ args, isNew }) => {
                    FNumber.prepareInstanceMethod(isNew, astInfo);
                    const radix = args[0];
                    return new FString(this.raw.toString(beginCast(radix, astInfo).addNumber().addUndefined().cast()));
                });
            default:
                return undefined;
        }
    }
    set({ astInfo }) {
        throw new ScriptError('You cannot set any value to Number', astInfo?.range);
    }
    toPrimitiveAsString() {
        return this.raw.toString();
    }
    toPrimitiveAsNumber() {
        return +this.raw;
    }
    toJObject() {
        return this.raw;
    }
}

class FSymbol {
    raw;
    constructor(raw) {
        this.raw = raw;
    }
    static prepareInstanceMethod(isNew, astInfo) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }
    get type() {
        return FType.Symbol;
    }
    get({ property, astInfo }) {
        const propertyName = tryToPropertyName(property);
        switch (propertyName) {
            case 'toString':
                return new FFunction(({ isNew }) => {
                    FSymbol.prepareInstanceMethod(isNew, astInfo);
                    return new FString(this.raw.toString());
                });
            default:
                return undefined;
        }
    }
    set({ astInfo }) {
        throw new ScriptError('You cannot set any value to Symbol', astInfo?.range);
    }
    toPrimitiveAsString() {
        return this.raw.toString();
    }
    toPrimitiveAsNumber() {
        throw new ScriptError("can't convert symbol to number");
    }
    toJObject() {
        return this.raw;
    }
}

const toTypeName = (value) => {
    if (value === null) {
        return 'null';
    }
    if (value === undefined) {
        return 'undefined';
    }
    return value.type;
};

const typesOptionToString = (source) => {
    const base = [
        source.array ? 'array' : null,
        source.boolean ? 'boolean' : null,
        source.function ? 'function' : null,
        source.null ? 'null' : null,
        source.number ? 'number' : null,
        source.object ? 'object' : null,
        source.string ? 'string' : null,
        source.symbol ? 'symbol' : null,
        source.undefined ? 'undefined' : null,
    ].reduce((seed, elem) => {
        if (elem == null) {
            return seed;
        }
        if (seed === '') {
            return elem;
        }
        return `${seed}, ${elem}`;
    }, '');
    return `[${base}]`;
};
class JObjectCaster {
    source;
    addedTypes;
    successfullyCastedValue;
    astInfo;
    constructor(source, addedTypes, successfullyCastedValue, astInfo) {
        this.source = source;
        this.addedTypes = addedTypes;
        this.successfullyCastedValue = successfullyCastedValue;
        this.astInfo = astInfo;
    }
    static begin(source, astInfo) {
        return new JObjectCaster(source, {}, Option.none(), astInfo);
    }
    cast() {
        if (this.successfullyCastedValue.isNone) {
            throw new ScriptError(`Expected type: ${typesOptionToString(this.addedTypes)}, Actual type: ${toTypeName(this.source)}`, this.astInfo?.range);
        }
        return this.successfullyCastedValue.value;
    }
    addArray() {
        if (this.source instanceof FArray) {
            return new JObjectCaster(this.source, { ...this.addedTypes, array: true }, Option.some(this.source), this.astInfo);
        }
        return this;
    }
    addBoolean() {
        if (this.source instanceof FBoolean) {
            return new JObjectCaster(this.source, { ...this.addedTypes, boolean: true }, Option.some(this.source.raw), this.astInfo);
        }
        return this;
    }
    addFunction() {
        if (this.source instanceof FFunction) {
            const source = this.source;
            return new JObjectCaster(source, { ...this.addedTypes, function: true }, Option.some((isNew) => (args) => source.exec({ args, isNew, astInfo: this.astInfo })), this.astInfo);
        }
        return this;
    }
    addNull() {
        if (this.source === null) {
            const source = this.source;
            return new JObjectCaster(source, { ...this.addedTypes, null: true }, Option.some(null), this.astInfo);
        }
        return this;
    }
    addNumber() {
        if (this.source instanceof FNumber) {
            return new JObjectCaster(this.source, { ...this.addedTypes, number: true }, Option.some(this.source.raw), this.astInfo);
        }
        return this;
    }
    addObject() {
        if (this.source instanceof FObject) {
            return new JObjectCaster(this.source, { ...this.addedTypes, object: true }, Option.some(this.source), this.astInfo);
        }
        return this;
    }
    addString() {
        if (this.source instanceof FString) {
            return new JObjectCaster(this.source, { ...this.addedTypes, string: true }, Option.some(this.source.raw), this.astInfo);
        }
        return this;
    }
    addSymbol() {
        if (this.source instanceof FSymbol) {
            return new JObjectCaster(this.source, { ...this.addedTypes, symbol: true }, Option.some(this.source.raw), this.astInfo);
        }
        return this;
    }
    addUndefined() {
        if (this.source === undefined) {
            const source = this.source;
            return new JObjectCaster(source, { ...this.addedTypes, undefined: true }, Option.some(undefined), this.astInfo);
        }
        return this;
    }
}
const beginCast = (source, astInfo) => {
    return JObjectCaster.begin(source, astInfo);
};

// If you do not want to throw expections, consider using tryToProperyName instead.
const toPropertyName = (value, astInfo) => {
    const result = beginCast(value, astInfo).addString().addNumber().addSymbol().cast();
    if (typeof result === 'number') {
        return result.toString();
    }
    return result;
};

class FObject {
    get({ property, astInfo }) {
        const key = tryToPropertyName(property);
        if (key == null) {
            return undefined;
        }
        return this.getCore({ key, astInfo });
    }
    set({ property, newValue, astInfo }) {
        const key = toPropertyName(property, astInfo);
        this.setCore({ key, newValue, astInfo });
    }
    get type() {
        return FType.Object;
    }
    toPrimitiveAsString() {
        return {}.toString();
    }
    toPrimitiveAsNumber() {
        return +{};
    }
}

const symbolNotSupportedMessage = 'Symbol keys are not supported';
// Mapに変換することで、外界から受け取ったオブジェクトに対する破壊的な操作を起こせないようにしている。
class FRecord extends FObject {
    source;
    constructor(base) {
        super();
        if (base != null) {
            this.source = new Map(base.source);
        }
        else {
            this.source = new Map();
        }
    }
    getCore({ key, astInfo }) {
        if (typeof key === 'symbol') {
            throw new ScriptError(symbolNotSupportedMessage, astInfo?.range);
        }
        return this.source.get(key.toString());
    }
    setCore({ key, newValue, astInfo }) {
        if (typeof key === 'symbol') {
            throw new ScriptError(symbolNotSupportedMessage, astInfo?.range);
        }
        this.source.set(key.toString(), newValue);
    }
    clone() {
        return new FRecord(this);
    }
    forEach(callbackfn) {
        this.source.forEach(callbackfn);
    }
    toJObject() {
        const result = new Map();
        this.source.forEach((value, key) => {
            result.set(key, toJObject(value));
        });
        return mapToRecord(result);
    }
}

class FIterator extends FObject {
    source;
    convertValue;
    constructor(source, convertValue) {
        super();
        this.source = source;
        this.convertValue = convertValue;
    }
    static prepareInstanceMethod(isNew, astInfo) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }
    static create(source) {
        return new FIterator(source, x => x);
    }
    get type() {
        return FType.Object;
    }
    getCore(params) {
        const { key, astInfo } = params;
        switch (key) {
            case 'next':
                return new FFunction(({ isNew }) => {
                    FIterator.prepareInstanceMethod(isNew, astInfo);
                    const next = this.source.next();
                    const result = new FRecord();
                    result.set({
                        property: new FString('value'),
                        newValue: this.convertValue(next.value),
                        astInfo,
                    });
                    result.set({
                        property: new FString('done'),
                        newValue: next.done === undefined ? undefined : new FBoolean(next.done),
                        astInfo,
                    });
                    return result;
                });
        }
        return undefined;
    }
    setCore(params) {
        throw new ScriptError('You cannot set any value to Iterator', params.astInfo?.range);
    }
    iterate() {
        return mapIterator(this.source, x => this.convertValue(x));
    }
    toPrimitiveAsString() {
        // JavaScriptでは例えば配列由来なら'[object Array Iterator]'となる（ChromeとFirefoxで確認）が、ここでは実装を簡略化するためにすべてIteratorとしている
        return '[object Iterator]';
    }
    toPrimitiveAsNumber() {
        return NaN;
    }
    toJObject() {
        return mapIterator(this.source, x => toJObject(this.convertValue(x)));
    }
}

class FArray {
    source;
    convert;
    convertBack;
    constructor(source, convert, convertBack) {
        this.source = source;
        this.convert = convert;
        this.convertBack = convertBack;
    }
    static prepareInstanceMethod(isNew, astInfo) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }
    static create(source) {
        return new FArray(source, x => x, x => x);
    }
    get type() {
        return FType.Array;
    }
    toJArray() {
        return this.source.map(x => this.convert(x));
    }
    iterate() {
        return mapIterator(this.source[Symbol.iterator](), x => this.convert(x));
    }
    static isValidIndex(index) {
        if (index == null || typeof index === 'symbol') {
            return false;
        }
        return index === '0' || /^[1-9][0-9]*$/.test(index);
    }
    get({ property, astInfo }) {
        const index = tryToPropertyName(property);
        if (FArray.isValidIndex(index)) {
            const found = this.source[index];
            if (found === undefined) {
                return undefined;
            }
            return this.convert(found);
        }
        const propertyName = index;
        switch (propertyName) {
            case 'filter':
                return new FFunction(({ args, isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const predicate = beginCast(args[0], astInfo).addFunction().cast()(false);
                    const raw = this.toJArray().filter((value, index) => predicate([value, new FNumber(index)])?.toJObject());
                    return FArray.create(raw);
                });
            case 'find':
                return new FFunction(({ args, isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const predicate = beginCast(args[0], astInfo).addFunction().cast()(false);
                    const raw = this.toJArray().find((value, index) => predicate([value, new FNumber(index)])?.toJObject());
                    return raw;
                });
            case 'forEach':
                return new FFunction(({ args, isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const callbackfn = beginCast(args[0], astInfo).addFunction().cast()(false);
                    this.toJArray().forEach((value, index) => callbackfn([value, new FNumber(index)]));
                    return undefined;
                });
            case 'map':
                return new FFunction(({ args, isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const mapping = beginCast(args[0], astInfo).addFunction().cast()(false);
                    const raw = this.toJArray().map((value, index) => mapping([value, new FNumber(index)]));
                    return FArray.create(raw);
                });
            case 'pop':
                return new FFunction(({ isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const result = this.source.pop();
                    return this.convert(result);
                });
            case 'push':
                return new FFunction(({ args, isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    args.forEach(arg => {
                        const newValue = this.convertBack(arg, astInfo);
                        this.source.push(newValue);
                    });
                    return new FNumber(this.source.length);
                });
            case 'shift':
                return new FFunction(({ isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const result = this.source.shift();
                    return this.convert(result);
                });
            case 'unshift':
                return new FFunction(({ args, isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    args.reduceRight((seed, arg) => {
                        const newValue = this.convertBack(arg, astInfo);
                        this.source.unshift(newValue);
                    }, undefined);
                    return new FNumber(this.source.length);
                });
            case Symbol.iterator:
                return new FFunction(({ isNew }) => {
                    FArray.prepareInstanceMethod(isNew, astInfo);
                    const source = this.source[Symbol.iterator]();
                    return FIterator.create(mapIterator(source, x => this.convert(x)));
                });
        }
        return undefined;
    }
    set({ property, newValue, astInfo }) {
        const index = toPropertyName(property, astInfo);
        if (FArray.isValidIndex(index)) {
            this.source[index] = this.convertBack(newValue, astInfo);
            return;
        }
        throw new ScriptError(`"${typeof index === 'symbol' ? 'symbol' : index}" is not supported`, astInfo?.range);
    }
    toPrimitiveAsString() {
        return this.toJArray()
            .map(x => x?.toPrimitiveAsString())
            .toString();
    }
    toPrimitiveAsNumber() {
        return +this.toJArray().map(x => x?.toPrimitiveAsNumber());
    }
    // 正確な型が表現できないのでunknown[]としている
    toJObject() {
        return this.toJArray().map(x => (x == null ? x : x.toJObject()));
    }
}
class FTypedArray extends FArray {
    constructor(source, convert, convertBack) {
        super(source, value => convert(value), convertBack);
    }
}

// https://ja.javascript.info/object-toprimitive
const toPrimitive = (value, hint) => {
    if (value == null) {
        return value;
    }
    if (hint === 'string') {
        return value.toPrimitiveAsString();
    }
    if (hint === 'number') {
        return value.toPrimitiveAsNumber();
    }
    const obj = value;
    if (obj.toPrimitiveAsDefault == null) {
        return obj.toPrimitiveAsNumber();
    }
    return obj.toPrimitiveAsDefault();
};

const compare = (left, right, hint, comparer) => {
    if (hint === 'JObject') {
        return comparer(toJObject(left), toJObject(right));
    }
    return comparer(toPrimitive(left, hint), toPrimitive(right, hint));
};
const compareToNumber = (left, right, hint, comparer) => {
    return new FNumber(compare(left, right, hint, comparer));
};
const compareToBoolean = (left, right, hint, comparer) => {
    return new FBoolean(compare(left, right, hint, comparer));
};
const compareToNumberOrString = (left, right, hint, comparer) => {
    const r = compare(left, right, hint, comparer);
    if (typeof r === 'number') {
        return new FNumber(r);
    }
    return new FString(r);
};

// 例えばxとyがObjectのときは x === y で比較されるため、「toPrimitiveで変換してから==で比較」という作戦は使えない。そのため、ここで専用の関数を定義している。
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Equality_comparisons_and_sameness
const eqeq = (x, y) => {
    if (x == null) {
        return y == null;
    }
    if (y == null) {
        return false;
    }
    const xAsObjectBase = x;
    if (xAsObjectBase.equals != null) {
        return xAsObjectBase.equals(y, '==');
    }
    switch (x.type) {
        case FType.Boolean:
        case FType.Number:
        case FType.String:
        case FType.Symbol:
            switch (y.type) {
                case FType.Boolean:
                case FType.Number:
                case FType.String:
                    // eslint-disable-next-line eqeqeq
                    return x.raw == y.raw;
                default:
                    // eslint-disable-next-line eqeqeq
                    return x.raw == toPrimitive(y, 'default');
            }
        default:
            switch (y.type) {
                case FType.Boolean:
                case FType.Number:
                case FType.String:
                case FType.Symbol:
                    // eslint-disable-next-line eqeqeq
                    return toPrimitive(x, 'default') == y.raw;
                default:
                    return x === y;
            }
    }
};

const eqeqeq = (x, y) => {
    if (x === null) {
        return y === null;
    }
    if (x === undefined) {
        return y === undefined;
    }
    const xAsObjectBase = x;
    if (xAsObjectBase.equals != null) {
        return xAsObjectBase.equals(y, '===');
    }
    switch (x.type) {
        case FType.Boolean:
        case FType.Number:
        case FType.String:
        case FType.Symbol:
            if (y?.type !== x.type) {
                return false;
            }
            return x.raw === y.raw;
        default:
            return x === y;
    }
};

// https://developer.mozilla.org/ja/docs/Glossary/Falsy
const isTruthy = (value) => {
    if (value == null) {
        return false;
    }
    switch (value.type) {
        case FType.Boolean:
        case FType.Number:
        case FType.String:
        case FType.Symbol:
            if (value.raw) {
                return true;
            }
            else {
                return false;
            }
        default:
            return true;
    }
};

const self = 'self';
const globalThis = 'globalThis';
// keyが'self'か'globalThis'のときは自分自身を返すRecord
// baseでkeyが'self'か'globalThis'である要素は全て無視される
class FGlobalRecord extends FRecord {
    constructor(base) {
        super(base);
    }
    getCore(params) {
        const keyAsString = params.key.toString();
        if (keyAsString === self || keyAsString === globalThis) {
            return this;
        }
        return super.getCore(params);
    }
    setCore({ key, newValue, astInfo }) {
        const keyAsString = key.toString();
        if (keyAsString === self || keyAsString === globalThis) {
            throw new ScriptError(`Assignment to '${keyAsString}' is not supported`, astInfo?.range);
        }
        super.setCore({ key, newValue, astInfo });
    }
}

class FMap extends FObject {
    source;
    convertValue;
    convertValueBack;
    constructor(source, convertValue, convertValueBack) {
        super();
        this.source = source;
        this.convertValue = convertValue;
        this.convertValueBack = convertValueBack;
    }
    static prepareInstanceMethod(isNew, astInfo) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }
    static create(source) {
        return new FMap(source, x => x, x => x);
    }
    convertKeyBack(source, astInfo) {
        return beginCast(source, astInfo)
            .addBoolean()
            .addNumber()
            .addString()
            .addSymbol()
            .addNull()
            .addUndefined()
            .cast();
    }
    get type() {
        return FType.Object;
    }
    getCore(params) {
        const { key, astInfo } = params;
        switch (key) {
            case 'clear':
                return new FFunction(({ isNew }) => {
                    FMap.prepareInstanceMethod(isNew, astInfo);
                    this.source.clear();
                    return undefined;
                });
            case 'delete':
                return new FFunction(({ args, isNew }) => {
                    FMap.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    const result = this.source.delete(key);
                    return new FBoolean(result);
                });
            case 'forEach':
                return new FFunction(({ args, isNew }) => {
                    FMap.prepareInstanceMethod(isNew, astInfo);
                    const callbackfn = beginCast(args[0], astInfo).addFunction().cast()(false);
                    this.source.forEach((value, key) => callbackfn([this.convertValue(value), toFValue(key)]));
                    return undefined;
                });
            case 'get':
                return new FFunction(({ args, isNew }) => {
                    FMap.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    const value = this.source.get(key);
                    return this.convertValue(value);
                });
            case 'has':
                return new FFunction(({ args, isNew }) => {
                    FMap.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    const value = this.source.has(key);
                    return new FBoolean(value);
                });
            case 'size':
                return new FNumber(this.source.size);
            case 'set':
                return new FFunction(({ args, isNew }) => {
                    FMap.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    const value = this.convertValueBack(args[1], astInfo);
                    this.source.set(key, value);
                    return undefined;
                });
        }
        return undefined;
    }
    setCore(params) {
        throw new ScriptError('You cannot set any value to Map', params.astInfo?.range);
    }
    iterate() {
        return mapIterator(this.source[Symbol.iterator](), ([keySource, valueSource]) => {
            const key = toFValue(keySource);
            const value = this.convertValue(valueSource);
            return FArray.create([key, value]);
        });
    }
    toPrimitiveAsString() {
        return '[object Map]';
    }
    toPrimitiveAsNumber() {
        return NaN;
    }
    // 正確な型が表現できないのでvalueはunknownとしている
    toJObject() {
        const result = new Map();
        this.source.forEach((value, key) => {
            const converted = this.convertValue(value);
            result.set(key, converted == null ? converted : converted.toJObject());
        });
        return result;
    }
}

function toFValue(source) {
    if (source === null) {
        return null;
    }
    if (source === undefined) {
        return undefined;
    }
    switch (typeof source) {
        case 'boolean':
            return new FBoolean(source);
        case 'number':
            return new FNumber(source);
        case 'string':
            return new FString(source);
        case 'symbol':
            return new FSymbol(source);
        case 'function':
            throw new Error('Function is not supported. Use FFunction instead.');
    }
    if (source instanceof FArray ||
        source instanceof FBoolean ||
        source instanceof FFunction ||
        source instanceof FNumber ||
        source instanceof FObject ||
        source instanceof FString ||
        source instanceof FSymbol) {
        return source;
    }
    if (Array.isArray(source)) {
        return FArray.create(source.map(x => toFValue(x)));
    }
    if (source instanceof Map) {
        return FMap.create(source);
    }
    return toFRecord(source);
}

// __proto__ のチェックなどは行われない
const toFRecord = (source) => {
    const result = new FRecord();
    for (const key in source) {
        result.set({
            property: new FString(key),
            newValue: toFValue(source[key]),
            astInfo: undefined,
        });
    }
    return result;
};

// keyが'self'か'globalThis'である要素は無視されることに注意
function toFGlobalRecord(source) {
    return new FGlobalRecord(toFRecord(source));
}

function ofFLiteral(literal) {
    if (literal.value == null) {
        return null;
    }
    switch (typeof literal.value) {
        case 'boolean':
            return new FBoolean(literal.value);
        case 'string':
            return new FString(literal.value);
        case 'number':
            return new FNumber(literal.value);
        default:
            throw new Error('This should not happen.');
    }
}
// @types/estree では CallExpression = SimpleCallExpression | NewExpression なのでそれに合わせた命名をしている
function ofFCallExpression(expression, context, isChain, isNew) {
    const callee = ofFExpression(expression.callee, context);
    const args = expression.arguments.map(arg => {
        return ofFExpression(arg, context);
    });
    if (isChain && callee == null) {
        return undefined;
    }
    if (callee?.type !== FType.Function) {
        throw new Error(`${callee} is not a function`);
    }
    return callee.exec({ args, isNew: isNew != null, astInfo: { range: toRange(expression) } });
}
function ofFMemberExpressionAsGet(expression, context, isChain) {
    const object = ofFExpression(expression.object, context);
    if (object == null) {
        if (isChain) {
            return undefined;
        }
        throw new Error('object is null or undefined');
    }
    if (expression.computed) {
        const property = ofFExpression(expression.property, context);
        return object.get({ property, astInfo: { range: toRange(expression) } });
    }
    if (expression.property.type !== 'Identifier') {
        throw new Error('this should not happen');
    }
    return object.get({
        property: new FString(expression.property.name),
        astInfo: { range: toRange(expression) },
    });
}
function ofFMemberExpressionAsAssign(expression, newValue, context) {
    const object = ofFExpression(expression.object, context);
    let property;
    if (!expression.computed && expression.property.type === 'Identifier') {
        property = new FString(expression.property.name);
    }
    else {
        property = ofFExpression(expression.property, context);
    }
    if (object == null) {
        throw new Error(`Object is ${toTypeName(object)}`);
    }
    object.set({
        property,
        newValue: newValue,
        astInfo: { range: toRange(expression) },
    });
    return undefined;
}
function ofFPattern(pattern, context, kind, value, 
// let {a, ...b} = foo; のbのようにbにobjectが入る場面では'object'を、let [a, ...b] = bar; のbのようにbにArrayが入る場面では'array'を渡す。
// function f(...p) { return p; } のpの場面ではArrayが入るため'array'を渡す。再帰以外でofFPatternが呼ばれてなおかつpatternがRestElementであるケースはそれしかないと思われるため、引数のデフォルト値は'array'としている。
setToRestElementAs = 'array') {
    switch (pattern.type) {
        case 'Identifier':
            switch (kind) {
                case 'assign':
                    context.assign(pattern.name, value, toRange(pattern));
                    return;
                default:
                    context.declare(pattern.name, value, kind);
                    return;
            }
        case 'AssignmentPattern':
            // JavaScriptでは引数が存在しない場合は引数がundefinedとみなされるため、このように単にundefinedかどうかチェックするだけでよい。
            ofFPattern(pattern.left, context, kind, value === undefined ? ofFExpression(pattern.right, context) : value, setToRestElementAs);
            return;
        case 'MemberExpression':
            ofFMemberExpressionAsAssign(pattern, value, context);
            return;
        case 'ArrayPattern': {
            const valueAsFObjectBase = value;
            if (valueAsFObjectBase?.iterate == null) {
                throw new ScriptError(`${value} is not iterable`);
            }
            const valueIterator = valueAsFObjectBase.iterate();
            const valueIteratorNext = () => {
                const next = valueIterator.next();
                if (next.done) {
                    return undefined;
                }
                return next.value;
            };
            for (const arrayPatternElement of pattern.elements) {
                if (arrayPatternElement?.type === 'RestElement') {
                    ofFPattern(arrayPatternElement.argument, context, kind, FArray.create(getRestValues(valueIterator)), setToRestElementAs);
                    // RestElementはArrayPatternの最後にしか存在し得ないため、breakで抜けてしまって構わない。
                    break;
                }
                const rightValueElement = valueIteratorNext();
                if (arrayPatternElement === null) {
                    continue;
                }
                ofFPattern(arrayPatternElement, context, kind, rightValueElement, 'array');
            }
            return;
        }
        case 'ObjectPattern': {
            if (value == null) {
                throw new ScriptError(`${value} has no properties`);
            }
            // 本題の前に前提として、ObjectPattern内にRestElementがある場合、FRecordでなければエラーとみなすようにしている。理由は、TypeScriptでも同様の挙動を示すため（JavaScriptではエラーは出ないが、TypeScriptとして使う前提であるため考慮していない）。
            // RestElementが来たときにそれ以前に書かれたプロパティを除外していなければならないため、valueがFRecordであれば、それらを除外した状態のオブジェクトをnextValueとして保持している。ただし、FRecordでない場合はnextValueは常にvalueと等しくなる。これは、RestElementはFRecordに対応していないので、FRecord以外のオブジェクトのプロパティを除外する必要がないため。
            let nextValue = value;
            for (const objectPatternProperty of pattern.properties) {
                if (objectPatternProperty.type === 'RestElement') {
                    ofFPattern(objectPatternProperty, context, kind, nextValue, 'object');
                    continue;
                }
                if (objectPatternProperty.key.type === 'Literal') {
                    // どのような場面でここに来るのかまだ分かっていない
                    throw new ScriptError('Literal as a key of ObjectPattern is not supported');
                }
                const key = new FString(objectPatternProperty.key.name);
                switch (kind) {
                    case 'assign':
                        context.assign(objectPatternProperty.key.name, nextValue.get({ property: key, astInfo: objectPatternProperty.key }), toRange(pattern));
                        break;
                    default:
                        context.declare(objectPatternProperty.key.name, nextValue.get({ property: key, astInfo: objectPatternProperty.key }), kind);
                        break;
                }
                if (value instanceof FRecord) {
                    const $nextValue = value.clone();
                    $nextValue.source.delete(objectPatternProperty.key.name);
                    nextValue = $nextValue;
                }
                else {
                    nextValue = value;
                }
            }
            return;
        }
        case 'RestElement':
            if (setToRestElementAs === 'array') {
                const valueAsFObjectBase = value;
                if (valueAsFObjectBase?.iterate == null) {
                    throw new ScriptError(`${value} is not iterable`);
                }
                ofFPattern(pattern.argument, context, kind, value, 'array');
                return;
            }
            ofFPattern(pattern.argument, context, kind, value, 'object');
            return;
    }
}
/*
let x; や let x = 1; のようなコードでは、valueToSetにundefinedを渡す。
for (let x of [1]) {} のようなコードではinitはnullishであるため、valueToSetに1を渡さなければならない。
*/
function ofFVariableDeclaration(statement, context, valueToSet) {
    const kind = statement.kind;
    statement.declarations.forEach(d => {
        // let x; のような場合は let x = undefined; と同等とみなして良さそう。const x; はparseの時点で弾かれるはず。
        ofFPattern(d.id, context, kind, d.init == null ? valueToSet : ofFExpression(d.init, context));
    });
}
function ofFExpression(expression, context) {
    switch (expression.type) {
        case 'ArrayExpression': {
            const result = [];
            expression.elements.forEach(d => {
                if (d === null) {
                    result.push(null);
                    return;
                }
                if (!d.isSpread) {
                    result.push(ofFExpression(d.expression, context));
                    return;
                }
                const argument = ofFExpression(d.argument, context);
                if (argument == null || argument.iterate == null) {
                    throw new ScriptError(`${argument?.toPrimitiveAsString()} is not iterable`, toRange(d.argument));
                }
                for (const elem of argument.iterate()) {
                    result.push(elem);
                }
            });
            return FArray.create(result);
        }
        case 'ArrowFunctionExpression': {
            const f = ({ args, isNew }) => {
                if (isNew) {
                    throw new ScriptError('ArrowFunction is not a constructor', toRange(expression));
                }
                context.scopeIn();
                expression.params.forEach((param, i) => {
                    ofFPattern(param, context, 'let', args[i]);
                });
                if (expression.body.type === 'BlockStatement') {
                    const result = ofFStatement(expression.body, context);
                    context.scopeOut();
                    if (result.type === 'earlyReturn') {
                        return result.value;
                    }
                    return undefined;
                }
                const result = ofFExpression(expression.body, context);
                context.scopeOut();
                return result;
            };
            return new FFunction(f);
        }
        case 'AssignmentExpression': {
            if (expression.operator === '=') {
                const newValue = ofFExpression(expression.right, context);
                switch (expression.left.type) {
                    case 'Identifier': {
                        context.assign(expression.left.name, newValue, toRange(expression));
                        return newValue;
                    }
                    case 'MemberExpression': {
                        ofFMemberExpressionAsAssign(expression.left, newValue, context);
                        return newValue;
                    }
                }
            }
            let oldValue;
            let newValue;
            if (expression.left.type === 'Identifier') {
                oldValue = context.get(expression.left.name, toRange(expression.left));
            }
            else {
                oldValue = ofFMemberExpressionAsGet(expression.left, context, false);
            }
            const right = ofFExpression(expression.right, context);
            switch (expression.operator) {
                case '+=':
                    newValue = compareToNumber(oldValue, right, 'default', (l, r) => l + r);
                    break;
                case '-=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l - r);
                    break;
                case '%=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l % r);
                    break;
                case '&=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l & r);
                    break;
                case '*=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l * r);
                    break;
                case '**=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l ** r);
                    break;
                case '/=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l / r);
                    break;
                case '<<=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l << r);
                    break;
                case '>>=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l >> r);
                    break;
                case '>>>=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l >>> r);
                    break;
                case '^=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l ^ r);
                    break;
                case '|=':
                    newValue = compareToNumber(oldValue, right, 'number', (l, r) => l | r);
                    break;
            }
            if (expression.left.type === 'Identifier') {
                context.assign(expression.left.name, newValue, toRange(expression));
            }
            else {
                ofFMemberExpressionAsAssign(expression.left, newValue, context);
            }
            return newValue;
        }
        case 'BinaryExpression': {
            const left = ofFExpression(expression.left, context);
            const right = ofFExpression(expression.right, context);
            switch (expression.operator) {
                case '!=':
                    return new FBoolean(!eqeq(left, right));
                case '!==':
                    return new FBoolean(!eqeqeq(left, right));
                case '%':
                    return compareToNumber(left, right, 'number', (l, r) => l % r);
                case '&':
                    return compareToNumber(left, right, 'number', (l, r) => l & r);
                case '*':
                    return compareToNumber(left, right, 'number', (l, r) => l * r);
                case '**':
                    return compareToNumber(left, right, 'number', (l, r) => l ** r);
                case '+':
                    return compareToNumberOrString(left, right, 'default', (l, r) => l + r);
                case '-':
                    return compareToNumber(left, right, 'number', (l, r) => l - r);
                case '/':
                    return compareToNumber(left, right, 'number', (l, r) => l / r);
                case '<':
                    return compareToBoolean(left, right, 'JObject', (l, r) => l < r);
                case '<<':
                    return compareToNumber(left, right, 'number', (l, r) => l << r);
                case '<=':
                    return compareToBoolean(left, right, 'JObject', (l, r) => l <= r);
                case '==':
                    return new FBoolean(eqeq(left, right));
                case '===':
                    return new FBoolean(eqeqeq(left, right));
                case '>':
                    return compareToBoolean(left, right, 'JObject', (l, r) => l > r);
                case '>=':
                    return compareToBoolean(left, right, 'JObject', (l, r) => l >= r);
                case '>>':
                    return compareToNumber(left, right, 'number', (l, r) => l >> r);
                case '>>>':
                    return compareToNumber(left, right, 'number', (l, r) => l >>> r);
                case '^':
                    return compareToNumber(left, right, 'number', (l, r) => l ^ r);
                case '|':
                    return compareToNumber(left, right, 'number', (l, r) => l | r);
            }
            break;
        }
        case 'CallExpression': {
            return ofFCallExpression(expression, context, false);
        }
        case 'ChainExpression': {
            switch (expression.expression.type) {
                case 'CallExpression': {
                    return ofFCallExpression(expression.expression, context, true);
                }
                case 'MemberExpression': {
                    return ofFMemberExpressionAsGet(expression.expression, context, true);
                }
            }
            break;
        }
        case 'ConditionalExpression': {
            const test = ofFExpression(expression.test, context);
            if (test) {
                return ofFExpression(expression.consequent, context);
            }
            return ofFExpression(expression.alternate, context);
        }
        case 'Identifier': {
            // a; のようなコードであれば正常に処理される
            // a.b; のようなコードではbがIdentifierになるがこのケースでは正常に処理されない（代わりにMemberExpressionやAssignmentExpressionで処理されなければならない）
            return context.get(expression.name, toRange(expression));
        }
        case 'Literal': {
            return ofFLiteral(expression);
        }
        case 'LogicalExpression': {
            const left = ofFExpression(expression.left, context);
            const right = ofFExpression(expression.right, context);
            switch (expression.operator) {
                case '&&':
                    return isTruthy(left) ? right : left;
                case '??':
                    return left ?? right;
                case '||':
                    return !isTruthy(left) ? right : left;
            }
            break;
        }
        case 'MemberExpression': {
            return ofFMemberExpressionAsGet(expression, context, false);
        }
        case 'NewExpression': {
            return ofFCallExpression(expression, context, false, 'new');
        }
        case 'ObjectExpression': {
            const result = new FRecord();
            expression.properties.forEach(d => {
                if (d.isSpread) {
                    const spreadObject = ofFExpression(d.argument, context);
                    if (spreadObject instanceof FRecord) {
                        spreadObject.forEach((value, key) => {
                            result.source.set(key, value);
                        });
                    }
                    else {
                        throw new ScriptError('Record is expected, but actually not.', toRange(d.argument));
                    }
                    return;
                }
                let key;
                switch (d.property.key.type) {
                    case 'Literal': {
                        const literal = ofFLiteral(d.property.key);
                        switch (typeof literal) {
                            case 'string':
                            case 'number':
                                key = literal;
                                break;
                            default:
                                throw new Error('this should not happen');
                        }
                        break;
                    }
                    case 'Identifier': {
                        key = d.property.key.name;
                        break;
                    }
                }
                const value = ofFExpression(d.property.value, context);
                switch (d.property.kind) {
                    case 'init':
                        result.set({
                            property: new FString(key),
                            newValue: value,
                            astInfo: { range: toRange(d.property.value) },
                        });
                        break;
                }
            });
            return result;
        }
        case 'ThisExpression':
            /*
            javascriptのthisは複雑な挙動を示す。そのため、functionやclassを使用不可能にすることで、常にthis===globalThisとして扱えるようにして実装を簡略化している。ただし、これにより例えば下のコードにおいて本来のjavascriptと異なる挙動を示す。本来のjavascriptであればエラーだが、このライブラリでは正常に終了しaは[1]となる。

            let a = [];
            let f = a.push;
            f(1);

            thisを完全に無効化してglobalThisを使ってもらうという作戦は、monaco editorの設定がうまくいかなかったので却下。
            */
            return context.globalThis;
        case 'UnaryExpression': {
            const argument = ofFExpression(expression.argument, context);
            switch (expression.operator) {
                case '!':
                    return new FBoolean(!isTruthy(argument));
                case '+':
                    return argument == null
                        ? argument
                        : new FNumber(argument.toPrimitiveAsNumber());
                case '-':
                    return argument == null
                        ? argument
                        : new FNumber(-argument.toPrimitiveAsNumber());
                case '~':
                    return argument == null
                        ? argument
                        : new FNumber(~argument.toPrimitiveAsNumber());
                case 'typeof':
                    if (argument == null) {
                        return new FString(typeof argument);
                    }
                    switch (argument.type) {
                        case FType.Boolean:
                            return new FString('boolean');
                        case FType.Function:
                            return new FString('function');
                        case FType.Number:
                            return new FString('number');
                        case FType.String:
                            return new FString('string');
                        case FType.Symbol:
                            return new FString('symbol');
                        default:
                            return new FString('object');
                    }
            }
            break;
        }
        case 'UpdateExpression': {
            let oldValue;
            let newValue;
            if (expression.argument.type === 'Identifier') {
                oldValue = context.get(expression.argument.name, toRange(expression.argument));
                newValue = compareToNumber(oldValue, new FNumber(expression.operator === '++' ? 1 : -1), 'number', (left, right) => left + right);
                context.assign(expression.argument.name, newValue, toRange(expression));
            }
            else {
                oldValue = ofFMemberExpressionAsGet(expression.argument, context, false);
                newValue = compareToNumber(oldValue, new FNumber(expression.operator === '++' ? 1 : -1), 'number', (left, right) => left + right);
                ofFMemberExpressionAsAssign(expression.argument, newValue, context);
            }
            return expression.prefix ? newValue : oldValue;
        }
        default:
            throw new Error('this should not happen');
    }
}
function ofFStatement(statement, context) {
    switch (statement.type) {
        case 'BlockStatement': {
            context.scopeIn();
            for (const b of statement.body) {
                const bodyResult = ofFStatement(b, context);
                if (bodyResult.type !== 'end') {
                    context.scopeOut();
                    return bodyResult;
                }
            }
            context.scopeOut();
            return { type: 'end', value: undefined };
        }
        case 'BreakStatement':
            return { type: 'break' };
        case 'ContinueStatement':
            return { type: 'continue' };
        case 'ReturnStatement':
            return {
                type: 'earlyReturn',
                value: statement.argument == null
                    ? undefined
                    : ofFExpression(statement.argument, context),
            };
        case 'ExpressionStatement': {
            return {
                type: 'end',
                value: ofFExpression(statement.expression, context),
            };
        }
        case 'ForOfStatement': {
            if (statement.await) {
                throw new ScriptError('await is not supported');
            }
            const rightValue = ofFExpression(statement.right, context);
            const rightValueAsFObjectBase = rightValue;
            if (rightValueAsFObjectBase?.iterate == null) {
                throw new ScriptError(`${rightValue?.toPrimitiveAsString()} is not iterable`);
            }
            for (const elem of rightValueAsFObjectBase.iterate()) {
                context.scopeIn();
                switch (statement.left.type) {
                    case 'Identifier':
                        context.assign(statement.left.name, elem, statement.left.range);
                        break;
                    case 'MemberExpression': {
                        ofFMemberExpressionAsAssign(statement.left, elem, context);
                        break;
                    }
                    case 'VariableDeclaration':
                        ofFVariableDeclaration(statement.left, context, elem);
                        break;
                    default:
                        throw new ScriptError(`${statement.left.type} is not supported yet.`, toRange(statement.left));
                }
                ofFStatement(statement.body, context);
                context.scopeOut();
            }
            return { type: 'end', value: undefined };
        }
        case 'ForStatement': {
            context.scopeIn();
            if (statement.init != null) {
                if (statement.init.type === 'VariableDeclaration') {
                    ofFVariableDeclaration(statement.init, context);
                }
                else {
                    ofFExpression(statement.init, context);
                }
            }
            let isFirstLoop = true;
            // eslint-disable-next-line no-constant-condition
            while (true) {
                if (!isFirstLoop && statement.update != null) {
                    ofFExpression(statement.update, context);
                }
                isFirstLoop = false;
                if (statement.test != null) {
                    const test = ofFExpression(statement.test, context);
                    if (!isTruthy(test)) {
                        break;
                    }
                }
                const bodyResult = ofFStatement(statement.body, context);
                if (bodyResult.type === 'earlyReturn') {
                    context.scopeOut();
                    return { type: 'end', value: bodyResult.value };
                }
                else if (bodyResult.type === 'break') {
                    break;
                }
            }
            context.scopeOut();
            return { type: 'end', value: undefined };
        }
        case 'IfStatement': {
            const test = ofFExpression(statement.test, context);
            if (toJObject(test)) {
                return ofFStatement(statement.consequent, context);
            }
            if (statement.alternate == null) {
                return { type: 'end', value: undefined };
            }
            return ofFStatement(statement.alternate, context);
        }
        case 'SwitchStatement': {
            const discriminant = ofFExpression(statement.discriminant, context);
            let caseMatched = false;
            for (const $case of statement.cases) {
                if ($case.test == null || // default:のときは$case.test==nullとなる
                    toJObject(discriminant) === toJObject(ofFExpression($case.test, context))) {
                    caseMatched = true;
                }
                // caseにどれか1つでもマッチしたら、breakなどがない限りはそれ以降のcaseもすべてマッチする扱いとなる。いわゆるフォールスルー。
                if (!caseMatched) {
                    continue;
                }
                for (const consequent of $case.consequent) {
                    const consequentResult = ofFStatement(consequent, context);
                    switch (consequentResult.type) {
                        case 'earlyReturn':
                        case 'continue':
                            return consequentResult;
                        case 'break':
                            return { type: 'end', value: undefined };
                    }
                }
            }
            return { type: 'end', value: undefined };
        }
        case 'VariableDeclaration': {
            ofFVariableDeclaration(statement, context);
            return { type: 'end', value: undefined };
        }
    }
}
const toProgram = (script) => {
    // @types/estreeが2020までにしか対応していない模様（AssignmentOperatorに&&=などがない）ため、acornもとりあえず2020としている。
    return parse(script, { ecmaVersion: 2020, ranges: true });
};
// globalThisは、FValueであればそのまま維持し、それ以外であればFValueに自動変換される。
const exec = (script, globalThis) => {
    const parsed = toProgram(script);
    const context = new Context(toFGlobalRecord(globalThis));
    const lastResult = parsed.body.map(statement => {
        return ofFStatement(fStatement(statement), context);
    })[parsed.body.length - 1];
    let result;
    if (lastResult?.type === 'end') {
        result = lastResult.value == null ? lastResult.value : lastResult.value.toJObject();
    }
    else {
        result = undefined;
    }
    return {
        result,
        getGlobalThis: () => context.globalThis.toJObject(),
    };
};
// エディターなどでエラーをチェックする際に用いる
const test = (script) => {
    const parsed = toProgram(script);
    parsed.body.forEach(statement => {
        fStatement(statement);
    });
};

class FArrayClass extends FFunction {
    constructor() {
        super(() => {
            throw new Error('Array constructor is not supported');
        });
    }
    static prepareStaticMethod(isNew, astInfo) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }
    onGetting({ key, astInfo }) {
        switch (key) {
            case 'isArray': {
                return Option.some(new FFunction(({ args, isNew }) => {
                    FArrayClass.prepareStaticMethod(isNew, astInfo);
                    const arg = args[0];
                    return new FBoolean(arg?.type === FType.Array);
                }));
            }
            default:
                return Option.none();
        }
    }
}
const arrayClass = new FArrayClass();

class FConsoleClass extends FFunction {
    header;
    constructor(header) {
        super(() => {
            throw new Error('console constructor is not supported');
        });
        this.header = header;
    }
    static prepareStaticMethod(isNew, astInfo) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }
    onGetting({ key, astInfo }) {
        switch (key) {
            case 'log': {
                return Option.some(new FFunction(({ args, isNew }) => {
                    FConsoleClass.prepareStaticMethod(isNew, astInfo);
                    // eslint-disable-next-line no-console
                    console.log(...[this.header, ...args.map(arg => toJObject(arg))]);
                    return undefined;
                }));
            }
            case 'info': {
                return Option.some(new FFunction(({ args, isNew }) => {
                    FConsoleClass.prepareStaticMethod(isNew, astInfo);
                    // eslint-disable-next-line no-console
                    console.info(...[this.header, ...args.map(arg => toJObject(arg))]);
                    return undefined;
                }));
            }
            case 'warn': {
                return Option.some(new FFunction(({ args, isNew }) => {
                    FConsoleClass.prepareStaticMethod(isNew, astInfo);
                    // eslint-disable-next-line no-console
                    console.warn(...[this.header, ...args.map(arg => toJObject(arg))]);
                    return undefined;
                }));
            }
            case 'error': {
                return Option.some(new FFunction(({ args, isNew }) => {
                    FConsoleClass.prepareStaticMethod(isNew, astInfo);
                    // eslint-disable-next-line no-console
                    console.error(...[this.header, ...args.map(arg => toJObject(arg))]);
                    return undefined;
                }));
            }
            default:
                return Option.none();
        }
    }
}
const createConsoleClass = (header) => new FConsoleClass(header);

class FMapClass extends FFunction {
    constructor() {
        super(({ isNew }) => {
            if (!isNew) {
                throw ScriptError.requiresNewError();
            }
            return FMap.create(new Map());
        });
    }
}
const mapClass = new FMapClass();

class FSymbolClass extends FFunction {
    constructor() {
        super(({ isNew, args, astInfo }) => {
            if (isNew) {
                throw ScriptError.notConstructorError();
            }
            const description = beginCast(args[0], astInfo).addString().addUndefined().cast();
            return new FSymbol(Symbol(description));
        });
    }
    onGetting({ key }) {
        switch (key) {
            case 'iterator': {
                return Option.some(new FSymbol(Symbol.iterator));
            }
            default:
                return Option.none();
        }
    }
}
const symbolClass = new FSymbolClass();

// Recordのkeyのジェネリック化は、convertKeyBackの処理の場合分けが難しいと思われるため不採用。
class FRecordRef extends FObject {
    source;
    convertValue;
    convertValueBack;
    constructor(source, convertValue, convertValueBack) {
        super();
        this.source = source;
        this.convertValue = convertValue;
        this.convertValueBack = convertValueBack;
    }
    prepareInstanceMethod(isNew, astInfo) {
        if (isNew) {
            throw ScriptError.notConstructorError(astInfo?.range);
        }
    }
    convertKeyBack(source, astInfo) {
        return beginCast(source, astInfo).addString().cast();
    }
    validateKey(key) {
        const fail = () => {
            throw new ScriptError(`You cannot use "${key}" as a key`);
        };
        switch (key) {
            case 'toString':
            case 'toLocaleString':
            case 'valueOf':
            case 'hasOwnProperty':
            case 'isPrototypeOf':
            case 'propertyIsEnumerable':
            case 'constructor':
            case 'prototype':
                fail();
        }
        // __proto__の他に、念のため__defineSetter__なども弾けるような処理をしている
        if (key.startsWith('__')) {
            fail();
        }
    }
    get type() {
        return FType.Object;
    }
    getCore(params) {
        const { key, astInfo } = params;
        switch (key) {
            case 'delete':
                return new FFunction(({ args, isNew }) => {
                    this.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    this.validateKey(key);
                    delete this.source[key];
                    return undefined;
                });
            case 'forEach':
                return new FFunction(({ args, isNew }) => {
                    this.prepareInstanceMethod(isNew, astInfo);
                    const callbackfn = beginCast(args[0], astInfo).addFunction().cast()(false);
                    for (const key in this.source) {
                        const value = this.source[key];
                        if (value == null) {
                            throw new Error('this should not happen');
                        }
                        callbackfn([this.convertValue(value), toFValue(key)]);
                    }
                    return undefined;
                });
            case 'get':
                return new FFunction(({ args, isNew }) => {
                    this.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    this.validateKey(key);
                    const value = this.source[key];
                    if (value === undefined) {
                        return undefined;
                    }
                    return this.convertValue(value);
                });
            case 'has':
                return new FFunction(({ args, isNew }) => {
                    this.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    this.validateKey(key);
                    return new FBoolean(key in this.source);
                });
            case 'set':
                return new FFunction(({ args, isNew }) => {
                    this.prepareInstanceMethod(isNew, astInfo);
                    const key = this.convertKeyBack(args[0], astInfo);
                    this.validateKey(key);
                    const value = this.convertValueBack(args[1], astInfo);
                    this.source[key] = value;
                    return undefined;
                });
        }
        return undefined;
    }
    setCore(params) {
        throw new ScriptError('You cannot set any value to this object', params.astInfo?.range);
    }
    toPrimitiveAsString() {
        return '[object Object]';
    }
    toPrimitiveAsNumber() {
        return NaN;
    }
    toJObject() {
        return this.source;
    }
    equals(other) {
        if (other instanceof FRecordRef) {
            return this.source === other.source;
        }
        return false;
    }
}

export { FArray, FBoolean, FFunction, FMap, FNumber, FObject, FRecord, FRecordRef, FString, FSymbol, FType, FTypedArray, ScriptError, arrayClass, beginCast, createConsoleClass, exec, mapClass, symbolClass, test, toFValue, toTypeName };
//# sourceMappingURL=index.js.map
