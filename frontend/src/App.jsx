import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, useGLTF } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import "./index.css";

function BrainModel() {
  const { scene } = useGLTF("/brain.glb");
  return (
    <primitive
      object={scene}
      scale={10.5}
      position={[0, -1, 0]}
      rotation={[0, Date.now() * 0.0008, 0]}
    />
  );
}

export default function App() {
  const [eegFile, setEegFile] = useState(null);
  const [spectrogramFile, setSpectrogramFile] = useState(null);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eegFile || !spectrogramFile) {
      alert("⚠ Please upload both files!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("eeg_file", eegFile);
      formData.append("spectrogram_file", spectrogramFile);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload files");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("❌ Error uploading files. Check console.");
    }
  };

  const handleReset = () => {
    setResult(null);
    setEegFile(null);
    setSpectrogramFile(null);
  };

  return (
    <div className="app">
      {/* 3D Background */}
      <Canvas
        style={{ height: "100vh", width: "100vw" }}
        camera={{ position: [0, 0, 20], fov: 70 }}
      >
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <Stars radius={400} depth={120} count={80000} factor={6} fade />
        <Suspense fallback={null}>
          <BrainModel />
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={4} />
      </Canvas>

      {/* Heading */}
      <motion.h1
        className="app-heading"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        🧠 Harmful Brain Activity
      </motion.h1>

      {/* Upload + Submit */}
      <AnimatePresence>
        {!result && (
          <>
            {/* EEG Upload */}
            <motion.div
              className="upload-card left"
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: -80 }}
              transition={{ duration: 1 }}
            >
              <h2>📡 Upload EEG File</h2>
              <label className="file-label">
                <input
                  type="file"
                  onChange={(e) => setEegFile(e.target.files[0])}
                  hidden
                />
                <span>Choose EEG File</span>
              </label>
              {eegFile && <p className="file-name">{eegFile.name}</p>}
            </motion.div>

            {/* Spectrogram Upload */}
            <motion.div
              className="upload-card left second"
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, y: -80 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h2>🎶 Upload Spectrogram</h2>
              <label className="file-label">
                <input
                  type="file"
                  onChange={(e) => setSpectrogramFile(e.target.files[0])}
                  hidden
                />
                <span>Choose Spectrogram</span>
              </label>
              {spectrogramFile && (
                <p className="file-name">{spectrogramFile.name}</p>
              )}
            </motion.div>

            {/* Submit Button Right Middle */}
            <motion.div
              className="submit-container right-middle"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <button onClick={handleSubmit}>🚀 Analyze Brain</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Results */}
      {result && (
        <motion.div
          ref={resultRef}
          className="result-card"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="result-title">✅ Analysis Complete</h2>
          <h3 className="prediction">
            Prediction: <span>{result.predicted_label.toUpperCase()}</span>
          </h3>

          <div className="probabilities">
            {Object.entries(result.probabilities).map(
              ([category, prob], index) => (
                <div key={category} className="prob-bar">
                  <motion.div
                    className="prob-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${(prob * 100).toFixed(1)}%` }}
                    transition={{ duration: 1 + index * 0.3 }}
                  >
                    <span className="prob-category">{category.toUpperCase()}</span>
                    <span className="prob-value">{(prob * 100).toFixed(1)}%</span>
                  </motion.div>
                </div>
              )
            )}
          </div>

          {/* Reset button */}
          <motion.div
            className="submit-container"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <button onClick={handleReset}>🔄 Try Again</button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
