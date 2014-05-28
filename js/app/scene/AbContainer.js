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


	if(!ns.AbContainer) {
		var AbContainer = function AbContainer() {
			this.container = null;
			this.startFrame = 0;
			this.curFrame = 0;
			this.duration = 0;
			this.maskObj = null;

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


		// // -----------------------------------------------------------
		// // Container Functions
		// // -----------------------------------------------------------
		// p.scale = function(factor) {
		// 	this.container.scale.x = this.container.scale.y = factor;
		// }

		// p.position = function(x, y) {
		// 	this.container.x = x;
		// 	this.container.y = y;
		// }

		// p.mask = function(xX, yY, wW, hH, type) {

		// 	if(!this.maskObj) {
		// 		this.maskObj = new PIXI.Graphics();
		// 		this.container.addChild(this.maskObj);
		// 	}

		// 	this.maskObj.clear();
		// 	this.maskObj.beginFill(0x8bc5ff, 1);

		// 	switch (type) {

		// 		default:
		// 		case 'rect':
		// 			this.maskObj.drawRect(0, 0, wW, hH);
		// 			break;
		// 		case 'round':
		// 			break;
		// 	}
		// 	this.maskObj.endFill();
		// 	this.maskObj.position.x = xX;
		// 	this.maskObj.position.y = yY;

		// }


		// p.showMask = function() {
		// 	if(this.container.mask) return;
		// 	this.container.mask = this.maskObj;
		// }

		// p.hideMask = function() {
		// 	if(this.container.mask) this.container.mask = null;
		// }


		// p.show = function() {
		// 	this.container.visible = true;
		// }

		// p.hide = function() {
		// 	this.container.visible = false;
		// }

		// -----------------------------------------------------------
		// Animate In and Out in SCENE
		// -----------------------------------------------------------
		p.animateIn = function(frame, duration, callback) {

		}

		p.animateOut = function(frame, duration, callback) {

		}

	}


})();