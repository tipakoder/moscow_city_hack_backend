const {Schema, Types, model} = require("mongoose");
const { account, accountRole, specification } = require("./index");

const AccountSchema = new Schema (
    {
        accountRoleId: {
            type: Types.ObjectId,
            ref: accountRole.name,
            required: true
        },

        firstName: {
            type: String,
            required: true
        },

        lastName: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true
        },

        passwordHash: {
            type: String,
            required: true
        },

        specificationIds: [
            {
                type: Types.ObjectId,
                ref: specification.name
            }
        ],

        dateBorn: {
            type: Date
        },

        freeTime: {
            from: {
                type: String
            },

            to: {
                type: String
            }
        },

        phone: {
            type: String
        },
    }
);

module.exports = model(account.name, AccountSchema);