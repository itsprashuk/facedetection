import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import * as faceapi from 'face-api.js';

function App() {
  const videoheight = 480;
  const videowidth = 640;
  const [initializing, setInitializing] = useState(false);
  const videoref = useRef();
  const canvaref = useRef();

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + './models';
      setInitializing(true);
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(startVideo);
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then(stream => {
        videoref.current.srcObject = stream;
      })
      .catch(error => {
        console.error('Error accessing camera', error);
      });
  };

  const handlevideo=()=>{
    setInterval(async()=>{
      if(initializing){
        setInitializing(false);
      }
      canvaref.current.innerHTML=faceapi.createCanvasFromMedia(videoref.current);
      const displaysize={
        width:videowidth,
        height:videoheight
      }
      faceapi.matchDimensions(canvaref.current,displaysize);
      const detection=await faceapi.detectAllFaces(videoref.current,new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

      const resizedetection=faceapi.resizeResults(detection,displaysize);
      canvaref.current.getContext('2d').clearRect(0,0,videowidth,videoheight);

      faceapi.draw.drawDetections(canvaref.current,resizedetection);
      faceapi.draw.drawFaceLandmarks(canvaref.current,resizedetection);
      faceapi.draw.drawFaceExpressions(canvaref.current,resizedetection);
      

      

    },1000)

  }

  return (
    <div className="App">
      <span>{initializing ? 'Initializing' : 'Ready'}</span>

      <div className='display-flex justify-content-center'>
 <video ref={videoref} autoPlay muted height={videoheight} width={videowidth} onPlay={handlevideo} />
      <canvas ref={canvaref} className='position-absolute'></canvas>
      </div>
     
    </div>
  );
}

export default App;
