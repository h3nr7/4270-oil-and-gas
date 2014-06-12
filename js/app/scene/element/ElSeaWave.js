(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var AbElement = MKK.getNamespace('app.scene').AbElement;

	if(!ns.ElSeaWave) {

		var ElSeaWave = function ElSeaWave(name, x, y, z, aX, aY, texWidth) {

			var assetName = "sea_wave.png"
			var texHeight = 30;
			var offset = 7;
			this.name = name;
			this.z = z;
			this.waveOffset = offset;
			this.setup(x, (y-this.waveOffset));
			this.container = new PIXI.DisplayObjectContainer();
			this.container.position = this.cPos;
			var texWidth = texWidth || 1024;
			var gradHeight = texHeight;

		
			var texture = PIXI.Texture.fromFrame(assetName);

			var background = new PIXI.TilingSprite(texture, texWidth*2, texHeight);
			this.container.addChild(background);
			this.container.scale.x = 0.5;
			this.container.scale.y = 0.5;
		}	

		ns.ElSeaWave = ElSeaWave;

		var p = ElSeaWave.prototype = new AbElement();

		p.yPos = function(y) {
			if (y) {
				this.cPos.y = y;
				this.container.y = this.cPos.y + this.offPos.y - this.waveOffset;
			}
			return this.cPos.y;
		}

		p.update = function() {

		}

	}


})();