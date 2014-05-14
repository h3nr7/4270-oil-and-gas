(function() {

	var ns = MKK.getNamespace('app.scene');
	var EventDispatcher = MKK.getNamespace('mkk.event').EventDispatcher;

	if (!ns.AbLevel) {


		var AbLevel = function AbLevel() {

			this.pos = null;
			this.startFrame = 0;

		}

		var p = AbLevel.prototype = new EventDispatcher();


		p.setup = function(startX, startY) {
			this._setup(startX, startY);
		}

		p._setup = function(startX, startY, startFrame) {

			this.startFrame = startFrame?startFrame:0;
			this.pos new PIXI.Point(startX, startY);
		}

		p.moveTo = function(toX, toY, duration, tween, callback) {

			if (!tween) tween = TWEEN.Easing.Linear.none;



		}
 

 	}



})();