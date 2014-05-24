(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;
	var ElSprite = ns.ElSprite;
	var ElRotatingSprite = ns.ElRotatingSprite;
	var scenedata = MKK.getNamespace('data').scenedata;

	if(!ns.ElShipInner) {

		var ElShipInner = function ElShipInner(sFrame, duration) {

			this.name = name;
			this.element = [];
			this.fan = [];
			this.gear = [];
			assetBG = [		"exploration_inner_bg_01.png",
							"exploration_inner_bg_02.png",
							"exploration_inner_bg_03.png",
							"exploration_inner_bg_04.png",
						];

			this.container = new PIXI.DisplayObjectContainer();

			this.setup(sFrame, duration, scenedata.scene2.element.shipInner.x, scenedata.scene2.element.shipInner.y);
			this.z = scenedata.scene2.element.shipInner.z;
			this.container.position = this.cPos;


		}	

		ns.ElShipInner = ElShipInner;

		var p = ElShipInner.prototype = new AbContainer();


		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);
			this.scale(1.6);

			//add BG
			this.addSprite("exploration_inner_bg_01.png", 0,0);
			this.addSprite("exploration_inner_bg_02.png", 654,0);
			this.addSprite("exploration_inner_bg_03.png", 0,699);
			this.addSprite("exploration_inner_bg_04.png", 654,699);


			this.hook = new ElSprite('engine_hook.png', 709, -54, 0, 0.5, 0);
			this.container.addChild(this.hook.container);

			//add gear
			this.addGear (674, 105, 0, 5000, 0.7);
			this.addGear (751, 98, 0, -5000, 0.8);

			//add fan
			this.addFan (545, 407, 0, 1000);
			this.addFan (545, 782, 0, 5000);
			this.addFan (545, 407, 0);
		

			var tweenHookBound = ListenerFunctions.createListenerFunction(this, this.tweenHook);
			this.tween0 = new TweenEach({x: 709, y: -54})
							.to({x: 709, y: 66}, 200)
							.easing(TWEEN.Easing.Exponential.InOut)
							.onUpdate(tweenHookBound)
							.delay(this.startFrame+10).start();

			var selfMove1Bound = ListenerFunctions.createListenerFunction(this, this.selfMove1);
			this.tween1 = new TweenEach({x: -500})
							.to({x: 0}, 500)
							.easing(TWEEN.Easing.Exponential.InOut)
							.onUpdate(selfMove1Bound)
							.delay(this.startFrame+200).start();

			var selfMove2Bound = ListenerFunctions.createListenerFunction(this, this.selfMove2);
			this.tween2 = new TweenEach({x: 0})
							.to({x: -656}, 600)
							.easing(TWEEN.Easing.Exponential.InOut)
							.onUpdate(selfMove2Bound)
							.delay(this.startFrame+800).start();

		}

		p.open = function() {

		}

		p.addSprite = function(name, x, y, z, aX, aY) {
			var tmp = new ElSprite(name, x, y, z, aX, aY);
			this.element.push(tmp);
			this.container.addChild(tmp.container);
		}

		p.addFan = function(x, y, z, velo) {
			var tmp = new ElRotatingSprite('engine_fan_2.png', x, y, z, velo, 0.5, 0.5);
			tmp.start();
			this.fan.push(tmp);
			this.container.addChild(tmp.container);
		}

		p.addGear = function(x, y, z, velo, scale) {
			var tmp = new ElRotatingSprite ('engine_gear_1.png', x, y, z, velo, 0.5, 0.5);
			tmp.scale(scale);
			tmp.start();
			this.gear.push(tmp);
			this.container.addChild(tmp.container);			
		}

		p.tweenHook = function(e) {
				var hook = this.hook;
				var cObj = this.tween0.tweenVars();
				hook.position(cObj.x, cObj.y);


		}

		p.selfMove1 = function(e) {
			var cObj = this.tween1.tweenVars();
			this.container.x = cObj.x;
		}

		p.selfMove2 = function(e) {
			var cObj = this.tween2.tweenVars();
			this.container.x = cObj.x;
		}

		p.update = function(frame) {
			this._update(frame);
			var cFrame = this.localCurFrame(frame);
		}

	}


})();