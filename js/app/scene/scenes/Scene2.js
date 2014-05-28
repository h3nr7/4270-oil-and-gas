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
	var ElShipInner = ns.element.ElShipInner;
	var ElRadarBoat = ns.element.ElRadarBoat;

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
			this.seabg = new ElSeaBG('seabg', 0,1250,0,0,0, 1024, 1024);
			this.seawave = new ElSeaWave('seawave', 0, 1250,0,0,0, 1024);

			this.smallship = new ElSprite('explorer-ship-small.png', 100, 1130, 0, 0);

			// ----------------------------
			// create ship
			// ----------------------------
			this.ship = new ElSpriteContainer('ship', 0, 1000, 0, 0, 0);
			this.ship.addSprite("explorer-ship-top1.png", 300,880);
			this.ship.addSprite("explorer-ship-bottom1.png", 0,1180);


			// ----------------------------
			// create ship inner
			// ----------------------------
			this.shipinner = new ElShipInner(this.startFrame+1300, 8000);
			this.shipinner.mask(300, 40, 490, 2300);
			this.shipinner.showMask();

			// ----------------------------
			// create ship outer
			// ----------------------------			
			this.radarboat = new ElRadarBoat(0, 8000, 512, 3000);

			// ----------------------------
			// ship tween to zoom
			// ----------------------------
			var tweenSmallShipBound = ListenerFunctions.createListenerFunction(this, this.tweenSmallShip);
			this.tween0 = new TweenEach({x: 100, y: 1130})
							.to({x: 700}, this.startFrame+728)
							.easing(TWEEN.Easing.Exponential.Out)
							.onUpdate(tweenSmallShipBound)
							.delay(this.startFrame+350).start();

			var tweenShipBound = ListenerFunctions.createListenerFunction(this, this.tweenShip);
			this.tween1 = new TweenEach({scale:1, x: 0, y:0, ix: -500, iy:1150})
							.to({scale:3, x: -560, y:-2200, ix: -500, iy: 1500})
							.onUpdate(tweenShipBound)
							.delay(this.startFrame+792).start();


			var tweenInnerMaskBound = ListenerFunctions.createListenerFunction(this, this.tweenInnerMask);
			this.tween2 = new TweenEach({x: 300, y: 50, width:490, height: 2300})
							.to({x: -150, width:1500}, 200)
							.onUpdate(tweenInnerMaskBound)
							.delay(this.startFrame+964).start();

			var tweenInnerBound = ListenerFunctions.createListenerFunction(this, this.tweenInner);
			this.tween3 = new TweenEach({y: 1500})
							.to({y: 3200}, 400)
							.onUpdate(tweenInnerBound)
							.easing(TWEEN.Easing.Exponential.InOut)
							.delay(this.startFrame+2600).start();

			// ----------------------------
			// add to levels
			// ----------------------------
			this.level[0].addElement(this.smallship.container);
			this.level[0].addElement(this.seabg.container);
			this.level[0].addElement(this.seawave.container);
			this.level[1].addElement(this.shipinner.container);
			this.level[2].addElement(this.ship.container);
			this.level[3].addElement(this.radarboat.container);
			

		}

		// ----------------------------
		// all tweening funcitons
		// ----------------------------
		p.tweenSmallShip = function(e) {
				var smallship = this.smallship;
				var cObj = this.tween0.tweenVars();
				smallship.position(cObj.x, cObj.y);

		}

		p.tweenShip = function(e) {
				var ship = this.ship;
				var cObj = this.tween1.tweenVars();
				ship.scale(cObj.scale);
				ship.position(cObj.x, cObj.y);

				this.shipinner.yPos(cObj.iy);

		}

		p.tweenInnerMask = function(e) {
			var cObj = this.tween2.tweenVars();
			this.shipinner.mask(cObj.x, cObj.y, cObj.width, cObj.height);
		}

		p.tweenInner = function(e) {
			var cObj = this.tween3.tweenVars();
			this.shipinner.yPos(cObj.y);
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