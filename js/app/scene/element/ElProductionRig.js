(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;
	var ElSprite = ns.ElSprite;
	var ElRotatingSprite = ns.ElRotatingSprite;
	var scenedata = MKK.getNamespace('data').scenedata;

	if(!ns.ElProductionRig) {

		var ElProductionRig = function ElProductionRig(sFrame, duration, x, y, z) {

			this.name = name;
			this.element = [];
			this.container = new PIXI.DisplayObjectContainer();

			this.setup(sFrame, duration, x, y);

			this.z = z;
			this.container.position = this.cPos;


		}	

		ns.ElProductionRig = ElProductionRig;

		var p = ElProductionRig.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);

			this.addSprite('productionrig-bg2.png', 0,0,0, 0,0);
			this.addSprite('productionrig-bg1.png', 400,210,0, 0,0);


			this.addSprite('productionrig_02.png', 0,320,0, 0,0);
			this.addSprite('productionrig_03.png', 204,320,0, 0,0);
			this.addSprite('productionrig_04.png', 407,320,0, 0,0);

			this.fan = new ElRotatingSprite('productionrig_fan.png', 154, 476, 0, 2000, 0.5, 0.5);
			this.fan.start();
			this.container.addChild(this.fan.container);

		}

		p.open = function() {

		}


	}

})();
