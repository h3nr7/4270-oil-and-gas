(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var ElText = ns.ElText;

	if(!ns.ElScene1Text) {

		var ElScene1Text = function ElTScene1ext(txt, txtSettings, x, y, z, toX, toY) {

			this.txt = txt;
			this.name = name;
			this.z = z;
			this.setup(x, y);
			this.container = PIXI.Text(txt, txtSettings);
			this.container.position = this.cPos;
			
		}

		ns.ElScene1Text = ElScene1Text;

		var p = ElScene1Text.prototype = new ElText();


	}

})();
