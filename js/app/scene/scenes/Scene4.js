(function() {

	var ns = MKK.getNamespace('app.scene');
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var scenedata = MKK.getNamespace('data').scenedata;
	var styledata = MKK.getNamespace('data').styledata;
	var AbScene = ns.AbScene;

	var StaticLevel = ns.level.StaticLevel;
	var ElSprite = ns.element.ElSprite;
	var ElSpriteContainer = ns.element.ElSpriteContainer;
	var ElText = ns.element.ElText;
	var ElRect = ns.element.ElRect;
	var ElSeaBG = ns.element.ElSeaBG;
	var ElSeaWave = ns.element.ElSeaWave;
	var ElSeaFloor = ns.element.ElSeaFloor;
	var ElProductionRig = ns.element.ElProductionRig;
	var ElHelicopter = ns.element.ElHelicopter;
	var ElFpso = ns.element.ElFpso;
	var ElDescription= ns.element.ElDescription;

	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;


	if(!ns.Scene4) {

		var Scene4 = function Scene4() {

			this.tweenTime = {

				_completespeed: 8000,
				_speed: 500,
				_speed3: 4200,

				txtTime1: 1800,
				txtTime2: 3000,
				txtTime3: 5930,


				offsetMoveTime: 500
			};
		}


		ns.Scene4 = Scene4;

		var p = Scene4.prototype = new AbScene();

		//open when init is completed
		p.open = function() {

			var tT = this.tweenTime;

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
			this.seabg = new ElSeaBG('seabg', 1024,708, 0, 0,0,5120, 70);
			this.seawave = new ElSeaWave('seawave', 0, 708, 0, 0,0, 6144);

			// ----------------------------
			// create iceberg
			// ----------------------------
			//iceberg 1
			this.iceberg1 = new ElSprite("drilling_iceberg1.png", 0, 366, 0, 0, 0);
			this.iceberg2 = new ElSprite("drilling_iceberg2.png", 400, 349, 0, 0, 0);
			this.iceberg3 = new ElSprite("drilling_iceberg1.png", 2550, 366, 0, 0, 0);

			// ----------------------------
			// create helicopter
			// ----------------------------
			this.helicopter = new ElHelicopter(0, 4000, -400, 0)

			// ----------------------------
			// create helicopter
			// ----------------------------
			this.fpso = new ElFpso(0, 4000, 2770, 335, 0)

			// ----------------------------
			// create production rig
			// ----------------------------
			this.productionrig = new ElProductionRig(0, 4000, 1324, -40, 0);

			// ----------------------------
			// Add levels
			// ----------------------------	
			//back
			this.backlevel.addElement(this.iceberg1.container);
			//mid
			this.midlevel.addElement(this.productionrig.container);
			this.midlevel.addElement(this.helicopter.container);
			this.midlevel.addElement(this.fpso.container);

			//front		
			this.frontlevel.addElement(this.iceberg2.container);
			this.frontlevel.addElement(this.iceberg3.container);
			this.frontlevel.addElement(this.seabg.container);
			this.frontlevel.addElement(this.seawave.container);

			//text
			this.desc = new ElDescription ('Turbines', 'Excellent anti-oxdation and air release properties\n\nMobil Delvac 1™ 600\nMobil SHC™ 800\nMobil DTE™ 932 GT', '', 'blue', this.startFrame + tT.txtTime1, 1400, 100, 100, 0);
			this.txtlevel.addElement(this.desc.container);
			this.desc2 = new ElDescription ('Compressors', 'Outstanding cleanliness and reduced deposit formations\n\nMobil Rarus SHC™ 1020\nMobil Rarus™ 800\nMobil Pegasus™', '', 'blue', this.startFrame + tT.txtTime2, 1400, 100, 100, 0);
			this.txtlevel.addElement(this.desc2.container);
			this.desc3 = new ElDescription ('Deck Machinery', 'Swivel stacks, Cranes, Winches, Pumps and more\n\nMobil SHC™ 600\nMobil DTE 10 Excel™\nMobil SHC™\nMobil DTE™ Named\nMobil 375™ NC\nMobilarma™ 798', '', 'blue', this.startFrame + tT.txtTime3, 2200, 100, 50, 0);
			this.txtlevel.addElement(this.desc3.container);

			// ------------------------------------------------
			// Tween
			// ------------------------------------------------
			//move iscene lef to right
			var tween0Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0);
			this.tween0 = new TweenEach({x: 0})
							.to({x: -5120}, tT._completespeed)
							// .easing(TWEEN.Easing.Cubic.Out)
							.onUpdate(tween0Bound)
							.delay(this.startFrame + tT.offsetMoveTime).start();

			//move into scene, left
			var tween1Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc1);
			this.tween1 = new TweenEach({x: -400, y:100})
							.to({x: [500, 800, 1700, 2050], y:[100, 400, 80, 360] }, tT._speed3)
							// .easing(TWEEN.Easing.Cubic.Out)
							.interpolation( TWEEN.Interpolation.CatmullRom )
							.onUpdate(tween1Bound)
							.delay(this.startFrame).start();
		}


		//close when destroyed
		p.close = function() {

		}

		p.update = function(frame) {

			this._update(frame);
			var cFrame = this.localCurFrame(frame);

			this.backlevel.update(cFrame);
			this.midlevel.update(cFrame);
			this.frontlevel.update(cFrame);
			this.txtlevel.update(cFrame);
		}

		p.tweenFunc0 = function(e) {
			var cObj = this.tween0.tweenVars();
			this.frontlevel.xPos(cObj.x);
			this.midlevel.xPos(cObj.x*0.9);
			this.backlevel.xPos(cObj.x*0.8);
		}

		p.tweenFunc1 = function(e) {
			var cObj = this.tween1.tweenVars();
			// console.log(cObj.x, cObj.y)
			this.helicopter.position(cObj.x, cObj.y);
		}

	}

})();