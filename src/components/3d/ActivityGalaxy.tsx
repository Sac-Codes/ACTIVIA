import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Compass,
  Cpu,
  Atom,
  Trophy,
  Palette,
  BookOpen,
  Crown,
  HeartHandshake,
  Users,
  ChevronRight,
  Eye,
  Minimize2
} from 'lucide-react';
import { ACTIVITY_CATEGORIES } from '../../data/mockData';
import { ActivityCategory, Activity } from '../../types';

interface ActivityGalaxyProps {
  activities: Activity[];
  onSelectCategory: (categoryId: string) => void;
  onSelectActivity: (activity: Activity) => void;
}

export const ActivityGalaxy: React.FC<ActivityGalaxyProps> = ({
  activities,
  onSelectCategory,
  onSelectActivity
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredCategory, setHoveredCategory] = useState<ActivityCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [is2DFallback, setIs2DFallback] = useState(false);
  const [cameraFocused, setCameraFocused] = useState(false);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const islandMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 32, 58));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Initialize Three.js Scene
  useEffect(() => {
    if (is2DFallback || !mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 580;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080d1c);
    scene.fog = new THREE.FogExp2(0x080d1c, 0.012);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 32, 58);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(0x6c83ff, 3, 100);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    const rimLight = new THREE.DirectionalLight(0x46d8f5, 1.2);
    rimLight.position.set(20, 40, 20);
    scene.add(rimLight);

    // 5. Starfield Particles (1,500 particles)
    const starCount = 1500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 80 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const colorMix = Math.random();
      if (colorMix > 0.6) {
        starColors[i * 3] = 0.42; starColors[i * 3 + 1] = 0.51; starColors[i * 3 + 2] = 1.0; // blue
      } else if (colorMix > 0.3) {
        starColors[i * 3] = 0.27; starColors[i * 3 + 1] = 0.85; starColors[i * 3 + 2] = 0.96; // cyan
      } else {
        starColors[i * 3] = 0.95; starColors[i * 3 + 1] = 0.96; starColors[i * 3 + 2] = 1.0; // white
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 6. Central Glowing ACTIVIA Core
    const coreGeo = new THREE.IcosahedronGeometry(3.5, 3);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x6c83ff,
      emissive: 0x3d50df,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Core inner energy sphere
    const innerCoreGeo = new THREE.SphereGeometry(2.5, 32, 32);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0x46d8f5,
      transparent: true,
      opacity: 0.6,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    scene.add(innerCoreMesh);

    // 7. Planetary Hub Islands (8 Categories)
    islandMeshesRef.current.clear();
    const islandsGroup = new THREE.Group();
    scene.add(islandsGroup);

    ACTIVITY_CATEGORIES.forEach((cat, index) => {
      const angle = (index / ACTIVITY_CATEGORIES.length) * Math.PI * 2;
      const radius = 22 + (index % 2) * 5; // staggered orbits
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(index * 1.5) * 2;

      // Group for island
      const islandGroup = new THREE.Group();
      islandGroup.position.set(x, y, z);
      islandGroup.userData = { categoryId: cat.id, category: cat, basePos: new THREE.Vector3(x, y, z) };

      // Orbit Ring
      const orbitGeo = new THREE.RingGeometry(radius - 0.08, radius + 0.08, 64);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(cat.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.15,
      });
      const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
      orbitRing.rotation.x = Math.PI / 2;
      scene.add(orbitRing);

      // Planetary Island Geometry
      let islandGeo: THREE.BufferGeometry;
      if (index === 0) islandGeo = new THREE.DodecahedronGeometry(2.8);
      else if (index === 1) islandGeo = new THREE.OctahedronGeometry(2.6);
      else if (index === 2) islandGeo = new THREE.TorusKnotGeometry(1.6, 0.5, 48, 8);
      else if (index === 3) islandGeo = new THREE.IcosahedronGeometry(2.5, 1);
      else if (index === 4) islandGeo = new THREE.TetrahedronGeometry(2.8);
      else if (index === 5) islandGeo = new THREE.CylinderGeometry(2, 2.4, 2, 6);
      else if (index === 6) islandGeo = new THREE.SphereGeometry(2.5, 16, 16);
      else islandGeo = new THREE.TorusGeometry(2, 0.7, 16, 32);

      const islandMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cat.color),
        emissive: new THREE.Color(cat.color),
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.6,
      });

      const islandMesh = new THREE.Mesh(islandGeo, islandMat);
      islandMesh.name = 'planetMesh';
      islandGroup.add(islandMesh);

      // Glowing Atmosphere Shell
      const haloGeo = new THREE.SphereGeometry(3.3, 24, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(cat.color),
        transparent: true,
        opacity: 0.15,
        wireframe: true,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      islandGroup.add(haloMesh);

      // Small floating satellites / activity beacons
      for (let s = 0; s < 3; s++) {
        const satGeo = new THREE.OctahedronGeometry(0.35);
        const satMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const sat = new THREE.Mesh(satGeo, satMat);
        const satAngle = (s / 3) * Math.PI * 2;
        sat.position.set(Math.cos(satAngle) * 3.8, Math.sin(s * 2) * 0.8, Math.sin(satAngle) * 3.8);
        sat.name = `sat_${s}`;
        islandGroup.add(sat);
      }

      islandsGroup.add(islandGroup);
      islandMeshesRef.current.set(cat.id, islandGroup);
    });

    // 8. Mouse & Raycasting Controls
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let orbitAzimuth = 0;
    let orbitPolar = Math.PI / 3;
    let orbitRadius = 65;

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
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        orbitAzimuth -= deltaX * 0.005;
        orbitPolar = Math.max(0.2, Math.min(Math.PI / 2.2, orbitPolar - deltaY * 0.005));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        targetCameraPos.current.x = orbitRadius * Math.sin(orbitPolar) * Math.sin(orbitAzimuth);
        targetCameraPos.current.y = orbitRadius * Math.cos(orbitPolar);
        targetCameraPos.current.z = orbitRadius * Math.sin(orbitPolar) * Math.cos(orbitAzimuth);
      }

      // Raycast hover
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(islandsGroup.children, true);
      if (intersects.length > 0) {
        let topParent: THREE.Object3D | null = intersects[0].object;
        while (topParent && !topParent.userData.categoryId && topParent.parent) {
          topParent = topParent.parent;
        }
        if (topParent && topParent.userData.category) {
          setHoveredCategory(topParent.userData.category);
          document.body.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredCategory(null);
      document.body.style.cursor = 'default';
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(islandsGroup.children, true);
      if (intersects.length > 0) {
        let topParent: THREE.Object3D | null = intersects[0].object;
        while (topParent && !topParent.userData.categoryId && topParent.parent) {
          topParent = topParent.parent;
        }
        if (topParent && topParent.userData.category) {
          const category = topParent.userData.category as ActivityCategory;
          setSelectedCategory(category);
          focusOnCategory(category);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('click', handleClick);

    // 9. Resize Handling
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight || 580;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 10. Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Ambient Core Rotation
      coreMesh.rotation.y = elapsedTime * 0.15;
      coreMesh.rotation.x = elapsedTime * 0.08;
      innerCoreMesh.rotation.y = -elapsedTime * 0.2;

      // Rotate Planets and Satellites
      islandsGroup.children.forEach((groupObj, i) => {
        const grp = groupObj as THREE.Group;
        const mesh = grp.getObjectByName('planetMesh');
        if (mesh) {
          mesh.rotation.y += 0.008;
          mesh.rotation.x = Math.sin(elapsedTime * 0.5 + i) * 0.003;
        }
        // Floating bob
        grp.position.y = grp.userData.basePos.y + Math.sin(elapsedTime * 1.5 + i) * 0.5;

        // Satellite orbits
        for (let s = 0; s < 3; s++) {
          const sat = grp.getObjectByName(`sat_${s}`);
          if (sat) {
            const curAngle = (s / 3) * Math.PI * 2 + elapsedTime * 1.2;
            sat.position.x = Math.cos(curAngle) * 3.8;
            sat.position.z = Math.sin(curAngle) * 3.8;
          }
        }
      });

      // Smooth camera interpolation
      camera.position.lerp(targetCameraPos.current, 0.05);
      currentLookAt.current.lerp(targetLookAt.current, 0.05);
      camera.lookAt(currentLookAt.current);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
    };
  }, [is2DFallback]);

  // Focus camera on category island
  const focusOnCategory = (category: ActivityCategory) => {
    const group = islandMeshesRef.current.get(category.id);
    if (!group) return;

    setCameraFocused(true);
    const pos = group.position;
    targetLookAt.current.set(pos.x, pos.y, pos.z);
    targetCameraPos.current.set(pos.x * 1.4, pos.y + 6, pos.z * 1.4);
  };

  const resetCamera = () => {
    setCameraFocused(false);
    setSelectedCategory(null);
    targetCameraPos.current.set(0, 32, 58);
    targetLookAt.current.set(0, 0, 0);
  };

  // Filter activities for category
  const filteredCategoryActivities = selectedCategory
    ? activities.filter(a => a.category === selectedCategory.id)
    : [];

  // Filter search
  const searchResults = searchQuery.trim()
    ? activities.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-5 h-5 text-activia-blue" />;
      case 'Atom': return <Atom className="w-5 h-5 text-activia-cyan" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-activia-amber" />;
      case 'Palette': return <Palette className="w-5 h-5 text-activia-purple" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-activia-rose" />;
      case 'Crown': return <Crown className="w-5 h-5 text-amber-400" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-activia-mint" />;
      default: return <Users className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="relative w-full h-[640px] rounded-3xl overflow-hidden border border-activia-border/60 bg-activia-dark shadow-2xl">
      {/* 3D Canvas Mounting Point */}
      {!is2DFallback && <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />}

      {/* 2D Fallback View for accessibility or performance */}
      {is2DFallback && (
        <div className="w-full h-full p-8 overflow-y-auto bg-gradient-to-br from-activia-dark via-activia-surface to-activia-elevated">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold font-display text-white flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-activia-blue" />
                  Activity Universe (2D Accessible Matrix)
                </h3>
                <p className="text-activia-muted text-sm mt-1">
                  High-contrast grid view of all 8 school activity orbital sectors.
                </p>
              </div>
              <button
                onClick={() => setIs2DFallback(false)}
                className="px-4 py-2 rounded-xl bg-activia-blue/20 hover:bg-activia-blue/30 text-activia-blue border border-activia-blue/40 text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                Launch 3D Galaxy View
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ACTIVITY_CATEGORIES.map(cat => {
                const count = activities.filter(a => a.category === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat);
                      onSelectCategory(cat.id);
                    }}
                    className="p-5 rounded-2xl bg-activia-elevated/80 border border-activia-border hover:border-activia-blue/50 hover:shadow-glow-blue transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-activia-surface flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                        {getCategoryIcon(cat.icon)}
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white">
                        {count} Activities
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white group-hover:text-activia-blue transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-activia-muted mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs text-activia-cyan font-medium pt-3 border-t border-white/5">
                      <span>Explore Sector</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Galaxy Top Control Bar (Search + View Toggles) */}
      <div className="absolute top-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-10">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-activia-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search planet hubs or events..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 md:w-80 rounded-xl bg-activia-surface/80 backdrop-blur-md border border-activia-border text-white text-xs placeholder:text-activia-muted focus:outline-none focus:border-activia-blue shadow-lg"
            />
          </div>

          {searchQuery && (
            <div className="absolute top-12 left-0 w-80 max-h-72 overflow-y-auto rounded-2xl bg-activia-elevated/95 backdrop-blur-xl border border-activia-border shadow-2xl p-2 z-50 pointer-events-auto">
              {searchResults.length === 0 ? (
                <p className="p-3 text-xs text-activia-muted text-center">No matching opportunities found</p>
              ) : (
                searchResults.map(act => (
                  <div
                    key={act.id}
                    onClick={() => onSelectActivity(act)}
                    className="p-2.5 rounded-xl hover:bg-white/5 cursor-pointer text-left transition-colors"
                  >
                    <p className="text-xs font-semibold text-white truncate">{act.title}</p>
                    <p className="text-[10px] text-activia-cyan mt-0.5">{act.categoryName} • {act.date}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {cameraFocused && (
            <button
              onClick={resetCamera}
              className="px-3.5 py-2 rounded-xl bg-activia-surface/80 backdrop-blur-md border border-activia-border text-xs text-activia-text hover:text-white hover:border-activia-blue transition-all flex items-center gap-2 shadow-lg"
            >
              <RotateCcw className="w-3.5 h-3.5 text-activia-blue" />
              Reset Orbit View
            </button>
          )}

          <button
            onClick={() => setIs2DFallback(!is2DFallback)}
            className="px-3.5 py-2 rounded-xl bg-activia-surface/80 backdrop-blur-md border border-activia-border text-xs text-activia-muted hover:text-white transition-all flex items-center gap-2 shadow-lg"
            title="Toggle 2D / 3D Mode"
          >
            {is2DFallback ? <Compass className="w-3.5 h-3.5 text-activia-cyan" /> : <Layers className="w-3.5 h-3.5 text-activia-purple" />}
            {is2DFallback ? '3D Galaxy' : '2D Matrix'}
          </button>
        </div>
      </div>

      {/* Floating 3D Category HUD Hover Card */}
      {!is2DFallback && hoveredCategory && !selectedCategory && (
        <div className="absolute bottom-6 left-6 max-w-sm p-4 rounded-2xl bg-activia-elevated/90 backdrop-blur-xl border border-activia-blue/40 shadow-glow-blue pointer-events-none transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-activia-cyan">Planetary Hub</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-activia-blue/20 text-activia-blue border border-activia-blue/30">
              {activities.filter(a => a.category === hoveredCategory.id).length} Active Opportunities
            </span>
          </div>
          <h4 className="text-base font-bold text-white font-display flex items-center gap-2">
            {getCategoryIcon(hoveredCategory.icon)}
            {hoveredCategory.name}
          </h4>
          <p className="text-xs text-activia-muted mt-1 leading-relaxed">
            {hoveredCategory.description}
          </p>
          <p className="text-[10px] text-activia-blue mt-2 flex items-center gap-1 font-semibold">
            Click to focus orbit & view activities <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      )}

      {/* Selected Sector Slide-Out Drawer */}
      {selectedCategory && (
        <div className="absolute top-0 right-0 bottom-0 w-80 md:w-96 bg-activia-surface/95 backdrop-blur-2xl border-l border-activia-border p-6 shadow-2xl flex flex-col z-30 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-activia-elevated flex items-center justify-center border border-white/10">
                {getCategoryIcon(selectedCategory.icon)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">{selectedCategory.name}</h3>
                <span className="text-[11px] text-activia-cyan">Sector Overview</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-activia-muted hover:text-white transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-activia-muted my-3 leading-relaxed">
            {selectedCategory.description}
          </p>

          <div className="flex items-center justify-between my-2">
            <span className="text-xs font-semibold text-white">Upcoming Events ({filteredCategoryActivities.length})</span>
            <button
              onClick={() => onSelectCategory(selectedCategory.id)}
              className="text-xs text-activia-blue hover:text-activia-cyan transition-colors font-medium flex items-center gap-1"
            >
              Directory <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 mt-1">
            {filteredCategoryActivities.length === 0 ? (
              <p className="text-xs text-activia-muted text-center py-6">No scheduled events in this sector.</p>
            ) : (
              filteredCategoryActivities.map(act => (
                <div
                  key={act.id}
                  onClick={() => onSelectActivity(act)}
                  className="p-3.5 rounded-xl bg-activia-elevated/70 border border-activia-border hover:border-activia-blue/60 hover:shadow-glow-blue transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold text-activia-amber bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {act.participationFormat.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-activia-muted">{act.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-activia-blue transition-colors line-clamp-1">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-activia-muted mt-1 line-clamp-2 leading-relaxed">
                    {act.description}
                  </p>
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-activia-cyan">
                    <span>{act.venue}</span>
                    <span className="flex items-center gap-1 font-semibold">
                      Details <Eye className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onSelectCategory(selectedCategory.id)}
            className="mt-4 w-full py-2.5 rounded-xl bg-activia-blue hover:bg-activia-blue/90 text-white text-xs font-semibold shadow-lg shadow-activia-blue/30 transition-all flex items-center justify-center gap-2"
          >
            Open Complete Discovery Filter
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Orbit Helper Watermark */}
      {!is2DFallback && !selectedCategory && (
        <div className="absolute bottom-4 right-5 text-[11px] text-activia-muted/70 flex items-center gap-2 pointer-events-none">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
          <span>Click & drag to rotate • Scroll to zoom • Click island to explore</span>
        </div>
      )}
    </div>
  );
};
