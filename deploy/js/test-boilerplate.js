(function(){

	var Core = MKK.getNamespace('mkk.core').Core;
	var Trackpad = MKK.getNamespace('mkk.event').Trackpad;
	var AssetsLoader = MKK.getNamespace('app.loader').AssetsLoader;
	var ns = MKK.getNamespace('app');

	if(!ns.app) {

		var App = function() {
			//some variatble
			this.testVar = 0.2
		}

		ns.App = App;

		var p = App.prototype = new Core();
		var s = Core.prototype;


		p.debug = function() {			
			this.gui = new dat.GUI();
			this.gui.add(this, 'testVar', 0.1, 1);

			this.stats = new Stats();
			var dEle = this.stats.domElement;
			dEle.style.position = 'absolute';
			dEle.style.right = '0px';
			dEle.style.bottom = '0px';

			document.body.appendChild(this.stats.domElement);
		}

		p.setup = function() {

			
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
			//render code starts here



			//render code ends here
			this.stats.end();
		}
	}
})();