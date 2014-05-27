// ================================================
// Created by: HenryYP @ monKiKI 
// Agency: KHWS
// Client: EXXON Mobil
// Date: 2015-05
// ================================================
// Class: AbContainer
// Description: 
// Base class for: AbContainer
// ================================================
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

		// -----------------------------------------------------------
		// Container Functions
		// -----------------------------------------------------------
		p.scale = function(factor) {
			this.container.scale.x = this.container.scale.y = factor;
		}

		p.position = function(x, y) {
			//bitwise OR statement to round up the
			// this.container.x = (x + 0.5) | 0;
			// this.container.y = (y + 0.5) | 0;
			this.container.x = x;
			this.container.y = y;
		}

		p.opacity = function(e) {
			this.container.alpha = e;
		}
		p.mask = function(xX, yY, wW, hH, type) {

			if(!this.maskObj) {
				this.maskObj = new PIXI.Graphics();
				this.container.addChild(this.maskObj);
			}

			this.maskObj.clear();
			this.maskObj.beginFill(0x8bc5ff, 1);

			switch (type) {

				default:
				case 'rect':
					this.maskObj.drawRect(0, 0, wW, hH);
					break;
				case 'round':
					break;
			}
			this.maskObj.endFill();
			this.maskObj.position.x = xX;
			this.maskObj.position.y = yY;

		}


		p.showMask = function() {
			if(this.container.mask) return;
			this.container.mask = this.maskObj;
		}

		p.hideMask = function() {
			if(this.container.mask) this.container.mask = null;
		}


		p.show = function() {
			this.container.visible = true;
		}

		p.hide = function() {
			this.container.visible = false;
		}

	
	}



})();