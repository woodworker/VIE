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
    
    toString: function (langs) {
        var browserLang = "en";

        if (this.vie.getLang()) {

        }
        

        var lang = (langs)? 
                ((_.isArray(langs))? langs : [ langs ]) : 
                [browserLang, "en", "de", "fi", "fr", "es", "ja", "zh-tw"];

        return VIE.Util.getPreferredLangForPreferredProperty(this, options.prop, lang);
    },
    
});
    