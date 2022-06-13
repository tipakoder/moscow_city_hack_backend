const { check } = require("express-validator");

/**
 * Модуль валидации
 */
module.exports = {
    /**
     * Проверки полей для системы аккаунта
     */
    account: {
        accountId: check("accountId")
            .exists()
            .notEmpty()
            .isMongoId(),
        firstName: check("firstName")
            .exists()
            .notEmpty()
            .isString()
            .trim()
            .notEmpty()
            .isLength({min: 3, max: 40}),
        lastName: check("lastName")
            .exists()
            .notEmpty()
            .isString()
            .trim()
            .notEmpty()
            .isLength({min: 3, max: 40}),
        specifications: check("specifications")
            .exists()
            .notEmpty()
            .isArray(),
        dateBorn: check("dateBorn")
            .exists()
            .notEmpty()
            .isDate(),
        freeTime: check("freeTime")
            .exists()
            .notEmpty()
            .isObject(),
        phone: check("phone")
            .exists()
            .notEmpty()
            .isString(),
        email: check("email")
            .exists()
            .notEmpty()
            .isString()
            .trim()
            .notEmpty()
            .isEmail(),
        password: check("password")
            .exists()
            .notEmpty()
            .isString()
            .trim()
            .notEmpty()
            .isLength({min: 6, max: 25}) 
    },

    /**
     * Проверки для параметров спецификаций
     */
    specification: {
        specificationId: check("specificationId")
            .exists()
            .notEmpty()
            .isMongoId(),
        name: check("name")
            .exists()
            .notEmpty()
            .isString()
            .isLength({min: 1, max: 60}),
    },

    /**
     * Проверки для параметров спецификаций
     */
    organization: {
        organizationId: check("organizationId")
            .exists()
            .notEmpty()
            .isMongoId(),
        title: check("title")
            .exists()
            .notEmpty()
            .isString()
            .isLength({min: 1, max: 80}),
        isCommerical: check("isCommerical")
            .exists()
            .notEmpty()
            .isBoolean(),
        address: check("address")
            .exists()
            .notEmpty()
            .isString()
            .isLength({min: 1, max: 120}),
        specifications: check("specifications")
            .exists()
            .notEmpty()
            .isArray()
    },

    /**
     * Проверки для параметров заявки на помощь
     */
    helpRequest: {
        helpRequestId: check("helpRequestId")
            .notEmpty()
            .isMongoId(),
        title: check("title")
            .notEmpty()
            .isLength({min: 1, max: 60}),
        description: check("description")
            .notEmpty()
            .isLength({min: 0, max: 300}),
        dateTime: check("dateTime")
            .notEmpty()
            .isDate(),
        address: check("address")
            .notEmpty()
            .isLength({min: 1, max: 120}),
        specificationIds: check("specificationIds")
            .notEmpty()
            .isArray(),
        isOnline: check("isOnline")
            .notEmpty()
            .isBoolean(),
        ageCategory: check("ageCategory")
            .notEmpty()
            .isObject(),
        additionalSkills: check("additionalSkills")
            .notEmpty()
            .isArray(),
        isPassive: check("isPassive")
            .notEmpty()
            .isBoolean(),
    }
}