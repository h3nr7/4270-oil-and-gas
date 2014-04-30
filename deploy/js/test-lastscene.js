(function(){

	var Core = MKK.getNamespace('mkk.core').Core;
	var SceneEnd = MKK.getNamespace('app.scene').SceneEnd;
	var ns = MKK.getNamespace('app');

	if(!ns.app) {

		var App = function() {

		}

		ns.App = App;

		var p = App.prototype = new Core();
		var s = Core.prototype;

		p.setup = function() {
			s.setup();
			
			this.stage = new PIXI.Stage(0xe7e7e7);
			// create a renderer instance.
			this.renderer = PIXI.autoDetectRenderer(1280, 768);
			// add the renderer view element to the DOM
			document.body.appendChild(this.renderer.view);

			//end Scene
			this.sceneend = new SceneEnd();
			this.sceneend.setup();

			this.load();
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
			this.renderer.render(this.stage);
		}
	}




})();