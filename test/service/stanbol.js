module("vie.js - Apache Stanbol Service");

/* All known endpoints of Stanbol */

/* The ones marked with a "!!!" are implemented by the StanbolConnector */
/* The ones marked with a "???" are implemented but still broken */

// !!!  /enhancer/chain/default
// !!!  /enhancer/chain/<chainId>

// !!!  /entityhub/sites/referenced
// !!!  /entityhub/sites/entity
// !!!  /entityhub/sites/find
// !!!	/entityhub/query
// ??? 	/entityhub/sites/query			- strange exception, see test "Query (non-local)"
// !!! 	/entityhub/site/<siteId>/query
// !!!  /entityhub/sites/ldpath
// !!!  /entityhub/site/<siteId>/entity 
// !!!  /entityhub/site/<siteId>/find
// !!!  /entityhub/site/<siteId>/ldpath
// ??? 	/entityhub/entity (GET, PUT, POST, DELETE) - still need to solve allow-methods problem
// !!! 	/entityhub/mapping
// !!!  /entityhub/find
// !!!  /entityhub/lookup
// !!!  /entityhub/ldpath

// ???  /sparql

// !!! /contenthub/contenthub/ldpath						- createIndex(), deleteIndex() - DELETE access problem
// !!!  /contenthub/contenthub/store						- uploadContent()
// !!!  /contenthub/contenthub/store/raw/<contentId>		- getTextContentByID()
// !!!  /contenthub/contenthub/store/metadata/<contentId> 	- getMetadataByID()
// !!!  /contenthub/<coreId>/store							- uploadContent()
// !!!  /contenthub/<coreId>/store/raw/<contentId> 			- getTextContentByID()
// !!!  /contenthub/<coreId>/store/metadata/<contentId> 	- getMetadataByID()
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


var stanbolRootUrl = (window.STANBOL_URLS)? window.STANBOL_URLS : ["http://dev.iks-project.eu:8081", "http://dev.iks-project.eu/stanbolfull"];

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
    equal(typeof z.service('stanbol').init, "function");
    ok(z.service('stanbol').analyze);
    equal(typeof z.service('stanbol').analyze, "function");
    ok(z.service('stanbol').find);
    equal(typeof z.service('stanbol').find, "function");
    ok(z.service('stanbol').load);
    equal(typeof z.service('stanbol').load, "function");
    ok(z.service('stanbol').query);
    equal(typeof z.service('stanbol').query, "function");
    ok(z.service('stanbol').save);
    equal(typeof z.service('stanbol').save, "function");
    ok(z.service('stanbol').connector);
    ok(z.service('stanbol').connector instanceof z.StanbolConnector);
    ok(z.service('stanbol').rules);
    equal(typeof z.service('stanbol').rules, "object");
});

test("VIE.js StanbolConnector - API", function() {
	var z = new VIE();
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    
    //API
    //enhancer
    ok(stanbol.connector.analyze);
    equal(typeof stanbol.connector.analyze, "function");
    //sparql
    ok(stanbol.connector.sparql);
    equal(typeof stanbol.connector.sparql, "function");
    //entityhub
    ok(stanbol.connector.createEntity);
    equal(typeof stanbol.connector.createEntity, "function");
    ok(stanbol.connector.save);
    equal(typeof stanbol.connector.save, "function");
    ok(stanbol.connector.readEntity);
    equal(typeof stanbol.connector.readEntity, "function");
    ok(stanbol.connector.load);
    equal(typeof stanbol.connector.load, "function");
    ok(stanbol.connector.updateEntity);
    equal(typeof stanbol.connector.updateEntity, "function");
    ok(stanbol.connector.deleteEntity);
    equal(typeof stanbol.connector.deleteEntity, "function");
    ok(stanbol.connector.find);
    equal(typeof stanbol.connector.find, "function");
    ok(stanbol.connector.lookup);
    equal(typeof stanbol.connector.lookup, "function");
    ok(stanbol.connector.referenced);
    equal(typeof stanbol.connector.referenced, "function");
    ok(stanbol.connector.ldpath);
    equal(typeof stanbol.connector.ldpath, "function");
    ok(stanbol.connector.query);
    equal(typeof stanbol.connector.query, "function");
    ok(stanbol.connector.getMapping);
    equal(typeof stanbol.connector.getMapping, "function");
    //contenthub
    ok(stanbol.connector.uploadContent);
    equal(typeof stanbol.connector.uploadContent, "function");
    ok(stanbol.connector.getTextContentByID);
    equal(typeof stanbol.connector.getTextContentByID, "function");
    ok(stanbol.connector.getMetadataByID);
    equal(typeof stanbol.connector.getMetadataByID, "function");
    ok(stanbol.connector.createIndex);
    equal(typeof stanbol.connector.createIndex, "function");
    ok(stanbol.connector.contenthubIndices);
    equal(typeof stanbol.connector.contenthubIndices, "function");
    ok(stanbol.connector.deleteIndex);
    equal(typeof stanbol.connector.deleteIndex, "function");
    //cmsadapter
    //factstore
    ok(stanbol.connector.createFactSchema);
    equal(typeof stanbol.connector.createFactSchema, "function");
    ok(stanbol.connector.createFact);
    equal(typeof stanbol.connector.createFact, "function");
    ok(stanbol.connector.queryFact);
    equal(typeof stanbol.connector.queryFact, "function");
    //ontonet
    //rules

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
    var wrongUrls = ["http://www.this-is-wrong.url/"];
    z.use(new z.StanbolService({url : wrongUrls.concat(stanbolRootUrl)}));
    stop();
    z.analyze({element: elem})
    .using('stanbol')
    .execute()
    .done(function(entities) {

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

test("VIE.js StanbolService - Analyze with wrong URL of Stanbol (2)", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    } 

 // Sending a an example with double quotation marks.
    var elem = $('<p>This is a small test, where Barack Obama sings the song \"We want to live forever!\" song.</p>');
    var x = new VIE();
    x.use(new x.StanbolService({url : ["http://www.this-is-wrong.url/"]}));
    stop();
    x.analyze({element: elem}).using('stanbol').execute().done(function(entities) {
        ok(false, "This should not return with any value!");
        start();
    })
    .fail(function(f){
        ok(true, f.statusText);
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


/*
//### test for the /entityhub/sites/query
//@author mere01
//tests json field queries with constraints on value, text and range
test(
		"VIE.js StanbolService - FieldQuery.json",
		function() {
			// ask for the first three entities with an altitude of 34 meters
			var queryVC = '{ "selected": ["http:\/\/www.w3.org\/2000\/01\/rdf-schema#label"], "offset": "0", "limit": "3", "constraints": [{ "type": "value", "value": "34", "field": "http:\/\/www.w3.org\/2003\/01\/geo\/wgs84_pos#alt", "datatype": "xsd:int" }] }';
			// ask for the first three entities with a German rdfs:label
			// starting with "Frankf"
			var queryTC = '{ "selected": ["http:\/\/www.w3.org\/2000\/01\/rdf-schema#label"], "offset": "0", "limit": "3", "constraints": [{"type": "text", "xml:lang": "de", "patternType": "wildcard", "field": "http:\/\/www.w3.org\/2000\/01\/rdf-schema#label", "text": "Frankf*" }] }';
			// ask for the first three cities that are > 1K meters above sear
			// level AND have > 1 mio inhabitants
			var queryRC = '{ "selected": ["http:\/\/www.w3.org\/2000\/01\/rdf-schema#label", "http:\/\/dbpedia.org\/ontology\/populationTotal", "http:\/\/www.w3.org\/2003\/01\/geo\/wgs84_pos#alt"], "offset": "0", "limit": "3", "constraints": [{ "type": "range", "field": "http:\/\/dbpedia.org\/ontology\/populationTotal", "lowerBound": 1000000, "inclusive": true, "datatype": "xsd:long" },{ "type": "range", "field": "http:\/\/www.w3.org\/2003\/01\/geo\/wgs84_pos#alt", "lowerBound": 1000, "inclusive": true, },{ "type": "reference", "field": "http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type", "value": "http:\/\/dbpedia.org\/ontology\/City", }] }';

			var z = new VIE();
			ok(z.StanbolService, "Stanbol Service exists.");
			equal(typeof z.StanbolService, "function");
	
			var stanbol = new z.StanbolService( {
				url : stanbolRootUrl
			});
			// console.log(stanbol.options);
			z.use(stanbol);

			// hold it until we get results form our test query
//			stop();
//			// expecting as results "Baghdad", "Berlin" among others
//			stanbol.connector
//					.queryEntities(
//							queryVC,
//							function(response) {
//								ok(true,
//										"entityhub/query returned a response. (see log)");
//								console
//										.log("value test of entityhub/query returned:");
//								// response is an Object with 2 fields: query and results.
//								// results is an Array containing the 3 resulting Objects
//								console.log(response.results);
//								start();
//							},
//							function(err) {
//								ok(false,
//										"value test of entityhub/query endpoint returned no response!");
//								console.log(err)
//								start();
//							});

			stop();
			// expecting as results "Frankfurt am Main", "Eintracht Frankfurt", among others
			stanbol.connector
					.queryEntities(
							queryTC,
							function(response) {
								ok(true,
										"entityhub/query returned a response. (see log)");
								console
										.log("text test of entityhub/query returned:");
								console.log(response.results);
								start();
							},
							function(err) {
								ok(false,
										"text test of entityhub/query endpoint returned no response!");
								start();
							});
//
//			stop();
//			// expecting as results "Mexico City", "Bogotá" and "Quito"
//			stanbol.connector
//					.queryEntities(
//							queryRC,
//							function(response) {
//								ok(true,
//										"entityhub/query returned a response. (see log)");
//								console
//										.log("range test of entityhub/query returned:");
//								console.log(response.results);
//								start();
//							},
//							function(err) {
//								ok(false,
//										"range test of entityhub/query endpoint returned no response!");
//								start();
//							});

		}); // end of test for entityhub/sites/query

//### test for the /entityhub/site/<siteID>
//@author mere01
//tests the single site service of the entityhub's Referenced Site Manager
//since per default, only dbpedia is referenced, this tests for dbpedia only
//test("VIE.js StanbolService - QueryDBpedia", function() {
//
//		// ask for the first three entities with a German rdfs:label, starting with "Frankf"
//		var query = '{ "selected": ["http:\/\/www.w3.org\/2000\/01\/rdf-schema#label"], "offset": "0", "limit": "3", "constraints": [{"type": "text", "xml:lang": "de", "patternType": "wildcard", "field": "http:\/\/www.w3.org\/2000\/01\/rdf-schema#label", "text": "Frankf*" }] }';
//
//		var z = new VIE();
//		ok(z.StanbolService, "Stanbol Service exists.");
//		equal(typeof z.StanbolService, "function");
//		
//		var stanbol = new z.StanbolService( {
//			url : stanbolRootUrl
//		});
//		z.use(stanbol);
//
//		// hold it until we get results form our test query
//		stop();
//		// expecting as result entity "Paris" (France) of dbpedia
//		stanbol.connector
//				.queryDBpedia(
//						query,
//						function(response) {
//							ok(true,
//									"entityhub/dbpedia returned a response. (see log)");
//							console
//									.log("entity returned from entityhub/dbpedia is:");
//
//							console.log(response.results);
//							start();
//						},
//						function(err) {
//							ok(false,
//									"entityhub/dbpedia endpoint returned no response!");
//							start();
//						});
//
//	}); // end of test for entityhub/site/<siteID>
*/
		
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
        console.log("this is the location:")
        console.log(location);
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

//### test for the StanbolService save interface to the entityhub/entity endpoint, 
//	the service to create Entities managed on the Entityhub.
//@author mere01
test("VIE.js StanbolService - save (create) local entities", function() {
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
	var id = 'http://developer.yahoo.com/javascript/howto-proxy.html';
	var ent = '<?xml version="1.0" encoding="UTF-8"?><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"><rdf:Description rdf:about="http://developer.yahoo.com/javascript/howto-proxy.html"><rdfs:label>Howto-Proxy</rdfs:label></rdf:Description></rdf:RDF>'; 
//	var entity = z.entities.addOrUpdate({entity: ent, update: true, local: true});
	var entity = {entity: ent, update: true, local: true};
	var entity2 = {entity: ent, local: true};
	
	stop();
	z.save(entity)	// option to allow repeated testing with same entity
		.using("stanbol").execute().done(function(response) {
			
		ok(true, "E1: new entity " + id +  "created in entityhub/entity/ (using option update)");
		// if an Entities already exists within the Entityhub, the request should fail with BAD REQUEST
		stop();
		z.save(entity2)	// do NOT allow updating of already existing entities (no options)
			.using("stanbol").execute().done(	
					function(response) {
						ok(false, "E2: entityhub/entity: created already existing entity " + id + ". (using no option)");
						console.log(response);
						start();
					}).fail(
					function(err) {
						ok(true, "E2: already-existing entity could not be created in the entityhub! (using no option) Received error message: " + err);
						start();
					}); 
			start();
		}).fail(function(err) {
			ok(false, "E1: entity could not be created in the entityhub! (using option update)");
			start();
		});


	//create should fail due to invalid syntax (forgot quotation marks for xmlns:rdf entry)
	var entF = '<?xml version="1.0" encoding="UTF-8"?><rdf:RDF xmlns:rdf=http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"><rdf:Description rdf:about="http://developer.yahoo.com/javascript/howto-proxy.html"><rdfs:label>Howto-Proxy</rdfs:label></rdf:Description></rdf:RDF>'; 
	stop();
	z.save({entity: entF, local: true}).using("stanbol").execute().done(
		function(response) {
			ok(false, "E8: created entity on entityhub in spite of faulty syntax. " + response)
			console.log("E8 got response:");
			console.log(response);
			start();
		}).fail(
		function(err) {
			ok(true, "E8: entity creation failed due to erroneous syntax. Received error message: " + err);
			console.log("E8:");
			console.log(err);
			start();
		});

}); // end of save test for entityhub/entity


//### test for the entityhub/entity, the service to get/create/update and
// 	delete Entities managed on the Entityhub.
//@author mere01
test("VIE.js StanbolConnector - CRUD on local entities", function() {
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
				start();
				ok(true, "E1: new entity " + id +  " created in entityhub/entity/ (using option update)");
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
				stanbol.connector.readEntity(
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
								    ok(response);
								    if (response && response.id)
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
                                    ok(response);
                                    if (response && response.id)
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
					stanbol.connector.readEntity(
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
				},
				function(err) {
					ok(false, "E1: entity could not be created in the entityhub! (using option update)");
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
                    ok(response);
                    if (response && response.id)
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



//### test for the /contenthub/contenthub/store/raw/<contentId>, the service to retrieve raw text
// content from content items via the item's id
//@author mere01
test("Vie.js StanbolConnector - Contenthub/store/raw/<id>", function() {

	var z = new VIE();
	ok(z.StanbolService, "Stanbol Service exists.");
	equal(typeof z.StanbolService, "function");

	var stanbol = new z.StanbolService( {
		url : stanbolRootUrl
	});
	z.use(stanbol);
	
	var content = "This is some raw text content to be stored for id 'urn:melaniesitem'.";
	var id = "urn:melaniesitem"; // for iks demo server
	
	// first we have to store that item to the contenthub -> to the default index
	var url = stanbolRootUrl + "contenthub/contenthub/store/" + id;
	jQuery.ajax({
		url: url,
		success: function(response) {console.log("Stored entity " + id + " to contenthub"); console.log(response)},
		error: function(err) {console.log(err);},
		type: "POST",
        data: content,
        contentType: "text/plain",
    	dataType: "application/rdf+xml"
		    });
	
	// hold it until we get our results
	stop();
			stanbol.connector
				.getTextContentByID(id,
						function(response) {
							ok(true, "contenthub/contenthub/store/raw returned a response. (see log)");
							console.log("text content returned from contenthub/contenthub/store/raw is:");
							console.log(response);
							start();
						},
						function(err) {
							ok(false, "contenthub/contenthub/store/raw endpoint returned no response!");
							console.log(err);
							start();
						});
			
}); // end of test for /contenthub/contenthub/store/raw/<contentId>


//### test for the /contenthub/contenthub/store/metadata/<contentId>, the service to retrieve the
//metadata (=enhancements) from content items via the item's id
//@author mere01
test("Vie.js StanbolConnector - Contenthub/store/metadata/<id>", function() {

	var z = new VIE();
	ok(z.StanbolService, "Stanbol Service exists.");
	equal(typeof z.StanbolService, "function");

	var stanbol = new z.StanbolService( {
		url : stanbolRootUrl
	});
	z.use(stanbol);
	
	var content = "This is a small example content item with an occurrence of entity Steve Jobs in it.";
	var id = "urn:melanie2ndsitem";
	
	// first we have to store that item to the contenthub -> to the default index
	var url = stanbolRootUrl + "contenthub/contenthub/store/" + id;
	jQuery.ajax({
		url: url,
		success: function(response) {console.log("Stored entity " + id + " to contenthub"); console.log(response)},
		error: function(err) {console.log(err);},
		type: "POST",
      data: content,
      contentType: "text/plain",
  	dataType: "application/rdf+xml"
		    });
	
	// hold it until we get our results
	stop();
			stanbol.connector
				.getMetadataByID(id,
						function(response) {
							ok(true, "contenthub/contenthub/store/metadata returned a response. (see log)");
							console.log("text content returned from contenthub/contenthub/store/metadata is:");
							console.log(response);
							start();
						},
						function(err) {
							ok(false, "contenthub/contenthub/store/metadata endpoint returned no response!");
							console.log(err);
							start();
						});
			
}); // end of test for /contenthub/contenthub/store/metadata/<contentId>


//### test for the /contenthub endpoint, checking the ldpath functionality and options in working with 
//		own indices on the contenthub
//@author mere01
test("VIE.js StanbolConnector - CRD on contenthub indices", function() {
	
	if (navigator.userAgent === 'Zombie') {
        return;
     }
	
	// we first want to create ourselves a new index, using an ldpath program
	var ldpath = "name=melaniesIndex&program=@prefix rdf : <http://www.w3.org/1999/02/22-rdf-syntax-ns#>; @prefix rdfs : <http://www.w3.org/2000/01/rdf-schema#>; @prefix db-ont : <http://dbpedia.org/ontology/>; title = rdfs:label :: xsd:string; dbpediatype = rdf:type :: xsd:anyURI; population = db-ont:populationTotal :: xsd:int;";
	var index = 'melaniesIndex';
	
	// first, we delete the test index in case it already exists.
	var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    stop();
	   stanbol.connector.deleteIndex(
    		index, 
    		function(success){
    			ok(true, "Index " + index + " was deleted from contenthub.");
    			start();
    }, 
    		function(err){
    			ok(false, "Index " + index + " could not be deleted from contenthub");
    			start();
    });
	
	// then, we create a new, empty index	
    stop();
    stanbol.connector.createIndex(ldpath, function(success) {
    	ok(true, "created new index on contenthub.");
    	console.log(success);
    	start();
    	
    	// we can now store new items unto our own index
    	var item = "We are talking about huge cities such as Paris or New York, where life is an expensive experience.";
    	var id = 'myOwnIdToUseHere';
    	
    	
    	var z = new VIE();
        ok (z.StanbolService);
        equal(typeof z.StanbolService, "function");
        var stanbol = new z.StanbolService({url : stanbolRootUrl});
        z.use(stanbol);
        stop();
        stanbol.connector.uploadContent(item,
        	function(success){
        		ok(true, "stored item to " + index); start();
        		start();
        		
        		// we can then get back this newly created item by its id:
        		var idToRetrieve = "urn:content-item-" + id;
        		var z = new VIE();
                ok (z.StanbolService);
                equal(typeof z.StanbolService, "function");
                var stanbol = new z.StanbolService({url : stanbolRootUrl});
                z.use(stanbol);
                stop();
                // ... we can either retrieve its text content
                stanbol.connector.getTextContentByID(idToRetrieve, 
                	function(success){
                		ok(true, "retrieved item's raw text content.");
                		console.log("retrieved content item: " + success);
                		start();
                	},
                	function(err) {
                		ok(false, "could not retrieve item's raw text content.");
                		console.log(err);
                		start();
                	},
                	{index: index}
                	);
                stop();
                // ... or its enhancements
                stanbol.connector.getMetadataByID(idToRetrieve,
                	function(success){
	            		ok(true, "retrieved content item's metadata.");
	            		console.log("retrieved content item's metadata: " + success);
	            		start();
            		},
            		function(err) {
	            		ok(false, "could not retrieve content item's metadata.");
	            		console.log(err);
	            		start();
            		},
            		{index: index}
            		);
        		
        		
        	},
        		function(err){
        			ok(false, "couldn't store item to " + id); 
        			console.log(err); 
        			start();
        		},
        		{
        			index: index,
        			id: id
        		});
        
        
        // we can also view the list of indices that are currently being managed by the contenthub
        var z = new VIE();
        ok (z.StanbolService);
        equal(typeof z.StanbolService, "function");
        var stanbol = new z.StanbolService({url : stanbolRootUrl});
        z.use(stanbol);
        stop();
        stanbol.connector.contenthubIndices(function (indices) {
        	ok(_.isArray(indices), "returned an array of indices");
        	ok(indices.length > 0, "returned at least one index");
        	
        	ok(true, "indices currently managed by the contenthub: \n" + indices);
        	
        	console.log("the following indices are currently managed by the contenthub:");
        	console.log(indices);
        	start();
        }, function (err) {
        	ok(false, "No contenthub indices have been returned!");
        	start();
        });
        
    	
    }, function(err){
    	ok(false, "could not create index '" + index + "' on contenthub.");
    	console.log(err);
    	start();
    });
	

    
	}
);

//### test for the /entityhub/mapping endpoint, checking the retrieval of entity mappings
// (the entityhub/mapping looks up mappings from local Entities to Entities managed by a Referenced Site.
//@author mere01
test("VIE.js StanbolConnector - entityhub/mapping", function() {

	if (navigator.userAgent === 'Zombie') {
		return;
	}

	// we can look for an entity's mapping 
	var entity = "http://dbpedia.org/resource/Paris";
	// or for the mapping itself by its ID
	var mapping = "urn:org.apache.stanbol:entityhub:mapping.996b1d77-674d-bf3d-f426-f496c87b5ea7";
	// or by using the entity's symbol
	var symbol = "urn:org.apache.stanbol:entityhub:entity.3e388b57-0a27-c49f-3e0a-2d547a3e1985";
	
	var z = new VIE();
	ok (z.StanbolService);
	equal(typeof z.StanbolService, "function");
	var stanbol = new z.StanbolService({url : stanbolRootUrl});
	z.use(stanbol);
	stop();
	stanbol.connector.getMapping(entity, function(success) {
		ok(true, "retrieved Mapping for entity " + entity);
		console.log(success);
		start();

		},
		function(err){
			ok(false, "couldn't retrieve mapping for entity" + entity); 
			console.log(err); 
			start();
		},
		{
			entity: true
		});
	
	stop();
	stanbol.connector.getMapping(mapping, function(success) {
		ok(true, "retrieved mapping by ID.");
		console.log(success);
		start();

		},
		function(err){
			ok(false, "couldn't retrieve mapping by ID"); 
			console.log(err); 
			start();
		},
		{});
	
	stop();
	stanbol.connector.getMapping(symbol, function(success) {
		ok(true, "retrieved mapping for symbol " + symbol);
		console.log(success);
		start();

		},
		function(err){
			ok(false, "couldn't retrieve mapping for symbol " + symbol); 
			console.log(err); 
			start();
		},
		{ 
			symbol: true
			});
	}
);


test("VIE.js StanbolService - Query (non-local)", function () {
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
                          "value": "http://dbpedia.org/ontology/Person"
                      }]
                  };

     var query = { 
    		 "selected": ["http:\/\/www.w3.org\/2000\/01\/rdf-schema#label"], 
    		 "offset": "0", 
    		 "limit": "3", 
    		 "constraints": [{
    			 "type": "text", 
    			 "xml:lang": "de", 
    			 "patternType": "wildcard", 
    			 "field": "http:\/\/www.w3.org\/2000\/01\/rdf-schema#label", 
    			 "text": "Frankf*" }] 
                };
                                                                                                                              
     
     var z = new VIE();
     z.use(new z.StanbolService({url : stanbolRootUrl}));
     stop();
     // query all referenced sites (entityhub/sites/query)
     z.query({query : query, local: false})
     .using('stanbol').execute().done(function(entities) {
         ok(entities);
         if (!entities.length > 0) {
        	 ok(false, "no entitites found on all referenced sites.");
         } else {
        	ok(true, "at least one entity was found on all referenced sites."); 
         }
         ok(entities instanceof Array);
         console.log("all referenced sites:")
         console.log(entities)
         start();
     })
     // TODO: at this place, some strange parse exception is thrown in spite of 
     // valid query and valid URI.
     // cf e.g.
     // curl -X POST -H "Content-Type:application/json" --data "@fieldQuery2.json" http://lnv-89012.dfki.uni-sb.de:9001/entityhub/sites/query
     // to
     // curl "http://lnv-89012.dfki.uni-sb.de:9001/entityhub/sites/entity?id=http://dbpedia.org/resource/Frankfurt
     .fail(function(f){
         ok(false, f.statusText);
         start();
     });
     
     /** mere01 **/
     stop();
     // query only entities on referenced site dbpedia (entityhub/site/dbpedia/query) 
     z.query({query : query, site: "dbpedia"})
     .using('stanbol').execute().done(function(entities) {
         ok(entities);
         if (!entities.length > 0) {
        	 ok(false, "no entitites found on dbpedia.");
         } else {
        	ok(true, "at least one entity was found on dbpedia."); 
         }
         ok(entities instanceof Array);
         console.log("dbpedia:")
         console.log(entities)
         start();
     })
     .fail(function(f){
         ok(false, f.statusText);
         start();
     });
     /**/
});


test("VIE.js StanbolService - Query (local)", function () {
    if (navigator.userAgent === 'Zombie') {
        return;
     }
     var query = {};
     
     var z = new VIE();
     z.use(new z.StanbolService({url : stanbolRootUrl}));
     stop();
     z.query({query : query, local : true})
     .using('stanbol').execute().done(function(entities) {
         ok(false, "This should not return successfully if query was wrong!");
         start();
     })
     .fail(function(msg){
         ok(true, msg);
         start();
     });
     
     /** mere01 **/
     var query = { 
    		 "selected": ["http:\/\/www.w3.org\/2000\/01\/rdf-schema#label"], 
    		 "offset": "0", 
    		 "limit": "3", 
    		 "constraints": [{
    			 "type": "text", 
    			 "xml:lang": "de", 
    			 "patternType": "wildcard", 
    			 "field": "http:\/\/www.w3.org\/2000\/01\/rdf-schema#label", 
    			 "text": "Frankf*" }] 
                };
     
     var z = new VIE();
     ok (z.StanbolService);
     equal(typeof z.StanbolService, "function");
     z.use(new z.StanbolService({url : stanbolRootUrl}));
     
     stop();
     // query only locally-managed entities (entityhub/query) 
     z.query({query : query, local : true})
     .using('stanbol').execute().done(function(entities) {
         ok(entities);
         if (!entities.length > 0) {
        	 ok(false, "no entitites found.");
         } else {
        	ok(true, "at least one entity was found."); 
         }
         ok(entities instanceof Array);
         console.log(entities)
         start();
     })
     .fail(function(f){
         ok(false, f.statusText);
         start();
     });
     /**/
});
