const Router = require("express").Router;

const ValidatorUtils = require("../utils/validator");
const SpecificationController = require("../controllers/specification");

const AuthMiddleware = require("../middlewares/auth");

/**
 * Роутер системы направлений
 */
module.exports = {
    router: Router(),

    init: function () {
        this.router.post(
            "/create", 
            [
                AuthMiddleware,
                ValidatorUtils.specification.name,
                SpecificationController.create.bind(SpecificationController)
            ]
        );

        console.log(`Метод Направление->создание успешно добавлен`);

        this.router.get(
            "/getList", 
            [
                AuthMiddleware,
                SpecificationController.getList.bind(SpecificationController)
            ]
        );

        console.log(`Метод Направление->получение_списка успешно добавлен`);

        this.router.patch(
            "/edit", 
            [
                AuthMiddleware,
                ValidatorUtils.specification.specificationId,
                ValidatorUtils.specification.name,
                SpecificationController.edit.bind(SpecificationController)
            ]
        );

        console.log(`Метод Направление->редактирование успешно добавлен`);

        this.router.delete(
            "/remove", 
            [
                AuthMiddleware,
                ValidatorUtils.specification.specificationId,
                SpecificationController.remove.bind(SpecificationController)
            ]
        );

        console.log(`Метод Направление->удаление успешно добавлен`);
    },

    attach: function (app) {
        this.init();
        app.use("/specification", this.router);
    }
}