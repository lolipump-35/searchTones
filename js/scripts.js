//#region global scope
const globalContainer = document.querySelector(".global-container");
const allButtonsNotes = document.querySelectorAll(".buttonNotes");
const scoreBar = document.querySelector(".scoreBar");
const slider = document.querySelector(".slider");
const guitarNeck = document.querySelector(".guitarNeck");
const thirdClasses = [];
const slideIdChecked = [];
let currentIndexSlide = 0;
let currentSlideId = null;
let tonalite = null;
let diatonicNotes = null;
const audioBuffers = {};


// zoom slider 
function adjustImageZoom() {
  const img = document.querySelector('.song img');

  if (!slider || !img) return;

  const sliderHeight = slider.offsetHeight;
  const imgNaturalWidth = img.naturalWidth;
  const imgNaturalHeight = img.naturalHeight;
  const sliderWidth = slider.offsetWidth;

  // Ratio de l’image originale
  const imgRatio = imgNaturalWidth / imgNaturalHeight;

  // Taille que l’image aurait dans le slider si elle garde son ratio (comme object-fit: contain)
  const expectedHeight = sliderWidth / imgRatio;

  if (expectedHeight < sliderHeight) {
    // L’image est trop courte → on "zoome" avec transform: scale
    const scaleFactor = sliderHeight / expectedHeight;
    img.style.transform = `scale(${scaleFactor})`;
  } else {
    // L’image remplit ou dépasse en hauteur → pas de zoom
    img.style.transform = 'scale(1)';
  }
}

window.addEventListener('load', adjustImageZoom);
window.addEventListener('resize', adjustImageZoom);

//#endregion global scope

//#region scorbar

const progressBar = document.querySelector(".progress");

const numberOfCases = document.querySelectorAll(".song").length ;
console.log("nombre de son:",numberOfCases); // À adapter dynamiquement si nécessaire
let currentProgress = 0;

// Fonction pour augmenter la progression
function increaseProgress() {
  if (currentProgress < 100) {
    currentProgress += 100 / numberOfCases; // Augmentation selon le nombre de cases
    progressBar.style.width = `${currentProgress}%`;
  }
}

//#endregion scorbar

//#region slider

let currentAudio = null;
let userPaused = false; // Variable pour suivre si l'utilisateur a mis pause

//#region randomiser

// 🎲 Fonction de mélange (Fisher-Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Échange des éléments
  }
}

// 📌 Fonction pour mélanger et réorganiser les slides
function mixSlides() {
  const list = document.querySelector(".splide__list");
  if (!list) return; // Vérification que l'élément existe

  const slides = Array.from(list.children);
  const fixedSlides = slides.slice(0, 2); // Garder les 2 premiers fixes
  let songSlides = slides.slice(2); // Slides à mélanger

  shuffle(songSlides); // Mélange des slides de chansons

  console.log(
    "Ordre des slides après mélange :",
    songSlides.map((slide) => slide.textContent || "Slide")
  );

  // Réorganisation du DOM
  list.innerHTML = ""; // Vider la liste actuelle
  [...fixedSlides, ...songSlides].forEach((slide) => list.appendChild(slide)); // Réorganiser les slides
}

//#endregion randomiser

document.addEventListener("DOMContentLoaded", function () {
  mixSlides();

  var splide = new Splide(".splide", {
    width: "100%",
    type: "slide",
    drag: true,
    snap: true,
    pagination: false,
    arrows: false,
  });

  splide.mount(); // Monte Splide après modification des slides
  //#endregion initialisation slider




  splide.on('moved', (newIndex) => {
    const activeSlide = splide.Components.Slides.getAt(newIndex).slide;
    const songDiv = activeSlide.querySelector('.song');
  
    const url = songDiv.dataset.url;
    const tonalite = songDiv.dataset.tonalite;
  
    if (url) playSlideAudio(url);
  
    // Met à jour l'affichage de la tonalité
    const tonaliteDisplay = document.querySelector('#tonaliteActuelle');
    if (tonaliteDisplay) tonaliteDisplay.textContent = tonalite;
  });
  




  // #region gestion tonalité
  splide.on("move", function (index) {
    console.log("L'événement 'move' a été déclenché avec l'index :", index);
    // Récupère la slide active
    const activeSlide = splide.Components.Slides.getAt(index).slide;
    tonalite = activeSlide
      .querySelector("[data-tonalite]")
      .getAttribute("data-tonalite");
    console.log("ce qu il y a dans tonalite", tonalite);

    // Réinitialiser la pause utilisateur lorsqu'on change de slide
    userPaused = false;

    // Récupère l'ID de la slide active
    const slideId = activeSlide.id;
    currentSlideId = slideId;
  });

  //#endregion gestion tonalité

  splide.on("active", function (slide) {
    console.log(`Slide actif : ${slide.index + 1}`);
  
    const newNotes = getNotesByTonalite(tonalite);
    console.log("liste note de la gamme actuel", newNotes);
  
    const diatonicIndex = [2, 4, 5, 7, 9, 11];
    diatonicNotes = diatonicIndex.map((index) => newNotes[index]);
    console.log("gamme actuel", diatonicNotes);
  
    // Gestion de l'audio sur mobile
    if (currentAudio && !currentAudio.paused) {
      console.log("Arrêt de la musique précédente");
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
  
    // Vérifier s'il y a un <audio> dans le slide actif
    let activeSlide = slide.slide;
    let audio = activeSlide.querySelector("audio");
  
    if (audio) {
      currentAudio = audio;
    
      // 🔄 Important : définir le volume AVANT le play()
      audio.volume = 0.01; // Pas trop bas pour iOS
    
      if (!userPaused) {
        audio.muted = false;
        audio.play()
          .then(() => {
            console.log("Lecture de la musique :", audio.src);
          })
          .catch((error) => {
            console.warn("Erreur lors de la lecture de l'audio :", error);
          });
      }
    }
  
    // Réinitialiser les styles des boutons de notes
    allButtonsNotes.forEach((button) => {
      button.style.backgroundColor = "";
      button.style.color = "";
    });
  });
  

  //#region function audio
  // 🎵 Fonction pour gérer le clic sur une slide
  function toggleAudio(songSlide) {
    let audio = songSlide.querySelector("audio");
    if (!audio) return;

    if (currentAudio && currentAudio !== audio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    if (audio.paused) {
      userPaused = false; // Réinitialise l'état

      audio.volume = 0.01;

      audio
        .play()
        .then(() => {
          console.log("Lecture de :", audio.src);
          currentAudio = audio;
        })
        .catch((error) => {
          console.warn("Erreur lors de la lecture :", error);
        });
    } else {
      userPaused = true; // L'utilisateur a mis pause
      audio.pause();
      console.log("Pause de :", audio.src);
    }
  }
  //#endregion function audio

  // Ajout d'un seul écouteur par slide (évite la duplication)
  document.querySelectorAll(".song").forEach((songSlide) => {
    songSlide.addEventListener("click", function () {
      let audio = songSlide.querySelector("audio");
      if (!audio) return;
  
      // ✅ Définir le volume directement ici pour iOS
      audio.volume = 0.0003;
  
      toggleAudio(songSlide);
    });
  });
});

//#endregion slider

//#region guitarneck
// Initialisation AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const slideBuffers = new Map(); // Stocke les buffers audio
let currentSource = null;
console.log("AudioContext state:", audioContext.state);


// Débloque l'audio sur iOS (obligatoire)
document.addEventListener("click", () => {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}, { once: true });

// Charge et retourne le buffer audio
async function loadSlideAudio(url) {
  if (slideBuffers.has(url)) return slideBuffers.get(url);

  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = await audioContext.decodeAudioData(arrayBuffer);
  slideBuffers.set(url, buffer);
  return buffer;
}

// Joue le son avec un volume réduit
async function playSlideAudio(url) {
  const buffer = await loadSlideAudio(url);

  if (currentSource) currentSource.stop();

  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();
  gainNode.gain.value = 0.05; // volume réduit

  source.buffer = buffer;
  source.connect(gainNode).connect(audioContext.destination);
  source.start(0);
  currentSource = source;
}

// Précharger tous les sons des boutons
(async () => {
  const allAudioElements = document.querySelectorAll("button.buttonNotes audio");

  for (let audioElement of allAudioElements) {
    const url = audioElement.src;
    try {
      const buffer = await loadSlideAudio(url);
      audioBuffers[url] = buffer;
    } catch (e) {
      console.error("Erreur chargement audio :", url, e);
    }
  }

  console.log("🔊 Tous les sons sont chargés !");
})();

document.querySelectorAll("button.buttonNotes audio").forEach((audio) => {
  audio.preload = "auto";
});

const escapeGuitarNeck = document.getElementById("escapeGuitarNeck");

function toggleGuitarNeckHigh() {
  const currentTemplate = globalContainer.style.gridTemplate;
  const DefaultTemplate =
    currentTemplate === "" ||
    currentTemplate === "0.5fr 3% 0.5fr 20% 1fr 60% 1fr 8% / 1fr";

  if (DefaultTemplate) {
    globalContainer.style.gridTemplate =
      "0.5fr 1% 0.5fr 10% 1fr 75% 1fr 8% / 1fr";

    escapeGuitarNeck.style.display = "flex";

    allButtonsNotes.forEach((button) => {
      button.style.pointerEvents = "all";
    });
  }
}

function toggleGuitarNeckDown() {
  const currentTemplate = globalContainer.style.gridTemplate;
  const DefaultTemplate =
    currentTemplate === "" ||
    currentTemplate === "0.5fr 1% 0.5fr 10% 1fr 75% 1fr 8% / 1fr";

  if (DefaultTemplate) {
    globalContainer.style.gridTemplate =
      "0.5fr 3% 0.5fr 20% 1fr 60% 1fr 8% / 1fr";

    escapeGuitarNeck.style.display = "none";

    allButtonsNotes.forEach((button) => {
      button.style.pointerEvents = "";
    });
  }
}

guitarNeck.addEventListener("click", toggleGuitarNeckHigh);

allButtonsNotes.forEach((buttonNote) => {
  buttonNote.addEventListener("pointerdown", function () {
    console.log("button cliqué:", buttonNote);

    // Lecture du son via AudioContext
    const noteUrl = buttonNote.querySelector("audio")?.src;
    if (noteUrl && audioBuffers[noteUrl]) {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
    
      gainNode.gain.value = 1.0; // 100% du volume
    
      source.buffer = audioBuffers[noteUrl];
      source.connect(gainNode).connect(audioContext.destination);
      source.start(0);
    } else {
      console.warn("❌ Son non trouvé ou non chargé :", noteUrl);
    }

    if (isButtonsVisible === 0) {
      return; // Ne fait rien si les boutons sont cachés
    }

    let currentNote = buttonNote.classList[2];
    console.log("Note cliquée:", currentNote);

    if (typeof currentNote !== "string") {
      console.error("❌ currentNote est invalide :", currentNote);
      return;
    }

    // Changer la couleur si isButtonsVisible === 1
    if (currentNote === tonalite) {
      buttonNote.style.backgroundColor = "#0C7000";
      buttonNote.style.color = "white";

      if (!slideIdChecked.includes(currentSlideId)) {
        console.log("slideId absent");
        increaseProgress();
        slideIdChecked.push(currentSlideId);
      } else {
        console.log("slideId trouvé");
      }
    }

    if (diatonicNotes.includes(currentNote)) {
      buttonNote.style.backgroundColor = "#A7EA9F";
    }
  });
});

// Liste complète des notes
const allNotes = [
  "A",
  "A-",
  "B",
  "C",
  "C-",
  "D",
  "D-",
  "E",
  "F",
  "F-",
  "G",
  "G-",
];

// Réorganisation selon la tonalité
function getNotesByTonalite(tonalite) {
  const index = allNotes.indexOf(tonalite);
  if (index === -1) return [];
  return [...allNotes.slice(index), ...allNotes.slice(0, index)];
}

//#endregion guitarneck

//#region navbar

// #region animation expliquations

document.addEventListener("DOMContentLoaded", function () {
  // Attendre 3 secondes avant d'ajouter la classe pour l'animation
  setTimeout(function () {
    document.querySelector("#expliquationsSwipe h1").classList.add("animate");
  }, 1000); // 3000ms = 3 secondes
});

// #endregion animation expliquations
// #region hideShowButtonNote

const hideShowButtonNavBar = document.getElementById("hideShowButtonNavBar");
const textButtonHide = document.querySelector(".hide");
const textButtonShow = document.querySelector(".show");

let isButtonsVisible = 0; // 1 = visible, 0 = caché

hideShowButtonNavBar.addEventListener("click", function () {
  allButtonsNotes.forEach((notebutton) => {
    notebutton.style.opacity = notebutton.style.opacity === "1" ? "0" : "1";
  });

  // Mettre à jour l'état général
  isButtonsVisible = isButtonsVisible === 1 ? 0 : 1;

  if (isButtonsVisible === 1) {
    textButtonShow.style.display = "none";
    textButtonHide.style.display = "flex";
  } else {
    textButtonShow.style.display = "flex";
    textButtonHide.style.display = "none";
  }

  console.log("État des boutons :", isButtonsVisible); // Vérifie dans la console
});

// #endregion hideShowButtonNote

escapeGuitarNeck.addEventListener("click", toggleGuitarNeckDown);

//#endregion navbar
