var Welcome = Class.create({
    initialize: function() {
	this.big_g = new Welcome();
    }
});

var Welcome = Class.create({

    initialize: function() {
	this.raph = Raphael("welcome", 1000, 1000);

	this.paths = {};
	this.initPath();

	this.pointer_force = {};

	this.pointer_force.last_pos = { x:0, y:0 };

	document.observe( 'mousemove', function(evt) {
	    var last_pos = this.pointer_force.cur_pos;
	    this.pointer_force.cur_pos = evt.pointer();
	    this.pointer_force.last_pos = last_pos;
	}.bind(this) );

	this.lastUpdate = Date.now();
	this.doPhysics( 0 );
	new PeriodicalExecuter( function(pe) {
	    var now = Date.now();
	    this.doPhysics( now - this.last_update );
	    this.last_update = now;
	}.bind(this), 0.016 );
    },

    doPhysics: function( delta_t ) {
	if( !delta_t ) return;
	if( this.pointer_force.cur_pos === this.pointer_force.last_pos ) return;
	var path_datas, anchor_points, num_point, i, p;
	for( path_id in this.paths ) {
	    path_datas = this.paths[path_id];
	    anchor_points = path_datas.anchor_points;

	    num_point = anchor_points.length;
	    for( i=0; i<num_point; i++ ) {
		p = anchor_points[i];

		var dx = 1.5 * p.speed_x * delta_t;
		var dy = 1.5 * p.speed_y * delta_t;

		p.cur_x += dx;
		p.cur_y += dy;

		var dist = Math.abs(p.cur_x - p.og_x) + Math.abs(p.cur_y - p.og_y);
		// var dist = Math.sqrt( (p.cur_x - p.og_x)*(p.cur_x - p.og_x) + (p.cur_y - p.og_y)*(p.cur_y - p.og_y)  );
		var damper = ( dist > 50 ? 0.4 : ( dist > 25 ? 0.8 : 0.98) )/1.5;

		var f_og_x = -( p.cur_x - p.og_x ) * 0.08;
		var f_og_y = -( p.cur_y - p.og_y ) * 0.08;

		var f_mouse_x = 0;
		var f_mouse_y = 0;
		var dist_x = Math.abs(this.pointer_force.cur_pos.x - p.cur_x);
		var dist_y = Math.abs(this.pointer_force.cur_pos.y - p.cur_y);
		if( this.pointer_force.cur_pos
		    && dist_x < 30
		    && dist_y < 30 ) {
		    f_mouse_x = (this.pointer_force.cur_pos.x - this.pointer_force.last_pos.x)*15/dist_x;
		    f_mouse_y = (this.pointer_force.cur_pos.y - this.pointer_force.last_pos.y)*15/dist_y;
		}

		var neighbor_i = ( i == num_point-1 ? 0 : i+1 );
		var p2 = anchor_points[neighbor_i];
		var f_next_x = -((p2.og_x - p.og_x) - (p2.cur_x - p.cur_x)) * 0.7;
		var f_next_y = -((p2.og_y - p.og_y) - (p2.cur_y - p.cur_y)) * 0.7;

		neighbor_i = ( i == 0 ? num_point-1 : i-1 );
		p2 = anchor_points[neighbor_i];
		var f_prev_x = -((p2.og_x - p.og_x) - (p2.cur_x - p.cur_x)) * 0.7;
		var f_prev_y = -((p2.og_y - p.og_y) - (p2.cur_y - p.cur_y)) * 0.7;

		//calc speed
		p.speed_x = p.speed_x*damper + (f_og_x+f_mouse_x+f_next_x+f_prev_x) / 10000 * delta_t;
		p.speed_y = p.speed_y*damper + (f_og_y+f_mouse_y+f_next_y+f_prev_y) / 10000 * delta_t;

		path_datas.og_path_datas[p.path_i].x = p.cur_x;
		path_datas.og_path_datas[p.path_i].y = p.cur_y;

		if( path_datas.og_path_datas[p.path_i].rev_ctl_i != null ) {
		    path_datas.og_path_datas[path_datas.og_path_datas[p.path_i].rev_ctl_i].x += dx;
		    path_datas.og_path_datas[path_datas.og_path_datas[p.path_i].rev_ctl_i].y += dy;
		}
		if( path_datas.og_path_datas[p.path_i].fwd_ctl_i != null ) {
		    path_datas.og_path_datas[path_datas.og_path_datas[p.path_i].fwd_ctl_i].x += dx;
		    path_datas.og_path_datas[path_datas.og_path_datas[p.path_i].fwd_ctl_i].y += dy;
		}

	    }

	    path_datas.elem.attr( { path:this.getSvgPath(path_datas.og_path_datas) } );
	}

    },

    getRandomColor: function() {
	var letters = '0123456789ABCDEF'.split('');
	var color = '#';
	for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
    },

    initPath: function() {

	var base_x = 30;
	var base_y = 100;

	var path_strings = {

	    'W': {
		str: "M 91.259814,246.40557 C 88.585584,243.69413 85.515004,236.58244 80.507264,221.50182 77.276834,211.7735 69.903324,185.97126 68.219844,178.50423 68.033844,177.67923 67.128084,174.07923 66.207044,170.50423 64.467924,163.75385 63.985694,161.71329 63.134884,157.50423 62.856934,156.12923 60.642904,146.45423 58.214804,136.00423 55.786714,125.55423 53.577324,115.81911 53.305064,114.37063 53.032804,112.92215 51.265334,105.94715 49.377364,98.870633 47.489384,91.794117 45.770204,85.329237 45.556964,84.504237 43.639674,77.086725 39.246504,64.81501 36.607164,59.504237 32.920134,52.08534 30.289504,48.937719 25.029954,45.651795 19.012304,41.892243 20.408094,38.548631 29.676674,34.520653 41.864784,29.223888 57.867514,26.373709 63.964304,28.413827 67.671074,29.654194 69.545264,33.01935 73.482604,45.504237 75.365824,51.475735 80.827454,73.614041 81.870574,79.504237 82.114084,80.879237 83.446624,87.262571 84.831784,93.689423 86.216934,100.11627 87.549464,106.41627 87.792944,107.68942 88.653904,112.19124 97.237844,149.11618 99.257164,157.00423 101.91772,167.39713 105.92186,180.40273 107.33897,183.25423 109.9531,188.51436 113.7354,185.21502 120.23575,172.00423 122.9958,166.39494 136.18601,134.75555 137.32833,131.00423 144.06726,108.87389 143.5221,99.262713 133.75496,68.004237 129.80183,55.352743 126.78112,49.00732 122.42239,44.198586 118.54457,39.9204 118.60109,40.077129 119.9884,37.448846 121.39084,34.791894 125.65132,32.737516 134.56424,30.420445 144.78625,27.763049 154.36009,26.979355 158.7316,28.442155 163.92508,30.180006 164.4896,31.794296 176.50586,90.353417 182.57036,119.90766 186.25885,136.96309 190.3961,154.00423 192.62234,163.17402 197.65788,179.17766 199.37826,182.55081 201.46564,186.64351 204.23404,186.35588 207.04504,181.75423 211.20536,174.94372 218.27719,160.12549 221.00426,152.50423 222.48029,148.37923 223.94432,144.32923 224.25766,143.50423 224.57099,142.67923 224.8839,141.77923 224.95301,141.50423 225.02211,141.22923 225.92989,138.52923 226.97027,135.50423 228.01066,132.47923 228.93558,129.66673 229.02565,129.25423 229.11565,128.84173 229.27883,128.39173 229.38814,128.25423 229.49745,128.11673 229.72646,127.32923 229.89703,126.50423 230.06762,125.67923 230.96658,122.07923 231.89475,118.50423 232.8229,114.92923 233.76357,110.87923 233.98509,109.50423 234.20663,108.12923 234.64481,105.87923 234.95881,104.50423 236.24494,98.872363 236.2208,82.742358 234.91681,76.434838 232.9191,66.77184 229.71028,60.726503 223.09566,54.164048 216.51688,47.637149 215.7903,45.778222 218.61595,42.703034 224.32725,36.487384 245.52105,28.598058 257.91193,28.07523 268.00752,27.649251 271.49085,29.068291 272.3991,33.977006 273.02321,37.350146 272.3891,53.346994 271.4418,58.127517 271.21038,59.29532 270.75238,61.99532 270.42401,64.127517 270.09563,66.259713 269.63292,68.679237 269.39576,69.504237 269.15859,70.329237 268.77208,72.129237 268.53684,73.504237 265.84676,89.228058 250.361,133.82608 236.59171,165.50423 217.49236,209.44489 193.95725,248.50423 186.58027,248.50423 184.77389,248.50423 181.09446,243.46348 178.18601,237.00423 174.4123,228.62335 166.39974,203.24182 162.87531,188.50423 161.81271,184.06088 155.26413,155.74611 154.95893,154.27528 154.7616,153.32436 154.20666,151.83343 153.72574,150.9621 152.46702,148.6816 151.71579,149.889 144.67786,165.50423 134.20293,188.74524 118.37207,217.58924 105.14224,237.53858 97.650384,248.8356 95.200094,250.40065 91.259834,246.40557 z",
		off_x: base_x + 0,
		off_y: base_y + 0
	    },

	    'e1': {
		str:"M 60,155.62732 C 48.214964,152.19544 39.649818,144.74614 33.739973,132.78838 27.191167,119.53777 25.488852,110.76753 25.531746,90.5 25.557641,78.264519 25.974465,73.93344 27.793393,67 30.903856,55.143452 37.277714,42.212993 44.458624,33.191737 46.977916,30.026793 57.513315,22.951642 62.46634,21.098478 75.864775,16.085481 93.166002,16.486245 104.70803,22.076959 127.21929,32.980943 129.10214,63.781729 108.5118,84.301313 101.32507,91.463338 80.476153,99.867521 65.5,101.63933 58.430801,102.47568 57.939443,103.08421 59.513934,109.05282 61.57027,116.84802 65.454233,122.59536 70.776578,125.71884 74.910725,128.145 76.498048,128.48326 83.5,128.43016 95.873229,128.33636 104.87078,123.27695 110.74021,113.11285 113.72954,107.93622 114.7616,106.97129 116.56776,107.66438 118.98998,108.59387 120.29906,113.90021 119.68397,120.29587 118.0626,137.15474 108.52579,148.86751 92.151673,154.11007 83.863636,156.76368 66.685909,157.5743 60,155.62732 z",
		off_x: base_x + 240,
		off_y: base_y + 80
	    },

	    'e1_in': {
		str: "M 73.512801,80.817638 C 84.935279,75.300916 93.255012,62.652433 93.415608,50.097525 93.56179,38.66944 89.721375,33.833333 80.5,33.833333 70.907345,33.833333 63.016621,42.16994 58.572401,57 56.753712,63.068841 55.373699,79.36848 56.349423,83.256076 56.951029,85.653067 57.139272,85.70318 62.235453,84.823037 65.130954,84.322966 70.134488,82.449264 73.512801,80.817638 z",
		off_x: base_x + 240,
		off_y: base_y + 80
	    },

	    'l': {
		str: "M 78.5,234.30269 C 72.423476,232.88896 64.589372,229.35699 61.38364,226.58586 57.959277,223.62573 57.735747,223.07826 57.862776,217.96253 57.937376,214.95814 58.223275,211.375 58.498103,210 58.772931,208.625 59.249851,203.9 59.557925,199.5 59.865998,195.1 60.311873,189.475 60.548757,187 61.812774,173.79337 62.374553,149.5062 62.433909,105.5 L 62.5,56.5 59.56661,50.60993 C 57.692911,46.847655 55.268175,43.77702 52.854561,42.10993 50.776299,40.674468 49.058825,38.917045 49.037951,38.204545 48.972991,35.987245 53.481723,32.286083 60.633108,28.68622 68.927543,24.510968 73.587382,23.10344 81.5,22.383268 89.507905,21.654425 90.836244,22.744193 91.554356,30.631859 91.861398,34.004381 92.285901,74.351415 92.497694,122.95389 92.709487,171.55637 93.134256,215.525 93.441624,218 94.361297,225.40542 94.904775,228.58827 95.526032,230.20724 96.677171,233.20706 93.270616,235.00776 86.678571,234.884 83.280357,234.8202 79.6,234.55861 78.5,234.30269 z",
		off_x: base_x + 320,
		off_y: base_y + 0
	    },

	    'c': {
		str: "M 60.5,161.6131 C 43.116833,157.196 31.883086,145.12134 26.413403,124.97491 24.538376,118.06865 23.787099,92.417148 25.22798,84.5 25.628368,82.3 26.20636,79.15 26.512405,77.5 27.601676,71.627355 31.341113,61.382201 35.257218,53.541329 42.785495,38.468122 56.207072,28.296608 72.120525,25.60455 94.699592,21.784878 111.48194,28.294085 119.54856,44 122.25943,49.278133 122.46782,62.310642 119.92373,67.462524 115.59302,76.232362 107.9873,81.028434 99.268627,80.487366 91.578539,80.010131 86.475162,76.040675 84.969664,69.365494 84.216762,66.027226 84.427563,65.403016 87.174336,62.837145 88.844782,61.276715 91.06778,59.601695 91.505811,59.601695 92.561252,59.601695 94,54.339809 94,51.255069 94,49.909502 93.239243,47.520725 92.309429,45.946675 87.75317,38.233544 73.873598,39.447024 66.465954,48.20615 53.758392,63.232133 51.431352,104.45351 62.35852,120.96557 71.881383,135.35559 92.578688,136.65988 105.3782,123.67656 107.78124,121.23901 110.55789,117.40756 111.54853,115.16222 112.53917,112.91688 114.05457,110.8093 114.91609,110.4787 118.78113,108.99555 121.70518,118.0548 120.71835,128.45525 119.33023,143.08517 107.04311,156.42968 90.5,161.27412 84.227404,163.11097 67.153974,163.30388 60.5,161.6131 z",
		off_x: base_x + 410,
		off_y: base_y + 80
	    },

	    'o': {
		str: "M 61.477679,168.09256 C 54.301805,166.08451 45.763211,161.36802 41.185874,156.88392 35.62588,151.43717 30.027048,140.32007 28.254345,131.20693 27.316631,126.38632 27.324207,107.57851 28.265815,102.72087 29.28105,97.483426 32.742801,87.424468 35.161878,82.682685 41.16569,70.914241 62.126607,58.627984 68.891715,62.911917 70.043252,63.641116 69.934024,64.285644 68.258797,66.646604 64.848316,71.453122 62.397199,76.266883 60.695602,81.5 59.124671,86.331263 58.769047,89.229875 57.251934,97.849576 54.846777,111.51483 58.09292,132.7288 63.794068,141.97356 67.587642,148.12508 74.43321,152.25247 80.705686,152.17006 88.632554,152.06592 89.074889,151.87686 95.03429,146.04558 100.04787,141.1398 101.09869,139.41128 103.29201,132.46225 106.59453,121.99895 107.03817,119.36972 107.50391,107.5 108.64042,78.535797 96.079669,59.424141 72.71587,54.568686 69.297141,53.858207 61.807372,53.191639 56.071938,53.087422 42.378274,52.838599 41.451076,52.183471 47.196569,46.816378 52.716762,41.659745 67.113529,35.540538 78.5,33.511155 94.438102,30.670547 124.80873,30.678966 133.50072,33.526405 139.8225,35.597379 141.98725,38.390662 138.25,39.654641 132.94769,41.447943 121.97211,47.490718 118.5,50.528318 L 114.5,54.027742 117.9416,56.763872 C 127.10062,64.045446 131.93765,71.311086 135.40807,83.000002 137.09397,88.678416 137.66083,106.09944 136.4493,115 133.68148,135.33387 123.04475,153.20583 108.51759,161.93119 96.041707,169.4245 75.740015,172.08365 61.477679,168.09256 z",
		off_x: base_x + 515,
		off_y: base_y + 70
	    },

	    'm': {
		str: "M 176.75887,162.42554 C 176.59171,162.25838 175.32805,161.91727 173.95074,161.66751 163.94236,159.85265 157.1943,153.75028 153.30804,143 152.04908,139.51744 152.1417,121.10455 153.4514,114.5 153.7786,112.85 154.56508,109.025 155.19913,106 155.83318,102.975 156.44511,100.05 156.55897,99.5 156.67283,98.95 157.75065,94 158.95414,88.5 161.98283,74.65871 162.45809,70.834715 162.4352,60.490575 162.4182,52.81561 162.05125,50.823586 159.95763,47.041696 153.13283,34.713416 135.00874,35.413484 128.3645,48.262025 127.52117,49.89285 126.53166,54.43855 126.16558,58.363581 125.47241,65.795864 125.43089,128.7964 126.11038,142.16801 126.46983,149.24198 126.30635,150.0434 124.00002,152.51302 119.47124,157.36245 108.84782,161.41102 99.426233,161.87806 93.041687,162.19455 91.604607,160.74699 92.391147,154.79169 92.702898,152.43126 93.203785,148.25 93.504229,145.5 93.804674,142.75 94.285361,138.475 94.572423,136 95.712533,126.17017 95.845793,51.756953 94.728011,49.118914 89.808114,37.507673 74.936277,35.415142 66.59467,45.160434 61.092054,51.589003 60.403944,51.99772 60.379625,88.548729 60.367735,106.42373 60.940338,128.1 61.417737,132.5 63.326771,150.09481 63.161532,150.66232 54.5,156.2588 47.147549,161.00945 31.911214,163.6284 26.979833,160.98921 25.059434,159.96144 24.897107,159.27614 25.450943,154.53462 25.791735,151.61701 26.230836,148.39066 26.426723,147.36494 26.62261,146.33922 27.11414,142.125 27.519011,138 27.923882,133.875 28.38825,129.15 28.55094,127.5 30.388971,108.85867 31.222401,47.7634 29.778674,37.5 27.672974,22.530662 27.6757,22.243928 29.935233,21.034662 32.916856,19.438946 42.321717,20.016833 46.927131,22.078738 49.057688,23.032617 51.894537,25.422537 53.23124,27.389672 L 55.661608,30.966281 60.080804,28.187847 C 68.422562,22.943222 72.259228,21.861901 84.08488,21.422564 97.14328,20.93743 109.10725,24.691788 115.16373,31.175277 L 117.87746,34.080329 122.68873,30.401888 C 131.35029,23.779721 137.18792,21.90034 150.58666,21.420359 172.07841,20.650463 185.74418,29.824622 189.99409,47.875495 191.26262,53.263434 190.9489,74.195616 189.2803,95.5 188.42061,106.47642 188.34551,131.20266 189.1573,136 190.19527,142.13402 192.08992,148.33146 194.77423,154.37315 197.33702,160.14132 197.34895,160.2717 195.44183,161.66791 194.07937,162.66536 191.04788,163.03581 185.2814,162.90949 180.76117,162.81049 176.92603,162.5927 176.75887,162.42554 z",
		off_x: base_x + 640,
		off_y: base_y + 80
	    },

	    'e2': {
		str:"M 60,155.62732 C 48.214964,152.19544 39.649818,144.74614 33.739973,132.78838 27.191167,119.53777 25.488852,110.76753 25.531746,90.5 25.557641,78.264519 25.974465,73.93344 27.793393,67 30.903856,55.143452 37.277714,42.212993 44.458624,33.191737 46.977916,30.026793 57.513315,22.951642 62.46634,21.098478 75.864775,16.085481 93.166002,16.486245 104.70803,22.076959 127.21929,32.980943 129.10214,63.781729 108.5118,84.301313 101.32507,91.463338 80.476153,99.867521 65.5,101.63933 58.430801,102.47568 57.939443,103.08421 59.513934,109.05282 61.57027,116.84802 65.454233,122.59536 70.776578,125.71884 74.910725,128.145 76.498048,128.48326 83.5,128.43016 95.873229,128.33636 104.87078,123.27695 110.74021,113.11285 113.72954,107.93622 114.7616,106.97129 116.56776,107.66438 118.98998,108.59387 120.29906,113.90021 119.68397,120.29587 118.0626,137.15474 108.52579,148.86751 92.151673,154.11007 83.863636,156.76368 66.685909,157.5743 60,155.62732 z",
		off_x: base_x + 820,
		off_y: base_y + 80
	    },

	    'e2_in': {
		str: "M 73.512801,80.817638 C 84.935279,75.300916 93.255012,62.652433 93.415608,50.097525 93.56179,38.66944 89.721375,33.833333 80.5,33.833333 70.907345,33.833333 63.016621,42.16994 58.572401,57 56.753712,63.068841 55.373699,79.36848 56.349423,83.256076 56.951029,85.653067 57.139272,85.70318 62.235453,84.823037 65.130954,84.322966 70.134488,82.449264 73.512801,80.817638 z",
		off_x: base_x + 820,
		off_y: base_y + 80
	    }

	};

	var num_part, i, e;
	for( path_id in path_strings ) {

	    var parts = path_strings[path_id].str.split(' ');

	    var cur_x = path_strings[path_id].off_x;
	    var cur_y = path_strings[path_id].off_y;

	    var _off_x = path_strings[path_id].off_x;
	    var _off_y = path_strings[path_id].off_y;

	    var path_datas = [];
	    var anchor_points = [];

	    var tool_it = 0; var tool = false;
	    var point_type;

	    num_part = parts.length;
	    for( i=0; i<num_part; i++ ) {
		e = parts[i];

		//if( e == 'm' || e == 'c' || e == 'l' || e == 'z' ) {
		if( e == 'M' || e == 'C' || e == 'L' || e == 'z' ) {
		    path_datas.push(e.toUpperCase());
		    tool = e;
		    tool_it = 0;
		}
		else {
		    var points = e.split(',');
		    x = Number(points[0]);
		    y = Number(points[1]);

		    if( tool == 'c' ) {
			tool_it++;
			if( tool_it == 3 ) {
			    //cur_x += x;
			    //cur_y += y;
			    cur_x = _off_x+x;
			    cur_y = _off_y+y;
			    if( rev_ctl_i != path_datas.length -1 ) {
				rev_ctl_i = null;
			    }
			    path_datas.push( {x:cur_x, y:cur_y, point_type:'anchor', rev_ctl_i:rev_ctl_i} );
			    anchor_points.push( { og_x:cur_x, og_y:cur_y, cur_x:cur_x, cur_y:cur_y, speed_x:0, speed_y:0, path_i:path_datas.length-1 } );
			    tool_it = 0;
			}
			else {
			    if( tool_it == 1 ) {
				//ctl of prev anchor.
				path_datas[path_datas.length-1].fwd_ctl_i = path_datas.length;
			    }
			    else {
				rev_ctl_i = path_datas.length;
			    }
			    point_type = ( tool_it == 1 ? 'ctl_a' : 'ctl_b' );
			    //path_datas.push( { x:cur_x+x, y:cur_y+y, point_type:point_type } );
			    path_datas.push( { x:_off_x+x, y:_off_y+x, point_type:point_type } );

			}
		    }
		    else if( tool == 'l' ) {
			//cur_x += x;
			//cur_y += y;
			cur_x = _off_x+x;
			cur_y = _off_y+y;
			path_datas.push( { x:cur_x, y:cur_y, point_type:'anchor'} );
			anchor_points.push( { og_x:cur_x, og_y:cur_y, cur_x:cur_x, cur_y:cur_y, speed_x:0, speed_y:0, path_i:path_datas.length-1 } );
		    }
		    else {
			//cur_x += x;
			//cur_y += y;
			cur_x = _off_x+x;
			cur_y = _off_y+y;
			path_datas.push( { x:cur_x, y:cur_y, point_type:'anchor'} );
			anchor_points.push( { og_x:cur_x, og_y:cur_y, cur_x:cur_x, cur_y:cur_y, speed_x:0, speed_y:0, path_i:path_datas.length-1 } );
		    }
		}
	    }

	    var rnd_col = this.getRandomColor();
	    var rnd_col2 = (path_id == 'e1_in' || path_id == 'e2_in' ) ? '#FFFFFF' : this.getRandomColor();
	    var attr = (path_strings[path_id].bg_color ?
			{ fill:path_strings[path_id].bg_color, stroke:'none' }
			: {stroke: rnd_col, 'stroke-width':5, 'fill': rnd_col2} );

	    this.paths[path_id] = {};
	    this.paths[path_id].og_path_datas = path_datas;
	    this.paths[path_id].anchor_points = anchor_points;
	    this.paths[path_id].elem = this.raph.path( this.getSvgPath(path_datas) ).attr(attr);
	}
    },


    getSvgPath: function( datas ) {
	var svg_str = '';
	datas.each( function(e) {
	    if( e == 'M' || e == 'C' || e == 'L' || e == 'Z' ) {
		svg_str += e+' ';
	    }
	    else {
		svg_str += e.x + ',' + e.y+' ';
	    }
	});

	return svg_str;
    }
});


document.observe( 'dom:loaded', function() {
    welcome = new Welcome();
});
