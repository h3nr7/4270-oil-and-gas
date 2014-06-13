(function(){

	var MathBase = MKK.getNamespace('mkk.math').MathBase;
	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;
	var ElSprite = ns.ElSprite;
	var scenedata = MKK.getNamespace('data').scenedata;

	if(!ns.ElPipe) {

		var ElPipe = function ElPipe(sFrame, duration, x, y, z) {

			this.name = name;
			this.element = [];
			this.container = new PIXI.DisplayObjectContainer();

			this.setup(sFrame, duration, x, y);

			this.z = z;
			this.container.position = this.cPos;


		}	

		ns.ElPipe = ElPipe;

		var p = ElPipe.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);


			this.slope = this.createStraight(0, 21, 300, 9);
			this.slope2 =  this.createStraight(304, 21, 300, 9);
			this.slope3 =  this.createStraight(600, 21, 2325, 9);
			this.slope3.rotation = -0.52;

			this.slope4 =  this.createStraight(2600, -1125, 505, 9);
			this.addSprite('pipe-main-joint.png', 3090, -1115,0, 0,1);

			this.addSprite('pipe-meter.png', 299,30,0, 0,1);
			this.addSprite('underwater-cross-black.png', 0,140,0, 0,1);
			this.addSprite('pipe-joint.png', -2,34,0, 0,1);

		

			this.container.addChild(this.slope);
			this.container.addChild(this.slope2);
			this.container.addChild(this.slope3);
			this.container.addChild(this.slope4);
			

		}

		p.open = function() {

		}

		p.createStraight = function(x, y, w, h) {
			var casing = new PIXI.Graphics();
			casing.clear();
			casing.beginFill(0x000000, 1);
			casing.drawRect(0, 0, w, h);
			casing.endFill();
			casing.position.x = x;
			casing.position.y = y;	
			return casing;			
		}


	}

})();
