(function(){

	var Rectangle = MKK.getNamespace('app.assets').Rectangle;
	var House = MKK.getNamespace('app.assets').House; 
	var Trees = MKK.getNamespace('app.assets').Trees; 
	var MountainGreen = MKK.getNamespace('app.assets').MountainGreen; 

	ns = MKK.getNamespace('app.scene');
	AScene = ns.AScene;



	if (!ns.SceneEnd) {

		var SceneEnd = function SceneEnd(wW, hH) {

			this.width = wW;
			this.height = hH;
			this.container = null;
			this.settings = {

			}
		}

		ns.SceneEnd = SceneEnd;

		var p = SceneEnd.prototype = new AScene();
		var s = AScene.prototype;

		p.setup = function() {

			s.setup();
			this.container = s.container;


		}

		p.destroy = function() {

		}

		p.init = function() {


			this.initLevel3();
			this.initLevel2();


			// for (var i=0; i<10; i++) {
			// 	this.tT = new Trees();
			// 	this.tT.init();
			// 	this.container.addChild(this.tT.small);
			// 	this.tT.small.position.x = 100+100*i;
			// 	this.tT.small.position.y = Math.floor(500*Math.random());				
			// }

			// for (var i=0; i<10; i++) {
			// 	this.hH = new House();
			// 	this.hH.init();
			// 	this.container.addChild(this.hH.small);
			// 	this.hH.small.position.x = 20+100*i;
			// 	this.hH.small.position.y = Math.floor(500*Math.random());
			// }

		}

		p.initLevel1 = function() {

		}

		p.initLevel2 = function() {
			this.level2 = new PIXI.DisplayObjectContainer();
			this.level2.position.x = 0;
			this.level2.position.y = 400;
			var l2House = PIXI.Sprite.fromFrame("sceneend_houses.png");
			l2House.position.x = 400;
			l2House.position.y = 0;

			var rect = new Rectangle(1024, 768, 0xaaaaaa);
			rect.init();
			this.level2.addChild(rect.container);
			this.level2.addChild(l2House);

			this.container.addChild(this.level2);
		}

		p.initLevel3 = function() {
			this.level3 = new PIXI.DisplayObjectContainer();
			this.level3.position.x = 0;
			this.level3.position.y = 300;

			var mM1 = new MountainGreen();
			mM1.init();
			mM1.small.position.x = 350;
			mM1.small.position.y = 0;
			this.level3.addChild(mM1.small);

			var mM2 = new MountainGreen();
			mM2.init();
			mM2.small.position.x = 500;
			mM2.small.position.y = 0;
			this.level3.addChild(mM2.small);

			this.container.addChild(this.level3);
		}
	}



})();