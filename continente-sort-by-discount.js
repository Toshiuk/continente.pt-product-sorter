
// ==UserScript==
// @name         Continente sort by discount
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  The script add option to sort by discount
// @author       toshiuk
// @match        https://www.continente.pt/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=continente.pt
// @grant    GM_addStyle
// @license MIT
// ==/UserScript==

const awaitToElement = (element) => {
    return new Promise((resolve) => {
        let nIntervId = setInterval(()=>{
            const isReady=document.querySelectorAll(element).length != 0
            if(isReady){
                resolve()
                clearInterval(nIntervId)
            }
        },100)
        });
}


const isPageLoaded = async()=> awaitToElement('.product-grid-sort')

const loadingAnimation = document.createElement("div");

loadingAnimation.style.cssText = "display: block;position: fixed;top: calc(50% - (58px / 2));right: calc(50% - (58px / 2));color: red;width: 2rem;height: 2rem;vertical-align: text-bottom;border: 0.25em solid currentColor;border-right-color: transparent;border-radius: 50%;"
loadingAnimation.animate([
    { transform: "rotate(0deg)" },
    { transform: "rotate(360deg)" }
], {
    duration: 750,
    iterations: Infinity
});


const backdropWithLoading = document.createElement("div");
backdropWithLoading.style.cssText = "display: none;position:fixed;top:0;width: 100vw;height: 100vh;z-index: 999;background-color: rgb(0,0,0,0.2);";
backdropWithLoading.setAttribute("id", "backdropWithLoading");
backdropWithLoading.appendChild(loadingAnimation);

const expandAllItems = async () => {
    return new Promise((resolve) => {
        let nIntervId = setInterval(()=>{
            const showMoreProductsButton = document.querySelector('.js-show-more-products');
            const loadingProcutsSpinner = document.querySelector('.search-view-more-products-spinner-wrapper');

            const isReady = !showMoreProductsButton && !loadingProcutsSpinner;
            if(isReady){
                window.scrollTo(0, 0);
                resolve()
                clearInterval(nIntervId)
            } else if(!!showMoreProductsButton && !showMoreProductsButton.parentElement.classList.contains("d-none") ){
                 window.scrollTo(0, document.body.scrollHeight);
                showMoreProductsButton.click();
            }
        },1500)
        });
}


const getDiscount = (product) => {
     const discountTag = product.querySelector('.ct-product-tile-badge-value-wrapper')
     if(!discountTag) return 0;
    return Number(discountTag.innerText.match(/\d+/g)[0]);
}


const sortByDiscount = async () => {
    backdropWithLoading.style.display = "block";

    await expandAllItems();

    const products = document.querySelectorAll('.productTile');
    const productsArray = Array.from(products);

    productsArray.sort((productA, productB) => getDiscount(productB) - getDiscount(productA))

    for (let i = 0; i < products.length; i++) {
        products[i].parentNode.appendChild(productsArray[i]);
    }

    window.scrollTo(0, 0);


    backdropWithLoading.style.display = "none";

}


const main = async () => {
    await isPageLoaded();
    const body = document.querySelector('body');
    body.appendChild(backdropWithLoading);
    const sortDropdown = document.querySelector('.product-grid-sort');

    const sortByDiscountButton = document.createElement("div");
    sortByDiscountButton.role="button"
    sortByDiscountButton.className = "button button--primary";
    sortByDiscountButton.innerHTML ='Ordenar por desconto'
    sortByDiscountButton.onclick = sortByDiscount;

    sortDropdown.parentNode.insertBefore(sortByDiscountButton, sortDropdown)
}

main()

GM_addStyle ( `
@media (min-width: 768px){
.d-sm-flex.product-grid-applied-filters.d-none {
    display: none!important;
}
}
` );