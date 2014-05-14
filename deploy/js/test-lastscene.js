(function(){

	var Core = MKK.getNamespace('mkk.core').Core;
	var SceneEnd = MKK.getNamespace('app.scene').SceneEnd;
	var Trackpad = MKK.getNamespace('mkk.event').Trackpad;
	var AssetsLoader = MKK.getNamespace('app.loader').AssetsLoader;
	var ns = MKK.getNamespace('app');

	if(!ns.app) {

		var App = function() {

		}

		ns.App = App;

		var p = App.prototype = new Core();
		var s = Core.prototype;


		p.debug = function() {

			this.gui = new dat.GUI();
			this.speedRange = 0.5;
			this.gui.add(this, 'speedRange', 0.01, 0.9);

			this.stats = new Stats();
			var dEle = this.stats.domElement;
			dEle.style.position = 'absolute';
			dEle.style.right = '0px';
			dEle.style.bottom = '0px';

			document.body.appendChild(this.stats.domElement);

		}

		p.setup = function() {

			s.setup();
			this.stage = new PIXI.Stage(0xe7e7e7);
			// create a renderer instance.
			this.renderer = PIXI.autoDetectRenderer(1280, 768);
			// add the renderer view element to the DOM
			document.body.appendChild(this.renderer.view);

			//end Scene
			this.sceneend = new SceneEnd();
			this.sceneend.setup(this.stage);

			this.load();

			this.tp = new Trackpad(this.renderer.view);
			this.tp.setup(this.stage);

			this.debug();
		}

		p.load = function() {
			assetsToLoader = [
				"assets/global.json",
				"assets/sceneend.json"
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
			this.init();
		}

		p.init = function() {
			console.log('init');

			this.sceneend.init();
			this.stage.addChild(this.sceneend.container);
		}


		p.update = function() {

		}

		p.render = function() {

			this.stats.begin();
			this.sceneend.update(this.tp.speed*this.speedRange);
			this.tp.update();
			this.renderer.render(this.stage);
			this.stats.end();
		}
	}




})();