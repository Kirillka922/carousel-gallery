import "./main.css";
const THROTTLE_TIME = 500;
const HALF_CIRCLE = 180;
const LOADED_ELEMENTS = 8;
const AMOUNT_OF_CONTAINERS = 9;
const url = "https://www.thecocktaildb.com/api/json/v1/1/random.php";
const container = document.getElementById("container");
const linkBase = [];
let widthPicture = 0;
let positionNow = 0;

async function fetchHandler() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (response.status !== 200) {
      return new Error("Server Error");
    }
    const link = data.drinks[0].strDrinkThumb;

    const nestedResponse = await fetch(link);
    if (nestedResponse.status !== 200) {
      return new Error("Server Error");
    }
    const blob = await nestedResponse.blob();
    const blobUrl = URL.createObjectURL(blob);
    const blobResponse = await fetch(blobUrl);

    if (blobResponse.status !== 200) {
      URL.revokeObjectURL(blobUrl);
      return new Error("was created not correct Blob link");
    }
    return checkLink(blobUrl);
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

function runGallery() {
  printContainers();

  const trScrollGallery = throttle(
    (direction) => scrollGallery(direction),
    THROTTLE_TIME
  );

  container.addEventListener("wheel", function (e) {
    if (e.deltaX !== 0) return;

    let direction = Math.sign(e.deltaY);
    if (direction == -1 && positionNow === 0) return;

    trScrollGallery(direction);
  });
}

function printContainers() {
  widthPicture = window.innerWidth / AMOUNT_OF_CONTAINERS;
  const heightPicture = (widthPicture / 3) * 2;

  const radius = (window.innerWidth - widthPicture) / 2;
  const degreeOfRotation = HALF_CIRCLE / LOADED_ELEMENTS;
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
  let lastElementPosition = null;
  let positionElemForTransition = null;

  positionNow = positionNow + direction;
  let newPositionId = positionNow;

  if (direction === 1) {
    lastElementPosition = AMOUNT_OF_CONTAINERS - 1;
    newPositionId += LOADED_ELEMENTS;
    positionElemForTransition = 0;
  } else {
    lastElementPosition = 0;
    positionElemForTransition = AMOUNT_OF_CONTAINERS - 1;
  }
  const lastElement = galleryContainers[lastElementPosition];
  const lastElemLeft = lastElement.style.left;
  const lastElemTop = lastElement.style.top;

  for (let i = 0; i < AMOUNT_OF_CONTAINERS; i++) {
    changePositionElement(
      direction === 1 ? LOADED_ELEMENTS - i : i,
      galleryContainers
    );
  }

  function changePositionElement(positionElement, galleryContainers) {
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
}

async function addImg(elem, positionPicture) {
  if (linkBase[positionPicture] !== undefined) {
    const newImg = createElem("img", "imgContainer", elem);
    newImg.src = linkBase[positionPicture];
    return;
  }

  elem.classList.add("loadingImg");
  const response = await fetchHandler();
  elem.classList.remove("loadingImg");
  elem.innerHTML = "";

  if (response === undefined) {
    addButtonReload(elem, positionPicture);
    return;
  }

  const newImg = createElem("img", "imgContainer", elem);
  linkBase[positionPicture] = response;
  newImg.src = response;
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
  container,
  lastElemLeft = null,
  lastElemTop = null
) {
  const elem = document.createElement(tag);
  elem.className = className;
  container.append(elem);

  if (lastElemLeft && lastElemTop) {
    elem.style.left = lastElemLeft;
    elem.style.top = lastElemTop;
    elem.style.width = `${widthPicture}px`;
    elem.style.height = `${(widthPicture / 3) * 2}px`;
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

function checkLink(url) {
  const heightPicture = (widthPicture / 3) * 2;

  return new Promise(function (resolve, reject) {
    const img = new Image();
    img.onload = function () {
      if (checkImg(img, heightPicture)) resolve(url);
    };
    img.onerror = function () {
      reject(new Error("Img was not loaded!"));
    };

    img.src = url;
  });
}

function checkImg(img, heightPicture) {
  if (img.complete && img.naturalHeight >= heightPicture) return true;
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

runGallery();
