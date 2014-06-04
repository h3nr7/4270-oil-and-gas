(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;
	var ElSprite = ns.ElSprite;
	var ElRotatingSprite = ns.ElRotatingSprite;
	var scenedata = MKK.getNamespace('data').scenedata;

	if(!ns.ElRadar) {

		var ElRadar = function ElRadar(sFrame, duration, x, y, isReverse, maskx, masky) {

			this.name = name;
			this.element = [];
			this._direction = isReverse? 1:0;
			this.maskx = maskx || -150;
			this.masky = masky || 237;
			this.container = new PIXI.DisplayObjectContainer();

			this.setup(sFrame, duration, x, y);

			this.z = scenedata.scene2.element.radar.z;
			this.container.position = this.cPos;


		}	

		ns.ElRadar = ElRadar;

		var p = ElRadar.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y, maskx, masky) {

			this._setup(sFrame, duration, x, y);

			this._radarSpeed = 1000;
			this._radarDelay = 1010;


			this.round0 = new ElSprite('sonar_bg1.png', 255, 255, 0, 0.5, 0.5);
			this.round1 = new ElSprite('sonar_bg1.png', 255, 255, 0, 0.5, 0.5);
			this.round2 = new ElSprite('sonar_bg1.png', 255, 255, 0, 0.5, 0.5);
			this.round3 = new ElSprite('sonar_bg1.png', 255, 255, 0, 0.5, 0.5);

			this.round0.scale(0);	
			this.round1.scale(0);
			this.round2.scale(0);
			this.round3.scale(0);

			this.container.addChild(this.round0.container);
			this.container.addChild(this.round1.container);
			this.container.addChild(this.round2.container);
			this.container.addChild(this.round3.container);

			//tween of circle 1
			var tweenRoundBound = ListenerFunctions.createListenerFunction(this, this.tweenRound);
			this.tween0 = new TWEEN.Tween({scale:0.8})
									.easing(TWEEN.Easing.Circular.InOut)
									.to({ scale: 1 }, this._radarSpeed)
									.onUpdate(tweenRoundBound)
									.onComplete(function(){ console.log('lala');this.round0.scale(0.2); });

			//tween of circle 2
			var tweenRound2Bound = ListenerFunctions.createListenerFunction(this, this.tweenRound2);
			this.tween2 = new TWEEN.Tween({scale:1})
									.easing(TWEEN.Easing.Circular.InOut)
									.to({ scale: 0.8 }, this._radarSpeed)
									.onUpdate(tweenRound2Bound);
							
			//tween of circle 3
			var tweenRound4Bound = ListenerFunctions.createListenerFunction(this, this.tweenRound4);
			this.tween4 = new TWEEN.Tween({scale:1})
									.easing(TWEEN.Easing.Circular.InOut)
									.to({ scale: 0.8 }, this._radarSpeed)
									.onUpdate(tweenRound4Bound);

			//tween of circle 4
			var tweenRound6Bound = ListenerFunctions.createListenerFunction(this, this.tweenRound6);
			this.tween6 = new TWEEN.Tween({scale:1})
									.easing(TWEEN.Easing.Circular.InOut)
									.to({ scale: 0.8 }, this._radarSpeed)
									.onUpdate(tweenRound6Bound);



			this.tween0.repeat(1000).delay(this._radarDelay*2).start();	

			this.tween2.repeat(1000).delay(this._radarDelay*2).start();	

			this.tween4.repeat(1000).delay(this._radarDelay*2).start();	

			this.tween6.repeat(1000).delay(this._radarDelay*2).start();	

			this.masker = this.createMask(this.maskx, this.masky, 830, 384);
			this.container.addChild(this.masker);

			this.container.mask = this.masker;
							

		}

		p.open = function() {

		}

		p.addSprite = function(name, x, y, z, aX, aY) {
			var tmp = new ElSprite(name, x, y, z, aX, aY);
			this.element.push(tmp);
			this.container.addChild(tmp.container);
		}

		p.update = function(frame) {
			this._update(frame);
			var cFrame = this.localCurFrame(frame);
		}

		p.tweenRound = function(e) {
			var sS = Math.abs(e-this._direction);
			this.round0.scale(sS*0.2);
		}

		p.tweenRound2 = function(e) {
			var sS = Math.abs(e-this._direction);
			this.round1.scale(sS*0.3 + 0.2);
		}


		p.tweenRound4 = function(e) {
			var sS = Math.abs(e-this._direction);
			this.round2.scale(sS*0.5 + 0.5);
		}

		p.tweenRound6 = function(e) {
			var sS = Math.abs(e-this._direction);
			this.round3.scale(sS*0.5 + 1);
			this.round3.opacity(1-sS);
		}

		p.createMask = function(x, y, wW, hH) {
			var casing = new PIXI.Graphics();
			casing.clear();
			casing.beginFill(0x333333, 1);
			casing.drawRect(0, 0, wW, hH);
			casing.endFill();
			casing.position.x = x;
			casing.position.y = y;	
			return casing;			
		}

	}

})();
