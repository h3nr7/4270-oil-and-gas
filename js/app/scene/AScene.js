(function(){

	var ns = MKK.getNamespace('app.scene');

	if (!ns.AScene) {

		var AScene = function AScene() {
			this.container = null;
		}

		ns.AScene = AScene;

		var p = AScene.prototype;

		p.setup = function() {
			this.container = new PIXI.DisplayObjectContainer();
			this.container.position.x = 0;
			this.container.position.y = 0;
		}

		p.destroy = function() {
			
		}

		p.init = function() {

		}

		p.remove = function() {
			
		}

		p.update = function() {

		}
		
		p.render = function() {

		}



	}



})();