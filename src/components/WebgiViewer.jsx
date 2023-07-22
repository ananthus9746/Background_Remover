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

const WebgiViewer = forwardRef((props, ref) => {
  const canvasRef = useRef(null);
  const [viewerRef, setViewerRef] = useState(null);
  const [targetRef, setTargetRef] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [positionRef, setPositionRef] = useState(null);
  const canvasContainerRef = useRef(null);
  const [previewMode, setPreviewMode] = useState(false);
  const[isMobile,setIsMobile]=useState(null)

  useImperativeHandle(ref, () => ({
    triggerPreview() {
      setPreviewMode(true);
      canvasContainerRef.current.style.pointerEvents = "all";
      props.contentRef.current.style.opacity = "0";
      gsap.to(positionRef, {
        x: 13.04,
        y: -2.01,
        z: 2.29,
        duration: 2,
        onUpdate: () => {
          viewerRef.setDirty();
          cameraRef.positionTargetUpdated(true);
        },
      });

      gsap.to(targetRef, { x: 0.11, y: 0.0, z: 0.0, duration: 2 });

      viewerRef.scene.activeCamera.setCameraOptions({ controlsEnabled: true });
    },
  }));

  //useCallback will return a memoized version of the callback that only changes if one of the inputs has changed.
  const memoizedScrollAnimation = useCallback((position, target,isMobile, onUpdate) => {
    if (position && target && onUpdate) {
      scrollAnimation(position, target,isMobile, onUpdate);
    }
  }, []);

  const setupViewer = useCallback(async () => {
    // Initialize the viewer
    const viewer = new ViewerApp({
      canvas: canvasRef.current,
    });

    setViewerRef(viewer);
   const isMobileOrTablate= mobileAndTabletCheck();
   setIsMobile(isMobileOrTablate)

    const manager = await viewer.addPlugin(AssetManagerPlugin);

    const camera = viewer.scene.activeCamera;
    const position = camera.position;
    const target = camera.target;

    setCameraRef(camera);
    setPositionRef(position);
    setTargetRef(target);

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
    //   await manager.addFromPath("scene_red_phone.glb");

    // Removing 3d object background clipBackground
    viewer.getPlugin(TonemapPlugin).config.clipBackground = true;

    viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: true });

    if(isMobileOrTablate){
        position.set(-16.7,1.17,11.7)
        target.set(0,1.37,0);
        props.contentRef.current.className="mobile-or-tablate";
    }

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
    memoizedScrollAnimation(position, target,isMobileOrTablate, onUpdate);
  }, []);

  useEffect(() => {
    setupViewer();
  }, []);

  const handleExit = useCallback(() => {
    setPreviewMode(false);

    canvasContainerRef.current.style.pointerEvents = "none";
    props.contentRef.current.style.opacity = "1";
    viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: false });
    setPreviewMode(false);

    gsap
      .to(positionRef, {
        x: 1.56,
        y: 5.0,
        z: 0.01,
        scrollTrigger: {
          trigger: ".display-section",
          start: "top bottom",
          end: "top top",
          scrub: 2,
          immediateRender: false,
        },
        onUpdate: () => {
          viewerRef: setDirty();
          cameraRef.positionTargetUpdated(true);
        },
      })
      gsap.to(targetRef, {
        x:!isMobile? -0.5:-1.62,
        y:!isMobile? 0.32:0.02,
        z:!isMobile? 0.0:0.06,
        scrollTrigger: {
          trigger: ".display-section",
          start: "top bottom",
          end: "top top",
          scrub: 2,
          immediateRender: false,
        },
      });
  }, [canvasContainerRef,viewerRef,positionRef,cameraRef,targetRef]);

  return (
    <div ref={canvasContainerRef} id="webgi-canvas-container">
      <canvas id="webgi-canvas" ref={canvasRef} className="mobile-or-tablate"/>
      {previewMode && (
        <button onClick={handleExit} className="button">
          Exit
        </button>
      )}
    </div>
  );
});

export default WebgiViewer;
