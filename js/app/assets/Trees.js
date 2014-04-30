(function() {

	ns = MKK.getNamespace('app.assets');
	AStaticAsset = ns.AStaticAsset;

	if (!ns.Trees) {

		var Trees = function Trees() {

			console.log('a Trees is created');

			this.small = null;
			this.large = null;

		}

		ns.Trees = Trees;

		var p = Trees.prototype = new AStaticAsset();
		var s = AStaticAsset.prototype;


		p.setup = function() {
		}

		p.destroy = function() {

		}

		p.init = function() {
			this.small = PIXI.Sprite.fromFrame("trees_small.png");
			this.regular = PIXI.Sprite.fromFrame("trees.png");
		}

		p.remove = function() {

		}



	}


})();