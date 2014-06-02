(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;
	var ElSprite = ns.ElSprite;
	var ElRotatingSprite = ns.ElRotatingSprite;
	var ElEngine = ns.ElEngine;
	var scenedata = MKK.getNamespace('data').scenedata;

	if(!ns.ElOilrig) {

		var ElOilrig = function ElOilrig(sFrame, duration, x, y, z) {

			this.name = name;
			this.element = [];
			this.fan = [];
			this.container = new PIXI.DisplayObjectContainer();

			this.setup(sFrame, duration, x, y);

			this.z = z
			this.container.position = this.cPos;


		}	

		ns.ElOilrig = ElOilrig;

		var p = ElOilrig.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);

			this.addSprite('oilrig_01.png', 0,0,0, 0,0);
			this.addSprite('oilrig_02.png', 606,0,0, 0,0);
			this.addSprite('oilrig_03.png', 0,693,0, 0,0);
			this.addSprite('oilrig_04.png', 606,693,0, 0,0);
			this.addSprite('oilrig_05.png', 0,1073,0, 0,0);
			this.addSprite('oilrig_06.png', 606,1072,0, 0,0);

			this.addSprite('oilrig_wave.png', 150,1215,0, 0,0);
			this.addSprite('oilrig_wave.png', 1000,1640,0, 0,0);

			this.addFan(552,1290,0, 2000);
			this.addFan(1077,1290, 2000);

			this.element[7].rotate(0.75);

			this.needle = new ElSprite('oilrig_needle.png', 1067, 533, 0, 0.5, 0.5);
			this.container.addChild(this.needle.container);

			this.engine = new ElEngine(0,0, 500,598,0, true);
			this.engine.scale(0.6);
			this.engineShadow = new ElSprite('oilrig_engine_shadow.png', 501, 597, 0, 0.5, 0.5);

			this.container.addChild(this.engine.container);
			this.container.addChild(this.engineShadow.container);
							

		}

		p.open = function() {

		}

		p.addSprite = function(name, x, y, z, aX, aY) {
			var tmp = new ElSprite(name, x, y, z, aX, aY);
			this.element.push(tmp);
			this.container.addChild(tmp.container);
		}

		p.addFan = function(x, y, z, velo) {
			var tmp = new ElRotatingSprite('oilrig_fan_1.png', x, y, z, velo, 0.5, 0.5);
			tmp.start();
			this.fan.push(tmp);
			this.container.addChild(tmp.container);
		}

		p.update = function(frame) {
			this._update(frame);
			var cFrame = this.localCurFrame(frame);
		}

	}

})();
