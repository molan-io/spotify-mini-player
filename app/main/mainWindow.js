const { app, BrowserWindow, Tray, Menu } = require("electron");
const path = require("path");
const windowStateKeeper = require("electron-window-state");

let win = null;
let tray = null;

function createAppWindow() {
  let mainWindowState = windowStateKeeper({
    defaultWidth: 324,
    defaultHeight: 116,
  });

  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: 324,
    height: 116,
    frame: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    resizable: false,
    transparent: true,
    icon: path.join(__dirname, "../resources", "play.png"),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });
  mainWindowState.manage(win);
  win.loadFile(path.join(__dirname, "../html", "index.html"));

  tray = createTray();

  win.on("minimize", function (event) {
    event.preventDefault();
    win.minimize();
  });

  win.on("restore", function (event) {
    win.show();
  });

  win.on("closed", () => {
    win = null;
  });
}

function createTray() {
  let appIcon = new Tray(path.join(__dirname, "../resources", "play.png"));
  const contextMenu = Menu.buildFromTemplate([
    //TODO: Implement dark mode toggle on tray actions
    {
      label: "Show",
      click: function () {
        win.show();
      },
    },
    {
      label: "Exit",
      click: function () {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  appIcon.on("double-click", function (event) {
    win.show();
  });

  appIcon.on("click", function (event) {
    win.show();
  });

  appIcon.setToolTip("Spotify Mini Player");
  appIcon.setContextMenu(contextMenu);
  return appIcon;
}

module.exports = createAppWindow;
