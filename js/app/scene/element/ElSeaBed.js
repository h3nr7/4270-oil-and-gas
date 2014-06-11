(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;

	if(!ns.ElSeaBed) {

		var ElSeaBed = function ElSeaBed(sFrame, duration, x, y, z, width) {

			this.name = name;
			this.width = width;
			this.textures = [];
			assetName = [
				{name: "seaplant_02.png", height: 146, ypos: -180},
				{name: "seaplant_03.png", height: 120, ypos: -120},
				{name: "seaplant_01.png", height: 43, ypos: -43},

			];
			this.z = z;
			this.setup(sFrame, duration, x, y);
			this.container = new PIXI.DisplayObjectContainer();
			this.container.position = this.cPos;

			
			this.createTexture();

		}	

		ns.ElSeaBed = ElSeaBed;

		var p = ElSeaBed.prototype = new AbContainer();

		
		p.createTexture = function() {
			
			for(var i=0; i<assetName.length; i++) {
				var texture = PIXI.Texture.fromFrame(assetName[i].name);
				var background = new PIXI.TilingSprite(texture, this.width, assetName[i].height);
				background.position.y = assetName[i].ypos;
				this.textures.push(background);
				this.container.addChild(background);
			}
		}

		p.createMask = function(x, y, w, h) {
			
		}

		p.update = function() {

		}

	}


})();