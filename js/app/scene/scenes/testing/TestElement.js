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
	var ElGrowRect = ns.element.ElGrowRect;
	var ElSeaBG = ns.element.ElSeaBG;
	var ElSeaWave = ns.element.ElSeaWave;
	var ElSeaFloor = ns.element.ElSeaFloor;
	var ElSeaBed = ns.element.ElSeaBed;
	var ElOilCave = ns.element.ElOilCave;
	var ElEngine = ns.element.ElEngine;
	var ElOilrig = ns.element.ElOilrig;
	var ElProductionRig = ns.element.ElProductionRig;
	var ElRadarBoatSide = ns.element.ElRadarBoatSide;
	var ElFpso = ns.element.ElFpso;
	var ElHelicopter = ns.element.ElHelicopter;
	var ElRotatingSprite = ns.element.ElRotatingSprite;
	var ElDrill = ns.element.ElDrill;

	//test element classes
	var ElShipInner = ns.element.ElShipInner;
	var ElRadar = ns.element.ElRadar;
	var ElRadarBoat = ns.element.ElRadarBoat;
	var ElDescription= ns.element.ElDescription;


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
			this.shipinner = new ElShipInner(0, 3000);

			//test the radar class
			this.radar = new ElRadar(0, 3000, 100,100, true);	
			this.radar2 = new ElRadar(0, 3000, 300, 500);	

			this.radarboat = new ElRadarBoat(0,3000, 512, 396);	

			this.seafloor = new ElSeaFloor('seafloor', 0, 4282, 0,0,0, 1024, 1024);

			this.oilcave = new ElOilCave('oilcave', 0,0, 0, 200, 0,0);

			this.radarboatside = new ElRadarBoatSide(0 ,0 ,0 ,0 );
			// this.desc = new ElDescription ('Propulsion &\nThrusters™', 'some very long description', '', '', 0, 800, 200, 700, 0);

			// this.desc2 = new ElDescription ('Testing &\nMe™', 'some very long description', '', 'white', 100, 800, 200, 1000, 0, 200, 700, 200);



			this.oilrig = new ElOilrig(0,0, 0,0,0, 0,0 );

			this.productionrig = new ElProductionRig(0,0, 0,0,0, 0,0);

			this.fpso = new ElFpso(0,0, 0,200,0, 0,0);

			this.helicopter = new ElHelicopter(0,0, 0,200,0, 0,0);

			this.seabed = new ElSeaBed(0,0, 0, 200,0, 1024);

			this.drill = new ElDrill(0,0, 200, 200, 0);
			this.drill.scale(0.6);

			// this.gRect = new ElGrowRect (200, 200, 0, 20, 200, 300, 20, 10, 100, 0xf1345e);
			// ----------------------------
			// add to levels
			// ----------------------------
			// this.level[1].addElement(this.shipinner.container);
			// this.level[1].addElement(this.radar.container);
			// this.level[1].addElement(this.radar2.container);
			// this.level[1].addElement(this.desc.container);
			// this.level[1].addElement(this.desc2.container);
			// this.level[1].addElement(this.radarboat.container);
			// this.level[1].addElement(this.seafloor.container);
			// this.level[1].addElement(this.oilcave.container);
			// this.level[1].addElement(this.radarboatside.container);
			// this.level[1].addElement(this.gRect.container);

			// this.level[1].addElement(this.oilrig.container);
			// this.level[1].addElement(this.productionrig.container);
			// this.level[1].addElement(this.fpso.container);
			// this.level[1].addElement(this.helicopter.container);
			// this.level[1].addElement(this.seabed.container);
			this.level[1].addElement(this.drill.container);



			

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
			this.level[1].update(cFrame);
			// this.level[2].update(cFrame);
		}

	}




})();