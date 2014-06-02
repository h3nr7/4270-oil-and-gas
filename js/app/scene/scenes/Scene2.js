(function() {

	var ns = MKK.getNamespace('app.scene');
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var scenedata = MKK.getNamespace('data').scenedata;
	var styledata = MKK.getNamespace('data').styledata;
	var AbScene = ns.AbScene;

	var StaticLevel = ns.level.StaticLevel;
	var Scene2Level = ns.level.Scene2Level;
	var ElSprite = ns.element.ElSprite;
	var ElSpriteContainer = ns.element.ElSpriteContainer;
	var ElText = ns.element.ElText;
	var ElRect = ns.element.ElRect;
	var ElSeaBG = ns.element.ElSeaBG;
	var ElSeaWave = ns.element.ElSeaWave;
	var ElSeaFloor = ns.element.ElSeaFloor;
	var ElOilCave = ns.element.ElOilCave;
	var ElShipInner = ns.element.ElShipInner;
	var ElRadarBoat = ns.element.ElRadarBoat;
	var ElRadarBoatSide = ns.element.ElRadarBoatSide;
	var ElDescription= ns.element.ElDescription;

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
			this.staticlevel = new StaticLevel('statictxt');
			this.staticlevel.setup(0, 0, 0);
			this.addLevel(this.staticlevel);

			this.desc = new ElDescription ('Gear Applications', 'Outstanding protection for gears opearting in extreme conditions\n\n Mobil SHC™ 600', '', 'white', this.startFrame+1500, 800, 50, 1800, 0);


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
			// create ship inner
			// ----------------------------
			this.shipinner = new ElShipInner(this.startFrame+1300, 8000);
			this.shipinner.mask(300, 40, 490, 2300);
			this.shipinner.showMask();

			// ----------------------------
			// create ship outer
			// ----------------------------			
			this.radarboat = new ElRadarBoat(0, 8000, 512, 3414);


			// ----------------------------
			// Sea and Cave
			// ----------------------------		
			this.seabg2 = new ElSeaBG('seabg', 0,4282,0,0,0, 1024, 1024);
			this.seawave2 = new ElSeaWave('seawave', 0, 4282,0,0,0, 1024, 1520);
			this.seafloor = new ElSeaFloor('seafloor', 0, 5582, 0,0,0, 1024, 120);
			this.oilcave = new ElOilCave('oilcave', 0,0, 0, 5682, 0,0);

			// ----------------------------
			// Sea and Cave
			// ----------------------------		
			this.radarboatside = new ElRadarBoatSide(0, 0, 200, 4462, 0 );			

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



			var tweenRadar1Bound = ListenerFunctions.createListenerFunction(this, this.tweenRadar1);
			this.tween4 = new TweenEach({y: 3414, scale:1, sy: 4282})
							.to({y: 4364, scale:0.3, sy: 4602}, 600)
							.onUpdate(tweenRadar1Bound)
							.delay(this.startFrame+4250).start();


			var tweenRadar2Bound = ListenerFunctions.createListenerFunction(this, this.tweenRadar2);
			this.tween5 = new TweenEach({y: -384})
							.to({y: -1400}, 560)
							.onUpdate(tweenRadar2Bound)
							.delay(this.startFrame+4940).start();

			var tweenRadar3Bound = ListenerFunctions.createListenerFunction(this, this.tweenRadar3);
			this.tween6 = new TweenEach({y: -1400})
							.to({y: -384}, 560)
							.onUpdate(tweenRadar3Bound)
							.delay(this.startFrame+5500).start();

			var tweenEndingBound = ListenerFunctions.createListenerFunction(this, this.tweenEnding);
			this.tween7 = new TweenEach({x: 0})
							.to({x: -1024}, 1000)
							.easing(TWEEN.Easing.Cubic.In)
							.onUpdate(tweenEndingBound)
							.delay(this.startFrame+6060).start();

			// ----------------------------
			// add to levels
			// ----------------------------
			this.level[0].addElement(this.smallship.container);
			this.level[0].addElement(this.seabg.container);
			this.level[0].addElement(this.seawave.container);
			this.level[1].addElement(this.shipinner.container);
			this.level[2].addElement(this.ship.container);
			this.level[3].addElement(this.seabg2.container);
			this.level[3].addElement(this.radarboat.container);
			this.level[3].addElement(this.seafloor.container);
			this.level[3].addElement(this.oilcave.container);
			this.level[3].addElement(this.radarboatside.container);

			this.level[3].addElement(this.seawave2.container);

			this.staticlevel.addElement(this.desc.container);

			

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

		p.tweenRadar1 = function(e) {
			var cObj = this.tween4.tweenVars();
			this.radarboat.yPos(cObj.y);
			this.radarboat.scale(cObj.scale);

			this.seabg2.yPos(cObj.sy);
			this.seawave2.yPos(cObj.sy);
		}

		p.tweenRadar2 = function(e) {
			var cObj = this.tween5.tweenVars();
			this.level[3].yPos(cObj.y);
			// this.level[3].yPos(cObj.y);
		}

		p.tweenRadar3 = function(e) {
			var cObj = this.tween6.tweenVars();
			this.level[3].yPos(cObj.y);
			// this.level[3].yPos(cObj.y);
		}

		p.tweenEnding = function(e) {
			var cObj = this.tween7.tweenVars();
			this.level[3].xPos(cObj.x);
		}

		//close when destroyed
		p.close = function() {

		}

		p.update = function(frame) {

			this._update(frame);
			var cFrame = this.localCurFrame(frame);


			if(cFrame>=0 && cFrame<3850) {
				this.show();
				this.cPos.y = -cFrame;
			}
			else {
				// this.hide();
			}

			if (cFrame>=611) {
				this.shipinner.show();
				this.level[1].show();
			}
			else {
				this.shipinner.hide();
				this.level[1].hide();
			}

			if(cFrame>=1320) {
				this.level[2].hide();
				this.level[3].show();
			}
			else {
				this.level[2].show();
				this.level[3].hide();
			}

			if(cFrame>=3850) {
				this.level[3].frameControlled(false);
				this.level[1].hide();
				this.radarboat.showTop();
			}
			else {
				this.level[3].frameControlled(true);
				this.level[1].show();
				this.radarboat.hideTop();
			}


			if(cFrame>=5180) {
				this.radarboatside.show();
				this.radarboat.hide();
			}
			else {
				this.radarboatside.hide();
				this.radarboat.show();
			}




			
			this.level[0].update(cFrame);
			this.level[1].update(cFrame);
			this.level[2].update(cFrame);
			this.level[3].update(cFrame);
			this.staticlevel.update(cFrame);
		}



	}




})();