(function(){

	var ns = MKK.getNamespace('app.scene.element');
	var settings = MKK.getNamespace('data').settings;
	var AbContainer = MKK.getNamespace('app.scene').AbContainer;
	var ElSprite = MKK.getNamespace('app.scene.element').ElSprite;

	if(!ns.ElSlope) {

		var ElSlope = function ElSlope(sFrame, duration, x, y, z, width) {

			this.name = name;
			this.width = width || 2000;
			this.z = z;
			this.setup(sFrame, duration, x, y);
			this.container = new PIXI.DisplayObjectContainer();
			this.container.position = this.cPos;

			this.slopeWidth = 499;
			this.slopeHeight = 288;
			this.offsetY = 100;
			this.extraHeight = 85;


			this.slopeNum = Math.ceil( this.width/this.slopeWidth );

			this.element = [];

			this.createTexture();

		}	

		ns.ElSlope = ElSlope;

		var p = ElSlope.prototype = new AbContainer();

		
		p.createTexture = function() {
			var sNum = this.slopeNum;
			var sw = this.slopeWidth;
			var sh = this.slopeHeight;
			for(var i=0; i<sNum; i++) {
				var tmp = new ElSprite("seabed-slope.png", (i*sw), -(i*sh), 0, 0, 0);
				this.element.push(tmp);
				this.container.addChild(tmp.container);
			}
			this.masker = this.createMask(0, sh+this.offsetY, this.width, (sNum*sh)+this.extraHeight);
			this.container.addChild(this.masker);
			this.container.mask = this.masker;

		}

		p.createMask = function(x, y, w, h) {
			var casing = new PIXI.Graphics();
			casing.clear();
			casing.beginFill(0xcccccc, 1);
			casing.drawRect(0, 0, w, -h);
			casing.endFill();
			casing.position.x = x;
			casing.position.y = y;	
			return casing;			
		}

		p.update = function() {

		}

	}


})();