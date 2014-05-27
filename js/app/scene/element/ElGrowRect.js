(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var AbElement = MKK.getNamespace('app.scene').AbElement;
	var settings = MKK.getNamespace('data').settings;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;

	if(!ns.ElGrowRect) {

		var ElGrowRect = function ElGrowRect(x, y, z, width, height, toWidth, toHeight, sFrame, duration, color) {

			this.width = width;
			this.height = height;
			this.toWidth = toWidth;
			this.toHeight = toHeight;
			this.startFrame = sFrame;
			this.duration = duration;

			this.z = z;
			this.setup(x, y);
			this.container = new PIXI.Graphics();
			this.color = color;

			this.container.beginFill(this.color);
			// graphics.lineStyle(5, 0xFF0000);
			this.container.drawRect(this.cPos.x, this.cPos.y, this.width, this.height);
			this.container.endFill();
			console.log('lala');



		}

		ns.ElGrowRect = ElGrowRect;

		var p = ElGrowRect.prototype = new AbElement();


		p.setup = function(x, y) {

			p._setup(x, y);

			var tweenRectBound = ListenerFunctions.createListenerFunction(this, this.tweenRect);
			this.tween0 = new TweenEach({width: this.width, height: this.height})
							.to({width: this.toWidth, height: this.toHeight}, this.duration)
							.easing(TWEEN.Easing.Exponential.InOut)
							.onUpdate(tweenRectBound)
							.delay(this.startFrame).start();
		}

		p.update = function() {

		}

		p.tweenRect = function(e) {
			var cObj = this.tween0.tweenVars();
			this.container.clear();
			this.container.beginFill(this.color);
			// graphics.lineStyle(5, 0xFF0000);
			this.container.drawRect(this.cPos.x, this.cPos.y, cObj.width, cObj.height);
			this.container.endFill();		
		}









	}


})();