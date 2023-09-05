import "./main.css";
const THROTTLE_TIME = 500;
const HALF_CIRCLE = 180;
const VISIBLE_ELEMENTS = 8;
const AMOUNT_OF_CONTAINERS = 9;
const url = "https://www.thecocktaildb.com/api/json/v1/1/random.php";
const container = document.getElementById("container");
const imgArray = [];
const MINIMUM_SCROLL = 30;

let heightPicture = 0;
let widthPicture = 0;
let positionNow = 0;

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

  const imgDrink = createElem("img", "imgContainer");

  imgDrink.onload = () => {
    if (imgDrink.naturalHeight > 0) {
      elem.appendChild(imgDrink);
      imgArray[positionPicture] = imgDrink;
    } else {
      addReloadImgMode(elem, positionPicture);
    }
  };

  imgDrink.onerror = () => {
    addReloadImgMode(elem, positionPicture);
  };

  imgDrink.src = imgUrl;
}

function addReloadImgMode(elem, positionPicture) {
  console.error(new Error("The picture wasn't loaded!"));
  addButtonReload(elem, positionPicture);
}

function runGallery() {
  printContainers();

  const throttleScroll = throttle(
    (direction) => scrollGallery(direction),
    THROTTLE_TIME
  );

  container.addEventListener("wheel", function (e) {
    const isScrollX = e.deltaX !== 0;
    const isScrollYInGoogle = Math.abs(e.deltaY) % 1 !== 0;
    if (isScrollX) return;
    if (isScrollYInGoogle && isScrollX) return;
    if (Math.abs(e.deltaY) < MINIMUM_SCROLL) return;

    const direction = e.deltaY > 0 ? 1 : -1;
    if (direction == -1 && positionNow === 0) return;

    throttleScroll(direction);
  });
}

function scrollGallery(direction) {
  positionNow = positionNow + direction;

  const newContainer = changePositionGallery(direction);

  const newPositionId =
    direction === 1 ? positionNow + VISIBLE_ELEMENTS : positionNow;

  addImg(newContainer, newPositionId);
}

function changePositionGallery(direction) {
  const galleryContainers = container.querySelectorAll(".element");

  const lastElementPosition = direction === 1 ? AMOUNT_OF_CONTAINERS - 1 : 0;
  const lastElemLeft = galleryContainers[lastElementPosition].style.left;
  const lastElemTop = galleryContainers[lastElementPosition].style.top;

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
  widthPicture = window.innerWidth / AMOUNT_OF_CONTAINERS;
  heightPicture = (widthPicture / 3) * 2;

  const radius = (window.innerWidth - widthPicture) / 2;
  const degreeOfRotation = HALF_CIRCLE / VISIBLE_ELEMENTS;
  let currentAngle = 0;

  for (let i = 0; i < AMOUNT_OF_CONTAINERS; i++) {
    const optionsNewElement = { container };
    const newContainer = createElem("div", "element", optionsNewElement);

    newContainer.style.width = `${widthPicture}px`;
    newContainer.style.height = `${heightPicture}px`;

    newContainer.style.left = `${Math.cos(currentAngle) * radius + radius}px`;
    newContainer.style.top = `${
      Math.sin(-currentAngle) * radius + window.innerHeight
    }px`;

    currentAngle += (Math.PI / HALF_CIRCLE) * degreeOfRotation;

    addImg(newContainer, i);
  }
}

function addContainer(direction, elemLeft, elemTop) {
  const optionsNewElement = { container: container, elemLeft, elemTop };
  const newContainer = createElem("div", "element", optionsNewElement);

  direction === -1
    ? container.prepend(newContainer)
    : container.append(newContainer);

  return newContainer;
}

function createElem(tag, className, options = null) {
  const elem = document.createElement(tag);
  elem.className = className;

  if (!options) return elem;

  if ("container" in options) options.container.append(elem);

  if ("elemLeft" in options && "elemTop" in options) {
    elem.style.left = options.elemLeft;
    elem.style.top = options.elemTop;
    elem.style.width = `${widthPicture}px`;
    elem.style.height = `${heightPicture}px`;
  }
  return elem;
}

function addButtonReload(elem, positionPicture) {
  const optionsNewElement = { container: elem };
  const button = createElem("button", "buttonReload", optionsNewElement);
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

runGallery();
