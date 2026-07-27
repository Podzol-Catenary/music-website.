/* =========================================
   Novel Viewer
   script.js

   PC:
   ・見開き2ページ

   Mobile:
   ・1ページ表示

========================================= */


/* =========================================
   DOM取得
========================================= */

const cover =
    document.getElementById("cover");

const pagesArea =
    document.getElementById("pages");

const backCover =
    document.getElementById("backCover");

const startButton =
    document.getElementById("startButton");

const prevButton =
    document.getElementById("prevButton");

const nextButton =
    document.getElementById("nextButton");

const rightContent =
    document.getElementById("rightContent");

const leftContent =
    document.getElementById("leftContent");

const rightNumber =
    document.getElementById("rightNumber");

const leftNumber =
    document.getElementById("leftNumber");



/* =========================================
   状態管理
========================================= */

let currentPage = 0;

// ページ振り分け
let novelPages = [];

// 読書開始前
let readingStarted = false;

/* =========================================
   画面サイズ判定
========================================= */

function isMobile(){
    return window.innerWidth <= 900;

}
/* =========================================
  画面サイズ計測
========================================= */
function calculateCharsPerPage(){

const page =
    document.querySelector(".page");

    if(!page){
        console.log("pageContentがありません");
        return 200;
    }

    const style =
        window.getComputedStyle(page);

    const fontSize =
        parseFloat(style.fontSize);

    const lineHeight =
        parseFloat(style.lineHeight);

    const width =
        page.clientWidth;

    const height =
        page.clientHeight;


    const charsPerColumn =
        Math.floor(
            height / fontSize
        );

const columns =
    Math.floor(width / fontSize);

    const result =
        charsPerColumn * columns;


    console.log({
        width: width,
        height: height,
        fontSize: fontSize,
        lineHeight: lineHeight,
        charsPerColumn: charsPerColumn,
        columns: columns,
        charsPerPage: result
    });


    return result;
}

/* =========================================
  自動ページ振り分け
========================================= */
function createPages(text){

    novelPages = [];

    let buffer = "";
    let inQuote = false;

    const pageSize =
        calculateCharsPerPage();

    for(let char of text){

        if(char === "「"){
            inQuote = true;
        }

        if(char === "」"){
            inQuote = false;
        }


        if(char === "\n"){
            buffer += "\n";
        }
        else{
            buffer += char;
        }


        if(
            buffer.length >= pageSize
            &&
            !inQuote
        ){
            novelPages.push(buffer);
            buffer = "";
        }
    }


    if(buffer.length > 0){
        novelPages.push(buffer);
    }


    novelPages =
        applyKinsoku(novelPages);
}
/* =========================================
   禁則処理

   ページ先頭に置かない文字を
   前ページ末尾へ移動する

========================================= */
function applyKinsoku(pages){
    const prohibitedStart = [
        "。",
        "、",
        "．",
        "，",
        "」",
        "』",
        "）",
        "］",
        "】",
        "！",
        "？"
    ];

    for(
        let i = 1;
        i < pages.length;
        i++
    ){
        if(!pages[i]){
            continue;
       }
        let firstChar =
            pages[i].charAt(0);
        if(
            prohibitedStart.includes(firstChar)
        ){
            // 前ページへ移動
            pages[i - 1] += firstChar;

            // 現ページから削除
            pages[i] =
                pages[i].substring(1);
        }
    }

    return pages;
}
    
/* =========================================
   ページ総数取得
========================================= */

function totalPages(){
    return novelPages.length;
}

/* =========================================
   ページ表示
========================================= */

function renderPage(){
    if(isMobile()){
        rightContent.textContent =
            novelPages[currentPage] || "";
        rightNumber.textContent =
            currentPage + 1;
        return;
    }

    rightContent.textContent =
        novelPages[currentPage] || "";

    leftContent.textContent =
        novelPages[currentPage + 1] || "";

    rightNumber.textContent =
        currentPage + 1;

    leftNumber.textContent =
        currentPage + 2;
}
/* =========================================
  表示切替
========================================= */
function startReading(){
   
    startButton.addEventListener(
    "click",
    startReading
    );
   
    readingStarted = true;

    cover.classList.add("hidden");
    pagesArea.classList.remove("hidden");
    backCover.classList.add("hidden");

    // レイアウトが反映された次の描画タイミングで計測
requestAnimationFrame(() => {

    createPages(novelText);

    console.log("ページ数:", novelPages.length);
    console.log(novelPages);

    currentPage = 0;

    renderPage();

});
}
/* =========================================
   裏表紙表示
========================================= */


function showBackCover(){

    pagesArea.classList.add(
        "hidden"
    );

    backCover.classList.remove(
        "hidden"
    );

}

/* =========================================
   本文へ戻る
========================================= */

function backToReading(){
    backCover.classList.add(
        "hidden"
    );
    pagesArea.classList.remove(
        "hidden"
    );
    renderPage();

}

/* =========================================
   次ページへ
========================================= */

function nextPage(){

    // 読書開始前は動作させない

    if(!readingStarted){
        return;
    }

    /*
        裏表紙表示中の場合
        最後なので何もしない
    */
    if(
        !backCover.classList.contains("hidden")
    ){
        return;
    }

    /*
        スマホ
        1ページずつ進む
    */

    if(isMobile()){

        if(currentPage < totalPages()-1){
            currentPage++;
            renderPage();
        }
        else{
            showBackCover();
        }
        return;
    }

    /*
        PC
        見開き2ページずつ進む
    */

    if(currentPage + 2 < totalPages()){
        currentPage += 2;
        renderPage();
        savePosition();
    }
    else{
        showBackCover();
    }
}



/* =========================================
   前ページへ
========================================= */

function prevPage(){

    /*
        裏表紙から戻る
    */

    if(
        !backCover.classList.contains("hidden")
    ){
        backToReading();
        return;
    }

    if(!readingStarted){
        return;
    }
    /*
        スマホ
        1ページ戻る
    */

    if(isMobile()){

        if(currentPage > 0){
            currentPage--;
            renderPage();
        }

        return;
    }
    /*
        PC
        2ページ戻る
    */

    if(currentPage >= 2){
        currentPage -= 2;
        renderPage();
        savePosition();
    }
}

/* =========================================
   矢印ボタン
========================================= */

nextButton.addEventListener(
    "click",
    ()=>{
        prevPage();
    }
);

prevButton.addEventListener(
    "click",
    ()=>{
        nextPage();
    }
);


/* =========================================
   クリック領域拡張用

   将来的にページ左右クリックで
   めくる場合に利用
========================================= */

rightContent.addEventListener(

    "click",
    ()=>{
        nextPage();
    }
);

leftContent.addEventListener(
    "click",
    ()=>{
        prevPage();
    }
);

/* =========================================
   キーボード操作

   ← 前ページ
   → 次ページ
========================================= */

document.addEventListener(
    "keydown",
    (event)=>{
        if(
            event.key === "ArrowRight"
        ){
            nextPage();
        }
        if(
            event.key === "ArrowLeft"
        ){
            prevPage();
        }
    }
);

/* =========================================
   スワイプ操作
========================================= */

let touchStartX = 0;
let touchEndX = 0;

document.addEventListener(
    "touchstart",
    (event)=>{

        touchStartX =
            event.changedTouches[0].screenX;
    },

    {
        passive:true
    }
);

document.addEventListener(
    "touchend",
    (event)=>{
        touchEndX =
            event.changedTouches[0].screenX;
        swipeCheck();
    },
    {
        passive:true
    }
);

function swipeCheck(){
    const distance =
        touchStartX - touchEndX;

    /*
        左から右へスワイプ
        → 次ページ
    */

    if(distance < -50){
        nextPage();
    }

    /*
        右から左へスワイプ
        → 前ページ
    */
    if(distance > 50){
        prevPage();
    }
}
/* =========================================
   画面タップ操作

   左半分 → 次へ
   右半分 → 前へ

   スマホ向け
========================================= */

document.addEventListener(
    "click",
    (event)=>{

        if(!isMobile()){
            return;
        }

        /*
            表紙のボタン操作は除外
        */

        if(
            event.target === startButton
        ){
            return;
        }

        const x =
            event.clientX;

        const width =
            window.innerWidth;

        if(x < width / 2){
            prevPage();
        }
        else{
            nextPage();
        }
    }
);

/* =========================================
   画面サイズ変更対応
========================================= */

window.addEventListener(
"resize",
()=>{
    if(!readingStarted){
        return;
    }
    const position =
        currentPage;

    createPages(novelText);
    currentPage =
        position;
    renderPage();
});

/* =========================================
   ページ番号・矢印状態更新
========================================= */

function updateViewerState(){

    /*
        表紙表示中
    */

    if(!readingStarted){
        prevButton.style.display =
            "none";
        nextButton.style.display =
            "none";
        return;
    }

    /*
        裏表紙表示中
    */

    if(
        !backCover.classList.contains("hidden")
    ){
        nextButton.style.display =
            "none";
        prevButton.style.display =
            "block";
        return;
    }

    /*
        本文表示中
    */


    prevButton.style.display =
        "block";
    nextButton.style.display =
        "block";

}

/* =========================================
   renderPage拡張

   元のrenderPage実行後に
   状態更新するための処理
========================================= */

const originalRenderPage =
    renderPage;
renderPage = function(){
    originalRenderPage();
    updateViewerState();

};


/* =========================================
   ページ番号安全処理
========================================= */


function normalizePage(){
    if(currentPage < 0){
        currentPage = 0;
    }

    if(currentPage >= totalPages()){
        currentPage =
            totalPages() - 1;
    }
}

/* =========================================
   読書位置保存準備

   将来的なしおり機能用

========================================= */


function savePosition(){
    localStorage.setItem(
        "novel_position",
        currentPage
    );
}


function loadPosition(){
    const saved =

        localStorage.getItem(
            "novel_position"
        );
    if(saved !== null){
        currentPage =
            Number(saved);
    }
}

/*=========================================
   初期化
========================================= */

function initializeViewer(){

    /*
        初期状態
        表紙表示
    */

    cover.classList.remove(
        "hidden"
    );

    pagesArea.classList.add(
        "hidden"
    );

    backCover.classList.add(
        "hidden"
    );

    readingStarted = false;
    currentPage = 0;

    updateViewerState();

}

/* =========================================
   起動
========================================= */
initializeViewer();



