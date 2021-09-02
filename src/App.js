import * as THREE from 'three';
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
	bgColor: 0xaaaadd,
	cameraProps: {
		visibilityLength: 1000,
		startPosition: new THREE.Vector3(0.0, 10.0, 1000.0),
		rotationAmplitude: 3.0
	},
	line: {
		width: 5.0, //px
		color: 0xffffff,
		forwardLength: 200,
		sinAmplitude: 3.0,
		sinPhase: 0.01
	},
	scrollStep: 0.1,
	roadWidth: 2.0,
	roadFrequency: 5,
	terrain: {
		color: 0xcccccc,
		gridColor: 0xffffff
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
			color: params.line.color,
			linewidth: params.line.width, 
			resolution: new THREE.Vector2(params.sceneWidth, params.sceneHeight)
		});
		//материалы к шпалам
		betweenRailMtl = new LineMaterial({
			color: params.line.color,
			linewidth: 2.0 * params.line.width, 
			resolution: new THREE.Vector2(params.sceneWidth, params.sceneHeight)
		});

		//рельсы
		lineGeometryLeft = new LineGeometry();
		lineGeometryRight = new LineGeometry();
		//
		for (let i = params.cameraProps.startPosition.z; i > 800; i--) {
			let x = params.line.sinAmplitude * Math.sin(i * params.line.sinPhase);
			//добавить точки для рельс
			posArrayLeft.push(x, 0.0, i);
			posArrayRight.push(x + params.roadWidth, 0.0, i);

			//создать шпалы
			if (i % params.roadFrequency == 0) {
				const lineGeometry = new LineGeometry();
				const pos = [x + 0.05, 0.0, i,
					x + params.roadWidth - 0.05, 0.0, i];
				lineGeometry.setPositions(pos);
				const line = new Line2(lineGeometry, betweenRailMtl);
				scene.add(line);
			}
		};
		
		lineGeometryLeft.setPositions(posArrayLeft);
		lineGeometryRight.setPositions(posArrayRight);
		curveLeft = new Line2(lineGeometryLeft, railMtl);
		curveRight = new Line2(lineGeometryRight, railMtl);
		scene.add(curveLeft);
		scene.add(curveRight);

		renderer.render(scene, camera);
		canvas.addEventListener('mousemove', onMouseMove, false);
		canvas.addEventListener('wheel', onScroll, false);

		// Setup the terrain
		var geometry = new THREE.PlaneBufferGeometry( 2000, 2000, 256, 256 );
		var terainFullMaterial = new THREE.MeshLambertMaterial({color: params.terrain.color});
		var terainGridMaterial = new THREE.MeshLambertMaterial({color: params.terrain.gridColor, wireframe: true});
		var terrain = new THREE.Mesh( geometry, terainFullMaterial );
		var terrainGrid = new THREE.Mesh( geometry, terainGridMaterial );
		terrain.rotation.x = -Math.PI / 2;
		terrainGrid.rotation.x = -Math.PI / 2;
		terrain.position.y = -1.0;
		terrainGrid.position.y = -1.0;
		scene.add( terrain );
		scene.add( terrainGrid );

		var perlin = new Perlin();
		var smoothing = 300;
		var vertices = terrain.geometry.attributes.position.array;
		var verticesGrid = terrain.geometry.attributes.position.array;
		for (var i = 0; i <= vertices.length; i += 3) {				
			verticesGrid[i+2] =  0.5 * Math.abs(verticesGrid[i]) * perlin.noise(
				(terrainGrid.position.x + verticesGrid[i])/smoothing, 
				(terrainGrid.position.z + verticesGrid[i+1])/smoothing
			);
			vertices[i+2] =  0.5 * Math.abs(vertices[i]) * perlin.noise(
				(terrain.position.x + vertices[i])/smoothing, 
				(terrain.position.z + vertices[i+1])/smoothing
			);
		}
		terrain.geometry.attributes.position.needsUpdate = true;
		terrainGrid.geometry.attributes.position.needsUpdate = true;
		terrain.geometry.computeVertexNormals();
		terrainGrid.geometry.computeVertexNormals();

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
	if (camera.position.z + e.deltaY * params.scrollStep < params.cameraProps.startPosition.z) {
		let step = 0.5 * e.deltaY * params.scrollStep;
		let posMiddle = camera.position.z + step;
		let posEnd = camera.position.z + 2.0 * step;

		camera.position.z += 2.0 * step;

		scene.remove(curveLeft);
		scene.remove(curveRight);
		lineGeometryLeft = new LineGeometry();
		lineGeometryRight = new LineGeometry();
		
		let zPosMiddle 	= posMiddle - params.line.forwardLength;
		let zPosEnd 	= posEnd - params.line.forwardLength;
		let xMiddle = params.line.sinAmplitude * Math.sin(zPosMiddle * params.line.sinPhase);
		let xEnd = params.line.sinAmplitude * Math.sin(zPosEnd * params.line.sinPhase);
		posArrayLeft.push(xMiddle, 0.0, zPosMiddle);
		posArrayLeft.push(xEnd, 0.0, zPosEnd);
		posArrayRight.push(xMiddle + params.roadWidth, 0.0, zPosMiddle);
		posArrayRight.push(xEnd + params.roadWidth, 0.0, zPosEnd);
		
		lineGeometryLeft.setPositions(posArrayLeft);
		lineGeometryRight.setPositions(posArrayRight);
		curveLeft = new Line2(lineGeometryLeft, railMtl);
		curveRight = new Line2(lineGeometryRight, railMtl);
		scene.add(curveLeft);
		scene.add(curveRight);

		let lineGeometry = new LineGeometry();
			let pos = [xEnd + 0.05, 0.0, zPosEnd,
				xEnd + params.roadWidth - 0.05, 0.0, zPosEnd];
			lineGeometry.setPositions(pos);
			let line = new Line2(lineGeometry, betweenRailMtl);
		scene.add(line);

		lineGeometry = new LineGeometry();
			pos = [xMiddle + 0.05, 0.0, zPosMiddle,
				xMiddle + params.roadWidth - 0.05, 0.0, zPosMiddle];
			lineGeometry.setPositions(pos);
			line = new Line2(lineGeometry, betweenRailMtl);
			scene.add(line);
	}
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

export default App;
