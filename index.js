import { Color } from "three";
import { IfcViewerAPI } from "web-ifc-viewer";
import { TilesRenderer } from "3d-tiles-renderer";

// SET UP IFC.js

const container = document.getElementById("viewer-container");
const viewer = new IfcViewerAPI({
  container,
  backgroundColor: new Color(0xffffff),
});
viewer.IFC.setWasmPath("./wasm-0-0-35/");

// Create grid and axes
//viewer.grid.setGrid();
//viewer.axes.setAxes();

const ifcCamera = viewer.context.getIfcCamera();
ifcCamera.cameraControls.setLookAt(100, 100, 100, 0, 0, 0);

document.addEventListener("drop", function (event) {
  event.preventDefault();
  event.stopPropagation();
  const file = event.dataTransfer.files[0];
  const fileUrl = URL.createObjectURL(file);

  // Vérifiez si le fichier déposé est un fichier .ifc
  if (file.name.endsWith(".ifc")) {
    const dropInstruction = document.getElementById("drop-instruction");
    dropInstruction.style.display = "none";
    const loadingIcon = document.getElementById("spinner-container");
    loadingIcon.style.display = "flex";

    async function loadIfc(url) {
      // Load the model
      const model = await viewer.IFC.loadIfcUrl(url);

      // Add dropped shadow and post-processing efect
      await viewer.shadowDropper.renderShadow(model.modelID);
      //viewer.context.renderer.postProduction.active = true;

      loadingIcon.style.display = "none";
    }

    loadIfc(fileUrl);
  }
});

document.addEventListener("dragover", function (event) {
  event.preventDefault();
  event.stopPropagation();
});

// SET UP 3DTilesRenderer from https://github.com/NASA-AMMOS/3DTilesRendererJS
// First, get elements from IFC.js
const scene = viewer.context.getScene();
const camera = viewer.context.getCamera();
const renderer = viewer.context.getRenderer();

const tilesRenderer = new TilesRenderer("./data/tileset.json");

// Move the model
tilesRenderer.group.rotateY(3, 14159);
tilesRenderer.group.translateX(-150);
tilesRenderer.group.translateY(-55);
tilesRenderer.group.translateZ(-50);

tilesRenderer.setCamera(camera);
tilesRenderer.setResolutionFromRenderer(camera, renderer);
scene.add(tilesRenderer.group);

renderLoop();

function renderLoop() {
  requestAnimationFrame(renderLoop);

  // The camera matrix is expected to be up to date
  // before calling tilesRenderer.update
  camera.updateMatrixWorld();
  tilesRenderer.update();
  renderer.render(scene, camera);
}
