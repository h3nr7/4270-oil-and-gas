(function(){


	var ns = MKK.getNamespace('app.scene');
	var EventDispatcher = MKK.getNamespace('mkk.event').EventDispatcher;

	if (!ns.AbElement) {


		var AbElement = function AbElement() {
			this.oPos = null;
			this.cPos = null;
			this.offPos = null;
			this.setupComplete = false;
		}

		ns.AbElement = AbElement;

		var p = AbElement.prototype = new EventDispatcher();

		//setup
		p.setup = function(x, y) {
			this._setup(x, y);
		}

		p._setup = function(x, y) {
			this._preSetup(x, y);
		}

		p._preSetup = function(x, y) {

			this.oPos = new PIXI.Point(x,y);
			//set the current position
			this.cPos = new PIXI.Point(x,y);
			//set the offsetAmount
			this.offPos = new PIXI.Point(0,0);
		}

		p._postSetup = function() {
			this.setupComplete = true;
		}

		//destroy
		p.destroy = function() {
			_this._destroy();
		}

		p._destroy = function() {}


		//init
		p.init = function() {
			this._init();
		}

		p._init = function() {}


		//update
		p.update = function() {
			this._update();
		}

		p._update = function() {}

	
	}



})();