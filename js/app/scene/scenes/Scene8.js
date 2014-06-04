(function() {

	var ns = MKK.getNamespace('app.scene');
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var scenedata = MKK.getNamespace('data').scenedata;
	var styledata = MKK.getNamespace('data').styledata;
	var AbScene = ns.AbScene;

	var StaticLevel = ns.level.StaticLevel;
	var Scene2Level = ns.level.Scene2Level;
	var ElSprite = ns.element.ElSprite;
	var ElSpriteContainer = ns.element.ElSpriteContainer;
	var ElText = ns.element.ElText;
	var ElRect = ns.element.ElRect;
	var ElSeaBG = ns.element.ElSeaBG;
	var ElSeaWave = ns.element.ElSeaWave;
	var ElSeaFloor = ns.element.ElSeaFloor;
	var ElOilCave = ns.element.ElOilCave;
	var ElShipInner = ns.element.ElShipInner;
	var ElRadarBoat = ns.element.ElRadarBoat;
	var ElRadarBoatSide = ns.element.ElRadarBoatSide;
	var ElDescription= ns.element.ElDescription;

	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;


	if(!ns.Scene8) {

		var Scene8 = function Scene8() {

		}


		ns.Scene8 = Scene8;

		var p = Scene8.prototype = new AbScene();

		//open when init is completed
		p.open = function() {

			//back
			this.level1 = new StaticLevel('level1');
			this.level1.setup(0, 0, 0);
			this.addLevel(this.level1);	

			//strapline1
			this.strap1 = new 

			this.level1.addElement()

		}


		//close when destroyed
		p.close = function() {

		}

		p.update = function(frame) {
			this._update(frame);
			var cFrame = this.localCurFrame(frame);

			this.level1.update(cFrame);

		}

	}

})();