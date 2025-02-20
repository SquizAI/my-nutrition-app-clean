import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const VisualizerContainer = styled.div`
  width: 100%;
  height: 100px;
  margin: ${theme.spacing.lg} 0;
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  stream,
  isRecording
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();

  useEffect(() => {
    if (!stream || !isRecording || !canvasRef.current) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;
    source.connect(analyser);
    analyserRef.current = analyser;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barWidth = (rect.width / bufferLength) * 2.5;
    let barHeight: number;
    let x: number;

    const draw = () => {
      if (!isRecording) return;

      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, rect.width, rect.height);

      x = 0;
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * rect.height;

        const hue = ((i / bufferLength) * 360) + ((Date.now() / 50) % 360);
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;

        ctx.fillRect(
          x,
          rect.height - barHeight,
          barWidth,
          barHeight
        );

        x += barWidth + 1;
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      source.disconnect();
      analyser.disconnect();
      audioContext.close();
    };
  }, [stream, isRecording]);

  return (
    <VisualizerContainer>
      <Canvas ref={canvasRef} />
    </VisualizerContainer>
  );
}; 