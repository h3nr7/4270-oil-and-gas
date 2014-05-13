(function(){

	var ns = MKK.getNamespace('app.scene');
	var AScene = ns.AScene;


	if (!ns.Scene1) {

		var Scene1 = function Scene1() {


		}

		ns.Scene1 = Scene1;

		var p = Scene1.prototype = new AScene();
		var s = AScene.prototype;

		p.setup = function(stage) {
			this.preSetup(stage);
			this.stage = stage;
			console.log(this.container);

			this.level1Setup();
			console.log(p, this);
		}

		p.createLevel = function() {
			return s.createLevel();
		}

		p.level1Setup = function() {
			this.level1 = this.createLevel();
			var l2House = PIXI.Sprite.fromFrame("cloud_white1.png");
			l2House.position.x = 400;
			l2House.position.y = 0;

			txt = new PIXI.Text("With over 100 years of close collaboration with the world's leading equipment builders", {font:"40px EMPrintW01-semibold", fill: "black", align:"center", wordWrap:"true", wordWrapWidth:"800"});
			txt.anchor.x = 0.5;
			txt.anchor.y = -2;
			txt.x = 512;
			

			//add elements
			this.level1.addChild(l2House);
			this.level1.addChild(txt);

			this.container.addChild(this.level1);	
			console.log(this.level1);	
		}

		p.level2Setup = function() {

		}

		p.level3Setup = function() {

		}

		p.update = function(frame) {
			this.preUpdate(frame);
			console.log(this.curFrame/3000);
			this.level1.y = this.curFrame*TWEEN.Easing.Elastic.In(this.curFrame/600);


		}







	}



})();