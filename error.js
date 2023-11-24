const axios = require("axios");
const { exec } = require("child_process");
const fs = require("fs");

const url = "https://narvaro.ntig.dev/";
const payload = {};
const headers = {};

const displayCommand = "export DISPLAY=:0.0";

const siteOpenFilePath = "/var/www/html/siteOpen.txt";
const serverSiteOpenFilePath = "/var/www/html/serverSiteOpen.txt";

let siteOpen = fs.existsSync(siteOpenFilePath)
  ? fs.readFileSync(siteOpenFilePath, "utf8") === "true"
  : false;

let serverSiteOpen = fs.existsSync(serverSiteOpenFilePath)
  ? fs.readFileSync(serverSiteOpenFilePath, "utf8") === "true"
  : false;

axios
  .post(url, payload, { headers })
  .then((response) => {
    console.log(response.status, siteOpen, serverSiteOpen);
    const errorSite = "192.168.203.143";

    if (response.status != 200 && siteOpen === false) {
      // Opening the site with the export DISPLAY command
      console.log("Opening error site")
      console.log("Status code:", response.status);
      siteOpen = true;
      fs.writeFileSync(siteOpenFilePath, "true");
      siteOpen = false;
      fs.writeFileSync(siteOpenFilePath, "false");

      exec(
        `${displayCommand} && chromium-browser ${errorSite} --kiosk`,
        (error, stdout, stderr) => {
          if (error) {
            console.log(`${error}`);
            return;
          } else {
            console.log(stdout, stderr);
          }
        }
      );
      console.log(errorSite);
    } else if (response.status != 200 && siteOpen === true) {
      console.log("Error site already open");
    } else if (response.status === 200 && serverSiteOpen === false) {
      console.log("Server up and running");
      exec(
        `${displayCommand} && chromium-browser ${url} --kiosk`,
        (error, stdout, stderr) => {
          if (error) {
            console.log(`${error}`);
            return;
          } else {
            console.log(stdout, stderr);
            serverSiteOpen = true;
            fs.writeFileSync(serverSiteOpenFilePath, "true");
            siteOpen = false;
            fs.writeFileSync(siteOpenFilePath, "false");
          }
        }
      );
    }
  })
  .catch((error) => {
    console.log("Error with server");
    if (!siteOpen) {
      // Close existing Chromium instances and open a new one in kiosk mode
      exec(
        `${displayCommand} && killall chromium-browser && chromium-browser 192.168.203.143 --kiosk`,
        (chromiumError, stdout, stderr) => {
          if (chromiumError) {
            console.error(`Error closing/opening Chromium: ${chromiumError}`);
            return;
          }
          console.log("Chromium closed/opened successfully");
          siteOpen = true;
          fs.writeFileSync(siteOpenFilePath, "true");
          serverSiteOpen = false;
          fs.writeFileSync(serverSiteOpenFilePath, "false");
        }
      );
    }
  });
