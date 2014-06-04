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
	var ElSeaBed = ns.element.ElSeaBed;
	var ElOilCave = ns.element.ElOilCave;
	var ElShipInner = ns.element.ElShipInner;
	var ElRadarBoat = ns.element.ElRadarBoat;
	var ElRadarBoatSide = ns.element.ElRadarBoatSide;
	var ElDescription= ns.element.ElDescription;
	var ElRadar = ns.element.ElRadar;

	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;


	if(!ns.Scene2) {

		var Scene2 = function Scene2() {


			this.txtLevel = [];
		}


		ns.Scene2 = Scene2;

		var p = Scene2.prototype = new AbScene();

		// ==============================================================
		// override setup for some silly hacky shit from earlier
		// FIX LATER IF TIME ALLOWS!!!
		// ==============================================================
		p.init = function(stage) {

			this._init();
			this.stage = stage;
			this.stage.addChild(this.container);
			this.stage.addChild(this.txtContainer);

			this.open();
		}
		p._setup = function(sFrame, duration, x, y) {

			this._preSetup(x, y);

			this.container = new PIXI.DisplayObjectContainer();
			this.txtContainer = new PIXI.DisplayObjectContainer();
			this.container.position = this.oPos.clone();
			this.txtContainer.position = this.oPos.clone();
			this.startFrame = sFrame;
			this.duration = duration;	

		}

		p.addTxtLevel = function(oLevel) {
			this.txtContainer.addChild(oLevel.container);
			this.txtLevel.push(oLevel);
		}
		// ==============================================================


		//open when init is completed
		p.open = function() {

			this.createLevels(scenedata.scene2.level, Scene2Level);
			this.staticlevel = new StaticLevel('statictxt');
			this.staticlevel.setup(0, 0, 0);
			this.addTxtLevel(this.staticlevel);

			this.desc = new ElDescription ('Gear Applications', 'Outstanding protection for gears opearting in extreme conditions\n\nMobil SHC™ 600\nMobilgear™ Gear\nMobil SHC™ 600XP', '', 'white', this.startFrame+1380, 1000, 50, 50, 0);
			this.desc2 = new ElDescription ('Engines', 'Advanced engine cleaniness and extended oil drain intervals\n\nMobil Gard™ SHC\nMobil Delvac 1™\nMobil Delvac 1™ 600\nMobilGard™ M\nMobilGard™ HSD', '', 'white', this.startFrame+1950, 1000, 50, 300, 0);
			this.desc3 = new ElDescription ('Propulsion &\nThrusters', 'Excellent load carrying and anti-wear properties\n\nMobil SHC™ Gear\nMobil DTE 10 Excel™', '', 'white', this.startFrame+3700, 1000, 342, 280, 0);


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
			// radar
			// ----------------------------

			this.radar1 = new ElRadar(this.startFrame + 4250, 750, 256, 4362, false);
			this.radar2 = new ElRadar(this.startFrame + 4250, 750, 400, 4392, true, false, 207);

			this.radarpuller = new ElSpriteContainer('radarpuller', 0, 0, 0, 0, 0);
			this.radarpuller.addSprite('radar-line.png', 512,4282, 0.5, 0.5);
			this.radarpuller.addSprite('radar-large.png', 512,5062, 0.5, 0.5);

			// ----------------------------
			// Sea and Cave
			// ----------------------------		
			this.seabg2 = new ElSeaBG('seabg', 0,4282,0,0,0, 1024, 1024);
			this.seawave2 = new ElSeaWave('seawave', 0, 4282,0,0,0, 1024, 1520);
			this.seabed = new ElSeaBed(0,0, 0, 5582,0, 1024);
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
							.easing(TWEEN.Easing.Cubic.Out)
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
							.delay(this.startFrame+5690).start();

			var tweenRadar3Bound = ListenerFunctions.createListenerFunction(this, this.tweenRadar3);
			this.tween6 = new TweenEach({y: -1400})
							.to({y: -384}, 560)
							.onUpdate(tweenRadar3Bound)
							.delay(this.startFrame+6250).start();

			var tweenEndingBound = ListenerFunctions.createListenerFunction(this, this.tweenEnding);
			this.tween7 = new TweenEach({x: 0})
							.to({x: -1024}, 1000)
							.easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tweenEndingBound)
							.delay(this.startFrame+6810).start();


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
			this.level[3].addElement(this.seabed.container);
			this.level[3].addElement(this.seafloor.container);
			this.level[3].addElement(this.oilcave.container);
			this.level[3].addElement(this.radarboatside.container);

			this.level[3].addElement(this.seawave2.container);

			//add radar
			this.level[3].addElement(this.radar1.container);
			this.level[3].addElement(this.radar2.container);
			this.level[3].addElement(this.radarpuller.container);


			// element of static text
			this.staticlevel.addElement(this.desc.container);
			this.staticlevel.addElement(this.desc2.container);
			this.staticlevel.addElement(this.desc3.container);

			

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

			if (cFrame>=4850 && cFrame<6200) {
				this.radar1.show();
			}
			else {
				this.radar1.hide();
			}


			if(cFrame>=6200) {
				this.radarboatside.show();
				this.radarboat.hide();
				this.radar2.show();
			}
			else {
				this.radarboatside.hide();
				this.radarboat.show();
				this.radar2.hide();
			}




			
			this.level[0].update(cFrame);
			this.level[1].update(cFrame);
			this.level[2].update(cFrame);
			this.level[3].update(cFrame);
			this.staticlevel.update(cFrame);
		}



	}




})();