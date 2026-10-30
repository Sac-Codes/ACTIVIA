import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
  FileCheck,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Star,
  Compass,
  Minimize2,
  Download,
  Share2
} from 'lucide-react';
import { VerifiedAchievement } from '../../types';

interface AchievementConstellationProps {
  achievements: VerifiedAchievement[];
  studentName: string;
}

const DOMAIN_COLORS: Record<string, number> = {
  Technical: 0x6c83ff,
  Creativity: 0xa78bfa,
  Leadership: 0xf59e0b,
  Sports: 0xf5b95b,
  Communication: 0xff7185,
  Teamwork: 0x46d8f5,
  Community: 0x43c99a,
};

export const AchievementConstellation: React.FC<AchievementConstellationProps> = ({
  achievements,
  studentName,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<VerifiedAchievement | null>(null);
  const [selectedNode, setSelectedNode] = useState<VerifiedAchievement | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodesGroupRef = useRef<THREE.Group | null>(null);

  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 15, 38));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060a17);
    scene.fog = new THREE.FogExp2(0x060a17, 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 15, 38);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(0x6c83ff, 2.5, 60);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);

    // 5. Background Constellation Dust Particles
    const dustCount = 800;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 80;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.9,
      color: 0x818cf8,
      transparent: true,
      opacity: 0.5,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // 6. Constellation Achievement Nodes
    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);
    nodesGroupRef.current = nodesGroup;

    const nodePositions: THREE.Vector3[] = [];

    achievements.forEach((ach, index) => {
      // Geometric celestial layout based on index and domain
      const angle = (index / Math.max(1, achievements.length)) * Math.PI * 2;
      const radius = 12 + (index % 3) * 3;
      const x = Math.cos(angle) * radius;
      const y = ((index % 2 === 0 ? 1 : -1) * (2 + (index % 4) * 1.5));
      const z = Math.sin(angle) * radius;

      const pos = new THREE.Vector3(x, y, z);
      nodePositions.push(pos);

      const colorVal = DOMAIN_COLORS[ach.domainArea] || 0x6c83ff;

      // Node Group
      const nodeObj = new THREE.Group();
      nodeObj.position.copy(pos);
      nodeObj.userData = { achievement: ach, basePos: pos };

      // Central Star Mesh
      const starGeo = new THREE.OctahedronGeometry(1.2, 0);
      const starMat = new THREE.MeshStandardMaterial({
        color: colorVal,
        emissive: colorVal,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const starMesh = new THREE.Mesh(starGeo, starMat);
      starMesh.name = 'star';
      nodeObj.add(starMesh);

      // Pulsing Glow Shell
      const haloGeo = new THREE.SphereGeometry(1.8, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: colorVal,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.name = 'halo';
      nodeObj.add(halo);

      nodesGroup.add(nodeObj);
    });

    // 7. Constellation Connection Lines
    if (nodePositions.length > 1) {
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x6c83ff,
        transparent: true,
        opacity: 0.35,
      });

      const linePoints: THREE.Vector3[] = [];
      for (let i = 0; i < nodePositions.length; i++) {
        linePoints.push(nodePositions[i]);
        linePoints.push(nodePositions[(i + 1) % nodePositions.length]);
        // Cross connections for constellation aesthetic
        if (i % 2 === 0 && i + 2 < nodePositions.length) {
          linePoints.push(nodePositions[i]);
          linePoints.push(nodePositions[i + 2]);
        }
      }

      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lines = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(lines);
    }

    // 8. Raycasting and Orbit Handling
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let azimuth = 0;
    let polar = Math.PI / 2.8;
    const distance = 42;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        azimuth -= dx * 0.006;
        polar = Math.max(0.3, Math.min(Math.PI / 2.2, polar - dy * 0.006));
        prevX = e.clientX;
        prevY = e.clientY;

        targetCameraPos.current.x = distance * Math.sin(polar) * Math.sin(azimuth);
        targetCameraPos.current.y = distance * Math.cos(polar);
        targetCameraPos.current.z = distance * Math.sin(polar) * Math.cos(azimuth);
      }

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodesGroup.children, true);
      if (intersects.length > 0) {
        let parent: THREE.Object3D | null = intersects[0].object;
        while (parent && !parent.userData.achievement && parent.parent) {
          parent = parent.parent;
        }
        if (parent && parent.userData.achievement) {
          setHoveredNode(parent.userData.achievement);
          document.body.style.cursor = 'pointer';
          return;
        }
      }
      setHoveredNode(null);
      document.body.style.cursor = 'default';
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodesGroup.children, true);
      if (intersects.length > 0) {
        let parent: THREE.Object3D | null = intersects[0].object;
        while (parent && !parent.userData.achievement && parent.parent) {
          parent = parent.parent;
        }
        if (parent && parent.userData.achievement) {
          const ach = parent.userData.achievement as VerifiedAchievement;
          setSelectedNode(ach);
          focusOnNode(parent.userData.basePos);
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
      const newH = mountRef.current.clientHeight || 560;
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

      // Ambient rotation of nodes
      nodesGroup.children.forEach((grp, idx) => {
        const star = grp.getObjectByName('star');
        const halo = grp.getObjectByName('halo');
        if (star) {
          star.rotation.y = time * 0.8 + idx;
          star.rotation.x = time * 0.4;
        }
        if (halo) {
          halo.rotation.y = -time * 0.5;
        }
        // slight floating drift
        grp.position.y = grp.userData.basePos.y + Math.sin(time * 2 + idx) * 0.3;
      });

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
      dustGeo.dispose();
      dustMat.dispose();
    };
  }, [achievements]);

  const focusOnNode = (pos: THREE.Vector3) => {
    targetLookAt.current.set(pos.x, pos.y, pos.z);
    targetCameraPos.current.set(pos.x * 1.3, pos.y + 4, pos.z * 1.3 + 8);
  };

  const resetCamera = () => {
    setSelectedNode(null);
    targetCameraPos.current.set(0, 15, 38);
    targetLookAt.current.set(0, 0, 0);
  };

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-activia-border/60 bg-activia-dark shadow-2xl">
      {/* 3D Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Badge */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none z-10">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-activia-purple flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Personal Achievement Constellation
          </span>
          <h3 className="text-xl font-bold font-display text-white mt-0.5">
            {studentName}&apos;s Celestial Milestone Map
          </h3>
          <p className="text-xs text-activia-muted mt-0.5">
            {achievements.length} Verified Star Nodes across Academic, STEM, Leadership & Athletic Disciplines
          </p>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {selectedNode && (
            <button
              onClick={resetCamera}
              className="px-3.5 py-2 rounded-xl bg-activia-surface/80 backdrop-blur-md border border-activia-border text-xs text-activia-text hover:text-white transition-all flex items-center gap-2 shadow-lg"
            >
              <RotateCcw className="w-3.5 h-3.5 text-activia-blue" />
              Reset Sky View
            </button>
          )}
        </div>
      </div>

      {/* Floating Hover Card */}
      {hoveredNode && !selectedNode && (
        <div className="absolute bottom-6 left-6 max-w-sm p-4 rounded-2xl bg-activia-elevated/90 backdrop-blur-xl border border-activia-purple/40 shadow-glow-purple pointer-events-none transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-activia-purple">
              {hoveredNode.domainArea} Star Node
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-activia-mint/20 text-activia-mint border border-activia-mint/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          </div>
          <h4 className="text-sm font-bold text-white font-display">
            {hoveredNode.activityTitle}
          </h4>
          <p className="text-xs text-activia-cyan font-medium mt-0.5">
            {hoveredNode.placement} • {hoveredNode.role}
          </p>
          <div className="mt-2 text-[10px] text-activia-muted flex items-center justify-between pt-2 border-t border-white/5">
            <span>{hoveredNode.date}</span>
            <span className="text-activia-purple font-semibold">Click star to view verified certificate</span>
          </div>
        </div>
      )}

      {/* Selected Node Drawer */}
      {selectedNode && (
        <div className="absolute top-0 right-0 bottom-0 w-80 md:w-96 bg-activia-surface/95 backdrop-blur-2xl border-l border-activia-border p-6 shadow-2xl flex flex-col z-30 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-activia-purple">
                {selectedNode.domainArea} Discipline
              </span>
              <h3 className="text-base font-bold text-white leading-tight mt-0.5">
                {selectedNode.activityTitle}
              </h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-activia-muted hover:text-white transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4 space-y-3 flex-1 overflow-y-auto pr-1">
            <div className="p-3.5 rounded-2xl bg-activia-elevated border border-activia-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-activia-muted">Official Award:</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {selectedNode.placement}
                </span>
              </div>
              <p className="text-xs text-white font-medium">Role: {selectedNode.role}</p>
              <p className="text-xs text-activia-muted mt-1">Date: {selectedNode.date}</p>
            </div>

            {/* Verification Stamp */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <div className="flex items-center gap-2 text-activia-mint font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                Verified Institutional Record
              </div>
              <p className="text-activia-muted text-[11px] leading-relaxed">
                Officially validated by {selectedNode.verifiedBy} on {selectedNode.verifiedAt}.
              </p>
              <p className="text-[10px] text-white/60 mt-1 font-mono">
                Ref: {selectedNode.certificateRef}
              </p>
            </div>

            {/* Skills Acquired */}
            <div>
              <h4 className="text-xs font-bold text-white mb-2">Validated Competencies</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.skillsAcquired.map(skill => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/5 text-activia-cyan border border-white/10"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Personal Reflection */}
            {selectedNode.personalReflection && (
              <div className="p-3.5 rounded-2xl bg-activia-elevated/60 border border-activia-border text-xs">
                <h4 className="font-bold text-white mb-1">Student Learning Reflection</h4>
                <p className="text-activia-muted italic leading-relaxed">
                  &ldquo;{selectedNode.personalReflection}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Certificate Action */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <button
              onClick={() => setShowCertificateModal(true)}
              className="w-full py-2.5 rounded-xl bg-activia-blue hover:bg-activia-blue/90 text-white text-xs font-semibold shadow-lg shadow-activia-blue/30 transition-all flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              View Verified Credential
            </button>
          </div>
        </div>
      )}

      {/* Verified Certificate Modal */}
      {showCertificateModal && selectedNode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-gradient-to-br from-[#0c142e] via-[#101b38] to-[#080d1c] border-2 border-activia-blue/50 rounded-3xl p-8 shadow-2xl relative text-center">
            {/* Certificate Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-activia-cyan uppercase">
                <ShieldCheck className="w-4 h-4 text-activia-mint" />
                Horizon Academy • Official Extracurricular Credential
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-xs text-activia-muted hover:text-white"
              >
                Close ✕
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-[11px] font-semibold text-activia-purple tracking-widest uppercase">
                Certificate of Distinction
              </span>
              <h2 className="text-2xl font-bold font-display text-white mt-2">
                {selectedNode.studentName}
              </h2>
              <p className="text-xs text-activia-muted mt-1">
                has successfully achieved the distinction of
              </p>
              <p className="text-lg font-extrabold text-amber-400 mt-2 font-display">
                {selectedNode.placement}
              </p>
              <p className="text-sm font-semibold text-white mt-1">
                in {selectedNode.activityTitle}
              </p>
              <p className="text-xs text-activia-cyan mt-1">
                Discipline: {selectedNode.domainArea} • Role: {selectedNode.role}
              </p>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-activia-muted text-left">
                <div>
                  <p className="font-semibold text-white">Issued: {selectedNode.date}</p>
                  <p className="font-mono text-[10px] text-activia-muted">Credential ID: {selectedNode.certificateRef}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{selectedNode.verifiedBy}</p>
                  <p className="text-[10px] text-activia-mint">Cryptographically Verified</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-activia-blue hover:bg-activia-blue/90 text-white text-xs font-semibold shadow-lg transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Print / Save PDF Credential
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orbit Helper Indicator */}
      {!selectedNode && (
        <div className="absolute bottom-4 right-5 text-[11px] text-activia-muted/70 flex items-center gap-2 pointer-events-none">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
          <span>Rotate the achievement sky • Click star nodes to inspect credentials</span>
        </div>
      )}
    </div>
  );
};
