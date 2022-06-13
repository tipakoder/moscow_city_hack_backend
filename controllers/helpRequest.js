const { Types, SchemaTypeOptions } = require("mongoose");

const ModelReferences = require("../models");
const HelpRequestModel = require("../models/helpRequest");
const OrganizationModel = require("../models/organization");

/**
 * Пак методов для заявок на регистрацию 
 */
module.exports = {
    /**
     * Создание задачи
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    create: async function (req, res) {
        const {
            title,
            description,
            dateTime,
            address,
            specificationIds,
            isOnline,
            ageCategory,
            additionalSkills
        } = req.body;

        const isVerify = (await OrganizationModel.findOne({contactAccountId: req.account._id})) ? true : false;

        if (!req.account.role.isUser) {
            return res.status(403).json({message: "Ошибка доступа"}).end();
        }

        console.log({
            from: new Date(dateTime.from),
            to: new Date(dateTime.to),
        });

        let createdHelpRequest;
        if (!(createdHelpRequest = await HelpRequestModel.create(
            {
                title,
                description,
                dateTime: {
                    from: new Date(dateTime.from),
                    to: new Date(dateTime.to),
                },
                address,
                specificationIds,
                isOnline,
                ageCategory,
                additionalSkills,
                isVerify,
                authorAccountId: req.account._id
            }
        ))) {
            return res.status(500).json({message: "Ошибка записи заявки в БД"}).end();
        }

        return res.status(200).json({helpRequest: createdHelpRequest}).end();
    },

    /**
     * Редактирование задачи
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    edit: async function (req, res) {
        const {
            helpRequestId,
            title,
            description,
            dateTime,
            address,
            specificationIds,
            isOnline,
            ageCategory,
            additionalSkills
        } = req.body;

        let foundHelpRequest;
        if (!(foundHelpRequest = await HelpRequestModel.findById(new Types.ObjectId(helpRequestId)))) {
            return res.status(404).json({message: "Заявка на помощь с указанным ID не найдена"}).end();
        }

        if (
            !req.account.role.isUser &&
            foundHelpRequest.authorAccountId.toString() !== req.account._id.toString()
        ) {
            return res.status(403).json({message: "Ошибка доступа"}).end();
        }

        let helpRequestData = {};
        
        if (title) {
            helpRequestData.title = title;
        }

        if (description) {
            helpRequestData.description = description;
        }

        if (dateTime) {
            helpRequestData.dateTime = dateTime;
        }

        if (address) {
            helpRequestData.address = address;
        }

        if (specificationIds) {
            helpRequestData.specificationIds = specificationIds;
        }

        if (isOnline) {
            helpRequestData.isOnline = isOnline;
        }

        if (ageCategory) {
            helpRequestData.ageCategory = ageCategory;
        }

        if (additionalSkills) {
            helpRequestData.additionalSkills = additionalSkills;
        }

        if (Object.keys(helpRequestData).length === 0) {
            return res.status(400).json({message: "Нет полей к изменению"}).end();
        }

        if (!(await foundHelpRequest.update(helpRequestData))) {
            return res.status(500).json({message: "Ошибка приминения изменений"}).end();
        }

        return res.status(200).end();
    },

    /**
     * Получение подробной информации о заявке
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    getInfo: async function (req, res) {
        const {
            helpRequestId
        } = req.query;

        let foundHelpRequest;
        if ((foundHelpRequest = await HelpRequestModel.aggregate(
            [
                {
                    $match: {
                        _id: new Types.ObjectId(helpRequestId),
                    }
                },
                {
                    $lookup: {
                        from: ModelReferences.account.name,
                        localField: "authorAccountId",
                        foreignField: "_id",
                        as: "contactAccount",
                        pipeline: [
                            {
                                $project: {
                                    __v: 0,
                                    phone: 0,
                                    dateBorn: 0,
                                    passwordHash: 0,
                                }
                            },  
                            {
                                $limit: 1
                            }
                        ]
                    }
                },
                {
                    $unwind: "$authorAccount"
                },
                {
                    $lookup: {
                        from: ModelReferences.account.name,
                        localField: "specificationIds",
                        foreignField: "_id",
                        as: "specifiations",
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
                    }
                },
                {
                    $limit: 1
                }
            ]
        )).length === 0) {
            return res.status(404).json({message: "Заявка на помощь с указанным ID не найдена"}).end();
        }

        return res.status(200).json({helpRequest: foundHelpRequest[0]}).end();
    },

    /**
     * Получение списка задач
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    getList: async function (req, res) {
        let foundHelpRequests;
        if ((foundHelpRequests = await HelpRequestModel.aggregate(
            [
                {
                    $match: {
                        isVerify: true
                    }
                },
                {
                    $project: {
                        __v: 0,
                        authorAccountId: 0
                    }
                }
            ]
        )).length === 0) {
            return res.status(404).json({message: "Не надено ни одной задачи"}).end();
        }

        return res.status(200).json({helpRequests: foundHelpRequests}).end();
    },

    /**
     * Получение списка своих задач
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
     getListMine: async function (req, res) {
        let foundHelpRequests;
        if ((foundHelpRequests = await HelpRequestModel.aggregate(
            [
                {
                    $match: {
                        authorAccountId: req.account._id
                    }
                },
                {
                    $project: {
                        __v: 0,
                        authorAccountId: 0
                    }
                }
            ]
        )).length === 0) {
            return res.status(404).json({message: "Не надено ни одной задачи"}).end();
        }

        return res.status(200).json({helpRequests: foundHelpRequests}).end();
    },

    /**
     * Получение списка заявок на размещения просьбы о помощи
     * 
     * @param {object} req 
     * @param {object} res 
     * @return
     */
    getListNoVerify: async function (req, res) {
        if (!req.account.role.isRoot && !req.account.role.isModerator) {
            return res.status(403).json({message: "Ошибка доступа"}).end();
        }

        let foundHelpRequests;
        if ((foundHelpRequests = await HelpRequestModel.aggregate(
            [
                {
                    $match: {
                        isVerify: false
                    }
                },
                {
                    $project: {
                        __v: 0,
                        authorAccountId: 0
                    }
                }
            ]
        )).length === 0) {
            return res.status(404).json({message: "Не надено ни одной заявки на рассмотрении"}).end();
        }

        return res.status(200).json({helpRequests: foundHelpRequests}).end();
    },

    /**
     * Одобрение заявки на помощь
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    accept: async function (req, res) {
        const {
            helpRequestId
        } = req.query;

        if (!req.account.role.isRoot && !req.account.role.isModerator) {
            return res.status(403).json({message: "Ошибка доступа"}).end();
        }

        let foundHelpRequest;
        if (!(foundHelpRequest = await HelpRequestModel.findById(new Types.ObjectId(helpRequestId)))) {
            return res.status(404).json({message: "Заявка на помощь с указанным ID не найдена"}).end();
        }

        if (foundHelpRequest.isVerify) {
            return res.status(400).json({message: "Заявка на помощь уже зарегистрирована"}).end();
        }

        if ((await foundHelpRequest.update({isVerify: true}))) {
            return res.status(500).json({message: "Ошибка приминения изменений"}).end();
        }

        return res.status(200).end();
    },

    /**
     * Удаление заявки на помощь
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    remove: async function (req, res) {
        const {
            helpRequestId
        } = req.query;

        let foundHelpRequest;
        if (!(foundHelpRequest = await HelpRequestModel.findById(new Types.ObjectId(helpRequestId)))) {
            return res.status(404).json({message: "Заявка на помощь с указанным ID не найдена"}).end();
        }

        console.log(foundHelpRequest.authorAccountId.toString(), req.account._id.toString());

        if (
            !req.account.role.isRoot &&
            !req.account.role.isModerator  &&
            foundHelpRequest.authorAccountId.toString() !== req.account._id.toString()
        ) {
            return res.status(403).json({message: "Ошибка доступа"}).end();
        }

        if ((await foundHelpRequest.delete())) {
            return res.status(500).json({message: "Ошибка удаления заявки из БД"}).end();
        }

        return res.status(200).end();
    }
}