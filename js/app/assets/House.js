(function() {

	ns = MKK.getNamespace('app.assets');
	AStaticAsset = ns.AStaticAsset;

	if (!ns.House) {

		var House = function House() {

			console.log('a House is created');

		}

		ns.House = House;

		var p = House.prototype = new AStaticAsset();
		var s = AStaticAsset.prototype;


		p.setup = function() {
		}

		p.destroy = function() {

		}

		p.init = function() {
			this.regular = PIXI.Sprite.fromFrame("house.png");
			this.small = PIXI.Sprite.fromFrame("house_small.png");
		}

		p.remove = function() {

		}


	}


})();