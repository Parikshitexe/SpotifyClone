document.title = "Spotify - Web Player: Music for everyone";
let currentSong = new Audio();
let songs = [];
let currFolder = "";
let lastVolume = 0.5; // default

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let res = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let html = await res.text();
    let div = document.createElement("div");
    div.innerHTML = html;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let a of as) {
        if (a.href.endsWith(".mp3")) {
            songs.push(a.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = ""; 
    for (const song of songs) {
        songUL.insertAdjacentHTML("beforeend", `
            <li>
                <img src="img/music.svg" alt="" class="invert">
                <div class="Info" data-file="${song}">
                    <div>${song.replaceAll("%20", " ").replace(/\.mp3$/, "")}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img src="img/play.svg" alt="player" class="invert">
                </div>
            </li>
        `);
    }

    document.querySelectorAll(".songList li").forEach(li => {
        li.addEventListener("click", () => {
            let file = li.querySelector(".Info").dataset.file;
            playMusic(file);
        });
    });
    return songs;
}

function playMusic(track, pause=false) {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ").replace("320 Kbps", "").replace("(Raag.Fm).mp3", "").replace(".mp3", "");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let res = await fetch(`http://127.0.0.1:3000/songs/`);
    let html = await res.text();
    let div = document.createElement("div");
    div.innerHTML = html;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = ""; 

    for (let a of anchors) {
        if (a.href.includes("/songs")) {
            let folder = a.href.split("/").slice(-2)[0];
            let info = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`).then(r => r.json());

            cardContainer.innerHTML += `
                <div data-folder=${folder} class="card">
                    <div class="play"><img src="img/playBtn.svg" alt="play"></div>
                    <img src="/songs/${folder}/cover.jpeg" alt="">
                    <h2>${info.title}</h2>
                    <p>${info.artist || info.description || ""}</p>
                </div>`;
        }
    }

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async e => {
            songs = await getSongs(`songs/${card.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    // buttons
    const play = document.getElementById("play");
    const previous = document.getElementById("previous");
    const next = document.getElementById("next");

    await getSongs("songs/ncs");
    playMusic(songs[0], true);
    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    currentSong.addEventListener("ended", () => {
        play.src = "img/play.svg";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index-1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index + 1 < songs.length) playMusic(songs[index+1]);
    });

    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = e.target.value / 100;
        lastVolume = currentSong.volume;
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (!currentSong.muted) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.muted = true;
        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.muted = false;
            currentSong.volume = lastVolume;
        }
    });

    document.querySelector(".signBtn").addEventListener("click", () => {
        window.open("https://www.spotify.com/in-en/signup?forward_url=https%3A%2F%2Fopen.spotify.com%2F");
    })

    document.querySelector(".loginBtn").addEventListener("click", () => {
        window.open("https://accounts.spotify.com/en/login?continue=https%3A%2F%2Fopen.spotify.com%2F");
    });
}

main();
