//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE Literal
// 
// In VIE there are ...
VIE.prototype.Literal = function(attrs, opts) {

    attrs = (attrs)? attrs : {};
    opts = (opts)? opts : {};

    var self = this;
    
    var Model = Backbone.Model.extend({
        
        set : function (key, value, options) {
            if (!value && !_.isObject(key)) {
                value = key;
                key = this.vie.getLang();
            }
            return Backbone.Model.prototype.set.call(this, key, value, options);
        },
                
        get : function (attr) {
            if (!attr) 
                attr = this.vie.getLang();
            return Backbone.Model.prototype.get.call(this, attr);
        },
        
        toString : function () {
            throw new Error("not implemented!");
        },
            
        toTurtle : function () {
            throw new Error("not implemented!");
        },
        
        isLiteral : true,
        isTypedLiteral: false,
        isPlainLiteral: false,
        vie : self.vie
    });
    
    return new Model(attrs, opts);
};

VIE.prototype.PlainLiteral = function (attrs, opts) {

    if(_.isString(attrs)) {
        var string = attrs;
        attrs = {
	        type: string,
	        lang: ""
	    };
    }

    var model = new this.vie.Literal({}, opts);

    _.extend(model, {

        toString : function (lang) {
            return this.get(lang);
        },

        toTurtle : function (lang) {
            lang = (lang)? lang : this.vie.getLang();
            return "\"\"\"" + this.toString(lang) + "\"\"\"" + "@" + lang;
        },

        isPlainLiteral: true
    });

    model.set(attrs);

    return model;
};

VIE.prototype.TypedLiteral = function(attrs, opts) {
    var model = new this.vie.Literal({}, opts);

    _.extend(model, {

        toTurtle : function(lang) {
            return '"'+this.getTurtleValue(lang) + '"^^'+this.type;
        },

        getTurtleValue : function(lang) {
            return this.toString(lang);
        },

        isTypedLiteral: true,
        type: null
    });

    model.set (attrs);
    return model;
};

VIE.prototype.BooleanLiteral = function (value, opts) {
    
    value = (value === true)? true : false;
    
    var model = new this.vie.TypedLiteral({}, opts);
    
    _.extend(model, {
        
        toString : function (lang) { 
            return this.get(lang).toString();
        },

        type: "<http://www.w3.org/2001/XMLSchema#boolean>"
    });
    
    model.set(value);
    
    return model;
};

VIE.prototype.NumberLiteral = function (value, opts) {
    
    value = (value)? value : 0;

    var model = new this.vie.TypedLiteral({}, opts);
    
    _.extend(model, {
        /* language-specific storage does not make sense for numbers */
        get : function () {
            return Backbone.Model.prototype.get.call(this, "value");
        },

        /* language-specific storage does not make sense for numbers */
        set : function (val) {
            return Backbone.Model.prototype.set.call(this, "value", val);
        },
        
        toString : function (lang) { 
            return this.get().toLocaleString();
        },

        getTurtleValue : function(lang) {
            return this.get().toExponential();
        },

        isExponetial: false,
        type: "<http://www.w3.org/2001/XMLSchema#number>"
    });
    
    model.set(value);
    
    return model;
};

VIE.prototype.DateLiteral = function (value, opts) {
    
    if (!value) {
        value = new Date();
    } else if (_.isDate(value) || _.isString(value)) {
        value = new Date(value);
    } else {
        throw new Error ("Invalid dateformat '" + value + "'");
    }
    
    var model = new this.vie.TypedLiteral({}, opts);
    
    _.extend(model, {
        toString : function (lang) { 
            return this.get(lang).toISOString();
        },
        
        type: "<http://www.w3.org/2001/XMLSchema#dateTime>"
    });
    
    model.set(value);
    
    return model;
};