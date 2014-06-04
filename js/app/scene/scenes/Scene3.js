(function() {

	var ns = MKK.getNamespace('app.scene');
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var scenedata = MKK.getNamespace('data').scenedata;
	var styledata = MKK.getNamespace('data').styledata;
	var AbScene = ns.AbScene;

	var Scene1Level = ns.level.Scene1Level;
	var StaticLevel = ns.level.StaticLevel;
	var ElSprite = ns.element.ElSprite;
	var ElSpriteContainer = ns.element.ElSpriteContainer;
	var ElText = ns.element.ElText;
	var ElRect = ns.element.ElRect;
	var ElGrowRect = ns.element.ElGrowRect;
	var ElSeaBG = ns.element.ElSeaBG;
	var ElSeaWave = ns.element.ElSeaWave;
	var ElSeaFloor = ns.element.ElSeaFloor;
	var ElSeaBed = ns.element.ElSeaBed;
	var ElOilCave = ns.element.ElOilCave;
	var ElEngine = ns.element.ElEngine;
	var ElOilrig = ns.element.ElOilrig;
	var ElOilHole = ns.element.ElOilHole;
	var ElSeaWave = ns.element.ElSeaWave;
	var ElRadarBoatSide = ns.element.ElRadarBoatSide;
	var ElRotatingSprite = ns.element.ElRotatingSprite;

	//test element classes
	var ElDescription= ns.element.ElDescription;


	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;


	if(!ns.Scene3) {

		var Scene3 = function Scene3() {

			this.tweenTime= {

				_speed: 250,
				_speed2: 500,
				_speed3: 750, 
				tween1Start: 800,
				tween2Start: 1550,
				tween3Start: 2400,
				tween4Start: 3200,
				tween5Start: 4200,
				tween6Start: 5200,
				startX0: 1024,
				startY0: 50,
				scale0: 1,
				orX0: 0,
				orY0: 0,
				waveX0: 0,
				waveY0: 825,
				moveX1: 250,
				moveX2: -500,
				moveY2: 50,
				moveX3: -600,
				moveY3: -250,
				moveX4: 500,
				moveY4: 500,
				moveX6: -1024,
				scale4: 0.3,
				orX4: 850,
				orY4: 384,
				waveX1: 0,
				waveY1: 457,
				moveY5: -1650,

				drill1Start: 3960
			}

			this.txtTime = {

				txt1Start: 200,
				txt2Start: 1050,
				txt3Start: 1750,
				txt4Start: 2630
			}
		}


		ns.Scene3 = Scene3;

		var p = Scene3.prototype = new AbScene();

		//open when init is completed
		p.open = function() {


			//tweenTIme
			var tTime = this.tweenTime;
			var txtTime = this.txtTime;

			//sea bg level
			this.seabglevel = new StaticLevel('staticseabg');
			this.seabglevel.setup(0, 0, 0);
			this.addLevel(this.seabglevel);					

			//create levels
			this.staticlevel = new StaticLevel('statictxt');
			this.staticlevel.setup(tTime.startX0, tTime.startY0, 0);
			this.addLevel(this.staticlevel);

			//sea wave level
			this.wavelevel = new StaticLevel('staticwave');
			this.wavelevel.setup(0, 0, 0);
			this.addLevel(this.wavelevel);	

			//text level
			this.txtlevel = new StaticLevel('statictxt');
			this.txtlevel.setup(0, 0, 0);
			this.addLevel(this.txtlevel);		


			//create seabg
			this.seabg = new ElSeaBG('seabg', tTime.waveX0, tTime.waveY0,0,0,0, 1024, 1024);
			this.seafloor = new ElSeaFloor('seafloor', 0, 1484, 0,0,0, 1024, 1200);
			this.seabed = new ElSeaBed(0,0, 0, 1484,0, 1024);
			this.oilcave = new ElOilCave('oilcave', 0,0, 0, 1994, 0,0);
			this.oilhole = new ElOilHole('oilhole', 0,0, -5, 1484, 0,0)

			//iceberg 1
			this.iceberg = new ElSpriteContainer('iceberg', 0, 0, 0, 0, 0);
			this.iceberg.addSprite("drilling_iceberg1.png", 0, tTime.waveY0);

			this.seabglevel.addElement(this.seabg.container);
			this.seabglevel.addElement(this.seabed.container);
			this.seabglevel.addElement(this.seafloor.container);
			this.seabglevel.addElement(this.oilcave.container);
			this.seabglevel.addElement(this.iceberg.container);
			this.seabglevel.addElement(this.oilhole.container);

			//create oilrig
			this.oilrig = new ElOilrig(0,5000, 0, 0, 0 );
			this.staticlevel.addElement(this.oilrig.container)

			this.seawave = new ElSeaWave('seawave', tTime.waveX0, tTime.waveY0,0,0,0, 1024, 1520 );
			this.wavelevel.addElement(this.seawave.container);
			// this.wavelevel.addElement(this.oilrig.container);
			

			//txt
			this.desc = new ElDescription ('Engines', 'Mobil Delvac 1™ 600\nMobil Delvac MX™ 600\nMobil Pegasus™', '', 'blue', this.startFrame+txtTime.txt1Start, 800, 50, 400, 0);
			this.txtlevel.addElement(this.desc.container);

			this.desc2 = new ElDescription ('Top Drive', 'Mobil SHC™ 600\nMobil SHC™ Gear\nMobil DTE 10 EXCEL™', '', 'blue', this.startFrame+txtTime.txt2Start, 800, 470, 70, 0);
			this.txtlevel.addElement(this.desc2.container);

			this.desc3 = new ElDescription ('Mud Pumps', 'Mobil SHC™ Gear\nMobil Polyrex™ EM', '', 'blue', this.startFrame+txtTime.txt3Start, 800, 600, 240, 0);
			this.txtlevel.addElement(this.desc3.container);

			this.desc4 = new ElDescription ('Positioning Thruster', 'Mobil SHC™ 600\nMobilgear™ 600XP', '', 'white', this.startFrame+txtTime.txt4Start, 800, 630, 500, 0);
			this.txtlevel.addElement(this.desc4.container);

			// ------------------------------------------------
			// Tween main scene
			// ------------------------------------------------
			//move into scene, left
			var tweenStartingBound = ListenerFunctions.createListenerFunction(this, this.tweenStarting);
			this.tween0 = new TweenEach({x: tTime.startX0, y: tTime.startY0})
							.to({x: tTime.moveX1}, tTime._speed)
							.easing(TWEEN.Easing.Cubic.Out)
							.onUpdate(tweenStartingBound)
							.delay(this.startFrame).start();

			//move to right
			var tweenMove1Bound = ListenerFunctions.createListenerFunction(this, this.tweenMove1);
			this.tween1 = new TweenEach({x: tTime.moveX1})
							.to({x: tTime.moveX2}, tTime._speed)
							.easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tweenMove1Bound)
							.delay(this.startFrame + tTime.tween1Start).start();

			//move to lower right
			var tweenMove2Bound = ListenerFunctions.createListenerFunction(this, this.tweenMove2);
			this.tween2 = new TweenEach({x: tTime.moveX2, y: tTime.moveY2})
							.to({x: tTime.moveX3, y: tTime.moveY3}, tTime._speed)
							.easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tweenMove2Bound)
							.delay(this.startFrame + tTime.tween2Start).start();

			//zoom out full view with sea
			var tweenMove3Bound = ListenerFunctions.createListenerFunction(this, this.tweenMove3);
			this.tween3 = new TweenEach({
								x: tTime.moveX3, y: tTime.moveY3, 
								orX: tTime.orX0, orY: tTime.orY0, 
								wX: tTime.waveX0, wY: tTime.waveY0,
								scale: tTime.scale0})
							.to({
								x: tTime.moveX4, y: tTime.moveY4, 
								orX: tTime.orX4, orY: tTime.orY4, 
								wX: tTime.waveX1, wY: tTime.waveY1,
								scale: tTime.scale4
							}, tTime._speed)
							.easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tweenMove3Bound)
							.delay(this.startFrame + tTime.tween3Start).start();

			//move bottom of seabed
			var tweenMove4Bound = ListenerFunctions.createListenerFunction(this, this.tweenMove4);
			this.tween4 = new TweenEach({y: 0})
							.to({y: tTime.moveY5}, tTime._speed3)
							// .easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tweenMove4Bound)
							.delay(this.startFrame + tTime.tween4Start).start();	


			//move back top
			var tweenMove5Bound = ListenerFunctions.createListenerFunction(this, this.tweenMove5);
			this.tween5 = new TweenEach({y: tTime.moveY5})
							.to({y: 0}, tTime._speed3)
							// .easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tweenMove5Bound)
							.delay(this.startFrame + tTime.tween5Start).start();

			//move out of screen
			var tweenMove6Bound = ListenerFunctions.createListenerFunction(this, this.tweenMove6);
			this.tween6 = new TweenEach({x: 0})
							.to({x: tTime.moveX6}, tTime._speed)
							.easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tweenMove6Bound)
							.delay(this.startFrame + tTime.tween6Start).start();



			// ----------------------------
			//Drill and hole Tweens
			// ----------------------------
			//move drill away
			var tweenDrill1Bound = ListenerFunctions.createListenerFunction(this, this.tweenDrill1);
			this.drillTween1 = new TweenEach({y: 0})
							.to({y: 1}, tTime._speed)
							// .easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tweenDrill1Bound)
							.delay(this.startFrame + tTime.drill1Start).start();	
		}


		//close when destroyed
		p.close = function() {
			
		}

		p.update = function(frame) {

			this.seabglevel.update(frame);
			this.staticlevel.update(frame);
			this.wavelevel.update(frame);

			if (frame>=4260) {
				this.oilrig.hide();
				this.iceberg.show();
			}
			else {
				this.oilrig.show();
				this.iceberg.hide();
			}
		}

		// ----------------------------
		// TWEENING
		// ----------------------------
		p.tweenStarting = function(e) {
			var cObj = this.tween0.tweenVars();
			this.staticlevel.position(cObj.x, cObj.y);
		}

		p.tweenMove1 = function(e) {
			var cObj = this.tween1.tweenVars();
			this.staticlevel.xPos(cObj.x);
		}

		p.tweenMove2 = function(e) {
			var cObj = this.tween2.tweenVars();
			this.staticlevel.position(cObj.x, cObj.y);
			this.oilrig.updateNeedle(0.4*e);
		}

		p.tweenMove3 = function(e) {
			var cObj = this.tween3.tweenVars();
			// this.staticlevel.position(cObj.x, cObj.y);
			this.oilrig.scale(cObj.scale);
			this.oilrig.position(cObj.orX, cObj.orY);
			this.seawave.yPos(cObj.wY);
			this.seabg.yPos(cObj.wY);
			this.iceberg.yPos(cObj.wY - 1166);
		}

		p.tweenMove4 = function(e) {
			var cObj = this.tween4.tweenVars();
			this.yPos(cObj.y);
			this.oilrig.updateDrill(e);
			this.oilrig.updateWire(e);
		}

		p.tweenMove5 = function(e) {
			var cObj = this.tween5.tweenVars();
			this.yPos(cObj.y);
		}

		p.tweenMove6 = function(e) {
			var cObj = this.tween6.tweenVars();
			this.xPos(cObj.x);
		}

		//drill tweening
		p.tweenDrill1 = function(e) {
			this.oilrig.updateWire(1-e);
			this.oilrig.updateDrill(1-e);
		}
	}

})();