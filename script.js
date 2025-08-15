document.title = "Spotify - Web Player: Music for everyone";
let currentSong = new Audio();

function secondsToMinutesSeconds(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (secs < 10) secs = "0" + secs;
    return `${minutes}:${secs}`;
}


async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1]);
        }
    }
    return songs;
}

const playMusic = (track, pause=false) => {
   // let audio = new Audio("/songs/" + track);
   currentSong.src = "/songs/" + track;
   if (!pause){

        currentSong.pause();
        play.src = "pause.svg";
    }
   
    
    document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ").replaceAll(" - (Raag.Fm).mp3", " ");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function main() {
    let songs = await getSongs();
    playMusic(songs[0], true);

    let songUL = document.querySelector(".songList ul");

    for (const song of songs) {
        songUL.insertAdjacentHTML("beforeend", `
            <li>
                <img src="music.svg" alt="" class="invert">
                <div class="Info" data-file="${song}">
                    <div>${song.replaceAll("%20", " ").replaceAll(" - (Raag.Fm).mp3", " ")}</div>
                    <div>Parikshit</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img src="play.svg" alt="player" class="invert">
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
    // Attach an event listener to the play button
    play.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play();
            play.src = "pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "play.svg";
            
        }
    })

    // Listener for timeupdate event
    currentSong.addEventListener("timeupdate", ()=>{
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration)* percent)/100;
    })

}

main();
