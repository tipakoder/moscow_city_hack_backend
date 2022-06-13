const { Types } = require("mongoose");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const StartupArgumentsUtils = require("../utils/startupArguments");

const ModelReferences = require("../models");
const AccountModel = require("../models/account");
const AccountRoleModel = require("../models/accountRole");
const AccountSessionModel = require("../models/accountSession");
const SpecificationModel = require("../models/specification");
const TagModel = require("../models/tag");

/**
 * Методы системы аккаунтов
 */
module.exports = {
    JWT_SECRET_KEY: false,

    /**
     * Генерация новой автризацонной сессии
     * 
     * @param {object} account 
     * @param {Number} expiresIn 
     * @returns 
     */
    generateSession: async function (account, expiresIn = 60 * 60 * 24 * 7 * 4) {
        const responseExpiresIn = Math.floor(Date.now()/1000) + expiresIn;

        // Получение секретного ключа для генерации JWT
        if (!this.JWT_SECRET_KEY) {
            if (!(this.JWT_SECRET_KEY = StartupArgumentsUtils.getArgument("JWT_SECRET_KEY"))) {
                throw Error ("Не указан JWT_SECRET_KEY");
            }
        }

        const createdSession = await AccountSessionModel.create(
            {
                accountId: account._id, 
                expiresIn: responseExpiresIn
            }
        );

        const jwtToken = jwt.sign(
            { sessionId: createdSession._id }, 
            this.JWT_SECRET_KEY, 
            { expiresIn }
        );

        return {
            token: jwtToken,
            expiresIn: responseExpiresIn
        }
    },

    /**
     * Регистрация аккаунтов пользователей
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    register: async function (req, res) {
        const {
            firstName,
            lastName,
            email,
            password
        } = req.body;

        if ((await AccountModel.findOne({email}))) {
            return res.status(400).json({message: "Аккаунт с указанной эл. почтой уже существует"}).end();
        }

        let foundRole;
        if (!(foundRole = await AccountRoleModel.findOne({name: "user"}))) {
            return res.status(404).json({message: "Роль пользователя не найдена"}).end();
        }

        const passwordHash = bcrypt.hashSync(password, 2);

        let createdAccount;
        if (!(createdAccount = await AccountModel.create(
            {
                accountRoleId: foundRole._id, 
                firstName, 
                lastName, 
                email, 
                passwordHash
            }
        ))) {
            return res.status(500).json({message: "Ошибка записи аккаунта в БД"}).end();
        }

        this.generateSession(createdAccount)
            .then((sessionData) => {
                return res.status(200).json(sessionData).end();
            })
            .catch((e) => {
                console.log(`Критическая ошибка генерации сессии: ${e}`);
            });
    },

    /**
     * Авторизация в аккаунт
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    login: async function (req, res) {
        const {
            email,
            password
        } = req.body;

        let foundAccount;
        if (!(foundAccount = await AccountModel.findOne({email}))) {
            return res.status(400).json({message: "Аккаунт с указанным эл. почтой не найден"}).end();
        }

        if (!bcrypt.compareSync(password, foundAccount.passwordHash)) {
            return res.status(403).json({message: "Введённый пароль неверен"}).end();
        }

        this.generateSession(foundAccount)
            .then((sessionData) => {
                return res.status(200).json(sessionData).end();
            })
            .catch((e) => {
                console.log(`Критическая ошибка генерации сессии: ${e}`);
            });
    },

    /**
     * Получение информации об аккаунте
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    getInfo: async function (req, res) {
        return res.status(200).json({account: req.account, organization: req.accountOrganization}).end();
    },

    /**
     * Редактирование аккаунта
     * 
     * @param {object} req 
     * @param {object} res 
     * @returns 
     */
    edit: async function (req, res) {
        const {
            firstName,
            lastName,
            email,
            specifications,
            dateBorn,
            freeTime,
            phone
        } = req.body;

        let newAccountData = {};

        if (firstName) {
            newAccountData.firstName = firstName;
        }

        if (lastName) {
            newAccountData.lastName = lastName;
        }

        if (email) {
            if (!(await AccountModel.findOne({email}))) {
                newAccountData.email = email;
            }
        }

        if (specifications) {
            if (Array.isArray(specifications) && specifications.length > 0) {
                newAccountData.specifications = [];

                for (let specificationId of specifications) {
                    if (!(await SpecificationModel.findById(new Types.ObjectId(specificationId)))) {
                        continue;
                    }

                    newAccountData.specifications.push(specificationId);
                }
            }
        }

        if (dateBorn) {
            newAccountData.dateBorn = new Date(dateBorn);
        }

        if (freeTime) {
            newAccountData.freeTime = {
                from: freeTime.from,
                to: freeTime.to,
            }
        }

        if (phone) {
            newAccountData.phone = phone;
        }

        if (!(await AccountModel.findByIdAndUpdate(req.account._id, newAccountData))) {
            return res.status(500).json({message: "Ошибка записи изменений в БД"});
        }

        return res.status(200).end();
    },

    /**
     * Получение подробной информации об аккаунте
     * по ID аккаунта
     * 
     * @param {object} req 
     * @param {object} res
     * @returns 
     */
    getInfoById: async function (req, res) {
        const {
            accountId
        } = req.query;

        if (!req.account.role.isRoot && !req.account.role.isModerator && !req.account.role) {
            return res.status(403).json({message: "У Вас недостаточно прав на просмотра информации о чужом профиле"});
        }

        let foundAccount;
        if ((foundAccount = await AccountModel.aggregate(
            [
                {
                    $match: {
                        _id: new Types.ObjectId(accountId)
                    }
                },
                {
                    $project: {
                        passwordHash: 0,
                        __v: 0
                    }
                },
                {
                    $lookup: {
                        from: ModelReferences.accountRole.name,
                        localField: "accountRoleId",
                        foreignField: "_id",
                        pipeline: [
                            {
                                $project: {
                                    __v: 0
                                }
                            },
                            {
                                $limit: 1
                            }
                        ],
                        as: "role"
                    }
                },
                {
                    $unwind: "$role"
                },
                {
                    $limit: 1
                }
            ]
        )).length === 0) {
            return res.status(404).json({message: "Аккаунта с указанным ID не существует!"}).end();
        }

        return res.status(200).json({account: foundAccount[0]}).end();
    }
}