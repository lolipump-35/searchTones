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
let currentAudio = null;
let userPaused = false;

//#region Liste complète des notes

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

//#endregion Liste complète des notes

// #region animation expliquations

document.addEventListener("DOMContentLoaded", function () {
  // Attendre 3 secondes avant d'ajouter la classe pour l'animation
  setTimeout(function () {
    document.querySelector("#expliquationsSwipe h1").classList.add("animate");
  }, 1000); // 3000ms = 3 secondes
  setTimeout(function () {
    document.querySelector("#expliquationsStop h1").classList.add("animate");
  }, 1000); // 3000ms = 3 secondes
});

// #endregion animation expliquations

//#region function Réorganisation selon tonalité

function getNotesByTonalite(tonalite) {
  const index = allNotes.indexOf(tonalite);
  if (index === -1) return [];
  return [...allNotes.slice(index), ...allNotes.slice(0, index)];
}

//#endregion function Réorganisation selon tonalité

// #region function toggleGuitarNeck
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

// #endregion function toggleGuitarNeck

//#region function pause au clic

function toggleAudio(songSlide) {
  let audio = songSlide.querySelector("audio");
  if (!audio) return;

  if (currentAudio && currentAudio !== audio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  if (audio.paused) {
    userPaused = false;

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
    userPaused = true;
    audio.pause();
    console.log("Pause de :", audio.src);
  }
}

// ✅ Attache correctement la fonction aux boutons :
document.querySelectorAll('.song').forEach((slide) => {
  slide.addEventListener('click', () => toggleAudio(slide));
});


//#endregion function pause au clic

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

//#region zoom slider 
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
//#endregion zoom slider 

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

//#region initialisation slider

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

  splide.mount(); 

  //#endregion initialisation slider

// #region slider move

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

// #endregion slider move

// #region slider active
  splide.on("active", function (slide) {
    console.log(`Slide actif : ${slide.index + 1}`);
  
// #region variable tonalité

    const newNotes = getNotesByTonalite(tonalite);
    console.log("liste note de la gamme actuel", newNotes);

// #endregion variable tonalité

// #region variable gamme

    const diatonicIndex = [2, 4, 5, 7, 9, 11];
    diatonicNotes = diatonicIndex.map((index) => newNotes[index]);
    console.log("gamme actuel", diatonicNotes);
  
// #endregion variable gamme

//#region pause auto au slide
    if (currentAudio && !currentAudio.paused) {
      console.log("Arrêt de la musique précédente");
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
//#endregion pause auto au slide
  
// #region lecture audio

    let activeSlide = slide.slide;
    let audio = activeSlide.querySelector("audio");
  
    if (audio) {
      currentAudio = audio;
    
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

// #endregion lecture audio
  
 // #region reinitialisation couleur buttonNote

    allButtonsNotes.forEach((button) => {
      button.style.backgroundColor = "";
      button.style.color = "";
    });

 // #endregion reinitialisation couleur buttonNote

  });
  
// #endregion slider active

// #region gestion play/stop

document.querySelectorAll(".song").forEach((songSlide) => {
  songSlide.addEventListener("click", function () {
    let audio = songSlide.querySelector("audio");
    if (!audio) return;

    toggleAudio(songSlide);
  });
});

// #endregion gestion play/stop
  
});

//#endregion slider




//#region guitarneck

//#region Précharger tous les sons des boutons
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

//#endregion Précharger tous les sons des boutons

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// GESTION DES SONGS
const songButtons = document.querySelectorAll('.song');

songButtons.forEach((button) => {
  const audio = button.querySelector('audio');
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.1;

  // ✅ Connecter la source seulement une fois
  const source = audioCtx.createMediaElementSource(audio);
  source.connect(gainNode).connect(audioCtx.destination);

  button.addEventListener('click', async () => {
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    
    // 🔇 Arrêter tous les autres morceaux en cours
    songButtons.forEach((btn) => {
      const otherAudio = btn.querySelector('audio');
      if (otherAudio !== audio) {
        otherAudio.pause();
        otherAudio.currentTime = 0;
      }
    });

    // 🔁 Si déjà en train de jouer : on stoppe
    if (!audio.paused) {
      audio.pause();
    } else {
      audio.play();
    }
  });
});

// GESTION DES NOTES
const playNote = async (audio) => {
  if (audioCtx.state === 'suspended') await audioCtx.resume();
  audio.currentTime = 0;
  audio.volume = 1.0;
  audio.play();
};

const noteButtons = document.querySelectorAll('.buttonNotes');

noteButtons.forEach((btn) => {
  const noteAudio = btn.querySelector('audio');

  const handlePlay = () => playNote(noteAudio);

  // Détection mobile simple
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isTouchDevice) {
    btn.addEventListener('touchstart', handlePlay, { passive: true });
  } else {
    btn.addEventListener('click', handlePlay);
  }
});




// #region ecouteur de pointerdown sur buttonsNote
allButtonsNotes.forEach((buttonNote) => {
  buttonNote.addEventListener("pointerdown", function () {
    console.log("button cliqué:", buttonNote);

    // Lecture du son via AudioContext
    const noteUrl = buttonNote.querySelector("audio")?.src;
    if (noteUrl && audioBuffers[noteUrl]) {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
    
      source.buffer = audioBuffers[noteUrl];
      source.connect(gainNode).connect(audioContext.destination);
      source.start(0);
    } else {
      console.warn("❌ Son non trouvé ou non chargé :", noteUrl);
    }

    // si le button n'est pas visible on change rien 
    if (isButtonsVisible === 0) {
      return; 
    }

    //#region Changer la couleur 

    let currentNote = buttonNote.classList[2];
    console.log("Note cliquée:", currentNote);

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
    //#endregion Changer la couleur 

  });
});

// #endregion ecouteur de pointerdown sur buttonsNote

//#endregion guitarneck




//#region navbar

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

// #region ecouteur 

escapeGuitarNeck.addEventListener("click", toggleGuitarNeckDown);
guitarNeck.addEventListener("click", toggleGuitarNeckHigh);

// #endregion ecouteur 

//#endregion navbar

















//#region Initialisation AudioContext

// const audioContext = new (window.AudioContext || window.webkitAudioContext)();
// const slideBuffers = new Map(); // Stocke les buffers audio
// let currentSource = null;
// console.log("AudioContext state:", audioContext.state);

// //#endregion Initialisation AudioContext

// // #region verification de l etat du context audio
// document.addEventListener("click", () => {
//   if (audioContext.state === "suspended") {
//     audioContext.resume();
//   }
// }, { once: true });

// // #endregion verification de l etat du context audio

// //#region Charge et retourne le buffer audio

// async function loadSlideAudio(url) {
//   if (slideBuffers.has(url)) return slideBuffers.get(url);

//   const response = await fetch(url);
//   const arrayBuffer = await response.arrayBuffer();
//   const buffer = await audioContext.decodeAudioData(arrayBuffer);
//   slideBuffers.set(url, buffer);
//   return buffer;
// }

// //#endregion Charge et retourne le buffer audio

// //#region gestion volume song ***marche pas****

// async function playSlideAudio(url) {
//   const buffer = await loadSlideAudio(url);

//   if (currentSource) currentSource.stop();

//   const source = audioContext.createBufferSource();
//   const gainNode = audioContext.createGain();
//   gainNode.gain.value = 0.4; // volume réduit

//   source.buffer = buffer;
//   source.connect(gainNode).connect(audioContext.destination);
//   source.start(0);
//   currentSource = source;
// }

// //#endregion gestion volume song

