import * as THREE from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-fatline';

//scene
let canvas, camera, scene, light, renderer;
let raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
//for line
let posArrayLeft = [],
	posArrayRight = [];
let railMtl, betweenRailMtl,
	lineGeometryLeft, curveLeft,
	lineGeometryRight, curveRight;
//params
let params = {
	sceneWidth: 850,
	sceneHeight: 450,
	bgColor: 0xd5d5d5,
	bgSrc: './assets/img/bg.png',
	cameraProps: {
		visibilityLength: 4000,
		startPosition: new THREE.Vector3(0.0, 13.0, 2000.0),
		maxZPosition: -3700.0,
		rotationAmplitude: 3.0,
		isMoving: false,
		isMovingForward: true,
		nextPosition: 0,
		isSceneActive: true,
		targetAngle: 0,
		firstStepAutoScroll: true
	},
	railway: {
		width: 1.5, //px
		color: 0xf3f3f3,
		forwardLength: 200,
		sinAmplitude: 3.0,
		sinPhase: 0.01,
		middleOffset: -0.15,
		roadWidth: 1.25,
		railwaySleeperFrequency: 2.0,
	},
	wheelScrollingStep: 5.0,
	currentWheelScrollingStep: 5.0,
	wheelStep: -100.0,
	isWheelStepEnding: false,
	terrain: {
		color: 0xececec,
		gridColor: 0xffffff,
		width: 2500,
		height: 8000,
		segmentsCount: 400,
		xRotation: -Math.PI / 2,
		yPosition: -3.0,
		smoothing: 900
	},
	cloud: {
		src: './assets/img/cloud.png',
		count: 40,
		size: 250,
	},
	styles: {
		orangeColor: '#ED7817',
		gray50: 'rgba(0, 0, 0, 0.5)'
	},
	stopsCount: 6,
	currentStop: 1,
	stopsZPositionArray: [2000, 1400, 400, -1000, -3000, -3700],
	billboard: {
		width: 40.0,
		height: 20.0,
		yPosition: 15.0,
		xPosition: 30.0,
		yAngle: 0.15
	}
};
let intermidiateObjects = []

class Perlin {
    constructor() {
        this.grad3 =    
            [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 
        this.p = [];
        for (var i=0; i<256; i++) {
            this.p[i] = Math.floor(Math.random()*256);
        }
        
        // To remove the need for index wrapping, double the permutation table length 
        this.perm = []; 
        for(i=0; i<512; i++) {
            this.perm[i]=this.p[i & 255];
        } 

        // A lookup table to traverse the simplex around a given point in 4D. 
        // Details can be found where this table is used, in the 4D noise method. 
        this.simplex = [ 
            [0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0], 
            [0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0], 
            [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
            [1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0], 
            [1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0], 
            [0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0], 
            [2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0], 
            [2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]; 
    }

    dot(g, x, y) { 
        return g[0]*x + g[1]*y;
    }

    noise(xin, yin) { 
        var n0, n1, n2; // Noise contributions from the three corners 
        // Skew the input space to determine which simplex cell we're in 
        var F2 = 0.5*(Math.sqrt(3.0)-1.0); 
        var s = (xin+yin)*F2; // Hairy factor for 2D 
        var i = Math.floor(xin+s); 
        var j = Math.floor(yin+s); 
        var G2 = (3.0-Math.sqrt(3.0))/6.0; 
        var t = (i+j)*G2; 
        var X0 = i-t; // Unskew the cell origin back to (x,y) space 
        var Y0 = j-t; 
        var x0 = xin-X0; // The x,y distances from the cell origin 
        var y0 = yin-Y0; 
        // For the 2D case, the simplex shape is an equilateral triangle. 
        // Determine which simplex we are in. 
        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords 
        if(x0>y0) {i1=1; j1=0;} // lower triangle, XY order: (0,0)->(1,0)->(1,1) 
        else {i1=0; j1=1;}      // upper triangle, YX order: (0,0)->(0,1)->(1,1) 
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and 
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where 
        // c = (3-sqrt(3))/6 
        var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords 
        var y1 = y0 - j1 + G2; 
        var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords 
        var y2 = y0 - 1.0 + 2.0 * G2; 
        // Work out the hashed gradient indices of the three simplex corners 
        var ii = i & 255; 
        var jj = j & 255; 
        var gi0 = this.perm[ii+this.perm[jj]] % 12; 
        var gi1 = this.perm[ii+i1+this.perm[jj+j1]] % 12; 
        var gi2 = this.perm[ii+1+this.perm[jj+1]] % 12; 
        // Calculate the contribution from the three corners 
        var t0 = 0.5 - x0*x0-y0*y0; 
        if(t0<0) n0 = 0.0; 
        else { 
            t0 *= t0; 
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);  // (x,y) of grad3 used for 2D gradient 
        } 
        var t1 = 0.5 - x1*x1-y1*y1; 
        if(t1<0) n1 = 0.0; 
        else { 
            t1 *= t1; 
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1); 
        }
        var t2 = 0.5 - x2*x2-y2*y2; 
        if(t2<0) n2 = 0.0; 
        else { 
            t2 *= t2; 
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2); 
        } 
        // Add contributions from each corner to get the final noise value. 
        // The result is scaled to return values in the interval [-1,1]. 
        return 70.0 * (n0 + n1 + n2); 
    }
}

class App {
	init() {
		canvas = document.getElementById('canvas');
		params.sceneWidth = document.documentElement.clientWidth;
		params.sceneHeight = document.documentElement.clientHeight;
		canvas.setAttribute('width', 	params.sceneWidth);
		canvas.setAttribute('height', 	params.sceneHeight);
		
		//scene and camera
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(40.0, params.sceneWidth / params.sceneHeight, 0.1, params.cameraProps.visibilityLength);
		camera.position.copy(params.cameraProps.startPosition);
		camera.lookAt( params.cameraProps.startPosition.x, params.cameraProps.startPosition.y, params.cameraProps.startPosition - params.cameraProps.visibilityLength );

		//light
		light = new THREE.AmbientLight(0xffffff, 0.8);
		const light2 = new THREE.PointLight(0xffffff, 0.2);
		light.position.set(0.0, 20.0, 0.0);
		light2.position.set(0.0, 100.0, 0.0);
		light2.castShadow = true;
		scene.add(light);
		scene.add(light2);
		
		//renderer
		renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
		renderer.setClearColor(params.bgColor);
		renderer.shadowMap.enabled = true;

		//Load background texture
		let bgLoader = new THREE.TextureLoader();
		bgLoader.load(params.bgSrc, function (texture) {
			texture.minFilter = THREE.LinearFilter;
			//scene.background = texture;
		});
		
		//материалы к рельсам
		railMtl = new LineMaterial({
			color: params.railway.color,
			linewidth: params.railway.width, 
			resolution: new THREE.Vector2(params.sceneWidth, params.sceneHeight)
		});
		//материалы к шпалам
		betweenRailMtl = new LineMaterial({
			color: params.railway.color,
			linewidth: 2.0 * params.railway.width, 
			resolution: new THREE.Vector2(params.sceneWidth, params.sceneHeight)
		});

		//рельсы
		lineGeometryLeft = new LineGeometry();
		lineGeometryRight = new LineGeometry();
		//rails and rail sleepers
		for (let i = params.cameraProps.startPosition.z; i >= params.cameraProps.maxZPosition; i--) {
			let x = params.railway.sinAmplitude * Math.sin(i * params.railway.sinPhase);
			//add points for rails
			posArrayLeft.push(x, 0.0, i);
			posArrayRight.push(x + params.railway.roadWidth, 0.0, i);
			
			//add rail sleeper
			if (i % params.railway.railwaySleeperFrequency == 0) {
				const lineGeometry = new LineGeometry();
				const pos = [x + params.railway.middleOffset, 0.0, i,
					x + params.railway.roadWidth - params.railway.middleOffset, 0.0, i];
				lineGeometry.setPositions(pos);
				const line = new Line2(lineGeometry, betweenRailMtl);
				scene.add(line);
			}
		};

		//создать рельсы
		lineGeometryLeft.setPositions(posArrayLeft);
		lineGeometryRight.setPositions(posArrayRight);
		curveLeft = new Line2(lineGeometryLeft, railMtl);
		curveRight = new Line2(lineGeometryRight, railMtl);
		scene.add(curveLeft);
		scene.add(curveRight);

		//Create lanscape and clouds
		createLandspape();
		createClouds();
		
		createIntermidiateElements();

		//visual nav map 
		document.getElementsByClassName('visual-nav__item')[0].style.background = params.styles.orangeColor;
		//clickable nav map
		for (let index = 2; index < 7; index++) {
			document.getElementsByClassName('visual-nav__item')[index - 1].addEventListener('mousedown', () => {
				closeLayout();
				camera.position.z = params.stopsZPositionArray[index - 1];
				params.currentStop = index - 1;
				changeNavMap();
				setTimeout(() => {
					showLayout();
				}, 1000);
				params.cameraProps.isSceneActive = false;
				camera.rotation.y = 0.0;
				params.cameraProps.targetAngle = 0.0;
				RotateCamera();
			});
		}
		
		renderer.render(scene, camera);

		//events
		window.addEventListener('mousemove', onMouseMove, false);
		window.addEventListener('mousedown', onMouseDown, false);
		window.addEventListener('wheel', onScroll, false);

		camera.lookAt(0, params.cameraProps.startPosition.y,
			camera.position.z - params.cameraProps.visibilityLength);
		animate();

	}
}

function onMouseMove(e) {    
    let w = document.documentElement.clientWidth;
    let h = document.documentElement.clientHeight;
    let wk = params.cameraProps.rotationAmplitude * (e.x - w * 0.5) / w;
	let hk = params.cameraProps.rotationAmplitude * (e.y - h * 0.5) / h;
	camera.position.x = wk;
	camera.position.y = params.cameraProps.startPosition.y + hk;

	//for raycaster
	pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
	pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
	
}

function onMouseDown() {
	if (params.cameraProps.isSceneActive) {
		raycaster.setFromCamera(pointer, camera);
		const intersects = raycaster.intersectObjects(scene.children);
		if (intersects.length > 0 && params.cameraProps.isSceneActive) {
			let objName = intersects[0].object.name;
			if (objName != '' && scene.getObjectByName(objName).material.opacity > 0) {
				document.getElementsByClassName('popup-wrapper')[0].style.display = 'block';
				document.getElementsByClassName('popup__img')[0].src = './assets/layout-img/' + objName;

				params.cameraProps.isSceneActive = false;
			}
		}
	}
}

function onScroll(e) {	
	scrollToSecondScreen(e.deltaY);
	
	if (document.getElementsByClassName('canvas-wrapper')[0].style.display == '' || 
		document.getElementsByClassName('transition')[0].style.opacity == '')
		return;

	//for last stop
	if (document.getElementsByClassName('city-finale')[0].style.opacity > 0 && e.deltaY < 0) {
		document.getElementsByClassName('city-finale')[0].style.opacity = 0.0;
		document.getElementsByClassName('city-finale')[0].style.display = 'none';
	}
	
	//close layer on stop by scroll
	if (!params.cameraProps.isSceneActive && //scene is not active
		Math.abs(camera.rotation.y) < 0.15 && //front face 
		!params.cameraProps.isMoving //cam is not moving
	)
	{
		closeLayout();
		params.cameraProps.isSceneActive = true;
	}
	
	changeFinalLayout(e.deltaY);
	if (!params.cameraProps.isSceneActive) return;
	let wheelStep = Math.sign(e.deltaY) * params.wheelStep;
	if (camera.position.z + wheelStep < params.cameraProps.startPosition.z &&
		camera.position.z + wheelStep > params.cameraProps.maxZPosition) {
		params.cameraProps.isMoving = true;
		params.cameraProps.isMovingForward = Math.sign(e.deltaY) > 0 ? true : false;
		params.cameraProps.nextPosition = camera.position.z + wheelStep;
		params.currentWheelScrollingStep = params.wheelScrollingStep;
	}
}

function createLandspape() {
	// Create plane of the terrain
	const planeGeometry = new THREE.PlaneBufferGeometry(
		params.terrain.width, params.terrain.height,
		params.terrain.segmentsCount * 2.0, params.terrain.segmentsCount);

	const terainMaterial = new THREE.MeshPhongMaterial({
		color: params.terrain.color,
		transparent: true
	});

	let terrain = new THREE.Mesh(planeGeometry, terainMaterial);
	terrain.receiveShadow = true;
	terrain.rotation.x = params.terrain.xRotation;
	terrain.position.y = params.terrain.yPosition;
	scene.add(terrain);
	//terain transorm
	let perlin = new Perlin();
	let smoothing = params.terrain.smoothing;
	let vertices = terrain.geometry.attributes.position.array;
	//let verticesGrid = terrain.geometry.attributes.position.array;

	var geometry = new THREE.BufferGeometry();
	var material = new THREE.PointsMaterial({
		size: 2,
		color: 0xffffff,
		sizeAttenuation: false
	});
	let pointVertices = [];
	let length = params.terrain.height / 2.0;

	for (var i = 0; i <= vertices.length; i += 3) {
		let peek = 0.3 * Math.abs(vertices[i]);
		if (vertices[i + 1] > 0)
			peek = peek * (length - vertices[i + 1]) / length;
		vertices[i+2] =  peek * perlin.noise(
			(terrain.position.x + vertices[i])/smoothing, 
			(terrain.position.z + vertices[i+1])/smoothing
		);
		if (vertices[i] != undefined )
			pointVertices.push(vertices[i], vertices[i + 2] + params.terrain.yPosition, -vertices[i + 1]);
	}
	terrain.geometry.attributes.position.needsUpdate = true;
	terrain.geometry.computeVertexNormals();

	geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(pointVertices), 3 ) );
	let particles = new THREE.Points(geometry, material);
	scene.add(particles);
}

function createClouds() {
	const positions = [{'x': -142.3, 'y': -590.4},
						{'x': 49.0, 'y': -368.18},
						{'x': 31.0, 'y': -937.74},
						{'x': 283.3, 'y': -1986.4},
						{'x': -463.5, 'y': -285.0},
						{'x': -377.6, 'y': -1640.8},
						{'x': 624.0, 'y': -1379.0},
						{'x': 34.3, 'y': -1520.0},
						{'x': -476.0, 'y': -614.1},
						{'x': -432.9, 'y': -212.0},
						{'x': 213.3, 'y': -1462.3},
						{'x': 306.5, 'y': -963.8},
						{'x': 580.0, 'y': -412.2},
						{'x': 50.2, 'y': -796.94},
						{'x': 590.8, 'y': -1577.2 },
						{ 'x': 302.6, 'y': -792.5 },
						{'x': 245.3, 'y': -1173.7},
						{'x': -409.2, 'y': -813.69},
						{'x': 97.7, 'y': -436.903},
						{'x': -333.7, 'y':-1991.07},
						{ 'x': 516.4, 'y': -567.0 },
						{'x': 39.6, 'y':6 -601.19},
						{'x': -59.7, 'y': -1426.04},
						{'x': 384.3, 'y':-129.827},
						{ 'x': 405.8, 'y': 203.5 },
						{ 'x': 218.3, 'y': -173.0 },
						{'x': -612.9, 'y':-1486.41},
						{'x': 243.6, 'y': -643.58},
						{'x': -598.6, 'y':1.0},
						{'x': 590.9, 'y':-394.5},
						{'x': -576.9, 'y':-384.3},
						{'x': 107.5, 'y': -70.4},
						{'x': 699.2, 'y':-1140.13},
						{'x': -29.8, 'y':4 -503.47},
						{'x': 170.3, 'y': -771.7 },
						{'x': -204.1, 'y': -967.0},
						{'x': -673.4, 'y': -666.5 },
						{'x': 220.4, 'y':-63.3303},
						{'x': -116.8, 'y': -712.14},
						{ 'x': -90.1, 'y': -1558.33 },
						{ 'x': -90.1, 'y': -1750.33 },
						{ 'x': 0.0, 'y': -1650.0 },
						{ 'x': 100.0, 'y': -1860.0 },
						{ 'x': 200.0, 'y': -2200.0 },
						{ 'x': 0.0, 'y': -2250.0 },
						{'x': 107.5, 'y': -2500.4},
						{'x': 699.2, 'y':-2500.13},
						{'x': -29.8, 'y':4 -2400.47},
						{'x': 170.3, 'y': -2700.7 },
						{ 'x': -204.1, 'y': -2600.0 },
	 					{'x': 516.4, 'y': -567.0 },
						{'x': 800.6, 'y': -3000.19},
						{'x': -59.7, 'y': -2800.04},
						{'x': 384.3, 'y':-2800.827},
						{ 'x': 405.8, 'y': -2500.5 },
						{ 'x': 718.3, 'y': -3250.0 },
						{'x': -612.9, 'y':-2800.41},
						{'x': 243.6, 'y': 3200.58},
						{ 'x': -598.6, 'y': 2800.0 },
						{ 'x': 0.0, 'y': 2250.0 },
						{'x': 107.5, 'y': 2500.4},
						{'x': 699.2, 'y':2500.13},
						{'x': -29.8, 'y': 2400.47},
						{'x': 170.3, 'y': 2700.7 },
						{ 'x': -204.1, 'y': 4600.0 },
	 					{'x': 516.4, 'y': 5067.0 },
						{'x': 800.6, 'y': 3000.19},
						{'x': -59.7, 'y': 2800.04},
						{'x': 384.3, 'y':-2800.827},
						{ 'x': 405.8, 'y': 7500.5 },
						{ 'x': 718.3, 'y': 3250.0 },
						{'x': -612.9, 'y':-2800.41},
						{'x': 243.6, 'y': 13200.58},
						{'x': 8.6, 'y':10200.0}]
	const cloudGometry = new THREE.BoxGeometry(200, 200, 200, 10, 10, 10);
	const cloudLoader = new THREE.TextureLoader();
	const nullMaterial = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		transparent: true,
		opacity: 0.0
	});
	const cloudMaterial = new THREE.MeshBasicMaterial({
		map: cloudLoader.load(params.cloud.src, function (texture) {
			texture.minFilter = THREE.LinearFilter;
		}),
		transparent: true,
		fog: true,
	});

	for (let index = 0; index < positions.length; index++) {
		let mesh = new THREE.Mesh(cloudGometry,
			[nullMaterial, nullMaterial, nullMaterial, nullMaterial, cloudMaterial, nullMaterial]);
		mesh.position.y = 370;
		mesh.rotation.x = Math.PI / 6.0;
		//mesh.position.x = Math.random() * 1400 - 700;
		mesh.position.x = positions[index].x;
		//mesh.position.z = Math.random() * 2000 - 2000;
		mesh.position.z = positions[index].y;

		scene.add(mesh);
	}
}

function createIntermidiateElements() {
	//after 1st stop
	let pos = params.stopsZPositionArray[2];
	let prevPos = params.stopsZPositionArray[1]

	addIntermediateObject('./assets/layout-img/mining/after/cit-1.png',
		prevPos, pos, 0.22, 1.0, '');
	addIntermediateObject('./assets/layout-img/mining/after/cit-2.png',
		prevPos, pos, 0.22, -1.0, '');
	addIntermediateObject('./assets/layout-img/mining/after/cit-3.png',
		prevPos, pos, 0.38, 1.0, '');
	addIntermediateObject('./assets/layout-img/mining/after/gallery/1.png',
		prevPos, pos, 0.4, -1.0, 'mining/after/gallery/1.png');
	addIntermediateObject('./assets/layout-img/mining/after/gallery/2.png',
		prevPos, pos, 0.5, 1.0, 'mining/after/gallery/2.png');
	addIntermediateObject('./assets/layout-img/mining/after/gallery/3.png',
		prevPos, pos, 0.6, -1.0, 'mining/after/gallery/3.png');
	addIntermediateObject('./assets/layout-img/mining/after/gallery/4.png',
		prevPos, pos, 0.7, 1.0, 'mining/after/gallery/4.png');
	addIntermediateObject('./assets/layout-img/mining/after/gallery/5.png',
		prevPos, pos, 0.8, -1.0, 'mining/after/gallery/5.png');
	
	//after 2nd stop
	pos = params.stopsZPositionArray[3];
	prevPos = params.stopsZPositionArray[2]

	addIntermediateObject('./assets/layout-img/fire-river/after/cit-1.png',
		prevPos, pos, 0.24, 1.0, '');
	addIntermediateObject('./assets/layout-img/fire-river/after/cit-2.png',
		prevPos, pos, 0.24, -1.0, '');
	addIntermediateObject('./assets/layout-img/fire-river/after/gallery/1.png',
		prevPos, pos, 0.33, 1.0, 'fire-river/after/gallery/1.png');
	addIntermediateObject('./assets/layout-img/fire-river/after/gallery/2.png',
		prevPos, pos, 0.4, -1.0, 'fire-river/after/gallery/2.png');
	addIntermediateObject('./assets/layout-img/fire-river/after/gallery/3.png',
		prevPos, pos, 0.5, 1.0, 'fire-river/after/gallery/3.png');
	addIntermediateObject('./assets/layout-img/fire-river/after/gallery/4.png',
		prevPos, pos, 0.6, -1.0, 'fire-river/after/gallery/4.png');
	addIntermediateObject('./assets/layout-img/fire-river/after/gallery/5.png',
		prevPos, pos, 0.7, 1.0, 'fire-river/after/gallery/5.png');
	addIntermediateObject('./assets/layout-img/fire-river/after/gallery/6.png',
		prevPos, pos, 0.8, -1.0, 'fire-river/after/gallery/6.png');
	
	//after 3rd stop
	pos = params.stopsZPositionArray[4];
	prevPos = params.stopsZPositionArray[3]

	addIntermediateObject('./assets/layout-img/steel/after/gallery/1.png',
		prevPos, pos, 0.2, 1.0, 'steel/after/gallery/1.png');
	addIntermediateObject('./assets/layout-img/steel/after/cit-2.png',
		prevPos, pos, 0.3, -1.0, '');
	addIntermediateObject('./assets/layout-img/steel/after/cit-3.png',
		prevPos, pos, 0.3, 1.0, '');
	addIntermediateObject('./assets/layout-img/steel/after/gallery/4.png',
		prevPos, pos, 0.4, -1.0, 'steel/after/gallery/4.png');
	addIntermediateObject('./assets/layout-img/steel/after/cit-5.png',
		prevPos, pos, 0.5, 1.0, '');
	addIntermediateObject('./assets/layout-img/steel/after/cit-6.png',
		prevPos, pos, 0.5, -1.0, '');
	addIntermediateObject('./assets/layout-img/steel/after/gallery/7.png',
		prevPos, pos, 0.6, 1.0, 'steel/after/gallery/7.png');
	addIntermediateObject('./assets/layout-img/steel/after/gallery/8.png',
		prevPos, pos, 0.7, -1.0, 'steel/after/gallery/8.png');
	addIntermediateObject('./assets/layout-img/steel/after/gallery/9.png',
		prevPos, pos, 0.75, 1.0, 'steel/after/gallery/9.png');
	addIntermediateObject('./assets/layout-img/steel/after/cit-10.png',
		prevPos, pos, 0.8, -1.0, '');
	addIntermediateObject('./assets/layout-img/steel/after/gallery/11.png',
		prevPos, pos, 0.85, 1.0, 'steel/after/gallery/11.png');	
}

function addIntermediateObject(picSrc, prevPos, nextPos, place, side, name) {
	//side == 1 for right and -1 for left
	const billboardPlane = new THREE.PlaneGeometry(params.billboard.width, params.billboard.height, 2.0);
	let loader = new THREE.TextureLoader();
	let billboardMaterial = new THREE.MeshBasicMaterial({
		map: loader.load(picSrc, function (texture) {
			texture.minFilter = THREE.LinearFilter;
		}),
		transparent: true,
		opacity: 0.0
	});

	let length = prevPos - nextPos;
	intermidiateObjects.push(new THREE.Mesh(billboardPlane, billboardMaterial));
	let index = intermidiateObjects.length - 1;
	intermidiateObjects[index].position.z = prevPos - length * place;
	intermidiateObjects[index].position.x = side * params.billboard.xPosition;
	intermidiateObjects[index].position.y = params.billboard.yPosition;
	intermidiateObjects[index].rotation.y = - side * params.billboard.yAngle;
	intermidiateObjects[index].name = name;
	scene.add(intermidiateObjects[index]);
}

function animate() {
	//for moving from start to 1st stop
	if (document.getElementsByClassName('transition')[0].style.opacity == '0'
		&& params.currentStop == 1 && params.cameraProps.firstStepAutoScroll) {
		camera.position.z -= 3.0;
		changeNavMap();
		params.cameraProps.nextPosition = params.stopsZPositionArray[1];
		params.cameraProps.isMoving = true;
	}
	if (params.cameraProps.isMoving) {
		MoveCamera();
		changeNavMap();
	}
	RotateCamera();
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

function MoveCamera() {
	if (params.isWheelStepEnding) {
		let distToEnd = camera.position.z - params.cameraProps.nextPosition;
		camera.position.z = camera.position.z - distToEnd * 0.05;
	}
	else {
		let oneScroll = params.currentWheelScrollingStep;
		if (params.currentWheelScrollingStep > 0.1 && 
			params.currentStop != 1.0)
			params.currentWheelScrollingStep -= 0.1;
		let step = params.cameraProps.isMovingForward ? -oneScroll : oneScroll;
		camera.position.z += step;
	}

	let visibilityRadius = 220.0;
	let minVisibilityRadius = 130.0;
	//for intermid objs opacity
	for (let index = 0; index < intermidiateObjects.length; index++) {
		const element = intermidiateObjects[index];
		let distance = Math.abs(camera.position.z - element.position.z);
		if (distance < visibilityRadius)
			element.material.opacity = 1.0 - distance / visibilityRadius;
		else element.material.opacity = 0.0;
		if (distance < minVisibilityRadius)
			element.material.opacity = 1.0;
	}

	//stop cam on stop
	//if (!params.cameraProps.isMovingForward) return;
	
	//stops
	for (let stops = 1; stops < params.stopsCount; stops++){
		let pos;
		let prevPos;
		if (params.cameraProps.isMovingForward) {
			pos = params.stopsZPositionArray[stops];
			prevPos = params.stopsZPositionArray[stops - 1];
		}
		else {
			pos = params.stopsZPositionArray[stops - 1];
			prevPos = params.stopsZPositionArray[stops];
		}
		//for stop
		if (
			(camera.position.z > pos && camera.position.z < prevPos
			&& (camera.position.z - 20.0 < pos) && params.cameraProps.isMovingForward)
			||
			(camera.position.z < pos && camera.position.z > prevPos
			&& (camera.position.z + 20.0 > pos) && !params.cameraProps.isMovingForward)
		)	
		{
			params.isWheelStepEnding = true;
			params.cameraProps.nextPosition = pos;
			params.cameraProps.isSceneActive = false;
			showLayout();
		}
		if (Math.abs(camera.position.z - pos) < 1.0 || 
			Math.abs(camera.position.z - params.cameraProps.nextPosition) < 1.0)
		{
			params.cameraProps.isMoving = false;
			params.isWheelStepEnding = false;
		}

		//for intermediate
		if (camera.position.z > pos && camera.position.z < prevPos &&
			camera.position.z < pos + 250.0 && camera.position.z > pos + 200.0 &&
			stops != 1)
		{
			params.isWheelStepEnding = true;
			params.cameraProps.nextPosition = pos + 190.0;
			params.cameraProps.isSceneActive = false;
			showIntermediateLayout();
		}		
	}
}

function changeNavMap() {
	for (let stops = 1; stops < params.stopsCount; stops++){
		let pos = params.stopsZPositionArray[stops];
		let prevPos = params.stopsZPositionArray[stops - 1]

		//for items
		if (camera.position.z <= pos + 20.0) {
			document.getElementsByClassName('visual-nav__item')[stops].style.background = params.styles.orangeColor;
			document.getElementsByClassName('visual-nav__passed')[stops - 1].style.height = '100%';
		}
		else {
			document.getElementsByClassName('visual-nav__item')[stops].style.background = params.styles.gray50;
			document.getElementsByClassName('visual-nav__passed')[stops - 1].style.height = '0%';
		};
		
		if (camera.position.z < prevPos &&
			camera.position.z > pos)
		{
			let height = Math.abs(100 * (camera.position.z - prevPos) / (prevPos - pos));
			document.getElementsByClassName('visual-nav__passed')[stops - 1].style.height = height + '%';
			params.currentStop = stops;
		}
	}
	//moving current point
	let points = [-0.24, 4.24, 8.75, 13.24, 17.75, 22.24];
	
	for (let stops = 1; stops < params.stopsCount; stops++) {
		let pos = params.stopsZPositionArray[stops];
		let prevPos = params.stopsZPositionArray[stops - 1]
		
		if (camera.position.z < prevPos && camera.position.z > pos) {
			let top = points[stops - 1] + 0.24 + 3.7 * (prevPos - camera.position.z) / (prevPos - pos);
			document.getElementsByClassName('visual-nav__currentPoint')[0].style.top = top + 'rem';
			//if (top > endPos) top = endPos;
		}
		if (Math.abs(camera.position.z - pos) < 20.0) {
			let top = points[stops];
			document.getElementsByClassName('visual-nav__currentPoint')[0].style.top = top + 'rem';
		}
	}	
}

function RotateCamera() {
	if (Math.abs(params.cameraProps.targetAngle - camera.rotation.y) > 0.1) {
		let length = Math.sign(params.cameraProps.targetAngle - camera.rotation.y);
		camera.rotation.y += 0.16 * Math.sin(length);
	}
}

//---3d layout behavior---
//1. close
document.getElementsByTagName('body')[0].addEventListener('click', (e) => {
	let classNames = ["model-wrapper", "stop-info", "stop-section__", "person-item", "hamburger",
		"intermediate__", "visual-nav__"];
    let classList = e.target.className;
    let isClickOnEmptySpace = true;
    for (let i = 0; i < classNames.length; i++){
        if (classList.includes(classNames[i]))
        {
            isClickOnEmptySpace = false;
        }
	}
	if (isClickOnEmptySpace && //if click in empty space
		!params.cameraProps.isSceneActive && //scene is not active
		Math.abs(camera.rotation.y) < 0.15 && //front face 
		!params.cameraProps.isMoving //cam is not moving
	)
	{
		closeLayout();
		params.cameraProps.isSceneActive = true;
	}
})

function changeFinalLayout(delta) {
	if (delta > 0) { //forward
		if (document.getElementsByClassName('city-finale')[0].style.opacity > 0) {
			document.getElementsByClassName('city-finale')[0].style.opacity = 0;
			document.getElementsByClassName('citate-finale')[0].style.display = 'block';
			document.getElementsByClassName('citate-finale')[0].style.opacity = '1.0';
			params.cameraProps.isSceneActive = false;
			return;
		}

		if (document.getElementsByClassName('citate-finale')[0].style.opacity > 0) {
			document.getElementsByClassName('citate-finale')[0].style.opacity = 0;
			document.getElementsByClassName('finale-cta')[0].style.display = 'flex';
			document.getElementsByClassName('finale-cta')[0].style.opacity = '1.0';
		}
	}
	else { //go back
		if (document.getElementsByClassName('citate-finale')[0].style.opacity > 0) {
			document.getElementsByClassName('citate-finale')[0].style.opacity = 0;
			document.getElementsByClassName('citate-finale')[0].style.display = 'none';
			document.getElementsByClassName('city-finale')[0].style.display = 'flex';
			document.getElementsByClassName('city-finale')[0].style.opacity = '1.0';
			params.cameraProps.isSceneActive = true;
			return;
		}

		if (document.getElementsByClassName('finale-cta')[0].style.opacity > 0) {
			document.getElementsByClassName('finale-cta')[0].style.opacity = 0;
			document.getElementsByClassName('finale-cta')[0].style.display = 'none';
			document.getElementsByClassName('citate-finale')[0].style.display = 'flex';
			document.getElementsByClassName('citate-finale')[0].style.opacity = '1.0';
		}

	}
}

function closeLayout() {
	//let stop = params.currentStop - 1;
	for (let stop = 0; stop < 4; stop ++)
	{
		//front face
		document.getElementsByClassName('threeD-layout')[3 * stop].style.opacity = "0.0";  
		document.getElementsByClassName('threeD-layout')[3 * stop].style.zIndex = "0";  
		document.getElementsByClassName('frontFace')[stop].style.top = "-5rem";
		//left face
		document.getElementsByClassName('threeD-layout')[3 * stop + 1].style.opacity = "0.0";
		document.getElementsByClassName('threeD-layout')[3 * stop + 1].style.zIndex = "0";  
		document.getElementsByClassName('leftFace')[stop].style.top = "-5rem";
		//right face
		document.getElementsByClassName('threeD-layout')[3 * stop + 2].style.opacity = "0.0";
		document.getElementsByClassName('threeD-layout')[3 * stop + 2].style.zIndex = "0";  
		document.getElementsByClassName('rightFace')[stop].style.top = "-5rem";
	}
	//intermediate
	for (let stop = 1; stop < 5; stop ++) {
		document.getElementsByClassName('intermediate')[stop - 1].style.opacity = "0.0";
		document.getElementsByClassName('intermediate')[stop - 1].style.zIndex = "0";
		document.getElementsByClassName('intermediate')[stop - 1].style.paddingTop = "0";
	}
	
	setTimeout(() => {
		for (let stop = 0; stop < 4; stop ++){
			document.getElementsByClassName('frontFace')[stop].style.top = "9.0rem";
			document.getElementsByClassName('leftFace')[stop].style.top = "6.5rem";
			document.getElementsByClassName('rightFace')[stop].style.top = "9.0rem";
			document.getElementsByClassName('threeD-layout')[3 * stop].style.display = "none";
			document.getElementsByClassName('threeD-layout')[3 * stop + 1].style.display = "none";
			document.getElementsByClassName('threeD-layout')[3 * stop + 2].style.display = "none";
		}
		for (let stop = 1; stop < 5; stop ++) {
				document.getElementsByClassName('intermediate')[stop - 1].style.paddingTop = "8rem";
				document.getElementsByClassName('intermediate')[stop - 1].style.display = "none";
			}
	}, 1000);

}

//2. show
function showLayout() {
	let stop = params.currentStop - 1;
	for (let stops = 1; stops < params.stopsCount; stops++) {
		let pos = params.stopsZPositionArray[stops];
		let prevPos = params.stopsZPositionArray[stops - 1]
		if (camera.position.z < prevPos && camera.position.z > pos)
		{
			stop = stops - 1;
			params.currentStop = stop;
			if (!params.cameraProps.isMovingForward)
			{
				stop--;
				params.currentStop--;
			}			
		}
	}
	//for last stop
	if (stop == 4) {
		if (document.getElementsByClassName('city-finale')[0].style.opacity > 0.0)
			return;
		document.getElementsByClassName('city-finale')[0].style.display = "flex";
		setTimeout(() => {
			document.getElementsByClassName('city-finale')[0].style.opacity = "1.0";
			document.getElementsByClassName('city-finale')[0].style.zIndex = "10";
		}, 100);
		return;
	};
	if (document.getElementsByClassName('threeD-layout')[3 * stop].style.opacity > 0.0)
		return;
	document.getElementsByClassName('threeD-layout')[3 * stop].style.display = "flex";
	document.getElementsByClassName('threeD-layout')[3 * stop + 1].style.display = "block";
	document.getElementsByClassName('threeD-layout')[3 * stop + 2].style.display = "flex";

	setTimeout(() => {
		document.getElementsByClassName('threeD-layout')[3 * stop].style.opacity = "1.0";
		document.getElementsByClassName('threeD-layout')[3 * stop].style.zIndex = "10";
		document.getElementsByClassName('threeD-layout')[3 * stop + 1].style.opacity = "1.0";
		document.getElementsByClassName('threeD-layout')[3 * stop + 1].style.zIndex = "10";
		document.getElementsByClassName('threeD-layout')[3 * stop + 2].style.opacity = "1.0";
		document.getElementsByClassName('threeD-layout')[3 * stop + 2].style.zIndex = "10";
	}, 100);	
}

//3. from model to info
document.getElementsByClassName('model-wrapper__btn')[0].addEventListener('click', infoAboutObject, false);
document.getElementsByClassName('model-wrapper__btn')[1].addEventListener('click', infoAboutObject, false);
document.getElementsByClassName('model-wrapper__btn')[2].addEventListener('click', infoAboutObject, false);

function infoAboutObject() {
	document.getElementsByClassName('model-wrapper')[params.currentStop - 1].style.opacity = '0';
	setTimeout(() => {
		document.getElementsByClassName('model-wrapper')[params.currentStop - 1].style.transform = 'scale(0.0)';
		document.getElementsByClassName('model-wrapper')[params.currentStop - 1].style.position = 'absolute';
		
        document.getElementsByClassName('stop-info')[params.currentStop - 1].style.opacity = '1.0';
        document.getElementsByClassName('stop-info')[params.currentStop - 1].style.transform = 'scale(1.0)';
        document.getElementsByClassName('stop-info')[params.currentStop - 1].style.position = 'relative';
	}, 600);
}

document.getElementsByClassName('close')[0].addEventListener('click', closeInfoAboutObject, false);
document.getElementsByClassName('close')[1].addEventListener('click', closeInfoAboutObject, false);
document.getElementsByClassName('close')[2].addEventListener('click', closeInfoAboutObject, false);

function closeInfoAboutObject() {
	document.getElementsByClassName('stop-info')[params.currentStop - 1].style.opacity = '0.0';
    setTimeout(() => {
        document.getElementsByClassName('stop-info')[params.currentStop - 1].style.transform = 'scale(0.0)';
        document.getElementsByClassName('stop-info')[params.currentStop - 1].style.position = 'absolute';
        
        document.getElementsByClassName('model-wrapper')[params.currentStop - 1].style.opacity = '1.0';
        document.getElementsByClassName('model-wrapper')[params.currentStop - 1].style.transform = 'scale(1.0)';
        document.getElementsByClassName('model-wrapper')[params.currentStop - 1].style.position = 'relative';
	}, 600);
}


//4.left
document.getElementsByClassName('rotateToLeftBtn')[0].addEventListener('click', rotateToLeftLayout, false); //for stop 1
document.getElementsByClassName('rotateToLeftBtn')[1].addEventListener('click', rotateToLeftLayout, false); //for stop 2
document.getElementsByClassName('rotateToLeftBtn')[2].addEventListener('click', rotateToLeftLayout, false); //for stop 3

function rotateToLeftLayout() {
	document.getElementsByClassName('frontFace')[params.currentStop - 1].style.transform = getTransformFrontStyle(-130);
	document.getElementsByClassName('leftFace')[params.currentStop - 1].style.transform = getTransformLeftStyle(0);

	params.cameraProps.targetAngle = Math.PI / 2.0;

	InitSliders(params.currentStop);
}

document.getElementsByClassName('rotateLeftToBackBtn')[0].addEventListener('click', rotateLeftToBackLayout, false); //for stop 1
document.getElementsByClassName('rotateLeftToBackBtn')[1].addEventListener('click', rotateLeftToBackLayout, false); //for stop 2
document.getElementsByClassName('rotateLeftToBackBtn')[2].addEventListener('click', rotateLeftToBackLayout, false); //for stop 3

function rotateLeftToBackLayout() {
	document.getElementsByClassName('frontFace')[params.currentStop - 1].style.transform = getTransformFrontStyle(0);
	document.getElementsByClassName('leftFace')[params.currentStop - 1].style.transform = getTransformFrontStyle(130);
	params.cameraProps.targetAngle = 0.0;
}

//5. right
for (let index = 0; index < 3 * 4; index++) {
	document.getElementsByClassName('rotateToRightBtn')[index].addEventListener('click', rotateToRightLayout, false);	
};

function rotateToRightLayout() {
	document.getElementsByClassName('frontFace')[params.currentStop - 1].style.transform = getTransformFrontStyle(130);
	document.getElementsByClassName('rightFace')[params.currentStop - 1].style.transform = getTransformRightStyle(0);
	params.cameraProps.targetAngle = -Math.PI / 2.0;
}

document.getElementsByClassName('rotateRightToBackBtn')[0].addEventListener('click', rotateRightToBackLayout, false);
document.getElementsByClassName('rotateRightToBackBtn')[1].addEventListener('click', rotateRightToBackLayout, false);
document.getElementsByClassName('rotateRightToBackBtn')[2].addEventListener('click', rotateRightToBackLayout, false);
document.getElementsByClassName('rotateRightToBackBtn')[3].addEventListener('click', rotateRightToBackLayout, false);

function rotateRightToBackLayout() {
	document.getElementsByClassName('frontFace')[params.currentStop - 1].style.transform = getTransformFrontStyle(0);
	document.getElementsByClassName('rightFace')[params.currentStop - 1].style.transform = getTransformRightStyle(-130);
	params.cameraProps.targetAngle = 0.0;
	document.getElementsByClassName('first-person-description')[params.currentStop - 1].style.opacity = '1.0';
    document.getElementsByClassName('second-person-description')[params.currentStop - 1].style.opacity = '1.0';
    document.getElementsByClassName('third-person-description')[params.currentStop - 1].style.opacity = '1.0';
}

function getTransformFrontStyle(angleY) {
	return 'perspective(1000px) rotateY(' + angleY + 'deg) translateZ(-1000px) scale(2.2)'// translateY(-40%) translateX(-50%)'
}
function getTransformLeftStyle(angleY) {
	return 'perspective(1000px) rotateY(' + angleY + 'deg) translateZ(-1000px) scale(1.8)'// translateY(-50%) translateX(-55%)'
}
function getTransformRightStyle(angleY) {
	return 'perspective(1000px) rotateY(' + angleY + 'deg) translateZ(-1000px) scale(2.0)'// translateY(-45%) translateX(-55%)'
}

//change person description
for (let index = 0; index < 3 * 4; index++) {
	document.getElementsByClassName('setPersonDescription-first')[index].addEventListener('click', setPersonDescriptionFirst, false);
	document.getElementsByClassName('setPersonDescription-second')[index].addEventListener('click', setPersonDescriptionSecond, false);
	document.getElementsByClassName('setPersonDescription-third')[index].addEventListener('click', setPersonDescriptionThird, false);
}

function setPersonDescriptionFirst() {
	let stop = (params.currentStop - 1) * 2;
    for (let index = 0; index < 2; index++) {
		document.getElementsByClassName('first-person-description')[stop + index].style.transform = 'scale(1.0)';
		document.getElementsByClassName('first-person-description')[stop + index].style.opacity = '1.0';
		document.getElementsByClassName('first-person-description')[stop + index].style.position = 'relative';
		document.getElementsByClassName('second-person-description')[stop + index].style.transform = 'scale(0.0)';
		document.getElementsByClassName('second-person-description')[stop + index].style.opacity = '0.0';
		document.getElementsByClassName('second-person-description')[stop + index].style.position = 'absolute';
		document.getElementsByClassName('third-person-description')[stop + index].style.transform = 'scale(0.0)';
		document.getElementsByClassName('third-person-description')[stop + index].style.opacity = '0.0';
		document.getElementsByClassName('third-person-description')[stop + index].style.position = 'absolute';		
	}
}
function setPersonDescriptionSecond() {
    let stop = (params.currentStop - 1) * 2;
    for (let index = 0; index < 2; index++) {
		document.getElementsByClassName('first-person-description')[stop + index].style.transform = 'scale(0.0)';
		document.getElementsByClassName('first-person-description')[stop + index].style.opacity = '0.0';
		document.getElementsByClassName('first-person-description')[stop + index].style.position = 'absolute';
		document.getElementsByClassName('second-person-description')[stop + index].style.transform = 'scale(1.0)';
		document.getElementsByClassName('second-person-description')[stop + index].style.opacity = '1.0';
		document.getElementsByClassName('second-person-description')[stop + index].style.position = 'relative';
		document.getElementsByClassName('third-person-description')[stop + index].style.transform = 'scale(0.0)';
		document.getElementsByClassName('third-person-description')[stop + index].style.opacity = '0.0';
		document.getElementsByClassName('third-person-description')[stop + index].style.position = 'absolute';		
	}
}
function setPersonDescriptionThird() {
    let stop = (params.currentStop - 1) * 2;
    for (let index = 0; index < 2; index++) {
		document.getElementsByClassName('first-person-description')[stop + index].style.transform = 'scale(0.0)';
		document.getElementsByClassName('first-person-description')[stop + index].style.opacity = '0.0';
		document.getElementsByClassName('first-person-description')[stop + index].style.position = 'absolute';
		document.getElementsByClassName('second-person-description')[stop + index].style.transform = 'scale(0.0)';
		document.getElementsByClassName('second-person-description')[stop + index].style.opacity = '0.0';
		document.getElementsByClassName('second-person-description')[stop + index].style.position = 'absolute';
		document.getElementsByClassName('third-person-description')[stop + index].style.transform = 'scale(1.0)';
		document.getElementsByClassName('third-person-description')[stop + index].style.opacity = '1.0';
		document.getElementsByClassName('third-person-description')[stop + index].style.position = 'relative';		
	}
}

//for intermediate
//1. show
function showIntermediateLayout() {
	let stop = params.currentStop - 2;
	if (stop > 4) return;
	
	if (document.getElementsByClassName('intermediate')[stop].style.opacity > 0.0)
		return;
	document.getElementsByClassName('intermediate')[stop].style.display = "flex";

	setTimeout(() => {
		document.getElementsByClassName('intermediate')[stop].style.opacity = "1.0";
		document.getElementsByClassName('intermediate')[stop].style.zIndex = "10";
	}, 100);	
}


//CLOSE POPUP	
document.getElementsByClassName('popup__close')[0].addEventListener("click", function () {
	document.getElementsByClassName('popup-wrapper')[0].style.display = 'none';
	params.cameraProps.isSceneActive = true;
})

//menu
function goToScene(num) {
    document.getElementsByClassName('intro')[0].style.opacity = 0.0;
    document.getElementsByClassName('canvas-wrapper')[0].style.opacity = 1.0;
    document.getElementsByClassName('canvas-wrapper')[0].style.display = 'block';
    setTimeout(() => {
        document.getElementsByClassName('intro')[0].style.display = 'none';
        document.getElementsByClassName('transition')[0].style.opacity = '1.0';
        document.getElementsByClassName('transition')[0].style.opacity = '0.0';
        setTimeout(() => {
            document.getElementsByClassName('transition')[0].style.display = 'none';
        }, 5000);
    }, 1500);

	params.cameraProps.firstStepAutoScroll = false;
	camera.position.z = params.stopsZPositionArray[num];
	params.currentStop = num;
	closeLayout();
	changeNavMap();
	setTimeout(() => {
		showLayout();
		params.cameraProps.isSceneActive = false;
		params.cameraProps.isMoving = false;
	}, 2000);
}

document.getElementsByClassName('goToScene')[0].addEventListener('mousedown', () => {goToScene(1);})
document.getElementsByClassName('goToScene')[1].addEventListener('mousedown', () => {goToScene(2);})
document.getElementsByClassName('goToScene')[2].addEventListener('mousedown', () => {goToScene(3);})
document.getElementsByClassName('goToScene')[3].addEventListener('mousedown', () => {goToScene(4);})
document.getElementsByClassName('goToScene')[4].addEventListener('mousedown', () => {goToScene(5);})

//mini-popup
for (let index = 0; index < 5; index++) {
	document.getElementsByClassName('city-finale__canvas-item')[index].addEventListener('mousedown', () => {
		params.cameraProps.isSceneActive = false;
        let y = document.getElementsByClassName('city-finale__canvas-item')[index].getBoundingClientRect().y;
        let x = document.getElementsByClassName('city-finale__canvas-item')[index].getBoundingClientRect().x;
		let xRight = document.getElementsByClassName('city-finale__canvas-item')[index].getBoundingClientRect().right;
		console.log(x,xRight)
        document.getElementsByClassName('models-popup-wrapper')[0].style.display = "flex";
        document.getElementsByClassName('model-popup-item')[index].style.display = "flex";
        document.getElementsByClassName('model-popup-item')[index].style.top = y + 'px';
        if (index < 3)
            document.getElementsByClassName('model-popup-item')[index].style.left = x + 'px';
        else
			document.getElementsByClassName('model-popup-item')[index].style.left = x - (xRight - x) + 'px';
	})
	
	document.getElementsByClassName('close-mini-popup')[index].addEventListener('mousedown', () => {
		params.cameraProps.isSceneActive = true;
        document.getElementsByClassName('models-popup-wrapper')[0].style.display = "none";
        document.getElementsByClassName('model-popup-item')[index].style.display = "none";
    })
}

export default App;
