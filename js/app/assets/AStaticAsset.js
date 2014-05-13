(function(){

	var ns = MKK.getNamespace("app.assets");
	var EventDispatcher = MKK.getNamespace("mkk.event").EventDispatcher;

	if (!ns.AStaticAsset) {

		var AStaticAsset = function AStaticAsset() {
			this.container = null;
		}

		ns.AStaticAsset = AStaticAsset;

		var p = AStaticAsset.prototype = new EventDispatcher();
		var s = EventDispatcher.prototype;

		p.setup = function() {

			this._setup();
		}

		p._setup = function() {

		}


		p.init = function() {
			
		}

		p._init = function() {

		}





	}



})();