const cors = require("cors");
const express = require("express");

const StartupArgumentsUtils = require("./utils/startupArguments");

const AccountRouter = require("./routers/account");
const SpecificationRouter = require("./routers/specification");
const OrganizationRouter = require("./routers/organization");
const HelpRequestRouter = require("./routers/helpRequest");

module.exports = {
    app: express(),

    arguments: {
        WEBSERVER_IP: false,
        WEBSERVER_PORT: false
    },

    init: function () {
        for (let key in this.arguments) {
            const argumentValue = StartupArgumentsUtils.getArgument(key);

            if (argumentValue) {
                this.arguments[key] = argumentValue;
            } else {
                throw Error(`Ошибка получения аргумента "${key}"`);
            }
        }

        this.app.use(cors());
        this.app.use(express.json());

        // Подключение роутера "Аккаунт"
        AccountRouter.attach(this.app);
        // Подключение роутера "Направление"
        SpecificationRouter.attach(this.app);
        // Подключение роутера "Организации"
        OrganizationRouter.attach(this.app);
        // Подключение роутера "Заявки на помощь"
        HelpRequestRouter.attach(this.app);
    },

    start: function () {
        this.app.listen(this.arguments.WEBSERVER_PORT, this.arguments.WEBSERVER_IP, () => {
            console.log(`Веб-сервер запущен: http://localhost:${this.arguments.WEBSERVER_PORT}`);
        });
    }
}