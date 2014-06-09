(function() {

	var ns = MKK.getNamespace('app.scene');
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var scenedata = MKK.getNamespace('data').scenedata;
	var styledata = MKK.getNamespace('data').styledata;
	var AbScene = ns.AbScene;
	var settings = MKK.getNamespace('data').settings;
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


	if(!ns.Scene7) {

		var Scene7 = function Scene7() {

			this.buildings = [];
			this.tweenTime = {

				//speed
				_fast: 150,
				_speed: 250,
				_speed1: 500,
				_speed2: 750,

				//start time
				tween1Start: 750,
				tween2Start: 1000,
				tween3Start: 1500,
				tween4Start: 2000,
				tween5Start: 2250,
				tween6Start: 2700,

				//position
				tweenStartX0: 1024,
				tweenStartX1: -2000,
				tweenStartX2: 0,

				//road position
				roadX0: 1500,
				roadX1: -2500,

				//sea
				seaY0: 700,
				seaY1: 670,

				//truck
				truckX0: 100,
				truckX1: 2000,
				fronttruckX0: 512,
				fronttruckY0: 400,
				fronttruckY1: 340
			}

			this.buildingVars = [
				{x:0, y:0, type: 'house'}
			];
		}


		ns.Scene7 = Scene7;

		var p = Scene7.prototype = new AbScene();

		//open when init is completed
		p.open = function() {

			var tT = this.tweenTime;

			//mask bg
			this.maskbg = this.createMaskBG();
			this.maskbg.alpha = 0;
			this.container.addChild(this.maskbg);

			//back
			this.backlevel = new StaticLevel('staticsback');
			this.backlevel.setup(0, 0, 0);
			this.addLevel(this.backlevel);		

			//mid
			this.midlevel = new StaticLevel('staticsmid');
			this.midlevel.setup(0, 0, 0);
			this.addLevel(this.midlevel);	

			//this.trucklevel
			this.trucklevel = new StaticLevel('staticstruck');
			this.trucklevel.setup(0, 0, 0);
			this.addLevel(this.trucklevel);				
			//front
			this.frontlevel = new StaticLevel('staticsfront');
			this.frontlevel.setup(0, 0, 0);
			this.addLevel(this.frontlevel);		

			//fend
			this.endlevel = new StaticLevel('staticsend');
			this.endlevel.setup(0, 0, 0);
			this.addLevel(this.endlevel);			

			//big mountains
			this.backmountain1 = new ElSprite('mountain_lightgreen_big.png', 0, 200, 0, 0, 0);
			this.backmountain2 = new ElSprite('mountain_twin_small.png', 1022, 538, 0, 0, 0);
			this.backmountain3 = new ElSprite('mountain_twin_small.png', 1540, 538, 0, 0, 0);


			//back trees
			this.tree1 = this.createTree(200, 558, 1);
			this.tree2 = this.createTree(600, 600, 0.7);
			this.tree3 = this.createTree(750, 600, 0.7);
			this.tree4 = this.createTree(675, 600, 1);

			//front tree
			this.treelarge = new ElSprite('tree_big.png', 1650, 400, 0, 0);

			//ground
			this.floor = new ElSeaFloor('floor', 0, 708, 0, 0, 0, 900, 70);

			//road
			this.road = this.createRoad();

			//truckside
			this.trucksmall = new ElSprite('truck_01.png', tT.truckX0, 620, 0, 0);

			//small front mountains
			this.frontmountain1 = new ElSprite('mountain_lightgreen_mid.png', 100, 500, 0, 0, 0);
			this.frontmountain2 = new ElSprite('mountain_green_mid.png', 900, 500, 0, 0, 0);

			//town grass
			this.towngrass = this.createGrass();

			//front road
			this.frontroad = new ElSprite('road.png', 966, 693, 0.5, 0);
			this.frontroad.scale(1.5);

			//front truck
			this.fronttruck = new ElSprite('truck_02.png', tT.fronttruckX0, tT.fronttruckY0, 0, 0.5, 0);
			//sea 
			this.sea = this.createSea();

			//theend
			this.theend = new ElSprite('the_end.png', 512, 800, 0, 0.5, 0);

			// backlevel
			this.backlevel.addElement(this.backmountain1.container);
			this.backlevel.addElement(this.tree1.container);
			this.backlevel.addElement(this.tree2.container);
			this.backlevel.addElement(this.tree3.container);
			this.backlevel.addElement(this.sea);


			// midlevel
			this.midlevel.addElement(this.backmountain2.container);
			this.midlevel.addElement(this.backmountain3.container);
			this.midlevel.addElement(this.floor.container);
			this.midlevel.addElement(this.road);
			this.midlevel.addElement(this.towngrass);
			this.midlevel.addElement(this.frontroad.container);

			// trucklevel
			this.trucklevel.addElement(this.trucksmall.container);

			// frontlevel
			this.frontlevel.addElement(this.tree4.container);
			this.frontlevel.addElement(this.frontmountain1.container);
			this.frontlevel.addElement(this.frontmountain2.container);
			this.frontlevel.addElement(this.treelarge.container);
			this.frontlevel.addElement(this.fronttruck.container);

			//endlevel
			this.endlevel.addElement(this.fronttruck.container);
			this.endlevel.addElement(this.theend.container);

			this.maskCircle = this.createMask();

			this.container.addChild(this.maskCircle);



			// ------------------------------------------------
			// Tween
			// ------------------------------------------------
			//move into scene, left
			var tween0Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0);
			this.tween0 = new TweenEach({x: tT.tweenStartX0, roadx: tT.roadX0 })
							.to({x: tT.tweenStartX1, roadx: tT.roadX1 }, tT._speed2)
							// .easing(TWEEN.Easing.Cubic.Out)
							.onUpdate(tween0Bound)
							.delay(this.startFrame ).start();

			var tween1Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc1);
			this.tween1 = new TweenEach({x: tT.tweenStartX0, scale: 1, seay: tT.seaY0})
							.to({x: tT.tweenStartX1, scale: 0.6, seay: tT.seaY1}, tT._speed)
							.easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tween1Bound)
							.delay(this.startFrame + tT.tween1Start).start();

			var tween2Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc2);
			this.tween2 = new TweenEach({x: tT.truckX0})
							.to({x: tT.truckX1}, tT._speed1)
							.easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tween2Bound)
							.delay(this.startFrame + tT.tween2Start).start();

			var tween3Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc3);
			this.tween3 = new TweenEach({y: tT.fronttruckY0, scale: 1, maskscale:1})
							.to({y: tT.fronttruckY1, scale: 0.2, maskscale:0.12}, tT._speed1)
							.easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tween3Bound)
							.delay(this.startFrame + tT.tween3Start).start();

			var tween4Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc4);
			this.tween4 = new TweenEach({alpha:0})
							.to({alpha:1}, tT._fast)
							.easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tween4Bound)
							.delay(this.startFrame + tT.tween4Start).start();

			var tween5Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc5);
			this.tween5 = new TweenEach({y:800})
							.to({y:524}, tT._speed)
							.easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tween5Bound)
							.delay(this.startFrame + tT.tween5Start).start();

			var tween6Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc6);
			this.tween6 = new TweenEach({y:0})
							.to({y:-800}, tT._speed)
							.easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tween6Bound)
							.delay(this.startFrame + tT.tween6Start).start();

		}


		//close when destroyed
		p.close = function() {

		}

		p.update = function(frame) {
			
			this.__update(frame);
			var cFrame = this.localCurFrame(frame);		

			this.backlevel.update(cFrame);
			this.midlevel.update(cFrame);
			this.frontlevel.update(cFrame);

			if (cFrame>=1350) {
				this.fronttruck.show();
				this.maskCircle.visible = true;
				this.backlevel.container.mask = this.maskCircle;
				this.midlevel.container.mask = this.maskCircle;
				this.frontlevel.container.mask = this.maskCircle;
				this.maskbg.visible = true;
			}
			else {
				this.fronttruck.hide();
				this.maskCircle.visible = false;
				this.maskbg.visible = false;
				this.container.mask = null;
			}
		}

		// ------------------------------------------------
		// Tween func
		// ------------------------------------------------		
		p.tweenFunc0 = function(e) {
			cObj = this.tween0.tweenVars();
			this.backlevel.xPos(cObj.x*0.7);
			this.midlevel.xPos(cObj.x*0.2);
			this.frontlevel.xPos(cObj.x);
			this.road.position.x = cObj.roadx;
		}

		p.tweenFunc1 = function(e) {
			cObj = this.tween1.tweenVars();
			this.backlevel.scale(cObj.scale);
			this.midlevel.scale(cObj.scale);
			this.trucklevel.scale(cObj.scale);
			this.sea.position.y = cObj.seay;
		}

		p.tweenFunc2 = function(e) {
			cObj = this.tween2.tweenVars();
			this.trucksmall.xPos(cObj.x);

		}

		p.tweenFunc3 = function(e) {
			cObj = this.tween3.tweenVars();
			this.fronttruck.yPos(cObj.y);
			this.fronttruck.scale(cObj.scale);
			this.maskUpdateScale(cObj.maskscale);
		}

		p.tweenFunc4 = function(e) {
			cObj = this.tween4.tweenVars();
			this.maskbg.alpha = cObj.alpha;
		}

		p.tweenFunc5 = function(e) {
			cObj = this.tween5.tweenVars();
			this.theend.yPos(cObj.y)
		}

		p.tweenFunc6 = function(e) {
			cObj = this.tween6.tweenVars();
			this.yPos(cObj.y);
		}

		p.createTree = function(x, y, scale) {
			var tmp = new ElSprite('tree_small.png', x, y, 0, 0);
			tmp.scale(scale);
			return tmp;			
		}


		p.createSea = function() {
			var casing = new PIXI.Graphics();
			casing.clear();
			casing.beginFill(settings.defaultSeaLight, 1);
			casing.drawRect(0, 0, 3200, 70);
			casing.endFill();
			casing.position.x = 1300;
			casing.position.y = this.tweenTime.seaY0;	
			casing.alpha = 1;
			return casing;		
		}

		p.createRoad = function() {
			var casing = new PIXI.Graphics();
			casing.clear();
			casing.beginFill(settings.defaultRoadGreen, 1);
			casing.drawRect(0, -10, 6000, 80);
			casing.beginFill(settings.defaultRoadGrey, 1);
			casing.drawRect(0, 0, 6000, 20);
			casing.endFill();
			casing.position.x = 1000;
			casing.position.y = 708;	
			casing.alpha = 1;
			return casing;
		}

		p.createGrass = function() {
			var casing = new PIXI.Graphics();
			casing.clear();
			casing.beginFill(settings.defaultTownGreen, 1);
			casing.drawRect(0, -10, 3000, 800);
			casing.endFill();
			casing.position.x = 400;
			casing.position.y = 778;	
			casing.alpha = 1;
			return casing;			
		}

		p.createMask = function() {
			var casing = new PIXI.Graphics();
			casing.clear();
			casing.beginFill(settings.defaultRoadGreen, 1);
			casing.drawCircle(0, 0, 1300);
			casing.endFill();
			casing.position.x = 512;
			casing.position.y = 384;	
			casing.visible = false;
			return casing;			
		}

		p.createMaskBG = function() {
			var casing = new PIXI.Graphics();
			casing.clear();
			casing.beginFill(0xffffff, 1);
			casing.drawCircle(0, 0, 170);
			casing.beginFill(settings.defaultBGColor, 1);
			casing.drawCircle(0, 0, 156);
			casing.endFill();
			casing.position.x = 512;
			casing.position.y = 384;	
			casing.visible = true;
			return casing;				
		}

		p.maskUpdateScale = function(e) {
			this.maskCircle.scale.x = this.maskCircle.scale.y = e;
		}

		p.createBuildings = function() {
			var bArr = this.buildings;
			for (var i=0; i<bArr.length; i++) {

				var tmp;
				if (bArr[i].type=='house') tmp = new ElSprite('house.png', 1540, 538, 0, 0, 0);
				else new ElSprite('flat.png', 1540, 538, 0, 0, 0);

				this.buildings.push(tmp);
				this.midlevel.addElement(tmp.container);
			}
		}

	}

})();