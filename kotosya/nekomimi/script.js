/* =========================================
   Novel Viewer
   script.js

   PC:
   ・見開き2ページ

   Mobile:
   ・1ページ表示

========================================= */

console.log("script.js 読み込み成功");
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
   ページ計測用要素作成
========================================= */

function createMeasureElement(){

    const page =
        document.getElementById("rightPage");

    const measure =
        document.createElement("div");

    measure.className =
        "pageContent";
    measure.style.position =
        "fixed";
    measure.style.left =
        "-10000px";
    measure.style.top =
        "0";
    measure.style.visibility =
        "hidden";
    measure.style.pointerEvents =
        "none";

    /*
       実際のページと同じ大きさ
    */
    measure.style.width =
        page.clientWidth + "px";
    measure.style.height =
        page.clientHeight + "px";
    document.body.appendChild(
        measure
    );
    return measure;
}

/* =========================================
   表示可能判定
========================================= */

function canFitText(
    measure,
    text
){
    measure.textContent =
        text;

    return (
        measure.scrollHeight <=
        measure.clientHeight
    );
}

/* =========================================
   自動ページ振り分け
   段落単位 + 二分探索方式
========================================= */

function createPages(text){

    novelPages = [];
    const measure =
        createMeasureElement();

    /*
       空行2つ以上を段落として扱う
    */
let paragraphs = [];

if(typeof text === "string"){

    paragraphs =
        text
        .split(/\r?\n\s*\r?\n/)
        .map(p => p.trim())
        .filter(
            p => p !== ""
        );
}
else{
    console.error(
        "novelText が文字列ではありません",
        text
    );
    return;
}
console.log(
    "段落数:",
    paragraphs.length
);
    let current = "";
    for(
        let paragraph of paragraphs
    ){
       const test =
            current.length > 0
            ?
            current
            +
            "\n\n"
            +
            paragraph
            :
            paragraph;

        /*
          そのまま入る場合
        */
        if(
            canFitText(
                measure,
                test
            )
        ){
            current = test;
            continue;
        }

        /*
          現在ページを保存
        */
        if(current.length > 0){
            novelPages.push(
                current
            );
        }

        /*
          段落そのものが
          1ページに入らない場合
        */
        if(
            !canFitText(
                measure,
                paragraph
            )
        ){
            let start = 0;
            while(
                start < paragraph.length
            ){
                let low = 1;
                let high =
                    paragraph.length -
                    start;
                let best = 1;

                /*
                  二分探索
                */
                while(
                    low <= high
                ){
                    const mid =
                        Math.floor(
                            (low + high) / 2
                        );
                    const part =
                        paragraph.substring(
                            start,
                            start + mid
                        );
                    if(
                        canFitText(
                            measure,
                            part
                        )
                    ){
                        best = mid;
                        low =
                            mid + 1;
                    }
                    else{

                        high =
                            mid - 1;
                    }
                }
                let pageText =
                    paragraph.substring(
                        start,
                        start + best
                    );
                novelPages.push(
                    pageText
                );
                start += best;
            }
            current = "";
        }
        else{
            current = paragraph;
        }
    }

    /*
       最後のページ
    */
    if(
        current.length > 0
    ){
        novelPages.push(
            current
        );
    }
    document.body.removeChild(
        measure
    );

    /*
       禁則処理
    */
    novelPages =
        applyKinsoku(
            novelPages
        );
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
    readingStarted = true;
    cover.classList.add("hidden");
    pagesArea.classList.remove("hidden");
    backCover.classList.add("hidden");

    // 表示反映を待つ
    requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
            console.log("計測開始");
            createPages(novelText);
            console.log(
                "ページ数:",
                novelPages.length
            );
            currentPage = 0;
            renderPage();

        });
    });
}

startButton.addEventListener(
    "click",
    ()=>{
        console.log("読み始めるボタン押下");
        startReading();
    }
);
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
let resizeTimer = null;

window.addEventListener(
"resize",
()=>{
    if(!readingStarted){
        return;
    }

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(()=>{
        console.log("リサイズ再計測");
        const position =
            currentPage;

        createPages(novelText);

        currentPage =
            Math.min(
                position,
                totalPages()-1
            );

        renderPage();

    },300);
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



