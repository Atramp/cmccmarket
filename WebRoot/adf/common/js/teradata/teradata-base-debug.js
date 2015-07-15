/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 */
/*!
 * Copyright 2012 By Teradata China Co.Ltd. All rights reserved
 * 
 * Created on 2012-02-09
 */

/**
 * Teradata Application Development Framework (ADF) UI.
 */
Teradata = function() {
	return {
		ADF: {
			VERSION: '2.0',
			WIDGET_ROUNDED_CORNERS: true
		}
	};
}();

TD = Teradata;

// Add event mousewheel support to jquery.
(function($) {

	$.event.special.mousewheel = {
		setup: function() {
			var handler = $.event.special.mousewheel.handler;
			
			// Fix pageX, pageY, clientX and clientY for mozilla
			if ( $.browser.mozilla )
				$(this).bind('mousemove.mousewheel', function(event) {
					$.data(this, 'mwcursorposdata', {
						pageX: event.pageX,
						pageY: event.pageY,
						clientX: event.clientX,
						clientY: event.clientY
					});
				});
		
			if ( this.addEventListener )
				this.addEventListener( ($.browser.mozilla ? 'DOMMouseScroll' : 'mousewheel'), handler, false);
			else
				this.onmousewheel = handler;
		},
		
		teardown: function() {
			var handler = $.event.special.mousewheel.handler;
			
			$(this).unbind('mousemove.mousewheel');
			
			if ( this.removeEventListener )
				this.removeEventListener( ($.browser.mozilla ? 'DOMMouseScroll' : 'mousewheel'), handler, false);
			else
				this.onmousewheel = function(){};
			
			$.removeData(this, 'mwcursorposdata');
		},
		
		handler: function(event) {
			var args = Array.prototype.slice.call( arguments, 1 );
			
			event = $.event.fix(event || window.event);
			// Get correct pageX, pageY, clientX and clientY for mozilla
			$.extend( event, $.data(this, 'mwcursorposdata') || {} );
			var delta = 0;
			
			if ( event.originalEvent.wheelDelta ) delta = event.originalEvent.wheelDelta/120;
			if ( event.originalEvent.detail     ) delta = -event.originalEvent.detail/3;
			if ( $.browser.opera  ) delta = -event.originalEvent.wheelDelta;
			
			event.data  = event.data || {};
			event.type  = "mousewheel";
			
			// Add delta to the front of the arguments
			args.unshift(delta);
			// Add event to the front of the arguments
			args.unshift(event);

			return $.event.handle.apply(this, args);
		}
	};

	$.fn.extend({
		mousewheel: function(fn) {
			return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
		},
		
		unmousewheel: function(fn) {
			return this.unbind("mousewheel", fn);
		}
	});
	
	$.fn.extend({
		region: function() {
			var t = $(this);
			var offset = t.offset();
			var top = offset.top;
			var left = offset.left;
			var right = left + t.outerWidth();
			var bottom = top + t.outerHeight();
			
			return {
				top: top,
				right: right,
				bottom: bottom,
				left: left
			};
		}
	});
	
	$.fn.extend({
		disableUserSelect: function() {
			$(this).addClass('teradata-disable-user-select')
			.attr('unselectable', 'on')
			.bind('selectstart', function(e) {
				// disable mouse drag selection.
				e.preventDefault();
			});
		}
	});

	$.fn.extend({
		
		loadingMask: function(text) {
			var t = $(this);
			if(!t.masker) {
				var region = t.region();
				var width = t.outerWidth();
				var height = t.outerHeight();
				var maskerWrap = $(document.createElement('div'));
				
				maskerWrap.width(width);
				maskerWrap.height(height);
				maskerWrap.addClass('teradata-widget-masker');
				
				maskerWrap.html([
				    '<div class="teradata-widget-masker-inner">',
				    	'<span>',
				    	text || 'Loading ...',
				    	'</span>',
				    	'<div class="teradata-widget-masker-inner-icon"></div>',
			    	'</div>',
			    	'<div class="teradata-widget-loading-masker">',
			    	'</div>'
				].join(''));
				
				maskerWrap.insertBefore(t);
				
				var inner = maskerWrap.children().first();
				
				inner.css('left', (width - inner.outerWidth()) / 2);
				inner.css('top', (height - inner.outerHeight()) / 2);
				inner.next().css('opacity', .4);
				
				t.data('masker', maskerWrap);
			}
		},
		
		unmask: function() {
			var t = $(this);
			var masker = t.data('masker');
			if(masker) {
				masker.remove();
			}
		}
	});
	

	$.fn.extend({
		cursorPosition : function(value) {
			var elem = this[0];
			if (elem && (elem.tagName.toLowerCase() == "textarea" || elem.type.toLowerCase() == "text")) {
				if ($.browser.msie) {
					var rng;
					if (elem.tagName == "TEXTAREA") {
						rng = event.srcElement.createTextRange();
						rng.moveToPoint(event.x, event.y);
					} else {
						rng = document.selection.createRange();
					}
					if (value === undefined) {
						rng.moveStart("character", -event.srcElement.value.length);
						return rng.text.length;
					} else if (typeof value === "number") {
						var index = this.position();
						index > value ? (rng
								.moveEnd("character", value - index)) : (rng
								.moveStart("character", value - index));
						rng.select();
					}
				} else {
					if (value === undefined) {
						return elem.selectionStart;
					} else if (typeof value === "number") {
						elem.selectionEnd = value;
						elem.selectionStart = value;
					}
				}
			} else {
				if (value === undefined) {
					return undefined;
				}
			}
		}
	});

})(jQuery);

// Add console.log method to no console object browser.
$(function() {
	if(!window.console) {
		window.console = function() {
			var el = document.createElement('div');
			el.style.width = '400px';
			el.style.height = '240px';
			el.style.overflow = 'auto';
			el.style.border = '1px solid #000';
			el.style.position = 'absolute';
			el.style.right = '0';
			el.style.top = '0';
			el.style.display = 'none';
			el.style.padding = '12px';
			document.body.appendChild(el);
			$(window).scroll(function(e) {
				var top = $(this).scrollTop();
				el.style.top = top + 'px';
			});
			return {
				log: function() {
					var str = '';
					for(var i = 0; i < arguments.length; i++) {
						str += arguments[i].toString() + ',';
					}
					if(str.length > 0) {
						str = str.substring(0, str.length - 1);
					}
					var log = document.createElement('div');
					log.innerHTML = str.replace(/>/gi, '&gt;').replace(/</gi, '&lt;');
					el.appendChild(log);
					el.style.display = 'block';
				}
			};
		}();
	}
});

/**
 * Copies all the properties of config to obj.
 * @param {Object} obj The receiver of the properties
 * @param {Object} config The source of the properties
 * @param {Object} defaults A different object that will also be applied for default values
 * @return {Object} returns obj
 * @member Teradata apply
 */
Teradata.apply = function(o, c, defaults){
    // no "this" reference for friendly out of scope calls
    if(defaults){
        Teradata.apply(o, defaults);
    }
    if(o && c && typeof c == 'object'){
        for(var p in c){
            o[p] = c[p];
        }
    }
    return o;
};

(function() {
	var idSeed = 0,
    toString = Object.prototype.toString,
    ua = navigator.userAgent.toLowerCase(),
    check = function(r){
        return r.test(ua);
    },
    DOC = document,
    docMode = DOC.documentMode,
    isStrict = DOC.compatMode == "CSS1Compat",
    isOpera = check(/opera/),
    isChrome = check(/\bchrome\b/),
    isWebKit = check(/webkit/),
    isSafari = !isChrome && check(/safari/),
    isSafari2 = isSafari && check(/applewebkit\/4/), // unique to Safari 2
    isSafari3 = isSafari && check(/version\/3/),
    isSafari4 = isSafari && check(/version\/4/),
    isIE = !isOpera && check(/msie/),
    isIE7 = isIE && (check(/msie 7/) || docMode == 7),
    isIE8 = isIE && (check(/msie 8/) && docMode != 7),
    isIE9 = isIE && check(/msie 9/),
    isIE6 = isIE && !isIE7 && !isIE8 && !isIE9,
    isGecko = !isWebKit && check(/gecko/),
    isGecko2 = isGecko && check(/rv:1\.8/),
    isGecko3 = isGecko && check(/rv:1\.9/),
    isBorderBox = isIE && !isStrict,
    isWindows = check(/windows|win32/),
    isMac = check(/macintosh|mac os x/),
    isAir = check(/adobeair/),
    isLinux = check(/linux/),
    isSecure = /^https/i.test(window.location.protocol),
    isCSS1 = DOC.compatMode == "CSS1Compat";

	// remove css image flicker
	if(isIE6){
	    try{
	        DOC.execCommand("BackgroundImageCache", false, true);
	    }catch(e){}
	}
	
	Teradata.apply(Teradata, {
		/**
         * URL to a blank file used by Teradata when in secure mode for iframe src and onReady src to prevent
         * the IE insecure content warning (<tt>'about:blank'</tt>, except for IE in secure mode, which is <tt>'javascript:""'</tt>).
         * @type String
         */
        SSL_SECURE_URL : isSecure && isIE ? 'javascript:""' : 'about:blank',
        /**
         * True if the browser is in strict (standards-compliant) mode, as opposed to quirks mode
         * @type Boolean
         */
        isStrict : isStrict,
        /**
         * True if the page is running over SSL
         * @type Boolean
         */
        isSecure : isSecure,
        
        /**
         * 生成唯一ID
         * @param {Mixed} el 生成的ID应用到该element的id属性
         * @param {String} prefix ID前缀 (defaults "teradata-gen-")
         * @return {String}
         */
        id : function(el, prefix){
            el = Teradata.get(el).get(0) || {};
            if (!el.id) {
                el.id = (prefix || "teradata-gen-") + (++idSeed);
            }
            return el.id;
        },
        
        /**
         * 通过ID获得Element对象
         * @param id
         * @return {Element}
         */
        get: function(id) {
        	if(Teradata.isString(id)) {
        		return $('#' + id);
        	} else {
        		return $(id);
        	}
        },
        
        /**
         * 将任意对象转换为值
         * @param {String} v
         */
        val: function(v) {
        	if(Teradata.isPrimitive(v)) {
        		return v;
        	} else if(v instanceof Date) {
        		return Teradata.JSON.encodeDate(v);
        	} else if(Teradata.isObject(v)){
        		return Teradata.JSON.encode(v);
        	}
        },
        
        /**
         * 通过选择器查找Dom节点
         * @param {String} selector
         * @return {Mixed}
         */
        query: function(selector) {
        	return $(selector);
        },
        
        /**
         * 配置
         * @param {Object} config
         */
        createDom: function(config) {
        	if(Teradata.isString(config)) {
        		return document.createElement(config);
        	}
        	var tag = config.tag || 'div';
        	var attr = config.attr || {};
        	var cls = config.cls || [];
        	var el = document.createElement(tag);
        	for(var name in attr) {
        		var value = attr[name];
        		if(value) {
        			el.setAttribute(name, value);
        		}
        	}
        	if(cls.length > 0) {
        		el.className = cls.join(' ');
        	}
        	return el;
        },
        
        /**
         * 通过ID获得组件
         * @param {String} compId 组件ID
         * @return {Teradata.Component}
         */
        getCmp: function(compId) {
        	return Teradata.ComponentMgr.get(compId);
        },
		
		applyIf : function(o, c){
	        if(o){
	            for(var p in c){
	                if(!Teradata.isDefined(o[p])){
	                    o[p] = c[p];
	                }
	            }
	        }
	        return o;
	    },
	    
		namespace: function(){
	        var len1 = arguments.length,
	            i = 0,
	            len2,
	            j,
	            ns,
	            sub,
	            current = null;
	            
	        for(; i < len1; ++i) {
	            ns = arguments[i].split('.');
	            current = window[ns[0]];
	            if (current === undefined) {
	                current = window[ns[0]] = {};
	            }
	            sub = ns.slice(1);
	            len2 = sub.length;
	            for(j = 0; j < len2; ++j) {
	                current = current[sub[j]] = current[sub[j]] || {};
	            }
	        }
	        return current;
	    },
	    
	    extend : function(){
	        // inline overrides
	        var io = function(o){
	            for(var m in o){
	                this[m] = o[m];
	            }
	        };
	        var oc = Object.prototype.constructor;

	        return function(sb, sp, overrides){
	            if(typeof sp == 'object'){
	                overrides = sp;
	                sp = sb;
	                sb = overrides.constructor != oc ? overrides.constructor : function(){sp.apply(this, arguments);};
	            }
	            var F = function(){},
	                sbp,
	                spp = sp.prototype;

	            F.prototype = spp;
	            sbp = sb.prototype = new F();
	            sbp.constructor=sb;
	            sb.superclass=spp;
	            if(spp.constructor == oc){
	                spp.constructor=sp;
	            }
	            sb.override = function(o){
	                Teradata.override(sb, o);
	            };
	            sbp.superclass = sbp.supr = (function(){
	                return spp;
	            });
	            sbp.override = io;
	            Teradata.override(sb, overrides);
	            sb.extend = function(o){return Teradata.extend(sb, o);};
	            return sb;
	        };
	    }(),
	    
	    override : function(origclass, overrides){
	        if(overrides){
	            var p = origclass.prototype;
	            Teradata.apply(p, overrides);
	            if(Teradata.isIE && overrides.hasOwnProperty('toString')){
	                p.toString = overrides.toString;
	            }
	        }
	    },
	    
	    /**
	     * <p>Returns true if the passed value is empty.</p>
	     * <p>The value is deemed to be empty if it is<div class="mdetail-params"><ul>
	     * <li>null</li>
	     * <li>undefined</li>
	     * <li>an empty array</li>
	     * <li>a zero length string (Unless the <tt>allowBlank</tt> parameter is <tt>true</tt>)</li>
	     * </ul></div>
	     * @param {Mixed} value The value to test
	     * @param {Boolean} allowBlank (optional) true to allow empty strings (defaults to false)
	     * @return {Boolean}
	     */
	    isEmpty : function(v, allowBlank){
	        return v === null || v === undefined || ((Teradata.isArray(v) && !v.length)) || (!allowBlank ? v === '' : false);
	    },

	    /**
	     * Returns true if the passed value is a JavaScript array, otherwise false.
	     * @param {Mixed} value The value to test
	     * @return {Boolean}
	     */
	    isArray : function(v){
	        return toString.apply(v) === '[object Array]';
	    },

	    /**
	     * Returns true if the passed object is a JavaScript date object, otherwise false.
	     * @param {Object} object The object to test
	     * @return {Boolean}
	     */
	    isDate : function(v){
	        return toString.apply(v) === '[object Date]';
	    },

	    /**
	     * Returns true if the passed value is a JavaScript Object, otherwise false.
	     * @param {Mixed} value The value to test
	     * @return {Boolean}
	     */
	    isObject : function(v){
	        return !!v && Object.prototype.toString.call(v) === '[object Object]';
	    },

	    /**
	     * Returns true if the passed value is a JavaScript 'primitive', a string, number or boolean.
	     * @param {Mixed} value The value to test
	     * @return {Boolean}
	     */
	    isPrimitive : function(v){
	        return Teradata.isString(v) || Teradata.isNumber(v) || Teradata.isBoolean(v);
	    },

	    /**
	     * Returns true if the passed value is a JavaScript Function, otherwise false.
	     * @param {Mixed} value The value to test
	     * @return {Boolean}
	     */
	    isFunction : function(v){
	        return toString.apply(v) === '[object Function]';
	    },

	    /**
	     * Returns true if the passed value is a number. Returns false for non-finite numbers.
	     * @param {Mixed} value The value to test
	     * @return {Boolean}
	     */
	    isNumber : function(v){
	        return typeof v === 'number' && isFinite(v);
	    },

	    /**
	     * Returns true if the passed value is a string.
	     * @param {Mixed} value The value to test
	     * @return {Boolean}
	     */
	    isString : function(v){
	        return typeof v === 'string';
	    },

	    /**
	     * Returns true if the passed value is a boolean.
	     * @param {Mixed} value The value to test
	     * @return {Boolean}
	     */
	    isBoolean : function(v){
	        return typeof v === 'boolean';
	    },

	    /**
	     * Returns true if the passed value is an HTMLElement
	     * @param {Mixed} value The value to test
	     * @return {Boolean}
	     */
	    isElement : function(v) {
	        return v ? !!v.tagName : false;
	    },

	    /**
	     * Returns true if the passed value is not undefined.
	     * @param {Mixed} value The value to test
	     * @return {Boolean}
	     */
	    isDefined : function(v){
	        return typeof v !== 'undefined';
	    },
	    
	    /**
         * True if the detected browser is Opera.
         * @type Boolean
         */
        isOpera : isOpera,
        /**
         * True if the detected browser uses WebKit.
         * @type Boolean
         */
        isWebKit : isWebKit,
        /**
         * True if the detected browser is Chrome.
         * @type Boolean
         */
        isChrome : isChrome,
        /**
         * True if the detected browser is Safari.
         * @type Boolean
         */
        isSafari : isSafari,
        /**
         * True if the detected browser is Safari 3.x.
         * @type Boolean
         */
        isSafari3 : isSafari3,
        /**
         * True if the detected browser is Safari 4.x.
         * @type Boolean
         */
        isSafari4 : isSafari4,
        /**
         * True if the detected browser is Safari 2.x.
         * @type Boolean
         */
        isSafari2 : isSafari2,
        /**
         * True if the detected browser is Internet Explorer.
         * @type Boolean
         */
        isIE : isIE,
        /**
         * True if the detected browser is Internet Explorer 6.x.
         * @type Boolean
         */
        isIE6 : isIE6,
        /**
         * True if the detected browser is Internet Explorer 7.x.
         * @type Boolean
         */
        isIE7 : isIE7,
        /**
         * True if the detected browser is Internet Explorer 8.x.
         * @type Boolean
         */
        isIE8 : isIE8,
        /**
         * True if the detected browser is Internet Explorer 9.x.
         * @type Boolean
         */
        isIE9 : isIE9,
        /**
         * True if the detected browser uses the Gecko layout engine (e.g. Mozilla, Firefox).
         * @type Boolean
         */
        isGecko : isGecko,
        /**
         * True if the detected browser uses a pre-Gecko 1.9 layout engine (e.g. Firefox 2.x).
         * @type Boolean
         */
        isGecko2 : isGecko2,
        /**
         * True if the detected browser uses a Gecko 1.9+ layout engine (e.g. Firefox 3.x).
         * @type Boolean
         */
        isGecko3 : isGecko3,
        /**
         * True if the detected browser is Internet Explorer running in non-strict mode.
         * @type Boolean
         */
        isBorderBox : isBorderBox,
        /**
         * True if the detected platform is Linux.
         * @type Boolean
         */
        isLinux : isLinux,
        /**
         * True if the detected platform is Windows.
         * @type Boolean
         */
        isWindows : isWindows,
        /**
         * True if the detected platform is Mac OS.
         * @type Boolean
         */
        isMac : isMac,
        /**
         * True if the detected platform is Adobe Air.
         * @type Boolean
         */
        isAir : isAir,
	    
	    value : function(v, defaultValue, allowBlank){
	        return Teradata.isEmpty(v, allowBlank) ? defaultValue : v;
	    },
	    
	    /**
         * Converts any iterable (numeric indices and a length property) into a true array
         * Don't use this on strings. IE doesn't support "abc"[0] which this implementation depends on.
         * For strings, use this instead: "abc".match(/./g) => [a,b,c];
         * @param {Iterable} the iterable object to be turned into a true Array.
         * @return (Array) array
         */
	    toArray : function(){
	    	return isIE ?
	    		function(a, i, j, res){
	    			res = [];
	    			for(var x = 0, len = a.length; x < len; x++) {
	    				res.push(a[x]);
	    			}
	    			return res.slice(i || 0, j || res.length);
	    		} :
	    		function(a, i, j){
	    			return Array.prototype.slice.call(a, i || 0, j || a.length);
	    		};
	    }(),
	    
	    getViewWidth : function(full) {
            return full ? this.getDocumentWidth() : this.getViewportWidth();
        },

        getViewHeight : function(full) {
            return full ? this.getDocumentHeight() : this.getViewportHeight();
        },

        getDocumentHeight: function() {            
            return Math.max(!isCSS1 ? DOC.body.scrollHeight : DOC.documentElement.scrollHeight, this.getViewportHeight());
        },

        getDocumentWidth: function() {            
            return Math.max(!isCSS1 ? DOC.body.scrollWidth : DOC.documentElement.scrollWidth, this.getViewportWidth());
        },

        getViewportHeight: function(){
	        return Teradata.isIE ? 
	        	   (Teradata.isStrict ? DOC.documentElement.clientHeight : DOC.body.clientHeight) :
	        	   self.innerHeight;
        },

        getViewportWidth : function() {
	        return !Teradata.isStrict && !Teradata.isOpera ? DOC.body.clientWidth :
	        	   Teradata.isIE ? DOC.documentElement.clientWidth : self.innerWidth;
        },
        
        indexOf: function(o, array, from){
            var len = array.length;
            from = from || 0;
            from += (from < 0) ? len : 0;
            for (; from < len; ++from){
                if(array[from] === o){
                    return from;
                }
            }
            return -1;
        },
        
        /**
         * 注册浏览器窗体改变尺寸的监听器
         * @param {Function} fn 监听器函数
         * @param {Object} scope 监听器函数执行作用域
         */
        onWindowResize: function() {
        	Teradata.windowResizeHandlers = [];
        	$(window).on('resize', {scope: window}, function(e) {
        		var handlers = Teradata.windowResizeHandlers;
        		for(var i = 0; i < handlers.length; i++) {
        			var handler = handlers[i];
        			var win = $(window);
        			handler.fn.call(handler.scope || window, win.width(), win.height(), e);
        		}
        	});
        	return function(fn, scope) {
        		Teradata.windowResizeHandlers.push({fn: fn, scope: scope});
        	};
        }(),
        
        /**
         * 注销浏览器窗体改变尺寸的监听器
         * @param {Function} fn 监听器函数
         * @param {Object} scope 监听器函数作用域
         */
        unWindowResize: function(fn, scope) {
        	var handlers = Teradata.windowResizeHandlers;
        	for(var i = 0; i < handlers.length; i++) {
        		var handler = handlers[i];
        		if(handler[i] == fn && (!scope || scope == handler.scope)) {
        			handlers.splice(i, 1);
        		}
        	}
        },
	    
	    emptyFn: function(){}
	});
})();


/**
 * @class Function
 * These functions are available on every Function object (any JavaScript function).
 */
Teradata.apply(Function.prototype, {
	
	/**
	 * 创建方法拦截器
	 * @param {Function} fcn 拦截器方法
	 * @param {Object} scope 拦截器方法执行域
	 * @return {Function}
	 */
    createInterceptor : function(fcn, scope){
        var method = this;
        return !Teradata.isFunction(fcn) ?
                this :
                function() {
                    var me = this,
                        args = arguments;
                    fcn.target = me;
                    fcn.method = method;
                    return (fcn.apply(scope || me || window, args) !== false) ?
                            method.apply(me || window, args) :
                            null;
                };
    },

    /**
     * 创建作用于window对象的函数
     * @return {Function}
     */
    createCallback : function(/*args...*/){
        // make args available, in function below
        var args = arguments,
            method = this;
        return function() {
            return method.apply(window, args);
        };
    },

    /**
     * 创建方法代理
     * @param {Object} obj 代理域
     * @param {Array} args 代理参数
     * @param {Array} appendArgs 追加参数
     * @return {Function}
     */
    createDelegate : function(obj, args, appendArgs){
        var method = this;
        return function() {
            var callArgs = args || arguments;
            if (appendArgs === true){
                callArgs = Array.prototype.slice.call(arguments, 0);
                callArgs = callArgs.concat(args);
            }else if (Teradata.isNumber(appendArgs)){
                callArgs = Array.prototype.slice.call(arguments, 0); // copy arguments first
                var applyArgs = [appendArgs, 0].concat(args); // create method call params
                Array.prototype.splice.apply(callArgs, applyArgs); // splice them in
            }
            return method.apply(obj || window, callArgs);
        };
    },

    /**
     * 等待指定时间后执行
     * @param {Number} millis 等待毫秒数
     * @param {Object} obj 执行域
     * @param {Array} args 执行参数
     * @param {Array} appendArgs 附加参数
     * @return {Number}
     */
    defer : function(millis, obj, args, appendArgs){
        var fn = this.createDelegate(obj, args, appendArgs);
        if(millis > 0){
            return setTimeout(fn, millis);
        }
        fn();
        return 0;
    }
});

/**
 * @class String
 * These functions are available on every String object.
 */
Teradata.applyIf(String, {
    format : function(format){
        var args = Teradata.toArray(arguments, 1);
        return format.replace(/\{(\d+)\}/g, function(m, i){
            return args[i];
        });
    }
});

/**
 * @class Date
 * 对日期对象补充的静态方法
 */
Teradata.apply(Date, {
	
	format: 'yyyy-MM-dd',
	
	symbols: {
	    'yyyy': 'FullYear',
	    'MM': 'Month',
	    'dd': 'Date',
	    'HH': 'Hours',
	    'mm': 'Minutes',
	    'ss': 'Seconds',
	    'ms': 'Milliseconds'
	},
	
	/**
	 * 将字符串转换为日期对象
	 * @param {String} date
	 * @param {String} format 传入的字符串格式，标识符：（yy:年份后两位, yyyy:年份, MM:月份, dd:日期, HH:时, mm:分, ss:秒, ms:毫秒）
	 * @return {Date}
	 */
	parseDate: function(date, format) {
		format = format || Date.format;
		if(Teradata.isString(date)) {
			var d = new Date();
			for(var symbol in Date.symbols) {
				var index = format.indexOf(symbol);
				var method = Date.symbols[symbol];
				if(index != -1) {
					var v = date.substring(index, index + symbol.length);
					v = parseInt(v, 10);
					if(symbol == 'MM') {
						v -= 1;
					}
					if(Teradata.isNumber(v)) {
						d['set' + method].call(d, v);
					}
				}
			}
			return d;
		}
		return null;
	}
});

Teradata.apply(Date.prototype, {
	
	/**
	 * 格式化日期为字符串
	 * @param {String} format
	 * @return {String}
	 */
	format: function(format) {
		var date = format || Date.format;
		for(var symbol in Date.symbols) {
			var method = Date.symbols[symbol];
			var v = this['get' + method].call(this);
			if(symbol == 'MM') {
				v += 1;
			}
			v = v.toString();
			if(v.length < symbol.length) {
				v = (symbol.replace(/./g, '0') + v).substring(v.length);
			}
			date = date.replace(new RegExp(symbol, 'g'), v);
		}
		return date;
	},
	
	/**
	 * 克隆对象
	 * @return {Date}
	 */
	clone: function() {
		var d = new Date();
		d.setTime(this.getTime());
		return d;
	},
	
	/**
	 * 判定域指定日期对象的年份是否相同
	 * @param {Date} date
	 * @return {Boolean}
	 */
	yearEquals: function(date) {
		return this.getFullYear() == date.getFullYear();
	},
	
	/**
	 * 判定域指定日期对象的月份是否相同
	 * @param {Date} date
	 * @return {Boolean}
	 */
	monthEquals: function(date) {
		return this.yearEquals(date) && this.getMonth() == date.getMonth();
	},
	
	/**
	 * 判定与指定日期对象是否为同一天
	 * @param {Date} date
	 * @return {Boolean}
	 */
	dateEquals: function(date) {
		return this.monthEquals(date) && this.getDate() == date.getDate();
	},
	
	// TODO: Provide the hours, minutes and seconds comparison methods.
	
	/**
	 * 判定域指定日期对象是否为同一时刻
	 * @param {Date} date
	 * @return {Boolean}
	 */
	timeEquals: function(date) {
		return this.getTime() == date.getTime();
	},
	
	/**
	 * 比较年份是否大于等于指定日期
	 * @param {Date} date
	 * @return {Boolean}
	 */
	yearGreatEquals: function(date) {
		return this.getFullYear() >= date.getFullYear();
	},
	
	/**
	 * 比较月份是否大于等于指定日期
	 * @param {Date} date
	 * @returns {Boolean}
	 */
	monthGreatEquals: function(date) {
		return this.yearGreatThan(date) || (this.yearGreatEquals(date) && this.getMonth() >= date.getMonth());
	},
	
	/**
	 * 比较日期是否大于等于指定日期
	 * @param {Date} date
	 * @return {Boolean}
	 */
	dateGreatEquals: function(date) {
		return this.monthGreatThan(date) || (this.monthGreatEquals(date) && this.getDate() >= date.getDate());
	},
	
	// TODO: Provide the hours, minutes and seconds comparison methods.
	
	/**
	 * 比较时间是否大于等于指定日期
	 * @param {Date} date
	 * @return {Boolean}
	 */
	timeGreatEquals: function(date) {
		return this.getTime() >= date.getTime();
	},
	
	/**
	 * 比较年份是否大于指定日期
	 * @param {Date} date
	 * @return {Boolean}
	 */
	yearGreatThan: function(date) {
		return this.getFullYear() > date.getFullYear();
	},
	
	/**
	 * 比较月份是否大于指定日期
	 * @param {Date} date
	 * @returns {Boolean}
	 */
	monthGreatThan: function(date) {
		return this.yearGreatThan(date) || (this.yearGreatEquals(date) && this.getMonth() > date.getMonth());
	},
	
	/**
	 * 比较日期是否大于指定日期
	 * @param {Date} date
	 * @return {Boolean}
	 */
	dateGreatThan: function(date) {
		return this.monthGreatThan(date) || (this.monthGreatEquals(date) && this.getDate() > date.getDate());
	},
	
	// TODO: Provide the hours, minutes and seconds comparison methods.
	
	/**
	 * 比较时间是否大于指定日期
	 * @param {Date} date
	 * @return {Boolean}
	 */
	timeGreatThan: function(date) {
		return this.getTime() > date.getTime();
	},
	
	/**
	 * 比较年份是否小于等于指定日期
	 * @param {Date} date
	 * @return {Boolean}
	 */
	yearLessEquals: function(date) {
		return this.getFullYear() <= date.getFullYear();
	},
	
	/**
	 * 比较月份是否小于等于指定日期
	 * @param {Date} date
	 * @returns {Boolean}
	 */
	monthLessEquals: function(date) {
		return this.yearLessThan(date) || (this.yearLessEquals(date) && this.getMonth() <= date.getMonth());
	},
	
	/**
	 * 比较日期是否小于等于指定日期
	 * @param {Date} date
	 * @return {Boolean}
	 */
	dateLessEquals: function(date) {
		return this.monthLessThan(date) || (this.monthLessEquals(date) && this.getDate() <= date.getDate());
	},
	
	// TODO: Provide the hours, minutes and seconds comparison methods.
	
	/**
	 * 比较时间是否小于等于指定日期
	 * @param {Date} date
	 * @return {Boolean}
	 */
	timeLessEquals: function(date) {
		return this.getTime() <= date.getTime();
	},
	
	/**
	 * 比较年份是否小于指定日期
	 * @param {Date} date
	 * @return {Boolean}
	 */
	yearLessThan: function(date) {
		return this.getFullYear() < date.getFullYear();
	},
	
	/**
	 * 比较月份是否小于指定日期
	 * @param {Date} date
	 * @returns {Boolean}
	 */
	monthLessThan: function(date) {
		return this.yearLessThan(date) || (this.yearLessEquals(date) && this.getMonth() < date.getMonth());
	},
	
	/**
	 * 比较日期是否小于指定日期
	 * @param {Date} date
	 * @return {Boolean}
	 */
	dateLessThan: function(date) {
		return this.monthLessThan(date) || (this.monthLessEquals(date) && this.getDate() < date.getDate());
	},
	
	// TODO: Provide the hours, minutes and seconds comparison methods.
	
	/**
	 * 比较时间是否小于指定日期
	 * @param {Date} date
	 * @return {Boolean}
	 */
	timeLessThan: function(date) {
		return this.getTime() < date.getTime();
	},
	
	/**
	 * 将该日期向后移动一天
	 * @return {Date} this
	 */
	nextDay: function() {
		this.setDate(this.getDate() + 1);
		return this;
	}
});

/**
 * @class Array
 */
Teradata.applyIf(Array.prototype, {

	/**
	 * 获得对象在数组中的索引值
	 * @param {Mixed} o 对象
	 * @param {Number} from 起始索引值
	 * @returns
	 */
    indexOf: function(o, from){
        var len = this.length;
        from = from || 0;
        from += (from < 0) ? len : 0;
        for (; from < len; ++from){
            if(this[from] === o){
                return from;
            }
        }
        return -1;
    },

    /**
     * 在数组中删除对象
     * @param {Mixed} o 被查找的对象
     * @return {Mixed}
     */
    remove: function(o){
        var index = this.indexOf(o);
        this.removeAt(index);
        return this;
    },
    
    /**
     * 删除数组中位于指定索引值的对象
     * @param {Number} index 索引值
     * @return {Mixed}
     */
    removeAt: function(index) {
    	if(index != -1){
            this.splice(index, 1);
        }
    	return this;
    }
});

/**
 * @class Ajax
 */
Teradata.Ajax = {
	/**
	 * 发送get请求
	 * @param {String} url
	 * @param {Object} parameters
	 * @param {Function} success
	 */
	get: jQuery.get,
	
	/**
	 * 发送post请求
	 * @param {String} url
	 * @param {Object} parameters
	 * @param {Function} success
	 */
	post: jQuery.post,
	
	/**
	 * 发送get请求获得json对象
	 * @param {String} url
	 * @param {Object} parameters
	 * @param {Function} success
	 */
	getJSON: jQuery.getJSON
};

Teradata.namespace('Teradata.util');
Teradata.namespace('Teradata.data');
Teradata.namespace('Teradata.widget');
Teradata.namespace('Teradata.widget.layout');
Teradata.namespace('Teradata.widget.grid');
Teradata.namespace('Teradata.widget.tree');