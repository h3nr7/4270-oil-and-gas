(function() {

	var ns = MKK.getNamespace('app.scene');
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var scenedata = MKK.getNamespace('data').scenedata;
	var styledata = MKK.getNamespace('data').styledata;
	var AbScene = ns.AbScene;

	var Scene2Level = ns.level.Scene2Level;
	var ElSprite = ns.element.ElSprite;
	var ElSpriteContainer = ns.element.ElSpriteContainer;
	var ElText = ns.element.ElText;
	var ElRect = ns.element.ElRect;
	var ElSeaBG = ns.element.ElSeaBG;
	var ElSeaWave = ns.element.ElSeaWave;
	var ElRotatingSprite = ns.element.ElRotatingSprite;


	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;


	if(!ns.Scene2) {

		var Scene2 = function Scene2() {

		}


		ns.Scene2 = Scene2;

		var p = Scene2.prototype = new AbScene();

		//open when init is completed
		p.open = function() {

			this.createLevels(scenedata.scene2.level, Scene2Level);

			// ----------------------------
			// create sea
			// ----------------------------
			this.seabg = new ElSeaBG('seabg', 0,1050,0,0,0, 1024, 1024);
			this.seawave = new ElSeaWave('seawave', 0, 1050,0,0,0, 1024);

			this.smallship = new ElSprite('explorer-ship-small.png', 100, 930, 0, 0);

			// ----------------------------
			// create ship
			// ----------------------------
			this.ship = new ElSpriteContainer('ship', 0, 1000, 0, 0, 0);
			this.ship.addSprite("explorer-ship-top1.png", 300,880);
			this.ship.addSprite("explorer-ship-bottom1.png", 0,1180);


			// ----------------------------
			// create inner
			// ----------------------------
			this.inner = new ElSpriteContainer('inner', 0, 0, -200, 1200, 0);
			this.inner.addSprite("exploration_inner_bg_01.png", 0,0);
			this.inner.addSprite("exploration_inner_bg_02.png", 655,0);
			this.inner.addSprite("exploration_inner_bg_03.png", 0,699);
			this.inner.addSprite("exploration_inner_bg_04.png", 655,699);
			this.inner.scale(1.2);
			this.inner.mask(300, 50, 550, 2400);
			this.inner.showMask();

			this.fan = new ElRotatingSprite('engine_fan_2.png', 400, 2200, 0, 0.5, 0.5);
			this.fan.start();


			// ----------------------------
			// ship tween to zoom
			// ----------------------------
			var tweenSmallShipBound = ListenerFunctions.createListenerFunction(this, this.tweenSmallShip);
			this.tween0 = new TweenEach({x: 100, y: 930})
							.to({x: 700}, this.startFrame+728)
							.easing(TWEEN.Easing.Exponential.Out)
							.onUpdate(tweenSmallShipBound)
							.delay(this.startFrame+350).start();

			var tweenShipBound = ListenerFunctions.createListenerFunction(this, this.tweenShip);
			this.tween1 = new TweenEach({scale:1, x: 0, y:0, ix: 0, iy: 1200})
							.to({scale:3, x: -560, y:-2200, ix: 0, iy: 2200})
							.onUpdate(tweenShipBound)
							.delay(this.startFrame+792).start();

			var tweenInnerBound = ListenerFunctions.createListenerFunction(this, this.tweenInner);
			this.tween2 = new TweenEach({x: 300, y: 50, width:550, height: 2400})
							.to({x: 0, width:1200}, 200)
							.onUpdate(tweenInnerBound)
							.delay(this.startFrame+964).start();

			var tweenInnerMoveBound = ListenerFunctions.createListenerFunction(this, this.tweenInnerMove);
			this.tween3 = new TweenEach({x:-100, y:1200}, 2000)
							.to({y:1700})
							.onUpdate(tweenInnerMoveBound)
							.delay(this.startFrame+842).start();

			// var tweenInnerScaleBound = ListenerFunctions.createListenerFunction(this, this.tweenInnerScale);
			// this.tween4 = new TweenEach({scale:1.2}, 100)
			// 				.to({scale:0.8})
			// 				.onUpdate(tweenInnerScaleBound)
			// 				.delay(this.startFrame+2000).start();

			// ----------------------------
			// add to levels
			// ----------------------------
			this.level[0].addElement(this.smallship.container);
			this.level[0].addElement(this.seabg.container);
			this.level[0].addElement(this.seawave.container);
			this.level[1].addElement(this.inner.container);
			this.level[1].addElement(this.fan.container);
			this.level[2].addElement(this.ship.container);
			

		}

		// ----------------------------
		// all tweening funcitons
		// ----------------------------
		p.tweenSmallShip = function(e) {
				var smallship = this.smallship;
				var cObj = this.tween0.tweenVars();
				smallship.position(cObj.x, cObj.y);

				// this.inner.position(cObj.ix, cObj.iy);

		}

		p.tweenShip = function(e) {
				var ship = this.ship;
				var cObj = this.tween1.tweenVars();
				ship.scale(cObj.scale);
				ship.position(cObj.x, cObj.y);

				// this.inner.position(cObj.ix, cObj.iy);

		}

		p.tweenInner = function(e) {
			var cObj = this.tween2.tweenVars();
			this.inner.mask(cObj.x, cObj.y, cObj.width, cObj.height);
			if(e>=1) {
				this.inner.hideMask();
			}
		}

		p.tweenInnerMove = function(e) {
			var cObj = this.tween3.tweenVars();
			this.inner.position(cObj.x, cObj.y);
			
		}

		p.tweenInnerScale = function(e) {
			var cObj = this.tween4.tweenVars();
			this.inner.scale(cObj.scale);
			
		}

		//close when destroyed
		p.close = function() {

		}

		p.update = function(frame) {

			this._update(frame);
			var cFrame = this.localCurFrame(frame);


			if(cFrame>=0 && cFrame<this.duration) {
				this.show();
				this.cPos.y = -cFrame;
			}
			else {
				this.hide();
			}

			if (cFrame>=611) {
				this.level[1].show();
			}
			else {
				this.level[1].hide();
			}

			if(cFrame>=1320) {
				this.level[2].hide();
			}
			else {
				this.level[2].show();
			}

			
			this.level[0].update(cFrame);
			this.level[1].update(cFrame);
			this.level[2].update(cFrame);
		}



	}




})();