(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var AbElement = MKK.getNamespace('app.scene').AbElement;
	var settings = MKK.getNamespace('data').settings;

	if(!ns.ElText) {

		var ElText = function ElText(txt, x, y, z, aX, aY, style) {

			this.txt = txt;
			this.z = z;
			this.setup(x, y);
			this.container = new PIXI.Text(txt, settings.defaultTextStyle);
			this.container.position = this.cPos;
			// console.log(this.container.getBounds())
			// this.container.position.x -= Math.round( this.container.getBounds().width/2 );
			this.container.anchor.x = aX;
			this.container.anchor.y = aY;
		}	

		ns.ElText = ElText;

		var p = ElText.prototype = new AbElement();


		p.setStyle = function(style) {
			this.container.setStyle(style);
		}

		p.setTxt = function(txt) {
			this.txt = txt;
		}

		p.getTxt = function() {
			return this.txt;
		}

		p.update = function() {
			this.container.setText(this.txt);
		}

	}


})();