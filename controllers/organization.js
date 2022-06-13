const { Types } = require("mongoose");

const ModelReferences = require("../models");
const OrganizationModel = require("../models/organization");

/**
 * Пак методов для организации
 */
module.exports = {
    /**
     * Создание организации
     * (заявка на регистрацию)
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    create: async function (req, res) {
        const {
            title,
            isCommerical,
            address,
            specifications
        } = req.body;

        let organizationData = {
            title,
            isCommerical,
            specifications,
            contactAccountId: req.account._id
        };

        if (address) {
            organizationData.address = address;
        }

        if ((await OrganizationModel.findOne({$or: [{title}, {contactAccountId: req.account._id}]}))) {
            return res.status(400).json({message: "Указанное название организации уже занято"}).end();
        }

        let createdOrganization;
        if (!(createdOrganization = await OrganizationModel.create(organizationData))) {
            return res.status(500).json({message: "Ошибка записи организации в БД"}).end();
        }

        return res.status(200).json({organization: createdOrganization}).end();
    },

    /**
     * Получение подробной информации об организации
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    getInfo: async function (req, res) {
        const {
            organizationId
        } = req.query;

        let foundOrganization;
        if ((foundOrganization = await OrganizationModel.aggregate(
            [
                {
                    $match: {
                        _id: new Types.ObjectId(organizationId), 
                        $or: [
                            {isVerify: true},
                            {contactAccountId: req.account._id}
                        ]
                    }
                },
                {
                    $lookup: {
                        from: ModelReferences.account.name,
                        localField: "contactAccountId",
                        foreignField: "_id",
                        as: "contactAccount", 
                        pipeline: [
                            {
                                $project: {
                                    __v: 0,
                                    accountRoleId: 0,
                                    passwordHash: 0
                                }
                            },
                            {
                                $limit: 1
                            }
                        ]
                    }
                },
                {
                    $unwind: "$contactAccount"
                },
                {
                    $lookup: {
                        from: ModelReferences.specification.name,
                        localField: "specifications",
                        foreignField: "_id",
                        as: "specifications", 
                        pipeline: [
                            {
                                $project: {
                                    __v: 0,
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        __v: 0,
                        contactAccountId: 0
                    }
                }
            ]
        )).length === 0) {
            return res.status(404).json({message: "Организация с указанным ID не найдена"}).end();
        }

        return res.status(200).json({organization: foundOrganization[0]}).end();
    },

    /**
     * Получение списка заявок на регистрацию организации
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    getListNoVerify: async function (req, res) {
        if (
            !req.account.role.isRoot && 
            !req.account.role.isModerator
        ) {
            return res.status(403).json({message: "Ошибка доступа"}).end();
        }

        let foundOrganizations;
        if ((foundOrganizations = await OrganizationModel.aggregate(
            [
                {
                    $match: {
                        isVerify: false
                    }
                },
                {
                    $lookup: {
                        from: ModelReferences.specification.name,
                        localField: "specifications",
                        foreignField: "_id",
                        as: "specifications", 
                        pipeline: [
                            {
                                $project: {
                                    __v: 0,
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        __v: 0,
                        contactAccountId: 0
                    }
                }
            ]
        )).length === 0) {
            return res.status(404).json({message: "Заявок на регистрацию организаций не найдено"}).end();
        }

        return res.status(200).json({organization: foundOrganizations}).end();
    },

    /**
     * Получение списка организаций
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    getList: async function (req, res) {
        let foundOrganizations;
        if ((foundOrganizations = await OrganizationModel.aggregate(
            [
                {
                    $match: {
                        isVerify: true
                    }
                },
                {
                    $lookup: {
                        from: ModelReferences.specification.name,
                        localField: "specifications",
                        foreignField: "_id",
                        as: "specifications", 
                        pipeline: [
                            {
                                $project: {
                                    __v: 0,
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        __v: 0,
                        contactAccountId: 0
                    }
                }
            ]
        )).length === 0) {
            return res.status(404).json({message: "Организаций не найдено"}).end();
        }

        return res.status(200).json({organization: foundOrganizations}).end();
    },

    /**
     * Редактирование организации
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    edit: async function (req, res) {
        const {
            organizationId,
            title,
            isCommerical,
            address,
            specifications
        } = req.body;

        let foundOrganization;
        if (!(foundOrganization = await OrganizationModel.findById(new Types.ObjectId(organizationId)))) {
            return res.status(404).json({message: "Организация с указанным ID не найдена"}).end();
        }

        if (
            !req.account.role.isRoot && 
            !req.account.role.isModerator && 
            foundOrganization.contactAccountId !== req.account._id
        ) {
            return res.status(403).json({message: "Ошибка доступа"}).end();
        }

        let organizationData = {};

        if (title) {
            if (!(await OrganizationModel.findOne({title}))) {
                organizationData.title = title;
            }            
        }

        if (isCommerical) {
            organizationData.isCommerical = isCommerical;
        }

        if (address) {
            organizationData.address = address;
        }
        
        if (specifications) {
            organizationData.specifications = specifications;
        }

        if (!(await foundOrganization.update(organizationData))) {
            return res.status(500).json({message: "Ошибка применения изменений"}).end();
        }

        return res.status(200).end();
    },

    /**
     * Удаление организации
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    remove: async function (req, res) {
        const {
            organizationId
        } = req.query;

        let foundOrganization;
        if (!(foundOrganization = await OrganizationModel.findById(new Types.ObjectId(organizationId)))) {
            return res.status(404).json({message: "Организация с указанным ID не найдена"}).end();
        }

        if (
            !req.account.role.isRoot && 
            !req.account.role.isModerator && 
            foundOrganization.contactAccountId !== req.account._id
        ) {
            return res.status(403).json({message: "Ошибка доступа"}).end();
        }

        if (!(await foundOrganization.delete())) {
            return res.status(500).json({message: "Ошибка удаления организации"}).end();
        }

        return res.status(200).end();
    },

    /**
     * Принятие заявки на регистрацию организации
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    accept: async function (req, res) {
        const {
            organizationId
        } = req.query;

        let foundOrganization;
        if (!(foundOrganization = await OrganizationModel.findById(new Types.ObjectId(organizationId)))) {
            return res.status(404).json({message: "Организация с указанным ID не найдена"}).end();
        }

        if (
            !req.account.role.isRoot && 
            !req.account.role.isModerator
        ) {
            return res.status(403).json({message: "Ошибка доступа"}).end();
        }

        if (foundOrganization.isVerify) {
            return res.status(400).json({message: "Организация уже зарегистрирована"}).end();
        }

        if (!(await foundOrganization.update({isVerify: true}))) {
            return res.status(500).json({message: "Ошибка применения изменений"}).end();
        }

        return res.status(200).end();
    }, 
}