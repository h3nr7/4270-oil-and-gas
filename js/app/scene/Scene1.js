(function() {

	var ns = MKK.getNamespace('app.scene');
	var scenedata = MKK.getNamespace('data').scenedata;
	var styledata = MKK.getNamespace('data').styledata;
	var AbScene = ns.AbScene;

	var Scene1Level = ns.level.Scene1Level;
	var ElSprite = ns.element.ElSprite;
	var ElText = ns.element.ElText;
	var ElRect = ns.element.ElRect;


	var FrameTween = MKK.getNamespace('app.animation').FrameTween;
	var TweenEach = MKK.getNamespace('app.animation').TweenEach;


	if(!ns.Scene1) {

		var Scene1 = function Scene1() {

		}


		ns.Scene1 = Scene1;

		var p = Scene1.prototype = new AbScene();

		//open when init is completed
		p.open = function() {

			this.createLevels(scenedata.scene1.level, Scene1Level);

			var strapStyle = styledata.straplinegrey;

			//create levels
			// this.level1 = new Scene1Level('level1');
			// this.level1.setup(0,0,0);

			// this.level2 = new Scene1Level('level2');
			// this.level2.setup(0,0,5);

			// this.level3 = new Scene1Level('level3');
			// this.level3.setup(0,0,4);


			//create elements
			var cloud1 = new ElSprite("cloud_satellite.png", 100,100, 0, 0, 0);
			var logo1 = new ElSprite("cloud_text1.png", 512,374, 0, 0.5, 0.5);
			var arrow1 = new ElSprite("cloud_text1c.png", 512,454, 0, 0.5, 0.5);

			var txt1 = new ElText("Start by scrolling here", 512,414, 0, 0.5, 0.5);
			txt1.setStyle({"font":"12px EMPrintW01-regular"});


			var txt2 = new ElText("With over 100 years of experience\n as an Oil & Gas global leader", 512,900, 0, 0.5, 0.5);
			txt2.setStyle(strapStyle);

			var txt3 = new ElText("With 100 years of close collaboration\n with the world's leading equipment builders", 512,2000, 0, 0.5, 0.5);
			txt3.setStyle(strapStyle);


			var txt4 = new ElText("We know that 'productivity' means more to you than just the quantity of your output", 512,2000, 0, 0.5, 0.5);
			txt4.setStyle(strapStyle);

			var txt5 = new ElText("Our synthetic lubricants can enable\n problem-free operation to help enhance...", 512,3600, 0, 0.5, 0.5);
			txt5.setStyle(strapStyle);


			var cloud2 = new ElSprite("cloud_blue1.png", 100,580, 0);
			var cloud3 = new ElSprite("cloud_grey1.png", 600,1280, 0);
			var cloud4 = new ElSprite("cloud_white1.png", 630,1520, 0);
			var cloud5 = new ElSprite("cloud_white2.png", 60,1490, 0);
			var cloud6 = new ElSprite("cloud_grey2.png", 0,2780, 0);
			// var cloud7 = new ElSprite("cloud_blue1.png", 800,2320, 0);

			var symbol1 = new ElSprite("cloud_icon_safety.png", 322,3730, 0);
			var symbol2 = new ElSprite("cloud_icon_environmental.png", 470,3730, 0);
			var symbol3 = new ElSprite("cloud_icon_productivity.png", 622,3730, 0);

			var symStyle = {"font":"15px EMPrintW01-semibold", "fill": "#58595b", "align":"center", "wordWrap":"true", "wordWrapWidth":"200"};
			var symTxt1 = new ElText("Safety", 357,3820, 0, 0.5, 0.5);
			var symTxt2 = new ElText("Environmental Care", 506,3820, 0, 0.5, 0.5);
			var symTxt3 = new ElText("Productivity", 655,3820, 0, 0.5, 0.5);
			symTxt1.setStyle(symStyle);
			symTxt2.setStyle(symStyle);
			symTxt3.setStyle(symStyle);

			var logo2 = new ElSprite("mobile_shc_small.png", 180,4280, 0, 0.5, 0.5);
			var logo3 = new ElSprite("mobile_grease_small.png", 518,4280, 0, 0.5, 0.5);
			var logo4 = new ElSprite("signum_small.png", 850,4295, 0, 0.5, 0.5);

			var symStyle2 = {"font":"18px EMPrintW01-regular", "fill": "#58595b", "align":"center", "wordWrap":"true", "wordWrapWidth":"400"};
			var symTxt4 = new ElText("Our solutions help to:", 512,4400, 0, 0.5, 0.5);
			symTxt4.setStyle(symStyle2);

			var symStyle3 = {"font":"28px EMPrintW01-semibold", "fill": "#58595b", "align":"center", "wordWrap":"true", "wordWrapWidth":"400"};
			var symTxt5 = new ElText("Reduce energy consumption", 512,4470, 0, 0.5, 0.5);
			var symTxt6 = new ElText("Reduce downtime", 512,4540, 0, 0.5, 0.5);
			var symTxt7 = new ElText("Increase equipment protection", 512,4610, 0, 0.5, 0.5);
			var symTxt8 = new ElText("Optimize operating costs", 512,4680, 0, 0.5, 0.5);
			symTxt5.setStyle(symStyle3);
			symTxt6.setStyle(symStyle3);
			symTxt7.setStyle(symStyle3);
			symTxt8.setStyle(symStyle3);

			var cloud8 = new ElSprite("cloud_white2.png", 50, 2700, 0);
			var cloud9 = new ElSprite("cloud_blue1.png", 800,3710, 0);
			var cloud10 = new ElSprite("cloud_white1.png", -100, 3200, 0);


			//add to level 1
			this.level[0].addElement(txt2.container);
			this.level[0].addElement(txt4.container);
			this.level[0].addElement(cloud4.container);
			this.level[0].addElement(cloud8.container);
			this.level[0].addElement(cloud10.container);



			//add to level 2
			this.level[1].addElement(logo1.container);
			this.level[1].addElement(txt1.container);
			this.level[1].addElement(cloud3.container);
			this.level[1].addElement(txt3.container);
			this.level[1].addElement(txt5.container);
			//symbols
			this.level[1].addElement(symbol1.container);
			this.level[1].addElement(symbol2.container);
			this.level[1].addElement(symbol3.container);
			this.level[1].addElement(symTxt1.container);
			this.level[1].addElement(symTxt2.container);
			this.level[1].addElement(symTxt3.container);
			//logos and final part
			this.level[1].addElement(logo2.container);
			this.level[1].addElement(logo3.container);
			this.level[1].addElement(logo4.container);
			this.level[1].addElement(symTxt4.container);
			this.level[1].addElement(symTxt5.container);
			this.level[1].addElement(symTxt6.container);
			this.level[1].addElement(symTxt7.container);
			this.level[1].addElement(symTxt8.container);



			//add to level 3
			this.level[2].addElement(cloud1.container);
			this.level[2].addElement(cloud2.container);
			this.level[2].addElement(arrow1.container);
			this.level[2].addElement(cloud5.container);
			this.level[2].addElement(cloud6.container);
			this.level[2].addElement(cloud9.container);

			this.addLevel(this.level[0]);
			this.addLevel(this.level[1]);
			this.addLevel(this.level[2]);



			var trect = new ElRect(200, 200, 0, 200, 2, 0xf1345e);
			
			this.level[2].addElement(trect.container);

			var tT = new TweenEach({x:50});

			tT.to({x:100}).onUpdate(function(va){

				console.log('kaka', va);
			}).start(3000);


		}

		//close when destroyed
		p.close = function() {

		}

		p.update = function(frame) {

			this._update(frame);
			var cFrame = this.localCurFrame(frame);


			if(cFrame>=0 && cFrame<this.duration) {
				this.cPos.y = -cFrame;
			}
			this.level[0].update(cFrame);
			this.level[1].update(cFrame);
			this.level[2].update(cFrame);
		}



	}




})();