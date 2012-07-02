/*

Copyright (c) 2011 John Resig, http://jquery.com/

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*

Copyright (c) 2011 Jeremy Ashkenas, DocumentCloud

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.*/

//     Underscore.js 1.3.1
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.1';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      if (index == 0) {
        shuffled[0] = value;
      } else {
        rand = Math.floor(Math.random() * (index + 1));
        shuffled[index] = shuffled[rand];
        shuffled[rand] = value;
      }
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return slice.call(iterable);
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var result = [];
    _.reduce(initial, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) {
        memo[memo.length] = el;
        result[result.length] = array[i];
      }
      return memo;
    }, []);
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        func.apply(context, args);
      }
      whenDone();
      throttling = true;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds.
  _.debounce = function(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(/\\\\/g, '\\').replace(/\\'/g, "'");
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.escape || noMatch, function(match, code) {
           return "',_.escape(" + unescape(code) + "),'";
         })
         .replace(c.interpolate || noMatch, function(match, code) {
           return "'," + unescape(code) + ",'";
         })
         .replace(c.evaluate || noMatch, function(match, code) {
           return "');" + unescape(code).replace(/[\r\n\t]/g, ' ') + ";__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', '_', tmpl);
    if (data) return func(data, _);
    return function(data) {
      return func.call(this, data, _);
    };
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);
/*

Copyright (c) 2010 Jeremy Ashkenas, DocumentCloud

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.*/

//     Backbone.js 0.9.2

//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `global`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to slice/splice.
  var slice = Array.prototype.slice;
  var splice = Array.prototype.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.9.2';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.
  var $ = root.jQuery || root.Zepto || root.ender;

  // Set the JavaScript library that will be used for DOM manipulation and
  // Ajax calls (a.k.a. the `$` variable). By default Backbone will use: jQuery,
  // Zepto, or Ender; but the `setDomLibrary()` method lets you inject an
  // alternate JavaScript library (or a mock library for testing your views
  // outside of a browser).
  Backbone.setDomLibrary = function(lib) {
    $ = lib;
  };

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // -----------------

  // Regular expression used to split event strings
  var eventSplitter = /\s+/;

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback functions
  // to an event; trigger`-ing an event fires all callbacks in succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind one or more space separated events, `events`, to a `callback`
    // function. Passing `"all"` will bind the callback to all events fired.
    on: function(events, callback, context) {

      var calls, event, node, tail, list;
      if (!callback) return this;
      events = events.split(eventSplitter);
      calls = this._callbacks || (this._callbacks = {});

      // Create an immutable callback list, allowing traversal during
      // modification.  The tail is an empty object that will always be used
      // as the next node.
      while (event = events.shift()) {
        list = calls[event];
        node = list ? list.tail : {};
        node.next = tail = {};
        node.context = context;
        node.callback = callback;
        calls[event] = {tail: tail, next: list ? list.next : node};
      }

      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all callbacks
    // with that function. If `callback` is null, removes all callbacks for the
    // event. If `events` is null, removes all bound callbacks for all events.
    off: function(events, callback, context) {
      var event, calls, node, tail, cb, ctx;

      // No events, or removing *all* events.
      if (!(calls = this._callbacks)) return;
      if (!(events || callback || context)) {
        delete this._callbacks;
        return this;
      }

      // Loop through the listed events and contexts, splicing them out of the
      // linked list of callbacks if appropriate.
      events = events ? events.split(eventSplitter) : _.keys(calls);
      while (event = events.shift()) {
        node = calls[event];
        delete calls[event];
        if (!node || !(callback || context)) continue;
        // Create a new list, omitting the indicated callbacks.
        tail = node.tail;
        while ((node = node.next) !== tail) {
          cb = node.callback;
          ctx = node.context;
          if ((callback && cb !== callback) || (context && ctx !== context)) {
            this.on(event, cb, ctx);
          }
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(events) {
      var event, node, calls, tail, args, all, rest;
      if (!(calls = this._callbacks)) return this;
      all = calls.all;
      events = events.split(eventSplitter);
      rest = slice.call(arguments, 1);

      // For each event, walk through the linked list of callbacks twice,
      // first to trigger the event, then to trigger any `"all"` callbacks.
      while (event = events.shift()) {
        if (node = calls[event]) {
          tail = node.tail;
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, rest);
          }
        }
        if (node = all) {
          tail = node.tail;
          args = [event].concat(rest);
          while ((node = node.next) !== tail) {
            node.callback.apply(node.context || this, args);
          }
        }
      }

      return this;
    }

  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var defaults;
    attributes || (attributes = {});
    if (options && options.parse) attributes = this.parse(attributes);
    if (defaults = getValue(this, 'defaults')) {
      attributes = _.extend({}, defaults, attributes);
    }
    if (options && options.collection) this.collection = options.collection;
    this.attributes = {};
    this._escapedAttributes = {};
    this.cid = _.uniqueId('c');
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this.set(attributes, {silent: true});
    // Reset change tracking.
    this.changed = {};
    this._silent = {};
    this._pending = {};
    this._previousAttributes = _.clone(this.attributes);
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // A hash of attributes that have silently changed since the last time
    // `change` was called.  Will become pending attributes on the next call.
    _silent: null,

    // A hash of attributes that have changed since the last `'change'` event
    // began.
    _pending: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      var html;
      if (html = this._escapedAttributes[attr]) return html;
      var val = this.get(attr);
      return this._escapedAttributes[attr] = _.escape(val == null ? '' : '' + val);
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    set: function(key, value, options) {
      var attrs, attr, val;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }

      // Extract attributes and options.
      options || (options = {});
      if (!attrs) return this;
      if (attrs instanceof Model) attrs = attrs.attributes;
      if (options.unset) for (attr in attrs) attrs[attr] = void 0;

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      var changes = options.changes = {};
      var now = this.attributes;
      var escaped = this._escapedAttributes;
      var prev = this._previousAttributes || {};

      // For each `set` attribute...
      for (attr in attrs) {
        val = attrs[attr];

        // If the new and current value differ, record the change.
        if (!_.isEqual(now[attr], val) || (options.unset && _.has(now, attr))) {
          delete escaped[attr];
          (options.silent ? this._silent : changes)[attr] = true;
        }

        // Update or delete the current value.
        options.unset ? delete now[attr] : now[attr] = val;

        // If the new and previous value differ, record the change.  If not,
        // then remove changes for this attribute.
        if (!_.isEqual(prev[attr], val) || (_.has(now, attr) != _.has(prev, attr))) {
          this.changed[attr] = val;
          if (!options.silent) this._pending[attr] = true;
        } else {
          delete this.changed[attr];
          delete this._pending[attr];
        }
      }

      // Fire the `"change"` events.
      if (!options.silent) this.change(options);
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it. `unset` is a noop if the attribute doesn't exist.
    unset: function(attr, options) {
      (options || (options = {})).unset = true;
      return this.set(attr, null, options);
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear: function(options) {
      (options || (options = {})).unset = true;
      return this.set(_.clone(this.attributes), options);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        if (!model.set(model.parse(resp, xhr), options)) return false;
        if (success) success(model, resp);
      };
      options.error = Backbone.wrapError(options.error, model, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, value, options) {
      var attrs, current;

      // Handle both `("key", value)` and `({key: value})` -style calls.
      if (_.isObject(key) || key == null) {
        attrs = key;
        options = value;
      } else {
        attrs = {};
        attrs[key] = value;
      }
      options = options ? _.clone(options) : {};

      // If we're "wait"-ing to set changed attributes, validate early.
      if (options.wait) {
        if (!this._validate(attrs, options)) return false;
        current = _.clone(this.attributes);
      }

      // Regular saves `set` attributes before persisting to the server.
      var silentOptions = _.extend({}, options, {silent: true});
      if (attrs && !this.set(attrs, options.wait ? silentOptions : options)) {
        return false;
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      var model = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        var serverAttrs = model.parse(resp, xhr);
        if (options.wait) {
          delete options.wait;
          serverAttrs = _.extend(attrs || {}, serverAttrs);
        }
        if (!model.set(serverAttrs, options)) return false;
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      // Finish configuring and sending the Ajax request.
      options.error = Backbone.wrapError(options.error, model, options);
      var method = this.isNew() ? 'create' : 'update';
      var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
      if (options.wait) this.set(current, silentOptions);
      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var triggerDestroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      if (this.isNew()) {
        triggerDestroy();
        return false;
      }

      options.success = function(resp) {
        if (options.wait) triggerDestroy();
        if (success) {
          success(model, resp);
        } else {
          model.trigger('sync', model, resp, options);
        }
      };

      options.error = Backbone.wrapError(options.error, model, options);
      var xhr = (this.sync || Backbone.sync).call(this, 'delete', this, options);
      if (!options.wait) triggerDestroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = getValue(this, 'urlRoot') || getValue(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, xhr) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Call this method to manually fire a `"change"` event for this model and
    // a `"change:attribute"` event for each changed attribute.
    // Calling this will cause all objects observing the model to update.
    change: function(options) {
      options || (options = {});
      var changing = this._changing;
      this._changing = true;

      // Silent changes become pending changes.
      for (var attr in this._silent) this._pending[attr] = true;

      // Silent changes are triggered.
      var changes = _.extend({}, options.changes, this._silent);
      this._silent = {};
      for (var attr in changes) {
        this.trigger('change:' + attr, this, this.get(attr), options);
      }
      if (changing) return this;

      // Continue firing `"change"` events while there are pending changes.
      while (!_.isEmpty(this._pending)) {
        this._pending = {};
        this.trigger('change', this, options);
        // Pending and silent changes still remain.
        for (var attr in this.changed) {
          if (this._pending[attr] || this._silent[attr]) continue;
          delete this.changed[attr];
        }
        this._previousAttributes = _.clone(this.attributes);
      }

      this._changing = false;
      return this;
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (!arguments.length) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false, old = this._previousAttributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (!arguments.length || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Check if the model is currently in a valid state. It's only possible to
    // get into an *invalid* state if you're using silent changes.
    isValid: function() {
      return !this.validate(this.attributes);
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. If a specific `error` callback has
    // been passed, call that instead of firing the general `"error"` event.
    _validate: function(attrs, options) {
      if (options.silent || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validate(attrs, options);
      if (!error) return true;
      if (options && options.error) {
        options.error(this, error, options);
      } else {
        this.trigger('error', this, error, options);
      }
      return false;
    }

  });

  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, {silent: true, parse: options.parse});
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Add a model, or list of models to the set. Pass **silent** to avoid
    // firing the `add` event for every new model.
    add: function(models, options) {
      var i, index, length, model, cid, id, cids = {}, ids = {}, dups = [];
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];

      // Begin by turning bare objects into model references, and preventing
      // invalid models or duplicate models from being added.
      for (i = 0, length = models.length; i < length; i++) {
        if (!(model = models[i] = this._prepareModel(models[i], options))) {
          throw new Error("Can't add an invalid model to a collection");
        }
        cid = model.cid;
        id = model.id;
        if (cids[cid] || this._byCid[cid] || ((id != null) && (ids[id] || this._byId[id]))) {
          dups.push(i);
          continue;
        }
        cids[cid] = ids[id] = model;
      }

      // Remove duplicates.
      i = dups.length;
      while (i--) {
        models.splice(dups[i], 1);
      }

      // Listen to added models' events, and index models for lookup by
      // `id` and by `cid`.
      for (i = 0, length = models.length; i < length; i++) {
        (model = models[i]).on('all', this._onModelEvent, this);
        this._byCid[model.cid] = model;
        if (model.id != null) this._byId[model.id] = model;
      }

      // Insert models into the collection, re-sorting if needed, and triggering
      // `add` events unless silenced.
      this.length += length;
      index = options.at != null ? options.at : this.models.length;
      splice.apply(this.models, [index, 0].concat(models));
      if (this.comparator) this.sort({silent: true});
      if (options.silent) return this;
      for (i = 0, length = this.models.length; i < length; i++) {
        if (!cids[(model = this.models[i]).cid]) continue;
        options.index = i;
        model.trigger('add', model, this, options);
      }
      return this;
    },

    // Remove a model, or a list of models from the set. Pass silent to avoid
    // firing the `remove` event for every model removed.
    remove: function(models, options) {
      var i, l, index, model;
      options || (options = {});
      models = _.isArray(models) ? models.slice() : [models];
      for (i = 0, l = models.length; i < l; i++) {
        model = this.getByCid(models[i]) || this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byCid[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, options);
      return model;
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: 0}, options));
      return model;
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Get a model from the set by id.
    get: function(id) {
      if (id == null) return void 0;
      return this._byId[id.id != null ? id.id : id];
    },

    // Get a model from the set by client id.
    getByCid: function(cid) {
      return cid && this._byCid[cid.cid || cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of `filter`.
    where: function(attrs) {
      if (_.isEmpty(attrs)) return [];
      return this.filter(function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      options || (options = {});
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      var boundComparator = _.bind(this.comparator, this);
      if (this.comparator.length == 1) {
        this.models = this.sortBy(boundComparator);
      } else {
        this.models.sort(boundComparator);
      }
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.map(this.models, function(model){ return model.get(attr); });
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any `add` or `remove` events. Fires `reset` when finished.
    reset: function(models, options) {
      models  || (models = []);
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      this._reset();
      this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `add: true` is passed, appends the
    // models to the collection instead of resetting.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === undefined) options.parse = true;
      var collection = this;
      var success = options.success;
      options.success = function(resp, status, xhr) {
        collection[options.add ? 'add' : 'reset'](collection.parse(resp, xhr), options);
        if (success) success(collection, resp);
      };
      options.error = Backbone.wrapError(options.error, collection, options);
      return (this.sync || Backbone.sync).call(this, 'read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      var coll = this;
      options = options ? _.clone(options) : {};
      model = this._prepareModel(model, options);
      if (!model) return false;
      if (!options.wait) coll.add(model, options);
      var success = options.success;
      options.success = function(nextModel, resp, xhr) {
        if (options.wait) coll.add(nextModel, options);
        if (success) {
          success(nextModel, resp);
        } else {
          nextModel.trigger('sync', model, resp, options);
        }
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, xhr) {
      return resp;
    },

    // Proxy to _'s chain. Can't be proxied the same way the rest of the
    // underscore methods are proxied because it relies on the underscore
    // constructor.
    chain: function () {
      return _(this.models).chain();
    },

    // Reset all internal state. Called when the collection is reset.
    _reset: function(options) {
      this.length = 0;
      this.models = [];
      this._byId  = {};
      this._byCid = {};
    },

    // Prepare a model or hash of attributes to be added to this collection.
    _prepareModel: function(model, options) {
      options || (options = {});
      if (!(model instanceof Model)) {
        var attrs = model;
        options.collection = this;
        model = new this.model(attrs, options);
        if (!model._validate(model.attributes, options)) model = false;
      } else if (!model.collection) {
        model.collection = this;
      }
      return model;
    },

    // Internal method to remove a model's ties to a collection.
    _removeReference: function(model) {
      if (this == model.collection) {
        delete model.collection;
      }
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event == 'add' || event == 'remove') && collection != this) return;
      if (event == 'destroy') {
        this.remove(model, options);
      }
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find',
    'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any',
    'include', 'contains', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex',
    'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf',
    'shuffle', 'lastIndexOf', 'isEmpty', 'groupBy'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });

  // Backbone.Router
  // -------------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var namedParam    = /:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[-[\]{}()+?.,\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      Backbone.history || (Backbone.history = new History);
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (!callback) callback = this[name];
      Backbone.history.route(route, _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback && callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
        Backbone.history.trigger('route', this, name, args);
      }, this));
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      var routes = [];
      for (var route in this.routes) {
        routes.unshift([route, this.routes[route]]);
      }
      for (var i = 0, l = routes.length; i < l; i++) {
        this.route(routes[i][0], routes[i][1], this[routes[i][1]]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(namedParam, '([^\/]+)')
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters: function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL fragments. If the
  // browser does not support `onhashchange`, falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');
  };

  // Cached regex for cleaning leading hashes and slashes .
  var routeStripper = /^[#\/]/;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(windowOverride) {
      var loc = windowOverride ? windowOverride.location : window.location;
      var match = loc.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || forcePushState) {
          fragment = window.location.pathname;
          var search = window.location.search;
          if (search) fragment += search;
        } else {
          fragment = this.getHash();
        }
      }
      if (!fragment.indexOf(this.options.root)) fragment = fragment.substr(this.options.root.length);
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && window.history && window.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      if (oldIE) {
        this.iframe = $('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        $(window).bind('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        $(window).bind('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = window.location;
      var atRoot  = loc.pathname == this.options.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        window.location.replace(this.options.root + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        window.history.replaceState({}, document.title, loc.protocol + '//' + loc.host + this.options.root + this.fragment);
      }

      if (!this.options.silent) {
        return this.loadUrl();
      }
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      $(window).unbind('popstate', this.checkUrl).unbind('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current == this.fragment && this.iframe) current = this.getFragment(this.getHash(this.iframe));
      if (current == this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(this.getHash());
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: options};
      var frag = (fragment || '').replace(routeStripper, '');
      if (this.fragment == frag) return;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        if (frag.indexOf(this.options.root) != 0) frag = this.options.root + frag;
        this.fragment = frag;
        window.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, frag);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this.fragment = frag;
        this._updateHash(window.location, frag, options.replace);
        if (this.iframe && (frag != this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a history entry on hash-tag change.
          // When replace is true, we don't want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, frag, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        window.location.assign(this.options.root + fragment);
      }
      if (options.trigger) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        location.replace(location.toString().replace(/(javascript:|#).*$/, '') + '#' + fragment);
      } else {
        location.hash = fragment;
      }
    }
  });

  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view from the DOM. Note that the view isn't present in the
    // DOM by default, so calling this method may be a no-op.
    remove: function() {
      this.$el.remove();
      return this;
    },

    // For small amounts of DOM Elements, where a full-blown template isn't
    // needed, use **make** to manufacture elements, one at a time.
    //
    //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
    //
    make: function(tagName, attributes, content) {
      var el = document.createElement(tagName);
      if (attributes) $(el).attr(attributes);
      if (content) $(el).html(content);
      return el;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = (element instanceof $) ? element : $(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = getValue(this, 'events')))) return;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) throw new Error('Method "' + events[key] + '" does not exist');
        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.bind(eventName, method);
        } else {
          this.$el.delegate(selector, eventName, method);
        }
      }
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.unbind('.delegateEvents' + this.cid);
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure: function(options) {
      if (this.options) options = _.extend({}, this.options, options);
      for (var i = 0, l = viewOptions.length; i < l; i++) {
        var attr = viewOptions[i];
        if (options[attr]) this[attr] = options[attr];
      }
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = getValue(this, 'attributes') || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.setElement(this.make(this.tagName, attrs), false);
      } else {
        this.setElement(this.el, false);
      }
    }

  });

  // The self-propagating extend function that Backbone classes use.
  var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
  };

  // Set up inheritance for the model, collection, and view.
  Model.extend = Collection.extend = Router.extend = View.extend = extend;

  // Backbone.sync
  // -------------

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    options || (options = {});

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = getValue(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (!options.data && model && (method == 'create' || method == 'update')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(model.toJSON());
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (Backbone.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (Backbone.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Backbone.emulateJSON) params.data._method = type;
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          xhr.setRequestHeader('X-HTTP-Method-Override', type);
        };
      }
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !Backbone.emulateJSON) {
      params.processData = false;
    }

    // Make the request, allowing the user to override any Ajax options.
    return $.ajax(_.extend(params, options));
  };

  // Wrap an optional error callback with a fallback error event.
  Backbone.wrapError = function(onError, originalModel, options) {
    return function(model, resp) {
      resp = model === originalModel ? resp : model;
      if (onError) {
        onError(originalModel, resp, options);
      } else {
        originalModel.trigger('error', originalModel, resp, options);
      }
    };
  };

  // Helpers
  // -------

  // Shared empty constructor function to aid in prototype-chain creation.
  var ctor = function(){};

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var inherits = function(parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ parent.apply(this, arguments); };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Add static properties to the constructor function, if supplied.
    if (staticProps) _.extend(child, staticProps);

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Helper function to get a value from a Backbone object as a property
  // or as a function.
  var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

}).call(this);
/*

The json2.js file is taken from https://github.com/douglascrockford/JSON-js */

/*
    http://www.JSON.org/json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());/*

Copyright (c) 2011 Henri Bergius, IKS Consortium
Copyright (c) 2011 Sebastian Germesin, IKS Consortium

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

(function(){
//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/
var root = this,
    jQuery = root.jQuery,
    Backbone = root.Backbone,
    _ = root._;


// ## VIE constructor
//
// The VIE constructor is the way to initialize VIE for your
// application. The instance of VIE handles all management of
// semantic interaction, including keeping track of entities,
// changes to them, the possible RDFa views on the page where
// the entities are displayed, and connections to external
// services like Stanbol and DBPedia.
//
// To get a VIE instance, simply run:
//
//     var vie = new VIE();
//
// You can also pass configurations to the VIE instance through
// the constructor. For example, to set a different default
// namespace to be used for names that don't have a namespace
// specified, do:
//
//     var vie = new VIE({
//         baseNamespace: 'http://example.net'
//     });
//
// ### Differences with VIE 1.x
//
// VIE 1.x used singletons for managing entities and views loaded
// from a page. This has been changed with VIE 2.x, and now all
// data managed by VIE is tied to the instance of VIE being used.
//
// This means that VIE needs to be instantiated before using. So,
// when previously you could get entities from page with:
//
//     VIE.RDFaEntities.getInstances();
//
// Now you need to instantiate VIE first. This example uses the
// Classic API compatibility layer instead of the `load` method:
//
//     var vie = new VIE();
//     vie.RDFaEntities.getInstances();
//
// Currently the Classic API is enabled by default, but it is
// recommended to ensure it is enabled before using it. So:
//
//     var vie = new VIE({classic: true});
//     vie.RDFaEntities.getInstances();
var VIE = root.VIE = function(config) {
    this.config = (config) ? config : {};
    
    this.id = VIE.Util.UUIDGenerator();
    this.services = {};
    this.jQuery = jQuery;
    this.entities = new this.Collection();

    this.Entity.prototype.entities = this.entities;
    this.entities.vie = this;
    this.Entity.prototype.entityCollection = this.Collection;
    this.Entity.prototype.vie = this;
    
    this.Namespaces.prototype.vie = this;
// ### Namespaces in VIE
// VIE supports different ontologies and an easy use of them.
// Namespace prefixes reduce the amount of code you have to
// write. In VIE, it does not matter if you access an entitie's
// property with 
// `entity.get('<http://dbpedia.org/property/capitalOf>')` or 
// `entity.get('dbprop:capitalOf')` or even 
// `entity.get('capitalOf')` once the corresponding namespace
// is registered as *baseNamespace*.
// By default `"http://viejs.org/ns/"`is set as base namespace.
// For more information about how to set, get and list all
// registered namespaces, refer to the 
// <a href="Namespace.html">Namespaces documentation</a>.
    this.namespaces = new this.Namespaces(
        (this.config.baseNamespace) ? this.config.baseNamespace : "http://viejs.org/ns/",
        
// By default, VIE is shipped with common namespace prefixes:

// +    owl    : "http://www.w3.org/2002/07/owl#"
// +    rdfs   : "http://www.w3.org/2000/01/rdf-schema#"
// +    rdf    : "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
// +    schema : 'http://schema.org/'
// +    foaf   : 'http://xmlns.com/foaf/0.1/'
// +    geo    : 'http://www.w3.org/2003/01/geo/wgs84_pos#'
// +    dbpedia: "http://dbpedia.org/ontology/"
// +    dbprop : "http://dbpedia.org/property/"
// +    skos   : "http://www.w3.org/2004/02/skos/core#"
// +    xsd    : "http://www.w3.org/2001/XMLSchema#"
// +    sioc   : "http://rdfs.org/sioc/ns#"
// +    dcterms: "http://purl.org/dc/terms/"
        {
            owl    : "http://www.w3.org/2002/07/owl#",
            rdfs   : "http://www.w3.org/2000/01/rdf-schema#",
            rdf    : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            schema : 'http://schema.org/',
            foaf   : 'http://xmlns.com/foaf/0.1/',
            geo    : 'http://www.w3.org/2003/01/geo/wgs84_pos#',
            dbpedia: "http://dbpedia.org/ontology/",
            dbprop : "http://dbpedia.org/property/",
            skos   : "http://www.w3.org/2004/02/skos/core#",
            xsd    : "http://www.w3.org/2001/XMLSchema#",
            sioc   : "http://rdfs.org/sioc/ns#",
            dcterms: "http://purl.org/dc/terms/"
        }
    );


    this.Type.prototype.vie = this;
    this.Types.prototype.vie = this;
    this.Attribute.prototype.vie = this;
    this.Attributes.prototype.vie = this;
// ### Type hierarchy in VIE
// VIE takes care about type hierarchy of entities
// (aka. *schema* or *ontology*).
// Once a type hierarchy is known to VIE, we can leverage
// this information, to easily ask, whether an entity
// is of type, e.g., *foaf:Person* or *schema:Place*.
// For more information about how to generate such a type
// hierarchy, refer to the 
// <a href="Type.html">Types documentation</a>.
    this.types = new this.Types();
// By default, there is a parent type in VIE, called
// *owl:Thing*. All types automatically inherit from this
// type and all registered entities, are of this type.
    this.types.add("owl:Thing");

// As described above, the Classic API of VIE 1.x is loaded
// by default. As this might change in the future, it is
// recommended to ensure it is enabled before using it. So:
//
//     var vie = new VIE({classic: true});
//     vie.RDFaEntities.getInstances();
    if (this.config.classic === true) {
        /* Load Classic API as well */
        this.RDFa = new this.ClassicRDFa(this);
        this.RDFaEntities = new this.ClassicRDFaEntities(this);
        this.EntityManager = new this.ClassicEntityManager(this);

        this.cleanup = function() {
            this.entities.reset();
        };
    }
};

// ### use(service, name)
// This method registers services within VIE.  
// **Parameters**:  
// *{string|object}* **service** The service to be registered.  
// *{string}* **name** An optional name to register the service with. If this
// is not set, the default name that comes with the service is taken.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE}* : The current VIE instance.  
// **Example usage**:  
//
//     var vie = new VIE();
//     var conf1 = {...};
//     var conf2 = {...};
//     vie.use(new vie.StanbolService());
//     vie.use(new vie.StanbolService(conf1), "stanbol_1");
//     vie.use(new vie.StanbolService(conf2), "stanbol_2");
//     // <-- this means that there are now 3 services registered!
VIE.prototype.use = function(service, name) {
  if (!name && !service.name) {
    throw new Error("Please provide a name for the service!");
  }
  service.vie = this;
  service.name = (name)? name : service.name;
  if (service.init) {
      service.init();
  }
  this.services[service.name] = service;
  
  return this;
};

// ### service(name)
// This method returns the service object that is
// registered under the given name.  
// **Parameters**:  
// *{string}* **name** ...  
// **Throws**:  
// *{Error}* if no service could be found.  
// **Returns**:  
// *{object}* : The service to be queried.  
// **Example usage**:  
//
//     var vie = new VIE();
//     vie.use(new vie.StanbolService(), "stanbol");
//     var service = vie.service("stanbol");
VIE.prototype.service = function(name) {
  if (!this.services[name]) {
    throw "Undefined service " + name;
  }
  return this.services[name];
};

// ### getServicesArray()
// This method returns an array of all registered services.  
// **Parameters**:  
// *nothing*  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{array}* : An array of service instances.  
// **Example usage**:  
//
//     var vie = new VIE();
//     vie.use(new vie.StanbolService(), "stanbol");
//     var services = vie.getServicesArray();
//     services.length; // <-- 1
VIE.prototype.getServicesArray = function() {
  return _.map(this.services, function (v) {return v;});
};

//### load(options)
//This method instantiates a new VIE.Loadable in order to
//perform queries on the services.  
//**Parameters**:  
//*{object}* **options** Options to be set.  
//**Throws**:  
//*nothing*  
//**Returns**:  
//*{VIE.Loadable}* : A new instance of VIE.Loadable.  
//**Example usage**:  
//
//  var vie = new VIE();
//  vie.use(new vie.StanbolService(), "stanbol");
//  var loader = vie.load({...});
VIE.prototype.load = function(options) {
if (!options) { options = {}; }
options.vie = this;
return new this.Loadable(options);
};

//### query(options)
//This method instantiates a new VIE.Queryable in order to
//perform queries on the services.  
//**Parameters**:  
//*{object}* **options** Options to be set.  
//**Throws**:  
//*nothing*  
//**Returns**:  
//*{VIE.Queryable}* : A new instance of VIE.Queryable.  
//**Example usage**:  
//
//  var vie = new VIE();
//  vie.use(new vie.StanbolService(), "stanbol");
//  var querier = vie.query({...});
VIE.prototype.query = function(options) {
if (!options) { options = {}; }
options.vie = this;
return new this.Queryable(options);
};

// ### save(options)
// This method instantiates a new VIE.Savable in order to
// perform queries on the services.  
// **Parameters**:  
// *{object}* **options** Options to be set.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.Savable}* : A new instance of VIE.Savable.  
// **Example usage**:  
//
//     var vie = new VIE();
//     vie.use(new vie.StanbolService(), "stanbol");
//     var saver = vie.save({...});
VIE.prototype.save = function(options) {
  if (!options) { options = {}; }
  options.vie = this;
  return new this.Savable(options);
};

// ### remove(options)
// This method instantiates a new VIE.Removable in order to
// perform queries on the services.  
// **Parameters**:  
// *{object}* **options** Options to be set.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.Removable}* : A new instance of VIE.Removable.  
// **Example usage**:  
//
//     var vie = new VIE();
//     vie.use(new vie.StanbolService(), "stanbol");
//     var remover = vie.remove({...});
VIE.prototype.remove = function(options) {
  if (!options) { options = {}; }
  options.vie = this;
  return new this.Removable(options);
};

// ### analyze(options)
// This method instantiates a new VIE.Analyzable in order to
// perform queries on the services.  
// **Parameters**:  
// *{object}* **options** Options to be set.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.Analyzable}* : A new instance of VIE.Analyzable.  
// **Example usage**:  
//
//     var vie = new VIE();
//     vie.use(new vie.StanbolService(), "stanbol");
//     var analyzer = vie.analyze({...});
VIE.prototype.analyze = function(options) {
  if (!options) { options = {}; }
  options.vie = this;
  return new this.Analyzable(options);
};

// ### find(options)
// This method instantiates a new VIE.Findable in order to
// perform queries on the services.  
// **Parameters**:  
// *{object}* **options** Options to be set.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.Findable}* : A new instance of VIE.Findable.  
// **Example usage**:  
//
//     var vie = new VIE();
//     vie.use(new vie.StanbolService(), "stanbol");
//     var finder = vie.find({...});
VIE.prototype.find = function(options) {
  if (!options) { options = {}; }
  options.vie = this;
  return new this.Findable(options);
};

// ### loadSchema(url, options)
// VIE only knows the *owl:Thing* type by default.
// You can use this method to import another
// schema (ontology) from an external resource.
// (Currently, this supports only the JSON format!!)
// As this method works asynchronously, you might want
// to register `success` and `error` callbacks via the
// options.  
// **Parameters**:  
// *{string}* **url** The url, pointing to the schema to import.  
// *{object}* **options** Options to be set.
// (Set ```success``` and ```error``` as callbacks.).  
// **Throws**:  
// *{Error}* if the url is not set.  
// **Returns**:  
// *{VIE}* : The VIE instance itself.  
// **Example usage**:  
//
//     var vie = new VIE();
//     vie.loadSchema("http://schema.rdfs.org/all.json", 
//        {
//          baseNS : "http://schema.org/",
//          success : function () {console.log("success");},
//          error  : function (msg) {console.warn(msg);}
//        });
VIE.prototype.loadSchema = function(url, options) {
    options = (!options)? {} : options;
    
    if (!url) {
        throw new Error("Please provide a proper URL");
    }
    else {
        var vie = this;
        jQuery.getJSON(url)
        .success(function(data) {
            VIE.Util.loadSchemaOrg(vie, data, options.baseNS);
            if (options.success) {
                options.success.call(vie);
            }
         })
        .error(function(data, textStatus, jqXHR) { 
            if (options.error) {
                console.warn(data, textStatus, jqXHR);
                options.error.call(vie, "Could not load schema from URL (" + url + ")");
            }
         });
    }
    
    return this;
};

//### equals(vieInstance)
//This method tests for equality of two VIE instances.  
//**Parameters**:  
//*{VIE}* **vieInstance** The other VIE instance.  
//**Throws**:  
//*nothing*.  
//**Returns**:  
//*{boolean}* : `true` if the current instance 
// equals to the given instance, false otherwise.  
//**Example usage**:  
//
//  var vie = new VIE();
//  var vie2 = new VIE();
//  console.log(vie.equals(vie2)); // <-- false
//  console.log(vie2.equals(vie)); // <-- false
//  console.log(vie.equals(vie)); //  <-- true
VIE.prototype.equals = function(vieInstance) {
	if (this.id && vieInstance && vieInstance.id) {
		return vieInstance.id === this.id;
	}
	return false;
};

// IE per default doesn't have a console API. For making sure this doesn't break
// anything we define it here to not do anything.
console = console || {
    info: function(){},
    log: function(){}
};
// IE in debug mode does have a console object but no console.warn
if(!console.warn){
    console.warn = console.info;
}

// ## Running VIE on Node.js
//
// When VIE is running under Node.js we can use the CommonJS
// require interface to load our dependencies automatically.
//
// This means Node.js users don't need to care about dependencies
// and can just run VIE with:
//
//     var VIE = require('vie');
//
// In browser environments the dependencies have to be included
// before including VIE itself.
if (typeof exports === 'object') {
    exports.VIE = VIE;

    if (!jQuery) {
        jQuery = require('jquery');
    }
    if (!Backbone) {
        Backbone = require('backbone');
        Backbone.setDomLibrary(jQuery);
    }
    if (!_) {
        _ = require('underscore')._;
    }
}
//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE.Able
// VIE implements asynchronius service methods through
// [jQuery.Deferred](http://api.jquery.com/category/deferred-object/) objects.
// Loadable, Analysable, Savable, etc. are part of the VIE service API and 
// are implemented with the generic VIE.Able class.
// Example:
//
//      VIE.prototype.Loadable = function (options) {
//          this.init(options,"load");
//      };
//      VIE.prototype.Loadable.prototype = new VIE.prototype.Able();
//
// This defines 
//
//     someVIEService.load(options)
//     .using(...)
//     .execute()
//     .success(...)
//     .fail(...)
// which will run the asynchronius `load` function of the service with the created Loadable
// object.

// ### VIE.Able()
// This is the constructor of a VIE.Able. This should not be called
// globally but using the inherited classes below.  
// **Parameters**: 
// *nothing*  
// **Throws**: 
// *nothing*  
// **Returns**: 
// *{VIE.Able}* : A **new** VIE.Able object. 
// Example:
//
//      VIE.prototype.Loadable = function (options) {
//          this.init(options,"load");
//      };
//      VIE.prototype.Loadable.prototype = new VIE.prototype.Able();
VIE.prototype.Able = function(){

// ### init(options, methodName)
// Internal method, called during initialization.
// **Parameters**:  
// *{object}* **options** the *able* options coming from the API call
// *{string}* **methodName** the service method called on `.execute`.
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.Able}* : The current instance.  
// **Example usage**:  
//
//      VIE.prototype.Loadable = function (options) {
//          this.init(options,"load");
//      };
//      VIE.prototype.Loadable.prototype = new VIE.prototype.Able();
    this.init = function(options, methodName) {
        this.options = options;
        this.services = options.from || options.using || options.to || [];
        this.vie = options.vie;

        this.methodName = methodName;

        // Instantiate the deferred object
        this.deferred = jQuery.Deferred();

// In order to get more information and documentation about the passed-through
// deferred methods and their synonyms, please see the documentation of 
// the [jQuery.Deferred object](http://api.jquery.com/category/deferred-object/)
        /* Public deferred-methods */
        this.resolve = this.deferred.resolve;
        this.resolveWith = this.deferred.resolveWith;
        this.reject = this.deferred.reject;
        this.rejectWith = this.deferred.rejectWith;
        this.success = this.done = this.deferred.done;
        this.fail = this.deferred.fail;
        this.then = this.deferred.then;
        this.always = this.deferred.always;
        this.from = this.using;
        this.to = this.using;

        return this;
    };


// ### using(services)
// This method registers services with the current able instance.  
// **Parameters**:  
// *{string|array}* **services** An id of a service or an array of strings.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.Able}* : The current instance.  
// **Example usage**:  
//
//     var loadable = vie.load({id: "http://example.com/entity/1234"});
//     able.using("myService");
    this.using = function(services) {
        var self = this;
        services = (_.isArray(services))? services : [ services ];
        _.each (services, function (s) {
            var obj = (typeof s === "string")? self.vie.service(s) : s;
            self.services.push(obj);
        });
        return this;
    };
    
// ### execute()
// This method runs the actual method on all registered services.  
// **Parameters**:  
// *nothing*  
// **Throws**:  
// *nothing* ...   
// **Returns**:  
// *{VIE.Able}* : The current instance.  
// **Example usage**:  
//
//     var able = new vie.Able().init();
//     able.using("stanbol")
//     .done(function () {alert("finished");})
//     .execute();
    this.execute = function() {
        /* call service[methodName] */
        var able = this;
        _(this.services).each(function(service){
            service[able.methodName](able);
        });
        return this;
    };
};

// ## VIE.Loadable
// A ```VIE.Loadable``` is a wrapper around the deferred object
// to **load** semantic data from a semantic web service.
VIE.prototype.Loadable = function (options) {
    this.init(options,"load");
};
VIE.prototype.Loadable.prototype = new VIE.prototype.Able();

// ## VIE.Savable
// A ```VIE.Savable``` is a wrapper around the deferred object
// to **save** entities by a VIE service. The RDFaService would write the data
// in the HTML as RDFa, the StanbolService stores the data in its Entityhub, etc.
VIE.prototype.Savable = function(options){
    this.init(options, "save");
};
VIE.prototype.Savable.prototype = new VIE.prototype.Able();

// ## VIE.Removable
// A ```VIE.Removable``` is a wrapper around the deferred object
// to **remove** semantic data from a semantic web service.
VIE.prototype.Removable = function(options){
    this.init(options, "remove");
};
VIE.prototype.Removable.prototype = new VIE.prototype.Able();

// ## VIE.Analyzable
// A ```VIE.Analyzable``` is a wrapper around the deferred object
// to **analyze** data and extract semantic information with the
// help of a semantic web service.
VIE.prototype.Analyzable = function (options) {
    this.init(options, "analyze");
};
VIE.prototype.Analyzable.prototype = new VIE.prototype.Able();

//## VIE.Findable
//A ```VIE.Findable``` is a wrapper around the deferred object
//to **find** semantic data on a semantic storage.
VIE.prototype.Findable = function (options) {
 this.init(options, "find");
};
VIE.prototype.Findable.prototype = new VIE.prototype.Able();

//## VIE.Queryable
//A ```VIE.Queryable``` is a wrapper around the deferred object
//to **query** semantic data on a semantic storage.
VIE.prototype.Queryable = function (options) {
 this.init(options, "query");
};
VIE.prototype.Queryable.prototype = new VIE.prototype.Able();

//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE Utils
//
// The here-listed methods are utility methods for the day-to-day 
// VIE.js usage. All methods are within the static namespace ```VIE.Util```.
VIE.Util = {

// ### VIE.Util.toCurie(uri, safe, namespaces)
// This method converts a given 
// URI into a CURIE (or SCURIE), based on the given ```VIE.Namespaces``` object.
// If the given uri is already a URI, it is left untouched and directly returned.
// If no prefix could be found, an ```Error``` is thrown.  
// **Parameters**:  
// *{string}* **uri** The URI to be transformed.  
// *{boolean}* **safe** A flag whether to generate CURIEs or SCURIEs.  
// *{VIE.Namespaces}* **namespaces** The namespaces to be used for the prefixes.  
// **Throws**:  
// *{Error}* If no prefix could be found in the passed namespaces.  
// **Returns**:  
// *{string}* The CURIE or SCURIE.  
// **Example usage**: 
//
//     var ns = new myVIE.Namespaces(
//           "http://viejs.org/ns/", 
//           { "dbp": "http://dbpedia.org/ontology/" }
//     );
//     var uri = "<http://dbpedia.org/ontology/Person>";
//     VIE.Util.toCurie(uri, false, ns);// --> dbp:Person
//     VIE.Util.toCurie(uri, true, ns);// --> [dbp:Person]
	toCurie : function (uri, safe, namespaces) {
        if (VIE.Util.isCurie(uri, namespaces)) {
            return uri;
        }
        var delim = ":";
        for (var k in namespaces.toObj()) {
            if (uri.indexOf(namespaces.get(k)) === 1) {
                var pattern = new RegExp("^" + "<?" + namespaces.get(k));
                if (k === '') {
                    delim = '';
                }
                return ((safe)? "[" : "") + 
                        uri.replace(pattern, k + delim).replace(/>$/, '') +
                        ((safe)? "]" : "");
            }
        }
        throw new Error("No prefix found for URI '" + uri + "'!");
    },

// ### VIE.Util.isCurie(curie, namespaces)
// This method checks, whether 
// the given string is a CURIE and returns ```true``` if so and ```false```otherwise.  
// **Parameters**:  
// *{string}* **curie** The CURIE (or SCURIE) to be checked.  
// *{VIE.Namespaces}* **namespaces** The namespaces to be used for the prefixes.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{boolean}* ```true``` if the given curie is a CURIE or SCURIE and ```false``` otherwise.  
// **Example usage**: 
//
//     var ns = new myVIE.Namespaces(
//           "http://viejs.org/ns/", 
//           { "dbp": "http://dbpedia.org/ontology/" }
//     );
//     var uri = "<http://dbpedia.org/ontology/Person>";
//     var curie = "dbp:Person";
//     var scurie = "[dbp:Person]";
//     var text = "This is some text.";
//     VIE.Util.isCurie(uri, ns);   // --> false
//     VIE.Util.isCurie(curie, ns); // --> true
//     VIE.Util.isCurie(scurie, ns);// --> true
//     VIE.Util.isCurie(text, ns);  // --> false
    isCurie : function (curie, namespaces) {
        if (VIE.Util.isUri(curie)) {
            return false;
        } else {
            try {
                VIE.Util.toUri(curie, namespaces);
                return true;
            } catch (e) {
                return false;
            }
        }
    },

// ### VIE.Util.toUri(curie, namespaces)
// This method converts a 
// given CURIE (or save CURIE) into a URI, based on the given ```VIE.Namespaces``` object.  
// **Parameters**:  
// *{string}* **curie** The CURIE to be transformed.  
// *{VIE.Namespaces}* **namespaces** The namespaces object  
// **Throws**:  
// *{Error}* If no URI could be assembled.  
// **Returns**:  
// *{string}* : A string, representing the URI.  
// **Example usage**: 
//
//     var ns = new myVIE.Namespaces(
//           "http://viejs.org/ns/", 
//           { "dbp": "http://dbpedia.org/ontology/" }
//     );
//     var curie = "dbp:Person";
//     var scurie = "[dbp:Person]";
//     VIE.Util.toUri(curie, ns); 
//          --> <http://dbpedia.org/ontology/Person>
//     VIE.Util.toUri(scurie, ns);
//          --> <http://dbpedia.org/ontology/Person>
    toUri : function (curie, namespaces) {
        var delim = ":";
        for (var prefix in namespaces.toObj()) {
            if (prefix !== "" && (curie.indexOf(prefix + ":") === 0 || curie.indexOf("[" + prefix + ":") === 0)) {
                var pattern = new RegExp("^" + "\\[{0,1}" + prefix + delim);
                return "<" + curie.replace(pattern, namespaces.get(prefix)).replace(/\]{0,1}$/, '') + ">";
            }
        }
        /* check for the default namespace */
        if (curie.indexOf(delim) === -1) {
            return "<" + namespaces.base() + curie + ">";
        }
        throw new Error("No prefix found for CURIE '" + curie + "'!");
    },
    
// ### VIE.Util.isUri(something)
// This method checks, whether the given string is a URI.  
// **Parameters**:  
// *{string}* **something** : The string to be checked.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{boolean}* : ```true``` if the string is a URI, ```false``` otherwise.  
// **Example usage**: 
//
//     var uri = "<http://dbpedia.org/ontology/Person>";
//     var curie = "dbp:Person";
//     VIE.Util.isUri(uri);  // --> true
//     VIE.Util.isUri(curie);// --> false
    isUri : function (something) {
        return (typeof something === "string" && something.search(/^<.+>$/) === 0);
    },

// ### VIE.Util.mapAttributeNS(attr, ns)
// This method maps an attribute of an entity into namespaces if they have CURIEs.  
// **Parameters**:  
// *{string}* **attr** : The attribute to be transformed.  
// *{VIE.Namespaces}* **ns** : The namespaces.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{string}* : The transformed attribute's name.  
// **Example usage**: 
//
//      var attr = "name";
//      var ns = myVIE.namespaces;
//      VIE.Util.mapAttributeNS(attr, ns);// '<' + ns.base() + attr + '>';
    mapAttributeNS : function (attr, ns) {
        var a = attr;
        if (ns.isUri (attr) || attr.indexOf('@') === 0) {
            //ignore
        } else if (ns.isCurie(attr)) {
            a = ns.uri(attr);
        } else if (!ns.isUri(attr)) {
            if (attr.indexOf(":") === -1) {
                a = '<' + ns.base() + attr + '>';
            } else {
                a = '<' + attr + '>';
            }
        }
        return a;
    },
    
// ### VIE.Util.rdf2Entities(service, results)
// This method converts *rdf/json* data from an external service
// into VIE.Entities.  
// **Parameters**:  
// *{object}* **service** The service that retrieved the data.  
// *{object}* **results** The data to be transformed.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{[VIE.Entity]}* : An array, containing VIE.Entity instances which have been transformed from the given data.
    rdf2Entities: function (service, results) {
        if (typeof jQuery.rdf !== 'function') {
            /* fallback if no rdfQuery has been loaded */
            return VIE.Util._rdf2EntitiesNoRdfQuery(service, results);
        }
        try {
	        var rdf = (results instanceof jQuery.rdf)? 
	        		results.base(service.vie.namespaces.base()) : 
	        			jQuery.rdf().base(service.vie.namespaces.base()).load(results, {});
	
	        /* if the service contains rules to apply special transformation, they are executed here.*/
	        if (service.rules) {
	            var rules = jQuery.rdf.ruleset();
	            for (var prefix in service.vie.namespaces.toObj()) {
	                if (prefix !== "") {
	                    rules.prefix(prefix, service.vie.namespaces.get(prefix));
	                }
	            }
	            for (var i = 0; i < service.rules.length; i++)if(service.rules.hasOwnProperty(i)) {
	                var rule = service.rules[i];
	                rules.add(rule['left'], rule['right']);
	            }
	            rdf = rdf.reason(rules, 10); /* execute the rules only 10 times to avoid looping */
	        }
	        var entities = {};
	        rdf.where('?subject ?property ?object').each(function() {
	            var subject = this.subject.toString();
	            if (!entities[subject]) {
	                entities[subject] = {
	                    '@subject': subject,
	                    '@context': service.vie.namespaces.toObj(true),
	                    '@type': []
	                };
	            }
	            var propertyUri = this.property.toString();
	            var propertyCurie;
	
	            try {
	                propertyCurie = service.vie.namespaces.curie(propertyUri);
	                //jQuery.createCurie(propertyUri, {namespaces: service.vie.namespaces.toObj(true)});
	            } catch (e) {
	                propertyCurie = propertyUri;
	               // console.warn(propertyUri + " doesn't have a namespace definition in '", service.vie.namespaces.toObj());
	            }
	            entities[subject][propertyCurie] = entities[subject][propertyCurie] || [];

	            function getValue(rdfQueryLiteral){
	                if(typeof rdfQueryLiteral.value === "string"){
	                    if (rdfQueryLiteral.lang){
	                        var literal = {
	                            toString: function(){
	                                return this["@value"];
	                            },
	                            "@value": rdfQueryLiteral.value.replace(/^"|"$/g, ''),
	                            "@language": rdfQueryLiteral.lang
	                        };
	                        return literal;
	                    }
	                    else
	                        return rdfQueryLiteral.value;
	                    return rdfQueryLiteral.value.toString();
	                } else if (rdfQueryLiteral.type === "uri"){
	                    return rdfQueryLiteral.toString();
	                } else {
	                    return rdfQueryLiteral.value;
	                }
	            }
	            entities[subject][propertyCurie].push(getValue(this.object));
	        });
	
	        _(entities).each(function(ent){
	            ent["@type"] = ent["@type"].concat(ent["rdf:type"]);
	            delete ent["rdf:type"];
	            _(ent).each(function(value, property){
	                if(value.length === 1){
	                    ent[property] = value[0];
	                }
	            });
	        });
	
	        var vieEntities = [];
	        jQuery.each(entities, function() {
	            var entityInstance = new service.vie.Entity(this);
	            entityInstance = service.vie.entities.addOrUpdate(entityInstance);
	            vieEntities.push(entityInstance);
	        });
	        return vieEntities;
        } catch (e) {
        	console.warn("Something went wrong while parsing the returned results!", e);
        	return [];
        }
    },

    /*
    VIE.Util.getPreferredLangForPreferredProperty(entity, preferredFields, preferredLanguages)
    looks for specific ranking fields and languages. It calculates all possibilities and gives them
    a score. It returns the value with the best score.
    */
    getPreferredLangForPreferredProperty: function(entity, preferredFields, preferredLanguages) {
      var l, labelArr, lang, p, property, resArr, valueArr, _len, _len2,
        _this = this;
      resArr = [];
      /* Try to find a label in the preferred language
      */
      preferredFields = (_.isArray(preferredFields))? preferredFields : [ preferredFields ];
      preferredLanguages = (_.isArray(preferredLanguages))? preferredLanguages : [ preferredLanguages ];
      for (l = 0, _len = preferredLanguages.length; l < _len; l++) {
        lang = preferredLanguages[l];
        for (p = 0, _len2 = preferredFields.length; p < _len2; p++) {
          property = preferredFields[p];
          labelArr = null;
          /* property can be a string e.g. "skos:prefLabel"
          */
          if (typeof property === "string" && entity.get(property)) {
            labelArr = _.flatten([entity.get(property)]);
            _(labelArr).each(function(label) {
              /* 
              The score is a natural number with 0 for the 
              best candidate with the first preferred language
              and first preferred property
              */
              var labelLang, score, value;
              score = p;
              labelLang = label["@language"];
              /*
                                      legacy code for compatibility with uotdated stanbol, 
                                      to be removed after may 2012
              */
              if (typeof label === "string" && (label.indexOf("@") === label.length - 3 || label.indexOf("@") === label.length - 5)) {
                labelLang = label.replace(/(^\"*|\"*@)..(..)?$/g, "");
              }
              /* end of legacy code
              */
              if (labelLang) {
                if (labelLang === lang) {
                  score += l;
                } else {
                  score += 20;
                }
              } else {
                score += 10;
              }
              value = label.toString();
              /* legacy code for compatibility with uotdated stanbol, to be removed after may 2012
              */
              value = value.replace(/(^\"*|\"*@..$)/g, "");
              /* end of legacy code
              */
              return resArr.push({
                score: score,
                value: value
              });
            });
            /* 
            property can be an object like 
            {
              property: "skos:broader", 
              makeLabel: function(propertyValueArr) { return "..."; }
            }
            */
          } else if (typeof property === "object" && entity.get(property.property)) {
            valueArr = _.flatten([entity.get(property.property)]);
            valueArr = _(valueArr).map(function(termUri) {
              if (termUri.isEntity) {
                return termUri.getSubject();
              } else {
                return termUri;
              }
            });
            resArr.push({
              score: p,
              value: property.makeLabel(valueArr)
            });
          }
        }
      }
      /*
              take the result with the best score
      */
      resArr = _(resArr).sortBy(function(a) {
        return a.score;
      });
      if(resArr.length) {
        return resArr[0].value;
      } else {
        return "n/a";
      }
    },

    
// ### VIE.Util._rdf2EntitiesNoRdfQuery(service, results)
// This is a **private** method which should
// only be accessed through ```VIE.Util._rdf2Entities()``` and is a helper method in case there is no
// rdfQuery loaded (*not recommended*).  
// **Parameters**:  
// *{object}* **service** The service that retrieved the data.  
// *{object}* **results** The data to be transformed.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{[VIE.Entity]}* : An array, containing VIE.Entity instances which have been transformed from the given data.
    _rdf2EntitiesNoRdfQuery: function (service, results) {
        var jsonLD = [];
        _.forEach(results, function(value, key) {
            var entity = {};
            entity['@subject'] = '<' + key + '>';
            _.forEach(value, function(triples, predicate) {
                predicate = '<' + predicate + '>';
                _.forEach(triples, function(triple) {
                    if (triple.type === 'uri') {
                        triple.value = '<' + triple.value + '>';
                    }

                    if (entity[predicate] && !_.isArray(entity[predicate])) {
                        entity[predicate] = [entity[predicate]];
                    }

                    if (_.isArray(entity[predicate])) {
                        entity[predicate].push(triple.value);
                        return;
                    }
                    entity[predicate] = triple.value;
                });
            });
            jsonLD.push(entity);
        });
        return jsonLD;
    },

// ### VIE.Util.loadSchemaOrg(vie, SchemaOrg, baseNS)
// This method is a wrapper around
// the <a href="http://schema.org/">schema.org</a> ontology. It adds all the
// given types and properties as ```VIE.Type``` instances to the given VIE instance.
// If the paramenter **baseNS** is set, the method automatically sets the namespace
// to the provided one. If it is not set, it will keep the base namespace of VIE untouched.  
// **Parameters**:  
// *{VIE}* **vie** The instance of ```VIE```.   
// *{object}* **SchemaOrg** The data imported from schema.org.   
// *{string|undefined}* **baseNS** If set, this will become the new baseNamespace within the given ```VIE``` instance.   
// **Throws**:  
// *{Error}* If the parameter was not given.  
// **Returns**:  
// *nothing*
    loadSchemaOrg : function (vie, SchemaOrg, baseNS) {
    
        if (!SchemaOrg) {
            throw new Error("Please load the schema.rdfs.org-json file.");
        }
        vie.types.remove("<http://schema.org/Thing>");
        
        var baseNSBefore = (baseNS)? baseNS : vie.namespaces.base();
        /* temporarily set the schema.org namespace as the default one */
        vie.namespaces.base("http://schema.org/");
        
        var datatypeMapping = {
            'DataType': 'xsd:anyType',
            'Boolean' : 'xsd:boolean',
            'Date'    : 'xsd:date',
            'Float'   : 'xsd:float',
            'Integer' : 'xsd:integer',
            'Number'  : 'xsd:anySimpleType',
            'Text'    : 'xsd:string',
            'URL'     : 'xsd:anyURI'
        };
        
        var dataTypeHelper = function (ancestors, id) {
            var type = vie.types.add(id, [{'id' : 'value', 'range' : datatypeMapping[id]}]);
            
            for (var i = 0; i < ancestors.length; i++) {
                var supertype = (vie.types.get(ancestors[i]))? vie.types.get(ancestors[i]) :
                    dataTypeHelper.call(vie, SchemaOrg["datatypes"][ancestors[i]].supertypes, ancestors[i]);
                type.inherit(supertype);
            }
            return type;
        };
        
        for (var dt in SchemaOrg["datatypes"]) {
            if (!vie.types.get(dt)) {
                var ancestors = SchemaOrg["datatypes"][dt].supertypes;
                dataTypeHelper.call(vie, ancestors, dt);
            }
        }
        
        var typeProps = function (id) {
            var props = [];
            var specProps = SchemaOrg["types"][id]["specific_properties"];
            for (var p = 0; p < specProps.length; p++) {
                var pId = specProps[p];
                var range = SchemaOrg["properties"][pId]["ranges"];
                props.push({
                    'id'    : pId,
                    'range' : range
                });
            }
            return props;
        };
        
        var typeHelper = function (ancestors, id, props) {
            var type = vie.types.add(id, props);
           
            for (var i = 0; i < ancestors.length; i++) {
                var supertype = (vie.types.get(ancestors[i]))? vie.types.get(ancestors[i]) :
                    typeHelper.call(vie, SchemaOrg["types"][ancestors[i]].supertypes, ancestors[i], typeProps.call(vie, ancestors[i]));
                type.inherit(supertype);
            }
            if (id === "Thing" && !type.isof("owl:Thing")) {
                type.inherit("owl:Thing");
            }
            type.locked = true;
            return type;
        };
        
        for (var t in SchemaOrg["types"]) {
            if (!vie.types.get(t)) {
                var ancestors = SchemaOrg["types"][t].supertypes;
                typeHelper.call(vie, ancestors, t, typeProps.call(vie, t));
            }
        }
        /* set the namespace(s) back to what they were before */
        vie.namespaces.base(baseNSBefore);
        if (baseNS !== "http://schema.org/")
            vie.namespaces.add("schema", "http://schema.org/");
    },

// ### VIE.Util.xsdDateTime(date)
// This transforms a ```Date``` instance into an xsd:DateTime format.  
// **Parameters**:  
// *{```Date```}* **date** An instance of a javascript ```Date```.  
// **Throws**: 
// *nothing*..  
// **Returns**: 
// *{string}* A string representation of the dateTime in the xsd:dateTime format.
    xsdDateTime : function(date) {
        function pad(n) {
            var s = n.toString();
            return s.length < 2 ? '0'+s : s;
        };

        var yyyy = date.getFullYear();
        var mm1  = pad(date.getMonth()+1);
        var dd   = pad(date.getDate());
        var hh   = pad(date.getHours());
        var mm2  = pad(date.getMinutes());
        var ss   = pad(date.getSeconds());

        return yyyy +'-' +mm1 +'-' +dd +'T' +hh +':' +mm2 +':' +ss;
    },

// ### VIE.Util.extractLanguageString(entity, attrs, langs)
// This method extracts a literal string from an entity, searching through the given attributes and languages.  
// **Parameters**:  
// *{```VIE.Entity```}* **entity** An instance of a VIE.Entity.  
// *{```array|string```}* **attrs** Either a string or an array of possible attributes.  
// *{```array|string```}* **langs** Either a string or an array of possible languages.  
// **Throws**: 
// *nothing*..  
// **Returns**: 
// *{string|undefined}* The string that was found at the attribute with the wanted language, undefined if nothing could be found.
// **Example usage**: 
//
//          var attrs = ["name", "rdfs:label"];
//          var langs = ["en", "de"];
//          VIE.Util.extractLanguageString(someEntity, attrs, langs);// "Barack Obama";
    extractLanguageString : function(entity, attrs, langs) {
        if (entity && typeof entity !== "string") {
        	attrs = (_.isArray(attrs))? attrs : [ attrs ];
        	langs = (_.isArray(langs))? langs : [ langs ];
        	for (var p = 0; p < attrs.length; p++) {
	            for (var l = 0; l < langs.length; l++) {
	            	var lang = langs[l];
	                var attr = attrs[p];
	                if (entity.has(attr)) {
	                    var name = entity.get(attr);
	                    name = (_.isArray(name))? name : [ name ];
                        for ( var i = 0; i < name.length; i++) {
                        	var n = name[i];
                        	if (n.isEntity) {
                        		n = VIE.Util.extractLanguageString(n, attrs, lang);
                        	} else if (typeof n === "string") {
                        		// n = n;
                        	} else {
                        		n = "";
                        	}
                            if (n && n.indexOf('@' + lang) > -1) {
                                return n.replace(/"/g, "").replace(/@[a-z]+/, '').trim();
                            }
                        }
	                }
	            }
        	}
        	/* let's do this again in case we haven't found a name but are dealing with
        	broken data where no language is given */
        	for (var p = 0; p < attrs.length; p++) {
                var attr = attrs[p];
                if (entity.has(attr)) {
                    var name = entity.get(attr);
                    name = (_.isArray(name))? name : [ name ];
                    for ( var i = 0; i < name.length; i++) {
                    	var n = name[i];
                    	if (n.isEntity) {
                    		n = VIE.Util.extractLanguageString(n, attrs, []);
                    	}
                        if (n && (typeof n === "string") && n.indexOf('@') === -1) {
                            return n.replace(/"/g, "").replace(/@[a-z]+/, '').trim();
                        }
                    }
                }
        	}
        }
        return undefined;
    },
    
// ### VIE.Util.transformationRules(service)
// This returns a default set of rdfQuery rules that transform semantic data into the
// VIE entity types.  
// **Parameters**:  
// *{object}* **service** An instance of a vie.service.  
// **Throws**: 
// *nothing*..  
// **Returns**: 
// *{array}* An array of rules with 'left' and 'right' side.
    transformationRules : function (service) {
        var res = [
           // rule(s) to transform a dbpedia:Person into a VIE:Person
             {
                'left' : [
                    '?subject a dbpedia:Person',
                    '?subject rdfs:label ?label'
                 ],
                 'right': function(ns){
                     return function(){
                         return [
                             jQuery.rdf.triple(this.subject.toString(),
                                 'a',
                                 '<' + ns.base() + 'Person>', {
                                     namespaces: ns.toObj()
                                 }),
                             jQuery.rdf.triple(this.subject.toString(),
                                 '<' + ns.base() + 'name>',
                                 this.label, {
                                     namespaces: ns.toObj()
                                 })
                             ];
                     };
                 }(service.vie.namespaces)
             },
            // rule(s) to transform a foaf:Person into a VIE:Person
             {
             'left' : [
                     '?subject a foaf:Person',
                     '?subject rdfs:label ?label'
                  ],
                  'right': function(ns){
                      return function(){
                          return [
                              jQuery.rdf.triple(this.subject.toString(),
                                  'a',
                                  '<' + ns.base() + 'Person>', {
                                      namespaces: ns.toObj()
                                  }),
                              jQuery.rdf.triple(this.subject.toString(),
                                  '<' + ns.base() + 'name>',
                                  this.label, {
                                      namespaces: ns.toObj()
                                  })
                              ];
                      };
                  }(service.vie.namespaces)
              },
            // rule(s) to transform a dbpedia:Place into a VIE:Place
             {
                 'left' : [
                     '?subject a dbpedia:Place',
                     '?subject rdfs:label ?label'
                  ],
                  'right': function(ns) {
                      return function() {
                          return [
                          jQuery.rdf.triple(this.subject.toString(),
                              'a',
                              '<' + ns.base() + 'Place>', {
                                  namespaces: ns.toObj()
                              }),
                          jQuery.rdf.triple(this.subject.toString(),
                                  '<' + ns.base() + 'name>',
                              this.label.toString(), {
                                  namespaces: ns.toObj()
                              })
                          ];
                      };
                  }(service.vie.namespaces)
              },
            // rule(s) to transform a dbpedia:City into a VIE:City
              {
                 'left' : [
                     '?subject a dbpedia:City',
                     '?subject rdfs:label ?label',
                     '?subject dbpedia:abstract ?abs',
                     '?subject dbpedia:country ?country'
                  ],
                  'right': function(ns) {
                      return function() {
                          return [
                          jQuery.rdf.triple(this.subject.toString(),
                              'a',
                              '<' + ns.base() + 'City>', {
                                  namespaces: ns.toObj()
                              }),
                          jQuery.rdf.triple(this.subject.toString(),
                                  '<' + ns.base() + 'name>',
                              this.label.toString(), {
                                  namespaces: ns.toObj()
                              }),
                          jQuery.rdf.triple(this.subject.toString(),
                                  '<' + ns.base() + 'description>',
                              this.abs.toString(), {
                                  namespaces: ns.toObj()
                              }),
                          jQuery.rdf.triple(this.subject.toString(),
                                  '<' + ns.base() + 'containedIn>',
                              this.country.toString(), {
                                  namespaces: ns.toObj()
                              })
                          ];
                      };
                  }(service.vie.namespaces)
              },
        ];
        return res;
    },
    
// ### VIE.Util.getAdditionalRules(vie)
// This returns a extended set of rdfQuery rules that transform semantic data into the
// VIE entity types.  
// **Parameters**:  
// *{object}* **vie** An instance of a vie
// **Throws**: 
// *nothing*..  
// **Returns**: 
// *{array}* An array of rules with 'left' and 'right' side.
    getAdditionalRules : function (vie) {
        mapping = {
                'Work'              : 'CreativeWork',
                'Film'              : 'Movie',
                'TelevisionEpisode' : 'TVEpisode',
                'TelevisionShow'    : 'TVSeries',// not listed as equivalent class on dbpedia.org
                'Website'           : 'WebPage',
                'Painting'          : 'Painting',
                'Sculpture'         : 'Sculpture',
                'Event'             : 'Event',
                'SportsEvent'       : 'SportsEvent',
                'MusicFestival'     : 'Festival',
                'FilmFestival'      : 'Festival',
                'Place'             : 'Place',
                'Continent'         : 'Continent',
                'Country'           : 'Country',
                'City'              : 'City',
                'Airport'           : 'Airport',
                'Station'           : 'TrainStation',// not listed as equivalent class on dbpedia.org
                'Hospital'          : 'GovernmentBuilding',
                'Mountain'          : 'Mountain',
                'BodyOfWater'       : 'BodyOfWater',
                'Company'           : 'Organization',
                'Person'            : 'Person' };
        var additionalRules = new Array();
        for (var key in mapping) {
            additionalRules.push(this.createSimpleRule(key, mapping[key], vie));
        }
        return additionalRules;
    },
// ### VIE.Util.createSimpleRule(key, value, vie)
// Returns a simple rule that only transforms the rdfs:label from dbpedia into VIE entity type.  
// **Parameters**:
// *{string}* **key** The dbpedia ontology name (left side)
// *{string}* **value** The target ontology name (right side)
// *{object}* **vie** An instance of a vie.
// **Throws**:
// *nothing*..
// **Returns**:
// *{array}* A single rule with 'left' and 'right' side.
    createSimpleRule : function (key, value, vie) {
        var rule = {
                'left' : [ '?subject a dbpedia:' + key, '?subject rdfs:label ?label' ],
                'right' : function(ns) {
                    return function() {
                        return [ vie.jQuery.rdf.triple(this.subject.toString(), 'a', '<' + ns.base() + value + '>', {
                            namespaces : ns.toObj()
                        }), vie.jQuery.rdf.triple(this.subject.toString(), '<' + ns.base() + 'name>', this.label.toString(), {
                            namespaces : ns.toObj()
                        }) ];
                    };
                }(vie.namespaces)
            };
        return rule;
    },
// ### VIE.Util.getDepiction(entity, picWidth)
// Returns the URL of the "foaf:depiction" or the "schema:thumbnail" of an entity.
// **Parameters**:
// *{object}* **entity** The entity to get the picture for
// *{int}* **picWidth** The prefered width in px for the found image
// **Throws**:
// *nothing*..
// **Returns**:
// *{string}* the image url
    getDepiction : function (entity, picWidth) {
        var depictionUrl, field, fieldValue, preferredFields;
        preferredFields = [ "foaf:depiction", "schema:thumbnail" ];
        field = _(preferredFields).detect(function(field) {
            if (entity.get(field)) return true;
        });
        if (field && (fieldValue = _([entity.get(field)]).flatten())) {
            depictionUrl = _(fieldValue).detect(function(uri) {
                uri = (typeof uri.getSubject === "function" ? uri.getSubject() : void 0) || uri;
                if (uri.indexOf("thumb") !== -1) return true;
            }).replace(/[0-9]{2..3}px/, "" + picWidth + "px");
            return depictionUrl.replace(/^<|>$/g, '');
        }
    },
    
 // ### VIE.Util.UUIDGenerator()
 // Returns a UUID. The original code is from [stackoverflow](http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript).
 // **Parameters**:
 // *nothing*
 // **Throws**:
 // *nothing*.
 // **Returns**:
 // *{string}* The generated UUID.    
    UUIDGenerator: function () {
        var S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
};
//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE Entities
// 
// In VIE there are two low-level model types for storing data.
// **Collections** and **Entities**. Considering `var v = new VIE();` a VIE instance,
// `v.entities` is a Collection with `VIE Entity` objects in it. 
// VIE internally uses JSON-LD to store entities.
//
// Each Entity has a few special attributes starting with an `@`. VIE has an API
// for correctly using these attributes, so in order to stay compatible with later 
// versions of the library, possibly using a later version of JSON-LD, use the API
// to interact with your entities.
// 
// * `@subject` stands for the identifier of the entity. Use `e.getSubject()` 
// * `@type` stores the explicit entity types. VIE internally handles Type hierarchy,
// which basically enables to define subtypes and supertypes. Every entity has 
// the type 'owl:Thing'. Read more about Types in <a href="Type.html">VIE.Type</a>.
// * `@context` stores namespace definitions used in the entity. Read more about 
// Namespaces in <a href="Namespace.html">VIE Namespaces</a>.
VIE.prototype.Entity = function(attrs, opts) {

    attrs = (attrs)? attrs : {};
    opts = (opts)? opts : {};

    var self = this;

    if (attrs['@type'] !== undefined) {
        attrs['@type'] = (_.isArray(attrs['@type']))? attrs['@type'] : [ attrs['@type'] ];
        attrs['@type'] = _.map(attrs['@type'], function(val){
            if (!self.vie.types.get(val)) {
                //if there is no such type -> add it and let it inherit from "owl:Thing"
                self.vie.types.add(val).inherit("owl:Thing");
            }
            return self.vie.types.get(val).id;
        });
        attrs['@type'] = (attrs['@type'].length === 1)? attrs['@type'][0] : attrs['@type'];
    } else {
        // provide "owl:Thing" as the default type if none was given
        attrs['@type'] = self.vie.types.get("owl:Thing").id;
    }

    //the following provides full seamless namespace support
    //for attributes. It should not matter, if you
    //query for `model.get('name')` or `model.get('foaf:name')`
    //or even `model.get('http://xmlns.com/foaf/0.1/name');`
    //However, if we just overwrite `set()` and `get()`, this
    //raises a lot of side effects, so we need to expand
    //the attributes before we create the model.
    _.each (attrs, function (value, key) {
        var newKey = VIE.Util.mapAttributeNS(key, this.namespaces);
        if (key !== newKey) {
            delete attrs[key];
            attrs[newKey] = value;
        }
    }, self.vie);

    var Model = Backbone.Model.extend({
        idAttribute: '@subject',

        initialize: function(attributes, options) {
            if (attributes['@subject']) {
                this.id = this['@subject'] = this.toReference(attributes['@subject']);
            } else {
                this.id = this['@subject'] = attributes['@subject'] = this.cid.replace('c', '_:bnode');
            }
            return this;
        },

        // ### Getter, Has, Setter
        // #### `.get(attr)`
        // To be able to communicate to a VIE Entity you can use a simple get(property)
        // command as in `entity.get('rdfs:label')` which will give you one or more literals.
        // If the property points to a collection, its entities can be browsed further.
        get: function (attr) {
            attr = VIE.Util.mapAttributeNS(attr, self.vie.namespaces);
            var value = Backbone.Model.prototype.get.call(this, attr);
            value = (_.isArray(value))? value : [ value ];

            value = _.map(value, function(v) {
                if (v !== undefined && attr === '@type' && self.vie.types.get(v)) {
                    return self.vie.types.get(v);
                } else if (v !== undefined && self.vie.entities.get(v)) {
                    return self.vie.entities.get(v);
                } else {
                    return v;
                }
            }, this);
            if(value.length === 0) {
                return undefined;
            }
            // if there is only one element, just return that one
            value = (value.length === 1)? value[0] : value;
            return value;
        },

        // #### `.has(attr)`
        // Sometimes you'd like to determine if a specific attribute is set 
        // in an entity. For this reason you can call for example `person.has('friend')`
        // to determine if a person entity has friends.
        has: function(attr) {
            attr = VIE.Util.mapAttributeNS(attr, self.vie.namespaces);
            return Backbone.Model.prototype.has.call(this, attr);
        },

        // #### `.set(attrName, value, opts)`, 
        // The `options` parameter always refers to a `Backbone.Model.set` `options` object.
        //
        // **`.set(attributes, options)`** is the most universal way of calling the
        // `.set` method. In this case the `attributes` object is a map of all 
        // attributes to be changed.
        set : function(attrs, options, opts) {
            if (!attrs) {
                return this;
            }

            if (attrs['@subject']) {
                attrs['@subject'] = this.toReference(attrs['@subject']);
            }

            // Use **`.set(attrName, value, options)`** for setting or changing exactly one 
            // entity attribute.
            if (typeof attrs === "string") {
                var obj = {};
                obj[attrs] = options;
                return this.set(obj, opts);
            }
            // **`.set(entity)`**: In case you'd pass a VIE entity, 
            // the passed entities attributes are being set for the entity.
            if (attrs.attributes) {
                attrs = attrs.attributes;
            }
            var self = this;
            // resolve shortened URIs like rdfs:label..
            _.each (attrs, function (value, key) {
                var newKey = VIE.Util.mapAttributeNS(key, self.vie.namespaces);
                if (key !== newKey) {
                    delete attrs[key];
                    attrs[newKey] = value;
                }
            }, this);
            // Finally iterate through the *attributes* to be set and prepare 
            // them for the Backbone.Model.set method.
            _.each (attrs, function (value, key) {
               if (!value) { return; }
               if (key.indexOf('@') === -1) {
                   if (value.isCollection) {
                       // ignore
                       value.each(function (child) {
                           self.vie.entities.addOrUpdate(child);
                       });
                   } else if (value.isEntity) {
                       self.vie.entities.addOrUpdate(value);
                       var coll = new self.vie.Collection();
                       coll.vie = self.vie;
                       coll.add(value);
                       attrs[key] = coll;
                   } else if (_.isArray(value)) {
                       if (this.attributes[key] && this.attributes[key].isCollection) {
                         var newEntities = this.attributes[key].addOrUpdate(value);
                         attrs[key] = this.attributes[key];
                         attrs[key].reset(newEntities);
                       }
                   } else if (value["@value"]) {
                       // The value is a literal object, ignore
                   } else if (typeof value == "object") {
                       // The value is another VIE Entity
                       var child = new self.vie.Entity(value, options);
                       // which is being stored in `v.entities`
                       self.vie.entities.addOrUpdate(child);
                       // and set as VIE Collection attribute on the original entity 
                       var coll = new self.vie.Collection();
                       coll.vie = self.vie;
                       coll.add(value);
                       attrs[key] = coll;
                   } else {
                       // ignore
                   }
               }
            }, this);
            return Backbone.Model.prototype.set.call(this, attrs, options);
        },

        // **`.unset(attr, opts)` ** removes an attribute from the entity.
        unset: function (attr, opts) {
            attr = VIE.Util.mapAttributeNS(attr, self.vie.namespaces);
            return Backbone.Model.prototype.unset.call(this, attr, opts);
        },

        isNew: function() {
            if (this.getSubjectUri().substr(0, 7) === '_:bnode') {
                return true;
            }
            return false;
        },

        hasChanged: function(attr) {
            if (this.markedChanged) {
                return true;
            }

            return Backbone.Model.prototype.hasChanged.call(this, attr);
        },

        // Force hasChanged to return true
        forceChanged: function(changed) {
            this.markedChanged = changed ? true : false;
        },

        // **`getSubject()`** is the getter for the entity identifier.
        getSubject: function(){
            if (typeof this.id === "undefined") {
                this.id = this.attributes[this.idAttribute];
            }
            if (typeof this.id === 'string') {
                if (this.id.substr(0, 7) === 'http://' || this.id.substr(0, 4) === 'urn:') {
                    return this.toReference(this.id);
                }
                return this.id;
            }
            return this.cid.replace('c', '_:bnode');
        },

        // TODO describe
        getSubjectUri: function(){
            return this.fromReference(this.getSubject());
        },

        isReference: function(uri){
            var matcher = new RegExp("^\\<([^\\>]*)\\>$");
            if (matcher.exec(uri)) {
                return true;
            }
            return false;
        },

        toReference: function(uri){
            if (_.isArray(uri)) {
              var self = this;
              return _.map(uri, function(part) {
                 return self.toReference(part);
              });
            }
            var ns = this.vie.namespaces;
            var ret = uri;
            if (uri.substring(0, 2) === "_:") {
                ret = uri;
            }
            else if (ns.isCurie(uri)) {
                ret = ns.uri(uri);
                if (ret === "<" + ns.base() + uri + ">") {
                    /* no base namespace extension with IDs */
                    ret = '<' + uri + '>';
                }
            } else if (!ns.isUri(uri)) {
                ret = '<' + uri + '>';
            }
            return ret;
        },

        fromReference: function(uri){
            var ns = this.vie.namespaces;
            if (!ns.isUri(uri)) {
                return uri;
            }
            return uri.substring(1, uri.length - 1);
        },

        as: function(encoding){
            if (encoding === "JSON") {
                return this.toJSON();
            }
            if (encoding === "JSONLD") {
                return this.toJSONLD();
            }
            throw new Error("Unknown encoding " + encoding);
        },

        toJSONLD: function(){
            var instanceLD = {};
            var instance = this;
            _.each(instance.attributes, function(value, name){
                var entityValue = value; //instance.get(name);

                if (value instanceof instance.vie.Collection) {
                    entityValue = value.map(function(instance) {
                        return instance.getSubject();
                    });
                }

                // TODO: Handle collections separately
                instanceLD[name] = entityValue;
            });

            instanceLD['@subject'] = instance.getSubject();

            return instanceLD;
        },

        // **`.setOrAdd(arg1, arg2)`** similar to `.set(..)`, `.setOrAdd(..)` can 
        // be used for setting one or more attributes of an entity, but in
        // this case it's a collection of values, not just one. That means, if the
        // entity already has the attribute set, make the value to a VIE Collection
        // and use the collection as value. The collection can contain entities 
        // or literals, but not both at the same time.
        setOrAdd: function (arg1, arg2, option) {
            var entity = this;
            if (typeof arg1 === "string" && arg2) {
                // calling entity.setOrAdd("rdfs:type", "example:Musician")
                entity._setOrAddOne(arg1, arg2, option);
            }
            else
                if (typeof arg1 === "object") {
                    // calling entity.setOrAdd({"rdfs:type": "example:Musician", ...})
                    _(arg1).each(function(val, key){
                        entity._setOrAddOne(key, val, arg2);
                    });
                }
            return this;
        },


        /* attr is always of type string */
        /* value can be of type: string,int,double,object,VIE.Entity,VIE.Collection */
       /*  val can be of type: undefined,string,int,double,array,VIE.Collection */
       
        /* depending on the type of value and the type of val, different actions need to be made */
        _setOrAddOne: function (attr, value, options) {
            if (!attr || !value)
                return;
            options = (options)? options : {};
                
            attr = VIE.Util.mapAttributeNS(attr, self.vie.namespaces);
            
            if (_.isArray(value)) {
                for (var v = 0; v < value.length; v++) {
                    this._setOrAddOne(attr, value[v], options);
                }
                return;
            }
            
            if (attr === "@type" && value instanceof self.vie.Type) {
            	value = value.id;
            }
            
            var obj = {};
            var existing = Backbone.Model.prototype.get.call(this, attr);
            
            if (!existing) {
                obj[attr] = value;
                this.set(obj, options);
            } else if (existing.isCollection) {
                if (value.isCollection) {
                    value.each(function (model) {
                        existing.add(model);
                    });
                } else if (value.isEntity) {
                    existing.add(value);
                } else if (typeof value === "object") {
                    value = new this.vie.Entity(value);
                    existing.add(value);
                } else {
                    throw new Error("you cannot add a literal to a collection of entities!");
                }
                this.trigger('change:' + attr, this, value, {});
                this.change({});
            } else if (_.isArray(existing)) {
                if (value.isCollection) {
                	for (var v = 0; v < value.size(); v++) {
                		this._setOrAddOne(attr, value.at(v).getSubject(), options);
                	}
                } else if (value.isEntity) {
                	this._setOrAddOne(attr, value.getSubject(), options);
                } else if (typeof value === "object") {
                	value = new this.vie.Entity(value);
                	this._setOrAddOne(attr, value, options);
                } else {
                    /* yes, we (have to) allow multiple equal values */
                    existing.push(value);
                    obj[attr] = existing;
                    this.set(obj);
                }
            } else {
                var arr = [ existing ];
                arr.push(value);
                obj[attr] = arr;
                return this.set(obj, options);
            }
        },

        // **`.hasType(type)`** determines if the entity has the explicit `type` set.
        hasType: function(type){
            type = self.vie.types.get(type);
            return this.hasPropertyValue("@type", type);
        },

        // TODO describe
        hasPropertyValue: function(property, value) {
            var t = this.get(property);
            if (!(value instanceof Object)) {
                value = self.vie.entities.get(value);
            }
            if (t instanceof Array) {
                return t.indexOf(value) !== -1;
            }
            else {
                return t === value;
            }
        },

        // **`.isof(type)`** determines if the entity is of `type` by explicit or implicit 
        // declaration. E.g. if Employee is a subtype of Person and e Entity has
        // explicitly set type Employee, e.isof(Person) will evaluate to true.
        isof: function (type) {
            var types = this.get('@type');
            
            if (types === undefined) {
                return false;
            }
            types = (_.isArray(types))? types : [ types ];
            
            type = (self.vie.types.get(type))? self.vie.types.get(type) : new self.vie.Type(type);
            for (var t = 0; t < types.length; t++) {
                if (self.vie.types.get(types[t])) {
                    if (self.vie.types.get(types[t]).isof(type)) {
                        return true;
                    }
                } else {
                    var typeTmp = new self.vie.Type(types[t]);
                    if (typeTmp.id === type.id) {
                        return true;
                    }
                }
            }
            return false;
        },
        
        // TODO describe
        addTo : function (collection, update) {
            var self = this;
            if (collection instanceof self.vie.Collection) {
                if (update) {
                    collection.addOrUpdate(self);
                } else {
                    collection.add(self);
                }
                return this;
            }
            throw new Error("Please provide a proper collection of type VIE.Collection as argument!");
        },
        

// ### toString(options)  
// This method converts an entity into a string representation.  
// If no options are set, it tries to guess the "name" of  
// entity with a preference on the default given attributes:  
// `["rdfs:label", "name", "schema:name", "foaf:name", "dcterms:identifier"]`  
// and it tries to guess the language from the browser. However,  
// you can also specify these options to be used directly (see  
// code example below).  
// **Parameters**:  
// *{object}* **options** The options to be set. (optional)  
// *{String|object}* **options.prop** Either a string or an array of strings. (optional) 
// *{String|object}* **options.lang** Either a string or an array of strings. (optional)  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{string}* : The string representation of the entity, 
//              based on the options/default values.    
// **Example usage**:  
//
//    var entity = vie.entities.add({"name" : "Barack Obama"});
//    entity.toString(); // <-- "Barack Obama"
//    entity.toString({prop : ["name"], prop : ["en"]}); // <-- "Barack Obama"
        toString: function (options) {
            options = (options)? options : {};
            options.prop = (options.prop)? 
                    options.prop : 
                    ["rdfs:label", "name", "schema:name", "foaf:name", "dcterms:identifier"];
            var browserLang = "en";
            if (navigator.userLanguage) // IE
                browserLang = navigator.userLanguage;
            else if (navigator.language) // FF
                browserLang = navigator.language;
            options.lang = (options.lang)? 
                    options.lang : 
                    [browserLang, "en", "de", "fi", "fr", "es", "ja", "zh-tw"];
            return VIE.Util.getPreferredLangForPreferredProperty(this, options.prop, options.lang);
        },
        
        isEntity: true,

        vie: self.vie
    });

    return new Model(attrs, opts);
};
//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/
VIE.prototype.Collection = Backbone.Collection.extend({
    model: VIE.prototype.Entity,
    
    get: function(id) {
        if (id === null) {
            return null;
        }
        
        id = (id.getSubject)? id.getSubject() : id;        
        if (typeof id === "string" && id.indexOf("_:") === 0) {
            if (id.indexOf("bnode") === 2) {
                //bnode!
                id = id.replace("_:bnode", 'c');
                return this._byCid[id];
            } else {
                return this._byId["<" + id + ">"];
            }
        } else {
            id = this.toReference(id);
            return this._byId[id];
        }
    },

    addOrUpdate: function(model, options) {
        options || (options = {});

        var collection = this;
        var existing;
        if (_.isArray(model)) {
            var entities = [];
            _.each(model, function(item) {
                entities.push(collection.addOrUpdate(item, options));
            });
            return entities;
        }

        if (model === undefined) {
            throw new Error("No model given");
        }

        if (_.isString(model) && collection.isReference(model)) {
          model = {
            '@subject': model
          };
        }

        if (!model.isEntity) {
            model = new this.model(model);
        }

        if (model.id && this.get(model.id)) {
            existing = this.get(model.id);
        }
        if (this.getByCid(model.cid)) {
            var existing = this.getByCid(model.cid);
        }
        if (existing) {
            var newAttribs = {};
            _.each(model.attributes, function(value, attribute) {
                if (!existing.has(attribute)) {
                    newAttribs[attribute] = value;
                    return true;
                }
                else if (existing.get(attribute) === value) {
                    return true;
                } else {
                    //merge existing attribute values with new ones!
                    //not just overwrite 'em!!
                    var oldVals = existing.attributes[attribute];
                    var newVals = value;
                    if (oldVals instanceof collection.vie.Collection) {
                        // TODO: Merge collections
                        return true;
                    }
                    if (options.overrideAttributes) {
                       newAttribs[attribute] = value;
                       return true;
                    } 
                    if (attribute === '@context') {
                        newAttribs[attribute] = jQuery.extend(true, {}, oldVals, newVals);
                    } else {
                        oldVals = (jQuery.isArray(oldVals))? oldVals : [ oldVals ];
                        newVals = (jQuery.isArray(newVals))? newVals : [ newVals ];
                        newAttribs[attribute] = _.uniq(oldVals.concat(newVals));
                        newAttribs[attribute] = (newAttribs[attribute].length === 1)? newAttribs[attribute][0] : newAttribs[attribute];
                    }
                }
            });

            if (!_.isEmpty(newAttribs)) {
                existing.set(newAttribs, options.updateOptions);
            }
            return existing;
        }
        this.add(model, options.addOptions);
        return model;
    },

    isReference: function(uri){
        var matcher = new RegExp("^\\<([^\\>]*)\\>$");
        if (matcher.exec(uri)) {
            return true;
        }
        return false;
    },
        
    toReference: function(uri){
        if (this.isReference(uri)) {
            return uri;
        }
        return '<' + uri + '>';
    },
        
    fromReference: function(uri){
        if (!this.isReference(uri)) {
            return uri;
        }
        return uri.substring(1, uri.length - 1);
    },
    
    isCollection: true
});
//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/
//

// ## VIE.Types
// Within VIE, we provide special capabilities of handling types of entites. This helps
// for example to query easily for certain entities (e.g., you only need to query for *Person*s 
// and not for all subtypes).
if (VIE.prototype.Type) {
	throw new Error("ERROR: VIE.Type is already defined. Please check your installation!");
}
if (VIE.prototype.Types) {
	throw new Error("ERROR: VIE.Types is already defined. Please check your installation!");
}

// ### VIE.Type(id, attrs)
// This is the constructor of a VIE.Type.  
// **Parameters**:  
// *{string}* **id** The id of the type.  
// *{string|array|VIE.Attribute}* **attrs** A string, proper ```VIE.Attribute``` or an array of these which 
// are the possible attributes of the type  
// **Throws**:  
// *{Error}* if one of the given paramenters is missing.  
// **Returns**:  
// *{VIE.Type}* : A **new** VIE.Type object.  
// **Example usage**:  
//
//     var person = new vie.Type("Person", ["name", "knows"]);
VIE.prototype.Type = function (id, attrs) {
    if (id === undefined || typeof id !== 'string') {
        throw "The type constructor needs an 'id' of type string! E.g., 'Person'";
    }

// ### id
// This field stores the id of the type's instance.  
// **Parameters**:  
// nothing
// **Throws**:  
// nothing  
// **Returns**:  
// *{string}* : The id of the type as a URI.  
// **Example usage**:  
//
//     console.log(person.id);
//      // --> "<http://viejs.org/ns/Person>"
    this.id = this.vie.namespaces.isUri(id) ? id : this.vie.namespaces.uri(id);

    /* checks whether such a type is already defined. */
    if (this.vie.types.get(this.id)) {
        throw new Error("The type " + this.id + " is already defined!");
    }    
    
// ### supertypes
// This field stores all parent types of the type's instance. This
// is set if the current type inherits from another type.   
// **Parameters**:  
// nothing  
// **Throws**:  
// nothing  
// **Returns**:  
// *{VIE.Types}* : The supertypes (parents) of the type.  
// **Example usage**:  
//
//     console.log(person.supertypes);
    this.supertypes = new this.vie.Types();

// ### subtypes
// This field stores all children types of the type's instance. This
// will be set if another type inherits from the current type.  
// **Parameters**:  
// nothing  
// **Throws**:  
// nothing  
// **Returns**:  
// *{VIE.Types}* : The subtypes (parents) of the type.  
// **Example usage**:  
//
//     console.log(person.subtypes);
    this.subtypes = new this.vie.Types();
    
// ### attributes
// This field stores all attributes of the type's instance as
// a proper ```VIE.Attributes``` class. (see also <a href="Attribute.html">VIE.Attributes</a>)  
// **Parameters**:  
// nothing  
// **Throws**:  
// nothing  
// **Returns**:  
// *{VIE.Attributes}* : The attributes of the type.  
// **Example usage**:  
//
//     console.log(person.attributes);
    this.attributes = new this.vie.Attributes(this, (attrs)? attrs : []);
    
// ### locked
// This field is set to `true` when the type has been imported
// from an external ontology and hence should not be altered.  
// **Parameters**:  
// nothing  
// **Throws**:  
// nothing  
// **Returns**:  
// *{boolean}* : `true` when the type is locked, `false` otherwise.  
// **Example usage**:  
//
//      console.log(person.locked);
     this.locked = false;
    
// ### isof(type)
// This method checks whether the current type is a child of the given type.  
// **Parameters**:  
// *{string|VIE.Type}* **type** The type (or the id of that type) to be checked.  
// **Throws**:  
// *{Error}* If the type is not valid.   
// **Returns**:  
// *{boolean}* : ```true``` if the current type inherits from the type, ```false``` otherwise.  
// **Example usage**:  
//
//     console.log(person.isof("owl:Thing"));
//    // <-- true    
    this.isof = function (type) {
        type = this.vie.types.get(type);
        if (type) {
            return type.subsumes(this.id);
        } else {
            throw new Error("No valid type given");
        }
    };

// ### subsumes(type)
// This method checks whether the current type is a parent of the given type.  
// **Parameters**:  
// *{string|VIE.Type}* **type** The type (or the id of that type) to be checked.  
// **Throws**:  
// *{Error}* If the type is not valid.   
// **Returns**:  
// *{boolean}* : ```true``` if the current type is a parent of the type, ```false``` otherwise.  
// **Example usage**:  
//
//     var x = new vie.Type(...);
//     var y = new vie.Type(...).inherit(x);
//     y.isof(x) === x.subsumes(y);
    this.subsumes = function (type) {
        type = this.vie.types.get(type);
        if (type) {
            if (this.id === type.id) {
                return true;
            }
            var subtypes = this.subtypes.list();
            for (var c = 0; c < subtypes.length; c++) {
                var childObj = subtypes[c];
                if (childObj) {
                     if (childObj.id === type.id || childObj.subsumes(type)) {
                         return true;
                     }
                }
            }
            return false;
        } else {
            throw new Error("No valid type given");
        }
    };
    
// ### inherit(supertype)
// This method invokes inheritance throught the types. This adds the current type to the
// subtypes of the supertype and vice versa.   
// **Parameters**:  
// *{string|VIE.Type|array}* **supertype** The type to be inherited from. If this is an array
// the inherit method is called sequentially on all types.  
// **Throws**:  
// *{Error}* If the type is not valid.   
// **Returns**:  
// *{VIE.Type}* : The instance itself.  
// **Example usage**:  
//
//     var x = new vie.Type(...);
//     var y = new vie.Type(...).inherit(x);
//     y.isof(x) // <-- true
    this.inherit = function (supertype) {
        if (this.locked) {
            throw new Error("The type " + this.id + " has been imported from an external ontology and must not " + 
                    "be altered! Please create a new type that inherits from the current type!");
        }
        if (typeof supertype === "string") {
            this.inherit(this.vie.types.get(supertype));
        }
        else if (supertype instanceof this.vie.Type) {
            supertype.subtypes.addOrOverwrite(this);
            this.supertypes.addOrOverwrite(supertype);
            try {
                /* only for validation of attribute-inheritance!
                   if this throws an error (inheriting two attributes
                   that cannot be combined) we reverse all changes. */
                this.attributes.list();
            } catch (e) {
                supertype.subtypes.remove(this);
                this.supertypes.remove(supertype);
                throw e;
            }
        } else if (jQuery.isArray(supertype)) {
            for (var i = 0, slen = supertype.length; i < slen; i++) {
                this.inherit(supertype[i]);
            }
        } else {
            throw new Error("Wrong argument in VIE.Type.inherit()");
        }
        return this;
    };
        
// ### hierarchy()
// This method serializes the hierarchy of child types into an object.   
// **Parameters**:  
// *nothing*  
// **Throws**:  
// *nothing*   
// **Returns**:  
// *{object}* : The hierachy of child types as an object.  
// **Example usage**:  
//
//     var x = new vie.Type(...);
//     var y = new vie.Type(...).inherit(x);
//     x.hierarchy();
    this.hierarchy = function () {
        var obj = {id : this.id, subtypes: []};
        var list = this.subtypes.list();
        for (var c = 0, llen = list.length; c < llen; c++) {
            var childObj = this.vie.types.get(list[c]);
            obj.subtypes.push(childObj.hierarchy());
        }
        return obj;
    };
    
// ### instance()
// This method creates a ```VIE.Entity``` instance from this type.
// **Parameters**:  
// *{object}* **attrs**  see <a href="Entity.html">constructor of VIE.Entity</a>  
// *{object}* **opts**  see <a href="Entity.html">constructor of VIE.Entity</a>  
// **Throws**:  
// *{Error}* if the instance could not be built   
// **Returns**:  
// *{VIE.Entity}* : A **new** instance of a ```VIE.Entity``` with the current type.  
// **Example usage**:  
//
//     var person = new vie.Type("person");
//     var sebastian = person.instance(
//         {"@subject" : "#me", 
//          "name" : "Sebastian"});
//     console.log(sebastian.get("name")); // <-- "Sebastian"
    this.instance = function (attrs, opts) {
        attrs = (attrs)? attrs : {};
        opts = (opts)? opts : {};
        
        /* turn type/attribute checking on by default! */
        if (opts.typeChecking !== false) {
            for (var a in attrs) {
                if (a.indexOf('@') !== 0 && !this.attributes.get(a)) {
                    throw new Error("Cannot create an instance of " + this.id + " as the type does not allow an attribute '" + a + "'!");
                }
            }
        }
        
        if (attrs['@type']) {
            attrs['@type'].push(this.id);
        } else {
            attrs['@type'] = this.id;
        }
        
        return new this.vie.Entity(attrs, opts);
    };

// ### toString()
// This method returns the id of the type.   
// **Parameters**:  
// *nothing*  
// **Throws**:  
// *nothing*   
// **Returns**:  
// *{string}* : The id of the type.  
// **Example usage**:  
//
//     var x = new vie.Type(...);
//     x.toString() === x.id;
    this.toString = function () {
        return this.id;
    };
};

// ### VIE.Types()
// This is the constructor of a VIE.Types. This is a convenience class
// to store ```VIE.Type``` instances properly.  
// **Parameters**:  
// *nothing*  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.Types}* : A **new** VIE.Types object.  
// **Example usage**:  
//
//     var types = new vie.Types();
VIE.prototype.Types = function () {
        
    this._types = {};
    
// ### add(id, attrs)
// This method adds a `VIE.Type` to the types.  
// **Parameters**:  
// *{string|VIE.Type}* **id** If this is a string, the type is created and directly added.  
// *{string|object}* **attrs** Only used if ```id``` is a string.   
// **Throws**:  
// *{Error}* if a type with the given id already exists a ```VIE.Entity``` instance from this type.  
// **Returns**:  
// *{VIE.Types}* : The instance itself.  
// **Example usage**:  
//
//     var types = new vie.Types();
//     types.add("Person", ["name", "knows"]);
    this.add = function (id, attrs) {
        if (this.get(id)) {
            throw new Error("Type '" + id + "' already registered.");
        } 
        else {
            if (typeof id === "string") {
                var t = new this.vie.Type(id, attrs);
                this._types[t.id] = t;
                return t;
            } else if (id instanceof this.vie.Type) {
            	this._types[id.id] = id;
                return id;
            } else {
                throw new Error("Wrong argument to VIE.Types.add()!");
            }
        }
        return this;
    };
    
// ### addOrOverwrite(id, attrs)
// This method adds or overwrites a `VIE.Type` to the types. This is the same as 
// ``this.remove(id); this.add(id, attrs);``  
// **Parameters**:  
// *{string|VIE.Type}* **id** If this is a string, the type is created and directly added.  
// *{string|object}* **attrs** Only used if ```id``` is a string.   
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.Types}* : The instance itself.  
// **Example usage**:  
//
//     var types = new vie.Types();
//     types.addOrOverwrite("Person", ["name", "knows"]);
    this.addOrOverwrite = function(id, attrs){
        if (this.get(id)) {
            this.remove(id);
        }
        return this.add(id, attrs);
    };
    
// ### get(id)
// This method retrieves a `VIE.Type` from the types by it's id.  
// **Parameters**:  
// *{string|VIE.Type}* **id** The id or the type itself.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.Type}* : The instance of the type or ```undefined```.  
// **Example usage**:  
//
//     var types = new vie.Types();
//     types.addOrOverwrite("Person", ["name", "knows"]);
//     types.get("Person");
    this.get = function (id) {
        if (!id) {
            return undefined;
        }
        if (typeof id === 'string') {
            var lid = this.vie.namespaces.isUri(id) ? id : this.vie.namespaces.uri(id);
            return this._types[lid];
        } else if (id instanceof this.vie.Type) {
            return this.get(id.id);
        }
        return undefined;
    };
    
// ### remove(id)
// This method removes a type of given id from the type. This also
// removes all children if their only parent were this
// type. Furthermore, this removes the link from the
// super- and subtypes.   
// **Parameters**:  
// *{string|VIE.Type}* **id** The id or the type itself.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.Type}* : The removed type.  
// **Example usage**:  
//
//     var types = new vie.Types();
//     types.addOrOverwrite("Person", ["name", "knows"]);
//     types.remove("Person");
    this.remove = function (id) {
        var t = this.get(id);
        /* test whether the type actually exists in VIE
         * and prevents removing *owl:Thing*.
         */
        if (!t) {
            return this;
        }
        if (!t || t.subsumes("owl:Thing")) {
            console.warn("You are not allowed to remove 'owl:Thing'.");
            return this;
        }
        delete this._types[t.id];
        
        var subtypes = t.subtypes.list();
        for (var c = 0; c < subtypes.length; c++) {
            var childObj = subtypes[c];
            if (childObj.supertypes.list().length === 1) {
                /* recursively remove all children 
                   that inherit only from this type */
                this.remove(childObj);
            } else {
                childObj.supertypes.remove(t.id);
            }
        }
        return t;
    };
    
// ### toArray() === list()
// This method returns an array of all types.  
// **Parameters**:  
// *nothing*  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{array}* : An array of ```VIE.Type``` instances.  
// **Example usage**:  
//
//     var types = new vie.Types();
//     types.addOrOverwrite("Person", ["name", "knows"]);
//     types.list();
    this.toArray = this.list = function () {
        var ret = [];
        for (var i in this._types) {
            ret.push(this._types[i]);
        }
        return ret;
    };

// ### sort(types, desc)
// This method sorts an array of types in their order, given by the
// inheritance. This returns a copy and leaves the original array untouched.  
// **Parameters**:  
// *{array|VIE.Type}* **types** The array of ```VIE.Type``` instances or ids of types to be sorted.  
// *{boolean}* **desc** If 'desc' is given and 'true', the array will be sorted 
// in descendant order.  
// *nothing*  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{array}* : A sorted copy of the array.  
// **Example usage**:  
//
//     var types = new vie.Types();
//     types.addOrOverwrite("Person", ["name", "knows"]);
//     types.sort(types.list(), true);
    this.sort = function (types, desc) {
        var self = this;
        types = (jQuery.isArray(types))? types : [ types ];
        desc = (desc)? true : false;
        
        if (types.length === 0) return [];
        var copy = [ types[0] ];
        
        
        for (var x = 1, tlen = types.length; x < tlen; x++) {
            var insert = types[x];
            var insType = self.get(insert);
            if (insType) {
                for (var y = 0; y < copy.length; y++) {
                    if (insType.subsumes(copy[y])) {
                        copy.splice(y,0,insert);
                        break;
                    } else if (y === copy.length - 1) {
                        copy.push(insert);
                    }
                }
            }
        }
        
        //unduplicate
        for (var x = 0; x < copy.length; x++) {
        	if (copy.lastIndexOf(copy[x]) !== x) {
        		copy.splice(x, 1);
        		x--;
        	}
        }
        
        if (!desc) {
            copy.reverse();
        }
        return copy;
    };
};
//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/
//

// ## VIE.Attributes
// Within VIE, we provide special capabilities of handling attributes of types of entites. This
// helps first of all to list all attributes of an entity type, but furthermore fully supports
// inheritance of attributes from the type-class to inherit from.
if (VIE.prototype.Attribute) {
	throw new Error("ERROR: VIE.Attribute is already defined. Please check your VIE installation!");
}
if (VIE.prototype.Attributes) {
	throw new Error("ERROR: VIE.Attributes is already defined. Please check your VIE installation!");
}

// ### VIE.Attribute(id, range, domain)
// This is the constructor of a VIE.Attribute.  
// **Parameters**:  
// *{string}* **id** The id of the attribute.  
// *{string|array}* **range** A string or an array of strings of the target range of 
// the attribute.  
// *{string}* **domain** The domain of the attribute.  
// *{number}* **minCount** The minimal number this attribute can occur. (needs to be >= 0)  
// *{number}* **maxCount** The maximal number this attribute can occur. (needs to be >= minCount)  
// **Throws**:  
// *{Error}* if one of the given paramenters is missing.  
// **Returns**:  
// *{VIE.Attribute}* : A **new** VIE.Attribute object.  
// **Example usage**:  
//
//     var knowsAttr = new vie.Attribute("knows", ["Person"], "Person", 0, 10);
//      // Creates an attribute to describe a *knows*-relationship
//      // between persons. Each person can only have 
VIE.prototype.Attribute = function (id, range, domain, minCount, maxCount) {
    if (id === undefined || typeof id !== 'string') {
        throw new Error("The attribute constructor needs an 'id' of type string! E.g., 'Person'");
    }
    if (range === undefined) {
        throw new Error("The attribute constructor needs 'range'.");
    }
    if (domain === undefined) {
        throw new Error("The attribute constructor needs a 'domain'.");
    }
    
    this._domain = domain;
    
// ### id
// This field stores the id of the attribute's instance.  
// **Parameters**:  
// nothing
// **Throws**:  
// nothing  
// **Returns**:  
// *{string}* : A URI, representing the id of the attribute.  
// **Example usage**:  
//
//     var knowsAttr = new vie.Attribute("knows", ["Person"], "Person");
//     console.log(knowsAttr.id);
//     // --> <http://viejs.org/ns/knows>
    this.id = this.vie.namespaces.isUri(id) ? id : this.vie.namespaces.uri(id);
    
// ### range
// This field stores the ranges of the attribute's instance.  
// **Parameters**:  
// nothing
// **Throws**:  
// nothing  
// **Returns**:  
// *{array}* : An array of strings which represent the types.  
// **Example usage**:  
//
//     var knowsAttr = new vie.Attribute("knows", ["Person"], "Person");
//     console.log(knowsAttr.range);
//      // --> ["Person"]
    this.range = (_.isArray(range))? range : [ range ];
    
// ### min
// This field stores the minimal amount this attribute can occur in the type's instance. The number
// needs to be greater or equal to zero.  
// **Parameters**:  
// nothing
// **Throws**:  
// nothing  
// **Returns**:  
// *{int}* : The minimal amount this attribute can occur.  
// **Example usage**:  
//
//     console.log(person.min);
//      // --> 0
    minCount = minCount ? minCount : 0;
    this.min = (minCount > 0) ? minCount : 0;
    
// ### max
// This field stores the maximal amount this attribute can occur in the type's instance.
// This number cannot be smaller than min  
// **Parameters**:  
// nothing
// **Throws**:  
// nothing  
// **Returns**:  
// *{int}* : The maximal amount this attribute can occur.  
// **Example usage**:  
//
//     console.log(person.max);
//      // --> 1.7976931348623157e+308
    maxCount = maxCount ? maxCount : Number.MAX_VALUE;
    this.max = (maxCount >= this.min)? maxCount : this.min;
// ### applies(range)
// This method checks, whether the current attribute applies in the given range.
// If ```range``` is a string and cannot be transformed into a ```VIE.Type```, 
// this performs only string comparison, if it is a VIE.Type 
// or an ID of a VIE.Type, then inheritance is checked as well.
// **Parameters**:  
// *{string|VIE.Type}* **range** The ```VIE.Type``` (or it's string representation) to be checked. 
// **Throws**:  
// nothing  
// **Returns**:  
// *{boolean}* : ```true``` if the given type applies to this attribute and ```false``` otherwise.  
// **Example usage**:  
//
//     var knowsAttr = new vie.Attribute("knows", ["Person"], "Person");
//     console.log(knowsAttr.applies("Person")); // --> true
//     console.log(knowsAttr.applies("Place")); // --> false
    this.applies = function (range) {
        if (this.vie.types.get(range)) {
            range = this.vie.types.get(range);
        }
        for (var r = 0, len = this.range.length; r < len; r++) {
            var x = this.vie.types.get(this.range[r]);
            if (x === undefined && typeof range === "string") {
                if (range === this.range[r]) {
                    return true;
                }
            }
            else {
                if (range.isof(this.range[r])) {
                    return true;
                }
            }
        }
        return false;
    };
            
};

// ## VIE.Attributes(domain, attrs)
// This is the constructor of a VIE.Attributes. Basically a convenience class
// that represents a list of ```VIE.Attribute```. As attributes are part of a 
// certain ```VIE.Type```, it needs to be passed for inheritance checks.  
// **Parameters**:  
// *{string}* **domain** The domain of the attributes (the type they will be part of).  
// *{string|VIE.Attribute|array}* **attrs** Either a string representation of an attribute,
// a proper instance of ```VIE.Attribute``` or an array of both.  
// *{string}* **domain** The domain of the attribute.  
// **Throws**:  
// *{Error}* if one of the given paramenters is missing.  
// **Returns**:  
// *{VIE.Attribute}* : A **new** VIE.Attribute instance.  
// **Example usage**:  
//
//     var knowsAttr = new vie.Attribute("knows", ["Person"], "Person");
//     var personAttrs = new vie.Attributes("Person", knowsAttr);
VIE.prototype.Attributes = function (domain, attrs) {
    
    this._local = {};
    this._attributes = {};
    
// ### domain
// This field stores the domain of the attributes' instance.  
// **Parameters**:  
// nothing
// **Throws**:  
// nothing  
// **Returns**:  
// *{string}* : The string representation of the domain.  
// **Example usage**:  
//
//     console.log(personAttrs.domain);
//     // --> ["Person"]
    this.domain = domain;
    
// ### add(id, range)
// This method adds a ```VIE.Attribute``` to the attributes instance.
// **Parameters**:  
// *{string|VIE.Attribute}* **id** The string representation of an attribute, or a proper
// instance of a ```VIE.Attribute```.  
// *{string|array}* **range** An array representing the target range of the attribute.  
// *{number}* **mmin** The minimal amount this attribute can appear.  
// instance of a ```VIE.Attribute```.  
// *{number}* **max** The maximal amount this attribute can appear.  
// **Throws**:  
// *{Error}* If an atribute with the given id is already registered.  
// *{Error}* If the ```id``` parameter is not a string, nor a ```VIE.Type``` instance.  
// **Returns**:  
// *{VIE.Attribute}* : The generated or passed attribute.  
// **Example usage**:  
//
//     personAttrs.add("name", "Text", 0, 1);
    this.add = function (id, range, min, max) {
        if (this.domain.locked) {
            throw new Error("The type " + domain.id + " has been imported from an external ontology and must not " + 
                    "be altered! Please create a new type that inherits from the current type!");
        }
        if (this.get(id)) {
            throw new Error("Attribute '" + id + "' already registered for domain " + this.domain.id + "!");
        } 
        else {
            if (typeof id === "string") {
                var a = new this.vie.Attribute(id, range, this.domain, min, max);
                this._local[a.id] = a;
                return a;
            } else if (id instanceof this.vie.Attribute) {
                id.domain = this.domain;
                id.vie = this.vie;
                this._local[id.id] = id;
                return id;
            } else {
                throw new Error("Wrong argument to VIE.Types.add()!");
            }
        }
    };
    
// ### remove(id)
// This method removes a ```VIE.Attribute``` from the attributes instance.
// **Parameters**:  
// *{string|VIE.Attribute}* **id** The string representation of an attribute, or a proper
// instance of a ```VIE.Attribute```.  
// **Throws**:  
// *{Error}* When the attribute is inherited from a parent ```VIE.Type``` and thus cannot be removed.
// **Returns**:  
// *{VIE.Attribute}* : The removed attribute.  
// **Example usage**:  
//
//     personAttrs.remove("knows");
    this.remove = function (id) {
        if (this.domain.locked) {
            throw new Error("The type " + domain.id + " has been imported from an external ontology and must not " + 
                    "be altered!");
        }
        var a = this.get(id);
        if (a.id in this._local) {
            delete this._local[a.id];
            return a;
        }
        throw new Error("The attribute " + id + " is inherited and cannot be removed from the domain " + this.domain.id + "!");
    };
    
// ### get(id)
// This method returns a ```VIE.Attribute``` from the attributes instance by it's id.  
// **Parameters**:  
// *{string|VIE.Attribute}* **id** The string representation of an attribute, or a proper
// instance of a ```VIE.Attribute```.  
// **Throws**:  
// *{Error}* When the method is called with an unknown datatype.  
// **Returns**:  
// *{VIE.Attribute}* : The attribute.  
// **Example usage**:  
//
//     personAttrs.get("knows");
    this.get = function (id) {
        if (typeof id === 'string') {
            var lid = this.vie.namespaces.isUri(id) ? id : this.vie.namespaces.uri(id);
            return this._inherit()._attributes[lid];
        } else if (id instanceof this.vie.Attribute) {
            return this.get(id.id);
        } else {
            throw new Error("Wrong argument in VIE.Attributes.get()");
        }
    };
    
// ### _inherit()
// The private method ```_inherit``` creates a full list of all attributes. This includes
// local attributes as well as inherited attributes from the parents. The ranges of attributes
// with the same id will be merged. This method is called everytime an attribute is requested or
// the list of all attributes. Usually this method should not be invoked outside of the class.  
// **Parameters**:  
// *nothing*  
// instance of a ```VIE.Attribute```.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *nothing*  
// **Example usage**:  
//
//     personAttrs._inherit();
    this._inherit = function () {
        var attributes = jQuery.extend(true, {}, this._local);
        
        var inherited = _.map(this.domain.supertypes.list(),
            function (x) {
               return x.attributes; 
            }
        );

        var add = {};
        var merge = {};
        
        for (var a = 0, ilen = inherited.length; a < ilen; a++) {
            var attrs = inherited[a].list();
            for (var x = 0, alen = attrs.length; x < alen; x++) {
                var id = attrs[x].id;
                if (!(id in attributes)) {
                    if (!(id in add) && !(id in merge)) {
                        add[id] = attrs[x];
                    }
                    else {
                        if (!merge[id]) {
                            merge[id] = {range : [], mins : [], maxs: []};
                        }
                        if (id in add) {
                            merge[id]["range"] = jQuery.merge(merge[id]["range"], add[id].range);
                            merge[id]["mins"] = jQuery.merge(merge[id]["mins"], [ add[id].min ]);
                            merge[id]["maxs"] = jQuery.merge(merge[id]["maxs"], [ add[id].max ]);
                            delete add[id];
                        }
                        merge[id]["range"] = jQuery.merge(merge[id]["range"], attrs[x].range);
                        merge[id]["mins"] = jQuery.merge(merge[id]["mins"], [ attrs[x].min ]);
                        merge[id]["maxs"] = jQuery.merge(merge[id]["maxs"], [ attrs[x].max ]);
                        merge[id]["range"] = _.uniq(merge[id]["range"]);
                        merge[id]["mins"] = _.uniq(merge[id]["mins"]);
                        merge[id]["maxs"] = _.uniq(merge[id]["maxs"]);
                    }
                }
            }
        }
        
        /* adds inherited attributes that do not need to be merged */
        jQuery.extend(attributes, add);
        
        /* merges inherited attributes */
        for (var id in merge) {
            var mranges = merge[id]["range"];
            var mins = merge[id]["mins"];
            var maxs = merge[id]["maxs"];
            var ranges = [];
            //merging ranges
            for (var r = 0, mlen = mranges.length; r < mlen; r++) {
                var p = this.vie.types.get(mranges[r]);
                var isAncestorOf = false;
                if (p) {
                    for (var x = 0; x < mlen; x++) {
                        if (x === r) {
                            continue;
                        }
                        var c = this.vie.types.get(mranges[x]);
                        if (c && c.isof(p)) {
                            isAncestorOf = true;
                            break;
                        }
                    }
                }
                if (!isAncestorOf) {
                    ranges.push(mranges[r]);
                }
            }
            
            var maxMin = _.max(mins);
            var minMax = _.min(maxs);
            
            if (maxMin <= minMax && minMax >= 0 && maxMin >= 0) {
                attributes[id] = new this.vie.Attribute(id, ranges, this, maxMin, minMax);
            } else {
                throw new Error("This inheritance is not allowed because of an invalid minCount/maxCount pair!");
            }
        }

        this._attributes = attributes;
        return this;
    };

// ### toArray() === list()
// This method return an array of ```VIE.Attribute```s from the attributes instance.  
// **Parameters**:  
// *nothing.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{array}* : An array of ```VIE.Attribute```.  
// **Example usage**:  
//
//     personAttrs.list();
    this.toArray = this.list = function (range) {
        var ret = [];
        var attributes = this._inherit()._attributes;
        for (var a in attributes) {
            if (!range || attributes[a].applies(range)) {
                ret.push(attributes[a]);
            }
        }
        return ret;
    };
        
    attrs = _.isArray(attrs) ? attrs : [ attrs ];
    
    for (var a = 0, len = attrs.length; a < len; a++) {
        this.add(attrs[a].id, attrs[a].range, attrs[a].min, attrs[a].max);
    }
};
//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/
if (VIE.prototype.Namespaces) {
    throw new Error("ERROR: VIE.Namespaces is already defined. " + 
        "Please check your VIE installation!");
}

// ## VIE Namespaces
//
// In general, a namespace is a container that provides context for the identifiers.
// Within VIE, namespaces are used to distinguish different ontolgies or vocabularies
// of identifiers, types and attributes. However, because of their verbosity, namespaces
// tend to make their usage pretty circuitous. The ``VIE.Namespaces(...)`` class provides VIE
// with methods to maintain abbreviations (akak **prefixes**) for namespaces in order to
// alleviate their usage. By default, every VIE instance is equipped with a main instance
// of the namespaces in ``myVIE.namespaces``. Furthermore, VIE uses a **base namespace**, 
// which is used if no prefix is given (has an empty prefix).
// In the upcoming sections, we will explain the
// methods to add, access and remove prefixes.



// ## VIE.Namespaces(base, namespaces)
// This is the constructor of a VIE.Namespaces. The constructor initially 
// needs a *base namespace* and can optionally be initialised with an 
// associative array of prefixes and namespaces. The base namespace is used in a way
// that every non-prefixed, non-expanded attribute or type is assumed to be of that 
// namespace. This helps, e.g., in an environment where only one namespace is given.  
// **Parameters**:  
// *{string}* **base** The base namespace.  
// *{object}* **namespaces** Initial namespaces to bootstrap the namespaces. (optional)  
// **Throws**:  
// *{Error}* if the base namespace is missing.  
// **Returns**:  
// *{VIE.Attribute}* : A **new** VIE.Attribute object.  
// **Example usage**:  
//
//     var ns = new myVIE.Namespaces("http://viejs.org/ns/", 
//           {
//            "foaf": "http://xmlns.com/foaf/0.1/"
//           });
VIE.prototype.Namespaces = function (base, namespaces) {
    
    if (!base) {
        throw new Error("Please provide a base namespace!");
    }
    this._base = base;
    
    this._namespaces = (namespaces)? namespaces : {};
    if (typeof this._namespaces !== "object" || _.isArray(this._namespaces)) {
        throw new Error("If you want to initialise VIE namespace prefixes, " + 
            "please provide a proper object!");
    }
};


// ### base(ns)
// This is a **getter** and **setter** for the base
// namespace. If called like ``base();`` it
// returns the actual base namespace as a string. If provided
// with a string, e.g., ``base("http://viejs.org/ns/");``
// it sets the current base namespace and retuns the namespace object
// for the purpose of chaining. If provided with anything except a string,
// it throws an Error.  
// **Parameters**:  
// *{string}* **ns** The namespace to be set. (optional)  
// **Throws**:  
// *{Error}* if the namespace is not of type string.  
// **Returns**:  
// *{string}* : The current base namespace.  
// **Example usage**:  
//
//     var namespaces = new vie.Namespaces("http://base.ns/");
//     console.log(namespaces.base()); // <-- "http://base.ns/"
//     namespaces.base("http://viejs.org/ns/");
//     console.log(namespaces.base()); // <-- "http://viejs.org/ns/"
VIE.prototype.Namespaces.prototype.base = function (ns) {
    if (!ns) { 
        return this._base;
    }
    else if (typeof ns === "string") {
        /* remove another mapping */
        this.removeNamespace(ns);
        this._base = ns;
        return this._base;
    } else {
        throw new Error("Please provide a valid namespace!");
    }
};

// ### add(prefix, namespace)
// This method adds new prefix mappings to the
// current instance. If a prefix or a namespace is already
// present (in order to avoid ambiguities), an Error is thrown. 
// ``prefix`` can also be an object in which case, the method 
// is called sequentially on all elements.  
// **Parameters**:  
// *{string|object}* **prefix** The prefix to be set. If it is an object, the
// method will be applied to all key,value pairs sequentially.  
// *{string}* **namespace** The namespace to be set.  
// **Throws**:  
// *{Error}* If a prefix or a namespace is already
// present (in order to avoid ambiguities).  
// **Returns**:  
// *{VIE.Namespaces}* : The current namespaces instance.  
// **Example usage**:  
//
//     var namespaces = new vie.Namespaces("http://base.ns/");
//     namespaces.add("", "http://...");
//     // is always equal to
//     namespaces.base("http://..."); // <-- setter of base namespace
VIE.prototype.Namespaces.prototype.add = function (prefix, namespace) {
    if (typeof prefix === "object") {
        for (var k1 in prefix) {
            this.add(k1, prefix[k1]);
        }
        return this;
    }
    if (prefix === "") {
        this.base(namespace);
        return this;
    }
    /* checking if we overwrite existing mappings */
    else if (this.contains(prefix) && namespace !== this._namespaces[prefix]) {
        throw new Error("ERROR: Trying to register namespace prefix mapping (" + prefix + "," + namespace + ")!" +
              "There is already a mapping existing: '(" + prefix + "," + this.get(prefix) + ")'!");
    } else {
        jQuery.each(this._namespaces, function (k1,v1) {
            if (v1 === namespace && k1 !== prefix) {
                throw new Error("ERROR: Trying to register namespace prefix mapping (" + prefix + "," + namespace + ")!" +
                      "There is already a mapping existing: '(" + k1 + "," + namespace + ")'!");
            }
        });
    }
    /* if not, just add them */
    this._namespaces[prefix] = namespace;
    return this;
};
    
// ### addOrReplace(prefix, namespace)
// This method adds new prefix mappings to the
// current instance. This will overwrite existing mappings.  
// **Parameters**:  
// *{string|object}* **prefix** The prefix to be set. If it is an object, the
// method will be applied to all key,value pairs sequentially.  
// *{string}* **namespace** The namespace to be set.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.Namespaces}* : The current namespaces instance.  
// **Example usage**:  
//
//     var namespaces = new vie.Namespaces("http://base.ns/");
//     namespaces.addOrReplace("", "http://...");
//     // is always equal to
//     namespaces.base("http://..."); // <-- setter of base namespace
VIE.prototype.Namespaces.prototype.addOrReplace = function (prefix, namespace) {
    if (typeof prefix === "object") {
        for (var k1 in prefix) {
            this.addOrReplace(k1, prefix[k1]);
        }
        return this;
    }
    this.remove(prefix);
    this.removeNamespace(namespace);
    return this.add(prefix, namespace);
};

// ### get(prefix)
// This method retrieves a namespaces, given a prefix. If the
// prefix is the empty string, the base namespace is returned.  
// **Parameters**:  
// *{string}* **prefix** The prefix to be retrieved.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{string|undefined}* : The namespace or ```undefined``` if no namespace could be found.  
// **Example usage**:  
//
//     var namespaces = new vie.Namespaces("http://base.ns/");
//     namespaces.addOrReplace("test", "http://test.ns");
//     console.log(namespaces.get("test")); // <-- "http://test.ns"
VIE.prototype.Namespaces.prototype.get = function (prefix) {
    if (prefix === "") {
        return this.base();
    }
    return this._namespaces[prefix];
};

// ### getPrefix(namespace)
// This method retrieves a prefix, given a namespace.  
// **Parameters**:  
// *{string}* **namespace** The namespace to be retrieved.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{string|undefined}* : The prefix or ```undefined``` if no prefix could be found.  
// **Example usage**:  
//
//     var namespaces = new vie.Namespaces("http://base.ns/");
//     namespaces.addOrReplace("test", "http://test.ns");
//     console.log(namespaces.getPrefix("http://test.ns")); // <-- "test"
VIE.prototype.Namespaces.prototype.getPrefix = function (namespace) {
    var prefix = undefined;
    jQuery.each(this._namespaces, function (k1,v1) {
        if (v1 === namespace) {
            prefix = k1;
        }
    });
    return prefix;
};

// ### contains(prefix)
// This method checks, whether a prefix is stored in the instance.  
// **Parameters**:  
// *{string}* **prefix** The prefix to be checked.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{boolean}* : ```true``` if the prefix could be found, ```false``` otherwise.  
// **Example usage**:  
//
//     var namespaces = new vie.Namespaces("http://base.ns/");
//     namespaces.addOrReplace("test", "http://test.ns");
//     console.log(namespaces.contains("test")); // <-- true
VIE.prototype.Namespaces.prototype.contains = function (prefix) {
    return (prefix in this._namespaces);
};

// ### containsNamespace(namespace)
// This method checks, whether a namespace is stored in the instance.  
// **Parameters**:  
// *{string}* **namespace** The namespace to be checked.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{boolean}* : ```true``` if the namespace could be found, ```false``` otherwise.  
// **Example usage**:  
//
//     var namespaces = new vie.Namespaces("http://base.ns/");
//     namespaces.addOrReplace("test", "http://test.ns");
//     console.log(namespaces.containsNamespace("http://test.ns")); // <-- true
VIE.prototype.Namespaces.prototype.containsNamespace = function (namespace) {
    return this.getPrefix(namespace) !== undefined;
};

// ### update(prefix, namespace)
// This method overwrites the namespace that is stored under the 
// prefix ``prefix`` with the new namespace ``namespace``. 
// If a namespace is already bound to another prefix, an Error is thrown.
// **Parameters**:  
// *{string}* **prefix** The prefix.  
// *{string}* **namespace** The namespace.  
// **Throws**:  
// *{Error}* If a namespace is already bound to another prefix.  
// **Returns**:  
// *{VIE.Namespaces}* : The namespace instance.  
// **Example usage**:  
//
//     ...
VIE.prototype.Namespaces.prototype.update = function (prefix, namespace) {
    this.remove(prefix);
    return this.add(prefix, namespace);
};

// ### updateNamespace(prefix, namespace)
// This method overwrites the prefix that is bound to the 
// namespace ``namespace`` with the new prefix ``prefix``. If another namespace is
// already registered with the given ``prefix``, an Error is thrown.  
// **Parameters**:  
// *{string}* **prefix** The prefix.  
// *{string}* **namespace** The namespace.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.Namespaces}* : The namespace instance.  
// **Example usage**:  
//
//     var namespaces = new vie.Namespaces("http://base.ns/");
//     namespaces.add("test", "http://test.ns");
//     namespaces.updateNamespace("test2", "http://test.ns");
//     namespaces.get("test2"); // <-- "http://test.ns"
VIE.prototype.Namespaces.prototype.updateNamespace = function (prefix, namespace) {
    this.removeNamespace(prefix);
    return this.add(prefix, namespace);
};

// ### remove(prefix)
// This method removes the namespace that is stored under the prefix ``prefix``.  
// **Parameters**:  
// *{string}* **prefix** The prefix to be removed.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.Namespaces}* : The namespace instance.   
// **Example usage**:  
//
//     var namespaces = new vie.Namespaces("http://base.ns/");
//     namespaces.add("test", "http://test.ns");
//     namespaces.get("test"); // <-- "http://test.ns"
//     namespaces.remove("test");
//     namespaces.get("test"); // <-- undefined
VIE.prototype.Namespaces.prototype.remove = function (prefix) {
    if (prefix) {
        delete this._namespaces[prefix];
    }
    return this;
};

// ### removeNamespace(namespace)
// This method removes removes the namespace ``namespace`` from the instance.  
// **Parameters**:  
// *{string}* **namespace** The namespace to be removed.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.Namespaces}* : The namespace instance.   
// **Example usage**:  
//
//     var namespaces = new vie.Namespaces("http://base.ns/");
//     namespaces.add("test", "http://test.ns");
//     namespaces.get("test"); // <-- "http://test.ns"
//     namespaces.removeNamespace("http://test.ns");
//     namespaces.get("test"); // <-- undefined
VIE.prototype.Namespaces.prototype.removeNamespace = function (namespace) {
    var prefix = this.getPrefix(namespace);
    if (prefix) {
        delete this._namespaces[prefix];
    }
    return this;
};

// ### toObj()
// This method serializes the namespace instance into an associative
// array representation. The base namespace is given an empty
// string as key.  
// **Parameters**:  
// *{boolean}* **omitBase** If set to ```true``` this omits the baseNamespace.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{object}* : A serialization of the namespaces as an object.  
// **Example usage**:  
//
//     var namespaces = new vie.Namespaces("http://base.ns/");
//     namespaces.add("test", "http://test.ns");
//     console.log(namespaces.toObj()); 
//     // <-- {""    : "http://base.ns/", 
//             "test": "http://test.ns"}
//     console.log(namespaces.toObj(true)); 
//     // <-- {"test": "http://test.ns"}
VIE.prototype.Namespaces.prototype.toObj = function (omitBase) {
    if (omitBase) {
        return jQuery.extend({}, this._namespaces);
    }
    return jQuery.extend({'' : this._base}, this._namespaces);
};

// ### curie(uri, safe)
// This method converts a given 
// URI into a CURIE (or SCURIE), based on the given ```VIE.Namespaces``` object.
// If the given uri is already a URI, it is left untouched and directly returned.
// If no prefix could be found, an ```Error``` is thrown.  
// **Parameters**:  
// *{string}* **uri** The URI to be transformed.  
// *{boolean}* **safe** A flag whether to generate CURIEs or SCURIEs.  
// **Throws**:  
// *{Error}* If no prefix could be found in the passed namespaces.  
// **Returns**:  
// *{string}* The CURIE or SCURIE.  
// **Example usage**: 
//
//     var ns = new myVIE.Namespaces(
//           "http://viejs.org/ns/", 
//           { "dbp": "http://dbpedia.org/ontology/" }
//     );
//     var uri = "<http://dbpedia.org/ontology/Person>";
//     ns.curie(uri, false); // --> dbp:Person
//     ns.curie(uri, true); // --> [dbp:Person]
VIE.prototype.Namespaces.prototype.curie = function(uri, safe){
    return VIE.Util.toCurie(uri, safe, this);
};

// ### isCurie(curie)
// This method checks, whether 
// the given string is a CURIE and returns ```true``` if so and ```false```otherwise.  
// **Parameters**:  
// *{string}* **curie** The CURIE (or SCURIE) to be checked.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{boolean}* ```true``` if the given curie is a CURIE or SCURIE and ```false``` otherwise.  
// **Example usage**: 
//
//     var ns = new myVIE.Namespaces(
//           "http://viejs.org/ns/", 
//           { "dbp": "http://dbpedia.org/ontology/" }
//     );
//     var uri = "<http://dbpedia.org/ontology/Person>";
//     var curie = "dbp:Person";
//     var scurie = "[dbp:Person]";
//     var text = "This is some text.";
//     ns.isCurie(uri);    // --> false
//     ns.isCurie(curie);  // --> true
//     ns.isCurie(scurie); // --> true
//     ns.isCurie(text);   // --> false
VIE.prototype.Namespaces.prototype.isCurie = function (something) {
    return VIE.Util.isCurie(something, this);
};
    
// ### uri(curie)
// This method converts a 
// given CURIE (or save CURIE) into a URI, based on the given ```VIE.Namespaces``` object.  
// **Parameters**:  
// *{string}* **curie** The CURIE to be transformed.  
// **Throws**:  
// *{Error}* If no URI could be assembled.  
// **Returns**:  
// *{string}* : A string, representing the URI.  
// **Example usage**: 
//
//     var ns = new myVIE.Namespaces(
//           "http://viejs.org/ns/", 
//           { "dbp": "http://dbpedia.org/ontology/" }
//     );
//     var curie = "dbp:Person";
//     var scurie = "[dbp:Person]";
//     ns.uri(curie); 
//          --> <http://dbpedia.org/ontology/Person>
//     ns.uri(scurie);
//          --> <http://dbpedia.org/ontology/Person>
VIE.prototype.Namespaces.prototype.uri = function (curie) {
    return VIE.Util.toUri(curie, this);
};

// ### isUri(something)
// This method checks, whether the given string is a URI.  
// **Parameters**:  
// *{string}* **something** : The string to be checked.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{boolean}* : ```true``` if the string is a URI, ```false``` otherwise.  
// **Example usage**: 
//
//     var namespaces = new vie.Namespaces("http://base.ns/");
//     namespaces.addOrReplace("test", "http://test.ns");
//     var uri = "<http://test.ns/Person>";
//     var curie = "test:Person";
//     namespaces.isUri(uri);   // --> true
//     namespaces.isUri(curie); // --> false
VIE.prototype.Namespaces.prototype.isUri = VIE.Util.isUri;
//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// Classic VIE API bindings to new VIE
VIE.prototype.ClassicRDFa = function(vie) {
    this.vie = vie;
};

VIE.prototype.ClassicRDFa.prototype = {
    readEntities: function(selector) {
        var jsonEntities = [];
        var entities = this.vie.RDFaEntities.getInstances(selector);
        _.each(entities, function(entity) {
            jsonEntities.push(entity.toJSONLD());
        });
        return jsonEntities;
    },

    findPredicateElements: function(subject, element, allowNestedPredicates) {
        return this.vie.services.rdfa.findPredicateElements(subject, element, allowNestedPredicates);
    },

    getPredicate: function(element) {
        return this.vie.services.rdfa.getElementPredicate(element);
    },

    getSubject: function(element) {
        return this.vie.services.rdfa.getElementSubject(element);
    }
};

VIE.prototype.ClassicRDFaEntities = function(vie) {
    this.vie = vie;
};

VIE.prototype.ClassicRDFaEntities.prototype = {
    getInstances: function(selector) {
        if (!this.vie.services.rdfa) {
            this.vie.use(new this.vie.RdfaService());
        }
        var foundEntities = null;
        var loaded = false;
        this.vie.load({element: selector}).from('rdfa').execute().done(function(entities) {
            foundEntities = entities;
            loaded = true;
        });

        while (!loaded) {
        }

        return foundEntities;
    },

    getInstance: function(selector) {
        var instances = this.getInstances(selector);
        if (instances && instances.length) {
            return instances.pop();
        }
        return null;
    }
};

VIE.prototype.ClassicEntityManager = function(vie) {
    this.vie = vie;
    this.entities = this.vie.entities;
};

VIE.prototype.ClassicEntityManager.prototype = {
    getBySubject: function(subject) {
        return this.vie.entities.get(subject);
    },

    getByJSONLD: function(json) {
        if (typeof json === 'string') {
            try {
                json = jQuery.parseJSON(json);
            } catch (e) {
                return null;
            }
        }
        return this.vie.entities.addOrUpdate(json);
    },

    initializeCollection: function() {
        return;
    }
};
//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - DBPedia service
// The DBPedia service allows a VIE developer to directly query
// the DBPedia database for entities and their properties. Obviously,
// the service does not allow for saving, removing or analyzing methods.
(function(){

// ## VIE.DBPediaService(options)
// This is the constructor to instantiate a new service to collect
// properties of an entity from <a href="http://dbpedia.org">DBPedia</a>.  
// **Parameters**:  
// *{object}* **options** Optional set of fields, ```namespaces```, ```rules```, or ```name```.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.DBPediaService}* : A **new** VIE.DBPediaService instance.  
// **Example usage**:  
//
//     var dbpService = new vie.DBPediaService({<some-configuration>});
VIE.prototype.DBPediaService = function (options) {
    var defaults = {
        /* the default name of this service */
        name : 'dbpedia',
        /* default namespaces that are shipped with this service */
        namespaces : {
            owl    : "http://www.w3.org/2002/07/owl#",
            yago   : "http://dbpedia.org/class/yago/",
            foaf: 'http://xmlns.com/foaf/0.1/',
            georss: "http://www.georss.org/georss/",
            geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
            rdfs: "http://www.w3.org/2000/01/rdf-schema#",
            rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            dbpedia: "http://dbpedia.org/ontology/",
            dbprop : "http://dbpedia.org/property/",
            dcelements : "http://purl.org/dc/elements/1.1/"
        },
        /* default rules that are shipped with this service */
        rules : []
    };
    /* the options are merged with the default options */
    this.options = jQuery.extend(true, defaults, options ? options : {});

    this.vie = null; /* this.vie will be set via VIE.use(); */
    /* overwrite options.name if you want to set another name */
    this.name = this.options.name;
    
    /* basic setup for the ajax connection */
    jQuery.ajaxSetup({
        converters: {"text application/rdf+json": function(s){return JSON.parse(s);}},
        timeout: 60000 /* 60 seconds timeout */
    });
};

VIE.prototype.DBPediaService.prototype = {
    
// ### init()
// This method initializes certain properties of the service and is called
// via ```VIE.use()```.  
// **Parameters**:  
// *nothing*  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.DBPediaService}* : The VIE.DBPediaService instance itself.  
// **Example usage**:  
//
//     var dbpService = new vie.DBPediaService({<some-configuration>});
//     dbpService.init();
    init: function() {

        for (var key in this.options.namespaces) {
            var val = this.options.namespaces[key];
            this.vie.namespaces.add(key, val);
        }
        
        this.rules = jQuery.extend([], VIE.Util.transformationRules(this));
        this.rules = jQuery.merge(this.rules, (this.options.rules) ? this.options.rules : []);
        
        this.connector = new this.vie.DBPediaConnector(this.options);
        
        return this;
    },

// ### load(loadable)
// This method loads the entity that is stored within the loadable into VIE.
// You can also query for multiple queries by setting ```entities``` with
// an array of entities.  
// **Parameters**:  
// *{VIE.Loadable}* **lodable** The loadable.  
// **Throws**:  
// *{Error}* if an invalid VIE.Loadable is passed.  
// **Returns**:  
// *{VIE.DBPediaService}* : The VIE.DBPediaService instance itself.  
// **Example usage**:  
//
//  var dbpService = new vie.DBPediaService({<some-configuration>});
//  dbpService.load(new vie.Loadable({entity : "<http://...>"}));
//    OR
//  var dbpService = new vie.DBPediaService({<some-configuration>});
//  dbpService.load(new vie.Loadable({entities : ["<http://...>", "<http://...>"]}));
    load: function(loadable){
        var service = this;
        
        var correct = loadable instanceof this.vie.Loadable;
        if (!correct) {
            throw new Error("Invalid Loadable passed");
        }
        
        var success = function (results) {
            results = (typeof results === "string")? JSON.parse(results) : results;
            _.defer(function() {
                try {
                    var entities = VIE.Util.rdf2Entities(service, results);
                    entities = (_.isArray(entities))? entities : [ entities ];
                    for (var e = 0; e < entities.length; e++) {
                    	entities[e].set("DBPediaServiceLoad", VIE.Util.xsdDateTime(new Date()));
                    }
                    var retCollection = new service.vie.Collection(entities);
                    loadable.resolve(retCollection);
                } catch (e) {
                    loadable.reject(e);
                }
            });
        };
        
        var error = function (e) {
            loadable.reject(e);
        };
        
        var entities = (loadable.options.entity)? loadable.options.entity : loadable.options.entities;
        
        if (!entities) {
            loadable.reject([]);
        } else {
        	entities = (_.isArray(entities))? entities : [ entities ];
        	var tmpEntities = [];
        	for (var e = 0; e < entities.length; e++) {
        		var tmpEnt = (typeof entities[e] === "string")? entities[e] : entities[e].id;
        		tmpEntities.push(tmpEnt);
        	}
                        
            this.connector.load(tmpEntities, success, error);
        }
        return this;
    }
};

// ## VIE.DBPediaConnector(options)
// The DBPediaConnector is the connection between the DBPedia service
// and the backend service.  
// **Parameters**:  
// *{object}* **options** The options.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.DBPediaConnector}* : The **new** VIE.DBPediaConnector instance.  
// **Example usage**:  
//
//     var dbpConn = new vie.DBPediaConnector({<some-configuration>});
VIE.prototype.DBPediaConnector = function (options) {
    this.options = options;
    this.baseUrl = "http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&timeout=0";
};

VIE.prototype.DBPediaConnector.prototype = {

// ### load(uri, success, error, options)
// This method loads all properties from an entity and returns the result by the success callback.  
// **Parameters**:  
// *{string|array}* **uri** The URI of the entity to be loaded or an array of URIs.  
// *{function}* **success** The success callback.  
// *{function}* **error** The error callback.  
// *{object}* **options** Options, like the ```format```.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.DBPediaConnector}* : The VIE.DBPediaConnector instance itself.  
// **Example usage**:  
//
//     var dbpConn = new vie.DBPediaConnector(opts);
//     dbpConn.load("<http://dbpedia.org/resource/Barack_Obama>",
//                 function (res) { ... },
//                 function (err) { ... });
    load: function (uri, success, error, options) {
        if (!options) { options = {}; }
        
        var url = this.baseUrl + 
        "&format=" + encodeURIComponent("application/rdf+json") + 
        "&query=";
        
        if (_.isArray(uri)) {
        	var construct = "";
        	var where = "";
        	for (var u = 0; u < uri.length; u++) {
        		var subject = (/^<.+>$/.test(uri[u]))? uri[u] : '<' + uri[u] + '>';
        		if (u > 0) {
        			construct += " .";
        			where += " UNION ";
        		}
        		construct += " " + subject + " ?prop" + u + " ?val" + u;
        		where     += " { " + subject + " ?prop" + u + " ?val" + u + " }";
        	}
        	url += encodeURIComponent("CONSTRUCT {" + construct + " } WHERE {" + where + " }");
        } else {
	        uri = (/^<.+>$/.test(uri))? uri : '<' + uri + '>';
	        url += encodeURIComponent("CONSTRUCT { " + uri + " ?prop ?val } WHERE { " + uri + " ?prop ?val }");
        }
        var format = options.format || "application/rdf+json";

        if (typeof exports !== "undefined" && typeof process !== "undefined") {
            /* We're on Node.js, don't use jQuery.ajax */
            return this._loadNode(url, success, error, options, format);
        }

        jQuery.ajax({
            success: function(response){
                success(response);
            },
            error: error,
            type: "GET",
            url: url,
            accepts: {"application/rdf+json": "application/rdf+json"}
        });
        
        return this;
    },

    _loadNode: function (uri, success, error, options, format) {
        var request = require('request');
        var r = request({
            method: "GET",
            uri: uri,
            headers: {
                Accept: format
            }
        }, function(err, response, body) {
            if (response.statusCode !== 200) {
              return error(body);
            }
            success(JSON.parse(body));
        });
        r.end();
        
        return this;
    }
};
})();

//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - OpenCalaisService service
// The OpenCalaisService ...
(function(){

// ## VIE.OpenCalaisService(options)
// This is the constructor to instantiate a new service to collect
// properties of an entity from OpenCalais.  
// **Parameters**:  
// *{object}* **options** Optional set of fields, ```namespaces```, ```rules```, ```url```, or ```name```.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.OpenCalaisService}* : A **new** VIE.OpenCalaisService instance.  
// **Example usage**:  
//
//     var service = new vie.OpenCalaisService({<some-configuration>});
VIE.prototype.OpenCalaisService = function(options) {
    var defaults = {
        /* the default name of this service */
        name : 'opencalais',
        /* you can pass an array of URLs which are then tried sequentially */
        url: ["http://api.opencalais.com/enlighten/rest/"],
        timeout : 60000, /* 60 seconds timeout */
        namespaces : {
        	opencalaisc:  "http://s.opencalais.com/1/pred/",
        	opencalaiscr: "http://s.opencalais.com/1/type/er/",
        	opencalaiscm: "http://s.opencalais.com/1/type/em/e/",
			opencalaiscs: "http://s.opencalais.com/1/type/sys/"
        },
        /* default rules that are shipped with this service */
        rules : [
			{
                'left' : [
                    '?instance a opencalaiscs:InstanceInfo',
                    '?instance opencalaisc:subject ?object',
					'?entity opencalaisc:subject ?object',
					'?entity opencalaisc:name ?name'
                ],
                'right' : [
                    '?entity opencalaisc:hasTextAnnotation ?instance',
					'?entity rdfs:label ?name'
                ]
            },
			{
                'left' : [
                    '?subject a opencalaiscm:Person',
                 ],
                 'right':[
					'?subject a dbpedia:Person'
				 ]
             },
			 
			 {
                'left' : [
                    '?subject a opencalaiscm:Organization',
                 ],
                 'right': [
					'?subject a dbpedia:Organisation'
				 ]
             },
			 
			 {
                'left' : [
                    '?subject a opencalaiscr:Geo/City',
                 ],
                 'right': [
					'?subject a dbpedia:City'
				 ]
             },

			 {
                'left' : [
                    '?subject a opencalaiscr:Geo/Country',
                 ],
                 'right': [
					'?subject a dbpedia:Country'
				 ]
             }
		]
    };
    /* the options are merged with the default options */
    this.options = jQuery.extend(true, defaults, options ? options : {});

    this.vie = null; /* will be set via VIE.use(); */
    /* overwrite options.name if you want to set another name */
    this.name = this.options.name;
    
    /* basic setup for the ajax connection */
    jQuery.ajaxSetup({
        converters: {"text application/rdf+json": function(s){return JSON.parse(s);}},
        timeout: this.options.timeout
    });
};

VIE.prototype.OpenCalaisService.prototype = {
    
// ### init()
// This method initializes certain properties of the service and is called
// via ```VIE.use()```.  
// **Parameters**:  
// *nothing*  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.StanbolService}* : The VIE.StanbolService instance itself.  
// **Example usage**:  
//
//     var service = new vie.OpenCalaisService({<some-configuration>});
//     service.init();
    init: function(){

        for (var key in this.options.namespaces) {
            var val = this.options.namespaces[key];
            this.vie.namespaces.add(key, val);
        }
        
        this.rules = jQuery.extend([], VIE.Util.transformationRules(this));
        this.rules = jQuery.merge(this.rules, (this.options.rules) ? this.options.rules : []);
        //this.rules = [];
        this.connector = new this.vie.OpenCalaisConnector(this.options);
    },

// ### analyze(analyzable)
// This method extracts text from the jQuery element and sends it to OpenCalais for analysis.  
// **Parameters**:  
// *{VIE.Analyzable}* **analyzable** The analyzable.  
// **Throws**:  
// *{Error}* if an invalid VIE.Findable is passed.  
// **Returns**:  
// *{VIE.OpenCalaisService}* : The VIE.OpenCalaisService instance itself.  
// **Example usage**:  
//
//     var service = new vie.OpenCalaisService({<some-configuration>});
//     service.analyzable(
//         new vie.Analyzable({element : jQuery("#foo")})
//     );
    analyze: function(analyzable) {
        var service = this;

        var correct = analyzable instanceof this.vie.Analyzable;
        if (!correct) {throw "Invalid Analyzable passed";}

        var element = analyzable.options.element ? analyzable.options.element : jQuery('body');

        var text = service._extractText(element);

        if (text.length > 0) {
            /* query enhancer with extracted text */
            var success = function (results) {
                _.defer(function(){
                    var entities = VIE.Util.rdf2Entities(service, results);
                    analyzable.resolve(entities);
                });
            };
            var error = function (e) {
                analyzable.reject(e);
            };

            this.connector.analyze(text, success, error);

        } else {
            console.warn("No text found in element.");
            analyzable.resolve([]);
        }

    },

    // this private method extracts text from a jQuery element
    _extractText: function (element) {
        return jQuery(element).html();
    }
};

// ## VIE.OpenCalaisConnector(options)
// The OpenCalaisConnector is the connection between the VIE OpenCalais service
// and the actual ajax calls.  
// **Parameters**:  
// *{object}* **options** The options.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.OpenCalaisService}* : The **new** VIE.OpenCalaisService instance.  
// **Example usage**:  
//
//     var conn = new vie.OpenCalaisConnector({<some-configuration>});
VIE.prototype.OpenCalaisConnector = function (options) {
    this.options = options;
    this.baseUrl = (_.isArray(options.url))? options.url : [ options.url ];
    this.enhancerUrlPrefix = "/";
};

VIE.prototype.OpenCalaisConnector.prototype = {

// ### analyze(text, success, error, options)
// This method sends the given text to OpenCalais returns the result by the success callback.  
// **Parameters**:  
// *{string}* **text** The text to be analyzed.  
// *{function}* **success** The success callback.  
// *{function}* **error** The error callback.  
// *{object}* **options** Options, like the ```format```.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.OpenCalaisConnector}* : The VIE.OpenCalaisConnector instance itself.  
// **Example usage**:  
//
//     var conn = new vie.OpenCalaisConnector(opts);
//     conn.analyze("This is some text.",
//                 function (res) { ... },
//                 function (err) { ... });
    analyze: function(text, success, error, options) {
        if (!options) { options = { urlIndex : 0}; }
        if (options.urlIndex >= this.baseUrl.length) {
            error("Could not connect to the given OpenCalais endpoints! Please check for their setup!");
            return;
        }
        
        var enhancerUrl = this.baseUrl[options.urlIndex].replace(/\/$/, '');
        enhancerUrl += this.enhancerUrlPrefix;
        
        var format = options.format || "application/rdf+json";
        
        var retryErrorCb = function (c, t, s, e, o) {
            /* in case a OpenCalais backend is not responding and
             * multiple URLs have been registered
             */
            return  function () {
                console.error("OpenCalais connection error", arguments);
                c.analyze(t, s, e, _.extend(o, {urlIndex : o.urlIndex+1}));
            };
        }(this, text, success, error, options);
        
        var data = this._prepareData(text);

        if (typeof exports !== "undefined" && typeof process !== "undefined") {
            /* We're on Node.js, don't use jQuery.ajax */
            return this._analyzeNode(enhancerUrl, data, success, retryErrorCb, options, format);
        }

        jQuery.ajax({
            success: function(a, b, c){
            	var responseData = c.responseText.replace(/<!--[\s\S]*?-->/g, '');
            	success(responseData);
            },
            error: retryErrorCb,
            type: "POST",
            url: enhancerUrl,
            data: data,
            dataType: "text"
        });
    },

    _analyzeNode: function(url, text, success, errorCB, options, format) {
        var request = require('request');
        var r = request({
            method: "POST",
            uri: url,
            body: text,
            headers: {
                Accept: format
            }
        }, function(error, response, body) {
            try {
                success({results: JSON.parse(body)});
            } catch (e) {
                errorCB(e);
            }
        });
        r.end();
    },
    
    _prepareData : function (text) {
    	return {
    		licenseID: this.options.api_key,
            calculateRelevanceScore: "true",
            enableMetadataType: "GenericRelations,SocialTags",
            contentType: "text/html",
            outputFormat : "Application/JSON",
            content: text,
			docRDFaccessible: "true"
            // for more options check http://developer.opencalais.com/docs/suggest/
        };
    }
};
})();


(function(){
	
	VIE.prototype.RdfaRdfQueryService = function(options) {
		var defaults = {
	        name : 'rdfardfquery',
	        namespaces : {},
	        rules : []
	    };
	    /* the options are merged with the default options */
	    this.options = jQuery.extend(true, defaults, options ? options : {});

	    this.views = [],

	    this.vie = null; /* will be set via VIE.use(); */
	    /* overwrite options.name if you want to set another name */
	    this.name = this.options.name;
};

VIE.prototype.RdfaRdfQueryService.prototype = {

    init: function(){

        for (var key in this.options.namespaces) {
            var val = this.options.namespaces[key];
            this.vie.namespaces.add(key, val);
        }
        
        this.rules = jQuery.extend([], VIE.Util.transformationRules(this));
        this.rules = jQuery.merge(this.rules, (this.options.rules) ? this.options.rules : []);
    },
	    
    analyze: function(analyzable) {
        // in a certain way, analyze is the same as load
        return this.load(analyzable);
    },
        
    load : function(loadable) {
        var service = this;
        var correct = loadable instanceof this.vie.Loadable || loadable instanceof this.vie.Analyzable;
        if (!correct) {
            throw new Error("Invalid Loadable/Analyzable passed");
        }
        
        var element = loadable.options.element ? loadable.options.element : jQuery(document);
        try {
            var rdf = jQuery(element).find("[about],[typeof]").rdfa();
            
            jQuery.each(jQuery(element).xmlns(), function(prefix, ns){
                service.vie.namespaces.addOrReplace(prefix, ns.toString());
            });
            
            var entities = VIE.Util.rdf2Entities(this, rdf);
            
            loadable.resolve(entities);
        } catch (e) {
            loadable.reject(e);
        }
    },

    save : function(savable) {
        var correct = savable instanceof this.vie.Savable;
        if (!correct) {
            savable.reject("Invalid Savable passed");
        }
    
        if (!savable.options.element) {
            savable.reject("Unable to write entity to RDFa, no element given");
        }
    
        if (!savable.options.entity) {
            savable.reject("Unable to write to RDFa, no entity given");
        }
        
        if (!jQuery.rdf) {
            savable.reject("No rdfQuery found.");
        }
        var entity = savable.options.entity;
        
        var triples = [];
        var type = entity.get('@type');
        type = (jQuery.isArray(type))? type[0] : type;
        type = type.id;
        triples.push(entity.getSubject() + " a " + type);
        //TODO: add all attributes!
        jQuery(savable.options.element).rdfa(triples);
    
        savable.resolve();
    }
    
};

})();//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - RdfaService service
// The RdfaService service allows ...

(function(){

// ## VIE.RdfaService(options)
// This is the constructor to instantiate a new service.  
// **Parameters**:  
// *{object}* **options** Optional set of fields, ```namespaces```, ```rules```, ```url```, or ```name```.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.RdfaService}* : A **new** VIE.RdfaService instance.  
// **Example usage**:  
//
//     var rdfaService = new vie.RdfaService({<some-configuration>});
VIE.prototype.RdfaService = function(options) {
    var defaults = {
        name : 'rdfa',
        namespaces : {},
        subjectSelector : "[about],[typeof],[src],html",
        predicateSelector : "[property],[rel]",
        /* default rules that are shipped with this service */
        rules : []
    };
    /* the options are merged with the default options */
    this.options = jQuery.extend(true, defaults, options ? options : {});

    this.views = [],

    this.vie = null; /* will be set via VIE.use(); */
    /* overwrite options.name if you want to set another name */
    this.name = this.options.name;
};

VIE.prototype.RdfaService.prototype = {
    
// ### init()
// This method initializes certain properties of the service and is called
// via ```VIE.use()```.  
// **Parameters**:  
// *nothing*  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.RdfaService}* : The VIE.RdfaService instance itself.  
// **Example usage**:  
//
//     var rdfaService = new vie.RdfaService({<some-configuration>});
//     rdfaService.init();
    init: function(){

        for (var key in this.options.namespaces) {
            var val = this.options.namespaces[key];
            this.vie.namespaces.add(key, val);
        }
        
        this.rules = jQuery.merge([], VIE.Util.transformationRules(this));
        this.rules = jQuery.merge(this.rules, (this.options.rules) ? this.options.rules : []);
    },
    
    analyze: function(analyzable) {
        // in a certain way, analyze is the same as load
        return this.load(analyzable);
    },
        
    load : function(loadable) {
        var service = this;
        var correct = loadable instanceof this.vie.Loadable || loadable instanceof this.vie.Analyzable;
        if (!correct) {
            throw new Error("Invalid Loadable/Analyzable passed");
        }

        var element;
        if (!loadable.options.element) {
            if (typeof document === 'undefined') { 
                return loadable.resolve([]);
            }
            element = jQuery(document);
        } else {
            element = loadable.options.element;
        }
    
        var ns = this.xmlns(element);
        for (var prefix in ns) {
            this.vie.namespaces.addOrReplace(prefix, ns[prefix]);
        }
        var entities = [];
        var entityElements = jQuery(this.options.subjectSelector, element).add(jQuery(element).filter(this.options.subjectSelector)).each(function() {
            var entity = service._readEntity(jQuery(this));
            if (entity) {
                entities.push(entity);
            }
        });
        loadable.resolve(entities);
    },

    save : function(savable) {
        var correct = savable instanceof this.vie.Savable;
        if (!correct) {
            throw "Invalid Savable passed";
        }
    
        if (!savable.options.element) {
            // FIXME: we could find element based on subject
            throw "Unable to write entity to RDFa, no element given";
        }
    
        if (!savable.options.entity) {
            throw "Unable to write to RDFa, no entity given";
        }
    
        this._writeEntity(savable.options.entity, savable.options.element);
        savable.resolve();
    },
    
    _readEntity : function(element) {
        var subject = this.getElementSubject(element);
        var type = this._getElementType(element);
        var predicate, value, valueCollection;
        var entity = this._readEntityPredicates(subject, element, false);
        if (jQuery.isEmptyObject(entity)) {
            return null;
        }
        var vie = this.vie;
        for (predicate in entity) {
            value = entity[predicate];
            if (!_.isArray(value)) {
                continue;
            }
            valueCollection = new this.vie.Collection();
            valueCollection.vie = this.vie;
            _.each(value, function(valueItem) {
                var linkedEntity = vie.entities.addOrUpdate({'@subject': valueItem});
                valueCollection.addOrUpdate(linkedEntity);
            });
            entity[predicate] = valueCollection;
        }
        entity['@subject'] = subject;
        if (type) {
            entity['@type'] = type;
        }
        var entityInstance = new this.vie.Entity(entity);
        entityInstance = this.vie.entities.addOrUpdate(entityInstance, {
          updateOptions: {
            silent: true
          }
        });
        this._registerEntityView(entityInstance, element);
        return entityInstance;
    },
    
    _writeEntity : function(entity, element) {
        var service = this;
        this.findPredicateElements(this.getElementSubject(element), element, true).each(function() {
            var predicateElement = jQuery(this);
            var predicate = service.getElementPredicate(predicateElement);
            if (!entity.has(predicate)) {
                return true;
            }
    
            var value = entity.get(predicate);
            if (value && value.isCollection) {
                // Handled by CollectionViews separately
                return true;
            }
            if (value === service.readElementValue(predicate, predicateElement)) {
                return true;
            }
            service.writeElementValue(predicate, predicateElement, value);
        });
        return true;
    },
    
    _getViewForElement : function(element, collectionView) {
        var viewInstance;
        jQuery.each(this.views, function() {
            if (jQuery(this.el).get(0) === element.get(0)) {
                if (collectionView && !this.template) {
                    return true;
                }
                viewInstance = this;
                return false;
            }
        });
        return viewInstance;
    },
    
    _registerEntityView : function(entity, element) {
        if (!element.length) {
            return;
        }

        var service = this;
        var viewInstance = this._getViewForElement(element);
        if (viewInstance) {
            return viewInstance;
        }
    
        viewInstance = new this.vie.view.Entity({
            model: entity,
            el: element,
            tagName: element.get(0).nodeName,
            vie: this.vie,
            service: this.name
        });
        this.views.push(viewInstance);
    
        // Find collection elements and create collection views for them
        _.each(entity.attributes, function(value, predicate) {
            var attributeValue = entity.fromReference(entity.get(predicate));
            if (attributeValue && attributeValue.isCollection) {
                jQuery.each(service.getElementByPredicate(predicate, element), function() {
                    service._registerCollectionView(attributeValue, jQuery(this), entity);
                });
            }
        });
        return viewInstance;
    },
    
    _registerCollectionView : function(collection, element, entity) {
        var viewInstance = this._getViewForElement(element, true);
        if (viewInstance) {
            return viewInstance;
        }
    
        var entityTemplate = element.children(':first-child');
    
        viewInstance = new this.vie.view.Collection({
            owner: entity,
            collection: collection,
            model: collection.model,
            el: element,
            template: entityTemplate,
            service: this,
            tagName: element.get(0).nodeName
        });
        this.views.push(viewInstance);
        return viewInstance;
    },
    
    _getElementType : function (element) {
        var type;
        if (jQuery(element).attr('typeof') !== this.options.attributeExistenceComparator) {
            type = jQuery(element).attr('typeof');
            if (type.indexOf("://") !== -1) {
                return "<" + type + ">";
            } else {
                return type;
            }
        }
        return null;
    },
    
    getElementSubject : function(element) {
        var service = this;
        if (typeof document !== 'undefined') { 
            if (element === document) {
                return document.baseURI;
            }
        }
        var subject = undefined;
        var matched = null;
        jQuery(element).closest(this.options.subjectSelector).each(function() {
            matched = this;
            if (jQuery(this).attr('about') !== service.options.attributeExistenceComparator) {
                subject = jQuery(this).attr('about');
                return true;
            }
            if (jQuery(this).attr('src') !== service.options.attributeExistenceComparator) {
                subject = jQuery(this).attr('src');
                return true;
            }
            if (jQuery(this).attr('typeof') !== service.options.attributeExistenceComparator) {
                return true;
            }
            // We also handle baseURL outside browser context by manually
            // looking for the `<base>` element inside HTML head.
            if (jQuery(this).get(0).nodeName === 'HTML') {
                jQuery('base', this).each(function() {
                    subject = jQuery(this).attr('href');
                });
            }
        });

        if (!subject) {
            if (matched === element) {
                // Workaround for https://github.com/assaf/zombie/issues/235
                return service.getElementSubject(jQuery(element).parent());
            }
            return undefined;
        }
                
        if (typeof subject === 'object') {
            return subject;
        }
        if (subject.indexOf('_:') === 0) {
            return subject;
        }
        if (subject.indexOf('<') === 0) {
            return subject;
        }
        return "<" + subject + ">";
    },
    
    setElementSubject : function(subject, element) {
        if (jQuery(element).attr('src')) {
            return jQuery(element).attr('src', subject);
        }
        return jQuery(element).attr('about', subject);
    },
    
    getElementPredicate : function(element) {
        var predicate;
        element = jQuery(element);
        predicate = element.attr('property');
        if (!predicate) {
            predicate = element.attr('rel');
        }
        return predicate;
    },
    
    getElementBySubject : function(subject, element) {
        var service = this;
        return jQuery(element).find(this.options.subjectSelector).add(jQuery(element).filter(this.options.subjectSelector)).filter(function() {
            if (service.getElementSubject(jQuery(this)) !== subject) {
                return false;
            }
     
            return true;
        });
    },
    
    getElementByPredicate : function(predicate, element) {
        var service = this;
        var subject = this.getElementSubject(element);
        return jQuery(element).find(this.options.predicateSelector).add(jQuery(element).filter(this.options.predicateSelector)).filter(function() {
            var foundPredicate = service.getElementPredicate(jQuery(this));
            if (service.vie.namespaces.curie(foundPredicate) !== service.vie.namespaces.curie(predicate)) {
                return false;
            }
    
            if (service.getElementSubject(this) !== subject) {
                return false;
            }
     
            return true;
        });
    },
    
    _readEntityPredicates : function(subject, element, emptyValues) {
        var service = this;
        var entityPredicates = {};
    
        this.findPredicateElements(subject, element, true).each(function() {
            var predicateElement = jQuery(this);
            var predicate = service.getElementPredicate(predicateElement);
            if (predicate === '') {
                return;
            }
            var value = service.readElementValue(predicate, predicateElement);
            if (value === null && !emptyValues) {
                return;
            }
   
            entityPredicates[predicate] = value;
        });
    
        if (jQuery(element).get(0).tagName !== 'HTML') {
            jQuery(element).parent('[rev]').each(function() {
                var relation = jQuery(this).attr('rev');
                if (!relation) {
                    return;
                }
                entityPredicates[jQuery(this).attr('rev')] = service.getElementSubject(this); 
            });
        }
        return entityPredicates;
    },
    
    findPredicateElements : function(subject, element, allowNestedPredicates) {
        var service = this;
        return jQuery(element).find(this.options.predicateSelector).add(jQuery(element).filter(this.options.predicateSelector)).filter(function() {
            if (service.getElementSubject(this) !== subject) {
                return false;
            }
            if (!allowNestedPredicates) {
                if (!jQuery(this).parents('[property]').length) {
                    return true;
                }
                return false;
            }
    
            return true;
        });
    },
    
    readElementValue : function(predicate, element) {
        // The `content` attribute can be used for providing machine-readable
        // values for elements where the HTML presentation differs from the
        // actual value.
        var content = element.attr('content');
        if (content) {
            return content;
        }
                
        // The `resource` attribute can be used to link a predicate to another
        // RDF resource.
        var resource = element.attr('resource');
        if (resource) {
            return ["<" + resource + ">"];
        }
                
        // `href` attribute also links to another RDF resource.
        var href = element.attr('href');
        if (href && element.attr('rel') === predicate) {
            return ["<" + href + ">"];
        }
    
        // If the predicate is a relation, we look for identified child objects
        // and provide their identifiers as the values. To protect from scope
        // creep, we only support direct descentants of the element where the
        // `rel` attribute was set.
        if (element.attr('rel')) {
            var value = [];
            var service = this;
            jQuery(element).children(this.options.subjectSelector).each(function() {
                value.push(service.getElementSubject(this));
            });
            return value;
        }
    
        // If none of the checks above matched we return the HTML contents of
        // the element as the literal value.
        return element.html();
    },
    
    writeElementValue : function(predicate, element, value) {
        //TODO: this is a hack, please fix!
        if (_.isArray(value) && value.length > 0) {
            value = value[0];
        }
        
        // The `content` attribute can be used for providing machine-readable
        // values for elements where the HTML presentation differs from the
        // actual value.
        var content = element.attr('content');
        if (content) {
            element.attr('content', value);
            return;
        }
                
        // The `resource` attribute can be used to link a predicate to another
        // RDF resource.
        var resource = element.attr('resource');
        if (resource) {
            element.attr('resource', value);
        }
    
        // Property has inline value. Change the HTML contents of the property
        // element to match the new value.
        element.html(value);
    },
    
    // mostyl copied from http://code.google.com/p/rdfquery/source/browse/trunk/jquery.xmlns.js
    xmlns : function (elem) {
        var $elem;
        if (!elem) {
            if (typeof document === 'undefined') { 
                return {};
            }
            $elem = jQuery(document);
        } else {
            $elem = jQuery(elem);
        }
        // Collect namespace definitions from the element and its parents
        $elem = $elem.add($elem.parents());
        var obj = {};

        $elem.each(function (i, e) {
            if (e.attributes) {
                for (i = 0; i < e.attributes.length; i += 1) {
                    var attr = e.attributes[i];
                    if (/^xmlns(:(.+))?$/.test(attr.nodeName)) {
                        var prefix = /^xmlns(:(.+))?$/.exec(attr.nodeName)[2] || '';
                        var value = attr.nodeValue;
                        if (prefix === '' || value !== '') {
                            obj[prefix] = attr.nodeValue;
                        }
                    }
                }
            }
        });
        
        return obj;
    }

};

})();
//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - SameAsService service
// The SameAsService service allows a VIE developer to directly query
// "sameAs"-relations of entities from http://sameas.org .
(function(){

// ## VIE.SameAsService(options)
// This is the constructor to instantiate a new service to collect
// "sameAs" relations of an entity from <a href="http://sameas.org">SameAs.org</a>.  
// **Parameters**:  
// *{object}* **options** Optional set of fields, ```namespaces```, ```rules```, or ```name```.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.SameAsService}* : A **new** VIE.SameAsService instance.  
// **Example usage**:  
//
//     var service = new vie.SameAsService({<some-configuration>});
VIE.prototype.SameAsService = function (options) {
    var defaults = {
        /* the default name of this service */
        name : 'sameas',
        /* default namespaces that are shipped with this service */
        namespaces : {
            owl    : "http://www.w3.org/2002/07/owl#",
            yago   : "http://dbpedia.org/class/yago/",
            foaf: 'http://xmlns.com/foaf/0.1/',
            georss: "http://www.georss.org/georss/",
            geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
            rdfs: "http://www.w3.org/2000/01/rdf-schema#",
            rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            dbpedia: "http://dbpedia.org/ontology/",
            dbprop : "http://dbpedia.org/property/",
            dcelements : "http://purl.org/dc/elements/1.1/"
        },
        /* default rules that are shipped with this service */
        rules : []
    };
    /* the options are merged with the default options */
    this.options = jQuery.extend(true, defaults, options ? options : {});

    this.vie = null; /* this.vie will be set via VIE.use(); */
    /* overwrite options.name if you want to set another name */
    this.name = this.options.name;
    
    /* basic setup for the ajax connection */
    jQuery.ajaxSetup({
        converters: {"text application/rdf+json": function(s){return JSON.parse(s);}},
        timeout: 60000 /* 60 seconds timeout */
    });
};

VIE.prototype.SameAsService.prototype = {
    
// ### init()
// This method initializes certain properties of the service and is called
// via ```VIE.use()```.  
// **Parameters**:  
// *nothing*  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.SameAsService}* : The VIE.SameAsService instance itself.  
// **Example usage**:  
//
//     var service = new vie.SameAsService({<some-configuration>});
//     service.init();
    init: function() {

        for (var key in this.options.namespaces) {
            var val = this.options.namespaces[key];
            this.vie.namespaces.add(key, val);
        }
        
        this.rules = jQuery.extend([], VIE.Util.transformationRules(this));
        this.rules = jQuery.merge(this.rules, (this.options.rules) ? this.options.rules : []);
        
        this.connector = new this.vie.SameAsConnector(this.options);
        
        return this;
    },

// ### load(loadable)
// This method loads the "sameAs" relations for the entity taht is stored  
// within the loadable into VIE. You can also query for multiple queries  
// by setting ```entities``` with an array of entities.  
// **Parameters**:  
// *{VIE.Loadable}* **lodable** The loadable.  
// **Throws**:  
// *{Error}* if an invalid VIE.Loadable is passed.  
// **Returns**:  
// *{VIE.SameAsService}* : The VIE.SameAsService instance itself.  
// **Example usage**:  
//
//  var service = new vie.SameAsService({<some-configuration>});
//  service.load(new vie.Loadable({entity : "<http://...>"}));
//    OR
//  var service = new vie.SameAsService({<some-configuration>});
//  service.load(new vie.Loadable({entities : ["<http://...>", "<http://...>"]}));
    load: function(loadable){
        var service = this;
        
        var correct = loadable instanceof this.vie.Loadable;
        if (!correct) {
            throw new Error("Invalid Loadable passed");
        }

        var entities = (loadable.options.entity)? loadable.options.entity : loadable.options.entities;
        
        if (!entities) {
            loadable.reject([]);
        } else {
            entities = (_.isArray(entities))? entities : [ entities ];
        
            var success = function (ents) {
                return function (results) {
                    _.defer(function() {
                        try {
                            var returnEntities = new service.vie.Collection();
                            var newEnts = VIE.Util.rdf2Entities(service, results);
                            for (var e = 0; e < newEnts.length; e++) {
                                var isValid = false;
                                var id1 = (newEnts[e].id)? newEnts[e].id : newEnts[e];
                                for (var f = 0; f < ents.length; f++) {
                                    var id2 = (ents[f].id)? ents[f].id : ents[f];
                                    isValid |= id1 === id2;
                                }
                                if (isValid) {
                                    returnEntities.add(newEnts[e]);
                                }
                            }
                            returnEntities.each(function (ent) {
                                ent.set("SameAsServiceLoad", VIE.Util.xsdDateTime(new Date()));
                            });
                            loadable.resolve(returnEntities);
                        } catch (except) {
                            loadable.reject(except);
                        }
                    });
                };
            }(entities);
            
            var error = function (e) {
                loadable.reject(e);
            };
                
        	var tmpEntities = [];
        	for (var e = 0; e < entities.length; e++) {
        		var tmpEnt = (typeof entities[e] === "string")? entities[e] : entities[e].id;
        		tmpEntities.push(tmpEnt);
        	}
                        
            this.connector.load(tmpEntities, success, error);
        }
        return this;
    }
};

// ## VIE.SameAsConnector(options)
// The SameAsConnector is the connection between the http://sameas.org service
// and the backend service.  
// **Parameters**:  
// *{object}* **options** The options.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.SameAsConnector}* : The **new** VIE.SameAsConnector instance.  
// **Example usage**:  
//
//     var dbpConn = new vie.SameAsConnector({<some-configuration>});
VIE.prototype.SameAsConnector = function (options) {
    this.options = options;
    this.baseUrl = "http://sameas.org/rdf?uri=";
};

VIE.prototype.SameAsConnector.prototype = {

// ### load(uri, success, error, options)
// This method loads the sameas-relations from an entity and returns the result by the success callback.  
// **Parameters**:  
// *{string|array}* **uri** The URI of the entity to be loaded or an array of URIs.  
// *{function}* **success** The success callback.  
// *{function}* **error** The error callback.  
// *{object}* **options** Options, like the ```format```.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.SameAsConnector}* : The VIE.SameAsConnector instance itself.  
// **Example usage**:  
//
//     var conn = new vie.SameAsConnector(opts);
//     conn.load("<http://dbpedia.org/resource/Barack_Obama>",
//                 function (res) { ... },
//                 function (err) { ... });
    load: function (uri, success, error, options) {
        if (!options) { options = {}; }
        
        var url = this.baseUrl;

        var _load = function (u, s, e) {
            jQuery.ajax({
                success: s,
                error: e,
                type: "GET",
                url: u
            });
        };
        
        uri = (_.isArray(uri))? uri : [ uri ];

        for (var i = 0; i < uri.length; i++) {
            var u = uri[i];
            u = u.replace(/[<>]/g, "");

            if (typeof exports !== "undefined" && typeof process !== "undefined") {
                /* We're on Node.js, don't use jQuery.ajax */
                this._loadNode(url + encodeURIComponent(u), success, error, options, format);
            } else {
                _load(url + encodeURIComponent(u), success, error);
            }
        }

        
        return this;
    },

    _loadNode: function (uri, success, error, options, format) {
        var request = require('request');
        var r = request({
            method: "GET",
            uri: uri
        }, function(error, response, body) {
            success(JSON.parse(body));
        });
        r.end();
        
        return this;
    }
};
})();

//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - StanbolService service
// The StanbolService service allows a VIE developer to directly query
// the <a href="http://incubator.apache.org/stanbol/">Apache Stanbol</a> entityhub for entities and their properties. 
// Furthermore, it gives access to the enhance facilities of
// Stanbol to analyze content and semantically enrich it.
(function(){

// ## VIE.StanbolService(options)
// This is the constructor to instantiate a new service to collect
// properties of an entity from <a href="http://incubator.apache.org/stanbol/">Apache Stanbol</a>.  
// **Parameters**:  
// *{object}* **options** Optional set of fields, ```namespaces```, ```rules```, ```url```, or ```name```.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.StanbolService}* : A **new** VIE.StanbolService instance.  
// **Example usage**:  
//
//     var stnblService = new vie.StanbolService({<some-configuration>});
VIE.prototype.StanbolService = function(options) {
    var defaults = {
        /* the default name of this service */
        name : 'stanbol',
        /* you can pass an array of URLs which are then tried sequentially */
        url: ["http://dev.iks-project.eu/stanbolfull"],
        timeout : 20000, /* 20 seconds timeout */
        namespaces : {
            semdeski : "http://www.semanticdesktop.org/ontologies/2007/01/19/nie#",
            semdeskf : "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#",
            skos: "http://www.w3.org/2004/02/skos/core#",
            foaf: "http://xmlns.com/foaf/0.1/",
            opengis: "http://www.opengis.net/gml/",
            dbpedia: "http://dbpedia.org/ontology/",
            dbprop: "http://dbpedia.org/property/",
            owl : "http://www.w3.org/2002/07/owl#",
            geonames : "http://www.geonames.org/ontology#",
            enhancer : "http://fise.iks-project.eu/ontology/",
            entityhub: "http://www.iks-project.eu/ontology/rick/model/",
            entityhub2: "http://www.iks-project.eu/ontology/rick/query/",
            rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            rdfs: "http://www.w3.org/2000/01/rdf-schema#",
            dcterms  : 'http://purl.org/dc/terms/',
            schema: 'http://schema.org/',
            geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#'
        },
        /* default rules that are shipped with this service */
        rules : [
            /* rule to add backwards-relations to the triples
             * this makes querying for entities a lot easier!
             */
            {
                'left' : [
                    '?subject a <http://fise.iks-project.eu/ontology/EntityAnnotation>',
                    '?subject enhancer:entity-type ?type',
                    '?subject enhancer:confidence ?confidence',
                    '?subject enhancer:entity-reference ?entity',
                    '?subject dcterms:relation ?relation',
                    '?relation a <http://fise.iks-project.eu/ontology/TextAnnotation>',
                    '?relation enhancer:selected-text ?selected-text',
                    '?relation enhancer:selection-context ?selection-context',
                    '?relation enhancer:start ?start',
                    '?relation enhancer:end ?end'
                ],
                'right' : [
                    '?entity a ?type',
                    '?entity enhancer:hasTextAnnotation ?relation',
                    '?entity enhancer:hasEntityAnnotation ?subject'
                ]
            }
        ],
        enhancer : {
        	chain : "default"
        },
        entityhub : {
        	/* if set to undefined, the Referenced Site Manager @ /entityhub/sites is used. */
        	/* if set to, e.g., dbpedia, eferenced Site @ /entityhub/site/dbpedia is used. */
        	site : undefined
        }
    };
    /* the options are merged with the default options */
    this.options = jQuery.extend(true, defaults, options ? options : {});

    this.vie = null; /* will be set via VIE.use(); */
    /* overwrite options.name if you want to set another name */
    this.name = this.options.name;
    
};

VIE.prototype.StanbolService.prototype = {

//      ### init()
//      This method initializes certain properties of the service and is called
//      via ```VIE.use()```.  
//      **Parameters**:  
//      *nothing*  
//      **Throws**:  
//      *nothing*  
//      **Returns**:  
//      *{VIE.StanbolService}* : The VIE.StanbolService instance itself.  
//      **Example usage**:  

//      var stnblService = new vie.StanbolService({<some-configuration>});
//      stnblService.init();
        init: function(){

            for (var key in this.options.namespaces) {
                var val = this.options.namespaces[key];
                this.vie.namespaces.add(key, val);
            }

            this.rules = jQuery.extend([], VIE.Util.transformationRules(this));
            this.rules = jQuery.merge(this.rules, (this.options.rules) ? this.options.rules : []);

            this.connector = new this.vie.StanbolConnector(this.options);

            /* adding these entity types to VIE helps later the querying */
            this.vie.types.addOrOverwrite('enhancer:EntityAnnotation', [
                                                                        /*TODO: add attributes */
                                                                        ]).inherit("owl:Thing");
            this.vie.types.addOrOverwrite('enhancer:TextAnnotation', [
                                                                      /*TODO: add attributes */
                                                                      ]).inherit("owl:Thing");
            this.vie.types.addOrOverwrite('enhancer:Enhancement', [
                                                                   /*TODO: add attributes */
                                                                   ]).inherit("owl:Thing");
        },

//      ### analyze(analyzable)
//      This method extracts text from the jQuery element and sends it to Apache Stanbol for analysis.  
//      **Parameters**:  
//      *{VIE.Analyzable}* **analyzable** The analyzable.  
//      **Throws**:  
//      *{Error}* if an invalid VIE.Findable is passed.  
//      **Returns**:  
//      *{VIE.StanbolService}* : The VIE.StanbolService instance itself.  
//      **Example usage**:  

//      var stnblService = new vie.StanbolService({<some-configuration>});
//      stnblService.analyzable(
//      new vie.Analyzable({element : jQuery("#foo")})
//      );
        analyze: function(analyzable) {
        	console.log("analyzable passed to me:")
        	console.log(analyzable)
            var service = this;

            var correct = analyzable instanceof this.vie.Analyzable;
            if (!correct) {throw "Invalid Analyzable passed";}

            var element = analyzable.options.element ? analyzable.options.element : jQuery('body');

            var text = service._extractText(element);

            if (text.length > 0) {
                /* query enhancer with extracted text */
                var success = function (results) {
                    _.defer(function(){
                        var entities = VIE.Util.rdf2Entities(service, results);
                        analyzable.resolve(entities);
                    });
                };
                var error = function (e) {
                    analyzable.reject(e);
                };

                var options = {
                        chain : (analyzable.options.chain)? analyzable.options.chain : service.options.enhancer.chain
                };

                this.connector.analyze(text, success, error, options);

            } else {
                console.warn("No text found in element.");
                analyzable.reject([]);
            }

        },

//      ### find(findable)
//      This method finds entities given the term from the entity hub.  
//      **Parameters**:  
//      *{VIE.Findable}* **findable** The findable.  
//      **Throws**:  
//      *{Error}* if an invalid VIE.Findable is passed.  
//      **Returns**:  
//      *{VIE.StanbolService}* : The VIE.StanbolService instance itself.  
//      **Example usage**:  

//      var stnblService = new vie.StanbolService({<some-configuration>});
//      stnblService.load(new vie.Findable({
//      term : "Bischofsh", 
//      limit : 10, 
//      offset: 0,
//      field: "skos:prefLabel", // used for the term lookup, default: "rdfs:label"
//      properties: ["skos:prefLabel", "rdfs:label"] // are going to be loaded with the result entities
//      }));
        find: function (findable) {        
            var correct = findable instanceof this.vie.Findable;
            if (!correct) {throw "Invalid Findable passed";}
            var service = this;
            /* The term to find, * as wildcard allowed */
            if(!findable.options.term) {
                console.info("StanbolConnector: No term to look for!");
                findable.reject([]);
            };
            var term = escape(findable.options.term);
            var limit = (typeof findable.options.limit === "undefined") ? 20 : findable.options.limit;
            var offset = (typeof findable.options.offset === "undefined") ? 0 : findable.options.offset;
            var success = function (results) {
                _.defer(function(){
                    var entities = VIE.Util.rdf2Entities(service, results);
                    findable.resolve(entities);
                });
            };
            var error = function (e) {
                findable.reject(e);
            };

            findable.options.site = (findable.options.site)? findable.options.site : service.options.entityhub.site;

            var vie = this.vie;
            if(findable.options.properties){
                var properties = findable.options.properties;
                findable.options.ldPath = _(properties)
                .map(function(property){
                    if(vie.namespaces.isCurie(property)){
                        return vie.namespaces.uri(property) + ";"
                    } else {
                        return property;
                    }
                })
                .join("");
            }
            if(findable.options.field && vie.namespaces.isCurie(field)){
                var field = findable.options.field;
                findable.options.field = vie.namespaces.uri(field);
            }
            this.connector.find(term, limit, offset, success, error, findable.options);
        },

        // ### load(loadable)
        // This method loads the entity that is stored within the loadable into VIE.  
        // **Parameters**:  
        // *{VIE.Loadable}* **lodable** The loadable.  
        // **Throws**:  
        // *{Error}* if an invalid VIE.Loadable is passed.  
        // **Returns**:  
        // *{VIE.StanbolService}* : The VIE.StanbolService instance itself.  
        // **Example usage**:  
        //
        //      var stnblService = new vie.StanbolService({<some-configuration>});
        //      stnblService.load(new vie.Loadable({
        //      entity : "<http://...>"
        //      }));
        load: function(loadable){
            var correct = loadable instanceof this.vie.Loadable;
            if (!correct) {throw "Invalid Loadable passed";}
            var service = this;

            var entity = loadable.options.entity;
            if(!entity){
                console.warn("StanbolConnector: No entity to look for!");
                loadable.resolve([]);
            };
            var success = function (results) {
                _.defer(function(){
                    var entities = VIE.Util.rdf2Entities(service, results);
                    loadable.resolve(entities);
                });
            };
            var error = function (e) {
                loadable.reject(e);
            };

            var options = {
                    site : (loadable.options.site)? loadable.options.site : service.options.entityhub.site,
                    local : loadable.options.local
            };

            this.connector.load(entity, success, error, options);
        },

        // ### query(queryable)
        // This method queries for entities, given the query that is stored in the queryable element.  
        // **Parameters**:  
        // *{VIE.Queryable}* **queryable** The queryable.  
        // **Throws**:  
        // *{Error}* if an invalid VIE.Queryable is passed.  
        // **Returns**:  
        // *{VIE.StanbolService}* : The VIE.StanbolService instance itself.  
        // **Example usage**:  
        //
        //      var stnblService = new vie.StanbolService({<some-configuration>});
        //      stnblService.query(new vie.Queryable({
        //          {
        //              select: ["rdfs:label", "population"],
        //              fieldQuery: {
        //                  "rdfs:label": "mongolia*",
        //                  "@type": "schema:Country"
        //              }
        //          }));
        query: function(queryable){
            var correct = queryable instanceof this.vie.Queryable;
            if (!correct) {throw "Invalid Queryable passed";}
            var service = this;

            var query = queryable.options.query;
            if(!query){
                console.warn("StanbolConnector: No query to be executed!");
                queryable.resolve([]);
            };
            var success = function (response) {
                _.defer(function(){
                    var entities = VIE.Util.rdf2Entities(service, response.results);
                    queryable.resolve(entities);
                });
            };
            var error = function (e) {
                queryable.reject(e);
            };

            var options = {
                    site : (queryable.options.site)? queryable.options.site : service.options.entityhub.site,
                    local : queryable.options.local
            };

            this.connector.query(query, success, error, options);
        },

        // ### save(savable)
        // This method saves the given entity to the Apache Stanbol installation.  
        // **Parameters**:  
        // *{VIE.Savable}* **savable** The savable.  
        // **Throws**:  
        // *{Error}* if an invalid VIE.Savable is passed.  
        // **Returns**:  
        // *{VIE.StanbolService}* : The VIE.StanbolService instance itself.  
        // **Example usage**:  
        //
        //      var entity = new vie.Entity({'name' : 'Test Entity'});
        //      var stnblService = new vie.StanbolService({<some-configuration>});
        //      stnblService.save(new vie.Savable(entity));
        save: function(savable) {
        	console.log("received Savable: " + typeof(savable))
        	console.log(savable)
            var correct = savable instanceof this.vie.Savable;
            if (!correct) {throw "Invalid Savable passed";}
            var service = this;

            var entity = savable.options.entity;
            console.log("entity to save is: " + entity)
            if(!entity){
                console.warn("StanbolConnector: No entity to save!");
                savable.reject("StanbolConnector: No entity to save!");
            };
            var success = function (results) {
                _.defer(function() {
                    var entities = VIE.Util.rdf2Entities(service, results);
                    savable.resolve(entities);
                });
            };

            var error = function (e) {
                savable.reject(e);
            };

            var options = {
                    site : (savable.options.site)? savable.options.site : service.options.entityhub.site,
                    local : savable.options.local,
                    update : savable.options.update
            };
            
            this.connector.save(entity, success, error, options);
        },

        /* this private method extracts text from a jQuery element */
        _extractText: function (element) {
            if (element.get(0) &&
                    element.get(0).tagName &&
                    (element.get(0).tagName == 'TEXTAREA' ||
                            element.get(0).tagName == 'INPUT' && element.attr('type', 'text'))) {
                return element.get(0).val();
            }
            else {
                var res = element
                .text()    /* get the text of element */
                .replace(/\s+/g, ' ') /* collapse multiple whitespaces */
                .replace(/\0\b\n\r\f\t/g, ''); /* remove non-letter symbols */
                return jQuery.trim(res);
            }
        }
};

})();

//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - ZemantaService service
// The ZemantaService ...
(function(){

// ## VIE.ZemantaService(options)
// This is the constructor to instantiate a new service to collect
// properties of an entity from Zemanta.  
// **Parameters**:  
// *{object}* **options** Optional set of fields, ```namespaces```, ```rules```, ```url```, or ```name```.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.ZemantaService}* : A **new** VIE.ZemantaService instance.  
// **Example usage**:  
//
//     var service = new vie.ZemantaService({<some-configuration>});
VIE.prototype.ZemantaService = function(options) {
    var defaults = {
        /* the default name of this service */
        name : 'zemanta',
        /* you can pass an array of URLs which are then tried sequentially */
        url: ["http://api.zemanta.com/services/rest/0.0/"],
        timeout : 20000, /* 20 seconds timeout */
        namespaces : {
        	zemanta: "http://s.zemanta.com/ns#",
			freebase:"http://rdf.freebase.com/ns/schema/"
        },
        /* default rules that are shipped with this service */
        rules : [
            {
                'left' : [
                    '?subject a zemanta:Recognition',
                    '?subject zemanta:object ?object',
					'?object zemanta:entity_type ?type',
                    '?object owl:sameAs ?entity',
					'?entity zemanta:title ?title'
					],
                'right' : [
                    '?entity zemanta:hasEntityAnnotation ?subject',
					'?entity a ?type',
					'?entity rdfs:label ?title'
					]
			},
			
			{
                'left' : [
                    '?subject a freebase:people/person',
                 ],
                 'right': [
					'?subject a dbpedia:Person'
				 ]
             } ,
			 
			 {
                'left' : [
                    '?subject a freebase:location/location',
                 ],
                 'right': [
					'?subject a dbpedia:Place'
				 ]
             },
			 
			 {
                'left' : [
                    '?subject a freebase:location/citytown',
                 ],
                 'right': [
					'?subject a dbpedia:City'
				 ]
             },
			 
			 {
                'left' : [
                    '?subject a freebase:business/company',
                 ],
                 'right': [
					'?subject a dbpedia:Company'
				 ]
             },
			 
			 {
                'left' : [
                    '?subject a freebase:location/country',
                 ],
                 'right': [
					'?subject a dbpedia:Country'
				 ]
             },
			 
			 {
                'left' : [
                    '?subject a freebase:organization/organization',
                 ],
                 'right': [
					'?subject a dbpedia:Organisation'
				 ]
             }
         ],
         "api_key" : undefined
    };
    /* the options are merged with the default options */
    this.options = jQuery.extend(true, defaults, options ? options : {});

    this.vie = null; /* will be set via VIE.use(); */
    /* overwrite options.name if you want to set another name */
    this.name = this.options.name;
    
    /* basic setup for the ajax connection */
    jQuery.ajaxSetup({
        converters: {"text application/rdf+json": function(s){return JSON.parse(s);}},
        timeout: this.options.timeout
    });
};

VIE.prototype.ZemantaService.prototype = {
    
// ### init()
// This method initializes certain properties of the service and is called
// via ```VIE.use()```.  
// **Parameters**:  
// *nothing*  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.ZemantaService}* : The VIE.ZemantaService instance itself.  
// **Example usage**:  
//
//     var service = new vie.ZemantaService({<some-configuration>});
//     service.init();
    init: function(){

        for (var key in this.options.namespaces) {
            var val = this.options.namespaces[key];
            this.vie.namespaces.add(key, val);
        }
        
        this.rules = jQuery.extend([], VIE.Util.transformationRules(this));
        this.rules = jQuery.merge(this.rules, (this.options.rules) ? this.options.rules : []);
        
        this.connector = new this.vie.ZemantaConnector(this.options);

        /* adding these entity types to VIE helps later the querying */
        this.vie.types.addOrOverwrite('zemanta:Recognition', [
            /*TODO: add attributes */
        ]).inherit("owl:Thing");
    },

// ### analyze(analyzable)
// This method extracts text from the jQuery element and sends it to Zemanta for analysis.  
// **Parameters**:  
// *{VIE.Analyzable}* **analyzable** The analyzable.  
// **Throws**:  
// *{Error}* if an invalid VIE.Findable is passed.  
// **Returns**:  
// *{VIE.StanbolService}* : The VIE.ZemantaService instance itself.  
// **Example usage**:  
//
//     var service = new vie.ZemantaService({<some-configuration>});
//     service.analyzable(
//         new vie.Analyzable({element : jQuery("#foo")})
//     );
    analyze: function(analyzable) {
        var service = this;

        var correct = analyzable instanceof this.vie.Analyzable;
        if (!correct) {throw "Invalid Analyzable passed";}

        var element = analyzable.options.element ? analyzable.options.element : jQuery('body');

        var text = service._extractText(element);

        if ($(element).text().length > 0) {
            var success = function (results) {
                _.defer(function(){
                    var entities = VIE.Util.rdf2Entities(service, results);
                    analyzable.resolve(entities);
                });
            };
            var error = function (e) {
                analyzable.reject(e);
            };
            
            var options = {};

            this.connector.analyze(text, success, error, options);

        } else {
            console.warn("No text found in element.");
            analyzable.resolve([]);
        }

    },

    /* this private method extracts the outerHTML from a jQuery element */
    _extractText: function (element) {
        return jQuery(element).wrap("<div>").parent().html();
    }
};

// ## VIE.ZemantaConnector(options)
// The ZemantaConnector is the connection between the VIE Zemanta service
// and the actual ajax calls.  
// **Parameters**:  
// *{object}* **options** The options.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.ZemantaConnector}* : The **new** VIE.ZemantaConnector instance.  
// **Example usage**:  
//
//     var conn = new vie.ZemantaConnector({<some-configuration>});
VIE.prototype.ZemantaConnector = function (options) {
    
    var defaults =  {
		/* you can pass an array of URLs which are then tried sequentially */
	    url: ["http://api.zemanta.com/services/rest/0.0/"],
	    timeout : 20000, /* 20 seconds timeout */
        "api_key" : undefined
    };

    /* the options are merged with the default options */
    this.options = jQuery.extend(true, defaults, options ? options : {});
    this.options.url = (_.isArray(this.options.url))? this.options.url : [ this.options.url ];
    
    this._init();

    this.baseUrl = (_.isArray(options.url))? options.url : [ options.url ];
};

VIE.prototype.ZemantaConnector.prototype = {
		
// ### _init()
// Basic setup of the Zemanta connector.  This is called internally by the constructor!
// **Parameters**:  
// *nothing*
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.ZemantaConnector}* : The VIE.ZemantaConnector instance itself. 
	_init : function () {
		var connector = this;
		
	    /* basic setup for the ajax connection */
	    jQuery.ajaxSetup({
	        converters: {"text application/rdf+json": function(s){return JSON.parse(s);}},
	        timeout: connector.options.timeout
	    });
	    
	    return this;
	},
	
	_iterate : function (params) {
        if (!params) { return; }
        
        if (params.urlIndex >= this.options.url.length) {
        	params.error.call(this, "Could not connect to the given Zemanta endpoints! Please check for their setup!");
            return;
        }
        
        var retryErrorCb = function (c, p) {
            /* in case a Zemanta backend is not responding and
             * multiple URLs have been registered
             */
            return function () {
                console.log("Zemanta connection error", arguments);
                p.urlIndex = p.urlIndex+1;
                c._iterate(p);
            };
        }(this, params);

        if (typeof exports !== "undefined" && typeof process !== "undefined") {
            /* We're on Node.js, don't use jQuery.ajax */
            return params.methodNode.call(
            		this, 
            		params.url.call(this, params.urlIndex, params.args.options),
            		params.args,
            		params.success,
            		retryErrorCb);
        }
        
        return params.method.call(
        		this, 
        		params.url.call(this, params.urlIndex, params.args.options),
        		params.args,
        		params.success,
        		retryErrorCb);
	},

// ### analyze(text, success, error, options)
// This method sends the given text to Zemanta returns the result by the success callback.  
// **Parameters**:  
// *{string}* **text** The text to be analyzed.  
// *{function}* **success** The success callback.  
// *{function}* **error** The error callback.  
// *{object}* **options** Options, like the ```format```, or the ```chain``` to be used.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.ZemantaConnector}* : The VIE.ZemantaConnector instance itself.  
// **Example usage**:  
//
//     var conn = new vie.ZemantaConnector(opts);
//     conn.analyze("<p>This is some HTML text.</p>",
//                 function (res) { ... },
//                 function (err) { ... });
    analyze: function(text, success, error, options) {
    	options = (options)? options :  {};
    	var connector = this;
        
    	connector._iterate({
        	method : connector._analyze,
        	methodNode : connector._analyzeNode,
        	success : success,
        	error : error,
        	url : function (idx, opts) {
        		var u = this.options.url[idx].replace(/\/$/, '');
        		return u;
        	},
        	args : {
    			text : text,
        		format : options.format || "rdfxml",
        		options : options
        	},
        	urlIndex : 0
        });
    },
    
    _analyze : function (url, args, success, error) {
    	jQuery.ajax({
            success: function(a, b, c){
	        	var responseData = c.responseText.replace(/<z:signature>.*?<\/z:signature>/, '');
	        	success(responseData);
            },
            error: error,
            url: url,
            type: "POST",
            dataType: "xml",
            data: {
            	method : "zemanta.suggest",
            	text : args.text,
            	format : args.format,
            	api_key : this.options.api_key,
            	return_rdf_links : args.options.return_rdf_links
            },
            contentType: "text/plain",
            accepts: {"application/rdf+json": "application/rdf+json"}
        });
    },

    _analyzeNode: function(url, args, success, error) {
        var request = require('request');
        var r = request({
            method: "POST",
            uri: url,
            body: args.text,
            headers: {
                Accept: args.format,
                'Content-Type': 'text/plain'
            }
        }, function(err, response, body) {
            try {
                success({results: JSON.parse(body)});
            } catch (e) {
                error(e);
            }
        });
        r.end();
    }
};
})();

//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - DBPedia service
// The DBPedia service allows a VIE developer to directly query
// the DBPedia database for entities and their properties. Obviously,
// the service does not allow for saving, removing or analyzing methods.
(function(){
	
// ## VIE.StanbolConnector(options)
// The StanbolConnector is the connection between the VIE Stanbol service
// and the actual ajax calls.  
// **Parameters**:  
// *{object}* **options** The options.  
// **Throws**:  
// *nothing*  
// **Returns**:  
// *{VIE.StanbolConnector}* : The **new** VIE.StanbolConnector instance.  
// **Example usage**:  
//
//     var stnblConn = new vie.StanbolConnector({<some-configuration>});
VIE.prototype.StanbolConnector = function (options) {
	
	var defaults = {
		/* you can pass an array of URLs which are then tried sequentially */
		url: ["http://dev.iks-project.eu/stanbolfull"],
		timeout : 20000 /* 20 seconds timeout */,

        enhancer : {
            urlPostfix : "/enhancer",
            chain : "default"
        },
        contenthub : {
            urlPostfix : "/contenthub",
            index : "contenthub"
        },
        entityhub : {
            /* if set to undefined, the Referenced Site Manager @ /entityhub/sites is used. */
            /* if set to, e.g., dbpedia, referenced Site @ /entityhub/site/dbpedia is used. */
            site : undefined,
            urlPostfix : "/entityhub",
            local : false
        },
        factstore : {
            urlPostfix : "/factstore"
        },
        ontonet : {
            urlPostfix : "/ontonet"
        },
        rules : {
            urlPostfix : "/rules"
        },
        sparql : {
            urlPostfix : "/sparql"
        }
	};
	
    /* the options are merged with the default options */
    this.options = jQuery.extend(true, defaults, options ? options : {});
    this.options.url = (_.isArray(this.options.url))? this.options.url : [ this.options.url ];
    
    this._init();
};

VIE.prototype.StanbolConnector.prototype = {

		// ### _init()
		// Basic setup of the stanbol connector.  This is called internally by the constructor!
		// **Parameters**:  
		// *nothing*
		// **Throws**:  
		// *nothing*  
		// **Returns**:  
		// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself. 
		_init : function () {
			var connector = this;

			/* basic setup for the ajax connection */
			jQuery.ajaxSetup({
				converters: {"text application/rdf+json": function(s){return JSON.parse(s);}},
				timeout: connector.options.timeout
			});

			return this;
		},

		_iterate : function (params) {
			if (!params) { return; }

			if (params.urlIndex >= this.options.url.length) {
				params.error.call(this, "Could not connect to the given Stanbol endpoints! Please check for their setup!");
				return;
			}

			var retryErrorCb = function (c, p) {
				/* in case a Stanbol backend is not responding and
				 * multiple URLs have been registered
				 */
				return function () {
					console.log("Stanbol connection error", arguments);
					p.urlIndex = p.urlIndex+1;
					c._iterate(p);
				};
			}(this, params);

			if (typeof exports !== "undefined" && typeof process !== "undefined") {
				/* We're on Node.js, don't use jQuery.ajax */
				return params.methodNode.call(
						this, 
						params.url.call(this, params.urlIndex, params.args.options),
						params.args,
						params.success,
						retryErrorCb);
			}

			return params.method.call(
					this, 
					params.url.call(this, params.urlIndex, params.args.options),
					params.args,
					params.success,
					retryErrorCb);
		}

};

})();//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - DBPedia service
// The DBPedia service allows a VIE developer to directly query
// the DBPedia database for entities and their properties. Obviously,
// the service does not allow for saving, removing or analyzing methods.
(function(){
		
	jQuery.extend(VIE.prototype.StanbolConnector.prototype, {
		
		
		
	});
	
})();//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - DBPedia service
// The DBPedia service allows a VIE developer to directly query
// the DBPedia database for entities and their properties. Obviously,
// the service does not allow for saving, removing or analyzing methods.
(function(){

    jQuery.extend(true, VIE.prototype.StanbolConnector.prototype, {
        
		// ### uploadContent(content, success, error, options)
		// TODO.  
		// **Parameters**:  
		// TODO
		// *{function}* **success** The success callback.  
		// *{function}* **error** The error callback.  
		// *{object}* **options** Options: specify index: '<indexName>' to load up items to a specific index;
        //		specify id: '<id>' as the ID under which your content item will be stored on the contenthub
		// **Throws**:  
		// *nothing*  
		// **Returns**:  
		// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
		uploadContent: function(content, success, error, options) {
			options = (options)? options :  {};
			var connector = this;

			connector._iterate({
				method : connector._uploadContent,
				methodNode : connector._uploadContentNode,
				success : success,
				error : error,
				url : function (idx, opts) {
					var u = this.options.url[idx].replace(/\/$/, '');
					u += this.options.contenthub.urlPostfix.replace(/\/$/, '');

					var index = (opts.index)? opts.index : this.options.contenthub.index;

					u += "/" + index.replace(/\/$/, '');
					u += "/store";
					
					var id = (opts.id)? "/" + opts.id : '';
					
					u += id;
					
					return u;
				},
				args : {
					content: content,
					options : options
				},
				urlIndex : 0
			});
		},

		_uploadContent : function (url, args, success, error) {
			jQuery.ajax({
				success: success,
				error: error,
				url: url,
				type: "POST",
				data : args.content,
				contentType : "text/plain"
			});
		},

		_uploadContentNode: function(url, args, success, error) {
			var request = require('request');
			var r = request({
				method: "POST",
				uri: url,
				body : args.content,
				headers: {
					Accept: "application/rdf+xml",
					"Content-Type" : "text/plain"
				}
			}, function(err, response, body) {
				try {
					success({results: JSON.parse(body)});
				} catch (e) {
					error(e);
				}
			});
			r.end();
		}, 
		
		    
	// ### getTextContentByID(id, success, error, options)
	// @author mere01
	// This method queries the Apache Stanbol contenthub for the text content of a specific entity.
	// **Parameters**:  
	// *{string}* **id** The id of the content item to be retrieved.
	// *{function}* **success** The success callback.  
	// *{function}* **error** The error callback.
	// *{object}* **options** The Options, specify e.g. index: '<indexName>' if the content item you want to
	//		retrieve is stored on some contenthub index other than the default index.
	// **Throws**:  
	// *nothing*  
	// **Returns**:  
	// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
	// **Example usage**:  
	//
//	     var stnblConn = new vie.StanbolConnector(opts);
//	     stnblConn.getTextContentByID('urn:content-item-sha1-37c8a8244041cf6113d4ee04b3a04d0a014f6e10',
//	                 function (res) { ... },
//	                 function (err) { ... },
//					 {
//						index: 'myIndex'
//					});
    getTextContentByID: function(id, success, error, options) {
    	
			options = (options)? options :  {};
	
			var connector = this;
	    	
	    	connector._iterate({
	        	method : connector._getTextContentByID,
	        	methodNode : connector._getTextContentByIDNode,
	        	
	        	url : function (idx, opts) {			
		    		var u = this.options.url[idx].replace(/\/$/, '');
					u += this.options.contenthub.urlPostfix.replace(/\/$/, '');
	
					var index = (opts.index)? opts.index : this.options.contenthub.index;
	
					u += "/" + index.replace(/\/$/, '');
					u += "/store/raw";
					
					u += "/" + id;
					
					return u;
	    		},
	        	args : {
	        		id : id,
	        		format : "application/json",
	        		options : options
	        	},
	        	success : success,
	        	error : error,
	        	urlIndex : 0
	        });
	    }, // end of getTextContentByID

    _getTextContentByID : function (url, args, success, error) {
	    	
    	jQuery.ajax({
    		
    		success: success,            
    		error: error,
            url: url,
            type: "GET", 
            contentType: "text/plain",
            accepts: "text/plain"
        });
    	
    }, // end of _getTextContentByID

    _getTextContentByIDNode: function(url, args, success, error) {
        var request = require('request');
        var r = request({
            method: "POST",
            uri: url,
            body: args.text,
            headers: {
                Accept: args.format,
                'Content-Type': 'text/plain'
            }
        }, function(err, response, body) {
            try {
                success({results: JSON.parse(body)});
            } catch (e) {
                error(e);
            }
        });
        r.end();
    }, // end of _getTextContentByIDNode 
    
	// ### getMetadataByID(id, success, error, options)
	// @author mere01
	// This method queries the Apache Stanbol contenthub for the metadata, i.e. enhancements of a 
    // specific entity.
    // **Parameters**:  
	// *{string}* **id** The id of the content item to be retrieved.
	// *{function}* **success** The success callback.  
	// *{function}* **error** The error callback.  
	// *{object}* **options** The Options, specify e.g. "index: '<indexName>'" if the content item you want to
	//		retrieve is stored on some contenthub index other than the default index.
	// **Throws**:  
	// *nothing*  
	// **Returns**:  
	// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
	// **Example usage**:  
	//
//	     var stnblConn = new vie.StanbolConnector(opts);
//	     stnblConn.getTextContentByID('urn:content-item-sha1-37c8a8244041cf6113d4ee04b3a04d0a014f6e10',
//	                 function (res) { ... },
//	                 function (err) { ... }, 
//    				 {
//						index: 'myIndex'
//					 }	);
    getMetadataByID: function(id, success, error, options) {
    	
			options = (options)? options :  {};
	
			var connector = this;
	    	
	    	connector._iterate({
	        	method : connector._getMetadataByID,
	        	methodNode : connector._getMetadataByIDNode,
	        	
	        	url : function (idx, opts) {			
		    		var u = this.options.url[idx].replace(/\/$/, '');
					u += this.options.contenthub.urlPostfix.replace(/\/$/, '');
	
					var index = (opts.index)? opts.index : this.options.contenthub.index;
	
					u += "/" + index.replace(/\/$/, '');
					u += "/store/metadata";
					
					u += "/" + id;
					
					return u;
	    		},
	        	args : {
	        		id : id,
	        		format : "application/json",
	        		options : options
	        	},
	        	success : success,
	        	error : error,
	        	urlIndex : 0
	        });
	    	
	    }, // end of query

    _getMetadataByID : function (url, args, success, error) {
	    	
    	jQuery.ajax({
    		
    		success: success,            
    		error: error,
            url: url,
            type: "GET", 
            contentType: "text/plain",
            accepts: "text/plain"
        });
    	
    }, // end of _getMetadataByID

    _getMetadataByIDNode: function(url, args, success, error) {
        var request = require('request');
        var r = request({
            method: "GET",
            uri: url,
            body: args.text,
            headers: {
                Accept: args.format,
                'Content-Type': 'text/plain'
            }
        }, function(err, response, body) {
            try {
                success({results: JSON.parse(body)});
            } catch (e) {
                error(e);
            }
        });
        r.end();
    }, // end of _getMetadataByIDNode 

	// ### createIndex(ldpathProgram, success, error)
	// @author mere01
	// This method creates a new index on the contenthub, using the specified ldpath program.
    // To remove the index again, go to http://<stanbol>/contenthub/ldpath and click "Delete this
    // program" next to your LD Path Program.
	// **Parameters**:  
    // *{string}* **ldpathProgram** The specification of the new index in ldpath Syntax
    //		(see http://incubator.apache.org/stanbol/docs/trunk/contenthub/contenthub5min)
	// *{function}* **success** The success callback.  
	// *{function}* **error** The error callback.  
	// **Throws**:  
	// *nothing*  
	// **Returns**:  
	// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
	// **Example usage**:  
	//
//	     var stnblConn = new vie.StanbolConnector(opts);
//	     stnblConn.createIndex(<ldpath>,
//	                 function (res) { ... },
//	                 function (err) { ... });    
    createIndex: function(ldpath, success, error) {
    
		var connector = this;

		connector._iterate({
			method : connector._createIndex,
			methodNode : connector._createIndexNode,
			success : success,
			error : error,
			url : function (idx, opts) {
				var u = this.options.url[idx].replace(/\/$/, '');
				u += this.options.contenthub.urlPostfix.replace(/\/$/, '');
				u += "/ldpath/program";
				
				return u;
			},
			args : {
				content: ldpath
			},
			urlIndex : 0
		});
    }, // end of createIndex()
    
    _createIndex: function (url, args, success, error) {
	    	
    	jQuery.ajax({
    		
    		success: success,            
    		error: error,
            url: url,
            type: "POST",
            data: args.content
        });
    	
    }, // end of _createIndex
    
    _createIndexNode: function(url, args, success, error) {
        var request = require('request');
        var r = request({
            method: "POST",
            uri: url,
            body: args.content,
            headers: {
                Accept: args.format
            }
        }, function(err, response, body) {
            try {
                success({results: JSON.parse(body)});
            } catch (e) {
                error(e);
            }
        });
        r.end();
    }, // end of _createIndexNode 
    
	// ### deleteIndex(index, success, error)
    // TODO access problems for method DELETE
	// @author mere01
	// This method deletes the specified index from the contenthub, using contenthub/ldpath/program/<indexID>
    // TAKE CARE: This will not only delete a specific index, but also all the content items that were
    //		stored to this specific index!
	// **Parameters**:  
    // *{string}* **index** The name of the index to be deleted permanently from the contenthub.
	// *{function}* **success** The success callback.  
	// *{function}* **error** The error callback.  
	// **Throws**:  
	// *nothing*  
	// **Returns**:  
	// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
	// **Example usage**:  
	//
//	     var stnblConn = new vie.StanbolConnector(opts);
//	     stnblConn.createIndex(<index>,
//	                 function (res) { ... },
//	                 function (err) { ... });    
    deleteIndex: function(index, success, error) {
    
		var connector = this;
		connector._iterate({
			method : connector._deleteIndex,
			methodNode : connector._deleteIndexNode,
			success : success,
			error : error,
			url : function (idx, opts) {
				var u = this.options.url[idx].replace(/\/$/, '');
				u += this.options.contenthub.urlPostfix.replace(/\/$/, '');
				u += "/ldpath/program/" + index;
				
				return u;
			},
			args : {

			},
			urlIndex : 0
		});
    }, // end of deleteIndex()
    
    _deleteIndex: function (url, args, success, error) {
	    	
    	jQuery.ajax({
    		
    		success: success,            
    		error: error,
            url: url,
            type: "DELETE"
        });
    	
    }, // end of _deleteIndex
    
    _deleteIndexNode: function(url, args, success, error) {
        var request = require('request');
        var r = request({
            method: "DELETE",
            uri: url

        }, function(err, response, body) {
            try {
                success({results: JSON.parse(body)});
            } catch (e) {
                error(e);
            }
        });
        r.end();
    }, // end of _deleteIndexNode 
    
    
	// ### contenthubIndices(success, error, options)
	// @author mere01
	// This method returns a list of all indices that are currently being managed on the contenthub.  
	// **Parameters**:  
	// *{function}* **success** The success callback.  
	// *{function}* **error** The error callback.  
	// *{object}* **options** Options, unused here.   
	// **Throws**:  
	// *nothing*  
	// **Returns**:  
	// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
	// **Example usage**:  
	//
	//		var stnblConn = new vie.StanbolConnector(opts);
	//		stnblConn.contenthubIndices(
	//		function (res) { ... },
	//		function (err) { ... });  
    contenthubIndices: function(success, error, options) {
		options = (options)? options :  {};
		var connector = this;

		var successCB = function (indices) {
			var array = []
			for (var program in indices) 
			{
				var ldpath = "name=";
				console.log(program);
				ldpath += program;
				console.log(indices[program]);
				ldpath += "&program=" + indices[program];
				
				array.push(ldpath);
				}

			return success(array);
		};

		connector._iterate({
			method : connector._contenthubIndices,
			methodNode : connector._contenthubIndicesNode,
			success : successCB,
			error : error,
			url : function (idx, opts) {
				var u = this.options.url[idx].replace(/\/$/, '');
				u += this.options.contenthub.urlPostfix + "/ldpath";

				return u;
			},
			args : {
				options : options
			},
			urlIndex : 0
		});
	},

	_contenthubIndices : function (url, args, success, error) {
		jQuery.ajax({
			success: success,
			error: error,
			url: url,
			type: "GET",
			accepts: {"application/rdf+json": "application/rdf+json"}
		});
	}, // end of _contenthubIndices

	_contenthubIndicesNode: function(url, args, success, error) {
		var request = require('request');
		var r = request({
			method: "GET",
			uri: url,
			headers: {
				Accept: args.format
			}
		}, function(err, response, body) {
			try {
				success({results: JSON.parse(body)});
			} catch (e) {
				error(e);
			}
		});
		r.end();
	} // end of _contenthubIndicesNode
	
	});

})();//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - DBPedia service
// The DBPedia service allows a VIE developer to directly query
// the DBPedia database for entities and their properties. Obviously,
// the service does not allow for saving, removing or analyzing methods.
(function(){
	
	jQuery.extend(true, VIE.prototype.StanbolConnector.prototype, {
	    
		// ### analyze(text, success, error, options)
		// This method sends the given text to Apache Stanbol returns the result by the success callback.  
		// **Parameters**:  
		// *{string}* **text** The text to be analyzed.  
		// *{function}* **success** The success callback.  
		// *{function}* **error** The error callback.  
		// *{object}* **options** Options, like the ```format```, or the ```chain``` to be used.  
		// **Throws**:  
		// *nothing*  
		// **Returns**:  
		// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
		// **Example usage**:  
		//
		//     var stnblConn = new vie.StanbolConnector(opts);
		//     stnblConn.analyze("This is some text.",
		//                 function (res) { ... },
		//                 function (err) { ... });
	    analyze: function(text, success, error, options) {
	    	options = (options)? options :  {};
	    	var connector = this;
	        
	    	connector._iterate({
	        	method : connector._analyze,
	        	methodNode : connector._analyzeNode,
	        	url : function (idx, opts) {
	        		var chain = (opts.chain)? opts.chain : this.options.enhancer.chain;
	                
	        		var u = this.options.url[idx].replace(/\/$/, '');
	        		u += this.options.enhancer.urlPostfix + "/chain/" + chain.replace(/\/$/, '');
	        		return u;
	        	},
	        	args : {
	        		text : text,
	        		format : options.format || "application/rdf+json",
	        		options : options
	        	},
	        	success : success,
	        	error : error,
	        	urlIndex : 0
	        });
	    },
	    
	    _analyze : function (url, args, success, error) {
	    	jQuery.ajax({
	            success: success,
	            error: error,
	            url: url,
	            type: "POST",
	            data: args.text,
	            dataType: args.format,
	            contentType: "text/plain",
	            accepts: {"application/rdf+json": "application/rdf+json"}
	        });
	    },
	
	    _analyzeNode: function(url, args, success, error) {
	        var request = require('request');
	        var r = request({
	            method: "POST",
	            uri: url,
	            body: args.text,
	            headers: {
	                Accept: args.format,
	                'Content-Type': 'text/plain'
	            }
	        }, function(err, response, body) {
	            try {
	                success({results: JSON.parse(body)});
	            } catch (e) {
	                error(e);
	            }
	        });
	        r.end();
	    }
	    
	});

})();
//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - DBPedia service
// The DBPedia service allows a VIE developer to directly query
// the DBPedia database for entities and their properties. Obviously,
// the service does not allow for saving, removing or analyzing methods.
(function(){
		
    jQuery.extend(true, VIE.prototype.StanbolConnector.prototype, {
        
		// ### find(term, limit, offset, success, error, options)
		// This method finds entities given the term from the entity hub and returns the result by the success callback.  
		// **Parameters**:  
		// *{string}* **term** The term to be searched for. 
		// *{int}* **limit** The limit of results to be returned. 
		// *{int}* **offset** The offset to be search for.  
		// *{function}* **success** The success callback.  
		// *{function}* **error** The error callback.  
		// *{object}* **options** Options, like the ```format```. If ```local``` is set, only the local entities are accessed.  
		// **Throws**:  
		// *nothing*  
		// **Returns**:  
		// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
		// **Example usage**:  
		//
		//		     var stnblConn = new vie.StanbolConnector(opts);
		//		     stnblConn.find("Bishofsh", 10, 0,
		//		                 function (res) { ... },
		//		                 function (err) { ... });
		find: function(term, limit, offset, success, error, options) {
			options = (options)? options :  {};
			/* curl -X POST -d "name=Bishofsh&limit=10&offset=0" http://localhost:8080/entityhub/sites/find */

			var connector = this;

			if (!term || term === "") {
				error ("No term given!");
				return;
			}

			offset = (offset)? offset : 0;
			limit  = (limit)? limit : 10;

			connector._iterate({
				method : connector._find,
				methodNode : connector._findNode,
				success : success,
				error : error,
				url : function (idx, opts) {
					var site = (opts.site)? opts.site : this.options.entityhub.site;
					site = (site)? "/" + site : "s";

					var isLocal = opts.local;

					var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
					if (isLocal) {
						u += "/sites/find";
					} else {
						u += "/site" + site + "/find";
					}

					return u;
				},
				args : {
					term : term,
					offset : offset,
					limit : limit,
					format : options.format || "application/rdf+json",
					options : options
				},
				urlIndex : 0
			});
		},

		_find : function (url, args, success, error) {
			jQuery.ajax({
				success: success,
				error: error,
				url: url,
				type: "POST",
				data: "name=" + args.term + "&limit=" + args.limit + "&offset=" + args.offset,
				dataType: args.format,
				contentType : "application/x-www-form-urlencoded",
				accepts: {"application/rdf+json": "application/rdf+json"}
			});
		},

		_findNode: function(url, args, success, error) {
			var request = require('request');
			var r = request({
				method: "POST",
				uri: url,
				body : "name=" + args.term + "&limit=" + args.limit + "&offset=" + args.offset,
				headers: {
					Accept: args.format
				}
			}, function(err, response, body) {
				try {
					success({results: JSON.parse(body)});
				} catch (e) {
					error(e);
				}
			});
			r.end();
		},

		

		// ### lookup(uri, success, error, options)
		// TODO: add description  
		// **Parameters**:  
		// *{string}* **uri** The URI of the entity to be loaded.  
		// *{function}* **success** The success callback.  
		// *{function}* **error** The error callback.  
		// *{object}* **options** Options, ```create```.
		//		    If the parsed ID is a URI of a Symbol, than the stored information of the Symbol are returned in the requested media type ('accept' header field).
		//		    If the parsed ID is a URI of an already mapped entity, then the existing mapping is used to get the according Symbol.
		//		    If "create" is enabled, and the parsed URI is not already mapped to a Symbol, than all the currently active referenced sites are searched for an Entity with the parsed URI.
		//		    If the configuration of the referenced site allows to create new symbols, than a the entity is imported in the Entityhub, a new Symbol and EntityMapping is created and the newly created Symbol is returned.
		//		    In case the entity is not found (this also includes if the entity would be available via a referenced site, but create=false) a 404 "Not Found" is returned.
		//		    In case the entity is found on a referenced site, but the creation of a new Symbol is not allowed a 403 "Forbidden" is returned.   
		// **Throws**:  
		// *nothing*  
		// **Returns**:  
		// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
		lookup: function(uri, success, error, options) {
			options = (options)? options :  {};
			/*/lookup/?id=http://dbpedia.org/resource/Paris&create=false"*/
			var connector = this;

			uri = uri.replace(/^</, '').replace(/>$/, '');

			options.uri = uri;
			options.create = (options.create)? options.create : false;

			connector._iterate({
				method : connector._lookup,
				methodNode : connector._lookupNode,
				success : success,
				error : error,
				url : function (idx, opts) {

					var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
					u += "/lookup?id=" + escape(opts.uri) + "&create=" + opts.create;
					return u;
				},
				args : {
					format : options.format || "application/rdf+json",
					options : options
				},
				urlIndex : 0
			});
		},

		_lookup : function (url, args, success, error) {
			jQuery.ajax({
				success: success,
				error: error,
				url: url,
				type: "GET",
				dataType: args.format,
				contentType: "text/plain",
				accepts: {"application/rdf+json": "application/rdf+json"}
			});
		},

		_lookupNode: function(url, args, success, error) {
			var request = require('request');
			var r = request({
				method: "GET",
				uri: url,
				body: args.text,
				headers: {
					Accept: args.format
				}
			}, function(err, response, body) {
				try {
					success({results: JSON.parse(body)});
				} catch (e) {
					error(e);
				}
			});
			r.end();
		},


		// ### referenced(success, error, options)
		// This method returns a list of all referenced sites that the entityhub comprises.  
		// **Parameters**:  
		// *{function}* **success** The success callback.  
		// *{function}* **error** The error callback.  
		// *{object}* **options** Options, unused here.   
		// **Throws**:  
		// *nothing*  
		// **Returns**:  
		// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
		// **Example usage**:  
		//
		//		var stnblConn = new vie.StanbolConnector(opts);
		//		stnblConn.referenced(
		//		function (res) { ... },
		//		function (err) { ... });  
		referenced: function(success, error, options) {
			options = (options)? options :  {};
			var connector = this;

			var successCB = function (sites) {
				if (_.isArray(sites)) {
					var sitesStripped = [];
					for (var s = 0, l = sites.length; s < l; s++) {
						sitesStripped.push(sites[s].replace(/.+\/(.+?)\/?$/, "$1"));
					}
					return success(sitesStripped);
				} else {
					return success(sites);
				}
			};

			connector._iterate({
				method : connector._referenced,
				methodNode : connector._referencedNode,
				success : successCB,
				error : error,
				url : function (idx, opts) {
					var u = this.options.url[idx].replace(/\/$/, '');
					u += this.options.entityhub.urlPostfix + "/sites/referenced";

					return u;
				},
				args : {
					options : options
				},
				urlIndex : 0
			});
		},

		_referenced : function (url, args, success, error) {
			jQuery.ajax({
				success: success,
				error: error,
				url: url,
				type: "GET",
				accepts: {"application/rdf+json": "application/rdf+json"}
			});
		},

		_referencedNode: function(url, args, success, error) {
			var request = require('request');
			var r = request({
				method: "GET",
				uri: url,
				headers: {
					Accept: args.format
				}
			}, function(err, response, body) {
				try {
					success({results: JSON.parse(body)});
				} catch (e) {
					error(e);
				}
			});
			r.end();
		},

        // ### ldpath(query, success, error, options)
        // TODO.  
        // **Parameters**:  
        // TODO
        // *{function}* **success** The success callback.  
        // *{function}* **error** The error callback.  
        // *{object}* **options** Options, unused here.   
        // **Throws**:  
        // *nothing*  
        // **Returns**:  
        // *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
        ldpath: function(ldpath, context, success, error, options) {
            options = (options)? options :  {};
            var connector = this;

            context = (_.isArray(context))? context : [ context ];

            var contextStr = "";
            for (var c = 0; c < context.length; c++) {
                contextStr += "&context=" + context[c];
            }

            connector._iterate({
                method : connector._ldpath,
                methodNode : connector._ldpathNode,
                success : success,
                error : error,
                url : function (idx, opts) {
                    var site = (opts.site)? opts.site : this.options.entityhub.site;
                    site = (site)? "/" + site : "s";

                    var isLocal = opts.local;

                    var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
                    if (!isLocal)
                        u += "/site" + site;
                    u += "/ldpath";

                    return u;
                },
                args : {
                    ldpath : ldpath,
                    context : contextStr,
                    format : options.format || "application/rdf+json",
                    options : options
                },
                urlIndex : 0
            });
        },

        _ldpath : function (url, args, success, error) {
            jQuery.ajax({
                success: success,
                error: error,
                url: url,
                type: "POST",
                data : "ldpath=" + args.ldpath + args.context,
                contentType : "application/x-www-form-urlencoded",
                dataType: args.format,
                accepts: {"application/rdf+json": "application/rdf+json"}
            });
        },

        _ldpathNode: function(url, args, success, error) {
            var request = require('request');
            var r = request({
                method: "POST",
                uri: url,
                body : "ldpath=" + args.ldpath + context,
                headers: {
                    Accept: args.format
                }
            }, function(err, response, body) {
                try {
                    success({results: JSON.parse(body)});
                } catch (e) {
                    error(e);
                }
            });
            r.end();
        },

        // ### query(query, success, error, options)
        // TODO: add description
        // **Parameters**:  
        // TODO
        // *{function}* **success** The success callback.  
        // *{function}* **error** The error callback.  
        // *{object}* **options** Options, unused here.   
        // **Throws**:  
        // *nothing*  
        // **Returns**:  
        // *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
        query: function(query, success, error, options) {
            options = (options)? options :  {};
            var connector = this;

            connector._iterate({
                method : connector._query,
                methodNode : connector._queryNode,
                success : success,
                error : error,
                url : function (idx, opts) {
                    var site = (opts.site)? opts.site : this.options.entityhub.site;
                    site = (site)? "/" + site : "s";

                    var isLocal = opts.local;

                    var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
                    if (!isLocal)
                        u += "/site" + site;
                    u += "/query";
                    
                    console.log("querying " + u)
                    return u;
                },
                args : {
                    query : JSON.stringify(query),
                    format : "application/rdf+json",
                    options : options
                },
                urlIndex : 0
            });
        },

        _query : function (url, args, success, error) {
            jQuery.ajax({
                success: success,
                error: error,
                url: url,
                type: "POST",
                data : args.query,
                contentType : "application/json"
            });
        },

        _queryNode: function(url, args, success, error) {
            var request = require('request');
            var r = request({
                method: "POST",
                uri: url,
                body : "ldpath=" + args.ldpath + context,
                headers: {
                    Accept: args.format
                }
            }, function(err, response, body) {
                try {
                    success({results: JSON.parse(body)});
                } catch (e) {
                    error(e);
                }
            });
            r.end();
        },
        
                
        // ### createEntity(entity, success, error, option)
    	// @author mere01
    	// This method creates a new local entity on the Apache Stanbol entityhub endpoint.
        // If options.update is not set to true, the method fails if the entity is already existing in the entityhub.
    	// **Parameters**:  
    	// *{string}* **entity** the rdf xml formatted entity to be sent to the entityhub/entity/
        // *{function}* **success** The success callback.  
    	// *{function}* **error** The error callback.  
        // *{object}* **options** the options to append to the URL request, e.g. "update: true" will 
        // 						 enable updating an already existing entity.
    	// **Example usage**:  
    	//
        //    	     var stnblConn = new vie.StanbolConnector(opts);
        //    	     stnblConn.createEntity(<entity>,
        //    	                 function (res) { ... },
        //    	                 function (err) { ... },);	to create a new entity in the entityhub
        createEntity: function(entity, success, error, options) {
        	
        	console.log("createEntity receives arguments:")
        	console.log(entity)
        	console.log(success)
        	console.log(error)
        	console.log(options)
        	
    			options = (options)? options :  {};

    			var connector = this;
    	
    	    	connector._iterate({
    	        	method : connector._createEntity,
    	        	methodNode : connector._createEntityNode,
    	        
    	        	url : function (idx, opts) {
    	        		
    	                var update = options.update;
    	                
    	                var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
    	                
    	                u += "/entity";
    	                
    	                if (update) {
    	                	u += "?update=true";
    	                }
    	        		return u;
    	        	},
    	        	
    	        	args : {
    	        		entity : entity,
    	        		format : "application/rdf+xml"
    	        	},
    	        	success : success,
    	        	error : error,
    	        	urlIndex : 0
    	        });
    	    },

        _createEntity : function (url, args, success, error) {
        	jQuery.ajax({
                success: success,
                error: error,
                url: url,
                type: "POST",
                data: args.entity,
                contentType: args.format//,
            });
        }, 

        _createEntityNode: function(url, args, success, error) {
            var request = require('request');
            var r = request({
                method: "POST",
                uri: url,
                body: args.entity,
                headers: {
                    Accept: args.format,
                    'Content-Type': args.format
                }
            }, function(err, response, body) {
                try {
                    success({results: JSON.parse(body)});
                } catch (e) {
                    error(e);
                }
            });
            r.end();
        },
        // ### save(id, success, error, option)
        // This is an alias to createEntity

//        save: function () {
//            return this.createEntity(arguments[0], arguments[1], arguments[2], arguments[3]);

        save: function (entity, success, error, options) {
            return this.createEntity.call(this, entity, success, error, options);

        },

        // ### readEntity(uri, success, error, options)
        // This method loads all properties from an entity and returns the result by the success callback.  
        // **Parameters**:  
        // *{string}* **uri** The URI of the entity to be loaded.  
        // *{function}* **success** The success callback.  
        // *{function}* **error** The error callback.  
        // *{object}* **options** Options, like the ```format```, the ```site```. If ```local``` is set, only the local entities are accessed.   
        // **Throws**:  
        // *nothing*  
        // **Returns**:  
        // *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
        // **Example usage**:  
        //
        //       var stnblConn = new vie.StanbolConnector(opts);
        //       stnblConn.load("<http://dbpedia.org/resource/Barack_Obama>",
        //                   function (res) { ... },
        //                   function (err) { ... });

        readEntity: function (uri, success, error, options) {
            var connector = this;
            options = (options)? options :  {};

            console.log("uri:")
            console.log(uri)
            console.log(" is of type: " + typeof(uri));
            
            options.uri = uri.replace(/^</, '').replace(/>$/, '');

            connector._iterate({
                method : connector._readEntity,
                methodNode : connector._readEntityNode,
                success : success,
                error : error,
                url : function (idx, opts) {
                    var site = (opts.site)? opts.site : this.options.entityhub.site;
                    site = (site)? "/" + site : "s";

                    var isLocal = opts.local;

                    var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
                    if (isLocal) {
                        u += "/entity?id=" + escape(opts.uri);
                    } else {
                        u += "/site" + site + "/entity?id=" + escape(opts.uri);
                    }
                    return u;
                },
                args : {
                    format : options.format || "application/rdf+json",
                    options : options
                },
                urlIndex : 0
            });
        },

        _readEntity : function (url, args, success, error) {
            jQuery.ajax({
                success: success,
                error: error,
                url: url,
                type: "GET",
                dataType: args.format,
                contentType: "text/plain",
                accepts: {"application/rdf+json": "application/rdf+json"}
            });
        },

        _readEntityNode: function(url, args, success, error) {
            var request = require('request');
            var r = request({
                method: "GET",
                uri: url,
                body: args.text,
                headers: {
                    Accept: args.format
                }
            }, function(err, response, body) {
                try {
                    success({results: JSON.parse(body)});
                } catch (e) {
                    error(e);
                }
            });
            r.end();
        },
        // ### load(id, success, error, option)

        // This is an alias to createEntity
        load: function (uri, success, error, options) {
            return this.readEntity.call(this, uri, success, error, options);

        },
        
        
        // ### udpateEntity(id, success, error, option)
    	// @author mere01
    	// This method updates a local entity on the Apache Stanbol entityhub/entity endpoint.
    	// **Parameters**:  
    	// *{string}* **entity** the rdf xml formatted entity to be sent to the entityhub/entity/
        // *{function}* **success** The success callback.  
    	// *{function}* **error** The error callback.  
        // *{object}* **options** Options: if e.g. "create: 'true'" is specified, then the method will create
        //		the entity on the entityhub, if it does not already exist.        		
        // *{string}* **id** the ID of the entity which is to be updated (optional argument)
    	// **Throws**:  
    	// *nothing*  
    	// **Returns**:  
    	// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
    	// **Example usage**:  
    	//
//    	     var stnblConn = new vie.StanbolConnector(opts);
//    	     stnblConn.updateEntity(<entity>,
//    	                 function (res) { ... },
//    	                 function (err) { ... }, id);	to update the entity referenced by the specified ID
        updateEntity: function(entity, success, error, options, id) {
        	// TODO access problem for method PUT
    			id = (id)? (id) :  "";
    		
    			var connector = this;
    	
    	    	connector._iterate({
    	        	method : connector._updateEntity,
    	        	methodNode : connector._updateEntityNode,

    	        	url : function (idx, opts) {
    	        		
    	                var isCreate = opts.create;
    	                
    	                var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
    	                
    	                u += "/entity?id=" + escape(id);
    	                
    	                if (!isCreate) {
    	                	u += "&create=false";
    	                }
    	        		return u;
    	        	},
    	        	args : {
    	        		entity : entity,
    	        		format : "application/rdf+xml",
    	        		options: options
    	        	},
    	        	success : success,
    	        	error : error,
    	        	urlIndex : 0
    	        });
    	    }, // end of updateEntity

        _updateEntity : function (url, args, success, error) {
        	jQuery.ajax({
                success: success,
                error: error,
                url: url,
                type: "PUT",
                data: args.entity,
                contentType: args.format,
                accepts: "application/json"
                
            });
        }, // end of _updateEntity

        _updateEntityNode: function(url, args, success, error) {
            var request = require('request');
            var r = request({
                method: "PUT",
                uri: url,
                body: args.entity,
                headers: {
                    Accept: "application/json",
                    'Content-Type': args.format
                }
            }, function(err, response, body) {
                try {
                    success({results: JSON.parse(body)});
                } catch (e) {
                    error(e);
                }
            });
            r.end();
        }, // end of _updateEntityNode 

        // ### deleteEntity(id, success, error, options)
    	// @author mere01
    	// This method deletes a local entity from the Apache Stanbol entityhub/entity endpoint.
    	// **Parameters**:  
        // *{string}* **id** the ID of the entity which is to be deleted from the entityhub.
        // *{function}* **success** The success callback.  
    	// *{function}* **error** The error callback.  
        // *{object}* **options** Options. 
    	// **Throws**:  
    	// *nothing*  
    	// **Returns**:  
    	// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
    	// **Example usage**:  
    	//
        //    	     var stnblConn = new vie.StanbolConnector(opts);
        //    	     stnblConn.deleteEntity(
        //    					 id,
        //    	                 function (res) { ... },
        //    	                 function (err) { ... }, 
        //        				 );						to delete the entity referenced by the specified ID
        deleteEntity: function(id, success, error, options) {
        	// TODO access problem for method DELETE

    			var connector = this;
    	
    	    	connector._iterate({
    	        	method : connector._deleteEntity,
    	        	methodNode : connector._deleteEntityNode,

    	        	url : function (idx, opts) {
    	        		
    	                var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
    	                
    	                u += "/entity?id=" + escape(id);
    	                
    	        		return u;
    	        	},
    	        	args : {
    	        		format : "application/rdf+xml",
    	        		options: options
    	        	},
    	        	success : success,
    	        	error : error,
    	        	urlIndex : 0
    	        });
    	    }, // end of deleteEntity

        _deleteEntity : function (url, args, success, error) {
        	jQuery.ajax({
                success: success,
                error: error,
                url: url,
                type: "DELETE",
                contentType: args.format             
            });
        }, // end of _deleteEntity

        _deleteEntityNode: function(url, args, success, error) {
            var request = require('request');
            var r = request({
                method: "DELETE",
                uri: url,
                headers: {
                    Accept: "application/json",
                    'Content-Type': args.format
                }
            }, function(err, response, body) {
                try {
                    success({results: JSON.parse(body)});
                } catch (e) {
                    error(e);
                }
            });
            r.end();
        }, // end of _deleteEntityNode
     
     // ### getMapping(id, success, error, options)
    	// @author mere01
    	// This method looks up mappings from local Entities to Entities managed by a Referenced Site.
    	// **Parameters**:  
        // *{string}* **id** the ID of 	(a) the entity ID, when **options** specifies "entity: true"
        //								(b) the symbol ID, when **options** specified "symbol: true"
        //								(c) the mapping ID, otherwise
        // *{function}* **success** The success callback.  
    	// *{function}* **error** The error callback.  
        // *{object}* **options** Options. 
        //			If you want to look up the mappings for an entity, specify "entity: true".
        //			If you want to look up the mappings for a symbol, specify "symbol: true".
        //			If you want to look up the mappings by the mapping ID itself, specify nothing.
    	// **Throws**:  
    	// *nothing*  
    	// **Returns**:  
    	// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
    	// **Example usage**:  
    	//
        //    	     var stnblConn = new vie.StanbolConnector(opts);
        //    	     stnblConn.deleteEntity(
        //    					 "http://dbpedia.org/resource/Paris",
        //    	                 function (res) { ... },
        //    	                 function (err) { ... }, 
        //        				 {
        //							entity: true
    	//							});						to retrieve the mapping for dbpedia entity Paris
        getMapping: function(id, success, error, options) {

    			var connector = this;
    	
    	    	connector._iterate({
    	        	method : connector._getMapping,
    	        	methodNode : connector._getMappingNode,

    	        	url : function (idx, opts) {
    	        		
    	                var u = this.options.url[idx].replace(/\/$/, '') + this.options.entityhub.urlPostfix;
    	                
    	                u += "/mapping";
    	                
    	                var entity = options.entity;
    	                if (entity) {
    	                	u += "/entity";
    	                }
    	                
    	                var symbol = options.symbol;
    	                if (symbol) {
    	                	u += "/symbol";
    	                }
    	                
    	                u += "?id=" + escape(id);
    	                
    	        		return u;
    	        	},
    	        	args : {
    	        		format : "application/json",
    	        		options: options
    	        	},
    	        	success : success,
    	        	error : error,
    	        	urlIndex : 0
    	        });
    	    }, // end of getMapping

        _getMapping : function (url, args, success, error) {
        	jQuery.ajax({
                success: success,
                error: error,
                url: url,
                type: "GET",
                contentType: args.format             
            });
        }, // end of _getMapping

        _getMappingNode: function(url, args, success, error) {
            var request = require('request');
            var r = request({
                method: "GET",
                uri: url,
                headers: {
                    Accept: "application/json",
                    'Content-Type': args.format
                }
            }, function(err, response, body) {
                try {
                    success({results: JSON.parse(body)});
                } catch (e) {
                    error(e);
                }
            });
            r.end();
        } // end of _getMappingNode
     
	});
})();//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - DBPedia service
// The DBPedia service allows a VIE developer to directly query
// the DBPedia database for entities and their properties. Obviously,
// the service does not allow for saving, removing or analyzing methods.
(function(){

    jQuery.extend(true, VIE.prototype.StanbolConnector.prototype, {
        
		//### createFactSchema(url, schema, success, error, options)
		//TODO.  
		//**Parameters**:  
		//TODO
		//*{function}* **success** The success callback.  
		//*{function}* **error** The error callback.  
		//*{object}* **options** Options, unused here.   
		//**Throws**:  
		//*nothing*  
		//**Returns**:  
		//*{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
		createFactSchema: function(url, schema, success, error, options) {
			options = (options)? options :  {};
			var connector = this;

			options.url = url;

			connector._iterate({
				method : connector._createFactSchema,
				methodNode : connector._createFactSchemaNode,
				success : success,
				error : error,
				url : function (idx, opts) {
					var u = this.options.url[idx].replace(/\/$/, '');
					u += this.options.factstore.urlPostfix.replace(/\/$/, '');

					u += "/facts/" + escape(opts.url);

					return u;
				},
				args : {
					url : url,
					schema : schema,
					options : options
				},
				urlIndex : 0
			});
		},

		_createFactSchema : function (url, args, success, error) {
			jQuery.ajax({
				success: success,
				error: error,
				url: url,
				type: "PUT",
				data : args.schema,
				contentType : "application/json",
				dataType: "application/json"
			});
		},

		_createFactSchemaNode: function(url, args, success, error) {
			var request = require('request');
			var r = request({
				method: "PUT",
				uri: url,
				body : args.schema,
				headers: {
					Accept: "application/json",
					"Content-Type" : "application/json"
				}
			}, function(err, response, body) {
				try {
					success({results: JSON.parse(body)});
				} catch (e) {
					error(e);
				}
			});
			r.end();
		},

		createFact: function(fact, success, error, options) {
			options = (options)? options :  {};
			var connector = this;

			connector._iterate({
				method : connector._createFact,
				methodNode : connector._createFactNode,
				success : success,
				error : error,
				url : function (idx, opts) {
					var u = this.options.url[idx].replace(/\/$/, '');
					u += this.options.factstore.urlPostfix.replace(/\/$/, '');

					u += "/facts";

					return u;
				},
				args : {
					fact : fact,
					options : options
				},
				urlIndex : 0
			});
		},

		_createFact : function (url, args, success, error) {
			jQuery.ajax({
				success: success,
				error: error,
				url: url,
				type: "POST",
				data : args.fact,
				contentType : "application/json",
				dataType: "application/json"
			});
		},

		_createFactNode: function(url, args, success, error) {
			var request = require('request');
			var r = request({
				method: "POST",
				uri: url,
				body : args.fact,
				headers: {
					Accept: "application/json",
					"Content-Type" : "application/json"
				}
			}, function(err, response, body) {
				try {
					success({results: JSON.parse(body)});
				} catch (e) {
					error(e);
				}
			});
			r.end();
		},

		queryFact: function(query, success, error, options) {
			options = (options)? options :  {};
			var connector = this;

			connector._iterate({
				method : connector._queryFact,
				methodNode : connector._queryFactNode,
				success : success,
				error : error,
				url : function (idx, opts) {
					var u = this.options.url[idx].replace(/\/$/, '');
					u += this.options.factstore.urlPostfix.replace(/\/$/, '');

					u += "/query";

					return u;
				},
				args : {
					query : query,
					options : options
				},
				urlIndex : 0
			});
		},

		_queryFact : function (url, args, success, error) {
			jQuery.ajax({
				success: success,
				error: error,
				url: url,
				type: "POST",
				data : args.query,
				contentType : "application/json",
				dataType: "application/json"
			});
		},

		_queryFactNode: function(url, args, success, error) {
			var request = require('request');
			var r = request({
				method: "POST",
				uri: url,
				body : args.query,
				headers: {
					Accept: "application/json",
					"Content-Type" : "application/json"
				}
			}, function(err, response, body) {
				try {
					success({results: JSON.parse(body)});
				} catch (e) {
					error(e);
				}
			});
			r.end();
		}
	});

})();//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - DBPedia service
// The DBPedia service allows a VIE developer to directly query
// the DBPedia database for entities and their properties. Obviously,
// the service does not allow for saving, removing or analyzing methods.
(function(){

    jQuery.extend(true, VIE.prototype.StanbolConnector.prototype, {
        
		
	});
	
})();//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - DBPedia service
// The DBPedia service allows a VIE developer to directly query
// the DBPedia database for entities and their properties. Obviously,
// the service does not allow for saving, removing or analyzing methods.
(function(){

    jQuery.extend(true, VIE.prototype.StanbolConnector.prototype, {
        		
	});
	
})();//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - DBPedia service
// The DBPedia service allows a VIE developer to directly query
// the DBPedia database for entities and their properties. Obviously,
// the service does not allow for saving, removing or analyzing methods.
(function(){

    jQuery.extend(true, VIE.prototype.StanbolConnector.prototype, {
                
		// ### sparql(query, success, error, options)
		// TODO.  
		// **Parameters**:  
		// TODO
		// *{function}* **success** The success callback.  
		// *{function}* **error** The error callback.  
		// *{object}* **options** Options, unused here.   
		// **Throws**:  
		// *nothing*  
		// **Returns**:  
		// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
	     sparql: function(query, success, error, options) {
	     	options = (options)? options :  {};
	         var connector = this;
	      	
	      	connector._iterate({
	          	method : connector._sparql,
	          	methodNode : connector._sparqlNode,
	          	success : success,
	          	error : error,
	          	url : function (idx, opts) {
	                var u = this.options.url[idx].replace(/\/$/, '');
	                u += this.options.sparql.urlPostfix.replace(/\/$/, '');
	              
	      		    return u;
	          	},
	          	args : {
	          		query : query,
	          		options : options
	          	},
	          	urlIndex : 0
	          });
	      },
	      
	      _sparql : function (url, args, success, error) {
	      	jQuery.ajax({
	              success: success,
	              error: error,
	              url: url,
	              type: "POST",
	              data : "query=" + args.query,
	              contentType : "application/x-www-form-urlencoded"
	          });
	      },

	      _sparqlNode: function(url, args, success, error) {
	          var request = require('request');
	          var r = request({
	              method: "POST",
	              uri: url,
	              body : JSON.stringify({query : args.query}),
	              headers: {
	                  Accept: args.format
	              }
	          }, function(err, response, body) {
	              try {
	                  success({results: JSON.parse(body)});
	              } catch (e) {
	                  error(e);
	              }
	          });
	          r.end();
	      }
	});

})();if (!VIE.prototype.view) {
    VIE.prototype.view = {};
}

VIE.prototype.view.Collection = Backbone.View.extend({
    // Ensure the collection view gets updated when items get added or removed
    initialize: function() {
        this.template = this.options.template;
        this.service = this.options.service;
        if (!this.service) {
            throw "No RDFa service provided to the Collection View";
        }
        this.owner = this.options.owner;
        this.entityViews = {};
        _.bindAll(this, 'addItem', 'removeItem', 'refreshItems');
        this.collection.bind('add', this.addItem);
        this.collection.bind('remove', this.removeItem);
        this.collection.bind('reset', this.refreshItems);

        // Make the view aware of existing entities in collection
        var view = this;
        this.collection.forEach(function(entity) {
            view.registerItem(entity, view.collection);
        });
    },

    addItem: function(entity, collection) {
        if (collection !== this.collection) {
            return;
        }

        if (!this.template || this.template.length === 0) {
            return;
        }

        var entityView = this.service._registerEntityView(entity, this.cloneElement(this.template, entity));
        var entityElement = jQuery(entityView.render().el);
        if (entity.id) {
            this.service.setElementSubject(entity.getSubjectUri(), entityElement);
        }

        var entityIndex = collection.indexOf(entity);
        if (entityIndex === 0) {
          jQuery(this.el).prepend(entityElement);
        } else {
          var previousEntity = collection.at(entityIndex - 1);
          var previousView = this.entityViews[previousEntity.cid];
          if (previousView) {
            jQuery(previousView.el).after(entityElement);
          } else {
            jQuery(this.el).append(entityElement);
          }
        }

        // Ensure we catch all inferred predicates. We add these via JSONLD
        // so the references get properly Collectionized.
        var service = this.service;
        entityElement.parent('[rev]').each(function() {
            var predicate = jQuery(this).attr('rev');
            var relations = {};
            relations[predicate] = new service.vie.Collection();
            relations[predicate].vie = service.vie;
            var model = service.vie.entities.get(service.getElementSubject(this));
            if (model) {
                relations[predicate].addOrUpdate(model);
            }
            entity.set(relations);
        });
        
        this.trigger('add', entityView);
        this.entityViews[entity.cid] = entityView;
        entityElement.show();
    },

    registerItem: function(entity, collection) {
        var element = this.service.getElementBySubject(entity.id, this.el);
        if (!element) {
            return;
        }
        var entityView = this.service._registerEntityView(entity, element);
        this.entityViews[entity.cid] = entityView;
    },

    removeItem: function(entity) {
        if (!this.entityViews[entity.cid]) {
            return;
        }

        this.trigger('remove', this.entityViews[entity.cid]);
        jQuery(this.entityViews[entity.cid].el).remove();
        delete(this.entityViews[entity.cid]);
    },

    refreshItems: function(collection) {
        var view = this;
        _.each(this.entityViews, function(view, cid) {
          jQuery(view.el).remove();
        });
        this.entityViews = {};
        collection.forEach(function(entity) {
            view.addItem(entity, collection);
        });
    },

    cloneElement: function(element, entity) {
        var newElement = jQuery(element).clone(false);
        var service = this.service;
        if (newElement.attr('about') !== undefined) {
            // Direct match with container
            newElement.attr('about', '');
        }
        newElement.find('[about]').attr('about', '');
        var subject = this.service.getElementSubject(newElement);
        service.findPredicateElements(subject, newElement, false).each(function() {
            var predicate = service.getElementPredicate(jQuery(this));
            if (entity.get(predicate) && entity.get(predicate).isCollection) {
              return true;
            }
            service.writeElementValue(null, jQuery(this), '');
        });
        return newElement;
    }
});
if (!VIE.prototype.view) {
    VIE.prototype.view = {};
}

VIE.prototype.view.Entity = Backbone.View.extend({
    initialize: function(options) {
        this.service = options.service ? options.service : 'rdfa';
        this.vie = options.vie;

        // Ensure view gets updated when properties of the Entity change.
        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
    },

    // Rendering a view means writing the properties of the Entity back to
    // the element containing our RDFa annotations.
    render: function() {
        this.vie.save({
                element: this.el, 
                entity: this.model
            }).
            to(this.service).
            execute();
        return this;
    }
}); 
// Based on [Julian Aubourg's xdr.js](https://github.com/jaubourg/ajaxHooks/blob/master/src/ajax/xdr.js)  
// Internet Explorer 8 & 9 don't support the cross-domain request protocol known as CORS. 
// Their solution we use is called XDomainRequest. This module is a wrapper for 
// XDR using jQuery ajaxTransport, jQuery's way to support such cases.
// Author: Szaby Grünwald @ Salzburg Research, 2011
var root = this;
(function( jQuery ) {

if ( root.XDomainRequest ) {
	jQuery.ajaxTransport(function( s ) {
		if ( s.crossDomain && s.async ) {
			if ( s.timeout ) {
				s.xdrTimeout = s.timeout;
				delete s.timeout;
			}
			var xdr;
			return {
				send: function( _, complete ) {
					function callback( status, statusText, responses, responseHeaders ) {
						xdr.onload = xdr.onerror = xdr.ontimeout = jQuery.noop;
						xdr = undefined;
						complete( status, statusText, responses, responseHeaders );
					}
					xdr = new XDomainRequest();
					// For backends supporting header_* in the URI instead of real header parameters,
					// use the dataType for setting the Accept request header. e.g. Stanbol supports this.
					if(s.dataType){
					    var headerThroughUriParameters = "header_Accept=" + encodeURIComponent(s.dataType);
					    s.url = s.url + (s.url.indexOf("?") === -1 ? "?" : "&" ) + headerThroughUriParameters;
					}
					xdr.open( s.type, s.url );
					xdr.onload = function(e1, e2) {
						callback( 200, "OK", { text: xdr.responseText }, "Content-Type: " + xdr.contentType );
					};
					// XDR cannot differentiate between errors, 
					// we call every error 404. Could be changed to another one.
					xdr.onerror = function(e) {
					    console.error(JSON.stringify(e));
						callback( 404, "Not Found" );
					};
					if ( s.xdrTimeout ) {
						xdr.ontimeout = function() {
							callback( 0, "timeout" );
						};
						xdr.timeout = s.xdrTimeout;
					}
					xdr.send( ( s.hasContent && s.data ) || null );
				},
				abort: function() {
					if ( xdr ) {
						xdr.onerror = jQuery.noop();
						xdr.abort();
					}
				}
			};
		}
	});
}
})( jQuery );

})();
