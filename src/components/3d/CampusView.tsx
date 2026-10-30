import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Compass,
  RotateCcw,
  Building,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Minimize2
} from 'lucide-react';
import { Activity, Club } from '../../types';

interface CampusLocation {
  id: string;
  name: string;
  shortCode: string;
  category: string;
  description: string;
  venueName: string;
  coordinator: string;
  capacity: number;
  position: [number, number, number];
  color: number;
  roofColor: number;
  dimensions: [number, number, number];
}

const CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    id: 'loc-robo-lab',
    name: 'Science & Robotics Laboratory',
    shortCode: 'ROBO-LAB',
    category: 'STEM & Robotics',
    description: 'Advanced testing arena with robotic obstacle circuits, LiDAR testing tunnels, 3D printers, and soldering stations.',
    venueName: 'Robotics & AI Innovation Lab',
    coordinator: 'Dr. Robert Vance',
    capacity: 60,
    position: [-16, 2, -10],
    color: 0x3d50df,
    roofColor: 0x6c83ff,
    dimensions: [9, 4, 7],
  },
  {
    id: 'loc-library',
    name: 'Central Library & Literary Centre',
    shortCode: 'LIB-TOWER',
    category: 'Literature & Quizzes',
    description: 'Four-tier quiet research atrium, specimen archive vaults, digital catalog terminals, and debate conference salons.',
    venueName: 'Library Quiet Reading Galleria',
    coordinator: 'Ms. Clara Oswald',
    capacity: 120,
    position: [-14, 3, 10],
    color: 0x1e3a8a,
    roofColor: 0x46d8f5,
    dimensions: [8, 6, 8],
  },
  {
    id: 'loc-sports-arena',
    name: 'Sports Ground & Athletics Arena',
    shortCode: 'ARENA',
    category: 'Sports & Athletics',
    description: 'Floodlit artificial turf pitch, 8-lane running track, basketball pavilions, and athlete physio facilities.',
    venueName: 'Main Sports Arena & Turf Pitch',
    coordinator: 'Coach Marcus Davies',
    capacity: 1000,
    position: [18, 0.8, -12],
    color: 0x15803d,
    roofColor: 0xf5b95b,
    dimensions: [16, 1.5, 12],
  },
  {
    id: 'loc-auditorium',
    name: 'Grand Auditorium & Cultural Centre',
    shortCode: 'AUDITORIUM',
    category: 'Arts & Culture',
    description: 'Acoustically tuned 600-seat amphitheatre with mechanical staging, 4K projection, and orchestra pit.',
    venueName: 'Grand Central Auditorium',
    coordinator: 'Sarah Jenkins',
    capacity: 600,
    position: [14, 3, 10],
    color: 0x7c3aed,
    roofColor: 0xa78bfa,
    dimensions: [10, 5, 9],
  },
  {
    id: 'loc-art-studio',
    name: 'Arts & Music Studio Pavilion',
    shortCode: 'ARTS-PAVILION',
    category: 'Arts, Music & Dance',
    description: 'Natural light studios for oil painting, ceramic kilns, digital graphics workstations, and sound-proof recording booths.',
    venueName: 'Arts Pavilion Studio 3',
    coordinator: 'Madame Vivienne Moreau',
    capacity: 50,
    position: [4, 2, 16],
    color: 0x9333ea,
    roofColor: 0xd946ef,
    dimensions: [7, 3.5, 7],
  },
  {
    id: 'loc-maker-centre',
    name: 'Innovation & Maker Centre',
    shortCode: 'MAKER-SPACE',
    category: 'Engineering & Innovation',
    description: 'Rapid prototyping workshop equipped with CNC routers, laser cutters, electronics benches, and material supplies.',
    venueName: 'Maker Space & Fabrication Lab',
    coordinator: 'Dr. Robert Vance',
    capacity: 45,
    position: [-2, 2.5, -16],
    color: 0x0284c7,
    roofColor: 0x38bdf8,
    dimensions: [8, 4.5, 6],
  },
  {
    id: 'loc-council-hub',
    name: 'Student Council & Club Centre',
    shortCode: 'COUNCIL-HUB',
    category: 'Leadership & Student Senate',
    description: 'Headquarters for prefectorial senate, house captain strategy meetings, and volunteer dispatch operations.',
    venueName: 'Leadership Council Chamber',
    coordinator: 'Sarah Jenkins',
    capacity: 80,
    position: [-4, 2, 0],
    color: 0xd97706,
    roofColor: 0xf59e0b,
    dimensions: [7, 4, 7],
  },
  {
    id: 'loc-admin-office',
    name: 'Activity Coordination & Administration Directorate',
    shortCode: 'ADMIN-HQ',
    category: 'Administration & Logistics',
    description: 'Central administrative nexus for event permissions, logistics clearances, certificate verification, and teacher desks.',
    venueName: 'Main Administration Block',
    coordinator: 'Dr. Eleanor Vance',
    capacity: 50,
    position: [6, 3.5, -2],
    color: 0x475569,
    roofColor: 0x94a3b8,
    dimensions: [8, 6, 7],
  },
];

interface CampusViewProps {
  activities: Activity[];
  clubs: Club[];
  onSelectActivity: (act: Activity) => void;
}

export const CampusView: React.FC<CampusViewProps> = ({
  activities,
  clubs,
  onSelectActivity,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredLocation, setHoveredLocation] = useState<CampusLocation | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);
  const [cameraFocused, setCameraFocused] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const buildingsGroupRef = useRef<THREE.Group | null>(null);

  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 38, 54));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 580;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1024);
    scene.fog = new THREE.FogExp2(0x0a1024, 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 38, 54);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.4);
    sunLight.position.set(30, 50, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const blueGlow = new THREE.PointLight(0x6c83ff, 2, 80);
    blueGlow.position.set(0, 15, 0);
    scene.add(blueGlow);

    // 5. Stylized Campus Ground & Pathways
    const groundGeo = new THREE.CylinderGeometry(40, 41, 1, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x101b38,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Central Plaza circle
    const plazaGeo = new THREE.CylinderGeometry(8, 8, 0.1, 32);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0x1e2d56,
      roughness: 0.4,
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.y = 0.05;
    scene.add(plaza);

    // Pathways
    const pathGroup = new THREE.Group();
    const angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4];
    angles.forEach(ang => {
      const pathGeo = new THREE.PlaneGeometry(3, 30);
      const pathMat = new THREE.MeshBasicMaterial({ color: 0x162244, side: THREE.DoubleSide });
      const p = new THREE.Mesh(pathGeo, pathMat);
      p.rotation.x = -Math.PI / 2;
      p.rotation.z = ang;
      p.position.y = 0.02;
      pathGroup.add(p);
    });
    scene.add(pathGroup);

    // 6. Buildings Group
    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);
    buildingsGroupRef.current = buildingsGroup;

    CAMPUS_LOCATIONS.forEach(loc => {
      const bGroup = new THREE.Group();
      bGroup.position.set(...loc.position);
      bGroup.userData = { location: loc, basePos: loc.position };

      // Building main body
      const bodyGeo = new THREE.BoxGeometry(...loc.dimensions);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: loc.color,
        roughness: 0.3,
        metalness: 0.5,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.castShadow = true;
      body.receiveShadow = true;
      body.name = 'bodyMesh';
      bGroup.add(body);

      // Building Roof / Accent structure
      const roofGeo = new THREE.ConeGeometry(loc.dimensions[0] * 0.7, 2, 4);
      const roofMat = new THREE.MeshStandardMaterial({
        color: loc.roofColor,
        roughness: 0.2,
        emissive: loc.roofColor,
        emissiveIntensity: 0.2,
      });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = loc.dimensions[1] / 2 + 1;
      roof.rotation.y = Math.PI / 4;
      bGroup.add(roof);

      // Interactive Glowing Beacon / Pin
      const beaconGeo = new THREE.SphereGeometry(0.6, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0x46d8f5,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = loc.dimensions[1] / 2 + 3.2;
      beacon.name = 'beacon';
      bGroup.add(beacon);

      // Light beam
      const beamGeo = new THREE.CylinderGeometry(0.1, 0.4, 2, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x46d8f5,
        transparent: true,
        opacity: 0.5,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = loc.dimensions[1] / 2 + 2;
      bGroup.add(beam);

      buildingsGroup.add(bGroup);
    });

    // 7. Trees / Landscape foliage
    const foliageGroup = new THREE.Group();
    for (let t = 0; t < 28; t++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 9 + Math.random() * 24;
      const tx = Math.cos(angle) * radius;
      const tz = Math.sin(angle) * radius;

      // avoid building overlap
      const isNearBuilding = CAMPUS_LOCATIONS.some(
        loc => Math.hypot(loc.position[0] - tx, loc.position[2] - tz) < 6
      );
      if (!isNearBuilding) {
        const treeTrunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6);
        const treeTrunkMat = new THREE.MeshBasicMaterial({ color: 0x473822 });
        const trunk = new THREE.Mesh(treeTrunkGeo, treeTrunkMat);
        trunk.position.set(tx, 0.75, tz);

        const treeTopGeo = new THREE.DodecahedronGeometry(0.9);
        const treeTopMat = new THREE.MeshStandardMaterial({
          color: 0x15803d,
          roughness: 0.9,
        });
        const top = new THREE.Mesh(treeTopGeo, treeTopMat);
        top.position.set(tx, 1.9, tz);

        foliageGroup.add(trunk);
        foliageGroup.add(top);
      }
    }
    scene.add(foliageGroup);

    // 8. Interaction handling
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let azimuth = 0;
    let polar = Math.PI / 3.4;
    const distance = 58;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging && !cameraFocused) {
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        azimuth -= dx * 0.005;
        polar = Math.max(0.3, Math.min(Math.PI / 2.3, polar - dy * 0.005));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        targetCameraPos.current.x = distance * Math.sin(polar) * Math.sin(azimuth);
        targetCameraPos.current.y = distance * Math.cos(polar);
        targetCameraPos.current.z = distance * Math.sin(polar) * Math.cos(azimuth);
      }

      // Raycast hover
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingsGroup.children, true);
      if (intersects.length > 0) {
        let parent: THREE.Object3D | null = intersects[0].object;
        while (parent && !parent.userData.location && parent.parent) {
          parent = parent.parent;
        }
        if (parent && parent.userData.location) {
          setHoveredLocation(parent.userData.location);
          document.body.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredLocation(null);
      document.body.style.cursor = 'default';
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(buildingsGroup.children, true);
      if (intersects.length > 0) {
        let parent: THREE.Object3D | null = intersects[0].object;
        while (parent && !parent.userData.location && parent.parent) {
          parent = parent.parent;
        }
        if (parent && parent.userData.location) {
          const loc = parent.userData.location as CampusLocation;
          setSelectedLocation(loc);
          focusOnLocation(loc);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight || 580;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Pulsate beacons
      buildingsGroup.children.forEach((bObj, idx) => {
        const beacon = bObj.getObjectByName('beacon');
        if (beacon) {
          beacon.position.y = (bObj.userData.location.dimensions[1] / 2) + 3.2 + Math.sin(time * 3 + idx) * 0.25;
        }
      });

      // Camera lerp
      camera.position.lerp(targetCameraPos.current, 0.05);
      currentLookAt.current.lerp(targetLookAt.current, 0.05);
      camera.lookAt(currentLookAt.current);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const focusOnLocation = (loc: CampusLocation) => {
    setCameraFocused(true);
    targetLookAt.current.set(loc.position[0], loc.position[1], loc.position[2]);
    targetCameraPos.current.set(
      loc.position[0] * 1.5 + 4,
      loc.position[1] + 12,
      loc.position[2] * 1.5 + 16
    );
  };

  const resetCamera = () => {
    setCameraFocused(false);
    setSelectedLocation(null);
    targetCameraPos.current.set(0, 38, 54);
    targetLookAt.current.set(0, 0, 0);
  };

  // Find events at this location
  const locationActivities = selectedLocation
    ? activities.filter(
        a => a.venue.toLowerCase().includes(selectedLocation.venueName.toLowerCase()) ||
             selectedLocation.venueName.toLowerCase().includes(a.venue.toLowerCase())
      )
    : [];

  // Find clubs at this location
  const locationClubs = selectedLocation
    ? clubs.filter(c => c.location.toLowerCase().includes(selectedLocation.name.toLowerCase().slice(0, 8)))
    : [];

  return (
    <div className="relative w-full h-[640px] rounded-3xl overflow-hidden border border-activia-border/60 bg-activia-dark shadow-2xl">
      {/* 3D Canvas Mounting */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Campus Header Controls */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none z-10">
        <div className="pointer-events-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-activia-cyan flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            Miniature 3D Interactive Campus
          </span>
          <h3 className="text-xl font-bold font-display text-white mt-0.5">
            Campus Exploration Horizon
          </h3>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {cameraFocused && (
            <button
              onClick={resetCamera}
              className="px-3.5 py-2 rounded-xl bg-activia-surface/80 backdrop-blur-md border border-activia-border text-xs text-activia-text hover:text-white hover:border-activia-blue transition-all flex items-center gap-2 shadow-lg"
            >
              <RotateCcw className="w-3.5 h-3.5 text-activia-blue" />
              Reset Campus View
            </button>
          )}
        </div>
      </div>

      {/* Floating Hover Card */}
      {hoveredLocation && !selectedLocation && (
        <div className="absolute bottom-6 left-6 max-w-sm p-4 rounded-2xl bg-activia-elevated/90 backdrop-blur-xl border border-activia-cyan/40 shadow-glow-cyan pointer-events-none transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-activia-cyan">Campus Landmark</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/10 text-white">
              Cap: {hoveredLocation.capacity} seats
            </span>
          </div>
          <h4 className="text-sm font-bold text-white font-display">
            {hoveredLocation.name}
          </h4>
          <p className="text-xs text-activia-muted mt-1 leading-relaxed">
            {hoveredLocation.description}
          </p>
          <div className="mt-2 text-[10px] text-activia-cyan font-semibold flex items-center gap-1">
            Click to inspect venue schedule & clubs <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      )}

      {/* Selected Location Drawer */}
      {selectedLocation && (
        <div className="absolute top-0 right-0 bottom-0 w-80 md:w-96 bg-activia-surface/95 backdrop-blur-2xl border-l border-activia-border p-6 shadow-2xl flex flex-col z-30 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-activia-cyan">
                {selectedLocation.category}
              </span>
              <h3 className="text-base font-bold text-white leading-tight mt-0.5">
                {selectedLocation.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-activia-muted hover:text-white transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="py-3 border-b border-white/5 space-y-1.5 text-xs text-activia-muted">
            <div className="flex items-center justify-between">
              <span>Coordinating Lead:</span>
              <span className="text-white font-medium">{selectedLocation.coordinator}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Venue Capacity:</span>
              <span className="text-activia-cyan font-medium">{selectedLocation.capacity} Attendees</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Official Facility:</span>
              <span className="text-white font-medium">{selectedLocation.venueName}</span>
            </div>
          </div>

          <p className="text-xs text-activia-muted my-3 leading-relaxed">
            {selectedLocation.description}
          </p>

          {/* Active Events at this building */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <h4 className="text-xs font-bold text-white flex items-center justify-between">
              <span>Scheduled Activities ({locationActivities.length})</span>
            </h4>

            {locationActivities.length === 0 ? (
              <p className="text-xs text-activia-muted py-4 text-center bg-white/5 rounded-xl">
                No public competitions currently scheduled here.
              </p>
            ) : (
              locationActivities.map(act => (
                <div
                  key={act.id}
                  onClick={() => onSelectActivity(act)}
                  className="p-3 rounded-xl bg-activia-elevated/70 border border-activia-border hover:border-activia-blue/60 transition-all cursor-pointer group"
                >
                  <p className="text-[10px] text-activia-amber font-semibold">{act.date} • {act.startTime}</p>
                  <h5 className="text-xs font-bold text-white group-hover:text-activia-blue mt-0.5 transition-colors line-clamp-1">
                    {act.title}
                  </h5>
                  <p className="text-[11px] text-activia-muted mt-1 line-clamp-1">
                    {act.description}
                  </p>
                </div>
              ))
            )}

            {/* Resident clubs */}
            {locationClubs.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/10">
                <h4 className="text-xs font-bold text-white mb-2">Resident Guilds & Societies</h4>
                {locationClubs.map(c => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between text-xs">
                    <span className="text-white font-medium">{c.name}</span>
                    <span className="text-[10px] text-activia-cyan">{c.memberCount} members</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setSelectedLocation(null)}
            className="mt-4 w-full py-2.5 rounded-xl bg-activia-surface hover:bg-white/10 text-white text-xs font-semibold border border-activia-border transition-all flex items-center justify-center gap-2"
          >
            Close Location Inspector
          </button>
        </div>
      )}

      {/* Orbit Helper Indicator */}
      {!selectedLocation && (
        <div className="absolute bottom-4 right-5 text-[11px] text-activia-muted/70 flex items-center gap-2 pointer-events-none">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
          <span>Click & drag to explore campus • Click any building to inspect venues</span>
        </div>
      )}
    </div>
  );
};
