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

		var ElProductionRig = function ElProductionRig(sFrame, duration, x, y) {

			this.name = name;
			this.element = [];
			this.container = new PIXI.DisplayObjectContainer();

			this.setup(sFrame, duration, x, y);

			this.z = scenedata.scene2.element.radar.z;
			this.container.position = this.cPos;


		}	

		ns.ElProductionRig = ElProductionRig;

		var p = ElProductionRig.prototype = new AbContainer();

		p.setup = function(sFrame, duration, x, y) {

			this._setup(sFrame, duration, x, y);

			this.addSprite('productionrig_01.png', 0,0,0, 0,0);
			this.addSprite('productionrig_02.png', 602,0,0, 0,0);
			this.addSprite('productionrig_03.png', 0,693,0, 0,0);
			this.addSprite('productionrig_04.png', 602,693,0, 0,0);

		}

		p.open = function() {

		}

		p.addSprite = function(name, x, y, z, aX, aY) {
			var tmp = new ElSprite(name, x, y, z, aX, aY);
			this.element.push(tmp);
			this.container.addChild(tmp.container);
		}

	}

})();
