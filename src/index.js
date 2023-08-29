import "./main.css";
const THROTTLE_TIME = 500;
const HALF_CIRCLE = 180;
const VISIBLE_ELEMENTS = 8;
const AMOUNT_OF_CONTAINERS = 9;
const url = "https://www.thecocktaildb.com/api/json/v1/1/random.php";
const container = document.getElementById("container");
const imgArray = [];

let heightPicture = 0;
let widthPicture = 0;
let positionNow = 0;

async function getFetchImg(positionPicture) {
  try {
    const responseApi = await fetch(getUniqueUrl(url, positionPicture));
    if (responseApi.status !== 200) throw new Error("Server Error!");
    const jsonApi = await responseApi.json();
    const imgUrl = jsonApi.drinks[0].strDrinkThumb;
    let responseImg = await fetch(imgUrl);
    if (responseImg.status !== 200) throw new Error("Server Error");
    const blobImg = await responseImg.blob();

    return new Promise((resolve) => {
      const imgDrink = createElem("img", "imgContainer");
      imgDrink.onload = () => {
        imgDrink.naturalHeight > 0
          ? resolve(imgDrink)
          : console.error("Img was not loaded!");
      };
      imgDrink.onerror = () => {
        console.error("Img was not loaded!");
      };
      imgDrink.src = URL.createObjectURL(blobImg);
    });
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
  const response = await getFetchImg(positionPicture);

  elem.classList.remove("loadingImg");
  elem.innerHTML = "";

  if (response === undefined) {
    addButtonReload(elem, positionPicture);
    return;
  }

  elem.appendChild(response);
  imgArray[positionPicture] = response;
}

function runGallery() {
  printContainers();

  const throttleScroll = throttle(
    (direction) => scrollGallery(direction),
    THROTTLE_TIME
  );

  container.addEventListener("wheel", function (e) {
    if (e.deltaX !== 0) return;
    let direction = Math.sign(e.deltaY);
    if (direction === 0 && 1 / direction === -Infinity) direction = -1;
    if (direction == -1 && positionNow === 0) return;

    throttleScroll(direction);
  });
}

function printContainers() {
  widthPicture = window.innerWidth / AMOUNT_OF_CONTAINERS;
  heightPicture = (widthPicture / 3) * 2;

  const radius = (window.innerWidth - widthPicture) / 2;
  const degreeOfRotation = HALF_CIRCLE / VISIBLE_ELEMENTS;
  let currentAngle = 0;

  for (let i = 0; i < AMOUNT_OF_CONTAINERS; i++) {
    const newContainer = createElem("div", "element", container);

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

function scrollGallery(direction) {
  const galleryContainers = container.querySelectorAll(".element");
  const lastElementPosition = direction === 1 ? AMOUNT_OF_CONTAINERS - 1 : 0;

  positionNow = positionNow + direction;

  const lastElement = galleryContainers[lastElementPosition];
  const lastElemLeft = lastElement.style.left;
  const lastElemTop = lastElement.style.top;

  const newPositionId =
    direction === 1 ? positionNow + VISIBLE_ELEMENTS : positionNow;

  for (let i = 0; i < AMOUNT_OF_CONTAINERS; i++) {
    const positionElement = direction === 1 ? VISIBLE_ELEMENTS - i : i;
    changePositionElement(
      positionElement,
      galleryContainers,
      direction,
      lastElemLeft,
      lastElemTop,
      newPositionId
    );
  }
}

function changePositionElement(
  positionElement,
  galleryContainers,
  direction,
  lastElemLeft,
  lastElemTop,
  newPositionId
) {
  const positionElemForTransition =
    direction === 1 ? 0 : AMOUNT_OF_CONTAINERS - 1;

  if (positionElement === positionElemForTransition) {
    galleryContainers[positionElemForTransition].remove();
    const newContainer = createElem(
      "div",
      "element",
      container,
      lastElemLeft,
      lastElemTop
    );
    addContainer(newContainer, direction);
    addImg(newContainer, newPositionId);

    return;
  }
  const prevElement = galleryContainers[positionElement - direction];
  const leftPrevElement = prevElement.style.left;
  const topPrevElement = prevElement.style.top;
  const nextElement = galleryContainers[positionElement];

  nextElement.style.left = leftPrevElement;
  nextElement.style.top = topPrevElement;
}

function addContainer(newContainer, direction) {
  if (direction === -1) {
    container.prepend(newContainer);
  } else {
    container.append(newContainer);
  }
}

function createElem(
  tag,
  className,
  container = null,
  lastElemLeft = null,
  lastElemTop = null
) {
  const elem = document.createElement(tag);
  elem.className = className;
  if (container) container.append(elem);

  if (lastElemLeft && lastElemTop) {
    elem.style.left = lastElemLeft;
    elem.style.top = lastElemTop;
    elem.style.width = `${widthPicture}px`;
    elem.style.height = `${heightPicture}px`;
  }
  return elem;
}

function addButtonReload(elem, positionPicture) {
  const button = createElem("button", "buttonReload", elem);
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
