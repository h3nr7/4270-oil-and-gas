(function() {

	var ns = MKK.getNamespace('app.loader');
	var EventDispatcher = MKK.getNamespace('mkk.event').EventDispatcher;

	if(!ns.AssetsLoader) {

		var AssetsLoader = function AssetsLoader() {

		}

		var p = AssetsLoader.prototype = new EventDispatcher();
		var s = EventDispatcher;


		p.load = function(aList) {

		}

		p.loadComplete = function(callback) {

		}



	}



})();