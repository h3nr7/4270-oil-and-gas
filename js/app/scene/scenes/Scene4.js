(function() {
	
	// ------------------------------------
	// LIBRARIES
	// ------------------------------------
	var ns = MKK.getNamespace('app.scene');
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var data =  MKK.getNamespace('data');
	var scenedata = data.scenedata;
	var styledata = data.styledata;
	var copydata = data.copydata;
	var AbScene = ns.AbScene;

	var StaticLevel = ns.level.StaticLevel;
	var ElSprite = ns.element.ElSprite;
	var ElSpriteContainer = ns.element.ElSpriteContainer;
	var ElText = ns.element.ElText;
	var ElRect = ns.element.ElRect;
	var ElSeaBG = ns.element.ElSeaBG;
	var ElSeaWave = ns.element.ElSeaWave;
	var ElSeaBed = ns.element.ElSeaBed;
	var ElSlope = ns.element.ElSlope;
	var ElSeaFloor = ns.element.ElSeaFloor;
	var ElSeaFloor = ns.element.ElSeaFloor;
	var ElProductionRig = ns.element.ElProductionRig;
	var ElPipe = ns.element.ElPipe;
	var ElHelicopter = ns.element.ElHelicopter;
	var ElSubmarine = ns.element.ElSubmarine;
	var ElFpso = ns.element.ElFpso;
	var ElDescription= ns.element.ElDescription;

	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;


	if(!ns.Scene4) {

		// ------------------------------------
		// CONSTRUCTOR
		// ------------------------------------
		var Scene4 = function Scene4() {

			this.tweenTime = {

				_completespeed: 3122 /*4000*/,
				_speed: 250,
				_speed2: 750,
				_speed3: 2100,

				txtTime1: 1200,
				txtTime2: 1660,
				txtTime3: 2965,
				txtTime4: 5600,

				dropTime: 1730,

				helicopterFromXPos:-400,
				helicopterFromYPos:100,
				helicopterToXPos:[500, 800, 1700, 2050],
				helicopterToYPos:[100, 400, 80, 360],


				delayStartTime: 500, 
				movementStartTime: 750,
				rigParallaxTime:  780,
				offsetMoveTime: 500,
				movedownStartTime: 3120,
				moveSubStartTime: 3500,
				moveLandStartTime: 4250,

				tweenInY0: -1905,
				tweenInY1: 0
			};
		}


		ns.Scene4 = Scene4;
		var p = Scene4.prototype = new AbScene();

		// ------------------------------------
		// FUNCTIONS
		// ------------------------------------
		//open when init is completed
		p.open = function() {

			var tT = this.tweenTime;
			var copies = copydata.scene4;

			//back
			this.backlevel = new StaticLevel('staticsback');
			this.backlevel.setup(0, 0, 0);
			this.addLevel(this.backlevel);		

			//mid
			this.midlevel = new StaticLevel('staticsmid');
			this.midlevel.setup(0, 0, 0);
			this.addLevel(this.midlevel);	

			//front
			this.frontlevel = new StaticLevel('staticsfront');
			this.frontlevel.setup(0, 0, 0);
			this.addLevel(this.frontlevel);	

			//front
			this.txtlevel = new StaticLevel('staticstxt');
			this.txtlevel.setup(0, 0, 0);
			this.addLevel(this.txtlevel);		

			// ----------------------------
			// create sea
			// ----------------------------
			this.seabg = new ElSeaBG('seabg', 1024,708, 0, 0,0,4096, 70);
			this.seawave = new ElSeaWave('seawave', 0, 708, 0, 0,0, 8041);

			this.seabg2 = new ElSeaBG('seabg', 4596,708, 0, 0,0,3496, 1524);
			this.seabed = new ElSeaBed(0,0, 4690, 1800, 0, 4096);
			this.seafloor = new ElSeaFloor('seafloor', 4556, 1800, 0, 0, 0, 3072, 80);

			// ----------------------------
			// create slope and sign
			// ----------------------------
			this.seaslope = new ElSlope(0,6000, 6144, 1510, 0, 1974);
			this.sign = new ElSprite('processing-sign.png', 8280, 350, 0.5, 1);
			this.pipe = new ElPipe(0, 5000, 5500, 1740, 0);


			// ----------------------------
			// create smallrig
			// ----------------------------
			this.smallrig = new ElSprite("small-rig.png", 255, 254, 0, 0, 0);

			// ----------------------------
			// create iceberg
			// ----------------------------
			//iceberg 1
			this.iceberg1 = new ElSprite("drilling_iceberg1.png", 0, 370, 0, 0, 0);
			this.iceberg2 = new ElSprite("drilling_iceberg2.png", 400, 353, 0, 0, 0);
			this.iceberg3 = new ElSprite("drilling_iceberg1.png", 2550, 370, 0, 0, 0);

			// ----------------------------
			// create helicopter
			// ----------------------------
			this.helicopter = new ElHelicopter(0, 4000, -400, 0)

			// ----------------------------
			// create helicopter
			// ----------------------------
			this.fpso = new ElFpso(0, 4000, 2770, 340, 0)

			// ----------------------------
			// create production rig
			// ----------------------------
			this.productionrig = new ElProductionRig(0, 4000, 1324, -40, 0);

			// ----------------------------
			// create sub
			// ----------------------------
			this.submarine = new ElSubmarine(0,3000, 6200, 1200, 0);

			// ----------------------------
			// create cross
			// ----------------------------
			this.cross1 = new ElSprite("underwater-cross-blue.png", 4800, 1630, 0, 0, 0);
			this.cross2 = new ElSprite("underwater-cross-blue.png", 5300, 1630, 0, 0, 0);
			this.cross3 = new ElSprite("underwater-cross-blue.png", 5900, 1640, 0, 0, 0);

			// ----------------------------
			// fpso sign
			// ----------------------------		
			this.fpsosign = new ElSprite("fpso-sign.png", 4880, 200, 0, 0,0);
			this.fpsomover = new ElSprite("fpso-mover.png",4965, 498, 0,0);
			this.fpsomask = this.createMask(4870, 523, 230, 2000);
			this.fpsosign.container.mask = this.fpsomask;

			// ----------------------------
			// Add levels
			// ----------------------------	
			//back
			this.backlevel.addElement(this.iceberg1.container);
			this.backlevel.addElement(this.smallrig.container);

			//mid
			this.midlevel.addElement(this.productionrig.container);
			this.midlevel.addElement(this.helicopter.container);
			this.midlevel.addElement(this.fpso.container);

			//front		
			this.frontlevel.addElement(this.seabg.container);
			this.frontlevel.addElement(this.seabg2.container)
			this.frontlevel.addElement(this.seabed.container);

			this.frontlevel.addElement(this.cross1.container);
			this.frontlevel.addElement(this.cross2.container);
			this.frontlevel.addElement(this.cross3.container);

			this.frontlevel.addElement(this.seafloor.container);

			this.frontlevel.addElement(this.seaslope.container);
			this.frontlevel.addElement(this.pipe.container);
			this.frontlevel.addElement(this.sign.container);
			// this.frontlevel.addElement(this.seaslope2.container);
			// this.frontlevel.addElement(this.seaslope3.container);
			// this.frontlevel.addElement(this.seaslope4.container);

			this.frontlevel.addElement(this.fpsosign.container);
			this.frontlevel.addElement(this.fpsomask);
			
			this.frontlevel.addElement(this.fpsomover.container);
			this.frontlevel.addElement(this.iceberg2.container);
			this.frontlevel.addElement(this.iceberg3.container);
			this.frontlevel.addElement(this.seawave.container);

			this.frontlevel.addElement(this.submarine.container);

			//text
			this.desc = new ElDescription (copies.desc1.title, copies.desc1.txt, '', copies.desc1.color, this.startFrame + tT.txtTime1, 700, 100, 50, 0);
			this.txtlevel.addElement(this.desc.container);
			this.desc2 = new ElDescription (copies.desc2.title, copies.desc2.txt, '', copies.desc2.color, this.startFrame + tT.txtTime2, 700, 100, 50, 0);
			this.txtlevel.addElement(this.desc2.container);
			this.desc3 = new ElDescription (copies.desc3.title, copies.desc3.txt, '', copies.desc3.color, this.startFrame + tT.txtTime3, 1500, 100, 50, 0);
			this.txtlevel.addElement(this.desc3.container);
			this.desc4 = new ElDescription (copies.desc4.title, copies.desc4.txt, '', copies.desc4.color, this.startFrame + tT.txtTime4, 700, 50, 300, 0);
			this.txtlevel.addElement(this.desc4.container);
			// ------------------------------------------------
			// Tween
			// ------------------------------------------------

			var tweenInBound = ListenerFunctions.createListenerFunction(this, this.tweenInFunc);
			var tweenInStartBound = ListenerFunctions.createListenerFunction(this, this.tweenInFuncStart);
			var tweenInEndBound = ListenerFunctions.createListenerFunction(this, this.tweenInFuncEnd);
			this.tweenIn = new TweenEach({y: tT.tweenInY0})
							.to({ y:tT.tweenInY1 }, tT._speed2)
							.onStart(tweenInStartBound)
							.onComplete(tweenInEndBound)
							.onUpdate(tweenInBound)
							.delay(this.startFrame).start();


			//move iscene lef to right
			var tween0Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0);
			var tween0StartBound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0Start);
			var tween0EndBound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0End);
			this.tween0 = new TweenEach({x: 0})
							.to({x: -4700/*-5120*/}, tT._completespeed)
							// .easing(TWEEN.Easing.Cubic.Out)
							.onUpdate(tween0Bound)
							.delay(this.startFrame + tT.movementStartTime + tT.delayStartTime)
							.onStart(tween0StartBound)
							.onComplete(tween0EndBound).start();

			//move down
			var tween0bStartBound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0bStart);
			var tween0bBound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0b);
			var tween0bEndBound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0bEnd);
			this.tween0b = new TweenEach({y:0, ry: 200})
							.to({y: -1100, ry: 950}, tT._speed2)
							.onStart(tween0Bound)
							.onUpdate(tween0bBound)
							.onComplete(tween0Bound)
							.delay(this.startFrame + tT.movementStartTime + tT.delayStartTime + tT.movedownStartTime).start();

			var tweenSubBound = ListenerFunctions.createListenerFunction(this, this.tweenSubFunc);
			this.tweensub = new TweenEach({x: 6200})
							.to({x: 5080}, 500)
							.easing(TWEEN.Easing.Cubic.Out)
							.onStart(tweenSubBound)
							.onUpdate(tweenSubBound)
							.onComplete(tweenSubBound)
							.delay(this.startFrame + tT.movementStartTime + tT.delayStartTime + tT.moveSubStartTime).start();	

			var tweenLandBound = ListenerFunctions.createListenerFunction(this, this.tweenLandFunc);
			this.tweenland = new TweenEach({x:-4700, y: -1100})
							.to({x:[-6500, -6500, -7092], y:[-1100, -1100, 50] }, 750)
							.interpolation( TWEEN.Interpolation.Bezier)
							.onUpdate(tweenLandBound)
							.easing(TWEEN.Easing.Cubic.InOut)
							.delay(this.startFrame + tT.movementStartTime + tT.delayStartTime + tT.moveLandStartTime).start();

			var tweenLandEndBound = ListenerFunctions.createListenerFunction(this, this.tweenLandEndFunc);
			this.tweenlandend = new TweenEach({x: -7092})
							.to({x: -8692}, 605+330)
							.onUpdate(tweenLandEndBound)
							.delay(this.startFrame + tT.movementStartTime + tT.delayStartTime + tT.moveLandStartTime + 750).start();

			//move into scene, left
			var tween1Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc1);
			this.tween1 = new TweenEach({x: tT.helicopterFromXPos, y:tT.helicopterFromYPos})
							.to({x: tT.helicopterToXPos, y: tT.helicopterToYPos }, tT._speed3)
							// .easing(TWEEN.Easing.Cubic.Out)
							.interpolation( TWEEN.Interpolation.CatmullRom )
							.onUpdate(tween1Bound)
							.delay(this.startFrame + tT.movementStartTime).start();

			var tween2Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc2);
			this.tween2 = new TweenEach({x: 0})
							.to({x: 1 }, 1700)
							// .easing(TWEEN.Easing.Cubic.Out)
							.onUpdate(tween2Bound)
							.delay(this.startFrame + tT.movementStartTime + tT.rigParallaxTime).start()

		
		}


		//close when destroyed
		p.close = function() {

		}

		p.update = function(frame) {

			this.__update(frame);
			var cFrame = this.localCurFrame(frame);

			var tT = this.tweenTime;

			this.backlevel.update(cFrame);
			this.midlevel.update(cFrame);
			this.frontlevel.update(cFrame);
			this.txtlevel.update(cFrame);

			if (cFrame<=tT.dropTime) {
				this.helicopter.showSign();
			}
			else {
				this.helicopter.hideSign();
			}
		}

		// ------------------------------------------------
		// TWEEN FUNCTIONS
		// ------------------------------------------------

		p.tweenInFuncStart = function(e) {
			this.yPos(this.tweenTime.tweenInY0);
			console.log('me in', this.yPos());
		}

		p.tweenInFunc = function(e) {
			var cObj = this.tweenIn.tweenVars();
			this.yPos(cObj.y);
		}

		p.tweenInFuncEnd = function(e) {
			var cObj = this.tweenIn.tweenVars();
			this.yPos(0);
			console.log('me out', this.yPos());
		}


		p.tweenFunc0Start = function(e) {
			this.frontlevel.xPos(0);
			this.midlevel.xPos(0);
			this.backlevel.xPos(0);			
		}
		p.tweenFunc0 = function(e) {
			var cObj = this.tween0.tweenVars();
			this.frontlevel.xPos(cObj.x);
			this.midlevel.xPos(cObj.x*0.9);
			this.backlevel.xPos(cObj.x*0.8);
		}
		p.tweenFunc0End = function(e) { 
			this.frontlevel.xPos(-4700);
			this.midlevel.xPos(-4700*0.9);
			this.backlevel.xPos(-4700*0.8);	
		}

		p.tweenFunc0bStart = function(e) {
			this.frontlevel.yPos(cObj.y);
			this.midlevel.yPos(cObj.y);
			this.backlevel.yPos(cObj.y);
			this.fpsosign.yPos(cObj.ry);
		}

		p.tweenFunc0b = function(e) {
			var cObj = this.tween0b.tweenVars();
			this.frontlevel.yPos(cObj.y);
			this.midlevel.yPos(cObj.y);
			this.backlevel.yPos(cObj.y);
			this.fpsosign.yPos(cObj.ry);
		}

		p.tweenFunc0bEnd = function(e) {

		}

		p.tweenFunc1 = function(e) {
			var cObj = this.tween1.tweenVars();
			// console.log(cObj.x, cObj.y)
			this.helicopter.position(cObj.x, cObj.y);
		}

		p.tweenSubFunc = function(e) {
			var cObj = this.tweensub.tweenVars();
			this.submarine.xPos(cObj.x);
			this.submarine.rotateLight(e);
		}

		p.tweenLandFunc = function(e) {
			var cObj = this.tweenland.tweenVars();
			this.frontlevel.position(cObj.x, cObj.y);
			// this.midlevel.position(cObj.x*0.9, cObj.y);
		}

		p.tweenLandEndFunc = function(e) {
			var cObj = this.tweenlandend.tweenVars();
			this.frontlevel.xPos(cObj.x);
		}

		p.tweenFunc2 = function(e) {
			this.productionrig.parallaxing(e);
		}

		p.createMask = function(x, y, w, h) {
			var casing = new PIXI.Graphics();
			casing.clear();
			casing.beginFill(0xcccccc, 1);
			casing.drawRect(0, 0, w, h);
			casing.endFill();
			casing.position.x = x;
			casing.position.y = y;	
			return casing;			
		}

	}

})();