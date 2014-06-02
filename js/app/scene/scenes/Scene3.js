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
	var ElOilCave = ns.element.ElOilCave;
	var ElEngine = ns.element.ElEngine;
	var ElOilrig = ns.element.ElOilrig;
	var ElRadarBoatSide = ns.element.ElRadarBoatSide;
	var ElRotatingSprite = ns.element.ElRotatingSprite;

	//test element classes
	var ElDescription= ns.element.ElDescription;


	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;


	if(!ns.Scene3) {

		var Scene3 = function Scene3() {
			this.tweenTime= {

				_speed: 500,
				tween1Start: 1674,
				tween2Start: 2700,
				startX0: 1024,
				startY0: 50,
				moveX1: 250,
				moveX2: -500,
				moveX3: -600,
				moveY3: 200
			}
		}


		ns.Scene3 = Scene3;

		var p = Scene3.prototype = new AbScene();

		//open when init is completed
		p.open = function() {


			//create levels
			this.staticlevel = new StaticLevel('statictxt');
			this.staticlevel.setup(0, 0, 0);
			this.addLevel(this.staticlevel);

			//tweenTIme
			var tTime = this.tweenTime;

			//create oilrig
			console.log(tTime.startX0)
			this.oilrig = new ElOilrig(0,5000, 0, tTime.startY0, 0 );
			this.staticlevel.addElement(this.oilrig.container)

			
			//move into scene
			var tweenStartingBound = ListenerFunctions.createListenerFunction(this, this.tweenStarting);
			this.tween0 = new TweenEach({x: tTime.startX0})
							.to({x: tTime.moveX1}, tTime._speed)
							.easing(TWEEN.Easing.Cubic.In)
							.onUpdate(tweenStartingBound)
							.delay(this.startFrame).start();

			var tweenMove1Bound = ListenerFunctions.createListenerFunction(this, this.tweenMove1);
			this.tween1 = new TweenEach({x: tTime.moveX1})
							.to({x: tTime.moveX2}, tTime._speed)
							.easing(TWEEN.Easing.Cubic.InOut)
							.onUpdate(tweenMove1Bound)
							.delay(this.startFrame + tTime.tween1Start).start();
		}


		//close when destroyed
		p.close = function() {
			
		}

		p.update = function(frame) {

			this.staticlevel.update(frame);
		}

		// ----------------------------
		// TWEENING
		// ----------------------------
		p.tweenStarting = function(e) {
			var cObj = this.tween0.tweenVars();
			this.staticlevel.xPos(cObj.x);
		}

		p.tweenMove1 = function(e) {
			var cObj = this.tween1.tweenVars();
			this.staticlevel.xPos(cObj.x);
		}

	}

})();