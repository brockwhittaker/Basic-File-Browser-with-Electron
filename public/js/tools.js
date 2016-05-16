var $ = (function () {
  var storage = {
    stylesheet: null
  };

  var _utils = {
    expressionForms: function (node) {
      return {
        class: "." + node.className,
        id: "#" + node.id,
        tag: node.tagName
      };
    },
    nodes: function ($sel) {
      if (typeof $sel == "string") {
        return document.querySelectorAll($sel);
      } else if (Array.isArray($sel)) {
        return $sel;
      } else if (typeof $sel == "object" && $sel.nodeType) {
        return [$sel];
      }
    },
    each: function (arr, callback) {
      var x;

      if (Array.isArray(arr)) {
        for (x = 0; x < arr.length; x++) {
          callback.call(arr[x], x, arr);
        }
      } else if (typeof arr == "object") {
        for (x in arr) {
          if (arr.hasOwnProperty(x)) {
            callback.call(arr[x], x, arr);
          }
        }
      }
    },
    serialize: function (obj) {
      var string = "";
      /** initialize empty string **/

      for (var x in obj) {
        /** iterate through object. **/

        obj[x] = (typeof obj[x] === "object") ? JSON.stringify(obj[x]) : obj[x];
        /** if the property is of object type, stringify it. **/

        obj[x] = encodeURI(obj[x]);
        /** encode the value to URI so that it is address bar safe. **/

        string += x + "=" + obj[x] + "&";
        /** add var=value& for each object property. **/
      }

      return string.slice(0, string.length - 1);
      /** return the string without the last & char. **/

      /** -----
      @param : obj - an object of data to be stringified.
      @desc  : Stringify an object to send across as [GET/POST] data.
      ----- **/
    },
    first: function (arr) {
      return arr[0];
    },
    remove: function (arr, str) {
      var index = arr.indexOf(str);
      arr.splice(index, 1);
    },
    isset: function (val) {
      return (
        typeof val !== "undefined" &&
        val !== null &&
        (typeof val == "string" && val.length > 0 || typeof val !== "string")
      );
    },
    DOM: {
      getClasses: function (node) {
        return node.className.split(/[\s+]/g);
      },
      hasClass: function (node, className) {
        return this
          .getClasses(node)
          .indexOf(className) > -1;
      },
      addClass: function (node, className) {
        if (!this.hasClass(node, className)) {
          var classes = _utils.DOM.getClasses(node);

          classes = classes.filter(function (o) {
            return o.length > 0;
          });

          return classes
            .concat(className)
            .join(" ");
        } else return node.className;
      },
      removeClass: function (node, className) {
        var classes = this.getClasses(node);
        var index = classes.indexOf(className);

        if (index > -1) {
          classes.splice(index, 1);

          return classes.join(" ");
        } else return classes;
      },
      attr: {
        get: function (node, attr) {
          return node[attr] || node.getAttribute(attr);
        },
        set: function (node, attr, value) {
          node.setAttribute(attr, value);
        }
      },
      style: {
        object: function (node, obj) {
          for (var x in obj) {
            if (obj.hasOwnProperty(x)) {
              node.style[x] = obj[x];
            }
          }
        },
        attrVal: function (node, attr, val) {
          node.style[attr] = val;
        },
        readVal: function (node, attr) {
          return node.style[attr];
        },
        setDefaults: function (node, obj) {
          var defaults = {
            height: node.clientHeight,
            width: node.clientWidth,
            left: "0",
            right: "0",
            top: "0",
            bottom: "0"
          };

          var extractUnits = function (value) {
            return value.replace(/[^A-z]/g, "");
          };

          for (var x in obj) {
            if (obj.hasOwnProperty(x)) {
              if (!_utils.isset(node.style[x])) {
                if (_utils.isset(defaults[x])) {
                  if (defaults[x] == "0") {
                    node.style[x] = defaults[x] + extractUnits(obj[x]);
                  } else if (typeof defaults[x] == "number") {
                    node.style[x] = defaults[x] + "px";
                  } else {
                    node.style[x] = defaults[x];
                  }
                } else continue; // there's no default value
              } else continue; // there's already a value, we don't need to create one
            }
          }
        }
      }
    },
    CSS: {
      addStyleSheet: function (name) {
        var sheet = (function() {
        	var style = document.createElement("style");
        	style.appendChild(document.createTextNode(""));
        	document.head.appendChild(style);
          style.id = name || "";
        	return style.sheet;
        })();

        storage.stylesheet = sheet;
      },
      addRule: function (sel, rules) {
        var rule_arr = [];
        for (var x in rules) {
          if (rules.hasOwnProperty(x)) {
            rule_arr.push(x + ":" + rules[x]);
          }
        }
        var str = sel + " {" + rule_arr.join(";") + "}";

        if (!storage.stylesheet) this.addStyleSheet("bTools");
        storage.stylesheet.insertRule(str, 0);
      }
    }
  };

  var Tools = function ($sel) {
    var $nodes = _utils.nodes($sel);

    var _dom = [];

    var prototype = {
      addClass: function (className) {
        this.each(function () {
          this.className = _utils.DOM.addClass(this, className);
        });

        return this;
      },
      after: function (node) {
        this.each(function () {
          this.parentNode.insertBefore(node.cloneNode(true), this.nextSibling);
        });

        return this;
      },
      animate: function (obj, seconds, callback) {
        seconds /= 1000;

        var className = "b-transition-" +
            seconds
              .toString()
              .replace(/\./, "-") + "s";

        _utils.CSS.addRule("." + className, {
          "transition": "all " + seconds + "s ease"
        });

        this.addClass(className);

        this.each(function () {
          _utils.DOM.style.setDefaults(this, obj);
        });

        setTimeout((function () {
          this.css(obj);
        }).bind(this), 0);

        setTimeout((function () {
          this.removeClass(className);
          if (typeof callback == "function") callback();
        }).bind(this), seconds * 1000);

        return this;
      },
      append: function (node) {
        if (typeof node == "string") node = Tools.create(node);
        this.each(function () {

          if (_utils.isset(node.nodeType)) {
            this.appendChild(node.cloneNode(true));
          } else if (node.length > 0) {
            var self = this;
            _utils.each(node, function () {
              self.appendChild(this.cloneNode(true));
            });
          }
        });

        return this;
      },
      attr: function (attr, value) {
        if (!_utils.isset(value)) {
          var node = this.el(0, true);
          return _utils.DOM.attr.get(node, attr);
        } else {
          this.each(function () {
            _utils.DOM.attr.set(this, attr, value);
          });
        }

        return this;
      },
      before: function (node) {
        this.each(function () {
          this.parentNode.insertBefore(node.cloneNode(true), this);
        });

        return this;
      },
      click: function (callback) {
        if (typeof callback == "function") {
          this.on("click", callback);
        } else {
          this.el(0, true).click();
        }

        return this;
      },
      css: function (attr, value) {
        if (!_utils.isset(attr) && !_utils.isset(value)) {
          return _utils.DOM.style.readVal(this.el(0, true), attr);
        }

        this.each(function () {
          if (typeof attr === "object") {
            _utils.DOM.style.object(this, attr);
          } else if (attr && value) {
            _utils.DOM.style.attrVal(this, attr, value);
          }
        });

        return this;
      },
      data: function (attr, value) {
        if (!_utils.isset(value)) {
          return this.el(0, true).dataset[attr];
        } else {
          this.each(function () {
            this.dataset[attr] = value;
          });
        }

        return this;
      },
      dblclick: function (callback) {
        if (typeof callback == "function") {
          this.on("dblclick", callback);
        } else {
          var event = new MouseEvent('dblclick', {
              'view': window,
              'bubbles': true,
              'cancelable': true
            });
          this.el(0, true).dispatchEvent(event);
        }

        return this;
      },
      each: function (callback) {
        _utils.each($nodes, callback);

        return this;
      },
      el: function (method, unobject) {
        var $new_sel = [];
        if (typeof method == "function") {
          this.each(function (i) {
            if (method(i))
              $new_sel.push(this);
          });
        } else if (typeof method == "number") {
          if (unobject) return $nodes[method];
          else $new_sel.push($nodes[method]);
        } else if (typeof method == "string") {
          this.el(parseInt(method, 10));
        }

        return Tools($new_sel);
      },
      empty: function () {
        return $nodes.length === 0;
      },
      find: function ($inner_sel) {
        var parents = this;
        var children = Tools($inner_sel);
        var validChildren = [];

        children.each(function () {
          var pointer = this;
          var self;

          while (pointer) {
            pointer = pointer.parentNode;
            self = this;
            parents.each(function () {
              if (pointer && pointer.isSameNode(this)) {
                validChildren.push(self);
              }
            });
          }
        });

        return Tools(validChildren);
      },
      focus: function (callback) {
        if (typeof callback == "function") {
          this.on("focus", callback);
        } else {
          this.el(0, true).focus();
        }

        return this;
      },
      hasClass: function (className) {
        var node = this.el(0, true);
        return _utils.DOM.hasClass(node, className);
      },
      height: function (val) {
        if (!_utils.isset(val)) {
          return this.el(0, true).clientHeight;
        } else {
          if (typeof val == "number") val += "px";

          this.each(function () {
            this.style.height = val;
          });
        }

        return this;
      },
      html: function (html) {
        if (typeof html == "string") {
          this.each(function () {
            this.innerHTML = html;
          });
        } else if (typeof html == "number") {
          return this.html(html.toString());
        } else if (!html) {
          return this.el(0, true).innerHTML;
        }

        return this;
      },
      on: function (event, callback, callback_delegate) {
        this.each(function () {
          if (typeof callback == "string" && typeof callback_delegate == "function") {
            this.addEventListener(event, function (e) {
              var forms = _utils.expressionForms(e.target);

              if (callback == forms.class || callback == forms.id || callback == forms.tag) {
                callback_delegate.call(e.target, e);
              }
            });
          } else {
            this.addEventListener(event, callback);
          }
        });

        return this;
      },
      parent: function () {
        var parents = [];

        this.each(function () {
          if (this.parentNode) parents.push(this.parentNode);
        });

        return Tools(parents);
      },
      remove: function () {
        this.each(function () {
          if (this.parentNode)
            this.parentNode.removeChild(this);
        });

        return this;
      },
      removeClass: function (className) {
        this.each(function () {
          this.className = _utils.DOM.removeClass(this, className);
        });

        return this;
      },
      text: function (val) {
        if (!_utils.isset(val)) {
          return this.el(0, true).innerText;
        } else {
          this.each(function () {
            this.innerText = val;
          });
        }

        return this;
      },
      then: function (callback, ms) {
        var self = this;

        setTimeout(function () {
          callback.call(self);
        }, ms);
      },
      toggleClass: function (className) {
        this.each(function () {
          if (_utils.DOM.hasClass(this, className)) {
            this.className = _utils.DOM.removeClass(this, className);
          } else {
            this.className = _utils.DOM.addClass(this, className);
          }
        });

        return this;
      },
      val: function (val) {
        if (!_utils.isset(val)) {
          return this.el(0, true).value;
        } else {
          this.each(function () {
            this.value = val;
          });
        }

        return this;
      },
      width: function (val) {
        if (!_utils.isset(val)) {
          return this.el(0, true).clientWidth;
        } else {
          if (typeof val == "number") val += "px";

          this.each(function () {
            this.style.width = val;
          });
        }

        return this;
      },
    };

    _utils.each(prototype, function (i) {
      _dom[i] = this;
    });

    var index = 0;
    _utils.each($nodes, function () {
      _dom[index++] = this;
    });

    return _dom;
  };

  Tools.assign = function (target) {
    if (target === undefined || target === null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var output = Object(target);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source !== undefined && source !== null) {
        for (var nextKey in source) {
          if (source.hasOwnProperty(nextKey)) {
            output[nextKey] = source[nextKey];
          }
        }
      }
    }
    return output;
  };

  Tools.ajax = function (obj) {
    var xhttp = new XMLHttpRequest();
    /** create a new request. **/

    var data = _utils.serialize(obj.data);
    /** change the data into http address format ?var1=x&var2=y... **/

    if (obj.type.toLowerCase() == "get" && data) {
      /** if the type is GET.. **/
      obj.url += "?" + data;
      /** add the serialized object data to the end of the address line. **/
    }

    xhttp.open(obj.type, obj.url, true);
    /** open a connection of obj.type [GET/POST], obj.url [PATH] **/

    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded" || obj.contentType);
    /** set a request header type form. **/

    xhttp.send(data);
    /** send the POST data or null. **/

    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        var error, response;

        try {
          if (obj.dataType) {
            response = (obj.dataType.toLowerCase() === "json") ?
              JSON.parse(xhttp.response) : xhttp.response;
          } else {
            response = xhttp.response;
          }
          /** if the dataType is JSON, parse before returning. **/
        } catch (err) { error = err; }
        /** if dataType was supposed to be JSON but wasn't, set error to the
           caught parse error and pass to the callback. **/

        obj.callback(response, error);
        /** execute object callback with @params response and
           [optional] error. **/
      }
    };

    /** -----
    @param : obj - an object with types:
               type     : [GET/POST],
               data     : Object of data to send.
               url      : Valid HTTP url to send to.
               callback : a function callback with @params results and error.
               dataType : [Optional] "JSON" to auto parse JSON results.
    @desc  : An AJAX function that accepts GET and POST and posts a callback
             function with the data recieved.
    ----- **/
  };

  Tools.create = function (str) {
    return document.createRange().createContextualFragment(str).childNodes;
  };

  Tools.get = function (url, callback) {
    Tools.ajax({
      type      : "GET",
      url       : url,
      callback  : callback
    });

    /** -----
    @param : url - a valid url for the ajax request
             callback - a callback function with @param response.
    @desc  : A quick call that uses the internal ajax function to execute.
    ----- **/
  };

  Tools.stackOverflowError = function (err) {
    var addr = "http://www.stackoverflow.com/search?q=[js]+" + err.message;
    window.open(addr, "_blank");
  };

  Tools.moment = function (time) {
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var date = (time) ? new Date(time) : new Date();

    return {
      d: date.getDate(),
      m: date.getMonth(),
      month: MONTHS[date.getMonth()],
      y: date.getFullYear(),
      h: date.getHours(),
      mm: date.getMinutes(),
      s: date.getSeconds(),
      ms: date.getMilliseconds(),
      fmt: {
        d: ("0" + date.getDate()).slice(-2),
        m: ("0" + (date.getMonth() + 1)).slice(-2),
        y: ("0" + date.getFullYear()).slice(-4),
        h: ("0" + date.getHours()).slice(-2),
        mm: ("0" + date.getMinutes()).slice(-2),
        s: ("0" + date.getSeconds()).slice(-2),
        ms: ("000" + date.getMilliseconds()).slice(-3),
      }
    };
  };

  Tools.style = _utils.CSS.addRule.bind(_utils.CSS);

  return Tools;
})();
