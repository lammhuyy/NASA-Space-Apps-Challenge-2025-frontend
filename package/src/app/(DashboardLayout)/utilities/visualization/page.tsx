"use client";

import React, { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { apiService } from "@/services/api";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Chip
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

// -------------------
// Earth (center object)
// -------------------
function Earth({ onClick }: { onClick?: () => void }) {
  const textureLoader = new THREE.TextureLoader();
  const earthTexture = textureLoader.load(
    "https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"
  );

  return (
    <Sphere args={[0.2, 64, 64]} onClick={onClick}>
      <meshStandardMaterial map={earthTexture} />
    </Sphere>
  );
}

// -------------------
// Host Stars (Kepler systems)
// -------------------
function HostStars({ count = 2000 }) {
  const router = useRouter();

  const stars = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const r = THREE.MathUtils.randFloat(10, 150); // distance from center
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const radius = Math.random() * 0.15 + 0.05; // vary size
      temp.push({ position: [x, y, z], radius });
    }
    return temp;
  }, [count]);

  return (
    <>
      {stars.map((s, i) => (
        <Sphere
          key={i}
          args={[s.radius, 12, 12]}
          position={s.position as [number, number, number]}
          onClick={() => {
            const randomId = Math.floor(Math.random() * 10000); // pick range you want
            router.push(`/utilities/visualization/${randomId}`);
          }}
        >
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </Sphere>
      ))}
    </>
  );
}

// -------------------
// Search Interface Component
// -------------------
function SearchInterface() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a hostname to search");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const results = await apiService.findByHostname(searchTerm.trim());
      setSearchResults(results);
    } catch (err: any) {
      // Check if it's a 404 error (no results found)
      if (err.message && err.message.includes("404")) {
        setError(`No exoplanets found with hostname containing "${searchTerm.trim()}"`);
      } else {
        setError(err.message || "Failed to search for hostname");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 20,
        left: 20,
        width: 350,
        zIndex: 1000,
        backgroundColor: 'rgba(25, 118, 210, 0.9)',
        borderRadius: 2,
        p: 2,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(25, 118, 210, 0.3)',
        boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)'
      }}
    >
      <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
        Exoplanet Search
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Enter hostname"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
          sx={{
            backgroundColor: 'white',
            color: 'black',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
            '&:disabled': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              color: 'rgba(0, 0, 0, 0.3)',
            },
          }}
        >
          Search
        </Button>
      </Box>

      {error && (
        <Alert
          severity="info"
          sx={{
            mb: 2,
            backgroundColor: 'rgba(25, 118, 210, 0.2)',
            border: '1px solid rgba(25, 118, 210, 0.4)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          {error}
        </Alert>
      )}

      {searchResults && (
        <Paper
          sx={{
            backgroundColor: 'rgba(25, 118, 210, 0.7)',
            color: 'white',
            maxHeight: 400,
            overflow: 'auto',
            border: '1px solid rgba(25, 118, 210, 0.4)',
            boxShadow: '0 2px 10px rgba(25, 118, 210, 0.2)'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Search Results
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip
                label={`Hostname: ${searchResults.hostname}`}
                size="small"
                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', color: 'white', fontWeight: 'bold' }}
              />
              <Chip
                label={`KEPID: ${searchResults.kepid}`}
                size="small"
                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', color: 'white', fontWeight: 'bold' }}
              />
              <Chip
                label={`${searchResults.total_rows} rows`}
                size="small"
                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', color: 'white', fontWeight: 'bold' }}
              />
            </Box>
          </Box>

          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {searchResults.data?.slice(0, 10).map((row: any, index: number) => (
              <ListItem key={index} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', flexDirection: 'column', alignItems: 'flex-start' }}>
                {/* <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                  Row {index + 1}
                </Typography> */}
                <Box sx={{ ml: 0 }}>
                  {/* {row['Host Name'] && (
                    <Typography variant="caption" component="div" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 0.25 }}>
                      Host: {row['Host Name']}
                    </Typography>
                  )} */}
                  {row['kepoi_name'] && (
                    <Typography variant="caption" component="div" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      KOI Name: {row['kepoi_name']}
                    </Typography>
                  )}
                </Box>
              </ListItem>
            ))}
            {searchResults.data?.length > 10 && (
              <ListItem>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' }}>
                  ... and {searchResults.data.length - 10} more rows
                </Typography>
              </ListItem>
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
}

// -------------------
// Main Scene
// -------------------
export default function App() {
  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 3, 8], fov: 75 }}
        style={{ width: "100%", height: "100%", background: "black" }}
      >
        {/* Lights */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={2.5} />

        {/* Earth */}
        <Earth onClick={() => alert("🌍 Earth clicked!")} />

        {/* Kepler Host Stars */}
        <HostStars count={5000} />

        {/* Camera Controls */}
        <OrbitControls target={[0, 0, 0]} enablePan={false} />
      </Canvas>

      {/* Search Interface Overlay */}
      <SearchInterface />
    </Box>
  );
}