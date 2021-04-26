const { remote } = require("electron");
const axios = require("axios");
const Store = require("electron-store");

const store = new Store();
const webContents = remote.getCurrentWebContents();

const uri = "https://api.spotify.com/v1";

let is_playing = null;
let shuffle_state = null;
let is_muted = null;
let volume_percent = null;

const image = document.getElementById("image");
const song = document.getElementById("song");
const artist = document.getElementById("artist");
const playIcon = document.getElementById("play-icon");
const shuffleButton = document.getElementById("shuffle");
const volumeIcon = document.getElementById("volume-icon");

// TODO: implement other actions, like shuffle, volume & search function

webContents.on("dom-ready", () => {
  getCurrentPlayback();
  setInterval(getCurrentPlayback, 2000);
});

const getCurrentPlayback = async () => {
  axios
    .get(`${uri}/me/player`, {
      headers: {
        Authorization: `Bearer ${store.get("access_token")}`,
      },
    })
    .then((response) => {
      const data = response.data;
      if (data.item) {
        store.set("device_id", data.device.id);

        is_playing = data.is_playing;
        shuffle_state = data.shuffle_state;
        volume_percent = data.device.volume_percent;

        image.src = data.item.album.images[2].url;
        song.innerText = data.item.name;
        artist.innerText = data.item.artists[0].name;

        if (data.actions.disallows.toggling_shuffle) {
          shuffleButton.setAttribute("disabled", true);
          shuffleButton.style.color = "#5a5a5a";
        }

        is_playing
          ? (playIcon.className = "fa fa-pause fa-lg")
          : (playIcon.className = "fa fa-play fa-lg");

        // TODO: Disable when actions.dissallows.toggling_shuffle": true
        shuffle_state
          ? (shuffleButton.className = "active-button")
          : (shuffleButton.className = "");

        // TODO: when volume > 75%: volume icon with level 2 volume
        volume_percent === 0
          ? (volumeIcon.className = "fa fa-volume-off fa-lg")
          : (volumeIcon.className = "fa fa-volume-down fa-lg");
      } else {
        image.src = "";
        song.innerText = "No song playing";
        artist.innerText = "Play a song a spotify player";
      }
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

//// Logout
// document.getElementById("logout").onclick = () => {
//   authProcess.createLogoutWindow();
//   remote.getCurrentWindow().close();
// };

// Play/Pause track
document.getElementById("play").onclick = () => {
  axios
    .put(
      `${uri}/me/player/${is_playing ? "pause" : "play"}`,
      { device_id: store.get("device_id") },
      {
        headers: {
          Authorization: `Bearer ${store.get("access_token")}`,
        },
      }
    )
    .then(() => {
      if (!is_playing) {
        is_playing = true;
        playIcon.className = "fa fa-pause fa-lg";
      } else {
        is_playing = false;
        playIcon.className = "fa fa-play fa-lg";
      }
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

// Previous track
document.getElementById("previous").onclick = () => {
  axios
    .post(
      `${uri}/me/player/previous`,
      { device_id: store.get("device_id") },
      {
        headers: {
          Authorization: `Bearer ${store.get("access_token")}`,
        },
      }
    )
    .then(() => {})
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

// Next track
document.getElementById("next").onclick = () => {
  axios
    .post(
      `${uri}/me/player/next`,
      { device_id: store.get("device_id") },
      {
        headers: {
          Authorization: `Bearer ${store.get("access_token")}`,
        },
      }
    )
    .then(() => {})
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

// Mute/Unmute
document.getElementById("mute").onclick = () => {
  axios
    .put(
      `${uri}/me/player/volume?volume_percent=${is_muted ? 50 : 0}`,
      { device_id: store.get("device_id") },
      {
        headers: {
          Authorization: `Bearer ${store.get("access_token")}`,
        },
      }
    )
    .then(() => {
      if (!is_muted) {
        is_muted = true;
        volumeIcon.className = "fa fa-volume-off fa-lg";
      } else {
        is_muted = false;
        volumeIcon.className = "fa fa-volume-down fa-lg";
      }
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};

// Shuffle track
document.getElementById("shuffle").onclick = () => {
  axios
    .put(
      `${uri}/me/player/shuffle?state=${!shuffle_state}`,
      {
        device_id: store.get("device_id"),
      },
      {
        headers: {
          Authorization: `Bearer ${store.get("access_token")}`,
        },
      }
    )
    .then(() => {
      if (!shuffle_state) {
        shuffle_state = true;
        shuffleButton.className = "active-button";
      } else {
        shuffle_state = false;
        shuffleButton.className = "";
      }
    })
    .catch((error) => {
      if (error) throw new Error(error);
    });
};
