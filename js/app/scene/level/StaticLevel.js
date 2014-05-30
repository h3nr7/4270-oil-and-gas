(function() {

	var ns = MKK.getNamespace('app.scene.level');
	var AbLevel = MKK.getNamespace('app.scene').AbLevel;
	var settings = MKK.getNamespace('data').settings;
	var AbContainer = ns.AbContainer;


	if(!ns.StaticLevel) {


		var StaticLevel = function StaticLevel(name) {
			this.depthLevel = settings.depthLevel;
			this.name = name;

		}

		ns.StaticLevel = StaticLevel;

		var p = StaticLevel.prototype = new AbLevel();



		p.update = function(frame) {

			// console.log(this.oPos.y, this.cPos.y, frame)
			this._update(frame);
			if(this.isframeControlled) {
				var round = (this.oPos.y-frame*this.z*this.depthLevel) + 0.5 | 0;
				this.cPos.setY(round);
			}
		}
	}


})();