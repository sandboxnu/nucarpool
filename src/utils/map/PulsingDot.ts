import { Map } from "mapbox-gl";

export default class PulsingDot {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  context: CanvasRenderingContext2D;
  map: Map;

  constructor(size: number, map: Map) {
    this.width = size;
    this.height = size;
    this.data = new Uint8ClampedArray(size * size * 4);
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext("2d")!;
    this.map = map;
  }

  render() {
    const duration = 3000;
    const t = (performance.now() % duration) / duration;

    const radius = (this.width / 2) * 0.3;
    const outerRadius = (this.width / 2) * 0.7 * t + radius;
    const context = this.context;

    // Draw the outer circle.
    context.clearRect(0, 0, this.width, this.height);
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
    context.fillStyle = `rgba(66, 133, 244, ${1 - t})`;
    context.fill();

    // Draw the inner circle.
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
    context.fillStyle = "rgba(66, 133, 244, 1)";
    context.strokeStyle = "white";
    context.lineWidth = 2 + 4 * (1 - t);
    context.fill();
    context.stroke();

    // Update this image's data with data from the canvas.
    this.data = context.getImageData(0, 0, this.width, this.height).data;

    // Continuously repaint the map, resulting
    // in the smooth animation of the dot.
    this.map.triggerRepaint();

    // Return `true` to let the map know that the image was updated.
    return true;
  }
}
