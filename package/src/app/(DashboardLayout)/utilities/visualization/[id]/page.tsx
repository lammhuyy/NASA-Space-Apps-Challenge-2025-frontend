"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Text } from "@react-three/drei";
import { useParams, useRouter } from "next/navigation";
import * as THREE from "three";
import {
  Box,
  Slider,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip
} from "@mui/material";
import {
  Help as HelpIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  Lightbulb as LightbulbIcon,
  PlayArrow as PlayIcon,
  VideoLibrary as VideoLibraryIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import { apiService } from "@/services/api";
// -------------------
// Central Star Component
// -------------------
function CentralStar({ velocity, hostname }: { velocity: number; hostname: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005 * velocity;
    }
  });

  return (
    <>
      <Sphere ref={meshRef} args={[0.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#ffeb3b"
          emissive="#ffeb3b"
          emissiveIntensity={2}
          roughness={0.1}
          metalness={0.1}
        />
      </Sphere>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.15}
        color="#ffeb3b"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {hostname}
      </Text>
    </>
  );
}

// -------------------
// Orbiting Planet Component with Trail
// -------------------
// function OrbitingPlanet({
//   distance,
//   speed,
//   size,
//   color,
//   name,
//   velocity
// }: {
//   distance: number;
//   speed: number;
//   size: number;
//   color: string;
//   name: string;
//   velocity: number;
// }) {
//   const meshRef = useRef<THREE.Mesh>(null);
//   const textRef = useRef<THREE.Group>(null);
//   const trailRef = useRef<THREE.Group>(null);

//   // store angles (numbers) instead of raw positions so points always lie exactly on the orbit
//   const trailAngles = useRef<number[]>([]);
//   const maxTrailPoints = 80;
//   const lastAngle = useRef<number | null>(null);

//   // small helper to compute minimal angular difference considering wrap-around
//   const angularDiff = (a: number, b: number) => {
//     const TWO_PI = Math.PI * 2;
//     let d = (a - b) % TWO_PI;
//     if (d < -Math.PI) d += TWO_PI;
//     if (d > Math.PI) d -= TWO_PI;
//     return Math.abs(d);
//   };

//   useFrame((state) => {
//     if (!meshRef.current || !textRef.current || !trailRef.current) return;

//     const angle = state.clock.getElapsedTime() * speed * velocity; // radians

//     // Compute position on perfect circle
//     const x = Math.cos(angle) * distance;
//     const z = Math.sin(angle) * distance;

//     // Update planet and label positions
//     meshRef.current.position.x = x;
//     meshRef.current.position.z = z;
//     meshRef.current.rotation.y += 0.01 * velocity;

//     textRef.current.position.x = x;
//     textRef.current.position.z = z;
//     textRef.current.position.y = 0.2;
//     textRef.current.lookAt(state.camera.position);

//     // Add trail angles at fixed angular increments (deltaAngle)
//     // This keeps the trail points distributed along the fixed circular path.
//     const deltaAngle = Math.PI / 40; // tune this for trail density (smaller => denser)
//     if (lastAngle.current === null) {
//       // initialize
//       lastAngle.current = angle;
//       trailAngles.current.push(angle);
//     } else if (angularDiff(angle, lastAngle.current) >= deltaAngle) {
//       trailAngles.current.push(angle);
//       lastAngle.current = angle;
//       // keep only recent N angles
//       if (trailAngles.current.length > maxTrailPoints) {
//         trailAngles.current.shift();
//       }

//       // Build geometry from angles (projected exactly onto circle)
//       const pts: THREE.Vector3[] = trailAngles.current.map(a => new THREE.Vector3(
//         Math.cos(a) * distance,
//         0,
//         Math.sin(a) * distance
//       ));

//       // update trail: clear and add new line (this is simple and performant for modest point counts)
//       trailRef.current.clear();
//       if (pts.length > 1) {
//         const geometry = new THREE.BufferGeometry().setFromPoints(pts);
//         const material = new THREE.LineBasicMaterial({
//           color,
//           transparent: true,
//           opacity: 0.7,
//           linewidth: 2
//         });
//         const line = new THREE.Line(geometry, material);
//         // optional: prevent frustum culling for long trails sometimes clipped near edges
//         line.frustumCulled = false;
//         trailRef.current.add(line);
//       }
//     }
//   });

//   return (
//     <>
//       <Sphere ref={meshRef} args={[size, 16, 16]}>
//         <meshStandardMaterial color={color} roughness={0.7} />
//       </Sphere>
//       <group ref={textRef}>
//         <Text
//           position={[0.3, 0, 0]}
//           fontSize={0.08}
//           color="white"
//           anchorX="center"
//           anchorY="middle"
//         >
//           {name}
//         </Text>
//       </group>
//       <group ref={trailRef} />
//     </>
//   );
// }

function OrbitingPlanet({
  distance,
  speed,
  size,
  color,
  name,
  velocity
}: {
  distance: number;
  speed: number;
  size: number;
  color: string;
  name: string;
  velocity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.Group>(null);

  // Fixed trail length in radians (e.g., 1/4 of a full orbit)
  const trailLength = Math.PI / 2; // 90 degrees
  const trailPoints = 20; // Number of points in the fixed trail

  useFrame((state) => {
    if (!meshRef.current || !textRef.current || !trailRef.current) return;

    // Compute planet angle (include velocity as playback multiplier).
    const angle = state.clock.getElapsedTime() * speed * velocity; // radians

    // Compute position on perfect circle
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;

    // Update planet and label positions
    meshRef.current.position.x = x;
    meshRef.current.position.z = z;
    meshRef.current.rotation.y += 0.01 * velocity;

    textRef.current.position.x = x;
    textRef.current.position.z = z;
    textRef.current.position.y = 0.2;
    textRef.current.lookAt(state.camera.position);

    // Create fixed-length trail that spins with the planet
    const trailPoints_array: THREE.Vector3[] = [];

    // Generate trail points behind the current planet position
    for (let i = 0; i < trailPoints; i++) {
      const trailAngle = angle - (i / (trailPoints - 1)) * trailLength;
      const trailX = Math.cos(trailAngle) * distance;
      const trailZ = Math.sin(trailAngle) * distance;
      trailPoints_array.push(new THREE.Vector3(trailX, 0, trailZ));
    }

    // Update trail geometry
    trailRef.current.clear();
    if (trailPoints_array.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(trailPoints_array);
      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.7,
        linewidth: 2
      });
      const line = new THREE.Line(geometry, material);
      line.frustumCulled = false;
      trailRef.current.add(line);
    }
  });

  return (
    <>
      <Sphere ref={meshRef} args={[size, 16, 16]}>
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Sphere>
      <group ref={textRef}>
        <Text
          position={[0.3, 0, 0]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </group>
      <group ref={trailRef} />
    </>
  );
}


// -------------------
// Orbital Path Component
// -------------------
function OrbitalPath({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ));
    }
    return pts;
  }, [radius]);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#666666" transparent opacity={0.3} />
    </line>
  );
}


// -------------------
// Star Field Background
// -------------------
function StarField() {
  const stars = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 1000; i++) {
      const r = THREE.MathUtils.randFloat(50, 200);
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      temp.push({ position: [x, y, z] });
    }
    return temp;
  }, []);

  return (
    <>
      {stars.map((star, i) => (
        <Sphere
          key={i}
          args={[0.01, 8, 8]}
          position={star.position as [number, number, number]}
        >
          <meshBasicMaterial color="#ffffff" />
        </Sphere>
      ))}
    </>
  );
}

// -------------------
// UI Controls Component
// -------------------
function UIControls({
  velocity,
  setVelocity,
  systemName,
  planetCount,
  showVideoPanel,
  setShowVideoPanel
}: {
  velocity: number;
  setVelocity: (value: number) => void;
  systemName: string;
  planetCount: number;
  showVideoPanel: boolean;
  setShowVideoPanel: (show: boolean) => void;
}) {
  const router = useRouter();
  return (
    <>
      {/* Left Panel - System Info */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          width: 300,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: 2,
          p: 2,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Back Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Tooltip title="Back to Exoplanet Search">
            <IconButton
              onClick={() => router.push('/utilities/visualization')}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
                mr: 1
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography sx={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>
          {systemName}
        </Typography>

        <Typography sx={{ color: 'white', fontSize: '16px', mt: 1, opacity: 0.8 }}>
          {planetCount} {planetCount === 1 ? 'planet' : 'planets'} orbiting
        </Typography>
      </Box>

      {/* Right Panel - View Controls */}
      {/* <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 200,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: 2,
          p: 2,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Typography sx={{ color: 'white', mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
          VIEW
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Paper
            sx={{
              flex: 1,
              p: 1,
              textAlign: 'center',
              backgroundColor: 'rgba(25, 118, 210, 0.8)',
              cursor: 'pointer',
              border: '2px solid rgba(25, 118, 210, 1)'
            }}
          >
          </Paper>
        </Box>
      </Box> */}

      {/* Bottom Controls */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          maxWidth: 600,
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderRadius: 2,
          p: 2,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography sx={{ color: 'white', minWidth: 60, fontSize: '14px' }}>
          RATE
        </Typography>

        <Slider
          value={velocity}
          onChange={(_, value) => setVelocity(value as number)}
          min={0}
          max={5}
          step={0.1}
          sx={{
            flex: 1,
            color: '#1976d2',
            '& .MuiSlider-thumb': {
              backgroundColor: 'white',
            },
            '& .MuiSlider-track': {
              backgroundColor: 'white',
            },
          }}
        />

        <Typography sx={{ color: 'white', minWidth: 80, fontSize: '14px' }}>
          {velocity.toFixed(1)} day/sec
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
          <Tooltip title={showVideoPanel ? "Hide Video Panel" : "Show Video Panel"}>
            <IconButton
              sx={{
                color: showVideoPanel ? '#1976d2' : 'white',
                backgroundColor: showVideoPanel ? 'rgba(25, 118, 210, 0.2)' : 'transparent'
              }}
              onClick={() => setShowVideoPanel(!showVideoPanel)}
            >
              <VideoLibraryIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fullscreen">
            <IconButton sx={{ color: 'white' }}>
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </>
  );
}

// -------------------
// Video Panel Component
// -------------------
function VideoPanel({
  videos,
  planets,
  systemKepid,
  velocity,
  onClose
}: {
  videos: any[];
  planets: any[];
  systemKepid: string;
  velocity: number;
  onClose: () => void;
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Update video playback rates when velocity changes
  useEffect(() => {
    videoRefs.current.forEach((videoRef) => {
      if (videoRef) {
        videoRef.playbackRate = Math.max(0.1, Math.min(velocity, 5)); // Clamp between 0.1x and 5x
      }
    });
  }, [velocity]);

  // Function to match videos to planets based on KEPID and Kepler name format
  const matchVideoToPlanet = (planet: any, kepid: string, planetIndex: number) => {
    // Debug: Log the planet data to see what's available
    console.log('🔍 Planet data for index', planetIndex, ':', planet);
    console.log('🔍 Available fields:', Object.keys(planet));

    // Extract the Kepler name and replace dashes with underscores
    const keplerName = planet.name;
    console.log('🔍 Kepler name found:', keplerName);

    // If no Kepler name, try to generate one based on common patterns
    let keplerNameFormatted = '';
    if (keplerName) {
      keplerNameFormatted = keplerName.replace(/-/g, '_').replace(/ /g, '_');
      console.log('🔍 Formatted Kepler name:', keplerNameFormatted);
    } else {
      console.log('⚠️ No Kepler name found for planet', planetIndex);
    }

    // Create expected filename format: <kepid>_<kepler_name>.mp4
    const expectedFilename = `${kepid}_${keplerNameFormatted}.mp4`;
    console.log('🔍 Expected filename:', expectedFilename);

    // Find matching video
    const matchingVideo = videos.find(video => video.filename === expectedFilename);
    console.log('🔍 Matching video found:', matchingVideo ? matchingVideo.filename : 'None');

    return { matchingVideo: matchingVideo || null, expectedFilename };
  };

  // Generate video players based on planet data
  const generateVideoPlayers = (): React.ReactElement[] => {
    const players: React.ReactElement[] = [];

    planets.forEach((planet, index) => {
      const { matchingVideo, expectedFilename } = matchVideoToPlanet(planet, systemKepid, index);
      const planetName = planet.name || `Planet ${index + 1}`;

      players.push(
        <Box
          key={`video-${index}`}
          sx={{
            mb: 2,
            p: 2,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Typography
            sx={{
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <PlayIcon sx={{ fontSize: '16px' }} />
            {planetName}
          </Typography>

          {matchingVideo ? (
            <>
              <video
                key={matchingVideo.filename}
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                controls
                autoPlay
                muted
                loop
                style={{
                  width: '100%',
                  height: '150px',
                  borderRadius: '8px',
                  backgroundColor: '#000'
                }}
                onLoadedMetadata={(e) => {
                  const video = e.target as HTMLVideoElement;
                  video.playbackRate = Math.max(0.1, Math.min(velocity, 5));
                }}
              >
                <source src={apiService.getVideoUrl(matchingVideo.filename)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '12px',
                  mt: 1
                }}
              >
                {(matchingVideo.size / (1024 * 1024)).toFixed(1)} MB
              </Typography>
            </>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '150px',
                borderRadius: '8px',
                backgroundColor: '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed rgba(255, 255, 255, 0.3)'
              }}
            >
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '12px',
                  textAlign: 'center'
                }}
              >
                No video available
                <br />
                Expected: {expectedFilename}
              </Typography>
            </Box>
          )}
        </Box>
      );
    });

    return players;
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 20,
        right: 20,
        width: isMinimized ? 60 : 300,
        height: isMinimized ? 60 : 600,
        zIndex: 1000,
        backgroundColor: 'rgba(25, 118, 210, 0.9)',
        borderRadius: 2,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
          flexShrink: 0
        }}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VideoLibraryIcon sx={{ color: 'white' }} />
          {!isMinimized && (
            <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
              LC Visualization ({planets.length})
            </Typography>
          )}
        </Box>
        <IconButton
          size="small"
          sx={{ color: 'white' }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {!isMinimized && (
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
              },
            },
          }}
        >
          {videos.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <VideoLibraryIcon sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '48px', mb: 2 }} />
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                No videos available
              </Typography>
            </Box>
          ) : (
            generateVideoPlayers()
          )}
        </Box>
      )}
    </Box>
  );
}

// -------------------
// Main Visualization Component
// -------------------
export default function VisualizationPage() {
  const { id } = useParams();
  const [velocity, setVelocity] = useState(1);
  const [systemName, setSystemName] = useState('');
  const [planets, setPlanets] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [showVideoPanel, setShowVideoPanel] = useState(false);

  useEffect(() => {
    const fetchSystemData = async () => {
      console.log('🔭 Starting system data fetch for ID:', id);

      if (id) {
        try {
          console.log('📡 Making API call to findByHostId with:', id);
          const response = await apiService.findByHostId(id as string);

          console.log('✅ API Response received:', response);
          console.log('📊 Response data structure:', {
            hasData: !!response.data,
            dataLength: response.data?.length,
            totalRows: response.total_rows,
            firstItem: response.data?.[0],
            hostName: response.data?.[0]?.["Host Name"]
          });

          // Set system name
          if (response.data && response.data[0] && response.data[0]["Host Name"]) {
            const hostName = response.data[0]["Host Name"];
            console.log('🌟 Setting system name to:', hostName);
            setSystemName(hostName);
          } else {
            const fallbackName = `Kepler-${id}`;
            console.log('⚠️ No host name found, using fallback:', fallbackName);
            setSystemName(fallbackName);
          }

          // Create planets based on total_rows and data
          if (response.data && response.total_rows > 0) {
            const planetColors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#6c5ce7", "#a29bfe", "#fd79a8", "#00b894"];
            const generatedPlanets = response.data.map((planetData, index) => {
              const distance = 1 + (index * 0.6); // Increasing orbital distance
              const speed = (2 * Math.PI) / planetData.koi_period;
              const size = 0.001;
              const color = planetColors[index % planetColors.length];
              const name = planetData.kepler_name || `Kepler-${id} ${String.fromCharCode(98 + index)}`; // a, b, c, etc.

              console.log(`🪐 Generated planet ${index + 1}:`, {
                name,
                distance,
                speed,
                size,
                color,
                originalData: planetData
              });

              return {
                distance: Math.max(0.5, distance), // Minimum distance
                speed: Math.max(0.5, speed), // Minimum speed
                size: Math.max(0.05, size), // Minimum size
                color,
                name
              };
            });

            console.log('🌌 Generated planets array:', generatedPlanets);
            setPlanets(generatedPlanets);
          } else {
            console.log('⚠️ No planet data found, using default planets');
          }

        } catch (error) {
          console.error('❌ Error fetching system data:', error);
          console.error('📝 Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          });
          const fallbackName = `Kepler-${id}`;
          console.log('🔄 Using fallback name:', fallbackName);
          setSystemName(fallbackName);
        }
      } else {
        console.log('⚠️ No ID provided, using default system data');
      }
    };

    fetchSystemData();
  }, [id]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log('🎥 Fetching available videos...');
        const videoList = await apiService.getVideos();
        console.log('✅ Videos fetched:', videoList);
        setVideos(videoList);
      } catch (error) {
        console.error('❌ Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <Box sx={{ position: 'relative', width: '90vw', height: '90vh', overflow: 'hidden', margin: '5vh auto' }}>
      <Canvas
        camera={{ position: [0, 5, 8], fov: 60 }}
        style={{ width: "100%", height: "100%", background: "#000011" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={1} />

        {/* Star Field Background */}
        <StarField />

        {/* Central Star */}
        <CentralStar velocity={velocity} hostname={systemName} />

        {/* Orbital Paths */}
        {planets.map((planet: any, index: number) => (
          <OrbitalPath key={index} radius={planet.distance} />
        ))}


        {/* Orbiting Planets */}
        {planets.map((planet: any, index: number) => (
          <OrbitingPlanet
            key={index}
            distance={planet.distance}
            speed={planet.speed}
            size={planet.size}
            color={planet.color}
            name={planet.name}
            velocity={velocity}
          />
        ))}

        {/* Camera Controls */}
        <OrbitControls
          target={[0, 0, 0]}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={15}
          minDistance={2}
        />
      </Canvas>

      {/* UI Overlay */}
      <UIControls
        velocity={velocity}
        setVelocity={setVelocity}
        systemName={systemName}
        planetCount={planets.length}
        showVideoPanel={showVideoPanel}
        setShowVideoPanel={setShowVideoPanel}
      />

      {/* Video Panel */}
      {showVideoPanel && (
        <VideoPanel
          videos={videos}
          planets={planets}
          systemKepid={id as string}
          velocity={velocity}
          onClose={() => setShowVideoPanel(false)}
        />
      )}
    </Box>
  );
}
