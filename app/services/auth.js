const axios = require("axios");
const url = require("url");
const keytar = require("keytar");
const os = require("os");
const request = require("request");
const Store = require("electron-store");
const config = require("../config");

const store = new Store();

const keytarService = "electron-spotify-mini";
const keytarAccount = os.userInfo().username;

function getAuthenticationURL() {
  return (
    "https://accounts.spotify.com/authorize?" +
    "client_id=" +
    config.CLIENT_ID +
    "&response_type=code" +
    "&redirect_uri=" +
    config.REDIRECT_URI +
    "&scope=user-read-private user-read-email user-read-playback-state user-modify-playback-state&"
  );
}

async function refreshTokens() {
  const refreshToken = await keytar.getPassword(keytarService, keytarAccount);

  if (refreshToken) {
    const refreshOptions = {
      method: "POST",
      url: "https://accounts.spotify.com/api/token",
      headers: {
        Authorization:
          "Basic " +
          new Buffer.from(config.CLIENT_ID + ":" + config.CLIENT_SECRET).toString("base64"),
      },
      data: {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
    };

    try {
      const response = await axios(refreshOptions);

      accessToken = response.data.access_token;
    } catch (error) {
      await logout();

      throw error;
    }
  } else {
    throw new Error("No available refresh token.");
  }
}

async function loadTokens(callbackURL) {
  const urlParts = url.parse(callbackURL, true);
  const query = urlParts.query;

  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: query.code,
      redirect_uri: config.REDIRECT_URI,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        new Buffer.from(config.CLIENT_ID + ":" + config.CLIENT_SECRET).toString("base64"),
    },
    json: true,
  };

  try {
    request.post(authOptions, function (error, response, body) {
      const access_token = body.access_token;
      store.set("access_token", access_token);

      const refreshToken = body.refresh_token;
      store.set("refresh_token", refreshToken);

      if (refreshToken) {
        keytar.setPassword(keytarService, keytarAccount, refreshToken);
      }
    });
  } catch (error) {
    console.log(error);
    await logout();

    throw error;
  }
}

async function logout() {
  await keytar.deletePassword(keytarService, keytarAccount);
  store.delete("access_token");
  store.delete("refresh_token");
}

function getLogOutUrl() {
  return "http://accounts.spotify.com/logout";
}

module.exports = {
  getAuthenticationURL,
  getLogOutUrl,
  loadTokens,
  logout,
  refreshTokens,
};
