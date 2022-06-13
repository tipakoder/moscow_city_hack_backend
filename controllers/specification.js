const { Types } = require("mongoose");

const SpecificationModel = require("../models/specification");

/**
 * Пак методов для направлений организаций
 */
module.exports = {
    /**
     * Создание направления
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    create: async function (req, res) {
        const {
            name
        } = req.body;

        if (!req.account.role.isRoot && !req.account.role.isModerator) {
            return res.status(403).json({message: "Ошибка доступа"}).end();
        }

        if ((await SpecificationModel.findOne({name}))) {
            return res.status(400).json({message: "Направление с указанным именем уже существует"}).end();
        }

        let createdSpecification;
        if (!(createdSpecification = await SpecificationModel.create({name}))) {
            return res.status(500).json({message: "Ошибка добавления направления в БД"}).end();
        }

        return res.status(200).json({specificationId: createdSpecification._id}).end();
    },

    /**
     * Получение списка направлений
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    getList: async function (req, res) {
        let foundSpecifications;
        if (!(foundSpecifications = await SpecificationModel.find())) {
            return res.status(404).json({message: "Спецификации отсутствуют"}).end();
        }

        return res.status(200).json({specifications: foundSpecifications}).end();
    },

    /**
     * Редактирование направления
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    edit: async function (req, res) {
        const {
            specificationId,
            name
        } = req.body;

        if (!req.account.role.isRoot && !req.account.role.isModerator) {
            return res.status(403).json({message: "Ошибка доступа"}).end();
        }

        if ((await SpecificationModel.findOne({name}))) {
            return res.status(400).json({message: "Направление с указанным именем уже существует"}).end();
        }

        let foundSpecification;
        if (!(foundSpecification = await SpecificationModel.findById(new Types.ObjectId(specificationId)))) {
            return res.status(400).json({message: "Направления с указанным ID не существует"}).end();
        }

        if (!(await foundSpecification.update({name}))) {
            return res.status(500).json({message: "Ошибка приминения изменений в БД"}).end();
        }

        return res.status(200).end();
    },

    /**
     * Удаление направления
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    remove: async function (req, res) {
        const {
            specificationId
        } = req.query;

        if (!req.account.role.isRoot && !req.account.role.isModerator) {
            return res.status(403).json({message: "Ошибка доступа"}).end();
        }

        let foundSpecification;
        if (!(foundSpecification = await SpecificationModel.findById(new Types.ObjectId(specificationId)))) {
            return res.status(400).json({message: "Направления с указанным ID не существует"}).end();
        }

        if (!(await foundSpecification.delete())) {
            return res.status(500).json({message: "Ошибка удаления направления из БД"}).end();
        }

        return res.status(200).end();
    }
}