// ================================================
// Created by: HenryYP @ monKiKI 
// Agency: KHWS
// Client: EXXON Mobil
// Date: 2015-05
// ================================================
// Class: AbContainer
// Description: Based on the PIXI.js, creating the 
// DisplayObjectContainer with extra option of 
// startFrame, Duration.
// Base class for: AbLevel, AbScene
// ================================================
(function() {

	var ns = MKK.getNamespace('app.scene');
	var AbElement = ns.AbElement;
	var AbSprite = ns.AbSprite;


	if(!ns.AbContainer) {
		var AbContainer = function AbContainer() {
			this.container = null;
			this.startFrame = 0;
			this.curFrame = 0;
			this.duration = 0;
			this.maskObj = null;
			this.element = [];

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

		p.init = function() {
			this._init();
		}

		p.open = function() {

		}

		p.localCurFrame = function(frame) {
			return ( frame - this.startFrame );
		}

		// -----------------------------------------------------------
		// Updater
		// -----------------------------------------------------------
		p.update = function() {
			this._update();
		}

		p.__update = function(frame) {

			this._update(frame);
		}

		p._update = function(frame) {
			this.container.position.x = this.cPos.x + this.offPos.x;
			this.container.position.y = this.cPos.y + this.offPos.y;
		}


		// -----------------------------------------------------------
		// Container Functions
		// -----------------------------------------------------------

		p.addSprite = function(name, x, y, z, aX, aY) {
			var tmp = new AbSprite(name, x, y, z, aX, aY);
			this.element.push(tmp);
			this.container.addChild(tmp.container);
			return tmp;
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