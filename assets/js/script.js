const navLinks = document.querySelectorAll(".nav-links li a");
const sections = document.querySelectorAll("section");

function inactive() {
    navLinks.forEach(link => {
        if (link.classList.contains("active")) link.classList.remove("active");
    });
}

navLinks.forEach(link => {
    link.addEventListener("click", (evt) => {
        inactive();
        link.classList.add("active");
    });
});

window.onscroll = (evt) => {
    sections.forEach(section => {
        let top = window.scrollY + (window.innerHeight / 2);
        let offset = section.offsetTop;
        let height = section.offsetHeight;
        let id = section.getAttribute("id");
        if (top >= offset && top < offset + height) {
            inactive();
            document.querySelector(`#n-${id}`).classList.add("active");
        }
    })
}

let skillData;
let projectData;
let musicData;

const skillContainer = document.querySelector("#skills .skill-container");
const projectRootContainer = document.querySelector("#projects .project-root-container");
let projectContainer;

function pad(n, d) {
    let s = n.toString();
    while (s.length < d) s = "0" + s;
    return s;
}

function formatTime(totalSecs) {
    let seconds = Math.floor(totalSecs % 60);
    let minutes = Math.floor(totalSecs / 60);
    return pad(minutes, 2) + ":" + pad(seconds, 2);
}

const playControl = document.querySelector(".play-control");

let wavesurfer = WaveSurfer.create({
    container: ".play-control-waveform",
    waveColor: "#cfcfcf",
    progressColor: "#1f60ff",
    height: 64,
    scrollParent: false,
    barWidth: 3,
    barRadius: 3
});

let playing = false;
let loaded = false;

function updatePlayBtn() {
    playControl.textContent = !playing ? "play_arrow" : "pause";
}

playControl.addEventListener("click", () => {
    if (!loaded) return;
    playing = !playing;
    updatePlayBtn();
    if (playing) {
        wavesurfer.play();
    } else {
        wavesurfer.pause();
    }
});

const musicTitleDom = document.querySelector(".music-title");
const musicArtistDom = document.querySelector(".music-artist");
const musicGenreDom = document.querySelector(".music-genre");
const musicTimeDom = document.querySelector(".music-timestamp");
//const trackIndicatorDom = document.querySelector(".track-indicator");
const playNavLeft = document.querySelector(".play-nav-left");
const playNavRight = document.querySelector(".play-nav-right");

let curDuration = 0;
let curIndex = 0;
let curLength = 0;

wavesurfer.on("ready", (duration) => {
    curDuration = duration;
    musicTimeDom.textContent = `00:00 / ${formatTime(curDuration)}`;
    musicTitleDom.textContent = musicData[curIndex].title;
    musicArtistDom.textContent = musicData[curIndex].artist;
    musicGenreDom.textContent = `Genre: ${musicData[curIndex].genre}`;
});

wavesurfer.on("audioprocess", (time) => {
    musicTimeDom.textContent = `${formatTime(time)} / ${formatTime(curDuration)}`;
});

wavesurfer.on("finish", () => {
    playing = false;
    updatePlayBtn();
});

function loadTrackByIndex(idx) {
    curIndex = idx;
    loaded = true;
    //trackIndicatorDom.textContent = `Track ${idx + 1} / ${musicData.length}`;
    playing = false;
    wavesurfer.load(`assets/music/${musicData[idx].href}.mp3`);
}

let projectContainers = [];
let curProjectContainer = 0;
let projectContainerLength;

const projectNavLeft = document.querySelector(".project-nav-left");
const projectNavRight = document.querySelector(".project-nav-right");

function updateTrack() {
    playing = false;
    updatePlayBtn();
    wavesurfer.setTime(0);
    loadTrackByIndex(curIndex);
}

function updateProjectCards() {
    projectContainers.forEach((projectContainer, i) => {
        centerPos = i - curProjectContainer;
        if (i != curProjectContainer) {
            projectContainer.style.opacity = "0";
            projectContainer.style.marginLeft = `${100 * centerPos}vw`;
        } else {
            projectContainer.style.opacity = "1";
            projectContainer.style.marginLeft = "0vw";
        }
    });
}

const navSidebar = document.querySelector(".nav-sidebar");
const navSidebarBtn = document.querySelector(".nav-sidebar-btn");
const navSidebarClose = document.querySelector(".nav-sidebar-close");

fetch("./assets/json/sitedata.json").then(res => res.json()).then(data => {
    skillData = data.skills;
    projectData = data.projects;
    musicData = data.music;

    skillData.sort((a, b) => b.p.localeCompare(a.p)).forEach(skill => {
        skillContainer.innerHTML += `
            <div class="skill-item">
                <span class="skill-name"><i class="devicon-${skill.i}-plain colored"></i> ${skill.name}</span>
                <div class="skill-bar">
                    <span class="skill-bar-filled" style="width: ${skill.p}">
                        <span class="skill-tooltip">${skill.p}</span>
                    </span>
                </div>   
            </div>
        `;
    });
    
    projectData.forEach((project, i) => {
        if (i % 2 == 0) {
            projectContainer = document.createElement("div");
            //if  (i > 0) projectRootContainer.innerHTML += "<br><br>";
            projectRootContainer.appendChild(projectContainer);
            projectContainer.classList.add("project-container");
            projectContainers.push(projectContainer);
        }
        projectContainer.innerHTML += `
            <div class="project-card">
                <div class="project-thumbnail">
                    <img src="assets/img/projects/${project.href}.png" alt="Thumbnail">
                </div>
                <div class="project-card-data">
                    <p class="project-card-title">${project.title}</p>
                    <div class="project-card-info">
                        <span>${project.desc}</span>
                    </div>
                </div>
                <button class="project-card-btn">View</div>
            </div>
        `;
    });

    projectContainerLength = projectContainers.length;
    
    curLength = musicData.length;
    loadTrackByIndex(0);

    playNavRight.addEventListener("click", () => {
        curIndex++;
        if (curIndex >= curLength) curIndex = 0;
        updateTrack();
    });

    playNavLeft.addEventListener("click", () => {
        curIndex--;
        if (curIndex < 0) curIndex = curLength - 1;
        updateTrack();
    });

    projectNavLeft.addEventListener("click", () => {
        curProjectContainer--;
        if (curProjectContainer < 0) curProjectContainer = projectContainerLength - 1;
        updateProjectCards();
    });

    projectNavRight.addEventListener("click", () => {
        curProjectContainer++;
        if (curProjectContainer >= projectContainerLength) curProjectContainer = 0;
        updateProjectCards();
    });
    
    navSidebarBtn.addEventListener("click", () => {
        navSidebar.style.right = "0rem"
    });

    navSidebarClose.addEventListener("click", () => {
        navSidebar.style.right = "-15rem"
    });
    
    AOS.init({
        mirror: true,
        offset: 256
    });
});