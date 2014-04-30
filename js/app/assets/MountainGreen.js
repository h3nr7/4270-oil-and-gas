(function() {

	ns = MKK.getNamespace('app.assets');
	AStaticAsset = ns.AStaticAsset;

	if (!ns.MountainGreen) {

		var MountainGreen = function MountainGreen() {

			console.log('a MountainGreen is created');

			this.small = null;
			this.large = null;

		}

		ns.MountainGreen = MountainGreen;

		var p = MountainGreen.prototype = new AStaticAsset();
		var s = AStaticAsset.prototype;


		p.setup = function() {
		}

		p.destroy = function() {

		}

		p.init = function() {
			this.small = PIXI.Sprite.fromFrame("mountain_green_small.png");
			// this.regular = PIXI.Sprite.fromFrame("mountain_green.png");
		}

		p.remove = function() {

		}



	}


})();