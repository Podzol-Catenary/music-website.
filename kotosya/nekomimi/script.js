import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.54/build/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.54/build/pdf.worker.min.mjs";

const PDF_FILE = "sample.pdf";

let pdf = null;
let currentPage = 1;
let scale = 1;

const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");

async function render() {

    console.log("render start");

    const page = await pdf.getPage(currentPage);
    console.log("page loaded");

    const baseViewport = page.getViewport({ scale: 1 });

    const maxWidth = window.innerWidth * 0.8;
    const autoScale = maxWidth / baseViewport.width;

    const viewport = page.getViewport({
        scale: autoScale * scale
    });

    
const outputScale = window.devicePixelRatio || 1;

canvas.width = Math.floor(viewport.width * outputScale);
canvas.height = Math.floor(viewport.height * outputScale);

canvas.style.width = viewport.width + "px";
canvas.style.height = viewport.height + "px";
    

    console.log(canvas.width, canvas.height);

await page.render({

    canvasContext: ctx,
    viewport: viewport,
    transform: [
        outputScale, 0,
        0, outputScale,
        0, 0
    ]
}).promise;

    console.log("render finished");

    document.getElementById("pageNum").textContent = currentPage;
    document.getElementById("pageCount").textContent = pdf.numPages;
    document.getElementById("zoomValue").textContent =
        Math.round(autoScale * scale * 100) + "%";
}

pdf = await pdfjsLib.getDocument({
    url: PDF_FILE,
    cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.54/cmaps/",
    cMapPacked: true,
}).promise;

console.log(pdf);
console.log(pdf.numPages);

await render();

// 左ボタン = 次ページ（日本語縦書き）

document.getElementById("pageNext").onclick = async()=>{

    if(currentPage >= pdf.numPages)return;

    currentPage++;

    await render();

};


// 右ボタン = 前ページ

document.getElementById("pagePrev").onclick = async()=>{

    if(currentPage <= 1)return;

    currentPage--;

    await render();

};


document.getElementById("zoomIn").onclick = async () => {
    scale += 0.1;
    await render();
};

document.getElementById("zoomOut").onclick = async () => {
    scale = Math.max(0.3, scale - 0.1);
    await render();
};

document.addEventListener("keydown", async (e)=>{

    if(
        e.key === "ArrowLeft" ||
        e.key === "PageDown" ||
        e.key === " "
    ){

        if(currentPage < pdf.numPages){
            currentPage++;
            await render();
        }
    }

    if(
        e.key === "ArrowRight" ||
        e.key === "PageUp"
    ){

        if(currentPage > 1){
            currentPage--;
            await render();
        }
    }
});

window.onresize = render;
