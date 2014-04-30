(function() {

	ns = MKK.getNamespace('app.assets');

	if (!ns.Rectangle) {

		var Rectangle = function Rectangle(width, height, backgroundColor, borderColor, borderWidth) {
			this.backgroundColor = backgroundColor;
			this.borderColor = borderColor;
			this.borderWidth = borderWidth;
			this.width = width;
			this.height = height;
		}

		ns.Rectangle = Rectangle;

		var p = Rectangle.prototype;

		p.init = function() {

			var container = new PIXI.Graphics();
			
			// set a fill and line style
			container.beginFill(this.backgroundColor);
			if (this.borderWidth!=null && this.borderColor!=null) {}
				container.lineStyle(this.borderWidth , this.borderColor);
			container.drawRect(0, 0, this.width - this.borderWidth, this.height - this.borderWidth);
			container.endFill();
			// container.position.x = x + borderWidth/2;
			// container.position.y = y + borderWidth/2;
			container.position.x = 0;
			container.position.y = 0;

			this.container = container;

		}
	}


})();