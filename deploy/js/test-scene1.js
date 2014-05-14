(function(){

	var Core = MKK.getNamespace('mkk.core').Core;
	var Trackpad = MKK.getNamespace('mkk.event').Trackpad;
	var AssetsLoader = MKK.getNamespace('app.loader').AssetsLoader;
	var ns = MKK.getNamespace('app');
	var Scene1 = MKK.getNamespace('app.scene').Scene1;
	var Scroller = MKK.getNamespace('app.event').Scroller;

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
			s.setup();
			s.disableScrollBars();


			this.stage = new PIXI.Stage(0xe7e7e7);
			// create a renderer instance.
			this.renderer = PIXI.autoDetectRenderer(1024, 768);
			// add the renderer view element to the DOM
			document.body.appendChild(this.renderer.view);

			// ------------------
			// scroller
			// ------------------
			this.scroller = new Scroller();
			this.scroller.setup(this.renderer.view);
			// ------------------

			if (this.isDebug) this.debug();

			//setup scenes
			this.scene1 = new Scene1();
			this.scene1.setup(0, 5000/*695*/, 0, 0);

			this.load();
		}

		p.init = function() {
			console.log('init test-scene 1');

			this.stage.addChild(this.scene1.container);

			this.scene1.init(this.stage);
		}


		p.load = function() {
			assetsToLoader = [
				"assets/global.json",
				"assets/scene1.json"
			];

			loader = new PIXI.AssetLoader(assetsToLoader);

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
			this.scene1.update(this.scroller.getDistance());

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
			this.gui = new dat.GUI();

			this.stats = new Stats();
			var dEle = this.stats.domElement;
			dEle.style.position = 'absolute';
			dEle.style.right = '0px';
			dEle.style.bottom = '0px';

			document.body.appendChild(this.stats.domElement);

			//add debugger for other libs
			this.scroller.debug(this.gui);
		}

	}
})();