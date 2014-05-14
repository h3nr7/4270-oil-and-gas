(function(){

	var Core = MKK.getNamespace('mkk.core').Core;
	var Trackpad = MKK.getNamespace('mkk.event').Trackpad;
	var AssetsLoader = MKK.getNamespace('app.loader').AssetsLoader;
	var Scroller = MKK.getNamespace('app.event').Scroller;
	var ns = MKK.getNamespace('app');

	if(!ns.app) {

		var App = function() {

		}

		ns.App = App;

		var p = App.prototype = new Core();
		var s = Core.prototype;


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

		p.setup = function() {
			s.setup();
			s.disableScrollBars();


			this.stage = new PIXI.Stage(0xe7e7e7);
			// create a renderer instance.
			this.renderer = PIXI.autoDetectRenderer(1280, 768);
			// add the renderer view element to the DOM
			document.body.appendChild(this.renderer.view);
			this.txt = new PIXI.Text("BEGIN", {font:"50px EMPrintW01-semibold", fill: "black", align:"center", wordWrap:"true", wordWrapWidth:"200"});
			this.txt.anchor.x = 0.5;
			this.txt.anchor.y = 0.5;
			this.txt.x = 640;
			this.txt.y = 384;
			this.stage.addChild(this.txt);

			// ------------------
			// scroller
			// ------------------
			this.scroller = new Scroller();
			this.scroller.setup(this.renderer.view);
			// ------------------


			this.debug();

		}

		p.init = function() {
			console.log('init');


			this.stage.addChild(this.sceneend.container);
		}


		p.update = function() {

		}

		p.render = function() {

			this.stats.begin();


			this.txt.setText(Math.round(this.scroller.distance));
			this.scroller.update();
			this.renderer.render(this.stage);
			//render code ends here
			this.stats.end();
		}
	}
})();