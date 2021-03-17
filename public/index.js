
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var check = function (it) {
	  return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global_1 =
	  /* global globalThis -- safe */
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func -- fallback
	  (function () { return this; })() || Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	// Detect IE8's incomplete defineProperty implementation
	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;

	var objectPropertyIsEnumerable = {
		f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var split = ''.split;

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins -- safe
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.es/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings



	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// `ToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document$1 = global_1.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS = isObject(document$1) && isObject(document$1.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document$1.createElement(it) : {};
	};

	// Thank's IE8 for his funny defineProperty
	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ }
	  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};

	var objectGetOwnPropertyDescriptor = {
		f: f$1
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true
	    : value == NATIVE ? false
	    : typeof detection == 'function' ? fails(detection)
	    : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';

	var isForced_1 = isForced;

	var path = {};

	var aFunction = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  } return it;
	};

	// optional / simple context binding
	var functionBindContext = function (fn, that, length) {
	  aFunction(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 0: return function () {
	      return fn.call(that);
	    };
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  } return it;
	};

	var nativeDefineProperty = Object.defineProperty;

	// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var objectDefineProperty = {
		f: f$2
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






	var wrapConstructor = function (NativeConstructor) {
	  var Wrapper = function (a, b, c) {
	    if (this instanceof NativeConstructor) {
	      switch (arguments.length) {
	        case 0: return new NativeConstructor();
	        case 1: return new NativeConstructor(a);
	        case 2: return new NativeConstructor(a, b);
	      } return new NativeConstructor(a, b, c);
	    } return NativeConstructor.apply(this, arguments);
	  };
	  Wrapper.prototype = NativeConstructor.prototype;
	  return Wrapper;
	};

	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var PROTO = options.proto;

	  var nativeSource = GLOBAL ? global_1 : STATIC ? global_1[TARGET] : (global_1[TARGET] || {}).prototype;

	  var target = GLOBAL ? path : path[TARGET] || (path[TARGET] = {});
	  var targetPrototype = target.prototype;

	  var FORCED, USE_NATIVE, VIRTUAL_PROTOTYPE;
	  var key, sourceProperty, targetProperty, nativeProperty, resultProperty, descriptor;

	  for (key in source) {
	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contains in native
	    USE_NATIVE = !FORCED && nativeSource && has(nativeSource, key);

	    targetProperty = target[key];

	    if (USE_NATIVE) if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(nativeSource, key);
	      nativeProperty = descriptor && descriptor.value;
	    } else nativeProperty = nativeSource[key];

	    // export native or implementation
	    sourceProperty = (USE_NATIVE && nativeProperty) ? nativeProperty : source[key];

	    if (USE_NATIVE && typeof targetProperty === typeof sourceProperty) continue;

	    // bind timers to global for call from export context
	    if (options.bind && USE_NATIVE) resultProperty = functionBindContext(sourceProperty, global_1);
	    // wrap global constructors for prevent changs in this version
	    else if (options.wrap && USE_NATIVE) resultProperty = wrapConstructor(sourceProperty);
	    // make static versions for prototype methods
	    else if (PROTO && typeof sourceProperty == 'function') resultProperty = functionBindContext(Function.call, sourceProperty);
	    // default case
	    else resultProperty = sourceProperty;

	    // add a flag to not completely full polyfills
	    if (options.sham || (sourceProperty && sourceProperty.sham) || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty(resultProperty, 'sham', true);
	    }

	    target[key] = resultProperty;

	    if (PROTO) {
	      VIRTUAL_PROTOTYPE = TARGET + 'Prototype';
	      if (!has(path, VIRTUAL_PROTOTYPE)) {
	        createNonEnumerableProperty(path, VIRTUAL_PROTOTYPE, {});
	      }
	      // export virtual prototype methods
	      path[VIRTUAL_PROTOTYPE][key] = sourceProperty;
	      // export real prototype methods
	      if (options.real && targetPrototype && !targetPrototype[key]) {
	        createNonEnumerableProperty(targetPrototype, key, sourceProperty);
	      }
	    }
	  }
	};

	// `IsArray` abstract operation
	// https://tc39.es/ecma262/#sec-isarray
	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	// `Array.isArray` method
	// https://tc39.es/ecma262/#sec-array.isarray
	_export({ target: 'Array', stat: true }, {
	  isArray: isArray
	});

	var isArray$1 = path.Array.isArray;

	var isArray$2 = isArray$1;

	var isArray$3 = isArray$2;

	var arrayWithHoles = createCommonjsModule(function (module) {
	function _arrayWithHoles(arr) {
	  if (isArray$3(arr)) return arr;
	}

	module.exports = _arrayWithHoles;
	module.exports["default"] = module.exports, module.exports.__esModule = true;
	});

	unwrapExports(arrayWithHoles);

	// `ToObject` abstract operation
	// https://tc39.es/ecma262/#sec-toobject
	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	var ceil = Math.ceil;
	var floor = Math.floor;

	// `ToInteger` abstract operation
	// https://tc39.es/ecma262/#sec-tointeger
	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min;

	// `ToLength` abstract operation
	// https://tc39.es/ecma262/#sec-tolength
	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var createProperty = function (object, key, value) {
	  var propertyKey = toPrimitive(key);
	  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
	  else object[propertyKey] = value;
	};

	var setGlobal = function (key, value) {
	  try {
	    createNonEnumerableProperty(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  } return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});

	var sharedStore = store;

	var shared = createCommonjsModule(function (module) {
	(module.exports = function (key, value) {
	  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.9.1',
	  mode:  'pure' ,
	  copyright: '© 2021 Denis Pushkarev (zloirock.ru)'
	});
	});

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var engineIsNode = classofRaw(global_1.process) == 'process';

	var aFunction$1 = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction$1(path[namespace]) || aFunction$1(global_1[namespace])
	    : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

	var process = global_1.process;
	var versions = process && process.versions;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  version = match[0] + match[1];
	} else if (engineUserAgent) {
	  match = engineUserAgent.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = engineUserAgent.match(/Chrome\/(\d+)/);
	    if (match) version = match[1];
	  }
	}

	var engineV8Version = version && +version;

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  /* global Symbol -- required for testing */
	  return !Symbol.sham &&
	    // Chrome 38 Symbol has incorrect toString conversion
	    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
	    (engineIsNode ? engineV8Version === 38 : engineV8Version > 37 && engineV8Version < 41);
	});

	var useSymbolAsUid = nativeSymbol
	  /* global Symbol -- safe */
	  && !Symbol.sham
	  && typeof Symbol.iterator == 'symbol';

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global_1.Symbol;
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

	var wellKnownSymbol = function (name) {
	  if (!has(WellKnownSymbolsStore, name) || !(nativeSymbol || typeof WellKnownSymbolsStore[name] == 'string')) {
	    if (nativeSymbol && has(Symbol$1, name)) {
	      WellKnownSymbolsStore[name] = Symbol$1[name];
	    } else {
	      WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	    }
	  } return WellKnownSymbolsStore[name];
	};

	var SPECIES = wellKnownSymbol('species');

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	var arraySpeciesCreate = function (originalArray, length) {
	  var C;
	  if (isArray(originalArray)) {
	    C = originalArray.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
	    else if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var SPECIES$1 = wellKnownSymbol('species');

	var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return engineV8Version >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};
	    constructor[SPECIES$1] = function () {
	      return { foo: 1 };
	    };
	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

	// We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/679
	var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
	  var array = [];
	  array[IS_CONCAT_SPREADABLE] = false;
	  return array.concat()[0] !== array;
	});

	var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

	var isConcatSpreadable = function (O) {
	  if (!isObject(O)) return false;
	  var spreadable = O[IS_CONCAT_SPREADABLE];
	  return spreadable !== undefined ? !!spreadable : isArray(O);
	};

	var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

	// `Array.prototype.concat` method
	// https://tc39.es/ecma262/#sec-array.prototype.concat
	// with adding support of @@isConcatSpreadable and @@species
	_export({ target: 'Array', proto: true, forced: FORCED }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  concat: function concat(arg) {
	    var O = toObject(this);
	    var A = arraySpeciesCreate(O, 0);
	    var n = 0;
	    var i, k, length, len, E;
	    for (i = -1, length = arguments.length; i < length; i++) {
	      E = i === -1 ? O : arguments[i];
	      if (isConcatSpreadable(E)) {
	        len = toLength(E.length);
	        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
	      } else {
	        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        createProperty(A, n++, E);
	      }
	    }
	    A.length = n;
	    return A;
	  }
	});

	var max = Math.max;
	var min$1 = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare -- NaN check
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.es/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.es/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var hiddenKeys = {};

	var indexOf = arrayIncludes.indexOf;


	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	// `Object.keys` method
	// https://tc39.es/ecma262/#sec-object.keys
	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// `Object.defineProperties` method
	// https://tc39.es/ecma262/#sec-object.defineproperties
	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
	  return O;
	};

	var html = getBuiltIn('document', 'documentElement');

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');

	var EmptyConstructor = function () { /* empty */ };

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak
	  return temp;
	};

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject -- old IE */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;
	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO] = true;

	// `Object.create` method
	// https://tc39.es/ecma262/#sec-object.create
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.es/ecma262/#sec-object.getownpropertynames
	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
		f: f$3
	};

	var nativeGetOwnPropertyNames = objectGetOwnPropertyNames.f;

	var toString$1 = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function (it) {
	  try {
	    return nativeGetOwnPropertyNames(it);
	  } catch (error) {
	    return windowNames.slice();
	  }
	};

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var f$4 = function getOwnPropertyNames(it) {
	  return windowNames && toString$1.call(it) == '[object Window]'
	    ? getWindowNames(it)
	    : nativeGetOwnPropertyNames(toIndexedObject(it));
	};

	var objectGetOwnPropertyNamesExternal = {
		f: f$4
	};

	var f$5 = Object.getOwnPropertySymbols;

	var objectGetOwnPropertySymbols = {
		f: f$5
	};

	var redefine = function (target, key, value, options) {
	  if (options && options.enumerable) target[key] = value;
	  else createNonEnumerableProperty(target, key, value);
	};

	var f$6 = wellKnownSymbol;

	var wellKnownSymbolWrapped = {
		f: f$6
	};

	var defineProperty = objectDefineProperty.f;

	var defineWellKnownSymbol = function (NAME) {
	  var Symbol = path.Symbol || (path.Symbol = {});
	  if (!has(Symbol, NAME)) defineProperty(Symbol, NAME, {
	    value: wellKnownSymbolWrapped.f(NAME)
	  });
	};

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	var test = {};

	test[TO_STRING_TAG] = 'z';

	var toStringTagSupport = String(test) === '[object z]';

	var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof = toStringTagSupport ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$1)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
	};

	// `Object.prototype.toString` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.tostring
	var objectToString = toStringTagSupport ? {}.toString : function toString() {
	  return '[object ' + classof(this) + ']';
	};

	var defineProperty$1 = objectDefineProperty.f;





	var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');

	var setToStringTag = function (it, TAG, STATIC, SET_METHOD) {
	  if (it) {
	    var target = STATIC ? it : it.prototype;
	    if (!has(target, TO_STRING_TAG$2)) {
	      defineProperty$1(target, TO_STRING_TAG$2, { configurable: true, value: TAG });
	    }
	    if (SET_METHOD && !toStringTagSupport) {
	      createNonEnumerableProperty(target, 'toString', objectToString);
	    }
	  }
	};

	var functionToString = Function.toString;

	// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
	if (typeof sharedStore.inspectSource != 'function') {
	  sharedStore.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap = global_1.WeakMap;

	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (nativeWeakMap) {
	  var store$1 = sharedStore.state || (sharedStore.state = new WeakMap$1());
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;
	  set = function (it, metadata) {
	    metadata.facade = it;
	    wmset.call(store$1, it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return wmget.call(store$1, it) || {};
	  };
	  has$1 = function (it) {
	    return wmhas.call(store$1, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;
	  set = function (it, metadata) {
	    metadata.facade = it;
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };
	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var push = [].push;

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterOut }` methods implementation
	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var IS_FILTER_OUT = TYPE == 7;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = functionBindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_OUT ? create($this, 0) : undefined;
	    var value, result;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	          case 3: return true;              // some
	          case 5: return value;             // find
	          case 6: return index;             // findIndex
	          case 2: push.call(target, value); // filter
	        } else switch (TYPE) {
	          case 4: return false;             // every
	          case 7: push.call(target, value); // filterOut
	        }
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.es/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$1(0),
	  // `Array.prototype.map` method
	  // https://tc39.es/ecma262/#sec-array.prototype.map
	  map: createMethod$1(1),
	  // `Array.prototype.filter` method
	  // https://tc39.es/ecma262/#sec-array.prototype.filter
	  filter: createMethod$1(2),
	  // `Array.prototype.some` method
	  // https://tc39.es/ecma262/#sec-array.prototype.some
	  some: createMethod$1(3),
	  // `Array.prototype.every` method
	  // https://tc39.es/ecma262/#sec-array.prototype.every
	  every: createMethod$1(4),
	  // `Array.prototype.find` method
	  // https://tc39.es/ecma262/#sec-array.prototype.find
	  find: createMethod$1(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$1(6),
	  // `Array.prototype.filterOut` method
	  // https://github.com/tc39/proposal-array-filtering
	  filterOut: createMethod$1(7)
	};

	var $forEach = arrayIteration.forEach;

	var HIDDEN = sharedKey('hidden');
	var SYMBOL = 'Symbol';
	var PROTOTYPE$1 = 'prototype';
	var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
	var setInternalState = internalState.set;
	var getInternalState = internalState.getterFor(SYMBOL);
	var ObjectPrototype = Object[PROTOTYPE$1];
	var $Symbol = global_1.Symbol;
	var $stringify = getBuiltIn('JSON', 'stringify');
	var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
	var nativeDefineProperty$1 = objectDefineProperty.f;
	var nativeGetOwnPropertyNames$1 = objectGetOwnPropertyNamesExternal.f;
	var nativePropertyIsEnumerable$1 = objectPropertyIsEnumerable.f;
	var AllSymbols = shared('symbols');
	var ObjectPrototypeSymbols = shared('op-symbols');
	var StringToSymbolRegistry = shared('string-to-symbol-registry');
	var SymbolToStringRegistry = shared('symbol-to-string-registry');
	var WellKnownSymbolsStore$1 = shared('wks');
	var QObject = global_1.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDescriptor = descriptors && fails(function () {
	  return objectCreate(nativeDefineProperty$1({}, 'a', {
	    get: function () { return nativeDefineProperty$1(this, 'a', { value: 7 }).a; }
	  })).a != 7;
	}) ? function (O, P, Attributes) {
	  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$1(ObjectPrototype, P);
	  if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
	  nativeDefineProperty$1(O, P, Attributes);
	  if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
	    nativeDefineProperty$1(ObjectPrototype, P, ObjectPrototypeDescriptor);
	  }
	} : nativeDefineProperty$1;

	var wrap = function (tag, description) {
	  var symbol = AllSymbols[tag] = objectCreate($Symbol[PROTOTYPE$1]);
	  setInternalState(symbol, {
	    type: SYMBOL,
	    tag: tag,
	    description: description
	  });
	  if (!descriptors) symbol.description = description;
	  return symbol;
	};

	var isSymbol = useSymbolAsUid ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  return Object(it) instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(O, P, Attributes) {
	  if (O === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
	  anObject(O);
	  var key = toPrimitive(P, true);
	  anObject(Attributes);
	  if (has(AllSymbols, key)) {
	    if (!Attributes.enumerable) {
	      if (!has(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor(1, {}));
	      O[HIDDEN][key] = true;
	    } else {
	      if (has(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
	      Attributes = objectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
	    } return setSymbolDescriptor(O, key, Attributes);
	  } return nativeDefineProperty$1(O, key, Attributes);
	};

	var $defineProperties = function defineProperties(O, Properties) {
	  anObject(O);
	  var properties = toIndexedObject(Properties);
	  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
	  $forEach(keys, function (key) {
	    if (!descriptors || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
	  });
	  return O;
	};

	var $create = function create(O, Properties) {
	  return Properties === undefined ? objectCreate(O) : $defineProperties(objectCreate(O), Properties);
	};

	var $propertyIsEnumerable = function propertyIsEnumerable(V) {
	  var P = toPrimitive(V, true);
	  var enumerable = nativePropertyIsEnumerable$1.call(this, P);
	  if (this === ObjectPrototype && has(AllSymbols, P) && !has(ObjectPrototypeSymbols, P)) return false;
	  return enumerable || !has(this, P) || !has(AllSymbols, P) || has(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
	};

	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
	  var it = toIndexedObject(O);
	  var key = toPrimitive(P, true);
	  if (it === ObjectPrototype && has(AllSymbols, key) && !has(ObjectPrototypeSymbols, key)) return;
	  var descriptor = nativeGetOwnPropertyDescriptor$1(it, key);
	  if (descriptor && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) {
	    descriptor.enumerable = true;
	  }
	  return descriptor;
	};

	var $getOwnPropertyNames = function getOwnPropertyNames(O) {
	  var names = nativeGetOwnPropertyNames$1(toIndexedObject(O));
	  var result = [];
	  $forEach(names, function (key) {
	    if (!has(AllSymbols, key) && !has(hiddenKeys, key)) result.push(key);
	  });
	  return result;
	};

	var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
	  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
	  var names = nativeGetOwnPropertyNames$1(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
	  var result = [];
	  $forEach(names, function (key) {
	    if (has(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has(ObjectPrototype, key))) {
	      result.push(AllSymbols[key]);
	    }
	  });
	  return result;
	};

	// `Symbol` constructor
	// https://tc39.es/ecma262/#sec-symbol-constructor
	if (!nativeSymbol) {
	  $Symbol = function Symbol() {
	    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
	    var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
	    var tag = uid(description);
	    var setter = function (value) {
	      if (this === ObjectPrototype) setter.call(ObjectPrototypeSymbols, value);
	      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
	      setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
	    };
	    if (descriptors && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
	    return wrap(tag, description);
	  };

	  redefine($Symbol[PROTOTYPE$1], 'toString', function toString() {
	    return getInternalState(this).tag;
	  });

	  redefine($Symbol, 'withoutSetter', function (description) {
	    return wrap(uid(description), description);
	  });

	  objectPropertyIsEnumerable.f = $propertyIsEnumerable;
	  objectDefineProperty.f = $defineProperty;
	  objectGetOwnPropertyDescriptor.f = $getOwnPropertyDescriptor;
	  objectGetOwnPropertyNames.f = objectGetOwnPropertyNamesExternal.f = $getOwnPropertyNames;
	  objectGetOwnPropertySymbols.f = $getOwnPropertySymbols;

	  wellKnownSymbolWrapped.f = function (name) {
	    return wrap(wellKnownSymbol(name), name);
	  };

	  if (descriptors) {
	    // https://github.com/tc39/proposal-Symbol-description
	    nativeDefineProperty$1($Symbol[PROTOTYPE$1], 'description', {
	      configurable: true,
	      get: function description() {
	        return getInternalState(this).description;
	      }
	    });
	  }
	}

	_export({ global: true, wrap: true, forced: !nativeSymbol, sham: !nativeSymbol }, {
	  Symbol: $Symbol
	});

	$forEach(objectKeys(WellKnownSymbolsStore$1), function (name) {
	  defineWellKnownSymbol(name);
	});

	_export({ target: SYMBOL, stat: true, forced: !nativeSymbol }, {
	  // `Symbol.for` method
	  // https://tc39.es/ecma262/#sec-symbol.for
	  'for': function (key) {
	    var string = String(key);
	    if (has(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
	    var symbol = $Symbol(string);
	    StringToSymbolRegistry[string] = symbol;
	    SymbolToStringRegistry[symbol] = string;
	    return symbol;
	  },
	  // `Symbol.keyFor` method
	  // https://tc39.es/ecma262/#sec-symbol.keyfor
	  keyFor: function keyFor(sym) {
	    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
	    if (has(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
	  },
	  useSetter: function () { USE_SETTER = true; },
	  useSimple: function () { USE_SETTER = false; }
	});

	_export({ target: 'Object', stat: true, forced: !nativeSymbol, sham: !descriptors }, {
	  // `Object.create` method
	  // https://tc39.es/ecma262/#sec-object.create
	  create: $create,
	  // `Object.defineProperty` method
	  // https://tc39.es/ecma262/#sec-object.defineproperty
	  defineProperty: $defineProperty,
	  // `Object.defineProperties` method
	  // https://tc39.es/ecma262/#sec-object.defineproperties
	  defineProperties: $defineProperties,
	  // `Object.getOwnPropertyDescriptor` method
	  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
	});

	_export({ target: 'Object', stat: true, forced: !nativeSymbol }, {
	  // `Object.getOwnPropertyNames` method
	  // https://tc39.es/ecma262/#sec-object.getownpropertynames
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // `Object.getOwnPropertySymbols` method
	  // https://tc39.es/ecma262/#sec-object.getownpropertysymbols
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
	// https://bugs.chromium.org/p/v8/issues/detail?id=3443
	_export({ target: 'Object', stat: true, forced: fails(function () { objectGetOwnPropertySymbols.f(1); }) }, {
	  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
	    return objectGetOwnPropertySymbols.f(toObject(it));
	  }
	});

	// `JSON.stringify` method behavior with symbols
	// https://tc39.es/ecma262/#sec-json.stringify
	if ($stringify) {
	  var FORCED_JSON_STRINGIFY = !nativeSymbol || fails(function () {
	    var symbol = $Symbol();
	    // MS Edge converts symbol values to JSON as {}
	    return $stringify([symbol]) != '[null]'
	      // WebKit converts symbol values to JSON as null
	      || $stringify({ a: symbol }) != '{}'
	      // V8 throws on boxed symbols
	      || $stringify(Object(symbol)) != '{}';
	  });

	  _export({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
	    // eslint-disable-next-line no-unused-vars -- required for `.length`
	    stringify: function stringify(it, replacer, space) {
	      var args = [it];
	      var index = 1;
	      var $replacer;
	      while (arguments.length > index) args.push(arguments[index++]);
	      $replacer = replacer;
	      if (!isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
	      if (!isArray(replacer)) replacer = function (key, value) {
	        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
	        if (!isSymbol(value)) return value;
	      };
	      args[1] = replacer;
	      return $stringify.apply(null, args);
	    }
	  });
	}

	// `Symbol.prototype[@@toPrimitive]` method
	// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
	if (!$Symbol[PROTOTYPE$1][TO_PRIMITIVE]) {
	  createNonEnumerableProperty($Symbol[PROTOTYPE$1], TO_PRIMITIVE, $Symbol[PROTOTYPE$1].valueOf);
	}
	// `Symbol.prototype[@@toStringTag]` property
	// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
	setToStringTag($Symbol, SYMBOL);

	hiddenKeys[HIDDEN] = true;

	// `Symbol.asyncIterator` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.asynciterator
	defineWellKnownSymbol('asyncIterator');

	// `Symbol.hasInstance` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.hasinstance
	defineWellKnownSymbol('hasInstance');

	// `Symbol.isConcatSpreadable` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.isconcatspreadable
	defineWellKnownSymbol('isConcatSpreadable');

	// `Symbol.iterator` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.iterator
	defineWellKnownSymbol('iterator');

	// `Symbol.match` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.match
	defineWellKnownSymbol('match');

	// `Symbol.matchAll` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.matchall
	defineWellKnownSymbol('matchAll');

	// `Symbol.replace` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.replace
	defineWellKnownSymbol('replace');

	// `Symbol.search` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.search
	defineWellKnownSymbol('search');

	// `Symbol.species` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.species
	defineWellKnownSymbol('species');

	// `Symbol.split` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.split
	defineWellKnownSymbol('split');

	// `Symbol.toPrimitive` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.toprimitive
	defineWellKnownSymbol('toPrimitive');

	// `Symbol.toStringTag` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.tostringtag
	defineWellKnownSymbol('toStringTag');

	// `Symbol.unscopables` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.unscopables
	defineWellKnownSymbol('unscopables');

	// JSON[@@toStringTag] property
	// https://tc39.es/ecma262/#sec-json-@@tostringtag
	setToStringTag(global_1.JSON, 'JSON', true);

	var symbol = path.Symbol;

	// `Symbol.asyncDispose` well-known symbol
	// https://github.com/tc39/proposal-using-statement
	defineWellKnownSymbol('asyncDispose');

	// `Symbol.dispose` well-known symbol
	// https://github.com/tc39/proposal-using-statement
	defineWellKnownSymbol('dispose');

	// `Symbol.observable` well-known symbol
	// https://github.com/tc39/proposal-observable
	defineWellKnownSymbol('observable');

	// `Symbol.patternMatch` well-known symbol
	// https://github.com/tc39/proposal-pattern-matching
	defineWellKnownSymbol('patternMatch');

	// TODO: remove from `core-js@4`


	defineWellKnownSymbol('replaceAll');

	// TODO: Remove from `core-js@4`


	var symbol$1 = symbol;

	var symbol$2 = symbol$1;

	var iterators = {};

	var correctPrototypeGetter = !fails(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var IE_PROTO$1 = sharedKey('IE_PROTO');
	var ObjectPrototype$1 = Object.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.getprototypeof
	var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectPrototype$1 : null;
	};

	var ITERATOR = wellKnownSymbol('iterator');
	var BUGGY_SAFARI_ITERATORS = false;

	var returnThis = function () { return this; };

	// `%IteratorPrototype%` object
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

	if ([].keys) {
	  arrayIterator = [].keys();
	  // Safari 8 has buggy iterators w/o `next`
	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
	  else {
	    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
	  }
	}

	var NEW_ITERATOR_PROTOTYPE = IteratorPrototype == undefined || fails(function () {
	  var test = {};
	  // FF44- legacy iterators case
	  return IteratorPrototype[ITERATOR].call(test) !== test;
	});

	if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	if (( NEW_ITERATOR_PROTOTYPE) && !has(IteratorPrototype, ITERATOR)) {
	  createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
	};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;





	var returnThis$1 = function () { return this; };

	var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(1, next) });
	  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
	  iterators[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var aPossiblePrototype = function (it) {
	  if (!isObject(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  } return it;
	};

	/* eslint-disable no-proto -- safe */



	// `Object.setPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
	    setter.call(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) { /* empty */ }
	  return function setPrototypeOf(O, proto) {
	    anObject(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter.call(O, proto);
	    else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$1 = wellKnownSymbol('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis$2 = function () { return this; };

	var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];
	    switch (KIND) {
	      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
	      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
	      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
	    } return function () { return new IteratorConstructor(this); };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR$1]
	    || IterablePrototype['@@iterator']
	    || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY;

	  // fix native
	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
	    if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
	      // Set @@toStringTag to native iterators
	      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
	      iterators[TO_STRING_TAG] = returnThis$2;
	    }
	  }

	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    INCORRECT_VALUES_NAME = true;
	    defaultIterator = function values() { return nativeIterator.call(this); };
	  }

	  // define iterator
	  if (( FORCED) && IterablePrototype[ITERATOR$1] !== defaultIterator) {
	    createNonEnumerableProperty(IterablePrototype, ITERATOR$1, defaultIterator);
	  }
	  iterators[NAME] = defaultIterator;

	  // export additional methods
	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        redefine(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME }, methods);
	  }

	  return methods;
	};

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState$1 = internalState.set;
	var getInternalState$1 = internalState.getterFor(ARRAY_ITERATOR);

	// `Array.prototype.entries` method
	// https://tc39.es/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.es/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.es/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.es/ecma262/#sec-createarrayiterator
	var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
	  setInternalState$1(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated), // target
	    index: 0,                          // next index
	    kind: kind                         // kind
	  });
	// `%ArrayIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState$1(this);
	  var target = state.target;
	  var kind = state.kind;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = undefined;
	    return { value: undefined, done: true };
	  }
	  if (kind == 'keys') return { value: index, done: false };
	  if (kind == 'values') return { value: target[index], done: false };
	  return { value: [index, target[index]], done: false };
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.es/ecma262/#sec-createmappedargumentsobject
	iterators.Arguments = iterators.Array;

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');

	for (var COLLECTION_NAME in domIterables) {
	  var Collection = global_1[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype;
	  if (CollectionPrototype && classof(CollectionPrototype) !== TO_STRING_TAG$3) {
	    createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG$3, COLLECTION_NAME);
	  }
	  iterators[COLLECTION_NAME] = iterators.Array;
	}

	// `String.prototype.{ codePointAt, at }` methods implementation
	var createMethod$2 = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = String(requireObjectCoercible($this));
	    var position = toInteger(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = S.charCodeAt(position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size
	      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
	        ? CONVERT_TO_STRING ? S.charAt(position) : first
	        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod$2(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod$2(true)
	};

	var charAt = stringMultibyte.charAt;



	var STRING_ITERATOR = 'String Iterator';
	var setInternalState$2 = internalState.set;
	var getInternalState$2 = internalState.getterFor(STRING_ITERATOR);

	// `String.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
	defineIterator(String, 'String', function (iterated) {
	  setInternalState$2(this, {
	    type: STRING_ITERATOR,
	    string: String(iterated),
	    index: 0
	  });
	// `%StringIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState$2(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return { value: undefined, done: true };
	  point = charAt(string, index);
	  state.index += point.length;
	  return { value: point, done: false };
	});

	var ITERATOR$2 = wellKnownSymbol('iterator');

	var isIterable = function (it) {
	  var O = Object(it);
	  return O[ITERATOR$2] !== undefined
	    || '@@iterator' in O
	    // eslint-disable-next-line no-prototype-builtins -- safe
	    || iterators.hasOwnProperty(classof(O));
	};

	var isIterable_1 = isIterable;

	var isIterable$1 = isIterable_1;

	var ITERATOR$3 = wellKnownSymbol('iterator');

	var getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$3]
	    || it['@@iterator']
	    || iterators[classof(it)];
	};

	var getIterator = function (it) {
	  var iteratorMethod = getIteratorMethod(it);
	  if (typeof iteratorMethod != 'function') {
	    throw TypeError(String(it) + ' is not iterable');
	  } return anObject(iteratorMethod.call(it));
	};

	var getIterator_1 = getIterator;

	var getIterator$1 = getIterator_1;

	var iterableToArrayLimit = createCommonjsModule(function (module) {
	function _iterableToArrayLimit(arr, i) {
	  if (typeof symbol$2 === "undefined" || !isIterable$1(Object(arr))) return;
	  var _arr = [];
	  var _n = true;
	  var _d = false;
	  var _e = undefined;

	  try {
	    for (var _i = getIterator$1(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
	      _arr.push(_s.value);

	      if (i && _arr.length === i) break;
	    }
	  } catch (err) {
	    _d = true;
	    _e = err;
	  } finally {
	    try {
	      if (!_n && _i["return"] != null) _i["return"]();
	    } finally {
	      if (_d) throw _e;
	    }
	  }

	  return _arr;
	}

	module.exports = _iterableToArrayLimit;
	module.exports["default"] = module.exports, module.exports.__esModule = true;
	});

	unwrapExports(iterableToArrayLimit);

	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');

	var SPECIES$2 = wellKnownSymbol('species');
	var nativeSlice = [].slice;
	var max$1 = Math.max;

	// `Array.prototype.slice` method
	// https://tc39.es/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
	  slice: function slice(start, end) {
	    var O = toIndexedObject(this);
	    var length = toLength(O.length);
	    var k = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
	    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
	    var Constructor, result, n;
	    if (isArray(O)) {
	      Constructor = O.constructor;
	      // cross-realm fallback
	      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
	        Constructor = undefined;
	      } else if (isObject(Constructor)) {
	        Constructor = Constructor[SPECIES$2];
	        if (Constructor === null) Constructor = undefined;
	      }
	      if (Constructor === Array || Constructor === undefined) {
	        return nativeSlice.call(O, k, fin);
	      }
	    }
	    result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));
	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
	    result.length = n;
	    return result;
	  }
	});

	var entryVirtual = function (CONSTRUCTOR) {
	  return path[CONSTRUCTOR + 'Prototype'];
	};

	var slice = entryVirtual('Array').slice;

	var ArrayPrototype = Array.prototype;

	var slice_1 = function (it) {
	  var own = it.slice;
	  return it === ArrayPrototype || (it instanceof Array && own === ArrayPrototype.slice) ? slice : own;
	};

	var slice$1 = slice_1;

	var slice$2 = slice$1;

	var iteratorClose = function (iterator) {
	  var returnMethod = iterator['return'];
	  if (returnMethod !== undefined) {
	    return anObject(returnMethod.call(iterator)).value;
	  }
	};

	// call something on iterator step with safe closing on error
	var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch (error) {
	    iteratorClose(iterator);
	    throw error;
	  }
	};

	var ITERATOR$4 = wellKnownSymbol('iterator');
	var ArrayPrototype$1 = Array.prototype;

	// check on default Array iterator
	var isArrayIteratorMethod = function (it) {
	  return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR$4] === it);
	};

	// `Array.from` method implementation
	// https://tc39.es/ecma262/#sec-array.from
	var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
	  var O = toObject(arrayLike);
	  var C = typeof this == 'function' ? this : Array;
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  var iteratorMethod = getIteratorMethod(O);
	  var index = 0;
	  var length, result, step, iterator, next, value;
	  if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
	  // if the target is not iterable or it's an array with the default iterator - use a simple case
	  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
	    iterator = iteratorMethod.call(O);
	    next = iterator.next;
	    result = new C();
	    for (;!(step = next.call(iterator)).done; index++) {
	      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
	      createProperty(result, index, value);
	    }
	  } else {
	    length = toLength(O.length);
	    result = new C(length);
	    for (;length > index; index++) {
	      value = mapping ? mapfn(O[index], index) : O[index];
	      createProperty(result, index, value);
	    }
	  }
	  result.length = index;
	  return result;
	};

	var ITERATOR$5 = wellKnownSymbol('iterator');
	var SAFE_CLOSING = false;

	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return { done: !!called++ };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };
	  iteratorWithReturn[ITERATOR$5] = function () {
	    return this;
	  };
	  // eslint-disable-next-line no-throw-literal -- required for testing
	  Array.from(iteratorWithReturn, function () { throw 2; });
	} catch (error) { /* empty */ }

	var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
	  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  var ITERATION_SUPPORT = false;
	  try {
	    var object = {};
	    object[ITERATOR$5] = function () {
	      return {
	        next: function () {
	          return { done: ITERATION_SUPPORT = true };
	        }
	      };
	    };
	    exec(object);
	  } catch (error) { /* empty */ }
	  return ITERATION_SUPPORT;
	};

	var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
	  Array.from(iterable);
	});

	// `Array.from` method
	// https://tc39.es/ecma262/#sec-array.from
	_export({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
	  from: arrayFrom
	});

	var from_1 = path.Array.from;

	var from_1$1 = from_1;

	var from_1$2 = from_1$1;

	var arrayLikeToArray = createCommonjsModule(function (module) {
	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;

	  for (var i = 0, arr2 = new Array(len); i < len; i++) {
	    arr2[i] = arr[i];
	  }

	  return arr2;
	}

	module.exports = _arrayLikeToArray;
	module.exports["default"] = module.exports, module.exports.__esModule = true;
	});

	unwrapExports(arrayLikeToArray);

	var unsupportedIterableToArray = createCommonjsModule(function (module) {
	function _unsupportedIterableToArray(o, minLen) {
	  var _context;

	  if (!o) return;
	  if (typeof o === "string") return arrayLikeToArray(o, minLen);

	  var n = slice$2(_context = Object.prototype.toString.call(o)).call(_context, 8, -1);

	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return from_1$2(o);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
	}

	module.exports = _unsupportedIterableToArray;
	module.exports["default"] = module.exports, module.exports.__esModule = true;
	});

	unwrapExports(unsupportedIterableToArray);

	var nonIterableRest = createCommonjsModule(function (module) {
	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	module.exports = _nonIterableRest;
	module.exports["default"] = module.exports, module.exports.__esModule = true;
	});

	unwrapExports(nonIterableRest);

	var slicedToArray = createCommonjsModule(function (module) {
	function _slicedToArray(arr, i) {
	  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
	}

	module.exports = _slicedToArray;
	module.exports["default"] = module.exports, module.exports.__esModule = true;
	});

	var _slicedToArray = unwrapExports(slicedToArray);

	var classCallCheck = createCommonjsModule(function (module) {
	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	module.exports = _classCallCheck;
	module.exports["default"] = module.exports, module.exports.__esModule = true;
	});

	var _classCallCheck = unwrapExports(classCallCheck);

	// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	_export({ target: 'Object', stat: true, forced: !descriptors, sham: !descriptors }, {
	  defineProperty: objectDefineProperty.f
	});

	var defineProperty_1 = createCommonjsModule(function (module) {
	var Object = path.Object;

	var defineProperty = module.exports = function defineProperty(it, key, desc) {
	  return Object.defineProperty(it, key, desc);
	};

	if (Object.defineProperty.sham) defineProperty.sham = true;
	});

	var defineProperty$2 = defineProperty_1;

	var defineProperty$3 = defineProperty$2;

	var defineProperty$4 = createCommonjsModule(function (module) {
	function _defineProperty(obj, key, value) {
	  if (key in obj) {
	    defineProperty$3(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	}

	module.exports = _defineProperty;
	module.exports["default"] = module.exports, module.exports.__esModule = true;
	});

	var _defineProperty = unwrapExports(defineProperty$4);

	var _for = path.Symbol['for'];

	var _for$1 = _for;

	var _for$2 = _for$1;

	var symbolFor = _for$2;
	var REACT_ELEMENT_TYPE = symbolFor('react.element');

	var ReactElement = function ReactElement(type) {
	  var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	  var props = arguments.length > 2 ? arguments[2] : undefined;

	  _classCallCheck(this, ReactElement);

	  this.type = type;
	  this.key = key;
	  this.props = props;

	  _defineProperty(this, "$$typeof", REACT_ELEMENT_TYPE);
	};

	var RESERVED_PROPS = {
	  key: true,
	  ref: true
	};
	function createElement(type, config) {
	  var _config$key;

	  var props = {};
	  var key = (_config$key = config === null || config === void 0 ? void 0 : config.key) !== null && _config$key !== void 0 ? _config$key : null;

	  for (var propName in config) {
	    if (config.hasOwnProperty(propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
	      props[propName] = config[propName];
	    }
	  }

	  if (type !== null && type !== void 0 && type.defaultProps) {
	    var defaultProps = type.defaultProps;

	    for (var _propName in defaultProps) {
	      if (props[_propName] === undefined) {
	        props[_propName] = defaultProps[_propName];
	      }
	    }
	  }

	  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	    children[_key - 2] = arguments[_key];
	  }

	  if (children.length === 1) {
	    props.children = children[0];
	  } else if (children.length > 1) {
	    props.children = children;
	  }

	  return new ReactElement(type, key, props);
	}

	var ReactCurrentDispatcher = {
	  current: null
	};

	var ReactSharedInternals = {
	  ReactCurrentDispatcher: ReactCurrentDispatcher
	};

	var resolveDispatcher = function resolveDispatcher() {
	  var dispatcher = ReactCurrentDispatcher.current;
	  return dispatcher;
	};

	var useState = function useState(initialState) {
	  var dispatcher = resolveDispatcher();
	  return dispatcher.useState(initialState);
	};

	var React = {
	  createElement: createElement
	};

	var discreteUpdatesImpl = function discreteUpdatesImpl(fn, a, b, c, d) {
	  return fn(a, b, c, d);
	};

	var batchedEventUpdatesImpl = function batchedEventUpdatesImpl() {};

	var discreteUpdates = function discreteUpdates(fn, a, b, c, d) {
	  return discreteUpdatesImpl(fn, a, b, c, d);
	};
	var batchedEventUpdates = function batchedEventUpdates(fn, a, b) {
	  return batchedEventUpdatesImpl(fn, a);
	};
	var setBatchingImplementation = function setBatchingImplementation(_discreteUpdatesImpl, _batchedEventUpdates) {
	  discreteUpdatesImpl = _discreteUpdatesImpl;
	  batchedEventUpdatesImpl = _batchedEventUpdates;
	};

	var createClass = createCommonjsModule(function (module) {
	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;

	    defineProperty$3(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	module.exports = _createClass;
	module.exports["default"] = module.exports, module.exports.__esModule = true;
	});

	var _createClass = unwrapExports(createClass);

	/**
	 * 通过React.render调用时创建的FiberRoot为该值
	 */
	/**
	 * 通过React.createRoot调用时创建的FiberRoot为该值
	 */

	var ConcurrentRoot = 2;

	var FunctionComponent = 0;
	/**
	 * FiberRoot.current
	 */

	var HostRoot = 3; // Root of a host tree. Could be nested inside another node.

	/**
	 * 文字节点
	 */

	var HostText = 6;
	/**
	 * 在每经过reconcile之前class和function都是该类组件
	 */

	var IndeterminateComponent = 2; // Before we know whether it is function or class
	/**
	 * div span之类的组件
	 */

	var HostComponent = 5;

	var NoMode =
	/*            */
	0; // TODO: Remove BlockingMode and ConcurrentMode by reading from the root tag instead

	var BlockingMode =
	/*      */
	1;
	var ConcurrentMode =
	/*    */
	2;

	var FiberNode = function FiberNode(tag, pendingProps, key, mode) {
	  _classCallCheck(this, FiberNode);

	  this.tag = tag;
	  this.pendingProps = pendingProps;
	  this.key = key;
	  this.mode = mode;

	  _defineProperty(this, "stateNode", null);

	  _defineProperty(this, "updateQueue", void 0);

	  _defineProperty(this, "return", null);

	  _defineProperty(this, "alternate", null);

	  _defineProperty(this, "memoizedState", null);

	  _defineProperty(this, "child", null);

	  _defineProperty(this, "sibling", null);

	  _defineProperty(this, "type", null);

	  _defineProperty(this, "memoizedProps", null);

	  _defineProperty(this, "flags", 0);

	  _defineProperty(this, "subtreeFlags", 0);

	  _defineProperty(this, "deletions", null);

	  _defineProperty(this, "index", 0);
	};
	/**
	 *
	 * @param tag 标志着该fiber树是以什么模式创建的
	 * @returns 返回一个以HostRoot为tag创建的fiber节点(表示fiber树根节点)
	 */


	var createHostRootFiber = function createHostRootFiber(tag) {
	  var mode;

	  if (tag === ConcurrentRoot) {
	    mode = ConcurrentMode | BlockingMode;
	  } else {
	    mode = NoMode;
	  }

	  return new FiberNode(HostRoot, null, null, mode);
	};
	var createFiber = function createFiber(tag, pendingProps, key, mode) {
	  return new FiberNode(tag, pendingProps, key, mode);
	};
	/**
	 *
	 * @param current 更具当前界面上的current fiber节点创建一个新的fiber节点去进行工作
	 * @param pendingProps 该fiber节点新的props
	 */

	var createWorkInProgress = function createWorkInProgress(current, pendingProps) {
	  var workInProgress = current.alternate;

	  if (workInProgress === null) {
	    workInProgress = createFiber(current.tag, pendingProps, current.key, current.mode);
	    workInProgress.stateNode = current.stateNode;
	    workInProgress.alternate = current;
	    current.alternate = workInProgress;
	  }

	  workInProgress.updateQueue = current.updateQueue;
	  return workInProgress;
	};
	var createFiberFromTypeAndProps = function createFiberFromTypeAndProps(type, key, pendingProps, mode) {
	  var fiberTag = IndeterminateComponent;

	  if (typeof type === 'function') ; else if (typeof type === 'string') {
	    fiberTag = HostComponent;
	  }

	  var fiber = createFiber(fiberTag, pendingProps, key, mode);
	  fiber.type = type;
	  return fiber;
	};
	var createFiberFromElement = function createFiberFromElement(element, mode) {
	  var type = element.type;
	  var key = element.key;
	  var pendingProps = element.props;
	  var fiber = createFiberFromTypeAndProps(type, key, pendingProps, mode);
	  return fiber;
	};
	/**
	 * 创建一个HostText类型的Fiber节点
	 * @param content 会作为pendingProps
	 * @param mode
	 * @returns
	 */

	var createFiberFromText = function createFiberFromText(content, mode) {
	  var fiber = createFiber(HostText, content, null, mode);
	  return fiber;
	};

	var nativeAssign = Object.assign;
	var defineProperty$5 = Object.defineProperty;

	// `Object.assign` method
	// https://tc39.es/ecma262/#sec-object.assign
	var objectAssign = !nativeAssign || fails(function () {
	  // should have correct order of operations (Edge bug)
	  if (descriptors && nativeAssign({ b: 1 }, nativeAssign(defineProperty$5({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty$5(this, 'b', {
	        value: 3,
	        enumerable: false
	      });
	    }
	  }), { b: 2 })).b !== 1) return true;
	  // should work with symbols and should have deterministic property order (V8 bug)
	  var A = {};
	  var B = {};
	  /* global Symbol -- required for testing */
	  var symbol = Symbol();
	  var alphabet = 'abcdefghijklmnopqrst';
	  A[symbol] = 7;
	  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
	  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
	  var T = toObject(target);
	  var argumentsLength = arguments.length;
	  var index = 1;
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  var propertyIsEnumerable = objectPropertyIsEnumerable.f;
	  while (argumentsLength > index) {
	    var S = indexedObject(arguments[index++]);
	    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) {
	      key = keys[j++];
	      if (!descriptors || propertyIsEnumerable.call(S, key)) T[key] = S[key];
	    }
	  } return T;
	} : nativeAssign;

	// `Object.assign` method
	// https://tc39.es/ecma262/#sec-object.assign
	_export({ target: 'Object', stat: true, forced: Object.assign !== objectAssign }, {
	  assign: objectAssign
	});

	var assign = path.Object.assign;

	var assign$1 = assign;

	var assign$2 = assign$1;

	var UpdateState = 0;

	/**
	 *初始化fiber节点的updateQueue
	 *
	 * @param fiber 要初始化updateQueue的fiber
	 */
	var initializeUpdateQueue = function initializeUpdateQueue(fiber) {
	  var queue = {
	    baseState: fiber.memoizedState,
	    shared: {
	      pending: null
	    },
	    lastBaseUpdate: null,
	    firstBaseUpdate: null
	  };
	  fiber.updateQueue = queue;
	};
	/**
	 *
	 * @returns 创建一个全新的update
	 */

	var createUpdate = function createUpdate() {
	  var update = {
	    payload: null,
	    next: null,
	    tag: UpdateState
	  };
	  return update;
	};
	/**
	 * 将一个update添加fiber节点上
	 *
	 * @param fiber 要添加update的fiber节点
	 * @param update 该update会被添加到fiber节点的updateQueue上
	 */

	var enqueueUpdate = function enqueueUpdate(fiber, update) {
	  var updateQueue = fiber.updateQueue;
	  if (!updateQueue) return;
	  var sharedQueue = updateQueue.shared;
	  var pending = sharedQueue.pending;

	  if (pending === null) {
	    //第一个创建的update，创建一个循环链表
	    update.next = update;
	  } else {
	    //sharedQueue.pending 始终为最后一个创建的update
	    //sharedQueue.pending.next指向第一个创建的update,遍历update都是从此开始
	    //按顺序1,2,3插入update则构成的链表为
	    //______________
	    //|             ↓
	    //3  <-  2  <-  1
	    //update3的next指向最早创建的update1
	    update.next = pending.next; //update2的next指向当前创建的update3

	    pending.next = update;
	  }

	  sharedQueue.pending = update;
	};
	/**
	 * 从current fiber上克隆一个updateQueue
	 * @param current
	 * @param workInProgress
	 */

	var cloneUpdateQueue = function cloneUpdateQueue(current, workInProgress) {
	  var queue = workInProgress.updateQueue;
	  var currentQueue = current.updateQueue;

	  if (queue === currentQueue) {
	    var clone = {
	      shared: currentQueue.shared,
	      firstBaseUpdate: currentQueue.firstBaseUpdate,
	      lastBaseUpdate: currentQueue.lastBaseUpdate,
	      baseState: currentQueue.baseState
	    };
	    workInProgress.updateQueue = clone;
	  }
	};
	var processUpdateQueue = function processUpdateQueue(workInProgress, props, instance) {
	  var queue = workInProgress.updateQueue;
	  var firstBaseUpdate = queue.firstBaseUpdate;
	  var lastBaseUpdate = queue.lastBaseUpdate; //检测shared.pending是否存在进行中的update将他们转移到baseQueue

	  var pendingQueue = queue.shared.pending;

	  if (pendingQueue !== null) {
	    queue.shared.pending = null;
	    var lastPendingUpdate = pendingQueue;
	    var firstPendingUpdate = lastPendingUpdate.next; //断开最后一个update和第一个update之间的连接

	    lastPendingUpdate.next = null; //将shared.pending上的update接到baseUpdate链表上

	    if (lastBaseUpdate === null) {
	      firstBaseUpdate = firstPendingUpdate;
	    } else {
	      lastBaseUpdate.next = firstPendingUpdate;
	    }

	    lastBaseUpdate = lastPendingUpdate; //如果current存在则进行相同的工作

	    var current = workInProgress.alternate;

	    if (current !== null) {
	      var currentQueue = current.updateQueue;
	      var currentLastBaseUpdate = currentQueue.lastBaseUpdate;

	      if (currentLastBaseUpdate !== lastBaseUpdate) {
	        if (currentLastBaseUpdate === null) {
	          currentQueue.firstBaseUpdate = firstPendingUpdate;
	        } else {
	          currentLastBaseUpdate.next = firstPendingUpdate;
	        }

	        currentQueue.lastBaseUpdate = lastPendingUpdate;
	      }
	    }
	  }

	  if (firstBaseUpdate !== null) {
	    var newState = queue.baseState;
	    var newBaseState = null;
	    var newFirstBaseUpdate = null;
	    var newLastBaseUpdate = null;
	    var update = firstBaseUpdate;

	    do {
	      //暂时假设，所有更新都是一样的优先级，每次都从所有update计算状态
	      newState = getStateFromUpdate(workInProgress, queue, update, newState, props, instance);
	      update = update.next; //当前更新以全部遍历完，但是有可能payload为函数在计算state的过程中又在
	      //updateQueue.shared.pending上添加了新的更新，继续迭代直到没有新更新产生为止

	      if (update === null) {
	        pendingQueue = queue.shared.pending; //没产生新的更新

	        if (pendingQueue === null) break;else {
	          //产生了新的更新
	          var _lastPendingUpdate = pendingQueue;
	          var _firstPendingUpdate = _lastPendingUpdate.next;
	          _lastPendingUpdate.next = null;
	          update = _firstPendingUpdate;
	          queue.lastBaseUpdate = _lastPendingUpdate;
	          queue.shared.pending = null;
	        }
	      }
	    } while (true); //暂时没有会被跳过的update始终不成立


	    if (newLastBaseUpdate === null) {
	      newBaseState = newState;
	    }

	    queue.baseState = newBaseState;
	    queue.firstBaseUpdate = newFirstBaseUpdate;
	    queue.lastBaseUpdate = newLastBaseUpdate;
	    workInProgress.memoizedState = newState;
	  }
	};
	var getStateFromUpdate = function getStateFromUpdate(_workInProgress, _queue, update, prevState, nextProps, instance) {
	  switch (update.tag) {
	    case UpdateState:
	      {
	        var payload = update.payload;
	        var partialState;

	        if (typeof payload === 'function') {
	          partialState = payload.call(instance, prevState, nextProps);
	        } else {
	          partialState = payload;
	        }

	        if (partialState === null || partialState === undefined) {
	          //如果是null或者undefined就说明什么都不用更新，什么也不干
	          return prevState;
	        }

	        return assign$2({}, prevState, partialState);
	      }
	  }
	};

	var FiberRootNode = function FiberRootNode(containerInfo, tag) {
	  _classCallCheck(this, FiberRootNode);

	  this.containerInfo = containerInfo;
	  this.tag = tag;
	};
	/**
	 *
	 * @param containerInfo 当前创建fiber树所在的dom节点由createRoot方法传入
	 * @param tag 决定fiber树是以什么模式创建的(concurrent,blocking)
	 * @returns 返回FiberRoot（整个应用的根节点，其中current保存有当前页面所对应的fiber树）
	 */


	var createFiberRoot = function createFiberRoot(containerInfo, tag) {
	  var root = new FiberRootNode(containerInfo, tag);
	  var uninitializedFiber = createHostRootFiber(tag);
	  root.current = uninitializedFiber;
	  uninitializedFiber.stateNode = root;
	  initializeUpdateQueue(uninitializedFiber);
	  return root;
	};

	// `RegExp.prototype.flags` getter implementation
	// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
	var regexpFlags = function () {
	  var that = anObject(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.dotAll) result += 's';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	var flags_1 = function (it) {
	  return regexpFlags.call(it);
	};

	var RegExpPrototype = RegExp.prototype;

	var flags_1$1 = function (it) {
	  return (it === RegExpPrototype || it instanceof RegExp) && !('flags' in it) ? flags_1(it) : it.flags;
	};

	var flags = flags_1$1;

	var flags$1 = flags;

	var iterator = wellKnownSymbolWrapped.f('iterator');

	var iterator$1 = iterator;

	var iterator$2 = iterator$1;

	var _typeof_1 = createCommonjsModule(function (module) {
	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  if (typeof symbol$2 === "function" && typeof iterator$2 === "symbol") {
	    module.exports = _typeof = function _typeof(obj) {
	      return typeof obj;
	    };

	    module.exports["default"] = module.exports, module.exports.__esModule = true;
	  } else {
	    module.exports = _typeof = function _typeof(obj) {
	      return obj && typeof symbol$2 === "function" && obj.constructor === symbol$2 && obj !== symbol$2.prototype ? "symbol" : typeof obj;
	    };

	    module.exports["default"] = module.exports, module.exports.__esModule = true;
	  }

	  return _typeof(obj);
	}

	module.exports = _typeof;
	module.exports["default"] = module.exports, module.exports.__esModule = true;
	});

	var _typeof = unwrapExports(_typeof_1);

	var slice$3 = slice_1;

	var slice$4 = slice$3;

	var _context;

	var randomKey = slice$4(_context = Math.random().toString(36)).call(_context, 2);

	var internalPropsKey = '__reactProps$' + randomKey;
	var internalInstanceKey = '__reactFiber$' + randomKey;
	var getFiberCurrentPropsFromNode = function getFiberCurrentPropsFromNode(node) {
	  return node[internalPropsKey];
	};
	var getClosestInstanceFromNode = function getClosestInstanceFromNode(targetNode) {
	  var targetInst = targetNode[internalInstanceKey];
	  return targetInst !== null && targetInst !== void 0 ? targetInst : null;
	};
	var precacheFiberNode = function precacheFiberNode(hostInst, node) {
	  node[internalInstanceKey] = hostInst;
	};
	var updateFiberProps = function updateFiberProps(node, props) {
	  node[internalPropsKey] = props;
	};

	/**
	 * HTML nodeType values that represent the type of the node
	 */
	var TEXT_NODE = 3;
	var COMMENT_NODE = 8;

	var setTextContent = function setTextContent(node, text) {
	  if (text) {
	    var firstChild = node.firstChild;

	    if (firstChild && firstChild === node.lastChild && firstChild.nodeType === TEXT_NODE) {
	      firstChild.nodeValue = text;
	      return;
	    }

	    node.textContent = text;
	  }
	};

	var STYLE = 'style';
	var CHILDREN = 'children';

	var setInitialDOMProperties = function setInitialDOMProperties(tag, domElement, nextProps) {
	  for (var propKey in nextProps) {
	    if (!nextProps.hasOwnProperty(propKey)) continue;
	    var nextProp = nextProps[propKey];

	    if (propKey === STYLE) ; else if (propKey === CHILDREN) {
	      if (typeof nextProp === 'string') {
	        var canSetTextContent = tag !== 'textarea' || nextProp !== '';

	        if (canSetTextContent) {
	          setTextContent(domElement, nextProp);
	        }
	      } else if (typeof nextProp === 'number') {
	        setTextContent(domElement, nextProp + '');
	      }
	    }
	  }
	};
	/**
	 * 初始化dom属性
	 * @param domElement dom元素
	 * @param tag dom的tag对应React.createElement的第一个参数
	 * @param rawProps 对应了React.createElement的第二个参数（包含children）
	 */


	var setInitialProperties = function setInitialProperties(domElement, tag, rawProps) {
	  setInitialDOMProperties(tag, domElement, rawProps);
	};

	var shouldSetTextContent = function shouldSetTextContent(type, props) {
	  return type === 'textarea' || type === 'option' || type === 'noscript' || typeof props.children === 'string' || typeof props.children === 'number' || _typeof(props.dangerouslySetInnerHTML) === 'object' && props.dangerouslySetInnerHTML !== null && props.dangerouslySetInnerHTML.__html !== null;
	};
	var createInstance = function createInstance(type, props, internalInstanceHandle) {
	  var domElement = document.createElement(type); //todo
	  //updateFiberProps(domElement, props)

	  precacheFiberNode(internalInstanceHandle, domElement);
	  updateFiberProps(domElement, props);
	  return domElement;
	};
	var appendInitialChild = function appendInitialChild(parentInstance, child) {
	  parentInstance.appendChild(child);
	};
	var insertBefore = function insertBefore(parentInstance, child, beforeChild) {
	  parentInstance.insertBefore(child, beforeChild);
	};
	var appendChild = function appendChild(parentInstance, child) {
	  parentInstance.appendChild(child);
	};
	var COMMENT_NODE$1 = 8;
	/**
	 * 和appendChild一样，只是多了个判断是否是注释节点
	 * @param container React.render第二个参数
	 * @param child 要添加的dom
	 * @param beforeChild
	 */

	var insertInContainerBefore = function insertInContainerBefore(container, child, beforeChild) {
	  if (container.nodeType === COMMENT_NODE$1) {
	    var _container$parentNode;

	    (_container$parentNode = container.parentNode) === null || _container$parentNode === void 0 ? void 0 : _container$parentNode.insertBefore(child, beforeChild);
	  } else {
	    container.insertBefore(child, beforeChild);
	  }
	};
	var appendChildToContainer = function appendChildToContainer(container, child) {
	  var parentNode;

	  if (container.nodeType === COMMENT_NODE$1) {
	    var _parentNode;

	    parentNode = container.parentNode;
	    (_parentNode = parentNode) === null || _parentNode === void 0 ? void 0 : _parentNode.insertBefore(child, container);
	  } else {
	    parentNode = container;
	    parentNode.appendChild(child);
	  }
	};
	var finalizeInitialChildren = function finalizeInitialChildren(domElement, type, props) {
	  setInitialProperties(domElement, type, props); //shouldAutoFocusHostComponent

	  return false;
	};
	var createTextInstance = function createTextInstance(text) {
	  var instance = document.createTextNode(text);
	  return instance;
	};

	var isArray$4 = isArray$1;

	var isArray$5 = isArray$4;

	var NoFlags =
	/*                      */
	0;
	var Placement =
	/*                    */
	2;
	var Update =
	/*                       */
	4;
	var ChildDeletion =
	/*                */
	16;
	var ContentReset =
	/*                 */
	32;
	var MutationMask = Placement | Update | ChildDeletion | ContentReset;
	var BeforeMutationMask = Update;

	var isArray$6 = isArray$5;

	var ChildReconciler = function ChildReconciler(shouldTrackSideEffects) {
	  var placeSingleChild = function placeSingleChild(newFiber) {
	    if (shouldTrackSideEffects && newFiber.alternate === null) {
	      newFiber.flags |= Placement;
	    }

	    return newFiber;
	  };

	  var reconcileSingleElement = function reconcileSingleElement(returnFiber, currentFirstChild, element) {
	    var key = element.key;

	    var created = createFiberFromElement(element, returnFiber.mode);
	    created["return"] = returnFiber;
	    return created;
	  };

	  var deleteRemainingChildren = function deleteRemainingChildren(returnFiber, currentFirstChild) {
	    //当初次mount的时候shouldTrackSideEffects为false
	    if (!shouldTrackSideEffects) {
	      return null;
	    }

	    return null;
	  };

	  var placeChild = function placeChild(newFiber, lastPlacedIndex, newIndex) {
	    newFiber.index = newIndex;
	    if (!shouldTrackSideEffects) return lastPlacedIndex;
	    throw new Error('Not Implement');
	  };

	  var createChild = function createChild(returnFiber, newChild) {
	    if (typeof newChild === 'string' || typeof newChild === 'number') {
	      var created = createFiberFromText('' + newChild, returnFiber.mode);
	      created["return"] = returnFiber;
	      return created;
	    }

	    if (_typeof(newChild) === 'object' && newChild !== null) {
	      switch (newChild.$$typeof) {
	        case REACT_ELEMENT_TYPE:
	          {
	            var _created = createFiberFromElement(newChild, returnFiber.mode);

	            _created["return"] = returnFiber;
	            return _created;
	          }
	      }
	    }

	    throw new Error('Not Implement');
	  };

	  var reconcileChildrenArray = function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
	    var resultingFirstChild = null;
	    var previousNewFiber = null;
	    var oldFiber = currentFirstChild;
	    var lastPlacedIndex = 0;
	    var newIdx = 0;
	    //   nextOldFiber = oldFiber.sibling
	    //   const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx])
	    //   if (newFiber === null) {
	    //     break
	    //   }
	    //   if (shouldTrackSideEffects) {
	    //   }
	    //   lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
	    //   if (previousNewFiber === null) {
	    //     resultingFirstChild = newFiber
	    //   } else {
	    //     previousNewFiber.sibling = newFiber
	    //   }
	    //   previousNewFiber = newFiber
	    //   oldFiber = nextOldFiber
	    // }
	    // if (newIdx === newChildren.length) {
	    //   deleteRemainingChildren(returnFiber, oldFiber)
	    //   return resultingFirstChild
	    // }

	    if (oldFiber === null) {
	      for (; newIdx < newChildren.length; ++newIdx) {
	        var newFiber = createChild(returnFiber, newChildren[newIdx]);
	        if (newFiber === null) continue;
	        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);

	        if (previousNewFiber === null) {
	          resultingFirstChild = newFiber;
	        } else {
	          previousNewFiber.sibling = newFiber;
	        }

	        previousNewFiber = newFiber;
	      }

	      return resultingFirstChild;
	    }

	    throw new Error('Not Implement');
	  };

	  var reconcileChildFibers = function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
	    var isObject = _typeof(newChild) === 'object' && newChild !== null;

	    if (isObject) {
	      switch (newChild.$$typeof) {
	        case REACT_ELEMENT_TYPE:
	          {
	            return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild));
	          }
	      }
	    }

	    if (isArray$6(newChild)) {
	      return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
	    } //newChild为空删除现有fiber节点


	    return deleteRemainingChildren();
	  };

	  return reconcileChildFibers;
	};

	var mountChildFibers = ChildReconciler(false);
	var reconcileChildFibers = ChildReconciler(true);

	var slice$5 = [].slice;
	var factories = {};

	var construct = function (C, argsLength, args) {
	  if (!(argsLength in factories)) {
	    for (var list = [], i = 0; i < argsLength; i++) list[i] = 'a[' + i + ']';
	    // eslint-disable-next-line no-new-func -- we have no proper alternatives, IE8- only
	    factories[argsLength] = Function('C,a', 'return new C(' + list.join(',') + ')');
	  } return factories[argsLength](C, args);
	};

	// `Function.prototype.bind` method implementation
	// https://tc39.es/ecma262/#sec-function.prototype.bind
	var functionBind = Function.bind || function bind(that /* , ...args */) {
	  var fn = aFunction(this);
	  var partArgs = slice$5.call(arguments, 1);
	  var boundFunction = function bound(/* args... */) {
	    var args = partArgs.concat(slice$5.call(arguments));
	    return this instanceof boundFunction ? construct(fn, args.length, args) : fn.apply(that, args);
	  };
	  if (isObject(fn.prototype)) boundFunction.prototype = fn.prototype;
	  return boundFunction;
	};

	// `Function.prototype.bind` method
	// https://tc39.es/ecma262/#sec-function.prototype.bind
	_export({ target: 'Function', proto: true }, {
	  bind: functionBind
	});

	var bind = entryVirtual('Function').bind;

	var FunctionPrototype = Function.prototype;

	var bind_1 = function (it) {
	  var own = it.bind;
	  return it === FunctionPrototype || (it instanceof Function && own === FunctionPrototype.bind) ? bind : own;
	};

	var bind$1 = bind_1;

	var bind$2 = bind$1;

	var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
	var workInProgressHook = null;
	var currentlyRenderingFiber;

	var mountWorkInProgressHook = function mountWorkInProgressHook() {
	  var hook = {
	    next: null,
	    memoizedState: null,
	    baseState: null
	  };

	  if (workInProgressHook === null) {
	    workInProgressHook = hook;
	  } else {
	    workInProgressHook = workInProgressHook.next = hook;
	  }

	  return workInProgressHook;
	};

	var dispatchAction = function dispatchAction(fiber, queue, action) {};

	var mountState = function mountState(initialState) {
	  var hook = mountWorkInProgressHook();

	  if (typeof initialState === 'function') {
	    initialState = initialState();
	  }

	  hook.memoizedState = hook.baseState = initialState;
	  var queue = {};

	  var dispatch = bind$2(dispatchAction).call(dispatchAction, null, currentlyRenderingFiber, queue);

	  return [hook.memoizedState, dispatch];
	};

	var HooksDispatcherOnMount = {
	  useState: mountState
	};
	var renderWithHooks = function renderWithHooks(current, workInProgress, Component, props, secondArg) {
	  currentlyRenderingFiber = workInProgress;
	  ReactCurrentDispatcher$1.current = current === null || current.memoizedState === null ? HooksDispatcherOnMount : null; //调用函数组件，获取JSX对象

	  var children = Component(props, secondArg);
	  return children;
	};

	/**
	 * 更新HostRoot节点
	 * @param current
	 * @param workInProgress
	 * @returns
	 */

	var updateHostRoot = function updateHostRoot(current, workInProgress) {
	  cloneUpdateQueue(current, workInProgress); //当第一次mount时payload为 {element: jsx对象}

	  var prevState = workInProgress.memoizedState;
	  var prevChildren = prevState !== null ? prevState.element : null; //HostRoot的pendingProps为null

	  var nextProps = workInProgress.pendingProps;
	  processUpdateQueue(workInProgress, nextProps, null);
	  var nextState = workInProgress.memoizedState;
	  var nextChildren = nextState.element;

	  if (nextChildren === prevChildren) {
	    //todo 前后jsx对象没有变
	    return null;
	  }

	  reconcileChildren(current, workInProgress, nextChildren);
	  return workInProgress.child;
	};

	var reconcileChildren = function reconcileChildren(current, workInProgress, nextChildren) {
	  if (current === null) {
	    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
	  } else {
	    //todo update
	    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
	  }
	};

	var mountIndeterminateComponent = function mountIndeterminateComponent(current, workInProgress, Component) {
	  var props = workInProgress.pendingProps;
	  var value = renderWithHooks(current, workInProgress, Component, props, null);
	  workInProgress.tag = FunctionComponent;
	  reconcileChildren(null, workInProgress, value);
	  return workInProgress.child;
	};

	var updateHostComponent = function updateHostComponent(current, workInProgress) {
	  var type = workInProgress.type;
	  var nextProps = workInProgress.pendingProps;
	  var prevProps = current !== null ? current.memoizedProps : null;
	  var nextChildren = nextProps.children; //子节点是否可以直接设置成字符串而不用继续reconcile

	  var isDirectTextChild = shouldSetTextContent(type, nextProps);

	  if (isDirectTextChild) {
	    nextChildren = null;
	  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) ;

	  reconcileChildren(current, workInProgress, nextChildren);
	  return workInProgress.child;
	};
	/**
	 * 传入当前Fiber节点，创建子Fiber节点
	 * @param current 当前节点
	 * @param workInProgress workInProgress节点
	 * @returns 下一个要进行beginWork的节点
	 */


	var beginWork = function beginWork(current, workInProgress) {

	  switch (workInProgress.tag) {
	    case IndeterminateComponent:
	      {
	        //在mount时FunctionComponent是按indeterminate处理的
	        return mountIndeterminateComponent(current, workInProgress, workInProgress.type);
	      }

	    case HostRoot:
	      {
	        //HostRoot类型current,workInProgress一定会同时存在
	        return updateHostRoot(current, workInProgress);
	      }

	    case HostComponent:
	      return updateHostComponent(current, workInProgress);

	    case HostText:
	      return null;
	  }

	  throw new Error('Not Implement');
	};

	var nextEffect = null;

	var ensureCorrectReturnPointer = function ensureCorrectReturnPointer(fiber, expectedReturnFiber) {
	  fiber["return"] = expectedReturnFiber;
	};

	var commitBeforeMutationEffects_begin = function commitBeforeMutationEffects_begin() {
	  while (nextEffect !== null) {
	    var fiber = nextEffect;
	    var child = fiber.child; //如果子树由beforeMutation标记

	    if ((fiber.subtreeFlags & BeforeMutationMask) !== NoFlags && child !== null) {
	      ensureCorrectReturnPointer(child, fiber);
	      nextEffect = child;
	    } else {
	      commitBeforeMutationEffects_complete();
	    }
	  }
	};

	var commitBeforeMutationEffects_complete = function commitBeforeMutationEffects_complete() {
	  while (nextEffect !== null) {
	    var fiber = nextEffect;
	    commitBeforeMutationEffectsOnFiber(fiber);
	    var sibling = fiber.sibling;

	    if (sibling !== null) {
	      nextEffect = sibling;
	      return;
	    }

	    nextEffect = fiber["return"];
	  }
	};

	var commitBeforeMutationEffectsOnFiber = function commitBeforeMutationEffectsOnFiber(finishedWork) {
	  var current = finishedWork.alternate;

	  var flags = flags$1(finishedWork); //todo Snapshot

	};

	var commitBeforeMutationEffects = function commitBeforeMutationEffects(root, firstChild) {
	  nextEffect = firstChild;
	  commitBeforeMutationEffects_begin();
	};
	var commitMutationEffects = function commitMutationEffects(root, firstChild) {
	  nextEffect = firstChild;
	  commitMutationEffects_begin();
	};

	var isHostParent = function isHostParent(fiber) {
	  return fiber.tag === HostComponent || fiber.tag === HostRoot;
	};

	var getHostParentFiber = function getHostParentFiber(fiber) {
	  var parent = fiber["return"];

	  while (parent !== null) {
	    if (isHostParent(parent)) {
	      return parent;
	    }

	    parent = parent["return"];
	  }

	  throw new Error('Expected to find a host parent');
	};
	/**
	 * 找到一个fiber节点右边首个不需要插入的dom节点
	 * @param fiber 从该节点开始往右边找
	 * @returns 找到的dom节点
	 */


	var getHostSibling = function getHostSibling(fiber) {
	  var node = fiber;

	  siblings: while (true) {
	    while (node.sibling === null) {
	      if (node["return"] === null || isHostParent(node["return"])) return null;
	      node = node["return"];
	    }

	    node.sibling["return"] = node["return"];
	    node = node.sibling;

	    while (node.tag !== HostComponent) {
	      if (flags$1(node) & Placement) {
	        continue siblings;
	      }

	      if (node.child === null) {
	        continue siblings;
	      } else {
	        node.child["return"] = node;
	        node = node.child;
	      }
	    }

	    if (!(flags$1(node) & Placement)) {
	      return node.stateNode;
	    }
	  }
	};

	var insertOrAppendPlacementNode = function insertOrAppendPlacementNode(node, before, parent) {
	  var tag = node.tag;
	  var isHost = tag === HostComponent || tag === HostText;

	  if (isHost) {
	    var stateNode = isHost ? node.stateNode : node.stateNode.instance;

	    if (before) {
	      insertBefore(parent, stateNode, before);
	    } else {
	      appendChild(parent, stateNode);
	    }
	  } else {
	    var child = node.child;

	    if (child !== null) {
	      insertOrAppendPlacementNode(child, before, parent);
	      var sibling = child.sibling;

	      while (sibling !== null) {
	        insertOrAppendPlacementNode(sibling, before, parent);
	        sibling = sibling.sibling;
	      }
	    }
	  }
	};

	var insertOrAppendPlacementNodeIntoContainer = function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
	  var tag = node.tag;
	  var isHost = tag === HostComponent || tag === HostText;

	  if (isHost) {
	    var stateNode = node.stateNode;

	    if (before) {
	      insertInContainerBefore(parent, stateNode, before);
	    } else {
	      appendChildToContainer(parent, stateNode);
	    }
	  } else {
	    var child = node.child;

	    if (child !== null) {
	      insertOrAppendPlacementNodeIntoContainer(child, before, parent);
	      var sibling = child.sibling;

	      while (sibling !== null) {
	        insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
	        sibling = sibling.sibling;
	      }
	    }
	  }
	};

	var commitPlacement = function commitPlacement(finishedWork) {
	  var parentFiber = getHostParentFiber(finishedWork);
	  var parent;
	  var isContainer;
	  var parentStateNode = parentFiber.stateNode;

	  switch (parentFiber.tag) {
	    case HostComponent:
	      parent = parentStateNode;
	      isContainer = false;
	      break;

	    case HostRoot:
	      parent = parentStateNode.containerInfo;
	      isContainer = true;
	      break;

	    default:
	      {
	        throw new Error('Invalid host parent fiber');
	      }
	  }

	  if (flags$1(parentFiber) & ContentReset) ;

	  var before = getHostSibling(finishedWork);

	  if (isContainer) {
	    insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
	  } else {
	    insertOrAppendPlacementNode(finishedWork, before, parent);
	  }
	};

	var commitLayoutEffects = function commitLayoutEffects(finishedWork, root) {
	  nextEffect = finishedWork; //todo
	  //   commitLayoutEffects_begin(finishedWork, root)
	};

	var commitMutationEffectsOnFiber = function commitMutationEffectsOnFiber(finishedWork, root) {
	  var flags = flags$1(finishedWork);

	  var primaryFlags = flags & (Placement | Update);

	  switch (primaryFlags) {
	    case Placement:
	      {
	        commitPlacement(finishedWork);
	        finishedWork.flags &= ~Placement;
	      }
	  }
	};

	var commitMutationEffects_complete = function commitMutationEffects_complete(root) {
	  while (nextEffect !== null) {
	    var fiber = nextEffect;
	    commitMutationEffectsOnFiber(fiber);
	    var sibling = fiber.sibling;

	    if (sibling !== null) {
	      ensureCorrectReturnPointer(sibling, fiber["return"]);
	      nextEffect = sibling;
	      return;
	    }

	    nextEffect = fiber["return"];
	  }
	};

	var commitMutationEffects_begin = function commitMutationEffects_begin(root) {
	  while (nextEffect !== null) {
	    var fiber = nextEffect; //todo 删除fiber节点
	    // const deletions = fiber.deletions
	    // if (deletions !== null) {
	    //   for (let i = 0; i < deletions.length; ++i) {
	    //     const childToDelete = deletions[i]
	    //     commitDeletion(root, childToDelete, fiber)
	    //   }
	    // }

	    var child = fiber.child;

	    if ((fiber.subtreeFlags & MutationMask) !== NoFlags && child !== null) {
	      ensureCorrectReturnPointer(child, fiber);
	      nextEffect = child;
	    } else {
	      commitMutationEffects_complete();
	    }
	  }
	};

	var appendAllChildren = function appendAllChildren(parent, workInProgress) {
	  var node = workInProgress.child;

	  while (node !== null) {
	    if (node.tag === HostComponent || node.tag === HostText) {
	      appendInitialChild(parent, node.stateNode);
	    } else if (node.child !== null) {
	      //如果该子节点不是一个HostComponent则继续向下找
	      node.child["return"] = node;
	      node = node.child;
	      continue;
	    }

	    if (node === workInProgress) {
	      return;
	    }

	    while (node.sibling === null) {
	      var _node$return, _node;

	      //该层级所有以node为父节点的子树中离parent最近的dom已经完成追加，是时候返回到上层了

	      /**
	       *          FunctionComp A
	       * FunctionCompB     FunctionCompC    FunctionCompD
	       *                       domE
	       * 如果此时处于node为domE，那么将node置为FunctionCompC就会跳出这个循环
	       *
	       */
	      if (node["return"] === null || node["return"] === workInProgress) return;
	      node = (_node$return = (_node = node) === null || _node === void 0 ? void 0 : _node["return"]) !== null && _node$return !== void 0 ? _node$return : null;
	    } //以该node为父节点的子树中离parent最近的dom已经完成追加，尝试对同级中其他fiber节点执行相同操作


	    node.sibling["return"] = node["return"];
	    node = node.sibling;
	  }
	};

	var bubbleProperties = function bubbleProperties(completedWork) {
	  var didBailout = completedWork.alternate !== null && completedWork.alternate.child === completedWork.child;
	  var subtreeFlags = NoFlags;

	  if (!didBailout) {
	    var child = completedWork.child;

	    while (child !== null) {
	      subtreeFlags |= child.subtreeFlags;
	      subtreeFlags |= flags$1(child);
	      child["return"] = completedWork;
	      child = child.sibling;
	    }

	    completedWork.subtreeFlags |= subtreeFlags;
	  } else {
	    //todo
	    throw new Error('Not Implement');
	  }

	  return didBailout;
	};

	var completeWork = function completeWork(current, workInProgress) {
	  var newProps = workInProgress.pendingProps;

	  switch (workInProgress.tag) {
	    case IndeterminateComponent:
	    case FunctionComponent:
	      return null;

	    case HostRoot:
	      {
	        //todo
	        //   const fiberRoot = workInProgress.stateNode
	        bubbleProperties(workInProgress);
	        return null;
	      }

	    case HostComponent:
	      {
	        var type = workInProgress.type;

	        if (current !== null && workInProgress.stateNode != null) {
	          //todo
	          throw new Error('Not Implement');
	        } else {
	          var instance = createInstance(type, newProps, workInProgress); //由于是前序遍历，当workInProgress进行归阶段时，
	          //其所有子节点都已完成了递和归阶段，也就是意味着其子树的所有dom节点已经创建
	          //所以只需要把子树中离instance最近的dom节点追加到instance上即可

	          appendAllChildren(instance, workInProgress);
	          workInProgress.stateNode = instance;
	          bubbleProperties(workInProgress);

	          if (finalizeInitialChildren(instance, type, newProps)) ;
	        }

	        return null;
	      }

	    case HostText:
	      {
	        var newText = newProps;

	        if (current && workInProgress.stateNode !== null) {
	          throw new Error('Not Implement');
	        } else {
	          workInProgress.stateNode = createTextInstance(newText);
	        }

	        bubbleProperties(workInProgress);
	        return null;
	      }
	  }

	  throw new Error('Not implement');
	};

	/**
	 * 当前在构建应用的root
	 */

	var workInProgressRoot = null;
	/**
	 * 当前正在进行工作的fiber节点
	 */

	var workInProgress = null;

	var completeUnitOfWork = function completeUnitOfWork(unitOfWork) {
	  var completedWork = unitOfWork;

	  do {
	    var current = completedWork.alternate;
	    var returnFiber = completedWork["return"];
	    var next = completeWork(current, completedWork); // if (next !== null) {
	    //   //// Something suspended. Re-render with the fallback children.
	    //   workInProgress = next
	    //   return
	    // }

	    var siblingFiber = completedWork.sibling; //由于是前序遍历，当一个节点的"归阶段"完成后立马进入其下一个兄弟节点的递阶段

	    if (siblingFiber !== null) {
	      workInProgress = siblingFiber;
	      return;
	    } //returnFiber的所有子节点都完成递和归阶段，接下来到returnFiber的归阶段了


	    completedWork = returnFiber;
	    workInProgress = completedWork;
	  } while (completedWork !== null);
	};

	var performUnitOfWork = function performUnitOfWork(unitOfWork) {
	  var current = unitOfWork.alternate;
	  var next = null; //创建或者reconcile unitOfWork.child并将其返回

	  next = beginWork(current, unitOfWork); //进行的时前序遍历，next为null说明该节点没有子节点了，对其进行归过程

	  if (next === null) {
	    //todo completeUnitofWork
	    completeUnitOfWork(unitOfWork);
	  } else {
	    //将workInProgress赋值为unitOfWork的第一个子节点
	    workInProgress = next;
	  }
	};
	/**
	 *
	 * @param root 新一轮更新的FiberRoot
	 */


	var prepareFreshStack = function prepareFreshStack(root) {
	  workInProgressRoot = root; //创建workInProgress的HostRoot其props为null

	  workInProgress = createWorkInProgress(root.current, null);
	};

	var renderRootSync = function renderRootSync(root) {
	  //如果根节点改变调用prepareFreshStack重置参数
	  if (workInProgressRoot !== root) {
	    prepareFreshStack(root);
	  }

	  while (workInProgress !== null) {
	    performUnitOfWork(workInProgress);
	  }
	};

	var commitRootImpl = function commitRootImpl(root) {
	  var finishedWork = root.finishedWork;
	  if (finishedWork === null) return null;
	  root.finishedWork = null;
	  workInProgressRoot = null;
	  workInProgress = null;
	  var subtreeHasEffects = (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	  var rootHasEffect = (flags$1(finishedWork) & MutationMask) !== NoFlags;

	  if (rootHasEffect || subtreeHasEffects) {
	    commitBeforeMutationEffects(root, finishedWork);
	    commitMutationEffects(root, finishedWork);
	    root.current = finishedWork;
	    commitLayoutEffects(finishedWork);
	  } else {
	    root.current = finishedWork;
	  }

	  return null;
	};

	var commitRoot = function commitRoot(root) {
	  commitRootImpl(root);
	  return null;
	};

	var performSyncWorkOnRoot = function performSyncWorkOnRoot(root) {
	  var exitStatus = renderRootSync(root);
	  var finishedWork = root.current.alternate;
	  root.finishedWork = finishedWork;
	  commitRoot(root);
	};
	/**
	 * 调度fiber节点上的更新
	 *
	 * @param fiber 当前产生更新的fiber节点
	 * @returns 产生更新fiber树的FiberRoot(注意不是rootFiber)
	 */

	var scheduleUpdateOnFiber = function scheduleUpdateOnFiber(fiber) {
	  var node = fiber;
	  var parent = node["return"];

	  while (parent) {
	    //不断向上遍历，当node为HostRoot类型时会跳出循环
	    node = parent;
	    parent = parent["return"];
	  }

	  if (node.tag !== HostRoot) {
	    return null;
	  }

	  var root = node.stateNode;
	  performSyncWorkOnRoot(root);
	  return root;
	};
	var discreteUpdates$1 = function discreteUpdates(fn, a, b, c, d) {
	  return fn(a, b, c, d);
	};
	var batchedEventUpdates$1 = function batchedEventUpdates(fn, a) {
	  return fn(a);
	};

	/**
	 *
	 * @param containerInfo 当前创建fiber树所在的dom节点，在concurrent模式下由createRoot方法传入
	 * @param tag 决定fiber树是以什么模式创建的(concurrent,blocking)
	 * @returns 返回FiberRoot（整个应用的根节点，其中current保存有当前页面所对应的fiber树）
	 */

	var createContainer = function createContainer(containerInfo, tag) {
	  return createFiberRoot(containerInfo, tag);
	};
	/**
	 *
	 * @param element 由react.createElement创建的jsx对象在legacy模式下由ReactDom.render方法第一个参数传入
	 * @param container 整个应用的根节点(类型为FiberRoot)，其中current(类型为Fiber，是否为Fiber树根节点由tag属性决定)保存有当前页面所对应的fiber树
	 */

	var updateContainer = function updateContainer(element, container) {
	  var current = container.current;
	  var update = createUpdate();
	  update.payload = {
	    element: element
	  };
	  enqueueUpdate(current, update);
	  scheduleUpdateOnFiber(current);
	};

	var freezing = !fails(function () {
	  return Object.isExtensible(Object.preventExtensions({}));
	});

	var internalMetadata = createCommonjsModule(function (module) {
	var defineProperty = objectDefineProperty.f;



	var METADATA = uid('meta');
	var id = 0;

	var isExtensible = Object.isExtensible || function () {
	  return true;
	};

	var setMetadata = function (it) {
	  defineProperty(it, METADATA, { value: {
	    objectID: 'O' + ++id, // object ID
	    weakData: {}          // weak collections IDs
	  } });
	};

	var fastKey = function (it, create) {
	  // return a primitive with prefix
	  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!has(it, METADATA)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMetadata(it);
	  // return object ID
	  } return it[METADATA].objectID;
	};

	var getWeakData = function (it, create) {
	  if (!has(it, METADATA)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMetadata(it);
	  // return the store of weak collections IDs
	  } return it[METADATA].weakData;
	};

	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (freezing && meta.REQUIRED && isExtensible(it) && !has(it, METADATA)) setMetadata(it);
	  return it;
	};

	var meta = module.exports = {
	  REQUIRED: false,
	  fastKey: fastKey,
	  getWeakData: getWeakData,
	  onFreeze: onFreeze
	};

	hiddenKeys[METADATA] = true;
	});
	var internalMetadata_1 = internalMetadata.REQUIRED;
	var internalMetadata_2 = internalMetadata.fastKey;
	var internalMetadata_3 = internalMetadata.getWeakData;
	var internalMetadata_4 = internalMetadata.onFreeze;

	var Result = function (stopped, result) {
	  this.stopped = stopped;
	  this.result = result;
	};

	var iterate = function (iterable, unboundFunction, options) {
	  var that = options && options.that;
	  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
	  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
	  var INTERRUPTED = !!(options && options.INTERRUPTED);
	  var fn = functionBindContext(unboundFunction, that, 1 + AS_ENTRIES + INTERRUPTED);
	  var iterator, iterFn, index, length, result, next, step;

	  var stop = function (condition) {
	    if (iterator) iteratorClose(iterator);
	    return new Result(true, condition);
	  };

	  var callFn = function (value) {
	    if (AS_ENTRIES) {
	      anObject(value);
	      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
	    } return INTERRUPTED ? fn(value, stop) : fn(value);
	  };

	  if (IS_ITERATOR) {
	    iterator = iterable;
	  } else {
	    iterFn = getIteratorMethod(iterable);
	    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
	    // optimisation for array iterators
	    if (isArrayIteratorMethod(iterFn)) {
	      for (index = 0, length = toLength(iterable.length); length > index; index++) {
	        result = callFn(iterable[index]);
	        if (result && result instanceof Result) return result;
	      } return new Result(false);
	    }
	    iterator = iterFn.call(iterable);
	  }

	  next = iterator.next;
	  while (!(step = next.call(iterator)).done) {
	    try {
	      result = callFn(step.value);
	    } catch (error) {
	      iteratorClose(iterator);
	      throw error;
	    }
	    if (typeof result == 'object' && result && result instanceof Result) return result;
	  } return new Result(false);
	};

	var anInstance = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) {
	    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	  } return it;
	};

	var defineProperty$6 = objectDefineProperty.f;
	var forEach = arrayIteration.forEach;



	var setInternalState$3 = internalState.set;
	var internalStateGetterFor = internalState.getterFor;

	var collection = function (CONSTRUCTOR_NAME, wrapper, common) {
	  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
	  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
	  var ADDER = IS_MAP ? 'set' : 'add';
	  var NativeConstructor = global_1[CONSTRUCTOR_NAME];
	  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
	  var exported = {};
	  var Constructor;

	  if (!descriptors || typeof NativeConstructor != 'function'
	    || !(IS_WEAK || NativePrototype.forEach && !fails(function () { new NativeConstructor().entries().next(); }))
	  ) {
	    // create collection constructor
	    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
	    internalMetadata.REQUIRED = true;
	  } else {
	    Constructor = wrapper(function (target, iterable) {
	      setInternalState$3(anInstance(target, Constructor, CONSTRUCTOR_NAME), {
	        type: CONSTRUCTOR_NAME,
	        collection: new NativeConstructor()
	      });
	      if (iterable != undefined) iterate(iterable, target[ADDER], { that: target, AS_ENTRIES: IS_MAP });
	    });

	    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

	    forEach(['add', 'clear', 'delete', 'forEach', 'get', 'has', 'set', 'keys', 'values', 'entries'], function (KEY) {
	      var IS_ADDER = KEY == 'add' || KEY == 'set';
	      if (KEY in NativePrototype && !(IS_WEAK && KEY == 'clear')) {
	        createNonEnumerableProperty(Constructor.prototype, KEY, function (a, b) {
	          var collection = getInternalState(this).collection;
	          if (!IS_ADDER && IS_WEAK && !isObject(a)) return KEY == 'get' ? undefined : false;
	          var result = collection[KEY](a === 0 ? 0 : a, b);
	          return IS_ADDER ? this : result;
	        });
	      }
	    });

	    IS_WEAK || defineProperty$6(Constructor.prototype, 'size', {
	      configurable: true,
	      get: function () {
	        return getInternalState(this).collection.size;
	      }
	    });
	  }

	  setToStringTag(Constructor, CONSTRUCTOR_NAME, false, true);

	  exported[CONSTRUCTOR_NAME] = Constructor;
	  _export({ global: true, forced: true }, exported);

	  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

	  return Constructor;
	};

	var redefineAll = function (target, src, options) {
	  for (var key in src) {
	    if (options && options.unsafe && target[key]) target[key] = src[key];
	    else redefine(target, key, src[key], options);
	  } return target;
	};

	var SPECIES$3 = wellKnownSymbol('species');

	var setSpecies = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
	  var defineProperty = objectDefineProperty.f;

	  if (descriptors && Constructor && !Constructor[SPECIES$3]) {
	    defineProperty(Constructor, SPECIES$3, {
	      configurable: true,
	      get: function () { return this; }
	    });
	  }
	};

	var defineProperty$7 = objectDefineProperty.f;








	var fastKey = internalMetadata.fastKey;


	var setInternalState$4 = internalState.set;
	var internalStateGetterFor$1 = internalState.getterFor;

	var collectionStrong = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      anInstance(that, C, CONSTRUCTOR_NAME);
	      setInternalState$4(that, {
	        type: CONSTRUCTOR_NAME,
	        index: objectCreate(null),
	        first: undefined,
	        last: undefined,
	        size: 0
	      });
	      if (!descriptors) that.size = 0;
	      if (iterable != undefined) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
	    });

	    var getInternalState = internalStateGetterFor$1(CONSTRUCTOR_NAME);

	    var define = function (that, key, value) {
	      var state = getInternalState(that);
	      var entry = getEntry(that, key);
	      var previous, index;
	      // change existing entry
	      if (entry) {
	        entry.value = value;
	      // create new entry
	      } else {
	        state.last = entry = {
	          index: index = fastKey(key, true),
	          key: key,
	          value: value,
	          previous: previous = state.last,
	          next: undefined,
	          removed: false
	        };
	        if (!state.first) state.first = entry;
	        if (previous) previous.next = entry;
	        if (descriptors) state.size++;
	        else that.size++;
	        // add to index
	        if (index !== 'F') state.index[index] = entry;
	      } return that;
	    };

	    var getEntry = function (that, key) {
	      var state = getInternalState(that);
	      // fast case
	      var index = fastKey(key);
	      var entry;
	      if (index !== 'F') return state.index[index];
	      // frozen object case
	      for (entry = state.first; entry; entry = entry.next) {
	        if (entry.key == key) return entry;
	      }
	    };

	    redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear() {
	        var that = this;
	        var state = getInternalState(that);
	        var data = state.index;
	        var entry = state.first;
	        while (entry) {
	          entry.removed = true;
	          if (entry.previous) entry.previous = entry.previous.next = undefined;
	          delete data[entry.index];
	          entry = entry.next;
	        }
	        state.first = state.last = undefined;
	        if (descriptors) state.size = 0;
	        else that.size = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function (key) {
	        var that = this;
	        var state = getInternalState(that);
	        var entry = getEntry(that, key);
	        if (entry) {
	          var next = entry.next;
	          var prev = entry.previous;
	          delete state.index[entry.index];
	          entry.removed = true;
	          if (prev) prev.next = next;
	          if (next) next.previous = prev;
	          if (state.first == entry) state.first = next;
	          if (state.last == entry) state.last = prev;
	          if (descriptors) state.size--;
	          else that.size--;
	        } return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn /* , that = undefined */) {
	        var state = getInternalState(this);
	        var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
	        var entry;
	        while (entry = entry ? entry.next : state.first) {
	          boundFunction(entry.value, entry.key, this);
	          // revert to the last existing entry
	          while (entry && entry.removed) entry = entry.previous;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key) {
	        return !!getEntry(this, key);
	      }
	    });

	    redefineAll(C.prototype, IS_MAP ? {
	      // 23.1.3.6 Map.prototype.get(key)
	      get: function get(key) {
	        var entry = getEntry(this, key);
	        return entry && entry.value;
	      },
	      // 23.1.3.9 Map.prototype.set(key, value)
	      set: function set(key, value) {
	        return define(this, key === 0 ? 0 : key, value);
	      }
	    } : {
	      // 23.2.3.1 Set.prototype.add(value)
	      add: function add(value) {
	        return define(this, value = value === 0 ? 0 : value, value);
	      }
	    });
	    if (descriptors) defineProperty$7(C.prototype, 'size', {
	      get: function () {
	        return getInternalState(this).size;
	      }
	    });
	    return C;
	  },
	  setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
	    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
	    var getInternalCollectionState = internalStateGetterFor$1(CONSTRUCTOR_NAME);
	    var getInternalIteratorState = internalStateGetterFor$1(ITERATOR_NAME);
	    // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	    defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
	      setInternalState$4(this, {
	        type: ITERATOR_NAME,
	        target: iterated,
	        state: getInternalCollectionState(iterated),
	        kind: kind,
	        last: undefined
	      });
	    }, function () {
	      var state = getInternalIteratorState(this);
	      var kind = state.kind;
	      var entry = state.last;
	      // revert to the last existing entry
	      while (entry && entry.removed) entry = entry.previous;
	      // get next entry
	      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
	        // or finish the iteration
	        state.target = undefined;
	        return { value: undefined, done: true };
	      }
	      // return step by kind
	      if (kind == 'keys') return { value: entry.key, done: false };
	      if (kind == 'values') return { value: entry.value, done: false };
	      return { value: [entry.key, entry.value], done: false };
	    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

	    // add [@@species], 23.1.2.2, 23.2.2.2
	    setSpecies(CONSTRUCTOR_NAME);
	  }
	};

	// `Set` constructor
	// https://tc39.es/ecma262/#sec-set-objects
	var es_set = collection('Set', function (init) {
	  return function Set() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionStrong);

	var set$1 = path.Set;

	var set$2 = set$1;

	var set$3 = set$2;

	var arrayMethodIsStrict = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal -- required for testing
	    method.call(null, argument || function () { throw 1; }, 1);
	  });
	};

	var $forEach$1 = arrayIteration.forEach;


	var STRICT_METHOD = arrayMethodIsStrict('forEach');

	// `Array.prototype.forEach` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	var arrayForEach = !STRICT_METHOD ? function forEach(callbackfn /* , thisArg */) {
	  return $forEach$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	} : [].forEach;

	// `Array.prototype.forEach` method
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	_export({ target: 'Array', proto: true, forced: [].forEach != arrayForEach }, {
	  forEach: arrayForEach
	});

	var forEach$1 = entryVirtual('Array').forEach;

	var forEach$2 = forEach$1;

	var ArrayPrototype$2 = Array.prototype;

	var DOMIterables = {
	  DOMTokenList: true,
	  NodeList: true
	};

	var forEach_1 = function (it) {
	  var own = it.forEach;
	  return it === ArrayPrototype$2 || (it instanceof Array && own === ArrayPrototype$2.forEach)
	    // eslint-disable-next-line no-prototype-builtins -- safe
	    || DOMIterables.hasOwnProperty(classof(it)) ? forEach$2 : own;
	};

	var forEach$3 = forEach_1;

	var addEventCaptureListenerWithPassiveFlag = function addEventCaptureListenerWithPassiveFlag(target, eventType, listener, passive) {
	  target.addEventListener(eventType, listener, {
	    capture: true,
	    passive: passive
	  });
	  return listener;
	};
	var addEventCaptureListener = function addEventCaptureListener(target, eventType, listener) {
	  target.addEventListener(eventType, listener, true);
	  return listener;
	};
	var addEventBubbleListenerWithPassiveFlag = function addEventBubbleListenerWithPassiveFlag(target, eventType, listener, passive) {
	  target.addEventListener(eventType, listener, {
	    passive: passive
	  });
	  return listener;
	};
	var addEventBubbleListener = function addEventBubbleListener(target, eventType, listener) {
	  target.addEventListener(eventType, listener, false);
	  return listener;
	};

	var allNativeEvents = new set$3();
	/**
	 * Mapping from registration name to event name
	 */

	var registrationNameDependencies = {};
	var registerDirectEvent = function registerDirectEvent(registrationName, dependencies) {
	  if (registrationNameDependencies[registrationName]) {
	    console.error('EventRegistry: More than one plugin attempted to publish the same ' + 'registration name, `%s`.', registrationName);
	  }

	  registrationNameDependencies[registrationName] = dependencies;

	  for (var i = 0; i < dependencies.length; ++i) {
	    allNativeEvents.add(dependencies[i]);
	  }
	};
	var registerTwoPhaseEvent = function registerTwoPhaseEvent(registrationName, dependencies) {
	  registerDirectEvent(registrationName, dependencies);
	  registerDirectEvent(registrationName + 'Capture', dependencies);
	};

	var IS_CAPTURE_PHASE = 1 << 2;

	var getEventTarget = function getEventTarget(nativeEvent) {
	  var target = nativeEvent.target || window;
	  return target.nodeType === TEXT_NODE ? target.parentNode : target;
	};

	var isInteractive = function isInteractive(tag) {
	  return tag === 'button' || tag === 'input' || tag === 'select' || tag === 'textarea';
	};

	var shouldPreventMouseEvent = function shouldPreventMouseEvent(name, type, props) {
	  switch (name) {
	    case 'onClick':
	    case 'onClickCapture':
	      return !!(props.disabled && isInteractive(type));

	    default:
	      return true;
	  }
	};

	var getListener = function getListener(instance, registrationName) {
	  var stateNode = instance.stateNode;
	  if (stateNode === null) return null;
	  var props = getFiberCurrentPropsFromNode(stateNode);
	  if (props === null) return null;
	  var listener = props[registrationName];
	  if (shouldPreventMouseEvent(registrationName, instance.type, props)) return null;
	  return listener !== null && listener !== void 0 ? listener : null;
	};

	// `Map` constructor
	// https://tc39.es/ecma262/#sec-map-objects
	var es_map = collection('Map', function (init) {
	  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionStrong);

	var map = path.Map;

	var map$1 = map;

	var map$2 = map$1;

	/**
	 * click、keydown、focusin等，这些事件的触发不是连续的，优先级为0。
	 */
	var DiscreteEvent = 0;
	/**
	 * canplay、error、audio标签的timeupdate和canplay，优先级最高，为2。
	 */

	var ContinuousEvent = 2;

	var eventPriorities = new map$2(); // prettier-ignore

	var discreteEventPairsForSimpleEventPlugin = ['cancel', 'cancel', 'click', 'click', 'close', 'close', 'contextmenu', 'contextMenu', 'copy', 'copy', 'cut', 'cut', 'auxclick', 'auxClick', 'dblclick', 'doubleClick', // Careful!
	'dragend', 'dragEnd', 'dragstart', 'dragStart', 'drop', 'drop', 'focusin', 'focus', // Careful!
	'focusout', 'blur', // Careful!
	'input', 'input', 'invalid', 'invalid', 'keydown', 'keyDown', 'keypress', 'keyPress', 'keyup', 'keyUp', 'mousedown', 'mouseDown', 'mouseup', 'mouseUp', 'paste', 'paste', 'pause', 'pause', 'play', 'play', 'pointercancel', 'pointerCancel', 'pointerdown', 'pointerDown', 'pointerup', 'pointerUp', 'ratechange', 'rateChange', 'reset', 'reset', 'seeked', 'seeked', 'submit', 'submit', 'touchcancel', 'touchCancel', 'touchend', 'touchEnd', 'touchstart', 'touchStart', 'volumechange', 'volumeChange'];
	var topLevelEventsToReactNames = new map$2();

	var registerSimplePluginEventsAndSetTheirPriorities = function registerSimplePluginEventsAndSetTheirPriorities(eventTypes, priority) {
	  for (var i = 0; i < eventTypes.length; i += 2) {
	    var topEvent = eventTypes[i];
	    var event = eventTypes[i + 1];

	    var capitalizedEvent = event[0].toUpperCase() + slice$4(event).call(event, 1);

	    var reactName = 'on' + capitalizedEvent;
	    eventPriorities.set(topEvent, priority);
	    topLevelEventsToReactNames.set(topEvent, reactName);
	    registerTwoPhaseEvent(reactName, [topEvent]);
	  }
	};

	var getEventPriorityForPluginSystem = function getEventPriorityForPluginSystem(domEventName) {
	  var priority = eventPriorities.get(domEventName);
	  return priority === undefined ? ContinuousEvent : priority;
	};
	var registerSimpleEvents = function registerSimpleEvents() {
	  registerSimplePluginEventsAndSetTheirPriorities(discreteEventPairsForSimpleEventPlugin, DiscreteEvent);
	};

	var createSyntheticEvent = function createSyntheticEvent() {
	  var SyntheticBaseEvent = function SyntheticBaseEvent() {
	    _classCallCheck(this, SyntheticBaseEvent);
	  };

	  return SyntheticBaseEvent;
	};
	var SyntheticEvent = createSyntheticEvent();
	var SyntheticMouseEvent = createSyntheticEvent();

	var extractEvents = function extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
	  var _topLevelEventsToReac;

	  var SyntheticEventCtor = SyntheticEvent;

	  switch (domEventName) {
	    case 'click':
	      SyntheticEventCtor = SyntheticMouseEvent;
	      break;
	  }

	  var reactName = (_topLevelEventsToReac = topLevelEventsToReactNames.get(domEventName)) !== null && _topLevelEventsToReac !== void 0 ? _topLevelEventsToReac : null;
	  var inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
	  var accumulateTargetOnly = !inCapturePhase && domEventName === 'scroll';
	  var listeners = accumulateSinglePhaseListeners(targetInst, reactName, inCapturePhase, accumulateTargetOnly);

	  if (listeners.length) {
	    var event = new SyntheticEventCtor();
	    dispatchQueue.push({
	      event: event,
	      listeners: listeners
	    });
	  }
	};

	var dispatchDiscreteEvent = function dispatchDiscreteEvent(domEventName, eventSymtemFlags, container, nativeEvent) {
	  discreteUpdates(dispatchEvent, domEventName, eventSymtemFlags, container, nativeEvent);
	};

	var attemptToDispatchEvent = function attemptToDispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
	  var nativeEventTarget = getEventTarget(nativeEvent);
	  var targetInst = getClosestInstanceFromNode(nativeEventTarget);
	  dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst);
	  return null;
	};

	var dispatchEvent = function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
	  attemptToDispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent);
	};
	var createEventListenerWrapperWithPriority = function createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSymtemFlags) {
	  var eventPriority = getEventPriorityForPluginSystem(domEventName);
	  var listenerWrapper;

	  switch (eventPriority) {
	    case DiscreteEvent:
	      listenerWrapper = dispatchDiscreteEvent;
	      break;

	    default:
	      throw new Error('Not Implement');
	  }

	  return bind$2(listenerWrapper).call(listenerWrapper, null, domEventName, eventSymtemFlags, targetContainer);
	};

	var _context$1;

	var listeningMarker = '_reactListening' + slice$4(_context$1 = Math.random().toString(36)).call(_context$1, 2);

	registerSimpleEvents();
	/**
	 * 我们不因该在container代理这些事件，而是因该把他们添加到真正的目标dom上
	 * 主要是因为这些事件的冒泡不具有一致性
	 */

	var nonDelegatedEvents = new set$3(['cancel', 'close', 'invalid', 'load', 'scroll', 'toggle']);

	var addTrappedEventListener = function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
	  var listener = createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags);
	  var isPassiveListener = undefined;

	  if (domEventName === 'wheel' || domEventName === 'touchmove' || domEventName === 'touchstart') {
	    isPassiveListener = true;
	  }

	  var unsubscribeListener;

	  if (isCapturePhaseListener) {
	    if (isPassiveListener !== undefined) {
	      unsubscribeListener = addEventCaptureListenerWithPassiveFlag(targetContainer, domEventName, listener, isPassiveListener);
	    } else {
	      unsubscribeListener = addEventCaptureListener(targetContainer, domEventName, listener);
	    }
	  } else {
	    if (isPassiveListener !== undefined) {
	      unsubscribeListener = addEventBubbleListenerWithPassiveFlag(targetContainer, domEventName, listener, isPassiveListener);
	    } else {
	      unsubscribeListener = addEventBubbleListener(targetContainer, domEventName, listener);
	    }
	  }
	};

	var listenToNativeEvent = function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
	  var eventSystemFlags = 0;

	  if (isCapturePhaseListener) {
	    eventSystemFlags |= IS_CAPTURE_PHASE;
	  }

	  addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
	};

	var listenToAllSupportedEvents = function listenToAllSupportedEvents(rootContainerElement) {
	  if (!rootContainerElement[listeningMarker]) {
	    forEach$3(allNativeEvents).call(allNativeEvents, function (domEventName) {
	      /**
	       * 单独处理selectionchange因为他不会冒泡，而且需要设置在document上
	       */
	      if (domEventName !== 'selectionchange') {
	        if (!nonDelegatedEvents.has(domEventName)) {
	          listenToNativeEvent(domEventName, false, rootContainerElement);
	        }

	        listenToNativeEvent(domEventName, true, rootContainerElement);
	      }
	    });
	  }
	};

	var extractEvents$1 = function extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer) {
	  extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags);
	};

	var createDispatchListener = function createDispatchListener(instance, listener, currentTarget) {
	  return {
	    instance: instance,
	    listener: listener,
	    currentTarget: currentTarget
	  };
	};

	var accumulateSinglePhaseListeners = function accumulateSinglePhaseListeners(targetFiber, reactName, inCapturePhase, accumulateTargetOnly) {
	  var captureName = reactName !== null ? reactName + 'Capture' : null;
	  var reactEventName = inCapturePhase ? captureName : reactName;
	  var listeners = [];
	  var instance = targetFiber;
	  var lastHostComponent = null;

	  while (instance !== null) {
	    var _instance = instance,
	        tag = _instance.tag,
	        stateNode = _instance.stateNode;

	    if (tag === HostComponent && stateNode !== null) {
	      lastHostComponent = stateNode;

	      if (reactEventName !== null) {
	        var listener = getListener(instance, reactEventName);

	        if (listener !== null) {
	          listeners.push(createDispatchListener(instance, listener, lastHostComponent));
	        }
	      }
	    }

	    if (accumulateTargetOnly) break;
	    instance = instance["return"];
	  }

	  return listeners;
	};

	var executeDispatch = function executeDispatch(event, listener, currentTarget) {
	  listener(event);
	};

	var processDispatchQueueItemsInOrder = function processDispatchQueueItemsInOrder(event, dispatchListeners, inCapturePhase) {
	  if (inCapturePhase) {
	    for (var i = dispatchListeners.length - 1; i >= 0; --i) {
	      var _dispatchListeners$i = dispatchListeners[i],
	          instance = _dispatchListeners$i.instance,
	          currentTarget = _dispatchListeners$i.currentTarget,
	          listener = _dispatchListeners$i.listener; //todo isPropagationStopped

	      executeDispatch(event, listener);
	    }
	  } else {
	    for (var _i = 0; _i < dispatchListeners.length; ++_i) {
	      var _dispatchListeners$_i = dispatchListeners[_i],
	          _instance2 = _dispatchListeners$_i.instance,
	          _currentTarget = _dispatchListeners$_i.currentTarget,
	          _listener = _dispatchListeners$_i.listener; //todo isPropagationStopped

	      executeDispatch(event, _listener);
	    }
	  }
	};

	var processDispatchQueue = function processDispatchQueue(dispatchQueue, eventSystemFlags) {
	  var inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;

	  for (var i = 0; i < dispatchQueue.length; ++i) {
	    var _dispatchQueue$i = dispatchQueue[i],
	        event = _dispatchQueue$i.event,
	        listeners = _dispatchQueue$i.listeners;
	    processDispatchQueueItemsInOrder(event, listeners, inCapturePhase);
	  }
	};

	var dispatchEventsForPlugins = function dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
	  var nativeEventTarget = getEventTarget(nativeEvent);
	  var dispatchQueue = [];
	  extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags);
	  processDispatchQueue(dispatchQueue, eventSystemFlags);
	};

	var dispatchEventForPluginEventSystem = function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
	  var ancestorInst = targetInst;
	  batchedEventUpdates(function () {
	    return dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, ancestorInst);
	  }, null);
	};

	/**
	 * createRoot创建节点是使用的类（ConcurrentRoot）
	 */
	var ReactDomRoot = /*#__PURE__*/function () {
	  function ReactDomRoot(container) {
	    _classCallCheck(this, ReactDomRoot);

	    _defineProperty(this, "_internalRoot", void 0);

	    var root = createContainer(container, ConcurrentRoot);
	    this._internalRoot = root;
	    var rootContainerElement = container.nodeType === COMMENT_NODE ? container.parentNode : container; //在container上初始化事件系统

	    listenToAllSupportedEvents(rootContainerElement);
	  }

	  _createClass(ReactDomRoot, [{
	    key: "render",
	    value: function render(children) {
	      var root = this._internalRoot;
	      updateContainer(children, root);
	    }
	  }]);

	  return ReactDomRoot;
	}();

	var createRoot = function createRoot(container) {
	  return new ReactDomRoot(container);
	};

	setBatchingImplementation(discreteUpdates$1, batchedEventUpdates$1);

	var App = function App() {
	  var _useState = useState(3),
	      _useState2 = _slicedToArray(_useState, 2),
	      num = _useState2[0],
	      setNum = _useState2[1];

	  return /*#__PURE__*/React.createElement("span", {
	    // onClick={() => {
	    //   console.log('span bubble')
	    // }}
	    onClickCapture: function onClickCapture() {
	      debugger;
	      console.log('span capture');
	    }
	  }, "sdfsad-", num);
	};

	createRoot(document.querySelector('#app')).render( /*#__PURE__*/React.createElement(App, null)); // ReactDom.render(<App />, document.querySelector('#app')!)

}());
//# sourceMappingURL=index.js.map
