(function(){

	var ns = MKK.getNamespace("app.assets");
	var EventDispatcher = MKK.getNamespace("mkk.event").EventDispatcher;

	if (!ns.AStaticAsset) {

		var AStaticAsset = function AStaticAsset() {
			this.container = null;
			this.pos = null;
		}

		ns.AStaticAsset = AStaticAsset;

		var p = AStaticAsset.prototype = new EventDispatcher();
		var s = EventDispatcher.prototype;

		p.setup = function(posX, posY) {
			this._setup();
		}

		p._setup = function() {
			this.pos = new PIXI.Point(0,0);

		}

		p.init = function() {

		}

		p._init = function() {

		}

		p.moveTo = function(toX, toY) {

		}





	}



})();