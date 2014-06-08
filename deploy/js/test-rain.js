(function() {

	var Core = MKK.getNamespace('mkk.core').Core;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var Trackpad = MKK.getNamespace('mkk.event').Trackpad;
	var AssetsLoader = MKK.getNamespace('app.loader').AssetsLoader;
	var Navi = MKK.getNamespace('app.scene').Navi;
	var ns = MKK.getNamespace('app.scene');
	var Scene2 = MKK.getNamespace('app.scene').Scene2;
	var Scroller = MKK.getNamespace('app.event').Scroller;
	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var AbScene = MKK.getNamespace('app.scene').AbScene;
	var StaticLevel = MKK.getNamespace('app.scene.level').StaticLevel;

	if(!ns.rainy) {

		var SceneRainy = function SceneRainy() {

		}

		ns.SceneRainy = SceneRainy;

		var p = SceneRainy.prototype = new AbScene();

		//open when init is completed
		p.open = function() {


			this.staticlevel = new StaticLevel('statictxt');
			this.staticlevel.setup(0, 0, 0);
			this.container.addChild(this.staticlevel.container);

			this.numRain = 1000;
			this.rainArr = [];
			for(var i=0; i<this.numRain; i++) {
				var xX = Math.random() * 1500;
				var yY = -400 - Math.random() *-300;
				var size = 0.2 + Math.random() * 0.8;
				var velo = 7 + 5 * Math.random();
				var tmp = this.staticlevel.addSprite("rain-drop.png", xX, yY, 0.5, 0.5);
				tmp.rotate(0.06);
				tmp.scale(size);
				this.rainArr[i] = { ox: xX, oy: yY, sprite: tmp, speed: velo };

			}
			

			// this.staticlevel.addElement(this.raindrop);



		}


		//close when destroyed
		p.close = function() {

		}

		p.update = function(frame) {

		}

		p.animate = function() {

			// if(this.rainArr)
				// console.log(this.rainArr[1]);

			for(var i=0; i<this.numRain; i++) {

				if(this.rainArr[i].sprite.yPos()<-200 || this.rainArr[i].sprite.yPos()>768) {
					this.rainArr[i].sprite.hide();
				}
				else {
					this.rainArr[i].sprite.show();
				}

				if(this.rainArr[i].sprite.yPos()<=768) {
					var ty = this.rainArr[i].sprite.yPos()+(this.rainArr[i].speed);

					var yRatio = ty/768
					var tx = this.rainArr[i].sprite.xPos() - (2);

					this.rainArr[i].sprite.position(tx, ty);
				}
				else {
					this.rainArr[i].sprite.position(this.rainArr[i].ox, this.rainArr[i].oy);
				}
			}			
		}


	}
})();

(function(){

	var Core = MKK.getNamespace('mkk.core').Core;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var Trackpad = MKK.getNamespace('mkk.event').Trackpad;
	var AssetsLoader = MKK.getNamespace('app.loader').AssetsLoader;
	var Navi = MKK.getNamespace('app.scene').Navi;
	var ns = MKK.getNamespace('app');
	var Scene2 = MKK.getNamespace('app.scene').Scene2;
	var Scroller = MKK.getNamespace('app.event').Scroller;
	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var AbScene = MKK.getNamespace('app.scene').AbScene;
	var SceneRainy = MKK.getNamespace('app.scene').SceneRainy;


	if(!ns.app) {

		var App = function() {
			//some variatble
			this.isDebug = true;
			this.loaded = false;
		}

		ns.App = App;

		var p = App.prototype = new Core();
		var s = Core.prototype;

		p.setup = function() {

			// --------------------------------------------------
			// Setup
			// --------------------------------------------------	
			this._setup();


			// --------------------------------------------------
			// PIXI Stage
			// --------------------------------------------------			
			this.stage = new PIXI.Stage(0xe7e7e7);
			// create a renderer instance.
			this.renderer = new PIXI.CanvasRenderer(1024, 768);
			this.renderer.roundPixels = true;
			// add the renderer view element to the DOM
			document.body.appendChild(this.renderer.view);


			// --------------------------------------------------
			// Navigator
			// --------------------------------------------------	
			this.navi = new Navi();
			document.body.appendChild(this.navi.view);

			// --------------------------------------------------
			// SCROLLER Setup
			// --------------------------------------------------
			this.scroller = new Scroller();
			this.scroller.setup(this.renderer.view);
			// ------------------

			if (this.isDebug) this.debug();

			//setup scenes
			this.rainy = new SceneRainy();
			this.rainy.setup(0, 5000/*695*/, 0, 0);

			this.loadFonts();
		}

		p.init = function() {
			console.log('init test-rain');

			this.stage.addChild(this.rainy.container);

			this.rainy.init(this.stage);
		}


        p.loadFonts = function() {

        	var fontLoadingBound = ListenerFunctions.createListenerFunction(this, this.fontLoading);
            var fontActiveBound = ListenerFunctions.createListenerFunction(this, this.fontActive);
        	WebFont.load({
	            custom: {
	                families: ['EMPrintW01-light', 'EMPrintW01-regular', 'EMPrintW01-semibold'],
	                urls: ['css/main.css']
	            },
	            loading: fontLoadingBound,
	            active: fontActiveBound,
	            //inactive: function() {console.log('webfont loading')},
				//fontloading: function(familyName, fvd) {console.log('webfont loading')},
				//fontactive: function(familyName, fvd) {console.log('webfont loading')},
				//fontinactive: function(familyName, fvd) {console.log('webfont loading')}
        	});
        }

       p.fontLoading = function() {
       		//TODO
       		console.log('Web font loading');
       }

       p.fontActive = function() {
			//TODO
       		console.log('Web font Active');
       		this.load();
       }


		p.load = function() {

			assetsToLoader = [
				"assets/global.json",
				"assets/scene1.json",
				"assets/scene2.json",
				"assets/scene2b.json",
				"assets/scene2c.json",
				"assets/scene3.json",
				"assets/scene3b.json",
				"assets/scene4.json",
				"assets/scene5.json",
				"assets/scene6.json",
				"assets/scene7.json",
				"assets/scene8.json",
			];

			loader = new PIXI.AssetLoader(assetsToLoader);
			PIXI.scaleModes.DEFAULT = PIXI.scaleModes.LINEAR;
			// PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
			// use callback
			var that = this;
			loadComplete = function() { that.loadComplete() };
			loader.onComplete = loadComplete;
			//begin load
			loader.load();
		}

		p.loadComplete = function() {
			this.loaded = true;
			console.log('load complete');
			this.init();
		}


		p.update = function() {

			if (!this.loaded) return;
			//scene update
			var frame = this.scroller.getDistance();
			FrameTween.update(frame);
			TWEEN.update();
			
			this.rainy.update(frame);
			this.rainy.animate();

			this.scroller.update();
		}


		p.render = function() {

			if (!this.loaded) return;

			this.stats.begin();
			//render code starts here
			this.update();


			this.renderer.render(this.stage);

			//render code ends here
			this.stats.end();
		}


		//debugger
		p.debug = function() {	

			this.gui = new dat.GUI({ autoPlace: false });

			this.stats = new Stats();
			var dEle = this.stats.domElement;
			dEle.style.position = 'absolute';
			dEle.style.right = '0px';
			dEle.style.bottom = '0px';

			this.gui.domElement.style.position = 'absolute';
			this.gui.domElement.style.right = '10px';
			this.gui.domElement.style.top = '46px';

			document.body.appendChild(this.stats.domElement);
			document.body.appendChild(this.gui.domElement);

			//add debugger for other libs
			this.scroller.debug(this.gui);
		}

	}
})();