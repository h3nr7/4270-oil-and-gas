(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var AbElement = MKK.getNamespace('app.scene').AbElement;

	if(!ns.ElSprite) {

		var ElSprite = function ElSprite(name, x, y, z, aX, aY) {

			this.name = name;
			this.z = z;
			this.setup(x, y);
			this.container = PIXI.Sprite.fromFrame(name);
			this.container.position = this.cPos;
			this.container.anchor.x = aX || 0;
			this.container.anchor.y = aY || 0;
		}	

		ns.ElSprite = ElSprite;

		var p = ElSprite.prototype = new AbElement();



		p.update = function() {

		}

	}


})();