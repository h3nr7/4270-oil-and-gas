(function(){

	var Core = MKK.getNamespace('mkk.core').Core;
	var ListenerFunctions = MKK.getNamespace('mkk.event').ListenerFunctions;
	var Trackpad = MKK.getNamespace('mkk.event').Trackpad;
	var AssetsLoader = MKK.getNamespace('app.loader').AssetsLoader;
	var Navi = MKK.getNamespace('app.scene').Navi;
	var ns = MKK.getNamespace('app');
	var Scene4 = MKK.getNamespace('app.scene').Scene4;
	var Scene6 = MKK.getNamespace('app.scene').Scene6;
	var Scroller = MKK.getNamespace('app.event').Scroller;
	var FrameTween = MKK.getNamespace('app.animation').FrameTween;

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
			this.scene4 = new Scene4();
			this.scene4.setup(0, 6860/*695*/, 0, 0);

			this.scene6 = new Scene6();
			this.scene6.setup(6014/*6250-236*/, 10000, 0, 0);

			this.loadFonts();
		}

		p.init = function() {
			console.log('init test-scene 3');

			this.stage.addChild(this.scene4.container);

			this.scene6.init(this.stage);
			this.scene4.init(this.stage);
			
			//scroller swipe detector
			this.swipeLeftFuncBound = ListenerFunctions.createListenerFunction(this, this.swipeLeftFunc);
			this.swipeRightFuncBound = ListenerFunctions.createListenerFunction(this, this.swipeRightFunc);

			this.scroller.trackpad.addEventListener('swipeleft', this.swipeLeftFuncBound);
			this.scroller.trackpad.addEventListener('swiperight', this.swipeRightFuncBound);

		}


        p.loadFonts = function() {

        	var fontLoadingBound = ListenerFunctions.createListenerFunction(this, this.fontLoading);
            var fontActiveBound = ListenerFunctions.createListenerFunction(this, this.fontActive);
        	WebFont.load({
	            custom: {
	                families: ['EMPrintW01-regular', 'EMPrintW01-semibold'],
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
				"assets/scene4.json",
				"assets/scene5.json",
				"assets/scene6.json",
				"assets/scene7.json",
				"assets/scene8.json",
			];

			loader = new PIXI.AssetLoader(assetsToLoader);
			PIXI.scaleModes.DEFAULT = PIXI.scaleModes.LINEAR;
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
			
			this.scene4.update(frame);
			this.scene6.update(frame);

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