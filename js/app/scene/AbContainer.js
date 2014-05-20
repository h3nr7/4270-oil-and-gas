(function() {

	var ns = MKK.getNamespace('app.scene');
	var AbElement = ns.AbElement;


	if(!ns.AbContainer) {
		var AbContainer = function AbContainer() {
			this.container = null;
			this.startFrame = 0;
			this.curFrame = 0;
			this.duration = 0;

		}


		ns.AbContainer = AbContainer;

		var p = AbContainer.prototype = new AbElement();


		//setup
		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);
			this._postSetup();

		}

		p._setup = function(sFrame, duration, x, y) {

			this._preSetup(x, y);

			this.container = new PIXI.DisplayObjectContainer();
			this.container.position = this.oPos.clone();
			this.startFrame = sFrame;
			this.duration = duration;		
		}

		//destroy
		p.destroy = function() {
			this.close();
			this._destroy();
		}

		p.close = function() {

		}


		//init
		p.init = function() {
			this._init();
		}

		p.open = function() {

		}

		p.update = function() {
			this._update();
		}

		p._update = function(frame) {
			this.container.position = this.cPos.add(this.offPos);
		}

		p.localCurFrame = function(frame) {
			return ( frame - this.startFrame );
		}

		// -----------------------------------------------------------
		// Animate In and Out in SCENE
		// -----------------------------------------------------------
		p.animateIn = function(frame, duration, callback) {

		}

		p.animateOut = function(frame, duration, callback) {

		}

	}


})();