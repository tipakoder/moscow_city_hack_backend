const Router = require("express").Router;

const ValidatorUtils = require("../utils/validator");
const AccountController = require("../controllers/account");

const AuthMiddleware = require("../middlewares/auth");

/**
 * Роутер системы аккаунтов
 */
module.exports = {
    router: Router(),

    init: function () {
        this.router.post(
            "/register", 
            [
                ValidatorUtils.account.firstName,
                ValidatorUtils.account.lastName,
                ValidatorUtils.account.email,
                ValidatorUtils.account.password,
                AccountController.register.bind(AccountController)
            ]
        );

        console.log(`Метод Аккаунт->регистрация успешно добавлен`);

        this.router.post(
            "/login", 
            [
                ValidatorUtils.account.email,
                ValidatorUtils.account.password,
                AccountController.login.bind(AccountController)
            ]
        );

        console.log(`Метод Аккаунт->авторизация успешно добавлен`);

        this.router.get(
            "/getInfo", 
            [
                AuthMiddleware,
                AccountController.getInfo.bind(AccountController)
            ]
        );

        console.log(`Метод Аккаунт->получение_информации успешно добавлен`);

        this.router.patch(
            "/edit", 
            [
                AuthMiddleware,
                ValidatorUtils.account.firstName,
                ValidatorUtils.account.lastName,
                ValidatorUtils.account.email,
                ValidatorUtils.account.specifications,
                ValidatorUtils.account.dateBorn,
                ValidatorUtils.account.freeTime,
                ValidatorUtils.account.phone,
                AccountController.edit.bind(AccountController)
            ]
        );

        console.log(`Метод Аккаунт->редактирование успешно добавлен`);

        this.router.get(
            "/getInfoById", 
            [
                AuthMiddleware,
                AccountController.getInfoById.bind(AccountController)
            ]
        );

        console.log(`Метод Аккаунт->получение_информации_по_ID успешно добавлен`);
    },

    attach: function (app) {
        this.init();
        app.use("/account", this.router);
    }
}