(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var AbElement = MKK.getNamespace('app.scene').AbElement;

	if(!ns.ElSeaBG) {

		var ElSeaBG = function ElSeaBG(name, x, y, z, aX, aY, texWidth, texHeight) {

			this.name = name;
			assetName = "sea_gradient.png";
			this.z = z;
			this.setup(x, y);
			this.container = new PIXI.DisplayObjectContainer();
			this.container.position = this.cPos;
			var texWidth = texWidth || 1024;
			var texHeight = texHeight || 1024;
			var gradHeight = texHeight;

			if(texHeight>1024) {
				var extender = this.drawExtendedSea(this.cPos.x, 1024, texWidth, texHeight-1024);
				this.container.addChild(extender);
				gradHeight = 1024;
			}
		
			var texture = PIXI.Texture.fromFrame(assetName);
			var background = new PIXI.TilingSprite(texture, texWidth, gradHeight);
			this.container.addChild(background);

		}	

		ns.ElSeaBG = ElSeaBG;

		var p = ElSeaBG.prototype = new AbElement();


		p.drawExtendedSea = function(x, y, width, height) {
			var extended = new PIXI.Graphics();

			var seacolor = settings.defaultSeaColor;
			extended.beginFill(seacolor);

			extended.drawRect(x, y, width, height);
			extended.endFill();

			return extended;
		}

		p.update = function() {

		}

	}


})();