module("vie.js - BrowserStorage Service");

test("VIE.js BrowserStorage - Registration", function() {
    var v = new VIE();
    ok(v.BrowserStorageService, "Checking if the BrowserStorage Service exists.'");
    v.use(new v.BrowserStorageService);
    ok(v.service('browserStorage'));
});

test("VIE.js BrowserStorageService - API", function() {
    var v = new VIE();
    v.use(new v.BrowserStorageService);    
    //API
    ok(v.service('browserStorage').load);
    equals(typeof v.service('browserStorage').load, "function");
	ok(v.service('browserStorage').save);
    equals(typeof v.service('browserStorage').save, "function");
	ok(v.service('browserStorage').removeFile);
    equals(typeof v.service('browserStorage').removeFile, "function");
});

test("VIE.js BrowserStorageConnector - API", function() {
	var v = new VIE();
    var browserStorage = new v.BrowserStorageService();
    v.use(browserStorage);
    //API
    ok(v.service('browserStorage').load);
    equals(typeof v.service('browserStorage').load, "function");
	ok(v.service('browserStorage').save);
    equals(typeof v.service('browserStorage').save, "function");
	ok(v.service('browserStorage').removeFile);
    equals(typeof v.service('browserStorage').removeFile, "function");
});

test("VIE.js BrowserStorage - Save", function() {
    var v = new VIE();
    v.use(new v.BrowserStorageService);
    ok(v.service('browserStorage'));
	
});
