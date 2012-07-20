//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE Literal-Collection
// 
// In VIE there are ...
VIE.prototype.LiteralCollection = Backbone.Collection.extend({
    model: VIE.prototype.Literal,
    
    isLiteralCollection: true,

    add: function (obj) {
        return Backbone.Collection.prototype.add.call(this, obj);
    },

    availableLanguages : function () {

        this.models.reduce(function (memo, literal) {
            var lang = literal.getLang();
            lang = (lang)? lang : "";

            if (_.indexOf(memo, lang) === -1)
                memo.push(lang);

            return memo;
        }, []);
    },

    closestLanguage : function (lang) {
        throw new Error("Not Yet Implemented!");
    },

    get: function (param) {
        throw new Error("Not Yet Implemented!");
    },

    getLang: function (param) {
        throw new Error("Not Yet Implemented!");
    },

    toString: function (lang) {
        throw new Error("Not Yet Implemented!");
    },

    toTurtle: function (lang) {
        throw new Error("Not Yet Implemented!");
    }
    
});
    