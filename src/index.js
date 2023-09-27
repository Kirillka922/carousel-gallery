import "./main.css";
const THROTTLE_TIME = 700;
const HALF_CIRCLE = 180;
const VISIBLE_ELEMENTS = 8;
const AMOUNT_OF_CONTAINERS = 9;
const url = "https://www.thecocktaildb.com/api/json/v1/1/random.php";
const container = document.getElementById("container");
const imgArray = [];

let heightPicture = 0;
let widthPicture = 0;
let positionNow = 0;
let transitionScrollOn = true;

async function fetchUrl(positionPicture) {
  try {
    const responseApi = await fetch(getUniqueUrl(url, positionPicture));
    if (responseApi.status !== 200) throw new Error("Server Error!");
    const jsonApi = await responseApi.json();
    const imgUrl = jsonApi.drinks[0].strDrinkThumb;
    let responseImg = await fetch(imgUrl);
    if (responseImg.status !== 200) throw new Error("Server Error");
    const blobImg = await responseImg.blob();

    return URL.createObjectURL(blobImg);
  } catch (err) {
    console.error(err);
  }
}

async function addImg(elem, positionPicture) {
  if (imgArray[positionPicture] !== undefined) {
    elem.appendChild(imgArray[positionPicture]);
    return;
  }

  elem.classList.add("loadingImg");
  let imgUrl = await fetchUrl(positionPicture);

  elem.classList.remove("loadingImg");
  elem.innerHTML = "";

  const newImg = createElem("img", "imgContainer");

  newImg.onload = () => {
    if (newImg.naturalHeight > 0) {
      elem.appendChild(newImg);
      imgArray[positionPicture] = newImg;
    } else {
      URL.revokeObjectURL(imgUrl);
      addReloadImgButton(elem, positionPicture);
    }
  };

  newImg.onerror = () => {
    URL.revokeObjectURL(imgUrl);
    addReloadImgButton(elem, positionPicture);
  };

  newImg.src = imgUrl;
}

function addReloadImgButton(elem, positionPicture) {
  console.error(new Error("The picture wasn't loaded!"));
  addReloadButton(elem, positionPicture);
}

function runGallery() {
  printContainers();

  const throttleScroll = throttle(
    (direction) => scrollGallery(direction),
    THROTTLE_TIME
  );

  container.addEventListener("wheel", function (e) {
    e.preventDefault();

    const isZeroCoordinates = e.wheelDeltaY === 0 || e.deltaY === 0;
    const isXSwipe = e.wheelDeltaX !== 0;

    const isRemainder = e.deltaY % 1 === 0;

    if (isXSwipe || isZeroCoordinates || !isRemainder) return;

    const direction = e.wheelDeltaY < 0 ? 1 : -1;

    if (direction === -1 && positionNow === 0) return;

    throttleScroll(direction);
  });
}

function scrollGallery(direction) {
  switchOnTransition(true);

  positionNow = positionNow + direction;

  const newContainer = recountStateGallery(direction);

  const newPositionId =
    direction === 1 ? positionNow + VISIBLE_ELEMENTS : positionNow;

  addImg(newContainer, newPositionId);
}

function recountStateGallery(direction) {
  const galleryContainers = container.querySelectorAll(".element");

  const lastElementPosition = direction === 1 ? AMOUNT_OF_CONTAINERS - 1 : 0;
  const lastElemLeft = parseFloat(
    galleryContainers[lastElementPosition].style.left
  );
  const lastElemTop = parseFloat(
    galleryContainers[lastElementPosition].style.top
  );

  for (let i = 0; i < AMOUNT_OF_CONTAINERS - 1; i++) {
    const positionElement = direction === 1 ? VISIBLE_ELEMENTS - i : i;
    const prevElement = galleryContainers[positionElement - direction];
    const nextElement = galleryContainers[positionElement];
    nextElement.style.left = prevElement.style.left;
    nextElement.style.top = prevElement.style.top;
  }

  const positionElemForTransition =
    direction === 1 ? 0 : AMOUNT_OF_CONTAINERS - 1;

  galleryContainers[positionElemForTransition].remove();

  const newContainer = addContainer(direction, lastElemLeft, lastElemTop);

  return newContainer;
}

function printContainers() {
  const cords = getCords();

  for (let i = 0; i < AMOUNT_OF_CONTAINERS; i++) {
    const newContainer = createElem("div", "element elementTransition", {
      container,
    });
    addCordsToContainer(cords[i], newContainer);
    addImg(newContainer, i);
  }
}

function getCords() {
  widthPicture = window.innerWidth / AMOUNT_OF_CONTAINERS;
  heightPicture = (widthPicture / 3) * 2;

  const radiusX = (window.innerWidth - widthPicture) / 2;
  const radiusY = window.innerHeight - heightPicture;

  const cords = [];
  const degreeOfRotation = HALF_CIRCLE / VISIBLE_ELEMENTS;
  let currentAngle = 0;

  for (let i = 0; i < AMOUNT_OF_CONTAINERS; i++) {
    cords.push([
      Math.cos(currentAngle) * radiusX + radiusX,
      Math.sin(-currentAngle) * radiusY + window.innerHeight,
    ]);
    currentAngle += (Math.PI / HALF_CIRCLE) * degreeOfRotation;
  }

  return cords;
}

function addContainer(direction, elemLeft, elemTop) {
  const newContainer = createElem("div", "element elementTransition", {
    container,
    elemLeft,
    elemTop,
  });

  direction === -1
    ? container.prepend(newContainer)
    : container.append(newContainer);

  return newContainer;
}

function createElem(tag, className, options = null) {
  const elem = document.createElement(tag);
  elem.className = className;

  if (!options) return elem;

  options.container?.append(elem);

  if (isNaN(options.elemLeft) || isNaN(options.elemTop)) return elem;

  addCordsToContainer([options.elemLeft, options.elemTop], elem);

  return elem;
}

function addReloadButton(elem, positionPicture) {
  const button = createElem("button", "buttonReload", {container: elem});
  let textNode = document.createTextNode("Try again");
  button.append(textNode);
  button.addEventListener(
    "click",
    (ev) => {
      ev.target.remove();
      addImg(elem, positionPicture);
    },
    {
      once: true,
    }
  );
}

function throttle(callback, time) {
  let isThrottled = false;

  function wrapper() {
    if (isThrottled) {
      return;
    }
    callback.apply(this, arguments);
    isThrottled = true;
    setTimeout(function () {
      isThrottled = false;
    }, time);
  }
  return wrapper;
}

function getUniqueUrl(url, positionPicture) {
  return `${url}?id=${new Date().getTime()}${positionPicture}`;
}

function addCordsToContainer(cords, container) {
  const leftPicture = cords[0];
  const topPicture = cords[1];
  container.style.width = `${widthPicture}px`;
  container.style.height = `${heightPicture}px`;
  container.style.left = `${leftPicture}px`;
  container.style.top = `${topPicture}px`;
}

function switchOnTransition(value) {
  if (value === transitionScrollOn) return;
  const galleryContainers = container.querySelectorAll(".element");

  galleryContainers.forEach((container) => {
    value
      ? container.classList.add("elementTransition")
      : container.classList.remove("elementTransition");
  });
  transitionScrollOn = value;
}

window.addEventListener("resize", () => {
  const galleryContainers = container.querySelectorAll(".element");

  switchOnTransition(false);

  const cords = getCords();

  for (let i = 0; i < galleryContainers.length; i++) {
    addCordsToContainer(cords[i], galleryContainers[i]);
  }
});

runGallery();
