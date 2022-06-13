const Router = require("express").Router;

const ValidatorUtils = require("../utils/validator");
const OrganizationController = require("../controllers/organization");

const AuthMiddleware = require("../middlewares/auth");

/**
 * Роутер системы организаций
 */
module.exports = {
    router: Router(),

    init: function () {
        this.router.post(
            "/create", 
            [
                AuthMiddleware,
                ValidatorUtils.organization.title,
                ValidatorUtils.organization.isCommerical,
                ValidatorUtils.organization.address,
                ValidatorUtils.organization.specifications,
                OrganizationController.create.bind(OrganizationController)
            ]
        );

        console.log(`Метод Организация->создание успешно добавлен`);

        this.router.get(
            "/getInfo", 
            [
                AuthMiddleware,
                ValidatorUtils.organization.organizationId,
                OrganizationController.getInfo.bind(OrganizationController)
            ]
        );

        console.log(`Метод Организация->получние_информации успешно добавлен`);

        this.router.get(
            "/getListNoVerify", 
            [
                AuthMiddleware,
                OrganizationController.getListNoVerify.bind(OrganizationController)
            ]
        );

        console.log(`Метод Организация->получние_списка_заявок_на_регистрацию успешно добавлен`);
        
        this.router.get(
            "/getList", 
            [
                AuthMiddleware,
                OrganizationController.getList.bind(OrganizationController)
            ]
        );
            
        console.log(`Метод Организация->получние_списка успешно добавлен`);

        this.router.patch(
            "/edit", 
            [
                AuthMiddleware,
                ValidatorUtils.organization.organizationId,
                ValidatorUtils.organization.title,
                ValidatorUtils.organization.isCommerical,
                ValidatorUtils.organization.address,
                ValidatorUtils.organization.specifications,
                OrganizationController.edit.bind(OrganizationController)
            ]
        );

        console.log(`Метод Организация->редактирование успешно добавлен`);

        this.router.delete(
            "/remove", 
            [
                AuthMiddleware,
                ValidatorUtils.organization.organizationId,
                OrganizationController.remove.bind(OrganizationController)
            ]
        );

        console.log(`Метод Организация->удаление успешно добавлен`);

        this.router.patch(
            "/accept", 
            [
                AuthMiddleware,
                ValidatorUtils.organization.organizationId,
                OrganizationController.accept.bind(OrganizationController)
            ]
        );

        console.log(`Метод Организация->принятие_заявки_на_регистрацию успешно добавлен`);
    },

    attach: function (app) {
        this.init();
        app.use("/organization", this.router);
    }
}