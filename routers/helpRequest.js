const Router = require("express").Router;

const ValidatorUtils = require("../utils/validator");
const HelpRequestController = require("../controllers/helpRequest");

const AuthMiddleware = require("../middlewares/auth");

/**
 * Роутер системы заявок на помощь
 */
module.exports = {
    router: Router(),

    init: function () {
        this.router.post(
            "/create", 
            [
                AuthMiddleware,
                ValidatorUtils.helpRequest.title,
                ValidatorUtils.helpRequest.description,
                ValidatorUtils.helpRequest.dateTime,
                ValidatorUtils.helpRequest.address,
                ValidatorUtils.helpRequest.specificationIds,
                ValidatorUtils.helpRequest.isOnline,
                ValidatorUtils.helpRequest.ageCategory,
                ValidatorUtils.helpRequest.additionalSkills,
                ValidatorUtils.helpRequest.isPassive,
                HelpRequestController.create.bind(HelpRequestController)
            ]
        );

        console.log(`Метод Заявка_на_помощь->создание успешно добавлен`);

        this.router.patch(
            "/edit", 
            [
                AuthMiddleware,
                ValidatorUtils.helpRequest.helpRequestId,
                ValidatorUtils.helpRequest.title,
                ValidatorUtils.helpRequest.description,
                ValidatorUtils.helpRequest.dateTime,
                ValidatorUtils.helpRequest.address,
                ValidatorUtils.helpRequest.specificationIds,
                ValidatorUtils.helpRequest.isOnline,
                ValidatorUtils.helpRequest.ageCategory,
                ValidatorUtils.helpRequest.additionalSkills,
                ValidatorUtils.helpRequest.isPassive,
                HelpRequestController.edit.bind(HelpRequestController)
            ]
        );

        console.log(`Метод Заявка_на_помощь->редактирование успешно добавлен`);

        this.router.get(
            "/getInfo", 
            [
                AuthMiddleware,
                ValidatorUtils.helpRequest.helpRequestId,
                HelpRequestController.getInfo.bind(HelpRequestController)
            ]
        );

        console.log(`Метод Заявка_на_помощь->получение_подробной_информации успешно добавлен`);

        this.router.get(
            "/getList", 
            [
                HelpRequestController.getList.bind(HelpRequestController)
            ]
        );

        console.log(`Метод Заявка_на_помощь->получение_списка успешно добавлен`);

        this.router.get(
            "/getListMine", 
            [
                AuthMiddleware,
                HelpRequestController.getListMine.bind(HelpRequestController)
            ]
        );

        console.log(`Метод Заявка_на_помощь->получение_списка_своих_заявок успешно добавлен`);

        this.router.get(
            "/getListNoVerify", 
            [
                AuthMiddleware,
                HelpRequestController.getListNoVerify.bind(HelpRequestController)
            ]
        );

        console.log(`Метод Заявка_на_помощь->получение_списка_на_рассмотрении успешно добавлен`);

        this.router.patch(
            "/accept", 
            [
                AuthMiddleware,
                ValidatorUtils.helpRequest.helpRequestId,
                HelpRequestController.accept.bind(HelpRequestController)
            ]
        );

        console.log(`Метод Заявка_на_помощь->одобрение успешно добавлен`);

        this.router.delete(
            "/remove", 
            [
                AuthMiddleware,
                ValidatorUtils.helpRequest.helpRequestId,
                HelpRequestController.remove.bind(HelpRequestController)
            ]
        );

        console.log(`Метод Заявка_на_помощь->удаление успешно добавлен`);
    },

    attach: function (app) {
        this.init();
        app.use("/helpRequest", this.router);
    }
}