(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var AbElement = MKK.getNamespace('app.scene').AbElement;

	if(!ns.ElSeaFloor) {

		var ElSeaFloor = function ElSeaFloor(name, x, y, z, aX, aY, texWidth, texHeight) {

			this.name = name;
			assetName = "seabed.png";
			this.z = z;
			this.setup(x, y);
			this.container = new PIXI.DisplayObjectContainer();
			this.container.position = this.cPos;
			var texWidth = texWidth || 1024;
			var texHeight = texHeight || 800;
			var gradHeight = texHeight;

			if(texHeight>800) {
				var extender = this.drawExtended(this.cPos.x, 800, texWidth, texHeight-800);
				this.container.addChild(extender);
				gradHeight = 800;
			}
		
			var texture = PIXI.Texture.fromFrame(assetName);
			var background = new PIXI.TilingSprite(texture, texWidth, gradHeight);
			this.container.addChild(background);

		}	

		ns.ElSeaFloor = ElSeaFloor;

		var p = ElSeaFloor.prototype = new AbElement();


		p.drawExtended = function(x, y, width, height) {
			var extended = new PIXI.Graphics();

			var seafloorcolor = settings.defaultSeaFloorColor;
			extended.beginFill(seafloorcolor);

			extended.drawRect(x, y, width, height);
			extended.endFill();

			return extended;
		}

		p.update = function() {

		}

	}


})();