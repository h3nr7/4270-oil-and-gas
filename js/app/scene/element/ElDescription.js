](function(){

	var ns = MKK.getNamespace('app.scene.element');
	var AbElement = MKK.getNamespace('app.scene').AbElement;
	var ElText = ns.ElText;
	var ElRect = ns.ElRect;
	var settings = MKK.getNamespace('data').settings;

	if(!ns.ElDescription) {

		var ElDescription = function ElDescription(title, content, x, y, z, aX, aY, style) {

			this.title = title;
			this.content = content;
			this.z = z;
			this.setup(x, y);

		}	

		ns.ElDescription = ElDescription;

		var p = ElDescription.prototype = new AbElement();


		p.setStyle = function(style) {
			
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