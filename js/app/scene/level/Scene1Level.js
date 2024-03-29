(function() {

	var ns = MKK.getNamespace('app.scene.level');
	var AbLevel = MKK.getNamespace('app.scene').AbLevel;
	var settings = MKK.getNamespace('data').settings;
	var AbContainer = ns.AbContainer;


	if(!ns.Scene1Level) {


		var Scene1Level = function Scene1Level(name) {
			this.depthLevel = settings.depthLevel;
			this.name = name;
		}

		ns.Scene1Level = Scene1Level;

		var p = Scene1Level.prototype = new AbLevel();


		p.update = function(frame) {

			// console.log(this.oPos.y, this.cPos.y, frame)
			if(this.isframeControlled) {
				this._update(frame);
				var round = (this.oPos.y-frame*this.z*this.depthLevel) + 0.5 | 0;
				this.cPos.setY(round);
			}
		}
	}

})();