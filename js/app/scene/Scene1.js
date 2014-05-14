(function() {

	var ns = MKK.getNamespace('app.scene');
	var AbScene = ns.AbScene;

	var Scene1Level = ns.level.Scene1Level;
	var ElSprite = ns.element.ElSprite;
	var ElText = ns.element.ElText;


	if(!ns.Scene1) {

		var Scene1 = function Scene1() {

		}


		ns.Scene1 = Scene1;

		var p = Scene1.prototype = new AbScene();

		//open when init is completed
		p.open = function() {

			//create levels
			this.level1 = new Scene1Level('level1');
			this.level1.setup(0,0,0);

			this.level2 = new Scene1Level('level2');
			this.level2.setup(0,0,5);

			this.level3 = new Scene1Level('level3');
			this.level3.setup(0,0,4);

			//create elements
			var cloud1 = new ElSprite("cloud_satellite.png", 100,100, 0);
			var logo1 = new ElSprite("cloud_text1.png", 512,374, 0, 0.5, 0.5);
			var arrow1 = new ElSprite("cloud_text1c.png", 512,454, 0, 0.5, 0.5);

			var txt1 = new ElText("Start by scrolling here", 512,414, 0, 0.5, 0.5);
			txt1.setStyle({"font":"12px EMPrintW01-regular"});


			var tStyle = {"font":"40px EMPrintW01-semibold", "fill": "#58595b", "align":"center", "wordWrap":"true", "wordWrapWidth":"800"};
			var txt2 = new ElText("With over 100 years of experience\n as an Oil & Gas global leader", 512,900, 0, 0.5, 0.5);
			txt2.setStyle(tStyle);

			var txt3 = new ElText("With 100 years of close collaboration\n with the world's leading equipment builders", 512,2000, 0, 0.5, 0.5);
			txt3.setStyle(tStyle);


			var txt4 = new ElText("We know that 'productivity' means more to you than just the quantity of your output", 512,2000, 0, 0.5, 0.5);
			txt4.setStyle(tStyle);

			var txt5 = new ElText("Our synthetic lubricants can enable\n problem-free operation to help enhance...", 512,3600, 0, 0.5, 0.5);
			txt5.setStyle(tStyle);


			var cloud2 = new ElSprite("cloud_blue1.png", 100,580, 0);
			var cloud3 = new ElSprite("cloud_grey1.png", 600,1280, 0);


			//add to level 1
			this.level1.addElement(cloud1.container);
			this.level1.addElement(cloud2.container);
			this.level1.addElement(txt2.container);
			this.level1.addElement(txt4.container);

			//add to level 2
			this.level2.addElement(logo1.container);
			this.level2.addElement(txt1.container);
			this.level2.addElement(cloud3.container);
			this.level2.addElement(txt3.container);
			this.level2.addElement(txt5.container);

			//add to level 3
			this.level3.addElement(arrow1.container);

			this.addLevel(this.level1);
			this.addLevel(this.level2);
			this.addLevel(this.level3);

		}

		//close when destroyed
		p.close = function() {

		}

		p.update = function(frame) {

			this._update(frame);
			if(frame>=0 && frame<this.duration) {
				this.cPos.y = -frame;
			}
			this.level1.update(this.localCurFrame(frame));
			this.level2.update(this.localCurFrame(frame));
			this.level3.update(this.localCurFrame(frame));
		}



	}




})();