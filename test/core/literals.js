module("Core - Literals");

test("Literal API", function () {
    var v = new VIE();
    ok(v.Literal);
    
    var literal = new v.Literal();
    equal(typeof literal.toString, "function");
    equal(typeof literal.toTurtle, "function");
    equal(typeof literal.isLiteral, "boolean");
    ok(literal instanceof Backbone.Model);
});

test("PlainLiteral API", function () {
    var v = new VIE();
    ok(v.PlainLiteral);
    
    var literal = new v.PlainLiteral();
    equal(typeof literal.toString, "function");
    equal(typeof literal.toTurtle, "function");
    equal(typeof literal.isLiteral, "boolean");
    equal(typeof literal.isPlainLiteral, "boolean");
    ok(literal instanceof Backbone.Model);
});

test("TypedLiteral API", function () {
    var v = new VIE();
    ok(v.TypedLiteral);
    
    var literal = new v.TypedLiteral();
    equal(typeof literal.toString, "function");
    equal(typeof literal.toTurtle, "function");
    equal(typeof literal.isLiteral, "boolean");
    equal(typeof literal.isTypedLiteral, "boolean");
    
    ok(literal instanceof Backbone.Model);
});

test("BooleanLiteral API", function () {
    var v = new VIE();
    ok(v.BooleanLiteral);
    
    var literal = new v.BooleanLiteral();
    equal(typeof literal.toString, "function");
    equal(typeof literal.toTurtle, "function");
    equal(typeof literal.isLiteral, "boolean");
    equal(typeof literal.isTypedLiteral, "boolean");
    equal(typeof literal.isBooleanLiteral, "boolean");
    
    ok(literal instanceof Backbone.Model);
});

test("Boolean Literal - Instanceation", function () {
    var v = new VIE();

    ok(v.BooleanLiteral);
    var booleanliteral = new v.BooleanLiteral();
    
    var trueLit = new v.BooleanLiteral(true);
    var falseLit = new v.BooleanLiteral(false);
    var falseNosetLit = new v.BooleanLiteral();

    ok(trueLit);
    ok(falseLit);
    ok(falseNosetLit);
    
    var tr = trueLit.get();
    var fa = falseLit.get();
    var fa2 = falseNosetLit.get();

    equal(tr, true);
    equal(fa, false);
    equal(fa2, false);

    equal(trueLit.toString(), "true");
    equal(trueLit.toTurtle(), "true");
    equal(falseLit.toString(), "false");
    equal(falseLit.toTurtle(), "false");
    equal(falseNosetLit.toString(), "false");
    equal(falseNosetLit.toTurtle(), "false");
});


test("NumberLiteral API", function () {
    var v = new VIE();

    ok(v.NumberLiteral);
    var numberliteral = new v.NumberLiteral();
    ok(numberliteral.isLiteral);
    ok(numberliteral instanceof Backbone.Model);
    equal(typeof numberliteral.toString, "function");
    equal(typeof numberliteral.toTurtle, "function");
    var intLit = new v.NumberLiteral(3);
    var doubLit = new v.NumberLiteral(17.12);
    var negIntLit = new v.NumberLiteral(-15);

    ok(intLit);
    ok(doubLit);
    ok(negIntLit);
    var inte = intLit.get();
    var doub = doubLit.get();
    var negInt = negIntLit.get();

    equal (typeof inte, "number");
    equal (typeof doub, "number");
    equal (typeof negInt, "number");
    
    equal(inte, 3);
    equal(doub, 17.12);
    equal(negInt, -15);

    equal(intLit.toString(), "3");
    equal(intLit.toTurtle(), "3");
    equal(doubLit.toString(), 17.12.toLocaleString());
    equal(doubLit.toTurtle(), "17.12");
    equal(negIntLit.toString(), "-15");
    equal(negIntLit.toTurtle(), "-15");
});


test("LiteralCollection API", function () {
    var v = new VIE();
    
    ok(v.LiteralCollection);
    equal(typeof v.LiteralCollection.toString, "function");

    //ok(v.isLiteralCollection);
    //equal(typeof v.isLiteralCollection, "boolean");
});
/*

var entity = ...;

entity.set("name", "Sebastian");
entity.setOrAdd("name", {value: "Szaby", lang: "fr"});
entity.setOrAdd("name", 3010201);
entity.setOrAdd("name", new Date());
entity.setOrAdd("name", true);

entity.setOrAdd("friend", vie.entities.at(0));
entity.setOrAdd("friend", vie.entities.at(0).id);
entity.setOrAdd("friend", {name: "Szaby", age: 35});

var entity = new vie.Entity({name: "Szaby", age: 35});
vie.entities.add(entity);


enity.get("name"); <-- LiteralCollection (Szaby);

var vie = new VIE();
vie.setLang("de-DE");
vie.getLang();

vie.entities.add(new Entity({
    firstname: "Sebastian",
    lastname: {value: "Germesin", lang: [undefined, "", "*", false]},
    age: 29,
    name: [
        {value: "Sebastian G.", lang: "de"},
        {value: "S. Germesin", lang: "en"},
        {value: "S. Germesin", lang: vie.getLang()}
        ],
    "foaf:friend": ["<http://something.de/YourFriend>"]
    birthDay : new Date(),
    someIntStringValue : "123",
    someIntegerValue : 123e10,
    typedValue : [
        {value: "foo", type: "http://example.org/my/datatype"},
        {value: "bar", type: "http://example.org/my/other-datatype"}
    ]
));

var name = vie.entities.at(0).get("name") ; <<-- LiteralCollection

//name.copyValue("en", "de");
//name.moveValue("en", "de");

var friends = vie.entities.at(0).get("foaf:friend") ; <<-- Collection

name.toTurtle(); <-- "\"\"\"Sebastian\"\"\"@en"
name.toString(); <-- "Sebastian"



name.availableLanguages(); <-- ["de-DE", "en-GB"];
name.toString("fr"); <-- undefined
name.toString("de"); <-- "de-DE"
name.toString("en-US"); <-- undefined
name.toString("en"); <-- "en-GB"

name.availableLanguages(); <-- ["de-DE", "en-GB", "en"];
name.toString("en-US"); <-- "en"
name.toString("en-GB"); <-- "en-GB"

name.at(0).toString();
name.at(0).getLang(); <-- undefined, "en"

name.isLiteralCollection; <<-- true
name.at(0).isLiteral; <<-- true

var firstname = vie.entities.at(0).get("firstname");

firstname.add("Sebastian");
firstname.add({value: "Sebastian", lang: "en"});

firstname.availableLanguages(); ["", "en"]
firstname.availLangs();

firstname.closestLanguage("en");
firstname.closestLang("en");

firstname.get("en").set("lang", "de");
firstname.get("en").setLang("de");

*/

/*

test("Typed Literals", function () {
    var v = new VIE();
    
    var intLit = new v.IntegerLiteral(3);
    ok(intLit);
    equ(intLit.toString)
    
    ok(v.Literal);
    ok(v.IntegerLiteral);
    ok(v.DoubleLiteral);
    ok(v.DatatypeLiteral);
    ok(v.StringLiteral);
    
    ok(v.LiteralCollection);    
});
 */
