import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'; 
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';


//init
const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({ antialias: true});

//Camera
const fov = 50;
const aspect = w / h;
const near = 0.1;
const far = 20;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 3;
camera.position.x = -1;
const scene = new THREE.Scene();


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const uvPoint = new THREE.Vector2();


//Media queries for mobile devices
const mediaQuery = window.matchMedia("(max-width: 1100px)");
const mediaQueryPixelRatio = window.matchMedia("(device-pixel-ratio: 1.5), (max--moz-device-pixel-ratio:1.49), (-webkit-max-device-pixel-ratio:1.99)");
 
if (mediaQuery.matches && mediaQueryPixelRatio.matches) {

  const pixelRatio = window.devicePixelRatio;
  const newPixelRatio = Math.min(1.5, pixelRatio * 0.9);
  renderer.setPixelRatio(newPixelRatio);
}else if(mediaQuery.matches && !mediaQueryPixelRatio.matches){
  renderer.setPixelRatio( window.devicePixelRatio);
  
}else{
  renderer.setPixelRatio( window.devicePixelRatio);
  camera.setViewOffset(w, h, -400, 0, w, h,);
}

renderer.setSize(w,h);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

controls.enablePan = false;
controls.minDistance = 1.2; 
controls.maxDistance = 4;

const loader = new THREE.TextureLoader();
let indx = 0.0;


//objects
const globe = new THREE.Group();
globe.rotation.z = 23.4 * Math.PI / 180;
scene.add(globe);

//cube
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1, 10, 10, 10); 
const cube = new THREE.Mesh(cubeGeometry);
const cubeVertices = cube.geometry.attributes.position.array.slice();

//Cylinder
const cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 25, 25);
const cylinder = new THREE.Mesh(cylinderGeometry);
const cylinderVertices = cylinder.geometry.attributes.position.array.slice();

//Icosahedron
const icoGeometry = new THREE.IcosahedronGeometry(0.5, 3);
const icoMaterial = new THREE.MeshBasicMaterial({ color: 0xdd0000, wireframe: true, opacity: 0.2 });
const ico = new THREE.Mesh(icoGeometry, icoMaterial);
const icoVertices = ico.geometry.attributes.position.array.slice();

//Torus
const torusGeometry = new THREE.TorusGeometry(0.3, 0.1, 50, 16);
const torus = new THREE.Mesh(torusGeometry, icoMaterial);
const torusVertices = torus.geometry.attributes.position.array.slice();

//Cone
const coneGeometry = new THREE.ConeGeometry(0.5, 1, 25, 25);
const cone = new THREE.Mesh(coneGeometry);
const coneVertices = cone.geometry.attributes.position.array.slice();


const colorMap = loader.load('textures/00_earthmap1k.jpg');
const elevMap = loader.load('textures/01_earthbump1k.jpg');
const alphaMask = loader.load('textures/02_earthspec1k.jpg');
const population = loader.load('textures/population.jpg');

const geometry = new THREE.IcosahedronGeometry(1, 10);
const material = new THREE.MeshBasicMaterial( { color: 0x0066aa, wireframe: true, transparent: true, opacity: 0.1} );
const mesh = new THREE.Mesh(geometry, material);
const vertices = mesh.geometry.attributes.position.array.slice();
globe.add(mesh);


const circleGeometry = new THREE.CircleGeometry( 0.5, 60 );
const circleEdges = new THREE.EdgesGeometry( circleGeometry );
const circleMaterial = new THREE.LineBasicMaterial( { color: 0xffffff } );
const circleMesh = new THREE.LineSegments( circleEdges, circleMaterial );
circleMesh.position.y = -1.2;
circleMesh.rotation.x = (Math.PI / 2)
//scene.add(circleMesh);


const pointsGeometry = new THREE.IcosahedronGeometry(1,70);
const vertexShader = `
  uniform float size;
  uniform sampler2D elevTexture;
  uniform vec2 mouseUV;
  uniform sampler2D popTexture;
  uniform float index;

  varying vec2 vUv;
  varying float vVisible;
  varying float vDist;

  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vec3 vNormal = normalMatrix * normal;
    vVisible = step(0.0, dot(-normalize(mvPosition.xyz), normalize(vNormal)));
    
    if(index == 0.0 || index == 1.0){
      float elv = texture2D(elevTexture, vUv).r;
  
      mvPosition.z += 0.35 * elv;
  
      float dist = distance(mouseUV, vUv);
      float zDisp = 0.0;
  
      if(dist < 0.05){
          zDisp = (0.05 - dist) * 8.0;
      }

      
      vDist = dist;
      mvPosition.z += zDisp;

      if(vUv.x > 0.535 && vUv.x < 0.555 && vUv.y > 0.825 && vUv.y < 0.84){
        mvPosition.z += 0.05;
      }
      
      gl_PointSize = size;
      gl_Position = projectionMatrix * mvPosition;
    }else if(index == 2.0){
      float elv = texture2D(popTexture, vUv).r;
      if(elv == 1.0){
        elv = 0.0;
      }
      mvPosition.z += 0.5 * elv;
  
      gl_PointSize = size + 0.5 * elv;
      gl_Position = projectionMatrix * mvPosition;
    }else if(index == 3.0){
      float elv = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
  
      mvPosition.z += 0.35 * elv;
  
      float dist = distance(mouseUV, vUv);
      float zDisp = 0.0;
      gl_PointSize = size;
  
      if(dist < 0.05){
          zDisp = (0.05 - dist) * 300.0;
          gl_PointSize = 2.0 + dist * 500.0;
      }
      
      vDist = dist;
      mvPosition.z -= zDisp;
      
      
      gl_Position = projectionMatrix * mvPosition;
    }else if(index == 4.0){
      float elv = texture2D(elevTexture, vUv).r;
  
      mvPosition.z += 0.35 * elv;
  
      float dist = distance(mouseUV, vUv);
      float zDisp = 0.0;
      gl_PointSize = size;
     
      
      gl_Position = projectionMatrix * mvPosition;
    }

    }
`;

const fragmentShader = `
  uniform sampler2D colorTexture;
  uniform sampler2D alphaTexture;
  uniform sampler2D popTexture;
  uniform float index;

  varying vec2 vUv;
  varying float vVisible;
  varying float vDist;
  void main() {
    if(floor(vVisible + 0.1) == 0.0) discard;
    float alpha = 1.0 - texture2D(alphaTexture, vUv).r;
    vec3 color = vec3(0.9);
    vec3 color2 = vec3(1.0, 0.0, 0.0); 
    vec3 color3 = vec3(0.0, 1.0, 0.0);
    vec3 colorRandom = vec3(
        0.5 + 0.5 * sin(vUv.x * 123.456 + vUv.y * 789.012 + 4321.0),
        0.5 + 0.5 * sin(vUv.x * 234.567 + vUv.y * 901.234 + 1234.0),
        0.5 + 0.5 * sin(vUv.x * 345.678 + vUv.y * 567.890 + 3456.0)
      );

    vec3 other = texture2D(colorTexture, vUv).rgb;

    if(index == 0.0){
      if(vDist < 0.05){
        color = mix(color, color2, (0.05 - vDist) * 30.0);
      }
      if(vUv.x > 0.535 && vUv.x < 0.555 && vUv.y > 0.825 && vUv.y < 0.84){
        color = mix(color3, other, (0.05 - vDist) * 30.0);
      }
      gl_FragColor = vec4(color, alpha); 

    }else if(index == 1.0){

      if(vDist < 0.05){
        color = mix(other, color2, (0.05 - vDist) * 30.0);
      }
      
      gl_FragColor = vec4(other, 4);
    }else if(index  == 2.0){
      float elv = texture2D(popTexture, vUv).r;

      if(elv > 0.05){
        if(elv != 1.0){
          color = mix(color2, color3, elv);
        }
      }

      gl_FragColor = vec4(color, alpha);
    } else if(index == 3.0){
      float elv = texture2D(popTexture, vUv).r;

      if(elv > 0.05){
        if(elv != 1.0){

          color = mix(color, colorRandom, elv);
        }
      }

      gl_FragColor = vec4(colorRandom, alpha);
    }else if(index == 4.0){
      color = vec3(0.7, 0.0, 0.0);

      
      
      gl_FragColor = vec4(color, alpha);
    }
  }
`;

const uniforms = {
    size: {type: "f", value: 2},
    index: {type: "f", value: indx},
    colorTexture: {type: "t", value: colorMap},
    elevTexture: {type: "t", value: elevMap},
    alphaTexture: {type: "t", value: alphaMask},
    popTexture: {type: "t", value: population},
    mouseUV: {type:"v2", value: new THREE.Vector2(0.0, 0.0)}
    
}

const pointsMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader,
    fragmentShader,
    transparent: true
});

const points = new THREE.Points(pointsGeometry, pointsMaterial);
globe.add(points);

const pointsVertices = points.geometry.attributes.position.array.slice();


const pointsMaterial2 = new THREE.PointsMaterial({
    color: 0x00ffff,
    size: 0.009,
    transparent: true,
    opacity: 0.5,
});

const points2 = new THREE.Points(geometry, pointsMaterial2);
globe.add(points2);


//functions
function checkIntersects() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([mesh], false);
    if (intersects.length > 0) {  
        uvPoint.copy(intersects[0].uv);
    }
    uniforms.mouseUV.value = uvPoint;
}

//Animate
function animate(t = 0){
    requestAnimationFrame(animate);
    globe.rotation.y = t*0.00015;
    ico.rotation.y = -t*0.0003;
    // Morph the geometry
    if (mesh && indx == 4.0) {
      morphMeshToVertices(ico, torusVertices);
      const positionAttribute = mesh.geometry.attributes.position;
      const normalizedT = Math.sin(t * 0.001);
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const z = positionAttribute.getZ(i);
        positionAttribute.setX(i, x + normalizedT * Math.sin(x * y * z * 10) * 0.01);
        positionAttribute.setY(i, y);
        positionAttribute.setZ(i, z + normalizedT* Math.cos(z * x * z * 15) * 0.005);
        points2.material.size = 0.01 + Math.sin(t * 0.002) * 0.01;
      }
      

      const positionAttributes = points.geometry.attributes.position;
      for (let i = 0; i < positionAttributes.count; i++) {
        const x = positionAttributes.getX(i);
        const y = positionAttributes.getY(i);
        const z = positionAttributes.getZ(i);
        positionAttributes.setX(i-1, x + normalizedT * Math.sin(x * y * z * 10) * 0.01);
        positionAttributes.setY(i, y + normalizedT * Math.sin(x * y * z * 10) * 0.01);
        positionAttributes.setZ(i, z + normalizedT* Math.cos(z * x * z * 15) * 0.005);
      }
      mesh.geometry.attributes.position.needsUpdate = true;
      points.geometry.attributes.position.needsUpdate = true;
    }else if(indx == 3.0){
      if(scene.children.includes(ico)){
        morphMeshToVertices(ico, cylinderVertices);
      }
      morphMeshToVertices(mesh, vertices)
      morphMeshToVertices(points, pointsVertices)
      points2.material.size = 0.01;
    }else if(indx == 2.0){
      if(scene.children.includes(ico)){
        morphMeshToVertices(ico, coneVertices);
      }
      morphMeshToVertices(mesh, vertices)
      morphMeshToVertices(points, pointsVertices)
      points2.material.size = 0.01;
    }else if(indx == 0.0){
      if(scene.children.includes(ico)){
      morphMeshToVertices(ico, icoVertices);
      }
      morphMeshToVertices(mesh, vertices)
      morphMeshToVertices(points, pointsVertices)
      points2.material.size = 0.01;
    }else if(indx == 1.0){
      if(scene.children.includes(ico)){
        morphMeshToVertices(ico, cubeVertices);
      }
      morphMeshToVertices(mesh, vertices)
      morphMeshToVertices(points, pointsVertices)
      points2.material.size = 0.01;
    }
    checkIntersects();
    renderer.render(scene, camera);
    controls.update();
}
animate();


window.addEventListener('mousemove', onMouseMove, false);
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, false);

const home = document.getElementById('home');
const tech = document.getElementById('tech');
const projects = document.getElementById('projects');
const contact = document.getElementById('contact');
const gallery = document.getElementById('gallery');


function homeFunction(){
pointsMaterial.uniforms.index.value = 0.0;
indx = 0.0;
pointsMaterial.needsUpdate = true;
tech.classList.remove('showOpacity');
tech.classList.add('hideOpacity');
projects.classList.remove('showOpacity');
projects.classList.add('hideOpacity');
contact.classList.remove('showOpacity');
contact.classList.add('hideOpacity');
gallery.classList.remove('showOpacity');
gallery.classList.add('hideOpacity');



//show
home.classList.remove('hideOpacity');
home.classList.add('showOpacity');

}

function techFunction() {
  pointsMaterial.uniforms.index.value = 1.0;
  indx = 1.0;
  pointsMaterial.needsUpdate = true;
  home.classList.remove('showOpacity');
  home.classList.add('hideOpacity');
  projects.classList.remove('showOpacity');
  projects.classList.add('hideOpacity');
  contact.classList.remove('showOpacity');
  contact.classList.add('hideOpacity');
  gallery.classList.remove('showOpacity');
  gallery.classList.add('hideOpacity');



  //show
  tech.classList.remove('hideOpacity');
  tech.classList.add('showOpacity');
}

function projectsFunction() {
  pointsMaterial.uniforms.index.value = 2.0;
  indx = 2.0;
  pointsMaterial.needsUpdate = true;
  tech.classList.remove('showOpacity');
  tech.classList.add('hideOpacity');
  home.classList.remove('showOpacity');
  home.classList.add('hideOpacity');
  contact.classList.remove('showOpacity');
  contact.classList.add('hideOpacity');
  gallery.classList.remove('showOpacity');
  gallery.classList.add('hideOpacity');


//show
projects.classList.remove('hideOpacity');
projects.classList.add('showOpacity');
  
}

function galleryFunction(){
  pointsMaterial.uniforms.index.value = 3.0;
  indx = 3.0;
  pointsMaterial.needsUpdate = true;
  tech.classList.remove('showOpacity');
  tech.classList.add('hideOpacity');
  home.classList.remove('showOpacity');
  home.classList.add('hideOpacity');
  contact.classList.remove('showOpacity');
  contact.classList.add('hideOpacity');
  projects.classList.remove('showOpacity');
  projects.classList.add('hideOpacity');

  //show
  gallery.classList.remove('hideOpacity');
  gallery.classList.add('showOpacity'); 
}

function contactFunction(){
  pointsMaterial.uniforms.index.value = 4.0;
  indx = 4.0;
  pointsMaterial.needsUpdate = true;
  tech.classList.remove('showOpacity');
  tech.classList.add('hideOpacity');
  home.classList.remove('showOpacity');
  home.classList.add('hideOpacity');
  projects.classList.remove('showOpacity');
  projects.classList.add('hideOpacity');
  gallery.classList.remove('showOpacity');
  gallery.classList.add('hideOpacity');



//show
contact.classList.remove('hideOpacity');
contact.classList.add('showOpacity');
}

function morphMeshToVertices(mesh, vertices) {
  const position = mesh.geometry.attributes.position;
  const positionArray = position.array;
  for (let i = 0; i < position.count; i++) {
    const x = positionArray[i * 3];
    const y = positionArray[i * 3 + 1];
    const z = positionArray[i * 3 + 2];
    const dx = vertices[i * 3] - x;
    const dy = vertices[i * 3 + 1] - y;
    const dz = vertices[i * 3 + 2] - z;
    position.setXYZ(
      i,
      x + 0.02 * dx,
      y + 0.015 * dy,
      z + 0.05 * dz
    );
  }
  position.needsUpdate = true;
}

function toggleGeometry(){
  if(!scene.children.includes(ico)){
    scene.add(ico)
    }else{
      scene.remove(ico);
    }
}


document.getElementById("homeButton").addEventListener("click", homeFunction);
document.getElementById("techButton").addEventListener("click", techFunction);
document.getElementById("projectsButton").addEventListener("click", projectsFunction);
document.getElementById("contactButton").addEventListener("click", contactFunction);
document.getElementById("galleryButton").addEventListener("click", galleryFunction);
document.getElementById("geometryButton").addEventListener("click", toggleGeometry);
