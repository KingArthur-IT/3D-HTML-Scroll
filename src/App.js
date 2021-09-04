import * as THREE from 'three';
import { PropertyBinding, RepeatWrapping } from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-fatline';

//scene
let canvas, camera, scene, light, renderer;
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
	bgColor: 0x537fd8,
	cameraProps: {
		visibilityLength: 6000,
		startPosition: new THREE.Vector3(0.0, 10.0, 1000.0),
		maxZPosition: -1000,
		rotationAmplitude: 3.0,
		isMoving: false,
		isMovingForward: true,
		nextPosition: 0
	},
	railway: {
		width: 3.0, //px
		color: 0xffffff,
		forwardLength: 200,
		sinAmplitude: 3.0,
		sinPhase: 0.01,
		middleOffset: 0.05,
		roadWidth: 2.0,
		railwaySleeperFrequency: 5,
	},
	wheelScrollingStep: 5.0,
	wheelStep: -300.0,
	isWheelStepEnding: false,
	terrain: {
		color: 0xcccccc,
		gridColor: 0xffffff,
		width: 2000,
		height: 2000,
		segmentsCount: 256,
		xRotation: -Math.PI / 2,
		yPosition: -3.0,
		smoothing: 300
	},
	cloud: {
		src: './assets/img/cloud.png',
		count: 40,
		size: 250,
	},
	styles: {
		orangeColor: '#ED7817',
		gray50: 'rgba(0, 0, 0, 0.5)'
	}
};

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

		const Boxgeometry = new THREE.BoxGeometry( 10, 10, 10);
		const material = new THREE.MeshPhysicalMaterial( {color: 0xcccccc} );
		const cube = new THREE.Mesh(Boxgeometry, material);
		cube.rotation.set(0.3, 0.3, 0.1);
		cube.position.set(-10.0, params.cameraProps.startPosition.y, 0.0);
		cube.receiveShadow = true;
		scene.add(cube);
		
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
		//добавить точки к рельсам и шпалы
		for (let i = params.cameraProps.startPosition.z; i >= 850; i--) {
			let x = params.railway.sinAmplitude * Math.sin(i * params.railway.sinPhase);
			//добавить точки для рельс
			posArrayLeft.push(x, 0.0, i);
			posArrayRight.push(x + params.railway.roadWidth, 0.0, i);

			//создать шпалы
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

		createLandspape();
		createClouds();	

		document.getElementsByClassName('visual-nav__item')[0].style.background = params.styles.orangeColor;
		renderer.render(scene, camera);
		canvas.addEventListener('mousemove', onMouseMove, false);
		canvas.addEventListener('wheel', onScroll, false);

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
	camera.lookAt(0, params.cameraProps.startPosition.y,
		camera.position.z - params.cameraProps.visibilityLength);
}
function onScroll(e) {
	let wheelStep = Math.sign(e.deltaY) * params.wheelStep;
	if (camera.position.z + wheelStep < params.cameraProps.startPosition.z &&
		camera.position.z + wheelStep > params.cameraProps.maxZPosition + 0.5 * params.railway.forwardLength) {
		params.cameraProps.isMoving = true;
		params.cameraProps.isMovingForward = Math.sign(e.deltaY) > 0 ? true : false;
		params.cameraProps.nextPosition = camera.position.z + wheelStep;
	}
}

function createLandspape() {
	// Create plane of the terrain
	const planeGeometry = new THREE.PlaneBufferGeometry(
		params.terrain.width, params.terrain.height,
		params.terrain.segmentsCount * 2.0, params.terrain.segmentsCount);
	//let terainMaterial = new THREE.MeshLambertMaterial({ color: params.terrain.color });
	
	//const loader = new THREE.TextureLoader();
	const terainMaterial = new THREE.MeshLambertMaterial({
		/*
		map: loader.load('./assets/img/grid.png', function (texture) {
				texture.minFilter = THREE.LinearFilter;
				texture.repeat.set(400, 500),
				texture.wrapS = texture.wrapT = RepeatWrapping
		}),*/
		color: params.terrain.color,
		transparent: true
	});

	let terrain = new THREE.Mesh( planeGeometry, terainMaterial );
	terrain.rotation.x = params.terrain.xRotation;
	terrain.position.y = params.terrain.yPosition;
	scene.add(terrain);
	// Create grid of the terrain
	/*
	let terainGridMaterial = new THREE.MeshLambertMaterial({ color: params.terrain.gridColor, wireframe: true });
	let terrainGrid = new THREE.Mesh( planeGeometry, terainGridMaterial );
	terrainGrid.rotation.x = params.terrain.xRotation;
	terrainGrid.position.y = params.terrain.yPosition;
	scene.add(terrainGrid);
	*/
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

	for (var i = 0; i <= vertices.length; i += 3) {
		let peek = Math.abs(vertices[i]);
		vertices[i+2] =  0.3 * peek * perlin.noise(
			(terrain.position.x + vertices[i])/smoothing, 
			(terrain.position.z + vertices[i+1])/smoothing
		);
		if (vertices[i] != undefined )
			pointVertices.push(vertices[i], vertices[i + 2] + params.terrain.yPosition, -vertices[i + 1]);
	}
	terrain.geometry.attributes.position.needsUpdate = true;
	//terrainGrid.geometry.attributes.position.needsUpdate = true;
	terrain.geometry.computeVertexNormals();
	//terrainGrid.geometry.computeVertexNormals();

	geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(pointVertices), 3 ) );
	let particles = new THREE.Points(geometry, material);
	scene.add(particles);
}

function createClouds() {
	const positions = [{'x': -142.3, 'y': -590.4},
						{'x': 49.0, 'y': -368.18204414654247},
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
						{'x': -598.6, 'y':-601.0},
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
						{'x': -90.1, 'y': -1558.33}]
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

function newRails(scrollStep) {
	scene.remove(curveLeft);
	scene.remove(curveRight);
	lineGeometryLeft = new LineGeometry();
	lineGeometryRight = new LineGeometry();

	let zPos 	= posArrayLeft[posArrayLeft.length - 1] + scrollStep;
	let x = params.railway.sinAmplitude * Math.sin(zPos * params.railway.sinPhase);
	posArrayLeft.push(x, 0.0, zPos);
	posArrayRight.push(x + params.railway.roadWidth, 0.0, zPos);

	lineGeometryLeft.setPositions(posArrayLeft);
	lineGeometryRight.setPositions(posArrayRight);
	curveLeft = new Line2(lineGeometryLeft, railMtl);
	curveRight = new Line2(lineGeometryRight, railMtl);
	scene.add(curveLeft);
	scene.add(curveRight);

	//шпалы
	let lineGeometry = new LineGeometry();
	let pos = [x + params.railway.middleOffset, 0.0, zPos,
			x + params.railway.roadWidth - params.railway.middleOffset, 0.0, zPos];
	lineGeometry.setPositions(pos);
	let line = new Line2(lineGeometry, betweenRailMtl);
	scene.add(line);
}

function animate() {
	if (params.cameraProps.isMoving) {
		let oneScroll = params.wheelScrollingStep;
		//step
		let step = params.cameraProps.isMovingForward ? -oneScroll : oneScroll;
		//is ending
		if ((camera.position.z - 80 <= params.cameraProps.nextPosition && params.cameraProps.isMovingForward) ||
			(camera.position.z + 80 >= params.cameraProps.nextPosition && !params.cameraProps.isMovingForward)
		) params.isWheelStepEnding = true;
		else
			params.isWheelStepEnding = false;

		//move cam
		if (!params.isWheelStepEnding)
			camera.position.z += step;
		else {
			let distToEnd = params.cameraProps.isMovingForward ?
				camera.position.z - params.cameraProps.nextPosition :
				params.cameraProps.nextPosition - camera.position.z;
			camera.position.z += step * distToEnd * 0.01;	
		}
		//draw new rails forward
		if (params.cameraProps.isMovingForward &&
			camera.position.z - posArrayLeft[posArrayLeft.length - 1] <= params.railway.forwardLength &&
			!params.isWheelStepEnding)
			newRails(-oneScroll * 2.0);
		//stop moving?
		if ((camera.position.z <= params.cameraProps.nextPosition && params.cameraProps.isMovingForward) ||
			(camera.position.z >= params.cameraProps.nextPosition && !params.cameraProps.isMovingForward)
		) {
			params.cameraProps.isMoving = false;
			params.isWheelStepEnding = false;
		}


		let stopStep = (params.cameraProps.maxZPosition + 2.2 * params.railway.forwardLength - params.cameraProps.startPosition.z) / 4.0;
		for (let stops = 1; stops < 5; stops++){
			let pos = params.cameraProps.startPosition.z + stops * stopStep;
			let prevPos = params.cameraProps.startPosition.z + (stops - 1) * stopStep;

			//for items
			if (camera.position.z <= pos) {
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
			}
		}
	}
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

export default App;
