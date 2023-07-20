import React, {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  ViewerApp,
  AssetManagerPlugin,
  GBufferPlugin,
  timeout,
  ProgressivePlugin,
  TonemapPlugin,
  SSRPlugin,
  SSAOPlugin,
  DiamondPlugin,
  FrameFadePlugin,
  GLTFAnimationPlugin,
  GroundPlugin,
  BloomPlugin,
  TemporalAAPlugin,
  AnisotropyPlugin,
  GammaCorrectionPlugin,
  CanvasSnipperPlugin,
  mobileAndTabletCheck,
  addBasePlugins,
  NeverDepth,
} from "webgi";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollAnimation } from "../components/lib/scroll-animation";
gsap.registerPlugin(ScrollTrigger);

function WebgiViewer() {
  const canvasRef = useRef(null);

  //useCallback will return a memoized version of the callback that only changes if one of the inputs has changed.
  const memoizedScrollAnimation = useCallback((position, target, onUpdate) => {
    if (position && target && onUpdate) {
      scrollAnimation(position, target, onUpdate);
    }
  }, []);

  const setupViewer = useCallback(async () => {
    
      // Initialize the viewer
      const viewer = new ViewerApp({
        canvas: canvasRef.current,
      });

      const manager = await viewer.addPlugin(AssetManagerPlugin);

      const camera = viewer.scene.activeCamera;
      const position = camera.position;
      const target = camera.target;

      // Add plugins individually.
      await viewer.addPlugin(GBufferPlugin);
      await viewer.addPlugin(new ProgressivePlugin(32));
      await viewer.addPlugin(new TonemapPlugin(true));
      await viewer.addPlugin(GammaCorrectionPlugin);
      await viewer.addPlugin(SSRPlugin);
      await viewer.addPlugin(SSAOPlugin);
      // await viewer.addPlugin(DiamondPlugin)
      // await viewer.addPlugin(FrameFadePlugin)
      // await viewer.addPlugin(GLTFAnimationPlugin)
      // await viewer.addPlugin(GroundPlugin)
      await viewer.addPlugin(BloomPlugin);

      viewer.renderer.refreshPipeline();

      // Import and add a GLB file.
      await manager.addFromPath("scene-black.glb");
      //await manager.addFromPath("scene_red_phone.glb");

      // Removing 3d object background clipBackground
      viewer.getPlugin(TonemapPlugin).config.clipBackground = true;

      viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: false });

      window.scrollTo(0, 0);
      let needsUpdate = true;
      const onUpdate = () => {
        needsUpdate = true;
        viewer.setDirty;
      };
      viewer.addEventListener("preFrame", () => {
        if (needsUpdate) {
          camera.positionTargetUpdated(true);
          needsUpdate = false;
        }
      });
      memoizedScrollAnimation(position, target, onUpdate);

    
  }, []);

  useEffect(() => {
    setupViewer();
  }, []);

  return (
    <div id="webgi-canvas-container">
      <canvas id="webgi-canvas" ref={canvasRef} />
    </div>
  );
}

export default WebgiViewer;
