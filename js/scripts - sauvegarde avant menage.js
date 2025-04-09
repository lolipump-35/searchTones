// #region global scope

const globalContainer = document.querySelector(".global-container");
const allButtonsNotes = document.querySelectorAll(".buttonNotes");
const scoreBar = document.querySelector(".scoreBar");
const slider = document.querySelector(".slider");
const guitarNeck = document.querySelector(".guitarNeck");
let currentIndexSlide = 0;

// #endregion global scope

// #region scoreBar

const progressBar = document.querySelector(".progress");

const numberOfCases = 9; // À adapter dynamiquement si nécessaire
let currentProgress = 0;

// Fonction pour augmenter la progression
function increaseProgress() {
  if (currentProgress < 100) {
    currentProgress += 100 / numberOfCases; // Augmentation selon le nombre de cases
    progressBar.style.width = `${currentProgress}%`;
  }
}

// Simulation d'une bonne réponse
// const testButton = document.getElementById("testButton");
// testButton.addEventListener("click", increaseProgress);

// #endregion scoreBar

// #region slider
document.addEventListener("DOMContentLoaded", function () {
  var splide = new Splide(".splide", {
    width: "100%",
    type: "slide",
    drag: true,
    snap: true,
    pagination: false,
    arrows: true,
  });

  let currentAudio = null; // Stocke l'audio en cours

  // Fonction de mélange Fisher-Yates
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Échange des éléments
    }
  }

  // Mélange des slides une seule fois lors de l'initialisation
  const list = document.querySelector(".splide__list");
  const slides = Array.from(list.children);
  const fixedSlides = slides.slice(0, 2); // Les 2 premiers slides fixes
  let songSlides = slides.slice(2); // Les autres slides à mélanger

  // Mélange des slides de chansons
  shuffle(songSlides);
  console.log("ordre de slide", shuffle(songSlides));

  // Réorganiser les slides dans l'ordre voulu
  list.innerHTML = "";
  [...fixedSlides, ...songSlides].forEach((slide) => list.appendChild(slide));

  splide.refresh(); // Rafraîchit le carrousel après avoir réorganisé les slides

  splide.on("active", function (slide) {
    console.log(`🎵 Slide actif : ${slide.index + 1}`);

    // Arrêter la musique précédente
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
      audio.muted = false;
      audio
        .play()
        .then(() => {
          console.log("Lecture de la musique :", audio.src);
        })
        .catch((error) => {
          console.warn("Erreur lors de la lecture de l'audio :", error);
        });
    }

    splide.on("move", function (index) {
      console.log("L'événement 'move' a été déclenché avec l'index :", index);
      // Récupère la slide active
      const activeSlide = splide.Components.Slides.getAt(index).slide;
      const tonalite = activeSlide.querySelector('[data-tonalite]').getAttribute('data-tonalite');

      
      if (tonalite) {
          console.log(`Tonalité de la slide active : ${tonalite}`);
      } else {
          console.log("Aucune tonalité trouvée sur cette slide !");
      }

      const allNotesA = document.querySelectorAll(".noteA");
      const allNotesA_ = document.querySelectorAll(".noteA-");
      const allNotesB = document.querySelectorAll(".noteB");
      const allNotesC = document.querySelectorAll(".noteC");
      const allNotesC_ = document.querySelectorAll(".noteC-");
      const allNotesD = document.querySelectorAll(".noteD");
      const allNotesD_ = document.querySelectorAll(".noteD-");
      const allNotesE = document.querySelectorAll(".noteE");
      const allNotesF = document.querySelectorAll(".noteF");
      const allNotesF_ = document.querySelectorAll(".noteF-");
      const allNotesG = document.querySelectorAll(".noteG");
      const allNotesG_ = document.querySelectorAll(".noteG-");

      // Appliquer une action en fonction de la tonalité
      if (tonalite === "a") {
        allNotesA.target.style.backgroundColor = "green";
      } else if (tonalite === "c-") {
        allNotesC_.target.style.backgroundColor = "green";

      } else if (tonalite === "d-") {

      }
    });
  });

  // Fonction pour mettre en pause ou reprendre l'audio lorsqu'on clique sur un slide
  document.querySelectorAll(".song").forEach((songSlide) => {
    songSlide.addEventListener("click", function () {
      let audio = songSlide.querySelector("audio");
      if (audio) {
        if (audio.paused) {
          audio
            .play()
            .then(() => {
              console.log("Lecture de l'audio :", audio.src);
            })
            .catch((error) => {
              console.warn("Erreur lors de la lecture de l'audio :", error);
            });
        } else {
          audio.pause();
          console.log("Audio mis en pause");
        }
      }
    });
  });

  splide.mount();
});
// #endregion slider

// #region animation expliquations

document.addEventListener("DOMContentLoaded", function () {
  // Attendre 3 secondes avant d'ajouter la classe pour l'animation
  setTimeout(function () {
    document.querySelector("#expliquationsSwipe h1").classList.add("animate");
  }, 1000); // 3000ms = 3 secondes
});

document.addEventListener("DOMContentLoaded", function () {
  // Attendre 3 secondes avant d'ajouter la classe pour l'animation
  setTimeout(function () {
    document.querySelector("#expliquationsStop h1").classList.add("animate");
  }, 3000); // 3000ms = 3 secondes
});

// #endregion animation expliquations

//#region note color test

// const allButtonsNotes = document.querySelectorAll(".buttonNotes");

// allButtonsNotes.forEach((buttonNote) => {
//   buttonNote.addEventListener("click", function () {
//     if (this.classList.contains("noteA")) {
//       this.style.backgroundColor = "green";
//     }else if(this.classList.contains("noteA-")){
//       this.style.backgroundColor = "green";
//     }else if(this.classList.contains("noteB")){
//       this.style.backgroundColor = "green";
//     }else if(this.classList.contains("noteC")){
//       this.style.backgroundColor = "green";
//     }else if(this.classList.contains("noteC-")){
//       this.style.backgroundColor = "green";
//     }else if(this.classList.contains("noteD")){
//       this.style.backgroundColor = "green";
//     }else if(this.classList.contains("noteD-")){
//       this.style.backgroundColor = "green";
//     }else if(this.classList.contains("noteE")){
//       this.style.backgroundColor = "green";
//     }else if(this.classList.contains("noteF")){
//       this.style.backgroundColor = "green";
//     }else if(this.classList.contains("noteF-")){
//       this.style.backgroundColor = "green";
//     }else if(this.classList.contains("noteG")){
//       this.style.backgroundColor = "green";
//     }else if(this.classList.contains("noteG-")){
//       this.style.backgroundColor = "green";
//     }
//   });
// });

//#endregion note color test

// #region hideShowButtonNote

const hideShowButtonNavBar = document.getElementById("hideShowButtonNavBar");
const textButtonHide = document.querySelector(".hide");
const textButtonShow = document.querySelector(".show");

hideShowButtonNavBar.addEventListener("click", function () {
  allButtonsNotes.forEach((notebutton) => {
    notebutton.style.opacity = notebutton.style.opacity === "1" ? "0" : "1";
    if (notebutton.style.opacity === "1") {
      textButtonShow.style.display = "none";
      textButtonHide.style.display = "flex";
    } else {
      textButtonShow.style.display = "flex";
      textButtonHide.style.display = "none";
    }
  });
});

// #endregion hideShowButtonNote

// #region select note

allButtonsNotes.forEach((buttonnote) => {
  buttonnote.addEventListener("click", function () {
    console.log("note cliquer", buttonnote);
  });
});

const songs = document.querySelectorAll(".song");

songs.forEach((song) => {
  const tonalite = song.getAttribute("data-tonalite");
  console.log(`Tonalité de ${song.id}: ${tonalite}`);
});

// #endregion select note

//#region guitarNeck selected

const escapeGuitarNeck = document.getElementById("escapeGuitarNeck");

function toggleGuitarNeckHigh() {
  const currentTemplate = globalContainer.style.gridTemplate;
  const DefaultTemplate =
    currentTemplate === "" ||
    currentTemplate === "0.5fr 3% 0.5fr 20% 1fr 60% 1fr 8% / 1fr";

  if (DefaultTemplate) {
    globalContainer.style.gridTemplate =
      "0fr 0% 0.5fr 10% 1fr 75% 1fr 8% / 1fr";

    scoreBar.classList.add("scoreBar-hidden");

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
    currentTemplate === "0fr 0% 0.5fr 10% 1fr 75% 1fr 8% / 1fr";

  if (DefaultTemplate) {
    globalContainer.style.gridTemplate =
      "0.5fr 3% 0.5fr 20% 1fr 60% 1fr 8% / 1fr";

    scoreBar.classList.remove("scoreBar-hidden");

    escapeGuitarNeck.style.display = "none";

    allButtonsNotes.forEach((button) => {
      button.style.pointerEvents = "";
    });
  }
}

guitarNeck.addEventListener("click", toggleGuitarNeckHigh);
escapeGuitarNeck.addEventListener("click", toggleGuitarNeckDown);

//#endregion guitarNeck selected
