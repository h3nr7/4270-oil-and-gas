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


	if(!ns.Scene6) {

		var Scene6 = function Scene6() {

			this.tweenTime = {

				_completespeed: 3600
			}


		}


		ns.Scene6 = Scene6;

		var p = Scene6.prototype = new AbScene();

		//open when init is completed
		p.open = function() {

			var tT = this.tweenTime;

			//back
			this.backlevel = new StaticLevel('staticsback');
			this.backlevel.setup(0, 0, 0);
			this.addLevel(this.backlevel);		

			//mid2
			this.mid2level = new StaticLevel('staticsmid2');
			this.mid2level.setup(0, 0, 0);
			this.addLevel(this.mid2level);	

			//mid
			this.midlevel = new StaticLevel('staticsmid');
			this.midlevel.setup(0, 0, 0);
			this.addLevel(this.midlevel);	

			//front
			this.frontlevel = new StaticLevel('staticsfront');
			this.frontlevel.setup(0, 0, 0);
			this.addLevel(this.frontlevel);	

			//front
			this.txtlevel = new StaticLevel('staticstxt');
			this.txtlevel.setup(0, 0, 0);
			this.addLevel(this.txtlevel);		


			this.mountain1 = new ElSprite('mountain_blue_mid.png', 100, 505, 0, 0,0);
			this.mountain2 = new ElSprite('mountain_green_small.png', 0, 605, 0, 0,0);


			this.frontProp1 = new ElSprite('processing-front_07.png', 200, 480, 0, 0,0);
			this.frontProp2 = new ElSprite('processing-front_02.png', 400, 365, 0, 0,0);
			this.frontProp3 = new ElSprite('processing-front_05.png', 1100, 485, 0, 0,0);
			this.frontProp4 = new ElSprite('processing-front_09.png', 1500, 495, 0, 0,0);

			this.midProp1 = new ElSprite('processing-mid.png', 500, 340, 0, 0,0);
			this.midProp2 = new ElSprite('processing-mid2.png', 900, 405, 0, 0,0);
			this.midProp3 = new ElSprite('processing-mid.png', 1200, 340, 0, 0,0);

			this.mid2Prop1 = new ElSprite('processing-mid3.png', 350, 580, 0, 0,0);
			this.mid2Prop2 = new ElSprite('processing-mid3.png', 800, 620, 0, 0,0);

			this.backProp1 = new ElSprite('processing-back.png', 700, 475, 0, 0,0);
			this.backProp2 = new ElSprite('processing-back.png', 1100, 510, 0, 0,0);

			this.seafloor = new ElSeaFloor('seafloor', 0, 705, 0, 0, 0, 4096, 80);

			//description
			// this.desc = new ElDescription ('Turbine, compressors\nand other applications', 'Mobil Pegasus™\nMobiljet™ Oil\nMobil Rarus SHC™', '', 'blue', this.startFrame, 1000, 50, 50, 0);
			this.desc = new ElDescription ('Turbines', 'Mobil SHC™ 800\nMobil DTE™ 932 GT\nMobil DTE™ 800\n', '', 'blue', this.startFrame, 700, 50, 100, 0);
			this.desc2 = new ElDescription ('Compressors', 'Mobil Rarus SHC™ 1000\nMobil Rarus™ 800', '', 'blue', this.startFrame+500, 700, 50, 100, 0);
			this.desc3 = new ElDescription ('Pumps', 'Mobil SHC™ 100', '', 'blue', this.startFrame+1000, 700, 50, 100, 0);
			this.desc4 = new ElDescription ('Gears', 'Mobil SHC™ 600', '', 'blue', this.startFrame+1100, 700, 50, 200, 0);




			this.backlevel.addElement(this.mountain1.container);
			this.backlevel.addElement(this.mountain2.container);
			this.backlevel.addElement(this.backProp1.container);
			this.backlevel.addElement(this.backProp2.container);


			this.midlevel.addElement(this.midProp1.container);
			this.midlevel.addElement(this.midProp2.container);
			this.midlevel.addElement(this.midProp3.container);

			this.mid2level.addElement(this.mid2Prop1.container);
			this.mid2level.addElement(this.mid2Prop2.container);

			this.frontlevel.addElement(this.frontProp1.container);
			this.frontlevel.addElement(this.frontProp2.container);
			this.frontlevel.addElement(this.frontProp3.container);
			this.frontlevel.addElement(this.frontProp4.container);

			this.frontlevel.addElement(this.seafloor.container);

			this.txtlevel.addElement(this.desc.container);
			this.txtlevel.addElement(this.desc2.container);
			this.txtlevel.addElement(this.desc3.container);
			this.txtlevel.addElement(this.desc4.container);

			//move iscene lef to right
			var tween0Bound = ListenerFunctions.createListenerFunction(this, this.tweenFunc0);
			this.tween0 = new TweenEach({x: 1424})
							.to({x: -4700/*-5120*/}, tT._completespeed)
							// .easing(TWEEN.Easing.Cubic.Out)
							.onUpdate(tween0Bound)
							.delay(this.startFrame ).start();			


		}


		p.tweenFunc0 = function(e) {
			var cObj = this.tween0.tweenVars();
			this.backlevel.xPos(cObj.x*0.7);
			this.mid2level.xPos(cObj.x*0.8);
			this.midlevel.xPos(cObj.x*0.9);
			this.frontlevel.xPos(cObj.x);
		}

		//close when destroyed
		p.close = function() {

		}

		p.update = function(frame) {
			this.__update(frame);
			var cFrame = this.localCurFrame(frame);		

			this.backlevel.update(cFrame);
			this.midlevel.update(cFrame);
			this.mid2level.update(cFrame);
			this.frontlevel.update(cFrame);
			this.txtlevel.update(cFrame);				
		}

	}

})();