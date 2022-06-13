require("dotenv").config();

const StartupArgumentsUtils = require("./utils/startupArguments");

const WebServer = require("./webServer");
const ConnectDatabase = require("./database/connect");
const PresetsDatabase = require("./database/presets");

ConnectDatabase.init();
ConnectDatabase.connect(() => {
    if (StartupArgumentsUtils.getArgument("databaseReset")) {
        PresetsDatabase();
    }

    WebServer.init();
    WebServer.start();
});