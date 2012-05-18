//     VIE - Vienna IKS Editables
//     (c) 2011 Henri Bergius, IKS Consortium
//     (c) 2011 Sebastian Germesin, IKS Consortium
//     (c) 2011 Szaby Grünwald, IKS Consortium
//     VIE may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://viejs.org/

// ## VIE - DBPedia service
// The DBPedia service allows a VIE developer to directly query
// the DBPedia database for entities and their properties. Obviously,
// the service does not allow for saving, removing or analyzing methods.
(function(){

    jQuery.extend(true, VIE.prototype.StanbolConnector.prototype, {
            
        defaults: {
            contenthub : {
                urlPostfix : "/contenthub",
                index : "contenthub"
            }
        },
        
		// ### uploadContent(content, success, error, options)
		// TODO.  
		// **Parameters**:  
		// TODO
		// *{function}* **success** The success callback.  
		// *{function}* **error** The error callback.  
		// *{object}* **options** Options, unused here.   
		// **Throws**:  
		// *nothing*  
		// **Returns**:  
		// *{VIE.StanbolConnector}* : The VIE.StanbolConnector instance itself.  
		uploadContent: function(content, success, error, options) {
			options = (options)? options :  {};
			var connector = this;

			connector._iterate({
				method : connector._uploadContent,
				methodNode : connector._uploadContentNode,
				success : success,
				error : error,
				url : function (idx, opts) {
					var u = this.options.url[idx].replace(/\/$/, '');
					u += this.options.contenthub.urlPostfix.replace(/\/$/, '');

					var index = (opts.index)? opts.index : this.options.contenthub.index;

					u += "/" + index.replace(/\/$/, '');
					u += "/store";

					return u;
				},
				args : {
					content: content,
					options : options
				},
				urlIndex : 0
			});
		},

		_uploadContent : function (url, args, success, error) {
			jQuery.ajax({
				success: success,
				error: error,
				url: url,
				type: "POST",
				data : args.content,
				contentType : "text/plain"
			});
		},

		_uploadContentNode: function(url, args, success, error) {
			var request = require('request');
			var r = request({
				method: "POST",
				uri: url,
				body : args.content,
				headers: {
					Accept: "application/rdf+xml",
					"Content-Type" : "text/plain"
				}
			}, function(err, response, body) {
				try {
					success({results: JSON.parse(body)});
				} catch (e) {
					error(e);
				}
			});
			r.end();
		}
		
	});

})();