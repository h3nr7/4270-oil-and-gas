(function() {
	
	// ------------------------------------
	// LIBRARIES
	// ------------------------------------
	var ns = MKK.getNamespace('app.scene');
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var scenedata = MKK.getNamespace('data').scenedata;
	var styledata = MKK.getNamespace('data').styledata;
	var AbScene = ns.AbScene;

	var StaticLevel = ns.level.StaticLevel;
	// var Scene2Level = ns.level.Scene2Level;
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


	if(!ns.Scene5) {

		// ------------------------------------
		// CONSTRUCTOR
		// ------------------------------------
		var Scene5 = function Scene5() {

		}


		ns.Scene5 = Scene5;
		var p = Scene5.prototype = new AbScene();

		// ------------------------------------
		// FUNCTIONS
		// ------------------------------------
		//open when init is completed
		p.open = function() {


		}


		//close when destroyed
		p.close = function() {

		}

		p.update = function(frame) {

		}

	}

})();