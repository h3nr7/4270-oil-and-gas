(function() {

	var ns = MKK.getNamespace('app.scene');
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var scenedata = MKK.getNamespace('data').scenedata;
	var styledata = MKK.getNamespace('data').styledata;
	var AbScene = ns.AbScene;

	var Scene1Level = ns.level.Scene1Level;
	var Scene2Level = ns.level.Scene2Level;
	var ElSprite = ns.element.ElSprite;
	var ElSpriteContainer = ns.element.ElSpriteContainer;
	var ElText = ns.element.ElText;
	var ElRect = ns.element.ElRect;
	var ElSeaBG = ns.element.ElSeaBG;
	var ElSeaWave = ns.element.ElSeaWave;
	var ElRotatingSprite = ns.element.ElRotatingSprite;

	//test element classes
	var ElShipInner = ns.element.ElShipInner;
	var ElRadar = ns.element.ElRadar;
	var ElRadarBoat = ns.element.ElRadarBoat;


	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;


	if(!ns.TestElement) {

		var TestElement = function TestElement() {

		}


		ns.TestElement = TestElement;

		var p = TestElement.prototype = new AbScene();

		//open when init is completed
		p.open = function() {

			//test the shipinner class
			this.createLevels(scenedata.scene2.level, Scene2Level);
			// this.shipinner = new ElShipInner(0, 3000);

			//test the radar class
			// this.radar = new ElRadar(0, 3000, 100,100, true);	
			// this.radar2 = new ElRadar(0, 3000, 300, 500);	

			this.radarboat = new ElRadarBoat(0,3000, 512, 396);	


			// ----------------------------
			// add to levels
			// ----------------------------
			// this.level[1].addElement(this.shipinner.container);
			// this.level[1].addElement(this.radar.container);
			// this.level[1].addElement(this.radar2.container);
			this.level[1].addElement(this.radarboat.container);
			

		}



		//close when destroyed
		p.close = function() {

		}

		p.update = function(frame) {

			this._update(frame);
			var cFrame = this.localCurFrame(frame);

			if(cFrame>=0 && cFrame<this.duration) {
				// this.show();
				this.cPos.y = -cFrame;
			}
			
			this.level[0].update(cFrame);
			// this.level[1].update(cFrame);
			// this.level[2].update(cFrame);
		}

	}




})();