module("vie.js - LocalStorage Service");

test("VIE.js LocalStorage - Registration", function() {
    var v = new VIE();
    ok(v.LocalStorageService, "Checking if the LocalStorage Service exists.'");
    v.use(new v.LocalStorageService);
    ok(v.service('localStorage'));
});

test("VIE.js LocalStorageService - API", function() {
    var v = new VIE();
    v.use(new v.LocalStorageService);    
    //API
    ok(v.service('localStorage').load);
    equals(typeof v.service('localStorage').load, "function");
	ok(v.service('localStorage').save);
    equals(typeof v.service('localStorage').save, "function");
	ok(v.service('localStorage').removeFile);
    equals(typeof v.service('localStorage').removeFile, "function");
});

test("VIE.js LocalStorageConnector - API", function() {
	var v = new VIE();
    var localStorage = new v.LocalStorageService();
    v.use(localStorage);
    //API
    ok(v.service('localStorage').load);
    equals(typeof v.service('localStorage').load, "function");
	ok(v.service('localStorage').save);
    equals(typeof v.service('localStorage').save, "function");
	ok(v.service('localStorage').removeFile);
    equals(typeof v.service('localStorage').removeFile, "function");
});

test("VIE.js LocalStorage - Save", function() {
    var v = new VIE();
    v.use(new v.LocalStorageService);
    ok(v.service('localStorage'));
	
});
