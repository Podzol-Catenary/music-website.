pdfjsLib.GlobalWorkerOptions.workerSrc =
'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.js';

const url = "sample.pdf";

let pdfDoc = null;
let pageNum = 1;
let scale = 1;

const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");

function fitToScreen(page){

    const viewport = page.getViewport({scale:1});

    const availableWidth =
        window.innerWidth * 0.8;

    scale = availableWidth / viewport.width;

    if(scale > 2){
        scale = 2;
    }

    renderPage(pageNum);
}

function renderPage(num){

    pdfDoc.getPage(num).then(function(page){

        const viewport =
            page.getViewport({scale});

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        page.render({
            canvasContext:ctx,
            viewport:viewport
        });

        document.getElementById("pageNum").textContent=num;
        document.getElementById("zoomText").textContent=
            Math.round(scale*100)+"%";
    });
}

pdfjsLib.getDocument(url).promise.then(function(pdf){

    pdfDoc = pdf;

    document.getElementById("pageCount").textContent=
        pdf.numPages;

    pdf.getPage(1).then(function(page){
        fitToScreen(page);
    });

});

document.getElementById("next").onclick=function(){

    if(pageNum>=pdfDoc.numPages) return;

    pageNum++;

    renderPage(pageNum);

};

document.getElementById("prev").onclick=function(){

    if(pageNum<=1) return;

    pageNum--;

    renderPage(pageNum);

};

document.getElementById("zoomIn").onclick=function(){

    scale+=0.1;

    renderPage(pageNum);

};

document.getElementById("zoomOut").onclick=function(){

    if(scale<=0.2) return;

    scale-=0.1;

    renderPage(pageNum);

};

window.addEventListener("resize",function(){

    pdfDoc.getPage(pageNum).then(function(page){

        fitToScreen(page);

    });

});


