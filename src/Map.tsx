import React, { useRef, useEffect } from "react";

const INITIAL_POSITION = { x: 0, y: 0 };
const PIN_POSITION = { x: 700, y: 400 }; // 지도 상의 핀 위치 (고정)
const MAP_SIZE = 1000; // 지도의 크기
const PAN_SENSITIVITY = 0.8; // 이동할 때 민감도 설정
const MAP_WIDTH = 2336;
const MAP_HEIGHT = 2481;
// MAP_WIDTH_LIMIT, MAP_HEIGHT_LIMIT 매직넘버임. 왜 작동하는지모름.
const MAP_WIDTH_LIMIT = 1300;
const MAP_HEIGHT_LIMIT = 1450;
const PIN_SIZE = 100; // 핀 이미지 크기 설정

function MapWithPin() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewPosRef = useRef(INITIAL_POSITION);
  const isPanningRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const canvasSizeRef = useRef<number>(0); // 캔버스 크기 상태 추가

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        // 캔버스 크기를 반응형으로 조정
        const canvasSize = window.innerWidth * 0.8;
        canvasSizeRef.current = canvasSize;
        canvas.width = canvasSize;
        canvas.height = canvasSize;
      }
    };

    handleResize(); // 초기 로드 시 캔버스 크기 설정
    window.addEventListener("resize", handleResize); // 윈도우 리사이즈 이벤트 추가

    return () => {
      window.removeEventListener("resize", handleResize); // 클린업
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const mapImage = new Image();
    const pinImage = new Image();

    mapImage.src = "asset/map.png"; // 지도의 이미지
    pinImage.src = "asset/24-2 동박 온라인 핀_팝업이벤트.png"; // 핀 이미지의 URL

    const draw = () => {
      if (!ctx || !canvas) return;

      // 캔버스를 초기화
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 지도를 그리기
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

      // 핀 위치 계산
      const relativePinX =
        (PIN_POSITION.x - viewPosRef.current.x) *
        (canvasSizeRef.current / MAP_SIZE);
      const relativePinY =
        (PIN_POSITION.y - viewPosRef.current.y) *
        (canvasSizeRef.current / MAP_SIZE);

      // 핀이 캔버스 안에 있을 때만 그리기
      if (
        relativePinX >= 0 &&
        relativePinX <= canvasSizeRef.current &&
        relativePinY >= 0 &&
        relativePinY <= canvasSizeRef.current
      ) {
        const pinSize = 100; // 핀 이미지 크기 설정
        ctx.drawImage(
          pinImage,
          relativePinX - pinSize / 2,
          relativePinY - pinSize / 2,
          pinSize,
          pinSize
        );
      }
    };

    // 이미지가 모두 로드된 후에 지도와 핀을 그리기
    mapImage.onload = () => draw();
    pinImage.onload = () => draw();

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isPanningRef.current = true;

      // 현재 마우스의 상대 위치를 기준으로 저장
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

      // 마우스 이동량을 PAN_SENSITIVITY로 조정하고, 방향을 반대로 변경
      const deltaX = (e.clientX - startPosRef.current.x) * PAN_SENSITIVITY;
      const deltaY = (e.clientY - startPosRef.current.y) * PAN_SENSITIVITY;

      // 새로운 뷰포트 위치 계산
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

    const handleClick = (e: MouseEvent) => {
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // 핀 이미지의 캔버스 내 상대적 위치
      const relativePinX =
        (PIN_POSITION.x - viewPosRef.current.x) *
        (canvasSizeRef.current / MAP_SIZE);
      const relativePinY =
        (PIN_POSITION.y - viewPosRef.current.y) *
        (canvasSizeRef.current / MAP_SIZE);

      // 핀 이미지의 영역을 계산
      const pinLeft = relativePinX - PIN_SIZE / 2;
      const pinRight = relativePinX + PIN_SIZE / 2;
      const pinTop = relativePinY - PIN_SIZE / 2;
      const pinBottom = relativePinY + PIN_SIZE / 2;

      // 마우스 클릭 위치가 핀 이미지의 영역 내에 있는지 확인
      if (
        mouseX >= pinLeft &&
        mouseX <= pinRight &&
        mouseY >= pinTop &&
        mouseY <= pinBottom
      ) {
        alert("이벤트 팝업!");
      }
    };

    // 마우스 이벤트
    canvas?.addEventListener("mousedown", handleMouseDown);
    canvas?.addEventListener("mouseup", handleMouseUp);
    canvas?.addEventListener("mousemove", handleMouseMove);
    canvas?.addEventListener("click", handleClick);

    // 터치 이벤트
    canvas?.addEventListener("touchstart", handleTouchStart);
    canvas?.addEventListener("touchend", handleTouchEnd);
    canvas?.addEventListener("touchmove", handleTouchMove);

    return () => {
      canvas?.removeEventListener("mousedown", handleMouseDown);
      canvas?.removeEventListener("mouseup", handleMouseUp);
      canvas?.removeEventListener("mousemove", handleMouseMove);
      canvas?.removeEventListener("click", handleClick);
      canvas?.removeEventListener("touchstart", handleTouchStart);
      canvas?.removeEventListener("touchend", handleTouchEnd);
      canvas?.removeEventListener("touchmove", handleTouchMove);
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
