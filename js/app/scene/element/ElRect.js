(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var AbElement = MKK.getNamespace('app.scene').AbElement;
	var settings = MKK.getNamespace('data').settings;

	if(!ns.ElRect) {

		var ElRect = function ElRect(x, y, z, width, height, color) {

			this.width = width;
			this.height = height;
			this.z = z;
			this.setup(x, y);
			this.container = new PIXI.Graphics();
			this.color = color;

			this.container.beginFill(this.color);
			// graphics.lineStyle(5, 0xFF0000);
			this.container.drawRect(this.cPos.x, this.cPos.y, this.width, this.height);
			this.container.endFill();
			console.log('lala');


		}

		ns.ElRect = ElRect;

		var p = ElRect.prototype = new AbElement();


		p.update = function() {

		}









	}


})();