module("vie.js - Apache Stanbol Service");

/* All known endpoints of Stanbol */

/* The ones marked with a "!!!" are implemented by the StanbolConnector */
/* The ones marked with a "???" are implemented but still broken */

// !!!  /enhancer/chain/default
// !!!  /enhancer/chain/<chainId>

// !!!  /entityhub/sites/referenced
// !!!  /entityhub/sites/entity
// !!!  /entityhub/sites/find
//   /entityhub/sites/query
// !!!  /entityhub/sites/ldpath
// !!!  /entityhub/site/<siteId>/entity 
// !!!  /entityhub/site/<siteId>/find
//   /entityhub/site/<siteId>/query
// !!!  /entityhub/site/<siteId>/ldpath
//  /entityhub/entity (GET, PUT, POST, DELETE)
//   /entityhub/mapping
// !!!  /entityhub/find
//   /entityhub/query
// !!!  /entityhub/lookup
// !!!  /entityhub/ldpath
// ???  /sparql
//   /contenthub/contenthub/ldpath
// !!!  /contenthub/contenthub/store
//   /contenthub/contenthub/store/raw/<contentId>
//   /contenthub/contenthub/store/metadata/<contentId>
// !!!  /contenthub/<coreId>/store
//   /contenthub/<coreId>/store/raw/<contentId>
//   /contenthub/<coreId>/store/metadata/<contentId>
// ???  /contenthub/content/<contentId>
// !!!  /factstore/facts
// !!!  /factstore/query
//   /ontonet/ontology
//   /ontonet/ontology/<scopeName>
//   /ontonet/ontology/<scopeName>/<ontologyId>
//   /ontonet/ontology/User
//   /ontonet/session/
//   /ontonet/session/<sessionId>
//   /rules/rule/
//   /rules/rule/<ruleId>
//   /rules/recipe/
//   /rules/recipe/<recipeId>
//   /rules/refactor/
//   /rules/refactor/apply
//   /cmsadapter/map
//   /cmsadapter/session
//   /cmsadapter/contenthubfeed


var stanbolRootUrl = [/*"http://134.96.189.108:1025", */"http://lnv-89012.dfki.uni-sb.de:9000"]//, "http://dev.iks-project.eu:8081", "http://dev.iks-project.eu/stanbolfull"];
test("VIE.js StanbolService - Registration", function() {
    var z = new VIE();
    ok(z.StanbolService, "Checking if the Stanbol Service exists.'");
    z.use(new z.StanbolService);
    ok(z.service('stanbol'));
});

test("VIE.js StanbolService - API", function() {
    var z = new VIE();
    z.use(new z.StanbolService);

    ok(z.service('stanbol').init);
    equals(typeof z.service('stanbol').init, "function");
    ok(z.service('stanbol').analyze);
    equals(typeof z.service('stanbol').analyze, "function");
    ok(z.service('stanbol').find);
    equals(typeof z.service('stanbol').find, "function");
    ok(z.service('stanbol').load);
    equals(typeof z.service('stanbol').load, "function");
    ok(z.service('stanbol').query);
    equals(typeof z.service('stanbol').query, "function");
    ok(z.service('stanbol').connector);
    ok(z.service('stanbol').connector instanceof z.StanbolConnector);
    ok(z.service('stanbol').rules);
    equals(typeof z.service('stanbol').rules, "object");
});

test("VIE.js StanbolConnector - API", function() {
	var z = new VIE();
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    
    //API
    ok(stanbol.connector.analyze);
    equals(typeof stanbol.connector.analyze, "function");
    ok(stanbol.connector.load);
    equals(typeof stanbol.connector.load, "function");
    ok(stanbol.connector.find);
    equals(typeof stanbol.connector.find, "function");
    ok(stanbol.connector.query);
    equals(typeof stanbol.connector.query, "function");
    ok(stanbol.connector.lookup);
    equals(typeof stanbol.connector.lookup, "function");
    ok(stanbol.connector.referenced);
    equals(typeof stanbol.connector.referenced, "function");
    ok(stanbol.connector.sparql);
    equals(typeof stanbol.connector.sparql, "function");
    ok(stanbol.connector.ldpath);
    equals(typeof stanbol.connector.ldpath, "function");
    ok(stanbol.connector.uploadContent);
    equals(typeof stanbol.connector.uploadContent, "function");
    ok(stanbol.connector.createFactSchema);
    equals(typeof stanbol.connector.createFactSchema, "function");
    ok(stanbol.connector.createFact);
    equals(typeof stanbol.connector.createFact, "function");
    ok(stanbol.connector.queryFact);
    equals(typeof stanbol.connector.queryFact, "function");
});

test("VIE.js StanbolService - Analyze", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    } 
    // Sending a an example with double quotation marks.
    var elem = $('<p>This is a small test, where Steve Jobs sings the song \"We want to live forever!\" song.</p>');
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    z.use(new z.StanbolService({url : stanbolRootUrl}));
    stop();
    z.analyze({element: elem}).using('stanbol').execute().done(function(entities) {

        ok(entities);
        ok(entities instanceof Array);
        ok(entities.length > 0, "At least one entity returned");
        if(entities.length > 0){
	        var allEntities = true;
	        for(var i=0; i<entities.length; i++){
	            var entity = entities[i];
	            if (! (entity instanceof Backbone.Model)){
	                allEntities = false;
	                ok(false, "VIE.js StanbolService - Analyze: Entity is not a Backbone model!");
	                console.error("VIE.js StanbolService - Analyze: ", entity, "is not a Backbone model!");
	            }
	        }
	        ok(allEntities);
	        var firstTextAnnotation = _(entities).filter(function(e){return e.isof("enhancer:TextAnnotation") && e.get("enhancer:selected-text");})[0];
	        var s = firstTextAnnotation.get("enhancer:selected-text").toString();
	        ok(s.substring(s.length-4, s.length-2) != "\"@", "Selected text should be converted into a normal string.");
        }
        start();
    })
    .fail(function(f){
        ok(false, f.statusText);
        start();
    });
});

test("VIE.js StanbolService - Analyze with wrong URL of Stanbol", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    } 
    // Sending a an example with double quotation marks.
    var elem = $('<p>This is a small test, where Steve Jobs sings the song \"We want to live forever!\" song.</p>');
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var wrongUrls = ["http://www.this-is-wrong.url/", "http://dev.iks-project.eu/stanbolfull"];
    z.use(new z.StanbolService({url : wrongUrls}));
    stop();
    z.analyze({element: elem}).using('stanbol').execute().done(function(entities) {

        ok(entities);
        ok(entities.length > 0, "At least one entity returned");
        ok(entities instanceof Array);
        var allEntities = true;
        for(var i=0; i<entities.length; i++){
            var entity = entities[i];
            if (! (entity instanceof Backbone.Model)){
                allEntities = false;
                ok(false, "VIE.js StanbolService - Analyze: Entity is not a Backbone model!");
                console.error("VIE.js StanbolService - Analyze: ", entity, "is not a Backbone model!");
            }
        }
        ok(allEntities);
        start();
    })
    .fail(function(f){
        ok(false, f.statusText);
        start();
    });
});

test("VIE.js StanbolService - Analyze with Enhancement Chain", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    } 
    // Sending a an example with double quotation marks.
    var elem = $('<p>This is a small test, where Steve Jobs sings the song \"We want to live forever!\" song.</p>');
    var v = new VIE();
    ok (v.StanbolService);
    equal(typeof v.StanbolService, "function");
    v.use(new v.StanbolService({url : stanbolRootUrl, enhancerUrlPostfix: "/enhancer/chain/dbpedia-keyword"}));
    stop();
    v.analyze({element: elem}).using('stanbol').execute().done(function(entities) {
        ok(entities);
        ok(entities.length > 0, "At least one entity returned");
        if(entities.length > 0) {
            ok(entities instanceof Array);
            var allEntities = true;
            for(var i=0; i<entities.length; i++){
                var entity = entities[i];
                if (! (entity instanceof Backbone.Model)){
                    allEntities = false;
                    console.error("VIE.js StanbolService - Analyze: ", entity, "is not a Backbone model!");
                }
            }
            ok(allEntities);
        }
        start();
    })
    .fail(function(f){
        ok(false, f.statusText);
        start();
    });
});

test("VIE.js StanbolConnector - Get all referenced sites", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    } 
    // Sending a an example with double quotation marks.
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    stop();
    stanbol.connector.referenced(function (sites) {
    	ok(_.isArray(sites));
    	ok(sites.length > 0);
    	start();
    }, function (err) {
    	ok(false, "No referenced site has been returned!");
    	start();
    });
});

test("VIE.js StanbolConnector - Perform SPARQL Query", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    } 
    
    var query = "PREFIX fise: <http://fise.iks-project.eu/ontology/> " + 
    	"PREFIX dc:   <http://purl.org/dc/terms/> " + 
    		"SELECT distinct ?enhancement ?content ?engine ?extraction_time " + 
    		"WHERE { " + 
    		  "?enhancement a fise:Enhancement . " + 
    		  "?enhancement fise:extracted-from ?content . " + 
    		  "?enhancement dc:creator ?engine . " + 
    		  "?enhancement dc:created ?extraction_time . " + 
    		"} " +
    		"ORDER BY DESC(?extraction_time) LIMIT 5";
    
    // Sending a an example with double quotation marks.
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    stop();
    stanbol.connector.sparql(query, function (response) {
    	ok(response instanceof Document);
    	var xmlString = (new XMLSerializer()).serializeToString(response);
    	var myJsonObject = xml2json.parser(xmlString);

    	ok(myJsonObject.sparql);
    	ok(myJsonObject.sparql.results);
    	ok(myJsonObject.sparql.results.result);
    	ok(myJsonObject.sparql.results.result.length > 0);
    	
    	start();
    }, function (err) {
    	ok(false, "SPARQL endpoint returned no response!");
    	start();
    });
});


test("VIE.js StanbolService - Find", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    } 
    var term = "European Union";
    var limit = 10;
    var offset = 0;
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    z.use(new z.StanbolService({url : stanbolRootUrl}));
    stop();
    
    z.find({term: term, limit: limit, offset: offset})
    .using('stanbol').execute().done(function(entities) {

        ok(entities);
        ok(entities.length > 0);
        ok(entities instanceof Array);
        var allEntities = true;
        for(var i=0; i<entities.length; i++){
            var entity = entities[i];
            if (! (entity instanceof Backbone.Model)){
                allEntities = false;
                ok(false, "VIE.js StanbolService - Find: Entity is not a Backbone model!");
                console.error("VIE.js StanbolService - Find: ", entity, "is not a Backbone model!");
            }
        }
        ok(allEntities);
        start();
    })
    .fail(function(f){
        ok(false, f.statusText);
        start();
    });
    
    stop();
    // search only in local entities
    z.find({term: "P*", limit: limit, offset: offset, local : true})
    .using('stanbol').execute().done(function(entities) {
        ok(entities);
        ok(entities.length > 0);
        ok(entities instanceof Array);
        var allEntities = true;
        for(var i=0; i<entities.length; i++){
            var entity = entities[i];
            if (! (entity instanceof Backbone.Model)){
                allEntities = false;
                ok(false, "VIE.js StanbolService - Find: Entity is not a Backbone model!");
                console.error("VIE.js StanbolService - Find: ", entity, "is not a Backbone model!");
            }
        }
        ok(allEntities);
        start();
    })
    .fail(function(f){
        ok(false, f.statusText);
        start();
    });
    
    stop();
    z.find({term: term}) // only term given, no limit, no offset
    .using('stanbol').execute().done(function(entities) {

        ok(entities);
        ok(entities.length > 0);
        ok(entities instanceof Array);
        var allEntities = true;
        for(var i=0; i<entities.length; i++){
            var entity = entities[i];
            if (! (entity instanceof Backbone.Model)){
                allEntities = false;
                ok(false, "VIE.js StanbolService - Find: Entity is not a Backbone model!");
                console.error("VIE.js StanbolService - Find: ", entity, "is not a Backbone model!");
            }
        }
        ok(allEntities);
        start();
    })
    .fail(function(f){
        ok(false, f.statusText);
        start();
    });
    
    stop();
    z.find({term: "", limit: limit, offset: offset})
    .using('stanbol').execute()
    .done(function(entities) {

        ok(false, "this should fail, as there is an empty term given!");
        start();
    })
    .fail(function(f){
        ok(true, f.statusText);
        start();
    });
    
    stop();
    z.find({limit: limit, offset: offset})
    .using('stanbol').execute()
    .done(function(entities) {

        ok(false, "this should fail, as there is no term given!");
        start();
    })
    .fail(function(f){
        ok(true, f.statusText);
        start();
    });
});


test("VIE.js StanbolService - Load", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    }
    var entity = "<http://dbpedia.org/resource/Barack_Obama>";
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    z.use(new z.StanbolService({url : stanbolRootUrl}));
    stop();
    z.load({entity: entity})
    .using('stanbol').execute().done(function(entities) {
        ok(entities);
        ok(entities.length > 0);
        ok(entities instanceof Array);
        var allEntities = true;
        for(var i=0; i<entities.length; i++){
            var entity = entities[i];
            if (! (entity instanceof Backbone.Model)){
                allEntities = false;
                ok(false, "VIE.js StanbolService - Load: Entity is not a Backbone model!");
                console.error("VIE.js StanbolService - Analyze: ", entity, "is not a Backbone model!");
            }
        }
        ok(allEntities);
        start();
    })
    .fail(function(f){
        ok(false, f.statusText);
        start();
    });
});

test("VIE.js StanbolService - Query", function () {
    if (navigator.userAgent === 'Zombie') {
        return;
     }
     var query = {
             "selected": [
                          "http://www.w3.org/2000/01/rdf-schema#label",
                          "http://dbpedia.org/ontology/birthDate",
                          "http://dbpedia.org/ontology/deathDate"],
                      "offset": "0",
                      "limit": "3",
                      "constraints": [{ 
                          "type": "range", 
                          "field": "http://dbpedia.org/ontology/birthDate", 
                          "lowerBound": "1946-01-01T00:00:00.000Z",
                          "upperBound": "1946-12-31T23:59:59.999Z",
                          "inclusive": true,
                          "datatype": "xsd:dateTime"
                      },{ 
                          "type": "reference", 
                          "field": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", 
                          "value": "http://dbpedia.org/ontology/Person", 
                      }]
                  };
     
     var z = new VIE();
     ok (z.StanbolService);
     equal(typeof z.StanbolService, "function");
     z.use(new z.StanbolService({url : stanbolRootUrl}));
     stop();
     z.query({query : query, local : true})
     .using('stanbol').execute().done(function(entities) {
         ok(entities);
         ok(entities.length > 0);
         ok(entities instanceof Array);
         start();
     })
     .fail(function(f){
         ok(false, f.statusText);
         start();
     });
});

test("VIE.js StanbolService - ContentHub: Upload of content / Retrieval of enhancements", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    }
    var content = 'This is a small test, where Steve Jobs sings the song "We want to live forever!" song.';

    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    
    stop();
    stanbol.connector.uploadContent(content, function(xml,status,xhr){
        var location = xhr.getResponseHeader('Location');
        //TODO: This does not work in jQuery :(
        start();
    }, function (err) {
    	ok(false, err);
    	start();
    });
});

/*
test("VIE.js StanbolService - ContentHub: Lookup", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    }
    
    var entity = 'http://dbpedia.org/resource/Paris';

    var z = new VIE();
    z.namespaces.add("cc", "http://creativecommons.org/ns#");
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    
    stop();
    stanbol.connector.lookup(entity, function (response) {
    	var entities = VIE.Util.rdf2Entities(stanbol, response);
    	ok(entities.length > 0, "With 'create'");
    	start();
    }, function (err) {
    	ok(false, err);
    	start();
    }, {
    	create : true
    });
    
    stop();
    stanbol.connector.lookup(entity, function (response) {
    	var entities = VIE.Util.rdf2Entities(stanbol, response);
    	ok(entities.length > 0, "Without 'create'");
    	start();
    }, function (err) {
    	ok(false, err);
    	start();
    });
});
*/
test("VIE.js StanbolService - LDPath", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    }
    
    var context = 'http://dbpedia.org/resource/Paris';
    var ldpath = "@prefix dct : <http://purl.org/dc/terms/> ;\n" + 
                 "@prefix geo : <http://www.w3.org/2003/01/geo/wgs84_pos#> ;\n" + 
                 "name = rdfs:label[@en] :: xsd:string;\n" + 
                 "labels = rdfs:label :: xsd:string;\n" + 
                 "comment = rdfs:comment[@en] :: xsd:string;\n" + 
                 "categories = dc:subject :: xsd:anyURI;\n" + 
                 "homepage = foaf:homepage :: xsd:anyURI;\n" + 
                 "location = fn:concat(\"[\",geo:lat,\",\",geo:long,\"]\") :: xsd:string;\n";
    
    var z = new VIE();
    z.namespaces.add("cc", "http://creativecommons.org/ns#");
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    
    stop();
    // on all sites
    stanbol.connector.ldpath(ldpath, context, function (response) {
    	var entities = VIE.Util.rdf2Entities(stanbol, response);
    	ok(entities.length > 0);
    	start();
    }, function (err) {
    	ok(false, err);
    	start();
    });
    
    stop();
    // on on specific site
    stanbol.connector.ldpath(ldpath, context, function (response) {
    	var entities = VIE.Util.rdf2Entities(stanbol, response);
    	ok(entities.length > 0);
    	start();
    }, function (err) {
    	ok(false, err);
    	start();
    }, {
    	site: "dbpedia"
    });
    
    stop();
    // on local entities
    stanbol.connector.ldpath(ldpath, context, function (response) {
    	var entities = VIE.Util.rdf2Entities(stanbol, response);
    	ok(entities.length > 0);
    	start();
    }, function (err) {
    	ok(false, err);
    	start();
    }, {
    	local : true
    });
});

/* TODO: these tests need to be backed by implementations
test("VIE.js StanbolService - Create a New Fact Schema", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    }
    
    var employeeOfFact = {
       "@context" : {
    	 "iks"     : "http://iks-project.eu/ont/",
    	  "@types"  : {
    	    "person"       : "iks:person",
    	    "organization" : "iks:organization"
        }
      }
    };
    
    var employeeOfFactURL = "http://iks-project.eu/ont/employeeOf" + (new Date().getTime());
       
    var z = new VIE();
    z.namespaces.add("cc", "http://creativecommons.org/ns#");
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    
    stop();
    // on all sites
    stanbol.connector.createFactSchema(employeeOfFactURL, employeeOfFact, function (response) {
    	debugger;
    	start();
    }, function (err) {
    	ok(false, err);
    	start();
    });
});

test("VIE.js StanbolService - Create a New Fact", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    }
    
    var fact = {
    		 "@context" : {
    			   "iks" : "http://iks-project.eu/ont/",
    			   "upb" : "http://upb.de/persons/"
    			 },
    			 "@profile"     : "iks:employeeOf",
    			 "person"       : { "@iri" : "upb:bnagel" },
    			 "organization" : { "@iri" : "http://uni-paderborn.de"}
    			};
    
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    
    stop();
    stanbol.connector.createFact(fact, function (response) {
    	debugger;
    	start();
    }, function (err) {
    	ok(false, err);
    	start();
    });
    
    var moreFactsOfSameType = {
    		 "@context" : {
    			   "iks" : "http://iks-project.eu/ont/",
    			   "upb" : "http://upb.de/persons/"
    			 },
    			 "@profile"     : "iks:employeeOf",
    			 "@subject" : [
    			   { "person"       : { "@iri" : "upb:bnagel" },
    			     "organization" : { "@iri" : "http://uni-paderborn.de" }
    			   },
    			   { "person"       : { "@iri" : "upb:fchrist" },
    			     "organization" : { "@iri" : "http://uni-paderborn.de" }
    			   }
    			 ]
    			};
    
    stop();
    stanbol.connector.createFact(moreFactsOfSameType, function (response) {
    	debugger;
    	start();
    }, function (err) {
    	ok(false, err);
    	start();
    });
    
    var moreFactsOfDifferentType = {
    		 "@context" : {
    			   "iks" : "http://iks-project.eu/ont/",
    			   "upb" : "http://upb.de/persons/"
    			 },
    			 "@subject" : [
    			   { "@profile"     : "iks:employeeOf",
    			     "person"       : { "@iri" : "upb:bnagel" },
    			     "organization" : { "@iri" : "http://uni-paderborn.de" }
    			   },
    			   { "@profile"     : "iks:friendOf",
    			     "person"       : { "@iri" : "upb:bnagel" },
    			     "friend"       : { "@iri" : "upb:fchrist" }
    			   }
    			 ]
    			};
   
   stop();
   stanbol.connector.createFact(moreFactsOfDifferentType, function (response) {
   	debugger;
   	start();
   }, function (err) {
   	ok(false, err);
   	start();
   });
});

test("VIE.js StanbolService - Query for Facts of a Certain Type", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    }
    
    var query = {
    		 "@context" : {
    			   "iks" : "http://iks-project.eu/ont/"
    			 },
    			 "select" : [ "person" ],
    			 "from"   : "iks:employeeOf",
    			 "where"  : [
    			   {
    			     "="  : {
    			       "organization" : { "@iri" : "http://uni-paderborn.de" }
    			     }
    			   }
    			 ]
    			};
    
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    
    stop();
    stanbol.connector.queryFact(query, function (response) {
    	debugger;
    	start();
    }, function (err) {
    	ok(false, err);
    	start();
    });
});
*/
//### test for the entityhub/entity, the service to get/create/update and
// 	delete Entities managed in the Entityhub.
//@author mere01
test( "VIE.js StanbolService - CRUD on local entities", function() {
	if (navigator.userAgent === 'Zombie') {
	       return;
	    }
	var z = new VIE();
	ok(z.StanbolService, "Stanbol Service exists.");
	equal(typeof z.StanbolService, "function");

	var stanbol = new z.StanbolService( {
		url : stanbolRootUrl
	});
	z.use(stanbol);

	// create a new entity
	var entity = '<?xml version="1.0" encoding="UTF-8"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"><rdf:Description rdf:about="http://developer.yahoo.com/javascript/howto-proxy.html"><rdfs:label>Howto-Proxy</rdfs:label></rdf:Description></rdf:RDF>'; 
	var modifEntity = '<?xml version="1.0" encoding="UTF-8"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"><rdf:Description rdf:about="http://developer.yahoo.com/javascript/howto-proxy.html"><rdfs:label>Modified Label of Howto-Proxy</rdfs:label></rdf:Description></rdf:RDF>';
	
	var id = 'http://developer.yahoo.com/javascript/howto-proxy.html';
	
	stop();
	stanbol.connector.createEntity(
				entity,
				function(response) {
					ok(true, "E1: new entity " + id +  "created in entityhub/entity/ (using option update)");
					// if an Entities already exists within the Entityhub, the request should fail with BAD REQUEST
					stop();
					stanbol.connector.createEntity(
								entity,
								function(response) {
									ok(false, "E2: entityhub/entity: created already existing entity " + id + ". (using no option)");
									console.log(response);
									start();
								},
								function(err) {
									ok(true, "E2: already-existing entity could not be created in the entityhub! (using no option) Received error message: " + err);
									start();
								}); // do NOT allow updating of already existing entities
					
					// retrieve the entity that's just been created
					stop();
					stanbol.connector.load(
								id,
								function(response) {
									var first = null;
									for (var key in response) 
									// grab just the first key of the returned object
									{
										first = response[key];
										if(typeof(first)!== 'function') {
											console.log(key);
											first = key;
											break;
										}
										}
									ok(true, "E3: got entity from entityhub/entity: " + first);
									console.log("E3: got entity:");
									console.log(first);
									start();
								},
								function(err) {
									ok(false, "E3: could not get entity from the entityhub!");
									console.log(err);
									start();
								},
								{local: 'true'}); // to denote that this is a local entity
					
					// update the entity that's just been created (modify the label)
					stop();
					console.log("sending id to updateEntity: " + id);
					stanbol.connector.updateEntity(
								modifEntity,
								function(response) {
									ok(true, "E4: entity  " + response.id + " was updated successfully in the entityhub.");
									start();
								},
								function(err) {
									ok(false, "E4: could not update entity " + id + " in the entityhub! Received error message: " + err);
									console.log("E4: could not update entity " + id);
									console.log(err);
									start();
								},
								{},
								id);
					
					// delete our entity
					stop();
					stanbol.connector.deleteEntity(
								id,
								function(response) {
									ok(true, "E6: entity  " + response.id + " was deleted successfully from the entityhub.");
									start();
								},
								function(err) {
									ok(false, "E6: could not delete entity " + id + " from the entityhub! Received error message: " + err);
									console.log("E6: could not delete entity " + id);
									console.log(err);
									start();
								}); 
					
					// the deleted entity cannot be retrieved anymore
					stop();
					stanbol.connector.load(
								id,
								function(response) {
									console.log("E7: got entity:");
									var first = null;
									for (var key in response) 
									// grab just the first key of the returned object
									{
										first = response[key]
										if(typeof(first)!== 'function') {
											console.log(key);
											first = key;
											break;
										}
										}
									ok(false, "E7: got non-existing entity from entityhub/entity: " + first);
									start();
								},
								function(err) {
									ok(true, "E7: could not get non-existing entity from the entityhub!");
									console.log("E7:");
									console.log(err);
									start();
								});
					start();
				},
				function(err) {
					ok(false, "E1: entity could not be created in the entityhub! (using options local, update)");
					start();
				}, 
				{update: 'true' // option to allow repeated testing with same entity
				}); 
	
	// we should be unable to update a non-existing entity
	var modifId= 'http://developer.yahoo.com/javascript/howto-proxy-falseaddress.html';
	stop();
	console.log("sending id to updateEntity: " + modifId);
	stanbol.connector.updateEntity(
				modifEntity,
				function(response) {
					ok(false, "E5: non-existing entity  " + response.id + " was updated successfully in the entityhub.");
					start();
				},
				function(err) {
					ok(true, "E5: could not update non-existing entity " + modifId + " in the entityhub! Received error message: " + err);
					console.log("E5: could not update non-existing entity " + modifId);
					console.log(err);
					start();
				},
				{},
				modifId);
	
	// create should fail due to invalid syntax (forgot quotation marks for xmlns:rdf entry)
	var entity = '<?xml version="1.0" encoding="UTF-8"?><rdf:RDF xmlns:rdf=http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"><rdf:Description rdf:about="http://developer.yahoo.com/javascript/howto-proxy.html"><rdfs:label>Howto-Proxy</rdfs:label></rdf:Description></rdf:RDF>'; 
	stop();
	stanbol.connector.createEntity(
		entity,
		function(response) {
			ok(false, "E8: created entity on entityhub in spite of faulty syntax. " + response)
			console.log("E8 got response:");
			console.log(response);
			start();
		},
		function(err) {
			ok(true, "E8: entity creation failed due to erroneous syntax. Received error message: " + err);
			console.log("E8:");
			console.log(err);
			start();
		});
		
}); // end of test for entityhub/entity


