import React, { useRef, useEffect } from "react";

const INITIAL_POSITION = { x: 0, y: 0 };
const MAP_SIZE = 1000;
const PAN_SENSITIVITY = 2.5;
const MAP_WIDTH = 2336;
const MAP_HEIGHT = 2481;
const MAP_WIDTH_LIMIT = 1300;
const MAP_HEIGHT_LIMIT = 1450;

interface Pin {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "customPin" | "bothPin";
  pinName: string; // 핀 이름 추가
}

const pins: Pin[] = [
  {
    x: 830,
    y: 400,
    width: 100,
    height: 100,
    type: "customPin",
    pinName: "popup",
  },
  {
    x: 200,
    y: 1090,
    width: 80,
    height: 50,
    type: "bothPin",
    pinName: "a1",
  },
  {
    x: 300,
    y: 1090,
    width: 80,
    height: 50,
    type: "bothPin",
    pinName: "a2",
  },
];

function MapWithPin() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewPosRef = useRef(INITIAL_POSITION);
  const isPanningRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const canvasSizeRef = useRef<number>(0);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const canvasSize = window.innerWidth * 0.8;
        canvasSizeRef.current = canvasSize;
        canvas.width = canvasSize;
        canvas.height = canvasSize;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const mapImage = new Image();

    mapImage.src = "asset/map.png"; // 지도 이미지
    const pinImages = pins.reduce((acc, pin) => {
      const img = new Image();
      img.src = `asset/${pin.pinName}.png`; // 핀 이미지 로드
      acc[pin.pinName] = img;
      return acc;
    }, {} as Record<string, HTMLImageElement>);

    const draw = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(
        mapImage,
        viewPosRef.current.x,
        viewPosRef.current.y,
        MAP_SIZE,
        MAP_SIZE,
        0,
        0,
        canvasSizeRef.current,
        canvasSizeRef.current
      );

      pins.forEach((pin) => {
        const relativePinX =
          (pin.x - viewPosRef.current.x) * (canvasSizeRef.current / MAP_SIZE);
        const relativePinY =
          (pin.y - viewPosRef.current.y) * (canvasSizeRef.current / MAP_SIZE);

        if (
          relativePinX >= 0 &&
          relativePinX <= canvasSizeRef.current &&
          relativePinY >= 0 &&
          relativePinY <= canvasSizeRef.current
        ) {
          const img = pinImages[pin.pinName];
          if (img.complete) {
            ctx.drawImage(
              img,
              relativePinX - pin.width / 2,
              relativePinY - pin.height / 2,
              pin.width,
              pin.height
            );
          } else {
            img.onload = () => {
              ctx.drawImage(
                img,
                relativePinX - pin.width / 2,
                relativePinY - pin.height / 2,
                pin.width,
                pin.height
              );
            };
          }
        }
      });
    };

    mapImage.onload = () => draw();

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isPanningRef.current = true;

      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const handleMouseUp = () => {
      isPanningRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return;

      const deltaX = (e.clientX - startPosRef.current.x) * PAN_SENSITIVITY;
      const deltaY = (e.clientY - startPosRef.current.y) * PAN_SENSITIVITY;

      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      const newViewPosX = viewPosRef.current.x - deltaX;
      const newViewPosY = viewPosRef.current.y - deltaY;

      const limitedViewPosX = Math.max(
        Math.min(newViewPosX, MAP_WIDTH_LIMIT),
        0
      );
      const limitedViewPosY = Math.max(
        Math.min(newViewPosY, MAP_HEIGHT_LIMIT),
        0
      );
      viewPosRef.current = { x: limitedViewPosX, y: limitedViewPosY };
      draw();
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      isPanningRef.current = true;

      const touch = e.touches[0];
      startPosRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const handleTouchEnd = () => {
      isPanningRef.current = false;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isPanningRef.current) return;

      const touch = e.touches[0];
      const deltaX = (touch.clientX - startPosRef.current.x) * PAN_SENSITIVITY;
      const deltaY = (touch.clientY - startPosRef.current.y) * PAN_SENSITIVITY;

      startPosRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };

      const newViewPosX = viewPosRef.current.x - deltaX;
      const newViewPosY = viewPosRef.current.y - deltaY;

      const limitedViewPosX = Math.max(
        Math.min(newViewPosX, MAP_WIDTH_LIMIT),
        0
      );
      const limitedViewPosY = Math.max(
        Math.min(newViewPosY, MAP_HEIGHT_LIMIT),
        0
      );

      viewPosRef.current = { x: limitedViewPosX, y: limitedViewPosY };
      draw();
    };

    const handlePinClick = (pin: Pin) => {
      alert(`${pin.pinName} 클릭`);
    };

    const handleClick = (e: MouseEvent) => {
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      pins.forEach((pin) => {
        const relativePinX =
          (pin.x - viewPosRef.current.x) * (canvasSizeRef.current / MAP_SIZE);
        const relativePinY =
          (pin.y - viewPosRef.current.y) * (canvasSizeRef.current / MAP_SIZE);

        const pinLeft = relativePinX - pin.width / 2;
        const pinRight = relativePinX + pin.width / 2;
        const pinTop = relativePinY - pin.height / 2;
        const pinBottom = relativePinY + pin.height / 2;

        if (
          mouseX >= pinLeft &&
          mouseX <= pinRight &&
          mouseY >= pinTop &&
          mouseY <= pinBottom
        ) {
          handlePinClick(pin);
        }
      });
    };

    const handleTouch = (e: TouchEvent) => {
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const touchY = e.touches[0].clientY - rect.top;

      pins.forEach((pin) => {
        const relativePinX =
          (pin.x - viewPosRef.current.x) * (canvasSizeRef.current / MAP_SIZE);
        const relativePinY =
          (pin.y - viewPosRef.current.y) * (canvasSizeRef.current / MAP_SIZE);

        const pinLeft = relativePinX - pin.width / 2;
        const pinRight = relativePinX + pin.width / 2;
        const pinTop = relativePinY - pin.height / 2;
        const pinBottom = relativePinY + pin.height / 2;

        if (
          touchX >= pinLeft &&
          touchX <= pinRight &&
          touchY >= pinTop &&
          touchY <= pinBottom
        ) {
          handlePinClick(pin);
        }
      });
    };

    canvas?.addEventListener("mousedown", handleMouseDown);
    canvas?.addEventListener("mouseup", handleMouseUp);
    canvas?.addEventListener("mousemove", handleMouseMove);
    canvas?.addEventListener("click", handleClick);

    canvas?.addEventListener("touchstart", handleTouchStart);
    canvas?.addEventListener("touchend", handleTouchEnd);
    canvas?.addEventListener("touchmove", handleTouchMove);
    canvas?.addEventListener("touchstart", handleTouch);

    return () => {
      canvas?.removeEventListener("mousedown", handleMouseDown);
      canvas?.removeEventListener("mouseup", handleMouseUp);
      canvas?.removeEventListener("mousemove", handleMouseMove);
      canvas?.removeEventListener("click", handleClick);

      canvas?.removeEventListener("touchstart", handleTouchStart);
      canvas?.removeEventListener("touchend", handleTouchEnd);
      canvas?.removeEventListener("touchmove", handleTouchMove);
      canvas?.removeEventListener("touchstart", handleTouch);
    };
  }, []);

  return (
    <div>
      <h1>동박!</h1>
      <canvas ref={canvasRef} style={{ border: "1px solid black" }} />
    </div>
  );
}

export default MapWithPin;
