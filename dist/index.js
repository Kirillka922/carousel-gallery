/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
const url = "https://www.thecocktaildb.com/api/json/v1/1/random.php";

async function fetchHandler() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.drinks[0].strDrinkThumb;
  } catch (error) {
    console.log(error);
    return false;
  }
}
function addLoading(elem) {
  function createImg(className, link, cont) {
    let img = document.createElement("img");
    img.className = className;
    img.setAttribute("src", link);
    cont.append(img);
  }
  if (elem.childNodes.length > 0) {
    elem.innerHTML = "";
  }
  createImg(
    "imgContainer",
    "https://otkritkis.com/wp-content/uploads/2022/07/gufde.gif",
    elem
  );
}

async function addImgToCont(elem) {
  addLoading(elem);

  let link = await fetchHandler();
  if (!link) {
    let button = document.createElement("button");
    button.className = "buttonReload";
    elem.append(button);
    let textNode = document.createTextNode("Try again");
    button.append(textNode);
    button.addEventListener("click", addImgToCont.bind(null, elem), {
      once: true,
    });
  }

  elem.firstElementChild.src = link;
}

let windowWidth = window.innerWidth / 2;
const DISPLACEMENT_RADIUS_X = 400;
const RADIUS_Y = 400;
const STEP_TRANSITION = 5;
const ALPHA_ANGLE = 2 * 3.14;
const SCROLL_START_POSITION = 72;
const START_TIME = 1304;
const FIX_DISTANCE_PICTURES = 60;
const container = document.getElementById("container");
let RADIUSX = window.innerWidth - DISPLACEMENT_RADIUS_X;
let galleryContainers = null;
let positionNow = 0;
let arrayContainers = [];
let isFinishReplacement = false;
let mouseOnContainer = false;

function addPoz(direction) {
  container.scrollLeft = SCROLL_START_POSITION;

  let lastElemLeft = null;
  let lastElemTop = null;

  function hideLastElem(elem) {
    elem.style.display = "none";
    elem.style.left = lastElemLeft;
    elem.style.top = lastElemTop;

    addImgToCont(elem);

    setTimeout(() => {
      elem.style.display = "block";
      if (direction) arrayContainers.unshift(arrayContainers.pop());
      if (!direction) arrayContainers.push(arrayContainers.shift());
    }, 500);
  }

  if (direction) {
    positionNow++;
    lastElemLeft = arrayContainers[0].style.left;
    lastElemTop = arrayContainers[0].style.top;
    for (let i = 0; i < arrayContainers.length; i++) {
      if (i === arrayContainers.length - 1) {
        hideLastElem(arrayContainers[arrayContainers.length - 1]);
      } else {
        arrayContainers[i].style.left = arrayContainers[i + 1].style.left;
        arrayContainers[i].style.top = arrayContainers[i + 1].style.top;
      }
    }
  } else {
    positionNow--;
    lastElemLeft = arrayContainers[arrayContainers.length - 1].style.left;
    lastElemTop = arrayContainers[arrayContainers.length - 1].style.top;

    for (let i = arrayContainers.length - 1; i >= 0; i--) {
      if (i === 0) {
        hideLastElem(arrayContainers[0]);
      } else {
        arrayContainers[i].style.left = arrayContainers[i - 1].style.left;
        arrayContainers[i].style.top = arrayContainers[i - 1].style.top;
      }
    }
  }

  isFinishReplacement = false;
}

function printContainers(isResize = false) {
  container.scrollLeft = SCROLL_START_POSITION;
  const arrayCords = createArrayCords(isResize);

  arrayContainers.forEach((object, i) => {
    arrayCords[i] = arrayCords[i] - STEP_TRANSITION;
    object.style.width = `${
      window.innerWidth / (arrayContainers.length + 1)
    }px`;
    object.style.height = `${
      window.innerWidth / (arrayContainers.length + 1) / 1.5
    }px`;
    object.style.left = `${
      windowWidth + RADIUSX * Math.cos(ALPHA_ANGLE * arrayCords[i])
    }px`;
    object.style.top = `${
      RADIUS_Y + RADIUS_Y * Math.sin(-ALPHA_ANGLE * arrayCords[i])
    }px`;
    if (!isResize) addImgToCont(object);
  });

  let volumeElement = container.querySelector(".volumeElem");
  volumeElement.style.width = `${window.innerWidth + 100}px`;
}

function createArrayCords(isResize) {
  if (galleryContainers === null) {
    galleryContainers = container.querySelectorAll(".element");
  }

  const arrayCords = [];

  galleryContainers.forEach((elem, i) => {
    arrayCords[i] = [START_TIME + i * FIX_DISTANCE_PICTURES];
    if (!isResize) arrayContainers[i] = elem;
  });

  return arrayCords;
}

container.addEventListener("scroll", function () {
  const isBack = container.scrollLeft < SCROLL_START_POSITION;
  container.scrollLeft = SCROLL_START_POSITION;
  if (isFinishReplacement) return;
  if (!isBack && positionNow === 0) return;
  if (!mouseOnContainer) return;
  isFinishReplacement = true;
  setTimeout(() => addPoz(isBack), 500);
});

window.addEventListener("resize", () => {
  if (window.innerWidth < 800) {
    RADIUSX = 500;
    windowWidth = 800;
    return;
  }
  RADIUSX = window.innerWidth - DISPLACEMENT_RADIUS_X;
  windowWidth = window.innerWidth / 2;
  printContainers(true);
});

container.addEventListener("mouseover", function (event) {
  if (event.relatedTarget === null) {
    mouseOnContainer = true;
    return;
  }
  if (event.target === null) {
    mouseOnContainer = false;
    return;
  }
  const isParentGallery = event.target.closest(".galleryContainer");
  const isParentGalleryRel = event.relatedTarget.closest(".galleryContainer");

  if (isParentGallery && mouseOnContainer) {
    return;
  } else if (isParentGallery && !mouseOnContainer) mouseOnContainer = true;

  if (isParentGalleryRel && isParentGallery) return;
});

container.addEventListener("mouseout", function (event) {
  if (event.relatedTarget === null) {
    mouseOnContainer = false;
    return;
  }
  const isParentGalleryRel = event.relatedTarget.closest(".galleryContainer");
  const isParentGallery = event.target.closest(".galleryContainer");

  if (isParentGallery && !isParentGalleryRel) {
    mouseOnContainer = false;
    return;
  }
  if (isParentGallery && isParentGalleryRel) return;
});

printContainers();

/******/ })()
;
//# sourceMappingURL=index.js.map