/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 */
/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */
/**
 * @class Teradata.util.JSON
 * http://www.json.org/js.html
 * @singleton
 */
Teradata.util.JSON = new (function(){
    var useHasOwn = !!{}.hasOwnProperty,
        isNative = function() {
            var useNative = null;

            return function() {
                if (useNative === null) {
                    useNative = Teradata.USE_NATIVE_JSON && window.JSON && JSON.toString() == '[object JSON]';
                }
        
                return useNative;
            };
        }(),
        pad = function(n) {
            return n < 10 ? "0" + n : n;
        },
        doDecode = function(json){
            return json ? eval("(" + json + ")") : "";    
        },
        doEncode = function(o){
            if(!Teradata.isDefined(o) || o === null){
                return "null";
            }else if(Teradata.isArray(o)){
                return encodeArray(o);
            }else if(Teradata.isDate(o)){
                return Teradata.util.JSON.encodeDate(o);
            }else if(Teradata.isString(o)){
                return encodeString(o);
            }else if(typeof o == "number"){
                //don't use isNumber here, since finite checks happen inside isNumber
                return isFinite(o) ? String(o) : "null";
            }else if(Teradata.isBoolean(o)){
                return String(o);
            }else {
                var a = ["{"], b = null, i = null, v;
                for (i in o) {
                    // don't encode DOM objects
                    if(!o.getElementsByTagName){
                        if(!useHasOwn || o.hasOwnProperty(i)) {
                            v = o[i];
                            switch (typeof v) {
                            case "undefined":
                            case "function":
                            case "unknown":
                                break;
                            default:
                                if(b){
                                    a.push(',');
                                }
                                a.push(doEncode(i), ":",
                                        v === null ? "null" : doEncode(v));
                                b = true;
                            }
                        }
                    }
                }
                a.push("}");
                return a.join("");
            }    
        },
        m = {
            "\b": '\\b',
            "\t": '\\t',
            "\n": '\\n',
            "\f": '\\f',
            "\r": '\\r',
            '"' : '\\"',
            "\\": '\\\\'
        },
        encodeString = function(s){
            if (/["\\\x00-\x1f]/.test(s)) {
                return '"' + s.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                    var c = m[b];
                    if(c){
                        return c;
                    }
                    c = b.charCodeAt();
                    return "\\u00" +
                        Math.floor(c / 16).toString(16) +
                        (c % 16).toString(16);
                }) + '"';
            }
            return '"' + s + '"';
        },
        encodeArray = function(o){
            var a = ["["], b = null, i, l = o.length, v;
                for (i = 0; i < l; i += 1) {
                    v = o[i];
                    switch (typeof v) {
                        case "undefined":
                        case "function":
                        case "unknown":
                            break;
                        default:
                            if (b) {
                                a.push(',');
                            }
                            a.push(v === null ? "null" : Teradata.util.JSON.encode(v));
                            b = true;
                    }
                }
                a.push("]");
                return a.join("");
        };

    /**
     * <p>Encodes a Date. This returns the actual string which is inserted into the JSON string as the literal expression.
     * <b>The returned value includes enclosing double quotation marks.</b></p>
     * <p>The default return format is "yyyy-mm-ddThh:mm:ss".</p>
     * <p>To override this:</p><pre><code>
Teradata.util.JSON.encodeDate = function(d) {
    return d.format('"Y-m-d"');
};
</code></pre>
     * @param {Date} d The Date to encode
     * @return {String} The string literal to use in a JSON string.
     */
    this.encodeDate = function(o){
        return '"' + o.getFullYear() + "-" +
                pad(o.getMonth() + 1) + "-" +
                pad(o.getDate()) + "T" +
                pad(o.getHours()) + ":" +
                pad(o.getMinutes()) + ":" +
                pad(o.getSeconds()) + '"';
    };

    this.encode = function() {
        var ec = null;
        /**
         * Encodes an Object, Array or other value
         * @param {Mixed} o The variable to encode
         * @return {String}
         */
        return function(o) {
            if (!ec) {
                // setup encoding function on first access
                ec = isNative() ? JSON.stringify : doEncode;
            }
            return ec(o);
        };
    }();


    /**
     * Decodes (parses) a JSON string to an object. If the JSON is invalid, this function throws a SyntaxError unless the safe option is set.
     * @param {String} json The JSON string
     * @return {Object} The resulting object
     */
    this.decode = function() {
        var dc = null;
        return function(json) {
            if (!dc) {
                // setup decoding function on first access
                dc = isNative() ? JSON.parse : doDecode;
            }
            return dc(json);
        };
    }();

})();
/**
 * Shorthand for {@link Teradata.util.JSON#encode}
 * @param {Mixed} o The variable to encode
 * @return {String} The JSON string
 * @member Teradata
 * @method encode
 */
Teradata.encode = Teradata.util.JSON.encode;
/**
 * Shorthand for {@link Teradata.util.JSON#decode}
 * @param {String} json The JSON string
 * @param {Boolean} safe (optional) Whether to return null or throw an exception if the JSON is invalid.
 * @return {Object} The resulting object
 * @member Teradata
 * @method decode
 */
Teradata.decode = Teradata.util.JSON.decode;
/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */
(function(){

var TDUTIL = Teradata.util,
    EACH = Teradata.each,
    TRUE = true,
    FALSE = false;
/**
 * @class Teradata.util.Observable
 * Base class that provides a common interface for publishing events. Subclasses are expected to
 * to have a property "events" with all the events defined, and, optionally, a property "listeners"
 * with configured listeners defined.<br>
 * For example:
 * <pre><code>
Employee = Teradata.extend(Teradata.util.Observable, {
    constructor: function(config){
        this.name = config.name;
        this.addEvents({
            "fired" : true,
            "quit" : true
        });

        // Copy configured listeners into *this* object so that the base class&#39;s
        // constructor will add them.
        this.listeners = config.listeners;

        // Call our superclass constructor to complete construction process.
        Employee.superclass.constructor.call(this, config)
    }
});
</code></pre>
 * This could then be used like this:<pre><code>
var newEmployee = new Employee({
    name: employeeName,
    listeners: {
        quit: function() {
            // By default, "this" will be the object that fired the event.
            alert(this.name + " has quit!");
        }
    }
});
</code></pre>
 */
TDUTIL.Observable = function(){
    /**
     * @cfg {Object} listeners (optional) <p>A config object containing one or more event handlers to be added to this
     * object during initialization.  This should be a valid listeners config object as specified in the
     * {@link #addListener} example for attaching multiple handlers at once.</p>
     * <br><p><b><u>DOM events from TeradataJs {@link Teradata.Component Components}</u></b></p>
     * <br><p>While <i>some</i> TeradataJs Component classes export selected DOM events (e.g. "click", "mouseover" etc), this
     * is usually only done when extra value can be added. For example the {@link Teradata.DataView DataView}'s
     * <b><code>{@link Teradata.DataView#click click}</code></b> event passing the node clicked on. To access DOM
     * events directly from a Component's HTMLElement, listeners must be added to the <i>{@link Teradata.Component#getEl Element}</i> after the Component
     * has been rendered. A plugin can simplify this step:<pre><code>
// Plugin is configured with a listeners config object.
// The Component is appended to the argument list of all handler functions.
Teradata.DomObserver = Teradata.extend(Object, {
    constructor: function(config) {
        this.listeners = config.listeners ? config.listeners : config;
    },

    // Component passes itself into plugin&#39;s init method
    init: function(c) {
        var p, l = this.listeners;
        for (p in l) {
            if (Teradata.isFunction(l[p])) {
                l[p] = this.createHandler(l[p], c);
            } else {
                l[p].fn = this.createHandler(l[p].fn, c);
            }
        }

        // Add the listeners to the Element immediately following the render call
        c.render = c.render.{@link Function#createSequence createSequence}(function() {
            var e = c.getEl();
            if (e) {
                e.on(l);
            }
        });
    },

    createHandler: function(fn, c) {
        return function(e) {
            fn.call(this, e, c);
        };
    }
});

var combo = new Teradata.form.ComboBox({

    // Collapse combo when its element is clicked on
    plugins: [ new Teradata.DomObserver({
        click: function(evt, comp) {
            comp.collapse();
        }
    })],
    store: myStore,
    typeAhead: true,
    mode: 'local',
    triggerAction: 'all'
});
     * </code></pre></p>
     */
    var me = this, e = me.events;
    if(me.listeners){
        me.on(me.listeners);
        delete me.listeners;
    }
    me.events = e || {};
};

TDUTIL.Observable.prototype = {
    // private
    filterOptRe : /^(?:scope|delay|buffer|single)$/,

    /**
     * <p>Fires the specified event with the passed parameters (minus the event name).</p>
     * <p>An event may be set to bubble up an Observable parent hierarchy (See {@link Teradata.Component#getBubbleTarget})
     * by calling {@link #enableBubble}.</p>
     * @param {String} eventName The name of the event to fire.
     * @param {Object...} args Variable number of parameters are passed to handlers.
     * @return {Boolean} returns false if any of the handlers return false otherwise it returns true.
     */
    fireEvent : function(){
        var a = Array.prototype.slice.call(arguments, 0),
            ename = a[0].toLowerCase(),
            me = this,
            ret = TRUE,
            ce = me.events[ename],
            cc,
            q,
            c;
        if (me.eventsSuspended === TRUE) {
            if (q = me.eventQueue) {
                q.push(a);
            }
        }
        else if(typeof ce == 'object') {
            if (ce.bubble){
                if(ce.fire.apply(ce, a.slice(1)) === FALSE) {
                    return FALSE;
                }
                c = me.getBubbleTarget && me.getBubbleTarget();
                if(c && c.enableBubble) {
                    cc = c.events[ename];
                    if(!cc || typeof cc != 'object' || !cc.bubble) {
                        c.enableBubble(ename);
                    }
                    return c.fireEvent.apply(c, a);
                }
            }
            else {
                a.shift();
                ret = ce.fire.apply(ce, a);
            }
        }
        return ret;
    },

    /**
     * Appends an event handler to this object.
     * @param {String}   eventName The name of the event to listen for.
     * @param {Function} handler The method the event invokes.
     * @param {Object}   scope (optional) The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b>
     * @param {Object}   options (optional) An object containing handler configuration.
     * properties. This may contain any of the following properties:<ul>
     * <li><b>scope</b> : Object<div class="sub-desc">The scope (<code><b>this</b></code> reference) in which the handler function is executed.
     * <b>If omitted, defaults to the object which fired the event.</b></div></li>
     * <li><b>delay</b> : Number<div class="sub-desc">The number of milliseconds to delay the invocation of the handler after the event fires.</div></li>
     * <li><b>single</b> : Boolean<div class="sub-desc">True to add a handler to handle just the next firing of the event, and then remove itself.</div></li>
     * <li><b>buffer</b> : Number<div class="sub-desc">Causes the handler to be scheduled to run in an {@link Teradata.util.DelayedTask} delayed
     * by the specified number of milliseconds. If the event fires again within that time, the original
     * handler is <em>not</em> invoked, but the new handler is scheduled in its place.</div></li>
     * <li><b>target</b> : Observable<div class="sub-desc">Only call the handler if the event was fired on the target Observable, <i>not</i>
     * if the event was bubbled up from a child Observable.</div></li>
     * </ul><br>
     * <p>
     * <b>Combining Options</b><br>
     * Using the options argument, it is possible to combine different types of listeners:<br>
     * <br>
     * A delayed, one-time listener.
     * <pre><code>
myDataView.on('click', this.onClick, this, {
single: true,
delay: 100
});</code></pre>
     * <p>
     * <b>Attaching multiple handlers in 1 call</b><br>
     * The method also allows for a single argument to be passed which is a config object containing properties
     * which specify multiple handlers.
     * <p>
     * <pre><code>
myGridPanel.on({
'click' : {
    fn: this.onClick,
    scope: this,
    delay: 100
},
'mouseover' : {
    fn: this.onMouseOver,
    scope: this
},
'mouseout' : {
    fn: this.onMouseOut,
    scope: this
}
});</code></pre>
 * <p>
 * Or a shorthand syntax:<br>
 * <pre><code>
myGridPanel.on({
'click' : this.onClick,
'mouseover' : this.onMouseOver,
'mouseout' : this.onMouseOut,
 scope: this
});</code></pre>
     */
    addListener : function(eventName, fn, scope, o){
        var me = this,
            e = null,
            oe,
            ce;
            
        if (typeof eventName == 'object') {
            o = eventName;
            for (e in o) {
                oe = o[e];
                if (!me.filterOptRe.test(e)) {
                    me.addListener(e, oe.fn || oe, oe.scope || o.scope, oe.fn ? oe : o);
                }
            }
        } else {
            eventName = eventName.toLowerCase();
            ce = me.events[eventName] || TRUE;
            if (typeof ce == 'boolean') {
                me.events[eventName] = ce = new TDUTIL.Event(me, eventName);
            }
            ce.addListener(fn, scope, typeof o == 'object' ? o : {});
        }
    },

    /**
     * Removes an event handler.
     * @param {String}   eventName The type of event the handler was associated with.
     * @param {Function} handler   The handler to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
     * @param {Object}   scope     (optional) The scope originally specified for the handler.
     */
    removeListener : function(eventName, fn, scope){
        var ce = this.events[eventName.toLowerCase()];
        if (typeof ce == 'object') {
            ce.removeListener(fn, scope);
        }
    },

    /**
     * Removes all listeners for this object
     */
    purgeListeners : function(){
        var events = this.events,
            evt,
            key = null;
        for(key in events){
            evt = events[key];
            if(typeof evt == 'object'){
                evt.clearListeners();
            }
        }
    },

    /**
     * Adds the specified events to the list of events which this Observable may fire.
     * @param {Object|String} o Either an object with event names as properties with a value of <code>true</code>
     * or the first event name string if multiple event names are being passed as separate parameters.
     * @param {string} Optional. Event name if multiple event names are being passed as separate parameters.
     * Usage:<pre><code>
this.addEvents('storeloaded', 'storecleared');
</code></pre>
     */
    addEvents : function(o){
        var me = this;
        me.events = me.events || {};
        if (typeof o == 'string') {
            var a = arguments,
                i = a.length;
            while(i--) {
                me.events[a[i]] = me.events[a[i]] || TRUE;
            }
        } else {
            Teradata.applyIf(me.events, o);
        }
    },

    /**
     * Checks to see if this object has any listeners for a specified event
     * @param {String} eventName The name of the event to check for
     * @return {Boolean} True if the event is being listened for, else false
     */
    hasListener : function(eventName){
        var e = this.events[eventName.toLowerCase()];
        return typeof e == 'object' && e.listeners.length > 0;
    },

    /**
     * Suspend the firing of all events. (see {@link #resumeEvents})
     * @param {Boolean} queueSuspended Pass as true to queue up suspended events to be fired
     * after the {@link #resumeEvents} call instead of discarding all suspended events;
     */
    suspendEvents : function(queueSuspended){
        this.eventsSuspended = TRUE;
        if(queueSuspended && !this.eventQueue){
            this.eventQueue = [];
        }
    },

    /**
     * Resume firing events. (see {@link #suspendEvents})
     * If events were suspended using the <tt><b>queueSuspended</b></tt> parameter, then all
     * events fired during event suspension will be sent to any listeners now.
     */
    resumeEvents : function(){
        var me = this,
            queued = me.eventQueue || [];
        me.eventsSuspended = FALSE;
        delete me.eventQueue;
        EACH(queued, function(e) {
            me.fireEvent.apply(me, e);
        });
    }
};

var OBSERVABLE = TDUTIL.Observable.prototype;
/**
 * Appends an event handler to this object (shorthand for {@link #addListener}.)
 * @param {String}   eventName     The type of event to listen for
 * @param {Function} handler       The method the event invokes
 * @param {Object}   scope         (optional) The scope (<code><b>this</b></code> reference) in which the handler function is executed.
 * <b>If omitted, defaults to the object which fired the event.</b>
 * @param {Object}   options       (optional) An object containing handler configuration.
 * @method
 */
OBSERVABLE.on = OBSERVABLE.addListener;
/**
 * Removes an event handler (shorthand for {@link #removeListener}.)
 * @param {String}   eventName     The type of event the handler was associated with.
 * @param {Function} handler       The handler to remove. <b>This must be a reference to the function passed into the {@link #addListener} call.</b>
 * @param {Object}   scope         (optional) The scope originally specified for the handler.
 * @method
 */
OBSERVABLE.un = OBSERVABLE.removeListener;

/**
 * Removes <b>all</b> added captures from the Observable.
 * @param {Observable} o The Observable to release
 * @static
 */
TDUTIL.Observable.releaseCapture = function(o){
    o.fireEvent = OBSERVABLE.fireEvent;
};

function createTargeted(h, o, scope){
    return function(){
        if(o.target == arguments[0]){
            h.apply(scope, Array.prototype.slice.call(arguments, 0));
        }
    };
};

function createBuffered(h, o, l, scope){
    l.task = new TDUTIL.DelayedTask();
    return function(){
        l.task.delay(o.buffer, h, scope, Array.prototype.slice.call(arguments, 0));
    };
};

function createSingle(h, e, fn, scope){
    return function(){
        e.removeListener(fn, scope);
        return h.apply(scope, arguments);
    };
};

function createDelayed(h, o, l, scope){
    return function(){
        var task = new TDUTIL.DelayedTask(),
            args = Array.prototype.slice.call(arguments, 0);
        if(!l.tasks) {
            l.tasks = [];
        }
        l.tasks.push(task);
        task.delay(o.delay || 10, function(){
            l.tasks.remove(task);
            h.apply(scope, args);
        }, scope);
    };
};

TDUTIL.Event = function(obj, name){
    this.name = name;
    this.obj = obj;
    this.listeners = [];
};

TDUTIL.Event.prototype = {
    addListener : function(fn, scope, options){
        var me = this,
            l;
        scope = scope || me.obj;
        if(!me.isListening(fn, scope)){
            l = me.createListener(fn, scope, options);
            if(me.firing){ // if we are currently firing this event, don't disturb the listener loop
                me.listeners = me.listeners.slice(0);
            }
            me.listeners.push(l);
        }
    },

    createListener: function(fn, scope, o){
        o = o || {};
        scope = scope || this.obj;
        var l = {
            fn: fn,
            scope: scope,
            options: o
        }, h = fn;
        if(o.target){
            h = createTargeted(h, o, scope);
        }
        if(o.delay){
            h = createDelayed(h, o, l, scope);
        }
        if(o.single){
            h = createSingle(h, this, fn, scope);
        }
        if(o.buffer){
            h = createBuffered(h, o, l, scope);
        }
        l.fireFn = h;
        return l;
    },

    findListener : function(fn, scope){
        var list = this.listeners,
            i = list.length,
            l;

        scope = scope || this.obj;
        while(i--){
            l = list[i];
            if(l){
                if(l.fn == fn && l.scope == scope){
                    return i;
                }
            }
        }
        return -1;
    },

    isListening : function(fn, scope){
        return this.findListener(fn, scope) != -1;
    },

    removeListener : function(fn, scope){
        var index,
            l,
            k,
            me = this,
            ret = FALSE;
        if((index = me.findListener(fn, scope)) != -1){
            if (me.firing) {
                me.listeners = me.listeners.slice(0);
            }
            l = me.listeners[index];
            if(l.task) {
                l.task.cancel();
                delete l.task;
            }
            k = l.tasks && l.tasks.length;
            if(k) {
                while(k--) {
                    l.tasks[k].cancel();
                }
                delete l.tasks;
            }
            me.listeners.splice(index, 1);
            ret = TRUE;
        }
        return ret;
    },

    // Iterate to stop any buffered/delayed events
    clearListeners : function(){
        var me = this,
            l = me.listeners,
            i = l.length;
        while(i--) {
            me.removeListener(l[i].fn, l[i].scope);
        }
    },

    fire : function(){
        var me = this,
            listeners = me.listeners,
            len = listeners.length,
            i = 0,
            l;

        if(len > 0){
            me.firing = TRUE;
            var args = Array.prototype.slice.call(arguments, 0);
            for (; i < len; i++) {
                l = listeners[i];
                if(l && l.fireFn.apply(l.scope || me.obj || window, args) === FALSE) {
                    return (me.firing = FALSE);
                }
            }
        }
        me.firing = FALSE;
        return TRUE;
    }

};
})();
/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.data.Record
 * @extends Object
 * 数据记录
 */
Teradata.data.Record = Teradata.extend(Object, {
	
	// private
	constructor: function(data, id, store) {
		Teradata.data.Record.superclass.constructor.call(this);
		this.id = id;
		this.store = store;
		this.data = data;
	},
	
	/**
	 * 设置字段值
	 * @param {String} field
	 * @param {Mixed} value
	 * @param {Boolean} suspendedEvent
	 */
	set: function(field, value, suspendedEvent) {
		if(this.hasField(field)) {
			var oldValue = this.get(field);
			if(oldValue !== value) {
				this.data[field] = value;
				this.modified = true;
				if(!suspendedEvent) {
					this.store.fireEvent('update', this.store, this, field, value, oldValue);
				}
			}
		}
	},
	
	/**
	 * 获取指定字段值
	 * @param {String} field
	 * @return {Mixed}
	 */
	get: function(field) {
		return this.data[field];
	},
	
	/**
	 * 判断是否存在指定字段
	 * @param {String} field
	 * @return {Boolean}
	 */
	hasField: function(field) {
		return !this.store || this.store.hasField(field);
	},
	
	// private
	destroy: function() {
		delete this.store;
		delete this.data;
		delete this.id;
	}
});/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.data.Store
 * @extends Teradata.util.Observable
 * 数据存储对象
 */
Teradata.data.Store = Teradata.extend(Teradata.util.Observable, {
	
	/**
	 * @cfg {String/Array} identifier
	 * 唯一标识名称
	 */
	identifier: 'id',
	
	/**
	 * @cfg {String} method
	 * 请求方式
	 */
	method: 'GET',
	
	/**
	 * @cfg {Object} params
	 * 读取数据的请求参数。
	 * 当Store对象中存在排序参数，排序参数将以参数形式提交，所以在该参数中禁止出现key为"sort"的值，否则将被排序参数覆盖。
	 * 排序参数为一个字符串："field1,direction1;field2,direction2..."。
	 */
	
	/**
	 * @cfg {Boolean} autoLoad
	 * 自动加载数据
	 */
	autoLoad: false,
	
	defaultSortDirection: 'desc',
	
	/**
	 * @cfg {String} dataFormat
	 * 数据格式，可选值['array', 'map']
	 * 当使用array时，数据的顺序需要与字段顺序一致。
	 */
	dataFormat: 'array',
	
	// private
	constructor: function(config) {
		Teradata.data.Store.superclass.constructor.call(this, config);
		this.datas = config.datas;
		this.initFields(config.fields);
		this.url = config.url;
		this.method = config.method || this.method;
		this.identifier = config.identifier || this.identifier;
		this.dataFormat = config.dataFormat || this.dataFormat;
		if(config.sort) {
			this.addSort(config.sort);
		}
		this.addEvents(
			/**
			 * @event remove
			 * 当删除记录前触发
			 * @param {Teradata.data.Store} this
			 * @param {Teradata.data.Record} record
			 * @param {Number} index
			 */
			'remove',
			
			/**
			 * @event clear
			 * 当清除所有记录前触发
			 * @param {Teradata.data.Store} this
			 * @param {Array} records
			 */
			'clear',
			
			/**
			 * @event add
			 * 当添加记录后触发
			 * @param {Teradata.data.Store} this
			 * @param {Teradata.data.Record} record
			 * @param {Number} index
			 */
			'add',
			
			/**
			 * @event beforeload
			 * 加载记录前触发
			 * @param {Teradata.data.Store} this 
			 */
			'beforeload',
			
			/**
			 * @event load
			 * 当记录加载完毕后触发
			 * @param {Teradata.data.Store} this
			 * @param {Array} records
			 */
			'load',
			
			/**
			 * @event update
			 * 当记录更新后触发
			 * @param {Teradata.data.Store} this
			 * @param {Teradata.data.Record} record
			 * @param {Number} index
			 * @param {String} field
			 * @param {Mixed} value
			 * @param {Mixed} oldValue
			 */
			'update'
		);
		
		if(config.params) {
			this.params = config.params;
		}
		
		this.map = {};
		this.records = [];
		
		if(this.datas) {
			var records = this.createRecords(this.datas);
			this.add(records);
			delete this.datas;
		} else if(this.url && this.autoLoad) {
			this.load();
		}
	},
	
	// private
	initFields: function(fs) {
		var fields = [];
		for(var i = 0; i < fs.length; i++) {
			fields.push(new Teradata.data.Field(fs[i]));
		}
		this.fields = fields;
	},
	
	// private
	initSort: function() {
		if(!this.sort) {
			this.sort = [];
		}
	},
	
	/**
	 * 添加排序
	 * @param {Object} sort 排序对象，例如：{field: 'field1', direction: 'asc'}
	 * @param {Boolean} autoLoad 是否自动加载
	 */
	addSort: function(sort, autoLoad) {
		this.initSort();
		if(Teradata.isArray(sort)) {
			for(var i = 0; i < sort.length; i++) {
				this.addSort(sort[i], false);
			}
			if(autoLoad === true && this.url) {
				this.load();
			}
		} else if(!Teradata.isEmpty(sort)){
			if(Teradata.isString(sort)) {
				sort = {
					field: sort
				};
			}
			if(sort.field) {
				var index = this.hasSort(sort);
				var s = index !== false ? this.sort[index] : {
					direction: this.defaultSortDirection
				};
				Teradata.apply(s, sort);
				if(index === false) {
					this.sort.push(s);
				}
				if(autoLoad === true && this.url) {
					this.load();
				}
			}
		}
	},
	
	/**
	 * 判定是否存在指定字段的排序参数
	 * @param {String/Teradata.data.Field/Object} field 字段名称或字段对象
	 * @return {Boolean/Number}
	 */
	hasSort: function(sort) {
		this.initSort();
		if(sort instanceof Teradata.data.Field) {
			sort = sort.name;
		} else if(Teradata.isString(sort.field)) {
			sort = sort.field;
		}
		if(!Teradata.isEmpty(sort) && Teradata.isString(sort)) {
			for(var i = 0; i < this.sort.length; i++) {
				if(this.sort[i].field === sort) {
					return i;
				}
			}
		}
		return false;
	},
	
	/**
	 * 通过指定字段删除排序条件
	 * @param {String/Teradata.data.Field/Object} field 字段名称或字段对象
	 */
	removeSort: function(field) {
		var index = this.hasSort(field);
		if(index !== false) {
			this.sort.remove(this.sort[index]);
		}
	},
	
	// private
	createRecords: function(datas) {
		var records = [];
		if(datas && datas.length > 0) {
			for(var i = 0; i < datas.length; i++) {
				records.push(this.createRecord(datas[i]));
			}
		}
		return records;
	},
	
	// private
	createRecord: function(data) {
		var id = this.findId(data);
		if(!Teradata.isPrimitive(id)) {
			id = this.generateId();
		}
		var recordData = {};
		for(var j = 0; j < this.fields.length; j++) {
			var field = this.fields[j];
			var value = this.findData(data, field);
			recordData[field.name] = this.parseData(value, field.getType());
		}
		return new Teradata.data.Record(recordData, id, this);
	},
	
	// private
	parseData: function() {
		var parsers = {
			'string': function(data) {
				return data ? data.toString() : '';
			},
			'integer': function(data) {
				return parseInt(data, 10);
			},
			'float': function(data) {
				return parseFloat(data);
			},
			'date': function(data, format) {
				if(Teradata.isNumber(data)) {
					var date = new Date();
					date.setTime(data);
					return date;
				} else if(Teradata.isString(data)) {
					var date = Date.parseDate(data, format);
					return date;
				} else if(Teradata.isDate(data)) {
					return data;
				}
				return null;
			},
			'boolean': function(data) {
				return !!data;
			}
		};
		return function(data, type, extraParams) {
			var parser = parsers[type];
			if(parser) {
				return parser.call(this, data, extraParams);
			} else {
				return data;
			}
		};
	}(),
	
	/**
	 * @private
	 * 在数据中找到id值
	 * @param {Array} data
	 * @return {Mixed}
	 */
	findId: function(data) {
		if(this.identifier instanceof Array) {
			var id = '';
			for(var i = 0; i < this.identifier.length; i++) {
				id += this.findData(data, this.identifier[i]);
			}
		} else {
			return this.findData(data, this.identifier);
		}
	},
	
	/**
	 * @private
	 * 在数据中找到指定字段值
	 * @param {Array} data
	 * @param {String} field
	 * @return {Mixed}
	 */
	findData: function(data, field) {
		if(this.dataFormat == 'map') {
			return data[field.getName ? field.getName() : field];
		} else {
			var index = this.getFieldIndex(field);
			if(index != -1) {
				return data[index];
			}
		}
	},
	
	// private
	getFieldIndex: function(field) {
		if(Teradata.isString(field)) {
			for(var i = 0; i < this.fields.length; i++) {
				if(this.fields[i].name === field) {
					return i;
				}
			}
		} else {
			return this.fields.indexOf(field);
		}
		return -1;
	},
	
	// private
	generateId: function() {
		var AUTO_ID = 100000;
		return function() {
			return 'teradata-record-' + (AUTO_ID ++);
		};
	}(),
	
	/**
	 * 通过指定ID删除记录
	 * @param {String} id
	 */
	removeById: function(id) {
		this.remove(this.getById(id));
	},
	
	/**
	 * 删除指定记录
	 * @param {Teradata.data.Record} record
	 */
	remove: function(record) {
		var r = this.map[record.id];
		if(r == record) {
			this.fireEvent('remove', this, r, index);
			delete this.map[record.id];
			var index = this.records.indexOf(record);
			this.records.removeAt(index);
		}
	},
	
	/**
	 * 删除所有记录
	 */
	removeAll: function() {
		if(this.records && this.records.length > 0) {
			this.fireEvent('clear', this, this.records);
			delete this.map;
			delete this.records;
			this.map = {};
			this.records = [];
		}
	},
	
	/**
	 * 添加记录
	 * @param {Mixed} records
	 * @param {Boolean} suspendedEvent
	 */
	add: function(records, suspendedEvent) {
		if(records instanceof Array) {
			var index = this.records.length;
			for(var i = 0; i < records.length; i++) {
				this.add(records[i], true);
			}
			if(!suspendedEvent) {
				this.fireEvent('add', this, records, index);
			}
		} else {
			if(Teradata.isPrimitive(records.id)) {
				var r = this.getById(records.id);
				if(r) {
					return;
				}
			} else {
				throw 'Invalid record id, is not JavaScript "primitive", a string, number or boolean.';
				return;
			}
			var index = this.records.length;
			for(var field in records.data) {
				if(!this.hasField(field)) {
					delete records.data[field];
				}
			}
			this.records.push(records);
			this.map[records.id] = records;
			if(!suspendedEvent) {
				this.fireEvent('add', this, records, index);
			}
		}
	},
	
	/**
	 * 通过索引值获得记录
	 * @param {Number} index
	 * @return {Teradata.data.Record}
	 */
	getAt: function(index) {
		return this.records[index];
	},
	
	/**
	 * 通过编号查找记录
	 * @param {String} id
	 * @return {Teradata.data.Record}
	 */
	getById: function(id) {
		return this.map[id];
	},
	
	/**
	 * 加载服务端的数据
	 */
	load: function() {
		if(this.fireEvent('beforeload', this) !== false) {
			var fn = Teradata.Ajax[this.method.toLowerCase()];
			if(Teradata.isFunction(fn)) {
				var params = this.params || {};
				if(this.sort) {
					var sort = [];
					for(var i = 0; i < this.sort.length; i++) {
						sort.push([this.sort[i].field, this.sort[i].direction].join(','));
					}
					Teradata.apply(params, {
						sort: sort.join(';')
					});
				}
				fn(this.url, params, this.loadData.createDelegate(this), 'json');
			} else {
				throw 'Request method "' + this.method + '" is not supported.';
			}
		}
	},
	
	/**
	 * 加载数据
	 * @param {Array} datas
	 * @param {Boolean} append
	 */
	loadData: function(datas, append) {
		var records = this.createRecords(datas);
		if(append !== true) {
			this.removeAll();
		}
		this.add(records, true);
		this.fireEvent('load', this, records);
	},
	
	/**
	 * 判断是否存在指定字段
	 * @param {String} field 字段名
	 * @return {Boolean}
	 */
	hasField: function(field) {
		return this.getFieldIndex(field) != -1;
	},
	
	/**
	 * 获得字段类型
	 * @param {String} field
	 */
	getFieldType: function(field) {
		field = this.fields[this.getFieldIndex(field)];
		if(field) {
			return field.getType();
		}
	},
	
	/**
	 * 获取Store对象中的记录条目数。
	 */
	getCount: function() {
		return this.records.length;
	},
	
	/**
	 * 通过指定字段名与值查找符合条件的记录
	 * @param {String} field
	 * @param {Mixed} value
	 * @return {Array}
	 */
	findBy: function(field, value) {
		var result = [];
		for(var i = 0; i < this.records.length; i++) {
			var r = this.records[i];
			if(r.get(field) == value) {
				result.push(r);
			}
		}
		return result;
	},
	
	/**
	 * 通过指定字段名与值查找单个符合条件的记录，返回最先匹配的结果。
	 * @param {String} field
	 * @param {Mixed} value
	 * @return {Array}
	 */
	getBy: function(field, value) {
		for(var i = 0; i < this.records.length; i++) {
			var r = this.records[i];
			if(r.get(field) == value) {
				return r;
			}
		}
	},
	
	/**
	 * 获得修改过的记录集
	 * @return {Array}
	 */
	getModifiedRecords: function() {
		var mrs = [];
		for(var i = 0; i < this.records.length; i++) {
			var r = this.records[i];
			if(r.modified === true) {
				mrs.push(r);
			}
		}
		return mrs;
	},
	
	// private
	destroy: function() {
		for(var i = 0; i < this.records.length; i++) {
			var record = this.records[i];
			delete this.map[record.id];
			record.destroy();
		}
		delete this.records;
		delete this.map;
		delete this.fields;
	}
});

/**
 * @class Teradata.data.Field
 * @extends Object
 * 字段
 */
Teradata.data.Field = Teradata.extend(Object, {
	
	defaultType: 'string',
	
	// private
	constructor: function(config) {
		if(Teradata.isString(config)) {
			this.name = config;
		} else {
			Teradata.apply(this, config);
		}
	},
	
	/**
	 * 获得字段名
	 * @return {String}
	 */
	getName: function() {
		return this.name;
	},
	
	/**
	 * 获得字段类型
	 * @return {String}
	 */
	getType: function() {
		return this.type || this.defaultType;
	}
});/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.data.JsonStore
 * @extends Teradata.data.Store
 * Json结构数据存储对象
 */
Teradata.data.JsonStore = Teradata.extend(Teradata.data.Store, {
	
	constructor: function(config) {
		if(config.json) {
			config.datas = config.json[this.root];
		}
		this.root = config.root;
		Teradata.data.JsonStore.superclass.constructor.apply(this, arguments);
	},
	
	/**
	 * 加载数据
	 * @param {Array} datas
	 * @param {Boolean} append
	 */
	loadData: function(datas, append) {
		this.json = datas;
		var contents = datas[this.root];
		delete datas[this.root];
		Teradata.data.JsonStore.superclass.loadData.call(this, contents, append);
	}
});/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.data.PaginationStore
 * @extends Teradata.data.JsonStore
 * 带有分页功能的Store
 */
Teradata.data.PaginationStore = Teradata.extend(Teradata.data.JsonStore, {
	
	/**
	 * @cfg {Number} currentPage
	 * 当前页标
	 */
	currentPage: 0,
	
	/**
	 * @cfg {Number} pageSize
	 * 每页记录数
	 */
	pageSize: 20,
	
	constructor: function(config) {
		Teradata.data.PaginationStore.superclass.constructor.call(this, config);
		this.pageSize = config.pageSize || this.pageSize;
	},
	
	/**
	 * 获得每页记录数
	 * @return {Number}
	 */
	getPageSize: function() {
		return this.pageSize;
	},
	
	/**
	 * 获得页数
	 * @return {Number}
	 */
	getPages: function() {
		var total = this.getTotalCount();
		var size = this.getPageSize();
		var m = total % size;
		return m != 0 ? parseInt(total / size + 1, 10) : parseInt(total / size, 10);
	},
	
	/**
	 * 获得总记录数
	 * @return {Number}
	 */
	getTotalCount: function() {
		return parseInt(this.json['count'], 10);
	},
	
	/**
	 * 获得当前页标
	 * @return {Number}
	 */
	getCurrentPage: function() {
		return this.currentPage;
	},
	
	/**
	 * 下一页
	 */
	nextPage: function() {
		if(this.hasNextPage()) {
			this.currentPage += 1;
			this.load();
		}
	},
	
	/**
	 * 上一页
	 */
	prevPage: function() {
		if(this.hasPrevPage()) {
			this.currentPage -= 1;
			this.load();
		}
	},
	
	/**
	 * 跳转到指定页
	 * @param {Number} pageNum 页码
	 */
	forwardPage: function(pageNum) {
		if(this.hasPage(pageNum) && pageNum != this.getCurrentPage()) {
			this.currentPage = pageNum;
			this.load();
		}
	},
	
	/**
	 * 是否存在下一页
	 */
	hasNextPage: function() {
		return this.hasPage(this.currentPage + 1);
	},
	
	/**
	 * 是否存在上一页
	 */
	hasPrevPage: function() {
		return this.hasPage(this.currentPage - 1);
	},
	
	/**
	 * 是否存在指定页
	 * @param {Number} pageNum 页码
	 */
	hasPage: function(pageNum) {
		return pageNum >= 0 && pageNum < this.getPages();
	},
	
	load: function() {
		this.params = this.params || {};
		this.params.start = this.getCurrentPage() * this.pageSize;
		this.params.limit = this.pageSize;
		this.params.end = this.params.start + this.params.limit;
		Teradata.data.PaginationStore.superclass.load.apply(this, arguments);
	}
});/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.Shadow
 * 阴影
 */
Teradata.Shadow = Teradata.extend(Object, {
	
	/**
	 * @cfg {Number} offset
	 * 阴影偏移量
	 */
	offset: 4,
	
	/**
	 * @cfg {Number} opacity
	 * 透明度
	 */
	opacity: 0.6,
	
	// private
	constructor: function(config) {
		this.id = Teradata.id(null, 'teradata-shadow-');
		Teradata.apply(this, config);
	},
	
	/**
	 * 应用到指定节点
	 * @param {Mixed} el
	 */
	applyTo: function(el) {
		this.target = Teradata.get(el);
		if(!this.el) {
			this.createEl();
		}
		if(this.el.parent().get(0) && this.el.parent().get(0) != this.target.parent().get(0)) {
			this.el.remove();
		} else if (this.el.parent().get(0) != this.target.parent().get(0)) {
			this.el.insertAfter(this.target);
		}
		this.el.css('z-index', this.getTargetZIndex() - 1);
		this.el.width(this.target.outerWidth());
		var h = this.target.outerHeight();
		this.el.height(h);
		this.mcEl.height(h - this.tcEl.outerHeight() - this.bcEl.outerHeight());
		
		this.el.css('top', this.offset);
		this.el.css('left', this.offset);
	},
	
	// private
	createEl: function() {
		var el = Teradata.get(document.createElement('div'));
		el.attr('id', this.id);
		
		el.addClass('teradata-shadow');
		
		var tl = Teradata.get(document.createElement('div'));
		var tr = Teradata.get(document.createElement('div'));
		var t = Teradata.get(document.createElement('div'));
		
		tl.addClass('teradata-shadow-tl');
		tr.addClass('teradata-shadow-tr');
		t.addClass('teradata-shadow-t');
		
		el.append(tl);
		tl.append(tr);
		tr.append(t);
		
		var ml = Teradata.get(document.createElement('div'));
		var mr = Teradata.get(document.createElement('div'));
		var m = Teradata.get(document.createElement('div'));
		
		ml.addClass('teradata-shadow-l');
		mr.addClass('teradata-shadow-r');
		m.addClass('teradata-shadow-m');
		
		el.append(ml);
		ml.append(mr);
		mr.append(m);
		
		var bl = Teradata.get(document.createElement('div'));
		var br = Teradata.get(document.createElement('div'));
		var b = Teradata.get(document.createElement('div'));
		
		bl.addClass('teradata-shadow-bl');
		br.addClass('teradata-shadow-br');
		b.addClass('teradata-shadow-b');
		
		el.append(bl);
		bl.append(br);
		br.append(b);
		
		el.css('opacity', this.opacity);
		
		this.el = el;
		this.mcEl = m;
		this.tcEl = t;
		this.bcEl = b;
	},
	
	// private
	getTargetZIndex: function() {
		return parseInt(this.target.css('z-index'), 10);
	}
});/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.ComponentMgr
 * 组件管理器
 */
Teradata.ComponentMgr = function() {
	var types = {};
	var cache = {};
	var AUTO_ID = 10000;
	return {
		
		/**
		 * 注册类型
		 * @param {String} name 类型名称
		 * @param {Class} type 类型
		 */
		reg: function(name, type) {
			if(Teradata.ADF.WIDGET_ROUNDED_CORNERS === false) {
				type.prototype.corners = 'none';
			}
			types[name] = type;
			type.xtype = name;
		},
		
		/**
		 * 通过组件配置创建组件对象
		 * @param {Object} config
		 * @param {String} defaultType
		 * @returns {Teradata.Component}
		 */
		create: function(config, defaultType) {
			return config.xtype ? new types[config.xtype](config) : new types[defaultType](config);
		},
		
		/**
		 * 通过ID获得组件
		 * @param {String} id 组件ID
		 * @return {Teradata.Component}
		 */
		get: function(id) {
			return cache[id];
		},
		
		/**
		 * 生成编号
		 * @return {Number} 编号
		 */
		generateId: function() {
			return AUTO_ID ++;
		},
		
		/**
		 * 注册组件
		 * @param {Teradata.Component} comp 组件对象
		 */
		register: function(comp) {
			cache[comp.getId()] = comp;
		},
		
		/**
		 * 撤销注册组件
		 * @param {Teradata.Component} comp
		 */
		unregister: function(comp) {
			delete cache[comp.getId()];
		}
	};
}();

Teradata.apply(Teradata, {
	reg: Teradata.ComponentMgr.reg,
	create: Teradata.ComponentMgr.create
});/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.Component
 * @extends Teradata.util.Observable
 * UI组件
 */
Teradata.Component = function(config) {
	
	Teradata.apply(this, config);
	
	if(this.el) {
		this.el = Teradata.get(this.el);
	}
	
	this.addEvents(
		
		/**
		 * @event added
		 * 组件被添加到容器后触发
		 * @param {Teradata.Component} this
		 * @param {Teradata.widget.Container} container 所加入的容器
		 * @param {Number/Element} position 被加入的位置
		 */
		'added',
			
		/**
		 * @event disable
		 * 组件被禁用后触发
		 * @param {Teradata.Component} this
		 */
		'disable',
		
		/**
		 * @event enable
		 * 组件被激活后触发
		 * @param {Teradata.Component} this
		 */
		'enable',
		
		/**
		 * @event beforeshow
		 * 组件在显示之前触发
		 * @param {Teradata.Component} this
		 */
		'beforeshow',
		
		/**
		 * @event show
		 * 组件在显示之后触发
		 * @param {Teradata.Component} this
		 */
		'show',
		
		/**
		 * @event beforehide
		 * 组件在隐藏之前触发
		 * @param {Teradata.Component} this
		 */
		'beforehide',
		
		/**
		 * @event hide
		 * 组件在隐藏之后触发
		 * @param {Teradata.Component} this
		 */
		'hide',
		
		/**
		 * @event removed
		 * 组件在被删除之后触发
		 * @param {Teradata.Component} this
		 * @param {Teradata.widget.Container} container 所属容器
		 */
		'removed',
		
		/**
		 * @event beforerender
		 * 组件在渲染前触发，当该事件监听器返回值为false时，阻断组件渲染动作执行。
		 * @param {Teradata.Component} this
		 */
		'beforerender',
		
		/**
		 * @event render
		 * 在组件渲染时触发
		 * @param {Teradata.Component} this
		 */
		'render',
		
		/**
		 * @event afterrender
		 * 在组件渲染后触发
		 * @param {Teradata.Component} this
		 */
		'afterrender',
		
		/**
		 * @event beforedestroy
		 * 在组件销毁前触发，当该事件监听器返回值为false时，阻断组件销毁动作执行。
		 * @param {Teradata.Component} this
		 */
		'beforedestroy',
        
		/**
		 * @event destroy
		 * 在组件销毁后触发
		 * @param {Teradata.Component} this
		 */
        'destroy'
		
	);
	this.getId();
	
	Teradata.ComponentMgr.register(this);
	Teradata.Component.superclass.constructor.call(this);
	
	this.initComponent();
	
	if(this.applyTo) {
		this.render(this.applyTo);
	}
};

Teradata.extend(Teradata.Component, Teradata.util.Observable, {
	
	/**
	 * @cfg {String} hideMode
	 * 隐藏模式，可选值有：['hidden', 'visibility', 'position']
	 * <ul>
	 *     <li>hidden: 以该方式隐藏后无法取得组件的尺寸，组件的位置不被占用。</li>
	 *     <li>visibility: 以该方法隐藏可以取得组件的尺寸，但组件会占用所在位置。</li>
	 *     <li>position: 该方法不实际隐藏组件，而是将组件位置移动到坐标(-10000, -10000)，隐藏后可以取得组件的尺寸且不占用所在位置。</li>
	 * </ul>
	 */
	hideMode: 'hidden',
	
	/**
	 * @cfg {String} autoEl
	 * 自动创建的节点名称
	 */
	autoEl: 'div',
	
	/**
	 * @cfg {String} idAttr
	 * 标识组件ID的元素属性
	 */
	idAttr: 'id',
	
	/**
	 * @cfg {Boolean} hidden
	 * 是否为隐藏的
	 */
	hidden: false,
	
	// private
	initComponent: function() {
		if(this.listeners){
            this.on(this.listeners);
            delete this.listeners;
        }
	},
	
	// private
	render: function(container, position) {
		if(!this.rendered && this.fireEvent('beforerender', this) !== false) {
			if(!this.container && this.el) {
				this.el = Teradata.get(this.el);
                container = this.el.get(0).parentNode;
                this.allowDomMove = false;
			}
			
			this.container = Teradata.get(container);
			
			this.rendered = true;
			
            if(position !== undefined){
                if(Teradata.isNumber(position)){
                    position = this.container.get(0).childNodes[position];
                }else{
                    position = Teradata.get(position).get(0);
                }
            }
			
			this.onRender(this.container, position || null);
			
			if(this.cls){
                this.el.addClass(this.cls);
                delete this.cls;
            }
            if(this.style){
                this.el.css(this.style);
                delete this.style;
            }
            
            this.fireEvent('render', this);
            
            var contentTarget = this.getContentTarget();
            if (this.html){
                contentTarget.html(this.html);
                delete this.html;
            }
            this.afterRender(this.container);
            
            if(this.hidden){
                this.doHide();
            }
            if(this.disabled){
                this.disable(true);
            }
            
            this.fireEvent('afterrender', this);
		}
	},
	
	// private
	onRender: function(ct, position) {
		if(!this.el && this.autoEl){
            this.el = Teradata.createDom(this.autoEl);
        }
        if(this.el){
            this.el = Teradata.get(this.el);
            if (!this.el.attr(this.idAttr)) {
                this.el.attr(this.idAttr, this.getId());
            }
            if(this.allowDomMove !== false){
            	if(position) {
            		(this.itemWrap || this.el).insertBefore(position);
            	} else {
            		ct.append(this.itemWrap || this.el);
            	}
            	if(this.itemWrap) {
            		this.itemWrap.append(this.el);
            	}
            }
            (this.itemWrap || this.el).addClass('teradata-widget');
        }
	},
	
	// private
	afterRender: Teradata.emptyFn,
	
	// private
	getContentTarget: function() {
		return this.el;
	},
	
	// private
	getId: function() {
		if(this.el && !this.id) {
			this.id = this.el.attr('comp-id') || this.el.attr(this.idAttr);
		}
		return this.id ? this.id : (this.id = 'teradata-ui-comp-' + Teradata.ComponentMgr.generateId());
	},
	
	/**
	 * 显示组件
	 * @return {Teradata.Component}
	 */
	show: function(){
        if(this.fireEvent('beforeshow', this) !== false){
            this.hidden = false;
            if(this.autoRender){
                this.render(Teradata.isBoolean(this.autoRender) ? Teradata.query('body') : this.autoRender);
            }
            if(this.rendered){
                this.onShow();
            }
            this.fireEvent('show', this);
        }
        return this;
    },

    // private
    onShow: function(){
        this.getPositionEl().removeClass('teradata-hide-' + this.hideMode);
    },

    /**
     * 隐藏组件
     * @return {Teradata.Component}
     */
    hide: function(){
        if(this.fireEvent('beforehide', this) !== false){
            this.doHide();
            this.fireEvent('hide', this);
        }
        return this;
    },

    // private
    doHide: function(){
        this.hidden = true;
        if(this.rendered){
            this.onHide();
        }
    },

    // private
    onHide: function(){
        this.getPositionEl().addClass('teradata-hide-' + this.hideMode);
    },
	
	// private
	bind: function(el, eventName, fn, scope) {
		el = el || this.el;
		var func = function(e) {
			if(!this.disabled) {
				var s = e.data.scope;
				return fn.apply(s, arguments);
			}
		}.createDelegate(this);
		el.bind(eventName, {scope: scope || this}, func);
	},

    /**
     * 设置可见
     * @param {Boolean} visible
     * @return {Teradata.Component}
     */
    setVisible: function(visible){
        return this[visible ? 'show' : 'hide']();
    },

    /**
     * 是否为可见的
     * @returns {Boolean}
     */
    isVisible: function(){
        return this.rendered && this.getPositionEl().is(':visible') && !this.getPositionEl().hasClass('teradata-hide-position');
    },
	
	/**
	 * 设置禁用
	 * @param {Boolean} disabled
	 */
	disable: function(disabled) {
		this.disabled = disabled;
		var positionEl = this.getPositionEl();
		this.el.attr('disabled', disabled);
		positionEl.attr('disabled', disabled);
		if(disabled && this.disabledCls) {
			positionEl.addClass(this.disabledCls);
		} else if(this.disabledCls){
			positionEl.removeClass(this.disabledCls);
		}
	},
	
	/**
	 * 销毁组件
	 */
	destroy: function(){
        if(!this.isDestroyed){
            if(this.fireEvent('beforedestroy', this) !== false){
                this.destroying = true;
                this.beforeDestroy();
                if(this.ownerCt && this.ownerCt.remove){
                    this.ownerCt.remove(this, false);
                }
                if(this.rendered){
                    this.getPositionEl().remove();
                    if(this.actionMode == 'container' || this.removeMode == 'container'){
                        this.container.remove();
                    }
                }
                
                if(this.focusTask && this.focusTask.cancel){
                    this.focusTask.cancel();
                }
                this.onDestroy();
                Teradata.ComponentMgr.unregister(this);
                this.fireEvent('destroy', this);
                this.purgeListeners();
                this.destroying = false;
                this.isDestroyed = true;
            }
        }
    },
    
    // private
    beforeDestroy: Teradata.emptyFn,

    // private
    onDestroy: Teradata.emptyFn,
    
    // private
    onRemoved: function() {
        this.fireEvent('removed', this, this.ownerCt);
        delete this.ownerCt;
    },

    // private
    onAdded: function(container, pos) {
        this.ownerCt = container;
        this.fireEvent('added', this, container, pos);
    },
    
    /**
     * @private
     * 获得组件标志性的节点
     * @return {Element}
     */
    getEl: function(){
        return this.el;
    },
    
    /**
     * @private
     * 获得用于定位组件的节点
     * @return {Element}
     */
    getPositionEl: function() {
    	return this.el;
    },
    
    /**
     * 获取组件的xtype
     * @return {String}
     */
    getXType: function() {
    	return this.constructor.xtype;
    }
});
/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.BoxComponent
 * @extends Teradata.Component
 * 盒模型组件
 */
Teradata.BoxComponent = Teradata.extend(Teradata.Component, {
	
	// private, set in afterRender to signify that the component has been rendered
    boxReady : false,
    
    // private, used to defer height settings to subclasses
    deferHeight: false,
    
    /**
     * @cfg {Number} width
     * 宽度值，单位px
     */
    
    /**
     * @cfg {Number} height
     * 高度值，单位px
     */
    
    /**
     * @cfg {Mixed} autoScroll
     * 自动滚动，可选值有[true, 'x', 'y']
     */
    
    /**
     * @cfg {String} corners
     * 渲染角，可选值('all', 'lr', 'l', 'r', 't', 'b', 'none')
     */
    corners: 'all',
	
	// private
    initComponent : function(){
    	if(this.el) {
    		this.width = this.el.width();
    		this.height = this.el.height();
    	}
        Teradata.BoxComponent.superclass.initComponent.call(this);
        this.addEvents(
            /**
             * @event resize
             * 组件设置尺寸后触发.
             * @param {Teradata.Component} this
             * @param {Number} adjWidth 调整后的宽度
             * @param {Number} adjHeight 调整后的高度
             * @param {Number} rawWidth 原始宽度
             * @param {Number} rawHeight 原始高度
             */
            'resize'
        );
    },
    
    /**
     * 设置盒模型尺寸
     * @param {Number} w
     * @param {Number} h
     * @return {Teradata.BoxComponent} this
     */
    setSize : function(w, h){

        // support for standard size objects
        if(typeof w == 'object'){
            h = w.height;
            w = w.width;
        }
        if (Teradata.isDefined(w) && Teradata.isDefined(this.boxMinWidth) && (w < this.boxMinWidth)) {
            w = this.boxMinWidth;
        }
        if (Teradata.isDefined(h) && Teradata.isDefined(this.boxMinHeight) && (h < this.boxMinHeight)) {
            h = this.boxMinHeight;
        }
        if (Teradata.isDefined(w) && Teradata.isDefined(this.boxMaxWidth) && (w > this.boxMaxWidth)) {
            w = this.boxMaxWidth;
        }
        if (Teradata.isDefined(h) && Teradata.isDefined(this.boxMaxHeight) && (h > this.boxMaxHeight)) {
            h = this.boxMaxHeight;
        }
        // not rendered
        if(!this.boxReady){
            this.width  = w;
            this.height = h;
            return this;
        }

        // prevent recalcs when not needed
        if(this.cacheSizes !== false && this.lastSize && this.lastSize.width == w && this.lastSize.height == h){
            return this;
        }
        this.lastSize = {width: w, height: h};
        var adj = this.adjustSize(w, h),
            aw = adj.width,
            ah = adj.height,
            rz;
        if(aw !== undefined || ah !== undefined){ // this code is nasty but performs better with floaters
            rz = this.getResizeEl();
            if(!this.deferHeight && aw !== undefined && ah !== undefined){
                rz.width(aw);
                rz.height(ah);
            }else if(!this.deferHeight && ah !== undefined){
                rz.height(ah);
            }else if(aw !== undefined){
                rz.width(aw);
            }
            this.onResize(aw, ah, w, h);
            this.fireEvent('resize', this, aw, ah, w, h);
        }
        return this;
    },
    
    // private
    onResize: function(aw, ah, w, h) {
    	var ct = this.getContentTarget();
    	if(this.corners == 'all') {
    		ct.height(ah - (this.top ? this.top.outerHeight() : 0) - (this.bottom ? this.bottom.outerHeight() : 0));
    	} else if(this.corners == 'lr') {
    		var width = aw - (this.ml ? this.ml.outerWidth() : 0) - (this.mr ? this.mr.outerWidth() : 0);
        	ct.width(width);
    	} else if(this.corners == 'l') {
    		var width = aw - (this.ml ? this.ml.outerWidth() : 0);
        	ct.width(width);
    	} else if(this.corners == 'r') {
    		var width = aw - (this.mr ? this.mr.outerWidth() : 0);
        	ct.width(width);
    	} else if(this.corners == 'b') {
    		ct.height(ah - (this.bottom ? this.bottom.outerHeight() : 0));
    	} else if(this.corners == 't') {
    		ct.height(ah - (this.top ? this.top.outerHeight() : 0));
    	}
    },
    
    /**
     * 设置盒模型宽度
     * @param {Number} width 宽度
     * @return {Teradata.BoxComponent} this
     */
    setWidth: function(width) {
    	return this.setSize(width);
    },
    
    /**
     * 设置盒模型高度
     * @param {Number} height 高度
     * @return {Teradata.BoxComponent} this
     */
    setHeight: function(height) {
    	return this.setSize(undefined, height);
    },
    
    /**
     * 获得宽度
     * @return {Number} 宽度
     */
    getWidth: function() {
    	return this.getResizeEl().width();
    },
    
    /**
     * 获得高度
     * @return {Number} 高度
     */
    getHeight: function() {
    	return this.getResizeEl().height();
    },
    
    /**
     * Sets the overflow on the content element of the component.
     * @param {Boolean/String} scroll True to allow the Component to auto scroll.
     * @return {Ext.BoxComponent} this
     */
    setAutoScroll : function(scroll){
        if(this.rendered){
        	var scrollEl = this.getScrollEl();
        	if(this.autoScroll == 'x') {
        		scrollEl.css('overflow-x', 'auto');
        		scrollEl.css('overflow-y', 'hidden');
        	} else if(this.autoScroll == 'y') {
        		scrollEl.css('overflow-y', 'auto');
        		scrollEl.css('overflow-x', 'hidden');
        	} else if(this.autoScroll === true) {
        		scrollEl.css('overflow', 'auto');
        	} else {
        		scrollEl.css('overflow', 'hidden');
        	}
        }
        this.autoScroll = scroll;
        return this;
    },
    
    // private
    onRender: function() {
    	Teradata.BoxComponent.superclass.onRender.apply(this, arguments);
    	this.renderCorners();
    },
    
    // private
    afterRender : function(){
        Teradata.BoxComponent.superclass.afterRender.call(this);
        
        if(this.resizeEl){
            this.resizeEl = Teradata.get(this.resizeEl);
        }
        if(this.positionEl){
            this.positionEl = Teradata.get(this.positionEl);
        }
        this.boxReady = true;
        Teradata.isDefined(this.autoScroll) && this.setAutoScroll(this.autoScroll);
        this.setSize(this.width, this.height);
        // TODO: 支持x,y,pageX,pageY坐标定位
    },
    
    // private
    renderCorners: function() {
    	if(this.corners == 'all') {
    		this.renderTopCorners();
        	this.renderMiddle();
        	this.renderBottomCorners();
    	} else if(this.corners == 'lr') {
    		this.renderSimpleCorners(true, true);
    	} else if(this.corners == 'l') {
    		this.renderSimpleCorners(true, false);
    	} else if(this.corners == 'r') {
    		this.renderSimpleCorners(false, true);
    	} else if(this.corners == 'b') {
    		this.renderMiddle();
        	this.renderBottomCorners();
    	} else if(this.corners == 't') {
    		this.renderTopCorners();
        	this.renderMiddle();
    	}
    },
    
    // private
    renderSimpleCorners: function(l, r) {
    	var positionEl = this.getPositionEl();
    	var left = positionEl.find('div.teradata-widget-corners-left');
    	var center = positionEl.find('div.teradata-widget-center');
    	var right = positionEl.find('div.teradata-widget-corners-right');
    	
    	if(l !== false) {
    		if(left.size() > 0) {
        		left = Teradata.get(left.get(0));
        	} else {
        		left = document.createElement('div');
        		left.className ='teradata-widget-corners-left';
        	}
    	}
    	
    	if(center.size() > 0) {
    		center = Teradata.get(center.get(0));
    		this.mc = center;
    	} else {
    		var content = this.el;
    		content.wrap('<div class="teradata-widget-center"></div>');
    		this.mc = Teradata.get(content.parent());
    	}
    	
    	if(r !== false) {
    		if(right.size() > 0) {
        		right = Teradata.get(right.get(0));
        	} else {
        		right = document.createElement('div');
        		right.className ='teradata-widget-corners-right';
        	}
    	}

    	if(l !== false) {
    		this.ml = Teradata.get(left);
    		this.ml.insertBefore(this.mc);
    	}
    	if(r !== false) {
    		this.mr = Teradata.get(right);
    		this.mr.insertAfter(this.mc);
    	}
    	
    	if(!positionEl.children().last().is('.teradata-clear')) {
    		var clear = Teradata.get(document.createElement('div'));
        	clear.addClass('teradata-clear');
        	this.getPositionEl().append(clear);
    	}
    },
    
    renderTopCorners: function() {
		var el = this.getPositionEl();
		
		var hLeft = el.find('.teradata-widget-tl')[0];
		var hCenter = el.find('.teradata-widget-tc')[0];
		var hRight = el.find('.teradata-widget-tr')[0];
		
		// 如果未查找到节点则初始化节点
		if(!hLeft) {
			hLeft = document.createElement('div');
		}
		if(!hRight) {
			hRight = document.createElement('div');
		}
		if(!hCenter) {
			hCenter = document.createElement('div');
		}
		
		hLeft = Teradata.get(hLeft);
		hCenter = Teradata.get(hCenter);
		hRight = Teradata.get(hRight);
		
		// 当节点未被添加到dom树中则添加到dom树
		if(!hLeft.parent().get(0)) {
			if(this.itemWrap) {
				hLeft.insertBefore(this.el);
			} else {
				el.append(hLeft);
			}
		}
		if(!hRight.parent().get(0)) {
			hLeft.append(hRight);
		}
		if(!hCenter.parent().get(0)) {
			hRight.append(hCenter);
		}
		
		// 为节点标记相应的样式名称
		hLeft.addClass('teradata-widget-tl');
		hCenter.addClass('teradata-widget-tc');
		hRight.addClass('teradata-widget-tr');
		
		this.top = hLeft;
		this.tc = hCenter;
	},
	
	renderMiddle: function() {
		var el = this.getPositionEl();
		
		var mLeft = el.find('.teradata-widget-ml')[0];
		var mCenter = el.find('.teradata-widget-mc')[0];
		var mRight = el.find('.teradata-widget-mr')[0];
		
		// 如果未查找到节点则初始化节点
		if(!mLeft) {
			mLeft = document.createElement('div');
		}
		if(!mRight) {
			mRight = document.createElement('div');
		}
		if(!mCenter) {
			mCenter = document.createElement('div');
		}
		
		mLeft = Teradata.get(mLeft);
		mCenter = Teradata.get(mCenter);
		mRight = Teradata.get(mRight);
		
		// 当节点未被添加到dom树中则添加到dom树
		if(!mLeft.parent().get(0)) {
			if(this.itemWrap) {
				this.el.wrap(mLeft);
				mLeft = this.el.parent();
			} else {
				el.append(mLeft);
			}
		}
		if(!mRight.parent().get(0)) {
			if(this.itemWrap) {
				this.el.wrap(mRight);
				mRight = this.el.parent();
			} else {
				mLeft.append(mRight);
			}
		}
		if(!mCenter.parent().get(0)) {
			if(this.itemWrap) {
				this.el.wrap(mCenter);
				mCenter = this.el.parent();
			} else {
				mRight.append(mCenter);
			}
		}
		
		// 为节点标记相应的样式名称
		mLeft.addClass('teradata-widget-ml');
		mCenter.addClass('teradata-widget-mc');
		mRight.addClass('teradata-widget-mr');
		
		this.middle = mLeft;
		this.mc = mCenter;
	},
	
	renderBottomCorners: function() {
		var el = this.getPositionEl();
		var fLeft = el.find('.teradata-widget-bl')[0];
		var fCenter = el.find('.teradata-widget-bc')[0];
		var fRight = el.find('.teradata-widget-br')[0];
		
		if(!fLeft) {
			fLeft = document.createElement('div');
		}
		if(!fCenter) {
			fCenter = document.createElement('div');
		}
		if(!fRight) {
			fRight = document.createElement('div');
		}
		
		fLeft = Teradata.get(fLeft);
		fCenter = Teradata.get(fCenter);
		fRight = Teradata.get(fRight);
		
		if(!fLeft.parent().get(0)) {
			el.append(fLeft);
		}
		if(!fRight.parent().get(0)) {
			fLeft.append(fRight);
		}
		if(!fCenter.parent().get(0)) {
			fRight.append(fCenter);
		}
		
		fLeft.addClass('teradata-widget-bl');
		fCenter.addClass('teradata-widget-bc');
		fRight.addClass('teradata-widget-br');
		
		this.bottom = fLeft;
		this.bc = fCenter;
	},
    
    // private
    adjustSize : function(w, h){
        if(this.autoWidth){
            w = 'auto';
        }
        if(this.autoHeight){
            h = 'auto';
        }
        return {width : w, height: h};
    },
    
    /**
     * 获得是否可以设置高度
     * @return {Boolean}
     */
    isHeightResizable: function() {
    	return !Teradata.isDefined(this.boxMinHeight) || !Teradata.isDefined(this.boxMaxHeight) || this.boxMinHeight != this.boxMaxHeight;
    },
    
    // private
    getResizeEl: function() {
    	return this.el;
    },
    
    // private
    getContentTarget: function() {
    	return this.mc || this.el;
    },
    
    // private
    getScrollEl: function() {
    	return this.getContentTarget();
    }
});/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.Button
 * @extends Teradata.BoxComponent
 * 按钮组件
 * @constructor
 * 创建一个新的按钮
 * @param {Object} config 配置属性对象
 * @xtype button
 */
Teradata.widget.Button = Teradata.extend(Teradata.BoxComponent, {
	
	/**
	 * @cfg {String} text
	 * 按钮文字
	 */
	text: 'Button',
	
	width: 60,
	
	boxMinHeight: 29,
	
	boxMaxHeight: 29,
	
	corners: 'lr',
	
	hoverCls: 'teradata-widget-button-hover',
	
	focusCls: 'teradata-widget-button-focus',
	
	clickCls: 'teradata-widget-button-click',
	
	disabledCls: 'teradata-widget-button-disabled',
	
	// private
	initComponent: function() {
		this.addEvents(
			/**
			 * @event click
			 * @param {Teradata.widget.Button} this
			 * 当点击按钮时候触发
			 */
			'click'
		);
		Teradata.widget.Button.superclass.initComponent.call(this);
	},
	
	// private
	onRender: function() {
		if(!this.el && !this.itemWrap) {
			var el = document.createElement('button');
			this.el = Teradata.get(el);
			this.el.wrap('<div></div>');
			this.itemWrap = Teradata.get(this.el.parent());
    	} else if(this.el && !this.itemWrap) {
    		this.el.wrap('<div></div>');
    		this.itemWrap = Teradata.get(this.el.parent());
    	}
		Teradata.widget.Button.superclass.onRender.apply(this, arguments);
		
		this.el.removeClass('teradata-widget-button');
		this.itemWrap.addClass('teradata-widget-button');
		
		this.setText(this.text);
	},
	
	// private
    onResize: function(w, h) {
    	if(this.autoWidth) {
    		if(Teradata.isIE6) {
    			w = this.el.outerWidth();
        		this.itemWrap.width(w + (this.ml ? this.ml.outerWidth() : 0) + (this.mr ? this.mr.outerWidth() : 0));
    		}
    	} else {
    		Teradata.widget.Button.superclass.onResize.apply(this, arguments);
    		this.el.width(w - (this.ml ? this.ml.outerWidth() : 0) - (this.mr ? this.mr.outerWidth() : 0));
    	}
    },
	
	// private
	afterRender: function() {
		Teradata.widget.Button.superclass.afterRender.apply(this, arguments);
		this.initEvents();
	},
	
	// private
	initEvents: function() {
		var itemWrap = this.getPositionEl();
		this.bind(itemWrap, 'mouseover', this.onMouseOver);
		this.bind(itemWrap, 'mouseout', this.onMouseOut);
		this.bind(this.el, 'focus', this.onFocus);
		this.bind(this.el, 'blur', this.onBlur);
		this.bind(itemWrap, 'mousedown', this.onMouseDown);
		this.bind(itemWrap, 'mouseup', this.onMouseUp);
		this.bind(itemWrap, 'click', this.onClick);
		this.bind(this.el, 'keydown', function(e) {
			if(e.keyCode == 13 || e.keyCode == 32) {
				this.onMouseDown(e);
			}
		});
		this.bind(this.el, 'keyup', function(e) {
			if(e.keyCode == 13 || e.keyCode == 32) {
				this.onMouseUp(e);
			}
		});
	},
	
	// private
	onMouseOver: function(e) {
		var el = this.getPositionEl();
		if(!el.hasClass(this.hoverCls)) {
			el.addClass(this.hoverCls);
		}
	},
	
	// private
	onMouseOut: function(e) {
		var el = this.getPositionEl();
		if(el.hasClass(this.hoverCls)) {
			this.getPositionEl().removeClass(this.hoverCls);
		}
		if(el.hasClass(this.clickCls)) {
			this.getPositionEl().removeClass(this.clickCls);
		}
	},
	
	// private
	onFocus: function(e) {
		this.getPositionEl().addClass(this.focusCls);
		if(!this.hasFocus){
    		this.hasFocus = true;
		}
	},
	
	// private
	onBlur: function(e) {
		this.hasFocus = false;
		this.getPositionEl().removeClass(this.focusCls);
	},
	
	// private
	onMouseDown: function(e) {
		this.getPositionEl().addClass(this.clickCls);
	},
	
	// private
	onMouseUp: function(e) {
		var itemWrap = this.getPositionEl();
		itemWrap.removeClass(this.clickCls);
		if(this.hasFocus) {
			itemWrap.removeClass(this.focusCls).addClass(this.focusCls);
		}
	},
	
	// private
	onClick: function(e) {
		e.preventDefault();
		this.fireEvent('click', this);
		if(Teradata.isFunction(this.handler)) {
			this.handler.call(this.scope || this);
		}
	},
	
	/**
	 * 设置按钮文本
	 * @param {String} text
	 */
	setText: function(text) {
		this.text = text;
		this.el.html(this.text);
	},
	
	// private
	getPositionEl: function() {
		return this.itemWrap;
	},
	
	// private
	getResizeEl: function() {
		return this.itemWrap;
	}
});

Teradata.reg('button', Teradata.widget.Button);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.03.19
 */

/**
 * @class Teradata.widget.DatePicker
 * @extends Teradata.BoxComponent
 * 日期选择器
 * @constructor
 * 创建一个新的日期选择器
 * @param {Object} config 配置属性对象
 * @xtype datepicker
 */
Teradata.widget.DatePicker = Teradata.extend(Teradata.BoxComponent, {
	
	corners: 'none',
	
	/**
	 * @cfg {String} format
	 * 日期格式
	 */
	format: 'yyyy-MM-dd',
	
	/**
	 * @cfg {Boolean} time
	 * 是否包含时间选择器
	 */
	time: false,
	
	/**
	 * @cfg {Date/String} minDate
	 * 日期最小值
	 */
	
	/**
	 * @cfg {Date/String} maxDate
	 * 日期最大值
	 */
	
	/**
	 * @cfg {String} yearMonthText
	 * 面板显示的年月格式
	 */
	yearMonthText: '{1} {0}',
	
	mousewheelTip: 'Sliding the mouse wheel to adjust',
	
	// private
	initComponent: function() {
		this.addEvents(
			/**
			 * @event select
			 * 当选择一个日期后触发
			 * @param {Teradata.widget.DatePicker} this
			 * @param {Date} date
			 */
			'select'
		);
		Teradata.widget.DatePicker.superclass.initComponent.call(this);
		this.setMinDate(this.minDate);
		this.setMaxDate(this.maxDate);
		this.setDate(this.date);
		this.pickerDate = this.date ? this.date.clone() : new Date();
	},
	
	// private
	onRender: function() {
		Teradata.widget.DatePicker.superclass.onRender.apply(this, arguments);
		this.el.addClass('teradata-widget-datepicker');
		this.renderPicker();
	},
	
	// private
	renderPicker: function() {
		this.pickerHeader = Teradata.get(document.createElement('div'));
		this.pickerHeader.addClass('teradata-widget-datepicker-header');
		
		this.yearLabel = Teradata.get(document.createElement('div'));
		this.yearLabel.addClass('teradata-widget-datepicker-header-text');
		
		this.prevYear = Teradata.get(document.createElement('a'));
		this.prevYear.addClass('teradata-icon').addClass('teradata-widget-datepicker-header-prevyear').attr('href', '#');
		
		this.prevMonth = Teradata.get(document.createElement('a'));
		this.prevMonth.addClass('teradata-icon').addClass('teradata-widget-datepicker-header-prevmonth').attr('href', '#');
		
		this.nextMonth = Teradata.get(document.createElement('a'));
		this.nextMonth.addClass('teradata-icon').addClass('teradata-widget-datepicker-header-nextmonth').attr('href', '#');
		
		this.nextYear = Teradata.get(document.createElement('a'));
		this.nextYear.addClass('teradata-icon').addClass('teradata-widget-datepicker-header-nextyear').attr('href', '#');
		
		this.pickerFooter = Teradata.get(document.createElement('div'));
		this.pickerFooter.addClass('teradata-widget-datepicker-footer');
		
		this.dateEl = Teradata.get(document.createElement('div'));
		
		this.el.append(this.pickerHeader);
		
		this.pickerHeader.append(this.prevYear);
		this.pickerHeader.append(this.prevMonth);
		
		this.pickerHeader.append(this.nextYear);
		this.pickerHeader.append(this.nextMonth);
		
		this.pickerHeader.append(this.yearLabel);
		
		this.el.append(this.dateEl);
		this.el.append(this.pickerFooter);
		
		var html = ['<table colspadding="0" cellspacing="0" class="teradata-widget-datepicker-table">'];
		for(var i = 0; i < 7; i++) {
			html.push('<tr>');
			for(var j = 0; j < 7; j++) {
				if(i == 0) {
					html.push('<th align="center" valign="center">');
					html.push(Date.dayNames[j]);
					html.push('</th>');
				} else {
					html.push('<td align="center" valign="center"></td>');
				}
			}
			html.push('</tr>');
		}
		html.push('</table>');
		this.dateEl.get(0).innerHTML = html.join('');
		this.tds = this.dateEl.find('td');
		this.update();
	},
	
	// private
	initEvents: function() {
		this.bind(this.el, 'click', this.onPickerClick);
		this.bind(this.el, 'mousewheel', this.onPickerMouseWheel);
	},
	
	// private
	onPickerClick: function(e) {
		e.preventDefault();
		e.stopPropagation();
		var target = Teradata.get(e.target);
		if(target.parent().is('td') && !target.parent().is('.teradata-widget-datepicker-disabled')) {
			var d = this.pickerDate.clone();
			d.setMonth(parseInt(target.attr('rel'), 10));
			d.setDate(parseInt(target.html(), 10));
			this.setDate(d);
			this.fireEvent('select', this, d.clone());
		} else if(target.is('.teradata-widget-datepicker-header-prevyear')) {
			this.pickerDate.setFullYear(this.pickerDate.getFullYear() - 1);
			this.update();
		} else if(target.is('.teradata-widget-datepicker-header-prevmonth')) {
			this.pickerDate.setMonth(this.pickerDate.getMonth() - 1);
			this.update();
		} else if(target.is('.teradata-widget-datepicker-header-nextmonth')) {
			this.pickerDate.setMonth(this.pickerDate.getMonth() + 1);
			this.update();
		} else if(target.is('.teradata-widget-datepicker-header-nextyear')) {
			this.pickerDate.setFullYear(this.pickerDate.getFullYear() + 1);
			this.update();
		}
	},
	
	// private
	onPickerMouseWheel: function(e, d) {
		e.preventDefault();
		if(Teradata.isNumber(d)) {
			var target = Teradata.get(e.target);
			if(target.is('.teradata-widget-datepicker-header-year')) {
				this.pickerDate.setFullYear(this.pickerDate.getFullYear() - d);
				this.update();
			} else if(target.is('.teradata-widget-datepicker-header-month')) {
				this.pickerDate.setMonth(this.pickerDate.getMonth() - d);
				this.update();
			}
		}
	},
	
	// private
	update: function() {
		if(this.rendered) {
			var d = this.pickerDate.clone();
			var now = new Date();
			d.setDate(1);
			d.setDate(-(d.getDay() - 1));
			this.yearLabel.html(this.formatYearMonthText(this.pickerDate));
			for(var i = 0; i < this.tds.length; i++) {
				var td = this.tds[i];
				td.className = '';
				td.innerHTML = '<a href="#" rel="' + d.getMonth() + '">' + d.getDate() + '</a>';
				if(this.date && d.dateEquals(this.date)) {
					td.className = 'teradata-widget-datepicker-selected';
				} else if(d.dateEquals(now)) {
					td.className = 'teradata-widget-datepicker-today';
				} else if((this.minDate && d.dateLessThan(this.minDate)) || (this.maxDate && d.dateGreatThan(this.maxDate))) {
					td.className = 'teradata-widget-datepicker-disabled';
				} else if(d.monthEquals(this.pickerDate)) {
					td.className = 'teradata-widget-datepicker-month';
				}
				d.nextDay();
			}
		}
	},
	
	/**
	 * 设置日期
	 * @param {String/Date} date
	 */
	setDate: function(date) {
		if(date) {
			if(Teradata.isString(date)) {
				date = Date.parseDate(date, this.format);
			}
			this.date = date;
		} else {
			this.date = null;
		}
		this.update();
	},
	
	/**
	 * 获得选择的日期
	 * @return {Date}
	 */
	getDate: function() {
		return this.date;
	},
	
	/**
	 * 设置最小可选日期
	 * @param {String/Date} minDate
	 */
	setMinDate: function(minDate) {
		if(minDate) {
			if(Teradata.isString(minDate)) {
				minDate = Date.parseDate(minDate, this.format);
			}
			this.minDate = minDate;
		} else {
			this.minDate = null;
		}
		this.update();
	},
	
	/**
	 * 设置最大可选日期
	 * @param {String/Date} maxDate
	 */
	setMaxDate: function(maxDate) {
		if(maxDate) {
			if(Teradata.isString(maxDate)) {
				maxDate = Date.parseDate(maxDate, this.format);
			}
			this.maxDate = maxDate;
		} else {
			this.maxDate = null;
		}
		this.update();
	},
	
	/**
	 * 设置选择器日期
	 * @param {String/Date} pickerDate
	 */
	setPickerDate: function(pickerDate) {
		if(pickerDate) {
			if(Teradata.isString(pickerDate)) {
				pickerDate = Date.parseDate(pickerDate, this.format);
			}
			this.pickerDate = pickerDate;
		} else {
			this.pickerDate = null;
		}
		this.update();
	},
	
	// private
	formatYearMonthText: function(date) {
		return String.format(this.yearMonthText, '<span class="teradata-widget-datepicker-header-year" title="' + this.mousewheelTip + '">' + date.getFullYear() + '</span>', '<span class="teradata-widget-datepicker-header-month" title="' + this.mousewheelTip + '">' + Date.monthNames[date.getMonth()] + '</span>');
	},
	
	// private
	afterRender: function() {
		Teradata.widget.DatePicker.superclass.afterRender.apply(this, arguments);
		this.initEvents();
	}
});

Teradata.reg('datepicker', Teradata.widget.DatePicker);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.Container
 * @extends Teradata.BoxComponent
 * 容器组件
 * @constructor
 * 创建一个新的容器
 * @param {Object} config 配置属性对象
 * @xtype container
 */
Teradata.widget.Container = Teradata.extend(Teradata.BoxComponent, {
	
	/**
	 * @cfg {Array} items
	 * 内部组件
	 */
	
	/**
	 * @cfg {String} layout
	 * 布局器
	 */
	
	/**
	 * @cfg {Boolean} autoDestroy
	 * 当调用remove方法删除组件时候如果该参数为true，将自动将被删除的组件销毁。
	 */
	autoDestroy : true,
	
	corners: 'none',
	
	/**
	 * @cfg {Boolean} autoHeight
	 * 自动高度
	 */
	
	// private
	initComponent: function() {
		Teradata.widget.Container.superclass.initComponent.call(this);
		
		this.addEvents(
            /**
             * @event afterlayout
             * 在进行布局之后触发
             * @param {Teradata.Container} this
             * @param {ContainerLayout} layout 该容器的布局器
             */
            'afterlayout',
            /**
             * @event beforeadd
             * 在加入新组件之前触发
             * @param {Teradata.widget.Container} this
             * @param {Teradata.Component} component 将被加入的组件
             * @param {Number} index 加入的组件在容器中的索引值
             */
            'beforeadd',
            /**
             * @event beforeremove
             * 删除组件之前触发
             * @param {Teradata.Container} this
             * @param {Teradata.Component} component 将被删除的组件
             */
            'beforeremove',
            /**
             * @event add
             * 在加入新组件之后触发
             * @param {Teradata.widget.Container} this
             * @param {Teradata.Component} component 已经加入的新组件
             * @param {Number} index 加入的组件在容器中的索引值
             */
            'add',
            /**
             * @event remove
             * 删除组件之后触发
             * @param {Teradata.Container} this
             * @param {Teradata.Component} component 已经被删除的组件
             */
            'remove'
        );

        var items = this.items;
        if(items){
            delete this.items;
            this.add(items);
        }
	},
	
	// private
	onRender: function() {
		Teradata.widget.Container.superclass.onRender.apply(this, arguments);
		this.el.addClass('teradata-widget-container');
	},
	
	// private
	afterRender: function() {
		Teradata.widget.Container.superclass.afterRender.apply(this, arguments);
		if(!this.layout){
            this.layout = 'auto';
        }
        if(Teradata.isObject(this.layout) && !this.layout.layout){
            this.layoutConfig = this.layout;
            this.layout = this.layoutConfig.type;
        }
        if(Teradata.isString(this.layout)){
            this.layout = new Teradata.widget.Container.LAYOUTS[this.layout.toLowerCase()](this.layoutConfig);
        }
        this.setLayout(this.layout);
        
        if(!this.ownerCt){
            this.doLayout(false);
        }
	},
	
	// private
	initItems: function() {
		if(!this.items) {
			this.items = [];
		}
	},
	
	/**
	 * @private
	 * 进行布局
	 * @param {Boolean} shallow 是否不对子容器进行布局
	 */
	doLayout: function(shallow) {
		if(this.rendered && this.layout) {
			this.layout.layout();
			this.hasLayout = true;
		}
		
		if(shallow !== true && this.items){
            var cs = this.items;
            for(var i = 0, len = cs.length; i < len; i++){
                var c = cs[i];
                if(c.doLayout){
                    c.doLayout(false);
                }
            }
        }
		
		if(this.rendered){
            this.onLayout(shallow);
        }
	},
	
	// private
    setLayout : function(layout){
        if(this.layout && this.layout != layout){
            this.layout.setContainer(null);
        }
        this.layout = layout;
        this.initItems();
        layout.setContainer(this);
    },
	
	/**
	 * 添加组件到容器中
	 * @param {Teradata.Component} comp
	 */
	add: function(comp){
        this.initItems();
        var args = arguments.length > 1;
        if(args || Teradata.isArray(comp)){
            var result = [];
            var comps = args ? arguments : comp;
            for(var i = 0; i < comps.length; i++) {
            	result.push(this.add(comps[i]));
            }
            return result;
        }
        var c = this.lookupComponent(comp);
        var index = this.items.length;
        if(this.fireEvent('beforeadd', this, c, index) !== false && this.onBeforeAdd(c) !== false){
            this.items.push(c);
            // *onAdded
            c.onAdded(this, index);
            this.onAdd(c);
            this.fireEvent('add', this, c, index);
        }
        return c;
    },
    
    onAdd: Teradata.emptyFn,
    
    // private
    onBeforeAdd : function(item){
        if(item.ownerCt){
            item.ownerCt.remove(item, false);
        }
        if(this.hideBorders === true){
            item.border = (item.border === true);
        }
    },
    
    /**
     * 
     * @param {Teradata.Component} comp
     * @param autoDestroy
     * @return {Teradata.Component}
     */
    remove : function(comp, autoDestroy){
        this.initItems();
        var c = this.getComponent(comp);
        if(c && this.fireEvent('beforeremove', this, c) !== false){
            this.doRemove(c, autoDestroy);
            this.fireEvent('remove', this, c);
        }
        return c;
    },
    
    // private
    getComponent: function(comp) {
    	this.initItems();
    	for(var i = 0; i < this.items.length; i++) {
    		if(Teradata.isString(comp)) {
    			if(this.items[i].getId() == comp) {
        			return this.items[i];
        		}
    		} else {
    			if(this.items[i] == comp) {
        			return comp;
        		}
    		}
    	}
    },
    
    // private
    doRemove: function(c, autoDestroy){
        var l = this.layout,
            hasLayout = l && this.rendered;

        if(hasLayout){
            l.onRemove(c);
        }
        this.items.remove(c);
        c.onRemoved();
        this.onRemove(c);
        if(autoDestroy === true || (autoDestroy !== false && this.autoDestroy)){
            c.destroy();
        }
        if(hasLayout){
            l.afterRemove(c);
        }
    },
    
    // private
    onRemove: Teradata.emptyFn,
    
    // private
    lookupComponent : function(comp){
        if(Teradata.isString(comp)){
            return Teradata.ComponentMgr.get(comp);
        }else if(!comp.events){
            return this.createComponent(comp);
        }
        return comp;
    },
    
    // private
    createComponent : function(config, defaultType){
        if (config.render) {
            return config;
        }
        // add in ownerCt at creation time but then immediately
        // remove so that onBeforeAdd can handle it
        var c = Teradata.create(Teradata.apply({
            ownerCt: this
        }, config), defaultType || this.defaultType);
        delete c.ownerCt;
        return c;
    },
    
    // private
	getContentTarget: function() {
		return this.mc || this.el;
	},
    
    // private
    getLayoutTarget: function() {
    	return this.getContentTarget();
    },
    
	// private
	onLayout : Teradata.emptyFn
});

Teradata.widget.Container.LAYOUTS = {};

Teradata.reg('container', Teradata.widget.Container);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.layout.AutoLayout
 * @extends Object
 * 布局器
 */
Teradata.widget.layout.AutoLayout = Teradata.extend(Object, {
	
	// private
	constructor : function(config){
        this.id = Teradata.id(null, 'teradata-widget-layout-');
        Teradata.apply(this, config);
    },
    
    /**
     * 进行布局
     */
    layout: function() {
    	var ct = this.container;
    	var target = ct.getLayoutTarget();
    	this.onLayout(ct, target);
        ct.fireEvent('afterlayout', ct, this);
    },
    
    // private
    onLayout: function(ct, target) {
    	this.renderAll(ct, target);
    },
    
    // private
    isValidParent : function(c, target){
        return target && c.getEl().get(0).parentNode == target.get(0);
    },
    
    // private
    renderAll : function(ct, target){
        var items = ct.items, i, c, len = items.length;
        for(i = 0; i < len; i++) {
            c = items[i];
            if(c && (!c.rendered || !this.isValidParent(c, target))){
                this.renderItem(c, i, target);
            }
        }
    },
    
    // private
    renderItem : function(c, position, target){
        if(c) {
            if (!c.rendered) {
                c.render(target, position);
                this.configureItem(c);
            } else if (!this.isValidParent(c, target)) {
                if (Teradata.isNumber(position)) {
                    position = target.get(0).childNodes[position];
                }
                
                target.get(0).insertBefore(c.getPositionEl().get(0), position || null);
                c.container = target;
                this.configureItem(c);
            } else {
            	this.configureItem(c);
            }
        }
    },
    
    // private
    configureItem: function(c){
        if (this.extraCls) {
            var t = c.getPositionEl ? c.getPositionEl() : c;
            t.addClass(this.extraCls);
        }
        
        if (c.doLayout) {
            c.doLayout();
        }
    },
    
    // private
    onRemove: function(c){
        if(this.activeItem == c){
            delete this.activeItem;
        }
        if(c.rendered && this.extraCls){
            var t = c.getPositionEl ? c.getPositionEl() : c;
            t.removeClass(this.extraCls);
        }
    },

    // private
    afterRemove: function(c){
        if(c.removeRestore){
            c.removeMode = 'container';
            delete c.removeRestore;
        }
    },
    
    /**
     * 设置容器
     * @param {Teradata.widget.Container} container
     */
    setContainer: function(container) {
    	this.container = container;
    }
});

Teradata.widget.Container.LAYOUTS['auto'] = Teradata.widget.layout.AutoLayout;/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.layout.FormLayout
 * @extends Teradata.widget.layout.AutoLayout
 * 表单局器
 */
Teradata.widget.layout.FormLayout = Teradata.extend(Teradata.widget.layout.AutoLayout, {
	
	/**
	 * @cfg {Number} columns
	 * 字段列数
	 */
	columns: 1,
	
	/**
	 * @cfg {Number} labelWidth
	 * 标签宽度
	 */
	labelWidth: 80,
	
	/**
	 * @cfg {String} labelAlign
	 * 标签对其方式
	 */
	labelAlign: 'right',
	
	/**
	 * @cfg {String} fieldAlign
	 * 字段对其方式
	 */
	fieldAlign: 'left',
	
	/**
	 * @cfg {String} separator
	 * 标签与字段组件的分隔符
	 */
	separator: ':',
	
	/**
	 * @cfg {Number} cellspacing
	 * 组件间距
	 */
	cellspacing: 4,
	
	colspadding: 0,
	
	// private
	onLayout: function(ct, target) {
		if(!this.el) {
			this.el = Teradata.get(document.createElement('table'));
			this.tbody = Teradata.get(document.createElement('tbody'));
			
			this.el.attr('cellspacing', this.cellspacing);
			this.el.attr('colspadding', this.colspadding);
			this.el.addClass('teradata-layout-form');
			
			target.append(this.el);
			this.el.append(this.tbody);
		}
		Teradata.widget.layout.FormLayout.superclass.onLayout.apply(this, arguments);
	},
	
	// private
	renderItem: function(c, position, target) {
		if(!c.rendered) {
			
			var labelEl = null;
			
			if(c.fieldLabel) {
				labelEl = Teradata.get(document.createElement('span'));
				labelEl.html(c.fieldLabel + this.separator);
			}
			
			var cols = this.nextCol(c);
			
			if(labelEl) {
				cols[0].append(labelEl);
			} else {
				cols[0].html('&nbsp;');
			}
			
			Teradata.widget.layout.FormLayout.superclass.renderItem.call(this, c, position, cols[1]);
		}
	},
	
	// private
	nextCol: function(c) {
		if(!Teradata.isNumber(this.curIndex)) {
			this.curIndex = 0;
		}
		var cellIndex = this.curIndex % this.columns;
		if(cellIndex === 0) {
			this.curRow = Teradata.get(document.createElement('tr'));
			this.tbody.append(this.curRow);
		}
		
		var fieldWidth = this.labelWidth + (Teradata.isNumber(c.width) ? c.width : 0);
		var columns = parseInt(fieldWidth / this.fieldMaxWidth, 10) + 1;
		var fieldColspan = 0;
		
		if(columns > 1 && fieldWidth < this.el.width()) {
			fieldColspan = (columns - 1) * 2 + 1;
			var count = this.curIndex % this.columns;
			if(count + columns > this.columns) {
				var emptyCol = Teradata.get(document.createElement('td'));
				emptyCol.addClass('teradata-layout-form-empty');
				emptyCol.attr('colspan', count * 2);
				emptyCol.html('&nbsp;');
				this.curRow.append(emptyCol);
				this.curIndex += count;
				return this.nextCol(c);
			}
		}
		
		var labelCol = Teradata.get(document.createElement('td'));
		var fieldCol = Teradata.get(document.createElement('td'));
		
		labelCol.addClass('teradata-layout-form-label');
		labelCol.width(this.labelWidth);
		labelCol.attr('align', this.labelAlign);
		labelCol.attr('valign', 'middle');
		
		fieldCol.addClass('teradata-layout-form-field');
		fieldCol.attr('align', this.fieldAlign);
		fieldCol.attr('valign', 'middle');
		
		if(fieldColspan > 1) {
			fieldCol.attr('colspan', Math.min(this.columns * 2, fieldColspan));
		}
		
		this.curRow.append(labelCol);
		this.curRow.append(fieldCol);
		
		this.curIndex += columns;
		
		return [labelCol, fieldCol];
	},
	
	// private
	setContainer: function(container) {
		Teradata.widget.layout.FormLayout.superclass.setContainer.call(this, container);
		this.fieldMaxWidth = this.calculateFieldMaxWidth();
	},
	
	// private
	calculateFieldMaxWidth: function() {
		return this.container.getLayoutTarget().innerWidth() / this.columns;
	}
});

Teradata.widget.Container.LAYOUTS['form'] = Teradata.widget.layout.FormLayout;/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.05.03
 */

/**
 * @class Teradata.widget.layout.BorderLayout
 * @extends Teradata.widget.layout.AutoLayout
 * 表单局器
 */
Teradata.widget.layout.BorderLayout = Teradata.extend(Teradata.widget.layout.AutoLayout, {
	
	/**
	 * @cfg {Number/String} nothHeight
	 * 北部高度
	 */
	southHeight: '20%',
	
	/**
	 * @cfg {Number/String} eastWidth
	 * 东部宽度
	 */
	eastWidth: '20%',
	
	/**
	 * @cfg {Number/String} southHeight
	 * 南部高度
	 */
	southHeight: '10%',
	
	/**
	 * @cfg {Number/String} westWidth
	 * 西部宽度
	 */
	westWidth: '20%',
	
	cellspacing: 0,
	
	colspadding: 0,
	
	// private
	constructor: function(config) {
		this.regions = {};
		Teradata.widget.layout.BorderLayout.superclass.constructor.call(this, config);
	},
	
	// private
	onLayout: function(ct, target) {
		if(!this.el) {
			this.el = Teradata.get(document.createElement('table'));
			this.tbody = Teradata.get(document.createElement('tbody'));
			
			this.el.attr('cellspacing', this.cellspacing);
			this.el.attr('colspadding', this.colspadding);
			this.el.addClass('teradata-layout-border');
			
			target.append(this.el);
			this.el.append(this.tbody);
			
			this.regions['center'] = Teradata.get(document.createElement('td'));
			var tr = document.createElement('tr');
			this.tbody.append(tr);
			tr.appendChild(this.regions['center'].get(0));
		}
		Teradata.widget.layout.FormLayout.superclass.onLayout.apply(this, arguments);
	},
	
	// private
	renderItem: function(c, position, target) {
		var region = this.getRegionEl(c.region);
		if(region != null) {
			Teradata.widget.layout.BorderLayout.superclass.renderItem.call(this, c, position, region);
		}
		if(this.regions['center'] && this.regions['west'] && this.regions['east']) {
			if(this.regions['noth']) {
				this.regions['noth'].attr('colspan', '3');
			}
			if(this.regions['south']) {
				this.regions['south'].attr('colspan', '3');
			}
		} else if(this.regions['center'] && this.regions['west']) {
			if(this.regions['noth']) {
				this.regions['noth'].attr('colspan', '2');
			}
			if(this.regions['south']) {
				this.regions['south'].attr('colspan', '2');
			}
		}
		
	},
	
	// private
	configureItem: function(c) {
		Teradata.widget.layout.BorderLayout.superclass.configureItem.call(this, c);
		var td = c.el.parent();
		c.setSize('auto', td.innerHeight());
	},
	
	// private
	getRegionEl: function(region) {
		if(!this.regions[region]) {
			if(region == 'noth') {
				this.regions[region] = Teradata.get(document.createElement('td'));
				var tr = document.createElement('tr');
				this.tbody.get(0).insertBefore(tr, this.regions['center'].parent().get(0));
				if(this.nothHeight) {
					this.regions[region].css('height', this.nothHeight);
				}
				tr.appendChild(this.regions[region].get(0));
			} else if(region == 'south') {
				this.regions[region] = Teradata.get(document.createElement('td'));
				var tr = document.createElement('tr');
				this.tbody.get(0).appendChild(tr);
				if(this.southHeight) {
					this.regions[region].css('height', this.southHeight);
				}
				tr.appendChild(this.regions[region].get(0));
			} else if(region == 'west') {
				this.regions[region] = Teradata.get(document.createElement('td'));
				var tr = this.regions['center'].parent().get(0);
				if(this.westWidth) {
					this.regions[region].css('width', this.westWidth);
				}
				tr.insertBefore(this.regions[region].get(0), this.regions['center'].get(0));
			} else if(region == 'east') {
				this.regions[region] = Teradata.get(document.createElement('td'));
				var tr = this.regions['center'].parent().get(0);
				if(this.westWidth) {
					this.regions[region].css('width', this.eastWidth);
				}
				tr.appendChild(this.regions[region].get(0));
			} else {
				return null;
			}
		}
		return this.regions[region];
	}
	
});

Teradata.widget.Container.LAYOUTS['border'] = Teradata.widget.layout.BorderLayout;/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.layout.XLayout
 * @extends Teradata.widget.layout.AutoLayout
 * X布局器，该布局器支持组件纵向与横向排列组件与top,middle,bottom,left,center,right六种对其方式。
 */
Teradata.widget.layout.XBoxLayout = Teradata.extend(Teradata.widget.layout.AutoLayout, {
	
	/**
	 * @cfg {Boolean} horizontal
	 * 水平排列内容
	 */
	horizontal: true,
	
	/**
	 * @cfg {String} align
	 * 横向布局方式
	 */
	h: 'center',
	
	/**
	 * @cfg {String} valign
	 * 纵向布局方式，
	 */
	v: 'middle',
	
	// private
	onLayout: function(ct, target) {
    	if(!this.el) {
    		var table = document.createElement('table');
    		var tbody = document.createElement('tbody');
    		var tr = document.createElement('tr');
    		var td = document.createElement('td');
    		
    		table.setAttribute('cellspacing', '0');
    		table.setAttribute('colspadding', '0');
    		
    		table.appendChild(tbody);
    		tbody.appendChild(tr);
    		tr.appendChild(td);
    		target.get(0).appendChild(table);
    		
    		this.el = Teradata.get(table);
    		this.tdEl = Teradata.get(td);
			this.setAlign(this.align, this.valign);
			this.setHorizontal(this.horizontal);
			
			this.el.addClass('teradata-layout-x');
    	}
    	Teradata.widget.layout.XBoxLayout.superclass.onLayout.call(this, ct, this.tdEl);
    },
    
    /**
     * 设定对其方式
     * @param align {String} 横向对其方式
     * @param valign {String} 纵向对其方式
     */
    setAlign: function(align, valign) {
    	if(h) {
    		this.el.attr('align', h);
    	}
    	if(v) {
    		this.el.attr('valign', v);
    	}
    },
    
    /**
     * 设定横向对其方式
     * @param h {String} 横向对其方式
     */
    setHAlign: function(h) {
    	this.setAlign(h);
    },
    
    /**
     * 设定纵向对其方式
     * @param v {String} 纵向对其方式
     */
    setVAlign: function(v) {
    	this.setVAlign(undefined, v);
    },
    
    /**
     * 设置是否为水平排列
     * @param {Boolean} horizontal
     */
    setHorizontal: function(horizontal) {
    	this.horizontal = horizontal;
    	if(this.horizontal) {
    		this.el.addClass('teradata-layout-x-horizontal');
    	} else {
    		this.el.removeClass('teradata-layout-x-horizontal');
    	}
    }
});

Teradata.widget.Container.LAYOUTS['xbox'] = Teradata.widget.layout.XBoxLayout;/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.03.18
 */

/**
 * @class Teradata.widget.layout.TabPanelLayout
 * @extends Teradata.widget.layout.AutoLayout
 * TabPanel组件专用布局器
 */
Teradata.widget.layout.TabPanelLayout = Teradata.extend(Teradata.widget.layout.AutoLayout, {
	
	// private
	renderItem : function(c, position, target){
		var rendered = c.rendered;
		Teradata.widget.layout.TabPanelLayout.superclass.renderItem.apply(this, arguments);
		if(!rendered) {
			var tabPanel = this.container;
			var strip = tabPanel.getStrip();
			
			var btn = new Teradata.widget.Button({
				text: c.title,
				autoWidth: true,
				handler: function() {
					var container = c;
					tabPanel.setActiveTab(container);
				}
			});
			btn.render(strip, position);
		}
		c.hide();
	},
	
	// private
	onRemove: function(c) {
		var tabPanel = this.container;
		var index = tabPanel.items.indexOf(c);
		var header = tabPanel.headers[index];
		tabPanel.headers.remove(header);
		header.destroy();
		Teradata.widget.layout.TabPanelLayout.superclass.onRemove.call(this, c);
	}
});

Teradata.widget.Container.LAYOUTS['tabpanel'] = Teradata.widget.layout.TabPanelLayout;/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.Panel
 * @extends Teradata.widget.Container
 * 面板
 * @constructor
 * 创建一个新的面板
 * @param {Object} config 配置属性对象
 * @xtype panel
 */
Teradata.widget.Panel = Teradata.extend(Teradata.widget.Container, {
	
	/**
	 * @cfg {String} title
	 * 面板标题
	 */
	
	/**
	 * @cfg {Array} buttons
	 * 面板底部按钮
	 */
	
	/**
	 * @cfg {Boolean} hideHeader
	 * 隐藏面板头
	 */
	
	width: 600,
	
	/**
	 * @cfg {Number} bodyPadding
	 * 面板内容区的padding值
	 */
	bodyPadding: 4,
	
	corners: 'all',
	
	/**
	 * @cfg {String} tbarAlign
	 * 上方工具栏对其方式
	 */
	tbarAlign: 'left',
	
	/**
	 * @cfg {String} fbarAlign
	 * 下方工具栏对其方式
	 */
	fbarAlign: 'right',
	
	// private
	onRender: function() {
		Teradata.widget.Panel.superclass.onRender.apply(this, arguments);
		
		this.el.addClass('teradata-widget-panel');
		
		var header = this.top || this.el.children('.teradata-widget-panel-header')[0];
		var body = this.middle || this.el.children('.teradata-widget-panel-body')[0];
		var tbar = this.el.children('.teradata-widget-panel-tbar')[0];
		var fbar = this.el.children('.teradata-widget-panel-fbar')[0];
		var footer = this.bottom || this.el.children('.teradata-widget-panel-footer')[0];
		
		if(!header) {
			header = document.createElement('div');
		}
		if(!body) {
			body = document.createElement('div');
		}
		
		if(!tbar && this.menus) {
			tbar = document.createElement('div');
			this.tbar = Teradata.get(tbar);
		} else if(tbar && !this.menus) {
			tbar = Teradata.get(tbar);
			var buttons = tbar.find('teradata-widget-button');
			if(buttons.length > 0) {
				this.tbar = tbar;
				this.menus = [];
				for(var i = 0; i < buttons.length; i++) {
					this.menus.push({
						el: buttons[i]
					});
				}
			}
		}
		
		if(!fbar && this.buttons) {
			fbar = document.createElement('div');
			this.fbar = Teradata.get(fbar);
		} else if(fbar && !this.buttons) {
			fbar = Teradata.get(fbar);
			var buttons = fbar.find('teradata-widget-button');
			if(buttons.length > 0) {
				this.fbar = fbar;
				this.buttons = [];
				for(var i = 0; i < buttons.length; i++) {
					this.buttons.push({
						el: buttons[i]
					});
				}
			}
		}
		
		if(!footer) {
			footer = document.createElement('div');
		}
		
		this.header = Teradata.get(header);
		this.body = Teradata.get(body);
		this.footer = Teradata.get(footer);
		
		if(!this.header.parent().get(0)) {
			this.el.append(header);
		}
		
		if(!this.body.parent().get(0)) {
			this.body.insertAfter(this.top || this.header);
		}
		
		if(this.tbar && !this.tbar.parent().get(0)) {
			this.tbar.addClass('teradata-widget-panel-tbar');
			this.tbar.insertBefore(this.body);
		}
		
		if(this.fbar && !this.fbar.parent().get(0)) {
			this.fbar.addClass('teradata-widget-panel-fbar');
			this.fbar.insertAfter(this.body);
		}
		
		if(!this.footer.parent().get(0)) {
			this.footer.insertAfter(this.fbar || this.body);
		}
		
		this.header.addClass('teradata-widget-panel-header');
		this.body.addClass('teradata-widget-panel-body');
		this.footer.addClass('teradata-widget-panel-footer');
		
		if(this.bodyPadding) {
			this.setBodyPadding(this.bodyPadding);
		}
		
		if(this.menus) {
			for(var i = 0; i < this.menus.length; i++) {
				var btn = this.menus[i];
				if(!Teradata.isFunction(btn.render)) {
					this.menus[i] = new Teradata.widget.Button(btn);
				}
				if(this.menus[i].handler && !this.menus[i].scope) {
					this.menus[i].scope = this;
				}
				if(btn.el) {
					this.menus[i].render();
				} else {
					this.menus[i].render(this.tbar);
				}
			}
			var tbarClear = document.createElement('div');
			this.tbarClear = Teradata.get(tbarClear);
			this.tbarClear.addClass('teradata-clear');
			this.tbar.append(this.tbarClear);
		}
		
		if(this.buttons) {
			for(var i = 0; i < this.buttons.length; i++) {
				var btn = this.buttons[i];
				if(!Teradata.isFunction(btn.render)) {
					this.buttons[i] = new Teradata.widget.Button(btn);
				}
				if(this.buttons[i].handler && !this.buttons[i].scope) {
					this.buttons[i].scope = this;
				}
				if(btn.el) {
					this.buttons[i].render();
				} else {
					this.buttons[i].render(this.fbar);
				}
			}
			var fbarClear = document.createElement('div');
			this.fbarClear = Teradata.get(fbarClear);
			this.fbarClear.addClass('teradata-clear');
			this.fbar.append(this.fbarClear);
		}
		
		if(this.hideHeader === true) {
			this.header.hide();
		}
		
		if(this.title) {
			this.setTitle(this.title);
		} else if(this.getTitleEl()) {
			this.title = this.getTitle();
		}
	},
	
	// private
	afterRender: function() {
		Teradata.widget.Panel.superclass.afterRender.apply(this, arguments);
		this.initEvents();
	},
	
	initEvents: Teradata.emptyFn,
	
	/**
	 * 设置标题
	 * @param {String} title
	 */
	setTitle: function(title) {
		this.title = title;
		this.getTitleEl().html(title);
	},
	
	/**
	 * 取得标题
	 * @return {String}
	 */
	getTitle: function() {
		if(this.title) {
			return this.title;
		}
		return this.getTitleEl().html();
	},
	
	// private
	getTitleEl: function() {
		if(this.rendered) {
			var titleEl = this.header.find('.teradata-widget-tc').get(0) || this.header;
			return Teradata.get(titleEl);
		}
	},
	
	// private
	getLayoutTarget: function() {
		return this.getContentTarget();
	},
	
	// private
	getContentTarget: function() {
		return this.mc || this.body;
	},
	
	/**
	 * 获得面板内容区
	 * @return {Element}
	 */
	getBody: function() {
		return this.body;
	},
	
	// private
    onResize: function(aw, ah, w, h) {
		this.getContentTarget().height(ah - this.header.outerHeight() - this.footer.outerHeight() - (this.tbar ? this.tbar.outerHeight() : 0) - (this.fbar ? this.fbar.outerHeight() : 0) - this.bodyPadding * 2);
    },
    
    /**
     * 设置内容区的padding
     * @param {Number/Array} padding
     */
    setBodyPadding: function(padding) {
    	if(padding instanceof Array) {
    		padding = padding.join('px ');
    	}
    	this.getContentTarget().css('padding', padding + 'px');
    }
});

Teradata.reg('panel', Teradata.widget.Panel);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.TabPanel
 * @extends Teradata.widget.Panel
 * 标签页面板
 * @constructor
 * 创建一个新的标签页面板
 * @param {Object} config 配置属性对象
 * @xtype tabpanel
 */
Teradata.widget.TabPanel = Teradata.extend(Teradata.widget.Panel, {
	
	/**
	 * @cfg {Number} activeTab
	 * 激活的页签
	 */
	activeTab: 0,
	
	corners: 'b',
	
	/**
	 * @cfg {String} tabPosition
	 * 页签的位置，可选值['t', 'b']
	 */
	tabPosition: 't',
	
	// private
	initComponent: function() {
		this.hideHeader = true;
		this.menus = this.tabPosition == 't';
		this.buttons = !this.menus;
		this.addEvents(
			/**
			 * @event beforetabchange
			 * 在激活指定标签页前触发，如果该事件监听器返回值为false，则阻断激活标签页动作执行。
			 * @param {Teradata.widget.TabPanel} this
			 * @param {Teradata.widget.Container} container
			 * @param {Number} index
			 */
			'beforetabchange',
			
			/**
			 * @event tabchange
			 * 在激活指定标签页前触发
			 * @param {Teradata.widget.TabPanel} this
			 * @param {Teradata.widget.Container} container
			 * @param {Number} index
			 */
			'tabchange'
		);
		Teradata.widget.TabPanel.superclass.initComponent.call(this);
	},
	
	// private
	onRender: function() {
		this.layout = 'tabpanel';
		Teradata.widget.TabPanel.superclass.onRender.apply(this, arguments);
		this.el.addClass('teradata-widget-tabpanel');
		
		this.strip = Teradata.get(document.createElement('div'));
		this.strip.addClass('teradata-widget-tabpanel-strip');
		
		var stripBottom = Teradata.get(document.createElement('div'));
		stripBottom.addClass('teradata-widget-tabpanel-strip-bottom');
		
		if(this.tabPosition == 't') {
			this.tbar.append(this.strip);
			this.tbar.append(stripBottom);
		} else {
			this.fbar.append(this.strip);
			this.fbar.append(stripBottom);
		}
		
		var stripClear = Teradata.get(document.createElement('div'));
		stripClear.addClass('teradata-clear');
		
		this.strip.append(stripClear);
		
		// TODO: strip scroll.
	},
	
	// private
	onBeforeAdd: function(c) {
		var result = Teradata.widget.TabPanel.superclass.onBeforeAdd.call(this, c);
		if(result === false) {
			return false;
		}
		c.hideMode = 'visibility';
		c.autoWidth = true;
		c.autoHeight = true;
		return c.getXType() == 'container';
	},
	
	// private
	getStrip: function() {
		return this.strip;
	},
	
	/**
	 * 激活标签页
	 * @param {Number/Teradata.widget.Container/HTMLElement} index
	 * @return {Teradata.widget.Container}
	 */
	setActiveTab: function(index) {
		var container = null;
		
		if(!Teradata.isNumber(index)) {
			container = index;
			index = this.items.indexOf(index);
			if(index == -1) {
				index = this.getContentTarget().children().indexOf(container);
				if(index == -1) {
					return null;
				} else {
					container = this.items[index];
				}
			}
		}
		
		if(Teradata.isNumber(index) && index != -1) {
			var header = this.getStrip().children()[index];
			if(header) {
				header = Teradata.get(header);
			} else {
				return null;
			}
			container = this.items[index];
			
			if(this.fireEvent('beforetabchange', this, container, index) !== false) {
				if(this.activeTab) {
					var at = this.activeTab;
					if(Teradata.isNumber(at)) {
						at = this.items[at];
					}
					if(at) {
						at.hide();
					}
				}
				container = container.getEl();
				
				this.getStrip().find('.teradata-widget-tabpanel-header-active').removeClass('teradata-widget-tabpanel-header-active');
				this.getContentTarget().children('.teradata-widget-tabpanel-container-active').removeClass('teradata-widget-tabpanel-container-active');
				
				header.addClass('teradata-widget-tabpanel-header-active');
				container.addClass('teradata-widget-tabpanel-container-active');
				
				this.activeTab = this.items[index];
				this.activeTab.show();
				this.fireEvent('tabchange', this, this.activeTab, index);
				return this.activeTab;
			}
		}
		return null;
	},
	
	// private
	onLayout: function() {
		Teradata.widget.TabPanel.superclass.onLayout.apply(this, arguments);
		this.setActiveTab(this.activeTab || 0);
	}
});

Teradata.reg('tabpanel', Teradata.widget.TabPanel);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.03.21
 */

/**
 * @class Teradata.widget.grid.Row
 * @extends Teradata.util.Observable
 * 表格行
 * @constructor
 * 创建一个新的表格行
 * @param {Object} config 配置对象
 */
Teradata.widget.grid.Row = Teradata.extend(Object, {
	
	// private
	constructor: function(config) {
		Teradata.apply(this, config);
		this.el = {};
		this.render(this.index);
	},
	
	// private
	render: function(index) {
		var columns = this.grid.getColumns();
		if(this.createDom) {
			// when the createDom is true, call column creating cell.
			for(var i = 0; i < columns.length; i++) {
				var column = columns[i];
				column.renderCell(this, index);
			}
			this.rendered = true;
			delete this.index;
		} else {
			// the operation is bind DOM elements.
			// load HTMLElement to el property.
			for(var i = 0; i < columns.length; i++) {
				var column = columns[i];
				this.el[column.getId()] = column.getCell(index);
			}
			this.rendered = true;
		}
	},
	
	/**
	 * 将行移动到指定位置
	 * @param {Number} index
	 */
	moveTo: function(index) {
		this.render(index);
	},
	
	/**
	 * 获得行位于表格中的位置，起始值为0。
	 * @return {Number}
	 */
	getIndex: function() {
		if(this.rendered) {
			var c = this.grid.getRecordIndexedColumn();
			var el = this.el[c.getId()];
			return Teradata.indexOf(el, el.parentNode.childNodes);
		} else {
			if(Teradata.isNumber(this.index)) {
				return this.index;
			}
		}
		return -1;
	},
	
	/**
	 * 删除该行
	 * @param {Boolean} destroy 是否删除后销毁对象
	 */
	remove: function(destroy) {
		for(var id in this.el) {
			this.el[id].parentNode.removeChild(this.el[id]);
		}
		if(destroy) {
			delete this.grid;
			delete this.record;
		}
	},
	
	/**
	 * 获得该行所对应的数据记录
	 * @return {Teradata.data.Record}
	 */
	getRecord: function() {
		var id = this.getRecordId();
		if(id) {
			return this.grid.getStore().getById(id);
		}
	},
	
	/**
	 * 获得该行所所对应的数据记录号
	 * @return {String}
	 */
	getRecordId: function() {
		for(var k in this.el) {
			var id = this.el[k].getAttribute('r');
			if(id) {
				return id;
			}
		}
	},
	
	/**
	 * 添加样式名
	 * @param {String} cls
	 */
	addClass: function(cls) {
		for(var k in this.el) {
			Teradata.get(this.el[k]).addClass(cls);
		}
	},
	
	/**
	 * 移除样式名
	 * @param {String} cls
	 */
	removeClass: function(cls) {
		for(var k in this.el) {
			Teradata.get(this.el[k]).removeClass(cls);
		}
	}
	
});/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.03.21
 */

/**
 * @class Teradata.widget.grid.Column
 * @extends Teradata.BoxComponent
 * 表格列
 * @constructor
 * 创建一个新的表格列
 * @param {Object} config 配置属性对象
 */
Teradata.widget.grid.Column = Teradata.extend(Teradata.BoxComponent, {
	
	corners: 'none',
	
	width: 120,
	
	/**
	 * @cfg {Function} cellRender
	 * 数据渲染方法。
	 * 该方法接收两个参数：
	 * <ul>
	 *     <li>value: 将被渲染的值</li>
	 *     <li>column: 列对象</li>
	 * </ul>
	 * 返回值将被转换为String渲染到单元格中。
	 */
	
	/**
	 * @cfg {Boolean} sortable
	 * 是否可以排序
	 */
	sortable: false,
	
	/**
	 * @cfg {Boolean} sortDirection
	 * 排序方向
	 */
	sortDirection: 'none',
	
	boxMinWidth: 40,
	
	/**
	 * @cfg {Boolean} resizable
	 * 是否可以调整宽度
	 */
	resizable: true,
	
	// private
	initComponent: function(config) {
		delete this.autoScroll;
		this.autoHeight = true;
		Teradata.widget.grid.Column.superclass.initComponent.call(this);
	},
	
	// private
	onRender: function() {
		Teradata.widget.grid.Column.superclass.onRender.apply(this, arguments);
		this.el.addClass('teradata-widget-gridpanel-column');
		
		this.header = Teradata.get(document.createElement('div'));
		this.header.addClass('teradata-widget-gridpanel-column-header');
		
		this.sortIcon = Teradata.get(document.createElement('a'));
		this.sortIcon.addClass('teradata-widget-gridpanel-column-header-sort-icon');
		
		this.headerInner = Teradata.get(document.createElement('div'));
		this.headerInner.addClass('teradata-widget-gridpanel-column-header-inner');
		
		this.headerText = Teradata.get(document.createElement('span'));
		
		this.header.insertBefore(this.ownerCt.getColumnsHeader().children().last());
		this.header.append(this.headerInner);
		this.headerInner.append(this.sortIcon);
		this.headerInner.append(this.headerText);
		this.setHeaderName(this.name);
		
		if(this.editor && !(this.editor instanceof Teradata.widget.Field)) {
			// 如果列编辑器没有初始化则初始化
			if(this.editor.xtype && !Teradata.isFunction(this.editor.getXType)) {
				this.editor = Teradata.create(this.editor);
				if(!(this.editor instanceof Teradata.widget.Field)) {
					// 当列编辑器不是Teradata.widget.Field类型则视为无效设置
					delete this.editor;
				}
			}
		}
	},
	
	// private
	afterRender: function() {
		Teradata.widget.grid.Column.superclass.afterRender.apply(this, arguments);
		this.setSortable(this.sortable);
		this.setSortDirection(this.sortDirection);
		
		if(this.editor) {
			this.editor.render(this.el);
		}
		
		this.initEvents();
		
		if(this.editor) {
			var editorEl = (this.editor.itemWrap || this.editor.el).get(0);
			editorEl.parentNode.removeChild(editorEl);
		}
		
		this.el.disableUserSelect();
	},
	
	// private
	initEvents: function() {
		this.bind(this.getHeader(), 'click', function(e) {
			if(this.disableOnceHeaderClick) {
				delete this.disableOnceHeaderClick;
			} else {
				this.onHeaderClick(e);
			}
		});
		if(this.editor) {
			this.editor.on('blur', function() {
				this.stopCellEditing();
			}, this);
		}
		this.bind(this.el, 'dblclick', this.onBodyDblClick);
	},
	
	// private
	onHeaderClick: function(e) {
		 if(this.sortable && e.target.className == 'teradata-widget-gridpanel-column-header-sort-icon') {
			if(!this.sortDirection || this.sortDirection === 'none') {
				this.setSortDirection('asc');
			} else if(this.sortDirection === 'asc') {
				this.setSortDirection('desc');
			} else {
				this.setSortDirection('none');
			}
			this.getGrid().getStore().addSort({
				field: this.getField(),
				direction: this.sortDirection
			}, true);
		}
	},
	
	// private
	onBodyDblClick: function(e) {
		this.startCellEditing(e);
	},
	
	// private
	startCellEditing: function(e) {
		if(this.editor) {
			this.getGrid().stopKeyEventMonitoring();
			var grid = this.getGrid();
			var cell = Teradata.get(e.target);
			var rowIndex = grid.getRowIndex(cell);
			var row = grid.getRowByIndex(rowIndex);
			var record = row.getRecord();
			
			cell = Teradata.get(this.el.get(0).childNodes[rowIndex]);
			this.editingCellContent = cell.html();
			cell.html('');
			cell.addClass('teradata-widget-gridpanel-cell-editing');
			cell.append(this.editor.itemWrap || this.editor.el);
			
			this.editor.el.focus();
			this.editor.setValue(record.get(this.field));
			this.editor.setWidth(cell.innerWidth());
			
			this.editingRecord = record;
			this.editingCell = cell;
		}
	},
	
	// private
	stopCellEditing: function() {
		var v = this.editor.getValue();
		var record = this.editingRecord;
		
		this.cancelCellEditing(v == this.editingCellContent);
		
		this.editor.setValue('');
		record.set(this.field, v);
	},
	
	// private
	cancelCellEditing: function(revertContent) {
		var el = (this.editor.itemWrap || this.editor.el).get(0);
		el.parentNode.removeChild(el);
		if(revertContent) {
			this.editingCell.html(this.editingCellContent);
		}
		this.editingCell.removeClass('teradata-widget-gridpanel-cell-editing');
		delete this.editingRecord;
		delete this.editingCellContent;
		delete this.editingCell;
		this.getGrid().startKeyEventMonitoring();
	},
	
	/**
	 * 获得列位于表格中的位置，起始值为0。
	 * @return {Number}
	 */
	indexOfGrid: function() {
		return this.getGrid().getColumns().indexOf(this);
	},
	
	/**
	 * 获得父级容器中的索引位置
	 * @return {Number}
	 */
	getIndex: function() {
		return this.ownerCt.items.indexOf(this);
	},
	
	// private
	onResize: function(w) {
		Teradata.widget.grid.Column.superclass.onResize.apply(this, arguments);
		this.header.width(w);
		if(this.editor && this.editingCell) {
			this.editor.setWidth(w);
		}
	},
	
	/**
	 * @private
	 * 通过指定Store对象渲染所有行
	 * @param {Teradata.data.Store} store
	 */
	renderCells: function() {
		var store = this.getGrid().getStore();
		var len = 0;
		// When batch cells creating.
		// Use the innerHTML property to high-performance creating elements.
		// But, the grid row objects will be lazy initialize.
		if(store && (len = store.getCount()) > 0) {
			var html = [];
			var isIndexed = this.isIndexed();
			var className = this.getCellStyleClass();
			for(var i = 0; i < len; i++) {
				var r = store.getAt(i);
				var v = r.get(this.field);
				if(isIndexed) {
					if(className) {
						html.push('<div class="teradata-widget-gridpanel-cell ');
						html.push(className);
						html.push('" r="');
					} else {
						html.push('<div class="teradata-widget-gridpanel-cell" r="');
					}
					html.push(r.id);
					html.push('">');
				} else {
					if(className) {
						html.push('<div class="teradata-widget-gridpanel-cell ');
						html.push(className);
						html.push('">');
					} else {
						html.push('<div class="teradata-widget-gridpanel-cell">');
					}
				}
				if(Teradata.isFunction(this.cellRender)) {
					html.push(this.cellRender.call(this, v));
				} else {
					html.push(v);
				}
				html.push('</div>');
			}
			html = html.join('');
			this.el.get(0).innerHTML = html;
		}
	},
	
	/**
	 * @private
	 * 通过指定的行对象渲染该列的行内容
	 * @param {Teradata.widget.grid.Row} row 行对象
	 * @param {Number} index 行索引
	 */
	renderCell: function(row, index) {
		// Find cell element in cache.
		var cell = row.el[this.getId()];
		var record = row.getRecord();
		if(!cell) {
			// if the cell is new, create it.
			var className = this.getCellStyleClass();
			cell = document.createElement('div');
			cell.className = className ? 'teradata-widget-gridpanel-cell ' + className : 'teradata-widget-gridpanel-cell';
			if(this.isIndexed()) {
				// when this column is index column, set id to cell attribute 'r'.
				cell.setAttribute('r', record.id);
			}
		} else if(Teradata.isNumber(index) && cell.parentNode && index >= 0){
			// move row.
			cell.parentNode.removeChild(cell);
			var columnBody = this.getContentTarget();
			if(Teradata.isNumber(index) && (index = columnBody.get(0).childNodes[index])) {
				columnBody.insertBefore(cell, index);
			} else {
				columnBody.append(cell);
			}
		}
		if(Teradata.isFunction(this.cellRender)) {
			// if this column has a cell render.
			// render cell by specified function.
			cell.innerHTML = this.cellRender.call(this, record.get(this.field));
		} else {
			cell.innerHTML = record.get(this.field);
		}
		row.el[this.getId()] = cell;
	},
	
	/**
	 * @private
	 * 获得单元格样式名
	 * @return {String}
	 */
	getCellStyleClass: function() {
		var type = this.getGrid().getStore().getFieldType(this.field);
		if(type == 'number') {
			return 'teradata-widget-gridpanel-cell-number';
		}
	},
	
	/**
	 * 通过指定索引获得单元格
	 * @param {Number} index
	 * @return {HTMLElement}
	 */
	getCell: function(index) {
		return this.el.get(0).childNodes[index];
	},
	
	/**
	 * 是否为索引列
	 * @return {Boolean}
	 */
	isIndexed: function() {
		return this.field == this.getGrid().getStore().identifier || this.indexColumn;
	},
	
	// private
	onDestroy: function() {
		this.header.remove();
		Teradata.widget.grid.Column.superclass.onDestroy.apply(this, arguments);
	},
	
	/**
	 * 获得列头
	 * @return {Element}
	 */
	getHeader: function() {
		return this.header;
	},
	
	/**
	 * 设置列头名称
	 * @param {String} name
	 */
	setHeaderName: function(name) {
		this.name = name;
		if(this.rendered) {
			this.headerText.html(name);
		}
	},
	
	/**
	 * 设置是否可排序
	 * @param {Boolean} sortable
	 */
	setSortable: function(sortable) {
		this.sortable = sortable;
	},
	
	/**
	 * 设置排序方向
	 * @param {String} sortDirection "asc" or "desc" or "none"
	 */
	setSortDirection: function(sortDirection) {
		if(/^asc|desc|none$/i.test(sortDirection) && this.sortable) {
			sortDirection = sortDirection.toLowerCase();
			if(this.rendered) {
				var header = this.getHeader();
				header.removeClass('teradata-widget-gridpanel-column-header-sort-' + this.sortDirection);
				header.addClass('teradata-widget-gridpanel-column-header-sort-' + sortDirection);
			}
			this.sortDirection = sortDirection;
		}
	},
	
	/**
	 * 获得排序信息
	 * @return {Object}
	 */
	getSort: function() {
		return {
			field: this.getField(),
			direction: this.sortDirection
		};
	},
	
	/**
	 * 获得该列对应的字段名
	 * @return {String}
	 */
	getField: function() {
		return this.field;
	},
	
	/**
	 * 获得列所属的表格
	 * @return {Teradata.widget.Grid}
	 */
	getGrid: function() {
		return this.ownerCt.getGrid();
	},
	
	/**
	 * 判定是否存在于相同组中
	 * @param {Teradata.widget.grid.Column} column
	 * @returns {Boolean}
	 */
	isSameGroup: function(column) {
		return column && this.ownerCt == column.ownerCt;
	}
});

Teradata.reg('column', Teradata.widget.grid.Column);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.03.21
 */

/**
 * @class Teradata.widget.grid.ColumnGroup
 * @extends Teradata.widget.Container
 * 列组
 * @constructor
 * 创建列组
 * @param {Object} config 配置属性对象
 */
Teradata.widget.grid.ColumnGroup = Teradata.extend(Teradata.widget.Container, {
	
	/**
	 * @cfg {Boolean} hiddHeader
	 */
	
	columnType: 'column',
	
	columnGroupType: 'columngroup',
	
	// private
	initComponent: function() {
		this.layout = 'auto';
		Teradata.widget.grid.ColumnGroup.superclass.initComponent.call(this);
	},
	
	// private
	onRender: function() {
		Teradata.widget.grid.ColumnGroup.superclass.onRender.apply(this, arguments);
		this.el.addClass('teradata-widget-gridpanel-columngroup');
		
		this.header = Teradata.get(document.createElement('div'));
		this.header.addClass('teradata-widget-gridpanel-column-header');
		this.header.addClass('teradata-widget-gridpanel-columngroup-header');
		
		
		this.headerInner = Teradata.get(document.createElement('div'));
		this.headerInner.addClass('teradata-widget-gridpanel-column-header-inner');
		this.headerInner.addClass('teradata-widget-gridpanel-columngroup-header-inner');
		
		this.headerText = Teradata.get(document.createElement('span'));
		
		this.header.insertBefore(this.ownerCt.getColumnsHeader().children().last());
		this.header.append(this.headerInner);
		this.headerInner.append(this.headerText);
		
		var clear = document.createElement('div');
		clear.className = 'teradata-clear';
		this.header.append(clear);
		
		var clear = document.createElement('div');
		clear.className = 'teradata-clear';
		this.el.append(clear);
		
		this.setHeaderName(this.name);
		
		if(this.hiddHeader) {
			this.headerInner.addClass('teradata-hide-hidden');
		}
	},
	
	// private
	getColumnsHeader: function() {
		return this.header;
	},
	
	/**
	 * 设组名称
	 * @param {String} name
	 */
	setHeaderName: function(name) {
		this.name = name;
		if(this.rendered) {
			this.headerText.html(name);
		}
	},
	
	// private
	add: function(column) {
		if(Teradata.isArray(column)) {
			return Teradata.widget.grid.ColumnGroup.superclass.add.call(this, column);
		}
		if(!column.xtype && !column.getXType) {
			if(column.items) {
				column.xtype = this.columnGroupType;
			} else {
				column.xtype = this.columnType;
			}
		}
		return Teradata.widget.grid.ColumnGroup.superclass.add.call(this, column);
	},
	
	// private
	onBeforeAdd: function(column) {
		var r =Teradata.widget.grid.ColumnGroup.superclass.onBeforeAdd.call(this, column);
		if(r !== false) {
			return column instanceof Teradata.widget.grid.Column
				|| column instanceof Teradata.widget.grid.ColumnGroup;
		}
		return false;
	},
	
	/**
	 * 获得列组所属的表格
	 * @return {Teradata.widget.Grid}
	 */
	getGrid: function() {
		if(this.ownerCt instanceof Teradata.widget.GridPanel) {
			return this.ownerCt;
		} else {
			return this.ownerCt.getGrid();
		}
	},
	
	// private
	doLayout: function() {
		Teradata.widget.grid.ColumnGroup.superclass.doLayout.apply(this, arguments);
		
		if(Teradata.isIE6) {
			this.adjustHeaderWidth(false);
		}
		
		var height = this.getColumnsHeader().outerHeight() - (this.hiddHeader ? 0 : this.headerInner.outerHeight());
		for(var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			if(item instanceof Teradata.widget.grid.Column) {
				var padding = parseInt((height - item.headerText.outerHeight()) / 2, 10);
				item.headerInner.css('padding', [padding, 0, padding, 8, ''].join('px '));
			}
		}
	},
	
	// fixed ie6 inline-block.
	adjustHeaderWidth: function(processChildren) {
		if(this.rendered) {
			var w = 0;
			for(var i = 0; i < this.items.length; i++) {
				var item = this.items[i];
				if(item instanceof Teradata.widget.grid.ColumnGroup && processChildren !== false) {
					item.adjustHeaderWidth();
				}
				w += item.el.outerWidth();
				this.header.width(w);
			}
		}
	},
	
	/**
	 * 获得列索引值
	 * @param {Element} el
	 */
	getColumnIndex: function(el) {
		if(el.is('.teradata-widget-gridpanel-column-header-inner')) {
			// if the specified element is column-header-inner.
			// indexing parent node in the columns-header.
			return Teradata.indexOf(el.get(0).parentNode, el.get(0).parentNode.parentNode.childNodes) - 1;
		} else {
			return Teradata.indexOf(el.get(0), el.get(0).parentNode.childNodes);
		}
	},
	
	/**
	 * 判定是否存在于相同组中
	 * @param {Teradata.widget.grid.Column} column
	 * @returns {Boolean}
	 */
	isSameGroup: function(column) {
		return column && this.ownerCt == column.ownerCt;
	}
});

Teradata.reg('columngroup', Teradata.widget.grid.ColumnGroup);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.03.21
 */

/**
 * @class Teradata.widget.grid.SelectionModel
 * @extends Teradata.util.Observable
 * 表格行
 * @constructor
 * 创建一个新的表格行
 * @param {Object} config 配置属性对象
 */
Teradata.widget.grid.SelectionModel = Teradata.extend(Object, {
	
	/**
	 * @cfg {String} rowSeparator
	 * 行内容间的分隔符，该分隔符用于选择行后按下ctrl + c键复制内容时行内容间的文本，默认值为\n。
	 */
	rowSeparator: '\n',
	
	/**
	 * @cfg {String} rowSeparator
	 * 列内容间的分隔符，该分隔符用于选择列后按下ctrl + c键复制内容时列内容间的文本，默认值为\t。
	 */
	cellSeparator: '\t',
	
	/**
	 * @private
	 * 初始化选择模型对象，该方法在Grid对象initComponent执行后执行。
	 * @param grid
	 */
	init: function(grid) {
		this.grid = grid;
		this.selectedRows = [];
		this.selectedColumns = [];
	},
	
	/**
	 * @private
	 * 在表格
	 * @param grid
	 */
	initEvents: function() {
		var columnsBody = this.grid.getColumnsBody();
		var columnsHeader = this.grid.getColumnsHeader();
		this.grid.bind(columnsBody, 'click', this.onColumnsBodyClick, this);
		this.grid.bind(columnsHeader, 'click', function(e) {
			if(this.disableOnceHeaderClick) {
				delete this.disableOnceHeaderClick;
			} else {
				this.onColumnsHeaderClick(e);
			}
		}, this);
		this.grid.bind(this.grid.keyEventMonitor, 'keydown', this.onKeyDown, this);
	},
	
	// private
	onKeyDown: function(e) {
		var code = e.keyCode;
		if(e.ctrlKey && code == 67) {
			// CTRL + C
			// Grid key event monitor textarea will got focus.
			// On before OS copy operation execute, settings will be copied into the textarea and selecting the content.
			if(this.lastSelected == 'row' && this.selectedRows) {
				var text = [];
				var columns = this.grid.getColumns();
				for(var j = 0; j < this.selectedRows.length; j++) {
					var row = this.selectedRows[j];
					var record = row.getRecord();
					var rowText = [];
					for(var i = 0; i < columns.length; i++) {
						var column = columns[i];
						rowText.push(record.get(column.field));
					}
					text.push(rowText.join(this.cellSeparator));
				}
				text = text.join(this.rowSeparator);
				
				this.grid.keyEventMonitor.val(text);
				this.grid.keyEventMonitor.select();
			} else if(this.lastSelected == 'column' && this.selectedColumns) {
				var text = [];
				var store = this.grid.getStore();
				
				for(var i = 0; i < store.getCount(); i++) {
					var rowText = [];
					for(var j = 0; j < this.selectedColumns.length; j++) {
						var column = this.selectedColumns[j];
						var value = store.getAt(i).get(column.field);
						rowText.push(value);
					}
					text.push(rowText.join(this.cellSeparator));
				}
				
				text = text.join(this.rowSeparator);
				this.grid.keyEventMonitor.val(text);
				this.grid.keyEventMonitor.select();
			}
		} else if(code == 116) {
			// F5 
			// Refresh store.
			if(this.grid.store.url) {
				this.grid.store.load();
			}
			e.preventDefault();
		} else {
			e.preventDefault();
		}
	},
	
	// private
	onColumnsBodyClick: function(e) {
		var cell = Teradata.get(e.target);
		if(!cell.is('.teradata-widget-gridpanel-column')) {
			var rowIndex = this.grid.getRowIndex(cell);
			
			if(e.shiftKey && this.selectedRows.length > 0) {
				var selectedIndex = this.selectedRows[0].getIndex();
				var start = Math.min(rowIndex, selectedIndex);
				var end = Math.max(rowIndex, selectedIndex);
				var rows = [];
				for(var i = start; i <= end; i++) {
					rows.push(this.grid.getRowByIndex(i));
				}
				this.selectRow(rows, true);
			} else {
				var row = this.grid.getRowByIndex(rowIndex);
				this.selectRow(row, !e.ctrlKey);
			}
		}
		this.lastSelected = 'row';
	},
	
	// private
	onColumnsHeaderClick: function(e) {
		var columns = this.grid.getColumns();
		var columnIndex = this.grid.getColumnIndexByMouseEvent(e);
		if(e.shiftKey && this.selectedColumns.length > 0) {
			var selectedIndex = this.selectedColumns[0].indexOfGrid();
			var start = Math.min(columnIndex, selectedIndex);
			var end = Math.max(columnIndex, selectedIndex);
			var cs = [];
			console.log(start, end);
			for(var i = start; i <= end; i++) {
				cs.push(columns[i]);
			}
			this.selectColumn(cs, true);
		} else {
			var column = columns[columnIndex];
			this.selectColumn(column, !e.ctrlKey);
		}
		this.lastSelected = 'column';
	},
	
	/**
	 * 选择行
	 * @param {Teradata.widget.grid.Row} row
	 * @param {Boolean} clearSelection
	 * @param {Boolean} suspendedEvent
	 */
	selectRow: function(row, clearSelection, suspendedEvent, noSort) {
		if(clearSelection) {
			this.deselectRow(this.selectedRows);
		}
		if(Teradata.isArray(row)) {
			for(var i = 0; i < row.length; i++) {
				this.selectRow(row[i], false, true, true);
			}
			this.selectedRows.sort(function(a, b) {
				return a.getIndex() - b.getIndex();
			});
			if(!suspendedEvent) {
				this.grid.fireEvent('selectrow', this.grid, row);
			}
		} else {
			if(this.selectedRows.indexOf(row) == -1) {
				this.selectedRows.push(row);
				row.addClass('teradata-widget-gridpanel-row-selected');
				if(!noSort) {
					this.selectedRows.sort(function(a, b) {
						return a.getIndex() - b.getIndex();
					});
				}
				if(!suspendedEvent) {
					this.grid.fireEvent('selectrow', this.grid, this.selectedRows);
				}
			}
		}
	},
	
	/**
	 * 选择列
	 * @param {Teradata.widget.grid.Column} column
	 * @param {Boolean} clearSelection
	 * @param {Boolean} suspendedEvent
	 */
	selectColumn: function(column, clearSelection, suspendedEvent, noSort) {
		if(clearSelection) {
			this.deselectColumn(this.selectedColumns);
		}
		if(Teradata.isArray(column)) {
			for(var i = 0; i < column.length; i++) {
				this.selectColumn(column[i], false, true);
			}
			this.selectedColumns.sort(function(a, b) {
				return a.indexOfGrid() - b.indexOfGrid();
			});
			if(!suspendedEvent) {
				this.grid.fireEvent('selectcolumn', this.grid, column);
			}
		} else {
			this.selectedColumns.push(column);
			column.el.addClass('teradata-widget-gridpanel-column-selected');
			if(!noSort) {
				this.selectedColumns.sort(function(a, b) {
					return a.indexOfGrid() - b.indexOfGrid();
				});
			}
			if(!suspendedEvent) {
				this.grid.fireEvent('selectcolumn', this.grid, column);
			}
		}
	},
	
	/**
	 * 撤销选择行
	 * @param {Teradata.widget.grid.Row} row
	 * @param {Boolean} suspendedEvent
	 */
	deselectRow: function(row, suspendedEvent) {
		if(Teradata.isArray(row)) {
			for(var i = row.length - 1; i >= 0; i--) {
				this.deselectRow(row[i], true);
			}
			if(!suspendedEvent) {
				this.grid.fireEvent('deselectrow', this.grid, row);
			}
		} else {
			this.selectedRows.remove(row);
			row.removeClass('teradata-widget-gridpanel-row-selected');
			if(!suspendedEvent) {
				this.grid.fireEvent('deselectrow', this.grid, row);
			}
		}
	},
	
	/**
	 * 清空已选行
	 * @param {Boolean} 是否执行撤销选择
	 * @param {Boolean} 如果执行撤销选择是否暂停事件
	 */
	clearSelectedRows: function(deselect, suspendedEvent) {
		if(deselect) {
			this.deselectRow(this.selectedRows, suspendedEvent);
		} else {
			this.selectedRows = [];
		}
	},
	
	/**
	 * 撤销选择列
	 * @param {Teradata.widget.grid.Column} column
	 * @param {Boolean} suspendedEvent
	 */
	deselectColumn: function(column, suspendedEvent) {
		if(Teradata.isArray(column)) {
			for(var i = column.length - 1; i >= 0; i--) {
				this.deselectColumn(column[i], false, true);
			}
		} else {
			this.selectedColumns.remove(column);
			column.el.removeClass('teradata-widget-gridpanel-column-selected');
			if(!suspendedEvent) {
				this.grid.fireEvent('deselectcolumn', this.grid, column);
			}
		}
	},
	
	/**
	 * 获得所有选中的行
	 * @return {Array}
	 */
	getSelectedRows: function() {
		return this.selectedRows;
	},
	
	/**
	 * 获得所有选中的列
	 * @return {Array}
	 */
	getSelectedColumns: function() {
		return this.selectedColumns;
	},
	
	/**
	 * @private
	 * 在表格
	 * @param grid
	 */
	destroy: function() {
		delete this.grid;
	}
});/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.04.12
 */

/**
 * @class Teradata.widget.grid.PaginationBar
 * @extends Teradata.BoxComponent
 * 表格分页栏
 * @constructor
 * 创建一个新的表格分页栏
 * @param {Object} config 配置属性对象
 */
Teradata.widget.grid.PaginationBar = Teradata.extend(Teradata.BoxComponent, {
	
	corners: 'none',
	
	width: 200,
	
	initComponent: function() {
		Teradata.widget.grid.PaginationBar.superclass.initComponent.call(this);
		this.num = new Teradata.widget.NumberField({
			submitValue: false,
			width: 40,
			precision: 0
		});
	},
	
	// private
	onRender: function() {
		Teradata.widget.grid.PaginationBar.superclass.onRender.apply(this, arguments);
		this.el.addClass('teradata-widget-gridpanel-paginationbar');
		
		this.first = Teradata.get(document.createElement('div'));
		this.prev = Teradata.get(document.createElement('div'));
		this.next = Teradata.get(document.createElement('div'));
		this.last = Teradata.get(document.createElement('div'));
		
		this.pages = Teradata.get(document.createElement('div'));
		
		this.first.addClass('teradata-widget-icon');
		this.prev.addClass('teradata-widget-icon');
		this.next.addClass('teradata-widget-icon');
		this.last.addClass('teradata-widget-icon');
		this.first.addClass('teradata-widget-grid-paginationbar-first');
		this.prev.addClass('teradata-widget-grid-paginationbar-prev');
		this.next.addClass('teradata-widget-grid-paginationbar-next');
		this.last.addClass('teradata-widget-grid-paginationbar-last');
		this.pages.addClass('teradata-widget-grid-paginationbar-pages');
		
		this.el.append(this.first);
		this.el.append(this.prev);
		this.el.append(this.next);
		this.el.append(this.last);
		this.num.render(this.el, 4);
		this.el.append(this.pages);
	},
	
	// private
	afterRender: function() {
		Teradata.widget.grid.PaginationBar.superclass.afterRender.apply(this, arguments);
		this.initEvent();
	},
	
	// private
	initEvent: function() {
		this.bind(this.el, 'click', this.onClick);
		this.num.on('keydown', this.onPageNumKeyDown, this);
	},
	
	// private
	onClick: function(e) {
		if(!this.disabled) {
			var target = Teradata.get(e.target);
			if(target.is('.teradata-widget-grid-paginationbar-first')) {
				this.store.forwardPage(0);
			} else if(target.is('.teradata-widget-grid-paginationbar-prev')) {
				this.store.prevPage();
			} else if(target.is('.teradata-widget-grid-paginationbar-next')) {
				this.store.nextPage();
			} else if(target.is('.teradata-widget-grid-paginationbar-last')) {
				this.store.forwardPage(this.store.getPages() - 1);
			}
		}
	},
	
	// private
	onPageNumKeyDown: function(text, e) {
		if(e.keyCode == 13 && text.validate()) {
			// enter
			var pageNum = parseInt(this.num.getValue(), 10) - 1;
			this.store.forwardPage(pageNum);
		}
	},
	
	/**
	 * 绑定Store
	 */
	bindStore: function(store) {
		if(this.store) {
			this.store.un('load', this.update);
		}
		this.store = store;
		this.store.on('load', this.update, this);
	},
	
	// private
	update: function() {
		this.num.setValue(this.store.getCurrentPage() + 1);
		this.pages.html(' / ' + this.store.getPages());
	},
	
	disable: function(disabled) {
		Teradata.widget.grid.PaginationBar.superclass.disable.apply(this, arguments);
		this.num.disable(disabled);
	}
});/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.03.21
 */

/**
 * @class Teradata.widget.GridPanel
 * @extends Teradata.widget.Panel
 * 表格面板
 * @constructor
 * 创建一个新的表格面板
 * @param {Object} config 配置属性对象
 * @xtype grid
 * 
 * 因性能原因，表格选择行的逻辑使用行位置计算行索引，所以行高必须是相同的，否则会出现定位不准的情况。
 */
Teradata.widget.GridPanel = Teradata.extend(Teradata.widget.Panel, {
	
	/**
	 * @cfg {String} defaultColumnEditor
	 * 默认列编辑器类型
	 */
	defaultColumnEditor: 'text',
	
	/**
	 * @cfg {Boolean} lazyRenderRows
	 * 延迟渲染行，当表格数据过多时建议设置为true。
	 * 当该参数设定为true时表格将延迟渲染溢出的行，因此必须指定表格的height属性并且将autoHeight属性设定为false。
	 */
	lazyRenderRows: false,
	
	/**
	 * @cfg {Teradata.widget.grid.SelectionModel} selectionModel
	 * 选择器模型
	 */
	
	columnType: 'column',
	
	columnGroupType: 'columngroup',
	
	pagination: false,
	
	autoLoad: true,
	
	// private
	initComponent: function() {
		this.addEvents(
			/**
			 * @event selectrow
			 * 选择一行之后触发
			 * @param {Teradata.widget.GridPanel} this
			 * @param {Teradata.widget.grid.Row/Array} row 选择的行
			 */
			'selectrow',
			
			/**
			 * @event selectcolumn
			 * 选择一列之后触发
			 * @param {Teradata.widget.GridPanel} this
			 * @param {Teradata.widget.grid.Column/Array} column 选择的行
			 */
			'selectcolumn',
			
			/**
			 * @event deselectrow
			 * 撤销选择一行之后触发
			 * @param {Teradata.widget.GridPanel} this
			 * @param {Teradata.widget.grid.Row/Array} row 撤销选择的行
			 */
			'deselectrow',
			
			/**
			 * @event deselectcolumn
			 * 撤销选择一列之后触发
			 * @param {Teradata.widget.GridPanel} this
			 * @param {Teradata.widget.grid.Column/Array} column 撤销选择的行
			 */
			'deselectcolumn'
		);
		this.bodyPadding = 0;
		delete this.items;
		this.layout = 'auto';
		this.autoScroll = !this.autoHeight;
		
		Teradata.widget.GridPanel.superclass.initComponent.call(this);
		
		this.rowMap = {};
		this.columnsRoot = new Teradata.widget.grid.ColumnGroup({
			hiddHeader: true
		});
		this.add(this.columnsRoot);
		
		var columns = this.columns;
		delete this.columns;
		this.columnsRoot.add(columns);
		
		if(!this.hasRecordIndexedColumn()) {
			// attributes count of DOM node will affect the performance of creation.
			// when the grid got a very large result set, to minimize the number of attributes, it's performance of render operation will be significantly improved.
			this.getColumns()[0].indexColumn = true;
		}
		
		// initialize selection model.
		if(!this.selectionModel || !(this.selectionModel instanceof Teradata.widget.grid.SelectionModel)) {
			this.selectionModel = new Teradata.widget.grid.SelectionModel();
		}
		this.selectionModel.init(this);
		
		if(this.pagination) {
			this.buttons = this.buttons || [];
			this.paginationBar = new Teradata.widget.grid.PaginationBar();
			this.buttons.splice(0, 0, this.paginationBar);
		}
	},
	
	// private
	onRender: function() {
		Teradata.widget.GridPanel.superclass.onRender.apply(this, arguments);
		this.el.addClass('teradata-widget-gridpanel');
		
		var columnsHeaderBar = Teradata.get(document.createElement('div'));
		columnsHeaderBar.addClass('teradata-widget-gridpanel-columns-header-bar');
		
		var columnsHeaderWrap = Teradata.get(document.createElement('div'));
		columnsHeaderWrap.addClass('teradata-widget-gridpanel-columns-header-wrap');
		
		var columnsHeader = Teradata.get(document.createElement('div'));
		columnsHeader.addClass('teradata-widget-gridpanel-columns-header');
		
		var columnsBody = Teradata.get(document.createElement('div'));
		columnsBody.addClass('teradata-widget-gridpanel-columns-body');
		
		var columnResizeLineWrap = Teradata.get(document.createElement('div'));
		columnResizeLineWrap.addClass('teradata-widget-gridpanel-column-resizeline-wrap');
		
		var columnMoveDragDropElWrap = Teradata.get(document.createElement('div'));
		columnMoveDragDropElWrap.addClass('teradata-widget-gridpanel-column-move-wrap');
		
		var columnResizeLine = Teradata.get(document.createElement('div'));
		columnResizeLine.addClass('teradata-widget-gridpanel-column-resizeline');
		
		columnsHeaderBar.insertBefore(this.getBody());
		columnsHeaderBar.append(columnsHeaderWrap);
		columnResizeLineWrap.insertBefore(columnsHeaderWrap);
		columnMoveDragDropElWrap.insertBefore(columnsHeaderWrap);
		columnResizeLineWrap.append(columnResizeLine);
		columnsHeaderWrap.append(columnsHeader);
		this.getContentTarget().append(columnsBody);
		
		this.columnsHeaderWrap = columnsHeaderWrap;
		this.columnsHeader = columnsHeader;
		this.columnResizeLine = columnResizeLine;
		this.columnMoveDragDropElWrap = columnMoveDragDropElWrap;
		this.columnsBody = columnsBody;
		
		var clear = document.createElement('div');
		clear.className = 'teradata-clear';
		this.getLayoutTarget().append(clear);
		
		clear = document.createElement('div');
		clear.className = 'teradata-clear';
		this.columnsHeader.append(clear);
		
		this.keyEventMonitor = Teradata.get(document.createElement('textarea'));
		this.keyEventMonitor.addClass('teradata-widget-gridpanel-key-event-monitor');
		this.columnsBody.append(this.keyEventMonitor);
	},
	
	// private
	afterRender: function() {
		Teradata.widget.GridPanel.superclass.afterRender.apply(this, arguments);
		if(!this.store && this.fields) {
			this.store = new Teradata.data.Store({
				fields: this.getColumnFields()
			});
		}
		if(this.store) {
			this.bindStore(this.store);
			if(this.datas) {
				this.store.loadData(this.datas);
			} else if(this.store.url && this.autoLoad) {
				this.store.load();
			}
		}
	},
	
	// private
	getColumnFields: function() {
		var fields = [];
		for(var i = 0; i < this.columns.length; i++) {
			var column = this.columns[i];
			fields.push({
				name: column.field,
				type: column.type
			});
		}
		return fields;
	},
	
	// private
	initEvents: function() {
		Teradata.widget.GridPanel.superclass.initEvents.apply(this, arguments);
		
		// initialize selection events.
		this.selectionModel.initEvents(this);
		
		// bind UI events.
		var columnsBody = this.getColumnsBody();
		var columnsHeader = this.getColumnsHeader();
		
		this.bind(this.getContentTarget(), 'scroll', this.onScroll);
		this.bind(columnsBody, 'mouseover', this.onRowMouseOver);
		this.bind(columnsBody, 'mouseout', this.onMouseOut);
		this.bind(this.el, 'mousemove', this.onMouseMove);
		this.bind(columnsHeader, 'mousedown', this.onHeaderMouseDown);
		this.bind(this.el, 'mouseup', this.onHeaderMouseUp);
		this.bind(this.el, 'mousewheel', function() {
			// when the drag operation is executing, disable mouse wheel.
			if(this.movingColumn || this.resizingColumn) {
				e.preventDefault();
			}
		});
		
		// disable user select
		this.el.children().find('.teradata-widget-gridpanel-columns-header-bar').disableUserSelect();
		
		this.bind(columnsBody, 'click', function(e) {
			// set focus to key event monitor.
			if(!this.suspendedKeyEventMonitoring) {
				//var offset = this.el.offset();
				//this.keyEventMonitor.css('left', e.pageX - offset.left);
				//this.keyEventMonitor.css('top', e.pageY - offset.top);
				this.keyEventMonitor.select();
			}
		});
		this.bind(columnsHeader, 'click', function(e) {
			// set focus to key event monitor.
			if(!this.suspendedKeyEventMonitoring) {
				//var offset = this.el.offset();
				//this.keyEventMonitor.css('left', e.pageX - offset.left);
				//this.keyEventMonitor.css('top', e.pageY - offset.top);
				this.keyEventMonitor.select();
			}
		});
	},
	
	/**
	 * 停止监控键盘事件
	 */
	stopKeyEventMonitoring: function() {
		this.suspendedKeyEventMonitoring = true;
	},
	
	/**
	 * 开始监控键盘事件
	 */
	startKeyEventMonitoring: function() {
		this.suspendedKeyEventMonitoring = false;
	},
	
	// private
	onRowMouseOver: function(e) {
		e.stopPropagation();
		// if no resize and move operation.
		// set hover style for the row.
		if(!this.resizingColumn && !this.movingColumn && e.target.className == 'teradata-widget-gridpanel-cell') {
			var cell = Teradata.get(e.target);
			if(!e.target.className || e.target.className.indexOf('teradata-widget-gridpanel-row-hover') == -1) {
				var rowIndex = this.getRowIndex(cell);
				var row = this.getRowByIndex(rowIndex);
				row.addClass('teradata-widget-gridpanel-row-hover');
				if(this.hoverRow) {
					this.hoverRow.removeClass('teradata-widget-gridpanel-row-hover');
				}
				this.hoverRow = row;
			}
		}
	},
	
	// private
	onMouseOut: function(e) {
		e.stopPropagation();
		if(!this.resizingColumn && !this.movingColumn) {
			if(this.hoverRow && e.relatedTarget && (!e.relatedTarget.className || e.relatedTarget.className.indexOf('teradata-widget-gridpanel-row-hover') == -1)) {
				this.hoverRow.removeClass('teradata-widget-gridpanel-row-hover');
				delete this.hoverRow;
			}
		} else {
			var x = e.pageX;
			var y = e.pageY;
			var top = this.ddRegion.top;
			var left = this.ddRegion.left;
			var right = this.ddRegion.right;
			var bottom = this.ddRegion.bottom;
			
			// if the cursor position out of drag zone, cancel current operation.
			if(x < left || x > right || y < top || y > bottom) {
				this.cancelColumnMove();
				this.cancelColumnResize();
			}
		}
	},
	
	// private
	onMouseMove: function(e) {
		e.preventDefault();
		e.stopPropagation();
		var x = e.pageX;
		var target = Teradata.get(e.target);
		if(target.is('.teradata-widget-gridpanel-column-header-inner span')) {
			target = target.parent();
		}
		if(this.resizingColumn) {
			var left = x - this.getBody().offset().left;
			this.columnResizeLineMoved = true;
			this.columnResizeLine.css('left', left);
		} else if(this.columnMoveReady){
			if(!this.movingColumn) {
				this.startColumnMove(e);
				var left = x - this.getBody().offset().left;
				this.columnMoveDragDropEl.css('left', left);
			} else {
				var left = x - this.getBody().offset().left;
				this.columnMoveDragDropEl.css('left', left);
			}
		} else if(target.is('.teradata-widget-gridpanel-column-header-inner')) {
			var header = target;
			if(header.get(0)) {
				var headerOffset = header.offset();
				// 6 pixels in the right of per column header can fire resize event.
				// If cursor enter this area, mouse style will be "e-resize". 
				// 1. set the CSS class name "teradata-widget-gridpanel-column-header-resize" for header.
				// 2. set status "columnResizeReady" is true.
				if(x >= headerOffset.left + header.outerWidth() - 6 && x <= headerOffset.left + header.outerWidth()) {
					var column = this.getColumns()[this.getColumnIndexByMouseEvent(e)];
					if(column && column.resizable) {
						// if the current handle column can be resized.
						this.columnsHeader.addClass('teradata-widget-gridpanel-column-header-resize');
						this.el.get(0).style.cursor = 'e-resize';
						this.columnResizeReady = true;
					}
				} else {
					this.columnsHeader.removeClass('teradata-widget-gridpanel-column-header-resize');
					this.el.get(0).style.cursor = '';
					delete this.columnResizeReady;
				}
			}
		} else if(!this.resizingColumn) {
			this.columnsHeader.removeClass('teradata-widget-gridpanel-column-header-resize');
			this.el.get(0).style.cursor = '';
		}
	},
	
	// private
	onHeaderMouseDown: function(e) {
		e.preventDefault();
		this.handleColumn = this.getColumns()[this.getColumnIndexByMouseEvent(e)];
		if(this.handleColumn) {
			var targetHeaderEl = Teradata.get(e.target);
			if(targetHeaderEl.is('span')) {
				targetHeaderEl = targetHeaderEl.parent();
			}
			if(this.handleColumn.headerInner.get(0) != targetHeaderEl.get(0)) {
				var p = this.handleColumn;
				while((p = p.ownerCt) != this.columnsRoot) {
					if(p.headerInner.get(0) == targetHeaderEl.get(0)) {
						this.handleColumnGroup = p;
					}
				}
			}
			if(this.columnResizeReady) {
				this.startColumnResize(e);
			} else {
				this.columnMoveReady = true;
			}
		}
	},
	
	// private
	onHeaderMouseUp: function(e) {
		if(this.resizingColumn) {
			if(this.getColumns()[this.getColumnIndexByMouseEvent(e)] == this.resizingColumn) {
				this.resizingColumn.disableOnceHeaderClick = true;
				this.selectionModel.disableOnceHeaderClick = true;
			}
			this.stopColumnResize(e);
		}
		if(this.movingColumn) {
			if(this.getColumns()[this.getColumnIndexByMouseEvent(e)] == this.movingColumn) {
				this.movingColumn.disableOnceHeaderClick = true;
				this.selectionModel.disableOnceHeaderClick = true;
			}
			this.stopColumnMove(e);
		}
		delete this.columnMoveReady;
		delete this.handleColumn;
		delete this.handleColumnGroup;
	},
	
	// private
	onScroll: function(e) {
		var left = this.getContentTarget().scrollLeft();
		if(left != this.lastColumnsHeaderLeft) {
			this.columnsHeader.css('left', left * -1 + 'px');
			this.lastColumnsHeaderLeft = left;
		}
	},
	
	// private
	startColumnMove: function(e) {
		this.movingColumn = this.handleColumnGroup || this.handleColumn;
		this.ddRegion = this.el.region();
		var header = this.movingColumn.header.clone();
		this.columnMoveDragDropEl = Teradata.get(document.createElement('div'));
		this.columnMoveDragDropEl.addClass('teradata-widget-gridpanel-column-header-move');
		this.columnMoveDragDropEl.append(header);
		this.columnMoveDragDropEl.width(this.movingColumn.header.outerWidth());
		this.columnMoveDragDropElWrap.append(this.columnMoveDragDropEl);
		var shadow = new Teradata.Shadow();
		shadow.applyTo(header);
	},
	
	// private
	stopColumnMove: function(e) {
		if(this.movingColumn) {
			var columns = this.movingColumn.ownerCt.items;
			var fromIndex = columns.indexOf(this.movingColumn);
			var toIndex = this.getColumnIndexByMouseEvent(e, this.movingColumn.ownerCt);
			if(Teradata.isNumber(toIndex)) {
				var toColumn = columns[toIndex];
				var x = e.pageX;
				var toCenter = toColumn.el.offset().left + toColumn.el.outerWidth() / 2;
				var operate = null;
				if(x > toCenter) {
					operate = 'insertAfter';
				} else {
					operate = 'insertBefore';
				}
				if(toIndex != fromIndex && this.movingColumn.isSameGroup(toColumn)) {
					var fromEl = this.movingColumn.el.get(0);
					var formHeaderEl = this.movingColumn.header.get(0);
					var toEl = toColumn.el;
					var toHeaderEl = toColumn.header;
					
					// remove DOM element.
					fromEl.parentNode.removeChild(fromEl);
					formHeaderEl.parentNode.removeChild(formHeaderEl);
					// insert DOM element before target column.
					this.movingColumn.el[operate](toEl);
					this.movingColumn.header[operate](toHeaderEl);
					
					// remove column from items of group.
					this.movingColumn.ownerCt.items.remove(this.movingColumn);
					// insert column to drop index.
					this.movingColumn.ownerCt.items.splice(toIndex > fromIndex ? toIndex - 1 : toIndex, 0, this.movingColumn);
				}
			}
			this.cancelColumnMove();
		}
	},
	
	// private
	cancelColumnMove: function() {
		if(this.movingColumn) {
			delete this.columnMoveReady;
			delete this.movingColumn;
			this.columnMoveDragDropEl.remove();
			delete this.columnMoveDragDropEl;
			delete this.ddRegion;
		}
	},
	
	// private
	startColumnResize: function(e) {
		var column = this.handleColumn;
		this.ddRegion = this.el.region();
		var columnOffset = column.el.offset();
		this.startColumnResizeX = columnOffset.left + column.el.outerWidth() - e.pageX;
		this.columnResizeLine.height(this.getBody().outerHeight() + this.columnsHeaderWrap.outerHeight());
		this.columnResizeLine.css('left', columnOffset.left - this.getBody().offset().left + column.el.outerWidth() - 2);
		this.resizingColumn = column;
	},
	
	// private
	stopColumnResize: function(e) {
		if(this.resizingColumn && this.columnResizeLineMoved) {
			var width = Math.max(e.pageX - this.resizingColumn.el.offset().left, this.resizingColumn.boxMinWidth);
			this.resizingColumn.setWidth(width + this.startColumnResizeX);
			this.adjustColumnsWrapSize();
			delete this.lastColumnsHeaderLeft;
			
			// sync scroller bar.
			this.onScroll(e);
		}
		this.cancelColumnResize();
	},
	
	// private
	cancelColumnResize: function() {
		if(this.resizingColumn) {
			this.columnResizeLine.css('left', -1);
			delete this.resizingColumn;
			delete this.startColumnResizeX;
			delete this.ddRegion;
			delete this.columnResizeLineMoved;
			this.columnsHeader.removeClass('teradata-widget-gridpanel-column-header-resize');
			this.el.get(0).style.cursor = '';
		}
	},
	
	/**
	 * @private
	 * 通过鼠标事件获取鼠标位置所在的列
	 * @param e {MouseEvent}
	 * @return {Number}
	 */
	getColumnIndexByMouseEvent: function(e, group) {
		var x = e.pageX;
		var columns = group ? group.items : this.getColumns();
		for(var i = 0; i < columns.length; i++) {
			var column = columns[i];
			var columnLeft = column.el.offset().left;
			var columnRight = columnLeft + column.el.outerWidth();
			if(x > columnLeft && x < columnRight) {
				return i;
			}
		}
	},
	
	/**
	 * 通过指定单元格获得行位置
	 * @param {Element} cell
	 * @return {Number}
	 */
	getRowIndex: function(cell) {
		if(!cell.is('.teradata-widget-gridpanel-cell')) {
			cell = cell.parents('.teradata-widget-gridpanel-cell').first();
		}
		// use position to calculate the index of row, in order to avoid full column scan.
		var cellY = cell.offset().top;
		var columnY = cell.parents('.teradata-widget-gridpanel-column').first().offset().top;
		var index = parseInt(Math.abs(cellY - columnY) / cell.outerHeight(), 10);
		return index;
	},
	
	// private
	bindStore: function() {
		var clear = function(store, record) {
			this.update.call(this, 'clear', store, record);
		};
		
		var remove = function(store, record) {
			this.update.call(this, 'remove', store, record);
		};
		
		var add = function(store, record) {
			this.update.call(this, 'add', store, record);
		};
		
		var load = function(store, record) {
			this.update.call(this, 'load', store, record);
			this.loadingMask(false);
		};
		
		var update = function(store, record) {
			this.update.call(this, 'update', store, record);
		};
		return function(store) {
			if(this.store) {
				this.store.un('clear', clear);
				this.store.un('remove', remove);
				this.store.un('add', add);
				this.store.un('load', load);
				this.store.un('update', update);
				this.store.un('beforeload', this.loadingMask);
			}
			this.store = store;
			this.store.on('clear', clear, this);
			this.store.on('remove', remove, this);
			this.store.on('add', remove, this);
			this.store.on('beforeload', this.loadingMask, this);
			this.store.on('load', load, this);
			this.store.on('update', update, this);
			if(this.pagination) {
				this.paginationBar.bindStore(store);
			}
		};
	}(),
	
	// private
	loadingMask: function(mask, text) {
		if(mask !== false) {
			this.getBody().loadingMask(text || this.loadingText);
			this.paginationBar.disable(true);
		} else {
			this.getBody().unmask();
			this.paginationBar.disable(false);
		}
	},
	
	// private
	update: function(operate, store, record) {
		var columns = this.getColumns();
		if(record instanceof Array) {
			if(operate == 'clear') {
				this.rowMap = {};
				this.selectionModel.clearSelectedRows();
				for(var i = 0; i < columns.length; i++) {
					columns[i].el.html('');
				}
			} else if(operate == 'load') {
				for(var i = 0; i < columns.length; i++) {
					columns[i].renderCells();
				}
			} else {
				for(var i = 0; i < record.length; i++) {
					this.update(operate, store, record[i]);
				}
			}
		} else {
			if(operate == 'add') {
				var row = this.createRow(record);
				for(var i = 0; i < columns.length; i++) {
					columns[i].renderCell(row);
				}
			} else if(operate == 'remove') {
				var row = this.getRowById(record.id);
				delete this.rowMap[record.id];
				this.selectionModel.deselectRow(row, true);
				row.remove(true);
			} else if(operate == 'update') {
				var row = this.getRowById(record.id);
				for(var i = 0; i < columns.length; i++) {
					columns[i].renderCell(row);
				}
			}
		}
	},
	
	/**
	 * 获得表格的行数。
	 * @return {Number}
	 */
	getRowCount: function() {
		return this.store.getCount();
	},
	
	/**
	 * 通过指定的行索引获取行对象
	 * @param {Number} index 行索引
	 * @return {Teradata.widget.grid.Row}
	 */
	getRowByIndex: function(index) {
		if(index < 0 || index >= this.getRowCount()) {
			return null;
		}
		var row =  new Teradata.widget.grid.Row({
			grid: this,
			index: index
		});
		var id = row.getRecordId();
		var mappingRow = this.rowMap[id];
		if(mappingRow) {
			return mappingRow;
		} else {
			this.rowMap[id] = row;
		}
		return row;
	},
	
	/**
	 * 通过指定的行记录编号获得行对象
	 * @param {Mixed} id 行记录编号
	 * @return {Teradata.widget.grid.Row}
	 */
	getRowById: function(id) {
		var row = this.rowMap[id];
		if(row) {
			return row;
		}
		var indexColumn = this.getRecordIndexedColumn();
		var cell = indexColumn.el.children('div[r="' + id + '"]').first();
		if(cell) {
			var index = this.getRowIndex(cell);
			row = this.getRowByIndex(index);
			return row;
		}
	},
	
	/**
	 * 获得表格所有列对象，该结果不包含所有列组，但会包含组中的实际列。
	 * @return {Array}
	 */
	getColumns: function() {
		
		var filterColumn = function(column) {
			if(!(column instanceof Teradata.widget.grid.Column) && Teradata.isArray(column.items)) {
				var columns = [];
				for(var i = 0; i < column.items.length; i++) {
					columns = columns.concat(filterColumn(column.items[i]));
				}
				return columns;
			} else {
				return [column];
			}
		};
		
		/**
		 * @private
		 * @return {Array}
		 */
		var fn = function() {
			return filterColumn(this.columnsRoot);
		};
		return fn;
	}(),
	
	// private
	onBeforeAdd: function(column) {
		var r = Teradata.widget.GridPanel.superclass.onBeforeAdd.call(this, column);
		if(r !== false) {
			return column instanceof Teradata.widget.grid.Column
				|| column instanceof Teradata.widget.grid.ColumnGroup;
		}
		return false;
	},
	
	// private
	add: function(column) {
		if(Teradata.isArray(column)) {
			return Teradata.widget.GridPanel.superclass.add.call(this, column);
		}
		if(!column.xtype && !column.getXType) {
			if(column.items) {
				column.xtype = this.columnGroupType;
			} else {
				column.xtype = this.columnType;
			}
		}
		return Teradata.widget.GridPanel.superclass.add.call(this, column);
	},
	
	// private
	createRow: function(record) {
		var r = this.store.getById(record.id);
		if(!r) {
			// when cannot find record by id, add record to store, and suspended event.
			this.store.add(record, true);
		} else {
			record = r;
		}
		var row = new Teradata.widget.grid.Row({
			grid: this,
			record: record
		});
		return row;
	},
	
	/**
	 * 通过指定的记录编号删除行
	 * @param {Mixed} id 记录编号
	 * @param {Boolean} destroy 是否删除之后销毁行对象
	 */
	removeRowById: function(id, destroy) {
		var row = this.getRowById(id);
		if(row) {
			// remove it and sync cache.
			delete this.rowMap[id];
			row.remove(destroy);
		}
	},
	
	/**
	 * 通过指定的行索引删除行
	 * @param {Number} index 行索引值
	 * @param {Boolean} destroy 是否删除之后销毁行对象
	 */
	removeRowByIndex: function(index, destroy) {
		var row = this.getRowByIndex(index);
		if(row) {
			delete this.rowMap[row.getRecordId()];
			row.remove(destroy);
		}
	},
	
	// private
	getColumnsHeader: function() {
		return this.columnsHeader;
	},
	
	// private
	getLayoutTarget: function() {
		return this.getColumnsBody();
	},
	
	/**
	 * 获得列内容节点
	 * @return {Element}
	 */
	getColumnsBody: function() {
		return this.columnsBody;
	},
	
	/**
	 * 获得Store
	 * @return {Teradata.data.Store}
	 */
	getStore: function() {
		return this.store;
	},
	
	// private
	onResize: function(w) {
		Teradata.widget.GridPanel.superclass.onResize.apply(this, arguments);
		this.adjustColumnsWrapSize();
	},
	
	// private
	doLayout: function() {
		Teradata.widget.GridPanel.superclass.doLayout.apply(this, arguments);
		this.adjustColumnsWrapSize();
	},
	
	/**
	 * @private
	 * 调整列容器宽度，该容器提供列内容浮动与撑开滚动条的宽度。
	 */
	adjustColumnsWrapSize: function() {
		var cw = this.getColumnsWidth();
		var ct = this.getContentTarget();
		
		this.columnsHeader.width(cw + 20);
		this.columnsBody.width(cw);
		
		// fixed ie6 inline-block bug.
		if(Teradata.isIE6) {
			this.columnsRoot.adjustHeaderWidth();
		}
		ct.height(this.el.innerHeight() - this.columnsHeader.outerHeight() - (this.top ? this.top.outerHeight() : 0) - (this.bottom ? this.bottom.outerHeight() : 0) - (this.tbar ? this.tbar.outerHeight() : 0) - (this.fbar ? this.fbar.outerHeight() : 0));
	},
	
	// private
	getColumnsWidth: function() {
		var w = 0;
		var columns = this.getColumns();
		for(var i = 0; i < columns.length; i++) {
			var item = columns[i];
			w += item.rendered ? item.el.outerWidth() : item.width;
		}
		return w;
	},
	
	/**
	 * 获得记录索引列，该列的每个单元格元素中存在属性'r'，该属性值为该行所对应的record对象id。
	 * @return {Teradata.widget.grid.Column}
	 */
	getRecordIndexedColumn: function() {
		var columns = this.getColumns();
		for(var i = 0; i < columns.length; i++) {
			if(columns[i].isIndexed()) {
				return columns[i];
			}
		}
	},
	
	// private
	onDestroy: function() {
		Teradata.widget.GridPanel.superclass.onDestroy.apply(this, arguments);
		this.store.destroy();
		delete this.store;
		delete this.rowMap;
	},
	
	// private
	hasRecordIndexedColumn: function() {
		var columns = this.getColumns();
		for(var i = 0; i < columns.length; i++) {
			if(columns[i].isIndexed()) {
				return true;
			}
		}
		return false;
	}
	
});

Teradata.reg('grid', Teradata.widget.GridPanel);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-03-14
 */

/**
 * @class Teradata.widget.FormPanel
 * @extends Teradata.widget.Panel
 * 表单面板
 * @constructor
 * 创建一个新的表单面板
 * @param {Object} config 配置属性对象
 * @xtype form
 */
Teradata.widget.FormPanel = Teradata.extend(Teradata.widget.Panel, {
	
	layout: 'form',
	
	/**
	 * @cfg {String} action
	 * 表单action属性
	 */
	
	/**
	 * @cfg {String} method
	 * @default 'GET'
	 * 表单提交方式
	 */
	method: 'GET',
	
	/**
	 * @cfg {Boolean} fileUpload
	 * @default false
	 * 是否需要文件上传支持
	 */
	fileUpload: false,
	
	
	// private
	initComponent: function() {
		this.addEvents(
			/**
			 * @event reset
			 * 在表单重置前触发，当该事件监听器返回值为false，则阻断重置操作。
			 * @param {Teradata.widget.FormPanel} this
			 */
			'reset',
			
			/**
			 * @event submit
			 * 在表单提交前触发，当该事件监听器返回值为false，则阻断提交操作。
			 * @param {Teradata.widget.FormPanel} this
			 */
			'submit'
		);
		this.fields = [];
		Teradata.widget.FormPanel.superclass.initComponent.call(this);
	},
	
	// private
	onRender: function() {
		Teradata.widget.FormPanel.superclass.onRender.apply(this, arguments);
		var form = Teradata.get(document.createElement('form'));
		if(this.action) {
			form.attr('action', this.action);
		}
		form.attr('method', this.method);
		if(this.fileUpload) {
			form.attr('enctype', 'multipart/form-data');
		}
		this.getContentTarget().append(form);
		this.form = form;
		
		if(this.buttons && this.buttons.length > 0) {
			for(var i = 0; i < this.buttons.length; i++) {
				var btn = this.buttons[i];
				if(btn.action == 'submit') {
					btn.handler = this.submit.createDelegate(this);
				} else if(btn.action == 'reset') {
					btn.handler = this.reset.createDelegate(this);
				}
			}
		}
	},
	
	// private
	initEvents: function() {
		Teradata.widget.FormPanel.superclass.initEvents.call(this);
		this.bind(this.form, 'reset', this.onReset);
		this.bind(this.form, 'submit', this.onSubmit);
	},
	
	// private
	onReset: function() {
		if(this.fireEvent('reset', this) !== false) {
			var fields = this.getFields();
			for(var i = 0; i < fields.length; i++) {
				var field = fields[i];
				field.setValue(field.originalValue);
			}
		}
		return false;
	},
	
	// private
	onSubmit: function() {
		return this.fireEvent('submit', this) !== false;
	},
	
	/**
	 * @private
	 * 递归查找子容器内的Teradata.widget.Field对象
	 * @param {Teradata.Component} comp
	 * @return {Array}
	 */
	findFields: function(comp) {
		var fields = [];
		if(comp instanceof Teradata.widget.Container && !(comp instanceof Teradata.widget.GridPanel)) {
			for(var i = 0; i < comp.items.length; i++) {
				var field = this.findFields(comp.items[i]);
				fields = fields.concat(field);
			}
		} else if(comp instanceof Teradata.widget.Field) {
			return comp;
		}
		return fields;
	},
	
	// private
	getLayoutTarget: function() {
		return this.form || Teradata.widget.FormPanel.superclass.getContentTarget.call(this);
	},
	
	/**
	 * 获得所有字段组件
	 * @return {Array}
	 */
	getFields: function() {
		return this.findFields(this);
	},
	
	/**
	 * 提交表单
	 */
	submit: function() {
		if(this.rendered && this.validate()) {
			this.form.get(0).submit();
		}
	},
	
	/**
	 * 重置表单
	 */
	reset: function() {
		if(this.rendered) {
			this.form.get(0).reset();
		}
	},
	
	/**
	 * 获得表单中所有值
	 * @return {Object}
	 */
	getValues: function() {
		var fields = this.getFields();
		var values = {};
		for(var i = 0; i < fields.length; i++) {
			var field = fields[i];
			var name = field.getName();
			if(name) {
				values[name] = field.getValue();
			}
		}
		return values;
	},
	
	/**
	 * 校验表单
	 * @return {Boolean}
	 */
	validate: function() {
		var fields = this.getFields();
		var isValid = true;
		for(var i = 0; i < fields.length; i++) {
			var field = fields[i];
			if(!field.validate()) {
				isValid = false;
			}
		}
		return isValid;
	}
});

Teradata.reg('form', Teradata.widget.FormPanel);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.04.19
 */

/**
 * @class Teradata.widget.tree.Loader
 * @extends Teradata.util.Observable
 * 树加载器
 * @constructor
 * 创建一个新的树加载器
 * @param {Object} config 配置属性对象
 */
Teradata.widget.tree.Loader = Teradata.extend(Teradata.util.Observable, {
	
	// private
	constructor: function(config) {
		Teradata.apply(this, config);
		this.addEvents(
			/**
			 * @event beforeload
			 * 在加载节点信息前触发，如果该事件监听器返回值为false，则阻断加载动作执行。
			 * @param {Teradata.widget.tree.Loader} this
			 * @param {Teradata.widget.TreePanel} tree
			 * @param {Teradata.widget.tree.Node} node
			 */
			'beforeload',
			
			/**
			 * @event load
			 * 在加载节点信息后触发。
			 * @param {Teradata.widget.tree.Loader} this
			 * @param {Teradata.widget.TreePanel} tree
			 * @param {Teradata.widget.tree.Node} node
			 * @param {Array} nodes
			 */
			'load'
		);
	},
	
	/**
	 * 加载数据到指定节点
	 * @param {Teradata.widget.tree.Node} node
	 * @param {Array} datas
	 */
	load: function(node, datas) {
		for(var i = 0; i < datas.length; i++) {
			var cn = this.createNode(datas[i]);
			node.appendChild(cn);
			if(cn.json.children) {
				this.load(cn, cn.json.children);
			}
		}
	},
	
	// private
	createNode: function(data) {
		return new Teradata.widget.tree.Node(data);
	}
});/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.04.19
 */

/**
 * @class Teradata.widget.tree.Node
 * @extends Object
 * 树节点
 * @constructor
 * 创建一个新的树节点
 * @param {Object} config 配置属性对象
 */
Teradata.widget.tree.Node = Teradata.extend(Object, {
	
	// private
	constructor: function(config) {
		Teradata.widget.tree.Node.superclass.constructor.call(this, config);
		this.getId();
		if(config) {
			this.text = config.text || '';
			delete config.text;
			this.json = config;
			this.id = config.id;
		}
		this.childNodes = [];
	},
	
	// private
	render: function(parent, position) {
		if(!this.rendered) {
			this.el = Teradata.get(document.createElement('div'));
			this.el.addClass('teradata-widget-treepanel-node');
			this.el.addClass('teradata-widget-treepanel-node-leaf');
			var html = [
		    	'<div class="teradata-widget-treepanel-node-inner">',
			    	'<a class="teradata-widget-treepanel-node-elbow" href="#"></a>',
			    	'<div class="teradata-widget-treepanel-node-icon"></div>',
			    	'<span class="teradata-widget-treepanel-node-text"></span>',
			    	'<div class="teradata-clear"></div>',
		    	'</div>',
		    	'<div class="teradata-widget-treepanel-node-children"></div>'
			].join('');
			this.el.html(html);
			
			var children = this.el.children();
			this.innerEl = Teradata.get(children[0]);
			this.childrenEl = Teradata.get(children[1]);
			
			children = this.innerEl.children();
			this.elbowEl = Teradata.get(children[0]);
			this.iconEl = Teradata.get(children[1]);
			this.textEl = Teradata.get(children[2]);
			
			this.initEvents();
			this.rendered = true;
			this.el.attr('id', this.id);
		} else {
			var el = this.el.get(0);
			el.parentNode.removeChild(el);
		}
		
		var ct = null;
		
		if(parent instanceof Teradata.widget.TreePanel) {
			ct = parent.getContentTarget();
			this.tree = parent;
		} else {
			ct = parent.childrenEl;
			this.parentNode = parent;
		}
		
		if(ct) {
			if(Teradata.isNumber(position)) {
				position = ct.children()[position];
			}
			if(position) {
				this.el.insertBefore(position);
			} else {
				ct.append(this.el);
			}
		}
		
		this.getTree().addNode(this);
		this.setText(this.text);
	},
	
	// private
	initEvents: function() {
		this.elbowEl.on('click', function(e) {
			e.preventDefault();
			if(this.expanded) {
				this.collapse();
			} else {
				this.expand();
			}
		}.createDelegate(this));
	},
	
	// private
	getId: function() {
		if(this.el && !this.id) {
			this.id = this.el.attr('comp-id') || this.el.attr(this.idAttr);
		}
		return this.id ? this.id : (this.id = 'teradata-tree-node-' + Teradata.ComponentMgr.generateId());
	},
	
	/**
	 * 是否为叶节点
	 * @return {Boolean}
	 */
	isLeaf: function() {
		return this.childNodes.length == 0;
	},
	
	/**
	 * 是否为根节点
	 * @return {Boolean}
	 */
	isRoot: function() {
		return this.parentNode == null;
	},
	
	// private
	getTree: function() {
		return this.isRoot() ? this.tree : this.parentNode.getTree();
	},
	
	/**
	 * 隐藏节点
	 */
	hide: function() {
		this.el.hidd();
	},
	
	/**
	 * 追加子节点
	 */
	appendChild: function(node) {
		var lastNode = this.childNodes[this.childNodes.length - 1];
		if(lastNode) {
			lastNode.innerEl.removeClass('teradata-widget-treepanel-node-inner-last');
			lastNode.childrenEl.removeClass('teradata-widget-treepanel-node-children-last');
		}
		if(this.childNodes.length == 0) {
			this.el.removeClass('teradata-widget-treepanel-node-leaf');
			if(!this.expanded) {
				this.el.addClass('teradata-widget-treepanel-node-collapsed');
			}
		}
		this.childNodes.push(node);
		node.render(this);
		node.innerEl.addClass('teradata-widget-treepanel-node-inner-last');
		node.childrenEl.addClass('teradata-widget-treepanel-node-children-last');
	},
	
	/**
	 * 展开节点
	 */
	expand: function() {
		if(!this.isLeaf() || this.isRoot()) {
			this.el.removeClass('teradata-widget-treepanel-node-collapsed');
			this.expanded = true;
			
			var tree = this.getTree();
			tree.fireEvent('expand', tree, this);
		}
	},
	
	/**
	 * 收缩节点
	 */
	collapse: function() {
		if(!this.isLeaf() || this.isRoot()) {
			this.el.addClass('teradata-widget-treepanel-node-collapsed');
			this.expanded = false;
			
			var tree = this.getTree();
			tree.fireEvent('collapse', tree, this);
		}
	},
	
	/**
	 * 设置节点显示文本
	 * @param {String} text
	 */
	setText: function(text) {
		this.text = text;
		if(this.rendered) {
			this.textEl.html(this.text);
			this.textEl.width(this.textEl.width());
			this.innerEl.width(this.elbowEl.outerWidth() + this.iconEl.outerWidth() + this.textEl.outerWidth());
		}
	},
	
	/**
	 * 删除该节点
	 */
	remove: function() {
		this.el.remove();
	}
});/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.04.21
 */

/**
 * @class Teradata.widget.tree.SelectionModel
 * @extends Object
 * 树选择模型
 * @constructor
 * 创建一个新的树选择模型
 * @param {Object} config 配置属性对象
 */
Teradata.widget.tree.SelectionModel = Teradata.extend(Object, {
	
	/**
	 * @cfg {Boolean} singleSelect
	 * 是否为单选
	 */
	singleSelect: true,
	
	// private
	constructor: function(config) {
		Teradata.apply(this, config);
	},
	
	// private
	initEvents: function() {
		this.tree.bind(this.tree.getContentTarget(), 'click', this.onNodeClick, this);
	},
	
	// private
	onNodeClick: function(e) {
		var target = Teradata.get(e.target);
		if(target.is('.teradata-widget-treepanel-node-text') || target.is('.teradata-widget-treepanel-node-icon')) {
			var id = target.parent().parent().attr('id');
			var node = this.tree.getNode(id);
			if(node) {
				if(node.selected) {
					this.deselect(node);
				} else {
					this.select(node);
				}
			}
		}
	},
	
	/**
	 * 选择节点
	 * @param {Teradata.widget.tree.Node} node
	 * @param {Boolean} suspendedEvent 禁止触发事件
	 */
	select: function(node, suspendedEvent) {
		if(node) {
			if(node instanceof Array) {
				for(var i = 0; i < node.length; i++) {
					this.select(node[i], true);
					if(this.singleSelect) {
						break;
					}
				}
			} else {
				if(this.singleSelect) {
					this.clearSelection();
				}
				node.selected = true;
				node.innerEl.addClass('teradata-widget-treepanel-node-inner-selected');
			}
			if(!suspendedEvent) {
				this.tree.fireEvent('select', this.tree, node);
			}
		}
	},
	
	/**
	 * 撤销选择节点
	 * @param {Teradata.widget.tree.Node} node
	 * @param {Boolean} suspendedEvent 禁止触发事件
	 */
	deselect: function(node, suspendedEvent) {
		if(node) {
			if(node instanceof Array) {
				for(var i = 0; i < node.length; i++) {
					this.deselect(node[i], true);
				}
			} else {
				node.selected = false;
				node.innerEl.removeClass('teradata-widget-treepanel-node-inner-selected');
			}
			if(!suspendedEvent) {
				this.tree.fireEvent('deselect', this.tree, node);
			}
		}
	},
	
	/**
	 * 清空选择
	 */
	clearSelection: function() {
		var ns = [];
		for(var key in this.tree.nodes) {
			if(this.tree.nodes[key].selected) {
				ns.push(this.tree.nodes[key]);
			}
		}
		this.deselect(ns);
	}
});/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.04.19
 */

/**
 * @class Teradata.widget.tree.StoreLoader
 * @extends Teradata.widget.tree.Loader
 * 树加载器
 * @constructor
 * 创建一个新的树加载器
 * @param {Object} config 配置属性对象
 */
Teradata.widget.tree.StoreLoader = Teradata.extend(Teradata.widget.tree.Loader, {
	
	/**
	 * @cfg {String} parentField
	 * 父级编号字段名
	 */
	parentField: 'parentId',
	
	/**
	 * @cfg {String} textField
	 * 显示文本字段名
	 */
	textField: 'text',
	
	// private
	load: function(node, store) {
		var records = store.findBy(this.parentField, node.id);
		for(var i = 0; i < records.length; i++) {
			var r = records[i];
			var n = this.createNode(r);
			node.appendChild(n);
			this.load(n, store);
		}
	},
	
	// private
	createNode: function(record) {
		var cfg = {
			id: record.id,
			text: record.get(this.textField),
			record: record
		};
		return Teradata.widget.tree.StoreLoader.superclass.createNode.call(this, cfg);
	}
	
});/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.04.16
 */

/**
 * @class Teradata.widget.TreePanel
 * @extends Teradata.widget.Panel
 * 树面板
 * @constructor
 * 创建一个新的树面板
 * @param {Object} config 配置属性对象
 * @xtype tree
 */
Teradata.widget.TreePanel = Teradata.extend(Teradata.widget.Panel, {
	
	/**
	 * @cfg {Boolean} hiddRoot
	 * 隐藏根节点
	 */
	hiddRoot: true,
	
	// private
	initComponent: function() {
		this.nodes = {};
		this.addEvents(
			/**
			 * @event expand
			 * 当节点展开后触发
			 * @param {Teradata.widget.TreePanel} this
			 * @param {Teradata.widget.tree.Node} node
			 */
			'expand',
			
			/**
			 * @event collapse
			 * 当节点关闭后触发
			 * @param {Teradata.widget.TreePanel} this
			 * @param {Teradata.widget.tree.Node} node
			 */
			'collapse',
			
			/**
			 * @event beforeremove
			 * 删除节点前触发，如果该事件监听器返回值为false，则阻断删除动作执行。
			 * @param {Teradata.widget.TreePanel} this
			 * @param {Teradata.widget.tree.Node} node
			 */
			'beforeremove',
			
			/**
			 * @event remove
			 * 删除节点后触发
			 * @param {Teradata.widget.TreePanel} this
			 * @param {Teradata.widget.tree.Node} node
			 */
			'remove',
			
			/**
			 * @event select
			 * 选择节点后触发
			 * @param {Teradata.widget.TreePanel} this
			 * @param {Teradata.widget.tree.Node/Array} selectedNodes
			 */
			'select',
			
			/**
			 * @event deselect
			 * 选择节点后触发
			 * @param {Teradata.widget.TreePanel} this
			 * @param {Teradata.widget.tree.Node/Array} deselectedNodes
			 */
			'deselect'
		);
		Teradata.widget.TreePanel.superclass.initComponent.call(this);
		if(!this.rootNode) {
			this.rootNode = new Teradata.widget.tree.Node();
			this.hiddRoot = true;
		}
		if(!this.loader && this.store) {
			this.loader = new Teradata.widget.tree.StoreLoader(this.loaderCfg);
		} else if(!this.loader) {
			this.loader = new Teradata.widget.tree.Loader(this.loaderCfg);
		}
		if(!this.selectionModel) {
			this.selectionModel = new Teradata.widget.tree.SelectionModel({
				tree: this
			});
		} else {
			this.selectionModel.tree = this;
		}
	},
	
	// private
	onRender: function() {
		Teradata.widget.TreePanel.superclass.onRender.apply(this, arguments);
		this.el.addClass('teradata-widget-treepanel');
		
		this.rootNode.render(this);
		if(this.hiddRoot) {
			this.rootNode.innerEl.hide();
			this.rootNode.childrenEl.css('padding-left', 0);
			this.rootNode.expand();
		}
	},
	
	// private
	afterRender: function() {
		Teradata.widget.TreePanel.superclass.afterRender.apply(this, arguments);
		if(this.datas) {
			this.loader.load(this.rootNode, this.datas);
		} else if(this.store) {
			this.bindStore(this.store);
			this.store.load();
		}
	},
	
	// private
	bindStore: function() {
		var load = function(store, record) {
			this.loader.load(this.rootNode, store);
		};
		
		var clear = function(store, record) {
			var nodes = this.rootNode.childNodes;
			for(var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				this.removeNode(node);
			}
		};
		
		var add = function(store, record) {
			if(!(record instanceof Array)) {
				record = [record];
			}
			var pn = this.getNode(record.get(this.loader.parentField));
			if(pn) {
				for(var i = 0; i < record.length; i++) {
					var n = this.loader.createNode(record[i]);
					pn.appendChild(n);
				}
			}
		};
		
		var update = function(store, record) {
			var n = this.getNode(record.id);
			if(n) {
				n.setText(record.get(this.loader.textField));
			}
		};
		
		var remove = function(store, record) {
			for(var i = 0; i < record.length; i++) {
				var r = record[i];
				var n = this.getNode(r.id);
				if(n) {
					this.removeNode(n);
				}
			}
		};
		
		return function(store) {
			if(this.store) {
				this.store.un('load', load);
				this.store.un('clear', clear);
				this.store.un('add', add);
				this.store.un('update', update);
				this.store.un('remove', remove);
			}
			this.store = store;
			this.store.on('load', load, this);
			this.store.on('clear', clear, this);
			this.store.on('add', add, this);
			this.store.on('update', update, this);
			this.store.on('remove', remove, this);
		};
	}(),
	
	// private
	initEvents: function() {
		this.selectionModel.initEvents();
	},
	
	// private
	addNode: function(node) {
		this.nodes[node.id] = node;
	},
	
	/**
	 * 通过ID获得树节点
	 * @param {String} id
	 * @return {Teradata.widget.tree.Node}
	 */
	getNode: function(id) {
		return this.nodes[id];
	},
	
	/**
	 * 通过指定ID删除节点
	 * @param {String} id
	 */
	removeNodeById: function(id) {
		var node = this.getNode(id);
		this.removeNode(node);
	},
	
	/**
	 * 删除指定节点对象
	 * @param {Teradata.widget.tree.Node} node
	 */
	removeNode: function(node) {
		if(node && node.getTree() == this) {
			if(node.childNodes) {
				for(var i = 0; i < node.childNodes.length; i++) {
					this.removeNode(node.childNodes[i]);
				}
			}
			delete this.nodes[node.id];
			node.remove();
		}
	}
});

Teradata.reg('tree', Teradata.widget.TreePanel);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.Field
 * @extends Teradata.BoxComponent
 * 字段组件
 */
Teradata.widget.Field = Teradata.extend(Teradata.BoxComponent, {
	
	autoEl: 'input',
	
	/**
	 * @cfg {String} inputType
	 * 表单中字段input的类型
	 */
	inputType: 'hidden',
	
	/**
	 * @cfg {String} validateEvent
	 * 执行校验的事件
	 */
	validationEvent: 'blur',
	
	/**
	 * @cfg {Function} validator
	 * 校验方法，当校验成功返回true，如果校验失败则需要返回提示信息。
	 */
	
	/**
	 * @cfg {Boolean} validation
	 * 是否需要校验
	 */
	validation: true,
	
	width: 120,
	
	height: 32,
	
	/**
	 * @cfg {String} focusCls
	 * 获得焦点时的样式名
	 */
	
	/**
	 * @cfg {Boolean} required
	 * 是否为必输项
	 */
	
	initComponent: function() {
		Teradata.widget.Field.superclass.initComponent.call(this);
		
		this.errorTypes = [];
		
		this.addEvents(
			
			/**
			 * @event change
			 * 在值发生改变后触发
			 * @param {Teradata.widget.Field} this
			 * @param {Mixed} newValue
			 * @param {Mixed} oldValue
			 */
			'change',
			
			/**
			 * @event invalid
			 * 在校验失败后触发
			 * @param {Teradata.widget.Field} this
			 * @param {String} message
			 */
			'invalid',
			
			/**
			 * @event valid
			 * 在校验通过后触发
			 * @param {Teradata.widget.Field} this
			 */
			'valid',
			
			/**
			 * @event focus
			 * 在获得焦点时候触发
			 * @param {Teradata.widget.Field} this
			 */
			'focus',
			
			/**
			 * @event blur
			 * 在丢失焦点时候触发
			 * @param {Teradata.widget.Field} this
			 */
			'blur'
		);
	},
	
	/**
	 * 获得字段的名称，该名称用于提交表单。
	 * @return {String}
	 */
	getName : function() {
        return this.rendered && this.el.attr('name') ? this.el.attr('name') : this.name || this.id || '';
    },
    
    // private
    onRender: function() {
    	if(!this.el && !this.itemWrap) {
    		var itemWrap = document.createElement('div');
    		this.itemWrap = Teradata.get(itemWrap);
    		if(this.autoEl == 'input') {
    			this.autoEl = {
	    			tag: this.autoEl,
	    			attr: {
	    				type: this.inputType,
	    				name: this.name || this.id
	    			}
	    		};
    		}
    	} else if(this.el && !this.itemWrap) {
    		if(this.el.get(0).tagName.toLowerCase() == 'div') {
    			var el = this.el.find('.teradata-widget-field-' + this.inputType + '-input')[0];
    			if(el) {
    				this.itemWrap = this.el;
    				this.el = el;
    			} else {
    				el = Teradata.get(Teradata.createDom({
    					tag: this.autoEl,
    	    			attr: {
    	    				type: this.inputType,
    	    				name: this.name || this.id
    	    			}
    				}));
    				this.el.append(el);
    				this.itemWrap = this.el;
    				this.el = el;
    			}
    		} else {
    			this.el.wrap('<div></div>');
        		this.itemWrap = Teradata.get(this.el.parent());
        		this.allowDomMove = false;
    		}
    	}
    	this.itemWrap.attr('comp-id', this.id);
    	Teradata.widget.Field.superclass.onRender.apply(this, arguments);
    	
    	this.itemWrap.addClass('teradata-widget-field');
    	
    	if(this.submitValue === false){
            this.el.removeAttr('name');
        }
    	
    	var type = this.el.attr('type') || this.inputType;
    	if(type){
            if(type == 'password'){
                type = 'text';
            }
            this.el.removeClass('teradata-widget-field-' + type);
            this.itemWrap.addClass('teradata-widget-field-' + type);
            this.el.addClass('teradata-widget-field-' + type + '-input');
        }
        if(this.readOnly){
            this.setReadOnly(true);
        }
        if(this.tabIndex !== undefined){
            this.el.setAttr('tabIndex', this.tabIndex);
        }

        this.itemWrap.addClass([this.fieldClass, this.cls].join(' '));
    },
    
    // private
    afterRender : function(){
        Teradata.widget.Field.superclass.afterRender.call(this);
        this.initEvents();
        this.initValue();
    },
    
    // private
    initEvents: function() {
    	this.bind(this.el, 'focus', this.onFocus);
    	this.bind(this.el, 'blur', this.onBlur);
    },
    
    // private
    initValue: function() {
    	if(this.value !== undefined){
            this.setValue(this.value);
        }else if(!Teradata.isEmpty(this.el.val()) && this.el.val() != this.emptyText){
            this.setValue(this.el.val());
        }
        this.originalValue = this.getValue();
    },
    
    // private
    onFocus: function(e) {
    	if(this.focusCls){
    		this.itemWrap.addClass(this.focusCls);
        }
    	if(!this.hasFocus){
    		this.hasFocus = true;
    		this.startValue = this.getValue();
    		this.fireEvent('focus', this);
        }
    },
    
    // private
    onBlur: function(e) {
    	if(this.focusCls){
    		this.itemWrap.removeClass(this.focusCls);
        }
    	
    	this.hasFocus = false;
    	
        if(this.validationEvent !== false && this.validationEvent == 'blur'){
        	this.validate();
        }
        
        var v = this.getValue();
        if(String(v) !== String(this.startValue)){
        	this.fireEvent('change', this, v, this.startValue);
        }
        this.fireEvent('blur', this);
    },
    
    /**
     * 设置只读
     * @param readOnly
     */
    setReadOnly: function(readOnly) {
    	if(this.rendered){
            this.el.get(0).readOnly = readOnly;
        }
    	if(this.readOnlyCls && readOnly) {
    		this.itemWrap.addClass(this.readOnlyCls);
    	} else if(this.readOnlyCls){
    		this.itemWrap.removeClass(this.readOnlyCls);
    	}
        this.readOnly = readOnly;
    },
    
    /**
     * 校验该字段并显示提示信息
     * @return {Boolean}
     */
    validate: function() {
    	if(this.validation) {
    		var errors = this.getErrors(this.getValue());
        	if(errors && errors.length > 0) {
    			this.getMessageBox().setMessage(errors[0], true);
        		this.fireEvent('invalid', this, errors);
        		if(this.errorCls) {
        			this.itemWrap.addClass(this.errorCls);
        		}
        		return false;
        	} else {
        		this.getMessageBox().clear();
        		if(this.errorCls) {
        			this.itemWrap.removeClass(this.errorCls);
        		}
        		this.fireEvent('valid', this);
        	}
    	}
    	return true;
    },
    
    /**
     * 判定该字段值是否合法
     * @return {Boolean}
     */
    isValid: function() {
    	return !this.validation || this.getErrors().length > 0;
    },
    
    /**
     * 获得字段所有错误信息
     * @param {Mixed} value
     * @return {Array}
     */
    getErrors: function(value) {
    	return [];
    },
    
    /**
     * @private
     * 获得字段的消息提示容器
     * @return {Teradata.widget.Field.MessageBox}
     */
    getMessageBox: function() {
    	if(!this.messageBox) {
    		this.messageBox = new Teradata.widget.Field.MessageBox(this);
    	}
    	if(this.rendered && !this.messageBox.rendered) {
			this.messageBox.render(this);
		}
    	return this.messageBox;
    },
    
    /**
     * 获取在input的值
     * @return {String}
     */
    getRawValue: function() {
    	var v = this.rendered ? this.el.val() : Teradata.val(this.value, '');
        if(v === this.emptyText){
            v = '';
        }
        return v;
    },
    
    /**
     * 设定input的值
     * @param {String} v
     */
    setRawValue : function(v){
        return this.rendered ? (this.el.val(Teradata.isEmpty(v) ? '' : Teradata.val(v))) : '';
    },
    
    /**
     * 获取值
     * @return {Mixed}
     */
    getValue: function() {
    	if(!this.rendered) {
            return this.value;
        }
        var v = this.el.val();
        if(v === this.emptyText || v === undefined){
            v = '';
        }
        return v;
    },
    
    /**
     * 设置值
     * @returns {Mixed}
     */
    setValue: function(v) {
    	this.value = v;
        if(this.rendered){
            this.el.val(Teradata.isEmpty(v) ? '' : v);
            this.validate();
        }
        return this;
    },
    
    // private
    getResizeEl: function() {
    	return this.itemWrap;
    },
	
    // private
	getPositionEl: function() {
		return this.itemWrap;
	},
	
	onResize: function(w, h) {
		if(this.autoWidth) {
			if(Teradata.isIE6) {
				w = this.el.outerWidth();
	    		this.itemWrap.width(w + (this.ml ? this.ml.outerWidth() : 0) + (this.mr ? this.mr.outerWidth() : 0));
			}
    	} else {
    		Teradata.widget.Button.superclass.onResize.apply(this, arguments);
    		var type = this.el.attr('type');
    		if(type) {
    			type = type.toLowerCase();
    		}
    		if(this.isHeightResizable()) {
    			this.el.height(h - (this.top ? this.top.outerHeight() : 0) - (this.bottom ? this.bottom.outerHeight() : 0));
    			if(type != 'checkbox' && type != 'radio') {
    				this.el.width(this.getContentTarget().innerWidth());
    			}
    		} else {
    			if(type != 'checkbox' && type != 'radio') {
    				this.el.width(w - (this.ml ? this.ml.outerWidth() : 0) - (this.mr ? this.mr.outerWidth() : 0));
    			}
    		}
    	}
	}
});

Teradata.widget.Field.MessageBox = function(field) {
	this.init(field);
};

Teradata.widget.Field.MessageBox.prototype = {
	
	// private
	init: Teradata.emptyFn,
	
	/**
	 * @cfg {String} iconCls
	 * 图标样式，该样式将设置到el节点上
	 */
	
	// private
	render: function(field) {
		if(field.rendered) {
			var el = document.createElement('div');
			var inner = document.createElement('div');
			var messageEl = document.createElement('span');
			
			el.appendChild(inner);
			inner.appendChild(messageEl);
			
			this.el = Teradata.get(el);
			this.inner = Teradata.get(inner);
			this.messageEl = Teradata.get(messageEl);
			
			this.el.addClass('teradata-widget-field-messagebox');
			if(this.iconCls) {
				this.el.addClass(iconCls);
			}
			this.inner.addClass('teradata-widget-field-messagebox-inner');
			this.messageEl.addClass('teradata-widget-field-messagebox-message');
			
			field.itemWrap.append(this.el);
			this.hide();
			this.rendered = true;
		}
	},
	
	/**
	 * 显示
	 */
	show: function() {
		this.el.show();
	},
	
	/**
	 * 隐藏
	 */
	hide: function() {
		this.el.hide();
	},
	
	/**
	 * 设置消息
	 * @param {Array} message
	 * @param {Boolean} hide
	 */
	setMessage: function(message, autoShow) {
		if(message) {
			this.messageEl.html(message);
			if(autoShow !== false) {
				this.show();
			}
		} else {
			this.hide();
		}
	},
	
	/**
	 * 清除消息
	 */
	clear: function() {
		this.messageEl.html('');
		this.hide();
	}
};/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.TextField
 * @extends Teradata.widget.Field
 * 文本框
 */
Teradata.widget.TextField = Teradata.extend(Teradata.widget.Field, {
	
	/**
	 * @cfg {RegExp} regex
	 * 用于校验文本框值的正则表达式
	 */
	
	/**
	 * @cfg {Number} minLength
	 * 最小长度
	 */
	
	/**
	 * @cfg {Number} maxLength
	 * 最大长度
	 */
	
	/**
	 * @cfg {Number} inputMaxLength
	 * 文本框可输入最大长度
	 */
	
	boxMinHeight: 25,
	
	boxMaxHeight: 25,
	
	corners: 'lr',
	
	focusCls: 'teradata-widget-field-text-focus',
	
	errorCls: 'teradata-widget-field-text-error',
	
	disabledCls: 'teradata-widget-field-text-disabled',
	
	/**
	 * @cfg {Array} allowedCharacters
	 * 合法的字符
	 */
	
	/**
	 * @cfg {Boolean} disableInputMethod
	 * 禁用输入法，该属性Opera/Chrome/Safari浏览器不支持。
	 */
	
	// private
	initComponent: function() {
		this.addEvents(
			/**
			 * @event keydown
			 * 当按下键盘时触发
			 * @param {Teradata.widget.TextField} this
			 * @param {Event} e
			 */
			'keydown',
			
			/**
			 * @event keyup
			 * 按键抬起时触发
			 * @param {Teradata.widget.TextField} this
			 * @param {Event} e
			 */
			'keyup',
			
			/**
			 * @event keypress
			 * 整个按键操作完毕后触发
			 * @param {Teradata.widget.TextField} this
			 * @param {Event} e
			 */
			'keypress'
		);
		this.inputType = 'text';
		Teradata.widget.TextField.superclass.initComponent.call(this);
	},
	
	// private
	onRender: function() {
		Teradata.widget.TextField.superclass.onRender.apply(this, arguments);
		if(Teradata.isNumber(this.inputMaxLength)) {
			this.el.attr('maxlength', this.inputMaxLength);
		}
		if(this.disableInputMethod) {
			this.el.css('ime-mode', 'disabled');
		}
	},
	
	// private
	initEvents: function() {
		Teradata.widget.TextField.superclass.initEvents.apply(this, arguments);
		this.bind(this.el, 'keydown', this.onKeyDown);
		this.bind(this.el, 'keyup', this.onKeyUp);
		this.bind(this.el, 'keypress', this.onKeyPress);
	},
	
	// private
	onKeyDown: function(e) {
		if(this.fireEvent('keydown', this, e) === false) {
			e.preventDefault();
			e.stopPropagation();
		}
	},
	
	// private
	onKeyUp: function(e) {
		if(this.fireEvent('keyup', this, e) === false) {
			e.preventDefault();
			e.stopPropagation();
		}
	},
	
	// private
	onKeyPress: function(e) {
		if(this.fireEvent('keypress', this, e) !== false) {
			var charCode = e.charCode;
			var keyCode = e.keyCode;
			if(Teradata.isGecko && keyCode == 8 && keyCode == 46) {
				return;
			}
			if(this.allowedCharacters) {
				var c = String.fromCharCode(charCode);
				if(!this.isAllowedCharacters(c)) {
					e.preventDefault();
					e.stopPropagation();
				}
			}
		} else {
			e.preventDefault();
			e.stopPropagation();
		}
	},
	
	// private
	isAllowedCharacters: function(c) {
		return this.allowedCharacters.indexOf(c) != -1;
	},
	
	// private
	getErrors: function(value) {
		var errors = Teradata.widget.TextField.superclass.getErrors.apply(this, arguments);
        
        value = Teradata.isDefined(value) ? value : this.getRawValue();        
        
        if (Teradata.isFunction(this.validator)) {
            var msg = this.validator(value);
            if (msg !== true) {
                errors.push(msg);
            }
        }
        
        if (value.length < 1 || value === this.emptyText) {
            if (!this.required) {
                return errors;
            } else {
                errors.push(this.requiredText);
            }
        }
        
        if (this.required && (value.length < 1 || value === this.emptyText)) { // if it's blank
            errors.push(this.requiredText);
        }
        
        if (value.length < this.minLength) {
            errors.push(String.format(this.minLengthText, this.minLength));
        }
        
        if (value.length > this.maxLength) {
            errors.push(String.format(this.maxLengthText, this.maxLength));
        }
        
        if (this.regex && !this.regex.test(value)) {
            errors.push(this.regexText);
        }
        
        return errors;
	}
});

Teradata.reg('text', Teradata.widget.TextField);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.TriggerField
 * @extends Teradata.widget.TextField
 * 触发器组件
 */
Teradata.widget.TriggerField = Teradata.extend(Teradata.widget.TextField, {
	
	triggerButtonClickCls: 'teradata-widget-field-trigger-button-click',
	
	triggerButtonHoverCls: 'teradata-widget-field-trigger-button-hover',
	
	corners: 'l',
	
	// private
	initComponent: function() {
		this.addEvents(
			'triggerclick'
		);
		Teradata.widget.TriggerField.superclass.initComponent.call(this);
	},
	
	// private
	onRender: function() {
		Teradata.widget.TriggerField.superclass.onRender.apply(this, arguments);
		this.itemWrap.addClass('teradata-widget-field-trigger');
		this.triggerButton = this.itemWrap.find('.teradata-widget-field-trigger-button')[0];
		if(this.triggerButton) {
			this.triggerButton = Teradata.get(this.triggerButton);
		} else {
			this.triggerButton = Teradata.get(document.createElement('div'));
			this.triggerButton.addClass('teradata-widget-field-trigger-button');
			this.triggerButton.insertAfter(this.mc || this.el);
		}
	},
	
	// private
	onResize: function() {
		Teradata.widget.TriggerField.superclass.onResize.apply(this, arguments);
		var w = this.el.outerWidth() - this.triggerButton.width();
		this.el.width(w);
		this.getContentTarget().width(w);
	},
	
	// private
	renderCorners: function() {
		Teradata.widget.TriggerField.superclass.renderCorners.call(this, true, false);
	},
	
	// private
	initEvents: function() {
		Teradata.widget.TriggerField.superclass.initEvents.call(this);
		this.bind(this.triggerButton, 'mouseover', this.onTriggerOver);
		this.bind(this.triggerButton, 'mouseout', this.onTriggerOut);
		this.bind(this.triggerButton, 'mousedown', this.onTriggerMouseDown);
		this.bind(this.triggerButton, 'mouseup', this.onTriggerMouseUp);
		this.bind(this.triggerButton, 'click', this._onTriggerClick);
		this.bind(this.triggerButton, 'focus', this.onTriggerFocus);
		this.bind(this.triggerButton, 'blur', this.onTriggerBlur);
	},
	
	onTriggerOver: function(e) {
		this.triggerButton.addClass(this.triggerButtonHoverCls);
	},
	
	onTriggerOut: function(e) {
		this.triggerFocus = false;
		this.triggerButton.removeClass(this.triggerButtonHoverCls);
	},
	
	onTriggerMouseDown: function(e) {
		this.el.focus();
		this.triggerFocus = true;
		this.triggerButton.addClass(this.triggerButtonClickCls);
	},
	
	onTriggerMouseUp: function(e) {
		this.el.focus();
		this.triggerButton.removeClass(this.triggerButtonClickCls);
		this.triggerFocus = false;
	},
	
	_onTriggerClick: function(e) {
		this.onTriggerClick(e);
		this.fireEvent('triggerclick', this);
	},
	
	onTriggerFocus: function(e) {
		this.triggerFocus = true;
	},
	
	onTriggerBlur: function(e) {
		this.triggerFocus = false;
	},
	
	onBlur: function(e) {
		if(!this.triggerFocus) {
			Teradata.widget.TriggerField.superclass.onBlur.call(this, e);
		}
	},
	
	onTriggerClick: Teradata.emptyFn
});

Teradata.reg('trigger', Teradata.widget.TriggerField);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.Combo
 * @extends Teradata.widget.TriggerField
 * 下拉列表组件
 */
Teradata.widget.Combo = Teradata.extend(Teradata.widget.TriggerField, {
	
	/**
	 * @cfg {String} labelField
	 * 显示标签字段名
	 */
	labelField: 'text',
	
	/**
	 * @cfg {String} valueField
	 * 值字段名
	 */
	valueField: 'value',
	
	/**
	 * @cfg {Number} maxListHeight
	 * 列表最大高度，当实际高度大于该参数值，则列表高度为该参数值，并出现滚动条。
	 */
	maxListHeight: 200,
	
	// private
	initComponent: function() {
		Teradata.widget.Combo.superclass.initComponent.call(this);
		this.addEvents(
			/**
			 * @event select
			 * 当选择下拉列表中的值后触发
			 * @param {Teradata.widget.Combo} this
			 * @param {HTMLElement} selected
			 */
			'select'
		);
		this.readOnly = true;
	},

	// private
	onRender: function() {
		Teradata.widget.Combo.superclass.onRender.apply(this, arguments);
		if(this.el && this.el.get(0).tagName.toLowerCase() == 'select') {
			var options = this.el.find('option');
			this.datas = [];
			for(var i = 0; i < options.length; i++) {
				var option = Teradata.get(options.get(i));
				var value = option.attr('value');
				var text = option.html();
				if(value || text) {
					value = value || text;
					text = text || value;
					this.datas.push([value, text]);
				}
			}
			var select = this.el;
			this.el = Teradata.get(document.createElement('input'));
			this.el.attr('type', 'text');
			this.el.insertBefore(select);
			this.el.get(0).className = select.get(0).className;
			select.remove();
			this.el.attr('id', this.id);
		}
		this.itemWrap.addClass('teradata-widget-field-combo');
		this.hiddenField = Teradata.get(document.createElement('input'));
		this.hiddenField.attr('type', 'hidden');
		if(this.submitValue !== false) {
			this.hiddenField.attr('name', this.getName());
		}
		this.el.removeAttr('name');
	},
	
	// private
	renderList: function() {
		var list = document.createElement('div');
		var listWrap = document.createElement('div');
		
		this.listWrap = Teradata.get(listWrap);
		this.listWrap.addClass('teradata-widget-field-combo-list-wrap');
		
		this.list = Teradata.get(list);
		this.list.addClass('teradata-widget-field-combo-list');
		
		this.shadow = new Teradata.Shadow();
		
		this.itemWrap.append(this.listWrap);
		this.listWrap.append(this.list);
		
		this.shadow.applyTo(this.list);
		
		this.list.width(this.width);
		// 调整list宽度考虑组件边框与list边框差值
		this.list.width(this.list.width() - (this.list.outerWidth() - this.getPositionEl().outerWidth()));
		
		this.dataList = Teradata.get(document.createElement('ul'));
		
		this.dataList.addClass('teradata-widget-field-combo-list-data');
		
		this.list.append(this.dataList);
		this.hideList();
	},
	
	// private
	update: function(operate, store, records) {
		if(records instanceof Array) {
			for(var i = 0; i < records.length; i++) {
				this.update(operate, store, records[i]);
			}
		} else {
			if(operate == 'remove') {
				this.dataList.children('li[val="' + records.id + '"]')
					.remove();
				this.updateListHeight();
			} else if(operate == 'add' || operate == 'load') {
				var li = Teradata.get(document.createElement('li'));
				li.attr('val', records.get(this.valueField));
				li.html(records.get(this.labelField));
				this.dataList.append(li);
				this.updateListHeight();
			} else if(operate == 'update') {
				this.dataList.find('li[val="' + records.id + '"]')
					.html(records.get(this.labelField))
					.attr('val', records.get(this.valueField));
			}
		}
	},
	
	// private
	initEvents: function() {
		Teradata.widget.Combo.superclass.initEvents.call(this);
		this.bind(this.list, 'mouseover', this.onListMouseOver);
		this.bind(this.list, 'mouseout', this.onListMouseOut);
		this.bind(this.list, 'click', this.onListClick);
	},
	
	// private
	updateListHeight: function() {
		var h = this.dataList.innerHeight();
		if(h > this.maxListHeight) {
			this.dataList.height(this.maxListHeight);
			this.dataList.addClass('teradata-scroll-y');
		} else if(h < this.maxListHeight){
			this.dataList.css('height', '');
		}
	},
	
	// private
	bindStore: function() {
		var clear = function(store, record) {
			this.update.call(this, 'remove', store, record);
		};
		
		var remove = function(store, record) {
			this.update.call(this, 'remove', store, record);
		};
		
		var add = function(store, record) {
			this.update.call(this, 'add', store, record);
		};
		
		var load = function(store, record) {
			this.update.call(this, 'load', store, record);
		};
		
		var update = function(store, record) {
			this.update.call(this, 'update', store, record);
		};
		
		return function(store) {
			if(this.store) {
				this.store.un('remove', remove);
				this.store.un('add', add);
				this.store.un('update', update);
				this.store.un('load', load);
				this.store.un('clear', clear);
			}
			this.store = store;
			this.store.on('clear', clear, this);
			this.store.on('remove', remove, this);
			this.store.on('add', add, this);
			this.store.on('load', load, this);
			this.store.on('update', update, this);
		};
	}(),
	
	// private
	afterRender: function() {
		this.renderList();
		Teradata.widget.Combo.superclass.afterRender.apply(this, arguments);
		if(!this.store && Teradata.isArray(this.datas)) {
			var store = new Teradata.data.Store({
				fields: ['value', 'text']
			});
			this.bindStore(store);
		} else if(this.store) {
			this.bindStore(this.store);
		}
		if(this.datas) {
			this.store.loadData(this.datas);
		} else if(this.store && this.store.url) {
			this.store.load();
		}
	},
	
	// private
	onTriggerClick: function(e) {
		this.showList();
	},
	
	// private
	onListClick: function(e) {
		this.el.focus();
		var target = Teradata.get(e.target);
		if(target.is('li')) {
			var value = target.attr('val');
			this.setValue(value);
			this.fireEvent('select', this, target.get(0));
		}
		this.hideList();
	},
	
	// private
	onListMouseOver: function(e) {
		var target = Teradata.get(e.target);
		if(e.target == this.list.get(0) || target.parents('.teradata-widget-field-combo-list').get(0) == this.list.get(0)) {
			this.mouseInList = true;
		}
		if(target.is('li')) {
			target.addClass('teradata-over');
		}
	},
	
	// private
	onListMouseOut: function(e) {
		var target = Teradata.get(e.relatedTarget);
		if(target.get(0) != this.list.get(0) && target.parents('.teradata-widget-field-combo-list').get(0) != this.list.get(0)) {
			this.el.focus();
			this.mouseInList = false;
		}
		target = $(e.target);
		if(target.is('li')) {
			target.removeClass('teradata-over');
		}
	},
	
	// private
	showList: function() {
		if(this.rendered) {
			this.dataList.find('li[val="' + this.getValue() + '"]').addClass('teradata-selected');
			this.listWrap.show();
			this.updateListHeight();
			this.shadow.applyTo(this.list);
		}
	},
	
	// private
	onBlur: function(e) {
		if(!this.mouseInList) {
			Teradata.widget.Combo.superclass.onBlur.call(this, e);
			this.hideList();
		}
	},
	
	// private
	hideList: function() {
		if(this.rendered) {
			this.dataList.find('.teradata-selected').removeClass('teradata-selected');
			this.listWrap.hide();
		}
	},
	
	/**
	 * 设置值
	 * @param {String} v
	 */
	setValue: function(v) {
		if(this.rendered && this.store) {
			if(v === '' || v === null || v === undefined){
				this.value = '';
				this.hiddenField.val('');
				return Teradata.widget.Combo.superclass.setValue.call(this, '');
			} else {
				var record = this.store.getBy(this.valueField, v);
				if(record) {
					var text = record.get(this.labelField);
					v = record.get(this.valueField);
					this.hiddenField.val(v);
					this.value = v;
					return Teradata.widget.Combo.superclass.setValue.call(this, text);
				}
			}
		} else {
			this.value = v;
			return Teradata.widget.Combo.superclass.setValue.call(this, v);
		}
		return this;
	},
	
	/**
	 * 获取值
	 * @return {Mixed}
	 */
	getValue: function() {
		if(!this.rendered) {
            return this.value;
        }
        var v = this.el.val();
        if(v === this.emptyText || v === undefined){
            v = '';
        } else {
        	v = this.hiddenField.val();
        }
        return v;
	},
	
	// inherit docs
    getName: function(){
        var hf = this.hiddenField;
        return hf && hf.name ? hf.name : this.hiddenName || Teradata.widget.Combo.superclass.getName.call(this);
    },
    
    /**
     * 获得数据存储对象
     * @return {Teradata.data.Store}
     */
    getStore: function() {
    	return this.store;
    },
    
    // private
    onResize: function(w) {
    	Teradata.widget.Combo.superclass.onResize.apply(this, arguments);
    	if(this.list) {
    		this.list.width(w);
    		// 调整list宽度考虑组件边框与list边框差值
    		this.list.width(this.list.width() - (this.list.outerWidth() - this.getPositionEl().outerWidth()));
        	this.shadow.applyTo(this.list);
    	}
    }
});

Teradata.reg('combo', Teradata.widget.Combo);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-03-09
 */

/**
 * @class Teradata.widget.Textarea
 * @extends Teradata.widget.TextField
 * 文本域
 */
Teradata.widget.Textarea = Teradata.extend(Teradata.widget.TextField, {
	
	height: 80,
	
	boxMixHeight: undefined,
	
	boxMaxHeight: undefined,
	
	corners: 'all',
	
	focusCls: 'teradata-widget-field-textarea-focus',
	
	disabledCls: 'teradata-widget-field-textarea-disabled',
	
	errorCls: 'teradata-widget-field-textarea-error',
	
	// private
	initComponent: function() {
		Teradata.widget.Textarea.superclass.initComponent.call(this);
	},
	
	// private
	onRender: function() {
		this.autoEl = {
			tag: 'textarea',
			attr: {
				cols: '0',
				rows: '0'
			}
		};
		Teradata.widget.Textarea.superclass.onRender.apply(this, arguments);
		this.itemWrap.addClass('teradata-widget-field-textarea');
	}
	
});

Teradata.reg('textarea', Teradata.widget.Textarea);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.EmailField
 * @extends Teradata.widget.TextField
 * Email输入组件
 */
Teradata.widget.EmailField = Teradata.extend(Teradata.widget.TextField, {
	
	// private
	initComponent: function() {
		Teradata.widget.EmailField.superclass.initComponent.call(this);
		this.regex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
	}
});

Teradata.reg('email', Teradata.widget.EmailField);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.04.13
 */

/**
 * @class Teradata.widget.NumberField
 * @extends Teradata.widget.TextField
 * 数字输入组件
 */
Teradata.widget.NumberField = Teradata.extend(Teradata.widget.TextField, {
	
	/**
	 * @cfg {Boolean} isMoney
	 * 是否为货币
	 */
	
	/**
	 * @cfg {Number} precision
	 * 小数精度
	 */
	
	/**
	 * @cfg {Number} maxValue
	 * 最大值
	 */
	
	/**
	 * @cfg {Number} minValue
	 * 最小值
	 */
	
	// private
	initComponent: function() {
		Teradata.widget.NumberField.superclass.initComponent.call(this);
		this.disableInputMethod = true;
		this.allowedCharacters = ['+', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'];
		this.regex = /^[\+\-]?\d*\.?\d+$/;
		if(this.isMoney) {
			this.precision = 2;
		}
	},
	
	// private
	onRender: function() {
		Teradata.widget.NumberField.superclass.onRender.apply(this, arguments);
		this.itemWrap.addClass('teradata-widget-field-number');
	},
	
	// private
	isAllowedCharacters: function(c) {
		if(!Teradata.widget.NumberField.superclass.isAllowedCharacters.call(this, c)) {
			return false;
		}
		
		var v = this.getValue();
		var dp = v.indexOf('.');
		var cp = this.el.cursorPosition();
		
		if(cp !== 0 && (c == '+' || c == '-')) {
			// If the cursor position is not 0, '+' and '-' is not allowed input.
			return false;
		}
		
		if(c == '.' && (dp != -1 || this.precision === 0)) {
			// If the value contains a decimal point or precision is zero, '.' is not allowed input.
			return false;
		}
		
		if(dp != -1 && this.precision) {
			if(cp > dp && v.length - dp > this.precision) {
				// If the value contains a decimal point and the cursor position after decimal point.
				// Check the value decimal places is equal to the position.
				// If true, not allowed input anything.
				return false;
			}
		}
		return true;
	},
	
	getErrors: function(value) {
		var errors = Teradata.widget.NumberField.superclass.getErrors.call(this, value);
		
		var numberValue = parseFloat(value, 10);
		
		if (numberValue < this.minValue) {
            errors.push(String.format(this.minValueText, this.minValue));
        }
        
        if (numberValue > this.maxValue) {
            errors.push(String.format(this.maxValueText, this.maxValue));
        }
        
        var dp = value.indexOf('.');
        if(this.precision == 0 && dp != -1) {
        	errors.push(this.integerText);
        }
        if(value && this.precision && dp != -1 && value.length - dp - 1 > this.precision) {
        	errors.push(String.format(this.precisionText, this.precision));
        }
        return errors;
	}
});

Teradata.reg('number', Teradata.widget.NumberField);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.03.12
 */

/**
 * @class Teradata.widget.Checkbox
 * @extends Teradata.widget.Field
 * 多选按钮组件
 */
Teradata.widget.Checkbox = Teradata.extend(Teradata.widget.Field, {
	
	width: 60,
	
	boxMinHeight: 25,
	
	boxMaxHeight: 25,
	
	corners: 'none',
	
	validation: false,
	
	inputType: 'checkbox',
	
	focusCls: 'teradata-widget-field-checkbox-focus',
	
	/**
	 * @cfg {String} label
	 * 选项的显示名
	 */
	
	//private
	initComponent: function() {
		this.addEvents(
			/**
			 * @event checkchange
			 * 在选择选项后触发
			 * @param {Teradata.widget.Checkbox} this
			 * @param {Boolean} checked
			 */
			'checkchange'
		);
		Teradata.widget.Checkbox.superclass.initComponent.call(this);
	},
	
	// private
	onRender: function() {
		if(this.el) {
			this.checked = this.el.get(0).checked;
		}
		Teradata.widget.Checkbox.superclass.onRender.apply(this, arguments);
		
		this.itemWrap.addClass('teradata-widget-field-checkbox');
		
		this.labelEl = this.itemWrap.find('.teradata-widget-field-checkbox-label')[0];
		this.text = this.itemWrap.find('.teradata-widget-field-checkbox-text')[0];
		
		if(this.labelEl) {
			this.labelEl = Teradata.get(this.labelEl);
		} else {
			this.el.wrap('<label></label>');
			this.labelEl = this.el.parent();
			this.labelEl.addClass('teradata-widget-field-checkbox-label');
		}
		
		if(this.text) {
			this.text = Teradata.get(this.text);
			this.label = this.text.html();
		} else {
			this.text = Teradata.get(document.createElement('span'));
			this.text.addClass('teradata-widget-field-checkbox-text');
			this.text.html(this.label);
			this.labelEl.append(this.text);
		}
		this.checked = !!this.checked;
		this.setChecked(this.checked);
	},
	
	// private
	initEvents: function() {
		Teradata.widget.Checkbox.superclass.initEvents.call(this);
		this.bind(this.labelEl, 'click', function(e) {
			if(!this.readOnly) {
				this.fireEvent('checkchange', this, this.isChecked());
			} else {
				return false;
			}
		});
	},
	
	/**
	 * 设置选中状态
	 * @param {Boolean} checked 是否选中
	 * @param {Boolean} suspendedEvent 禁止触发事件
	 */
	setChecked: function(checked, suspendedEvent) {
		if(this.isChecked() != checked) {
			this.checked = checked;
			if(this.rendered) {
				if(checked) {
					this.el.attr('checked', 'checked');
				} else {
					this.el.removeAttr('checked');
				}
			}
			if(!suspendedEvent) {
				this.fireEvent('checkchange', this, this.isChecked());
			}
		}
	},
	
	/**
	 * 设置只读
	 * @param {Boolean} readOnly
	 */
	setReadOnly: function(readOnly) {
		Teradata.widget.Checkbox.superclass.setReadOnly.call(this, readOnly);
		if(!this.disabled) {
			if(readOnly) {
				this.el.removeAttr('name');
				this.el.attr('disabled', true);
				if(this.submitValue) {
					this.hiddenField = Teradata.get(Teradata.createDom({
						tag: 'input',
						attr: {
							type: 'hidden',
							name: this.getName()
						}
					}));
					this.hiddenField.insertBefore(this.el);
				}
			} else {
				if(this.hiddenField) {
					this.hiddenField.remove();
					delete this.hiddenField;
				}
				if(this.submitValue) {
					this.el.attr('name', this.getName());
				}
			}
		} else {
			if(this.hiddenField) {
				this.hiddenField.remove();
				delete this.hiddenField();
			}
		}
	},
	
	/**
	 * 设置禁用
	 * @param {Boolean} disable
	 */
	disable: function(disable) {
		Teradata.widget.Checkbox.superclass.disable.call(this, disable);
		if(!disable) {
			this.setReadOnly(this.readOnly);
		}
	},
	
	/**
	 * 获得选中状态
	 * @return {Boolean}
	 */
	isChecked: function() {
		return this.rendered ? this.el.get(0).checked : this.checked;
	},
	
	/**
	 * 设置显示标签
	 * @param {String} label
	 */
	setLabel: function(label) {
		this.label = label;
		this.text.html(label);
	}
	
});

Teradata.reg('checkbox', Teradata.widget.Checkbox);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.03.12
 */

/**
 * @class Teradata.widget.Radio
 * @extends Teradata.widget.Field
 * 单选按钮组件
 */
Teradata.widget.Radio = Teradata.extend(Teradata.widget.Field, {
	
	width: 60,
	
	boxMinHeight: 25,
	
	boxMaxHeight: 25,
	
	corners: 'none',
	
	validation: false,
	
	inputType: 'radio',
	
	focusCls: 'teradata-widget-field-radio-focus',
	
	/**
	 * @cfg {String} label
	 * 选项的显示名
	 */
	
	//private
	initComponent: function() {
		this.addEvents(
			/**
			 * @event checkchange
			 * 在选择选项后触发
			 * @param {Teradata.widget.Radio} this
			 * @param {Boolean} checked
			 */
			'checkchange'
		);
		Teradata.widget.Radio.superclass.initComponent.call(this);
	},
	
	// private
	onRender: function() {
		if(this.el) {
			this.checked = this.el.get(0).checked;
		}
		Teradata.widget.Radio.superclass.onRender.apply(this, arguments);
		
		this.itemWrap.addClass('teradata-widget-field-radio');
		
		this.labelEl = this.itemWrap.find('.teradata-widget-field-radio-label')[0];
		this.text = this.itemWrap.find('.teradata-widget-field-radio-text')[0];
		
		if(this.labelEl) {
			this.labelEl = Teradata.get(this.labelEl);
		} else {
			this.el.wrap('<label></label>');
			this.labelEl = this.el.parent();
			this.labelEl.addClass('teradata-widget-field-radio-label');
		}
		
		if(this.text) {
			this.text = Teradata.get(this.text);
			this.label = this.text.html();
		} else {
			this.text = Teradata.get(document.createElement('span'));
			this.text.addClass('teradata-widget-field-radio-text');
			this.text.html(this.label);
			this.labelEl.append(this.text);
		}
		if(this.hasOwnProperty('checked')) {
			this.setChecked(this.checked);
		} else {
			this.checked = !!this.checked;
			this.setChecked(this.checked);
		}
	},
	
	// private
	initEvents: function() {
		Teradata.widget.Radio.superclass.initEvents.call(this);
		this.bind(this.labelEl, 'click', function(e) {
			if(this.readOnly) {
				return false;
			}
			this.fireEvent('checkchange', this, this.isChecked());
		});
	},
	
	/**
	 * 设置选中状态
	 * @param {Boolean} checked 是否选中
	 * @param {Boolean} suspendedEvent 禁止触发事件
	 */
	setChecked: function(checked, suspendedEvent) {
		if(this.isChecked() != checked) {
			this.checked = checked;
			if(this.rendered) {
				if(checked) {
					this.el.attr('checked', 'checked');
				} else {
					this.el.removeAttr('checked');
				}
			}
			if(!suspendedEvent) {
				this.fireEvent('checkchange', this, this.isChecked());
			}
		}
	},
	
	/**
	 * 设置只读
	 * @param {Boolean} readOnly
	 */
	setReadOnly: function(readOnly) {
		Teradata.widget.Radio.superclass.setReadOnly.call(this, readOnly);
		if(!this.disabled) {
			if(readOnly) {
				this.el.removeAttr('name');
				this.el.attr('disabled', true);
				if(this.submitValue) {
					this.hiddenField = Teradata.get(Teradata.createDom({
						tag: 'input',
						attr: {
							type: 'hidden',
							name: this.getName()
						}
					}));
					this.hiddenField.insertBefore(this.el);
				}
			} else {
				if(this.hiddenField) {
					this.hiddenField.remove();
					delete this.hiddenField;
				}
				if(this.submitValue) {
					this.el.attr('name', this.getName());
				}
			}
		} else {
			if(this.hiddenField) {
				this.hiddenField.remove();
				delete this.hiddenField();
			}
		}
	},
	
	/**
	 * 设置禁用
	 * @param {Boolean} disable
	 */
	disable: function(disable) {
		Teradata.widget.Radio.superclass.disable.call(this, disable);
		if(!disable) {
			this.setReadOnly(this.readOnly);
		}
	},
	
	/**
	 * 获得选中状态
	 * @return {Boolean}
	 */
	isChecked: function() {
		return this.rendered ? this.el.get(0).checked : this.checked;
	},
	
	/**
	 * 设置显示标签
	 * @param {String} label
	 */
	setLabel: function(label) {
		this.label = label;
		this.text.html(label);
	}
});

Teradata.reg('radio', Teradata.widget.Radio);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.CheckboxGroup
 * @extends Teradata.widget.Field
 * 字段组组件
 */
Teradata.widget.CheckboxGroup = Teradata.extend(Teradata.widget.Field, {
	
	/**
	 * @cfg {Number} columns
	 * 子项列数
	 */
	columns: 3,
	
	corners: 'none',
	
	width: 180,
	
	/**
	 * @cfg {String} labelField
	 * 标签字段名
	 */
	labelField: 'text',
	
	/**
	 * @cfg {String} valueField
	 * 值字段名
	 */
	valueField: 'value',
	
	/**
	 * @cfg {String} valueSeparator
	 * 值分隔符，当设定字符串值时，多个值之间使用该字符分割。
	 */
	valueSeparator: ',',
	
	autoHeight: true,
	
	/**
	 * @cfg {String} singleValue
	 * 当该值设置为true时，提交参数中仅存在一个值，所有选项的值使用valueSeparator属性分割。
	 */
	singleValue: false,
	
	// private
	initComponent: function() {
		Teradata.widget.CheckboxGroup.superclass.initComponent.call(this);
		this.inputType = 'hidden';
		this.items = [];
	},
	
	// private
	onRender: function() {
		Teradata.widget.CheckboxGroup.superclass.onRender.apply(this, arguments);
		this.itemWrap.addClass('teradata-widget-field-checkboxgroup');
		if(!this.singleValue) {
			this.el.removeAttr('name');
		}
	},
	
	// private
	bindStore: function() {
		var clear = function(store, record) {
			this.update.call(this, 'remove', store, record);
		};
		
		var remove = function(store, record) {
			this.update.call(this, 'remove', store, record);
		};
		
		var add = function(store, record) {
			this.update.call(this, 'add', store, record);
			this.syncItemsChecked();
		};
		
		var load = function(store, record) {
			this.update.call(this, 'add', store, record);
			this.syncItemsChecked();
		};
		
		var update = function(store, record) {
			this.update.call(this, 'update', store, record);
		};
		return function(store) {
			if(this.store) {
				this.store.un('clear', clear);
				this.store.un('remove', remove);
				this.store.un('add', add);
				this.store.un('update', update);
				this.store.un('load', load);
			}
			this.store = store;
			this.store.on('clear', clear, this);
			this.store.on('remove', remove, this);
			this.store.on('add', add, this);
			this.store.on('load', load, this);
			this.store.on('update', update, this);
		};
	}(),
	
	// private
	afterRender: function() {
		Teradata.widget.CheckboxGroup.superclass.afterRender.apply(this, arguments);
		if(!this.store && Teradata.isArray(this.datas)) {
			var store = new Teradata.data.Store({
				fields: [this.valueField, this.labelField]
			});
			this.bindStore(store);
		} else if(this.store) {
			this.bindStore(this.store);
		}
		if(this.datas) {
			this.store.loadData(this.datas);
		} else if(this.store && this.store.url) {
			this.store.load();
		}
	},
	
	// private
	update: function(operate, store, records) {
		if(records instanceof Array) {
			for(var i = 0; i < records.length; i++) {
				this.update(operate, store, records[i]);
			}
		} else {
			if(operate == 'add') {
				var c = new Teradata.widget.Checkbox({
					id: records.id,
					value: records.get(this.valueField),
					label: records.get(this.labelField),
					name: this.singleValue ? null : this.getName(),
					width: this.getItemWidth(),
					submitValue: this.submitValue,
					readOnly: this.readOnly,
					disabled: this.disabled
				});
				c.on('checkchange', function() {
					var values = [];
					for(var i = 0; i < this.items.length; i++) {
						if(this.items[i].isChecked()) {
							values.push(this.items[i].getValue());
						}
					}
					this.setValue(values);
				}, this);
				this.items.push(c);
				c.render(this.itemWrap, this.items.length);
			} else if(operate == 'remove') {
				var item = Teradata.getCmp(records.id);
				this.items.remove(item);
				item.destroy();
			} else if(operate == 'update') {
				var item = Teradata.getCmp(records.id);
				item.setValue(records.get(this.valueField));
				item.setLabel(records.get(this.labelField));
			}
		}
	},
	
	/**
	 * 获得项目宽度
	 * @return {Number}
	 */
	getItemWidth: function() {
		return this.itemWrap.innerWidth() / this.columns;
	},
	
	// private
	syncItemsChecked: function() {
		var value = this.getValue();
		if(value) {
			value = value.split(this.valueSeparator);
		}
		for(var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			var v = item.getValue();
			item.setChecked(value.indexOf(v) != -1);
		}
	},
	
	// private
	onDestroy: function() {
		Teradata.widget.CheckboxGroup.superclass.onDestroy.call(this);
		for(var i = 0; i < this.items.length; i++) {
			this.items[i].destroy();
		}
		this.store.destroy();
	},
	
	// private
	getName: function() {
		return this.name || this.id;
	},
	
	/**
	 * 设置值
	 * @param {Array/String} value
	 * @param {Boolean} suspendedItemEvent 禁止选项触发事件
	 * @return {Teradata.widget.CheckboxGroup}
	 */
	setValue: function(value, suspendedItemEvent) {
		if(Teradata.isArray(value) && value.length > 0) {
			value = value.join(this.valueSeparator);
		}
		var r = Teradata.widget.CheckboxGroup.superclass.setValue.call(this, value);
		this.syncItemsChecked();
		return r;
	},
	
	// private
	onResize: function() {
		Teradata.widget.CheckboxGroup.superclass.onResize.apply(this, arguments);
		for(var i = 0; i < this.items.length; i++) {
			this.items[i].setWidth(this.getItemWidth());
		}
	},
	
	// private
	getErrors: function(value) {
		var errors = Teradata.widget.CheckboxGroup.superclass.getErrors.call(this, value);
		if (this.required && (value.length < 1 || value === this.emptyText)) { // if it's blank
            errors.push(this.requiredText);
        }
		return errors;
	}
});

Teradata.reg('checkboxgroup', Teradata.widget.CheckboxGroup);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.RadioGroup
 * @extends Teradata.widget.Field
 * 字段组组件
 */
Teradata.widget.RadioGroup = Teradata.extend(Teradata.widget.Field, {
	
	/**
	 * @cfg {Number} columns
	 * 子项列数
	 */
	columns: 3,
	
	corners: 'none',
	
	width: 180,
	
	/**
	 * @cfg {String} labelField
	 * 标签字段名
	 */
	labelField: 'text',
	
	/**
	 * @cfg {String} valueField
	 * 值字段名
	 */
	valueField: 'value',
	
	/**
	 * @cfg {String} valueSeparator
	 * 值分隔符，当设定字符串值时，多个值之间使用该字符分割。
	 */
	valueSeparator: ',',
	
	autoHeight: true,
	
	// private
	initComponent: function() {
		Teradata.widget.RadioGroup.superclass.initComponent.call(this);
		this.inputType = 'hidden';
		this.items = [];
	},
	
	// private
	onRender: function() {
		Teradata.widget.RadioGroup.superclass.onRender.apply(this, arguments);
		this.itemWrap.addClass('teradata-widget-field-radiogroup');
	},
	
	// private
	bindStore: function() {
		var clear = function(store, record) {
			this.update.call(this, 'remove', store, record);
		};
		
		var remove = function(store, record) {
			this.update.call(this, 'remove', store, record);
		};
		
		var add = function(store, record) {
			this.update.call(this, 'add', store, record);
			this.syncItemsChecked();
		};
		
		var load = function(store, record) {
			this.update.call(this, 'add', store, record);
			this.syncItemsChecked();
		};
		
		var update = function(store, record) {
			this.update.call(this, 'update', store, record);
		};
		
		return function(store) {
			if(this.store) {
				this.store.un('clear', clear);
				this.store.un('remove', remove);
				this.store.un('add', add);
				this.store.un('update', update);
				this.store.un('load', load);
			}
			this.store = store;
			this.store.on('clear', clear, this);
			this.store.on('remove',remove , this);
			this.store.on('add', add, this);
			this.store.on('load', load, this);
			this.store.on('update', update, this);
		};
	}(),
	
	// private
	afterRender: function() {
		Teradata.widget.RadioGroup.superclass.afterRender.apply(this, arguments);
		if(!this.store && Teradata.isArray(this.datas)) {
			var store = new Teradata.data.Store({
				fields: [this.valueField, this.labelField]
			});
			this.bindStore(store);
		} else if(this.store) {
			this.bindStore(this.store);
		}
		if(this.datas) {
			this.store.loadData(this.datas);
		} else if(this.store && this.store.url) {
			this.store.load();
		}
	},
	
	// private
	update: function(operate, store, records) {
		if(records instanceof Array) {
			for(var i = 0; i < records.length; i++) {
				this.update(operate, store, records[i]);
			}
		} else {
			if(operate == 'add') {
				var c = new Teradata.widget.Radio({
					id: records.id,
					value: records.get(this.valueField),
					label: records.get(this.labelField),
					width: this.getItemWidth(),
					submitValue: false,
					readOnly: this.readOnly,
					disabled: this.disabled
				});
				c.on('checkchange', function(radio, checked) {
					if(checked) {
						this.setValue(radio.getValue());
					}
				}, this);
				this.items.push(c);
				c.render(this.itemWrap, this.items.length);
			} else if(operate == 'remove') {
				var item = Teradata.getCmp(records.id);
				this.items.remove(item);
				item.destroy();
			} else if(operate == 'update') {
				var item = Teradata.getCmp(records.id);
				item.setValue(records.get(this.valueField));
				item.setLabel(records.get(this.labelField));
			}
		}
	},
	
	// private
	syncItemsChecked: function() {
		var value = this.getValue();
		for(var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			var v = item.getValue();
			if(value == v) {
				item.setChecked(true);
			} else {
				item.setChecked(false);
			}
		}
	},
	
	/**
	 * 获得项目宽度
	 * @return {Number}
	 */
	getItemWidth: function() {
		return this.itemWrap.innerWidth() / this.columns;
	},
	
	// private
	onDestroy: function() {
		Teradata.widget.RadioGroup.superclass.onDestroy.call(this);
		for(var i = 0; i < this.items.length; i++) {
			this.items[i].destroy();
		}
		this.store.destroy();
	},
	
	// private
	getName: function() {
		return this.name || this.id;
	},
	
	/**
	 * 设置值
	 * @param {String} value
	 * @return {Teradata.widget.RadioGroup}
	 */
	setValue: function(value) {
		var r = Teradata.widget.RadioGroup.superclass.setValue.call(this, value);
		this.syncItemsChecked();
		return r;
	},
	
	// private
	onResize: function() {
		Teradata.widget.RadioGroup.superclass.onResize.apply(this, arguments);
		for(var i = 0; i < this.items.length; i++) {
			this.items[i].setWidth(this.getItemWidth());
		}
	},
	
	// private
	getErrors: function(value) {
		var errors = Teradata.widget.RadioGroup.superclass.getErrors.call(this, value);
		if (this.required && (value.length < 1 || value === this.emptyText)) { // if it's blank
            errors.push(this.requiredText);
        }
		return errors;
	}
});

Teradata.reg('radiogroup', Teradata.widget.RadioGroup);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * @class Teradata.widget.DateField
 * @extends Teradata.widget.TriggerField
 * 日期选择组件
 */
Teradata.widget.DateField = Teradata.extend(Teradata.widget.TriggerField, {
	
	format: 'yyyy-MM-dd',
	
	selectButtonText: 'OK',
	
	todayButtonText: 'Today',
	
	minDateText: 'The date must be after {0}',
	
	maxDateText: 'The date must be before {0}',
	
	betweenDateText: 'The date must be between {0} to {1}',
	
	/**
	 * @cfg {Date} minDate
	 * 最小日期
	 */
	
	/**
	 * @cfg {Date} maxDate
	 * 最大日期
	 */
	
	// private
	initComponent: function() {
		Teradata.widget.DateField.superclass.initComponent.call(this);
		this.setMinDate(this.minDate);
		this.setMaxDate(this.maxDate);
		this.readOnly = true;
	},
	
	// private
	onRender: function() {
		Teradata.widget.DateField.superclass.onRender.apply(this, arguments);
		this.itemWrap.addClass('teradata-widget-field-date');
	},
	
	// private
	renderPicker: function() {
		var pickerLayer = document.createElement('div');
		var pickerLayerWrap = document.createElement('div');
		
		this.pickerLayerWrap = Teradata.get(pickerLayerWrap);
		this.pickerLayerWrap.addClass('teradata-widget-field-date-picker-wrap');
		
		this.pickerLayer = Teradata.get(pickerLayer);
		this.pickerLayer.addClass('teradata-widget-field-date-picker');
		
		this.itemWrap.append(this.pickerLayerWrap);
		this.pickerLayerWrap.append(this.pickerLayer);
		
		this.picker = new Teradata.widget.DatePicker({
			date: this.getValue(),
			minDate: this.minDate,
			maxDate: this.maxDate,
			format: this.format
		});
		
		this.picker.render(this.pickerLayer);
		
		var pickerFbar = this.picker.pickerFooter;
		
		this.todayButton = new Teradata.widget.Button({
			text: this.todayButtonText,
			handler: function() {
				var d = new Date();
				this.picker.setDate(d);
				this.picker.setPickerDate(d);
				this.setValue(d);
				this.hidePickerLayer();
			}.createDelegate(this)
		});
		this.todayButton.render(pickerFbar);
		
		var clear = document.createElement('div');
		clear.className = 'teradata-clear';
		pickerFbar.append(clear);
		
		this.shadow = new Teradata.Shadow();
		this.shadow.applyTo(this.pickerLayer);
		
		this.hidePickerLayer();
	},
	
	// private
	initEvents: function() {
		Teradata.widget.Combo.superclass.initEvents.call(this);
		this.bind(this.pickerLayer, 'mouseover', this.onListMouseOver);
		this.bind(this.pickerLayer, 'mouseout', this.onListMouseOut);
		this.picker.on('select', function(picker, date) {
			this.setValue(date);
			window.setTimeout(function() {
				this.hidePickerLayer();
			}.createDelegate(this), 50);
		}, this);
	},
	
	// private
	hidePickerLayer: function() {
		if(this.rendered) {
			this.pickerLayerWrap.addClass('teradata-hide-visibility');
		}
	},
	
	// private
	showPickerLayer: function() {
		if(this.rendered) {
			var v = this.getValue();
			if(v) {
				this.picker.setDate(Date.parseDate(v, this.format));
			}
			this.pickerLayerWrap.removeClass('teradata-hide-visibility');
			this.shadow.applyTo(this.pickerLayer);
		}
	},
	
	// private
	onTriggerClick: function() {
		this.showPickerLayer();
	},
	
	// private
	onListMouseOver: function(e) {
		var target = Teradata.get(e.target);
		if(e.target == this.pickerLayer.get(0) || target.parents('.teradata-widget-field-date-picker').get(0) == this.pickerLayer.get(0)) {
			this.mouseInList = true;
		}
	},
	
	// private
	onListMouseOut: function(e) {
		var target = Teradata.get(e.relatedTarget);
		if(target.get(0) != this.pickerLayer.get(0) && target.parents('.teradata-widget-field-date-picker').get(0) != this.pickerLayer.get(0)) {
			this.el.focus();
			this.mouseInList = false;
		}
	},
	
	// private
	onBlur: function(e) {
		if(!this.mouseInList) {
			Teradata.widget.DateField.superclass.onBlur.call(this, e);
			this.hidePickerLayer();
		}
	},
	
	// private
	afterRender: function() {
		this.renderPicker();
		Teradata.widget.DateField.superclass.afterRender.apply(this, arguments);
	},
	
	/**
	 * 设置最小可选日期
	 * @param {String/Date} minDate
	 */
	setMinDate: function(minDate) {
		if(minDate) {
			if(Teradata.isString(minDate)) {
				minDate = Date.parseDate(minDate, this.format);
			}
			this.minDate = minDate;
		} else {
			this.minDate = null;
		}
	},
	
	/**
	 * 设置最大可选日期
	 * @param {String/Date} maxDate
	 */
	setMaxDate: function(maxDate) {
		if(maxDate) {
			if(Teradata.isString(maxDate)) {
				maxDate = Date.parseDate(maxDate, this.format);
			}
			this.maxDate = maxDate;
		} else {
			this.maxDate = null;
		}
	},
	
	/**
	 * 设置字段值
	 * @param {String/Date} v
	 */
	setValue: function(v) {
		if(Teradata.isString(v)) {
			v = Date.parseDate(v, this.format);
		}
		return Teradata.widget.DateField.superclass.setValue.call(this, v.format(this.format));
	},
	
	// private
	getErrors: function(v) {
		var errors = Teradata.widget.DateField.superclass.getErrors.apply(this, arguments);
		v = Date.parseDate(v, this.format);
		if(this.minDate && this.maxDate) {
			if(v.dateLessThan(this.minDate) || v.dateGreatThan(this.maxDate)) {
				errors.push(String.format(this.betweenDateText, this.minDate.format(this.format), this.maxDate.format(this.format)));
			}
		} else if(this.minDate && v.dateLessThan(this.minDate)) {
			errors.push(String.format(this.minDateText, this.minDate.format(this.format)));
		} else if(this.maxDate && v > v.dateGreatThan(this.maxDate)) {
			errors.push(String.format(this.maxDateText, this.maxDate.format(this.format)));
		}
		return errors;
	}
});

Teradata.reg('date', Teradata.widget.DateField);/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012.03.20
 */

/**
 * @class Teradata.widget.FileField
 * @extends Teradata.widget.TriggerField
 * 文件组件
 */
Teradata.widget.FileField = Teradata.extend(Teradata.widget.TriggerField, {
	
	/**
	 * @cfg {String} downloadURL
	 * 文件下载连接
	 */
	
	// private
	initComponent: function() {
		Teradata.widget.FileField.superclass.initComponent.call(this);
	},
	
	// private
	onRender: function() {
		Teradata.widget.FileField.superclass.onRender.apply(this, arguments);
		this.itemWrap.addClass('teradata-widget-field-file');
		this.el.removeAttr('name');
		this.renderInputFile();
	},
	
	// private
	onTriggerClick: function() {
		this.inputFile.click();
	},
	
	// private
	initEvents: function() {
		Teradata.widget.FileField.superclass.initEvents.apply(this, arguments);
		this.bind(this.el, 'keydown', function(e) {
			if(e.keyCode != 9) {
				// if not "tab" key, prevent default event.
				e.preventDefault();
			}
			if(e.keyCode == 8 || e.keyCode == 46) {
				// if "del" and "backspace" key is down
				this.setValue();
			}
		});
	},
	
	// private
	renderInputFile: function() {
		if(this.inputFile) {
			this.inputFile.remove();
			delete this.inputFile;
		}
		this.inputFile = Teradata.get(Teradata.createDom({
			tag: 'input',
			attr: {
				type: 'file'
			},
			cls: ['teradata-widget-field-file-input-file', 'teradata-hide-visibility']
		}));
		
		if(this.submitValue !== false) {
			this.inputFile.attr('name', this.getName());
		}
		
		this.itemWrap.append(this.inputFile);
		this.bind(this.inputFile, 'change', function(e) {
			this.setValue(this.inputFile.val());
		});
	},
	
	/**
	 * 该方法设定组件值，但受浏览器安全性限制，只能用作清空文件与设定显示值使用。
	 * @param {String} v
	 * @return {Teradata.widget.FileField} this
	 */
	setValue: function(v) {
		if(Teradata.isEmpty(v)) {
			this.renderInputFile();
		}
		return Teradata.widget.FileField.superclass.setValue.call(this, v);
	}
});

Teradata.reg('file', Teradata.widget.FileField);