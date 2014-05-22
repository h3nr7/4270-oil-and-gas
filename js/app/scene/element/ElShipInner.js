(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var AbElement = MKK.getNamespace('app.scene').AbElement;

	if(!ns.ElShipInner) {

		var ElShipInner = function ElShipInner(name, x, y, z, aX, aY, texWidth, texHeight) {

			this.name = name;
			assetBG = [		"exploration_inner_bg_01.png",
							"exploration_inner_bg_02.png",
							"exploration_inner_bg_03.png",
							"exploration_inner_bg_04.png",
						];

			this.z = z;
			this.setup(x, y);
			this.container = new PIXI.DisplayObjectContainer();
			this.container.position = this.cPos;

			
			this.container.addChild(background);

		}	

		ns.ElShipInner = ElShipInner;

		var p = ElShipInner.prototype = new AbElement();


		p.setup = function(x, y) {

			this._setup(x, y);
			
			this.inner = new ElSpriteContainer('inner', 0, 0, -200, 1200, 0);
			this.inner.addSprite("exploration_inner_bg_01.png", 0,0);
			this.inner.addSprite("exploration_inner_bg_02.png", 655,0);
			this.inner.addSprite("exploration_inner_bg_03.png", 0,699);
			this.inner.addSprite("exploration_inner_bg_04.png", 655,699);
			this.inner.scale(1.2);
			this.inner.mask(300, 50, 550, 2400);
			this.inner.showMask();

		}

		p.update = function() {

		}

	}


})();