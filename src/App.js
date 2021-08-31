import * as THREE from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-fatline';
//scene
let canvas, camera, scene, light, renderer;
//for line
let posArray = [];
let lineMtl, lineGeometry, curve;


//params
let params = {
	sceneWidth: 850,
	sceneHeight: 450,
	bgColor: 0xaaaadd,
	cameraProps: {
		visibilityLength: 1000,
		startPosition: new THREE.Vector3(0.0, 10.0, 1000.0)
	},
	line: {
		width: 10.0, //px
		color: 0xffffff
	}
};

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

		const geometry = new THREE.BoxGeometry( 10, 10, 10);
		const material = new THREE.MeshPhysicalMaterial( {color: 0xcccccc} );
		const cube = new THREE.Mesh(geometry, material);
		cube.rotation.set(0.3, 0.3, 0.1);
		cube.position.set(-10.0, params.cameraProps.startPosition.y, 0.0);
		cube.receiveShadow = true;
		scene.add(cube);
		
		//line
		lineMtl = new LineMaterial({
			color: params.line.color,
			linewidth: params.line.width, 
			resolution: new THREE.Vector2(params.sceneWidth, params.sceneHeight)
		});

		lineGeometry = new LineGeometry();
		
		for (let i = params.cameraProps.startPosition.z; i > 800; i--) {
			let x = 3.0 * Math.sin(i * 0.05);
			posArray.push(x, 0.0, i);
		};
		
		lineGeometry.setPositions(posArray);
		curve = new Line2(lineGeometry, lineMtl);
		scene.add(curve)

		renderer.render(scene, camera);
		canvas.addEventListener('mousemove', onMouseMove, false);
		canvas.addEventListener('wheel', onScroll, false);

		animate();
	}
}

function onMouseMove(e) {    
    let w = document.documentElement.clientWidth;
    let h = document.documentElement.clientHeight;
    let wk = 3.0 * (e.x - w * 0.5) / w;
	let hk = 3.0 * (e.y - h * 0.5) / h;
	camera.position.x = wk;
	camera.position.y = params.cameraProps.startPosition.y + hk;
	camera.lookAt(0, params.cameraProps.startPosition.y,
		camera.position.z - params.cameraProps.visibilityLength);
}
function onScroll(e) {
	if (camera.position.z + e.deltaY * 0.1 < params.cameraProps.startPosition.z) {
		camera.position.z += e.deltaY * 0.1;
		scene.remove(curve);
		lineGeometry = new LineGeometry();
		
		let i = camera.position.z - 200;
		let x = 3.0 * Math.sin(i * 0.05);
		posArray.push(x, 0.0, i);
		
		lineGeometry.setPositions(posArray);
		curve = new Line2(lineGeometry, lineMtl);
		scene.add(curve)
	}
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

export default App;
