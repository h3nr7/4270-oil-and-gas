var dat = dat || {};

dat.gui = dat.gui || {};

dat.utils = dat.utils || {};

dat.controllers = dat.controllers || {};

dat.dom = dat.dom || {};

dat.color = dat.color || {};

dat.utils.css = function() {
    return {
        load: function(url, doc) {
            doc = doc || document;
            var link = doc.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = url;
            doc.getElementsByTagName("head")[0].appendChild(link);
        },
        inject: function(css, doc) {
            doc = doc || document;
            var injected = document.createElement("style");
            injected.type = "text/css";
            injected.innerHTML = css;
            doc.getElementsByTagName("head")[0].appendChild(injected);
        }
    };
}();

dat.utils.common = function() {
    var ARR_EACH = Array.prototype.forEach;
    var ARR_SLICE = Array.prototype.slice;
    return {
        BREAK: {},
        extend: function(target) {
            this.each(ARR_SLICE.call(arguments, 1), function(obj) {
                for (var key in obj) if (!this.isUndefined(obj[key])) target[key] = obj[key];
            }, this);
            return target;
        },
        defaults: function(target) {
            this.each(ARR_SLICE.call(arguments, 1), function(obj) {
                for (var key in obj) if (this.isUndefined(target[key])) target[key] = obj[key];
            }, this);
            return target;
        },
        compose: function() {
            var toCall = ARR_SLICE.call(arguments);
            return function() {
                var args = ARR_SLICE.call(arguments);
                for (var i = toCall.length - 1; i >= 0; i--) {
                    args = [ toCall[i].apply(this, args) ];
                }
                return args[0];
            };
        },
        each: function(obj, itr, scope) {
            if (!obj) return;
            if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
                obj.forEach(itr, scope);
            } else if (obj.length === obj.length + 0) {
                for (var key = 0, l = obj.length; key < l; key++) if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) return;
            } else {
                for (var key in obj) if (itr.call(scope, obj[key], key) === this.BREAK) return;
            }
        },
        defer: function(fnc) {
            setTimeout(fnc, 0);
        },
        toArray: function(obj) {
            if (obj.toArray) return obj.toArray();
            return ARR_SLICE.call(obj);
        },
        isUndefined: function(obj) {
            return obj === undefined;
        },
        isNull: function(obj) {
            return obj === null;
        },
        isNaN: function(obj) {
            return obj !== obj;
        },
        isArray: Array.isArray || function(obj) {
            return obj.constructor === Array;
        },
        isObject: function(obj) {
            return obj === Object(obj);
        },
        isNumber: function(obj) {
            return obj === obj + 0;
        },
        isString: function(obj) {
            return obj === obj + "";
        },
        isBoolean: function(obj) {
            return obj === false || obj === true;
        },
        isFunction: function(obj) {
            return Object.prototype.toString.call(obj) === "[object Function]";
        }
    };
}();

dat.controllers.Controller = function(common) {
    var Controller = function(object, property) {
        this.initialValue = object[property];
        this.domElement = document.createElement("div");
        this.object = object;
        this.property = property;
        this.__onChange = undefined;
        this.__onFinishChange = undefined;
    };
    common.extend(Controller.prototype, {
        onChange: function(fnc) {
            this.__onChange = fnc;
            return this;
        },
        onFinishChange: function(fnc) {
            this.__onFinishChange = fnc;
            return this;
        },
        setValue: function(newValue) {
            this.object[this.property] = newValue;
            if (this.__onChange) {
                this.__onChange.call(this, newValue);
            }
            this.updateDisplay();
            return this;
        },
        getValue: function() {
            return this.object[this.property];
        },
        updateDisplay: function() {
            return this;
        },
        isModified: function() {
            return this.initialValue !== this.getValue();
        }
    });
    return Controller;
}(dat.utils.common);

dat.dom.dom = function(common) {
    var EVENT_MAP = {
        HTMLEvents: [ "change" ],
        MouseEvents: [ "click", "mousemove", "mousedown", "mouseup", "mouseover" ],
        KeyboardEvents: [ "keydown" ]
    };
    var EVENT_MAP_INV = {};
    common.each(EVENT_MAP, function(v, k) {
        common.each(v, function(e) {
            EVENT_MAP_INV[e] = k;
        });
    });
    var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
    function cssValueToPixels(val) {
        if (val === "0" || common.isUndefined(val)) return 0;
        var match = val.match(CSS_VALUE_PIXELS);
        if (!common.isNull(match)) {
            return parseFloat(match[1]);
        }
        return 0;
    }
    var dom = {
        makeSelectable: function(elem, selectable) {
            if (elem === undefined || elem.style === undefined) return;
            elem.onselectstart = selectable ? function() {
                return false;
            } : function() {};
            elem.style.MozUserSelect = selectable ? "auto" : "none";
            elem.style.KhtmlUserSelect = selectable ? "auto" : "none";
            elem.unselectable = selectable ? "on" : "off";
        },
        makeFullscreen: function(elem, horizontal, vertical) {
            if (common.isUndefined(horizontal)) horizontal = true;
            if (common.isUndefined(vertical)) vertical = true;
            elem.style.position = "absolute";
            if (horizontal) {
                elem.style.left = 0;
                elem.style.right = 0;
            }
            if (vertical) {
                elem.style.top = 0;
                elem.style.bottom = 0;
            }
        },
        fakeEvent: function(elem, eventType, params, aux) {
            params = params || {};
            var className = EVENT_MAP_INV[eventType];
            if (!className) {
                throw new Error("Event type " + eventType + " not supported.");
            }
            var evt = document.createEvent(className);
            switch (className) {
              case "MouseEvents":
                var clientX = params.x || params.clientX || 0;
                var clientY = params.y || params.clientY || 0;
                evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0, 0, clientX, clientY, false, false, false, false, 0, null);
                break;

              case "KeyboardEvents":
                var init = evt.initKeyboardEvent || evt.initKeyEvent;
                common.defaults(params, {
                    cancelable: true,
                    ctrlKey: false,
                    altKey: false,
                    shiftKey: false,
                    metaKey: false,
                    keyCode: undefined,
                    charCode: undefined
                });
                init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
                break;

              default:
                evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
                break;
            }
            common.defaults(evt, aux);
            elem.dispatchEvent(evt);
        },
        bind: function(elem, event, func, bool) {
            bool = bool || false;
            if (elem.addEventListener) elem.addEventListener(event, func, bool); else if (elem.attachEvent) elem.attachEvent("on" + event, func);
            return dom;
        },
        unbind: function(elem, event, func, bool) {
            bool = bool || false;
            if (elem.removeEventListener) elem.removeEventListener(event, func, bool); else if (elem.detachEvent) elem.detachEvent("on" + event, func);
            return dom;
        },
        addClass: function(elem, className) {
            if (elem.className === undefined) {
                elem.className = className;
            } else if (elem.className !== className) {
                var classes = elem.className.split(/ +/);
                if (classes.indexOf(className) == -1) {
                    classes.push(className);
                    elem.className = classes.join(" ").replace(/^\s+/, "").replace(/\s+$/, "");
                }
            }
            return dom;
        },
        removeClass: function(elem, className) {
            if (className) {
                if (elem.className === undefined) {} else if (elem.className === className) {
                    elem.removeAttribute("class");
                } else {
                    var classes = elem.className.split(/ +/);
                    var index = classes.indexOf(className);
                    if (index != -1) {
                        classes.splice(index, 1);
                        elem.className = classes.join(" ");
                    }
                }
            } else {
                elem.className = undefined;
            }
            return dom;
        },
        hasClass: function(elem, className) {
            return new RegExp("(?:^|\\s+)" + className + "(?:\\s+|$)").test(elem.className) || false;
        },
        getWidth: function(elem) {
            var style = getComputedStyle(elem);
            return cssValueToPixels(style["border-left-width"]) + cssValueToPixels(style["border-right-width"]) + cssValueToPixels(style["padding-left"]) + cssValueToPixels(style["padding-right"]) + cssValueToPixels(style["width"]);
        },
        getHeight: function(elem) {
            var style = getComputedStyle(elem);
            return cssValueToPixels(style["border-top-width"]) + cssValueToPixels(style["border-bottom-width"]) + cssValueToPixels(style["padding-top"]) + cssValueToPixels(style["padding-bottom"]) + cssValueToPixels(style["height"]);
        },
        getOffset: function(elem) {
            var offset = {
                left: 0,
                top: 0
            };
            if (elem.offsetParent) {
                do {
                    offset.left += elem.offsetLeft;
                    offset.top += elem.offsetTop;
                } while (elem = elem.offsetParent);
            }
            return offset;
        },
        isActive: function(elem) {
            return elem === document.activeElement && (elem.type || elem.href);
        }
    };
    return dom;
}(dat.utils.common);

dat.controllers.OptionController = function(Controller, dom, common) {
    var OptionController = function(object, property, options) {
        OptionController.superclass.call(this, object, property);
        var _this = this;
        this.__select = document.createElement("select");
        if (common.isArray(options)) {
            var map = {};
            common.each(options, function(element) {
                map[element] = element;
            });
            options = map;
        }
        common.each(options, function(value, key) {
            var opt = document.createElement("option");
            opt.innerHTML = key;
            opt.setAttribute("value", value);
            _this.__select.appendChild(opt);
        });
        this.updateDisplay();
        dom.bind(this.__select, "change", function() {
            var desiredValue = this.options[this.selectedIndex].value;
            _this.setValue(desiredValue);
        });
        this.domElement.appendChild(this.__select);
    };
    OptionController.superclass = Controller;
    common.extend(OptionController.prototype, Controller.prototype, {
        setValue: function(v) {
            var toReturn = OptionController.superclass.prototype.setValue.call(this, v);
            if (this.__onFinishChange) {
                this.__onFinishChange.call(this, this.getValue());
            }
            return toReturn;
        },
        updateDisplay: function() {
            this.__select.value = this.getValue();
            return OptionController.superclass.prototype.updateDisplay.call(this);
        }
    });
    return OptionController;
}(dat.controllers.Controller, dat.dom.dom, dat.utils.common);

dat.controllers.NumberController = function(Controller, common) {
    var NumberController = function(object, property, params) {
        NumberController.superclass.call(this, object, property);
        params = params || {};
        this.__min = params.min;
        this.__max = params.max;
        this.__step = params.step;
        if (common.isUndefined(this.__step)) {
            if (this.initialValue == 0) {
                this.__impliedStep = 1;
            } else {
                this.__impliedStep = Math.pow(10, Math.floor(Math.log(this.initialValue) / Math.LN10)) / 10;
            }
        } else {
            this.__impliedStep = this.__step;
        }
        this.__precision = numDecimals(this.__impliedStep);
    };
    NumberController.superclass = Controller;
    common.extend(NumberController.prototype, Controller.prototype, {
        setValue: function(v) {
            if (this.__min !== undefined && v < this.__min) {
                v = this.__min;
            } else if (this.__max !== undefined && v > this.__max) {
                v = this.__max;
            }
            if (this.__step !== undefined && v % this.__step != 0) {
                v = Math.round(v / this.__step) * this.__step;
            }
            return NumberController.superclass.prototype.setValue.call(this, v);
        },
        min: function(v) {
            this.__min = v;
            return this;
        },
        max: function(v) {
            this.__max = v;
            return this;
        },
        step: function(v) {
            this.__step = v;
            this.__impliedStep = v;
            this.__precision = numDecimals(v);
            return this;
        }
    });
    function numDecimals(x) {
        x = x.toString();
        if (x.indexOf(".") > -1) {
            return x.length - x.indexOf(".") - 1;
        } else {
            return 0;
        }
    }
    return NumberController;
}(dat.controllers.Controller, dat.utils.common);

dat.controllers.NumberControllerBox = function(NumberController, dom, common) {
    var NumberControllerBox = function(object, property, params) {
        this.__truncationSuspended = false;
        NumberControllerBox.superclass.call(this, object, property, params);
        var _this = this;
        var prev_y;
        this.__input = document.createElement("input");
        this.__input.setAttribute("type", "text");
        dom.bind(this.__input, "change", onChange);
        dom.bind(this.__input, "blur", onBlur);
        dom.bind(this.__input, "mousedown", onMouseDown);
        dom.bind(this.__input, "keydown", function(e) {
            if (e.keyCode === 13) {
                _this.__truncationSuspended = true;
                this.blur();
                _this.__truncationSuspended = false;
            }
        });
        function onChange() {
            var attempted = parseFloat(_this.__input.value);
            if (!common.isNaN(attempted)) _this.setValue(attempted);
        }
        function onBlur() {
            onChange();
            if (_this.__onFinishChange) {
                _this.__onFinishChange.call(_this, _this.getValue());
            }
        }
        function onMouseDown(e) {
            dom.bind(window, "mousemove", onMouseDrag);
            dom.bind(window, "mouseup", onMouseUp);
            prev_y = e.clientY;
        }
        function onMouseDrag(e) {
            var diff = prev_y - e.clientY;
            _this.setValue(_this.getValue() + diff * _this.__impliedStep);
            prev_y = e.clientY;
        }
        function onMouseUp() {
            dom.unbind(window, "mousemove", onMouseDrag);
            dom.unbind(window, "mouseup", onMouseUp);
        }
        this.updateDisplay();
        this.domElement.appendChild(this.__input);
    };
    NumberControllerBox.superclass = NumberController;
    common.extend(NumberControllerBox.prototype, NumberController.prototype, {
        updateDisplay: function() {
            this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
            return NumberControllerBox.superclass.prototype.updateDisplay.call(this);
        }
    });
    function roundToDecimal(value, decimals) {
        var tenTo = Math.pow(10, decimals);
        return Math.round(value * tenTo) / tenTo;
    }
    return NumberControllerBox;
}(dat.controllers.NumberController, dat.dom.dom, dat.utils.common);

dat.controllers.NumberControllerSlider = function(NumberController, dom, css, common, styleSheet) {
    var NumberControllerSlider = function(object, property, min, max, step) {
        NumberControllerSlider.superclass.call(this, object, property, {
            min: min,
            max: max,
            step: step
        });
        var _this = this;
        this.__background = document.createElement("div");
        this.__foreground = document.createElement("div");
        dom.bind(this.__background, "mousedown", onMouseDown);
        dom.addClass(this.__background, "slider");
        dom.addClass(this.__foreground, "slider-fg");
        function onMouseDown(e) {
            dom.bind(window, "mousemove", onMouseDrag);
            dom.bind(window, "mouseup", onMouseUp);
            onMouseDrag(e);
        }
        function onMouseDrag(e) {
            e.preventDefault();
            var offset = dom.getOffset(_this.__background);
            var width = dom.getWidth(_this.__background);
            _this.setValue(map(e.clientX, offset.left, offset.left + width, _this.__min, _this.__max));
            return false;
        }
        function onMouseUp() {
            dom.unbind(window, "mousemove", onMouseDrag);
            dom.unbind(window, "mouseup", onMouseUp);
            if (_this.__onFinishChange) {
                _this.__onFinishChange.call(_this, _this.getValue());
            }
        }
        this.updateDisplay();
        this.__background.appendChild(this.__foreground);
        this.domElement.appendChild(this.__background);
    };
    NumberControllerSlider.superclass = NumberController;
    NumberControllerSlider.useDefaultStyles = function() {
        css.inject(styleSheet);
    };
    common.extend(NumberControllerSlider.prototype, NumberController.prototype, {
        updateDisplay: function() {
            var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
            this.__foreground.style.width = pct * 100 + "%";
            return NumberControllerSlider.superclass.prototype.updateDisplay.call(this);
        }
    });
    function map(v, i1, i2, o1, o2) {
        return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
    }
    return NumberControllerSlider;
}(dat.controllers.NumberController, dat.dom.dom, dat.utils.css, dat.utils.common, "/**\n * dat-gui JavaScript Controller Library\n * http://code.google.com/p/dat-gui\n *\n * Copyright 2011 Data Arts Team, Google Creative Lab\n *\n * Licensed under the Apache License, Version 2.0 (the \"License\");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n * http://www.apache.org/licenses/LICENSE-2.0\n */\n\n.slider {\n  box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);\n  height: 1em;\n  border-radius: 1em;\n  background-color: #eee;\n  padding: 0 0.5em;\n  overflow: hidden;\n}\n\n.slider-fg {\n  padding: 1px 0 2px 0;\n  background-color: #aaa;\n  height: 1em;\n  margin-left: -0.5em;\n  padding-right: 0.5em;\n  border-radius: 1em 0 0 1em;\n}\n\n.slider-fg:after {\n  display: inline-block;\n  border-radius: 1em;\n  background-color: #fff;\n  border:  1px solid #aaa;\n  content: '';\n  float: right;\n  margin-right: -1em;\n  margin-top: -1px;\n  height: 0.9em;\n  width: 0.9em;\n}");

dat.controllers.FunctionController = function(Controller, dom, common) {
    var FunctionController = function(object, property, text) {
        FunctionController.superclass.call(this, object, property);
        var _this = this;
        this.__button = document.createElement("div");
        this.__button.innerHTML = text === undefined ? "Fire" : text;
        dom.bind(this.__button, "click", function(e) {
            e.preventDefault();
            _this.fire();
            return false;
        });
        dom.addClass(this.__button, "button");
        this.domElement.appendChild(this.__button);
    };
    FunctionController.superclass = Controller;
    common.extend(FunctionController.prototype, Controller.prototype, {
        fire: function() {
            if (this.__onChange) {
                this.__onChange.call(this);
            }
            if (this.__onFinishChange) {
                this.__onFinishChange.call(this, this.getValue());
            }
            this.getValue().call(this.object);
        }
    });
    return FunctionController;
}(dat.controllers.Controller, dat.dom.dom, dat.utils.common);

dat.controllers.BooleanController = function(Controller, dom, common) {
    var BooleanController = function(object, property) {
        BooleanController.superclass.call(this, object, property);
        var _this = this;
        this.__prev = this.getValue();
        this.__checkbox = document.createElement("input");
        this.__checkbox.setAttribute("type", "checkbox");
        dom.bind(this.__checkbox, "change", onChange, false);
        this.domElement.appendChild(this.__checkbox);
        this.updateDisplay();
        function onChange() {
            _this.setValue(!_this.__prev);
        }
    };
    BooleanController.superclass = Controller;
    common.extend(BooleanController.prototype, Controller.prototype, {
        setValue: function(v) {
            var toReturn = BooleanController.superclass.prototype.setValue.call(this, v);
            if (this.__onFinishChange) {
                this.__onFinishChange.call(this, this.getValue());
            }
            this.__prev = this.getValue();
            return toReturn;
        },
        updateDisplay: function() {
            if (this.getValue() === true) {
                this.__checkbox.setAttribute("checked", "checked");
                this.__checkbox.checked = true;
            } else {
                this.__checkbox.checked = false;
            }
            return BooleanController.superclass.prototype.updateDisplay.call(this);
        }
    });
    return BooleanController;
}(dat.controllers.Controller, dat.dom.dom, dat.utils.common);

dat.color.toString = function(common) {
    return function(color) {
        if (color.a == 1 || common.isUndefined(color.a)) {
            var s = color.hex.toString(16);
            while (s.length < 6) {
                s = "0" + s;
            }
            return "#" + s;
        } else {
            return "rgba(" + Math.round(color.r) + "," + Math.round(color.g) + "," + Math.round(color.b) + "," + color.a + ")";
        }
    };
}(dat.utils.common);

dat.color.interpret = function(toString, common) {
    var result, toReturn;
    var interpret = function() {
        toReturn = false;
        var original = arguments.length > 1 ? common.toArray(arguments) : arguments[0];
        common.each(INTERPRETATIONS, function(family) {
            if (family.litmus(original)) {
                common.each(family.conversions, function(conversion, conversionName) {
                    result = conversion.read(original);
                    if (toReturn === false && result !== false) {
                        toReturn = result;
                        result.conversionName = conversionName;
                        result.conversion = conversion;
                        return common.BREAK;
                    }
                });
                return common.BREAK;
            }
        });
        return toReturn;
    };
    var INTERPRETATIONS = [ {
        litmus: common.isString,
        conversions: {
            THREE_CHAR_HEX: {
                read: function(original) {
                    var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
                    if (test === null) return false;
                    return {
                        space: "HEX",
                        hex: parseInt("0x" + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString())
                    };
                },
                write: toString
            },
            SIX_CHAR_HEX: {
                read: function(original) {
                    var test = original.match(/^#([A-F0-9]{6})$/i);
                    if (test === null) return false;
                    return {
                        space: "HEX",
                        hex: parseInt("0x" + test[1].toString())
                    };
                },
                write: toString
            },
            CSS_RGB: {
                read: function(original) {
                    var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
                    if (test === null) return false;
                    return {
                        space: "RGB",
                        r: parseFloat(test[1]),
                        g: parseFloat(test[2]),
                        b: parseFloat(test[3])
                    };
                },
                write: toString
            },
            CSS_RGBA: {
                read: function(original) {
                    var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\,\s*(.+)\s*\)/);
                    if (test === null) return false;
                    return {
                        space: "RGB",
                        r: parseFloat(test[1]),
                        g: parseFloat(test[2]),
                        b: parseFloat(test[3]),
                        a: parseFloat(test[4])
                    };
                },
                write: toString
            }
        }
    }, {
        litmus: common.isNumber,
        conversions: {
            HEX: {
                read: function(original) {
                    return {
                        space: "HEX",
                        hex: original,
                        conversionName: "HEX"
                    };
                },
                write: function(color) {
                    return color.hex;
                }
            }
        }
    }, {
        litmus: common.isArray,
        conversions: {
            RGB_ARRAY: {
                read: function(original) {
                    if (original.length != 3) return false;
                    return {
                        space: "RGB",
                        r: original[0],
                        g: original[1],
                        b: original[2]
                    };
                },
                write: function(color) {
                    return [ color.r, color.g, color.b ];
                }
            },
            RGBA_ARRAY: {
                read: function(original) {
                    if (original.length != 4) return false;
                    return {
                        space: "RGB",
                        r: original[0],
                        g: original[1],
                        b: original[2],
                        a: original[3]
                    };
                },
                write: function(color) {
                    return [ color.r, color.g, color.b, color.a ];
                }
            }
        }
    }, {
        litmus: common.isObject,
        conversions: {
            RGBA_OBJ: {
                read: function(original) {
                    if (common.isNumber(original.r) && common.isNumber(original.g) && common.isNumber(original.b) && common.isNumber(original.a)) {
                        return {
                            space: "RGB",
                            r: original.r,
                            g: original.g,
                            b: original.b,
                            a: original.a
                        };
                    }
                    return false;
                },
                write: function(color) {
                    return {
                        r: color.r,
                        g: color.g,
                        b: color.b,
                        a: color.a
                    };
                }
            },
            RGB_OBJ: {
                read: function(original) {
                    if (common.isNumber(original.r) && common.isNumber(original.g) && common.isNumber(original.b)) {
                        return {
                            space: "RGB",
                            r: original.r,
                            g: original.g,
                            b: original.b
                        };
                    }
                    return false;
                },
                write: function(color) {
                    return {
                        r: color.r,
                        g: color.g,
                        b: color.b
                    };
                }
            },
            HSVA_OBJ: {
                read: function(original) {
                    if (common.isNumber(original.h) && common.isNumber(original.s) && common.isNumber(original.v) && common.isNumber(original.a)) {
                        return {
                            space: "HSV",
                            h: original.h,
                            s: original.s,
                            v: original.v,
                            a: original.a
                        };
                    }
                    return false;
                },
                write: function(color) {
                    return {
                        h: color.h,
                        s: color.s,
                        v: color.v,
                        a: color.a
                    };
                }
            },
            HSV_OBJ: {
                read: function(original) {
                    if (common.isNumber(original.h) && common.isNumber(original.s) && common.isNumber(original.v)) {
                        return {
                            space: "HSV",
                            h: original.h,
                            s: original.s,
                            v: original.v
                        };
                    }
                    return false;
                },
                write: function(color) {
                    return {
                        h: color.h,
                        s: color.s,
                        v: color.v
                    };
                }
            }
        }
    } ];
    return interpret;
}(dat.color.toString, dat.utils.common);

dat.GUI = dat.gui.GUI = function(css, saveDialogueContents, styleSheet, controllerFactory, Controller, BooleanController, FunctionController, NumberControllerBox, NumberControllerSlider, OptionController, ColorController, requestAnimationFrame, CenteredDiv, dom, common) {
    css.inject(styleSheet);
    var CSS_NAMESPACE = "dg";
    var HIDE_KEY_CODE = 72;
    var CLOSE_BUTTON_HEIGHT = 20;
    var DEFAULT_DEFAULT_PRESET_NAME = "Default";
    var SUPPORTS_LOCAL_STORAGE = function() {
        try {
            return "localStorage" in window && window["localStorage"] !== null;
        } catch (e) {
            return false;
        }
    }();
    var SAVE_DIALOGUE;
    var auto_place_virgin = true;
    var auto_place_container;
    var hide = false;
    var hideable_guis = [];
    var GUI = function(params) {
        var _this = this;
        this.domElement = document.createElement("div");
        this.__ul = document.createElement("ul");
        this.domElement.appendChild(this.__ul);
        dom.addClass(this.domElement, CSS_NAMESPACE);
        this.__folders = {};
        this.__controllers = [];
        this.__rememberedObjects = [];
        this.__rememberedObjectIndecesToControllers = [];
        this.__listening = [];
        params = params || {};
        params = common.defaults(params, {
            autoPlace: true,
            width: GUI.DEFAULT_WIDTH
        });
        params = common.defaults(params, {
            resizable: params.autoPlace,
            hideable: params.autoPlace
        });
        if (!common.isUndefined(params.load)) {
            if (params.preset) params.load.preset = params.preset;
        } else {
            params.load = {
                preset: DEFAULT_DEFAULT_PRESET_NAME
            };
        }
        if (common.isUndefined(params.parent) && params.hideable) {
            hideable_guis.push(this);
        }
        params.resizable = common.isUndefined(params.parent) && params.resizable;
        if (params.autoPlace && common.isUndefined(params.scrollable)) {
            params.scrollable = true;
        }
        var use_local_storage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, "isLocal")) === "true";
        var saveToLocalStorage;
        Object.defineProperties(this, {
            parent: {
                get: function() {
                    return params.parent;
                }
            },
            scrollable: {
                get: function() {
                    return params.scrollable;
                }
            },
            autoPlace: {
                get: function() {
                    return params.autoPlace;
                }
            },
            preset: {
                get: function() {
                    if (_this.parent) {
                        return _this.getRoot().preset;
                    } else {
                        return params.load.preset;
                    }
                },
                set: function(v) {
                    if (_this.parent) {
                        _this.getRoot().preset = v;
                    } else {
                        params.load.preset = v;
                    }
                    setPresetSelectIndex(this);
                    _this.revert();
                }
            },
            width: {
                get: function() {
                    return params.width;
                },
                set: function(v) {
                    params.width = v;
                    setWidth(_this, v);
                }
            },
            name: {
                get: function() {
                    return params.name;
                },
                set: function(v) {
                    params.name = v;
                    if (title_row_name) {
                        title_row_name.innerHTML = params.name;
                    }
                }
            },
            closed: {
                get: function() {
                    return params.closed;
                },
                set: function(v) {
                    params.closed = v;
                    if (params.closed) {
                        dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
                    } else {
                        dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
                    }
                    this.onResize();
                    if (_this.__closeButton) {
                        _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
                    }
                }
            },
            load: {
                get: function() {
                    return params.load;
                }
            },
            useLocalStorage: {
                get: function() {
                    return use_local_storage;
                },
                set: function(bool) {
                    if (SUPPORTS_LOCAL_STORAGE) {
                        use_local_storage = bool;
                        if (bool) {
                            dom.bind(window, "unload", saveToLocalStorage);
                        } else {
                            dom.unbind(window, "unload", saveToLocalStorage);
                        }
                        localStorage.setItem(getLocalStorageHash(_this, "isLocal"), bool);
                    }
                }
            }
        });
        if (common.isUndefined(params.parent)) {
            params.closed = false;
            dom.addClass(this.domElement, GUI.CLASS_MAIN);
            dom.makeSelectable(this.domElement, false);
            if (SUPPORTS_LOCAL_STORAGE) {
                if (use_local_storage) {
                    _this.useLocalStorage = true;
                    var saved_gui = localStorage.getItem(getLocalStorageHash(this, "gui"));
                    if (saved_gui) {
                        params.load = JSON.parse(saved_gui);
                    }
                }
            }
            this.__closeButton = document.createElement("div");
            this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
            dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
            this.domElement.appendChild(this.__closeButton);
            dom.bind(this.__closeButton, "click", function() {
                _this.closed = !_this.closed;
            });
        } else {
            if (params.closed === undefined) {
                params.closed = true;
            }
            var title_row_name = document.createTextNode(params.name);
            dom.addClass(title_row_name, "controller-name");
            var title_row = addRow(_this, title_row_name);
            var on_click_title = function(e) {
                e.preventDefault();
                _this.closed = !_this.closed;
                return false;
            };
            dom.addClass(this.__ul, GUI.CLASS_CLOSED);
            dom.addClass(title_row, "title");
            dom.bind(title_row, "click", on_click_title);
            if (!params.closed) {
                this.closed = false;
            }
        }
        if (params.autoPlace) {
            if (common.isUndefined(params.parent)) {
                if (auto_place_virgin) {
                    auto_place_container = document.createElement("div");
                    dom.addClass(auto_place_container, CSS_NAMESPACE);
                    dom.addClass(auto_place_container, GUI.CLASS_AUTO_PLACE_CONTAINER);
                    document.body.appendChild(auto_place_container);
                    auto_place_virgin = false;
                }
                auto_place_container.appendChild(this.domElement);
                dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
            }
            if (!this.parent) setWidth(_this, params.width);
        }
        dom.bind(window, "resize", function() {
            _this.onResize();
        });
        dom.bind(this.__ul, "webkitTransitionEnd", function() {
            _this.onResize();
        });
        dom.bind(this.__ul, "transitionend", function() {
            _this.onResize();
        });
        dom.bind(this.__ul, "oTransitionEnd", function() {
            _this.onResize();
        });
        this.onResize();
        if (params.resizable) {
            addResizeHandle(this);
        }
        saveToLocalStorage = function() {
            if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, "isLocal")) === "true") {
                localStorage.setItem(getLocalStorageHash(_this, "gui"), JSON.stringify(_this.getSaveObject()));
            }
        };
        this.saveToLocalStorageIfPossible = saveToLocalStorage;
        var root = _this.getRoot();
        function resetWidth() {
            var root = _this.getRoot();
            root.width += 1;
            common.defer(function() {
                root.width -= 1;
            });
        }
        if (!params.parent) {
            resetWidth();
        }
    };
    GUI.toggleHide = function() {
        hide = !hide;
        common.each(hideable_guis, function(gui) {
            gui.domElement.style.zIndex = hide ? -999 : 999;
            gui.domElement.style.opacity = hide ? 0 : 1;
        });
    };
    GUI.CLASS_AUTO_PLACE = "a";
    GUI.CLASS_AUTO_PLACE_CONTAINER = "ac";
    GUI.CLASS_MAIN = "main";
    GUI.CLASS_CONTROLLER_ROW = "cr";
    GUI.CLASS_TOO_TALL = "taller-than-window";
    GUI.CLASS_CLOSED = "closed";
    GUI.CLASS_CLOSE_BUTTON = "close-button";
    GUI.CLASS_DRAG = "drag";
    GUI.DEFAULT_WIDTH = 245;
    GUI.TEXT_CLOSED = "Close Controls";
    GUI.TEXT_OPEN = "Open Controls";
    dom.bind(window, "keydown", function(e) {
        if (document.activeElement.type !== "text" && (e.which === HIDE_KEY_CODE || e.keyCode == HIDE_KEY_CODE)) {
            GUI.toggleHide();
        }
    }, false);
    common.extend(GUI.prototype, {
        add: function(object, property) {
            return add(this, object, property, {
                factoryArgs: Array.prototype.slice.call(arguments, 2)
            });
        },
        addColor: function(object, property) {
            return add(this, object, property, {
                color: true
            });
        },
        remove: function(controller) {
            this.__ul.removeChild(controller.__li);
            this.__controllers.slice(this.__controllers.indexOf(controller), 1);
            var _this = this;
            common.defer(function() {
                _this.onResize();
            });
        },
        destroy: function() {
            if (this.autoPlace) {
                auto_place_container.removeChild(this.domElement);
            }
        },
        addFolder: function(name) {
            if (this.__folders[name] !== undefined) {
                throw new Error("You already have a folder in this GUI by the" + ' name "' + name + '"');
            }
            var new_gui_params = {
                name: name,
                parent: this
            };
            new_gui_params.autoPlace = this.autoPlace;
            if (this.load && this.load.folders && this.load.folders[name]) {
                new_gui_params.closed = this.load.folders[name].closed;
                new_gui_params.load = this.load.folders[name];
            }
            var gui = new GUI(new_gui_params);
            this.__folders[name] = gui;
            var li = addRow(this, gui.domElement);
            dom.addClass(li, "folder");
            return gui;
        },
        open: function() {
            this.closed = false;
        },
        close: function() {
            this.closed = true;
        },
        onResize: function() {
            var root = this.getRoot();
            if (root.scrollable) {
                var top = dom.getOffset(root.__ul).top;
                var h = 0;
                common.each(root.__ul.childNodes, function(node) {
                    if (!(root.autoPlace && node === root.__save_row)) h += dom.getHeight(node);
                });
                if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
                    dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
                    root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + "px";
                } else {
                    dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
                    root.__ul.style.height = "auto";
                }
            }
            if (root.__resize_handle) {
                common.defer(function() {
                    root.__resize_handle.style.height = root.__ul.offsetHeight + "px";
                });
            }
            if (root.__closeButton) {
                root.__closeButton.style.width = root.width + "px";
            }
        },
        remember: function() {
            if (common.isUndefined(SAVE_DIALOGUE)) {
                SAVE_DIALOGUE = new CenteredDiv();
                SAVE_DIALOGUE.domElement.innerHTML = saveDialogueContents;
            }
            if (this.parent) {
                throw new Error("You can only call remember on a top level GUI.");
            }
            var _this = this;
            common.each(Array.prototype.slice.call(arguments), function(object) {
                if (_this.__rememberedObjects.length == 0) {
                    addSaveMenu(_this);
                }
                if (_this.__rememberedObjects.indexOf(object) == -1) {
                    _this.__rememberedObjects.push(object);
                }
            });
            if (this.autoPlace) {
                setWidth(this, this.width);
            }
        },
        getRoot: function() {
            var gui = this;
            while (gui.parent) {
                gui = gui.parent;
            }
            return gui;
        },
        getSaveObject: function() {
            var toReturn = this.load;
            toReturn.closed = this.closed;
            if (this.__rememberedObjects.length > 0) {
                toReturn.preset = this.preset;
                if (!toReturn.remembered) {
                    toReturn.remembered = {};
                }
                toReturn.remembered[this.preset] = getCurrentPreset(this);
            }
            toReturn.folders = {};
            common.each(this.__folders, function(element, key) {
                toReturn.folders[key] = element.getSaveObject();
            });
            return toReturn;
        },
        save: function() {
            if (!this.load.remembered) {
                this.load.remembered = {};
            }
            this.load.remembered[this.preset] = getCurrentPreset(this);
            markPresetModified(this, false);
            this.saveToLocalStorageIfPossible();
        },
        saveAs: function(presetName) {
            if (!this.load.remembered) {
                this.load.remembered = {};
                this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
            }
            this.load.remembered[presetName] = getCurrentPreset(this);
            this.preset = presetName;
            addPresetOption(this, presetName, true);
            this.saveToLocalStorageIfPossible();
        },
        revert: function(gui) {
            common.each(this.__controllers, function(controller) {
                if (!this.getRoot().load.remembered) {
                    controller.setValue(controller.initialValue);
                } else {
                    recallSavedValue(gui || this.getRoot(), controller);
                }
            }, this);
            common.each(this.__folders, function(folder) {
                folder.revert(folder);
            });
            if (!gui) {
                markPresetModified(this.getRoot(), false);
            }
        },
        listen: function(controller) {
            var init = this.__listening.length == 0;
            this.__listening.push(controller);
            if (init) updateDisplays(this.__listening);
        }
    });
    function add(gui, object, property, params) {
        if (object[property] === undefined) {
            throw new Error("Object " + object + ' has no property "' + property + '"');
        }
        var controller;
        if (params.color) {
            controller = new ColorController(object, property);
        } else {
            var factoryArgs = [ object, property ].concat(params.factoryArgs);
            controller = controllerFactory.apply(gui, factoryArgs);
        }
        if (params.before instanceof Controller) {
            params.before = params.before.__li;
        }
        recallSavedValue(gui, controller);
        dom.addClass(controller.domElement, "c");
        var name = document.createElement("span");
        dom.addClass(name, "property-name");
        name.innerHTML = controller.property;
        var container = document.createElement("div");
        container.appendChild(name);
        container.appendChild(controller.domElement);
        var li = addRow(gui, container, params.before);
        dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
        dom.addClass(li, typeof controller.getValue());
        augmentController(gui, li, controller);
        gui.__controllers.push(controller);
        return controller;
    }
    function addRow(gui, dom, liBefore) {
        var li = document.createElement("li");
        if (dom) li.appendChild(dom);
        if (liBefore) {
            gui.__ul.insertBefore(li, params.before);
        } else {
            gui.__ul.appendChild(li);
        }
        gui.onResize();
        return li;
    }
    function augmentController(gui, li, controller) {
        controller.__li = li;
        controller.__gui = gui;
        common.extend(controller, {
            options: function(options) {
                if (arguments.length > 1) {
                    controller.remove();
                    return add(gui, controller.object, controller.property, {
                        before: controller.__li.nextElementSibling,
                        factoryArgs: [ common.toArray(arguments) ]
                    });
                }
                if (common.isArray(options) || common.isObject(options)) {
                    controller.remove();
                    return add(gui, controller.object, controller.property, {
                        before: controller.__li.nextElementSibling,
                        factoryArgs: [ options ]
                    });
                }
            },
            name: function(v) {
                controller.__li.firstElementChild.firstElementChild.innerHTML = v;
                return controller;
            },
            listen: function() {
                controller.__gui.listen(controller);
                return controller;
            },
            remove: function() {
                controller.__gui.remove(controller);
                return controller;
            }
        });
        if (controller instanceof NumberControllerSlider) {
            var box = new NumberControllerBox(controller.object, controller.property, {
                min: controller.__min,
                max: controller.__max,
                step: controller.__step
            });
            common.each([ "updateDisplay", "onChange", "onFinishChange" ], function(method) {
                var pc = controller[method];
                var pb = box[method];
                controller[method] = box[method] = function() {
                    var args = Array.prototype.slice.call(arguments);
                    pc.apply(controller, args);
                    return pb.apply(box, args);
                };
            });
            dom.addClass(li, "has-slider");
            controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
        } else if (controller instanceof NumberControllerBox) {
            var r = function(returned) {
                if (common.isNumber(controller.__min) && common.isNumber(controller.__max)) {
                    controller.remove();
                    return add(gui, controller.object, controller.property, {
                        before: controller.__li.nextElementSibling,
                        factoryArgs: [ controller.__min, controller.__max, controller.__step ]
                    });
                }
                return returned;
            };
            controller.min = common.compose(r, controller.min);
            controller.max = common.compose(r, controller.max);
        } else if (controller instanceof BooleanController) {
            dom.bind(li, "click", function() {
                dom.fakeEvent(controller.__checkbox, "click");
            });
            dom.bind(controller.__checkbox, "click", function(e) {
                e.stopPropagation();
            });
        } else if (controller instanceof FunctionController) {
            dom.bind(li, "click", function() {
                dom.fakeEvent(controller.__button, "click");
            });
            dom.bind(li, "mouseover", function() {
                dom.addClass(controller.__button, "hover");
            });
            dom.bind(li, "mouseout", function() {
                dom.removeClass(controller.__button, "hover");
            });
        } else if (controller instanceof ColorController) {
            dom.addClass(li, "color");
            controller.updateDisplay = common.compose(function(r) {
                li.style.borderLeftColor = controller.__color.toString();
                return r;
            }, controller.updateDisplay);
            controller.updateDisplay();
        }
        controller.setValue = common.compose(function(r) {
            if (gui.getRoot().__preset_select && controller.isModified()) {
                markPresetModified(gui.getRoot(), true);
            }
            return r;
        }, controller.setValue);
    }
    function recallSavedValue(gui, controller) {
        var root = gui.getRoot();
        var matched_index = root.__rememberedObjects.indexOf(controller.object);
        if (matched_index != -1) {
            var controller_map = root.__rememberedObjectIndecesToControllers[matched_index];
            if (controller_map === undefined) {
                controller_map = {};
                root.__rememberedObjectIndecesToControllers[matched_index] = controller_map;
            }
            controller_map[controller.property] = controller;
            if (root.load && root.load.remembered) {
                var preset_map = root.load.remembered;
                var preset;
                if (preset_map[gui.preset]) {
                    preset = preset_map[gui.preset];
                } else if (preset_map[DEFAULT_DEFAULT_PRESET_NAME]) {
                    preset = preset_map[DEFAULT_DEFAULT_PRESET_NAME];
                } else {
                    return;
                }
                if (preset[matched_index] && preset[matched_index][controller.property] !== undefined) {
                    var value = preset[matched_index][controller.property];
                    controller.initialValue = value;
                    controller.setValue(value);
                }
            }
        }
    }
    function getLocalStorageHash(gui, key) {
        return document.location.href + "." + key;
    }
    function addSaveMenu(gui) {
        var div = gui.__save_row = document.createElement("li");
        dom.addClass(gui.domElement, "has-save");
        gui.__ul.insertBefore(div, gui.__ul.firstChild);
        dom.addClass(div, "save-row");
        var gears = document.createElement("span");
        gears.innerHTML = "&nbsp;";
        dom.addClass(gears, "button gears");
        var button = document.createElement("span");
        button.innerHTML = "Save";
        dom.addClass(button, "button");
        dom.addClass(button, "save");
        var button2 = document.createElement("span");
        button2.innerHTML = "New";
        dom.addClass(button2, "button");
        dom.addClass(button2, "save-as");
        var button3 = document.createElement("span");
        button3.innerHTML = "Revert";
        dom.addClass(button3, "button");
        dom.addClass(button3, "revert");
        var select = gui.__preset_select = document.createElement("select");
        if (gui.load && gui.load.remembered) {
            common.each(gui.load.remembered, function(value, key) {
                addPresetOption(gui, key, key == gui.preset);
            });
        } else {
            addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
        }
        dom.bind(select, "change", function() {
            for (var index = 0; index < gui.__preset_select.length; index++) {
                gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
            }
            gui.preset = this.value;
        });
        div.appendChild(select);
        div.appendChild(gears);
        div.appendChild(button);
        div.appendChild(button2);
        div.appendChild(button3);
        if (SUPPORTS_LOCAL_STORAGE) {
            var saveLocally = document.getElementById("dg-save-locally");
            var explain = document.getElementById("dg-local-explain");
            saveLocally.style.display = "block";
            var localStorageCheckBox = document.getElementById("dg-local-storage");
            if (localStorage.getItem(getLocalStorageHash(gui, "isLocal")) === "true") {
                localStorageCheckBox.setAttribute("checked", "checked");
            }
            function showHideExplain() {
                explain.style.display = gui.useLocalStorage ? "block" : "none";
            }
            showHideExplain();
            dom.bind(localStorageCheckBox, "change", function() {
                gui.useLocalStorage = !gui.useLocalStorage;
                showHideExplain();
            });
        }
        var newConstructorTextArea = document.getElementById("dg-new-constructor");
        dom.bind(newConstructorTextArea, "keydown", function(e) {
            if (e.metaKey && (e.which === 67 || e.keyCode == 67)) {
                SAVE_DIALOGUE.hide();
            }
        });
        dom.bind(gears, "click", function() {
            newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
            SAVE_DIALOGUE.show();
            newConstructorTextArea.focus();
            newConstructorTextArea.select();
        });
        dom.bind(button, "click", function() {
            gui.save();
        });
        dom.bind(button2, "click", function() {
            var presetName = prompt("Enter a new preset name.");
            if (presetName) gui.saveAs(presetName);
        });
        dom.bind(button3, "click", function() {
            gui.revert();
        });
    }
    function addResizeHandle(gui) {
        gui.__resize_handle = document.createElement("div");
        common.extend(gui.__resize_handle.style, {
            width: "6px",
            marginLeft: "-3px",
            height: "200px",
            cursor: "ew-resize",
            position: "absolute"
        });
        var pmouseX;
        dom.bind(gui.__resize_handle, "mousedown", dragStart);
        dom.bind(gui.__closeButton, "mousedown", dragStart);
        gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
        function dragStart(e) {
            e.preventDefault();
            pmouseX = e.clientX;
            dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
            dom.bind(window, "mousemove", drag);
            dom.bind(window, "mouseup", dragStop);
            return false;
        }
        function drag(e) {
            e.preventDefault();
            gui.width += pmouseX - e.clientX;
            gui.onResize();
            pmouseX = e.clientX;
            return false;
        }
        function dragStop() {
            dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
            dom.unbind(window, "mousemove", drag);
            dom.unbind(window, "mouseup", dragStop);
        }
    }
    function setWidth(gui, w) {
        gui.domElement.style.width = w + "px";
        if (gui.__save_row && gui.autoPlace) {
            gui.__save_row.style.width = w + "px";
        }
        if (gui.__closeButton) {
            gui.__closeButton.style.width = w + "px";
        }
    }
    function getCurrentPreset(gui, useInitialValues) {
        var toReturn = {};
        common.each(gui.__rememberedObjects, function(val, index) {
            var saved_values = {};
            var controller_map = gui.__rememberedObjectIndecesToControllers[index];
            common.each(controller_map, function(controller, property) {
                saved_values[property] = useInitialValues ? controller.initialValue : controller.getValue();
            });
            toReturn[index] = saved_values;
        });
        return toReturn;
    }
    function addPresetOption(gui, name, setSelected) {
        var opt = document.createElement("option");
        opt.innerHTML = name;
        opt.value = name;
        gui.__preset_select.appendChild(opt);
        if (setSelected) {
            gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
        }
    }
    function setPresetSelectIndex(gui) {
        for (var index = 0; index < gui.__preset_select.length; index++) {
            if (gui.__preset_select[index].value == gui.preset) {
                gui.__preset_select.selectedIndex = index;
            }
        }
    }
    function markPresetModified(gui, modified) {
        var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
        if (modified) {
            opt.innerHTML = opt.value + "*";
        } else {
            opt.innerHTML = opt.value;
        }
    }
    function updateDisplays(controllerArray) {
        if (controllerArray.length != 0) {
            requestAnimationFrame(function() {
                updateDisplays(controllerArray);
            });
        }
        common.each(controllerArray, function(c) {
            c.updateDisplay();
        });
    }
    return GUI;
}(dat.utils.css, '<div id="dg-save" class="dg dialogue">\n\n  Here\'s the new load parameter for your <code>GUI</code>\'s constructor:\n\n  <textarea id="dg-new-constructor"></textarea>\n\n  <div id="dg-save-locally">\n\n    <input id="dg-local-storage" type="checkbox"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id="dg-local-explain">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>\'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n      \n    </div>\n    \n  </div>\n\n</div>', ".dg {\n  /** Clear list styles */\n  /* Auto-place container */\n  /* Auto-placed GUI's */\n  /* Line items that don't contain folders. */\n  /** Folder names */\n  /** Hides closed items */\n  /** Controller row */\n  /** Name-half (left) */\n  /** Controller-half (right) */\n  /** Controller placement */\n  /** Shorter number boxes when slider is present. */\n  /** Ensure the entire boolean and function row shows a hand */ }\n  .dg ul {\n    list-style: none;\n    margin: 0;\n    padding: 0;\n    width: 100%;\n    clear: both; }\n  .dg.ac {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    height: 0;\n    z-index: 0; }\n  .dg:not(.ac) .main {\n    /** Exclude mains in ac so that we don't hide close button */\n    overflow: hidden; }\n  .dg.main {\n    -webkit-transition: opacity 0.1s linear;\n    -o-transition: opacity 0.1s linear;\n    -moz-transition: opacity 0.1s linear;\n    transition: opacity 0.1s linear; }\n    .dg.main.taller-than-window {\n      overflow-y: auto; }\n      .dg.main.taller-than-window .close-button {\n        opacity: 1;\n        /* TODO, these are style notes */\n        margin-top: -1px;\n        border-top: 1px solid #2c2c2c; }\n    .dg.main ul.closed .close-button {\n      opacity: 1 !important; }\n    .dg.main:hover .close-button,\n    .dg.main .close-button.drag {\n      opacity: 1; }\n    .dg.main .close-button {\n      /*opacity: 0;*/\n      -webkit-transition: opacity 0.1s linear;\n      -o-transition: opacity 0.1s linear;\n      -moz-transition: opacity 0.1s linear;\n      transition: opacity 0.1s linear;\n      border: 0;\n      position: absolute;\n      line-height: 19px;\n      height: 20px;\n      /* TODO, these are style notes */\n      cursor: pointer;\n      text-align: center;\n      background-color: #000; }\n      .dg.main .close-button:hover {\n        background-color: #111; }\n  .dg.a {\n    float: right;\n    margin-right: 15px;\n    overflow-x: hidden; }\n    .dg.a.has-save > ul {\n      margin-top: 27px; }\n      .dg.a.has-save > ul.closed {\n        margin-top: 0; }\n    .dg.a .save-row {\n      position: fixed;\n      top: 0;\n      z-index: 1002; }\n  .dg li {\n    -webkit-transition: height 0.1s ease-out;\n    -o-transition: height 0.1s ease-out;\n    -moz-transition: height 0.1s ease-out;\n    transition: height 0.1s ease-out; }\n  .dg li:not(.folder) {\n    cursor: auto;\n    height: 27px;\n    line-height: 27px;\n    overflow: hidden;\n    padding: 0 4px 0 5px; }\n  .dg li.folder {\n    padding: 0;\n    border-left: 4px solid rgba(0, 0, 0, 0); }\n  .dg li.title {\n    cursor: pointer;\n    margin-left: -4px; }\n  .dg .closed li:not(.title),\n  .dg .closed ul li,\n  .dg .closed ul li > * {\n    height: 0;\n    overflow: hidden;\n    border: 0; }\n  .dg .cr {\n    clear: both;\n    padding-left: 3px;\n    height: 27px; }\n  .dg .property-name {\n    cursor: default;\n    float: left;\n    clear: left;\n    width: 40%;\n    overflow: hidden;\n    text-overflow: ellipsis; }\n  .dg .c {\n    float: left;\n    width: 60%; }\n  .dg .c input[type=text] {\n    border: 0;\n    margin-top: 4px;\n    padding: 3px;\n    width: 100%;\n    float: right; }\n  .dg .has-slider input[type=text] {\n    width: 30%;\n    /*display: none;*/\n    margin-left: 0; }\n  .dg .slider {\n    float: left;\n    width: 66%;\n    margin-left: -5px;\n    margin-right: 0;\n    height: 19px;\n    margin-top: 4px; }\n  .dg .slider-fg {\n    height: 100%; }\n  .dg .c input[type=checkbox] {\n    margin-top: 9px; }\n  .dg .c select {\n    margin-top: 5px; }\n  .dg .cr.function,\n  .dg .cr.function .property-name,\n  .dg .cr.function *,\n  .dg .cr.boolean,\n  .dg .cr.boolean * {\n    cursor: pointer; }\n  .dg .selector {\n    display: none;\n    position: absolute;\n    margin-left: -9px;\n    margin-top: 23px;\n    z-index: 10; }\n  .dg .c:hover .selector,\n  .dg .selector.drag {\n    display: block; }\n  .dg li.save-row {\n    padding: 0; }\n    .dg li.save-row .button {\n      display: inline-block;\n      padding: 0px 6px; }\n  .dg.dialogue {\n    background-color: #222;\n    width: 460px;\n    padding: 15px;\n    font-size: 13px;\n    line-height: 15px; }\n\n/* TODO Separate style and structure */\n#dg-new-constructor {\n  padding: 10px;\n  color: #222;\n  font-family: Monaco, monospace;\n  font-size: 10px;\n  border: 0;\n  resize: none;\n  box-shadow: inset 1px 1px 1px #888;\n  word-wrap: break-word;\n  margin: 12px 0;\n  display: block;\n  width: 440px;\n  overflow-y: scroll;\n  height: 100px;\n  position: relative; }\n\n#dg-local-explain {\n  display: none;\n  font-size: 11px;\n  line-height: 17px;\n  border-radius: 3px;\n  background-color: #333;\n  padding: 8px;\n  margin-top: 10px; }\n  #dg-local-explain code {\n    font-size: 10px; }\n\n#dat-gui-save-locally {\n  display: none; }\n\n/** Main type */\n.dg {\n  color: #eee;\n  font: 11px 'Lucida Grande', sans-serif;\n  text-shadow: 0 -1px 0 #111;\n  /** Auto place */\n  /* Controller row, <li> */\n  /** Controllers */ }\n  .dg.main {\n    /** Scrollbar */ }\n    .dg.main::-webkit-scrollbar {\n      width: 5px;\n      background: #1a1a1a; }\n    .dg.main::-webkit-scrollbar-corner {\n      height: 0;\n      display: none; }\n    .dg.main::-webkit-scrollbar-thumb {\n      border-radius: 5px;\n      background: #676767; }\n  .dg li:not(.folder) {\n    background: #1a1a1a;\n    border-bottom: 1px solid #2c2c2c; }\n  .dg li.save-row {\n    line-height: 25px;\n    background: #dad5cb;\n    border: 0; }\n    .dg li.save-row select {\n      margin-left: 5px;\n      width: 108px; }\n    .dg li.save-row .button {\n      margin-left: 5px;\n      margin-top: 1px;\n      border-radius: 2px;\n      font-size: 9px;\n      line-height: 7px;\n      padding: 4px 4px 5px 4px;\n      background: #c5bdad;\n      color: #fff;\n      text-shadow: 0 1px 0 #b0a58f;\n      box-shadow: 0 -1px 0 #b0a58f;\n      cursor: pointer; }\n      .dg li.save-row .button.gears {\n        background: #c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;\n        height: 7px;\n        width: 8px; }\n      .dg li.save-row .button:hover {\n        background-color: #bab19e;\n        box-shadow: 0 -1px 0 #b0a58f; }\n  .dg li.folder {\n    border-bottom: 0; }\n  .dg li.title {\n    padding-left: 16px;\n    background: black url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;\n    cursor: pointer;\n    border-bottom: 1px solid rgba(255, 255, 255, 0.2); }\n  .dg .closed li.title {\n    background-image: url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==); }\n  .dg .cr.boolean {\n    border-left: 3px solid #806787; }\n  .dg .cr.function {\n    border-left: 3px solid #e61d5f; }\n  .dg .cr.number {\n    border-left: 3px solid #2fa1d6; }\n    .dg .cr.number input[type=text] {\n      color: #2fa1d6; }\n  .dg .cr.string {\n    border-left: 3px solid #1ed36f; }\n    .dg .cr.string input[type=text] {\n      color: #1ed36f; }\n  .dg .cr.function:hover, .dg .cr.boolean:hover {\n    background: #111; }\n  .dg .c input[type=text] {\n    background: #303030;\n    outline: none; }\n    .dg .c input[type=text]:hover {\n      background: #3c3c3c; }\n    .dg .c input[type=text]:focus {\n      background: #494949;\n      color: #fff; }\n  .dg .c .slider {\n    background: #303030;\n    cursor: ew-resize; }\n  .dg .c .slider-fg {\n    background: #2fa1d6; }\n  .dg .c .slider:hover {\n    background: #3c3c3c; }\n    .dg .c .slider:hover .slider-fg {\n      background: #44abda; }\n", dat.controllers.factory = function(OptionController, NumberControllerBox, NumberControllerSlider, StringController, FunctionController, BooleanController, common) {
    return function(object, property) {
        var initialValue = object[property];
        if (common.isArray(arguments[2]) || common.isObject(arguments[2])) {
            return new OptionController(object, property, arguments[2]);
        }
        if (common.isNumber(initialValue)) {
            if (common.isNumber(arguments[2]) && common.isNumber(arguments[3])) {
                return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
            } else {
                return new NumberControllerBox(object, property, {
                    min: arguments[2],
                    max: arguments[3]
                });
            }
        }
        if (common.isString(initialValue)) {
            return new StringController(object, property);
        }
        if (common.isFunction(initialValue)) {
            return new FunctionController(object, property, "");
        }
        if (common.isBoolean(initialValue)) {
            return new BooleanController(object, property);
        }
    };
}(dat.controllers.OptionController, dat.controllers.NumberControllerBox, dat.controllers.NumberControllerSlider, dat.controllers.StringController = function(Controller, dom, common) {
    var StringController = function(object, property) {
        StringController.superclass.call(this, object, property);
        var _this = this;
        this.__input = document.createElement("input");
        this.__input.setAttribute("type", "text");
        dom.bind(this.__input, "keyup", onChange);
        dom.bind(this.__input, "change", onChange);
        dom.bind(this.__input, "blur", onBlur);
        dom.bind(this.__input, "keydown", function(e) {
            if (e.keyCode === 13) {
                this.blur();
            }
        });
        function onChange() {
            _this.setValue(_this.__input.value);
        }
        function onBlur() {
            if (_this.__onFinishChange) {
                _this.__onFinishChange.call(_this, _this.getValue());
            }
        }
        this.updateDisplay();
        this.domElement.appendChild(this.__input);
    };
    StringController.superclass = Controller;
    common.extend(StringController.prototype, Controller.prototype, {
        updateDisplay: function() {
            if (!dom.isActive(this.__input)) {
                this.__input.value = this.getValue();
            }
            return StringController.superclass.prototype.updateDisplay.call(this);
        }
    });
    return StringController;
}(dat.controllers.Controller, dat.dom.dom, dat.utils.common), dat.controllers.FunctionController, dat.controllers.BooleanController, dat.utils.common), dat.controllers.Controller, dat.controllers.BooleanController, dat.controllers.FunctionController, dat.controllers.NumberControllerBox, dat.controllers.NumberControllerSlider, dat.controllers.OptionController, dat.controllers.ColorController = function(Controller, dom, Color, interpret, common) {
    var ColorController = function(object, property) {
        ColorController.superclass.call(this, object, property);
        this.__color = new Color(this.getValue());
        this.__temp = new Color(0);
        var _this = this;
        this.domElement = document.createElement("div");
        dom.makeSelectable(this.domElement, false);
        this.__selector = document.createElement("div");
        this.__selector.className = "selector";
        this.__saturation_field = document.createElement("div");
        this.__saturation_field.className = "saturation-field";
        this.__field_knob = document.createElement("div");
        this.__field_knob.className = "field-knob";
        this.__field_knob_border = "2px solid ";
        this.__hue_knob = document.createElement("div");
        this.__hue_knob.className = "hue-knob";
        this.__hue_field = document.createElement("div");
        this.__hue_field.className = "hue-field";
        this.__input = document.createElement("input");
        this.__input.type = "text";
        this.__input_textShadow = "0 1px 1px ";
        dom.bind(this.__input, "keydown", function(e) {
            if (e.keyCode === 13) {
                onBlur.call(this);
            }
        });
        dom.bind(this.__input, "blur", onBlur);
        dom.bind(this.__selector, "mousedown", function(e) {
            dom.addClass(this, "drag").bind(window, "mouseup", function(e) {
                dom.removeClass(_this.__selector, "drag");
            });
        });
        var value_field = document.createElement("div");
        common.extend(this.__selector.style, {
            width: "122px",
            height: "102px",
            padding: "3px",
            backgroundColor: "#222",
            boxShadow: "0px 1px 3px rgba(0,0,0,0.3)"
        });
        common.extend(this.__field_knob.style, {
            position: "absolute",
            width: "12px",
            height: "12px",
            border: this.__field_knob_border + (this.__color.v < .5 ? "#fff" : "#000"),
            boxShadow: "0px 1px 3px rgba(0,0,0,0.5)",
            borderRadius: "12px",
            zIndex: 1
        });
        common.extend(this.__hue_knob.style, {
            position: "absolute",
            width: "15px",
            height: "2px",
            borderRight: "4px solid #fff",
            zIndex: 1
        });
        common.extend(this.__saturation_field.style, {
            width: "100px",
            height: "100px",
            border: "1px solid #555",
            marginRight: "3px",
            display: "inline-block",
            cursor: "pointer"
        });
        common.extend(value_field.style, {
            width: "100%",
            height: "100%",
            background: "none"
        });
        linearGradient(value_field, "top", "rgba(0,0,0,0)", "#000");
        common.extend(this.__hue_field.style, {
            width: "15px",
            height: "100px",
            display: "inline-block",
            border: "1px solid #555",
            cursor: "ns-resize"
        });
        hueGradient(this.__hue_field);
        common.extend(this.__input.style, {
            outline: "none",
            textAlign: "center",
            color: "#fff",
            border: 0,
            fontWeight: "bold",
            textShadow: this.__input_textShadow + "rgba(0,0,0,0.7)"
        });
        dom.bind(this.__saturation_field, "mousedown", fieldDown);
        dom.bind(this.__field_knob, "mousedown", fieldDown);
        dom.bind(this.__hue_field, "mousedown", function(e) {
            setH(e);
            dom.bind(window, "mousemove", setH);
            dom.bind(window, "mouseup", unbindH);
        });
        function fieldDown(e) {
            setSV(e);
            dom.bind(window, "mousemove", setSV);
            dom.bind(window, "mouseup", unbindSV);
        }
        function unbindSV() {
            dom.unbind(window, "mousemove", setSV);
            dom.unbind(window, "mouseup", unbindSV);
        }
        function onBlur() {
            var i = interpret(this.value);
            if (i !== false) {
                _this.__color.__state = i;
                _this.setValue(_this.__color.toOriginal());
            } else {
                this.value = _this.__color.toString();
            }
        }
        function unbindH() {
            dom.unbind(window, "mousemove", setH);
            dom.unbind(window, "mouseup", unbindH);
        }
        this.__saturation_field.appendChild(value_field);
        this.__selector.appendChild(this.__field_knob);
        this.__selector.appendChild(this.__saturation_field);
        this.__selector.appendChild(this.__hue_field);
        this.__hue_field.appendChild(this.__hue_knob);
        this.domElement.appendChild(this.__input);
        this.domElement.appendChild(this.__selector);
        this.updateDisplay();
        function setSV(e) {
            e.preventDefault();
            var w = dom.getWidth(_this.__saturation_field);
            var o = dom.getOffset(_this.__saturation_field);
            var s = (e.clientX - o.left + document.body.scrollLeft) / w;
            var v = 1 - (e.clientY - o.top + document.body.scrollTop) / w;
            if (v > 1) v = 1; else if (v < 0) v = 0;
            if (s > 1) s = 1; else if (s < 0) s = 0;
            _this.__color.v = v;
            _this.__color.s = s;
            _this.setValue(_this.__color.toOriginal());
            return false;
        }
        function setH(e) {
            e.preventDefault();
            var s = dom.getHeight(_this.__hue_field);
            var o = dom.getOffset(_this.__hue_field);
            var h = 1 - (e.clientY - o.top + document.body.scrollTop) / s;
            if (h > 1) h = 1; else if (h < 0) h = 0;
            _this.__color.h = h * 360;
            _this.setValue(_this.__color.toOriginal());
            return false;
        }
    };
    ColorController.superclass = Controller;
    common.extend(ColorController.prototype, Controller.prototype, {
        updateDisplay: function() {
            var i = interpret(this.getValue());
            if (i !== false) {
                var mismatch = false;
                common.each(Color.COMPONENTS, function(component) {
                    if (!common.isUndefined(i[component]) && !common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
                        mismatch = true;
                        return {};
                    }
                }, this);
                if (mismatch) {
                    common.extend(this.__color.__state, i);
                }
            }
            common.extend(this.__temp.__state, this.__color.__state);
            this.__temp.a = 1;
            var flip = this.__color.v < .5 || this.__color.s > .5 ? 255 : 0;
            var _flip = 255 - flip;
            common.extend(this.__field_knob.style, {
                marginLeft: 100 * this.__color.s - 7 + "px",
                marginTop: 100 * (1 - this.__color.v) - 7 + "px",
                backgroundColor: this.__temp.toString(),
                border: this.__field_knob_border + "rgb(" + flip + "," + flip + "," + flip + ")"
            });
            this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + "px";
            this.__temp.s = 1;
            this.__temp.v = 1;
            linearGradient(this.__saturation_field, "left", "#fff", this.__temp.toString());
            common.extend(this.__input.style, {
                backgroundColor: this.__input.value = this.__color.toString(),
                color: "rgb(" + flip + "," + flip + "," + flip + ")",
                textShadow: this.__input_textShadow + "rgba(" + _flip + "," + _flip + "," + _flip + ",.7)"
            });
        }
    });
    var vendors = [ "-moz-", "-o-", "-webkit-", "-ms-", "" ];
    function linearGradient(elem, x, a, b) {
        elem.style.background = "";
        common.each(vendors, function(vendor) {
            elem.style.cssText += "background: " + vendor + "linear-gradient(" + x + ", " + a + " 0%, " + b + " 100%); ";
        });
    }
    function hueGradient(elem) {
        elem.style.background = "";
        elem.style.cssText += "background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);";
        elem.style.cssText += "background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
        elem.style.cssText += "background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
        elem.style.cssText += "background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
        elem.style.cssText += "background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);";
    }
    return ColorController;
}(dat.controllers.Controller, dat.dom.dom, dat.color.Color = function(interpret, math, toString, common) {
    var Color = function() {
        this.__state = interpret.apply(this, arguments);
        if (this.__state === false) {
            throw "Failed to interpret color arguments";
        }
        this.__state.a = this.__state.a || 1;
    };
    Color.COMPONENTS = [ "r", "g", "b", "h", "s", "v", "hex", "a" ];
    common.extend(Color.prototype, {
        toString: function() {
            return toString(this);
        },
        toOriginal: function() {
            return this.__state.conversion.write(this);
        }
    });
    defineRGBComponent(Color.prototype, "r", 2);
    defineRGBComponent(Color.prototype, "g", 1);
    defineRGBComponent(Color.prototype, "b", 0);
    defineHSVComponent(Color.prototype, "h");
    defineHSVComponent(Color.prototype, "s");
    defineHSVComponent(Color.prototype, "v");
    Object.defineProperty(Color.prototype, "a", {
        get: function() {
            return this.__state.a;
        },
        set: function(v) {
            this.__state.a = v;
        }
    });
    Object.defineProperty(Color.prototype, "hex", {
        get: function() {
            if (!this.__state.space !== "HEX") {
                this.__state.hex = math.rgb_to_hex(this.r, this.g, this.b);
            }
            return this.__state.hex;
        },
        set: function(v) {
            this.__state.space = "HEX";
            this.__state.hex = v;
        }
    });
    function defineRGBComponent(target, component, componentHexIndex) {
        Object.defineProperty(target, component, {
            get: function() {
                if (this.__state.space === "RGB") {
                    return this.__state[component];
                }
                recalculateRGB(this, component, componentHexIndex);
                return this.__state[component];
            },
            set: function(v) {
                if (this.__state.space !== "RGB") {
                    recalculateRGB(this, component, componentHexIndex);
                    this.__state.space = "RGB";
                }
                this.__state[component] = v;
            }
        });
    }
    function defineHSVComponent(target, component) {
        Object.defineProperty(target, component, {
            get: function() {
                if (this.__state.space === "HSV") return this.__state[component];
                recalculateHSV(this);
                return this.__state[component];
            },
            set: function(v) {
                if (this.__state.space !== "HSV") {
                    recalculateHSV(this);
                    this.__state.space = "HSV";
                }
                this.__state[component] = v;
            }
        });
    }
    function recalculateRGB(color, component, componentHexIndex) {
        if (color.__state.space === "HEX") {
            color.__state[component] = math.component_from_hex(color.__state.hex, componentHexIndex);
        } else if (color.__state.space === "HSV") {
            common.extend(color.__state, math.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
        } else {
            throw "Corrupted color state";
        }
    }
    function recalculateHSV(color) {
        var result = math.rgb_to_hsv(color.r, color.g, color.b);
        common.extend(color.__state, {
            s: result.s,
            v: result.v
        });
        if (!common.isNaN(result.h)) {
            color.__state.h = result.h;
        } else if (common.isUndefined(color.__state.h)) {
            color.__state.h = 0;
        }
    }
    return Color;
}(dat.color.interpret, dat.color.math = function() {
    var tmpComponent;
    return {
        hsv_to_rgb: function(h, s, v) {
            var hi = Math.floor(h / 60) % 6;
            var f = h / 60 - Math.floor(h / 60);
            var p = v * (1 - s);
            var q = v * (1 - f * s);
            var t = v * (1 - (1 - f) * s);
            var c = [ [ v, t, p ], [ q, v, p ], [ p, v, t ], [ p, q, v ], [ t, p, v ], [ v, p, q ] ][hi];
            return {
                r: c[0] * 255,
                g: c[1] * 255,
                b: c[2] * 255
            };
        },
        rgb_to_hsv: function(r, g, b) {
            var min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h, s;
            if (max != 0) {
                s = delta / max;
            } else {
                return {
                    h: NaN,
                    s: 0,
                    v: 0
                };
            }
            if (r == max) {
                h = (g - b) / delta;
            } else if (g == max) {
                h = 2 + (b - r) / delta;
            } else {
                h = 4 + (r - g) / delta;
            }
            h /= 6;
            if (h < 0) {
                h += 1;
            }
            return {
                h: h * 360,
                s: s,
                v: max / 255
            };
        },
        rgb_to_hex: function(r, g, b) {
            var hex = this.hex_with_component(0, 2, r);
            hex = this.hex_with_component(hex, 1, g);
            hex = this.hex_with_component(hex, 0, b);
            return hex;
        },
        component_from_hex: function(hex, componentIndex) {
            return hex >> componentIndex * 8 & 255;
        },
        hex_with_component: function(hex, componentIndex, value) {
            return value << (tmpComponent = componentIndex * 8) | hex & ~(255 << tmpComponent);
        }
    };
}(), dat.color.toString, dat.utils.common), dat.color.interpret, dat.utils.common), dat.utils.requestAnimationFrame = function() {
    return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
        window.setTimeout(callback, 1e3 / 60);
    };
}(), dat.dom.CenteredDiv = function(dom, common) {
    var CenteredDiv = function() {
        this.backgroundElement = document.createElement("div");
        common.extend(this.backgroundElement.style, {
            backgroundColor: "rgba(0,0,0,0.8)",
            top: 0,
            left: 0,
            display: "none",
            zIndex: "1000",
            opacity: 0,
            WebkitTransition: "opacity 0.2s linear"
        });
        dom.makeFullscreen(this.backgroundElement);
        this.backgroundElement.style.position = "fixed";
        this.domElement = document.createElement("div");
        common.extend(this.domElement.style, {
            position: "fixed",
            display: "none",
            zIndex: "1001",
            opacity: 0,
            WebkitTransition: "-webkit-transform 0.2s ease-out, opacity 0.2s linear"
        });
        document.body.appendChild(this.backgroundElement);
        document.body.appendChild(this.domElement);
        var _this = this;
        dom.bind(this.backgroundElement, "click", function() {
            _this.hide();
        });
    };
    CenteredDiv.prototype.show = function() {
        var _this = this;
        this.backgroundElement.style.display = "block";
        this.domElement.style.display = "block";
        this.domElement.style.opacity = 0;
        this.domElement.style.webkitTransform = "scale(1.1)";
        this.layout();
        common.defer(function() {
            _this.backgroundElement.style.opacity = 1;
            _this.domElement.style.opacity = 1;
            _this.domElement.style.webkitTransform = "scale(1)";
        });
    };
    CenteredDiv.prototype.hide = function() {
        var _this = this;
        var hide = function() {
            _this.domElement.style.display = "none";
            _this.backgroundElement.style.display = "none";
            dom.unbind(_this.domElement, "webkitTransitionEnd", hide);
            dom.unbind(_this.domElement, "transitionend", hide);
            dom.unbind(_this.domElement, "oTransitionEnd", hide);
        };
        dom.bind(this.domElement, "webkitTransitionEnd", hide);
        dom.bind(this.domElement, "transitionend", hide);
        dom.bind(this.domElement, "oTransitionEnd", hide);
        this.backgroundElement.style.opacity = 0;
        this.domElement.style.opacity = 0;
        this.domElement.style.webkitTransform = "scale(1.1)";
    };
    CenteredDiv.prototype.layout = function() {
        this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + "px";
        this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + "px";
    };
    function lockScroll(e) {
        console.log(e);
    }
    return CenteredDiv;
}(dat.dom.dom, dat.utils.common), dat.dom.dom, dat.utils.common);

var Stats = function() {
    var l = Date.now(), m = l, g = 0, n = Infinity, o = 0, h = 0, p = Infinity, q = 0, r = 0, s = 0, f = document.createElement("div");
    f.id = "stats";
    f.addEventListener("mousedown", function(b) {
        b.preventDefault();
        t(++s % 2);
    }, !1);
    f.style.cssText = "width:80px;opacity:0.9;cursor:pointer";
    var a = document.createElement("div");
    a.id = "fps";
    a.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#002";
    f.appendChild(a);
    var i = document.createElement("div");
    i.id = "fpsText";
    i.style.cssText = "color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
    i.innerHTML = "FPS";
    a.appendChild(i);
    var c = document.createElement("div");
    c.id = "fpsGraph";
    c.style.cssText = "position:relative;width:74px;height:30px;background-color:#0ff";
    for (a.appendChild(c); 74 > c.children.length; ) {
        var j = document.createElement("span");
        j.style.cssText = "width:1px;height:30px;float:left;background-color:#113";
        c.appendChild(j);
    }
    var d = document.createElement("div");
    d.id = "ms";
    d.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";
    f.appendChild(d);
    var k = document.createElement("div");
    k.id = "msText";
    k.style.cssText = "color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
    k.innerHTML = "MS";
    d.appendChild(k);
    var e = document.createElement("div");
    e.id = "msGraph";
    e.style.cssText = "position:relative;width:74px;height:30px;background-color:#0f0";
    for (d.appendChild(e); 74 > e.children.length; ) j = document.createElement("span"), 
    j.style.cssText = "width:1px;height:30px;float:left;background-color:#131", e.appendChild(j);
    var t = function(b) {
        s = b;
        switch (s) {
          case 0:
            a.style.display = "block";
            d.style.display = "none";
            break;

          case 1:
            a.style.display = "none", d.style.display = "block";
        }
    };
    return {
        REVISION: 11,
        domElement: f,
        setMode: t,
        begin: function() {
            l = Date.now();
        },
        end: function() {
            var b = Date.now();
            g = b - l;
            n = Math.min(n, g);
            o = Math.max(o, g);
            k.textContent = g + " MS (" + n + "-" + o + ")";
            var a = Math.min(30, 30 - 30 * (g / 200));
            e.appendChild(e.firstChild).style.height = a + "px";
            r++;
            b > m + 1e3 && (h = Math.round(1e3 * r / (b - m)), p = Math.min(p, h), q = Math.max(q, h), 
            i.textContent = h + " FPS (" + p + "-" + q + ")", a = Math.min(30, 30 - 30 * (h / 100)), 
            c.appendChild(c.firstChild).style.height = a + "px", m = b, r = 0);
            return b;
        },
        update: function() {
            l = this.end();
        }
    };
};

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function() {
        return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
            window.setTimeout(callback, 1e3 / 60);
        };
    }();
}

(function(name, context, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else if (typeof context.define === "function" && context.define.amd) {
        define(name, [], factory);
    } else {
        context[name] = factory();
    }
})("buzz", this, function() {
    var buzz = {
        defaults: {
            autoplay: false,
            duration: 5e3,
            formats: [],
            loop: false,
            placeholder: "--",
            preload: "metadata",
            volume: 80,
            document: document
        },
        types: {
            mp3: "audio/mpeg",
            ogg: "audio/ogg",
            wav: "audio/wav",
            aac: "audio/aac",
            m4a: "audio/x-m4a"
        },
        sounds: [],
        el: document.createElement("audio"),
        sound: function(src, options) {
            options = options || {};
            var doc = options.document || buzz.defaults.document;
            var pid = 0, events = [], eventsOnce = {}, supported = buzz.isSupported();
            this.load = function() {
                if (!supported) {
                    return this;
                }
                this.sound.load();
                return this;
            };
            this.play = function() {
                if (!supported) {
                    return this;
                }
                this.sound.play();
                return this;
            };
            this.togglePlay = function() {
                if (!supported) {
                    return this;
                }
                if (this.sound.paused) {
                    this.sound.play();
                } else {
                    this.sound.pause();
                }
                return this;
            };
            this.pause = function() {
                if (!supported) {
                    return this;
                }
                this.sound.pause();
                return this;
            };
            this.isPaused = function() {
                if (!supported) {
                    return null;
                }
                return this.sound.paused;
            };
            this.stop = function() {
                if (!supported) {
                    return this;
                }
                this.setTime(0);
                this.sound.pause();
                return this;
            };
            this.isEnded = function() {
                if (!supported) {
                    return null;
                }
                return this.sound.ended;
            };
            this.loop = function() {
                if (!supported) {
                    return this;
                }
                this.sound.loop = "loop";
                this.bind("ended.buzzloop", function() {
                    this.currentTime = 0;
                    this.play();
                });
                return this;
            };
            this.unloop = function() {
                if (!supported) {
                    return this;
                }
                this.sound.removeAttribute("loop");
                this.unbind("ended.buzzloop");
                return this;
            };
            this.mute = function() {
                if (!supported) {
                    return this;
                }
                this.sound.muted = true;
                return this;
            };
            this.unmute = function() {
                if (!supported) {
                    return this;
                }
                this.sound.muted = false;
                return this;
            };
            this.toggleMute = function() {
                if (!supported) {
                    return this;
                }
                this.sound.muted = !this.sound.muted;
                return this;
            };
            this.isMuted = function() {
                if (!supported) {
                    return null;
                }
                return this.sound.muted;
            };
            this.setVolume = function(volume) {
                if (!supported) {
                    return this;
                }
                if (volume < 0) {
                    volume = 0;
                }
                if (volume > 100) {
                    volume = 100;
                }
                this.volume = volume;
                this.sound.volume = volume / 100;
                return this;
            };
            this.getVolume = function() {
                if (!supported) {
                    return this;
                }
                return this.volume;
            };
            this.increaseVolume = function(value) {
                return this.setVolume(this.volume + (value || 1));
            };
            this.decreaseVolume = function(value) {
                return this.setVolume(this.volume - (value || 1));
            };
            this.setTime = function(time) {
                if (!supported) {
                    return this;
                }
                var set = true;
                this.whenReady(function() {
                    if (set === true) {
                        set = false;
                        this.sound.currentTime = time;
                    }
                });
                return this;
            };
            this.getTime = function() {
                if (!supported) {
                    return null;
                }
                var time = Math.round(this.sound.currentTime * 100) / 100;
                return isNaN(time) ? buzz.defaults.placeholder : time;
            };
            this.setPercent = function(percent) {
                if (!supported) {
                    return this;
                }
                return this.setTime(buzz.fromPercent(percent, this.sound.duration));
            };
            this.getPercent = function() {
                if (!supported) {
                    return null;
                }
                var percent = Math.round(buzz.toPercent(this.sound.currentTime, this.sound.duration));
                return isNaN(percent) ? buzz.defaults.placeholder : percent;
            };
            this.setSpeed = function(duration) {
                if (!supported) {
                    return this;
                }
                this.sound.playbackRate = duration;
                return this;
            };
            this.getSpeed = function() {
                if (!supported) {
                    return null;
                }
                return this.sound.playbackRate;
            };
            this.getDuration = function() {
                if (!supported) {
                    return null;
                }
                var duration = Math.round(this.sound.duration * 100) / 100;
                return isNaN(duration) ? buzz.defaults.placeholder : duration;
            };
            this.getPlayed = function() {
                if (!supported) {
                    return null;
                }
                return timerangeToArray(this.sound.played);
            };
            this.getBuffered = function() {
                if (!supported) {
                    return null;
                }
                return timerangeToArray(this.sound.buffered);
            };
            this.getSeekable = function() {
                if (!supported) {
                    return null;
                }
                return timerangeToArray(this.sound.seekable);
            };
            this.getErrorCode = function() {
                if (supported && this.sound.error) {
                    return this.sound.error.code;
                }
                return 0;
            };
            this.getErrorMessage = function() {
                if (!supported) {
                    return null;
                }
                switch (this.getErrorCode()) {
                  case 1:
                    return "MEDIA_ERR_ABORTED";

                  case 2:
                    return "MEDIA_ERR_NETWORK";

                  case 3:
                    return "MEDIA_ERR_DECODE";

                  case 4:
                    return "MEDIA_ERR_SRC_NOT_SUPPORTED";

                  default:
                    return null;
                }
            };
            this.getStateCode = function() {
                if (!supported) {
                    return null;
                }
                return this.sound.readyState;
            };
            this.getStateMessage = function() {
                if (!supported) {
                    return null;
                }
                switch (this.getStateCode()) {
                  case 0:
                    return "HAVE_NOTHING";

                  case 1:
                    return "HAVE_METADATA";

                  case 2:
                    return "HAVE_CURRENT_DATA";

                  case 3:
                    return "HAVE_FUTURE_DATA";

                  case 4:
                    return "HAVE_ENOUGH_DATA";

                  default:
                    return null;
                }
            };
            this.getNetworkStateCode = function() {
                if (!supported) {
                    return null;
                }
                return this.sound.networkState;
            };
            this.getNetworkStateMessage = function() {
                if (!supported) {
                    return null;
                }
                switch (this.getNetworkStateCode()) {
                  case 0:
                    return "NETWORK_EMPTY";

                  case 1:
                    return "NETWORK_IDLE";

                  case 2:
                    return "NETWORK_LOADING";

                  case 3:
                    return "NETWORK_NO_SOURCE";

                  default:
                    return null;
                }
            };
            this.set = function(key, value) {
                if (!supported) {
                    return this;
                }
                this.sound[key] = value;
                return this;
            };
            this.get = function(key) {
                if (!supported) {
                    return null;
                }
                return key ? this.sound[key] : this.sound;
            };
            this.bind = function(types, func) {
                if (!supported) {
                    return this;
                }
                types = types.split(" ");
                var self = this, efunc = function(e) {
                    func.call(self, e);
                };
                for (var t = 0; t < types.length; t++) {
                    var type = types[t], idx = type;
                    type = idx.split(".")[0];
                    events.push({
                        idx: idx,
                        func: efunc
                    });
                    this.sound.addEventListener(type, efunc, true);
                }
                return this;
            };
            this.unbind = function(types) {
                if (!supported) {
                    return this;
                }
                types = types.split(" ");
                for (var t = 0; t < types.length; t++) {
                    var idx = types[t], type = idx.split(".")[0];
                    for (var i = 0; i < events.length; i++) {
                        var namespace = events[i].idx.split(".");
                        if (events[i].idx == idx || namespace[1] && namespace[1] == idx.replace(".", "")) {
                            this.sound.removeEventListener(type, events[i].func, true);
                            events.splice(i, 1);
                        }
                    }
                }
                return this;
            };
            this.bindOnce = function(type, func) {
                if (!supported) {
                    return this;
                }
                var self = this;
                eventsOnce[pid++] = false;
                this.bind(type + "." + pid, function() {
                    if (!eventsOnce[pid]) {
                        eventsOnce[pid] = true;
                        func.call(self);
                    }
                    self.unbind(type + "." + pid);
                });
                return this;
            };
            this.trigger = function(types) {
                if (!supported) {
                    return this;
                }
                types = types.split(" ");
                for (var t = 0; t < types.length; t++) {
                    var idx = types[t];
                    for (var i = 0; i < events.length; i++) {
                        var eventType = events[i].idx.split(".");
                        if (events[i].idx == idx || eventType[0] && eventType[0] == idx.replace(".", "")) {
                            var evt = doc.createEvent("HTMLEvents");
                            evt.initEvent(eventType[0], false, true);
                            this.sound.dispatchEvent(evt);
                        }
                    }
                }
                return this;
            };
            this.fadeTo = function(to, duration, callback) {
                if (!supported) {
                    return this;
                }
                if (duration instanceof Function) {
                    callback = duration;
                    duration = buzz.defaults.duration;
                } else {
                    duration = duration || buzz.defaults.duration;
                }
                var from = this.volume, delay = duration / Math.abs(from - to), self = this;
                this.play();
                function doFade() {
                    setTimeout(function() {
                        if (from < to && self.volume < to) {
                            self.setVolume(self.volume += 1);
                            doFade();
                        } else if (from > to && self.volume > to) {
                            self.setVolume(self.volume -= 1);
                            doFade();
                        } else if (callback instanceof Function) {
                            callback.apply(self);
                        }
                    }, delay);
                }
                this.whenReady(function() {
                    doFade();
                });
                return this;
            };
            this.fadeIn = function(duration, callback) {
                if (!supported) {
                    return this;
                }
                return this.setVolume(0).fadeTo(100, duration, callback);
            };
            this.fadeOut = function(duration, callback) {
                if (!supported) {
                    return this;
                }
                return this.fadeTo(0, duration, callback);
            };
            this.fadeWith = function(sound, duration) {
                if (!supported) {
                    return this;
                }
                this.fadeOut(duration, function() {
                    this.stop();
                });
                sound.play().fadeIn(duration);
                return this;
            };
            this.whenReady = function(func) {
                if (!supported) {
                    return null;
                }
                var self = this;
                if (this.sound.readyState === 0) {
                    this.bind("canplay.buzzwhenready", function() {
                        func.call(self);
                    });
                } else {
                    func.call(self);
                }
            };
            function timerangeToArray(timeRange) {
                var array = [], length = timeRange.length - 1;
                for (var i = 0; i <= length; i++) {
                    array.push({
                        start: timeRange.start(i),
                        end: timeRange.end(i)
                    });
                }
                return array;
            }
            function getExt(filename) {
                return filename.split(".").pop();
            }
            function addSource(sound, src) {
                var source = doc.createElement("source");
                source.src = src;
                if (buzz.types[getExt(src)]) {
                    source.type = buzz.types[getExt(src)];
                }
                sound.appendChild(source);
            }
            if (supported && src) {
                for (var i in buzz.defaults) {
                    if (buzz.defaults.hasOwnProperty(i)) {
                        options[i] = options[i] || buzz.defaults[i];
                    }
                }
                this.sound = doc.createElement("audio");
                if (src instanceof Array) {
                    for (var j in src) {
                        if (src.hasOwnProperty(j)) {
                            addSource(this.sound, src[j]);
                        }
                    }
                } else if (options.formats.length) {
                    for (var k in options.formats) {
                        if (options.formats.hasOwnProperty(k)) {
                            addSource(this.sound, src + "." + options.formats[k]);
                        }
                    }
                } else {
                    addSource(this.sound, src);
                }
                if (options.loop) {
                    this.loop();
                }
                if (options.autoplay) {
                    this.sound.autoplay = "autoplay";
                }
                if (options.preload === true) {
                    this.sound.preload = "auto";
                } else if (options.preload === false) {
                    this.sound.preload = "none";
                } else {
                    this.sound.preload = options.preload;
                }
                this.setVolume(options.volume);
                buzz.sounds.push(this);
            }
        },
        group: function(sounds) {
            sounds = argsToArray(sounds, arguments);
            this.getSounds = function() {
                return sounds;
            };
            this.add = function(soundArray) {
                soundArray = argsToArray(soundArray, arguments);
                for (var a = 0; a < soundArray.length; a++) {
                    sounds.push(soundArray[a]);
                }
            };
            this.remove = function(soundArray) {
                soundArray = argsToArray(soundArray, arguments);
                for (var a = 0; a < soundArray.length; a++) {
                    for (var i = 0; i < sounds.length; i++) {
                        if (sounds[i] == soundArray[a]) {
                            sounds.splice(i, 1);
                            break;
                        }
                    }
                }
            };
            this.load = function() {
                fn("load");
                return this;
            };
            this.play = function() {
                fn("play");
                return this;
            };
            this.togglePlay = function() {
                fn("togglePlay");
                return this;
            };
            this.pause = function(time) {
                fn("pause", time);
                return this;
            };
            this.stop = function() {
                fn("stop");
                return this;
            };
            this.mute = function() {
                fn("mute");
                return this;
            };
            this.unmute = function() {
                fn("unmute");
                return this;
            };
            this.toggleMute = function() {
                fn("toggleMute");
                return this;
            };
            this.setVolume = function(volume) {
                fn("setVolume", volume);
                return this;
            };
            this.increaseVolume = function(value) {
                fn("increaseVolume", value);
                return this;
            };
            this.decreaseVolume = function(value) {
                fn("decreaseVolume", value);
                return this;
            };
            this.loop = function() {
                fn("loop");
                return this;
            };
            this.unloop = function() {
                fn("unloop");
                return this;
            };
            this.setTime = function(time) {
                fn("setTime", time);
                return this;
            };
            this.set = function(key, value) {
                fn("set", key, value);
                return this;
            };
            this.bind = function(type, func) {
                fn("bind", type, func);
                return this;
            };
            this.unbind = function(type) {
                fn("unbind", type);
                return this;
            };
            this.bindOnce = function(type, func) {
                fn("bindOnce", type, func);
                return this;
            };
            this.trigger = function(type) {
                fn("trigger", type);
                return this;
            };
            this.fade = function(from, to, duration, callback) {
                fn("fade", from, to, duration, callback);
                return this;
            };
            this.fadeIn = function(duration, callback) {
                fn("fadeIn", duration, callback);
                return this;
            };
            this.fadeOut = function(duration, callback) {
                fn("fadeOut", duration, callback);
                return this;
            };
            function fn() {
                var args = argsToArray(null, arguments), func = args.shift();
                for (var i = 0; i < sounds.length; i++) {
                    sounds[i][func].apply(sounds[i], args);
                }
            }
            function argsToArray(array, args) {
                return array instanceof Array ? array : Array.prototype.slice.call(args);
            }
        },
        all: function() {
            return new buzz.group(buzz.sounds);
        },
        isSupported: function() {
            return !!buzz.el.canPlayType;
        },
        isOGGSupported: function() {
            return !!buzz.el.canPlayType && buzz.el.canPlayType('audio/ogg; codecs="vorbis"');
        },
        isWAVSupported: function() {
            return !!buzz.el.canPlayType && buzz.el.canPlayType('audio/wav; codecs="1"');
        },
        isMP3Supported: function() {
            return !!buzz.el.canPlayType && buzz.el.canPlayType("audio/mpeg;");
        },
        isAACSupported: function() {
            return !!buzz.el.canPlayType && (buzz.el.canPlayType("audio/x-m4a;") || buzz.el.canPlayType("audio/aac;"));
        },
        toTimer: function(time, withHours) {
            var h, m, s;
            h = Math.floor(time / 3600);
            h = isNaN(h) ? "--" : h >= 10 ? h : "0" + h;
            m = withHours ? Math.floor(time / 60 % 60) : Math.floor(time / 60);
            m = isNaN(m) ? "--" : m >= 10 ? m : "0" + m;
            s = Math.floor(time % 60);
            s = isNaN(s) ? "--" : s >= 10 ? s : "0" + s;
            return withHours ? h + ":" + m + ":" + s : m + ":" + s;
        },
        fromTimer: function(time) {
            var splits = time.toString().split(":");
            if (splits && splits.length == 3) {
                time = parseInt(splits[0], 10) * 3600 + parseInt(splits[1], 10) * 60 + parseInt(splits[2], 10);
            }
            if (splits && splits.length == 2) {
                time = parseInt(splits[0], 10) * 60 + parseInt(splits[1], 10);
            }
            return time;
        },
        toPercent: function(value, total, decimal) {
            var r = Math.pow(10, decimal || 0);
            return Math.round(value * 100 / total * r) / r;
        },
        fromPercent: function(percent, total, decimal) {
            var r = Math.pow(10, decimal || 0);
            return Math.round(total / 100 * percent * r) / r;
        }
    };
    return buzz;
});

(function() {
    var root = this;
    var PIXI = PIXI || {};
    PIXI.WEBGL_RENDERER = 0;
    PIXI.CANVAS_RENDERER = 1;
    PIXI.VERSION = "v1.5.2";
    PIXI.blendModes = {
        NORMAL: 0,
        ADD: 1,
        MULTIPLY: 2,
        SCREEN: 3,
        OVERLAY: 4,
        DARKEN: 5,
        LIGHTEN: 6,
        COLOR_DODGE: 7,
        COLOR_BURN: 8,
        HARD_LIGHT: 9,
        SOFT_LIGHT: 10,
        DIFFERENCE: 11,
        EXCLUSION: 12,
        HUE: 13,
        SATURATION: 14,
        COLOR: 15,
        LUMINOSITY: 16
    };
    PIXI.scaleModes = {
        DEFAULT: 0,
        LINEAR: 0,
        NEAREST: 1
    };
    PIXI.INTERACTION_FREQUENCY = 30;
    PIXI.AUTO_PREVENT_DEFAULT = true;
    PIXI.RAD_TO_DEG = 180 / Math.PI;
    PIXI.DEG_TO_RAD = Math.PI / 180;
    PIXI.Point = function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    };
    PIXI.Point.prototype.clone = function() {
        return new PIXI.Point(this.x, this.y);
    };
    PIXI.Point.prototype.constructor = PIXI.Point;
    PIXI.Point.prototype.set = function(x, y) {
        this.x = x || 0;
        this.y = y || (y !== 0 ? this.x : 0);
    };
    PIXI.Rectangle = function(x, y, width, height) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;
    };
    PIXI.Rectangle.prototype.clone = function() {
        return new PIXI.Rectangle(this.x, this.y, this.width, this.height);
    };
    PIXI.Rectangle.prototype.contains = function(x, y) {
        if (this.width <= 0 || this.height <= 0) return false;
        var x1 = this.x;
        if (x >= x1 && x <= x1 + this.width) {
            var y1 = this.y;
            if (y >= y1 && y <= y1 + this.height) {
                return true;
            }
        }
        return false;
    };
    PIXI.Rectangle.prototype.constructor = PIXI.Rectangle;
    PIXI.EmptyRectangle = new PIXI.Rectangle(0, 0, 0, 0);
    PIXI.Polygon = function(points) {
        if (!(points instanceof Array)) points = Array.prototype.slice.call(arguments);
        if (typeof points[0] === "number") {
            var p = [];
            for (var i = 0, il = points.length; i < il; i += 2) {
                p.push(new PIXI.Point(points[i], points[i + 1]));
            }
            points = p;
        }
        this.points = points;
    };
    PIXI.Polygon.prototype.clone = function() {
        var points = [];
        for (var i = 0; i < this.points.length; i++) {
            points.push(this.points[i].clone());
        }
        return new PIXI.Polygon(points);
    };
    PIXI.Polygon.prototype.contains = function(x, y) {
        var inside = false;
        for (var i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
            var xi = this.points[i].x, yi = this.points[i].y, xj = this.points[j].x, yj = this.points[j].y, intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
            if (intersect) inside = !inside;
        }
        return inside;
    };
    PIXI.Polygon.prototype.constructor = PIXI.Polygon;
    PIXI.Circle = function(x, y, radius) {
        this.x = x || 0;
        this.y = y || 0;
        this.radius = radius || 0;
    };
    PIXI.Circle.prototype.clone = function() {
        return new PIXI.Circle(this.x, this.y, this.radius);
    };
    PIXI.Circle.prototype.contains = function(x, y) {
        if (this.radius <= 0) return false;
        var dx = this.x - x, dy = this.y - y, r2 = this.radius * this.radius;
        dx *= dx;
        dy *= dy;
        return dx + dy <= r2;
    };
    PIXI.Circle.prototype.constructor = PIXI.Circle;
    PIXI.Ellipse = function(x, y, width, height) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;
    };
    PIXI.Ellipse.prototype.clone = function() {
        return new PIXI.Ellipse(this.x, this.y, this.width, this.height);
    };
    PIXI.Ellipse.prototype.contains = function(x, y) {
        if (this.width <= 0 || this.height <= 0) return false;
        var normx = (x - this.x) / this.width, normy = (y - this.y) / this.height;
        normx *= normx;
        normy *= normy;
        return normx + normy <= 1;
    };
    PIXI.Ellipse.prototype.getBounds = function() {
        return new PIXI.Rectangle(this.x, this.y, this.width, this.height);
    };
    PIXI.Ellipse.prototype.constructor = PIXI.Ellipse;
    PIXI.determineMatrixArrayType = function() {
        return typeof Float32Array !== "undefined" ? Float32Array : Array;
    };
    PIXI.Matrix2 = PIXI.determineMatrixArrayType();
    PIXI.Matrix = function() {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.tx = 0;
        this.ty = 0;
    };
    PIXI.Matrix.prototype.fromArray = function(array) {
        this.a = array[0];
        this.b = array[1];
        this.c = array[3];
        this.d = array[4];
        this.tx = array[2];
        this.ty = array[5];
    };
    PIXI.Matrix.prototype.toArray = function(transpose) {
        if (!this.array) this.array = new Float32Array(9);
        var array = this.array;
        if (transpose) {
            this.array[0] = this.a;
            this.array[1] = this.c;
            this.array[2] = 0;
            this.array[3] = this.b;
            this.array[4] = this.d;
            this.array[5] = 0;
            this.array[6] = this.tx;
            this.array[7] = this.ty;
            this.array[8] = 1;
        } else {
            this.array[0] = this.a;
            this.array[1] = this.b;
            this.array[2] = this.tx;
            this.array[3] = this.c;
            this.array[4] = this.d;
            this.array[5] = this.ty;
            this.array[6] = 0;
            this.array[7] = 0;
            this.array[8] = 1;
        }
        return array;
    };
    PIXI.identityMatrix = new PIXI.Matrix();
    PIXI.DisplayObject = function() {
        this.position = new PIXI.Point();
        this.scale = new PIXI.Point(1, 1);
        this.pivot = new PIXI.Point(0, 0);
        this.rotation = 0;
        this.alpha = 1;
        this.visible = true;
        this.hitArea = null;
        this.buttonMode = false;
        this.renderable = false;
        this.parent = null;
        this.stage = null;
        this.worldAlpha = 1;
        this._interactive = false;
        this.defaultCursor = "pointer";
        this.worldTransform = new PIXI.Matrix();
        this.color = [];
        this.dynamic = true;
        this._sr = 0;
        this._cr = 1;
        this.filterArea = null;
        this._bounds = new PIXI.Rectangle(0, 0, 1, 1);
        this._currentBounds = null;
        this._mask = null;
        this._cacheAsBitmap = false;
        this._cacheIsDirty = false;
    };
    PIXI.DisplayObject.prototype.constructor = PIXI.DisplayObject;
    PIXI.DisplayObject.prototype.setInteractive = function(interactive) {
        this.interactive = interactive;
    };
    Object.defineProperty(PIXI.DisplayObject.prototype, "interactive", {
        get: function() {
            return this._interactive;
        },
        set: function(value) {
            this._interactive = value;
            if (this.stage) this.stage.dirty = true;
        }
    });
    Object.defineProperty(PIXI.DisplayObject.prototype, "worldVisible", {
        get: function() {
            var item = this;
            do {
                if (!item.visible) return false;
                item = item.parent;
            } while (item);
            return true;
        }
    });
    Object.defineProperty(PIXI.DisplayObject.prototype, "mask", {
        get: function() {
            return this._mask;
        },
        set: function(value) {
            if (this._mask) this._mask.isMask = false;
            this._mask = value;
            if (this._mask) this._mask.isMask = true;
        }
    });
    Object.defineProperty(PIXI.DisplayObject.prototype, "filters", {
        get: function() {
            return this._filters;
        },
        set: function(value) {
            if (value) {
                var passes = [];
                for (var i = 0; i < value.length; i++) {
                    var filterPasses = value[i].passes;
                    for (var j = 0; j < filterPasses.length; j++) {
                        passes.push(filterPasses[j]);
                    }
                }
                this._filterBlock = {
                    target: this,
                    filterPasses: passes
                };
            }
            this._filters = value;
        }
    });
    Object.defineProperty(PIXI.DisplayObject.prototype, "cacheAsBitmap", {
        get: function() {
            return this._cacheAsBitmap;
        },
        set: function(value) {
            if (this._cacheAsBitmap === value) return;
            if (value) {
                this._generateCachedSprite();
            } else {
                this._destroyCachedSprite();
            }
            this._cacheAsBitmap = value;
        }
    });
    PIXI.DisplayObject.prototype.updateTransform = function() {
        if (this.rotation !== this.rotationCache) {
            this.rotationCache = this.rotation;
            this._sr = Math.sin(this.rotation);
            this._cr = Math.cos(this.rotation);
        }
        var parentTransform = this.parent.worldTransform;
        var worldTransform = this.worldTransform;
        var px = this.pivot.x;
        var py = this.pivot.y;
        var a00 = this._cr * this.scale.x, a01 = -this._sr * this.scale.y, a10 = this._sr * this.scale.x, a11 = this._cr * this.scale.y, a02 = this.position.x - a00 * px - py * a01, a12 = this.position.y - a11 * py - px * a10, b00 = parentTransform.a, b01 = parentTransform.b, b10 = parentTransform.c, b11 = parentTransform.d;
        worldTransform.a = b00 * a00 + b01 * a10;
        worldTransform.b = b00 * a01 + b01 * a11;
        worldTransform.tx = b00 * a02 + b01 * a12 + parentTransform.tx;
        worldTransform.c = b10 * a00 + b11 * a10;
        worldTransform.d = b10 * a01 + b11 * a11;
        worldTransform.ty = b10 * a02 + b11 * a12 + parentTransform.ty;
        this.worldAlpha = this.alpha * this.parent.worldAlpha;
    };
    PIXI.DisplayObject.prototype.getBounds = function(matrix) {
        matrix = matrix;
        return PIXI.EmptyRectangle;
    };
    PIXI.DisplayObject.prototype.getLocalBounds = function() {
        return this.getBounds(PIXI.identityMatrix);
    };
    PIXI.DisplayObject.prototype.setStageReference = function(stage) {
        this.stage = stage;
        if (this._interactive) this.stage.dirty = true;
    };
    PIXI.DisplayObject.prototype.generateTexture = function(renderer) {
        var bounds = this.getLocalBounds();
        var renderTexture = new PIXI.RenderTexture(bounds.width | 0, bounds.height | 0, renderer);
        renderTexture.render(this, new PIXI.Point(-bounds.x, -bounds.y));
        return renderTexture;
    };
    PIXI.DisplayObject.prototype.updateCache = function() {
        this._generateCachedSprite();
    };
    PIXI.DisplayObject.prototype._renderCachedSprite = function(renderSession) {
        if (renderSession.gl) {
            PIXI.Sprite.prototype._renderWebGL.call(this._cachedSprite, renderSession);
        } else {
            PIXI.Sprite.prototype._renderCanvas.call(this._cachedSprite, renderSession);
        }
    };
    PIXI.DisplayObject.prototype._generateCachedSprite = function() {
        this._cacheAsBitmap = false;
        var bounds = this.getLocalBounds();
        if (!this._cachedSprite) {
            var renderTexture = new PIXI.RenderTexture(bounds.width | 0, bounds.height | 0);
            this._cachedSprite = new PIXI.Sprite(renderTexture);
            this._cachedSprite.worldTransform = this.worldTransform;
        } else {
            this._cachedSprite.texture.resize(bounds.width | 0, bounds.height | 0);
        }
        var tempFilters = this._filters;
        this._filters = null;
        this._cachedSprite.filters = tempFilters;
        this._cachedSprite.texture.render(this, new PIXI.Point(-bounds.x, -bounds.y));
        this._filters = tempFilters;
        this._cacheAsBitmap = true;
    };
    PIXI.DisplayObject.prototype._destroyCachedSprite = function() {
        if (!this._cachedSprite) return;
        this._cachedSprite.texture.destroy(true);
        this._cachedSprite = null;
    };
    PIXI.DisplayObject.prototype._renderWebGL = function(renderSession) {
        renderSession = renderSession;
    };
    PIXI.DisplayObject.prototype._renderCanvas = function(renderSession) {
        renderSession = renderSession;
    };
    Object.defineProperty(PIXI.DisplayObject.prototype, "x", {
        get: function() {
            return this.position.x;
        },
        set: function(value) {
            this.position.x = value;
        }
    });
    Object.defineProperty(PIXI.DisplayObject.prototype, "y", {
        get: function() {
            return this.position.y;
        },
        set: function(value) {
            this.position.y = value;
        }
    });
    PIXI.DisplayObjectContainer = function() {
        PIXI.DisplayObject.call(this);
        this.children = [];
    };
    PIXI.DisplayObjectContainer.prototype = Object.create(PIXI.DisplayObject.prototype);
    PIXI.DisplayObjectContainer.prototype.constructor = PIXI.DisplayObjectContainer;
    PIXI.DisplayObjectContainer.prototype.addChild = function(child) {
        this.addChildAt(child, this.children.length);
    };
    PIXI.DisplayObjectContainer.prototype.addChildAt = function(child, index) {
        if (index >= 0 && index <= this.children.length) {
            if (child.parent) {
                child.parent.removeChild(child);
            }
            child.parent = this;
            this.children.splice(index, 0, child);
            if (this.stage) child.setStageReference(this.stage);
        } else {
            throw new Error(child + " The index " + index + " supplied is out of bounds " + this.children.length);
        }
    };
    PIXI.DisplayObjectContainer.prototype.swapChildren = function(child, child2) {
        if (child === child2) {
            return;
        }
        var index1 = this.children.indexOf(child);
        var index2 = this.children.indexOf(child2);
        if (index1 < 0 || index2 < 0) {
            throw new Error("swapChildren: Both the supplied DisplayObjects must be a child of the caller.");
        }
        this.children[index1] = child2;
        this.children[index2] = child;
    };
    PIXI.DisplayObjectContainer.prototype.getChildAt = function(index) {
        if (index >= 0 && index < this.children.length) {
            return this.children[index];
        } else {
            throw new Error("Supplied index does not exist in the child list, or the supplied DisplayObject must be a child of the caller");
        }
    };
    PIXI.DisplayObjectContainer.prototype.removeChild = function(child) {
        return this.removeChildAt(this.children.indexOf(child));
    };
    PIXI.DisplayObjectContainer.prototype.removeChildAt = function(index) {
        var child = this.getChildAt(index);
        if (this.stage) child.removeStageReference();
        child.parent = undefined;
        this.children.splice(index, 1);
        return child;
    };
    PIXI.DisplayObjectContainer.prototype.removeChildren = function(beginIndex, endIndex) {
        var begin = beginIndex || 0;
        var end = typeof endIndex === "number" ? endIndex : this.children.length;
        var range = end - begin;
        if (range > 0 && range <= end) {
            var removed = this.children.splice(begin, range);
            for (var i = 0; i < removed.length; i++) {
                var child = removed[i];
                if (this.stage) child.removeStageReference();
                child.parent = undefined;
            }
            return removed;
        } else {
            throw new Error("Range Error, numeric values are outside the acceptable range");
        }
    };
    PIXI.DisplayObjectContainer.prototype.updateTransform = function() {
        if (!this.visible) return;
        PIXI.DisplayObject.prototype.updateTransform.call(this);
        if (this._cacheAsBitmap) return;
        for (var i = 0, j = this.children.length; i < j; i++) {
            this.children[i].updateTransform();
        }
    };
    PIXI.DisplayObjectContainer.prototype.getBounds = function(matrix) {
        if (this.children.length === 0) return PIXI.EmptyRectangle;
        if (matrix) {
            var matrixCache = this.worldTransform;
            this.worldTransform = matrix;
            this.updateTransform();
            this.worldTransform = matrixCache;
        }
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        var childBounds;
        var childMaxX;
        var childMaxY;
        var childVisible = false;
        for (var i = 0, j = this.children.length; i < j; i++) {
            var child = this.children[i];
            if (!child.visible) continue;
            childVisible = true;
            childBounds = this.children[i].getBounds(matrix);
            minX = minX < childBounds.x ? minX : childBounds.x;
            minY = minY < childBounds.y ? minY : childBounds.y;
            childMaxX = childBounds.width + childBounds.x;
            childMaxY = childBounds.height + childBounds.y;
            maxX = maxX > childMaxX ? maxX : childMaxX;
            maxY = maxY > childMaxY ? maxY : childMaxY;
        }
        if (!childVisible) return PIXI.EmptyRectangle;
        var bounds = this._bounds;
        bounds.x = minX;
        bounds.y = minY;
        bounds.width = maxX - minX;
        bounds.height = maxY - minY;
        return bounds;
    };
    PIXI.DisplayObjectContainer.prototype.getLocalBounds = function() {
        var matrixCache = this.worldTransform;
        this.worldTransform = PIXI.identityMatrix;
        for (var i = 0, j = this.children.length; i < j; i++) {
            this.children[i].updateTransform();
        }
        var bounds = this.getBounds();
        this.worldTransform = matrixCache;
        return bounds;
    };
    PIXI.DisplayObjectContainer.prototype.setStageReference = function(stage) {
        this.stage = stage;
        if (this._interactive) this.stage.dirty = true;
        for (var i = 0, j = this.children.length; i < j; i++) {
            var child = this.children[i];
            child.setStageReference(stage);
        }
    };
    PIXI.DisplayObjectContainer.prototype.removeStageReference = function() {
        for (var i = 0, j = this.children.length; i < j; i++) {
            var child = this.children[i];
            child.removeStageReference();
        }
        if (this._interactive) this.stage.dirty = true;
        this.stage = null;
    };
    PIXI.DisplayObjectContainer.prototype._renderWebGL = function(renderSession) {
        if (!this.visible || this.alpha <= 0) return;
        if (this._cacheAsBitmap) {
            this._renderCachedSprite(renderSession);
            return;
        }
        var i, j;
        if (this._mask || this._filters) {
            if (this._mask) {
                renderSession.spriteBatch.stop();
                renderSession.maskManager.pushMask(this.mask, renderSession);
                renderSession.spriteBatch.start();
            }
            if (this._filters) {
                renderSession.spriteBatch.flush();
                renderSession.filterManager.pushFilter(this._filterBlock);
            }
            for (i = 0, j = this.children.length; i < j; i++) {
                this.children[i]._renderWebGL(renderSession);
            }
            renderSession.spriteBatch.stop();
            if (this._filters) renderSession.filterManager.popFilter();
            if (this._mask) renderSession.maskManager.popMask(renderSession);
            renderSession.spriteBatch.start();
        } else {
            for (i = 0, j = this.children.length; i < j; i++) {
                this.children[i]._renderWebGL(renderSession);
            }
        }
    };
    PIXI.DisplayObjectContainer.prototype._renderCanvas = function(renderSession) {
        if (this.visible === false || this.alpha === 0) return;
        if (this._cacheAsBitmap) {
            this._renderCachedSprite(renderSession);
            return;
        }
        if (this._mask) {
            renderSession.maskManager.pushMask(this._mask, renderSession.context);
        }
        for (var i = 0, j = this.children.length; i < j; i++) {
            var child = this.children[i];
            child._renderCanvas(renderSession);
        }
        if (this._mask) {
            renderSession.maskManager.popMask(renderSession.context);
        }
    };
    PIXI.Sprite = function(texture) {
        PIXI.DisplayObjectContainer.call(this);
        this.anchor = new PIXI.Point();
        this.texture = texture;
        this._width = 0;
        this._height = 0;
        this.tint = 16777215;
        this.blendMode = PIXI.blendModes.NORMAL;
        if (texture.baseTexture.hasLoaded) {
            this.onTextureUpdate();
        } else {
            this.onTextureUpdateBind = this.onTextureUpdate.bind(this);
            this.texture.addEventListener("update", this.onTextureUpdateBind);
        }
        this.renderable = true;
    };
    PIXI.Sprite.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    PIXI.Sprite.prototype.constructor = PIXI.Sprite;
    Object.defineProperty(PIXI.Sprite.prototype, "width", {
        get: function() {
            return this.scale.x * this.texture.frame.width;
        },
        set: function(value) {
            this.scale.x = value / this.texture.frame.width;
            this._width = value;
        }
    });
    Object.defineProperty(PIXI.Sprite.prototype, "height", {
        get: function() {
            return this.scale.y * this.texture.frame.height;
        },
        set: function(value) {
            this.scale.y = value / this.texture.frame.height;
            this._height = value;
        }
    });
    PIXI.Sprite.prototype.setTexture = function(texture) {
        if (this.texture.baseTexture !== texture.baseTexture) {
            this.textureChange = true;
            this.texture = texture;
        } else {
            this.texture = texture;
        }
        this.cachedTint = 16777215;
        this.updateFrame = true;
    };
    PIXI.Sprite.prototype.onTextureUpdate = function() {
        if (this._width) this.scale.x = this._width / this.texture.frame.width;
        if (this._height) this.scale.y = this._height / this.texture.frame.height;
        this.updateFrame = true;
    };
    PIXI.Sprite.prototype.getBounds = function(matrix) {
        var width = this.texture.frame.width;
        var height = this.texture.frame.height;
        var w0 = width * (1 - this.anchor.x);
        var w1 = width * -this.anchor.x;
        var h0 = height * (1 - this.anchor.y);
        var h1 = height * -this.anchor.y;
        var worldTransform = matrix || this.worldTransform;
        var a = worldTransform.a;
        var b = worldTransform.c;
        var c = worldTransform.b;
        var d = worldTransform.d;
        var tx = worldTransform.tx;
        var ty = worldTransform.ty;
        var x1 = a * w1 + c * h1 + tx;
        var y1 = d * h1 + b * w1 + ty;
        var x2 = a * w0 + c * h1 + tx;
        var y2 = d * h1 + b * w0 + ty;
        var x3 = a * w0 + c * h0 + tx;
        var y3 = d * h0 + b * w0 + ty;
        var x4 = a * w1 + c * h0 + tx;
        var y4 = d * h0 + b * w1 + ty;
        var maxX = -Infinity;
        var maxY = -Infinity;
        var minX = Infinity;
        var minY = Infinity;
        minX = x1 < minX ? x1 : minX;
        minX = x2 < minX ? x2 : minX;
        minX = x3 < minX ? x3 : minX;
        minX = x4 < minX ? x4 : minX;
        minY = y1 < minY ? y1 : minY;
        minY = y2 < minY ? y2 : minY;
        minY = y3 < minY ? y3 : minY;
        minY = y4 < minY ? y4 : minY;
        maxX = x1 > maxX ? x1 : maxX;
        maxX = x2 > maxX ? x2 : maxX;
        maxX = x3 > maxX ? x3 : maxX;
        maxX = x4 > maxX ? x4 : maxX;
        maxY = y1 > maxY ? y1 : maxY;
        maxY = y2 > maxY ? y2 : maxY;
        maxY = y3 > maxY ? y3 : maxY;
        maxY = y4 > maxY ? y4 : maxY;
        var bounds = this._bounds;
        bounds.x = minX;
        bounds.width = maxX - minX;
        bounds.y = minY;
        bounds.height = maxY - minY;
        this._currentBounds = bounds;
        return bounds;
    };
    PIXI.Sprite.prototype._renderWebGL = function(renderSession) {
        if (!this.visible || this.alpha <= 0) return;
        var i, j;
        if (this._mask || this._filters) {
            var spriteBatch = renderSession.spriteBatch;
            if (this._mask) {
                spriteBatch.stop();
                renderSession.maskManager.pushMask(this.mask, renderSession);
                spriteBatch.start();
            }
            if (this._filters) {
                spriteBatch.flush();
                renderSession.filterManager.pushFilter(this._filterBlock);
            }
            spriteBatch.render(this);
            for (i = 0, j = this.children.length; i < j; i++) {
                this.children[i]._renderWebGL(renderSession);
            }
            spriteBatch.stop();
            if (this._filters) renderSession.filterManager.popFilter();
            if (this._mask) renderSession.maskManager.popMask(renderSession);
            spriteBatch.start();
        } else {
            renderSession.spriteBatch.render(this);
            for (i = 0, j = this.children.length; i < j; i++) {
                this.children[i]._renderWebGL(renderSession);
            }
        }
    };
    PIXI.Sprite.prototype._renderCanvas = function(renderSession) {
        if (this.visible === false || this.alpha === 0) return;
        var frame = this.texture.frame;
        var context = renderSession.context;
        var texture = this.texture;
        if (this.blendMode !== renderSession.currentBlendMode) {
            renderSession.currentBlendMode = this.blendMode;
            context.globalCompositeOperation = PIXI.blendModesCanvas[renderSession.currentBlendMode];
        }
        if (this._mask) {
            renderSession.maskManager.pushMask(this._mask, renderSession.context);
        }
        if (frame && frame.width && frame.height && texture.baseTexture.source) {
            context.globalAlpha = this.worldAlpha;
            var transform = this.worldTransform;
            if (renderSession.roundPixels) {
                context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx | 0, transform.ty | 0);
            } else {
                context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx, transform.ty);
            }
            if (renderSession.smoothProperty && renderSession.scaleMode !== this.texture.baseTexture.scaleMode) {
                renderSession.scaleMode = this.texture.baseTexture.scaleMode;
                context[renderSession.smoothProperty] = renderSession.scaleMode === PIXI.scaleModes.LINEAR;
            }
            if (this.tint !== 16777215) {
                if (this.cachedTint !== this.tint) {
                    if (!texture.baseTexture.hasLoaded) return;
                    this.cachedTint = this.tint;
                    this.tintedTexture = PIXI.CanvasTinter.getTintedTexture(this, this.tint);
                }
                context.drawImage(this.tintedTexture, 0, 0, frame.width, frame.height, this.anchor.x * -frame.width, this.anchor.y * -frame.height, frame.width, frame.height);
            } else {
                if (texture.trim) {
                    var trim = texture.trim;
                    context.drawImage(this.texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, trim.x - this.anchor.x * trim.width, trim.y - this.anchor.y * trim.height, frame.width, frame.height);
                } else {
                    context.drawImage(this.texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, this.anchor.x * -frame.width, this.anchor.y * -frame.height, frame.width, frame.height);
                }
            }
        }
        for (var i = 0, j = this.children.length; i < j; i++) {
            var child = this.children[i];
            child._renderCanvas(renderSession);
        }
        if (this._mask) {
            renderSession.maskManager.popMask(renderSession.context);
        }
    };
    PIXI.Sprite.fromFrame = function(frameId) {
        var texture = PIXI.TextureCache[frameId];
        if (!texture) throw new Error('The frameId "' + frameId + '" does not exist in the texture cache' + this);
        return new PIXI.Sprite(texture);
    };
    PIXI.Sprite.fromImage = function(imageId, crossorigin, scaleMode) {
        var texture = PIXI.Texture.fromImage(imageId, crossorigin, scaleMode);
        return new PIXI.Sprite(texture);
    };
    PIXI.SpriteBatch = function(texture) {
        PIXI.DisplayObjectContainer.call(this);
        this.textureThing = texture;
        this.ready = false;
    };
    PIXI.SpriteBatch.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    PIXI.SpriteBatch.constructor = PIXI.SpriteBatch;
    PIXI.SpriteBatch.prototype.initWebGL = function(gl) {
        this.fastSpriteBatch = new PIXI.WebGLFastSpriteBatch(gl);
        this.ready = true;
    };
    PIXI.SpriteBatch.prototype.updateTransform = function() {
        PIXI.DisplayObject.prototype.updateTransform.call(this);
    };
    PIXI.SpriteBatch.prototype._renderWebGL = function(renderSession) {
        if (!this.visible || this.alpha <= 0 || !this.children.length) return;
        if (!this.ready) this.initWebGL(renderSession.gl);
        renderSession.spriteBatch.stop();
        renderSession.shaderManager.activateShader(renderSession.shaderManager.fastShader);
        this.fastSpriteBatch.begin(this, renderSession);
        this.fastSpriteBatch.render(this);
        renderSession.shaderManager.activateShader(renderSession.shaderManager.defaultShader);
        renderSession.spriteBatch.start();
    };
    PIXI.SpriteBatch.prototype._renderCanvas = function(renderSession) {
        var context = renderSession.context;
        context.globalAlpha = this.worldAlpha;
        PIXI.DisplayObject.prototype.updateTransform.call(this);
        var transform = this.worldTransform;
        var isRotated = true;
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            if (!child.visible) continue;
            var texture = child.texture;
            var frame = texture.frame;
            context.globalAlpha = this.worldAlpha * child.alpha;
            if (child.rotation % (Math.PI * 2) === 0) {
                if (isRotated) {
                    context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx, transform.ty);
                    isRotated = false;
                }
                context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, child.anchor.x * (-frame.width * child.scale.x) + child.position.x + .5 | 0, child.anchor.y * (-frame.height * child.scale.y) + child.position.y + .5 | 0, frame.width * child.scale.x, frame.height * child.scale.y);
            } else {
                if (!isRotated) isRotated = true;
                PIXI.DisplayObject.prototype.updateTransform.call(child);
                var childTransform = child.worldTransform;
                if (renderSession.roundPixels) {
                    context.setTransform(childTransform.a, childTransform.c, childTransform.b, childTransform.d, childTransform.tx | 0, childTransform.ty | 0);
                } else {
                    context.setTransform(childTransform.a, childTransform.c, childTransform.b, childTransform.d, childTransform.tx, childTransform.ty);
                }
                context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, child.anchor.x * -frame.width + .5 | 0, child.anchor.y * -frame.height + .5 | 0, frame.width, frame.height);
            }
        }
    };
    PIXI.MovieClip = function(textures) {
        PIXI.Sprite.call(this, textures[0]);
        this.textures = textures;
        this.animationSpeed = 1;
        this.loop = true;
        this.onComplete = null;
        this.currentFrame = 0;
        this.playing = false;
    };
    PIXI.MovieClip.prototype = Object.create(PIXI.Sprite.prototype);
    PIXI.MovieClip.prototype.constructor = PIXI.MovieClip;
    Object.defineProperty(PIXI.MovieClip.prototype, "totalFrames", {
        get: function() {
            return this.textures.length;
        }
    });
    PIXI.MovieClip.prototype.stop = function() {
        this.playing = false;
    };
    PIXI.MovieClip.prototype.play = function() {
        this.playing = true;
    };
    PIXI.MovieClip.prototype.gotoAndStop = function(frameNumber) {
        this.playing = false;
        this.currentFrame = frameNumber;
        var round = this.currentFrame + .5 | 0;
        this.setTexture(this.textures[round % this.textures.length]);
    };
    PIXI.MovieClip.prototype.gotoAndPlay = function(frameNumber) {
        this.currentFrame = frameNumber;
        this.playing = true;
    };
    PIXI.MovieClip.prototype.updateTransform = function() {
        PIXI.Sprite.prototype.updateTransform.call(this);
        if (!this.playing) return;
        this.currentFrame += this.animationSpeed;
        var round = this.currentFrame + .5 | 0;
        if (this.loop || round < this.textures.length) {
            this.setTexture(this.textures[round % this.textures.length]);
        } else if (round >= this.textures.length) {
            this.gotoAndStop(this.textures.length - 1);
            if (this.onComplete) {
                this.onComplete();
            }
        }
    };
    PIXI.FilterBlock = function() {
        this.visible = true;
        this.renderable = true;
    };
    PIXI.Text = function(text, style) {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        PIXI.Sprite.call(this, PIXI.Texture.fromCanvas(this.canvas));
        this.setText(text);
        this.setStyle(style);
        this.updateText();
        this.dirty = false;
    };
    PIXI.Text.prototype = Object.create(PIXI.Sprite.prototype);
    PIXI.Text.prototype.constructor = PIXI.Text;
    PIXI.Text.prototype.setStyle = function(style) {
        style = style || {};
        style.font = style.font || "bold 20pt Arial";
        style.fill = style.fill || "black";
        style.align = style.align || "left";
        style.stroke = style.stroke || "black";
        style.strokeThickness = style.strokeThickness || 0;
        style.wordWrap = style.wordWrap || false;
        style.wordWrapWidth = style.wordWrapWidth || 100;
        style.wordWrapWidth = style.wordWrapWidth || 100;
        style.dropShadow = style.dropShadow || false;
        style.dropShadowAngle = style.dropShadowAngle || Math.PI / 6;
        style.dropShadowDistance = style.dropShadowDistance || 4;
        style.dropShadowColor = style.dropShadowColor || "black";
        this.style = style;
        this.dirty = true;
    };
    PIXI.Text.prototype.setText = function(text) {
        this.text = text.toString() || " ";
        this.dirty = true;
    };
    PIXI.Text.prototype.updateText = function() {
        this.context.font = this.style.font;
        var outputText = this.text;
        if (this.style.wordWrap) outputText = this.wordWrap(this.text);
        var lines = outputText.split(/(?:\r\n|\r|\n)/);
        var lineWidths = [];
        var maxLineWidth = 0;
        for (var i = 0; i < lines.length; i++) {
            var lineWidth = this.context.measureText(lines[i]).width;
            lineWidths[i] = lineWidth;
            maxLineWidth = Math.max(maxLineWidth, lineWidth);
        }
        var width = maxLineWidth + this.style.strokeThickness;
        if (this.style.dropShadow) width += this.style.dropShadowDistance;
        this.canvas.width = width;
        var lineHeight = this.determineFontHeight("font: " + this.style.font + ";") + this.style.strokeThickness;
        var height = lineHeight * lines.length;
        if (this.style.dropShadow) height += this.style.dropShadowDistance;
        this.canvas.height = height;
        if (navigator.isCocoonJS) this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.font = this.style.font;
        this.context.strokeStyle = this.style.stroke;
        this.context.lineWidth = this.style.strokeThickness;
        this.context.textBaseline = "top";
        var linePositionX;
        var linePositionY;
        if (this.style.dropShadow) {
            this.context.fillStyle = this.style.dropShadowColor;
            var xShadowOffset = Math.sin(this.style.dropShadowAngle) * this.style.dropShadowDistance;
            var yShadowOffset = Math.cos(this.style.dropShadowAngle) * this.style.dropShadowDistance;
            for (i = 0; i < lines.length; i++) {
                linePositionX = this.style.strokeThickness / 2;
                linePositionY = this.style.strokeThickness / 2 + i * lineHeight;
                if (this.style.align === "right") {
                    linePositionX += maxLineWidth - lineWidths[i];
                } else if (this.style.align === "center") {
                    linePositionX += (maxLineWidth - lineWidths[i]) / 2;
                }
                if (this.style.fill) {
                    this.context.fillText(lines[i], linePositionX + xShadowOffset, linePositionY + yShadowOffset);
                }
            }
        }
        this.context.fillStyle = this.style.fill;
        for (i = 0; i < lines.length; i++) {
            linePositionX = this.style.strokeThickness / 2;
            linePositionY = this.style.strokeThickness / 2 + i * lineHeight;
            if (this.style.align === "right") {
                linePositionX += maxLineWidth - lineWidths[i];
            } else if (this.style.align === "center") {
                linePositionX += (maxLineWidth - lineWidths[i]) / 2;
            }
            if (this.style.stroke && this.style.strokeThickness) {
                this.context.strokeText(lines[i], linePositionX, linePositionY);
            }
            if (this.style.fill) {
                this.context.fillText(lines[i], linePositionX, linePositionY);
            }
        }
        this.updateTexture();
    };
    PIXI.Text.prototype.updateTexture = function() {
        this.texture.baseTexture.width = this.canvas.width;
        this.texture.baseTexture.height = this.canvas.height;
        this.texture.frame.width = this.canvas.width;
        this.texture.frame.height = this.canvas.height;
        this._width = this.canvas.width;
        this._height = this.canvas.height;
        this.requiresUpdate = true;
    };
    PIXI.Text.prototype._renderWebGL = function(renderSession) {
        if (this.requiresUpdate) {
            this.requiresUpdate = false;
            PIXI.updateWebGLTexture(this.texture.baseTexture, renderSession.gl);
        }
        PIXI.Sprite.prototype._renderWebGL.call(this, renderSession);
    };
    PIXI.Text.prototype.updateTransform = function() {
        if (this.dirty) {
            this.updateText();
            this.dirty = false;
        }
        PIXI.Sprite.prototype.updateTransform.call(this);
    };
    PIXI.Text.prototype.determineFontHeight = function(fontStyle) {
        var result = PIXI.Text.heightCache[fontStyle];
        if (!result) {
            var body = document.getElementsByTagName("body")[0];
            var dummy = document.createElement("div");
            var dummyText = document.createTextNode("M");
            dummy.appendChild(dummyText);
            dummy.setAttribute("style", fontStyle + ";position:absolute;top:0;left:0");
            body.appendChild(dummy);
            result = dummy.offsetHeight;
            PIXI.Text.heightCache[fontStyle] = result;
            body.removeChild(dummy);
        }
        return result;
    };
    PIXI.Text.prototype.wordWrap = function(text) {
        var result = "";
        var lines = text.split("\n");
        for (var i = 0; i < lines.length; i++) {
            var spaceLeft = this.style.wordWrapWidth;
            var words = lines[i].split(" ");
            for (var j = 0; j < words.length; j++) {
                var wordWidth = this.context.measureText(words[j]).width;
                var wordWidthWithSpace = wordWidth + this.context.measureText(" ").width;
                if (wordWidthWithSpace > spaceLeft) {
                    if (j > 0) {
                        result += "\n";
                    }
                    result += words[j] + " ";
                    spaceLeft = this.style.wordWrapWidth - wordWidth;
                } else {
                    spaceLeft -= wordWidthWithSpace;
                    result += words[j] + " ";
                }
            }
            if (i < lines.length - 1) {
                result += "\n";
            }
        }
        return result;
    };
    PIXI.Text.prototype.destroy = function(destroyTexture) {
        if (destroyTexture) {
            this.texture.destroy();
        }
    };
    PIXI.Text.heightCache = {};
    PIXI.BitmapText = function(text, style) {
        PIXI.DisplayObjectContainer.call(this);
        this._pool = [];
        this.setText(text);
        this.setStyle(style);
        this.updateText();
        this.dirty = false;
    };
    PIXI.BitmapText.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    PIXI.BitmapText.prototype.constructor = PIXI.BitmapText;
    PIXI.BitmapText.prototype.setText = function(text) {
        this.text = text || " ";
        this.dirty = true;
    };
    PIXI.BitmapText.prototype.setStyle = function(style) {
        style = style || {};
        style.align = style.align || "left";
        this.style = style;
        var font = style.font.split(" ");
        this.fontName = font[font.length - 1];
        this.fontSize = font.length >= 2 ? parseInt(font[font.length - 2], 10) : PIXI.BitmapText.fonts[this.fontName].size;
        this.dirty = true;
        this.tint = style.tint;
    };
    PIXI.BitmapText.prototype.updateText = function() {
        var data = PIXI.BitmapText.fonts[this.fontName];
        var pos = new PIXI.Point();
        var prevCharCode = null;
        var chars = [];
        var maxLineWidth = 0;
        var lineWidths = [];
        var line = 0;
        var scale = this.fontSize / data.size;
        for (var i = 0; i < this.text.length; i++) {
            var charCode = this.text.charCodeAt(i);
            if (/(?:\r\n|\r|\n)/.test(this.text.charAt(i))) {
                lineWidths.push(pos.x);
                maxLineWidth = Math.max(maxLineWidth, pos.x);
                line++;
                pos.x = 0;
                pos.y += data.lineHeight;
                prevCharCode = null;
                continue;
            }
            var charData = data.chars[charCode];
            if (!charData) continue;
            if (prevCharCode && charData[prevCharCode]) {
                pos.x += charData.kerning[prevCharCode];
            }
            chars.push({
                texture: charData.texture,
                line: line,
                charCode: charCode,
                position: new PIXI.Point(pos.x + charData.xOffset, pos.y + charData.yOffset)
            });
            pos.x += charData.xAdvance;
            prevCharCode = charCode;
        }
        lineWidths.push(pos.x);
        maxLineWidth = Math.max(maxLineWidth, pos.x);
        var lineAlignOffsets = [];
        for (i = 0; i <= line; i++) {
            var alignOffset = 0;
            if (this.style.align === "right") {
                alignOffset = maxLineWidth - lineWidths[i];
            } else if (this.style.align === "center") {
                alignOffset = (maxLineWidth - lineWidths[i]) / 2;
            }
            lineAlignOffsets.push(alignOffset);
        }
        var lenChildren = this.children.length;
        var lenChars = chars.length;
        var tint = this.tint || 16777215;
        for (i = 0; i < lenChars; i++) {
            var c = i < lenChildren ? this.children[i] : this._pool.pop();
            if (c) c.setTexture(chars[i].texture); else c = new PIXI.Sprite(chars[i].texture);
            c.position.x = (chars[i].position.x + lineAlignOffsets[chars[i].line]) * scale;
            c.position.y = chars[i].position.y * scale;
            c.scale.x = c.scale.y = scale;
            c.tint = tint;
            if (!c.parent) this.addChild(c);
        }
        while (this.children.length > lenChars) {
            var child = this.getChildAt(this.children.length - 1);
            this._pool.push(child);
            this.removeChild(child);
        }
        this.textWidth = maxLineWidth * scale;
        this.textHeight = (pos.y + data.lineHeight) * scale;
    };
    PIXI.BitmapText.prototype.updateTransform = function() {
        if (this.dirty) {
            this.updateText();
            this.dirty = false;
        }
        PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
    };
    PIXI.BitmapText.fonts = {};
    PIXI.InteractionData = function() {
        this.global = new PIXI.Point();
        this.local = new PIXI.Point();
        this.target = null;
        this.originalEvent = null;
    };
    PIXI.InteractionData.prototype.getLocalPosition = function(displayObject) {
        var worldTransform = displayObject.worldTransform;
        var global = this.global;
        var a00 = worldTransform.a, a01 = worldTransform.b, a02 = worldTransform.tx, a10 = worldTransform.c, a11 = worldTransform.d, a12 = worldTransform.ty, id = 1 / (a00 * a11 + a01 * -a10);
        return new PIXI.Point(a11 * id * global.x + -a01 * id * global.y + (a12 * a01 - a02 * a11) * id, a00 * id * global.y + -a10 * id * global.x + (-a12 * a00 + a02 * a10) * id);
    };
    PIXI.InteractionData.prototype.constructor = PIXI.InteractionData;
    PIXI.InteractionManager = function(stage) {
        this.stage = stage;
        this.mouse = new PIXI.InteractionData();
        this.touchs = {};
        this.tempPoint = new PIXI.Point();
        this.mouseoverEnabled = true;
        this.pool = [];
        this.interactiveItems = [];
        this.interactionDOMElement = null;
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseOut = this.onMouseOut.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchEnd = this.onTouchEnd.bind(this);
        this.onTouchMove = this.onTouchMove.bind(this);
        this.last = 0;
        this.currentCursorStyle = "inherit";
        this.mouseOut = false;
    };
    PIXI.InteractionManager.prototype.constructor = PIXI.InteractionManager;
    PIXI.InteractionManager.prototype.collectInteractiveSprite = function(displayObject, iParent) {
        var children = displayObject.children;
        var length = children.length;
        for (var i = length - 1; i >= 0; i--) {
            var child = children[i];
            if (child._interactive) {
                iParent.interactiveChildren = true;
                this.interactiveItems.push(child);
                if (child.children.length > 0) {
                    this.collectInteractiveSprite(child, child);
                }
            } else {
                child.__iParent = null;
                if (child.children.length > 0) {
                    this.collectInteractiveSprite(child, iParent);
                }
            }
        }
    };
    PIXI.InteractionManager.prototype.setTarget = function(target) {
        this.target = target;
        if (this.interactionDOMElement === null) {
            this.setTargetDomElement(target.view);
        }
    };
    PIXI.InteractionManager.prototype.setTargetDomElement = function(domElement) {
        this.removeEvents();
        if (window.navigator.msPointerEnabled) {
            domElement.style["-ms-content-zooming"] = "none";
            domElement.style["-ms-touch-action"] = "none";
        }
        this.interactionDOMElement = domElement;
        domElement.addEventListener("mousemove", this.onMouseMove, true);
        domElement.addEventListener("mousedown", this.onMouseDown, true);
        domElement.addEventListener("mouseout", this.onMouseOut, true);
        domElement.addEventListener("touchstart", this.onTouchStart, true);
        domElement.addEventListener("touchend", this.onTouchEnd, true);
        domElement.addEventListener("touchmove", this.onTouchMove, true);
        window.addEventListener("mouseup", this.onMouseUp, true);
    };
    PIXI.InteractionManager.prototype.removeEvents = function() {
        if (!this.interactionDOMElement) return;
        this.interactionDOMElement.style["-ms-content-zooming"] = "";
        this.interactionDOMElement.style["-ms-touch-action"] = "";
        this.interactionDOMElement.removeEventListener("mousemove", this.onMouseMove, true);
        this.interactionDOMElement.removeEventListener("mousedown", this.onMouseDown, true);
        this.interactionDOMElement.removeEventListener("mouseout", this.onMouseOut, true);
        this.interactionDOMElement.removeEventListener("touchstart", this.onTouchStart, true);
        this.interactionDOMElement.removeEventListener("touchend", this.onTouchEnd, true);
        this.interactionDOMElement.removeEventListener("touchmove", this.onTouchMove, true);
        this.interactionDOMElement = null;
        window.removeEventListener("mouseup", this.onMouseUp, true);
    };
    PIXI.InteractionManager.prototype.update = function() {
        if (!this.target) return;
        var now = Date.now();
        var diff = now - this.last;
        diff = diff * PIXI.INTERACTION_FREQUENCY / 1e3;
        if (diff < 1) return;
        this.last = now;
        var i = 0;
        if (this.dirty) {
            this.dirty = false;
            var len = this.interactiveItems.length;
            for (i = 0; i < len; i++) {
                this.interactiveItems[i].interactiveChildren = false;
            }
            this.interactiveItems = [];
            if (this.stage.interactive) this.interactiveItems.push(this.stage);
            this.collectInteractiveSprite(this.stage, this.stage);
        }
        var length = this.interactiveItems.length;
        var cursor = "inherit";
        var over = false;
        for (i = 0; i < length; i++) {
            var item = this.interactiveItems[i];
            item.__hit = this.hitTest(item, this.mouse);
            this.mouse.target = item;
            if (item.__hit && !over) {
                if (item.buttonMode) cursor = item.defaultCursor;
                if (!item.interactiveChildren) over = true;
                if (!item.__isOver) {
                    if (item.mouseover) item.mouseover(this.mouse);
                    item.__isOver = true;
                }
            } else {
                if (item.__isOver) {
                    if (item.mouseout) item.mouseout(this.mouse);
                    item.__isOver = false;
                }
            }
        }
        if (this.currentCursorStyle !== cursor) {
            this.currentCursorStyle = cursor;
            this.interactionDOMElement.style.cursor = cursor;
        }
    };
    PIXI.InteractionManager.prototype.onMouseMove = function(event) {
        this.mouse.originalEvent = event || window.event;
        var rect = this.interactionDOMElement.getBoundingClientRect();
        this.mouse.global.x = (event.clientX - rect.left) * (this.target.width / rect.width);
        this.mouse.global.y = (event.clientY - rect.top) * (this.target.height / rect.height);
        var length = this.interactiveItems.length;
        for (var i = 0; i < length; i++) {
            var item = this.interactiveItems[i];
            if (item.mousemove) {
                item.mousemove(this.mouse);
            }
        }
    };
    PIXI.InteractionManager.prototype.onMouseDown = function(event) {
        this.mouse.originalEvent = event || window.event;
        if (PIXI.AUTO_PREVENT_DEFAULT) this.mouse.originalEvent.preventDefault();
        var length = this.interactiveItems.length;
        for (var i = 0; i < length; i++) {
            var item = this.interactiveItems[i];
            if (item.mousedown || item.click) {
                item.__mouseIsDown = true;
                item.__hit = this.hitTest(item, this.mouse);
                if (item.__hit) {
                    if (item.mousedown) item.mousedown(this.mouse);
                    item.__isDown = true;
                    if (!item.interactiveChildren) break;
                }
            }
        }
    };
    PIXI.InteractionManager.prototype.onMouseOut = function() {
        var length = this.interactiveItems.length;
        this.interactionDOMElement.style.cursor = "inherit";
        for (var i = 0; i < length; i++) {
            var item = this.interactiveItems[i];
            if (item.__isOver) {
                this.mouse.target = item;
                if (item.mouseout) item.mouseout(this.mouse);
                item.__isOver = false;
            }
        }
        this.mouseOut = true;
        this.mouse.global.x = -1e4;
        this.mouse.global.y = -1e4;
    };
    PIXI.InteractionManager.prototype.onMouseUp = function(event) {
        this.mouse.originalEvent = event || window.event;
        var length = this.interactiveItems.length;
        var up = false;
        for (var i = 0; i < length; i++) {
            var item = this.interactiveItems[i];
            item.__hit = this.hitTest(item, this.mouse);
            if (item.__hit && !up) {
                if (item.mouseup) {
                    item.mouseup(this.mouse);
                }
                if (item.__isDown) {
                    if (item.click) item.click(this.mouse);
                }
                if (!item.interactiveChildren) up = true;
            } else {
                if (item.__isDown) {
                    if (item.mouseupoutside) item.mouseupoutside(this.mouse);
                }
            }
            item.__isDown = false;
        }
    };
    PIXI.InteractionManager.prototype.hitTest = function(item, interactionData) {
        var global = interactionData.global;
        if (!item.worldVisible) return false;
        var isSprite = item instanceof PIXI.Sprite, worldTransform = item.worldTransform, a00 = worldTransform.a, a01 = worldTransform.b, a02 = worldTransform.tx, a10 = worldTransform.c, a11 = worldTransform.d, a12 = worldTransform.ty, id = 1 / (a00 * a11 + a01 * -a10), x = a11 * id * global.x + -a01 * id * global.y + (a12 * a01 - a02 * a11) * id, y = a00 * id * global.y + -a10 * id * global.x + (-a12 * a00 + a02 * a10) * id;
        interactionData.target = item;
        if (item.hitArea && item.hitArea.contains) {
            if (item.hitArea.contains(x, y)) {
                interactionData.target = item;
                return true;
            }
            return false;
        } else if (isSprite) {
            var width = item.texture.frame.width, height = item.texture.frame.height, x1 = -width * item.anchor.x, y1;
            if (x > x1 && x < x1 + width) {
                y1 = -height * item.anchor.y;
                if (y > y1 && y < y1 + height) {
                    interactionData.target = item;
                    return true;
                }
            }
        }
        var length = item.children.length;
        for (var i = 0; i < length; i++) {
            var tempItem = item.children[i];
            var hit = this.hitTest(tempItem, interactionData);
            if (hit) {
                interactionData.target = item;
                return true;
            }
        }
        return false;
    };
    PIXI.InteractionManager.prototype.onTouchMove = function(event) {
        var rect = this.interactionDOMElement.getBoundingClientRect();
        var changedTouches = event.changedTouches;
        var touchData;
        var i = 0;
        for (i = 0; i < changedTouches.length; i++) {
            var touchEvent = changedTouches[i];
            touchData = this.touchs[touchEvent.identifier];
            touchData.originalEvent = event || window.event;
            touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
            touchData.global.y = (touchEvent.clientY - rect.top) * (this.target.height / rect.height);
            if (navigator.isCocoonJS) {
                touchData.global.x = touchEvent.clientX;
                touchData.global.y = touchEvent.clientY;
            }
        }
        var length = this.interactiveItems.length;
        for (i = 0; i < length; i++) {
            var item = this.interactiveItems[i];
            if (item.touchmove) item.touchmove(touchData);
        }
    };
    PIXI.InteractionManager.prototype.onTouchStart = function(event) {
        var rect = this.interactionDOMElement.getBoundingClientRect();
        if (PIXI.AUTO_PREVENT_DEFAULT) event.preventDefault();
        var changedTouches = event.changedTouches;
        for (var i = 0; i < changedTouches.length; i++) {
            var touchEvent = changedTouches[i];
            var touchData = this.pool.pop();
            if (!touchData) touchData = new PIXI.InteractionData();
            touchData.originalEvent = event || window.event;
            this.touchs[touchEvent.identifier] = touchData;
            touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
            touchData.global.y = (touchEvent.clientY - rect.top) * (this.target.height / rect.height);
            if (navigator.isCocoonJS) {
                touchData.global.x = touchEvent.clientX;
                touchData.global.y = touchEvent.clientY;
            }
            var length = this.interactiveItems.length;
            for (var j = 0; j < length; j++) {
                var item = this.interactiveItems[j];
                if (item.touchstart || item.tap) {
                    item.__hit = this.hitTest(item, touchData);
                    if (item.__hit) {
                        if (item.touchstart) item.touchstart(touchData);
                        item.__isDown = true;
                        item.__touchData = touchData;
                        if (!item.interactiveChildren) break;
                    }
                }
            }
        }
    };
    PIXI.InteractionManager.prototype.onTouchEnd = function(event) {
        var rect = this.interactionDOMElement.getBoundingClientRect();
        var changedTouches = event.changedTouches;
        for (var i = 0; i < changedTouches.length; i++) {
            var touchEvent = changedTouches[i];
            var touchData = this.touchs[touchEvent.identifier];
            var up = false;
            touchData.global.x = (touchEvent.clientX - rect.left) * (this.target.width / rect.width);
            touchData.global.y = (touchEvent.clientY - rect.top) * (this.target.height / rect.height);
            if (navigator.isCocoonJS) {
                touchData.global.x = touchEvent.clientX;
                touchData.global.y = touchEvent.clientY;
            }
            var length = this.interactiveItems.length;
            for (var j = 0; j < length; j++) {
                var item = this.interactiveItems[j];
                var itemTouchData = item.__touchData;
                item.__hit = this.hitTest(item, touchData);
                if (itemTouchData === touchData) {
                    touchData.originalEvent = event || window.event;
                    if (item.touchend || item.tap) {
                        if (item.__hit && !up) {
                            if (item.touchend) item.touchend(touchData);
                            if (item.__isDown) {
                                if (item.tap) item.tap(touchData);
                            }
                            if (!item.interactiveChildren) up = true;
                        } else {
                            if (item.__isDown) {
                                if (item.touchendoutside) item.touchendoutside(touchData);
                            }
                        }
                        item.__isDown = false;
                    }
                    item.__touchData = null;
                }
            }
            this.pool.push(touchData);
            this.touchs[touchEvent.identifier] = null;
        }
    };
    PIXI.Stage = function(backgroundColor) {
        PIXI.DisplayObjectContainer.call(this);
        this.worldTransform = new PIXI.Matrix();
        this.interactive = true;
        this.interactionManager = new PIXI.InteractionManager(this);
        this.dirty = true;
        this.stage = this;
        this.stage.hitArea = new PIXI.Rectangle(0, 0, 1e5, 1e5);
        this.setBackgroundColor(backgroundColor);
    };
    PIXI.Stage.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    PIXI.Stage.prototype.constructor = PIXI.Stage;
    PIXI.Stage.prototype.setInteractionDelegate = function(domElement) {
        this.interactionManager.setTargetDomElement(domElement);
    };
    PIXI.Stage.prototype.updateTransform = function() {
        this.worldAlpha = 1;
        for (var i = 0, j = this.children.length; i < j; i++) {
            this.children[i].updateTransform();
        }
        if (this.dirty) {
            this.dirty = false;
            this.interactionManager.dirty = true;
        }
        if (this.interactive) this.interactionManager.update();
    };
    PIXI.Stage.prototype.setBackgroundColor = function(backgroundColor) {
        this.backgroundColor = backgroundColor || 0;
        this.backgroundColorSplit = PIXI.hex2rgb(this.backgroundColor);
        var hex = this.backgroundColor.toString(16);
        hex = "000000".substr(0, 6 - hex.length) + hex;
        this.backgroundColorString = "#" + hex;
    };
    PIXI.Stage.prototype.getMousePosition = function() {
        return this.interactionManager.mouse.global;
    };
    var lastTime = 0;
    var vendors = [ "ms", "moz", "webkit", "o" ];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
    window.requestAnimFrame = window.requestAnimationFrame;
    PIXI.hex2rgb = function(hex) {
        return [ (hex >> 16 & 255) / 255, (hex >> 8 & 255) / 255, (hex & 255) / 255 ];
    };
    PIXI.rgb2hex = function(rgb) {
        return (rgb[0] * 255 << 16) + (rgb[1] * 255 << 8) + rgb[2] * 255;
    };
    if (typeof Function.prototype.bind !== "function") {
        Function.prototype.bind = function() {
            var slice = Array.prototype.slice;
            return function(thisArg) {
                var target = this, boundArgs = slice.call(arguments, 1);
                if (typeof target !== "function") throw new TypeError();
                function bound() {
                    var args = boundArgs.concat(slice.call(arguments));
                    target.apply(this instanceof bound ? this : thisArg, args);
                }
                bound.prototype = function F(proto) {
                    if (proto) F.prototype = proto;
                    if (!(this instanceof F)) return new F();
                }(target.prototype);
                return bound;
            };
        }();
    }
    PIXI.AjaxRequest = function() {
        var activexmodes = [ "Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Microsoft.XMLHTTP" ];
        if (window.ActiveXObject) {
            for (var i = 0; i < activexmodes.length; i++) {
                try {
                    return new window.ActiveXObject(activexmodes[i]);
                } catch (e) {}
            }
        } else if (window.XMLHttpRequest) {
            return new window.XMLHttpRequest();
        } else {
            return false;
        }
    };
    PIXI.canUseNewCanvasBlendModes = function() {
        var canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        var context = canvas.getContext("2d");
        context.fillStyle = "#000";
        context.fillRect(0, 0, 1, 1);
        context.globalCompositeOperation = "multiply";
        context.fillStyle = "#fff";
        context.fillRect(0, 0, 1, 1);
        return context.getImageData(0, 0, 1, 1).data[0] === 0;
    };
    PIXI.getNextPowerOfTwo = function(number) {
        if (number > 0 && (number & number - 1) === 0) return number; else {
            var result = 1;
            while (result < number) result <<= 1;
            return result;
        }
    };
    PIXI.EventTarget = function() {
        var listeners = {};
        this.addEventListener = this.on = function(type, listener) {
            if (listeners[type] === undefined) {
                listeners[type] = [];
            }
            if (listeners[type].indexOf(listener) === -1) {
                listeners[type].push(listener);
            }
        };
        this.dispatchEvent = this.emit = function(event) {
            if (!listeners[event.type] || !listeners[event.type].length) {
                return;
            }
            for (var i = 0, l = listeners[event.type].length; i < l; i++) {
                listeners[event.type][i](event);
            }
        };
        this.removeEventListener = this.off = function(type, listener) {
            var index = listeners[type].indexOf(listener);
            if (index !== -1) {
                listeners[type].splice(index, 1);
            }
        };
        this.removeAllEventListeners = function(type) {
            var a = listeners[type];
            if (a) a.length = 0;
        };
    };
    PIXI.autoDetectRenderer = function(width, height, view, transparent, antialias) {
        if (!width) width = 800;
        if (!height) height = 600;
        var webgl = function() {
            try {
                var canvas = document.createElement("canvas");
                return !!window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
            } catch (e) {
                return false;
            }
        }();
        if (webgl) {
            return new PIXI.WebGLRenderer(width, height, view, transparent, antialias);
        }
        return new PIXI.CanvasRenderer(width, height, view, transparent);
    };
    PIXI.PolyK = {};
    PIXI.PolyK.Triangulate = function(p) {
        var sign = true;
        var n = p.length >> 1;
        if (n < 3) return [];
        var tgs = [];
        var avl = [];
        for (var i = 0; i < n; i++) avl.push(i);
        i = 0;
        var al = n;
        while (al > 3) {
            var i0 = avl[(i + 0) % al];
            var i1 = avl[(i + 1) % al];
            var i2 = avl[(i + 2) % al];
            var ax = p[2 * i0], ay = p[2 * i0 + 1];
            var bx = p[2 * i1], by = p[2 * i1 + 1];
            var cx = p[2 * i2], cy = p[2 * i2 + 1];
            var earFound = false;
            if (PIXI.PolyK._convex(ax, ay, bx, by, cx, cy, sign)) {
                earFound = true;
                for (var j = 0; j < al; j++) {
                    var vi = avl[j];
                    if (vi === i0 || vi === i1 || vi === i2) continue;
                    if (PIXI.PolyK._PointInTriangle(p[2 * vi], p[2 * vi + 1], ax, ay, bx, by, cx, cy)) {
                        earFound = false;
                        break;
                    }
                }
            }
            if (earFound) {
                tgs.push(i0, i1, i2);
                avl.splice((i + 1) % al, 1);
                al--;
                i = 0;
            } else if (i++ > 3 * al) {
                if (sign) {
                    tgs = [];
                    avl = [];
                    for (i = 0; i < n; i++) avl.push(i);
                    i = 0;
                    al = n;
                    sign = false;
                } else {
                    window.console.log("PIXI Warning: shape too complex to fill");
                    return [];
                }
            }
        }
        tgs.push(avl[0], avl[1], avl[2]);
        return tgs;
    };
    PIXI.PolyK._PointInTriangle = function(px, py, ax, ay, bx, by, cx, cy) {
        var v0x = cx - ax;
        var v0y = cy - ay;
        var v1x = bx - ax;
        var v1y = by - ay;
        var v2x = px - ax;
        var v2y = py - ay;
        var dot00 = v0x * v0x + v0y * v0y;
        var dot01 = v0x * v1x + v0y * v1y;
        var dot02 = v0x * v2x + v0y * v2y;
        var dot11 = v1x * v1x + v1y * v1y;
        var dot12 = v1x * v2x + v1y * v2y;
        var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        return u >= 0 && v >= 0 && u + v < 1;
    };
    PIXI.PolyK._convex = function(ax, ay, bx, by, cx, cy, sign) {
        return (ay - by) * (cx - bx) + (bx - ax) * (cy - by) >= 0 === sign;
    };
    PIXI.initDefaultShaders = function() {};
    PIXI.CompileVertexShader = function(gl, shaderSrc) {
        return PIXI._CompileShader(gl, shaderSrc, gl.VERTEX_SHADER);
    };
    PIXI.CompileFragmentShader = function(gl, shaderSrc) {
        return PIXI._CompileShader(gl, shaderSrc, gl.FRAGMENT_SHADER);
    };
    PIXI._CompileShader = function(gl, shaderSrc, shaderType) {
        var src = shaderSrc.join("\n");
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            window.console.log(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    };
    PIXI.compileProgram = function(gl, vertexSrc, fragmentSrc) {
        var fragmentShader = PIXI.CompileFragmentShader(gl, fragmentSrc);
        var vertexShader = PIXI.CompileVertexShader(gl, vertexSrc);
        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            window.console.log("Could not initialise shaders");
        }
        return shaderProgram;
    };
    PIXI.PixiShader = function(gl) {
        this.gl = gl;
        this.program = null;
        this.fragmentSrc = [ "precision lowp float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;", "}" ];
        this.textureCount = 0;
        this.attributes = [];
        this.init();
    };
    PIXI.PixiShader.prototype.init = function() {
        var gl = this.gl;
        var program = PIXI.compileProgram(gl, this.vertexSrc || PIXI.PixiShader.defaultVertexSrc, this.fragmentSrc);
        gl.useProgram(program);
        this.uSampler = gl.getUniformLocation(program, "uSampler");
        this.projectionVector = gl.getUniformLocation(program, "projectionVector");
        this.offsetVector = gl.getUniformLocation(program, "offsetVector");
        this.dimensions = gl.getUniformLocation(program, "dimensions");
        this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
        this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
        this.colorAttribute = gl.getAttribLocation(program, "aColor");
        if (this.colorAttribute === -1) {
            this.colorAttribute = 2;
        }
        this.attributes = [ this.aVertexPosition, this.aTextureCoord, this.colorAttribute ];
        for (var key in this.uniforms) {
            this.uniforms[key].uniformLocation = gl.getUniformLocation(program, key);
        }
        this.initUniforms();
        this.program = program;
    };
    PIXI.PixiShader.prototype.initUniforms = function() {
        this.textureCount = 1;
        var gl = this.gl;
        var uniform;
        for (var key in this.uniforms) {
            uniform = this.uniforms[key];
            var type = uniform.type;
            if (type === "sampler2D") {
                uniform._init = false;
                if (uniform.value !== null) {
                    this.initSampler2D(uniform);
                }
            } else if (type === "mat2" || type === "mat3" || type === "mat4") {
                uniform.glMatrix = true;
                uniform.glValueLength = 1;
                if (type === "mat2") {
                    uniform.glFunc = gl.uniformMatrix2fv;
                } else if (type === "mat3") {
                    uniform.glFunc = gl.uniformMatrix3fv;
                } else if (type === "mat4") {
                    uniform.glFunc = gl.uniformMatrix4fv;
                }
            } else {
                uniform.glFunc = gl["uniform" + type];
                if (type === "2f" || type === "2i") {
                    uniform.glValueLength = 2;
                } else if (type === "3f" || type === "3i") {
                    uniform.glValueLength = 3;
                } else if (type === "4f" || type === "4i") {
                    uniform.glValueLength = 4;
                } else {
                    uniform.glValueLength = 1;
                }
            }
        }
    };
    PIXI.PixiShader.prototype.initSampler2D = function(uniform) {
        if (!uniform.value || !uniform.value.baseTexture || !uniform.value.baseTexture.hasLoaded) {
            return;
        }
        var gl = this.gl;
        gl.activeTexture(gl["TEXTURE" + this.textureCount]);
        gl.bindTexture(gl.TEXTURE_2D, uniform.value.baseTexture._glTextures[gl.id]);
        if (uniform.textureData) {
            var data = uniform.textureData;
            var magFilter = data.magFilter ? data.magFilter : gl.LINEAR;
            var minFilter = data.minFilter ? data.minFilter : gl.LINEAR;
            var wrapS = data.wrapS ? data.wrapS : gl.CLAMP_TO_EDGE;
            var wrapT = data.wrapT ? data.wrapT : gl.CLAMP_TO_EDGE;
            var format = data.luminance ? gl.LUMINANCE : gl.RGBA;
            if (data.repeat) {
                wrapS = gl.REPEAT;
                wrapT = gl.REPEAT;
            }
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!data.flipY);
            if (data.width) {
                var width = data.width ? data.width : 512;
                var height = data.height ? data.height : 2;
                var border = data.border ? data.border : 0;
                gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, border, format, gl.UNSIGNED_BYTE, null);
            } else {
                gl.texImage2D(gl.TEXTURE_2D, 0, format, gl.RGBA, gl.UNSIGNED_BYTE, uniform.value.baseTexture.source);
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
        }
        gl.uniform1i(uniform.uniformLocation, this.textureCount);
        uniform._init = true;
        this.textureCount++;
    };
    PIXI.PixiShader.prototype.syncUniforms = function() {
        this.textureCount = 1;
        var uniform;
        var gl = this.gl;
        for (var key in this.uniforms) {
            uniform = this.uniforms[key];
            if (uniform.glValueLength === 1) {
                if (uniform.glMatrix === true) {
                    uniform.glFunc.call(gl, uniform.uniformLocation, uniform.transpose, uniform.value);
                } else {
                    uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value);
                }
            } else if (uniform.glValueLength === 2) {
                uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value.x, uniform.value.y);
            } else if (uniform.glValueLength === 3) {
                uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value.x, uniform.value.y, uniform.value.z);
            } else if (uniform.glValueLength === 4) {
                uniform.glFunc.call(gl, uniform.uniformLocation, uniform.value.x, uniform.value.y, uniform.value.z, uniform.value.w);
            } else if (uniform.type === "sampler2D") {
                if (uniform._init) {
                    gl.activeTexture(gl["TEXTURE" + this.textureCount]);
                    gl.bindTexture(gl.TEXTURE_2D, uniform.value.baseTexture._glTextures[gl.id] || PIXI.createWebGLTexture(uniform.value.baseTexture, gl));
                    gl.uniform1i(uniform.uniformLocation, this.textureCount);
                    this.textureCount++;
                } else {
                    this.initSampler2D(uniform);
                }
            }
        }
    };
    PIXI.PixiShader.prototype.destroy = function() {
        this.gl.deleteProgram(this.program);
        this.uniforms = null;
        this.gl = null;
        this.attributes = null;
    };
    PIXI.PixiShader.defaultVertexSrc = [ "attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "attribute vec2 aColor;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "const vec2 center = vec2(-1.0, 1.0);", "void main(void) {", "   gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "   vec3 color = mod(vec3(aColor.y/65536.0, aColor.y/256.0, aColor.y), 256.0) / 256.0;", "   vColor = vec4(color * aColor.x, aColor.x);", "}" ];
    PIXI.PixiFastShader = function(gl) {
        this.gl = gl;
        this.program = null;
        this.fragmentSrc = [ "precision lowp float;", "varying vec2 vTextureCoord;", "varying float vColor;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;", "}" ];
        this.vertexSrc = [ "attribute vec2 aVertexPosition;", "attribute vec2 aPositionCoord;", "attribute vec2 aScale;", "attribute float aRotation;", "attribute vec2 aTextureCoord;", "attribute float aColor;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "uniform mat3 uMatrix;", "varying vec2 vTextureCoord;", "varying float vColor;", "const vec2 center = vec2(-1.0, 1.0);", "void main(void) {", "   vec2 v;", "   vec2 sv = aVertexPosition * aScale;", "   v.x = (sv.x) * cos(aRotation) - (sv.y) * sin(aRotation);", "   v.y = (sv.x) * sin(aRotation) + (sv.y) * cos(aRotation);", "   v = ( uMatrix * vec3(v + aPositionCoord , 1.0) ).xy ;", "   gl_Position = vec4( ( v / projectionVector) + center , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "   vColor = aColor;", "}" ];
        this.textureCount = 0;
        this.init();
    };
    PIXI.PixiFastShader.prototype.init = function() {
        var gl = this.gl;
        var program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
        gl.useProgram(program);
        this.uSampler = gl.getUniformLocation(program, "uSampler");
        this.projectionVector = gl.getUniformLocation(program, "projectionVector");
        this.offsetVector = gl.getUniformLocation(program, "offsetVector");
        this.dimensions = gl.getUniformLocation(program, "dimensions");
        this.uMatrix = gl.getUniformLocation(program, "uMatrix");
        this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
        this.aPositionCoord = gl.getAttribLocation(program, "aPositionCoord");
        this.aScale = gl.getAttribLocation(program, "aScale");
        this.aRotation = gl.getAttribLocation(program, "aRotation");
        this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
        this.colorAttribute = gl.getAttribLocation(program, "aColor");
        if (this.colorAttribute === -1) {
            this.colorAttribute = 2;
        }
        this.attributes = [ this.aVertexPosition, this.aPositionCoord, this.aScale, this.aRotation, this.aTextureCoord, this.colorAttribute ];
        this.program = program;
    };
    PIXI.PixiFastShader.prototype.destroy = function() {
        this.gl.deleteProgram(this.program);
        this.uniforms = null;
        this.gl = null;
        this.attributes = null;
    };
    PIXI.StripShader = function() {
        this.program = null;
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying float vColor;", "uniform float alpha;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));", "   gl_FragColor = gl_FragColor * alpha;", "}" ];
        this.vertexSrc = [ "attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "attribute float aColor;", "uniform mat3 translationMatrix;", "uniform vec2 projectionVector;", "varying vec2 vTextureCoord;", "uniform vec2 offsetVector;", "varying float vColor;", "void main(void) {", "   vec3 v = translationMatrix * vec3(aVertexPosition, 1.0);", "   v -= offsetVector.xyx;", "   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / projectionVector.y + 1.0 , 0.0, 1.0);", "   vTextureCoord = aTextureCoord;", "   vColor = aColor;", "}" ];
    };
    PIXI.StripShader.prototype.init = function() {
        var gl = PIXI.gl;
        var program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
        gl.useProgram(program);
        this.uSampler = gl.getUniformLocation(program, "uSampler");
        this.projectionVector = gl.getUniformLocation(program, "projectionVector");
        this.offsetVector = gl.getUniformLocation(program, "offsetVector");
        this.colorAttribute = gl.getAttribLocation(program, "aColor");
        this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
        this.aTextureCoord = gl.getAttribLocation(program, "aTextureCoord");
        this.translationMatrix = gl.getUniformLocation(program, "translationMatrix");
        this.alpha = gl.getUniformLocation(program, "alpha");
        this.program = program;
    };
    PIXI.PrimitiveShader = function(gl) {
        this.gl = gl;
        this.program = null;
        this.fragmentSrc = [ "precision mediump float;", "varying vec4 vColor;", "void main(void) {", "   gl_FragColor = vColor;", "}" ];
        this.vertexSrc = [ "attribute vec2 aVertexPosition;", "attribute vec4 aColor;", "uniform mat3 translationMatrix;", "uniform vec2 projectionVector;", "uniform vec2 offsetVector;", "uniform float alpha;", "uniform vec3 tint;", "varying vec4 vColor;", "void main(void) {", "   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);", "   v -= offsetVector.xyx;", "   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);", "   vColor = aColor * vec4(tint * alpha, alpha);", "}" ];
        this.init();
    };
    PIXI.PrimitiveShader.prototype.init = function() {
        var gl = this.gl;
        var program = PIXI.compileProgram(gl, this.vertexSrc, this.fragmentSrc);
        gl.useProgram(program);
        this.projectionVector = gl.getUniformLocation(program, "projectionVector");
        this.offsetVector = gl.getUniformLocation(program, "offsetVector");
        this.tintColor = gl.getUniformLocation(program, "tint");
        this.aVertexPosition = gl.getAttribLocation(program, "aVertexPosition");
        this.colorAttribute = gl.getAttribLocation(program, "aColor");
        this.attributes = [ this.aVertexPosition, this.colorAttribute ];
        this.translationMatrix = gl.getUniformLocation(program, "translationMatrix");
        this.alpha = gl.getUniformLocation(program, "alpha");
        this.program = program;
    };
    PIXI.PrimitiveShader.prototype.destroy = function() {
        this.gl.deleteProgram(this.program);
        this.uniforms = null;
        this.gl = null;
        this.attribute = null;
    };
    PIXI.WebGLGraphics = function() {};
    PIXI.WebGLGraphics.renderGraphics = function(graphics, renderSession) {
        var gl = renderSession.gl;
        var projection = renderSession.projection, offset = renderSession.offset, shader = renderSession.shaderManager.primitiveShader;
        if (!graphics._webGL[gl.id]) graphics._webGL[gl.id] = {
            points: [],
            indices: [],
            lastIndex: 0,
            buffer: gl.createBuffer(),
            indexBuffer: gl.createBuffer()
        };
        var webGL = graphics._webGL[gl.id];
        if (graphics.dirty) {
            graphics.dirty = false;
            if (graphics.clearDirty) {
                graphics.clearDirty = false;
                webGL.lastIndex = 0;
                webGL.points = [];
                webGL.indices = [];
            }
            PIXI.WebGLGraphics.updateGraphics(graphics, gl);
        }
        renderSession.shaderManager.activatePrimitiveShader();
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.uniformMatrix3fv(shader.translationMatrix, false, graphics.worldTransform.toArray(true));
        gl.uniform2f(shader.projectionVector, projection.x, -projection.y);
        gl.uniform2f(shader.offsetVector, -offset.x, -offset.y);
        gl.uniform3fv(shader.tintColor, PIXI.hex2rgb(graphics.tint));
        gl.uniform1f(shader.alpha, graphics.worldAlpha);
        gl.bindBuffer(gl.ARRAY_BUFFER, webGL.buffer);
        gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
        gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, false, 4 * 6, 2 * 4);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGL.indexBuffer);
        gl.drawElements(gl.TRIANGLE_STRIP, webGL.indices.length, gl.UNSIGNED_SHORT, 0);
        renderSession.shaderManager.deactivatePrimitiveShader();
    };
    PIXI.WebGLGraphics.updateGraphics = function(graphics, gl) {
        var webGL = graphics._webGL[gl.id];
        for (var i = webGL.lastIndex; i < graphics.graphicsData.length; i++) {
            var data = graphics.graphicsData[i];
            if (data.type === PIXI.Graphics.POLY) {
                if (data.fill) {
                    if (data.points.length > 3) PIXI.WebGLGraphics.buildPoly(data, webGL);
                }
                if (data.lineWidth > 0) {
                    PIXI.WebGLGraphics.buildLine(data, webGL);
                }
            } else if (data.type === PIXI.Graphics.RECT) {
                PIXI.WebGLGraphics.buildRectangle(data, webGL);
            } else if (data.type === PIXI.Graphics.CIRC || data.type === PIXI.Graphics.ELIP) {
                PIXI.WebGLGraphics.buildCircle(data, webGL);
            }
        }
        webGL.lastIndex = graphics.graphicsData.length;
        webGL.glPoints = new Float32Array(webGL.points);
        gl.bindBuffer(gl.ARRAY_BUFFER, webGL.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, webGL.glPoints, gl.STATIC_DRAW);
        webGL.glIndicies = new Uint16Array(webGL.indices);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGL.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, webGL.glIndicies, gl.STATIC_DRAW);
    };
    PIXI.WebGLGraphics.buildRectangle = function(graphicsData, webGLData) {
        var rectData = graphicsData.points;
        var x = rectData[0];
        var y = rectData[1];
        var width = rectData[2];
        var height = rectData[3];
        if (graphicsData.fill) {
            var color = PIXI.hex2rgb(graphicsData.fillColor);
            var alpha = graphicsData.fillAlpha;
            var r = color[0] * alpha;
            var g = color[1] * alpha;
            var b = color[2] * alpha;
            var verts = webGLData.points;
            var indices = webGLData.indices;
            var vertPos = verts.length / 6;
            verts.push(x, y);
            verts.push(r, g, b, alpha);
            verts.push(x + width, y);
            verts.push(r, g, b, alpha);
            verts.push(x, y + height);
            verts.push(r, g, b, alpha);
            verts.push(x + width, y + height);
            verts.push(r, g, b, alpha);
            indices.push(vertPos, vertPos, vertPos + 1, vertPos + 2, vertPos + 3, vertPos + 3);
        }
        if (graphicsData.lineWidth) {
            var tempPoints = graphicsData.points;
            graphicsData.points = [ x, y, x + width, y, x + width, y + height, x, y + height, x, y ];
            PIXI.WebGLGraphics.buildLine(graphicsData, webGLData);
            graphicsData.points = tempPoints;
        }
    };
    PIXI.WebGLGraphics.buildCircle = function(graphicsData, webGLData) {
        var rectData = graphicsData.points;
        var x = rectData[0];
        var y = rectData[1];
        var width = rectData[2];
        var height = rectData[3];
        var totalSegs = 40;
        var seg = Math.PI * 2 / totalSegs;
        var i = 0;
        if (graphicsData.fill) {
            var color = PIXI.hex2rgb(graphicsData.fillColor);
            var alpha = graphicsData.fillAlpha;
            var r = color[0] * alpha;
            var g = color[1] * alpha;
            var b = color[2] * alpha;
            var verts = webGLData.points;
            var indices = webGLData.indices;
            var vecPos = verts.length / 6;
            indices.push(vecPos);
            for (i = 0; i < totalSegs + 1; i++) {
                verts.push(x, y, r, g, b, alpha);
                verts.push(x + Math.sin(seg * i) * width, y + Math.cos(seg * i) * height, r, g, b, alpha);
                indices.push(vecPos++, vecPos++);
            }
            indices.push(vecPos - 1);
        }
        if (graphicsData.lineWidth) {
            var tempPoints = graphicsData.points;
            graphicsData.points = [];
            for (i = 0; i < totalSegs + 1; i++) {
                graphicsData.points.push(x + Math.sin(seg * i) * width, y + Math.cos(seg * i) * height);
            }
            PIXI.WebGLGraphics.buildLine(graphicsData, webGLData);
            graphicsData.points = tempPoints;
        }
    };
    PIXI.WebGLGraphics.buildLine = function(graphicsData, webGLData) {
        var i = 0;
        var points = graphicsData.points;
        if (points.length === 0) return;
        if (graphicsData.lineWidth % 2) {
            for (i = 0; i < points.length; i++) {
                points[i] += .5;
            }
        }
        var firstPoint = new PIXI.Point(points[0], points[1]);
        var lastPoint = new PIXI.Point(points[points.length - 2], points[points.length - 1]);
        if (firstPoint.x === lastPoint.x && firstPoint.y === lastPoint.y) {
            points.pop();
            points.pop();
            lastPoint = new PIXI.Point(points[points.length - 2], points[points.length - 1]);
            var midPointX = lastPoint.x + (firstPoint.x - lastPoint.x) * .5;
            var midPointY = lastPoint.y + (firstPoint.y - lastPoint.y) * .5;
            points.unshift(midPointX, midPointY);
            points.push(midPointX, midPointY);
        }
        var verts = webGLData.points;
        var indices = webGLData.indices;
        var length = points.length / 2;
        var indexCount = points.length;
        var indexStart = verts.length / 6;
        var width = graphicsData.lineWidth / 2;
        var color = PIXI.hex2rgb(graphicsData.lineColor);
        var alpha = graphicsData.lineAlpha;
        var r = color[0] * alpha;
        var g = color[1] * alpha;
        var b = color[2] * alpha;
        var px, py, p1x, p1y, p2x, p2y, p3x, p3y;
        var perpx, perpy, perp2x, perp2y, perp3x, perp3y;
        var a1, b1, c1, a2, b2, c2;
        var denom, pdist, dist;
        p1x = points[0];
        p1y = points[1];
        p2x = points[2];
        p2y = points[3];
        perpx = -(p1y - p2y);
        perpy = p1x - p2x;
        dist = Math.sqrt(perpx * perpx + perpy * perpy);
        perpx /= dist;
        perpy /= dist;
        perpx *= width;
        perpy *= width;
        verts.push(p1x - perpx, p1y - perpy, r, g, b, alpha);
        verts.push(p1x + perpx, p1y + perpy, r, g, b, alpha);
        for (i = 1; i < length - 1; i++) {
            p1x = points[(i - 1) * 2];
            p1y = points[(i - 1) * 2 + 1];
            p2x = points[i * 2];
            p2y = points[i * 2 + 1];
            p3x = points[(i + 1) * 2];
            p3y = points[(i + 1) * 2 + 1];
            perpx = -(p1y - p2y);
            perpy = p1x - p2x;
            dist = Math.sqrt(perpx * perpx + perpy * perpy);
            perpx /= dist;
            perpy /= dist;
            perpx *= width;
            perpy *= width;
            perp2x = -(p2y - p3y);
            perp2y = p2x - p3x;
            dist = Math.sqrt(perp2x * perp2x + perp2y * perp2y);
            perp2x /= dist;
            perp2y /= dist;
            perp2x *= width;
            perp2y *= width;
            a1 = -perpy + p1y - (-perpy + p2y);
            b1 = -perpx + p2x - (-perpx + p1x);
            c1 = (-perpx + p1x) * (-perpy + p2y) - (-perpx + p2x) * (-perpy + p1y);
            a2 = -perp2y + p3y - (-perp2y + p2y);
            b2 = -perp2x + p2x - (-perp2x + p3x);
            c2 = (-perp2x + p3x) * (-perp2y + p2y) - (-perp2x + p2x) * (-perp2y + p3y);
            denom = a1 * b2 - a2 * b1;
            if (Math.abs(denom) < .1) {
                denom += 10.1;
                verts.push(p2x - perpx, p2y - perpy, r, g, b, alpha);
                verts.push(p2x + perpx, p2y + perpy, r, g, b, alpha);
                continue;
            }
            px = (b1 * c2 - b2 * c1) / denom;
            py = (a2 * c1 - a1 * c2) / denom;
            pdist = (px - p2x) * (px - p2x) + (py - p2y) + (py - p2y);
            if (pdist > 140 * 140) {
                perp3x = perpx - perp2x;
                perp3y = perpy - perp2y;
                dist = Math.sqrt(perp3x * perp3x + perp3y * perp3y);
                perp3x /= dist;
                perp3y /= dist;
                perp3x *= width;
                perp3y *= width;
                verts.push(p2x - perp3x, p2y - perp3y);
                verts.push(r, g, b, alpha);
                verts.push(p2x + perp3x, p2y + perp3y);
                verts.push(r, g, b, alpha);
                verts.push(p2x - perp3x, p2y - perp3y);
                verts.push(r, g, b, alpha);
                indexCount++;
            } else {
                verts.push(px, py);
                verts.push(r, g, b, alpha);
                verts.push(p2x - (px - p2x), p2y - (py - p2y));
                verts.push(r, g, b, alpha);
            }
        }
        p1x = points[(length - 2) * 2];
        p1y = points[(length - 2) * 2 + 1];
        p2x = points[(length - 1) * 2];
        p2y = points[(length - 1) * 2 + 1];
        perpx = -(p1y - p2y);
        perpy = p1x - p2x;
        dist = Math.sqrt(perpx * perpx + perpy * perpy);
        perpx /= dist;
        perpy /= dist;
        perpx *= width;
        perpy *= width;
        verts.push(p2x - perpx, p2y - perpy);
        verts.push(r, g, b, alpha);
        verts.push(p2x + perpx, p2y + perpy);
        verts.push(r, g, b, alpha);
        indices.push(indexStart);
        for (i = 0; i < indexCount; i++) {
            indices.push(indexStart++);
        }
        indices.push(indexStart - 1);
    };
    PIXI.WebGLGraphics.buildPoly = function(graphicsData, webGLData) {
        var points = graphicsData.points;
        if (points.length < 6) return;
        var verts = webGLData.points;
        var indices = webGLData.indices;
        var length = points.length / 2;
        var color = PIXI.hex2rgb(graphicsData.fillColor);
        var alpha = graphicsData.fillAlpha;
        var r = color[0] * alpha;
        var g = color[1] * alpha;
        var b = color[2] * alpha;
        var triangles = PIXI.PolyK.Triangulate(points);
        var vertPos = verts.length / 6;
        var i = 0;
        for (i = 0; i < triangles.length; i += 3) {
            indices.push(triangles[i] + vertPos);
            indices.push(triangles[i] + vertPos);
            indices.push(triangles[i + 1] + vertPos);
            indices.push(triangles[i + 2] + vertPos);
            indices.push(triangles[i + 2] + vertPos);
        }
        for (i = 0; i < length; i++) {
            verts.push(points[i * 2], points[i * 2 + 1], r, g, b, alpha);
        }
    };
    PIXI.glContexts = [];
    PIXI.WebGLRenderer = function(width, height, view, transparent, antialias) {
        if (!PIXI.defaultRenderer) PIXI.defaultRenderer = this;
        this.type = PIXI.WEBGL_RENDERER;
        this.transparent = !!transparent;
        this.width = width || 800;
        this.height = height || 600;
        this.view = view || document.createElement("canvas");
        this.view.width = this.width;
        this.view.height = this.height;
        this.contextLost = this.handleContextLost.bind(this);
        this.contextRestoredLost = this.handleContextRestored.bind(this);
        this.view.addEventListener("webglcontextlost", this.contextLost, false);
        this.view.addEventListener("webglcontextrestored", this.contextRestoredLost, false);
        this.options = {
            alpha: this.transparent,
            antialias: !!antialias,
            premultipliedAlpha: !!transparent,
            stencil: true
        };
        try {
            this.gl = this.view.getContext("experimental-webgl", this.options);
        } catch (e) {
            try {
                this.gl = this.view.getContext("webgl", this.options);
            } catch (e2) {
                throw new Error(" This browser does not support webGL. Try using the canvas renderer" + this);
            }
        }
        var gl = this.gl;
        this.glContextId = gl.id = PIXI.WebGLRenderer.glContextId++;
        PIXI.glContexts[this.glContextId] = gl;
        if (!PIXI.blendModesWebGL) {
            PIXI.blendModesWebGL = [];
            PIXI.blendModesWebGL[PIXI.blendModes.NORMAL] = [ gl.ONE, gl.ONE_MINUS_SRC_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.ADD] = [ gl.SRC_ALPHA, gl.DST_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.MULTIPLY] = [ gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.SCREEN] = [ gl.SRC_ALPHA, gl.ONE ];
            PIXI.blendModesWebGL[PIXI.blendModes.OVERLAY] = [ gl.ONE, gl.ONE_MINUS_SRC_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.DARKEN] = [ gl.ONE, gl.ONE_MINUS_SRC_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.LIGHTEN] = [ gl.ONE, gl.ONE_MINUS_SRC_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.COLOR_DODGE] = [ gl.ONE, gl.ONE_MINUS_SRC_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.COLOR_BURN] = [ gl.ONE, gl.ONE_MINUS_SRC_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.HARD_LIGHT] = [ gl.ONE, gl.ONE_MINUS_SRC_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.SOFT_LIGHT] = [ gl.ONE, gl.ONE_MINUS_SRC_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.DIFFERENCE] = [ gl.ONE, gl.ONE_MINUS_SRC_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.EXCLUSION] = [ gl.ONE, gl.ONE_MINUS_SRC_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.HUE] = [ gl.ONE, gl.ONE_MINUS_SRC_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.SATURATION] = [ gl.ONE, gl.ONE_MINUS_SRC_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.COLOR] = [ gl.ONE, gl.ONE_MINUS_SRC_ALPHA ];
            PIXI.blendModesWebGL[PIXI.blendModes.LUMINOSITY] = [ gl.ONE, gl.ONE_MINUS_SRC_ALPHA ];
        }
        this.projection = new PIXI.Point();
        this.projection.x = this.width / 2;
        this.projection.y = -this.height / 2;
        this.offset = new PIXI.Point(0, 0);
        this.resize(this.width, this.height);
        this.contextLost = false;
        this.shaderManager = new PIXI.WebGLShaderManager(gl);
        this.spriteBatch = new PIXI.WebGLSpriteBatch(gl);
        this.maskManager = new PIXI.WebGLMaskManager(gl);
        this.filterManager = new PIXI.WebGLFilterManager(gl, this.transparent);
        this.renderSession = {};
        this.renderSession.gl = this.gl;
        this.renderSession.drawCount = 0;
        this.renderSession.shaderManager = this.shaderManager;
        this.renderSession.maskManager = this.maskManager;
        this.renderSession.filterManager = this.filterManager;
        this.renderSession.spriteBatch = this.spriteBatch;
        this.renderSession.renderer = this;
        gl.useProgram(this.shaderManager.defaultShader.program);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.colorMask(true, true, true, this.transparent);
    };
    PIXI.WebGLRenderer.prototype.constructor = PIXI.WebGLRenderer;
    PIXI.WebGLRenderer.prototype.render = function(stage) {
        if (this.contextLost) return;
        if (this.__stage !== stage) {
            if (stage.interactive) stage.interactionManager.removeEvents();
            this.__stage = stage;
        }
        PIXI.WebGLRenderer.updateTextures();
        stage.updateTransform();
        if (stage._interactive) {
            if (!stage._interactiveEventsAdded) {
                stage._interactiveEventsAdded = true;
                stage.interactionManager.setTarget(this);
            }
        }
        var gl = this.gl;
        gl.viewport(0, 0, this.width, this.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        if (this.transparent) {
            gl.clearColor(0, 0, 0, 0);
        } else {
            gl.clearColor(stage.backgroundColorSplit[0], stage.backgroundColorSplit[1], stage.backgroundColorSplit[2], 1);
        }
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.renderDisplayObject(stage, this.projection);
        if (stage.interactive) {
            if (!stage._interactiveEventsAdded) {
                stage._interactiveEventsAdded = true;
                stage.interactionManager.setTarget(this);
            }
        } else {
            if (stage._interactiveEventsAdded) {
                stage._interactiveEventsAdded = false;
                stage.interactionManager.setTarget(this);
            }
        }
    };
    PIXI.WebGLRenderer.prototype.renderDisplayObject = function(displayObject, projection, buffer) {
        this.renderSession.drawCount = 0;
        this.renderSession.currentBlendMode = 9999;
        this.renderSession.projection = projection;
        this.renderSession.offset = this.offset;
        this.spriteBatch.begin(this.renderSession);
        this.filterManager.begin(this.renderSession, buffer);
        displayObject._renderWebGL(this.renderSession);
        this.spriteBatch.end();
    };
    PIXI.WebGLRenderer.updateTextures = function() {
        var i = 0;
        for (i = 0; i < PIXI.Texture.frameUpdates.length; i++) PIXI.WebGLRenderer.updateTextureFrame(PIXI.Texture.frameUpdates[i]);
        for (i = 0; i < PIXI.texturesToDestroy.length; i++) PIXI.WebGLRenderer.destroyTexture(PIXI.texturesToDestroy[i]);
        PIXI.texturesToUpdate.length = 0;
        PIXI.texturesToDestroy.length = 0;
        PIXI.Texture.frameUpdates.length = 0;
    };
    PIXI.WebGLRenderer.destroyTexture = function(texture) {
        for (var i = texture._glTextures.length - 1; i >= 0; i--) {
            var glTexture = texture._glTextures[i];
            var gl = PIXI.glContexts[i];
            if (gl && glTexture) {
                gl.deleteTexture(glTexture);
            }
        }
        texture._glTextures.length = 0;
    };
    PIXI.WebGLRenderer.updateTextureFrame = function(texture) {
        texture.updateFrame = false;
        texture._updateWebGLuvs();
    };
    PIXI.WebGLRenderer.prototype.resize = function(width, height) {
        this.width = width;
        this.height = height;
        this.view.width = width;
        this.view.height = height;
        this.gl.viewport(0, 0, this.width, this.height);
        this.projection.x = this.width / 2;
        this.projection.y = -this.height / 2;
    };
    PIXI.createWebGLTexture = function(texture, gl) {
        if (texture.hasLoaded) {
            texture._glTextures[gl.id] = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
            if (!texture._powerOf2) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            }
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        return texture._glTextures[gl.id];
    };
    PIXI.updateWebGLTexture = function(texture, gl) {
        if (texture._glTextures[gl.id]) {
            gl.bindTexture(gl.TEXTURE_2D, texture._glTextures[gl.id]);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.source);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.scaleMode === PIXI.scaleModes.LINEAR ? gl.LINEAR : gl.NEAREST);
            if (!texture._powerOf2) {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            }
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    };
    PIXI.WebGLRenderer.prototype.handleContextLost = function(event) {
        event.preventDefault();
        this.contextLost = true;
    };
    PIXI.WebGLRenderer.prototype.handleContextRestored = function() {
        try {
            this.gl = this.view.getContext("experimental-webgl", this.options);
        } catch (e) {
            try {
                this.gl = this.view.getContext("webgl", this.options);
            } catch (e2) {
                throw new Error(" This browser does not support webGL. Try using the canvas renderer" + this);
            }
        }
        var gl = this.gl;
        gl.id = PIXI.WebGLRenderer.glContextId++;
        this.shaderManager.setContext(gl);
        this.spriteBatch.setContext(gl);
        this.maskManager.setContext(gl);
        this.filterManager.setContext(gl);
        this.renderSession.gl = this.gl;
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.colorMask(true, true, true, this.transparent);
        this.gl.viewport(0, 0, this.width, this.height);
        for (var key in PIXI.TextureCache) {
            var texture = PIXI.TextureCache[key].baseTexture;
            texture._glTextures = [];
        }
        this.contextLost = false;
    };
    PIXI.WebGLRenderer.prototype.destroy = function() {
        this.view.removeEventListener("webglcontextlost", this.contextLost);
        this.view.removeEventListener("webglcontextrestored", this.contextRestoredLost);
        PIXI.glContexts[this.glContextId] = null;
        this.projection = null;
        this.offset = null;
        this.shaderManager.destroy();
        this.spriteBatch.destroy();
        this.maskManager.destroy();
        this.filterManager.destroy();
        this.shaderManager = null;
        this.spriteBatch = null;
        this.maskManager = null;
        this.filterManager = null;
        this.gl = null;
        this.renderSession = null;
    };
    PIXI.WebGLRenderer.glContextId = 0;
    PIXI.WebGLMaskManager = function(gl) {
        this.maskStack = [];
        this.maskPosition = 0;
        this.setContext(gl);
    };
    PIXI.WebGLMaskManager.prototype.setContext = function(gl) {
        this.gl = gl;
    };
    PIXI.WebGLMaskManager.prototype.pushMask = function(maskData, renderSession) {
        var gl = this.gl;
        if (this.maskStack.length === 0) {
            gl.enable(gl.STENCIL_TEST);
            gl.stencilFunc(gl.ALWAYS, 1, 1);
        }
        this.maskStack.push(maskData);
        gl.colorMask(false, false, false, true);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);
        PIXI.WebGLGraphics.renderGraphics(maskData, renderSession);
        gl.colorMask(true, true, true, true);
        gl.stencilFunc(gl.NOTEQUAL, 0, this.maskStack.length);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    };
    PIXI.WebGLMaskManager.prototype.popMask = function(renderSession) {
        var gl = this.gl;
        var maskData = this.maskStack.pop();
        if (maskData) {
            gl.colorMask(false, false, false, false);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.DECR);
            PIXI.WebGLGraphics.renderGraphics(maskData, renderSession);
            gl.colorMask(true, true, true, true);
            gl.stencilFunc(gl.NOTEQUAL, 0, this.maskStack.length);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        }
        if (this.maskStack.length === 0) gl.disable(gl.STENCIL_TEST);
    };
    PIXI.WebGLMaskManager.prototype.destroy = function() {
        this.maskStack = null;
        this.gl = null;
    };
    PIXI.WebGLShaderManager = function(gl) {
        this.maxAttibs = 10;
        this.attribState = [];
        this.tempAttribState = [];
        for (var i = 0; i < this.maxAttibs; i++) {
            this.attribState[i] = false;
        }
        this.setContext(gl);
    };
    PIXI.WebGLShaderManager.prototype.setContext = function(gl) {
        this.gl = gl;
        this.primitiveShader = new PIXI.PrimitiveShader(gl);
        this.defaultShader = new PIXI.PixiShader(gl);
        this.fastShader = new PIXI.PixiFastShader(gl);
        this.activateShader(this.defaultShader);
    };
    PIXI.WebGLShaderManager.prototype.setAttribs = function(attribs) {
        var i;
        for (i = 0; i < this.tempAttribState.length; i++) {
            this.tempAttribState[i] = false;
        }
        for (i = 0; i < attribs.length; i++) {
            var attribId = attribs[i];
            this.tempAttribState[attribId] = true;
        }
        var gl = this.gl;
        for (i = 0; i < this.attribState.length; i++) {
            if (this.attribState[i] !== this.tempAttribState[i]) {
                this.attribState[i] = this.tempAttribState[i];
                if (this.tempAttribState[i]) {
                    gl.enableVertexAttribArray(i);
                } else {
                    gl.disableVertexAttribArray(i);
                }
            }
        }
    };
    PIXI.WebGLShaderManager.prototype.activateShader = function(shader) {
        this.currentShader = shader;
        this.gl.useProgram(shader.program);
        this.setAttribs(shader.attributes);
    };
    PIXI.WebGLShaderManager.prototype.activatePrimitiveShader = function() {
        var gl = this.gl;
        gl.useProgram(this.primitiveShader.program);
        this.setAttribs(this.primitiveShader.attributes);
    };
    PIXI.WebGLShaderManager.prototype.deactivatePrimitiveShader = function() {
        var gl = this.gl;
        gl.useProgram(this.defaultShader.program);
        this.setAttribs(this.defaultShader.attributes);
    };
    PIXI.WebGLShaderManager.prototype.destroy = function() {
        this.attribState = null;
        this.tempAttribState = null;
        this.primitiveShader.destroy();
        this.defaultShader.destroy();
        this.fastShader.destroy();
        this.gl = null;
    };
    PIXI.WebGLSpriteBatch = function(gl) {
        this.vertSize = 6;
        this.size = 2e3;
        var numVerts = this.size * 4 * this.vertSize;
        var numIndices = this.size * 6;
        this.vertices = new Float32Array(numVerts);
        this.indices = new Uint16Array(numIndices);
        this.lastIndexCount = 0;
        for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
            this.indices[i + 0] = j + 0;
            this.indices[i + 1] = j + 1;
            this.indices[i + 2] = j + 2;
            this.indices[i + 3] = j + 0;
            this.indices[i + 4] = j + 2;
            this.indices[i + 5] = j + 3;
        }
        this.drawing = false;
        this.currentBatchSize = 0;
        this.currentBaseTexture = null;
        this.setContext(gl);
    };
    PIXI.WebGLSpriteBatch.prototype.setContext = function(gl) {
        this.gl = gl;
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        this.currentBlendMode = 99999;
    };
    PIXI.WebGLSpriteBatch.prototype.begin = function(renderSession) {
        this.renderSession = renderSession;
        this.shader = this.renderSession.shaderManager.defaultShader;
        this.start();
    };
    PIXI.WebGLSpriteBatch.prototype.end = function() {
        this.flush();
    };
    PIXI.WebGLSpriteBatch.prototype.render = function(sprite) {
        var texture = sprite.texture;
        if (texture.baseTexture !== this.currentBaseTexture || this.currentBatchSize >= this.size) {
            this.flush();
            this.currentBaseTexture = texture.baseTexture;
        }
        if (sprite.blendMode !== this.currentBlendMode) {
            this.setBlendMode(sprite.blendMode);
        }
        var uvs = sprite._uvs || sprite.texture._uvs;
        if (!uvs) return;
        var alpha = sprite.worldAlpha;
        var tint = sprite.tint;
        var verticies = this.vertices;
        var aX = sprite.anchor.x;
        var aY = sprite.anchor.y;
        var w0, w1, h0, h1;
        if (sprite.texture.trim) {
            var trim = sprite.texture.trim;
            w1 = trim.x - aX * trim.width;
            w0 = w1 + texture.frame.width;
            h1 = trim.y - aY * trim.height;
            h0 = h1 + texture.frame.height;
        } else {
            w0 = texture.frame.width * (1 - aX);
            w1 = texture.frame.width * -aX;
            h0 = texture.frame.height * (1 - aY);
            h1 = texture.frame.height * -aY;
        }
        var index = this.currentBatchSize * 4 * this.vertSize;
        var worldTransform = sprite.worldTransform;
        var a = worldTransform.a;
        var b = worldTransform.c;
        var c = worldTransform.b;
        var d = worldTransform.d;
        var tx = worldTransform.tx;
        var ty = worldTransform.ty;
        verticies[index++] = a * w1 + c * h1 + tx;
        verticies[index++] = d * h1 + b * w1 + ty;
        verticies[index++] = uvs.x0;
        verticies[index++] = uvs.y0;
        verticies[index++] = alpha;
        verticies[index++] = tint;
        verticies[index++] = a * w0 + c * h1 + tx;
        verticies[index++] = d * h1 + b * w0 + ty;
        verticies[index++] = uvs.x1;
        verticies[index++] = uvs.y1;
        verticies[index++] = alpha;
        verticies[index++] = tint;
        verticies[index++] = a * w0 + c * h0 + tx;
        verticies[index++] = d * h0 + b * w0 + ty;
        verticies[index++] = uvs.x2;
        verticies[index++] = uvs.y2;
        verticies[index++] = alpha;
        verticies[index++] = tint;
        verticies[index++] = a * w1 + c * h0 + tx;
        verticies[index++] = d * h0 + b * w1 + ty;
        verticies[index++] = uvs.x3;
        verticies[index++] = uvs.y3;
        verticies[index++] = alpha;
        verticies[index++] = tint;
        this.currentBatchSize++;
    };
    PIXI.WebGLSpriteBatch.prototype.renderTilingSprite = function(tilingSprite) {
        var texture = tilingSprite.tilingTexture;
        if (texture.baseTexture !== this.currentBaseTexture || this.currentBatchSize >= this.size) {
            this.flush();
            this.currentBaseTexture = texture.baseTexture;
        }
        if (tilingSprite.blendMode !== this.currentBlendMode) {
            this.setBlendMode(tilingSprite.blendMode);
        }
        if (!tilingSprite._uvs) tilingSprite._uvs = new PIXI.TextureUvs();
        var uvs = tilingSprite._uvs;
        tilingSprite.tilePosition.x %= texture.baseTexture.width * tilingSprite.tileScaleOffset.x;
        tilingSprite.tilePosition.y %= texture.baseTexture.height * tilingSprite.tileScaleOffset.y;
        var offsetX = tilingSprite.tilePosition.x / (texture.baseTexture.width * tilingSprite.tileScaleOffset.x);
        var offsetY = tilingSprite.tilePosition.y / (texture.baseTexture.height * tilingSprite.tileScaleOffset.y);
        var scaleX = tilingSprite.width / texture.baseTexture.width / (tilingSprite.tileScale.x * tilingSprite.tileScaleOffset.x);
        var scaleY = tilingSprite.height / texture.baseTexture.height / (tilingSprite.tileScale.y * tilingSprite.tileScaleOffset.y);
        uvs.x0 = 0 - offsetX;
        uvs.y0 = 0 - offsetY;
        uvs.x1 = 1 * scaleX - offsetX;
        uvs.y1 = 0 - offsetY;
        uvs.x2 = 1 * scaleX - offsetX;
        uvs.y2 = 1 * scaleY - offsetY;
        uvs.x3 = 0 - offsetX;
        uvs.y3 = 1 * scaleY - offsetY;
        var alpha = tilingSprite.worldAlpha;
        var tint = tilingSprite.tint;
        var verticies = this.vertices;
        var width = tilingSprite.width;
        var height = tilingSprite.height;
        var aX = tilingSprite.anchor.x;
        var aY = tilingSprite.anchor.y;
        var w0 = width * (1 - aX);
        var w1 = width * -aX;
        var h0 = height * (1 - aY);
        var h1 = height * -aY;
        var index = this.currentBatchSize * 4 * this.vertSize;
        var worldTransform = tilingSprite.worldTransform;
        var a = worldTransform.a;
        var b = worldTransform.c;
        var c = worldTransform.b;
        var d = worldTransform.d;
        var tx = worldTransform.tx;
        var ty = worldTransform.ty;
        verticies[index++] = a * w1 + c * h1 + tx;
        verticies[index++] = d * h1 + b * w1 + ty;
        verticies[index++] = uvs.x0;
        verticies[index++] = uvs.y0;
        verticies[index++] = alpha;
        verticies[index++] = tint;
        verticies[index++] = a * w0 + c * h1 + tx;
        verticies[index++] = d * h1 + b * w0 + ty;
        verticies[index++] = uvs.x1;
        verticies[index++] = uvs.y1;
        verticies[index++] = alpha;
        verticies[index++] = tint;
        verticies[index++] = a * w0 + c * h0 + tx;
        verticies[index++] = d * h0 + b * w0 + ty;
        verticies[index++] = uvs.x2;
        verticies[index++] = uvs.y2;
        verticies[index++] = alpha;
        verticies[index++] = tint;
        verticies[index++] = a * w1 + c * h0 + tx;
        verticies[index++] = d * h0 + b * w1 + ty;
        verticies[index++] = uvs.x3;
        verticies[index++] = uvs.y3;
        verticies[index++] = alpha;
        verticies[index++] = tint;
        this.currentBatchSize++;
    };
    PIXI.WebGLSpriteBatch.prototype.flush = function() {
        if (this.currentBatchSize === 0) return;
        var gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.currentBaseTexture._glTextures[gl.id] || PIXI.createWebGLTexture(this.currentBaseTexture, gl));
        if (this.currentBatchSize > this.size * .5) {
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        } else {
            var view = this.vertices.subarray(0, this.currentBatchSize * 4 * this.vertSize);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
        }
        gl.drawElements(gl.TRIANGLES, this.currentBatchSize * 6, gl.UNSIGNED_SHORT, 0);
        this.currentBatchSize = 0;
        this.renderSession.drawCount++;
    };
    PIXI.WebGLSpriteBatch.prototype.stop = function() {
        this.flush();
    };
    PIXI.WebGLSpriteBatch.prototype.start = function() {
        var gl = this.gl;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        var projection = this.renderSession.projection;
        gl.uniform2f(this.shader.projectionVector, projection.x, projection.y);
        var stride = this.vertSize * 4;
        gl.vertexAttribPointer(this.shader.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
        gl.vertexAttribPointer(this.shader.aTextureCoord, 2, gl.FLOAT, false, stride, 2 * 4);
        gl.vertexAttribPointer(this.shader.colorAttribute, 2, gl.FLOAT, false, stride, 4 * 4);
        if (this.currentBlendMode !== PIXI.blendModes.NORMAL) {
            this.setBlendMode(PIXI.blendModes.NORMAL);
        }
    };
    PIXI.WebGLSpriteBatch.prototype.setBlendMode = function(blendMode) {
        this.flush();
        this.currentBlendMode = blendMode;
        var blendModeWebGL = PIXI.blendModesWebGL[this.currentBlendMode];
        this.gl.blendFunc(blendModeWebGL[0], blendModeWebGL[1]);
    };
    PIXI.WebGLSpriteBatch.prototype.destroy = function() {
        this.vertices = null;
        this.indices = null;
        this.gl.deleteBuffer(this.vertexBuffer);
        this.gl.deleteBuffer(this.indexBuffer);
        this.currentBaseTexture = null;
        this.gl = null;
    };
    PIXI.WebGLFastSpriteBatch = function(gl) {
        this.vertSize = 10;
        this.maxSize = 6e3;
        this.size = this.maxSize;
        var numVerts = this.size * 4 * this.vertSize;
        var numIndices = this.maxSize * 6;
        this.vertices = new Float32Array(numVerts);
        this.indices = new Uint16Array(numIndices);
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.lastIndexCount = 0;
        for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
            this.indices[i + 0] = j + 0;
            this.indices[i + 1] = j + 1;
            this.indices[i + 2] = j + 2;
            this.indices[i + 3] = j + 0;
            this.indices[i + 4] = j + 2;
            this.indices[i + 5] = j + 3;
        }
        this.drawing = false;
        this.currentBatchSize = 0;
        this.currentBaseTexture = null;
        this.currentBlendMode = 0;
        this.renderSession = null;
        this.shader = null;
        this.matrix = null;
        this.setContext(gl);
    };
    PIXI.WebGLFastSpriteBatch.prototype.setContext = function(gl) {
        this.gl = gl;
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        this.currentBlendMode = 99999;
    };
    PIXI.WebGLFastSpriteBatch.prototype.begin = function(spriteBatch, renderSession) {
        this.renderSession = renderSession;
        this.shader = this.renderSession.shaderManager.fastShader;
        this.matrix = spriteBatch.worldTransform.toArray(true);
        this.start();
    };
    PIXI.WebGLFastSpriteBatch.prototype.end = function() {
        this.flush();
    };
    PIXI.WebGLFastSpriteBatch.prototype.render = function(spriteBatch) {
        var children = spriteBatch.children;
        var sprite = children[0];
        if (!sprite.texture._uvs) return;
        this.currentBaseTexture = sprite.texture.baseTexture;
        if (sprite.blendMode !== this.currentBlendMode) {
            this.setBlendMode(sprite.blendMode);
        }
        for (var i = 0, j = children.length; i < j; i++) {
            this.renderSprite(children[i]);
        }
        this.flush();
    };
    PIXI.WebGLFastSpriteBatch.prototype.renderSprite = function(sprite) {
        if (!sprite.visible) return;
        if (sprite.texture.baseTexture !== this.currentBaseTexture) {
            this.flush();
            this.currentBaseTexture = sprite.texture.baseTexture;
            if (!sprite.texture._uvs) return;
        }
        var uvs, verticies = this.vertices, width, height, w0, w1, h0, h1, index;
        uvs = sprite.texture._uvs;
        width = sprite.texture.frame.width;
        height = sprite.texture.frame.height;
        if (sprite.texture.trim) {
            var trim = sprite.texture.trim;
            w1 = trim.x - sprite.anchor.x * trim.width;
            w0 = w1 + sprite.texture.frame.width;
            h1 = trim.y - sprite.anchor.y * trim.height;
            h0 = h1 + sprite.texture.frame.height;
        } else {
            w0 = sprite.texture.frame.width * (1 - sprite.anchor.x);
            w1 = sprite.texture.frame.width * -sprite.anchor.x;
            h0 = sprite.texture.frame.height * (1 - sprite.anchor.y);
            h1 = sprite.texture.frame.height * -sprite.anchor.y;
        }
        index = this.currentBatchSize * 4 * this.vertSize;
        verticies[index++] = w1;
        verticies[index++] = h1;
        verticies[index++] = sprite.position.x;
        verticies[index++] = sprite.position.y;
        verticies[index++] = sprite.scale.x;
        verticies[index++] = sprite.scale.y;
        verticies[index++] = sprite.rotation;
        verticies[index++] = uvs.x0;
        verticies[index++] = uvs.y1;
        verticies[index++] = sprite.alpha;
        verticies[index++] = w0;
        verticies[index++] = h1;
        verticies[index++] = sprite.position.x;
        verticies[index++] = sprite.position.y;
        verticies[index++] = sprite.scale.x;
        verticies[index++] = sprite.scale.y;
        verticies[index++] = sprite.rotation;
        verticies[index++] = uvs.x1;
        verticies[index++] = uvs.y1;
        verticies[index++] = sprite.alpha;
        verticies[index++] = w0;
        verticies[index++] = h0;
        verticies[index++] = sprite.position.x;
        verticies[index++] = sprite.position.y;
        verticies[index++] = sprite.scale.x;
        verticies[index++] = sprite.scale.y;
        verticies[index++] = sprite.rotation;
        verticies[index++] = uvs.x2;
        verticies[index++] = uvs.y2;
        verticies[index++] = sprite.alpha;
        verticies[index++] = w1;
        verticies[index++] = h0;
        verticies[index++] = sprite.position.x;
        verticies[index++] = sprite.position.y;
        verticies[index++] = sprite.scale.x;
        verticies[index++] = sprite.scale.y;
        verticies[index++] = sprite.rotation;
        verticies[index++] = uvs.x3;
        verticies[index++] = uvs.y3;
        verticies[index++] = sprite.alpha;
        this.currentBatchSize++;
        if (this.currentBatchSize >= this.size) {
            this.flush();
        }
    };
    PIXI.WebGLFastSpriteBatch.prototype.flush = function() {
        if (this.currentBatchSize === 0) return;
        var gl = this.gl;
        if (!this.currentBaseTexture._glTextures[gl.id]) PIXI.createWebGLTexture(this.currentBaseTexture, gl);
        gl.bindTexture(gl.TEXTURE_2D, this.currentBaseTexture._glTextures[gl.id]);
        if (this.currentBatchSize > this.size * .5) {
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        } else {
            var view = this.vertices.subarray(0, this.currentBatchSize * 4 * this.vertSize);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, view);
        }
        gl.drawElements(gl.TRIANGLES, this.currentBatchSize * 6, gl.UNSIGNED_SHORT, 0);
        this.currentBatchSize = 0;
        this.renderSession.drawCount++;
    };
    PIXI.WebGLFastSpriteBatch.prototype.stop = function() {
        this.flush();
    };
    PIXI.WebGLFastSpriteBatch.prototype.start = function() {
        var gl = this.gl;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        var projection = this.renderSession.projection;
        gl.uniform2f(this.shader.projectionVector, projection.x, projection.y);
        gl.uniformMatrix3fv(this.shader.uMatrix, false, this.matrix);
        var stride = this.vertSize * 4;
        gl.vertexAttribPointer(this.shader.aVertexPosition, 2, gl.FLOAT, false, stride, 0);
        gl.vertexAttribPointer(this.shader.aPositionCoord, 2, gl.FLOAT, false, stride, 2 * 4);
        gl.vertexAttribPointer(this.shader.aScale, 2, gl.FLOAT, false, stride, 4 * 4);
        gl.vertexAttribPointer(this.shader.aRotation, 1, gl.FLOAT, false, stride, 6 * 4);
        gl.vertexAttribPointer(this.shader.aTextureCoord, 2, gl.FLOAT, false, stride, 7 * 4);
        gl.vertexAttribPointer(this.shader.colorAttribute, 1, gl.FLOAT, false, stride, 9 * 4);
        if (this.currentBlendMode !== PIXI.blendModes.NORMAL) {
            this.setBlendMode(PIXI.blendModes.NORMAL);
        }
    };
    PIXI.WebGLFastSpriteBatch.prototype.setBlendMode = function(blendMode) {
        this.flush();
        this.currentBlendMode = blendMode;
        var blendModeWebGL = PIXI.blendModesWebGL[this.currentBlendMode];
        this.gl.blendFunc(blendModeWebGL[0], blendModeWebGL[1]);
    };
    PIXI.WebGLFilterManager = function(gl, transparent) {
        this.transparent = transparent;
        this.filterStack = [];
        this.offsetX = 0;
        this.offsetY = 0;
        this.setContext(gl);
    };
    PIXI.WebGLFilterManager.prototype.setContext = function(gl) {
        this.gl = gl;
        this.texturePool = [];
        this.initShaderBuffers();
    };
    PIXI.WebGLFilterManager.prototype.begin = function(renderSession, buffer) {
        this.renderSession = renderSession;
        this.defaultShader = renderSession.shaderManager.defaultShader;
        var projection = this.renderSession.projection;
        this.width = projection.x * 2;
        this.height = -projection.y * 2;
        this.buffer = buffer;
    };
    PIXI.WebGLFilterManager.prototype.pushFilter = function(filterBlock) {
        var gl = this.gl;
        var projection = this.renderSession.projection;
        var offset = this.renderSession.offset;
        filterBlock._filterArea = filterBlock.target.filterArea || filterBlock.target.getBounds();
        this.filterStack.push(filterBlock);
        var filter = filterBlock.filterPasses[0];
        this.offsetX += filterBlock._filterArea.x;
        this.offsetY += filterBlock._filterArea.y;
        var texture = this.texturePool.pop();
        if (!texture) {
            texture = new PIXI.FilterTexture(this.gl, this.width, this.height);
        } else {
            texture.resize(this.width, this.height);
        }
        gl.bindTexture(gl.TEXTURE_2D, texture.texture);
        var filterArea = filterBlock._filterArea;
        var padidng = filter.padding;
        filterArea.x -= padidng;
        filterArea.y -= padidng;
        filterArea.width += padidng * 2;
        filterArea.height += padidng * 2;
        if (filterArea.x < 0) filterArea.x = 0;
        if (filterArea.width > this.width) filterArea.width = this.width;
        if (filterArea.y < 0) filterArea.y = 0;
        if (filterArea.height > this.height) filterArea.height = this.height;
        gl.bindFramebuffer(gl.FRAMEBUFFER, texture.frameBuffer);
        gl.viewport(0, 0, filterArea.width, filterArea.height);
        projection.x = filterArea.width / 2;
        projection.y = -filterArea.height / 2;
        offset.x = -filterArea.x;
        offset.y = -filterArea.y;
        gl.uniform2f(this.defaultShader.projectionVector, filterArea.width / 2, -filterArea.height / 2);
        gl.uniform2f(this.defaultShader.offsetVector, -filterArea.x, -filterArea.y);
        gl.colorMask(true, true, true, true);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        filterBlock._glFilterTexture = texture;
    };
    PIXI.WebGLFilterManager.prototype.popFilter = function() {
        var gl = this.gl;
        var filterBlock = this.filterStack.pop();
        var filterArea = filterBlock._filterArea;
        var texture = filterBlock._glFilterTexture;
        var projection = this.renderSession.projection;
        var offset = this.renderSession.offset;
        if (filterBlock.filterPasses.length > 1) {
            gl.viewport(0, 0, filterArea.width, filterArea.height);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            this.vertexArray[0] = 0;
            this.vertexArray[1] = filterArea.height;
            this.vertexArray[2] = filterArea.width;
            this.vertexArray[3] = filterArea.height;
            this.vertexArray[4] = 0;
            this.vertexArray[5] = 0;
            this.vertexArray[6] = filterArea.width;
            this.vertexArray[7] = 0;
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexArray);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            this.uvArray[2] = filterArea.width / this.width;
            this.uvArray[5] = filterArea.height / this.height;
            this.uvArray[6] = filterArea.width / this.width;
            this.uvArray[7] = filterArea.height / this.height;
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.uvArray);
            var inputTexture = texture;
            var outputTexture = this.texturePool.pop();
            if (!outputTexture) outputTexture = new PIXI.FilterTexture(this.gl, this.width, this.height);
            outputTexture.resize(this.width, this.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, outputTexture.frameBuffer);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.disable(gl.BLEND);
            for (var i = 0; i < filterBlock.filterPasses.length - 1; i++) {
                var filterPass = filterBlock.filterPasses[i];
                gl.bindFramebuffer(gl.FRAMEBUFFER, outputTexture.frameBuffer);
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, inputTexture.texture);
                this.applyFilterPass(filterPass, filterArea, filterArea.width, filterArea.height);
                var temp = inputTexture;
                inputTexture = outputTexture;
                outputTexture = temp;
            }
            gl.enable(gl.BLEND);
            texture = inputTexture;
            this.texturePool.push(outputTexture);
        }
        var filter = filterBlock.filterPasses[filterBlock.filterPasses.length - 1];
        this.offsetX -= filterArea.x;
        this.offsetY -= filterArea.y;
        var sizeX = this.width;
        var sizeY = this.height;
        var offsetX = 0;
        var offsetY = 0;
        var buffer = this.buffer;
        if (this.filterStack.length === 0) {
            gl.colorMask(true, true, true, true);
        } else {
            var currentFilter = this.filterStack[this.filterStack.length - 1];
            filterArea = currentFilter._filterArea;
            sizeX = filterArea.width;
            sizeY = filterArea.height;
            offsetX = filterArea.x;
            offsetY = filterArea.y;
            buffer = currentFilter._glFilterTexture.frameBuffer;
        }
        projection.x = sizeX / 2;
        projection.y = -sizeY / 2;
        offset.x = offsetX;
        offset.y = offsetY;
        filterArea = filterBlock._filterArea;
        var x = filterArea.x - offsetX;
        var y = filterArea.y - offsetY;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        this.vertexArray[0] = x;
        this.vertexArray[1] = y + filterArea.height;
        this.vertexArray[2] = x + filterArea.width;
        this.vertexArray[3] = y + filterArea.height;
        this.vertexArray[4] = x;
        this.vertexArray[5] = y;
        this.vertexArray[6] = x + filterArea.width;
        this.vertexArray[7] = y;
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        this.uvArray[2] = filterArea.width / this.width;
        this.uvArray[5] = filterArea.height / this.height;
        this.uvArray[6] = filterArea.width / this.width;
        this.uvArray[7] = filterArea.height / this.height;
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.uvArray);
        gl.viewport(0, 0, sizeX, sizeY);
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture.texture);
        this.applyFilterPass(filter, filterArea, sizeX, sizeY);
        gl.useProgram(this.defaultShader.program);
        gl.uniform2f(this.defaultShader.projectionVector, sizeX / 2, -sizeY / 2);
        gl.uniform2f(this.defaultShader.offsetVector, -offsetX, -offsetY);
        this.texturePool.push(texture);
        filterBlock._glFilterTexture = null;
    };
    PIXI.WebGLFilterManager.prototype.applyFilterPass = function(filter, filterArea, width, height) {
        var gl = this.gl;
        var shader = filter.shaders[gl.id];
        if (!shader) {
            shader = new PIXI.PixiShader(gl);
            shader.fragmentSrc = filter.fragmentSrc;
            shader.uniforms = filter.uniforms;
            shader.init();
            filter.shaders[gl.id] = shader;
        }
        gl.useProgram(shader.program);
        gl.uniform2f(shader.projectionVector, width / 2, -height / 2);
        gl.uniform2f(shader.offsetVector, 0, 0);
        if (filter.uniforms.dimensions) {
            filter.uniforms.dimensions.value[0] = this.width;
            filter.uniforms.dimensions.value[1] = this.height;
            filter.uniforms.dimensions.value[2] = this.vertexArray[0];
            filter.uniforms.dimensions.value[3] = this.vertexArray[5];
        }
        shader.syncUniforms();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(shader.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(shader.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(shader.colorAttribute, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        this.renderSession.drawCount++;
    };
    PIXI.WebGLFilterManager.prototype.initShaderBuffers = function() {
        var gl = this.gl;
        this.vertexBuffer = gl.createBuffer();
        this.uvBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        this.vertexArray = new Float32Array([ 0, 0, 1, 0, 0, 1, 1, 1 ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);
        this.uvArray = new Float32Array([ 0, 0, 1, 0, 0, 1, 1, 1 ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvArray, gl.STATIC_DRAW);
        this.colorArray = new Float32Array([ 1, 16777215, 1, 16777215, 1, 16777215, 1, 16777215 ]);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colorArray, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([ 0, 1, 2, 1, 3, 2 ]), gl.STATIC_DRAW);
    };
    PIXI.WebGLFilterManager.prototype.destroy = function() {
        var gl = this.gl;
        this.filterStack = null;
        this.offsetX = 0;
        this.offsetY = 0;
        for (var i = 0; i < this.texturePool.length; i++) {
            this.texturePool.destroy();
        }
        this.texturePool = null;
        gl.deleteBuffer(this.vertexBuffer);
        gl.deleteBuffer(this.uvBuffer);
        gl.deleteBuffer(this.colorBuffer);
        gl.deleteBuffer(this.indexBuffer);
    };
    PIXI.FilterTexture = function(gl, width, height) {
        this.gl = gl;
        this.frameBuffer = gl.createFramebuffer();
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
        this.resize(width, height);
    };
    PIXI.FilterTexture.prototype.clear = function() {
        var gl = this.gl;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    };
    PIXI.FilterTexture.prototype.resize = function(width, height) {
        if (this.width === width && this.height === height) return;
        this.width = width;
        this.height = height;
        var gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    };
    PIXI.FilterTexture.prototype.destroy = function() {
        var gl = this.gl;
        gl.deleteFramebuffer(this.frameBuffer);
        gl.deleteTexture(this.texture);
        this.frameBuffer = null;
        this.texture = null;
    };
    PIXI.CanvasMaskManager = function() {};
    PIXI.CanvasMaskManager.prototype.pushMask = function(maskData, context) {
        context.save();
        var cacheAlpha = maskData.alpha;
        var transform = maskData.worldTransform;
        context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx, transform.ty);
        PIXI.CanvasGraphics.renderGraphicsMask(maskData, context);
        context.clip();
        maskData.worldAlpha = cacheAlpha;
    };
    PIXI.CanvasMaskManager.prototype.popMask = function(context) {
        context.restore();
    };
    PIXI.CanvasTinter = function() {};
    PIXI.CanvasTinter.getTintedTexture = function(sprite, color) {
        var texture = sprite.texture;
        color = PIXI.CanvasTinter.roundColor(color);
        var stringColor = "#" + ("00000" + (color | 0).toString(16)).substr(-6);
        texture.tintCache = texture.tintCache || {};
        if (texture.tintCache[stringColor]) return texture.tintCache[stringColor];
        var canvas = PIXI.CanvasTinter.canvas || document.createElement("canvas");
        PIXI.CanvasTinter.tintMethod(texture, color, canvas);
        if (PIXI.CanvasTinter.convertTintToImage) {
            var tintImage = new Image();
            tintImage.src = canvas.toDataURL();
            texture.tintCache[stringColor] = tintImage;
        } else {
            texture.tintCache[stringColor] = canvas;
            PIXI.CanvasTinter.canvas = null;
        }
        return canvas;
    };
    PIXI.CanvasTinter.tintWithMultiply = function(texture, color, canvas) {
        var context = canvas.getContext("2d");
        var frame = texture.frame;
        canvas.width = frame.width;
        canvas.height = frame.height;
        context.fillStyle = "#" + ("00000" + (color | 0).toString(16)).substr(-6);
        context.fillRect(0, 0, frame.width, frame.height);
        context.globalCompositeOperation = "multiply";
        context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
        context.globalCompositeOperation = "destination-atop";
        context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
    };
    PIXI.CanvasTinter.tintWithOverlay = function(texture, color, canvas) {
        var context = canvas.getContext("2d");
        var frame = texture.frame;
        canvas.width = frame.width;
        canvas.height = frame.height;
        context.globalCompositeOperation = "copy";
        context.fillStyle = "#" + ("00000" + (color | 0).toString(16)).substr(-6);
        context.fillRect(0, 0, frame.width, frame.height);
        context.globalCompositeOperation = "destination-atop";
        context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
    };
    PIXI.CanvasTinter.tintWithPerPixel = function(texture, color, canvas) {
        var context = canvas.getContext("2d");
        var frame = texture.frame;
        canvas.width = frame.width;
        canvas.height = frame.height;
        context.globalCompositeOperation = "copy";
        context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
        var rgbValues = PIXI.hex2rgb(color);
        var r = rgbValues[0], g = rgbValues[1], b = rgbValues[2];
        var pixelData = context.getImageData(0, 0, frame.width, frame.height);
        var pixels = pixelData.data;
        for (var i = 0; i < pixels.length; i += 4) {
            pixels[i + 0] *= r;
            pixels[i + 1] *= g;
            pixels[i + 2] *= b;
        }
        context.putImageData(pixelData, 0, 0);
    };
    PIXI.CanvasTinter.roundColor = function(color) {
        var step = PIXI.CanvasTinter.cacheStepsPerColorChannel;
        var rgbValues = PIXI.hex2rgb(color);
        rgbValues[0] = Math.min(255, rgbValues[0] / step * step);
        rgbValues[1] = Math.min(255, rgbValues[1] / step * step);
        rgbValues[2] = Math.min(255, rgbValues[2] / step * step);
        return PIXI.rgb2hex(rgbValues);
    };
    PIXI.CanvasTinter.cacheStepsPerColorChannel = 8;
    PIXI.CanvasTinter.convertTintToImage = false;
    PIXI.CanvasTinter.canUseMultiply = PIXI.canUseNewCanvasBlendModes();
    PIXI.CanvasTinter.tintMethod = PIXI.CanvasTinter.canUseMultiply ? PIXI.CanvasTinter.tintWithMultiply : PIXI.CanvasTinter.tintWithPerPixel;
    PIXI.CanvasRenderer = function(width, height, view, transparent) {
        PIXI.defaultRenderer = PIXI.defaultRenderer || this;
        this.type = PIXI.CANVAS_RENDERER;
        this.clearBeforeRender = true;
        this.roundPixels = false;
        this.transparent = !!transparent;
        if (!PIXI.blendModesCanvas) {
            PIXI.blendModesCanvas = [];
            if (PIXI.canUseNewCanvasBlendModes()) {
                PIXI.blendModesCanvas[PIXI.blendModes.NORMAL] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.ADD] = "lighter";
                PIXI.blendModesCanvas[PIXI.blendModes.MULTIPLY] = "multiply";
                PIXI.blendModesCanvas[PIXI.blendModes.SCREEN] = "screen";
                PIXI.blendModesCanvas[PIXI.blendModes.OVERLAY] = "overlay";
                PIXI.blendModesCanvas[PIXI.blendModes.DARKEN] = "darken";
                PIXI.blendModesCanvas[PIXI.blendModes.LIGHTEN] = "lighten";
                PIXI.blendModesCanvas[PIXI.blendModes.COLOR_DODGE] = "color-dodge";
                PIXI.blendModesCanvas[PIXI.blendModes.COLOR_BURN] = "color-burn";
                PIXI.blendModesCanvas[PIXI.blendModes.HARD_LIGHT] = "hard-light";
                PIXI.blendModesCanvas[PIXI.blendModes.SOFT_LIGHT] = "soft-light";
                PIXI.blendModesCanvas[PIXI.blendModes.DIFFERENCE] = "difference";
                PIXI.blendModesCanvas[PIXI.blendModes.EXCLUSION] = "exclusion";
                PIXI.blendModesCanvas[PIXI.blendModes.HUE] = "hue";
                PIXI.blendModesCanvas[PIXI.blendModes.SATURATION] = "saturation";
                PIXI.blendModesCanvas[PIXI.blendModes.COLOR] = "color";
                PIXI.blendModesCanvas[PIXI.blendModes.LUMINOSITY] = "luminosity";
            } else {
                PIXI.blendModesCanvas[PIXI.blendModes.NORMAL] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.ADD] = "lighter";
                PIXI.blendModesCanvas[PIXI.blendModes.MULTIPLY] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.SCREEN] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.OVERLAY] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.DARKEN] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.LIGHTEN] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.COLOR_DODGE] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.COLOR_BURN] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.HARD_LIGHT] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.SOFT_LIGHT] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.DIFFERENCE] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.EXCLUSION] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.HUE] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.SATURATION] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.COLOR] = "source-over";
                PIXI.blendModesCanvas[PIXI.blendModes.LUMINOSITY] = "source-over";
            }
        }
        this.width = width || 800;
        this.height = height || 600;
        this.view = view || document.createElement("canvas");
        this.context = this.view.getContext("2d", {
            alpha: this.transparent
        });
        this.refresh = true;
        this.view.width = this.width;
        this.view.height = this.height;
        this.count = 0;
        this.maskManager = new PIXI.CanvasMaskManager();
        this.renderSession = {
            context: this.context,
            maskManager: this.maskManager,
            scaleMode: null,
            smoothProperty: null
        };
        if ("imageSmoothingEnabled" in this.context) this.renderSession.smoothProperty = "imageSmoothingEnabled"; else if ("webkitImageSmoothingEnabled" in this.context) this.renderSession.smoothProperty = "webkitImageSmoothingEnabled"; else if ("mozImageSmoothingEnabled" in this.context) this.renderSession.smoothProperty = "mozImageSmoothingEnabled"; else if ("oImageSmoothingEnabled" in this.context) this.renderSession.smoothProperty = "oImageSmoothingEnabled";
    };
    PIXI.CanvasRenderer.prototype.constructor = PIXI.CanvasRenderer;
    PIXI.CanvasRenderer.prototype.render = function(stage) {
        PIXI.texturesToUpdate.length = 0;
        PIXI.texturesToDestroy.length = 0;
        stage.updateTransform();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.globalAlpha = 1;
        if (!this.transparent && this.clearBeforeRender) {
            this.context.fillStyle = stage.backgroundColorString;
            this.context.fillRect(0, 0, this.width, this.height);
        } else if (this.transparent && this.clearBeforeRender) {
            this.context.clearRect(0, 0, this.width, this.height);
        }
        this.renderDisplayObject(stage);
        if (stage.interactive) {
            if (!stage._interactiveEventsAdded) {
                stage._interactiveEventsAdded = true;
                stage.interactionManager.setTarget(this);
            }
        }
        if (PIXI.Texture.frameUpdates.length > 0) {
            PIXI.Texture.frameUpdates.length = 0;
        }
    };
    PIXI.CanvasRenderer.prototype.resize = function(width, height) {
        this.width = width;
        this.height = height;
        this.view.width = width;
        this.view.height = height;
    };
    PIXI.CanvasRenderer.prototype.renderDisplayObject = function(displayObject, context) {
        this.renderSession.context = context || this.context;
        displayObject._renderCanvas(this.renderSession);
    };
    PIXI.CanvasRenderer.prototype.renderStripFlat = function(strip) {
        var context = this.context;
        var verticies = strip.verticies;
        var length = verticies.length / 2;
        this.count++;
        context.beginPath();
        for (var i = 1; i < length - 2; i++) {
            var index = i * 2;
            var x0 = verticies[index], x1 = verticies[index + 2], x2 = verticies[index + 4];
            var y0 = verticies[index + 1], y1 = verticies[index + 3], y2 = verticies[index + 5];
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.lineTo(x2, y2);
        }
        context.fillStyle = "#FF0000";
        context.fill();
        context.closePath();
    };
    PIXI.CanvasRenderer.prototype.renderStrip = function(strip) {
        var context = this.context;
        var verticies = strip.verticies;
        var uvs = strip.uvs;
        var length = verticies.length / 2;
        this.count++;
        for (var i = 1; i < length - 2; i++) {
            var index = i * 2;
            var x0 = verticies[index], x1 = verticies[index + 2], x2 = verticies[index + 4];
            var y0 = verticies[index + 1], y1 = verticies[index + 3], y2 = verticies[index + 5];
            var u0 = uvs[index] * strip.texture.width, u1 = uvs[index + 2] * strip.texture.width, u2 = uvs[index + 4] * strip.texture.width;
            var v0 = uvs[index + 1] * strip.texture.height, v1 = uvs[index + 3] * strip.texture.height, v2 = uvs[index + 5] * strip.texture.height;
            context.save();
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.lineTo(x2, y2);
            context.closePath();
            context.clip();
            var delta = u0 * v1 + v0 * u2 + u1 * v2 - v1 * u2 - v0 * u1 - u0 * v2;
            var deltaA = x0 * v1 + v0 * x2 + x1 * v2 - v1 * x2 - v0 * x1 - x0 * v2;
            var deltaB = u0 * x1 + x0 * u2 + u1 * x2 - x1 * u2 - x0 * u1 - u0 * x2;
            var deltaC = u0 * v1 * x2 + v0 * x1 * u2 + x0 * u1 * v2 - x0 * v1 * u2 - v0 * u1 * x2 - u0 * x1 * v2;
            var deltaD = y0 * v1 + v0 * y2 + y1 * v2 - v1 * y2 - v0 * y1 - y0 * v2;
            var deltaE = u0 * y1 + y0 * u2 + u1 * y2 - y1 * u2 - y0 * u1 - u0 * y2;
            var deltaF = u0 * v1 * y2 + v0 * y1 * u2 + y0 * u1 * v2 - y0 * v1 * u2 - v0 * u1 * y2 - u0 * y1 * v2;
            context.transform(deltaA / delta, deltaD / delta, deltaB / delta, deltaE / delta, deltaC / delta, deltaF / delta);
            context.drawImage(strip.texture.baseTexture.source, 0, 0);
            context.restore();
        }
    };
    PIXI.CanvasBuffer = function(width, height) {
        this.width = width;
        this.height = height;
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.canvas.width = width;
        this.canvas.height = height;
    };
    PIXI.CanvasBuffer.prototype.clear = function() {
        this.context.clearRect(0, 0, this.width, this.height);
    };
    PIXI.CanvasBuffer.prototype.resize = function(width, height) {
        this.width = this.canvas.width = width;
        this.height = this.canvas.height = height;
    };
    PIXI.CanvasGraphics = function() {};
    PIXI.CanvasGraphics.renderGraphics = function(graphics, context) {
        var worldAlpha = graphics.worldAlpha;
        var color = "";
        for (var i = 0; i < graphics.graphicsData.length; i++) {
            var data = graphics.graphicsData[i];
            var points = data.points;
            context.strokeStyle = color = "#" + ("00000" + (data.lineColor | 0).toString(16)).substr(-6);
            context.lineWidth = data.lineWidth;
            if (data.type === PIXI.Graphics.POLY) {
                context.beginPath();
                context.moveTo(points[0], points[1]);
                for (var j = 1; j < points.length / 2; j++) {
                    context.lineTo(points[j * 2], points[j * 2 + 1]);
                }
                if (points[0] === points[points.length - 2] && points[1] === points[points.length - 1]) {
                    context.closePath();
                }
                if (data.fill) {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = color = "#" + ("00000" + (data.fillColor | 0).toString(16)).substr(-6);
                    context.fill();
                }
                if (data.lineWidth) {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.stroke();
                }
            } else if (data.type === PIXI.Graphics.RECT) {
                if (data.fillColor || data.fillColor === 0) {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = color = "#" + ("00000" + (data.fillColor | 0).toString(16)).substr(-6);
                    context.fillRect(points[0], points[1], points[2], points[3]);
                }
                if (data.lineWidth) {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.strokeRect(points[0], points[1], points[2], points[3]);
                }
            } else if (data.type === PIXI.Graphics.CIRC) {
                context.beginPath();
                context.arc(points[0], points[1], points[2], 0, 2 * Math.PI);
                context.closePath();
                if (data.fill) {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = color = "#" + ("00000" + (data.fillColor | 0).toString(16)).substr(-6);
                    context.fill();
                }
                if (data.lineWidth) {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.stroke();
                }
            } else if (data.type === PIXI.Graphics.ELIP) {
                var ellipseData = data.points;
                var w = ellipseData[2] * 2;
                var h = ellipseData[3] * 2;
                var x = ellipseData[0] - w / 2;
                var y = ellipseData[1] - h / 2;
                context.beginPath();
                var kappa = .5522848, ox = w / 2 * kappa, oy = h / 2 * kappa, xe = x + w, ye = y + h, xm = x + w / 2, ym = y + h / 2;
                context.moveTo(x, ym);
                context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
                context.closePath();
                if (data.fill) {
                    context.globalAlpha = data.fillAlpha * worldAlpha;
                    context.fillStyle = color = "#" + ("00000" + (data.fillColor | 0).toString(16)).substr(-6);
                    context.fill();
                }
                if (data.lineWidth) {
                    context.globalAlpha = data.lineAlpha * worldAlpha;
                    context.stroke();
                }
            }
        }
    };
    PIXI.CanvasGraphics.renderGraphicsMask = function(graphics, context) {
        var len = graphics.graphicsData.length;
        if (len === 0) return;
        if (len > 1) {
            len = 1;
            window.console.log("Pixi.js warning: masks in canvas can only mask using the first path in the graphics object");
        }
        for (var i = 0; i < 1; i++) {
            var data = graphics.graphicsData[i];
            var points = data.points;
            if (data.type === PIXI.Graphics.POLY) {
                context.beginPath();
                context.moveTo(points[0], points[1]);
                for (var j = 1; j < points.length / 2; j++) {
                    context.lineTo(points[j * 2], points[j * 2 + 1]);
                }
                if (points[0] === points[points.length - 2] && points[1] === points[points.length - 1]) {
                    context.closePath();
                }
            } else if (data.type === PIXI.Graphics.RECT) {
                context.beginPath();
                context.rect(points[0], points[1], points[2], points[3]);
                context.closePath();
            } else if (data.type === PIXI.Graphics.CIRC) {
                context.beginPath();
                context.arc(points[0], points[1], points[2], 0, 2 * Math.PI);
                context.closePath();
            } else if (data.type === PIXI.Graphics.ELIP) {
                var ellipseData = data.points;
                var w = ellipseData[2] * 2;
                var h = ellipseData[3] * 2;
                var x = ellipseData[0] - w / 2;
                var y = ellipseData[1] - h / 2;
                context.beginPath();
                var kappa = .5522848, ox = w / 2 * kappa, oy = h / 2 * kappa, xe = x + w, ye = y + h, xm = x + w / 2, ym = y + h / 2;
                context.moveTo(x, ym);
                context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
                context.closePath();
            }
        }
    };
    PIXI.Graphics = function() {
        PIXI.DisplayObjectContainer.call(this);
        this.renderable = true;
        this.fillAlpha = 1;
        this.lineWidth = 0;
        this.lineColor = "black";
        this.graphicsData = [];
        this.tint = 16777215;
        this.blendMode = PIXI.blendModes.NORMAL;
        this.currentPath = {
            points: []
        };
        this._webGL = [];
        this.isMask = false;
        this.bounds = null;
        this.boundsPadding = 10;
    };
    PIXI.Graphics.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    PIXI.Graphics.prototype.constructor = PIXI.Graphics;
    Object.defineProperty(PIXI.Graphics.prototype, "cacheAsBitmap", {
        get: function() {
            return this._cacheAsBitmap;
        },
        set: function(value) {
            this._cacheAsBitmap = value;
            if (this._cacheAsBitmap) {
                this._generateCachedSprite();
            } else {
                this.destroyCachedSprite();
                this.dirty = true;
            }
        }
    });
    PIXI.Graphics.prototype.lineStyle = function(lineWidth, color, alpha) {
        if (!this.currentPath.points.length) this.graphicsData.pop();
        this.lineWidth = lineWidth || 0;
        this.lineColor = color || 0;
        this.lineAlpha = arguments.length < 3 ? 1 : alpha;
        this.currentPath = {
            lineWidth: this.lineWidth,
            lineColor: this.lineColor,
            lineAlpha: this.lineAlpha,
            fillColor: this.fillColor,
            fillAlpha: this.fillAlpha,
            fill: this.filling,
            points: [],
            type: PIXI.Graphics.POLY
        };
        this.graphicsData.push(this.currentPath);
        return this;
    };
    PIXI.Graphics.prototype.moveTo = function(x, y) {
        if (!this.currentPath.points.length) this.graphicsData.pop();
        this.currentPath = this.currentPath = {
            lineWidth: this.lineWidth,
            lineColor: this.lineColor,
            lineAlpha: this.lineAlpha,
            fillColor: this.fillColor,
            fillAlpha: this.fillAlpha,
            fill: this.filling,
            points: [],
            type: PIXI.Graphics.POLY
        };
        this.currentPath.points.push(x, y);
        this.graphicsData.push(this.currentPath);
        return this;
    };
    PIXI.Graphics.prototype.lineTo = function(x, y) {
        this.currentPath.points.push(x, y);
        this.dirty = true;
        return this;
    };
    PIXI.Graphics.prototype.beginFill = function(color, alpha) {
        this.filling = true;
        this.fillColor = color || 0;
        this.fillAlpha = arguments.length < 2 ? 1 : alpha;
        return this;
    };
    PIXI.Graphics.prototype.endFill = function() {
        this.filling = false;
        this.fillColor = null;
        this.fillAlpha = 1;
        return this;
    };
    PIXI.Graphics.prototype.drawRect = function(x, y, width, height) {
        if (!this.currentPath.points.length) this.graphicsData.pop();
        this.currentPath = {
            lineWidth: this.lineWidth,
            lineColor: this.lineColor,
            lineAlpha: this.lineAlpha,
            fillColor: this.fillColor,
            fillAlpha: this.fillAlpha,
            fill: this.filling,
            points: [ x, y, width, height ],
            type: PIXI.Graphics.RECT
        };
        this.graphicsData.push(this.currentPath);
        this.dirty = true;
        return this;
    };
    PIXI.Graphics.prototype.drawCircle = function(x, y, radius) {
        if (!this.currentPath.points.length) this.graphicsData.pop();
        this.currentPath = {
            lineWidth: this.lineWidth,
            lineColor: this.lineColor,
            lineAlpha: this.lineAlpha,
            fillColor: this.fillColor,
            fillAlpha: this.fillAlpha,
            fill: this.filling,
            points: [ x, y, radius, radius ],
            type: PIXI.Graphics.CIRC
        };
        this.graphicsData.push(this.currentPath);
        this.dirty = true;
        return this;
    };
    PIXI.Graphics.prototype.drawEllipse = function(x, y, width, height) {
        if (!this.currentPath.points.length) this.graphicsData.pop();
        this.currentPath = {
            lineWidth: this.lineWidth,
            lineColor: this.lineColor,
            lineAlpha: this.lineAlpha,
            fillColor: this.fillColor,
            fillAlpha: this.fillAlpha,
            fill: this.filling,
            points: [ x, y, width, height ],
            type: PIXI.Graphics.ELIP
        };
        this.graphicsData.push(this.currentPath);
        this.dirty = true;
        return this;
    };
    PIXI.Graphics.prototype.clear = function() {
        this.lineWidth = 0;
        this.filling = false;
        this.dirty = true;
        this.clearDirty = true;
        this.graphicsData = [];
        this.bounds = null;
        return this;
    };
    PIXI.Graphics.prototype.generateTexture = function() {
        var bounds = this.getBounds();
        var canvasBuffer = new PIXI.CanvasBuffer(bounds.width, bounds.height);
        var texture = PIXI.Texture.fromCanvas(canvasBuffer.canvas);
        canvasBuffer.context.translate(-bounds.x, -bounds.y);
        PIXI.CanvasGraphics.renderGraphics(this, canvasBuffer.context);
        return texture;
    };
    PIXI.Graphics.prototype._renderWebGL = function(renderSession) {
        if (this.visible === false || this.alpha === 0 || this.isMask === true) return;
        if (this._cacheAsBitmap) {
            if (this.dirty) {
                this._generateCachedSprite();
                PIXI.updateWebGLTexture(this._cachedSprite.texture.baseTexture, renderSession.gl);
                this.dirty = false;
            }
            this._cachedSprite.alpha = this.alpha;
            PIXI.Sprite.prototype._renderWebGL.call(this._cachedSprite, renderSession);
            return;
        } else {
            renderSession.spriteBatch.stop();
            if (this._mask) renderSession.maskManager.pushMask(this.mask, renderSession);
            if (this._filters) renderSession.filterManager.pushFilter(this._filterBlock);
            if (this.blendMode !== renderSession.spriteBatch.currentBlendMode) {
                renderSession.spriteBatch.currentBlendMode = this.blendMode;
                var blendModeWebGL = PIXI.blendModesWebGL[renderSession.spriteBatch.currentBlendMode];
                renderSession.spriteBatch.gl.blendFunc(blendModeWebGL[0], blendModeWebGL[1]);
            }
            PIXI.WebGLGraphics.renderGraphics(this, renderSession);
            if (this.children.length) {
                renderSession.spriteBatch.start();
                for (var i = 0, j = this.children.length; i < j; i++) {
                    this.children[i]._renderWebGL(renderSession);
                }
                renderSession.spriteBatch.stop();
            }
            if (this._filters) renderSession.filterManager.popFilter();
            if (this._mask) renderSession.maskManager.popMask(renderSession);
            renderSession.drawCount++;
            renderSession.spriteBatch.start();
        }
    };
    PIXI.Graphics.prototype._renderCanvas = function(renderSession) {
        if (this.visible === false || this.alpha === 0 || this.isMask === true) return;
        var context = renderSession.context;
        var transform = this.worldTransform;
        if (this.blendMode !== renderSession.currentBlendMode) {
            renderSession.currentBlendMode = this.blendMode;
            context.globalCompositeOperation = PIXI.blendModesCanvas[renderSession.currentBlendMode];
        }
        context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx, transform.ty);
        PIXI.CanvasGraphics.renderGraphics(this, context);
        for (var i = 0, j = this.children.length; i < j; i++) {
            this.children[i]._renderCanvas(renderSession);
        }
    };
    PIXI.Graphics.prototype.getBounds = function(matrix) {
        if (!this.bounds) this.updateBounds();
        var w0 = this.bounds.x;
        var w1 = this.bounds.width + this.bounds.x;
        var h0 = this.bounds.y;
        var h1 = this.bounds.height + this.bounds.y;
        var worldTransform = matrix || this.worldTransform;
        var a = worldTransform.a;
        var b = worldTransform.c;
        var c = worldTransform.b;
        var d = worldTransform.d;
        var tx = worldTransform.tx;
        var ty = worldTransform.ty;
        var x1 = a * w1 + c * h1 + tx;
        var y1 = d * h1 + b * w1 + ty;
        var x2 = a * w0 + c * h1 + tx;
        var y2 = d * h1 + b * w0 + ty;
        var x3 = a * w0 + c * h0 + tx;
        var y3 = d * h0 + b * w0 + ty;
        var x4 = a * w1 + c * h0 + tx;
        var y4 = d * h0 + b * w1 + ty;
        var maxX = -Infinity;
        var maxY = -Infinity;
        var minX = Infinity;
        var minY = Infinity;
        minX = x1 < minX ? x1 : minX;
        minX = x2 < minX ? x2 : minX;
        minX = x3 < minX ? x3 : minX;
        minX = x4 < minX ? x4 : minX;
        minY = y1 < minY ? y1 : minY;
        minY = y2 < minY ? y2 : minY;
        minY = y3 < minY ? y3 : minY;
        minY = y4 < minY ? y4 : minY;
        maxX = x1 > maxX ? x1 : maxX;
        maxX = x2 > maxX ? x2 : maxX;
        maxX = x3 > maxX ? x3 : maxX;
        maxX = x4 > maxX ? x4 : maxX;
        maxY = y1 > maxY ? y1 : maxY;
        maxY = y2 > maxY ? y2 : maxY;
        maxY = y3 > maxY ? y3 : maxY;
        maxY = y4 > maxY ? y4 : maxY;
        var bounds = this._bounds;
        bounds.x = minX;
        bounds.width = maxX - minX;
        bounds.y = minY;
        bounds.height = maxY - minY;
        return bounds;
    };
    PIXI.Graphics.prototype.updateBounds = function() {
        var minX = Infinity;
        var maxX = -Infinity;
        var minY = Infinity;
        var maxY = -Infinity;
        var points, x, y, w, h;
        for (var i = 0; i < this.graphicsData.length; i++) {
            var data = this.graphicsData[i];
            var type = data.type;
            var lineWidth = data.lineWidth;
            points = data.points;
            if (type === PIXI.Graphics.RECT) {
                x = points[0] - lineWidth / 2;
                y = points[1] - lineWidth / 2;
                w = points[2] + lineWidth;
                h = points[3] + lineWidth;
                minX = x < minX ? x : minX;
                maxX = x + w > maxX ? x + w : maxX;
                minY = y < minY ? x : minY;
                maxY = y + h > maxY ? y + h : maxY;
            } else if (type === PIXI.Graphics.CIRC || type === PIXI.Graphics.ELIP) {
                x = points[0];
                y = points[1];
                w = points[2] + lineWidth / 2;
                h = points[3] + lineWidth / 2;
                minX = x - w < minX ? x - w : minX;
                maxX = x + w > maxX ? x + w : maxX;
                minY = y - h < minY ? y - h : minY;
                maxY = y + h > maxY ? y + h : maxY;
            } else {
                for (var j = 0; j < points.length; j += 2) {
                    x = points[j];
                    y = points[j + 1];
                    minX = x - lineWidth < minX ? x - lineWidth : minX;
                    maxX = x + lineWidth > maxX ? x + lineWidth : maxX;
                    minY = y - lineWidth < minY ? y - lineWidth : minY;
                    maxY = y + lineWidth > maxY ? y + lineWidth : maxY;
                }
            }
        }
        var padding = this.boundsPadding;
        this.bounds = new PIXI.Rectangle(minX - padding, minY - padding, maxX - minX + padding * 2, maxY - minY + padding * 2);
    };
    PIXI.Graphics.prototype._generateCachedSprite = function() {
        var bounds = this.getLocalBounds();
        if (!this._cachedSprite) {
            var canvasBuffer = new PIXI.CanvasBuffer(bounds.width, bounds.height);
            var texture = PIXI.Texture.fromCanvas(canvasBuffer.canvas);
            this._cachedSprite = new PIXI.Sprite(texture);
            this._cachedSprite.buffer = canvasBuffer;
            this._cachedSprite.worldTransform = this.worldTransform;
        } else {
            this._cachedSprite.buffer.resize(bounds.width, bounds.height);
        }
        this._cachedSprite.anchor.x = -(bounds.x / bounds.width);
        this._cachedSprite.anchor.y = -(bounds.y / bounds.height);
        this._cachedSprite.buffer.context.translate(-bounds.x, -bounds.y);
        PIXI.CanvasGraphics.renderGraphics(this, this._cachedSprite.buffer.context);
        this._cachedSprite.alpha = this.alpha;
    };
    PIXI.Graphics.prototype.destroyCachedSprite = function() {
        this._cachedSprite.texture.destroy(true);
        this._cachedSprite = null;
    };
    PIXI.Graphics.POLY = 0;
    PIXI.Graphics.RECT = 1;
    PIXI.Graphics.CIRC = 2;
    PIXI.Graphics.ELIP = 3;
    PIXI.Strip = function(texture, width, height) {
        PIXI.DisplayObjectContainer.call(this);
        this.texture = texture;
        this.blendMode = PIXI.blendModes.NORMAL;
        try {
            this.uvs = new Float32Array([ 0, 1, 1, 1, 1, 0, 0, 1 ]);
            this.verticies = new Float32Array([ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
            this.colors = new Float32Array([ 1, 1, 1, 1 ]);
            this.indices = new Uint16Array([ 0, 1, 2, 3 ]);
        } catch (error) {
            this.uvs = [ 0, 1, 1, 1, 1, 0, 0, 1 ];
            this.verticies = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
            this.colors = [ 1, 1, 1, 1 ];
            this.indices = [ 0, 1, 2, 3 ];
        }
        this.width = width;
        this.height = height;
        if (texture.baseTexture.hasLoaded) {
            this.width = this.texture.frame.width;
            this.height = this.texture.frame.height;
            this.updateFrame = true;
        } else {
            this.onTextureUpdateBind = this.onTextureUpdate.bind(this);
            this.texture.addEventListener("update", this.onTextureUpdateBind);
        }
        this.renderable = true;
    };
    PIXI.Strip.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    PIXI.Strip.prototype.constructor = PIXI.Strip;
    PIXI.Strip.prototype.setTexture = function(texture) {
        this.texture = texture;
        this.width = texture.frame.width;
        this.height = texture.frame.height;
        this.updateFrame = true;
    };
    PIXI.Strip.prototype.onTextureUpdate = function() {
        this.updateFrame = true;
    };
    PIXI.Rope = function(texture, points) {
        PIXI.Strip.call(this, texture);
        this.points = points;
        try {
            this.verticies = new Float32Array(points.length * 4);
            this.uvs = new Float32Array(points.length * 4);
            this.colors = new Float32Array(points.length * 2);
            this.indices = new Uint16Array(points.length * 2);
        } catch (error) {
            this.verticies = new Array(points.length * 4);
            this.uvs = new Array(points.length * 4);
            this.colors = new Array(points.length * 2);
            this.indices = new Array(points.length * 2);
        }
        this.refresh();
    };
    PIXI.Rope.prototype = Object.create(PIXI.Strip.prototype);
    PIXI.Rope.prototype.constructor = PIXI.Rope;
    PIXI.Rope.prototype.refresh = function() {
        var points = this.points;
        if (points.length < 1) return;
        var uvs = this.uvs;
        var lastPoint = points[0];
        var indices = this.indices;
        var colors = this.colors;
        this.count -= .2;
        uvs[0] = 0;
        uvs[1] = 1;
        uvs[2] = 0;
        uvs[3] = 1;
        colors[0] = 1;
        colors[1] = 1;
        indices[0] = 0;
        indices[1] = 1;
        var total = points.length, point, index, amount;
        for (var i = 1; i < total; i++) {
            point = points[i];
            index = i * 4;
            amount = i / (total - 1);
            if (i % 2) {
                uvs[index] = amount;
                uvs[index + 1] = 0;
                uvs[index + 2] = amount;
                uvs[index + 3] = 1;
            } else {
                uvs[index] = amount;
                uvs[index + 1] = 0;
                uvs[index + 2] = amount;
                uvs[index + 3] = 1;
            }
            index = i * 2;
            colors[index] = 1;
            colors[index + 1] = 1;
            index = i * 2;
            indices[index] = index;
            indices[index + 1] = index + 1;
            lastPoint = point;
        }
    };
    PIXI.Rope.prototype.updateTransform = function() {
        var points = this.points;
        if (points.length < 1) return;
        var lastPoint = points[0];
        var nextPoint;
        var perp = {
            x: 0,
            y: 0
        };
        this.count -= .2;
        var verticies = this.verticies;
        verticies[0] = lastPoint.x + perp.x;
        verticies[1] = lastPoint.y + perp.y;
        verticies[2] = lastPoint.x - perp.x;
        verticies[3] = lastPoint.y - perp.y;
        var total = points.length, point, index, ratio, perpLength, num;
        for (var i = 1; i < total; i++) {
            point = points[i];
            index = i * 4;
            if (i < points.length - 1) {
                nextPoint = points[i + 1];
            } else {
                nextPoint = point;
            }
            perp.y = -(nextPoint.x - lastPoint.x);
            perp.x = nextPoint.y - lastPoint.y;
            ratio = (1 - i / (total - 1)) * 10;
            if (ratio > 1) ratio = 1;
            perpLength = Math.sqrt(perp.x * perp.x + perp.y * perp.y);
            num = this.texture.height / 2;
            perp.x /= perpLength;
            perp.y /= perpLength;
            perp.x *= num;
            perp.y *= num;
            verticies[index] = point.x + perp.x;
            verticies[index + 1] = point.y + perp.y;
            verticies[index + 2] = point.x - perp.x;
            verticies[index + 3] = point.y - perp.y;
            lastPoint = point;
        }
        PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
    };
    PIXI.Rope.prototype.setTexture = function(texture) {
        this.texture = texture;
        this.updateFrame = true;
    };
    PIXI.TilingSprite = function(texture, width, height) {
        PIXI.Sprite.call(this, texture);
        this.width = width || 100;
        this.height = height || 100;
        this.tileScale = new PIXI.Point(1, 1);
        this.tileScaleOffset = new PIXI.Point(1, 1);
        this.tilePosition = new PIXI.Point(0, 0);
        this.renderable = true;
        this.tint = 16777215;
        this.blendMode = PIXI.blendModes.NORMAL;
    };
    PIXI.TilingSprite.prototype = Object.create(PIXI.Sprite.prototype);
    PIXI.TilingSprite.prototype.constructor = PIXI.TilingSprite;
    Object.defineProperty(PIXI.TilingSprite.prototype, "width", {
        get: function() {
            return this._width;
        },
        set: function(value) {
            this._width = value;
        }
    });
    Object.defineProperty(PIXI.TilingSprite.prototype, "height", {
        get: function() {
            return this._height;
        },
        set: function(value) {
            this._height = value;
        }
    });
    PIXI.TilingSprite.prototype.onTextureUpdate = function() {
        this.updateFrame = true;
    };
    PIXI.TilingSprite.prototype.setTexture = function(texture) {
        if (this.texture === texture) return;
        this.texture = texture;
        this.refreshTexture = true;
        this.cachedTint = 16777215;
    };
    PIXI.TilingSprite.prototype._renderWebGL = function(renderSession) {
        if (this.visible === false || this.alpha === 0) return;
        var i, j;
        if (this.mask) {
            renderSession.spriteBatch.stop();
            renderSession.maskManager.pushMask(this.mask, renderSession);
            renderSession.spriteBatch.start();
        }
        if (this.filters) {
            renderSession.spriteBatch.flush();
            renderSession.filterManager.pushFilter(this._filterBlock);
        }
        if (!this.tilingTexture || this.refreshTexture) {
            this.generateTilingTexture(true);
            if (this.tilingTexture && this.tilingTexture.needsUpdate) {
                PIXI.updateWebGLTexture(this.tilingTexture.baseTexture, renderSession.gl);
                this.tilingTexture.needsUpdate = false;
            }
        } else renderSession.spriteBatch.renderTilingSprite(this);
        for (i = 0, j = this.children.length; i < j; i++) {
            this.children[i]._renderWebGL(renderSession);
        }
        renderSession.spriteBatch.stop();
        if (this.filters) renderSession.filterManager.popFilter();
        if (this.mask) renderSession.maskManager.popMask(renderSession);
        renderSession.spriteBatch.start();
    };
    PIXI.TilingSprite.prototype._renderCanvas = function(renderSession) {
        if (this.visible === false || this.alpha === 0) return;
        var context = renderSession.context;
        if (this._mask) {
            renderSession.maskManager.pushMask(this._mask, context);
        }
        context.globalAlpha = this.worldAlpha;
        var transform = this.worldTransform;
        context.setTransform(transform.a, transform.c, transform.b, transform.d, transform.tx, transform.ty);
        if (!this.__tilePattern || this.refreshTexture) {
            this.generateTilingTexture(false);
            if (this.tilingTexture) {
                this.__tilePattern = context.createPattern(this.tilingTexture.baseTexture.source, "repeat");
            } else {
                return;
            }
        }
        if (this.blendMode !== renderSession.currentBlendMode) {
            renderSession.currentBlendMode = this.blendMode;
            context.globalCompositeOperation = PIXI.blendModesCanvas[renderSession.currentBlendMode];
        }
        context.beginPath();
        var tilePosition = this.tilePosition;
        var tileScale = this.tileScale;
        tilePosition.x %= this.tilingTexture.baseTexture.width;
        tilePosition.y %= this.tilingTexture.baseTexture.height;
        context.scale(tileScale.x, tileScale.y);
        context.translate(tilePosition.x, tilePosition.y);
        context.fillStyle = this.__tilePattern;
        context.fillRect(-tilePosition.x + this.anchor.x * -this._width, -tilePosition.y + this.anchor.y * -this._height, this._width / tileScale.x, this._height / tileScale.y);
        context.scale(1 / tileScale.x, 1 / tileScale.y);
        context.translate(-tilePosition.x, -tilePosition.y);
        context.closePath();
        if (this._mask) {
            renderSession.maskManager.popMask(renderSession.context);
        }
    };
    PIXI.TilingSprite.prototype.getBounds = function() {
        var width = this._width;
        var height = this._height;
        var w0 = width * (1 - this.anchor.x);
        var w1 = width * -this.anchor.x;
        var h0 = height * (1 - this.anchor.y);
        var h1 = height * -this.anchor.y;
        var worldTransform = this.worldTransform;
        var a = worldTransform.a;
        var b = worldTransform.c;
        var c = worldTransform.b;
        var d = worldTransform.d;
        var tx = worldTransform.tx;
        var ty = worldTransform.ty;
        var x1 = a * w1 + c * h1 + tx;
        var y1 = d * h1 + b * w1 + ty;
        var x2 = a * w0 + c * h1 + tx;
        var y2 = d * h1 + b * w0 + ty;
        var x3 = a * w0 + c * h0 + tx;
        var y3 = d * h0 + b * w0 + ty;
        var x4 = a * w1 + c * h0 + tx;
        var y4 = d * h0 + b * w1 + ty;
        var maxX = -Infinity;
        var maxY = -Infinity;
        var minX = Infinity;
        var minY = Infinity;
        minX = x1 < minX ? x1 : minX;
        minX = x2 < minX ? x2 : minX;
        minX = x3 < minX ? x3 : minX;
        minX = x4 < minX ? x4 : minX;
        minY = y1 < minY ? y1 : minY;
        minY = y2 < minY ? y2 : minY;
        minY = y3 < minY ? y3 : minY;
        minY = y4 < minY ? y4 : minY;
        maxX = x1 > maxX ? x1 : maxX;
        maxX = x2 > maxX ? x2 : maxX;
        maxX = x3 > maxX ? x3 : maxX;
        maxX = x4 > maxX ? x4 : maxX;
        maxY = y1 > maxY ? y1 : maxY;
        maxY = y2 > maxY ? y2 : maxY;
        maxY = y3 > maxY ? y3 : maxY;
        maxY = y4 > maxY ? y4 : maxY;
        var bounds = this._bounds;
        bounds.x = minX;
        bounds.width = maxX - minX;
        bounds.y = minY;
        bounds.height = maxY - minY;
        this._currentBounds = bounds;
        return bounds;
    };
    PIXI.TilingSprite.prototype.generateTilingTexture = function(forcePowerOfTwo) {
        var texture = this.texture;
        if (!texture.baseTexture.hasLoaded) return;
        var baseTexture = texture.baseTexture;
        var frame = texture.frame;
        var targetWidth, targetHeight;
        var isFrame = frame.width !== baseTexture.width || frame.height !== baseTexture.height;
        var newTextureRequired = false;
        if (!forcePowerOfTwo) {
            if (isFrame) {
                targetWidth = frame.width;
                targetHeight = frame.height;
                newTextureRequired = true;
            }
        } else {
            targetWidth = PIXI.getNextPowerOfTwo(frame.width);
            targetHeight = PIXI.getNextPowerOfTwo(frame.height);
            if (frame.width !== targetWidth && frame.height !== targetHeight) newTextureRequired = true;
        }
        if (newTextureRequired) {
            var canvasBuffer;
            if (this.tilingTexture && this.tilingTexture.isTiling) {
                canvasBuffer = this.tilingTexture.canvasBuffer;
                canvasBuffer.resize(targetWidth, targetHeight);
                this.tilingTexture.baseTexture.width = targetWidth;
                this.tilingTexture.baseTexture.height = targetHeight;
                this.tilingTexture.needsUpdate = true;
            } else {
                canvasBuffer = new PIXI.CanvasBuffer(targetWidth, targetHeight);
                this.tilingTexture = PIXI.Texture.fromCanvas(canvasBuffer.canvas);
                this.tilingTexture.canvasBuffer = canvasBuffer;
                this.tilingTexture.isTiling = true;
            }
            canvasBuffer.context.drawImage(texture.baseTexture.source, frame.x, frame.y, frame.width, frame.height, 0, 0, targetWidth, targetHeight);
            this.tileScaleOffset.x = frame.width / targetWidth;
            this.tileScaleOffset.y = frame.height / targetHeight;
        } else {
            if (this.tilingTexture && this.tilingTexture.isTiling) {
                this.tilingTexture.destroy(true);
            }
            this.tileScaleOffset.x = 1;
            this.tileScaleOffset.y = 1;
            this.tilingTexture = texture;
        }
        this.refreshTexture = false;
        this.tilingTexture.baseTexture._powerOf2 = true;
    };
    var spine = {};
    spine.BoneData = function(name, parent) {
        this.name = name;
        this.parent = parent;
    };
    spine.BoneData.prototype = {
        length: 0,
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1
    };
    spine.SlotData = function(name, boneData) {
        this.name = name;
        this.boneData = boneData;
    };
    spine.SlotData.prototype = {
        r: 1,
        g: 1,
        b: 1,
        a: 1,
        attachmentName: null
    };
    spine.Bone = function(boneData, parent) {
        this.data = boneData;
        this.parent = parent;
        this.setToSetupPose();
    };
    spine.Bone.yDown = false;
    spine.Bone.prototype = {
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        m00: 0,
        m01: 0,
        worldX: 0,
        m10: 0,
        m11: 0,
        worldY: 0,
        worldRotation: 0,
        worldScaleX: 1,
        worldScaleY: 1,
        updateWorldTransform: function(flipX, flipY) {
            var parent = this.parent;
            if (parent != null) {
                this.worldX = this.x * parent.m00 + this.y * parent.m01 + parent.worldX;
                this.worldY = this.x * parent.m10 + this.y * parent.m11 + parent.worldY;
                this.worldScaleX = parent.worldScaleX * this.scaleX;
                this.worldScaleY = parent.worldScaleY * this.scaleY;
                this.worldRotation = parent.worldRotation + this.rotation;
            } else {
                this.worldX = this.x;
                this.worldY = this.y;
                this.worldScaleX = this.scaleX;
                this.worldScaleY = this.scaleY;
                this.worldRotation = this.rotation;
            }
            var radians = this.worldRotation * Math.PI / 180;
            var cos = Math.cos(radians);
            var sin = Math.sin(radians);
            this.m00 = cos * this.worldScaleX;
            this.m10 = sin * this.worldScaleX;
            this.m01 = -sin * this.worldScaleY;
            this.m11 = cos * this.worldScaleY;
            if (flipX) {
                this.m00 = -this.m00;
                this.m01 = -this.m01;
            }
            if (flipY) {
                this.m10 = -this.m10;
                this.m11 = -this.m11;
            }
            if (spine.Bone.yDown) {
                this.m10 = -this.m10;
                this.m11 = -this.m11;
            }
        },
        setToSetupPose: function() {
            var data = this.data;
            this.x = data.x;
            this.y = data.y;
            this.rotation = data.rotation;
            this.scaleX = data.scaleX;
            this.scaleY = data.scaleY;
        }
    };
    spine.Slot = function(slotData, skeleton, bone) {
        this.data = slotData;
        this.skeleton = skeleton;
        this.bone = bone;
        this.setToSetupPose();
    };
    spine.Slot.prototype = {
        r: 1,
        g: 1,
        b: 1,
        a: 1,
        _attachmentTime: 0,
        attachment: null,
        setAttachment: function(attachment) {
            this.attachment = attachment;
            this._attachmentTime = this.skeleton.time;
        },
        setAttachmentTime: function(time) {
            this._attachmentTime = this.skeleton.time - time;
        },
        getAttachmentTime: function() {
            return this.skeleton.time - this._attachmentTime;
        },
        setToSetupPose: function() {
            var data = this.data;
            this.r = data.r;
            this.g = data.g;
            this.b = data.b;
            this.a = data.a;
            var slotDatas = this.skeleton.data.slots;
            for (var i = 0, n = slotDatas.length; i < n; i++) {
                if (slotDatas[i] == data) {
                    this.setAttachment(!data.attachmentName ? null : this.skeleton.getAttachmentBySlotIndex(i, data.attachmentName));
                    break;
                }
            }
        }
    };
    spine.Skin = function(name) {
        this.name = name;
        this.attachments = {};
    };
    spine.Skin.prototype = {
        addAttachment: function(slotIndex, name, attachment) {
            this.attachments[slotIndex + ":" + name] = attachment;
        },
        getAttachment: function(slotIndex, name) {
            return this.attachments[slotIndex + ":" + name];
        },
        _attachAll: function(skeleton, oldSkin) {
            for (var key in oldSkin.attachments) {
                var colon = key.indexOf(":");
                var slotIndex = parseInt(key.substring(0, colon), 10);
                var name = key.substring(colon + 1);
                var slot = skeleton.slots[slotIndex];
                if (slot.attachment && slot.attachment.name == name) {
                    var attachment = this.getAttachment(slotIndex, name);
                    if (attachment) slot.setAttachment(attachment);
                }
            }
        }
    };
    spine.Animation = function(name, timelines, duration) {
        this.name = name;
        this.timelines = timelines;
        this.duration = duration;
    };
    spine.Animation.prototype = {
        apply: function(skeleton, time, loop) {
            if (loop && this.duration) time %= this.duration;
            var timelines = this.timelines;
            for (var i = 0, n = timelines.length; i < n; i++) timelines[i].apply(skeleton, time, 1);
        },
        mix: function(skeleton, time, loop, alpha) {
            if (loop && this.duration) time %= this.duration;
            var timelines = this.timelines;
            for (var i = 0, n = timelines.length; i < n; i++) timelines[i].apply(skeleton, time, alpha);
        }
    };
    spine.binarySearch = function(values, target, step) {
        var low = 0;
        var high = Math.floor(values.length / step) - 2;
        if (!high) return step;
        var current = high >>> 1;
        while (true) {
            if (values[(current + 1) * step] <= target) low = current + 1; else high = current;
            if (low == high) return (low + 1) * step;
            current = low + high >>> 1;
        }
    };
    spine.linearSearch = function(values, target, step) {
        for (var i = 0, last = values.length - step; i <= last; i += step) if (values[i] > target) return i;
        return -1;
    };
    spine.Curves = function(frameCount) {
        this.curves = [];
        this.curves.length = (frameCount - 1) * 6;
    };
    spine.Curves.prototype = {
        setLinear: function(frameIndex) {
            this.curves[frameIndex * 6] = 0;
        },
        setStepped: function(frameIndex) {
            this.curves[frameIndex * 6] = -1;
        },
        setCurve: function(frameIndex, cx1, cy1, cx2, cy2) {
            var subdiv_step = 1 / 10;
            var subdiv_step2 = subdiv_step * subdiv_step;
            var subdiv_step3 = subdiv_step2 * subdiv_step;
            var pre1 = 3 * subdiv_step;
            var pre2 = 3 * subdiv_step2;
            var pre4 = 6 * subdiv_step2;
            var pre5 = 6 * subdiv_step3;
            var tmp1x = -cx1 * 2 + cx2;
            var tmp1y = -cy1 * 2 + cy2;
            var tmp2x = (cx1 - cx2) * 3 + 1;
            var tmp2y = (cy1 - cy2) * 3 + 1;
            var i = frameIndex * 6;
            var curves = this.curves;
            curves[i] = cx1 * pre1 + tmp1x * pre2 + tmp2x * subdiv_step3;
            curves[i + 1] = cy1 * pre1 + tmp1y * pre2 + tmp2y * subdiv_step3;
            curves[i + 2] = tmp1x * pre4 + tmp2x * pre5;
            curves[i + 3] = tmp1y * pre4 + tmp2y * pre5;
            curves[i + 4] = tmp2x * pre5;
            curves[i + 5] = tmp2y * pre5;
        },
        getCurvePercent: function(frameIndex, percent) {
            percent = percent < 0 ? 0 : percent > 1 ? 1 : percent;
            var curveIndex = frameIndex * 6;
            var curves = this.curves;
            var dfx = curves[curveIndex];
            if (!dfx) return percent;
            if (dfx == -1) return 0;
            var dfy = curves[curveIndex + 1];
            var ddfx = curves[curveIndex + 2];
            var ddfy = curves[curveIndex + 3];
            var dddfx = curves[curveIndex + 4];
            var dddfy = curves[curveIndex + 5];
            var x = dfx, y = dfy;
            var i = 10 - 2;
            while (true) {
                if (x >= percent) {
                    var lastX = x - dfx;
                    var lastY = y - dfy;
                    return lastY + (y - lastY) * (percent - lastX) / (x - lastX);
                }
                if (!i) break;
                i--;
                dfx += ddfx;
                dfy += ddfy;
                ddfx += dddfx;
                ddfy += dddfy;
                x += dfx;
                y += dfy;
            }
            return y + (1 - y) * (percent - x) / (1 - x);
        }
    };
    spine.RotateTimeline = function(frameCount) {
        this.curves = new spine.Curves(frameCount);
        this.frames = [];
        this.frames.length = frameCount * 2;
    };
    spine.RotateTimeline.prototype = {
        boneIndex: 0,
        getFrameCount: function() {
            return this.frames.length / 2;
        },
        setFrame: function(frameIndex, time, angle) {
            frameIndex *= 2;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + 1] = angle;
        },
        apply: function(skeleton, time, alpha) {
            var frames = this.frames, amount;
            if (time < frames[0]) return;
            var bone = skeleton.bones[this.boneIndex];
            if (time >= frames[frames.length - 2]) {
                amount = bone.data.rotation + frames[frames.length - 1] - bone.rotation;
                while (amount > 180) amount -= 360;
                while (amount < -180) amount += 360;
                bone.rotation += amount * alpha;
                return;
            }
            var frameIndex = spine.binarySearch(frames, time, 2);
            var lastFrameValue = frames[frameIndex - 1];
            var frameTime = frames[frameIndex];
            var percent = 1 - (time - frameTime) / (frames[frameIndex - 2] - frameTime);
            percent = this.curves.getCurvePercent(frameIndex / 2 - 1, percent);
            amount = frames[frameIndex + 1] - lastFrameValue;
            while (amount > 180) amount -= 360;
            while (amount < -180) amount += 360;
            amount = bone.data.rotation + (lastFrameValue + amount * percent) - bone.rotation;
            while (amount > 180) amount -= 360;
            while (amount < -180) amount += 360;
            bone.rotation += amount * alpha;
        }
    };
    spine.TranslateTimeline = function(frameCount) {
        this.curves = new spine.Curves(frameCount);
        this.frames = [];
        this.frames.length = frameCount * 3;
    };
    spine.TranslateTimeline.prototype = {
        boneIndex: 0,
        getFrameCount: function() {
            return this.frames.length / 3;
        },
        setFrame: function(frameIndex, time, x, y) {
            frameIndex *= 3;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + 1] = x;
            this.frames[frameIndex + 2] = y;
        },
        apply: function(skeleton, time, alpha) {
            var frames = this.frames;
            if (time < frames[0]) return;
            var bone = skeleton.bones[this.boneIndex];
            if (time >= frames[frames.length - 3]) {
                bone.x += (bone.data.x + frames[frames.length - 2] - bone.x) * alpha;
                bone.y += (bone.data.y + frames[frames.length - 1] - bone.y) * alpha;
                return;
            }
            var frameIndex = spine.binarySearch(frames, time, 3);
            var lastFrameX = frames[frameIndex - 2];
            var lastFrameY = frames[frameIndex - 1];
            var frameTime = frames[frameIndex];
            var percent = 1 - (time - frameTime) / (frames[frameIndex + -3] - frameTime);
            percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);
            bone.x += (bone.data.x + lastFrameX + (frames[frameIndex + 1] - lastFrameX) * percent - bone.x) * alpha;
            bone.y += (bone.data.y + lastFrameY + (frames[frameIndex + 2] - lastFrameY) * percent - bone.y) * alpha;
        }
    };
    spine.ScaleTimeline = function(frameCount) {
        this.curves = new spine.Curves(frameCount);
        this.frames = [];
        this.frames.length = frameCount * 3;
    };
    spine.ScaleTimeline.prototype = {
        boneIndex: 0,
        getFrameCount: function() {
            return this.frames.length / 3;
        },
        setFrame: function(frameIndex, time, x, y) {
            frameIndex *= 3;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + 1] = x;
            this.frames[frameIndex + 2] = y;
        },
        apply: function(skeleton, time, alpha) {
            var frames = this.frames;
            if (time < frames[0]) return;
            var bone = skeleton.bones[this.boneIndex];
            if (time >= frames[frames.length - 3]) {
                bone.scaleX += (bone.data.scaleX - 1 + frames[frames.length - 2] - bone.scaleX) * alpha;
                bone.scaleY += (bone.data.scaleY - 1 + frames[frames.length - 1] - bone.scaleY) * alpha;
                return;
            }
            var frameIndex = spine.binarySearch(frames, time, 3);
            var lastFrameX = frames[frameIndex - 2];
            var lastFrameY = frames[frameIndex - 1];
            var frameTime = frames[frameIndex];
            var percent = 1 - (time - frameTime) / (frames[frameIndex + -3] - frameTime);
            percent = this.curves.getCurvePercent(frameIndex / 3 - 1, percent);
            bone.scaleX += (bone.data.scaleX - 1 + lastFrameX + (frames[frameIndex + 1] - lastFrameX) * percent - bone.scaleX) * alpha;
            bone.scaleY += (bone.data.scaleY - 1 + lastFrameY + (frames[frameIndex + 2] - lastFrameY) * percent - bone.scaleY) * alpha;
        }
    };
    spine.ColorTimeline = function(frameCount) {
        this.curves = new spine.Curves(frameCount);
        this.frames = [];
        this.frames.length = frameCount * 5;
    };
    spine.ColorTimeline.prototype = {
        slotIndex: 0,
        getFrameCount: function() {
            return this.frames.length / 2;
        },
        setFrame: function(frameIndex, time, x, y) {
            frameIndex *= 5;
            this.frames[frameIndex] = time;
            this.frames[frameIndex + 1] = r;
            this.frames[frameIndex + 2] = g;
            this.frames[frameIndex + 3] = b;
            this.frames[frameIndex + 4] = a;
        },
        apply: function(skeleton, time, alpha) {
            var frames = this.frames;
            if (time < frames[0]) return;
            var slot = skeleton.slots[this.slotIndex];
            if (time >= frames[frames.length - 5]) {
                var i = frames.length - 1;
                slot.r = frames[i - 3];
                slot.g = frames[i - 2];
                slot.b = frames[i - 1];
                slot.a = frames[i];
                return;
            }
            var frameIndex = spine.binarySearch(frames, time, 5);
            var lastFrameR = frames[frameIndex - 4];
            var lastFrameG = frames[frameIndex - 3];
            var lastFrameB = frames[frameIndex - 2];
            var lastFrameA = frames[frameIndex - 1];
            var frameTime = frames[frameIndex];
            var percent = 1 - (time - frameTime) / (frames[frameIndex - 5] - frameTime);
            percent = this.curves.getCurvePercent(frameIndex / 5 - 1, percent);
            var r = lastFrameR + (frames[frameIndex + 1] - lastFrameR) * percent;
            var g = lastFrameG + (frames[frameIndex + 2] - lastFrameG) * percent;
            var b = lastFrameB + (frames[frameIndex + 3] - lastFrameB) * percent;
            var a = lastFrameA + (frames[frameIndex + 4] - lastFrameA) * percent;
            if (alpha < 1) {
                slot.r += (r - slot.r) * alpha;
                slot.g += (g - slot.g) * alpha;
                slot.b += (b - slot.b) * alpha;
                slot.a += (a - slot.a) * alpha;
            } else {
                slot.r = r;
                slot.g = g;
                slot.b = b;
                slot.a = a;
            }
        }
    };
    spine.AttachmentTimeline = function(frameCount) {
        this.curves = new spine.Curves(frameCount);
        this.frames = [];
        this.frames.length = frameCount;
        this.attachmentNames = [];
        this.attachmentNames.length = frameCount;
    };
    spine.AttachmentTimeline.prototype = {
        slotIndex: 0,
        getFrameCount: function() {
            return this.frames.length;
        },
        setFrame: function(frameIndex, time, attachmentName) {
            this.frames[frameIndex] = time;
            this.attachmentNames[frameIndex] = attachmentName;
        },
        apply: function(skeleton, time, alpha) {
            var frames = this.frames;
            if (time < frames[0]) return;
            var frameIndex;
            if (time >= frames[frames.length - 1]) frameIndex = frames.length - 1; else frameIndex = spine.binarySearch(frames, time, 1) - 1;
            var attachmentName = this.attachmentNames[frameIndex];
            skeleton.slots[this.slotIndex].setAttachment(!attachmentName ? null : skeleton.getAttachmentBySlotIndex(this.slotIndex, attachmentName));
        }
    };
    spine.SkeletonData = function() {
        this.bones = [];
        this.slots = [];
        this.skins = [];
        this.animations = [];
    };
    spine.SkeletonData.prototype = {
        defaultSkin: null,
        findBone: function(boneName) {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) if (bones[i].name == boneName) return bones[i];
            return null;
        },
        findBoneIndex: function(boneName) {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) if (bones[i].name == boneName) return i;
            return -1;
        },
        findSlot: function(slotName) {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) {
                if (slots[i].name == slotName) return slot[i];
            }
            return null;
        },
        findSlotIndex: function(slotName) {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) if (slots[i].name == slotName) return i;
            return -1;
        },
        findSkin: function(skinName) {
            var skins = this.skins;
            for (var i = 0, n = skins.length; i < n; i++) if (skins[i].name == skinName) return skins[i];
            return null;
        },
        findAnimation: function(animationName) {
            var animations = this.animations;
            for (var i = 0, n = animations.length; i < n; i++) if (animations[i].name == animationName) return animations[i];
            return null;
        }
    };
    spine.Skeleton = function(skeletonData) {
        this.data = skeletonData;
        this.bones = [];
        for (var i = 0, n = skeletonData.bones.length; i < n; i++) {
            var boneData = skeletonData.bones[i];
            var parent = !boneData.parent ? null : this.bones[skeletonData.bones.indexOf(boneData.parent)];
            this.bones.push(new spine.Bone(boneData, parent));
        }
        this.slots = [];
        this.drawOrder = [];
        for (i = 0, n = skeletonData.slots.length; i < n; i++) {
            var slotData = skeletonData.slots[i];
            var bone = this.bones[skeletonData.bones.indexOf(slotData.boneData)];
            var slot = new spine.Slot(slotData, this, bone);
            this.slots.push(slot);
            this.drawOrder.push(slot);
        }
    };
    spine.Skeleton.prototype = {
        x: 0,
        y: 0,
        skin: null,
        r: 1,
        g: 1,
        b: 1,
        a: 1,
        time: 0,
        flipX: false,
        flipY: false,
        updateWorldTransform: function() {
            var flipX = this.flipX;
            var flipY = this.flipY;
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) bones[i].updateWorldTransform(flipX, flipY);
        },
        setToSetupPose: function() {
            this.setBonesToSetupPose();
            this.setSlotsToSetupPose();
        },
        setBonesToSetupPose: function() {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) bones[i].setToSetupPose();
        },
        setSlotsToSetupPose: function() {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) slots[i].setToSetupPose(i);
        },
        getRootBone: function() {
            return this.bones.length ? this.bones[0] : null;
        },
        findBone: function(boneName) {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) if (bones[i].data.name == boneName) return bones[i];
            return null;
        },
        findBoneIndex: function(boneName) {
            var bones = this.bones;
            for (var i = 0, n = bones.length; i < n; i++) if (bones[i].data.name == boneName) return i;
            return -1;
        },
        findSlot: function(slotName) {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) if (slots[i].data.name == slotName) return slots[i];
            return null;
        },
        findSlotIndex: function(slotName) {
            var slots = this.slots;
            for (var i = 0, n = slots.length; i < n; i++) if (slots[i].data.name == slotName) return i;
            return -1;
        },
        setSkinByName: function(skinName) {
            var skin = this.data.findSkin(skinName);
            if (!skin) throw "Skin not found: " + skinName;
            this.setSkin(skin);
        },
        setSkin: function(newSkin) {
            if (this.skin && newSkin) newSkin._attachAll(this, this.skin);
            this.skin = newSkin;
        },
        getAttachmentBySlotName: function(slotName, attachmentName) {
            return this.getAttachmentBySlotIndex(this.data.findSlotIndex(slotName), attachmentName);
        },
        getAttachmentBySlotIndex: function(slotIndex, attachmentName) {
            if (this.skin) {
                var attachment = this.skin.getAttachment(slotIndex, attachmentName);
                if (attachment) return attachment;
            }
            if (this.data.defaultSkin) return this.data.defaultSkin.getAttachment(slotIndex, attachmentName);
            return null;
        },
        setAttachment: function(slotName, attachmentName) {
            var slots = this.slots;
            for (var i = 0, n = slots.size; i < n; i++) {
                var slot = slots[i];
                if (slot.data.name == slotName) {
                    var attachment = null;
                    if (attachmentName) {
                        attachment = this.getAttachment(i, attachmentName);
                        if (attachment == null) throw "Attachment not found: " + attachmentName + ", for slot: " + slotName;
                    }
                    slot.setAttachment(attachment);
                    return;
                }
            }
            throw "Slot not found: " + slotName;
        },
        update: function(delta) {
            time += delta;
        }
    };
    spine.AttachmentType = {
        region: 0
    };
    spine.RegionAttachment = function() {
        this.offset = [];
        this.offset.length = 8;
        this.uvs = [];
        this.uvs.length = 8;
    };
    spine.RegionAttachment.prototype = {
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        width: 0,
        height: 0,
        rendererObject: null,
        regionOffsetX: 0,
        regionOffsetY: 0,
        regionWidth: 0,
        regionHeight: 0,
        regionOriginalWidth: 0,
        regionOriginalHeight: 0,
        setUVs: function(u, v, u2, v2, rotate) {
            var uvs = this.uvs;
            if (rotate) {
                uvs[2] = u;
                uvs[3] = v2;
                uvs[4] = u;
                uvs[5] = v;
                uvs[6] = u2;
                uvs[7] = v;
                uvs[0] = u2;
                uvs[1] = v2;
            } else {
                uvs[0] = u;
                uvs[1] = v2;
                uvs[2] = u;
                uvs[3] = v;
                uvs[4] = u2;
                uvs[5] = v;
                uvs[6] = u2;
                uvs[7] = v2;
            }
        },
        updateOffset: function() {
            var regionScaleX = this.width / this.regionOriginalWidth * this.scaleX;
            var regionScaleY = this.height / this.regionOriginalHeight * this.scaleY;
            var localX = -this.width / 2 * this.scaleX + this.regionOffsetX * regionScaleX;
            var localY = -this.height / 2 * this.scaleY + this.regionOffsetY * regionScaleY;
            var localX2 = localX + this.regionWidth * regionScaleX;
            var localY2 = localY + this.regionHeight * regionScaleY;
            var radians = this.rotation * Math.PI / 180;
            var cos = Math.cos(radians);
            var sin = Math.sin(radians);
            var localXCos = localX * cos + this.x;
            var localXSin = localX * sin;
            var localYCos = localY * cos + this.y;
            var localYSin = localY * sin;
            var localX2Cos = localX2 * cos + this.x;
            var localX2Sin = localX2 * sin;
            var localY2Cos = localY2 * cos + this.y;
            var localY2Sin = localY2 * sin;
            var offset = this.offset;
            offset[0] = localXCos - localYSin;
            offset[1] = localYCos + localXSin;
            offset[2] = localXCos - localY2Sin;
            offset[3] = localY2Cos + localXSin;
            offset[4] = localX2Cos - localY2Sin;
            offset[5] = localY2Cos + localX2Sin;
            offset[6] = localX2Cos - localYSin;
            offset[7] = localYCos + localX2Sin;
        },
        computeVertices: function(x, y, bone, vertices) {
            x += bone.worldX;
            y += bone.worldY;
            var m00 = bone.m00;
            var m01 = bone.m01;
            var m10 = bone.m10;
            var m11 = bone.m11;
            var offset = this.offset;
            vertices[0] = offset[0] * m00 + offset[1] * m01 + x;
            vertices[1] = offset[0] * m10 + offset[1] * m11 + y;
            vertices[2] = offset[2] * m00 + offset[3] * m01 + x;
            vertices[3] = offset[2] * m10 + offset[3] * m11 + y;
            vertices[4] = offset[4] * m00 + offset[5] * m01 + x;
            vertices[5] = offset[4] * m10 + offset[5] * m11 + y;
            vertices[6] = offset[6] * m00 + offset[7] * m01 + x;
            vertices[7] = offset[6] * m10 + offset[7] * m11 + y;
        }
    };
    spine.AnimationStateData = function(skeletonData) {
        this.skeletonData = skeletonData;
        this.animationToMixTime = {};
    };
    spine.AnimationStateData.prototype = {
        defaultMix: 0,
        setMixByName: function(fromName, toName, duration) {
            var from = this.skeletonData.findAnimation(fromName);
            if (!from) throw "Animation not found: " + fromName;
            var to = this.skeletonData.findAnimation(toName);
            if (!to) throw "Animation not found: " + toName;
            this.setMix(from, to, duration);
        },
        setMix: function(from, to, duration) {
            this.animationToMixTime[from.name + ":" + to.name] = duration;
        },
        getMix: function(from, to) {
            var time = this.animationToMixTime[from.name + ":" + to.name];
            return time ? time : this.defaultMix;
        }
    };
    spine.AnimationState = function(stateData) {
        this.data = stateData;
        this.queue = [];
    };
    spine.AnimationState.prototype = {
        current: null,
        previous: null,
        currentTime: 0,
        previousTime: 0,
        currentLoop: false,
        previousLoop: false,
        mixTime: 0,
        mixDuration: 0,
        update: function(delta) {
            this.currentTime += delta;
            this.previousTime += delta;
            this.mixTime += delta;
            if (this.queue.length > 0) {
                var entry = this.queue[0];
                if (this.currentTime >= entry.delay) {
                    this._setAnimation(entry.animation, entry.loop);
                    this.queue.shift();
                }
            }
        },
        apply: function(skeleton) {
            if (!this.current) return;
            if (this.previous) {
                this.previous.apply(skeleton, this.previousTime, this.previousLoop);
                var alpha = this.mixTime / this.mixDuration;
                if (alpha >= 1) {
                    alpha = 1;
                    this.previous = null;
                }
                this.current.mix(skeleton, this.currentTime, this.currentLoop, alpha);
            } else this.current.apply(skeleton, this.currentTime, this.currentLoop);
        },
        clearAnimation: function() {
            this.previous = null;
            this.current = null;
            this.queue.length = 0;
        },
        _setAnimation: function(animation, loop) {
            this.previous = null;
            if (animation && this.current) {
                this.mixDuration = this.data.getMix(this.current, animation);
                if (this.mixDuration > 0) {
                    this.mixTime = 0;
                    this.previous = this.current;
                    this.previousTime = this.currentTime;
                    this.previousLoop = this.currentLoop;
                }
            }
            this.current = animation;
            this.currentLoop = loop;
            this.currentTime = 0;
        },
        setAnimationByName: function(animationName, loop) {
            var animation = this.data.skeletonData.findAnimation(animationName);
            if (!animation) throw "Animation not found: " + animationName;
            this.setAnimation(animation, loop);
        },
        setAnimation: function(animation, loop) {
            this.queue.length = 0;
            this._setAnimation(animation, loop);
        },
        addAnimationByName: function(animationName, loop, delay) {
            var animation = this.data.skeletonData.findAnimation(animationName);
            if (!animation) throw "Animation not found: " + animationName;
            this.addAnimation(animation, loop, delay);
        },
        addAnimation: function(animation, loop, delay) {
            var entry = {};
            entry.animation = animation;
            entry.loop = loop;
            if (!delay || delay <= 0) {
                var previousAnimation = this.queue.length ? this.queue[this.queue.length - 1].animation : this.current;
                if (previousAnimation != null) delay = previousAnimation.duration - this.data.getMix(previousAnimation, animation) + (delay || 0); else delay = 0;
            }
            entry.delay = delay;
            this.queue.push(entry);
        },
        isComplete: function() {
            return !this.current || this.currentTime >= this.current.duration;
        }
    };
    spine.SkeletonJson = function(attachmentLoader) {
        this.attachmentLoader = attachmentLoader;
    };
    spine.SkeletonJson.prototype = {
        scale: 1,
        readSkeletonData: function(root) {
            var skeletonData = new spine.SkeletonData(), boneData;
            var bones = root["bones"];
            for (var i = 0, n = bones.length; i < n; i++) {
                var boneMap = bones[i];
                var parent = null;
                if (boneMap["parent"]) {
                    parent = skeletonData.findBone(boneMap["parent"]);
                    if (!parent) throw "Parent bone not found: " + boneMap["parent"];
                }
                boneData = new spine.BoneData(boneMap["name"], parent);
                boneData.length = (boneMap["length"] || 0) * this.scale;
                boneData.x = (boneMap["x"] || 0) * this.scale;
                boneData.y = (boneMap["y"] || 0) * this.scale;
                boneData.rotation = boneMap["rotation"] || 0;
                boneData.scaleX = boneMap["scaleX"] || 1;
                boneData.scaleY = boneMap["scaleY"] || 1;
                skeletonData.bones.push(boneData);
            }
            var slots = root["slots"];
            for (i = 0, n = slots.length; i < n; i++) {
                var slotMap = slots[i];
                boneData = skeletonData.findBone(slotMap["bone"]);
                if (!boneData) throw "Slot bone not found: " + slotMap["bone"];
                var slotData = new spine.SlotData(slotMap["name"], boneData);
                var color = slotMap["color"];
                if (color) {
                    slotData.r = spine.SkeletonJson.toColor(color, 0);
                    slotData.g = spine.SkeletonJson.toColor(color, 1);
                    slotData.b = spine.SkeletonJson.toColor(color, 2);
                    slotData.a = spine.SkeletonJson.toColor(color, 3);
                }
                slotData.attachmentName = slotMap["attachment"];
                skeletonData.slots.push(slotData);
            }
            var skins = root["skins"];
            for (var skinName in skins) {
                if (!skins.hasOwnProperty(skinName)) continue;
                var skinMap = skins[skinName];
                var skin = new spine.Skin(skinName);
                for (var slotName in skinMap) {
                    if (!skinMap.hasOwnProperty(slotName)) continue;
                    var slotIndex = skeletonData.findSlotIndex(slotName);
                    var slotEntry = skinMap[slotName];
                    for (var attachmentName in slotEntry) {
                        if (!slotEntry.hasOwnProperty(attachmentName)) continue;
                        var attachment = this.readAttachment(skin, attachmentName, slotEntry[attachmentName]);
                        if (attachment != null) skin.addAttachment(slotIndex, attachmentName, attachment);
                    }
                }
                skeletonData.skins.push(skin);
                if (skin.name == "default") skeletonData.defaultSkin = skin;
            }
            var animations = root["animations"];
            for (var animationName in animations) {
                if (!animations.hasOwnProperty(animationName)) continue;
                this.readAnimation(animationName, animations[animationName], skeletonData);
            }
            return skeletonData;
        },
        readAttachment: function(skin, name, map) {
            name = map["name"] || name;
            var type = spine.AttachmentType[map["type"] || "region"];
            if (type == spine.AttachmentType.region) {
                var attachment = new spine.RegionAttachment();
                attachment.x = (map["x"] || 0) * this.scale;
                attachment.y = (map["y"] || 0) * this.scale;
                attachment.scaleX = map["scaleX"] || 1;
                attachment.scaleY = map["scaleY"] || 1;
                attachment.rotation = map["rotation"] || 0;
                attachment.width = (map["width"] || 32) * this.scale;
                attachment.height = (map["height"] || 32) * this.scale;
                attachment.updateOffset();
                attachment.rendererObject = {};
                attachment.rendererObject.name = name;
                attachment.rendererObject.scale = {};
                attachment.rendererObject.scale.x = attachment.scaleX;
                attachment.rendererObject.scale.y = attachment.scaleY;
                attachment.rendererObject.rotation = -attachment.rotation * Math.PI / 180;
                return attachment;
            }
            throw "Unknown attachment type: " + type;
        },
        readAnimation: function(name, map, skeletonData) {
            var timelines = [];
            var duration = 0;
            var frameIndex, timeline, timelineName, valueMap, values, i, n;
            var bones = map["bones"];
            for (var boneName in bones) {
                if (!bones.hasOwnProperty(boneName)) continue;
                var boneIndex = skeletonData.findBoneIndex(boneName);
                if (boneIndex == -1) throw "Bone not found: " + boneName;
                var boneMap = bones[boneName];
                for (timelineName in boneMap) {
                    if (!boneMap.hasOwnProperty(timelineName)) continue;
                    values = boneMap[timelineName];
                    if (timelineName == "rotate") {
                        timeline = new spine.RotateTimeline(values.length);
                        timeline.boneIndex = boneIndex;
                        frameIndex = 0;
                        for (i = 0, n = values.length; i < n; i++) {
                            valueMap = values[i];
                            timeline.setFrame(frameIndex, valueMap["time"], valueMap["angle"]);
                            spine.SkeletonJson.readCurve(timeline, frameIndex, valueMap);
                            frameIndex++;
                        }
                        timelines.push(timeline);
                        duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 2 - 2]);
                    } else if (timelineName == "translate" || timelineName == "scale") {
                        var timelineScale = 1;
                        if (timelineName == "scale") timeline = new spine.ScaleTimeline(values.length); else {
                            timeline = new spine.TranslateTimeline(values.length);
                            timelineScale = this.scale;
                        }
                        timeline.boneIndex = boneIndex;
                        frameIndex = 0;
                        for (i = 0, n = values.length; i < n; i++) {
                            valueMap = values[i];
                            var x = (valueMap["x"] || 0) * timelineScale;
                            var y = (valueMap["y"] || 0) * timelineScale;
                            timeline.setFrame(frameIndex, valueMap["time"], x, y);
                            spine.SkeletonJson.readCurve(timeline, frameIndex, valueMap);
                            frameIndex++;
                        }
                        timelines.push(timeline);
                        duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 3 - 3]);
                    } else throw "Invalid timeline type for a bone: " + timelineName + " (" + boneName + ")";
                }
            }
            var slots = map["slots"];
            for (var slotName in slots) {
                if (!slots.hasOwnProperty(slotName)) continue;
                var slotMap = slots[slotName];
                var slotIndex = skeletonData.findSlotIndex(slotName);
                for (timelineName in slotMap) {
                    if (!slotMap.hasOwnProperty(timelineName)) continue;
                    values = slotMap[timelineName];
                    if (timelineName == "color") {
                        timeline = new spine.ColorTimeline(values.length);
                        timeline.slotIndex = slotIndex;
                        frameIndex = 0;
                        for (i = 0, n = values.length; i < n; i++) {
                            valueMap = values[i];
                            var color = valueMap["color"];
                            var r = spine.SkeletonJson.toColor(color, 0);
                            var g = spine.SkeletonJson.toColor(color, 1);
                            var b = spine.SkeletonJson.toColor(color, 2);
                            var a = spine.SkeletonJson.toColor(color, 3);
                            timeline.setFrame(frameIndex, valueMap["time"], r, g, b, a);
                            spine.SkeletonJson.readCurve(timeline, frameIndex, valueMap);
                            frameIndex++;
                        }
                        timelines.push(timeline);
                        duration = Math.max(duration, timeline.frames[timeline.getFrameCount() * 5 - 5]);
                    } else if (timelineName == "attachment") {
                        timeline = new spine.AttachmentTimeline(values.length);
                        timeline.slotIndex = slotIndex;
                        frameIndex = 0;
                        for (i = 0, n = values.length; i < n; i++) {
                            valueMap = values[i];
                            timeline.setFrame(frameIndex++, valueMap["time"], valueMap["name"]);
                        }
                        timelines.push(timeline);
                        duration = Math.max(duration, timeline.frames[timeline.getFrameCount() - 1]);
                    } else throw "Invalid timeline type for a slot: " + timelineName + " (" + slotName + ")";
                }
            }
            skeletonData.animations.push(new spine.Animation(name, timelines, duration));
        }
    };
    spine.SkeletonJson.readCurve = function(timeline, frameIndex, valueMap) {
        var curve = valueMap["curve"];
        if (!curve) return;
        if (curve == "stepped") timeline.curves.setStepped(frameIndex); else if (curve instanceof Array) timeline.curves.setCurve(frameIndex, curve[0], curve[1], curve[2], curve[3]);
    };
    spine.SkeletonJson.toColor = function(hexString, colorIndex) {
        if (hexString.length != 8) throw "Color hexidecimal length must be 8, recieved: " + hexString;
        return parseInt(hexString.substring(colorIndex * 2, 2), 16) / 255;
    };
    spine.Atlas = function(atlasText, textureLoader) {
        this.textureLoader = textureLoader;
        this.pages = [];
        this.regions = [];
        var reader = new spine.AtlasReader(atlasText);
        var tuple = [];
        tuple.length = 4;
        var page = null;
        while (true) {
            var line = reader.readLine();
            if (line == null) break;
            line = reader.trim(line);
            if (!line.length) page = null; else if (!page) {
                page = new spine.AtlasPage();
                page.name = line;
                page.format = spine.Atlas.Format[reader.readValue()];
                reader.readTuple(tuple);
                page.minFilter = spine.Atlas.TextureFilter[tuple[0]];
                page.magFilter = spine.Atlas.TextureFilter[tuple[1]];
                var direction = reader.readValue();
                page.uWrap = spine.Atlas.TextureWrap.clampToEdge;
                page.vWrap = spine.Atlas.TextureWrap.clampToEdge;
                if (direction == "x") page.uWrap = spine.Atlas.TextureWrap.repeat; else if (direction == "y") page.vWrap = spine.Atlas.TextureWrap.repeat; else if (direction == "xy") page.uWrap = page.vWrap = spine.Atlas.TextureWrap.repeat;
                textureLoader.load(page, line);
                this.pages.push(page);
            } else {
                var region = new spine.AtlasRegion();
                region.name = line;
                region.page = page;
                region.rotate = reader.readValue() == "true";
                reader.readTuple(tuple);
                var x = parseInt(tuple[0], 10);
                var y = parseInt(tuple[1], 10);
                reader.readTuple(tuple);
                var width = parseInt(tuple[0], 10);
                var height = parseInt(tuple[1], 10);
                region.u = x / page.width;
                region.v = y / page.height;
                if (region.rotate) {
                    region.u2 = (x + height) / page.width;
                    region.v2 = (y + width) / page.height;
                } else {
                    region.u2 = (x + width) / page.width;
                    region.v2 = (y + height) / page.height;
                }
                region.x = x;
                region.y = y;
                region.width = Math.abs(width);
                region.height = Math.abs(height);
                if (reader.readTuple(tuple) == 4) {
                    region.splits = [ parseInt(tuple[0], 10), parseInt(tuple[1], 10), parseInt(tuple[2], 10), parseInt(tuple[3], 10) ];
                    if (reader.readTuple(tuple) == 4) {
                        region.pads = [ parseInt(tuple[0], 10), parseInt(tuple[1], 10), parseInt(tuple[2], 10), parseInt(tuple[3], 10) ];
                        reader.readTuple(tuple);
                    }
                }
                region.originalWidth = parseInt(tuple[0], 10);
                region.originalHeight = parseInt(tuple[1], 10);
                reader.readTuple(tuple);
                region.offsetX = parseInt(tuple[0], 10);
                region.offsetY = parseInt(tuple[1], 10);
                region.index = parseInt(reader.readValue(), 10);
                this.regions.push(region);
            }
        }
    };
    spine.Atlas.prototype = {
        findRegion: function(name) {
            var regions = this.regions;
            for (var i = 0, n = regions.length; i < n; i++) if (regions[i].name == name) return regions[i];
            return null;
        },
        dispose: function() {
            var pages = this.pages;
            for (var i = 0, n = pages.length; i < n; i++) this.textureLoader.unload(pages[i].rendererObject);
        },
        updateUVs: function(page) {
            var regions = this.regions;
            for (var i = 0, n = regions.length; i < n; i++) {
                var region = regions[i];
                if (region.page != page) continue;
                region.u = region.x / page.width;
                region.v = region.y / page.height;
                if (region.rotate) {
                    region.u2 = (region.x + region.height) / page.width;
                    region.v2 = (region.y + region.width) / page.height;
                } else {
                    region.u2 = (region.x + region.width) / page.width;
                    region.v2 = (region.y + region.height) / page.height;
                }
            }
        }
    };
    spine.Atlas.Format = {
        alpha: 0,
        intensity: 1,
        luminanceAlpha: 2,
        rgb565: 3,
        rgba4444: 4,
        rgb888: 5,
        rgba8888: 6
    };
    spine.Atlas.TextureFilter = {
        nearest: 0,
        linear: 1,
        mipMap: 2,
        mipMapNearestNearest: 3,
        mipMapLinearNearest: 4,
        mipMapNearestLinear: 5,
        mipMapLinearLinear: 6
    };
    spine.Atlas.TextureWrap = {
        mirroredRepeat: 0,
        clampToEdge: 1,
        repeat: 2
    };
    spine.AtlasPage = function() {};
    spine.AtlasPage.prototype = {
        name: null,
        format: null,
        minFilter: null,
        magFilter: null,
        uWrap: null,
        vWrap: null,
        rendererObject: null,
        width: 0,
        height: 0
    };
    spine.AtlasRegion = function() {};
    spine.AtlasRegion.prototype = {
        page: null,
        name: null,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        u: 0,
        v: 0,
        u2: 0,
        v2: 0,
        offsetX: 0,
        offsetY: 0,
        originalWidth: 0,
        originalHeight: 0,
        index: 0,
        rotate: false,
        splits: null,
        pads: null
    };
    spine.AtlasReader = function(text) {
        this.lines = text.split(/\r\n|\r|\n/);
    };
    spine.AtlasReader.prototype = {
        index: 0,
        trim: function(value) {
            return value.replace(/^\s+|\s+$/g, "");
        },
        readLine: function() {
            if (this.index >= this.lines.length) return null;
            return this.lines[this.index++];
        },
        readValue: function() {
            var line = this.readLine();
            var colon = line.indexOf(":");
            if (colon == -1) throw "Invalid line: " + line;
            return this.trim(line.substring(colon + 1));
        },
        readTuple: function(tuple) {
            var line = this.readLine();
            var colon = line.indexOf(":");
            if (colon == -1) throw "Invalid line: " + line;
            var i = 0, lastMatch = colon + 1;
            for (;i < 3; i++) {
                var comma = line.indexOf(",", lastMatch);
                if (comma == -1) {
                    if (!i) throw "Invalid line: " + line;
                    break;
                }
                tuple[i] = this.trim(line.substr(lastMatch, comma - lastMatch));
                lastMatch = comma + 1;
            }
            tuple[i] = this.trim(line.substring(lastMatch));
            return i + 1;
        }
    };
    spine.AtlasAttachmentLoader = function(atlas) {
        this.atlas = atlas;
    };
    spine.AtlasAttachmentLoader.prototype = {
        newAttachment: function(skin, type, name) {
            switch (type) {
              case spine.AttachmentType.region:
                var region = this.atlas.findRegion(name);
                if (!region) throw "Region not found in atlas: " + name + " (" + type + ")";
                var attachment = new spine.RegionAttachment(name);
                attachment.rendererObject = region;
                attachment.setUVs(region.u, region.v, region.u2, region.v2, region.rotate);
                attachment.regionOffsetX = region.offsetX;
                attachment.regionOffsetY = region.offsetY;
                attachment.regionWidth = region.width;
                attachment.regionHeight = region.height;
                attachment.regionOriginalWidth = region.originalWidth;
                attachment.regionOriginalHeight = region.originalHeight;
                return attachment;
            }
            throw "Unknown attachment type: " + type;
        }
    };
    spine.Bone.yDown = true;
    PIXI.AnimCache = {};
    PIXI.Spine = function(url) {
        PIXI.DisplayObjectContainer.call(this);
        this.spineData = PIXI.AnimCache[url];
        if (!this.spineData) {
            throw new Error("Spine data must be preloaded using PIXI.SpineLoader or PIXI.AssetLoader: " + url);
        }
        this.skeleton = new spine.Skeleton(this.spineData);
        this.skeleton.updateWorldTransform();
        this.stateData = new spine.AnimationStateData(this.spineData);
        this.state = new spine.AnimationState(this.stateData);
        this.slotContainers = [];
        for (var i = 0, n = this.skeleton.drawOrder.length; i < n; i++) {
            var slot = this.skeleton.drawOrder[i];
            var attachment = slot.attachment;
            var slotContainer = new PIXI.DisplayObjectContainer();
            this.slotContainers.push(slotContainer);
            this.addChild(slotContainer);
            if (!(attachment instanceof spine.RegionAttachment)) {
                continue;
            }
            var spriteName = attachment.rendererObject.name;
            var sprite = this.createSprite(slot, attachment.rendererObject);
            slot.currentSprite = sprite;
            slot.currentSpriteName = spriteName;
            slotContainer.addChild(sprite);
        }
    };
    PIXI.Spine.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
    PIXI.Spine.prototype.constructor = PIXI.Spine;
    PIXI.Spine.prototype.updateTransform = function() {
        this.lastTime = this.lastTime || Date.now();
        var timeDelta = (Date.now() - this.lastTime) * .001;
        this.lastTime = Date.now();
        this.state.update(timeDelta);
        this.state.apply(this.skeleton);
        this.skeleton.updateWorldTransform();
        var drawOrder = this.skeleton.drawOrder;
        for (var i = 0, n = drawOrder.length; i < n; i++) {
            var slot = drawOrder[i];
            var attachment = slot.attachment;
            var slotContainer = this.slotContainers[i];
            if (!(attachment instanceof spine.RegionAttachment)) {
                slotContainer.visible = false;
                continue;
            }
            if (attachment.rendererObject) {
                if (!slot.currentSpriteName || slot.currentSpriteName != attachment.name) {
                    var spriteName = attachment.rendererObject.name;
                    if (slot.currentSprite !== undefined) {
                        slot.currentSprite.visible = false;
                    }
                    slot.sprites = slot.sprites || {};
                    if (slot.sprites[spriteName] !== undefined) {
                        slot.sprites[spriteName].visible = true;
                    } else {
                        var sprite = this.createSprite(slot, attachment.rendererObject);
                        slotContainer.addChild(sprite);
                    }
                    slot.currentSprite = slot.sprites[spriteName];
                    slot.currentSpriteName = spriteName;
                }
            }
            slotContainer.visible = true;
            var bone = slot.bone;
            slotContainer.position.x = bone.worldX + attachment.x * bone.m00 + attachment.y * bone.m01;
            slotContainer.position.y = bone.worldY + attachment.x * bone.m10 + attachment.y * bone.m11;
            slotContainer.scale.x = bone.worldScaleX;
            slotContainer.scale.y = bone.worldScaleY;
            slotContainer.rotation = -(slot.bone.worldRotation * Math.PI / 180);
        }
        PIXI.DisplayObjectContainer.prototype.updateTransform.call(this);
    };
    PIXI.Spine.prototype.createSprite = function(slot, descriptor) {
        var name = PIXI.TextureCache[descriptor.name] ? descriptor.name : descriptor.name + ".png";
        var sprite = new PIXI.Sprite(PIXI.Texture.fromFrame(name));
        sprite.scale = descriptor.scale;
        sprite.rotation = descriptor.rotation;
        sprite.anchor.x = sprite.anchor.y = .5;
        slot.sprites = slot.sprites || {};
        slot.sprites[descriptor.name] = sprite;
        return sprite;
    };
    PIXI.BaseTextureCache = {};
    PIXI.texturesToUpdate = [];
    PIXI.texturesToDestroy = [];
    PIXI.BaseTextureCacheIdGenerator = 0;
    PIXI.BaseTexture = function(source, scaleMode) {
        PIXI.EventTarget.call(this);
        this.width = 100;
        this.height = 100;
        this.scaleMode = scaleMode || PIXI.scaleModes.DEFAULT;
        this.hasLoaded = false;
        this.source = source;
        this.id = PIXI.BaseTextureCacheIdGenerator++;
        this._glTextures = [];
        if (!source) return;
        if (this.source.complete || this.source.getContext) {
            this.hasLoaded = true;
            this.width = this.source.width;
            this.height = this.source.height;
            PIXI.texturesToUpdate.push(this);
        } else {
            var scope = this;
            this.source.onload = function() {
                scope.hasLoaded = true;
                scope.width = scope.source.width;
                scope.height = scope.source.height;
                PIXI.texturesToUpdate.push(scope);
                scope.dispatchEvent({
                    type: "loaded",
                    content: scope
                });
            };
        }
        this.imageUrl = null;
        this._powerOf2 = false;
    };
    PIXI.BaseTexture.prototype.constructor = PIXI.BaseTexture;
    PIXI.BaseTexture.prototype.destroy = function() {
        if (this.imageUrl) {
            delete PIXI.BaseTextureCache[this.imageUrl];
            this.imageUrl = null;
            this.source.src = null;
        }
        this.source = null;
        PIXI.texturesToDestroy.push(this);
    };
    PIXI.BaseTexture.prototype.updateSourceImage = function(newSrc) {
        this.hasLoaded = false;
        this.source.src = null;
        this.source.src = newSrc;
    };
    PIXI.BaseTexture.fromImage = function(imageUrl, crossorigin, scaleMode) {
        var baseTexture = PIXI.BaseTextureCache[imageUrl];
        if (crossorigin === undefined) crossorigin = true;
        if (!baseTexture) {
            var image = new Image();
            if (crossorigin) {
                image.crossOrigin = "";
            }
            image.src = imageUrl;
            baseTexture = new PIXI.BaseTexture(image, scaleMode);
            baseTexture.imageUrl = imageUrl;
            PIXI.BaseTextureCache[imageUrl] = baseTexture;
        }
        return baseTexture;
    };
    PIXI.BaseTexture.fromCanvas = function(canvas, scaleMode) {
        if (!canvas._pixiId) {
            canvas._pixiId = "canvas_" + PIXI.TextureCacheIdGenerator++;
        }
        var baseTexture = PIXI.BaseTextureCache[canvas._pixiId];
        if (!baseTexture) {
            baseTexture = new PIXI.BaseTexture(canvas, scaleMode);
            PIXI.BaseTextureCache[canvas._pixiId] = baseTexture;
        }
        return baseTexture;
    };
    PIXI.TextureCache = {};
    PIXI.FrameCache = {};
    PIXI.TextureCacheIdGenerator = 0;
    PIXI.Texture = function(baseTexture, frame) {
        PIXI.EventTarget.call(this);
        if (!frame) {
            this.noFrame = true;
            frame = new PIXI.Rectangle(0, 0, 1, 1);
        }
        if (baseTexture instanceof PIXI.Texture) baseTexture = baseTexture.baseTexture;
        this.baseTexture = baseTexture;
        this.frame = frame;
        this.trim = null;
        this.scope = this;
        this._uvs = null;
        if (baseTexture.hasLoaded) {
            if (this.noFrame) frame = new PIXI.Rectangle(0, 0, baseTexture.width, baseTexture.height);
            this.setFrame(frame);
        } else {
            var scope = this;
            baseTexture.addEventListener("loaded", function() {
                scope.onBaseTextureLoaded();
            });
        }
    };
    PIXI.Texture.prototype.constructor = PIXI.Texture;
    PIXI.Texture.prototype.onBaseTextureLoaded = function() {
        var baseTexture = this.baseTexture;
        baseTexture.removeEventListener("loaded", this.onLoaded);
        if (this.noFrame) this.frame = new PIXI.Rectangle(0, 0, baseTexture.width, baseTexture.height);
        this.setFrame(this.frame);
        this.scope.dispatchEvent({
            type: "update",
            content: this
        });
    };
    PIXI.Texture.prototype.destroy = function(destroyBase) {
        if (destroyBase) this.baseTexture.destroy();
    };
    PIXI.Texture.prototype.setFrame = function(frame) {
        this.frame = frame;
        this.width = frame.width;
        this.height = frame.height;
        if (frame.x + frame.width > this.baseTexture.width || frame.y + frame.height > this.baseTexture.height) {
            throw new Error("Texture Error: frame does not fit inside the base Texture dimensions " + this);
        }
        this.updateFrame = true;
        PIXI.Texture.frameUpdates.push(this);
    };
    PIXI.Texture.prototype._updateWebGLuvs = function() {
        if (!this._uvs) this._uvs = new PIXI.TextureUvs();
        var frame = this.frame;
        var tw = this.baseTexture.width;
        var th = this.baseTexture.height;
        this._uvs.x0 = frame.x / tw;
        this._uvs.y0 = frame.y / th;
        this._uvs.x1 = (frame.x + frame.width) / tw;
        this._uvs.y1 = frame.y / th;
        this._uvs.x2 = (frame.x + frame.width) / tw;
        this._uvs.y2 = (frame.y + frame.height) / th;
        this._uvs.x3 = frame.x / tw;
        this._uvs.y3 = (frame.y + frame.height) / th;
    };
    PIXI.Texture.fromImage = function(imageUrl, crossorigin, scaleMode) {
        var texture = PIXI.TextureCache[imageUrl];
        if (!texture) {
            texture = new PIXI.Texture(PIXI.BaseTexture.fromImage(imageUrl, crossorigin, scaleMode));
            PIXI.TextureCache[imageUrl] = texture;
        }
        return texture;
    };
    PIXI.Texture.fromFrame = function(frameId) {
        var texture = PIXI.TextureCache[frameId];
        if (!texture) throw new Error('The frameId "' + frameId + '" does not exist in the texture cache ');
        return texture;
    };
    PIXI.Texture.fromCanvas = function(canvas, scaleMode) {
        var baseTexture = PIXI.BaseTexture.fromCanvas(canvas, scaleMode);
        return new PIXI.Texture(baseTexture);
    };
    PIXI.Texture.addTextureToCache = function(texture, id) {
        PIXI.TextureCache[id] = texture;
    };
    PIXI.Texture.removeTextureFromCache = function(id) {
        var texture = PIXI.TextureCache[id];
        delete PIXI.TextureCache[id];
        delete PIXI.BaseTextureCache[id];
        return texture;
    };
    PIXI.Texture.frameUpdates = [];
    PIXI.TextureUvs = function() {
        this.x0 = 0;
        this.y0 = 0;
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
        this.x3 = 0;
        this.y4 = 0;
    };
    PIXI.RenderTexture = function(width, height, renderer) {
        PIXI.EventTarget.call(this);
        this.width = width || 100;
        this.height = height || 100;
        this.frame = new PIXI.Rectangle(0, 0, this.width, this.height);
        this.baseTexture = new PIXI.BaseTexture();
        this.baseTexture.width = this.width;
        this.baseTexture.height = this.height;
        this.baseTexture._glTextures = [];
        this.baseTexture.hasLoaded = true;
        this.renderer = renderer || PIXI.defaultRenderer;
        if (this.renderer.type === PIXI.WEBGL_RENDERER) {
            var gl = this.renderer.gl;
            this.textureBuffer = new PIXI.FilterTexture(gl, this.width, this.height);
            this.baseTexture._glTextures[gl.id] = this.textureBuffer.texture;
            this.render = this.renderWebGL;
            this.projection = new PIXI.Point(this.width / 2, -this.height / 2);
        } else {
            this.render = this.renderCanvas;
            this.textureBuffer = new PIXI.CanvasBuffer(this.width, this.height);
            this.baseTexture.source = this.textureBuffer.canvas;
        }
        PIXI.Texture.frameUpdates.push(this);
    };
    PIXI.RenderTexture.prototype = Object.create(PIXI.Texture.prototype);
    PIXI.RenderTexture.prototype.constructor = PIXI.RenderTexture;
    PIXI.RenderTexture.prototype.resize = function(width, height) {
        this.width = width;
        this.height = height;
        this.frame.width = this.width;
        this.frame.height = this.height;
        if (this.renderer.type === PIXI.WEBGL_RENDERER) {
            this.projection.x = this.width / 2;
            this.projection.y = -this.height / 2;
            var gl = this.renderer.gl;
            gl.bindTexture(gl.TEXTURE_2D, this.baseTexture._glTextures[gl.id]);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        } else {
            this.textureBuffer.resize(this.width, this.height);
        }
        PIXI.Texture.frameUpdates.push(this);
    };
    PIXI.RenderTexture.prototype.renderWebGL = function(displayObject, position, clear) {
        var gl = this.renderer.gl;
        gl.colorMask(true, true, true, true);
        gl.viewport(0, 0, this.width, this.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.textureBuffer.frameBuffer);
        if (clear) this.textureBuffer.clear();
        var children = displayObject.children;
        var originalWorldTransform = displayObject.worldTransform;
        displayObject.worldTransform = PIXI.RenderTexture.tempMatrix;
        displayObject.worldTransform.d = -1;
        displayObject.worldTransform.ty = this.projection.y * -2;
        if (position) {
            displayObject.worldTransform.tx = position.x;
            displayObject.worldTransform.ty -= position.y;
        }
        for (var i = 0, j = children.length; i < j; i++) {
            children[i].updateTransform();
        }
        PIXI.WebGLRenderer.updateTextures();
        this.renderer.renderDisplayObject(displayObject, this.projection, this.textureBuffer.frameBuffer);
        displayObject.worldTransform = originalWorldTransform;
    };
    PIXI.RenderTexture.prototype.renderCanvas = function(displayObject, position, clear) {
        var children = displayObject.children;
        var originalWorldTransform = displayObject.worldTransform;
        displayObject.worldTransform = PIXI.RenderTexture.tempMatrix;
        if (position) {
            displayObject.worldTransform.tx = position.x;
            displayObject.worldTransform.ty = position.y;
        }
        for (var i = 0, j = children.length; i < j; i++) {
            children[i].updateTransform();
        }
        if (clear) this.textureBuffer.clear();
        var context = this.textureBuffer.context;
        this.renderer.renderDisplayObject(displayObject, context);
        context.setTransform(1, 0, 0, 1, 0, 0);
        displayObject.worldTransform = originalWorldTransform;
    };
    PIXI.RenderTexture.tempMatrix = new PIXI.Matrix();
    PIXI.AssetLoader = function(assetURLs, crossorigin) {
        PIXI.EventTarget.call(this);
        this.assetURLs = assetURLs;
        this.crossorigin = crossorigin;
        this.loadersByType = {
            jpg: PIXI.ImageLoader,
            jpeg: PIXI.ImageLoader,
            png: PIXI.ImageLoader,
            gif: PIXI.ImageLoader,
            json: PIXI.JsonLoader,
            atlas: PIXI.AtlasLoader,
            anim: PIXI.SpineLoader,
            xml: PIXI.BitmapFontLoader,
            fnt: PIXI.BitmapFontLoader
        };
    };
    PIXI.AssetLoader.prototype.constructor = PIXI.AssetLoader;
    PIXI.AssetLoader.prototype._getDataType = function(str) {
        var test = "data:";
        var start = str.slice(0, test.length).toLowerCase();
        if (start === test) {
            var data = str.slice(test.length);
            var sepIdx = data.indexOf(",");
            if (sepIdx === -1) return null;
            var info = data.slice(0, sepIdx).split(";")[0];
            if (!info || info.toLowerCase() === "text/plain") return "txt";
            return info.split("/").pop().toLowerCase();
        }
        return null;
    };
    PIXI.AssetLoader.prototype.load = function() {
        var scope = this;
        function onLoad(evt) {
            scope.onAssetLoaded(evt.content);
        }
        this.loadCount = this.assetURLs.length;
        for (var i = 0; i < this.assetURLs.length; i++) {
            var fileName = this.assetURLs[i];
            var fileType = this._getDataType(fileName);
            if (!fileType) fileType = fileName.split("?").shift().split(".").pop().toLowerCase();
            var Constructor = this.loadersByType[fileType];
            if (!Constructor) throw new Error(fileType + " is an unsupported file type");
            var loader = new Constructor(fileName, this.crossorigin);
            loader.addEventListener("loaded", onLoad);
            loader.load();
        }
    };
    PIXI.AssetLoader.prototype.onAssetLoaded = function(loader) {
        this.loadCount--;
        this.dispatchEvent({
            type: "onProgress",
            content: this,
            loader: loader
        });
        if (this.onProgress) this.onProgress(loader);
        if (!this.loadCount) {
            this.dispatchEvent({
                type: "onComplete",
                content: this
            });
            if (this.onComplete) this.onComplete();
        }
    };
    PIXI.JsonLoader = function(url, crossorigin) {
        PIXI.EventTarget.call(this);
        this.url = url;
        this.crossorigin = crossorigin;
        this.baseUrl = url.replace(/[^\/]*$/, "");
        this.loaded = false;
    };
    PIXI.JsonLoader.prototype.constructor = PIXI.JsonLoader;
    PIXI.JsonLoader.prototype.load = function() {
        if (window.XDomainRequest) {
            this.ajaxRequest = new window.XDomainRequest();
        } else if (window.XMLHttpRequest) {
            this.ajaxRequest = new window.XMLHttpRequest();
        } else {
            this.ajaxRequest = new window.ActiveXObject("Microsoft.XMLHTTP");
        }
        var scope = this;
        this.ajaxRequest.onload = function() {
            scope.onJSONLoaded();
        };
        this.ajaxRequest.open("GET", this.url, false);
        this.ajaxRequest.send();
    };
    PIXI.JsonLoader.prototype.onJSONLoaded = function() {
        this.json = JSON.parse(this.ajaxRequest.responseText);
        if (this.json.frames) {
            var scope = this;
            var textureUrl = this.baseUrl + this.json.meta.image;
            var image = new PIXI.ImageLoader(textureUrl, this.crossorigin);
            var frameData = this.json.frames;
            this.texture = image.texture.baseTexture;
            image.addEventListener("loaded", function() {
                scope.onLoaded();
            });
            for (var i in frameData) {
                var rect = frameData[i].frame;
                if (rect) {
                    PIXI.TextureCache[i] = new PIXI.Texture(this.texture, {
                        x: rect.x,
                        y: rect.y,
                        width: rect.w,
                        height: rect.h
                    });
                    if (frameData[i].trimmed) {
                        var texture = PIXI.TextureCache[i];
                        var actualSize = frameData[i].sourceSize;
                        var realSize = frameData[i].spriteSourceSize;
                        texture.trim = new PIXI.Rectangle(realSize.x, realSize.y, actualSize.w, actualSize.h);
                    }
                }
            }
            image.load();
        } else if (this.json.bones) {
            var spineJsonParser = new spine.SkeletonJson();
            var skeletonData = spineJsonParser.readSkeletonData(this.json);
            PIXI.AnimCache[this.url] = skeletonData;
            this.onLoaded();
        } else {
            this.onLoaded();
        }
    };
    PIXI.JsonLoader.prototype.onLoaded = function() {
        this.loaded = true;
        this.dispatchEvent({
            type: "loaded",
            content: this
        });
    };
    PIXI.JsonLoader.prototype.onError = function() {
        this.dispatchEvent({
            type: "error",
            content: this
        });
    };
    PIXI.AtlasLoader = function(url, crossorigin) {
        PIXI.EventTarget.call(this);
        this.url = url;
        this.baseUrl = url.replace(/[^\/]*$/, "");
        this.crossorigin = crossorigin;
        this.loaded = false;
    };
    PIXI.AtlasLoader.constructor = PIXI.AtlasLoader;
    PIXI.AtlasLoader.prototype.load = function() {
        this.ajaxRequest = new PIXI.AjaxRequest();
        this.ajaxRequest.onreadystatechange = this.onAtlasLoaded.bind(this);
        this.ajaxRequest.open("GET", this.url, true);
        if (this.ajaxRequest.overrideMimeType) this.ajaxRequest.overrideMimeType("application/json");
        this.ajaxRequest.send(null);
    };
    PIXI.AtlasLoader.prototype.onAtlasLoaded = function() {
        if (this.ajaxRequest.readyState === 4) {
            if (this.ajaxRequest.status === 200 || window.location.href.indexOf("http") === -1) {
                this.atlas = {
                    meta: {
                        image: []
                    },
                    frames: []
                };
                var result = this.ajaxRequest.responseText.split(/\r?\n/);
                var lineCount = -3;
                var currentImageId = 0;
                var currentFrame = null;
                var nameInNextLine = false;
                var i = 0, j = 0, selfOnLoaded = this.onLoaded.bind(this);
                for (i = 0; i < result.length; i++) {
                    result[i] = result[i].replace(/^\s+|\s+$/g, "");
                    if (result[i] === "") {
                        nameInNextLine = i + 1;
                    }
                    if (result[i].length > 0) {
                        if (nameInNextLine === i) {
                            this.atlas.meta.image.push(result[i]);
                            currentImageId = this.atlas.meta.image.length - 1;
                            this.atlas.frames.push({});
                            lineCount = -3;
                        } else if (lineCount > 0) {
                            if (lineCount % 7 === 1) {
                                if (currentFrame != null) {
                                    this.atlas.frames[currentImageId][currentFrame.name] = currentFrame;
                                }
                                currentFrame = {
                                    name: result[i],
                                    frame: {}
                                };
                            } else {
                                var text = result[i].split(" ");
                                if (lineCount % 7 === 3) {
                                    currentFrame.frame.x = Number(text[1].replace(",", ""));
                                    currentFrame.frame.y = Number(text[2]);
                                } else if (lineCount % 7 === 4) {
                                    currentFrame.frame.w = Number(text[1].replace(",", ""));
                                    currentFrame.frame.h = Number(text[2]);
                                } else if (lineCount % 7 === 5) {
                                    var realSize = {
                                        x: 0,
                                        y: 0,
                                        w: Number(text[1].replace(",", "")),
                                        h: Number(text[2])
                                    };
                                    if (realSize.w > currentFrame.frame.w || realSize.h > currentFrame.frame.h) {
                                        currentFrame.trimmed = true;
                                        currentFrame.realSize = realSize;
                                    } else {
                                        currentFrame.trimmed = false;
                                    }
                                }
                            }
                        }
                        lineCount++;
                    }
                }
                if (currentFrame != null) {
                    this.atlas.frames[currentImageId][currentFrame.name] = currentFrame;
                }
                if (this.atlas.meta.image.length > 0) {
                    this.images = [];
                    for (j = 0; j < this.atlas.meta.image.length; j++) {
                        var textureUrl = this.baseUrl + this.atlas.meta.image[j];
                        var frameData = this.atlas.frames[j];
                        this.images.push(new PIXI.ImageLoader(textureUrl, this.crossorigin));
                        for (i in frameData) {
                            var rect = frameData[i].frame;
                            if (rect) {
                                PIXI.TextureCache[i] = new PIXI.Texture(this.images[j].texture.baseTexture, {
                                    x: rect.x,
                                    y: rect.y,
                                    width: rect.w,
                                    height: rect.h
                                });
                                if (frameData[i].trimmed) {
                                    PIXI.TextureCache[i].realSize = frameData[i].realSize;
                                    PIXI.TextureCache[i].trim.x = 0;
                                    PIXI.TextureCache[i].trim.y = 0;
                                }
                            }
                        }
                    }
                    this.currentImageId = 0;
                    for (j = 0; j < this.images.length; j++) {
                        this.images[j].addEventListener("loaded", selfOnLoaded);
                    }
                    this.images[this.currentImageId].load();
                } else {
                    this.onLoaded();
                }
            } else {
                this.onError();
            }
        }
    };
    PIXI.AtlasLoader.prototype.onLoaded = function() {
        if (this.images.length - 1 > this.currentImageId) {
            this.currentImageId++;
            this.images[this.currentImageId].load();
        } else {
            this.loaded = true;
            this.dispatchEvent({
                type: "loaded",
                content: this
            });
        }
    };
    PIXI.AtlasLoader.prototype.onError = function() {
        this.dispatchEvent({
            type: "error",
            content: this
        });
    };
    PIXI.SpriteSheetLoader = function(url, crossorigin) {
        PIXI.EventTarget.call(this);
        this.url = url;
        this.crossorigin = crossorigin;
        this.baseUrl = url.replace(/[^\/]*$/, "");
        this.texture = null;
        this.frames = {};
    };
    PIXI.SpriteSheetLoader.prototype.constructor = PIXI.SpriteSheetLoader;
    PIXI.SpriteSheetLoader.prototype.load = function() {
        var scope = this;
        var jsonLoader = new PIXI.JsonLoader(this.url, this.crossorigin);
        jsonLoader.addEventListener("loaded", function(event) {
            scope.json = event.content.json;
            scope.onLoaded();
        });
        jsonLoader.load();
    };
    PIXI.SpriteSheetLoader.prototype.onLoaded = function() {
        this.dispatchEvent({
            type: "loaded",
            content: this
        });
    };
    PIXI.ImageLoader = function(url, crossorigin) {
        PIXI.EventTarget.call(this);
        this.texture = PIXI.Texture.fromImage(url, crossorigin);
        this.frames = [];
    };
    PIXI.ImageLoader.prototype.constructor = PIXI.ImageLoader;
    PIXI.ImageLoader.prototype.load = function() {
        if (!this.texture.baseTexture.hasLoaded) {
            var scope = this;
            this.texture.baseTexture.addEventListener("loaded", function() {
                scope.onLoaded();
            });
        } else {
            this.onLoaded();
        }
    };
    PIXI.ImageLoader.prototype.onLoaded = function() {
        this.dispatchEvent({
            type: "loaded",
            content: this
        });
    };
    PIXI.ImageLoader.prototype.loadFramedSpriteSheet = function(frameWidth, frameHeight, textureName) {
        this.frames = [];
        var cols = Math.floor(this.texture.width / frameWidth);
        var rows = Math.floor(this.texture.height / frameHeight);
        var i = 0;
        for (var y = 0; y < rows; y++) {
            for (var x = 0; x < cols; x++, i++) {
                var texture = new PIXI.Texture(this.texture, {
                    x: x * frameWidth,
                    y: y * frameHeight,
                    width: frameWidth,
                    height: frameHeight
                });
                this.frames.push(texture);
                if (textureName) PIXI.TextureCache[textureName + "-" + i] = texture;
            }
        }
        if (!this.texture.baseTexture.hasLoaded) {
            var scope = this;
            this.texture.baseTexture.addEventListener("loaded", function() {
                scope.onLoaded();
            });
        } else {
            this.onLoaded();
        }
    };
    PIXI.BitmapFontLoader = function(url, crossorigin) {
        PIXI.EventTarget.call(this);
        this.url = url;
        this.crossorigin = crossorigin;
        this.baseUrl = url.replace(/[^\/]*$/, "");
        this.texture = null;
    };
    PIXI.BitmapFontLoader.prototype.constructor = PIXI.BitmapFontLoader;
    PIXI.BitmapFontLoader.prototype.load = function() {
        this.ajaxRequest = new PIXI.AjaxRequest();
        var scope = this;
        this.ajaxRequest.onreadystatechange = function() {
            scope.onXMLLoaded();
        };
        this.ajaxRequest.open("GET", this.url, true);
        if (this.ajaxRequest.overrideMimeType) this.ajaxRequest.overrideMimeType("application/xml");
        this.ajaxRequest.send(null);
    };
    PIXI.BitmapFontLoader.prototype.onXMLLoaded = function() {
        if (this.ajaxRequest.readyState === 4) {
            if (this.ajaxRequest.status === 200 || window.location.protocol.indexOf("http") === -1) {
                var responseXML = this.ajaxRequest.responseXML;
                if (!responseXML || /MSIE 9/i.test(navigator.userAgent) || navigator.isCocoonJS) {
                    if (typeof window.DOMParser === "function") {
                        var domparser = new DOMParser();
                        responseXML = domparser.parseFromString(this.ajaxRequest.responseText, "text/xml");
                    } else {
                        var div = document.createElement("div");
                        div.innerHTML = this.ajaxRequest.responseText;
                        responseXML = div;
                    }
                }
                var textureUrl = this.baseUrl + responseXML.getElementsByTagName("page")[0].getAttribute("file");
                var image = new PIXI.ImageLoader(textureUrl, this.crossorigin);
                this.texture = image.texture.baseTexture;
                var data = {};
                var info = responseXML.getElementsByTagName("info")[0];
                var common = responseXML.getElementsByTagName("common")[0];
                data.font = info.getAttribute("face");
                data.size = parseInt(info.getAttribute("size"), 10);
                data.lineHeight = parseInt(common.getAttribute("lineHeight"), 10);
                data.chars = {};
                var letters = responseXML.getElementsByTagName("char");
                for (var i = 0; i < letters.length; i++) {
                    var charCode = parseInt(letters[i].getAttribute("id"), 10);
                    var textureRect = new PIXI.Rectangle(parseInt(letters[i].getAttribute("x"), 10), parseInt(letters[i].getAttribute("y"), 10), parseInt(letters[i].getAttribute("width"), 10), parseInt(letters[i].getAttribute("height"), 10));
                    data.chars[charCode] = {
                        xOffset: parseInt(letters[i].getAttribute("xoffset"), 10),
                        yOffset: parseInt(letters[i].getAttribute("yoffset"), 10),
                        xAdvance: parseInt(letters[i].getAttribute("xadvance"), 10),
                        kerning: {},
                        texture: PIXI.TextureCache[charCode] = new PIXI.Texture(this.texture, textureRect)
                    };
                }
                var kernings = responseXML.getElementsByTagName("kerning");
                for (i = 0; i < kernings.length; i++) {
                    var first = parseInt(kernings[i].getAttribute("first"), 10);
                    var second = parseInt(kernings[i].getAttribute("second"), 10);
                    var amount = parseInt(kernings[i].getAttribute("amount"), 10);
                    data.chars[second].kerning[first] = amount;
                }
                PIXI.BitmapText.fonts[data.font] = data;
                var scope = this;
                image.addEventListener("loaded", function() {
                    scope.onLoaded();
                });
                image.load();
            }
        }
    };
    PIXI.BitmapFontLoader.prototype.onLoaded = function() {
        this.dispatchEvent({
            type: "loaded",
            content: this
        });
    };
    PIXI.SpineLoader = function(url, crossorigin) {
        PIXI.EventTarget.call(this);
        this.url = url;
        this.crossorigin = crossorigin;
        this.loaded = false;
    };
    PIXI.SpineLoader.prototype.constructor = PIXI.SpineLoader;
    PIXI.SpineLoader.prototype.load = function() {
        var scope = this;
        var jsonLoader = new PIXI.JsonLoader(this.url, this.crossorigin);
        jsonLoader.addEventListener("loaded", function(event) {
            scope.json = event.content.json;
            scope.onLoaded();
        });
        jsonLoader.load();
    };
    PIXI.SpineLoader.prototype.onLoaded = function() {
        this.loaded = true;
        this.dispatchEvent({
            type: "loaded",
            content: this
        });
    };
    PIXI.AbstractFilter = function(fragmentSrc, uniforms) {
        this.passes = [ this ];
        this.shaders = [];
        this.dirty = true;
        this.padding = 0;
        this.uniforms = uniforms || {};
        this.fragmentSrc = fragmentSrc || [];
    };
    PIXI.AlphaMaskFilter = function(texture) {
        PIXI.AbstractFilter.call(this);
        this.passes = [ this ];
        texture.baseTexture._powerOf2 = true;
        this.uniforms = {
            mask: {
                type: "sampler2D",
                value: texture
            },
            mapDimensions: {
                type: "2f",
                value: {
                    x: 1,
                    y: 5112
                }
            },
            dimensions: {
                type: "4fv",
                value: [ 0, 0, 0, 0 ]
            }
        };
        if (texture.baseTexture.hasLoaded) {
            this.uniforms.mask.value.x = texture.width;
            this.uniforms.mask.value.y = texture.height;
        } else {
            this.boundLoadedFunction = this.onTextureLoaded.bind(this);
            texture.baseTexture.on("loaded", this.boundLoadedFunction);
        }
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D mask;", "uniform sampler2D uSampler;", "uniform vec2 offset;", "uniform vec4 dimensions;", "uniform vec2 mapDimensions;", "void main(void) {", "   vec2 mapCords = vTextureCoord.xy;", "   mapCords += (dimensions.zw + offset)/ dimensions.xy ;", "   mapCords.y *= -1.0;", "   mapCords.y += 1.0;", "   mapCords *= dimensions.xy / mapDimensions;", "   vec4 original =  texture2D(uSampler, vTextureCoord);", "   float maskAlpha =  texture2D(mask, mapCords).r;", "   original *= maskAlpha;", "   gl_FragColor =  original;", "}" ];
    };
    PIXI.AlphaMaskFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    PIXI.AlphaMaskFilter.prototype.constructor = PIXI.AlphaMaskFilter;
    PIXI.AlphaMaskFilter.prototype.onTextureLoaded = function() {
        this.uniforms.mapDimensions.value.x = this.uniforms.mask.value.width;
        this.uniforms.mapDimensions.value.y = this.uniforms.mask.value.height;
        this.uniforms.mask.value.baseTexture.off("loaded", this.boundLoadedFunction);
    };
    Object.defineProperty(PIXI.AlphaMaskFilter.prototype, "map", {
        get: function() {
            return this.uniforms.mask.value;
        },
        set: function(value) {
            this.uniforms.mask.value = value;
        }
    });
    PIXI.ColorMatrixFilter = function() {
        PIXI.AbstractFilter.call(this);
        this.passes = [ this ];
        this.uniforms = {
            matrix: {
                type: "mat4",
                value: [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]
            }
        };
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float invert;", "uniform mat4 matrix;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord) * matrix;", "}" ];
    };
    PIXI.ColorMatrixFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    PIXI.ColorMatrixFilter.prototype.constructor = PIXI.ColorMatrixFilter;
    Object.defineProperty(PIXI.ColorMatrixFilter.prototype, "matrix", {
        get: function() {
            return this.uniforms.matrix.value;
        },
        set: function(value) {
            this.uniforms.matrix.value = value;
        }
    });
    PIXI.GrayFilter = function() {
        PIXI.AbstractFilter.call(this);
        this.passes = [ this ];
        this.uniforms = {
            gray: {
                type: "1f",
                value: 1
            }
        };
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "uniform float gray;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord);", "   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), gray);", "}" ];
    };
    PIXI.GrayFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    PIXI.GrayFilter.prototype.constructor = PIXI.GrayFilter;
    Object.defineProperty(PIXI.GrayFilter.prototype, "gray", {
        get: function() {
            return this.uniforms.gray.value;
        },
        set: function(value) {
            this.uniforms.gray.value = value;
        }
    });
    PIXI.DisplacementFilter = function(texture) {
        PIXI.AbstractFilter.call(this);
        this.passes = [ this ];
        texture.baseTexture._powerOf2 = true;
        this.uniforms = {
            displacementMap: {
                type: "sampler2D",
                value: texture
            },
            scale: {
                type: "2f",
                value: {
                    x: 30,
                    y: 30
                }
            },
            offset: {
                type: "2f",
                value: {
                    x: 0,
                    y: 0
                }
            },
            mapDimensions: {
                type: "2f",
                value: {
                    x: 1,
                    y: 5112
                }
            },
            dimensions: {
                type: "4fv",
                value: [ 0, 0, 0, 0 ]
            }
        };
        if (texture.baseTexture.hasLoaded) {
            this.uniforms.mapDimensions.value.x = texture.width;
            this.uniforms.mapDimensions.value.y = texture.height;
        } else {
            this.boundLoadedFunction = this.onTextureLoaded.bind(this);
            texture.baseTexture.on("loaded", this.boundLoadedFunction);
        }
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D displacementMap;", "uniform sampler2D uSampler;", "uniform vec2 scale;", "uniform vec2 offset;", "uniform vec4 dimensions;", "uniform vec2 mapDimensions;", "void main(void) {", "   vec2 mapCords = vTextureCoord.xy;", "   mapCords += (dimensions.zw + offset)/ dimensions.xy ;", "   mapCords.y *= -1.0;", "   mapCords.y += 1.0;", "   vec2 matSample = texture2D(displacementMap, mapCords).xy;", "   matSample -= 0.5;", "   matSample *= scale;", "   matSample /= mapDimensions;", "   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + matSample.x, vTextureCoord.y + matSample.y));", "   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb, 1.0);", "   vec2 cord = vTextureCoord;", "}" ];
    };
    PIXI.DisplacementFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    PIXI.DisplacementFilter.prototype.constructor = PIXI.DisplacementFilter;
    PIXI.DisplacementFilter.prototype.onTextureLoaded = function() {
        this.uniforms.mapDimensions.value.x = this.uniforms.displacementMap.value.width;
        this.uniforms.mapDimensions.value.y = this.uniforms.displacementMap.value.height;
        this.uniforms.displacementMap.value.baseTexture.off("loaded", this.boundLoadedFunction);
    };
    Object.defineProperty(PIXI.DisplacementFilter.prototype, "map", {
        get: function() {
            return this.uniforms.displacementMap.value;
        },
        set: function(value) {
            this.uniforms.displacementMap.value = value;
        }
    });
    Object.defineProperty(PIXI.DisplacementFilter.prototype, "scale", {
        get: function() {
            return this.uniforms.scale.value;
        },
        set: function(value) {
            this.uniforms.scale.value = value;
        }
    });
    Object.defineProperty(PIXI.DisplacementFilter.prototype, "offset", {
        get: function() {
            return this.uniforms.offset.value;
        },
        set: function(value) {
            this.uniforms.offset.value = value;
        }
    });
    PIXI.PixelateFilter = function() {
        PIXI.AbstractFilter.call(this);
        this.passes = [ this ];
        this.uniforms = {
            invert: {
                type: "1f",
                value: 0
            },
            dimensions: {
                type: "4fv",
                value: new Float32Array([ 1e4, 100, 10, 10 ])
            },
            pixelSize: {
                type: "2f",
                value: {
                    x: 10,
                    y: 10
                }
            }
        };
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec2 testDim;", "uniform vec4 dimensions;", "uniform vec2 pixelSize;", "uniform sampler2D uSampler;", "void main(void) {", "   vec2 coord = vTextureCoord;", "   vec2 size = dimensions.xy/pixelSize;", "   vec2 color = floor( ( vTextureCoord * size ) ) / size + pixelSize/dimensions.xy * 0.5;", "   gl_FragColor = texture2D(uSampler, color);", "}" ];
    };
    PIXI.PixelateFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    PIXI.PixelateFilter.prototype.constructor = PIXI.PixelateFilter;
    Object.defineProperty(PIXI.PixelateFilter.prototype, "size", {
        get: function() {
            return this.uniforms.pixelSize.value;
        },
        set: function(value) {
            this.dirty = true;
            this.uniforms.pixelSize.value = value;
        }
    });
    PIXI.BlurXFilter = function() {
        PIXI.AbstractFilter.call(this);
        this.passes = [ this ];
        this.uniforms = {
            blur: {
                type: "1f",
                value: 1 / 512
            }
        };
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float blur;", "uniform sampler2D uSampler;", "void main(void) {", "   vec4 sum = vec4(0.0);", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 4.0*blur, vTextureCoord.y)) * 0.05;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 3.0*blur, vTextureCoord.y)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - 2.0*blur, vTextureCoord.y)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x - blur, vTextureCoord.y)) * 0.15;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + blur, vTextureCoord.y)) * 0.15;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 2.0*blur, vTextureCoord.y)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 3.0*blur, vTextureCoord.y)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x + 4.0*blur, vTextureCoord.y)) * 0.05;", "   gl_FragColor = sum;", "}" ];
    };
    PIXI.BlurXFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    PIXI.BlurXFilter.prototype.constructor = PIXI.BlurXFilter;
    Object.defineProperty(PIXI.BlurXFilter.prototype, "blur", {
        get: function() {
            return this.uniforms.blur.value / (1 / 7e3);
        },
        set: function(value) {
            this.dirty = true;
            this.uniforms.blur.value = 1 / 7e3 * value;
        }
    });
    PIXI.BlurYFilter = function() {
        PIXI.AbstractFilter.call(this);
        this.passes = [ this ];
        this.uniforms = {
            blur: {
                type: "1f",
                value: 1 / 512
            }
        };
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float blur;", "uniform sampler2D uSampler;", "void main(void) {", "   vec4 sum = vec4(0.0);", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 4.0*blur)) * 0.05;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 3.0*blur)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 2.0*blur)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - blur)) * 0.15;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + blur)) * 0.15;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 2.0*blur)) * 0.12;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 3.0*blur)) * 0.09;", "   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 4.0*blur)) * 0.05;", "   gl_FragColor = sum;", "}" ];
    };
    PIXI.BlurYFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    PIXI.BlurYFilter.prototype.constructor = PIXI.BlurYFilter;
    Object.defineProperty(PIXI.BlurYFilter.prototype, "blur", {
        get: function() {
            return this.uniforms.blur.value / (1 / 7e3);
        },
        set: function(value) {
            this.uniforms.blur.value = 1 / 7e3 * value;
        }
    });
    PIXI.BlurFilter = function() {
        this.blurXFilter = new PIXI.BlurXFilter();
        this.blurYFilter = new PIXI.BlurYFilter();
        this.passes = [ this.blurXFilter, this.blurYFilter ];
    };
    Object.defineProperty(PIXI.BlurFilter.prototype, "blur", {
        get: function() {
            return this.blurXFilter.blur;
        },
        set: function(value) {
            this.blurXFilter.blur = this.blurYFilter.blur = value;
        }
    });
    Object.defineProperty(PIXI.BlurFilter.prototype, "blurX", {
        get: function() {
            return this.blurXFilter.blur;
        },
        set: function(value) {
            this.blurXFilter.blur = value;
        }
    });
    Object.defineProperty(PIXI.BlurFilter.prototype, "blurY", {
        get: function() {
            return this.blurYFilter.blur;
        },
        set: function(value) {
            this.blurYFilter.blur = value;
        }
    });
    PIXI.InvertFilter = function() {
        PIXI.AbstractFilter.call(this);
        this.passes = [ this ];
        this.uniforms = {
            invert: {
                type: "1f",
                value: 1
            }
        };
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float invert;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord);", "   gl_FragColor.rgb = mix( (vec3(1)-gl_FragColor.rgb) * gl_FragColor.a, gl_FragColor.rgb, 1.0 - invert);", "}" ];
    };
    PIXI.InvertFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    PIXI.InvertFilter.prototype.constructor = PIXI.InvertFilter;
    Object.defineProperty(PIXI.InvertFilter.prototype, "invert", {
        get: function() {
            return this.uniforms.invert.value;
        },
        set: function(value) {
            this.uniforms.invert.value = value;
        }
    });
    PIXI.SepiaFilter = function() {
        PIXI.AbstractFilter.call(this);
        this.passes = [ this ];
        this.uniforms = {
            sepia: {
                type: "1f",
                value: 1
            }
        };
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float sepia;", "uniform sampler2D uSampler;", "const mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);", "void main(void) {", "   gl_FragColor = texture2D(uSampler, vTextureCoord);", "   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, sepia);", "}" ];
    };
    PIXI.SepiaFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    PIXI.SepiaFilter.prototype.constructor = PIXI.SepiaFilter;
    Object.defineProperty(PIXI.SepiaFilter.prototype, "sepia", {
        get: function() {
            return this.uniforms.sepia.value;
        },
        set: function(value) {
            this.uniforms.sepia.value = value;
        }
    });
    PIXI.TwistFilter = function() {
        PIXI.AbstractFilter.call(this);
        this.passes = [ this ];
        this.uniforms = {
            radius: {
                type: "1f",
                value: .5
            },
            angle: {
                type: "1f",
                value: 5
            },
            offset: {
                type: "2f",
                value: {
                    x: .5,
                    y: .5
                }
            }
        };
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec4 dimensions;", "uniform sampler2D uSampler;", "uniform float radius;", "uniform float angle;", "uniform vec2 offset;", "void main(void) {", "   vec2 coord = vTextureCoord - offset;", "   float distance = length(coord);", "   if (distance < radius) {", "       float ratio = (radius - distance) / radius;", "       float angleMod = ratio * ratio * angle;", "       float s = sin(angleMod);", "       float c = cos(angleMod);", "       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);", "   }", "   gl_FragColor = texture2D(uSampler, coord+offset);", "}" ];
    };
    PIXI.TwistFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    PIXI.TwistFilter.prototype.constructor = PIXI.TwistFilter;
    Object.defineProperty(PIXI.TwistFilter.prototype, "offset", {
        get: function() {
            return this.uniforms.offset.value;
        },
        set: function(value) {
            this.dirty = true;
            this.uniforms.offset.value = value;
        }
    });
    Object.defineProperty(PIXI.TwistFilter.prototype, "radius", {
        get: function() {
            return this.uniforms.radius.value;
        },
        set: function(value) {
            this.dirty = true;
            this.uniforms.radius.value = value;
        }
    });
    Object.defineProperty(PIXI.TwistFilter.prototype, "angle", {
        get: function() {
            return this.uniforms.angle.value;
        },
        set: function(value) {
            this.dirty = true;
            this.uniforms.angle.value = value;
        }
    });
    PIXI.ColorStepFilter = function() {
        PIXI.AbstractFilter.call(this);
        this.passes = [ this ];
        this.uniforms = {
            step: {
                type: "1f",
                value: 5
            }
        };
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform sampler2D uSampler;", "uniform float step;", "void main(void) {", "   vec4 color = texture2D(uSampler, vTextureCoord);", "   color = floor(color * step) / step;", "   gl_FragColor = color;", "}" ];
    };
    PIXI.ColorStepFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    PIXI.ColorStepFilter.prototype.constructor = PIXI.ColorStepFilter;
    Object.defineProperty(PIXI.ColorStepFilter.prototype, "step", {
        get: function() {
            return this.uniforms.step.value;
        },
        set: function(value) {
            this.uniforms.step.value = value;
        }
    });
    PIXI.DotScreenFilter = function() {
        PIXI.AbstractFilter.call(this);
        this.passes = [ this ];
        this.uniforms = {
            scale: {
                type: "1f",
                value: 1
            },
            angle: {
                type: "1f",
                value: 5
            },
            dimensions: {
                type: "4fv",
                value: [ 0, 0, 0, 0 ]
            }
        };
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec4 dimensions;", "uniform sampler2D uSampler;", "uniform float angle;", "uniform float scale;", "float pattern() {", "   float s = sin(angle), c = cos(angle);", "   vec2 tex = vTextureCoord * dimensions.xy;", "   vec2 point = vec2(", "       c * tex.x - s * tex.y,", "       s * tex.x + c * tex.y", "   ) * scale;", "   return (sin(point.x) * sin(point.y)) * 4.0;", "}", "void main() {", "   vec4 color = texture2D(uSampler, vTextureCoord);", "   float average = (color.r + color.g + color.b) / 3.0;", "   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);", "}" ];
    };
    PIXI.DotScreenFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    PIXI.DotScreenFilter.prototype.constructor = PIXI.DotScreenFilter;
    Object.defineProperty(PIXI.DotScreenFilter.prototype, "scale", {
        get: function() {
            return this.uniforms.scale.value;
        },
        set: function(value) {
            this.dirty = true;
            this.uniforms.scale.value = value;
        }
    });
    Object.defineProperty(PIXI.DotScreenFilter.prototype, "angle", {
        get: function() {
            return this.uniforms.angle.value;
        },
        set: function(value) {
            this.dirty = true;
            this.uniforms.angle.value = value;
        }
    });
    PIXI.CrossHatchFilter = function() {
        PIXI.AbstractFilter.call(this);
        this.passes = [ this ];
        this.uniforms = {
            blur: {
                type: "1f",
                value: 1 / 512
            }
        };
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform float blur;", "uniform sampler2D uSampler;", "void main(void) {", "    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);", "    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);", "    if (lum < 1.00) {", "        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0) {", "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "    if (lum < 0.75) {", "        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0) {", "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "    if (lum < 0.50) {", "        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0) {", "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "    if (lum < 0.3) {", "        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0) {", "            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);", "        }", "    }", "}" ];
    };
    PIXI.CrossHatchFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    PIXI.CrossHatchFilter.prototype.constructor = PIXI.BlurYFilter;
    Object.defineProperty(PIXI.CrossHatchFilter.prototype, "blur", {
        get: function() {
            return this.uniforms.blur.value / (1 / 7e3);
        },
        set: function(value) {
            this.uniforms.blur.value = 1 / 7e3 * value;
        }
    });
    PIXI.RGBSplitFilter = function() {
        PIXI.AbstractFilter.call(this);
        this.passes = [ this ];
        this.uniforms = {
            red: {
                type: "2f",
                value: {
                    x: 20,
                    y: 20
                }
            },
            green: {
                type: "2f",
                value: {
                    x: -20,
                    y: 20
                }
            },
            blue: {
                type: "2f",
                value: {
                    x: 20,
                    y: -20
                }
            },
            dimensions: {
                type: "4fv",
                value: [ 0, 0, 0, 0 ]
            }
        };
        this.fragmentSrc = [ "precision mediump float;", "varying vec2 vTextureCoord;", "varying vec4 vColor;", "uniform vec2 red;", "uniform vec2 green;", "uniform vec2 blue;", "uniform vec4 dimensions;", "uniform sampler2D uSampler;", "void main(void) {", "   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/dimensions.xy).r;", "   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/dimensions.xy).g;", "   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/dimensions.xy).b;", "   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;", "}" ];
    };
    PIXI.RGBSplitFilter.prototype = Object.create(PIXI.AbstractFilter.prototype);
    PIXI.RGBSplitFilter.prototype.constructor = PIXI.RGBSplitFilter;
    Object.defineProperty(PIXI.RGBSplitFilter.prototype, "angle", {
        get: function() {
            return this.uniforms.blur.value / (1 / 7e3);
        },
        set: function(value) {
            this.uniforms.blur.value = 1 / 7e3 * value;
        }
    });
    if (typeof exports !== "undefined") {
        if (typeof module !== "undefined" && module.exports) {
            exports = module.exports = PIXI;
        }
        exports.PIXI = PIXI;
    } else if (typeof define !== "undefined" && define.amd) {
        define(PIXI);
    } else {
        root.PIXI = PIXI;
    }
}).call(this);

(function() {
    if (!PIXI) {
        console.log("PIXI.js is not loaded!");
        return;
    }
    PIXI.Point = function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    };
    PIXI.Point.prototype.clone = function() {
        return new PIXI.Point(this.x, this.y);
    };
    PIXI.Point.prototype.constructor = PIXI.Point;
    PIXI.Point.prototype.add = function(v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    };
    PIXI.Point.prototype.sub = function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    };
    PIXI.Point.prototype.multiplyScalar = function(s) {
        this.x *= s;
        this.y *= s;
        return this;
    };
    PIXI.Point.prototype.divideScalar = function(s) {
        if (s === 0) {
            this.x = 0;
            this.y = 0;
        } else {
            var invScalar = 1 / s;
            this.x *= invScalar;
            this.y *= invScalar;
        }
        return this;
    };
    PIXI.Point.prototype.dot = function(v) {
        return this.x * v.x + this.y * v.y;
    };
    PIXI.Point.prototype.length = function(v) {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    PIXI.Point.prototype.lengthSq = function() {
        return this.x * this.x + this.y * this.y;
    };
    PIXI.Point.prototype.normalize = function() {
        return this.divideScalar(this.length());
    };
    PIXI.Point.prototype.distanceTo = function(v) {
        return Math.sqrt(this.distanceToSq(v));
    };
    PIXI.Point.prototype.distanceToSq = function(v) {
        var dx = this.x - v.x, dy = this.y - v.y;
        return dx * dx + dy * dy;
    };
    PIXI.Point.prototype.set = function(x, y) {
        this.x = x || 0;
        this.y = y || (y !== 0 ? this.x : 0);
    };
    PIXI.Point.prototype.setX = function(x) {
        this.x = x;
        return this;
    };
    PIXI.Point.prototype.setY = function(y) {
        this.y = y;
        return this;
    };
    PIXI.Point.prototype.setLength = function(l) {
        var oldLength = this.length();
        if (oldLength !== 0 && l !== oldLength) {
            this.multiplyScalar(l / oldLength);
        }
        return this;
    };
    PIXI.Point.prototype.invert = function(v) {
        this.x *= -1;
        this.y *= -1;
        return this;
    };
    PIXI.Point.prototype.lerp = function(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        return this;
    };
    PIXI.Point.prototype.rad = function() {
        return Math.atan2(this.x, this.y);
    };
    PIXI.Point.prototype.deg = function() {
        return this.rad() * 180 / Math.PI;
    };
    PIXI.Point.prototype.equals = function(v) {
        return this.x === v.x && this.y === v.y;
    };
    PIXI.Point.prototype.rotate = function(theta) {
        var xtemp = this.x;
        this.x = this.x * Math.cos(theta) - this.y * Math.sin(theta);
        this.y = xtemp * Math.sin(theta) + this.y * Math.cos(theta);
        return this;
    };
})();

if (Date.now === undefined) {
    Date.now = function() {
        return new Date().valueOf();
    };
}

var TWEEN = TWEEN || function() {
    var _tweens = [];
    return {
        REVISION: "13",
        getAll: function() {
            return _tweens;
        },
        removeAll: function() {
            _tweens = [];
        },
        add: function(tween) {
            _tweens.push(tween);
        },
        remove: function(tween) {
            var i = _tweens.indexOf(tween);
            if (i !== -1) {
                _tweens.splice(i, 1);
            }
        },
        update: function(time) {
            if (_tweens.length === 0) return false;
            var i = 0;
            time = time !== undefined ? time : typeof window !== "undefined" && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now();
            while (i < _tweens.length) {
                if (_tweens[i].update(time)) {
                    i++;
                } else {
                    _tweens.splice(i, 1);
                }
            }
            return true;
        }
    };
}();

TWEEN.Tween = function(object) {
    var _object = object;
    var _valuesStart = {};
    var _valuesEnd = {};
    var _valuesStartRepeat = {};
    var _duration = 1e3;
    var _repeat = 0;
    var _yoyo = false;
    var _isPlaying = false;
    var _reversed = false;
    var _delayTime = 0;
    var _startTime = null;
    var _easingFunction = TWEEN.Easing.Linear.None;
    var _interpolationFunction = TWEEN.Interpolation.Linear;
    var _chainedTweens = [];
    var _onStartCallback = null;
    var _onStartCallbackFired = false;
    var _onUpdateCallback = null;
    var _onCompleteCallback = null;
    var _onStopCallback = null;
    for (var field in object) {
        _valuesStart[field] = parseFloat(object[field], 10);
    }
    this.to = function(properties, duration) {
        if (duration !== undefined) {
            _duration = duration;
        }
        _valuesEnd = properties;
        return this;
    };
    this.start = function(time) {
        TWEEN.add(this);
        _isPlaying = true;
        _onStartCallbackFired = false;
        _startTime = time !== undefined ? time : typeof window !== "undefined" && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now();
        _startTime += _delayTime;
        for (var property in _valuesEnd) {
            if (_valuesEnd[property] instanceof Array) {
                if (_valuesEnd[property].length === 0) {
                    continue;
                }
                _valuesEnd[property] = [ _object[property] ].concat(_valuesEnd[property]);
            }
            _valuesStart[property] = _object[property];
            if (_valuesStart[property] instanceof Array === false) {
                _valuesStart[property] *= 1;
            }
            _valuesStartRepeat[property] = _valuesStart[property] || 0;
        }
        return this;
    };
    this.stop = function() {
        if (!_isPlaying) {
            return this;
        }
        TWEEN.remove(this);
        _isPlaying = false;
        if (_onStopCallback !== null) {
            _onStopCallback.call(_object);
        }
        this.stopChainedTweens();
        return this;
    };
    this.stopChainedTweens = function() {
        for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
            _chainedTweens[i].stop();
        }
    };
    this.delay = function(amount) {
        _delayTime = amount;
        return this;
    };
    this.repeat = function(times) {
        _repeat = times;
        return this;
    };
    this.yoyo = function(yoyo) {
        _yoyo = yoyo;
        return this;
    };
    this.easing = function(easing) {
        _easingFunction = easing;
        return this;
    };
    this.interpolation = function(interpolation) {
        _interpolationFunction = interpolation;
        return this;
    };
    this.chain = function() {
        _chainedTweens = arguments;
        return this;
    };
    this.onStart = function(callback) {
        _onStartCallback = callback;
        return this;
    };
    this.onUpdate = function(callback) {
        _onUpdateCallback = callback;
        return this;
    };
    this.onComplete = function(callback) {
        _onCompleteCallback = callback;
        return this;
    };
    this.onStop = function(callback) {
        _onStopCallback = callback;
        return this;
    };
    this.update = function(time) {
        var property;
        if (time < _startTime) {
            return true;
        }
        if (_onStartCallbackFired === false) {
            if (_onStartCallback !== null) {
                _onStartCallback.call(_object);
            }
            _onStartCallbackFired = true;
        }
        var elapsed = (time - _startTime) / _duration;
        elapsed = elapsed > 1 ? 1 : elapsed;
        var value = _easingFunction(elapsed);
        for (property in _valuesEnd) {
            var start = _valuesStart[property] || 0;
            var end = _valuesEnd[property];
            if (end instanceof Array) {
                _object[property] = _interpolationFunction(end, value);
            } else {
                if (typeof end === "string") {
                    end = start + parseFloat(end, 10);
                }
                if (typeof end === "number") {
                    _object[property] = start + (end - start) * value;
                }
            }
        }
        if (_onUpdateCallback !== null) {
            _onUpdateCallback.call(_object, value);
        }
        if (elapsed == 1) {
            if (_repeat > 0) {
                if (isFinite(_repeat)) {
                    _repeat--;
                }
                for (property in _valuesStartRepeat) {
                    if (typeof _valuesEnd[property] === "string") {
                        _valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property], 10);
                    }
                    if (_yoyo) {
                        var tmp = _valuesStartRepeat[property];
                        _valuesStartRepeat[property] = _valuesEnd[property];
                        _valuesEnd[property] = tmp;
                    }
                    _valuesStart[property] = _valuesStartRepeat[property];
                }
                if (_yoyo) {
                    _reversed = !_reversed;
                }
                _startTime = time + _delayTime;
                return true;
            } else {
                if (_onCompleteCallback !== null) {
                    _onCompleteCallback.call(_object);
                }
                for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
                    _chainedTweens[i].start(time);
                }
                return false;
            }
        }
        return true;
    };
};

TWEEN.Easing = {
    Linear: {
        None: function(k) {
            return k;
        }
    },
    Quadratic: {
        In: function(k) {
            return k * k;
        },
        Out: function(k) {
            return k * (2 - k);
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return .5 * k * k;
            return -.5 * (--k * (k - 2) - 1);
        }
    },
    Cubic: {
        In: function(k) {
            return k * k * k;
        },
        Out: function(k) {
            return --k * k * k + 1;
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return .5 * k * k * k;
            return .5 * ((k -= 2) * k * k + 2);
        }
    },
    Quartic: {
        In: function(k) {
            return k * k * k * k;
        },
        Out: function(k) {
            return 1 - --k * k * k * k;
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return .5 * k * k * k * k;
            return -.5 * ((k -= 2) * k * k * k - 2);
        }
    },
    Quintic: {
        In: function(k) {
            return k * k * k * k * k;
        },
        Out: function(k) {
            return --k * k * k * k * k + 1;
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return .5 * k * k * k * k * k;
            return .5 * ((k -= 2) * k * k * k * k + 2);
        }
    },
    Sinusoidal: {
        In: function(k) {
            return 1 - Math.cos(k * Math.PI / 2);
        },
        Out: function(k) {
            return Math.sin(k * Math.PI / 2);
        },
        InOut: function(k) {
            return .5 * (1 - Math.cos(Math.PI * k));
        }
    },
    Exponential: {
        In: function(k) {
            return k === 0 ? 0 : Math.pow(1024, k - 1);
        },
        Out: function(k) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        },
        InOut: function(k) {
            if (k === 0) return 0;
            if (k === 1) return 1;
            if ((k *= 2) < 1) return .5 * Math.pow(1024, k - 1);
            return .5 * (-Math.pow(2, -10 * (k - 1)) + 2);
        }
    },
    Circular: {
        In: function(k) {
            return 1 - Math.sqrt(1 - k * k);
        },
        Out: function(k) {
            return Math.sqrt(1 - --k * k);
        },
        InOut: function(k) {
            if ((k *= 2) < 1) return -.5 * (Math.sqrt(1 - k * k) - 1);
            return .5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
        }
    },
    Elastic: {
        In: function(k) {
            var s, a = .1, p = .4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = p * Math.asin(1 / a) / (2 * Math.PI);
            return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
        },
        Out: function(k) {
            var s, a = .1, p = .4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = p * Math.asin(1 / a) / (2 * Math.PI);
            return a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1;
        },
        InOut: function(k) {
            var s, a = .1, p = .4;
            if (k === 0) return 0;
            if (k === 1) return 1;
            if (!a || a < 1) {
                a = 1;
                s = p / 4;
            } else s = p * Math.asin(1 / a) / (2 * Math.PI);
            if ((k *= 2) < 1) return -.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
            return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * .5 + 1;
        }
    },
    Back: {
        In: function(k) {
            var s = 1.70158;
            return k * k * ((s + 1) * k - s);
        },
        Out: function(k) {
            var s = 1.70158;
            return --k * k * ((s + 1) * k + s) + 1;
        },
        InOut: function(k) {
            var s = 1.70158 * 1.525;
            if ((k *= 2) < 1) return .5 * (k * k * ((s + 1) * k - s));
            return .5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
        }
    },
    Bounce: {
        In: function(k) {
            return 1 - TWEEN.Easing.Bounce.Out(1 - k);
        },
        Out: function(k) {
            if (k < 1 / 2.75) {
                return 7.5625 * k * k;
            } else if (k < 2 / 2.75) {
                return 7.5625 * (k -= 1.5 / 2.75) * k + .75;
            } else if (k < 2.5 / 2.75) {
                return 7.5625 * (k -= 2.25 / 2.75) * k + .9375;
            } else {
                return 7.5625 * (k -= 2.625 / 2.75) * k + .984375;
            }
        },
        InOut: function(k) {
            if (k < .5) return TWEEN.Easing.Bounce.In(k * 2) * .5;
            return TWEEN.Easing.Bounce.Out(k * 2 - 1) * .5 + .5;
        }
    }
};

TWEEN.Interpolation = {
    Linear: function(v, k) {
        var m = v.length - 1, f = m * k, i = Math.floor(f), fn = TWEEN.Interpolation.Utils.Linear;
        if (k < 0) return fn(v[0], v[1], f);
        if (k > 1) return fn(v[m], v[m - 1], m - f);
        return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
    },
    Bezier: function(v, k) {
        var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;
        for (i = 0; i <= n; i++) {
            b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
        }
        return b;
    },
    CatmullRom: function(v, k) {
        var m = v.length - 1, f = m * k, i = Math.floor(f), fn = TWEEN.Interpolation.Utils.CatmullRom;
        if (v[0] === v[m]) {
            if (k < 0) i = Math.floor(f = m * (1 + k));
            return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
        } else {
            if (k < 0) return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
            if (k > 1) return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
            return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
        }
    },
    Utils: {
        Linear: function(p0, p1, t) {
            return (p1 - p0) * t + p0;
        },
        Bernstein: function(n, i) {
            var fc = TWEEN.Interpolation.Utils.Factorial;
            return fc(n) / fc(i) / fc(n - i);
        },
        Factorial: function() {
            var a = [ 1 ];
            return function(n) {
                var s = 1, i;
                if (a[n]) return a[n];
                for (i = n; i > 1; i--) s *= i;
                return a[n] = s;
            };
        }(),
        CatmullRom: function(p0, p1, p2, p3, t) {
            var v0 = (p2 - p0) * .5, v1 = (p3 - p1) * .5, t2 = t * t, t3 = t * t2;
            return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
        }
    }
};

(function(window, document, undefined) {
    var j = !0, l = null, m = !1;
    function n(a) {
        return function() {
            return this[a];
        };
    }
    var q = this;
    function r(a, b) {
        var c = a.split("."), d = q;
        !(c[0] in d) && d.execScript && d.execScript("var " + c[0]);
        for (var e; c.length && (e = c.shift()); ) !c.length && void 0 !== b ? d[e] = b : d = d[e] ? d[e] : d[e] = {};
    }
    function aa(a, b, c) {
        return a.call.apply(a.bind, arguments);
    }
    function ba(a, b, c) {
        if (!a) throw Error();
        if (2 < arguments.length) {
            var d = Array.prototype.slice.call(arguments, 2);
            return function() {
                var c = Array.prototype.slice.call(arguments);
                Array.prototype.unshift.apply(c, d);
                return a.apply(b, c);
            };
        }
        return function() {
            return a.apply(b, arguments);
        };
    }
    function t(a, b, c) {
        t = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? aa : ba;
        return t.apply(l, arguments);
    }
    var u = Date.now || function() {
        return +new Date();
    };
    function v(a, b) {
        this.G = a;
        this.v = b || a;
        this.z = this.v.document;
    }
    v.prototype.createElement = function(a, b, c) {
        a = this.z.createElement(a);
        if (b) for (var d in b) b.hasOwnProperty(d) && ("style" == d ? a.style.cssText = b[d] : a.setAttribute(d, b[d]));
        c && a.appendChild(this.z.createTextNode(c));
        return a;
    };
    function w(a, b, c) {
        a = a.z.getElementsByTagName(b)[0];
        a || (a = document.documentElement);
        a && a.lastChild && a.insertBefore(c, a.lastChild);
    }
    function x(a, b, c) {
        b = b || [];
        c = c || [];
        for (var d = a.className.split(/\s+/), e = 0; e < b.length; e += 1) {
            for (var g = m, f = 0; f < d.length; f += 1) if (b[e] === d[f]) {
                g = j;
                break;
            }
            g || d.push(b[e]);
        }
        b = [];
        for (e = 0; e < d.length; e += 1) {
            g = m;
            for (f = 0; f < c.length; f += 1) if (d[e] === c[f]) {
                g = j;
                break;
            }
            g || b.push(d[e]);
        }
        a.className = b.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "");
    }
    function ca(a, b) {
        for (var c = a.className.split(/\s+/), d = 0, e = c.length; d < e; d++) if (c[d] == b) return j;
        return m;
    }
    function y(a) {
        var b = a.v.location.protocol;
        "about:" == b && (b = a.G.location.protocol);
        return "https:" == b ? "https:" : "http:";
    }
    function da(a, b) {
        var c = a.createElement("link", {
            rel: "stylesheet",
            href: b
        }), d = m;
        c.onload = function() {
            d || (d = j);
        };
        c.onerror = function() {
            d || (d = j);
        };
        w(a, "head", c);
    }
    function z(a, b, c, d) {
        var e = a.z.getElementsByTagName("head")[0];
        if (e) {
            var g = a.createElement("script", {
                src: b
            }), f = m;
            g.onload = g.onreadystatechange = function() {
                if (!f && (!this.readyState || "loaded" == this.readyState || "complete" == this.readyState)) f = j, 
                c && c(l), g.onload = g.onreadystatechange = l, "HEAD" == g.parentNode.tagName && e.removeChild(g);
            };
            e.appendChild(g);
            window.setTimeout(function() {
                f || (f = j, c && c(Error("Script load timeout")));
            }, d || 5e3);
            return g;
        }
        return l;
    }
    function A(a, b, c) {
        this.M = a;
        this.U = b;
        this.Aa = c;
    }
    r("webfont.BrowserInfo", A);
    A.prototype.pa = n("M");
    A.prototype.hasWebFontSupport = A.prototype.pa;
    A.prototype.qa = n("U");
    A.prototype.hasWebKitFallbackBug = A.prototype.qa;
    A.prototype.ra = n("Aa");
    A.prototype.hasWebKitMetricsBug = A.prototype.ra;
    function B(a, b, c, d) {
        this.d = a != l ? a : l;
        this.o = b != l ? b : l;
        this.aa = c != l ? c : l;
        this.f = d != l ? d : l;
    }
    var ea = /^([0-9]+)(?:[\._-]([0-9]+))?(?:[\._-]([0-9]+))?(?:[\._+-]?(.*))?$/;
    B.prototype.toString = function() {
        return [ this.d, this.o || "", this.aa || "", this.f || "" ].join("");
    };
    function C(a) {
        a = ea.exec(a);
        var b = l, c = l, d = l, e = l;
        a && (a[1] !== l && a[1] && (b = parseInt(a[1], 10)), a[2] !== l && a[2] && (c = parseInt(a[2], 10)), 
        a[3] !== l && a[3] && (d = parseInt(a[3], 10)), a[4] !== l && a[4] && (e = /^[0-9]+$/.test(a[4]) ? parseInt(a[4], 10) : a[4]));
        return new B(b, c, d, e);
    }
    function D(a, b, c, d, e, g, f, h, k, p, s) {
        this.K = a;
        this.Ga = b;
        this.za = c;
        this.fa = d;
        this.Ea = e;
        this.ea = g;
        this.wa = f;
        this.Fa = h;
        this.va = k;
        this.da = p;
        this.j = s;
    }
    r("webfont.UserAgent", D);
    D.prototype.getName = n("K");
    D.prototype.getName = D.prototype.getName;
    D.prototype.oa = n("za");
    D.prototype.getVersion = D.prototype.oa;
    D.prototype.ka = n("fa");
    D.prototype.getEngine = D.prototype.ka;
    D.prototype.la = n("ea");
    D.prototype.getEngineVersion = D.prototype.la;
    D.prototype.ma = n("wa");
    D.prototype.getPlatform = D.prototype.ma;
    D.prototype.na = n("va");
    D.prototype.getPlatformVersion = D.prototype.na;
    D.prototype.ja = n("da");
    D.prototype.getDocumentMode = D.prototype.ja;
    D.prototype.ia = n("j");
    D.prototype.getBrowserInfo = D.prototype.ia;
    function E(a, b) {
        this.a = a;
        this.I = b;
    }
    var fa = new D("Unknown", new B(), "Unknown", "Unknown", new B(), "Unknown", "Unknown", new B(), "Unknown", void 0, new A(m, m, m));
    E.prototype.parse = function() {
        var a;
        if (-1 != this.a.indexOf("MSIE") || -1 != this.a.indexOf("Trident/")) {
            a = F(this);
            var b = G(this), c = C(b), d = l, e = l, g = l, f = l, h = H(this.a, /Trident\/([\d\w\.]+)/, 1), k = I(this.I), d = -1 != this.a.indexOf("MSIE") ? H(this.a, /MSIE ([\d\w\.]+)/, 1) : H(this.a, /rv:([\d\w\.]+)/, 1), e = C(d);
            "" != h ? (g = "Trident", f = C(h)) : (g = "Unknown", f = new B(), h = "Unknown");
            a = new D("MSIE", e, d, g, f, h, a, c, b, k, new A("Windows" == a && 6 <= e.d || "Windows Phone" == a && 8 <= c.d, m, m));
        } else if (-1 != this.a.indexOf("Opera")) a: if (a = "Unknown", b = H(this.a, /Presto\/([\d\w\.]+)/, 1), 
        c = C(b), d = G(this), e = C(d), g = I(this.I), c.d !== l ? a = "Presto" : (-1 != this.a.indexOf("Gecko") && (a = "Gecko"), 
        b = H(this.a, /rv:([^\)]+)/, 1), c = C(b)), -1 != this.a.indexOf("Opera Mini/")) f = H(this.a, /Opera Mini\/([\d\.]+)/, 1), 
        h = C(f), a = new D("OperaMini", h, f, a, c, b, F(this), e, d, g, new A(m, m, m)); else {
            if (-1 != this.a.indexOf("Version/") && (f = H(this.a, /Version\/([\d\.]+)/, 1), 
            h = C(f), h.d !== l)) {
                a = new D("Opera", h, f, a, c, b, F(this), e, d, g, new A(10 <= h.d, m, m));
                break a;
            }
            f = H(this.a, /Opera[\/ ]([\d\.]+)/, 1);
            h = C(f);
            a = h.d !== l ? new D("Opera", h, f, a, c, b, F(this), e, d, g, new A(10 <= h.d, m, m)) : new D("Opera", new B(), "Unknown", a, c, b, F(this), e, d, g, new A(m, m, m));
        } else /OPR\/[\d.]+/.test(this.a) ? a = ga(this) : /AppleWeb(K|k)it/.test(this.a) ? a = ga(this) : -1 != this.a.indexOf("Gecko") ? (a = "Unknown", 
        b = new B(), c = "Unknown", d = G(this), e = C(d), g = m, -1 != this.a.indexOf("Firefox") ? (a = "Firefox", 
        c = H(this.a, /Firefox\/([\d\w\.]+)/, 1), b = C(c), g = 3 <= b.d && 5 <= b.o) : -1 != this.a.indexOf("Mozilla") && (a = "Mozilla"), 
        f = H(this.a, /rv:([^\)]+)/, 1), h = C(f), g || (g = 1 < h.d || 1 == h.d && 9 < h.o || 1 == h.d && 9 == h.o && 2 <= h.aa || f.match(/1\.9\.1b[123]/) != l || f.match(/1\.9\.1\.[\d\.]+/) != l), 
        a = new D(a, b, c, "Gecko", h, f, F(this), e, d, I(this.I), new A(g, m, m))) : a = fa;
        return a;
    };
    function F(a) {
        var b = H(a.a, /(iPod|iPad|iPhone|Android|Windows Phone|BB\d{2}|BlackBerry)/, 1);
        if ("" != b) return /BB\d{2}/.test(b) && (b = "BlackBerry"), b;
        a = H(a.a, /(Linux|Mac_PowerPC|Macintosh|Windows|CrOS)/, 1);
        return "" != a ? ("Mac_PowerPC" == a && (a = "Macintosh"), a) : "Unknown";
    }
    function G(a) {
        var b = H(a.a, /(OS X|Windows NT|Android) ([^;)]+)/, 2);
        if (b || (b = H(a.a, /Windows Phone( OS)? ([^;)]+)/, 2)) || (b = H(a.a, /(iPhone )?OS ([\d_]+)/, 2))) return b;
        if (b = H(a.a, /(?:Linux|CrOS) ([^;)]+)/, 1)) for (var b = b.split(/\s/), c = 0; c < b.length; c += 1) if (/^[\d\._]+$/.test(b[c])) return b[c];
        return (a = H(a.a, /(BB\d{2}|BlackBerry).*?Version\/([^\s]*)/, 2)) ? a : "Unknown";
    }
    function ga(a) {
        var b = F(a), c = G(a), d = C(c), e = H(a.a, /AppleWeb(?:K|k)it\/([\d\.\+]+)/, 1), g = C(e), f = "Unknown", h = new B(), k = "Unknown", p = m;
        /OPR\/[\d.]+/.test(a.a) ? f = "Opera" : -1 != a.a.indexOf("Chrome") || -1 != a.a.indexOf("CrMo") || -1 != a.a.indexOf("CriOS") ? f = "Chrome" : /Silk\/\d/.test(a.a) ? f = "Silk" : "BlackBerry" == b || "Android" == b ? f = "BuiltinBrowser" : -1 != a.a.indexOf("PhantomJS") ? f = "PhantomJS" : -1 != a.a.indexOf("Safari") ? f = "Safari" : -1 != a.a.indexOf("AdobeAIR") && (f = "AdobeAIR");
        "BuiltinBrowser" == f ? k = "Unknown" : "Silk" == f ? k = H(a.a, /Silk\/([\d\._]+)/, 1) : "Chrome" == f ? k = H(a.a, /(Chrome|CrMo|CriOS)\/([\d\.]+)/, 2) : -1 != a.a.indexOf("Version/") ? k = H(a.a, /Version\/([\d\.\w]+)/, 1) : "AdobeAIR" == f ? k = H(a.a, /AdobeAIR\/([\d\.]+)/, 1) : "Opera" == f ? k = H(a.a, /OPR\/([\d.]+)/, 1) : "PhantomJS" == f && (k = H(a.a, /PhantomJS\/([\d.]+)/, 1));
        h = C(k);
        p = "AdobeAIR" == f ? 2 < h.d || 2 == h.d && 5 <= h.o : "BlackBerry" == b ? 10 <= d.d : "Android" == b ? 2 < d.d || 2 == d.d && 1 < d.o : 526 <= g.d || 525 <= g.d && 13 <= g.o;
        return new D(f, h, k, "AppleWebKit", g, e, b, d, c, I(a.I), new A(p, 536 > g.d || 536 == g.d && 11 > g.o, "iPhone" == b || "iPad" == b || "iPod" == b || "Macintosh" == b));
    }
    function H(a, b, c) {
        return (a = a.match(b)) && a[c] ? a[c] : "";
    }
    function I(a) {
        if (a.documentMode) return a.documentMode;
    }
    function ha(a) {
        this.ua = a || "-";
    }
    ha.prototype.f = function(a) {
        for (var b = [], c = 0; c < arguments.length; c++) b.push(arguments[c].replace(/[\W_]+/g, "").toLowerCase());
        return b.join(this.ua);
    };
    function J(a, b) {
        this.K = a;
        this.V = 4;
        this.L = "n";
        var c = (b || "n4").match(/^([nio])([1-9])$/i);
        c && (this.L = c[1], this.V = parseInt(c[2], 10));
    }
    J.prototype.getName = n("K");
    function K(a) {
        return a.L + a.V;
    }
    function ia(a) {
        var b = 4, c = "n", d = l;
        a && ((d = a.match(/(normal|oblique|italic)/i)) && d[1] && (c = d[1].substr(0, 1).toLowerCase()), 
        (d = a.match(/([1-9]00|normal|bold)/i)) && d[1] && (/bold/i.test(d[1]) ? b = 7 : /[1-9]00/.test(d[1]) && (b = parseInt(d[1].substr(0, 1), 10))));
        return c + b;
    }
    function ka(a, b, c) {
        this.c = a;
        this.m = b;
        this.O = c;
        this.h = "wf";
        this.g = new ha("-");
    }
    function M(a) {
        var b = ca(a.m, a.g.f(a.h, "active")), c = [], d = [ a.g.f(a.h, "loading") ];
        b || c.push(a.g.f(a.h, "inactive"));
        x(a.m, c, d);
        N(a, "inactive");
    }
    function N(a, b, c) {
        if (a.O[b]) if (c) a.O[b](c.getName(), K(c)); else a.O[b]();
    }
    function la() {
        this.w = {};
    }
    function O(a, b) {
        this.c = a;
        this.C = b;
        this.s = this.c.createElement("span", {
            "aria-hidden": "true"
        }, this.C);
    }
    function P(a, b) {
        var c;
        c = [];
        for (var d = b.K.split(/,\s*/), e = 0; e < d.length; e++) {
            var g = d[e].replace(/['"]/g, "");
            -1 == g.indexOf(" ") ? c.push(g) : c.push("'" + g + "'");
        }
        c = c.join(",");
        d = "normal";
        e = b.V + "00";
        "o" === b.L ? d = "oblique" : "i" === b.L && (d = "italic");
        a.s.style.cssText = "display:block;position:absolute;top:-999px;left:-999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + c + ";" + ("font-style:" + d + ";font-weight:" + e + ";");
    }
    function Q(a) {
        w(a.c, "body", a.s);
    }
    O.prototype.remove = function() {
        var a = this.s;
        a.parentNode && a.parentNode.removeChild(a);
    };
    function ma(a, b, c, d, e, g, f, h) {
        this.W = a;
        this.sa = b;
        this.c = c;
        this.q = d;
        this.C = h || "BESbswy";
        this.j = e;
        this.F = {};
        this.T = g || 5e3;
        this.Z = f || l;
        this.B = this.A = l;
        a = new O(this.c, this.C);
        Q(a);
        for (var k in R) R.hasOwnProperty(k) && (P(a, new J(R[k], K(this.q))), this.F[R[k]] = a.s.offsetWidth);
        a.remove();
    }
    var R = {
        Da: "serif",
        Ca: "sans-serif",
        Ba: "monospace"
    };
    ma.prototype.start = function() {
        this.A = new O(this.c, this.C);
        Q(this.A);
        this.B = new O(this.c, this.C);
        Q(this.B);
        this.xa = u();
        P(this.A, new J(this.q.getName() + ",serif", K(this.q)));
        P(this.B, new J(this.q.getName() + ",sans-serif", K(this.q)));
        na(this);
    };
    function oa(a, b, c) {
        for (var d in R) if (R.hasOwnProperty(d) && b === a.F[R[d]] && c === a.F[R[d]]) return j;
        return m;
    }
    function na(a) {
        var b = a.A.s.offsetWidth, c = a.B.s.offsetWidth;
        b === a.F.serif && c === a.F["sans-serif"] || a.j.U && oa(a, b, c) ? u() - a.xa >= a.T ? a.j.U && oa(a, b, c) && (a.Z === l || a.Z.hasOwnProperty(a.q.getName())) ? S(a, a.W) : S(a, a.sa) : setTimeout(t(function() {
            na(this);
        }, a), 25) : S(a, a.W);
    }
    function S(a, b) {
        a.A.remove();
        a.B.remove();
        b(a.q);
    }
    function T(a, b, c, d) {
        this.c = b;
        this.t = c;
        this.P = 0;
        this.ba = this.Y = m;
        this.T = d;
        this.j = a.j;
    }
    function pa(a, b, c, d, e) {
        if (0 === b.length && e) M(a.t); else {
            a.P += b.length;
            e && (a.Y = e);
            for (e = 0; e < b.length; e++) {
                var g = b[e], f = c[g.getName()], h = a.t, k = g;
                x(h.m, [ h.g.f(h.h, k.getName(), K(k).toString(), "loading") ]);
                N(h, "fontloading", k);
                new ma(t(a.ga, a), t(a.ha, a), a.c, g, a.j, a.T, d, f).start();
            }
        }
    }
    T.prototype.ga = function(a) {
        var b = this.t;
        x(b.m, [ b.g.f(b.h, a.getName(), K(a).toString(), "active") ], [ b.g.f(b.h, a.getName(), K(a).toString(), "loading"), b.g.f(b.h, a.getName(), K(a).toString(), "inactive") ]);
        N(b, "fontactive", a);
        this.ba = j;
        qa(this);
    };
    T.prototype.ha = function(a) {
        var b = this.t, c = ca(b.m, b.g.f(b.h, a.getName(), K(a).toString(), "active")), d = [], e = [ b.g.f(b.h, a.getName(), K(a).toString(), "loading") ];
        c || d.push(b.g.f(b.h, a.getName(), K(a).toString(), "inactive"));
        x(b.m, d, e);
        N(b, "fontinactive", a);
        qa(this);
    };
    function qa(a) {
        0 == --a.P && a.Y && (a.ba ? (a = a.t, x(a.m, [ a.g.f(a.h, "active") ], [ a.g.f(a.h, "loading"), a.g.f(a.h, "inactive") ]), 
        N(a, "active")) : M(a.t));
    }
    function U(a) {
        this.G = a;
        this.u = new la();
        this.ya = new E(a.navigator.userAgent, a.document);
        this.a = this.ya.parse();
        this.Q = this.R = 0;
    }
    U.prototype.load = function(a) {
        var b = a.context || this.G;
        this.c = new v(this.G, b);
        var b = new ka(this.c, b.document.documentElement, a), c = [], d = a.timeout;
        x(b.m, [ b.g.f(b.h, "loading") ]);
        N(b, "loading");
        var c = this.u, e = this.c, g = [], f;
        for (f in a) if (a.hasOwnProperty(f)) {
            var h = c.w[f];
            h && g.push(h(a[f], e));
        }
        c = g;
        this.Q = this.R = c.length;
        a = new T(this.a, this.c, b, d);
        f = 0;
        for (d = c.length; f < d; f++) e = c[f], e.H(this.a, t(this.ta, this, e, b, a));
    };
    U.prototype.ta = function(a, b, c, d) {
        var e = this;
        d ? a.load(function(a, b, d) {
            var k = 0 == --e.R;
            setTimeout(function() {
                pa(c, a, b || {}, d || l, k);
            }, 0);
        }) : (a = 0 == --this.R, this.Q--, a && 0 == this.Q && M(b), pa(c, [], {}, l, a));
    };
    function V(a, b) {
        this.c = a;
        this.e = b;
        this.k = [];
    }
    V.prototype.D = function(a) {
        return y(this.c) + (this.e.api || "//f.fontdeck.com/s/css/js/") + (this.c.v.location.hostname || this.c.G.location.hostname) + "/" + a + ".js";
    };
    V.prototype.H = function(a, b) {
        var c = this.e.id, d = this.c.v, e = this;
        c ? (d.__webfontfontdeckmodule__ || (d.__webfontfontdeckmodule__ = {}), d.__webfontfontdeckmodule__[c] = function(a, c) {
            for (var d = 0, k = c.fonts.length; d < k; ++d) {
                var p = c.fonts[d];
                e.k.push(new J(p.name, ia("font-weight:" + p.weight + ";font-style:" + p.style)));
            }
            b(a);
        }, z(this.c, this.D(c), function(a) {
            a && b(m);
        })) : b(m);
    };
    V.prototype.load = function(a) {
        a(this.k);
    };
    function W(a, b) {
        this.c = a;
        this.e = b;
        this.k = [];
    }
    W.prototype.D = function(a) {
        var b = y(this.c);
        return (this.e.api || b + "//use.typekit.net") + "/" + a + ".js";
    };
    W.prototype.H = function(a, b) {
        var c = this.e.id, d = this.e, e = this.c.v, g = this;
        c ? (e.__webfonttypekitmodule__ || (e.__webfonttypekitmodule__ = {}), e.__webfonttypekitmodule__[c] = function(c) {
            c(a, d, function(a, c, d) {
                for (var f = 0; f < c.length; f += 1) {
                    var e = d[c[f]];
                    if (e) for (var L = 0; L < e.length; L += 1) g.k.push(new J(c[f], e[L])); else g.k.push(new J(c[f]));
                }
                b(a);
            });
        }, z(this.c, this.D(c), function(a) {
            a && b(m);
        }, 2e3)) : b(m);
    };
    W.prototype.load = function(a) {
        a(this.k);
    };
    function X(a, b) {
        this.c = a;
        this.e = b;
    }
    X.prototype.load = function(a) {
        var b, c, d = this.e.urls || [], e = this.e.families || [], g = this.e.testStrings || {};
        b = 0;
        for (c = d.length; b < c; b++) da(this.c, d[b]);
        d = [];
        b = 0;
        for (c = e.length; b < c; b++) {
            var f = e[b].split(":");
            if (f[1]) for (var h = f[1].split(","), k = 0; k < h.length; k += 1) d.push(new J(f[0], h[k])); else d.push(new J(f[0]));
        }
        a(d, g);
    };
    X.prototype.H = function(a, b) {
        return b(a.j.M);
    };
    function ra(a, b, c) {
        this.N = a ? a : b + sa;
        this.p = [];
        this.S = [];
        this.ca = c || "";
    }
    var sa = "//fonts.googleapis.com/css";
    ra.prototype.f = function() {
        if (0 == this.p.length) throw Error("No fonts to load!");
        if (-1 != this.N.indexOf("kit=")) return this.N;
        for (var a = this.p.length, b = [], c = 0; c < a; c++) b.push(this.p[c].replace(/ /g, "+"));
        a = this.N + "?family=" + b.join("%7C");
        0 < this.S.length && (a += "&subset=" + this.S.join(","));
        0 < this.ca.length && (a += "&text=" + encodeURIComponent(this.ca));
        return a;
    };
    function ta(a) {
        this.p = a;
        this.$ = [];
        this.J = {};
    }
    var ua = {
        latin: "BESbswy",
        cyrillic: "&#1081;&#1103;&#1046;",
        greek: "&#945;&#946;&#931;",
        khmer: "&#x1780;&#x1781;&#x1782;",
        Hanuman: "&#x1780;&#x1781;&#x1782;"
    }, va = {
        thin: "1",
        extralight: "2",
        "extra-light": "2",
        ultralight: "2",
        "ultra-light": "2",
        light: "3",
        regular: "4",
        book: "4",
        medium: "5",
        "semi-bold": "6",
        semibold: "6",
        "demi-bold": "6",
        demibold: "6",
        bold: "7",
        "extra-bold": "8",
        extrabold: "8",
        "ultra-bold": "8",
        ultrabold: "8",
        black: "9",
        heavy: "9",
        l: "3",
        r: "4",
        b: "7"
    }, wa = {
        i: "i",
        italic: "i",
        n: "n",
        normal: "n"
    }, xa = RegExp("^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$");
    ta.prototype.parse = function() {
        for (var a = this.p.length, b = 0; b < a; b++) {
            var c = this.p[b].split(":"), d = c[0].replace(/\+/g, " "), e = [ "n4" ];
            if (2 <= c.length) {
                var g;
                var f = c[1];
                g = [];
                if (f) for (var f = f.split(","), h = f.length, k = 0; k < h; k++) {
                    var p;
                    p = f[k];
                    if (p.match(/^[\w-]+$/)) {
                        p = xa.exec(p.toLowerCase());
                        var s = void 0;
                        if (p == l) s = ""; else {
                            s = void 0;
                            s = p[1];
                            if (s == l || "" == s) s = "4"; else var ja = va[s], s = ja ? ja : isNaN(s) ? "4" : s.substr(0, 1);
                            s = [ p[2] == l || "" == p[2] ? "n" : wa[p[2]], s ].join("");
                        }
                        p = s;
                    } else p = "";
                    p && g.push(p);
                }
                0 < g.length && (e = g);
                3 == c.length && (c = c[2], g = [], c = !c ? g : c.split(","), 0 < c.length && (c = ua[c[0]]) && (this.J[d] = c));
            }
            this.J[d] || (c = ua[d]) && (this.J[d] = c);
            for (c = 0; c < e.length; c += 1) this.$.push(new J(d, e[c]));
        }
    };
    function Y(a, b) {
        this.a = new E(navigator.userAgent, document).parse();
        this.c = a;
        this.e = b;
    }
    var ya = {
        Arimo: j,
        Cousine: j,
        Tinos: j
    };
    Y.prototype.H = function(a, b) {
        b(a.j.M);
    };
    Y.prototype.load = function(a) {
        var b = this.c;
        if ("MSIE" == this.a.getName() && this.e.blocking != j) {
            var c = t(this.X, this, a), d = function() {
                b.z.body ? c() : setTimeout(d, 0);
            };
            d();
        } else this.X(a);
    };
    Y.prototype.X = function(a) {
        for (var b = this.c, c = new ra(this.e.api, y(b), this.e.text), d = this.e.families, e = d.length, g = 0; g < e; g++) {
            var f = d[g].split(":");
            3 == f.length && c.S.push(f.pop());
            var h = "";
            2 == f.length && "" != f[1] && (h = ":");
            c.p.push(f.join(h));
        }
        d = new ta(d);
        d.parse();
        da(b, c.f());
        a(d.$, d.J, ya);
    };
    function Z(a, b) {
        this.c = a;
        this.e = b;
        this.k = [];
    }
    Z.prototype.H = function(a, b) {
        var c = this, d = c.e.projectId, e = c.e.version;
        if (d) {
            var g = c.c.v;
            z(this.c, c.D(d, e), function(f) {
                if (f) b(m); else {
                    if (g["__mti_fntLst" + d] && (f = g["__mti_fntLst" + d]())) for (var e = 0; e < f.length; e++) c.k.push(new J(f[e].fontfamily));
                    b(a.j.M);
                }
            }).id = "__MonotypeAPIScript__" + d;
        } else b(m);
    };
    Z.prototype.D = function(a, b) {
        var c = y(this.c), d = (this.e.api || "fast.fonts.net/jsapi").replace(/^.*http(s?):(\/\/)?/, "");
        return c + "//" + d + "/" + a + ".js" + (b ? "?v=" + b : "");
    };
    Z.prototype.load = function(a) {
        a(this.k);
    };
    var $ = new U(q);
    $.u.w.custom = function(a, b) {
        return new X(b, a);
    };
    $.u.w.fontdeck = function(a, b) {
        return new V(b, a);
    };
    $.u.w.monotype = function(a, b) {
        return new Z(b, a);
    };
    $.u.w.typekit = function(a, b) {
        return new W(b, a);
    };
    $.u.w.google = function(a, b) {
        return new Y(b, a);
    };
    q.WebFont || (q.WebFont = {}, q.WebFont.load = t($.load, $), q.WebFontConfig && $.load(q.WebFontConfig));
})(this, document);

(function(aGlobalObject) {
    if (aGlobalObject.MKK) {
        console.warn("aGlobalObject.MKK has already been constructed");
    }
    var MKK = {};
    aGlobalObject.MKK = MKK;
    MKK.getNamespace = function(aPackagePath) {
        var currentObject = this;
        var currentArray = aPackagePath.split(".");
        var currentArrayLength = currentArray.length;
        for (var i = 0; i < currentArrayLength; i++) {
            var currentName = currentArray[i];
            if (currentObject[currentName] === undefined) {
                currentObject[currentName] = {};
            }
            currentObject = currentObject[currentName];
        }
        return currentObject;
    };
    MKK.getClass = function(aClassPath) {
        var lastSplitPosition = aClassPath.lastIndexOf(".");
        var packagePath = aClassPath.substring(0, lastSplitPosition);
        var className = aClassPath.substring(lastSplitPosition + 1, aClassPath.length);
        var packageObject = this.getNamespace(packagePath);
        if (packageObject[className] === undefined) {
            console.error("Class " + aClassPath + " doesn't exist.");
            return null;
        }
        return packageObject[className];
    };
    MKK.singletons = new Object();
})(window);

(function() {
    var ns = MKK.getNamespace("mkk.math");
    if (!ns.Easing) {
        var Easing = function Easing() {};
        ns.Easing = Easing;
        Easing._tweens = [];
        Easing.time = null;
        Easing.add = function(tween) {
            Easing._tweens.push(tween);
        };
        Easing.remove = function(tween) {
            var i = _tweens.indexOf(tween);
            if (i !== -1) {
                _tweens.splice(i, 1);
            }
        };
        Easing.update = function(time) {
            Easing.time = time !== undefined ? time : typeof window !== "undefined" && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now();
            while (i < _tweens.length) {
                if (_tweens[i].update(time)) {
                    i++;
                } else {
                    _tweens.splice(i, 1);
                }
            }
        };
        Easing.linear = function(t, obj, callback) {
            return t;
        };
        Easing.inQuad = function(t, obj, callback) {};
        Easing.outQuad = function() {};
        Easing.inCubic = function() {};
        Easing.outCubic = function() {};
        Easing.Interpolation = {};
        Easing.Interpolation.linear = function() {};
        Easing.Interpolation.bezier = function() {};
        Easing.Interpolation.catMullRom = function() {};
    }
})();

(function() {
    var ns = MKK.getNamespace("mkk.math");
    if (!ns.MathBase) {
        var MathBase = function MathBase() {};
        ns.MathBase = MathBase;
        MathBase.PI = 3.16;
        MathBase.PI2 = 6.2832;
        MathBase.Sign = function(num) {
            return num ? num < 0 ? -1 : 1 : 0;
        };
        MathBase.Clamp = function(value, min, max) {
            return Math.max(min, Math.min(max, value));
        };
        MathBase.Clamp01 = function(value) {
            return Math.max(0, Math.min(1, value));
        };
        MathBase.Fit = function(value, inMin, inMax, outMin, outMax) {
            value = Math.max(inMin, Math.min(inMax, value));
            return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
        };
        MathBase.Fit01 = function(value, min, max) {
            return value * (max - min) + min;
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("mkk.event");
    if (!ns.EventDispatcher) {
        var EventDispatcher = function EventDispatcher() {
            this._eventListeners = null;
        };
        ns.EventDispatcher = EventDispatcher;
        var supportsCustomEvents = true;
        try {
            var newTestCustomEvent = document.createEvent("CustomEvent");
        } catch (e) {
            supportsCustomEvents = false;
        }
        var p = EventDispatcher.prototype;
        p.addEventListener = function(aEventType, aFunction) {
            if (this._eventListeners === null) {
                this._eventListeners = {};
            }
            if (!this._eventListeners[aEventType]) {
                this._eventListeners[aEventType] = [];
            }
            this._eventListeners[aEventType].push(aFunction);
            return this;
        };
        p.removeEventListener = function(aEventType, aFunction) {
            if (this._eventListeners === null) {
                this._eventListeners = {};
            }
            var currentArray = this._eventListeners[aEventType];
            if (typeof currentArray === "undefined") {
                return this;
            }
            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                if (currentArray[i] == aFunction) {
                    currentArray.splice(i, 1);
                    i--;
                    currentArrayLength--;
                }
            }
            return this;
        };
        p.dispatchEvent = function(aEvent) {
            if (this._eventListeners === null) {
                this._eventListeners = {};
            }
            var eventType = aEvent.type;
            if (aEvent.target === null) {
                aEvent.target = this;
            }
            aEvent.currentTarget = this;
            var currentEventListeners = this._eventListeners[eventType];
            if (currentEventListeners !== null && currentEventListeners !== undefined) {
                var currentArray = this._copyArray(currentEventListeners);
                var currentArrayLength = currentArray.length;
                for (var i = 0; i < currentArrayLength; i++) {
                    var currentFunction = currentArray[i];
                    currentFunction.call(this, aEvent);
                }
            }
            return this;
        };
        p.dispatchCustomEvent = function(aEventType, aDetail) {
            if (supportsCustomEvents) {
                var newEvent = document.createEvent("CustomEvent");
                newEvent.dispatcher = this;
                newEvent.initCustomEvent(aEventType, false, false, aDetail);
            } else {
                var newEvent = {
                    type: aEventType,
                    detail: aDetail,
                    dispatcher: this
                };
                return this.dispatchEvent(newEvent);
            }
            return this.dispatchEvent(newEvent);
        };
        p.destroy = function() {
            if (this._eventListeners !== null) {
                for (var objectName in this._eventListeners) {
                    var currentArray = this._eventListeners[objectName];
                    var currentArrayLength = currentArray.length;
                    for (var i = 0; i < currentArrayLength; i++) {
                        currentArray[i] = null;
                    }
                    delete this._eventListeners[objectName];
                }
                this._eventListeners = null;
            }
        };
        p._copyArray = function(aArray) {
            var currentArray = new Array(aArray.length);
            var currentArrayLength = currentArray.length;
            for (var i = 0; i < currentArrayLength; i++) {
                currentArray[i] = aArray[i];
            }
            return currentArray;
        };
    }
})();

(function() {
    var namespace = MKK.getNamespace("mkk.event");
    if (!namespace.ListenerFunctions) {
        var onceList = {};
        var ListenerFunctions = function ListenerFunctions() {};
        namespace.ListenerFunctions = ListenerFunctions;
        ListenerFunctions.addDOMListener = function(aElement, aEvent, aCallback) {
            if (typeof aElement.addEventListener === "function") aElement.addEventListener(aEvent, aCallback, false); else if (typeof aElement.attachEvent === "function") aElement.attachEvent("on" + aEvent, aCallback); else aElement["on" + aEvent] = aCallback;
        };
        ListenerFunctions.removeDOMListener = function(aElement, aEvent, aCallback) {
            if (typeof aElement.removeEventListener === "function") aElement.removeEventListener(aEvent, aCallback, false); else if (typeof aElement.attachEvent === "function") aElement.detachEvent("on" + aEvent, aCallback); else aElement["on" + aEvent] = null;
        };
        ListenerFunctions.createListenerFunction = function(aListenerObject, aListenerFunction) {
            if (aListenerFunction === undefined) {
                throw new Error("ERROR ListenerFunctions :: createListenerFunction :: callback function was null when called by :: ", aListenerObject);
            }
            var returnFunction = function dynamicListenerFunction() {
                aListenerFunction.apply(aListenerObject, arguments);
            };
            return returnFunction;
        };
        ListenerFunctions.createListenerFunctionOnce = function(aListenerObject, aListenerFunction) {
            if (aListenerFunction === undefined) {
                throw new Error("ERROR ListenerFunctions :: createListenerFunction :: callback function was null when called by :: ", aListenerObject);
            }
            var returnFunction = function dynamicListenerFunction() {
                if (aListenerFunction === undefined) return null;
                aListenerFunction.apply(aListenerObject, arguments);
                aListenerFunction = undefined;
            };
            return returnFunction;
        };
        ListenerFunctions.createListenerFunctionWithArguments = function(aListenerObject, aListenerFunction, aArguments) {
            if (aListenerFunction === undefined) {
                throw new Error("ERROR ListenerFunctions :: createListenerFunction :: callback function was null when called by :: ", aListenerObject);
            }
            var returnFunction = function dynamicListenerFunction() {
                var argumentsArray = aArguments.concat([]);
                var currentArray = arguments;
                var currentArrayLength = currentArray.length;
                for (var i = 0; i < currentArrayLength; i++) {
                    argumentsArray.push(currentArray[i]);
                }
                aListenerFunction.apply(aListenerObject, argumentsArray);
            };
            return returnFunction;
        };
        ListenerFunctions.createListenerFunctionWithReturn = function(aListenerObject, aListenerFunction) {
            if (aListenerFunction === undefined) {
                throw new Error("ERROR ListenerFunctions :: createListenerFunctionWithReturn :: callback function was null when called by :: ", aListenerObject);
            }
            var returnFunction = function dynamicListenerFunction() {
                return aListenerFunction.apply(aListenerObject, arguments);
            };
            return returnFunction;
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("mkk.event");
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var EventDispatcher = MKK.getNamespace("mkk.event").EventDispatcher;
    var Mathbase = MKK.getNamespace("mkk.math").MathBase;
    if (!ns.TouchEvent) {
        var TouchEvent = function TouchEvent(target, type, callback) {
            this.target = target;
            this.type = type;
            this.callback = callback;
            switch (this.type) {
              case "tap":
              default:
                this.setupTap();
                break;
            }
        };
        ns.TouchEvent = TouchEvent;
        var p = TouchEvent.prototype = new EventDispatcher();
        p.setupTap = function() {
            var downEvent = "ontouchstart" in window ? "touchstart" : "mousedown";
            var upEvent = "ontouchend" in window ? "touchend" : "mouseup";
            var downBound = ListenerFunctions.createListenerFunction(this, this.downHandler);
            this.target.addEventListener(downEvent, downBound);
            var upBound = ListenerFunctions.createListenerFunction(this, this.upHandler);
            this.target.addEventListener(upEvent, upBound);
        };
        p.downHandler = function(e) {
            console.log("me down");
        };
        p.upHandler = function(e) {
            console.log("me up");
            this.callback.call(e);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("mkk.event");
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var EventDispatcher = MKK.getNamespace("mkk.event").EventDispatcher;
    var Mathbase = MKK.getNamespace("mkk.math").MathBase;
    if (!ns.Trackpad) {
        var Trackpad = function Trackpad(target) {
            this.target = target;
            this.speedDamper = .92;
            this.swipespeedDamper = .92;
            this.dragOffset = 0;
            this.dragging;
            this.speed = 0;
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.touchDate = 0;
            this.minSwipeSpeed = 2;
            this.maxSwipeSpeed = 15;
            this.maxSwipeTime = 700;
            this.minSwipeDistance = 120;
        };
        ns.Trackpad = Trackpad;
        var p = Trackpad.prototype = new EventDispatcher();
        p.setup = function() {
            this.mousewheelBound = ListenerFunctions.createListenerFunction(this, this.mousewheelHandler);
            this.target.addEventListener("mousewheel", this.mousewheelBound);
            this.touchStartBound = ListenerFunctions.createListenerFunction(this, this.touchstartHandler);
            this.target.addEventListener("touchstart", this.touchStartBound);
            this.touchMoveBound = ListenerFunctions.createListenerFunction(this, this.touchmoveHandler);
            this.touchEndBound = ListenerFunctions.createListenerFunction(this, this.touchendHandler);
            this.onarrowBound = ListenerFunctions.createListenerFunction(this, this.onArrowHandler);
            document.body.addEventListener("keydown", this.onarrowBound);
        };
        p.unlock = function() {
            this.locked = false;
            this.speed = 0;
        };
        p.lock = function() {
            this.locked = true;
        };
        p.update = function() {
            this.speed *= this.speedDamper;
            if (Math.abs(this.speed) < 1) this.speed = 0;
        };
        p.startDrag = function(e) {
            if (this.locked) return;
            this.dragging = true;
            this.touchStartX = e.touches[0].pageX;
            this.touchStartY = e.touches[0].pageY;
            this.touchDate = Date.now();
        };
        p.endDrag = function(e) {
            if (this.locked) return;
            var tT = Date.now() - this.touchDate;
            this.swipeXDistance = e.changedTouches[0].pageX - this.touchStartX;
            this.swipeYDistance = e.changedTouches[0].pageY - this.touchStartY;
            this.swipeXspeed = this.swipeXDistance / tT;
            this.swipeYspeed = this.swipeYDistance / tT;
            var absSwipeXDistance = Math.abs(this.swipeXDistance);
            var absSwipeXSpeed = Math.abs(this.swipeXspeed);
            var absSwipeYDistance = Math.abs(this.swipeYDistance);
            var absSwipeYSpeed = Math.abs(this.swipeYspeed);
            if (tT <= this.maxSwipeTime) {
                if (absSwipeXSpeed > this.minSwipeSpeed && absSwipeXSpeed < this.maxSwipeSpeed && absSwipeXDistance > this.minSwipeDistance) {
                    console.log("me swiped", this.swipeXDistance);
                    var sign = Mathbase.Sign(this.swipeXDistance);
                    if (sign > 0) {
                        this.dispatchCustomEvent("swiperight");
                    } else {
                        this.dispatchCustomEvent("swipeleft");
                    }
                }
                if (absSwipeYSpeed > this.minSwipeSpeed && absSwipeYSpeed < this.maxSwipeSpeed && absSwipeYDistance > this.minSwipeDistance) {
                    var sign = Mathbase.Sign(this.swipeYDistance);
                    if (sign > 0) {
                        console.log("me down");
                        this.dispatchCustomEvent("swiperdown");
                    } else {
                        console.log("me up");
                        this.dispatchCustomEvent("swipeup");
                    }
                }
            }
            this.dragging = false;
            this.touchDate = null;
        };
        p.updateDrag = function(e) {
            if (this.locked || !this.touchDate) return;
            var offset = {};
            offset.x = this.touchStartX - e.touches[0].pageX;
            var t = Date.now() - this.touchDate;
            offset.y = this.touchStartY - e.touches[0].pageY;
            this.speed = Math.abs(offset.y) > 0 ? offset.y / (t / 200) : 0;
        };
        p.mousewheelHandler = function(e) {
            e.preventDefault();
            this.speed = e.wheelDeltaY * this.speedDamper;
            this.swipespeed = e.wheelDeltaX * this.swipespeedDamper;
            if (this.speed > 0) {
                this.dispatchCustomEvent("swipeup");
            } else if (this.speed < 0) {
                this.dispatchCustomEvent("swipedown");
            }
        };
        p.onArrowHandler = function(event) {
            if (event.keyCode == 38) {
                this.speed += 70;
            } else if (event.keyCode == 40) {
                this.speed -= 70;
                return false;
            }
        };
        p.touchstartHandler = function(e) {
            this.startDrag(e);
            this.target.addEventListener("touchmove", this.touchMoveBound);
            this.target.addEventListener("touchend", this.touchEndBound);
        };
        p.touchmoveHandler = function(e) {
            e.preventDefault();
            this.updateDrag(e);
        };
        p.touchendHandler = function(e) {
            this.target.removeEventListener("touchmove", this.touchmoveBound);
            this.target.removeEventListener("touchend", this.touchendBound);
            this.endDrag(e);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("mkk.core");
    var EventDispatcher = MKK.getNamespace("mkk.event").EventDispatcher;
    if (!ns.Core) {
        var Core = function() {};
        ns.Core = Core;
        var p = Core.prototype = new EventDispatcher();
        p.setup = function() {
            this._setup();
        };
        p._setup = function() {
            console.log("Core Setup :: ");
            this.disableScrollBars();
        };
        p.disableScrollBars = function() {
            document.documentElement.style.overflow = "hidden";
            document.body.scroll = "no";
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("data");
    if (!ns.copydata) {
        ns.copydata = {
            scene1: {
                line1: "With over 100 years of experience\n as an Oil & Gas global leader",
                line2: "With over 100 years of close collaboration\n with the world's leading equipment builders",
                line3: "We know that 'productivity' means more to you than just the quantity of your output",
                line4: "Our synthetic lubricants help enable problem-free operation to help",
                line4b: "*Visit mobilindustrial.com to learn how certain Mobil branded lubricants may provide benefits to help minimize environmental impact. Actual benefits will depend upon product selected, operating conditions, and applications",
                line5: "Our solutions can help to:",
                line6: "Reduce energy consumption",
                line7: "Reduce downtime",
                line8: "Increase equipment protection",
                line9: "Optimize operating costs",
                symbolline1: "Safety",
                symbolline2: "Environmental Care*",
                symbolline3: "Productivity"
            },
            scene2: {
                desc1: {
                    title: "Gear Applications",
                    txt: "Outstanding protection for gears operating in extreme conditions\n\nMobil SHC™ 600\nMobilgear™ Gear\nMobil SHC™ 600 XP",
                    color: "white"
                },
                desc2: {
                    title: "Engines",
                    txt: "Advanced engine cleanliness and extended oil drain intervals\n\nMobilGard 1™\nMobil Delvac 1™\nMobil Delvac™ M\nMobilGard™ HSD",
                    color: "white"
                },
                desc3: {
                    title: "Propulsion &\nThrusters",
                    txt: "Excellent load carrying and anti-wear properties\n\nMobil SHC™ Gear\nMobil DTE 10 Excel™",
                    color: "white"
                }
            },
            scene3: {
                desc1: {
                    title: "Engines",
                    txt: "Mobil Delvac 1™\nMobil Delvac MX™\nMobil Pegasus™",
                    color: "blue"
                },
                desc2: {
                    title: "Top Drive",
                    txt: "Mobil SHC™\nMobil SHC™ 600\nMobil SHC™ Gear\nMobil DTE 10 Excel™\nMobilith SHC™",
                    color: "blue"
                },
                desc3: {
                    title: "Mud Pumps",
                    txt: "Mobil SHC™ Gear\nMobil Polyrex™ EM",
                    color: "blue"
                },
                desc4: {
                    title: "Positioning Thrusters",
                    txt: "Mobil SHC™ Gear\nMobilgear™ 600XP",
                    color: "white"
                }
            },
            scene4: {
                desc1: {
                    title: "Turbines",
                    txt: "Excellent anti-oxidation and air release properties\n\nMobil SHC™ 800\nMobil DTE™ 932 GT",
                    color: "blue"
                },
                desc2: {
                    title: "Compressors",
                    txt: "Exceptional cleanliness and stability characteristics at high temperatures reduce problems with deposit formation and allow for extended oil-drain intervals, reducing the need for frequent maintenance \n\nMobil Rarus SHC™ 1020\nMobil Rarus™ 800",
                    color: "blue"
                },
                desc3: {
                    title: "Deck Machinery",
                    txt: "Swivel stacks, cranes, winches, pumps and more\n\nMobil SHC™ 600\nMobil DTE 10 Excel™\nMobilith SHC™\nMobil DTE™ Named\nMobil 375™ NC\nMobilarma™ 798",
                    color: "blue"
                },
                desc4: {
                    title: "Turbines, compressors\nand other applications",
                    txt: "Mobil Pegasus™\nMobiljet™ Oil\nMobil Rarus SHC™",
                    color: "white"
                }
            },
            scene5: {},
            scene6: {
                desc1: {
                    title: "Turbines",
                    txt: "Mobil SHC™ 800\nMobil DTE™ 932 GT\nMobil DTE™ 800\n",
                    color: "blue"
                },
                desc2: {
                    title: "Compressors",
                    txt: "Mobil Rarus SHC™ 1000\nMobil Rarus™ 800",
                    color: "blue"
                },
                desc3: {
                    title: "Pumps",
                    txt: "Mobil SHC™ 100",
                    color: "blue"
                },
                desc4: {
                    title: "Gears",
                    txt: "Mobil SHC™ 600",
                    color: "blue"
                }
            },
            scene7: {},
            scene8: {
                line1: "Get your productivity pumping",
                line2: "Speak to our specialists about advancing the productivity,\nsafety and environmental care of your oil and gas operations",
                line3: "Replay >",
                line4: "For detailed information on the products and their performance please visit MobilIndustrial.com"
            }
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("data");
    if (!ns.scenedata) {
        ns.scenedata = {
            totalFrame: 27194,
            navi: {
                tweenTime: {}
            },
            scene1: {
                name: "Start",
                startFrame: 0,
                duration: 4e3,
                cuepoint: 0,
                level: [ {
                    name: "level0",
                    x: 0,
                    y: 0,
                    z: 0
                }, {
                    name: "level1",
                    x: 0,
                    y: 0,
                    z: 5
                }, {
                    name: "level2",
                    x: 0,
                    y: 0,
                    z: 4
                } ],
                element: []
            },
            scene2: {
                name: "Exploration",
                startFrame: 3300,
                duration: 8200,
                cuepoint: 3580,
                level: [ {
                    name: "level0",
                    x: 0,
                    y: 0,
                    z: 0
                }, {
                    name: "level1",
                    x: 0,
                    y: 0,
                    z: 1
                }, {
                    name: "level2",
                    x: 0,
                    y: 0,
                    z: 10
                }, {
                    name: "level3",
                    x: 0,
                    y: 0,
                    z: 1
                } ],
                element: {
                    shipInner: {
                        x: -500,
                        y: 1150,
                        z: 0
                    },
                    radar: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                }
            },
            scene3: {
                name: "Drilling",
                startFrame: 4e3 + 7200,
                duration: 6800,
                cuepoint: 10920
            },
            scene4: {
                name: "Production",
                startFrame: 4e3 + 7200 + 4700,
                duration: 7180,
                cuepoint: 17060
            },
            scene5: {
                name: "Transmission",
                cuepoint: 20700
            },
            scene6: {
                name: "Processing",
                startFrame: 4e3 + 7200 + 4700 + 6014,
                duration: 3e3,
                cuepoint: 22370
            },
            scene7: {
                startFrame: 4e3 + 7200 + 4700 + 6014 + 2e3,
                duration: 2880,
                tweenTime: {
                    _fast: 150,
                    _speed: 250,
                    _speed1: 500,
                    _speed2: 750,
                    delayStart: 500,
                    tween1Start: 750,
                    tween2Start: 1e3,
                    tween3Start: 1500,
                    tween4Start: 2e3,
                    tween5Start: 2250,
                    tween6Start: 2700,
                    tweenStartX0: 2024,
                    tweenStartX1: -2e3,
                    tweenStartX2: 0,
                    roadX0: 3e3,
                    roadX1: -2500,
                    seaY0: 700,
                    seaY1: 670,
                    truckX0: 100,
                    truckX1: 2e3,
                    fronttruckX0: 512,
                    fronttruckY0: 400,
                    fronttruckY1: 340
                }
            },
            scene8: {
                name: "End",
                startFrame: 4e3 + 7200 + 4700 + 6014 + 2e3 + 2880,
                duration: 400,
                cuepoint: 27140,
                tweenTime: {
                    _speed: 150,
                    stackDelay: 100,
                    txt2X0: 512,
                    txt2Y0: 240,
                    txt3X0: 512,
                    txt3Y0: 360,
                    txt4X0: 512,
                    txt4Y0: 570,
                    txt5X0: 512,
                    txt5Y0: 600,
                    txt2Y1: 300,
                    txt3Y1: 380,
                    txt4Y1: 600,
                    txt5Y0: 730
                }
            }
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("data");
    if (!ns.settings) {
        ns.settings = {
            defaultWidth: 1024,
            defaultHeight: 768,
            depthLevel: .1,
            defaultTextStyle: {
                font: "40px emprintw01-semibold",
                fill: "#58595b",
                align: "center",
                wordWrap: true,
                wordWrapWidth: 800
            },
            defaultDescriptionGap: 20,
            defaultDescriptionLineHeight: 40,
            defaultBrandRed: "#e30420",
            defaultBrandBlue: "#174c8f",
            defaultOilRigBlue: 1526927,
            defaultOilRigLightBlue: 2079982,
            defaultBGColor: 15198183,
            defaultOilColor: 0,
            defaultOilBGColor: 12961223,
            defaultSeaFloorColor: 4605513,
            defaultSeaLight: 4306151,
            defaultSeaColor: 31169,
            defaultRoadGrey: 8290435,
            defaultRoadGreen: 13488641,
            defaultTownGreen: 12039950
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("data");
    if (!ns.styledata) {
        ns.styledata = {
            straplinegrey: {
                font: "40px emprintw01-semibold",
                fill: "#58595b",
                align: "center",
                wordWrap: "true",
                wordWrapWidth: "800"
            },
            symbolTitle: {
                font: "15px EMPrintW01-semibold",
                fill: "#58595b",
                align: "center",
                wordWrap: "true",
                wordWrapWidth: "200"
            },
            symbolTitle2: {
                font: "18px EMPrintW01-regular",
                fill: "#58595b",
                align: "center",
                wordWrap: "true",
                wordWrapWidth: "400"
            },
            symbolTitle3: {
                font: "28px EMPrintW01-semibold",
                fill: "#58595b",
                align: "center",
                wordWrap: "true",
                wordWrapWidth: "400"
            },
            disclaimTitle: {
                font: "16px emprintw01-regular",
                fill: "#58595b",
                align: "center",
                wordWrap: "true",
                wordWrapWidth: "900"
            },
            descriptionTitle: {
                font: "40px emprintw01-semibold",
                fill: "#58595b",
                align: "left",
                wordWrap: "true",
                wordWrapWidth: "800",
                lineHeight: 12
            },
            descriptionBody: {
                font: "16px emprintw01-regular",
                fill: "#58595b",
                align: "left",
                wordWrap: "true",
                wordWrapWidth: "400"
            },
            descriptionTitleWhite: {
                font: "40px emprintw01-semibold",
                fill: "#ffffff",
                align: "left",
                wordWrap: "true",
                wordWrapWidth: "800",
                lineHeight: 12
            },
            descriptionBodyWhite: {
                font: "16px emprintw01-regular",
                fill: "#ffffff",
                align: "left",
                wordWrap: "true",
                wordWrapWidth: "400"
            },
            descriptionTitleBlue: {
                font: "40px emprintw01-semibold",
                fill: "#174c8f",
                align: "left",
                wordWrap: "true",
                wordWrapWidth: "800",
                lineHeight: 12
            },
            descriptionBodyBlue: {
                font: "16px emprintw01-regular",
                fill: "#174c8f",
                align: "left",
                wordWrap: "true",
                wordWrapWidth: "400"
            },
            endlineBody: {
                font: "18px emprintw01-regular",
                fill: "#58595b",
                align: "center",
                wordWrap: "true",
                wordWrapWidth: "600"
            },
            replayGrey: {
                font: "24px emprintw01-regular",
                fill: "#58595b",
                align: "center",
                wordWrap: "true",
                wordWrapWidth: "600"
            }
        };
    }
})();

(function() {
    var EventDispatcher = MKK.getNamespace("mkk.event").EventDispatcher;
    var ns = MKK.getNamespace("app.event");
    var Trackpad = MKK.getNamespace("mkk.event").Trackpad;
    var MathBase = MKK.getNamespace("mkk.math").MathBase;
    if (!ns.Scroller) {
        var Scroller = function Scroller(maxScroll) {
            this.gui = null;
            this.view = null;
            this.isStop = false;
            this.isDebug = false;
            this.scrollSpeedDamper = .05;
            this.distance = 0;
            this.maxSpeed = 200;
            this.minSpeed = -200;
            this.isAutoScrolling = false;
            this.scrollMax = maxScroll || 1e3;
        };
        ns.Scroller = Scroller;
        var p = Scroller.prototype = new EventDispatcher();
        var s = EventDispatcher.prototype;
        p.debug = function(gui) {
            this.gui = gui;
            this.isDebug = true;
            this.f1 = this.gui.addFolder("Easing & Interpolation");
            this.f1.add(this, "scrollSpeedDamper", .01, .2);
            this.scrollDisplay = document.createElement("div");
            this.scrollDisplay.style.background = "rgb(0, 0, 34)";
            this.scrollDisplay.style.width = "60px";
            this.scrollDisplay.style.height = "14px";
            this.scrollDisplay.style.display = "block";
            this.scrollDisplay.style.position = "absolute";
            this.scrollDisplay.style.left = "0px";
            this.scrollDisplay.style.bottom = "0px";
            this.scrollDisplay.style.padding = "17px 10px";
            this.scrollDisplay.style.fontFamily = "Arial";
            this.scrollDisplay.style.fontSize = "11px";
            this.scrollDisplay.style.color = "rgb(0, 255, 255)";
            this.scrollDisplay.style.textAlign = "center";
            document.body.appendChild(this.scrollDisplay);
        };
        p.setup = function(view) {
            this.view = view;
            this.trackpad = new Trackpad(this.view);
            this.trackpad.setup();
        };
        p.start = function() {
            this.isStop = false;
        };
        p.stop = function() {
            this.isStop = true;
        };
        p.getDistance = function() {
            return Math.round(this.distance * 1e3) / 1e3;
        };
        p.scrollto = function(toPos) {
            this.isAutoScrolling = true;
            var current = this.getDistance();
            var distance = Math.abs(toPos - current);
            if (distance < 1) return;
            var _time = Math.ceil(distance * 1.8);
            var that = this;
            var updateBound = function(e) {
                that.scrollUpdateFunc(e, this);
            };
            var completeBound = function(e) {
                that.scrollCompleteFunc(e, this);
            };
            this.autoTween = new TWEEN.Tween({
                y: current
            }).to({
                y: toPos
            }, _time).easing(TWEEN.Easing.Quadratic.InOut).onUpdate(updateBound).onComplete(completeBound).start();
        };
        p.scrollUpdateFunc = function(e, obj) {
            this.isAutoScrolling = true;
            this.tweenDistance = obj.y;
        };
        p.scrollCompleteFunc = function(e, obj) {
            this.isAutoScrolling = false;
            this.tweenDistance = 0;
        };
        p.stopScroll = function() {
            if (this.autoTween) {
                return this.autoTween.stop();
            } else {
                return false;
            }
        };
        p.update = function() {
            if (this.isDebug) this.scrollDisplay.innerHTML = Math.round(this.distance) + "px";
            var dist = this.distance;
            var speed = MathBase.Clamp(this.trackpad.speed, this.minSpeed, this.maxSpeed);
            var scDamp = this.scrollSpeedDamper;
            var sMax = this.scrollMax;
            if (!this.isStop) {
                dist += speed * scDamp;
                if (dist < 0) {
                    dist = 0;
                } else if (dist >= sMax) {
                    dist = sMax;
                }
                this.distance = dist;
                this.trackpad.update();
            }
            if (this.isAutoScrolling) {
                this.distance = this.tweenDistance;
            }
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.animation");
    if (!ns.FrameTween) {
        var FrameTween = function FrameTween() {};
        ns.FrameTween = FrameTween;
        FrameTween._tweens = [];
        FrameTween.curFrame = 0;
        FrameTween.prevFrame = 0;
        FrameTween.add = function(tTween) {
            FrameTween._tweens.push(tTween);
        };
        FrameTween.remove = function(tTween) {
            var i = FrameTween._tweens.indexOf(tTween);
            if (i !== -1) {
                FrameTween._tweens.splice(i, 1);
            }
        };
        FrameTween.update = function(cFrame) {
            FrameTween.curFrame = cFrame;
            if (FrameTween._tweens.length === 0) return false;
            var i = 0;
            while (i < FrameTween._tweens.length) {
                FrameTween._tweens[i].update(cFrame);
                i++;
            }
            FrameTween.prevFrame = cFrame;
            return true;
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.animation");
    if (!ns.FrameTween) {
        var FrameTween = function FrameTween() {};
        ns.FrameTween = FrameTween;
        FrameTween._tweens = [];
        FrameTween.curFrame = 0;
        FrameTween.add = function(tTween) {
            FrameTween._tweens.push(tTween);
        };
        FrameTween.remove = function(tTween) {
            var i = FrameTween._tweens.indexOf(tTween);
            if (i !== -1) {
                FrameTween._tweens.splice(i, 1);
            }
        };
        FrameTween.update = function(cFrame) {
            FrameTween.curFrame = cFrame;
            if (FrameTween._tweens.length === 0) return false;
            var i = 0;
            while (i < FrameTween._tweens.length) {
                if (FrameTween._tweens[i].update(cFrame)) {
                    i++;
                } else {
                    FrameTween._tweens.splice(i, 1);
                }
            }
            return true;
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.animation");
    var FrameTween = ns.FrameTween;
    var EventDispatcher = MKK.getNamespace("mkk.event").EventDispatcher;
    if (!ns.TweenEach) {
        var TweenEach = function TweenEach(object) {
            this._object = object;
            this._scrubbable = true;
            this._valuesStart = {};
            this._valuesEnd = {};
            this._valuesStartRepeat = {};
            this._duration = 1e3;
            this._repeat = 0;
            this._yoyo = false;
            this._isPlaying = false;
            this._reversed = false;
            this._delayTime = 0;
            this._startTime = null;
            this._easingFunction = TWEEN.Easing.Linear.None;
            this._interpolationFunction = TWEEN.Interpolation.Linear;
            this._chainedTweens = [];
            this._nextCallback = null;
            this._onStartCallback = null;
            this._onStartCallbackFired = false;
            this._onCompleteCallbackFired = false;
            this._onUpdateCallback = null;
            this._onCompleteCallback = null;
            this._onStopCallback = null;
            for (var field in object) {
                this._valuesStart[field] = parseFloat(object[field], 10);
            }
        };
        ns.TweenEach = TweenEach;
        var p = TweenEach.prototype = new EventDispatcher();
        p.to = function(properties, duration) {
            if (duration !== undefined) {
                this._duration = duration;
            }
            this._valuesEnd = properties;
            return this;
        };
        p.start = function(time) {
            FrameTween.add(this);
            this._isPlaying = true;
            this._onStartCallbackFired = false;
            this._onCompleteCallbackFired = true;
            this._startTime = time || 0;
            this._startTime += this._delayTime;
            for (var property in this._valuesEnd) {
                if (this._valuesEnd[property] instanceof Array) {
                    if (this._valuesEnd[property].length === 0) {
                        continue;
                    }
                    this._valuesEnd[property] = [ this._object[property] ].concat(this._valuesEnd[property]);
                }
                this._valuesStart[property] = this._object[property];
                if (this._valuesStart[property] instanceof Array === false) {
                    this._valuesStart[property] *= 1;
                }
                this._valuesStartRepeat[property] = this._valuesStart[property] || 0;
            }
            return this;
        };
        p.stop = function() {
            if (!this._isPlaying) {
                return this;
            }
            FrameTween.remove(this);
            this._isPlaying = false;
            if (this._onStopCallback !== null) {
                this._onStopCallback.call(this._object);
            }
            this.stopChainedTweens();
            return this;
        };
        p.tweenVars = function() {
            return this._object;
        };
        p.scrub = function(scrub) {
            this._scrubbable = scrub;
            return this;
        };
        p.stopChainedTweens = function() {
            for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
                this._chainedTweens[i].stop();
            }
        };
        p.delay = function(amount) {
            this._delayTime = amount;
            return this;
        };
        p.repeat = function(times) {
            this._repeat = times;
            return this;
        };
        p.yoyo = function(yoyo) {
            this._yoyo = yoyo;
            return this;
        };
        p.easing = function(easing) {
            this._easingFunction = easing;
            return this;
        };
        p.interpolation = function(interpolation) {
            this._interpolationFunction = interpolation;
            return this;
        };
        p.chain = function() {
            this._chainedTweens = arguments;
            return this;
        };
        p.onStart = function(callback) {
            this._onStartCallback = callback;
            return this;
        };
        p.onUpdate = function(callback) {
            this._onUpdateCallback = callback;
            return this;
        };
        p.onComplete = function(callback) {
            this._onCompleteCallback = callback;
            return this;
        };
        p.onStop = function(callback) {
            this._onStopCallback = callback;
            return this;
        };
        p.update = function(time) {
            var property;
            if (time < this._startTime) {
                if (this._onStartCallbackFired = true) {
                    this._onStartCallbackFired = false;
                }
                return true;
            } else if (time >= this._startTime + this._duration) {
                if (this._onCompleteCallbackFired = true) {
                    this._onCompleteCallbackFired = false;
                }
                return true;
            }
            var elapsed = (time - this._startTime) / this._duration;
            var value = this._easingFunction(elapsed);
            for (property in this._valuesEnd) {
                var start = this._valuesStart[property] || 0;
                var end = this._valuesEnd[property];
                if (end instanceof Array) {
                    this._object[property] = this._interpolationFunction(end, value);
                } else {
                    if (typeof end === "string") {
                        end = start + parseFloat(end, 10);
                    }
                    if (typeof end === "number") {
                        this._object[property] = start + (end - start) * value;
                    }
                }
            }
            if (this._onUpdateCallback !== null) {
                this._onUpdateCallback.call(this._object, value);
            }
            if (elapsed <= .01 && this._onStartCallbackFired === false) {
                if (this._onStartCallback !== null) {
                    this._onStartCallback.call(this._object, value);
                }
                this._onStartCallbackFired = true;
                this._onCompleteCallbackFired = false;
            }
            if (elapsed >= .99 && this._onCompleteCallbackFired === false) {
                if (this._onCompleteCallback !== null) {
                    this._onCompleteCallback.call(this._object, value);
                }
                this._onStartCallbackFired = false;
                this._onCompleteCallbackFired = true;
            }
            return true;
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.animation");
    var FrameTween = ns.FrameTween;
    var EventDispatcher = MKK.getNamespace("mkk.event").EventDispatcher;
    if (!ns.TweenEach) {
        var TweenEach = function TweenEach(object) {
            this._object = object;
            this._scrubbable = true;
            this._valuesStart = {};
            this._valuesEnd = {};
            this._valuesStartRepeat = {};
            this._duration = 1e3;
            this._repeat = 0;
            this._yoyo = false;
            this._isPlaying = false;
            this._reversed = false;
            this._delayTime = 0;
            this._startTime = null;
            this._easingFunction = TWEEN.Easing.Linear.None;
            this._interpolationFunction = TWEEN.Interpolation.Linear;
            this._chainedTweens = [];
            this._onStartCallback = null;
            this._onStartCallbackFired = false;
            this._onUpdateCallback = null;
            this._onCompleteCallback = null;
            this._onStopCallback = null;
            for (var field in object) {
                this._valuesStart[field] = parseFloat(object[field], 10);
            }
        };
        ns.TweenEach = TweenEach;
        var p = TweenEach.prototype = new EventDispatcher();
        p.to = function(properties, duration) {
            if (duration !== undefined) {
                this._duration = duration;
            }
            this._valuesEnd = properties;
            return this;
        };
        p.start = function(time) {
            FrameTween.add(this);
            this._isPlaying = true;
            this._onStartCallbackFired = false;
            this._startTime = time || 0;
            this._startTime += this._delayTime;
            for (var property in this._valuesEnd) {
                if (this._valuesEnd[property] instanceof Array) {
                    if (this._valuesEnd[property].length === 0) {
                        continue;
                    }
                    this._valuesEnd[property] = [ this._object[property] ].concat(this._valuesEnd[property]);
                }
                this._valuesStart[property] = this._object[property];
                if (this._valuesStart[property] instanceof Array === false) {
                    this._valuesStart[property] *= 1;
                }
                this._valuesStartRepeat[property] = this._valuesStart[property] || 0;
            }
            return this;
        };
        p.stop = function() {
            if (!this._isPlaying) {
                return this;
            }
            FrameTween.remove(this);
            this._isPlaying = false;
            if (this._onStopCallback !== null) {
                this._onStopCallback.call(this._object);
            }
            this.stopChainedTweens();
            return this;
        };
        p.tweenVars = function() {
            return this._object;
        };
        p.scrub = function(scrub) {
            this._scrubbable = scrub;
            return this;
        };
        p.stopChainedTweens = function() {
            for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
                this._chainedTweens[i].stop();
            }
        };
        p.delay = function(amount) {
            this._delayTime = amount;
            return this;
        };
        p.repeat = function(times) {
            this._repeat = times;
            return this;
        };
        p.yoyo = function(yoyo) {
            this._yoyo = yoyo;
            return this;
        };
        p.easing = function(easing) {
            this._easingFunction = easing;
            return this;
        };
        p.interpolation = function(interpolation) {
            this._interpolationFunction = interpolation;
            return this;
        };
        p.chain = function() {
            this._chainedTweens = arguments;
            return this;
        };
        p.onStart = function(callback) {
            this._onStartCallback = callback;
            return this;
        };
        p.onUpdate = function(callback) {
            this._onUpdateCallback = callback;
            return this;
        };
        p.onComplete = function(callback) {
            this._onCompleteCallback = callback;
            return this;
        };
        p.onStop = function(callback) {
            this._onStopCallback = callback;
            return this;
        };
        p.update = function(time) {
            var property;
            if (time < this._startTime) {
                return true;
            }
            if (this._onStartCallbackFired === false) {
                if (this._onStartCallback !== null) {
                    this._onStartCallback.call(this._object);
                }
                this._onStartCallbackFired = true;
            }
            var elapsed = (time - this._startTime) / this._duration;
            elapsed = elapsed > 1 ? 1 : elapsed;
            var value = this._easingFunction(elapsed);
            for (property in this._valuesEnd) {
                var start = this._valuesStart[property] || 0;
                var end = this._valuesEnd[property];
                if (end instanceof Array) {
                    this._object[property] = this._interpolationFunction(end, value);
                } else {
                    if (typeof end === "string") {
                        end = start + parseFloat(end, 10);
                    }
                    if (typeof end === "number") {
                        this._object[property] = start + (end - start) * value;
                    }
                }
            }
            if (this._onUpdateCallback !== null && time >= this._startTime && time < this._startTime + this._duration) {
                this._onUpdateCallback.call(this._object, value);
            }
            if (elapsed == 1) {
                if (this._repeat > 0 || this._scrubbable) {
                    if (isFinite(this._repeat)) {
                        this._repeat--;
                    }
                    for (property in this._valuesStartRepeat) {
                        if (typeof this._valuesEnd[property] === "string") {
                            this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property], 10);
                        }
                        if (this._yoyo) {
                            var tmp = this._valuesStartRepeat[property];
                            this._valuesStartRepeat[property] = this._valuesEnd[property];
                            this._valuesEnd[property] = tmp;
                        }
                        this._valuesStart[property] = this._valuesStartRepeat[property];
                    }
                    if (this._yoyo) {
                        this._reversed = !this._reversed;
                    }
                    if (!this._scrubbable) this._startTime = time + this._delayTime;
                    return true;
                } else {
                    if (this._onCompleteCallback !== null) {
                        this._onCompleteCallback.call(this._object);
                    }
                    for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
                        this._chainedTweens[i].start(time);
                    }
                    return false;
                }
            }
            return true;
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var MathBase = MKK.getNamespace("mkk.math").MathBase;
    var EventDispatcher = MKK.getNamespace("mkk.event").EventDispatcher;
    if (!ns.AbElement) {
        var AbElement = function AbElement() {
            this.oPos = null;
            this.cPos = null;
            this.offPos = null;
            this.setupComplete = false;
        };
        ns.AbElement = AbElement;
        var p = AbElement.prototype = new EventDispatcher();
        p.setup = function(x, y) {
            this._setup(x, y);
        };
        p._setup = function(x, y) {
            this._preSetup(x, y);
        };
        p._preSetup = function(x, y) {
            this.oPos = new PIXI.Point(x, y);
            this.cPos = new PIXI.Point(x, y);
            this.offPos = new PIXI.Point(0, 0);
        };
        p._postSetup = function() {
            this.setupComplete = true;
        };
        p.destroy = function() {
            _this._destroy();
        };
        p._destroy = function() {};
        p.init = function() {
            this._init();
        };
        p._init = function() {};
        p.update = function() {
            this._update();
        };
        p._update = function() {};
        p.scale = function(factor) {
            this.container.scale.x = this.container.scale.y = factor;
        };
        p.offsetX = function(x) {
            if (x) {
                this.offPos.x = x;
            }
            return this.offPos.x;
        };
        p.offsetY = function(y) {
            if (y) {
                this.offPos.y = y;
            }
            return this.offPos.y;
        };
        p.xPos = function(x) {
            if (x) {
                this.cPos.x = x;
                this.container.x = this.cPos.x + this.offPos.x;
            }
            return this.cPos.x;
        };
        p.yPos = function(y) {
            if (y != undefined) {
                this.cPos.y = y;
                this.container.y = this.cPos.y + this.offPos.y;
            }
            return this.cPos.y;
        };
        p.realXPos = function() {
            return this.container.x;
        };
        p.realYPos = function() {
            return this.container.y;
        };
        p.rotate = function(e) {
            this.container.rotation = MathBase.PI2 * e;
        };
        p.position = function(x, y) {
            this.cPos.x = x;
            this.cPos.y = y;
            this.container.x = this.cPos.x + this.offPos.x;
            this.container.y = this.cPos.y + this.offPos.y;
        };
        p.opacity = function(e) {
            this.container.alpha = e;
        };
        p.mask = function(xX, yY, wW, hH, type) {
            if (!this.maskObj) {
                this.maskObj = new PIXI.Graphics();
                this.container.addChild(this.maskObj);
            }
            this.maskObj.clear();
            this.maskObj.beginFill(9160191, 1);
            switch (type) {
              default:
              case "rect":
                this.maskObj.drawRect(0, 0, wW, hH);
                break;

              case "round":
                break;
            }
            this.maskObj.endFill();
            this.maskObj.position.x = xX;
            this.maskObj.position.y = yY;
        };
        p.showMask = function() {
            if (this.container.mask) return;
            this.container.mask = this.maskObj;
        };
        p.hideMask = function() {
            if (this.container.mask) this.container.mask = null;
        };
        p.show = function() {
            this.container.visible = true;
        };
        p.hide = function() {
            this.container.visible = false;
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var AbElement = MKK.getNamespace("app.scene").AbElement;
    if (!ns.AbSprite) {
        var AbSprite = function AbSprite(name, x, y, z, aX, aY) {
            this.name = name;
            this.z = z;
            this.setup(x, y);
            this.container = PIXI.Sprite.fromFrame(name);
            this.container.position = this.cPos;
            this.container.anchor.x = aX || 0;
            this.container.anchor.y = aY || 0;
        };
        ns.AbSprite = AbSprite;
        var p = AbSprite.prototype = new AbElement();
        p.update = function() {};
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var AbElement = ns.AbElement;
    var AbSprite = ns.AbSprite;
    if (!ns.AbContainer) {
        var AbContainer = function AbContainer() {
            this.container = null;
            this.startFrame = 0;
            this.curFrame = 0;
            this.duration = 0;
            this.maskObj = null;
            this.element = [];
        };
        ns.AbContainer = AbContainer;
        var p = AbContainer.prototype = new AbElement();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            this._postSetup();
        };
        p._setup = function(sFrame, duration, x, y) {
            this._preSetup(x, y);
            this.container = new PIXI.DisplayObjectContainer();
            this.container.position = this.oPos.clone();
            this.startFrame = sFrame;
            this.duration = duration;
        };
        p.destroy = function() {
            this.close();
            this._destroy();
        };
        p.close = function() {};
        p.init = function() {
            this._init();
        };
        p.open = function() {};
        p.localCurFrame = function(frame) {
            return frame - this.startFrame;
        };
        p.update = function() {
            this._update();
        };
        p.__update = function(frame) {
            this._update(frame);
        };
        p._update = function(frame) {
            this.container.position.x = this.cPos.x + this.offPos.x;
            this.container.position.y = this.cPos.y + this.offPos.y;
        };
        p.addSprite = function(name, x, y, z, aX, aY) {
            var tmp = new AbSprite(name, x, y, z, aX, aY);
            this.element.push(tmp);
            this.container.addChild(tmp.container);
            return tmp;
        };
        p.animateIn = function(frame, duration, callback) {};
        p.animateOut = function(frame, duration, callback) {};
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var settings = MKK.getNamespace("data").settings;
    var AbContainer = ns.AbContainer;
    if (!ns.AbLevel) {
        var AbLevel = function AbLevel(name) {
            this.name = name;
            this.scene = null;
            this.isTiltable = false;
            this.isReversed = false;
            this.depthLevel = settings.depthLevel;
            this.z = 0;
            this.element = [];
            this.isframeControlled = true;
        };
        ns.AbLevel = AbLevel;
        var p = AbLevel.prototype = new AbContainer();
        p.setup = function(x, y, z) {
            this._setup(x, y);
            if (z != null || z != undefined) this.z = z;
        };
        p.init = function(scene) {
            this._init();
        };
        p.addElement = function(el) {
            this.element.push(el);
            this.container.addChild(el);
        };
        p.removeElement = function(el) {
            var index = this.element.indexOf(el);
            if (index > -1) {
                this.container.removeChild(el);
                this.element.splice(index, 1);
            }
        };
        p.frameControlled = function(e) {
            if (e != undefined) {
                this.isframeControlled = e;
            }
            return this.isframeControlled;
        };
        p.update = function(frame) {
            if (this.isframeControlled) {
                this._update(frame);
            }
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var AbContainer = ns.AbContainer;
    var AbLevel = ns.AbLevel;
    var settings = MKK.getNamespace("data").settings;
    if (!ns.AbScene) {
        var AbScene = function AbScene(width, height) {
            this.width = width ? width : settings.defaultWidth;
            this.height = height ? height : settings.defaultHeight;
            this.stage = null;
            this.element = [];
            this.level = [];
        };
        ns.AbScene = AbScene;
        var p = AbScene.prototype = new AbContainer();
        p.init = function(stage) {
            this._init();
            this.stage = stage;
            this.stage.addChild(this.container);
            this.open();
        };
        p.open = function() {};
        p.update = function() {
            this.__update();
        };
        p.__update = function(frame) {
            var sT = this.startFrame;
            var sD = this.startFrame + this.duration;
            this._update(frame);
            if (frame <= sT || frame > sD) {
                this.container.visible = false;
            } else {
                this.container.visible = true;
            }
        };
        p.createSection = function(startTime, endTime, callback) {};
        p.createLevels = function(arr, levelClass) {
            var aLen = arr.length;
            for (var i = 0; i < aLen; i++) {
                var tmp = new levelClass(arr[i].name);
                tmp.setup(arr[i].x, arr[i].y, arr[i].z);
                this.addLevel(tmp);
            }
        };
        p.addLevel = function(oLevel) {
            this.container.addChild(oLevel.container);
            this.level.push(oLevel);
        };
        p.removeLevel = function(oLevel) {
            var index = this.level.indexOf(oLevel);
            if (index > -1) {
                this.container.removeChild(oLevel.container);
                this.level.splice(index, 1);
            }
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var AbElement = MKK.getNamespace("app.scene").AbElement;
    var settings = MKK.getNamespace("data").settings;
    if (!ns.ElRect) {
        var ElRect = function ElRect(x, y, z, width, height, color) {
            this.width = width;
            this.height = height;
            this.z = z;
            this.setup(x, y);
            this.container = new PIXI.Graphics();
            this.color = color;
            this.container.beginFill(this.color);
            this.container.drawRect(this.cPos.x, this.cPos.y, this.width, this.height);
            this.container.endFill();
        };
        ns.ElRect = ElRect;
        var p = ElRect.prototype = new AbElement();
        p.update = function() {};
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var AbElement = MKK.getNamespace("app.scene").AbElement;
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var MathBase = MKK.getNamespace("mkk.math").MathBase;
    if (!ns.ElRotatingSprite) {
        var ElRotatingSprite = function ElRotatingSprite(name, x, y, z, velo, aX, aY) {
            this.name = name;
            this.z = z;
            this.setup(x, y);
            this.container = PIXI.Sprite.fromFrame(name);
            this.container.position = this.cPos;
            this.container.anchor.x = aX || 0;
            this.container.anchor.y = aY || 0;
            this._velocity = velo || 1e3;
            this._direction = 1;
            if (this._velocity < 0) this._direction = -1;
            this._speed = Math.abs(this._velocity);
            this._repeat = Infinity;
            var tweenUpdateBound = ListenerFunctions.createListenerFunction(this, this.tweenUpdate);
            this.tweener = new TWEEN.Tween({
                rotation: 0
            }).to({
                rotation: 1
            }, this._speed).onUpdate(tweenUpdateBound);
        };
        ns.ElRotatingSprite = ElRotatingSprite;
        var p = ElRotatingSprite.prototype = new AbElement();
        p.start = function() {
            this.tweener.repeat(this._repeat).start();
        };
        p.update = function() {};
        p.tweenUpdate = function(e) {
            this.container.rotation = e * MathBase.PI2 * this._direction;
        };
        p.repeat = function(re) {
            if (re) this._repeat = re;
            return this._repeat;
        };
        p.velocity = function(sp) {
            if (sp) this._velocity = sp;
            return this._velocity;
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var AbElement = MKK.getNamespace("app.scene").AbElement;
    if (!ns.ElSprite) {
        var ElSprite = function ElSprite(name, x, y, z, aX, aY) {
            this.name = name;
            this.z = z;
            this.setup(x, y);
            this.container = PIXI.Sprite.fromFrame(name);
            this.container.position = this.cPos;
            this.container.anchor.x = aX || 0;
            this.container.anchor.y = aY || 0;
        };
        ns.ElSprite = ElSprite;
        var p = ElSprite.prototype = new AbElement();
        p.update = function() {};
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    var ElSprite = ns.ElSprite;
    if (!ns.ElSpriteContainer) {
        var ElSpriteContainer = function ElSpriteContainer(name, sFrame, duration, x, y, z) {
            this.name = name;
            this.isTiltable = false;
            this.depthLevel = settings.depthLevel;
            this.z = z || 0;
            this.sprite = [];
            this.element = [];
            this.setup(sFrame, duration, x, y, z);
        };
        ns.ElSpriteContainer = ElSpriteContainer;
        var p = ElSpriteContainer.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y, z) {
            this._setup(sFrame, duration, x, y);
            if (z != null || z != undefined) this.z = z;
        };
        p.init = function() {
            this._init();
        };
        p.addSprite = function(name, x, y, z, aX, aY) {
            var tmp = new ElSprite(name, x, y, z, aX, aY);
            this.sprite.push(tmp);
            this.container.addChild(tmp.container);
            return tmp;
        };
        p.addElement = function(obj) {
            this.element.push(obj);
            this.container.addChild(obj);
        };
        p.update = function(frame) {
            this._update(frame);
            var el = this.sprite;
            var elLen = this.sprite.length;
            for (var i = 0; i < elLen; i++) {}
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var AbElement = MKK.getNamespace("app.scene").AbElement;
    var settings = MKK.getNamespace("data").settings;
    if (!ns.ElText) {
        var ElText = function ElText(txt, x, y, z, aX, aY, style) {
            this.txt = txt ? txt : "";
            this.z = z;
            this.setup(x, y);
            this.container = new PIXI.Text(this.txt, settings.defaultTextStyle);
            this.container.position = this.cPos;
            this.container.anchor.x = aX || 0;
            this.container.anchor.y = aY || 0;
        };
        ns.ElText = ElText;
        var p = ElText.prototype = new AbElement();
        p.setStyle = function(style) {
            this.container.setStyle(style);
        };
        p.setTxt = function(txt) {
            this.txt = txt;
        };
        p.getTxt = function() {
            return this.txt;
        };
        p.update = function() {
            this.container.setText(this.txt);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    var ElRect = ns.ElRect;
    var ElText = ns.ElText;
    var scenedata = MKK.getNamespace("data").settings;
    var scenedata = MKK.getNamespace("data").scenedata;
    var styledata = MKK.getNamespace("data").styledata;
    if (!ns.ElDescription) {
        var ElDescription = function ElDescription(title, body, products, styling, sFrame, duration, x, y, z, animateIn, animateOut, animateDuration) {
            this.name = name;
            this.container = new PIXI.DisplayObjectContainer();
            this.titleTxt = title.split("\n");
            this.bodyTxt = body;
            this.productTxt = products;
            this.title = [];
            this.styling = styling || styling == "" ? styling : "blue";
            this.duration = duration || 600;
            this.delayFactor = 40;
            this.animateIn = animateIn || 0;
            this.animateOut = animateOut || 200;
            this.animateDuration = animateDuration || 200;
            this.setup(sFrame, duration, x, y);
            this.z = z;
            this.container.position = this.cPos;
        };
        ns.ElDescription = ElDescription;
        var p = ElDescription.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            switch (this.styling) {
              case "blue":
                this.titleStyle = styledata.descriptionTitleBlue;
                this.bodyStyle = styledata.descriptionBodyBlue;
                break;

              case "white":
                this.titleStyle = styledata.descriptionTitleWhite;
                this.bodyStyle = styledata.descriptionBodyWhite;
                break;

              default:
              case "grey":
                this.titleStyle = styledata.descriptionTitle;
                this.bodyStyle = styledata.descriptionBody;
                break;
            }
            this.barColour = parseInt(this.titleStyle.fill.replace("#", "0x"));
            for (var i = 0; i < this.titleTxt.length; i++) {
                this.title[i] = new ElText(this.titleTxt[i], 0, 40 + settings.defaultDescriptionLineHeight * i, 0, 0, 0);
                this.title[i].setStyle(this.titleStyle);
                this.container.addChild(this.title[i].container);
                this.title[i].opacity(0);
            }
            var tVertical = this.title[this.title.length - 1].container.y + this.title[this.title.length - 1].container.height + settings.defaultDescriptionGap / 2;
            this.trect = new ElRect(0, tVertical - 5, 0, 350, 2, this.barColour);
            this.container.addChild(this.trect.container);
            this.trect.opacity(0);
            var descTop = this.title[this.title.length - 1].container.y + this.title[this.title.length - 1].container.height + settings.defaultDescriptionGap;
            this.description = new ElText(this.bodyTxt, 0, descTop, 0, 0, 0);
            this.description.setStyle(this.bodyStyle);
            this.container.addChild(this.description.container);
            this.description.opacity(0);
            var tweenTitleBound = ListenerFunctions.createListenerFunction(this, this.tweenTitle);
            this.tween0 = this.createAnimateInTween(tweenTitleBound, 0);
            var tweenLineBound = ListenerFunctions.createListenerFunction(this, this.tweenLine);
            this.tween1 = this.createAnimateInTween(tweenLineBound, this.delayFactor);
            var tweenDescBound = ListenerFunctions.createListenerFunction(this, this.tweenDesc);
            this.tween2 = this.createAnimateInTween(tweenDescBound, this.delayFactor * 2);
            var tweenOutBound = ListenerFunctions.createListenerFunction(this, this.tweenOut);
            this.tween3 = this.createAnimateOutTween(tweenOutBound);
        };
        p.open = function() {};
        p.update = function(frame) {
            this._update(frame);
            var cFrame = this.localCurFrame(frame);
        };
        p.createAnimateInTween = function(func, delay) {
            var tmp = new TweenEach({
                x: -30,
                opacity: 0
            }).to({
                x: 0,
                opacity: 1
            }, this.animateDuration).easing(TWEEN.Easing.Exponential.InOut).onUpdate(func).delay(this.startFrame + this.animateIn + delay).start();
            return tmp;
        };
        p.createAnimateOutTween = function(func) {
            var tmp = new TweenEach({
                x: 0,
                opacity: 1
            }).to({
                x: -30,
                opacity: 0
            }, this.animateDuration).easing(TWEEN.Easing.Exponential.InOut).onUpdate(func).delay(this.startFrame + this.duration - this.animateDuration - this.animateOut).start();
            return tmp;
        };
        p.tweenTitle = function(e) {
            var cObj = this.tween0.tweenVars();
            for (var i = 0; i < this.title.length; i++) {
                this.title[i].container.x = cObj.x;
                this.title[i].opacity(e);
            }
        };
        p.tweenLine = function(e) {
            var cObj = this.tween2.tweenVars();
            this.description.container.x = cObj.x;
            this.description.opacity(e);
        };
        p.tweenDesc = function(e) {
            var cObj = this.tween1.tweenVars();
            this.trect.container.x = cObj.x;
            this.trect.opacity(e);
        };
        p.tweenOut = function(e) {
            var cObj = this.tween3.tweenVars();
            for (var i = 0; i < this.title.length; i++) {
                this.title[i].container.x = cObj.x;
                this.title[i].opacity(1 - e);
            }
            this.description.container.x = cObj.x;
            this.description.opacity(1 - e);
            this.trect.container.x = cObj.x;
            this.trect.opacity(1 - e);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var ElSprite = ns.ElSprite;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    if (!ns.ElDrill) {
        var ElDrill = function ElDrill(startFrame, duration, x, y, z) {
            this.name = name;
            this.z = z;
            this._speed = 600;
            this.bitsPos = [ {
                y: 80,
                toy: 100,
                scale: 1
            }, {
                y: 100,
                toy: 120,
                scale: 1
            }, {
                y: 120,
                toy: 140,
                scale: 1
            }, {
                y: 140,
                toy: 160,
                scale: .9
            }, {
                y: 160,
                toy: 180,
                scale: .2
            } ];
            this.drillbits = [];
            this.setup(startFrame, duration, x, y);
        };
        ns.ElDrill = ElDrill;
        var p = ElDrill.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            this.drilHook = new ElSprite("oilrig-large-drill-dynamic-holder.png", 0, -135, 0, .5, 0);
            this.container.addChild(this.drilHook.container);
            this.drilMain = new ElSprite("oilrig-large-drill-dynamic.png", 0, 0, 0, .5, 0);
            this.container.addChild(this.drilMain.container);
            this.bitContainer = new PIXI.DisplayObjectContainer();
            this.bitContainer.position.x = 0;
            this.bitContainer.position.y = 0;
            this.maskObj = new PIXI.Graphics();
            this.maskObj.clear();
            this.maskObj.beginFill(9160191, 1);
            this.maskObj.drawRect(0, 0, 50, 110);
            this.maskObj.endFill();
            this.maskObj.position.x = -25;
            this.maskObj.position.y = 88;
            this.bitContainer.mask = this.maskObj;
            this.bitContainer.addChild(this.maskObj);
            this.container.addChild(this.bitContainer);
            this.createBits();
            var tB = this.bitsPos;
            var that = this;
            var tweenUpdateBound = function(e) {
                that.tweenUpdate(e, this);
            };
            this.tweener = new TWEEN.Tween({
                y1: tB[0].y,
                y2: tB[1].y,
                y3: tB[2].y,
                y4: tB[3].y,
                y5: tB[4].y,
                scale4: 1,
                scale5: 1
            }).to({
                y1: tB[0].toy,
                y2: tB[1].toy,
                y3: tB[2].toy,
                y4: tB[3].toy,
                y5: tB[4].toy,
                scale4: tB[3].scale,
                scale5: tB[4].scale
            }, this._speed).repeat(Infinity).onUpdate(tweenUpdateBound).start();
        };
        p.createBits = function() {
            var tB = this.bitsPos;
            for (var i = 0; i < tB.length; i++) {
                var tmp = new ElSprite("oilrig-large-drill-dynamic-spiral.png", 0, tB[i].y, 0, .5, .5);
                this.drillbits.push(tmp);
                this.bitContainer.addChild(tmp.container);
            }
        };
        p.tweenUpdate = function(e, ta) {
            this.drillbits[0].yPos(ta.y1);
            this.drillbits[1].yPos(ta.y2);
            this.drillbits[2].yPos(ta.y3);
            this.drillbits[3].yPos(ta.y4);
            this.drillbits[4].yPos(ta.y5);
            this.drillbits[3].scale(ta.scale4);
            this.drillbits[4].scale(ta.scale5);
        };
        p.updateInner = function(level) {};
        p.update = function() {};
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    var ElSprite = ns.ElSprite;
    var ElRotatingSprite = ns.ElRotatingSprite;
    var scenedata = MKK.getNamespace("data").scenedata;
    if (!ns.ElEngine) {
        var ElEngine = function ElEngine(sFrame, duration, x, y, z, isColorBlue) {
            this.name = name;
            this.base = [];
            this.pistons = [];
            this.drives = [];
            this.container = new PIXI.DisplayObjectContainer();
            this.color = isColorBlue == true ? "_blue" : "";
            this.setup(sFrame, duration, x, y);
            this.z = z;
            this.container.position = this.cPos;
        };
        ns.ElEngine = ElEngine;
        var p = ElEngine.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            this._speed = 350;
            this._repeat = 1e3;
            this.addBase("engine-base" + this.color + ".png", 0, 0, 0, .5, .5);
            this.addPiston("engine-piston" + this.color + ".png", -68, 13, 0, .5, .5);
            this.addPiston("engine-piston" + this.color + ".png", -23, -14, 0, .5, .5);
            this.addPiston("engine-piston" + this.color + ".png", 24, -14, 0, .5, .5);
            this.addPiston("engine-piston" + this.color + ".png", 70, 13, 0, .5, .5);
            this.addDrive("engine-drive" + this.color + ".png", -56, 35, 0, .5, .5);
            this.addDrive("engine-drive" + this.color + ".png", -36, 22, 0, .5, .5);
            this.addDrive("engine-drive" + this.color + ".png", 36, 22, 0, .5, .5);
            this.addDrive("engine-drive" + this.color + ".png", 57, 35, 0, .5, .5);
            var that = this;
            var tweenUpdateBound = function(e) {
                that.pistons[0].yPos(this.y);
                that.pistons[3].yPos(this.y);
            };
            this.tweener1 = new TWEEN.Tween({
                y: 13
            }).to({
                y: -14
            }, this._speed).easing(TWEEN.Easing.Cubic.InOut).repeat(Infinity).yoyo(true).onUpdate(tweenUpdateBound);
            var tweenUpdate2Bound = function(e) {
                that.pistons[1].yPos(this.y);
                that.pistons[2].yPos(this.y);
            };
            this.tweener2 = new TWEEN.Tween({
                y: -14
            }).to({
                y: 13
            }, this._speed).easing(TWEEN.Easing.Cubic.InOut).repeat(Infinity).yoyo(true).onUpdate(tweenUpdate2Bound);
            var tweenUpdate3Bound = function(e) {
                that.drives[0].yPos(this.y);
                that.drives[3].yPos(this.y);
            };
            this.tweener3 = new TWEEN.Tween({
                y: 35
            }).to({
                y: 22
            }, this._speed).easing(TWEEN.Easing.Cubic.InOut).repeat(Infinity).yoyo(true).onUpdate(tweenUpdate3Bound);
            var tweenUpdate4Bound = function(e) {
                that.drives[1].yPos(this.y);
                that.drives[2].yPos(this.y);
            };
            this.tweener4 = new TWEEN.Tween({
                y: 22
            }).to({
                y: 35
            }, this._speed).easing(TWEEN.Easing.Cubic.InOut).repeat(Infinity).yoyo(true).onUpdate(tweenUpdate4Bound);
            this.start();
        };
        p.open = function() {};
        p.start = function() {
            this.tweener1.start();
            this.tweener2.start();
            this.tweener3.start();
            this.tweener4.start();
        };
        p.stop = function() {
            this.tweener1.stop();
            this.tweener2.stop();
            this.tweener3.stop();
            this.tweener4.stop();
        };
        p.addBase = function(name, x, y, z, aX, aY) {
            var tmp = new ElSprite(name, x, y, z, aX, aY);
            this.base.push(tmp);
            this.container.addChild(tmp.container);
        };
        p.addPiston = function(name, x, y, z, aX, aY) {
            var tmp = new ElSprite(name, x, y, z, aX, aY);
            this.pistons.push(tmp);
            this.container.addChild(tmp.container);
        };
        p.addDrive = function(name, x, y, z, aX, aY) {
            var tmp = new ElSprite(name, x, y, z, aX, aY);
            this.drives.push(tmp);
            this.container.addChild(tmp.container);
        };
        p.update = function(frame) {
            this._update(frame);
            var cFrame = this.localCurFrame(frame);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ElSprite = ns.ElSprite;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    if (!ns.ElFpso) {
        var ElFpso = function ElFpso(startFrame, duration, x, y, z) {
            this.name = name;
            this.holeName = "oilrig-drill-hole.png";
            this.z = z;
            this.element = [];
            this.setup(startFrame, duration, x, y);
        };
        ns.ElFpso = ElFpso;
        var p = ElFpso.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            this.addSprite("fpso_01.png", 0, 0, 0, 0, 0);
            this.addSprite("fpso_02.png", 213, 0, 0, 0, 0);
            this.addSprite("fpso_03.png", 547, 0, 0, 0, 0);
            this.addSprite("fpso_04.png", 902, 0, 0, 0, 0);
            this.addSprite("fpso_05.png", 1480, 0, 0, 0, 0);
        };
        p.update = function() {};
        p.addSprite = function(name, x, y, z, aX, aY) {
            var tmp = new ElSprite(name, x, y, z, aX, aY);
            this.element.push(tmp);
            this.container.addChild(tmp.container);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var AbElement = MKK.getNamespace("app.scene").AbElement;
    var settings = MKK.getNamespace("data").settings;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    if (!ns.ElGrowRect) {
        var ElGrowRect = function ElGrowRect(x, y, z, width, height, toWidth, toHeight, sFrame, duration, color) {
            this.width = width;
            this.height = height;
            this.toWidth = toWidth;
            this.toHeight = toHeight;
            this.startFrame = sFrame;
            this.duration = duration;
            this.z = z;
            this.setup(x, y);
            this.container = new PIXI.Graphics();
            this.color = color;
            this.container.beginFill(this.color);
            this.container.drawRect(this.cPos.x, this.cPos.y, this.width, this.height);
            this.container.endFill();
            console.log("lala");
        };
        ns.ElGrowRect = ElGrowRect;
        var p = ElGrowRect.prototype = new AbElement();
        p.setup = function(x, y) {
            p._setup(x, y);
            var tweenRectBound = ListenerFunctions.createListenerFunction(this, this.tweenRect);
            this.tween0 = new TweenEach({
                width: this.width,
                height: this.height
            }).to({
                width: this.toWidth,
                height: this.toHeight
            }, this.duration).easing(TWEEN.Easing.Exponential.InOut).onUpdate(tweenRectBound).delay(this.startFrame).start();
        };
        p.update = function() {};
        p.tweenRect = function(e) {
            var cObj = this.tween0.tweenVars();
            this.container.clear();
            this.container.beginFill(this.color);
            this.container.drawRect(this.cPos.x, this.cPos.y, cObj.width, cObj.height);
            this.container.endFill();
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    var ElSprite = ns.ElSprite;
    var ElRotatingSprite = ns.ElRotatingSprite;
    var scenedata = MKK.getNamespace("data").scenedata;
    if (!ns.ElHelicopter) {
        var ElHelicopter = function ElHelicopter(sFrame, duration, x, y) {
            this.name = name;
            this.element = [];
            this.container = new PIXI.DisplayObjectContainer();
            this.setup(sFrame, duration, x, y);
            this.z = scenedata.scene2.element.radar.z;
            this.container.position = this.cPos;
        };
        ns.ElHelicopter = ElHelicopter;
        var p = ElHelicopter.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            this.sign = this.addSprite("helicopter-sign.png", 0, 30, 0, 0, 0, 0);
            this.addSprite("helicopter.png", 0, 0, 0, 0, 0);
            this.blade = new ElRotatingSprite("helicopter_blade.png", 30, 30, 0, 2e3, .5, .5);
            this.blade.start();
            this.container.addChild(this.blade.container);
        };
        p.open = function() {};
        p.addSprite = function(name, x, y, z, aX, aY) {
            var tmp = new ElSprite(name, x, y, z, aX, aY);
            this.element.push(tmp);
            this.container.addChild(tmp.container);
            return tmp;
        };
        p.showSign = function() {
            this.sign.show();
        };
        p.hideSign = function() {
            this.sign.hide();
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ElSprite = ns.ElSprite;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    if (!ns.ElOilCave) {
        var ElOilCave = function ElOilCave(name, startFrame, duration, x, y, z, sLevel) {
            this.name = name;
            this.oilName = "oilrig-cave-oil.png";
            this.baseName = "oilrig-cave-mask.png";
            this.z = z;
            this._level = sLevel || 0;
            this.setup(startFrame, duration, x, y);
        };
        ns.ElOilCave = ElOilCave;
        var p = ElOilCave.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            this.base = new ElSprite(this.baseName, 512, 0, 0, .5, 0);
            this.bg = this.drawBG(50, 50, 900, 400);
            this.oilContainer = new PIXI.DisplayObjectContainer();
            this.oil = new ElSprite(this.oilName, 512, 0, 0, .5, 0);
            this.oilExtend = this.drawExtendedOil(0, 50, 1200, 300);
            this.oilContainer.addChild(this.oilExtend);
            this.oilContainer.addChild(this.oil.container);
            this.container.addChild(this.bg);
            this.container.addChild(this.oilContainer);
            this.container.addChild(this.base.container);
            this.updateLevel(0);
        };
        p.drawExtendedOil = function(x, y, width, height) {
            var extended = new PIXI.Graphics();
            var oilcolor = settings.defaultOilColor;
            extended.beginFill(oilcolor);
            extended.drawRect(x, y, width, height);
            extended.endFill();
            return extended;
        };
        p.drawBG = function(x, y, width, height) {
            var extended = new PIXI.Graphics();
            var bgcolor = settings.defaultOilBGColor;
            extended.beginFill(bgcolor);
            extended.drawRect(x, y, width, height);
            extended.endFill();
            return extended;
        };
        p.updateLevel = function(e) {
            this.oilContainer.y = 400 - (.2 + e * .8) * 350;
        };
        p.update = function() {};
    }
})();

(function() {
    var MathBase = MKK.getNamespace("mkk.math").MathBase;
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ElSprite = ns.ElSprite;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    if (!ns.ElOilHole) {
        var ElOilHole = function ElOilHole(name, startFrame, duration, x, y, z, sLevel) {
            this.name = name;
            this.holeName = "oilrig-drill-hole.png";
            this.pipeoilName = "oilrig_pipe_oil.png";
            this.z = z;
            this._level = sLevel || 0;
            this.holeX = 512;
            this.holeY = -100;
            this.drillStartY = -1e3;
            this.setup(startFrame, duration, x, y);
        };
        ns.ElOilHole = ElOilHole;
        var p = ElOilHole.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            this.hole = new ElSprite(this.holeName, this.holeX, this.holeY, 0, .5, 0);
            this.masker = this.createMask(485, -50, 55, 705);
            this.casing = this.addCasing(0, 665);
            this.pipe = this.addCasing(-1076, 1076, "pipe");
            this.oilmask = this.createMask(497, 0, 30, 1731);
            this.container.addChild(this.hole.container);
            this.container.addChild(this.masker);
            this.hole.container.mask = this.masker;
            this.createPipeOil();
            this.updateOil(.1);
        };
        p.updateInner = function(level) {};
        p.update = function() {};
        p.createMask = function(x, y, w, h) {
            var casing = new PIXI.Graphics();
            casing.clear();
            casing.beginFill(10066329, 1);
            casing.drawRect(0, 0, w, h);
            casing.endFill();
            casing.position.x = x;
            casing.position.y = y;
            return casing;
        };
        p.setHoleYPos = function(e) {
            this.hole.container.y = -1550 + e * 1450;
        };
        p.showPipe = function() {
            this.pipeOil.visible = true;
            this.pipe.visible = true;
            this.casing.visible = true;
        };
        p.hidePipe = function() {
            this.pipeOil.visible = false;
            this.pipe.visible = false;
            this.casing.visible = false;
        };
        p.addCasing = function(y, h, isPipe) {
            var color = settings.defaultOilBGColor;
            var alpha = .6;
            if (isPipe) {
                color = settings.defaultOilRigBlue;
                this.casing.alpha = 1;
            }
            var casing = new PIXI.Graphics();
            casing.clear();
            casing.beginFill(color, 1);
            casing.drawRect(0, 0, 30, h);
            casing.endFill();
            casing.position.x = 497;
            casing.position.y = y;
            casing.alpha = alpha;
            casing.visible = false;
            this.container.addChild(casing);
            return casing;
        };
        p.createPipeOil = function() {
            this.masker2 = this.createMask(485, -1076, 55, 1745);
            this.pipeOil = new PIXI.DisplayObjectContainer();
            this.pipewave = new ElSprite(this.pipeoilName, 0, 0, 0, 0, 0);
            this.pipeExt = this.drawExtendedOil(0, 28, 30, 1680);
            this.pipeOil.addChild(this.pipewave.container);
            this.pipeOil.addChild(this.pipeExt);
            this.pipeOil.position.x = 497;
            this.pipeOil.position.y = -1047;
            this.pipeOil.mask = this.masker2;
            this.pipeOil.visible = false;
            this.container.addChild(this.masker2);
            this.container.addChild(this.pipeOil);
        };
        p.updateOil = function(e) {
            this.pipeOil.position.y = MathBase.Fit01(e, 670, -1097);
        };
        p.drawExtendedOil = function(x, y, width, height) {
            var extended = new PIXI.Graphics();
            var oilcolor = settings.defaultOilColor;
            extended.beginFill(oilcolor);
            extended.drawRect(x, y, width, height);
            extended.endFill();
            return extended;
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    var ElSprite = ns.ElSprite;
    var ElRotatingSprite = ns.ElRotatingSprite;
    var ElEngine = ns.ElEngine;
    var ElDrill = ns.ElDrill;
    var scenedata = MKK.getNamespace("data").scenedata;
    if (!ns.ElOilrig) {
        var ElOilrig = function ElOilrig(sFrame, duration, x, y, z) {
            this.name = name;
            this.element = [];
            this.fan = [];
            this.container = new PIXI.DisplayObjectContainer();
            this.setup(sFrame, duration, x, y);
            this.z = z;
            this.container.position = this.cPos;
        };
        ns.ElOilrig = ElOilrig;
        var p = ElOilrig.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            this.addCasing();
            this.drillStartY = 1750;
            this.drill = new ElDrill(0, 0, 855, this.drillStartY, 0);
            this.drill.scale(1.8);
            this.container.addChild(this.drill.container);
            this.addSprite("oilrig_01.png", 0, 0, 0, 0, 0);
            this.addSprite("oilrig_02.png", 604, 0, 0, 0, 0);
            this.addSprite("oilrig_03.png", 0, 691, 0, 0, 0);
            this.addSprite("oilrig_04.png", 604, 691, 0, 0, 0);
            this.addSprite("oilrig_05.png", 0, 1073, 0, 0, 0);
            this.addSprite("oilrig_06.png", 604, 1072, 0, 0, 0);
            this.addSprite("oilrig_wave.png", 150, 1215, 0, 0, 0);
            this.addSprite("oilrig_wave.png", 1e3, 1640, 0, 0, 0);
            this.addFan(552, 1290, 0, 2e3);
            this.addFan(1077, 1290, 2e3);
            this.addWire();
            this.element[7].rotate(.75);
            this.needle = new ElSprite("oilrig_needle.png", 1067, 533, 0, .5, .5);
            this.container.addChild(this.needle.container);
            this.engine = new ElEngine(0, 0, 500, 598, 0, true);
            this.engine.scale(.6);
            this.engineShadow = new ElSprite("oilrig_engine_shadow.png", 501, 597, 0, .5, .5);
            this.container.addChild(this.engine.container);
            this.container.addChild(this.engineShadow.container);
        };
        p.open = function() {};
        p.addCasing = function() {
            this.casing = new PIXI.Graphics();
            this.casing.clear();
            this.casing.beginFill(settings.defaultOilRigBlue, 1);
            this.casing.drawRect(0, 0, 100, 3640);
            this.casing.endFill();
            this.casing.position.x = 804;
            this.casing.position.y = 850;
            this.casing.alpha = .6;
            this.container.addChild(this.casing);
        };
        p.addWire = function() {
            this.wire = new PIXI.Graphics();
            this.updateWire(0);
            this.wire.position.x = 850;
            this.wire.position.y = 480;
            this.wire.alpha = .9;
            this.container.addChild(this.wire);
        };
        p.updateWire = function(e) {
            this.wire.clear();
            this.wire.beginFill(settings.defaultOilRigLightBlue, 1);
            this.wire.drawRect(0, 0, 10, 1050 + 4970 * e);
            this.wire.endFill();
        };
        p.addSprite = function(name, x, y, z, aX, aY) {
            var tmp = new ElSprite(name, x, y, z, aX, aY);
            this.element.push(tmp);
            this.container.addChild(tmp.container);
        };
        p.addFan = function(x, y, z, velo) {
            var tmp = new ElRotatingSprite("oilrig_fan_1.png", x, y, z, velo, .5, .5);
            tmp.start();
            this.fan.push(tmp);
            this.container.addChild(tmp.container);
        };
        p.updateNeedle = function(e) {
            this.needle.rotate(e);
        };
        p.scaleDrill = function(e) {
            this.drill.scale(e);
        };
        p.updateDrill = function(e) {
            var pos = this.drillStartY + e * 4820;
            this.drill.yPos(pos);
        };
        p.update = function(frame) {
            this._update(frame);
            var cFrame = this.localCurFrame(frame);
        };
    }
})();

(function() {
    var MathBase = MKK.getNamespace("mkk.math").MathBase;
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    var ElSprite = ns.ElSprite;
    var scenedata = MKK.getNamespace("data").scenedata;
    if (!ns.ElPipe) {
        var ElPipe = function ElPipe(sFrame, duration, x, y, z) {
            this.name = name;
            this.element = [];
            this.container = new PIXI.DisplayObjectContainer();
            this.setup(sFrame, duration, x, y);
            this.z = z;
            this.container.position = this.cPos;
        };
        ns.ElPipe = ElPipe;
        var p = ElPipe.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            this.slope = this.createStraight(0, 21, 300, 9);
            this.slope2 = this.createStraight(304, 21, 300, 9);
            this.slope3 = this.createStraight(600, 21, 2325, 9);
            this.slope3.rotation = -.52;
            this.slope4 = this.createStraight(2600, -1125, 505, 9);
            this.addSprite("pipe-main-joint.png", 3090, -1115, 0, 0, 1);
            this.addSprite("pipe-meter.png", 299, 30, 0, 0, 1);
            this.addSprite("underwater-cross-black.png", 0, 140, 0, 0, 1);
            this.addSprite("pipe-joint.png", -2, 34, 0, 0, 1);
            this.container.addChild(this.slope);
            this.container.addChild(this.slope2);
            this.container.addChild(this.slope3);
            this.container.addChild(this.slope4);
        };
        p.open = function() {};
        p.createStraight = function(x, y, w, h) {
            var casing = new PIXI.Graphics();
            casing.clear();
            casing.beginFill(0, 1);
            casing.drawRect(0, 0, w, h);
            casing.endFill();
            casing.position.x = x;
            casing.position.y = y;
            return casing;
        };
    }
})();

(function() {
    var MathBase = MKK.getNamespace("mkk.math").MathBase;
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    var ElSprite = ns.ElSprite;
    var ElRotatingSprite = ns.ElRotatingSprite;
    var scenedata = MKK.getNamespace("data").scenedata;
    if (!ns.ElProductionRig) {
        var ElProductionRig = function ElProductionRig(sFrame, duration, x, y, z) {
            this.name = name;
            this.element = [];
            this.container = new PIXI.DisplayObjectContainer();
            this.setup(sFrame, duration, x, y);
            this.z = z;
            this.container.position = this.cPos;
        };
        ns.ElProductionRig = ElProductionRig;
        var p = ElProductionRig.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            this.bg2 = this.addSprite("productionrig-bg2.png", 100, 0, 0, 0, 0);
            this.bg1 = this.addSprite("productionrig-bg1.png", 400, 210, 0, 0, 0);
            this.addSprite("productionrig_02.png", 0, 320, 0, 0, 0);
            this.addSprite("productionrig_03.png", 201, 320, 0, 0, 0);
            this.addSprite("productionrig_04.png", 606, 320, 0, 0, 0);
            this.fan = new ElRotatingSprite("productionrig_fan.png", 154, 476, 0, 2e3, .5, .5);
            this.fan.start();
            this.container.addChild(this.fan.container);
        };
        p.open = function() {};
        p.parallaxing = function(e) {
            this.bg2.xPos(MathBase.Fit01(e, 0, 380));
            this.bg1.xPos(MathBase.Fit01(e, 210, 450));
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    var ElSprite = ns.ElSprite;
    var ElRotatingSprite = ns.ElRotatingSprite;
    var scenedata = MKK.getNamespace("data").scenedata;
    if (!ns.ElRadar) {
        var ElRadar = function ElRadar(sFrame, duration, x, y, isReverse, maskx, masky) {
            this.name = name;
            this.element = [];
            this._direction = isReverse ? 1 : 0;
            this.maskx = maskx || -150;
            this.masky = masky || 237;
            this.container = new PIXI.DisplayObjectContainer();
            this.setup(sFrame, duration, x, y);
            this.z = scenedata.scene2.element.radar.z;
            this.container.position = this.cPos;
        };
        ns.ElRadar = ElRadar;
        var p = ElRadar.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y, maskx, masky) {
            this._setup(sFrame, duration, x, y);
            this._radarSpeed = 300;
            this._radarDelay = 310;
            this.round0 = new ElSprite("sonar_bg1.png", 255, 255, 0, .5, .5);
            this.round1 = new ElSprite("sonar_bg1.png", 255, 255, 0, .5, .5);
            this.round2 = new ElSprite("sonar_bg1.png", 255, 255, 0, .5, .5);
            this.round3 = new ElSprite("sonar_bg1.png", 255, 255, 0, .5, .5);
            this.round0.scale(0);
            this.round1.scale(0);
            this.round2.scale(0);
            this.round3.scale(0);
            this.container.addChild(this.round0.container);
            this.container.addChild(this.round1.container);
            this.container.addChild(this.round2.container);
            this.container.addChild(this.round3.container);
            var tweenRoundBound = ListenerFunctions.createListenerFunction(this, this.tweenRound);
            this.tween0 = new TWEEN.Tween({
                scale: .8
            }).easing(TWEEN.Easing.Circular.InOut).to({
                scale: 1
            }, this._radarSpeed).onUpdate(tweenRoundBound).onComplete(function() {
                console.log("lala");
                this.round0.scale(.2);
            });
            var tweenRound2Bound = ListenerFunctions.createListenerFunction(this, this.tweenRound2);
            this.tween2 = new TWEEN.Tween({
                scale: 1
            }).easing(TWEEN.Easing.Circular.InOut).to({
                scale: .8
            }, this._radarSpeed).onUpdate(tweenRound2Bound);
            var tweenRound4Bound = ListenerFunctions.createListenerFunction(this, this.tweenRound4);
            this.tween4 = new TWEEN.Tween({
                scale: 1
            }).easing(TWEEN.Easing.Circular.InOut).to({
                scale: .8
            }, this._radarSpeed).onUpdate(tweenRound4Bound);
            var tweenRound6Bound = ListenerFunctions.createListenerFunction(this, this.tweenRound6);
            this.tween6 = new TWEEN.Tween({
                scale: 1
            }).easing(TWEEN.Easing.Circular.InOut).to({
                scale: .8
            }, this._radarSpeed).onUpdate(tweenRound6Bound);
            this.tween0.repeat(1e3).delay(this._radarDelay * 2).start();
            this.tween2.repeat(1e3).delay(this._radarDelay * 2).start();
            this.tween4.repeat(1e3).delay(this._radarDelay * 2).start();
            this.tween6.repeat(1e3).delay(this._radarDelay * 2).start();
            this.masker = this.createMask(this.maskx, this.masky, 830, 534);
            this.container.addChild(this.masker);
            this.container.mask = this.masker;
        };
        p.open = function() {};
        p.addSprite = function(name, x, y, z, aX, aY) {
            var tmp = new ElSprite(name, x, y, z, aX, aY);
            this.element.push(tmp);
            this.container.addChild(tmp.container);
        };
        p.update = function(frame) {
            this._update(frame);
            var cFrame = this.localCurFrame(frame);
        };
        p.tweenRound = function(e) {
            var sS = Math.abs(e - this._direction);
            this.round0.scale(sS * .2);
        };
        p.tweenRound2 = function(e) {
            var sS = Math.abs(e - this._direction);
            this.round1.scale(sS * .3 + .2);
        };
        p.tweenRound4 = function(e) {
            var sS = Math.abs(e - this._direction);
            this.round2.scale(sS * .5 + .5);
        };
        p.tweenRound6 = function(e) {
            var sS = Math.abs(e - this._direction);
            this.round3.scale(sS * .5 + 1);
            this.round3.opacity(1 - sS);
        };
        p.createMask = function(x, y, wW, hH) {
            var casing = new PIXI.Graphics();
            casing.clear();
            casing.beginFill(3355443, 1);
            casing.drawRect(0, 0, wW, hH);
            casing.endFill();
            casing.position.x = x;
            casing.position.y = y;
            return casing;
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    var ElSprite = ns.ElSprite;
    var ElRotatingSprite = ns.ElRotatingSprite;
    var scenedata = MKK.getNamespace("data").scenedata;
    if (!ns.ElRadarBoat) {
        var ElRadarBoat = function ElRadarBoat(sFrame, duration, x, y, z) {
            this.name = name;
            this.element = [];
            this._showTop = false;
            this.container = new PIXI.DisplayObjectContainer();
            this.fan = [];
            this.setup(sFrame, duration, x, y);
            this.z = z;
            this.container.position = this.cPos;
        };
        ns.ElRadarBoat = ElRadarBoat;
        var p = ElRadarBoat.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            this.part0 = this.addSprite("radar_boat1_01.png", 0, 0, 0, .5, 0);
            this.part1 = this.addSprite("radar_boat1_02.png", 0, 342, 0, .5, 0);
            this.part3 = this.addSprite("radar_boat1_03.png", 0, 668, 0, .5, 0);
            this.part2 = this.addSprite("radar_boat1_04.png", 0, 867, 0, .5, 0);
            this.addFan(250, 1035, 0, 1e3);
            this.addFan(-250, 1035, 0, 1e3);
            this.hideTop();
        };
        p.open = function() {};
        p.showTop = function() {
            this.part0.show();
            this.part1.show();
            this.part3.show();
            this._showTop = true;
        };
        p.hideTop = function() {
            this.part0.hide();
            this.part1.hide();
            this.part3.hide();
            this._showTop = false;
        };
        p.addSprite = function(name, x, y, z, aX, aY) {
            var tmp = new ElSprite(name, x, y, z, aX, aY);
            this.element.push(tmp);
            this.container.addChild(tmp.container);
            return tmp;
        };
        p.addFan = function(x, y, z, velo) {
            var tmp = new ElRotatingSprite("radar_boat1_propeller.png", x, y, z, velo, .5, .5);
            tmp.start();
            this.fan.push(tmp);
            this.container.addChild(tmp.container);
        };
        p.update = function(frame) {
            this._update(frame);
            var cFrame = this.localCurFrame(frame);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    var ElSprite = ns.ElSprite;
    var ElRotatingSprite = ns.ElRotatingSprite;
    var scenedata = MKK.getNamespace("data").scenedata;
    if (!ns.ElRadarBoatSide) {
        var ElRadarBoatSide = function ElRadarBoatSide(sFrame, duration, x, y, z) {
            this.name = name;
            this.element = [];
            this.container = new PIXI.DisplayObjectContainer();
            this.setup(sFrame, duration, x, y);
            this.z = z;
            this.container.position = this.cPos;
        };
        ns.ElRadarBoatSide = ElRadarBoatSide;
        var p = ElRadarBoatSide.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            this.addSprite("radar_boat_small_02.png", 298, 102, 0, 0, 0);
            this.addSprite("radar_boat_small_01.png", 0, 0, 0, 0, 0);
        };
        p.open = function() {};
        p.addSprite = function(name, x, y, z, aX, aY) {
            var tmp = new ElSprite(name, x, y, z, aX, aY);
            this.element.push(tmp);
            this.container.addChild(tmp.container);
        };
        p.update = function(frame) {
            this._update(frame);
            var cFrame = this.localCurFrame(frame);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    if (!ns.ElRain) {
        var ElRain = function ElRain(sFrame, duration, x, y, z, numDrop) {
            this.assetName = "rain-drop.png";
            this.name = name;
            this.z = z;
            this.numDrop = numDrop || 200;
            this.rainArr = [];
            this.speed = 24;
            this.dropSize = 2.2;
            this.windSpeed = 5;
            this.topMargin = -580;
            this.bottomMargin = 768;
            this.rightMargin = 1500;
            this.sizeDeviation = .8;
            this.timeDeviation = 10;
            this.isRaining = false;
            this.beginTime = Date.now();
            this.setup(sFrame, duration, x, y);
            this.show();
        };
        ns.ElRain = ElRain;
        var p = ElRain.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._preSetup(x, y);
            this.container = new PIXI.SpriteBatch();
            this.container.position = this.oPos.clone();
            this.startFrame = sFrame;
            this.duration = duration;
            this.setupRain();
        };
        p.setupRain = function() {
            var tname = this.assetName;
            var rainLen = this.numDrop;
            var rMargin = this.rightMargin;
            var tMargin = this.topMargin;
            var bMargin = this.bottomMargin;
            var sDeviation = this.sizeDeviation;
            var tDeviation = this.timeDeviation;
            var dSize = this.dropSize;
            for (var i = 0; i < rainLen; i++) {
                var xX = Math.random() * rMargin;
                var yY = tMargin * Math.random();
                var size = dSize * (1 - sDeviation) + Math.random() * dSize * sDeviation;
                var velo = .5 * (this.speed + Math.random());
                var tmp = this.addSprite(tname, xX, yY, .5, .5);
                tmp.scale(size);
                this.rainArr[i] = {
                    ox: xX,
                    oy: yY,
                    sprite: tmp,
                    speed: velo,
                    starttime: tDeviation * i
                };
            }
        };
        p.show = function() {
            this.isRaining = true;
        };
        p.hide = function() {
            this.isRaining = false;
        };
        p.animate = function() {
            var rainLen = this.rainArr.length;
            if (!this.isRaining) {
                for (var i = 0; i < rainLen; i++) {
                    var tmpSprite = this.rainArr[i].sprite;
                    tmpSprite.hide();
                }
                return;
            }
            var rMargin = this.rightMargin;
            var tMargin = this.topMargin;
            var bMargin = this.bottomMargin;
            var sDeviation = this.sizeDeviation;
            var wSpeed = this.windSpeed;
            var bTime = this.beginTime;
            var tmpTime = Date.now();
            for (var i = 0; i < rainLen; i++) {
                var stTime = this.rainArr[i].starttime;
                if (tmpTime < bTime + stTime) return;
                var tmpSprite = this.rainArr[i].sprite;
                var tSpeed = this.rainArr[i].speed;
                var tox = this.rainArr[i].ox;
                var toy = this.rainArr[i].oy;
                if (tmpSprite.yPos() < tMargin || tmpSprite.yPos() > bMargin) {
                    tmpSprite.hide();
                } else {
                    tmpSprite.show();
                }
                if (tmpSprite.yPos() <= bMargin) {
                    var ty = tmpSprite.yPos() + tSpeed;
                    var tx = tmpSprite.xPos() - wSpeed;
                    tmpSprite.position(tx, ty);
                } else {
                    tmpSprite.position(tox, toy);
                }
            }
        };
        p.update = function() {};
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var ElText = ns.ElText;
    if (!ns.ElScene1Text) {
        var ElScene1Text = function ElTScene1ext(txt, txtSettings, x, y, z, toX, toY) {
            this.txt = txt;
            this.name = name;
            this.z = z;
            this.setup(x, y);
            this.container = PIXI.Text(txt, txtSettings);
            this.container.position = this.cPos;
        };
        ns.ElScene1Text = ElScene1Text;
        var p = ElScene1Text.prototype = new ElText();
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var AbElement = MKK.getNamespace("app.scene").AbElement;
    if (!ns.ElSeaBG) {
        var ElSeaBG = function ElSeaBG(name, x, y, z, aX, aY, texWidth, texHeight) {
            this.name = name;
            assetName = "sea_gradient.png";
            this.z = z;
            this.setup(x, y);
            this.container = new PIXI.DisplayObjectContainer();
            this.container.position = this.cPos;
            var texWidth = texWidth || 1024;
            var texHeight = texHeight || 1024;
            var gradHeight = texHeight;
            if (texHeight > 1024) {
                var extender = this.drawExtendedSea(this.cPos.x, 1024, texWidth, texHeight - 1024);
                this.container.addChild(extender);
                gradHeight = 1024;
            }
            var texture = PIXI.Texture.fromFrame(assetName);
            var background = new PIXI.TilingSprite(texture, texWidth, gradHeight);
            this.container.addChild(background);
        };
        ns.ElSeaBG = ElSeaBG;
        var p = ElSeaBG.prototype = new AbElement();
        p.drawExtendedSea = function(x, y, width, height) {
            var extended = new PIXI.Graphics();
            var seacolor = settings.defaultSeaColor;
            extended.beginFill(seacolor);
            extended.drawRect(x, y, width, height);
            extended.endFill();
            return extended;
        };
        p.update = function() {};
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    if (!ns.ElSeaBed) {
        var ElSeaBed = function ElSeaBed(sFrame, duration, x, y, z, width) {
            this.name = name;
            this.width = width;
            this.textures = [];
            assetName = [ {
                name: "seaplant_02.png",
                height: 146,
                ypos: -180
            }, {
                name: "seaplant_03.png",
                height: 120,
                ypos: -120
            }, {
                name: "seaplant_01.png",
                height: 43,
                ypos: -43
            } ];
            this.z = z;
            this.setup(sFrame, duration, x, y);
            this.container = new PIXI.DisplayObjectContainer();
            this.container.position = this.cPos;
            this.createTexture();
        };
        ns.ElSeaBed = ElSeaBed;
        var p = ElSeaBed.prototype = new AbContainer();
        p.createTexture = function() {
            for (var i = 0; i < assetName.length; i++) {
                var texture = PIXI.Texture.fromFrame(assetName[i].name);
                var background = new PIXI.TilingSprite(texture, this.width, assetName[i].height);
                background.position.y = assetName[i].ypos;
                this.textures.push(background);
                this.container.addChild(background);
            }
        };
        p.createMask = function(x, y, w, h) {};
        p.update = function() {};
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var AbElement = MKK.getNamespace("app.scene").AbElement;
    if (!ns.ElSeaFloor) {
        var ElSeaFloor = function ElSeaFloor(name, x, y, z, aX, aY, texWidth, texHeight) {
            this.name = name;
            assetName = "seabed.png";
            this.z = z;
            this.setup(x, y);
            this.container = new PIXI.DisplayObjectContainer();
            this.container.position = this.cPos;
            var texWidth = texWidth || 1024;
            var texHeight = texHeight || 800;
            var gradHeight = texHeight;
            if (texHeight > 800) {
                var extender = this.drawExtended(this.cPos.x, 800, texWidth, texHeight - 800);
                this.container.addChild(extender);
                gradHeight = 800;
            }
            var texture = PIXI.Texture.fromFrame(assetName);
            var background = new PIXI.TilingSprite(texture, texWidth, gradHeight);
            this.container.addChild(background);
        };
        ns.ElSeaFloor = ElSeaFloor;
        var p = ElSeaFloor.prototype = new AbElement();
        p.drawExtended = function(x, y, width, height) {
            var extended = new PIXI.Graphics();
            var seafloorcolor = settings.defaultSeaFloorColor;
            extended.beginFill(seafloorcolor);
            extended.drawRect(x, y, width, height);
            extended.endFill();
            return extended;
        };
        p.update = function() {};
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var AbElement = MKK.getNamespace("app.scene").AbElement;
    if (!ns.ElSeaWave) {
        var ElSeaWave = function ElSeaWave(name, x, y, z, aX, aY, texWidth) {
            var assetName = "sea_wave.png";
            var texHeight = 30;
            var offset = 7;
            this.name = name;
            this.z = z;
            this.waveOffset = offset;
            this.setup(x, y - this.waveOffset);
            this.container = new PIXI.DisplayObjectContainer();
            this.container.position = this.cPos;
            var texWidth = texWidth || 1024;
            var gradHeight = texHeight;
            var texture = PIXI.Texture.fromFrame(assetName);
            var background = new PIXI.TilingSprite(texture, texWidth * 2, texHeight);
            this.container.addChild(background);
            this.container.scale.x = .5;
            this.container.scale.y = .5;
        };
        ns.ElSeaWave = ElSeaWave;
        var p = ElSeaWave.prototype = new AbElement();
        p.yPos = function(y) {
            if (y) {
                this.cPos.y = y;
                this.container.y = this.cPos.y + this.offPos.y - this.waveOffset;
            }
            return this.cPos.y;
        };
        p.update = function() {};
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    var ElSprite = ns.ElSprite;
    var ElRotatingSprite = ns.ElRotatingSprite;
    var ElEngine = ns.ElEngine;
    var scenedata = MKK.getNamespace("data").scenedata;
    if (!ns.ElShipInner) {
        var ElShipInner = function ElShipInner(sFrame, duration) {
            this.name = name;
            this.element = [];
            this.fan = [];
            this.gear = [];
            assetBG = [ "exploration_inner_bg_01.png", "exploration_inner_bg_02.png", "exploration_inner_bg_03.png", "exploration_inner_bg_04.png" ];
            this.container = new PIXI.DisplayObjectContainer();
            this.setup(sFrame, duration, scenedata.scene2.element.shipInner.x, scenedata.scene2.element.shipInner.y);
            this.z = scenedata.scene2.element.shipInner.z;
            this.container.position = this.cPos;
        };
        ns.ElShipInner = ElShipInner;
        var p = ElShipInner.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            this.scale(1.6);
            this.addSprite("exploration_inner_bg_01.png", 0, 0);
            this.addSprite("exploration_inner_bg_02.png", 654, 0);
            this.addSprite("exploration_inner_bg_03.png", 0, 699);
            this.addSprite("exploration_inner_bg_04.png", 654, 699);
            this.hook = new ElSprite("engine_hook.png", 709, -54, 0, .5, 0);
            this.container.addChild(this.hook.container);
            this.addGear(674, 125, 0, 5e3, .7);
            this.addGear(751, 118, 0, -5e3, .8);
            this.addFan(545, 407, 0, 1e3);
            this.addFan(545, 782, 0, 5e3);
            this.addFan(545, 407, 0);
            this.engine = new ElEngine(0, 0, 469, 905, 0);
            this.container.addChild(this.engine.container);
            var tweenHookBound = ListenerFunctions.createListenerFunction(this, this.tweenHook);
            this.tween0 = new TweenEach({
                x: 709,
                y: -54
            }).to({
                x: 709,
                y: 66
            }, 200).easing(TWEEN.Easing.Exponential.InOut).onUpdate(tweenHookBound).delay(this.startFrame + 10).start();
            var selfMove1Bound = ListenerFunctions.createListenerFunction(this, this.selfMove1);
            this.tween1 = new TweenEach({
                x: -500
            }).to({
                x: 0
            }, 500).easing(TWEEN.Easing.Exponential.InOut).onUpdate(selfMove1Bound).delay(this.startFrame + 200).start();
            var selfMove2Bound = ListenerFunctions.createListenerFunction(this, this.selfMove2);
            this.tween2 = new TweenEach({
                x: 0
            }).to({
                x: -656
            }, 600).easing(TWEEN.Easing.Exponential.InOut).onUpdate(selfMove2Bound).delay(this.startFrame + 800).start();
            var selfZoom1Bound = ListenerFunctions.createListenerFunction(this, this.selfZoom1);
            this.tween3 = new TweenEach({
                x: -656,
                y: 0,
                scale: 1.6
            }).to({
                x: 0,
                y: 1600,
                scale: .78
            }, 400).easing(TWEEN.Easing.Exponential.InOut).onUpdate(selfZoom1Bound).delay(this.startFrame + 1300).start();
        };
        p.open = function() {};
        p.addSprite = function(name, x, y, z, aX, aY) {
            var tmp = new ElSprite(name, x, y, z, aX, aY);
            this.element.push(tmp);
            this.container.addChild(tmp.container);
        };
        p.addFan = function(x, y, z, velo) {
            var tmp = new ElRotatingSprite("engine_fan_2.png", x, y, z, velo, .5, .5);
            tmp.start();
            this.fan.push(tmp);
            this.container.addChild(tmp.container);
        };
        p.addGear = function(x, y, z, velo, scale) {
            var tmp = new ElRotatingSprite("engine_gear_1.png", x, y, z, velo, .5, .5);
            tmp.scale(scale);
            tmp.start();
            this.gear.push(tmp);
            this.container.addChild(tmp.container);
        };
        p.tweenHook = function(e) {
            var hook = this.hook;
            var cObj = this.tween0.tweenVars();
            hook.position(cObj.x, cObj.y);
        };
        p.selfMove1 = function(e) {
            var cObj = this.tween1.tweenVars();
            this.xPos(cObj.x);
        };
        p.selfMove2 = function(e) {
            var cObj = this.tween2.tweenVars();
            this.xPos(cObj.x);
        };
        p.selfZoom1 = function(e) {
            var cObj = this.tween3.tweenVars();
            this.scale(cObj.scale);
            this.xPos(cObj.x);
        };
        p.update = function(frame) {
            console.log("me working", this.cPos, this.offPos, this.container.y);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    var ElSprite = MKK.getNamespace("app.scene.element").ElSprite;
    if (!ns.ElSlope) {
        var ElSlope = function ElSlope(sFrame, duration, x, y, z, width) {
            this.name = name;
            this.width = width || 2e3;
            this.z = z;
            this.setup(sFrame, duration, x, y);
            this.container = new PIXI.DisplayObjectContainer();
            this.container.position = this.cPos;
            this.slopeWidth = 499;
            this.slopeHeight = 288;
            this.offsetY = 100;
            this.extraHeight = 85;
            this.slopeNum = Math.ceil(this.width / this.slopeWidth);
            this.element = [];
            this.createTexture();
        };
        ns.ElSlope = ElSlope;
        var p = ElSlope.prototype = new AbContainer();
        p.createTexture = function() {
            var sNum = this.slopeNum;
            var sw = this.slopeWidth;
            var sh = this.slopeHeight;
            for (var i = 0; i < sNum; i++) {
                var tmp = new ElSprite("seabed-slope.png", i * sw, -(i * sh), 0, 0, 0);
                this.element.push(tmp);
                this.container.addChild(tmp.container);
            }
            this.masker = this.createMask(0, sh + this.offsetY, this.width, sNum * sh + this.extraHeight);
            this.container.addChild(this.masker);
            this.container.mask = this.masker;
        };
        p.createMask = function(x, y, w, h) {
            var casing = new PIXI.Graphics();
            casing.clear();
            casing.beginFill(13421772, 1);
            casing.drawRect(0, 0, w, -h);
            casing.endFill();
            casing.position.x = x;
            casing.position.y = y;
            return casing;
        };
        p.update = function() {};
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.element");
    var settings = MKK.getNamespace("data").settings;
    var ElSprite = ns.ElSprite;
    var AbContainer = MKK.getNamespace("app.scene").AbContainer;
    var MathBase = MKK.getNamespace("mkk.math").MathBase;
    if (!ns.ElSubmarine) {
        var ElSubmarine = function ElSubmarine(startFrame, duration, x, y, z) {
            this.name = name;
            this.holeName = "oilrig-drill-hole.png";
            this.z = z;
            this.element = [];
            this.setup(startFrame, duration, x, y);
        };
        ns.ElSubmarine = ElSubmarine;
        var p = ElSubmarine.prototype = new AbContainer();
        p.setup = function(sFrame, duration, x, y) {
            this._setup(sFrame, duration, x, y);
            this.light = this.addSprite("yellow_sub-light.png", 50, 224, 0, .5, 0);
            this.addSprite("yellow_sub.png", 0, 0, 0, 0, 0);
        };
        p.rotateLight = function(e) {
            var degree = MathBase.Fit01(e, -.4, .1);
            this.light.rotate(degree);
        };
        p.update = function() {};
        p.addSprite = function(name, x, y, z, aX, aY) {
            var tmp = new ElSprite(name, x, y, z, aX, aY);
            this.element.push(tmp);
            this.container.addChild(tmp.container);
            return tmp;
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.loader");
    var EventDispatcher = MKK.getNamespace("mkk.event.EventDispatcher");
    var MathBase = MKK.getNamespace("mkk.math").MathBase;
    if (!ns.Loader) {
        var Loader = function Loader() {
            this._view = null;
            this.setup();
            this.assetsloader;
        };
        ns.Loader = Loader;
        var p = Loader.prototype = new EventDispatcher();
        p.setup = function() {
            this.view = this.createView();
        };
        p.assetLoader = function(assets, callback) {
            assetsToLoader = [ "assets/global.json", "assets/scene1.json", "assets/scene2.json", "assets/scene2b.json", "assets/scene2c.json", "assets/scene3.json", "assets/scene3b.json", "assets/scene4.json", "assets/scene5.json", "assets/scene6.json", "assets/scene7.json", "assets/scene8.json" ];
            this.assetsloader = new PIXI.AssetLoader(assetsToLoader);
            PIXI.scaleModes.DEFAULT = PIXI.scaleModes.LINEAR;
            var that = this;
            var loadComplete = function() {
                callback.call();
            };
            loader.onComplete = loadComplete;
            loader.load();
        };
        p.createView = function() {
            var vtmp = document.createElement("div");
            vtmp.style.position = "absolute";
            vtmp.style.width = "1024px";
            vtmp.style.height = "768px";
            vtmp.style.left = "0px";
            vtmp.style.top = "0px";
            vtmp.style.background = "#e7e7e7";
            this.container = this.createContainer();
            vtmp.appendChild(this.container);
            var txt = this.createTxt();
            this.txt = vtmp.appendChild(txt);
            this.waveYPos(0);
            return vtmp;
        };
        p.createContainer = function() {
            var vtmp = document.createElement("div");
            vtmp.style.position = "absolute";
            vtmp.style.width = "124px";
            vtmp.style.height = "124px";
            vtmp.style.left = "450px";
            vtmp.style.top = "316px";
            vtmp.style.overflow = "hidden";
            var wave = this.createWave();
            this.wave = vtmp.appendChild(wave);
            var masker = this.createMask();
            this.masker = vtmp.appendChild(masker);
            return vtmp;
        };
        p.createMask = function() {
            var vtmp = document.createElement("div");
            vtmp.style.position = "absolute";
            vtmp.style.width = "124px";
            vtmp.style.height = "124px";
            vtmp.style.left = "0px";
            vtmp.style.top = "0px";
            vtmp.style.overflow = "hidden";
            vtmp.style.background = "url(images/loader-front.png) center center no-repeat";
            return vtmp;
        };
        p.createWave = function() {
            var vtmp = document.createElement("div");
            vtmp.style.position = "absolute";
            vtmp.style.width = "124px";
            vtmp.style.height = "124px";
            vtmp.style.left = "0px";
            vtmp.style.top = "15px";
            vtmp.style.overflow = "hidden";
            vtmp.style.background = "url(images/loader-wave.png) left top no-repeat";
            return vtmp;
        };
        p.createTxt = function() {
            var vtmp = document.createElement("div");
            vtmp.style.position = "absolute";
            vtmp.style.width = "124px";
            vtmp.style.height = "30px";
            vtmp.style.left = "450px";
            vtmp.style.top = "440px";
            vtmp.style.textAlign = "center";
            vtmp.style.fontFamily = "EMPrintW01-regular, sans-serif";
            vtmp.style.fontSize = "13px";
            vtmp.style.color = "#666666";
            vtmp.innerHTML = "LOADING...";
            return vtmp;
        };
        p.waveYPos = function(e) {
            var pos = MathBase.Fit01(e, 90, 15);
            this.wave.style.top = pos + "px";
        };
        p.containerYPos = function(y) {
            this.container.style.top = y + "px";
        };
        p.fadeout = function() {
            var that = this;
            var fadeTween = function(e) {
                that.fadeoutTweenFunc(e, this);
            };
            var fadeTweenComplete = function(e) {
                that.fadeoutTweenCompleteFunc(e);
            };
            this.tweener = new TWEEN.Tween({
                y: 306
            }).to({
                y: 276
            }, 500).onUpdate(fadeTween).easing(TWEEN.Easing.Cubic.Out).delay(250).onComplete(fadeTweenComplete).start();
        };
        p.fadeoutTweenFunc = function(e, obj) {
            this.containerYPos(obj.y);
            this.view.style.opacity = 1 - e;
        };
        p.fadeoutTweenCompleteFunc = function(e, obj) {
            console.log("fadetweener complete");
            this.view.style.width = "0px";
            this.view.style.height = "0px";
            this.view.style.display = "none";
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var EventDispatcher = MKK.getNamespace("mkk.event.EventDispatcher");
    var settings = MKK.getNamespace("data").settings;
    var scenedata = MKK.getNamespace("data").scenedata;
    var MathBase = MKK.getNamespace("mkk.math").MathBase;
    var TouchEvent = MKK.getNamespace("mkk.event").TouchEvent;
    var FrameTween = MKK.getNamespace("app.animation").FrameTween;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    if (!ns.Navi) {
        var Navi = function Navi() {
            this.totalFrame = scenedata.totalFrame;
            this.buttonLinks = [ {
                id: 0,
                name: scenedata.scene1.name,
                frame: scenedata.scene1.cuepoint
            }, {
                id: 1,
                name: scenedata.scene2.name,
                frame: scenedata.scene2.cuepoint
            }, {
                id: 2,
                name: scenedata.scene3.name,
                frame: scenedata.scene3.cuepoint
            }, {
                id: 3,
                name: scenedata.scene4.name,
                frame: scenedata.scene4.cuepoint
            }, {
                id: 4,
                name: scenedata.scene5.name,
                frame: scenedata.scene5.cuepoint
            }, {
                id: 5,
                name: scenedata.scene6.name,
                frame: scenedata.scene6.cuepoint
            }, {
                id: 6,
                name: scenedata.scene8.name,
                frame: scenedata.scene8.cuepoint
            } ];
            this.redButs = [];
            this.blueButs = [];
            this.nametitle = [];
            this.tweenTime = {
                _speed: 250,
                sideHideX: -300,
                sideShowX: 50,
                buttonDistance: 70,
                buttonVertGap: 5,
                butSize: 26,
                txtOffset: 5
            };
            this.maxBarHeight = (this.buttonLinks.length - 1) * this.tweenTime.buttonDistance;
            this.view = null;
            this.soundState = false;
            this.setup();
            this.updateProcess(.96);
            this.isAnimating = false;
            this.isSideHidden = true;
        };
        ns.Navi = Navi;
        var p = Navi.prototype = new EventDispatcher();
        p.setup = function() {
            this.topview = this.setupTop();
            this.sideview = this.setupSide();
            this.soundview = this.setupBottomRight();
        };
        p.setupTop = function() {
            var vTemp = document.createElement("div");
            vTemp.id = "navi-top";
            vTemp.style.position = "absolute";
            vTemp.style.left = "0px";
            vTemp.style.top = "0px";
            vTemp.style.background = "white";
            vTemp.style.paddingTop = "7px";
            vTemp.style.width = "1024px";
            vTemp.style.height = "40px";
            vTemp.innerHTML = '<a style="position: absolute; width: 1024px; height: 40px;" href="com.exxonmobil.mobilperformance://"><img style="position: absolute; left: 10px;" src="images/exxon_logo.png"/><img style="position: absolute; right: 10px;" src="images/mobile_logo.png"/></a>';
            return vTemp;
        };
        p.setupSide = function() {
            var vTemp = document.createElement("div");
            vTemp.id = "navi-side";
            vTemp.style.position = "absolute";
            vTemp.style.left = this.tweenTime.sideHideX + "px";
            vTemp.style.top = "100px";
            vTemp.style.width = "26px";
            vTemp.style.height = this.maxBarHeight + this.tweenTime.buttonVertGap * 2 + "px";
            var redbar = this.createlines(this.maxBarHeight, settings.defaultBrandRed, false);
            var bluebar = this.createlines(this.maxBarHeight, settings.defaultBrandBlue, true);
            this.bluebar = vTemp.appendChild(bluebar);
            this.redbar = vTemp.appendChild(redbar);
            var that = this;
            var butLen = this.buttonLinks.length;
            for (var i = 0; i < butLen; i++) {
                var bBut = this.createButton(i * 70, i, false);
                this.blueButs.push(vTemp.appendChild(bBut));
                var rBut = this.createButton(i * 70, i, true);
                this.redButs.push(vTemp.appendChild(rBut));
                var rbBound = function(e) {
                    that.buttonTapFunc(e, i, this);
                };
                var tT = new TouchEvent(this.redButs[i], "tap", rbBound);
                var tTitle = this.createTitle(i * 70, this.buttonLinks[i].name);
                this.nametitle.push(vTemp.appendChild(tTitle));
            }
            return vTemp;
        };
        p.setupBottomRight = function() {
            console.log("setup bottom right");
            var vTemp = document.createElement("div");
            var state;
            vTemp.id = "volume-top";
            vTemp.style.position = "absolute";
            vTemp.style.left = "979px";
            vTemp.style.top = "723px";
            vTemp.style.width = "25px";
            vTemp.style.height = "25px";
            if (this.soundState) state = "on"; else state = "off";
            vTemp.style.backgroundImage = "url(images/volume_white_" + state + ".png)";
            vTemp.style.backgroundRepeat = "none";
            vTemp.style.backgroundSize = "25px 25px";
            vTemp.style.cursor = "pointer";
            var that = this;
            var rbBound = function(e, i) {
                that.soundTapFunc(e, i, this);
            };
            var tT = new TouchEvent(vTemp, "tap", rbBound);
            this.soundButton = vTemp;
            return vTemp;
        };
        p.buttonTapFunc = function(e, i, obj) {
            var navNum = parseInt(obj.target.id.replace("navbut", ""));
            console.log(e, i, navNum);
            this.dispatchCustomEvent("navitap", {
                distance: this.buttonLinks[navNum].frame
            });
        };
        p.soundTapFunc = function(e, i, obj) {
            var state = !this.soundState ? true : false;
            this.toggleSoundIcon(state);
            this.dispatchCustomEvent("soundtap", {
                soundstate: this.soundState
            });
        };
        p.toggleSoundIcon = function(el) {
            if (el) state = "on"; else state = "off";
            this.soundState = el;
            this.soundButton.style.backgroundImage = "url(images/volume_white_" + state + ".png)";
        };
        p.createButton = function(y, id, isRed) {
            var vTemp = document.createElement("div");
            vTemp.id = "navbut" + id;
            vTemp.style.position = "absolute";
            vTemp.style.left = "0px";
            vTemp.style.top = y + "px";
            var color = "red";
            if (!isRed) {
                color = "blue";
            }
            vTemp.style.background = "url(images/nav-ball-" + color + ".png) center center no-repeat";
            vTemp.style.backgroundSize = "26px 26px";
            vTemp.style.width = "26px";
            vTemp.style.height = "26px";
            vTemp.style.cursor = "pointer";
            return vTemp;
        };
        p.createlines = function(height, color, isAlignTop) {
            var vTemp = document.createElement("div");
            vTemp.style.position = "absolute";
            vTemp.style.left = "9px";
            if (isAlignTop) {
                vTemp.style.top = this.tweenTime.buttonVertGap + "px";
                vTemp.id = "redbar";
            } else {
                vTemp.style.bottom = this.tweenTime.buttonVertGap + "px";
                vTemp.id = "bluebar";
            }
            vTemp.style.background = color;
            vTemp.style.width = "7px";
            vTemp.style.height = height + "px";
            return vTemp;
        };
        p.createTitle = function(height, name) {
            var vTemp = document.createElement("div");
            vTemp.style.position = "absolute";
            vTemp.style.left = "32px";
            vTemp.style.top = height + this.tweenTime.txtOffset + "px";
            vTemp.innerHTML = name;
            vTemp.style.color = settings.defaultBrandRed;
            vTemp.style.fontFamily = " emprintw01-semibold ,sans-serif";
            return vTemp;
        };
        p.hideSide = function() {
            if (this.isAnimating || this.isSideHidden) return;
            var tT = this.tweenTime;
            var that = this;
            var updateBound = function(e) {
                that.hideUpdate(e, this);
            };
            var completeBound = function(e) {
                that.hideComplete(e, this);
            };
            this.hideTween = new TWEEN.Tween({
                x: tT.sideShowX
            }).to({
                x: tT.sideHideX
            }, tT._speed).onUpdate(updateBound).easing(TWEEN.Easing.Cubic.InOut).onComplete(completeBound).start();
        };
        p.showSide = function() {
            if (this.isAnimating || !this.isSideHidden) return;
            var tT = this.tweenTime;
            var that = this;
            var updateBound = function(e) {
                that.showUpdate(e, this);
            };
            var completeBound = function(e) {
                that.showComplete(e, this);
            };
            this.hideTween = new TWEEN.Tween({
                x: tT.sideHideX
            }).to({
                x: tT.sideShowX
            }, tT._speed).easing(TWEEN.Easing.Cubic.InOut).onUpdate(updateBound).onComplete(completeBound).start();
        };
        p.hideUpdate = function(e, obj) {
            this.isAnimating = true;
            this.sideview.style.left = obj.x + "px";
        };
        p.hideComplete = function(e, obj) {
            this.isAnimating = false;
            this.isSideHidden = true;
        };
        p.showUpdate = function(e, obj) {
            this.isAnimating = true;
            this.sideview.style.left = obj.x + "px";
        };
        p.showComplete = function(e, obj) {
            this.isAnimating = false;
            this.isSideHidden = false;
        };
        p.updateProcess = function(e) {
            this.redbar.style.height = this.maxBarHeight * e + "px";
        };
        p.update = function(frame) {
            var tot = this.totalFrame;
            var blLen = this.buttonLinks.length;
            var output = 0;
            for (var i = 0; i < blLen; i++) {
                var bl = this.buttonLinks[i].frame;
                var bln = tot;
                if (i + 1 < blLen) {
                    bln = this.buttonLinks[i + 1].frame;
                }
                if (frame >= bl && frame < bln) {
                    var output = MathBase.Fit(frame, bl, bln, i * .165, (i + 1) * .165);
                }
                if (frame >= bl - 1 && frame > 1) {
                    this.redButs[i].style.opacity = 0;
                    this.nametitle[i].style.color = settings.defaultBrandBlue;
                } else {
                    this.redButs[i].style.opacity = 1;
                    this.nametitle[i].style.color = settings.defaultBrandRed;
                }
            }
            this.updateProcess(1 - output);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.level");
    var AbLevel = MKK.getNamespace("app.scene").AbLevel;
    var settings = MKK.getNamespace("data").settings;
    var AbContainer = ns.AbContainer;
    if (!ns.Scene1Level) {
        var Scene1Level = function Scene1Level(name) {
            this.depthLevel = settings.depthLevel;
            this.name = name;
        };
        ns.Scene1Level = Scene1Level;
        var p = Scene1Level.prototype = new AbLevel();
        p.update = function(frame) {
            if (this.isframeControlled) {
                this._update(frame);
                var round = this.oPos.y - frame * this.z * this.depthLevel + .5 | 0;
                this.cPos.setY(round);
            }
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.level");
    var AbLevel = MKK.getNamespace("app.scene").AbLevel;
    var settings = MKK.getNamespace("data").settings;
    var AbContainer = ns.AbContainer;
    if (!ns.Scene2Level) {
        var Scene2Level = function Scene2Level(name) {
            this.depthLevel = settings.depthLevel;
            this.name = name;
        };
        ns.Scene2Level = Scene2Level;
        var p = Scene2Level.prototype = new AbLevel();
        p.update = function(frame) {
            this._update(frame);
            if (this.isframeControlled) {
                var direction = !this.isReversed ? 1 : -1;
                var round = this.oPos.y - direction * frame * this.z * this.depthLevel + .5 | 0;
                this.cPos.setY(round);
            }
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene.level");
    var AbLevel = MKK.getNamespace("app.scene").AbLevel;
    var settings = MKK.getNamespace("data").settings;
    var AbContainer = ns.AbContainer;
    if (!ns.StaticLevel) {
        var StaticLevel = function StaticLevel(name) {
            this.depthLevel = settings.depthLevel;
            this.name = name;
        };
        ns.StaticLevel = StaticLevel;
        var p = StaticLevel.prototype = new AbLevel();
        p.update = function(frame) {
            this._update(frame);
            if (this.isframeControlled) {}
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var data = MKK.getNamespace("data");
    var copydata = data.copydata;
    var scenedata = data.scenedata;
    var styledata = data.styledata;
    var settings = data.settings;
    var AbScene = ns.AbScene;
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var Scene1Level = ns.level.Scene1Level;
    var ElSprite = ns.element.ElSprite;
    var ElText = ns.element.ElText;
    var ElRect = ns.element.ElRect;
    var FrameTween = MKK.getNamespace("app.animation").FrameTween;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    if (!ns.Scene1) {
        var Scene1 = function Scene1() {
            this.tweenTime = {
                _speed: 500,
                startTime1: 2200
            };
        };
        ns.Scene1 = Scene1;
        var p = Scene1.prototype = new AbScene();
        p.open = function() {
            this.createLevels(scenedata.scene1.level, Scene1Level);
            var strapStyle = styledata.straplinegrey;
            var symStyle = styledata.symbolTitle;
            var symStyle2 = styledata.symbolTitle2;
            var symStyle3 = styledata.symbolTitle3;
            var disclaimStyle = styledata.disclaimTitle;
            var copies = copydata.scene1;
            var cloud1 = new ElSprite("cloud_satellite.png", 100, 100, 0);
            var logo1 = new ElSprite("cloud_text1.png", 512, 374, 0, .5, .5);
            var arrow1 = new ElSprite("cloud_text1c.png", 512, 454, 0, .5, .5);
            var txt1 = new ElText("Start by scrolling here", 512, 414, 0, .5, .5);
            txt1.setStyle({
                font: "12px EMPrintW01-regular"
            });
            var txt2 = new ElText(copies.line1, 512, 900, 0, .5, .5);
            txt2.setStyle(strapStyle);
            var txt3 = new ElText(copies.line2, 512, 2e3, 0, .5, .5);
            txt3.setStyle(strapStyle);
            var txt4 = new ElText(copies.line3, 512, 2e3, 0, .5, .5);
            txt4.setStyle(strapStyle);
            var txt5 = new ElText(copies.line4, 512, 3600, 0, .5, .5);
            txt5.setStyle(strapStyle);
            var disclaimTxt1 = new ElText(copies.line4b, 512, 4100, 0, .5, .5);
            disclaimTxt1.setStyle(disclaimStyle);
            var cloud2 = new ElSprite("cloud_blue1.png", 100, 580, 0);
            var cloud3 = new ElSprite("cloud_grey1.png", 600, 1280, 0);
            var cloud4 = new ElSprite("cloud_white1.png", 630, 1520, 0);
            var cloud5 = new ElSprite("cloud_white2.png", 60, 1490, 0);
            var cloud6 = new ElSprite("cloud_grey2.png", 0, 2780, 0);
            var symbol1 = new ElSprite("cloud_icon_safety.png", 322, 3730, 0);
            var symbol2 = new ElSprite("cloud_icon_environmental.png", 470, 3730, 0);
            var symbol3 = new ElSprite("cloud_icon_productivity.png", 622, 3730, 0);
            this.symTxt1 = new ElText(copies.symbolline1, 368, 3835, 0, .5, .5);
            this.symTxt2 = new ElText(copies.symbolline2, 517, 3835, 0, .5, .5);
            this.symTxt3 = new ElText(copies.symbolline3, 666, 3840, 0, .5, .5);
            this.symTxt1.setStyle(symStyle);
            this.symTxt2.setStyle(symStyle);
            this.symTxt3.setStyle(symStyle);
            var logo2 = new ElSprite("mobile_shc_small.png", 180, 4280, 0, .5, .5);
            var logo3 = new ElSprite("mobile_grease_small.png", 518, 4280, 0, .5, .5);
            var logo4 = new ElSprite("signum_small.png", 850, 4295, 0, .5, .5);
            var symTxt4 = new ElText(copies.line5, 512, 4400, 0, .5, .5);
            symTxt4.setStyle(symStyle2);
            var symTxt5 = new ElText(copies.line6, 512, 4470, 0, .5, .5);
            var symTxt6 = new ElText(copies.line7, 512, 4540, 0, .5, .5);
            var symTxt7 = new ElText(copies.line8, 512, 4610, 0, .5, .5);
            var symTxt8 = new ElText(copies.line9, 512, 4680, 0, .5, .5);
            symTxt5.setStyle(symStyle3);
            symTxt6.setStyle(symStyle3);
            symTxt7.setStyle(symStyle3);
            symTxt8.setStyle(symStyle3);
            var cloud8 = new ElSprite("cloud_white2.png", 50, 2700, 0);
            var cloud9 = new ElSprite("cloud_blue1.png", 800, 3710, 0);
            var cloud10 = new ElSprite("cloud_white1.png", -100, 3200, 0);
            this.level[0].addElement(txt2.container);
            this.level[0].addElement(txt4.container);
            this.level[0].addElement(cloud4.container);
            this.level[0].addElement(cloud8.container);
            this.level[0].addElement(cloud10.container);
            this.level[1].addElement(logo1.container);
            this.level[1].addElement(txt1.container);
            this.level[1].addElement(cloud3.container);
            this.level[1].addElement(txt3.container);
            this.level[1].addElement(txt5.container);
            this.level[1].addElement(disclaimTxt1.container);
            this.level[1].addElement(symbol1.container);
            this.level[1].addElement(symbol2.container);
            this.level[1].addElement(symbol3.container);
            this.level[1].addElement(this.symTxt1.container);
            this.level[1].addElement(this.symTxt2.container);
            this.level[1].addElement(this.symTxt3.container);
            this.level[1].addElement(logo2.container);
            this.level[1].addElement(logo3.container);
            this.level[1].addElement(logo4.container);
            this.level[1].addElement(symTxt4.container);
            this.level[1].addElement(symTxt5.container);
            this.level[1].addElement(symTxt6.container);
            this.level[1].addElement(symTxt7.container);
            this.level[1].addElement(symTxt8.container);
            this.level[2].addElement(cloud1.container);
            this.level[2].addElement(cloud2.container);
            this.level[2].addElement(arrow1.container);
            this.level[2].addElement(cloud5.container);
            this.level[2].addElement(cloud6.container);
            this.level[2].addElement(cloud9.container);
            this.addLevel(this.level[0]);
            this.addLevel(this.level[1]);
            this.addLevel(this.level[2]);
        };
        p.tweenFunc0 = function(e) {
            cObj = this.tween0.tweenVars();
            this.symTxt1.opacity(this.tween0.alpha);
        };
        p.tweenFunc1 = function(e) {};
        p.tweenFunc2 = function(e) {};
        p.close = function() {};
        p.update = function(frame) {
            this._update(frame);
            var cFrame = this.localCurFrame(frame);
            if (cFrame >= 0 && cFrame < this.duration) {
                this.cPos.y = -cFrame;
            }
            this.level[0].update(cFrame);
            this.level[1].update(cFrame);
            this.level[2].update(cFrame);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var data = MKK.getNamespace("data");
    var copydata = data.copydata;
    var scenedata = data.scenedata;
    var styledata = data.styledata;
    var AbScene = ns.AbScene;
    var StaticLevel = ns.level.StaticLevel;
    var Scene2Level = ns.level.Scene2Level;
    var ElSprite = ns.element.ElSprite;
    var ElSpriteContainer = ns.element.ElSpriteContainer;
    var ElText = ns.element.ElText;
    var ElRect = ns.element.ElRect;
    var ElSeaBG = ns.element.ElSeaBG;
    var ElSeaWave = ns.element.ElSeaWave;
    var ElSeaFloor = ns.element.ElSeaFloor;
    var ElSeaBed = ns.element.ElSeaBed;
    var ElOilCave = ns.element.ElOilCave;
    var ElShipInner = ns.element.ElShipInner;
    var ElRadarBoat = ns.element.ElRadarBoat;
    var ElRadarBoatSide = ns.element.ElRadarBoatSide;
    var ElDescription = ns.element.ElDescription;
    var ElRadar = ns.element.ElRadar;
    var ElRain = ns.element.ElRain;
    var FrameTween = MKK.getNamespace("app.animation").FrameTween;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    if (!ns.Scene2) {
        var Scene2 = function Scene2() {
            this.tweenTime = {
                thunderCloudX0: 10,
                drillCloudX0: 1e3,
                greyCloudX0: 900,
                thunderCloudX1: 900,
                drillCloudX1: 1540,
                greyCloudX1: 1340
            };
            this.txtLevel = [];
        };
        ns.Scene2 = Scene2;
        var p = Scene2.prototype = new AbScene();
        p.init = function(stage) {
            this._init();
            this.stage = stage;
            this.stage.addChild(this.container);
            this.stage.addChild(this.txtContainer);
            this.open();
        };
        p._setup = function(sFrame, duration, x, y) {
            this._preSetup(x, y);
            this.container = new PIXI.DisplayObjectContainer();
            this.txtContainer = new PIXI.DisplayObjectContainer();
            this.container.position = this.oPos.clone();
            this.txtContainer.position = this.oPos.clone();
            this.startFrame = sFrame;
            this.duration = duration;
        };
        p.addTxtLevel = function(oLevel) {
            this.txtContainer.addChild(oLevel.container);
            this.txtLevel.push(oLevel);
        };
        p.open = function() {
            var tT = this.tweenTime;
            var copies = copydata.scene2;
            this.createLevels(scenedata.scene2.level, Scene2Level);
            this.staticlevel = new StaticLevel("statictxt");
            this.staticlevel.setup(0, 0, 0);
            this.addTxtLevel(this.staticlevel);
            this.desc = new ElDescription(copies.desc1.title, copies.desc1.txt, "", copies.desc1.color, this.startFrame + 1380, 1e3, 50, 50, 0);
            this.desc2 = new ElDescription(copies.desc2.title, copies.desc2.txt, "", copies.desc2.color, this.startFrame + 1950, 1e3, 50, 300, 0);
            this.desc3 = new ElDescription(copies.desc3.title, copies.desc3.txt, "", copies.desc3.color, this.startFrame + 3700, 1e3, 342, 280, 0);
            this.seabg = new ElSeaBG("seabg", 0, 1050, 0, 0, 0, 1024, 1024);
            this.seawave = new ElSeaWave("seawave", 0, 1050, 0, 0, 0, 1024);
            this.smallship = new ElSprite("explorer-ship-small.png", 100, 930, 0, 0);
            this.ship = new ElSpriteContainer("ship", 0, 1e3, 0, 0, 0);
            this.ship.addSprite("explorer-ship-top1.png", 300, 880);
            this.ship.addSprite("explorer-ship-bottom1.png", 0, 1180);
            this.shipinner = new ElShipInner(this.startFrame + 1300, 8e3);
            this.shipinner.mask(300, 40, 490, 2300);
            this.shipinner.showMask();
            this.radarboat = new ElRadarBoat(0, 8e3, 512, 3414);
            this.radar1 = new ElRadar(this.startFrame + 4250, 750, 256, 4473, false, false, 129);
            this.radar2 = new ElRadar(this.startFrame + 4250, 750, 400, 4392, true, false, 207);
            this.radarpuller = new ElSpriteContainer("radarpuller", 0, 0, 0, 4282, 0);
            this.radarpullerMask = this.createMask(472, 0, 80, 80);
            this.radarpuller.addElement(this.radarpullerMask);
            this.radarpuller.addSprite("radar-line.png", 512, 0, .5, .5);
            this.radarpuller.addSprite("radar-large.png", 512, 780, .5, .5);
            this.radarpuller.sprite[1].scale(2);
            this.radarline = new ElSprite("radar_line.png", 512, 4650, 0, .5, 0);
            this.lineMask = this.createMask(507, 4729, 10, 1230);
            this.radarping = new ElSprite("radar_ping.png", 512, 4729, 0, .5, .5);
            this.seabg2 = new ElSeaBG("seabg", 0, 4282, 0, 0, 0, 1536, 1024);
            this.seawave2 = new ElSeaWave("seawave", 0, 4282, 0, 0, 0, 1536, 1520);
            this.seabed = new ElSeaBed(0, 0, 0, 5582, 0, 1024);
            this.seafloor = new ElSeaFloor("seafloor", 0, 5582, 0, 0, 0, 1024, 120);
            this.oilcave = new ElOilCave("oilcave", 0, 0, 0, 5682, 0, 0);
            this.oilcave.updateLevel(.6);
            this.radarboatside = new ElRadarBoatSide(0, 0, 200, 4462, 0);
            this.clouds = new ElSpriteContainer("clouds", 0, 0, 1030, 4272, 0);
            this.clouds.addSprite("storm_clouds_01.png", 0, 0);
            this.clouds.addSprite("storm_clouds_02.png", 618, 0);
            this.clouds.addSprite("storm_clouds_03.png", 1240, 0);
            this.clouds.addSprite("storm_clouds_04.png", 0, 309);
            this.clouds.addSprite("storm_clouds_05.png", 618, 309);
            this.clouds.addSprite("storm_clouds_06.png", 1239, 309);
            this.rainer = new ElRain(0, 3400, 500, 400, 0, 120);
            this.thundercloud = this.clouds.addSprite("storm-cloud-thunder.png", tT.thunderCloudX0, 160);
            this.clouds.addElement(this.rainer.container);
            this.drillcloud = this.clouds.addSprite("storm_clouds-sign.png", tT.drillCloudX0, 100);
            this.greycloud = this.clouds.addSprite("storm-cloud-grey.png", tT.greyCloudX0, 400);
            var tweenSmallShipBound = ListenerFunctions.createListenerFunction(this, this.tweenSmallShip);
            this.tween0 = new TweenEach({
                x: 100,
                y: 930
            }).to({
                x: 700
            }, this.startFrame + 728).easing(TWEEN.Easing.Exponential.Out).onUpdate(tweenSmallShipBound).delay(this.startFrame + 350).start();
            var tweenShipBound = ListenerFunctions.createListenerFunction(this, this.tweenShip);
            this.tween1 = new TweenEach({
                scale: 1,
                x: 0,
                y: 0,
                ix: -500,
                iy: 1150
            }).to({
                scale: 3,
                x: -560,
                y: -2200,
                ix: -500,
                iy: 1500
            }, 1e3).onUpdate(tweenShipBound).delay(this.startFrame + 792).start();
            var tweenInnerMaskBound = ListenerFunctions.createListenerFunction(this, this.tweenInnerMask);
            this.tween2 = new TweenEach({
                x: 300,
                y: 50,
                width: 490,
                height: 2300
            }).to({
                x: -150,
                width: 1500
            }, 200).onUpdate(tweenInnerMaskBound).delay(this.startFrame + 964).start();
            var tweenInnerBound = ListenerFunctions.createListenerFunction(this, this.tweenInner);
            this.tween3 = new TweenEach({
                y: 1500
            }).to({
                y: 3200
            }, 400).onUpdate(tweenInnerBound).easing(TWEEN.Easing.Cubic.Out).easing(TWEEN.Easing.Exponential.InOut).delay(this.startFrame + 2600).start();
            var tweenRadar1Bound = ListenerFunctions.createListenerFunction(this, this.tweenRadar1);
            this.tween4 = new TweenEach({
                y: 3414,
                scale: 1,
                sy: 4282,
                ry: 4282,
                by: 780
            }).to({
                y: 4364,
                scale: .3,
                sy: 4602,
                ry: 4602,
                by: 0
            }, 600).onUpdate(tweenRadar1Bound).delay(this.startFrame + 4250).start();
            var tweenRadar1bBound = ListenerFunctions.createListenerFunction(this, this.tweenRadar1b);
            this.tween4b = new TweenEach({
                y: 0,
                scale: 2,
                shipscale: .3,
                shipy: 4364,
                y: 0
            }).to({
                y: 25,
                scale: .3,
                shipscale: .2,
                shipy: 4430
            }, 600).onUpdate(tweenRadar1bBound).easing(TWEEN.Easing.Circular.InOut).delay(this.startFrame + 4850).start();
            var tweenRadar2Bound = ListenerFunctions.createListenerFunction(this, this.tweenRadar2);
            this.tween5 = new TweenEach({
                y: -384,
                py: 4729,
                ly: 4729,
                lh: 1
            }).to({
                y: -1400,
                py: 5960,
                ly: 4729,
                lh: 1220
            }, 560).onUpdate(tweenRadar2Bound).easing(TWEEN.Easing.Circular.InOut).delay(this.startFrame + 5690).start();
            var tweenRadar2bBound = ListenerFunctions.createListenerFunction(this, this.tweenRadar2b);
            this.tween5b = new TweenEach({
                x: 200,
                rx: 400
            }).to({
                x: 55,
                rx: 255
            }, 500).onUpdate(tweenRadar2bBound).easing(TWEEN.Easing.Circular.InOut).delay(this.startFrame + 6370).start();
            var tweenRadar3Bound = ListenerFunctions.createListenerFunction(this, this.tweenRadar3);
            this.tween6 = new TweenEach({
                y: -1400,
                py: 5960,
                ly: 5960,
                lh: 1
            }).to({
                y: -384,
                py: 4650,
                ly: 4650,
                lh: 1220
            }, 560).onUpdate(tweenRadar3Bound).easing(TWEEN.Easing.Circular.InOut).delay(this.startFrame + 6250).start();
            var tweenEndingBound = ListenerFunctions.createListenerFunction(this, this.tweenEnding);
            this.tween7 = new TweenEach({
                x: 0,
                tX: tT.thunderCloudX0,
                dX: tT.drillCloudX0,
                gX: tT.greyCloudX0
            }).to({
                x: -3200,
                tX: tT.thunderCloudX1,
                dX: tT.drillCloudX1,
                gX: tT.greyCloudX1
            }, 1500).easing(TWEEN.Easing.Cubic.InOut).onUpdate(tweenEndingBound).delay(this.startFrame + 6810).start();
            this.level[0].addElement(this.smallship.container);
            this.level[0].addElement(this.seabg.container);
            this.level[0].addElement(this.seawave.container);
            this.level[1].addElement(this.shipinner.container);
            this.level[2].addElement(this.ship.container);
            this.level[3].addElement(this.seabg2.container);
            this.level[3].addElement(this.radarboat.container);
            this.level[3].addElement(this.seabed.container);
            this.level[3].addElement(this.seafloor.container);
            this.level[3].addElement(this.oilcave.container);
            this.level[3].addElement(this.radarboatside.container);
            this.level[3].addElement(this.seawave2.container);
            this.level[3].addElement(this.radar1.container);
            this.level[3].addElement(this.radar2.container);
            this.level[3].addElement(this.radarpuller.container);
            this.level[3].addElement(this.radarline.container);
            this.level[3].addElement(this.lineMask);
            this.level[3].addElement(this.radarping.container);
            this.staticlevel.addElement(this.desc.container);
            this.staticlevel.addElement(this.desc2.container);
            this.staticlevel.addElement(this.desc3.container);
            this.level[3].addElement(this.clouds.container);
        };
        p.tweenSmallShip = function(e) {
            var smallship = this.smallship;
            var cObj = this.tween0.tweenVars();
            smallship.position(cObj.x, cObj.y);
        };
        p.tweenShip = function(e) {
            var ship = this.ship;
            var cObj = this.tween1.tweenVars();
            ship.position(cObj.x, cObj.y);
            ship.scale(cObj.scale);
            this.shipinner.yPos(cObj.iy);
        };
        p.tweenInnerMask = function(e) {
            var cObj = this.tween2.tweenVars();
            this.shipinner.mask(cObj.x, cObj.y, cObj.width, cObj.height);
        };
        p.tweenInner = function(e) {
            var cObj = this.tween3.tweenVars();
            this.shipinner.yPos(cObj.y);
        };
        p.tweenRadar1 = function(e) {
            var cObj = this.tween4.tweenVars();
            this.radarboat.yPos(cObj.y);
            this.radarboat.scale(cObj.scale);
            this.seabg2.yPos(cObj.sy);
            this.seawave2.yPos(cObj.sy);
            this.radarpuller.yPos(cObj.ry);
            this.radarpuller.sprite[1].yPos(cObj.by);
        };
        p.tweenRadar1b = function(e) {
            var cObj = this.tween4b.tweenVars();
            this.radarboat.yPos(cObj.shipy);
            this.radarboat.scale(cObj.shipscale);
            this.radarpuller.sprite[1].yPos(cObj.y);
            this.radarpuller.sprite[1].scale(cObj.scale);
        };
        p.tweenRadar2 = function(e) {
            var cObj = this.tween5.tweenVars();
            this.level[3].yPos(cObj.y);
            this.radarping.yPos(cObj.py);
            this.updateMask(this.lineMask, 10, cObj.lh);
            this.lineMask.position.y = cObj.ly;
        };
        p.tweenRadar2b = function(e) {
            var cObj = this.tween5b.tweenVars();
            this.radarboatside.xPos(cObj.x);
            this.radar2.xPos(cObj.rx);
        };
        p.tweenRadar3 = function(e) {
            var cObj = this.tween6.tweenVars();
            this.level[3].yPos(cObj.y);
            this.radarping.yPos(cObj.py);
            this.updateMask(this.lineMask, 10, cObj.lh);
            this.lineMask.position.y = cObj.ly;
        };
        p.tweenEnding = function(e) {
            var cObj = this.tween7.tweenVars();
            this.level[3].xPos(cObj.x);
            this.thundercloud.xPos(cObj.tX);
            this.drillcloud.xPos(cObj.dX);
            this.greycloud.xPos(cObj.gX);
        };
        p.createMask = function(x, y, w, h) {
            var casing = new PIXI.Graphics();
            casing.clear();
            casing.beginFill(2236962, 1);
            casing.drawRect(0, 0, w, h);
            casing.endFill();
            casing.position.x = x;
            casing.position.y = y;
            return casing;
        };
        p.updateMask = function(casing, w, h) {
            casing.clear();
            casing.beginFill(2236962, 1);
            casing.drawRect(0, 0, w, h);
            casing.endFill();
        };
        p.close = function() {};
        p.animate = function() {
            this.rainer.animate();
        };
        p.update = function(frame) {
            this._update(frame);
            var cFrame = this.localCurFrame(frame);
            if (cFrame >= 0 && cFrame < 3850) {
                this.show();
                this.cPos.y = -cFrame;
            } else {}
            if (cFrame >= 611) {
                this.shipinner.show();
                this.level[1].show();
            } else {
                this.shipinner.hide();
                this.level[1].hide();
            }
            if (cFrame >= 1320) {
                this.level[2].hide();
                this.level[3].show();
            } else {
                this.level[2].show();
                this.level[3].hide();
            }
            if (cFrame >= 3850) {
                this.level[3].frameControlled(false);
                this.level[1].hide();
                this.radarboat.showTop();
            } else {
                this.level[3].frameControlled(true);
                this.level[1].show();
                this.radarboat.hideTop();
            }
            if (cFrame >= 4850) {
                this.radarpullerMask.visible = true;
                this.radarpuller.sprite[0].container.mask = this.radarpullerMask;
            } else {
                this.radarpullerMask.visible = false;
                this.radarpuller.sprite[0].container.mask = null;
            }
            if (cFrame >= 5450 && cFrame < 6200) {
                this.radar1.show();
            } else {
                this.radar1.hide();
            }
            if (cFrame >= 5450) {
                this.lineMask.visible = true;
                this.radarline.container.mask = this.lineMask;
                this.radarline.show();
                this.radarping.show();
            } else {
                this.lineMask.visible = false;
                this.radarline.container.mask = null;
                this.radarline.hide();
                this.radarping.hide();
            }
            if (cFrame >= 6200) {
                this.radarboatside.show();
                this.radarboat.hide();
                this.radar2.show();
                this.radarpuller.hide();
                this.clouds.show();
            } else {
                this.radarboatside.hide();
                this.radarboat.show();
                this.radar2.hide();
                this.radarpuller.show();
                this.clouds.hide();
            }
            if (cFrame >= 6800 && cFrame < 8100) {
                this.rainer.show();
            } else {
                this.rainer.hide();
            }
            this.level[0].update(cFrame);
            this.level[1].update(cFrame);
            this.level[2].update(cFrame);
            this.level[3].update(cFrame);
            this.staticlevel.update(cFrame);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var data = MKK.getNamespace("data");
    var scenedata = data.scenedata;
    var styledata = data.styledata;
    var copydata = data.copydata;
    var AbScene = ns.AbScene;
    var StaticLevel = ns.level.StaticLevel;
    var ElSprite = ns.element.ElSprite;
    var ElSpriteContainer = ns.element.ElSpriteContainer;
    var ElText = ns.element.ElText;
    var ElRect = ns.element.ElRect;
    var ElGrowRect = ns.element.ElGrowRect;
    var ElSeaBG = ns.element.ElSeaBG;
    var ElSeaWave = ns.element.ElSeaWave;
    var ElSeaFloor = ns.element.ElSeaFloor;
    var ElSeaBed = ns.element.ElSeaBed;
    var ElOilCave = ns.element.ElOilCave;
    var ElEngine = ns.element.ElEngine;
    var ElOilrig = ns.element.ElOilrig;
    var ElOilHole = ns.element.ElOilHole;
    var ElSeaWave = ns.element.ElSeaWave;
    var ElRadarBoatSide = ns.element.ElRadarBoatSide;
    var ElRotatingSprite = ns.element.ElRotatingSprite;
    var ElDescription = ns.element.ElDescription;
    var FrameTween = MKK.getNamespace("app.animation").FrameTween;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    if (!ns.Scene3) {
        var Scene3 = function Scene3() {
            this.tweenTime = {
                _speed: 250,
                _speed2: 500,
                _speed3: 750,
                _speed4: 1500,
                tween1Start: 800,
                tween2Start: 1550,
                tween3Start: 2400,
                tween4Start: 3200,
                tween5Start: 4700,
                tween6Start: 5950,
                startX0: 1024,
                startY0: 50,
                scale0: 1,
                orX0: 0,
                orY0: 0,
                waveX0: 0,
                waveY0: 825,
                moveX1: 250,
                moveX2: -500,
                moveY2: 50,
                moveX3: -600,
                moveY3: -250,
                moveX4: 500,
                moveY4: 500,
                moveX6: -1024,
                scale4: .3,
                orX4: 850,
                orY4: 384,
                waveX1: 0,
                waveY1: 457,
                moveY5: -1650,
                moveY6: 250,
                drill0Start: 3950,
                drill1Start: 4150,
                pipe1Start: 4150
            };
            this.txtTime = {
                txt1Start: 200,
                txt2Start: 1050,
                txt3Start: 1750,
                txt4Start: 2630
            };
        };
        ns.Scene3 = Scene3;
        var p = Scene3.prototype = new AbScene();
        p.open = function() {
            this.addLevels();
            var tTime = this.tweenTime;
            this.seabg = new ElSeaBG("seabg", tTime.waveX0, tTime.waveY0, 0, 0, 0, 1024, 1024);
            this.seafloor = new ElSeaFloor("seafloor", 0, 1484, 0, 0, 0, 1024, 1200);
            this.seabed = new ElSeaBed(0, 0, 0, 1484, 0, 1024);
            this.oilcave = new ElOilCave("oilcave", 0, 0, 0, 2044, 0, 0);
            this.oilcave.updateLevel(0);
            this.oilhole = new ElOilHole("oilhole", 0, -210, -5, 1534, 0, 0);
            this.dino1 = new ElSprite("dinosaur1.png", 230, 1974);
            this.dino2 = new ElSprite("dinosaur2.png", 630, 1950);
            this.divers = new ElSpriteContainer("divers", 0, 0, 0, 0, 0);
            this.bgpipe1 = this.addbgPipe(450, .75);
            this.bgpipe3 = this.addbgPipe(100, .75);
            this.divers.addSprite("diver-small.png", 600, 1200);
            this.divers.addSprite("diver-small.png", 400, 800);
            this.divers.addSprite("diver-large.png", 300, 900);
            this.seabglevel.addElement(this.seabg.container);
            this.seabglevel.addElement(this.seabed.container);
            this.seabglevel.addElement(this.seafloor.container);
            this.seabglevel.addElement(this.oilcave.container);
            this.seabglevel.addElement(this.divers.container);
            this.seabglevel.addElement(this.oilhole.container);
            this.seabglevel.addElement(this.dino1.container);
            this.seabglevel.addElement(this.dino2.container);
            this.oilrig = new ElOilrig(0, 5e3, 0, 0, 0);
            this.staticlevel.addElement(this.oilrig.container);
            this.seawave = new ElSeaWave("seawave", tTime.waveX0, tTime.waveY0, 0, 0, 0, 1024, 1520);
            this.wavelevel.addElement(this.seawave.container);
            this.addDescriptionTxt();
            var tweenStartingBound = ListenerFunctions.createListenerFunction(this, this.tweenStarting);
            this.tween0 = new TweenEach({
                x: tTime.startX0,
                y: tTime.startY0
            }).to({
                x: tTime.moveX1
            }, tTime._speed).easing(TWEEN.Easing.Cubic.Out).onUpdate(tweenStartingBound).delay(this.startFrame).start();
            var tweenMove1Bound = ListenerFunctions.createListenerFunction(this, this.tweenMove1);
            this.tween1 = new TweenEach({
                x: tTime.moveX1
            }).to({
                x: tTime.moveX2
            }, tTime._speed).easing(TWEEN.Easing.Cubic.InOut).onUpdate(tweenMove1Bound).delay(this.startFrame + tTime.tween1Start).start();
            var tweenMove2Bound = ListenerFunctions.createListenerFunction(this, this.tweenMove2);
            this.tween2 = new TweenEach({
                x: tTime.moveX2,
                y: tTime.moveY2
            }).to({
                x: tTime.moveX3,
                y: tTime.moveY3
            }, tTime._speed).easing(TWEEN.Easing.Cubic.InOut).onUpdate(tweenMove2Bound).delay(this.startFrame + tTime.tween2Start).start();
            var tweenMove3Bound = ListenerFunctions.createListenerFunction(this, this.tweenMove3);
            this.tween3 = new TweenEach({
                x: tTime.moveX3,
                y: tTime.moveY3,
                orX: tTime.orX0,
                orY: tTime.orY0,
                wX: tTime.waveX0,
                wY: tTime.waveY0,
                scale: tTime.scale0
            }).to({
                x: tTime.moveX4,
                y: tTime.moveY4,
                orX: tTime.orX4,
                orY: tTime.orY4,
                wX: tTime.waveX1,
                wY: tTime.waveY1,
                scale: tTime.scale4
            }, tTime._speed).easing(TWEEN.Easing.Cubic.InOut).onUpdate(tweenMove3Bound).delay(this.startFrame + tTime.tween3Start).start();
            var tweenMove4Bound = ListenerFunctions.createListenerFunction(this, this.tweenMove4);
            this.tween4 = new TweenEach({
                y: 0
            }).to({
                y: tTime.moveY5
            }, tTime._speed3).onUpdate(tweenMove4Bound).delay(this.startFrame + tTime.tween4Start).start();
            var tweenMove5Bound = ListenerFunctions.createListenerFunction(this, this.tweenMove5);
            this.tween5 = new TweenEach({
                y: tTime.moveY5
            }).to({
                y: tTime.moveY6
            }, tTime._speed3).onUpdate(tweenMove5Bound).delay(this.startFrame + tTime.tween5Start).start();
            var tweenMove6Bound = ListenerFunctions.createListenerFunction(this, this.tweenMove6);
            this.tween6 = new TweenEach({
                x: 0
            }).to({
                x: tTime.moveX6
            }, 800).onUpdate(tweenMove6Bound).delay(this.startFrame + tTime.tween6Start).start();
            var tweenCaveOil1Bound = ListenerFunctions.createListenerFunction(this, this.tweenCaveOil1);
            this.caveTween0 = new TweenEach({
                y: 0
            }).to({
                y: 1
            }, tTime._speed).onUpdate(tweenCaveOil1Bound).delay(this.startFrame + tTime.drill0Start).start();
            var tweenPipe1Bound = ListenerFunctions.createListenerFunction(this, this.tweenPipe1);
            this.pipeTween1 = new TweenEach({
                y: 0
            }).to({
                y: 1
            }, tTime._speed4).onUpdate(tweenPipe1Bound).delay(this.startFrame + tTime.pipe1Start).start();
            var tweenDrill1Bound = ListenerFunctions.createListenerFunction(this, this.tweenDrill1);
            this.drillTween1 = new TweenEach({
                y: 0
            }).to({
                y: 1
            }, tTime._speed4).easing(TWEEN.Easing.Cubic.Out).onUpdate(tweenDrill1Bound).delay(this.startFrame + tTime.drill1Start).start();
        };
        p.close = function() {};
        p.update = function(frame) {
            this.__update(frame);
            var cFrame = this.localCurFrame(frame);
            this.seabglevel.update(cFrame);
            this.staticlevel.update(cFrame);
            this.wavelevel.update(cFrame);
            if (cFrame >= 4760) {
                this.oilrig.hide();
                this.divers.show();
                this.seawave.hide();
            } else {
                this.oilrig.show();
                this.divers.hide();
                this.seawave.show();
            }
        };
        p.addLevels = function() {
            var tTime = this.tweenTime;
            this.seabglevel = new StaticLevel("staticseabg");
            this.seabglevel.setup(0, 0, 0);
            this.addLevel(this.seabglevel);
            this.staticlevel = new StaticLevel("statictxt");
            this.staticlevel.setup(tTime.startX0, tTime.startY0, 0);
            this.addLevel(this.staticlevel);
            this.wavelevel = new StaticLevel("staticwave");
            this.wavelevel.setup(0, 0, 0);
            this.addLevel(this.wavelevel);
            this.txtlevel = new StaticLevel("statictxt");
            this.txtlevel.setup(0, 0, 0);
            this.addLevel(this.txtlevel);
        };
        p.addDescriptionTxt = function() {
            var txtTime = this.txtTime;
            var copies = copydata.scene3;
            this.desc = new ElDescription(copies.desc1.title, copies.desc1.txt, "", copies.desc1.color, this.startFrame + txtTime.txt1Start, 800, 50, 400, 0);
            this.txtlevel.addElement(this.desc.container);
            this.desc2 = new ElDescription(copies.desc2.title, copies.desc2.txt, "", copies.desc2.color, this.startFrame + txtTime.txt2Start, 800, 470, 70, 0);
            this.txtlevel.addElement(this.desc2.container);
            this.desc3 = new ElDescription(copies.desc3.title, copies.desc3.txt, "", copies.desc3.color, this.startFrame + txtTime.txt3Start, 800, 600, 240, 0);
            this.txtlevel.addElement(this.desc3.container);
            this.desc4 = new ElDescription(copies.desc4.title, copies.desc4.txt, "", copies.desc4.color, this.startFrame + txtTime.txt4Start, 800, 630, 500, 0);
            this.txtlevel.addElement(this.desc4.container);
        };
        p.addbgPipe = function(x, scale) {
            var bgpipe1 = this.divers.addSprite("pipe-bg.png", x, 460);
            bgpipe1.opacity(.35);
            bgpipe1.scale(scale);
            return bgpipe1;
        };
        p.tweenStarting = function(e) {
            var cObj = this.tween0.tweenVars();
            this.staticlevel.position(cObj.x, cObj.y);
        };
        p.tweenMove1 = function(e) {
            var cObj = this.tween1.tweenVars();
            this.staticlevel.xPos(cObj.x);
        };
        p.tweenMove2 = function(e) {
            var cObj = this.tween2.tweenVars();
            this.staticlevel.position(cObj.x, cObj.y);
            this.oilrig.updateNeedle(.4 * e);
        };
        p.tweenMove3 = function(e) {
            var cObj = this.tween3.tweenVars();
            this.oilrig.scale(cObj.scale);
            this.oilrig.position(cObj.orX, cObj.orY);
            this.seawave.yPos(cObj.wY);
            this.seabg.yPos(cObj.wY);
        };
        p.tweenMove4 = function(e) {
            var cObj = this.tween4.tweenVars();
            this.yPos(cObj.y);
            this.oilrig.updateDrill(e);
            this.oilrig.updateWire(e);
            this.oilhole.setHoleYPos(e);
            this.oilhole.hidePipe();
        };
        p.tweenMove5 = function(e) {
            var cObj = this.tween5.tweenVars();
            this.yPos(cObj.y);
        };
        p.tweenMove6 = function(e) {
            var cObj = this.tween6.tweenVars();
            this.xPos(cObj.x);
        };
        p.tweenCaveOil1 = function(e) {
            this.oilcave.updateLevel(e);
        };
        p.tweenPipe1 = function(e) {
            this.oilhole.updateOil(e);
        };
        p.tweenDrill1 = function(e) {
            this.oilrig.updateWire(1 - e);
            this.oilrig.updateDrill(1 - e);
            this.oilhole.setHoleYPos(1 - e);
            this.oilhole.showPipe();
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var data = MKK.getNamespace("data");
    var scenedata = data.scenedata;
    var styledata = data.styledata;
    var copydata = data.copydata;
    var AbScene = ns.AbScene;
    var StaticLevel = ns.level.StaticLevel;
    var ElSprite = ns.element.ElSprite;
    var ElSpriteContainer = ns.element.ElSpriteContainer;
    var ElText = ns.element.ElText;
    var ElRect = ns.element.ElRect;
    var ElSeaBG = ns.element.ElSeaBG;
    var ElSeaWave = ns.element.ElSeaWave;
    var ElSeaBed = ns.element.ElSeaBed;
    var ElSlope = ns.element.ElSlope;
    var ElSeaFloor = ns.element.ElSeaFloor;
    var ElSeaFloor = ns.element.ElSeaFloor;
    var ElProductionRig = ns.element.ElProductionRig;
    var ElPipe = ns.element.ElPipe;
    var ElHelicopter = ns.element.ElHelicopter;
    var ElSubmarine = ns.element.ElSubmarine;
    var ElFpso = ns.element.ElFpso;
    var ElDescription = ns.element.ElDescription;
    var FrameTween = MKK.getNamespace("app.animation").FrameTween;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    if (!ns.Scene4) {
        var Scene4 = function Scene4() {
            this.tweenTime = {
                _completespeed: 3122,
                _speed: 250,
                _speed2: 750,
                _speed3: 2100,
                txtTime1: 1200,
                txtTime2: 1660,
                txtTime3: 2965,
                txtTime4: 5600,
                dropTime: 1730,
                helicopterFromXPos: -400,
                helicopterFromYPos: 100,
                helicopterToXPos: [ 500, 800, 1700, 2050 ],
                helicopterToYPos: [ 100, 400, 80, 360 ],
                delayStartTime: 500,
                movementStartTime: 750,
                rigParallaxTime: 780,
                offsetMoveTime: 500,
                movedownStartTime: 3120,
                moveSubStartTime: 3500,
                moveLandStartTime: 4250,
                tweenInY0: -1905,
                tweenInY1: 0
            };
        };
        ns.Scene4 = Scene4;
        var p = Scene4.prototype = new AbScene();
        p.open = function() {
            var tT = this.tweenTime;
            var copies = copydata.scene4;
            this.backlevel = new StaticLevel("staticsback");
            this.backlevel.setup(0, 0, 0);
            this.addLevel(this.backlevel);
            this.midlevel = new StaticLevel("staticsmid");
            this.midlevel.setup(0, 0, 0);
            this.addLevel(this.midlevel);
            this.frontlevel = new StaticLevel("staticsfront");
            this.frontlevel.setup(0, 0, 0);
            this.addLevel(this.frontlevel);
            this.txtlevel = new StaticLevel("staticstxt");
            this.txtlevel.setup(0, 0, 0);
            this.addLevel(this.txtlevel);
            this.seabg = new ElSeaBG("seabg", 1024, 708, 0, 0, 0, 4096, 70);
            this.seawave = new ElSeaWave("seawave", 0, 708, 0, 0, 0, 8041);
            this.seabg2 = new ElSeaBG("seabg", 4596, 708, 0, 0, 0, 3496, 1524);
            this.seabed = new ElSeaBed(0, 0, 4690, 1800, 0, 4096);
            this.seafloor = new ElSeaFloor("seafloor", 4556, 1800, 0, 0, 0, 3072, 80);
            this.seaslope = new ElSlope(0, 6e3, 6144, 1510, 0, 1974);
            this.sign = new ElSprite("processing-sign.png", 8280, 350, .5, 1);
            this.pipe = new ElPipe(0, 5e3, 5500, 1740, 0);
            this.smallrig = new ElSprite("small-rig.png", 255, 254, 0, 0, 0);
            this.iceberg1 = new ElSprite("drilling_iceberg1.png", 0, 370, 0, 0, 0);
            this.iceberg2 = new ElSprite("drilling_iceberg2.png", 400, 353, 0, 0, 0);
            this.iceberg3 = new ElSprite("drilling_iceberg1.png", 2550, 370, 0, 0, 0);
            this.helicopter = new ElHelicopter(0, 4e3, -400, 0);
            this.fpso = new ElFpso(0, 4e3, 2770, 340, 0);
            this.productionrig = new ElProductionRig(0, 4e3, 1324, -40, 0);
            this.submarine = new ElSubmarine(0, 3e3, 6200, 1200, 0);
            this.cross1 = new ElSprite("underwater-cross-blue.png", 4800, 1630, 0, 0, 0);
            this.cross2 = new ElSprite("underwater-cross-blue.png", 5300, 1630, 0, 0, 0);
            this.cross3 = new ElSprite("underwater-cross-blue.png", 5900, 1640, 0, 0, 0);
            this.fpsosign = new ElSprite("fpso-sign.png", 4880, 200, 0, 0, 0);
            this.fpsomover = new ElSprite("fpso-mover.png", 4965, 498, 0, 0);
            this.fpsomask = this.createMask(4870, 523, 230, 2e3);
            this.fpsosign.container.mask = this.fpsomask;
            this.backlevel.addElement(this.iceberg1.container);
            this.backlevel.addElement(this.smallrig.container);
            this.midlevel.addElement(this.productionrig.container);
            this.midlevel.addElement(this.helicopter.container);
            this.midlevel.addElement(this.fpso.container);
            this.frontlevel.addElement(this.seabg.container);
            this.frontlevel.addElement(this.seabg2.container);
            this.frontlevel.addElement(this.seabed.container);
            this.frontlevel.addElement(this.cross1.container);
            this.frontlevel.addElement(this.cross2.container);
            this.frontlevel.addElement(this.cross3.container);
            this.frontlevel.addElement(this.seafloor.container);
            this.frontlevel.addElement(this.seaslope.container);
            this.frontlevel.addElement(this.pipe.container);
            this.frontlevel.addElement(this.sign.container);
            this.frontlevel.addElement(this.fpsosign.container);
            this.frontlevel.addElement(this.fpsomask);
            this.frontlevel.addElement(this.fpsomover.container);
            this.frontlevel.addElement(this.iceberg2.container);
            this.frontlevel.addElement(this.iceberg3.container);
            this.frontlevel.addElement(this.seawave.container);
            this.frontlevel.addElement(this.submarine.container);
            this.desc = new ElDescription(copies.desc1.title, copies.desc1.txt, "", copies.desc1.color, this.startFrame + tT.txtTime1, 700, 100, 50, 0);
            this.txtlevel.addElement(this.desc.container);
            this.desc2 = new ElDescription(copies.desc2.title, copies.desc2.txt, "", copies.desc2.color, this.startFrame + tT.txtTime2, 700, 100, 50, 0);
            this.txtlevel.addElement(this.desc2.container);
            this.desc3 = new ElDescription(copies.desc3.title, copies.desc3.txt, "", copies.desc3.color, this.startFrame + tT.txtTime3, 1500, 100, 50, 0);
            this.txtlevel.addElement(this.desc3.container);
            this.desc4 = new ElDescription(copies.desc4.title, copies.desc4.txt, "", copies.desc4.color, this.startFrame + tT.txtTime4, 700, 50, 300, 0);
            this.txtlevel.addElement(this.desc4.container);
            var tweenInBound = ListenerFunctions.createListenerFunction(this, this.tweenInFunc);
            var tweenInStartBound = ListenerFunctions.createListenerFunction(this, this.tweenInFuncStart);
            var tweenInEndBound = ListenerFunctions.createListenerFunction(this, this.tweenInFuncEnd);
            this.tweenIn = new TweenEach({
                y: tT.tweenInY0
            }).to({
                y: tT.tweenInY1
            }, tT._speed2).onStart(tweenInStartBound).onComplete(tweenInEndBound).onUpdate(tweenInBound).delay(this.startFrame).start();
            var tween0Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0);
            var tween0StartBound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0Start);
            var tween0EndBound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0End);
            this.tween0 = new TweenEach({
                x: 0
            }).to({
                x: -4700
            }, tT._completespeed).onUpdate(tween0Bound).delay(this.startFrame + tT.movementStartTime + tT.delayStartTime).onStart(tween0StartBound).onComplete(tween0EndBound).start();
            var tween0bStartBound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0bStart);
            var tween0bBound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0b);
            var tween0bEndBound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0bEnd);
            this.tween0b = new TweenEach({
                y: 0,
                ry: 200
            }).to({
                y: -1100,
                ry: 950
            }, tT._speed2).onStart(tween0Bound).onUpdate(tween0bBound).onComplete(tween0Bound).delay(this.startFrame + tT.movementStartTime + tT.delayStartTime + tT.movedownStartTime).start();
            var tweenSubBound = ListenerFunctions.createListenerFunction(this, this.tweenSubFunc);
            this.tweensub = new TweenEach({
                x: 6200
            }).to({
                x: 5080
            }, 500).easing(TWEEN.Easing.Cubic.Out).onStart(tweenSubBound).onUpdate(tweenSubBound).onComplete(tweenSubBound).delay(this.startFrame + tT.movementStartTime + tT.delayStartTime + tT.moveSubStartTime).start();
            var tweenLandBound = ListenerFunctions.createListenerFunction(this, this.tweenLandFunc);
            this.tweenland = new TweenEach({
                x: -4700,
                y: -1100
            }).to({
                x: [ -6500, -6500, -7092 ],
                y: [ -1100, -1100, 50 ]
            }, 750).interpolation(TWEEN.Interpolation.Bezier).onUpdate(tweenLandBound).easing(TWEEN.Easing.Cubic.InOut).delay(this.startFrame + tT.movementStartTime + tT.delayStartTime + tT.moveLandStartTime).start();
            var tweenLandEndBound = ListenerFunctions.createListenerFunction(this, this.tweenLandEndFunc);
            this.tweenlandend = new TweenEach({
                x: -7092
            }).to({
                x: -8692
            }, 605 + 330).onUpdate(tweenLandEndBound).delay(this.startFrame + tT.movementStartTime + tT.delayStartTime + tT.moveLandStartTime + 750).start();
            var tween1Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc1);
            this.tween1 = new TweenEach({
                x: tT.helicopterFromXPos,
                y: tT.helicopterFromYPos
            }).to({
                x: tT.helicopterToXPos,
                y: tT.helicopterToYPos
            }, tT._speed3).interpolation(TWEEN.Interpolation.CatmullRom).onUpdate(tween1Bound).delay(this.startFrame + tT.movementStartTime).start();
            var tween2Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc2);
            this.tween2 = new TweenEach({
                x: 0
            }).to({
                x: 1
            }, 1700).onUpdate(tween2Bound).delay(this.startFrame + tT.movementStartTime + tT.rigParallaxTime).start();
        };
        p.close = function() {};
        p.update = function(frame) {
            this.__update(frame);
            var cFrame = this.localCurFrame(frame);
            var tT = this.tweenTime;
            this.backlevel.update(cFrame);
            this.midlevel.update(cFrame);
            this.frontlevel.update(cFrame);
            this.txtlevel.update(cFrame);
            if (cFrame <= tT.dropTime) {
                this.helicopter.showSign();
            } else {
                this.helicopter.hideSign();
            }
        };
        p.tweenInFuncStart = function(e) {
            this.yPos(this.tweenTime.tweenInY0);
            console.log("me in", this.yPos());
        };
        p.tweenInFunc = function(e) {
            var cObj = this.tweenIn.tweenVars();
            this.yPos(cObj.y);
        };
        p.tweenInFuncEnd = function(e) {
            var cObj = this.tweenIn.tweenVars();
            this.yPos(0);
            console.log("me out", this.yPos());
        };
        p.tweenFunc0Start = function(e) {
            this.frontlevel.xPos(0);
            this.midlevel.xPos(0);
            this.backlevel.xPos(0);
        };
        p.tweenFunc0 = function(e) {
            var cObj = this.tween0.tweenVars();
            this.frontlevel.xPos(cObj.x);
            this.midlevel.xPos(cObj.x * .9);
            this.backlevel.xPos(cObj.x * .8);
        };
        p.tweenFunc0End = function(e) {
            this.frontlevel.xPos(-4700);
            this.midlevel.xPos(-4700 * .9);
            this.backlevel.xPos(-4700 * .8);
        };
        p.tweenFunc0bStart = function(e) {
            this.frontlevel.yPos(cObj.y);
            this.midlevel.yPos(cObj.y);
            this.backlevel.yPos(cObj.y);
            this.fpsosign.yPos(cObj.ry);
        };
        p.tweenFunc0b = function(e) {
            var cObj = this.tween0b.tweenVars();
            this.frontlevel.yPos(cObj.y);
            this.midlevel.yPos(cObj.y);
            this.backlevel.yPos(cObj.y);
            this.fpsosign.yPos(cObj.ry);
        };
        p.tweenFunc0bEnd = function(e) {};
        p.tweenFunc1 = function(e) {
            var cObj = this.tween1.tweenVars();
            this.helicopter.position(cObj.x, cObj.y);
        };
        p.tweenSubFunc = function(e) {
            var cObj = this.tweensub.tweenVars();
            this.submarine.xPos(cObj.x);
            this.submarine.rotateLight(e);
        };
        p.tweenLandFunc = function(e) {
            var cObj = this.tweenland.tweenVars();
            this.frontlevel.position(cObj.x, cObj.y);
        };
        p.tweenLandEndFunc = function(e) {
            var cObj = this.tweenlandend.tweenVars();
            this.frontlevel.xPos(cObj.x);
        };
        p.tweenFunc2 = function(e) {
            this.productionrig.parallaxing(e);
        };
        p.createMask = function(x, y, w, h) {
            var casing = new PIXI.Graphics();
            casing.clear();
            casing.beginFill(13421772, 1);
            casing.drawRect(0, 0, w, h);
            casing.endFill();
            casing.position.x = x;
            casing.position.y = y;
            return casing;
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var scenedata = MKK.getNamespace("data").scenedata;
    var styledata = MKK.getNamespace("data").styledata;
    var AbScene = ns.AbScene;
    var StaticLevel = ns.level.StaticLevel;
    var ElSprite = ns.element.ElSprite;
    var ElSpriteContainer = ns.element.ElSpriteContainer;
    var ElText = ns.element.ElText;
    var ElRect = ns.element.ElRect;
    var ElSeaBG = ns.element.ElSeaBG;
    var ElSeaWave = ns.element.ElSeaWave;
    var ElSeaFloor = ns.element.ElSeaFloor;
    var ElOilCave = ns.element.ElOilCave;
    var ElShipInner = ns.element.ElShipInner;
    var ElRadarBoat = ns.element.ElRadarBoat;
    var ElRadarBoatSide = ns.element.ElRadarBoatSide;
    var ElDescription = ns.element.ElDescription;
    var FrameTween = MKK.getNamespace("app.animation").FrameTween;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    if (!ns.Scene5) {
        var Scene5 = function Scene5() {};
        ns.Scene5 = Scene5;
        var p = Scene5.prototype = new AbScene();
        p.open = function() {};
        p.close = function() {};
        p.update = function(frame) {};
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var data = MKK.getNamespace("data");
    var scenedata = data.scenedata;
    var styledata = data.styledata;
    var copydata = data.copydata;
    var AbScene = ns.AbScene;
    var StaticLevel = ns.level.StaticLevel;
    var ElSprite = ns.element.ElSprite;
    var ElSpriteContainer = ns.element.ElSpriteContainer;
    var ElText = ns.element.ElText;
    var ElRect = ns.element.ElRect;
    var ElSeaBG = ns.element.ElSeaBG;
    var ElSeaWave = ns.element.ElSeaWave;
    var ElSeaFloor = ns.element.ElSeaFloor;
    var ElOilCave = ns.element.ElOilCave;
    var ElShipInner = ns.element.ElShipInner;
    var ElRadarBoat = ns.element.ElRadarBoat;
    var ElRadarBoatSide = ns.element.ElRadarBoatSide;
    var ElDescription = ns.element.ElDescription;
    var FrameTween = MKK.getNamespace("app.animation").FrameTween;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    if (!ns.Scene6) {
        var Scene6 = function Scene6() {
            this.tweenTime = {
                _completespeed: 3600
            };
        };
        ns.Scene6 = Scene6;
        var p = Scene6.prototype = new AbScene();
        p.open = function() {
            var tT = this.tweenTime;
            var copies = copydata.scene6;
            this.backlevel = new StaticLevel("staticsback");
            this.backlevel.setup(0, 0, 0);
            this.addLevel(this.backlevel);
            this.mid2level = new StaticLevel("staticsmid2");
            this.mid2level.setup(0, 0, 0);
            this.addLevel(this.mid2level);
            this.midlevel = new StaticLevel("staticsmid");
            this.midlevel.setup(0, 0, 0);
            this.addLevel(this.midlevel);
            this.frontlevel = new StaticLevel("staticsfront");
            this.frontlevel.setup(0, 0, 0);
            this.addLevel(this.frontlevel);
            this.txtlevel = new StaticLevel("staticstxt");
            this.txtlevel.setup(0, 0, 0);
            this.addLevel(this.txtlevel);
            this.mountain1 = new ElSprite("mountain_blue_mid.png", 100, 420, 0, 0, 0);
            this.mountain2 = new ElSprite("mountain_green_mid.png", -130, 490, 0, 0, 0);
            this.frontProp1 = new ElSprite("processing-front_07.png", 200, 480, 0, 0, 0);
            this.frontProp2 = new ElSprite("processing-front_02.png", 400, 365, 0, 0, 0);
            this.frontProp3 = new ElSprite("processing-front_05.png", 1100, 485, 0, 0, 0);
            this.frontProp4 = new ElSprite("processing-front_02.png", 1700, 365, 0, 0, 0);
            this.frontProp5 = new ElSprite("processing-front_09.png", 2150, 495, 0, 0, 0);
            this.midProp1 = new ElSprite("processing-mid.png", 500, 340, 0, 0, 0);
            this.midProp2 = new ElSprite("processing-mid2.png", 900, 405, 0, 0, 0);
            this.midProp3 = new ElSprite("processing-mid.png", 1200, 340, 0, 0, 0);
            this.midProp4 = new ElSprite("processing-mid2.png", 1700, 405, 0, 0, 0);
            this.mid2Prop1 = new ElSprite("processing-mid3.png", 350, 580, 0, 0, 0);
            this.mid2Prop2 = new ElSprite("processing-mid3.png", 800, 620, 0, 0, 0);
            this.backProp1 = new ElSprite("processing-back.png", 700, 475, 0, 0, 0);
            this.backProp2 = new ElSprite("processing-back.png", 1100, 510, 0, 0, 0);
            this.backProp3 = new ElSprite("processing-back.png", 1300, 515, 0, 0, 0);
            this.seafloor = new ElSeaFloor("seafloor", 0, 705, 0, 0, 0, 4096, 80);
            this.desc = new ElDescription(copies.desc1.title, copies.desc1.txt, "", copies.desc1.color, this.startFrame + 700, 700, 50, 100, 0);
            this.desc2 = new ElDescription(copies.desc2.title, copies.desc2.txt, "", copies.desc2.color, this.startFrame + 500 + 700, 700, 50, 100, 0);
            this.desc3 = new ElDescription(copies.desc3.title, copies.desc3.txt, "", copies.desc3.color, this.startFrame + 1e3 + 700, 700, 50, 100, 0);
            this.desc4 = new ElDescription(copies.desc4.title, copies.desc4.txt, "", copies.desc4.color, this.startFrame + 1100 + 700, 700, 50, 200, 0);
            this.backlevel.addElement(this.mountain1.container);
            this.backlevel.addElement(this.mountain2.container);
            this.backlevel.addElement(this.backProp1.container);
            this.backlevel.addElement(this.backProp2.container);
            this.backlevel.addElement(this.backProp3.container);
            this.midlevel.addElement(this.midProp1.container);
            this.midlevel.addElement(this.midProp2.container);
            this.midlevel.addElement(this.midProp3.container);
            this.midlevel.addElement(this.midProp4.container);
            this.mid2level.addElement(this.mid2Prop1.container);
            this.mid2level.addElement(this.mid2Prop2.container);
            this.frontlevel.addElement(this.frontProp1.container);
            this.frontlevel.addElement(this.frontProp2.container);
            this.frontlevel.addElement(this.frontProp3.container);
            this.frontlevel.addElement(this.frontProp4.container);
            this.frontlevel.addElement(this.frontProp5.container);
            this.frontlevel.addElement(this.seafloor.container);
            this.txtlevel.addElement(this.desc.container);
            this.txtlevel.addElement(this.desc2.container);
            this.txtlevel.addElement(this.desc3.container);
            this.txtlevel.addElement(this.desc4.container);
            var tween0Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0);
            this.tween0 = new TweenEach({
                x: 1424
            }).to({
                x: -4700
            }, tT._completespeed).onUpdate(tween0Bound).delay(this.startFrame).start();
        };
        p.tweenFunc0 = function(e) {
            var cObj = this.tween0.tweenVars();
            this.backlevel.xPos(cObj.x * .7);
            this.mid2level.xPos(cObj.x * .8);
            this.midlevel.xPos(cObj.x * .9);
            this.frontlevel.xPos(cObj.x);
        };
        p.close = function() {};
        p.update = function(frame) {
            this.__update(frame);
            var cFrame = this.localCurFrame(frame);
            this.backlevel.update(cFrame);
            this.midlevel.update(cFrame);
            this.mid2level.update(cFrame);
            this.frontlevel.update(cFrame);
            this.txtlevel.update(cFrame);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var scenedata = MKK.getNamespace("data").scenedata;
    var styledata = MKK.getNamespace("data").styledata;
    var AbScene = ns.AbScene;
    var settings = MKK.getNamespace("data").settings;
    var StaticLevel = ns.level.StaticLevel;
    var Scene2Level = ns.level.Scene2Level;
    var ElSprite = ns.element.ElSprite;
    var ElSpriteContainer = ns.element.ElSpriteContainer;
    var ElText = ns.element.ElText;
    var ElRect = ns.element.ElRect;
    var ElSeaBG = ns.element.ElSeaBG;
    var ElSeaWave = ns.element.ElSeaWave;
    var ElSeaFloor = ns.element.ElSeaFloor;
    var ElOilCave = ns.element.ElOilCave;
    var ElShipInner = ns.element.ElShipInner;
    var ElRadarBoat = ns.element.ElRadarBoat;
    var ElRadarBoatSide = ns.element.ElRadarBoatSide;
    var ElDescription = ns.element.ElDescription;
    var FrameTween = MKK.getNamespace("app.animation").FrameTween;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    if (!ns.Scene7) {
        var Scene7 = function Scene7() {
            this.buildings = [];
            this.tweenTime = scenedata.scene7.tweenTime;
            this.buildingVars = [ {
                x: 0,
                y: 0,
                type: "house"
            } ];
        };
        ns.Scene7 = Scene7;
        var p = Scene7.prototype = new AbScene();
        p.open = function() {
            var tT = this.tweenTime;
            this.maskbg = this.createMaskBG();
            this.maskbg.alpha = 0;
            this.container.addChild(this.maskbg);
            this.backlevel = new StaticLevel("staticsback");
            this.backlevel.setup(0, 0, 0);
            this.addLevel(this.backlevel);
            this.midlevel = new StaticLevel("staticsmid");
            this.midlevel.setup(0, 0, 0);
            this.addLevel(this.midlevel);
            this.trucklevel = new StaticLevel("staticstruck");
            this.trucklevel.setup(0, 0, 0);
            this.addLevel(this.trucklevel);
            this.frontlevel = new StaticLevel("staticsfront");
            this.frontlevel.setup(0, 0, 0);
            this.addLevel(this.frontlevel);
            this.endlevel = new StaticLevel("staticsend");
            this.endlevel.setup(0, 0, 0);
            this.addLevel(this.endlevel);
            this.backmountain1 = new ElSprite("mountain_lightgreen_big.png", 0, 200, 0, 0, 0);
            this.backmountain2 = new ElSprite("mountain_twin_small.png", 1022, 538, 0, 0, 0);
            this.backmountain3 = new ElSprite("mountain_twin_small.png", 1540, 538, 0, 0, 0);
            this.tree1 = this.createTree(200, 558, 1);
            this.tree2 = this.createTree(600, 600, .7);
            this.tree3 = this.createTree(750, 600, .7);
            this.tree4 = this.createTree(675, 600, 1);
            this.treelarge = new ElSprite("tree_big.png", 1650, 400, 0, 0);
            this.floor = new ElSeaFloor("floor", 0, 708, 0, 0, 0, 900, 70);
            this.road = this.createRoad();
            this.trucksmall = new ElSprite("truck_01.png", tT.truckX0, 720, 0, 0, 1);
            this.frontmountain1 = new ElSprite("mountain_lightgreen_mid.png", 100, 500, 0, 0, 0);
            this.frontmountain2 = new ElSprite("mountain_green_mid.png", 900, 500, 0, 0, 0);
            this.towngrass = this.createGrass();
            this.frontroad = new ElSprite("road.png", 966, 693, .5, 0);
            this.frontroad.scale(1.5);
            this.fronttruck = new ElSprite("truck_02.png", tT.fronttruckX0, tT.fronttruckY0, 0, .5, 0);
            this.sea = this.createSea();
            this.theend = new ElSprite("the_end.png", 512, 800, 0, .5, 0);
            this.backlevel.addElement(this.backmountain1.container);
            this.backlevel.addElement(this.tree1.container);
            this.backlevel.addElement(this.tree2.container);
            this.backlevel.addElement(this.tree3.container);
            this.backlevel.addElement(this.sea);
            this.midlevel.addElement(this.backmountain2.container);
            this.midlevel.addElement(this.backmountain3.container);
            this.midlevel.addElement(this.road);
            this.midlevel.addElement(this.towngrass);
            this.midlevel.addElement(this.frontroad.container);
            this.trucklevel.addElement(this.trucksmall.container);
            this.createHouse(this.midlevel);
            this.frontlevel.addElement(this.frontmountain1.container);
            this.frontlevel.addElement(this.frontmountain2.container);
            this.frontlevel.addElement(this.treelarge.container);
            this.frontlevel.addElement(this.fronttruck.container);
            this.endlevel.addElement(this.fronttruck.container);
            this.endlevel.addElement(this.theend.container);
            this.maskCircle = this.createMask();
            this.container.addChild(this.maskCircle);
            var tweenTruckBound = ListenerFunctions.createListenerFunction(this, this.tweenTruckFunc);
            this.tweenTruck = new TweenEach({
                x: 1e3
            }).to({
                x: tT.truckX0
            }, 240).onUpdate(tweenTruckBound).delay(this.startFrame).start();
            var tween0Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0);
            this.tween0 = new TweenEach({
                x: tT.tweenStartX0,
                roadx: tT.roadX0
            }).to({
                x: tT.tweenStartX1,
                roadx: tT.roadX1
            }, tT._speed2).onUpdate(tween0Bound).delay(this.startFrame).start();
            var tween1Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc1);
            this.tween1 = new TweenEach({
                x: tT.tweenStartX0,
                scale: 1,
                seay: tT.seaY0,
                truckscale: 1
            }).to({
                x: tT.tweenStartX1,
                scale: .6,
                seay: tT.seaY1,
                truckscale: .5
            }, tT._speed).easing(TWEEN.Easing.Cubic.InOut).onUpdate(tween1Bound).delay(this.startFrame + tT.tween1Start).start();
            var tween2Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc2);
            this.tween2 = new TweenEach({
                x: tT.truckX0
            }).to({
                x: tT.truckX1
            }, tT._speed1).easing(TWEEN.Easing.Cubic.InOut).onUpdate(tween2Bound).delay(this.startFrame + tT.tween2Start).start();
            var tween3Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc3);
            this.tween3 = new TweenEach({
                y: tT.fronttruckY0,
                scale: 1,
                maskscale: 1
            }).to({
                y: tT.fronttruckY1,
                scale: .2,
                maskscale: .12
            }, tT._speed1).easing(TWEEN.Easing.Cubic.InOut).onUpdate(tween3Bound).delay(this.startFrame + tT.tween3Start).start();
            var tween4Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc4);
            this.tween4 = new TweenEach({
                alpha: 0
            }).to({
                alpha: 1
            }, tT._fast).easing(TWEEN.Easing.Cubic.InOut).onUpdate(tween4Bound).delay(this.startFrame + tT.tween4Start).start();
            var tween5Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc5);
            this.tween5 = new TweenEach({
                y: 800
            }).to({
                y: 524
            }, tT._speed).easing(TWEEN.Easing.Cubic.InOut).onUpdate(tween5Bound).delay(this.startFrame + tT.tween5Start).start();
            var tween6Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc6);
            this.tween6 = new TweenEach({
                y: 0
            }).to({
                y: -800
            }, tT._speed).easing(TWEEN.Easing.Cubic.InOut).onUpdate(tween6Bound).delay(this.startFrame + tT.tween6Start).start();
        };
        p.close = function() {};
        p.update = function(frame) {
            this.__update(frame);
            var cFrame = this.localCurFrame(frame);
            this.backlevel.update(cFrame);
            this.midlevel.update(cFrame);
            this.frontlevel.update(cFrame);
            if (cFrame >= 1350) {
                this.fronttruck.show();
                this.maskCircle.visible = true;
                this.backlevel.container.mask = this.maskCircle;
                this.midlevel.container.mask = this.maskCircle;
                this.frontlevel.container.mask = this.maskCircle;
                this.maskbg.visible = true;
            } else {
                this.fronttruck.hide();
                this.maskCircle.visible = false;
                this.maskbg.visible = false;
                this.container.mask = null;
            }
        };
        p.createHouse = function(level) {
            this.house1 = new ElSprite("house.png", 1950, 1e3, 0, .5, 1);
            this.house1.scale(.3);
            this.house2 = new ElSprite("house.png", 1050, 1e3, 0, .5, 1);
            this.house2.scale(.3);
            this.house3 = new ElSprite("house.png", 640, 1200, 0, .5, 1);
            this.house2.scale(.4);
            this.house4 = new ElSprite("house.png", 2200, 810, 0, .5, 1);
            this.house4.scale(.2);
            this.house5 = new ElSprite("house.png", 2270, 830, 0, .5, 1);
            this.house5.scale(.2);
            this.house6 = new ElSprite("house.png", 2200, 810, 0, .5, 1);
            this.house6.scale(.3);
            this.flat1 = new ElSprite("flat.png", 1150, 820, 0, .5, 1);
            this.flat2 = new ElSprite("flat.png", 1850, 820, 0, .5, 1);
            this.flat3 = new ElSprite("flat.png", 850, 920, 0, .5, 1);
            this.flat4 = new ElSprite("flat.png", 2150, 920, 0, .5, 1);
            this.tree1 = new ElSprite("tree_small.png", 1050, 800, .5, 1);
            this.tree2 = new ElSprite("tree_small.png", 1150, 770, .5, 1);
            this.tree2.scale(.8);
            this.tree3 = new ElSprite("tree_small.png", 1820, 780, .5, 1);
            this.tree3.scale(.6);
            this.tree4 = new ElSprite("tree_small.png", 2220, 980, .5, 1);
            this.tree5 = new ElSprite("tree_small.png", 850, 800, .5, 1);
            this.tree6 = new ElSprite("tree_small.png", 1300, 800, .5, 1);
            this.tree6.scale(.8);
            this.tree7 = new ElSprite("tree_small.png", 1820, 780, .5, 1);
            this.tree7.scale(.6);
            this.tree8 = new ElSprite("tree_small.png", 2120, 880, .5, 1);
            level.addElement(this.flat1.container);
            level.addElement(this.flat2.container);
            level.addElement(this.flat3.container);
            level.addElement(this.flat4.container);
            level.addElement(this.tree1.container);
            level.addElement(this.tree2.container);
            level.addElement(this.tree3.container);
            level.addElement(this.tree4.container);
            level.addElement(this.tree5.container);
            level.addElement(this.tree6.container);
            level.addElement(this.tree7.container);
            level.addElement(this.tree8.container);
            level.addElement(this.house1.container);
            level.addElement(this.house2.container);
            level.addElement(this.house3.container);
            level.addElement(this.house4.container);
            level.addElement(this.house5.container);
            level.addElement(this.house6.container);
        };
        p.tweenTruckFunc = function(e) {
            cObj = this.tweenTruck.tweenVars();
            this.trucksmall.xPos(cObj.x);
        };
        p.tweenFunc0 = function(e) {
            cObj = this.tween0.tweenVars();
            this.backlevel.xPos(cObj.x * .7);
            this.midlevel.xPos(cObj.x * .2);
            this.frontlevel.xPos(cObj.x);
            this.road.position.x = cObj.roadx;
        };
        p.tweenFunc1 = function(e) {
            cObj = this.tween1.tweenVars();
            this.backlevel.scale(cObj.scale);
            this.midlevel.scale(cObj.scale);
            this.trucklevel.scale(cObj.scale);
            this.trucksmall.scale(cObj.truckscale);
            this.sea.position.y = cObj.seay;
        };
        p.tweenFunc2 = function(e) {
            cObj = this.tween2.tweenVars();
            this.trucksmall.xPos(cObj.x);
        };
        p.tweenFunc3 = function(e) {
            cObj = this.tween3.tweenVars();
            this.fronttruck.yPos(cObj.y);
            this.fronttruck.scale(cObj.scale);
            this.maskUpdateScale(cObj.maskscale);
        };
        p.tweenFunc4 = function(e) {
            cObj = this.tween4.tweenVars();
            this.maskbg.alpha = cObj.alpha;
        };
        p.tweenFunc5 = function(e) {
            cObj = this.tween5.tweenVars();
            this.theend.yPos(cObj.y);
        };
        p.tweenFunc6 = function(e) {
            cObj = this.tween6.tweenVars();
            this.yPos(cObj.y);
        };
        p.createTree = function(x, y, scale) {
            var tmp = new ElSprite("tree_small.png", x, y, 0, 0);
            tmp.scale(scale);
            return tmp;
        };
        p.createSea = function() {
            var casing = new PIXI.Graphics();
            casing.clear();
            casing.beginFill(settings.defaultSeaLight, 1);
            casing.drawRect(0, 0, 3200, 70);
            casing.endFill();
            casing.position.x = 1300;
            casing.position.y = this.tweenTime.seaY0;
            casing.alpha = 1;
            return casing;
        };
        p.createRoad = function() {
            var casing = new PIXI.Graphics();
            casing.clear();
            casing.beginFill(settings.defaultRoadGreen, 1);
            casing.drawRect(0, -10, 6e3, 80);
            casing.beginFill(settings.defaultRoadGrey, 1);
            casing.drawRect(0, 0, 6e3, 20);
            casing.endFill();
            casing.position.x = 1e3;
            casing.position.y = 708;
            casing.alpha = 1;
            return casing;
        };
        p.createGrass = function() {
            var casing = new PIXI.Graphics();
            casing.clear();
            casing.beginFill(settings.defaultTownGreen, 1);
            casing.drawRect(0, -10, 3e3, 800);
            casing.endFill();
            casing.position.x = 400;
            casing.position.y = 778;
            casing.alpha = 1;
            return casing;
        };
        p.createMask = function() {
            var casing = new PIXI.Graphics();
            casing.clear();
            casing.beginFill(settings.defaultRoadGreen, 1);
            casing.drawCircle(0, 0, 1300);
            casing.endFill();
            casing.position.x = 512;
            casing.position.y = 384;
            casing.visible = false;
            return casing;
        };
        p.createMaskBG = function() {
            var casing = new PIXI.Graphics();
            casing.clear();
            casing.beginFill(16777215, 1);
            casing.drawCircle(0, 0, 170);
            casing.beginFill(settings.defaultBGColor, 1);
            casing.drawCircle(0, 0, 156);
            casing.endFill();
            casing.position.x = 512;
            casing.position.y = 384;
            casing.visible = true;
            return casing;
        };
        p.maskUpdateScale = function(e) {
            this.maskCircle.scale.x = this.maskCircle.scale.y = e;
        };
        p.createBuildings = function() {
            var bArr = this.buildings;
            for (var i = 0; i < bArr.length; i++) {
                var tmp;
                if (bArr[i].type == "house") tmp = new ElSprite("house.png", 1540, 538, 0, 0, 0); else new ElSprite("flat.png", 1540, 538, 0, 0, 0);
                this.buildings.push(tmp);
                this.midlevel.addElement(tmp.container);
            }
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var data = MKK.getNamespace("data");
    var copydata = data.copydata;
    var scenedata = data.scenedata;
    var styledata = data.styledata;
    var AbScene = ns.AbScene;
    var StaticLevel = ns.level.StaticLevel;
    var Scene2Level = ns.level.Scene2Level;
    var ElSprite = ns.element.ElSprite;
    var ElSpriteContainer = ns.element.ElSpriteContainer;
    var ElText = ns.element.ElText;
    var ElRect = ns.element.ElRect;
    var ElSeaBG = ns.element.ElSeaBG;
    var ElSeaWave = ns.element.ElSeaWave;
    var ElSeaFloor = ns.element.ElSeaFloor;
    var ElOilCave = ns.element.ElOilCave;
    var ElShipInner = ns.element.ElShipInner;
    var ElRadarBoat = ns.element.ElRadarBoat;
    var ElRadarBoatSide = ns.element.ElRadarBoatSide;
    var ElDescription = ns.element.ElDescription;
    var FrameTween = MKK.getNamespace("app.animation").FrameTween;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    if (!ns.Scene8) {
        var Scene8 = function Scene8() {
            this.tweenTime = scenedata.scene8.tweenTime;
        };
        ns.Scene8 = Scene8;
        var p = Scene8.prototype = new AbScene();
        p.open = function() {
            var tT = this.tweenTime;
            var copies = copydata.scene8;
            this.level1 = new StaticLevel("level1");
            this.level1.setup(0, 0, 0);
            this.addLevel(this.level1);
            var strapStyle = styledata.straplinegrey;
            var smallStyle = styledata.endlineBody;
            var replayStyle = styledata.replayGrey;
            var disclaimTitle = styledata.disclaimTitle;
            this.txt2 = new ElText(copies.line1, tT.txt2X0, tT.txt2Y0, 0, .5, .5);
            this.txt2.setStyle(strapStyle);
            this.txt2.opacity(0);
            this.txt3 = new ElText(copies.line2, tT.txt3X0, tT.txt3Y0, 0, .5, .5);
            this.txt3.setStyle(smallStyle);
            this.txt3.opacity(0);
            this.txt4 = new ElText(copies.line3, tT.txt4X0, tT.txt4Y0, 0, .5, .5);
            this.txt4.setStyle(replayStyle);
            this.txt4.opacity(0);
            this.txt4.container.interactive = true;
            var that = this;
            console.log("lala", this.txt4.container.interactive);
            this.txt4.container.click = this.txt4.container.tap = function(e) {
                console.log("aa tester");
                that.dispatchCustomEvent("replay");
            };
            this.txt5 = new ElText(copies.line4, tT.txt5X0, tT.txt5Y0, 0, .5, .5);
            this.txt5.setStyle(disclaimTitle);
            this.txt5.opacity(0);
            this.level1.addElement(this.txt2.container);
            this.level1.addElement(this.txt3.container);
            this.level1.addElement(this.txt4.container);
            this.level1.addElement(this.txt5.container);
            var tween0Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0);
            this.tween0 = new TweenEach({
                y: tT.txt2Y0
            }).to({
                y: tT.txt2Y1
            }, tT._speed).easing(TWEEN.Easing.Cubic.InOut).onUpdate(tween0Bound).delay(this.startFrame).start();
            var tween1Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc1);
            this.tween1 = new TweenEach({
                y: tT.txt3Y0
            }).to({
                y: tT.txt3Y1
            }, tT._speed).easing(TWEEN.Easing.Cubic.InOut).onUpdate(tween1Bound).delay(this.startFrame + tT.stackDelay).start();
            var tween2Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc2);
            this.tween2 = new TweenEach({
                y: tT.txt4Y0
            }).to({
                y: tT.txt4Y1
            }, tT._speed).easing(TWEEN.Easing.Cubic.InOut).onUpdate(tween2Bound).delay(this.startFrame + tT.stackDelay * 2).start();
            var tween3Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc3);
            this.tween3 = new TweenEach({
                y: tT.txt5Y0
            }).to({
                y: tT.txt5Y1
            }, tT._speed).easing(TWEEN.Easing.Cubic.InOut).onUpdate(tween3Bound).delay(this.startFrame + tT.stackDelay * 3).start();
        };
        p.tweenFunc0 = function(e) {
            var cObj = this.tween0.tweenVars();
            this.txt2.opacity(e);
            this.txt2.yPos(cObj.y);
        };
        p.tweenFunc1 = function(e) {
            var cObj = this.tween1.tweenVars();
            this.txt3.opacity(e);
            this.txt3.yPos(cObj.y);
        };
        p.tweenFunc2 = function(e) {
            var cObj = this.tween2.tweenVars();
            this.txt4.opacity(e);
            this.txt4.yPos(cObj.y);
        };
        p.tweenFunc3 = function(e) {
            var cObj = this.tween3.tweenVars();
            this.txt5.opacity(e);
            this.txt5.yPos(cObj.y);
        };
        p.close = function() {};
        p.update = function(frame) {
            this._update(frame);
            var cFrame = this.localCurFrame(frame);
            this.level1.update(cFrame);
        };
    }
})();

(function() {
    var scenedata = MKK.getNamespace("data").scenedata;
    var Core = MKK.getNamespace("mkk.core").Core;
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var Trackpad = MKK.getNamespace("mkk.event").Trackpad;
    var AssetsLoader = MKK.getNamespace("app.loader").AssetsLoader;
    var Navi = MKK.getNamespace("app.scene").Navi;
    var ns = MKK.getNamespace("app");
    var Scene1 = MKK.getNamespace("app.scene").Scene1;
    var Scene2 = MKK.getNamespace("app.scene").Scene2;
    var Scene3 = MKK.getNamespace("app.scene").Scene3;
    var Scene4 = MKK.getNamespace("app.scene").Scene4;
    var Scene6 = MKK.getNamespace("app.scene").Scene6;
    var Scene7 = MKK.getNamespace("app.scene").Scene7;
    var Scene8 = MKK.getNamespace("app.scene").Scene8;
    var Scroller = MKK.getNamespace("app.event").Scroller;
    var Loader = MKK.getNamespace("app.loader").Loader;
    var FrameTween = MKK.getNamespace("app.animation").FrameTween;
    if (!ns.app) {
        var App = function() {
            this.isDebug = true;
            this.loaded = false;
        };
        ns.App = App;
        var p = App.prototype = new Core();
        var s = Core.prototype;
        p.setup = function() {
            this._setup();
            this.stage = new PIXI.Stage(15198183);
            this.renderer = new PIXI.CanvasRenderer(1024, 768);
            this.renderer.roundPixels = true;
            document.body.appendChild(this.renderer.view);
            this.soundtrack = new buzz.sound("sound/oilgassoundtrack_1-2_01", {
                formats: [ "ogg", "mp3", "aac" ]
            });
            this.soundtrack.load();
            this.soundtrack.loop();
            var that = this;
            this.soundtrack.whenReady(function() {
                console.log("sound ready");
            });
            this.loader = new Loader();
            this.navi = new Navi();
            document.body.appendChild(this.navi.sideview);
            document.body.appendChild(this.navi.soundview);
            document.body.appendChild(this.loader.view);
            document.body.appendChild(this.navi.topview);
            this.scroller = new Scroller(scenedata.totalFrame);
            this.scroller.setup(this.renderer.view);
            this.scene1 = new Scene1();
            this.scene1.setup(scenedata.scene1.startFrame, scenedata.scene1.duration, 0, 0);
            this.scene2 = new Scene2();
            this.scene2.setup(scenedata.scene2.startFrame, scenedata.scene2.duration, 0, 0);
            this.scene3 = new Scene3();
            this.scene3.setup(scenedata.scene3.startFrame, scenedata.scene3.duration, 0, 0);
            this.scene4 = new Scene4();
            this.scene4.setup(scenedata.scene4.startFrame, scenedata.scene4.duration, 0, 0);
            this.scene6 = new Scene6();
            this.scene6.setup(scenedata.scene6.startFrame, scenedata.scene6.duration, 0, 0);
            this.scene7 = new Scene7();
            this.scene7.setup(scenedata.scene7.startFrame, scenedata.scene7.duration, 0, 0);
            this.scene8 = new Scene8();
            this.scene8.setup(scenedata.scene8.startFrame, scenedata.scene8.duration, 0, 0);
            this.loadFonts();
        };
        p.init = function() {
            this.scene1.init(this.stage);
            this.scene2.init(this.stage);
            this.scene3.init(this.stage);
            this.scene6.init(this.stage);
            this.scene4.init(this.stage);
            this.scene7.init(this.stage);
            this.scene8.init(this.stage);
            this.loader.fadeout();
            this.swipeLeftFuncBound = ListenerFunctions.createListenerFunction(this, this.swipeLeftFunc);
            this.swipeRightFuncBound = ListenerFunctions.createListenerFunction(this, this.swipeRightFunc);
            this.swipeUpFuncBound = ListenerFunctions.createListenerFunction(this, this.swipeUpFunc);
            this.scroller.trackpad.addEventListener("swipeleft", this.swipeLeftFuncBound);
            this.scroller.trackpad.addEventListener("swiperight", this.swipeRightFuncBound);
            this.scroller.trackpad.addEventListener("swipeup", this.swipeUpFuncBound);
            this.naviTapFuncBound = ListenerFunctions.createListenerFunction(this, this.naviTapFunc);
            this.navi.addEventListener("navitap", this.naviTapFuncBound);
            this.soundTapFuncBound = ListenerFunctions.createListenerFunction(this, this.soundTapFunc);
            this.navi.addEventListener("soundtap", this.soundTapFuncBound);
            this.replayFuncBound = ListenerFunctions.createListenerFunction(this, this.replayFunc);
            this.scene8.addEventListener("replay", this.replayFuncBound);
        };
        p.swipeLeftFunc = function(e) {
            this.navi.hideSide();
        };
        p.swipeRightFunc = function(e) {
            this.navi.showSide();
        };
        p.swipeUpFunc = function(e) {
            if (this.scroller.getDistance() < 100) {
                this.soundtrack.play();
                this.navi.toggleSoundIcon(true);
            }
        };
        p.naviTapFunc = function(e) {
            this.scroller.scrollto(e.detail.distance);
        };
        p.soundTapFunc = function(e) {
            if (e.detail.soundstate === true) {
                this.soundtrack.play();
            } else {
                this.soundtrack.pause();
            }
        };
        p.replayFunc = function(e) {
            this.scroller.scrollto(0);
        };
        p.loadFonts = function() {
            var fontActiveBound = ListenerFunctions.createListenerFunction(this, this.fontActive);
            var that = this;
            this.tweener = new TWEEN.Tween({
                rotation: 0
            }).to({
                rotation: 1
            }, 7e3).onUpdate(function(e) {
                that.loader.waveYPos(e);
            }).onComplete(fontActiveBound).start();
        };
        p.fontLoading = function() {
            console.log("Web font loading");
        };
        p.fontActive = function() {
            console.log("Web font Active");
            this.load();
        };
        p.load = function() {
            assetsToLoader = [ "assets/global.json", "assets/scene1.json", "assets/scene2.json", "assets/scene2b.json", "assets/scene2c.json", "assets/scene3.json", "assets/scene3b.json", "assets/scene4.json", "assets/scene5.json", "assets/scene6.json", "assets/scene7.json", "assets/scene8.json", "assets/sceneend.json" ];
            loader = new PIXI.AssetLoader(assetsToLoader);
            var that = this;
            loadComplete = function() {
                that.loadComplete();
            };
            loader.onComplete = loadComplete;
            loader.load();
        };
        p.loadComplete = function() {
            this.loaded = true;
            console.log("load complete");
            this.init();
        };
        p.update = function() {
            TWEEN.update();
            if (!this.loaded) return;
            var frame = this.scroller.getDistance();
            FrameTween.update(frame);
            this.scene1.update(frame);
            this.scene2.update(frame);
            this.scene3.update(frame);
            this.scene4.update(frame);
            this.scene6.update(frame);
            this.scene7.update(frame);
            this.scene8.update(frame);
            this.scroller.update();
            this.navi.update(frame);
        };
        p.animate = function() {
            this.scene2.animate();
        };
        p.render = function() {
            if (!this.loaded) return;
            this.update();
            this.animate();
            this.renderer.render(this.stage);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var scenedata = MKK.getNamespace("data").scenedata;
    var styledata = MKK.getNamespace("data").styledata;
    var AbScene = ns.AbScene;
    var Scene1Level = ns.level.Scene1Level;
    var Scene2Level = ns.level.Scene2Level;
    var ElSprite = ns.element.ElSprite;
    var ElSpriteContainer = ns.element.ElSpriteContainer;
    var ElText = ns.element.ElText;
    var ElRect = ns.element.ElRect;
    var ElGrowRect = ns.element.ElGrowRect;
    var ElSeaBG = ns.element.ElSeaBG;
    var ElSeaWave = ns.element.ElSeaWave;
    var ElSeaFloor = ns.element.ElSeaFloor;
    var ElSeaBed = ns.element.ElSeaBed;
    var ElOilCave = ns.element.ElOilCave;
    var ElEngine = ns.element.ElEngine;
    var ElOilrig = ns.element.ElOilrig;
    var ElProductionRig = ns.element.ElProductionRig;
    var ElRadarBoatSide = ns.element.ElRadarBoatSide;
    var ElFpso = ns.element.ElFpso;
    var ElHelicopter = ns.element.ElHelicopter;
    var ElRotatingSprite = ns.element.ElRotatingSprite;
    var ElDrill = ns.element.ElDrill;
    var ElShipInner = ns.element.ElShipInner;
    var ElRadar = ns.element.ElRadar;
    var ElRadarBoat = ns.element.ElRadarBoat;
    var ElDescription = ns.element.ElDescription;
    var FrameTween = MKK.getNamespace("app.animation").FrameTween;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    if (!ns.TestElement) {
        var TestElement = function TestElement() {};
        ns.TestElement = TestElement;
        var p = TestElement.prototype = new AbScene();
        p.open = function() {
            this.createLevels(scenedata.scene2.level, Scene2Level);
            this.shipinner = new ElShipInner(0, 3e3);
            this.radar = new ElRadar(0, 3e3, 100, 100, true);
            this.radar2 = new ElRadar(0, 3e3, 300, 500);
            this.radarboat = new ElRadarBoat(0, 3e3, 512, 396);
            this.seafloor = new ElSeaFloor("seafloor", 0, 4282, 0, 0, 0, 1024, 1024);
            this.oilcave = new ElOilCave("oilcave", 0, 0, 0, 200, 0, 0);
            this.radarboatside = new ElRadarBoatSide(0, 0, 0, 0);
            this.oilrig = new ElOilrig(0, 0, 0, 0, 0, 0, 0);
            this.productionrig = new ElProductionRig(0, 0, 0, 0, 0, 0, 0);
            this.fpso = new ElFpso(0, 0, 0, 200, 0, 0, 0);
            this.helicopter = new ElHelicopter(0, 0, 0, 200, 0, 0, 0);
            this.seabed = new ElSeaBed(0, 0, 0, 200, 0, 1024);
            this.drill = new ElDrill(0, 0, 200, 200, 0);
            this.drill.scale(.6);
            this.level[1].addElement(this.drill.container);
        };
        p.close = function() {};
        p.update = function(frame) {
            this._update(frame);
            var cFrame = this.localCurFrame(frame);
            if (cFrame >= 0 && cFrame < this.duration) {
                this.cPos.y = -cFrame;
            }
            this.level[0].update(cFrame);
            this.level[1].update(cFrame);
        };
    }
})();

(function() {
    var ns = MKK.getNamespace("app.scene");
    var ListenerFunctions = MKK.getNamespace("mkk.event").ListenerFunctions;
    var scenedata = MKK.getNamespace("data").scenedata;
    var styledata = MKK.getNamespace("data").styledata;
    var AbScene = ns.AbScene;
    var Scene1Level = ns.level.Scene1Level;
    var Scene2Level = ns.level.Scene2Level;
    var ElSprite = ns.element.ElSprite;
    var ElSpriteContainer = ns.element.ElSpriteContainer;
    var ElText = ns.element.ElText;
    var ElRect = ns.element.ElRect;
    var ElGrowRect = ns.element.ElGrowRect;
    var ElSeaBG = ns.element.ElSeaBG;
    var ElSeaWave = ns.element.ElSeaWave;
    var ElRotatingSprite = ns.element.ElRotatingSprite;
    var ElShipInner = ns.element.ElShipInner;
    var ElRadar = ns.element.ElRadar;
    var ElRadarBoat = ns.element.ElRadarBoat;
    var ElDescription = ns.element.ElDescription;
    var FrameTween = MKK.getNamespace("app.animation").FrameTween;
    var TweenEach = MKK.getNamespace("app.animation").TweenEach;
    if (!ns.TestElement2) {
        var TestElement2 = function TestElement2() {};
        ns.TestElement2 = TestElement2;
        var p = TestElement2.prototype = new AbScene();
        p.open = function() {
            this.createLevels(scenedata.scene2.level, Scene2Level);
            this.shipinner = new ElShipInner(0, 3e3);
            this.radar = new ElRadar(0, 3e3, 100, 100, true);
            this.radar2 = new ElRadar(0, 3e3, 300, 500);
            this.radarboat = new ElRadarBoat(0, 3e3, 512, 396);
            this.level[1].addElement(this.shipinner.container);
            this.level[1].addElement(this.radar.container);
            this.level[1].addElement(this.radar2.container);
            this.level[1].addElement(this.radarboat.container);
        };
        p.close = function() {};
        p.update = function(frame) {
            this._update(frame);
            var cFrame = this.localCurFrame(frame);
            if (cFrame >= 0 && cFrame < this.duration) {
                this.cPos.y = -cFrame;
            }
            this.level[0].update(cFrame);
            this.level[1].update(cFrame);
        };
    }
})();