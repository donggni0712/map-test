import MapWithPin from "./\bMap";

const INITIAL_POSITION = { x: 0, y: 0 };
const PIN_POSITION = { x: 700, y: 400 }; // 지도 상의 핀 위치 (고정)
const MAP_SIZE = 1600; // 지도의 크기
const CANVAS_SIZE = 500; // 캔버스의 크기
const PAN_SENSITIVITY = 0.8; // 이동할 때 민감도 설정
const MAP_WIDTH = 1200;
const MAP_HEIGHT = 1300;
const PIN_SIZE = 100; // 핀 이미지 크기 설정

function App() {
  return (
    <div>
      <MapWithPin />
    </div>
  );
}

export default App;
