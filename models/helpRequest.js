const {Schema, model, Types} = require("mongoose");
const { account, specification, helpRequest } = require("./index");

const HelpRequestSchema = new Schema (
    {
        authorAccountId: {
            type: Types.ObjectId,
            ref: account.name,
            required: true
        },

        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        dateTime: {
            from: {
                type: Date,
            },
            to: {
                type: Date,
            }
        },

        address: {
            type: String,
            required: true
        },

        specificationIds: [
            {
                type: Types.ObjectId,
                ref: specification.name
            }
        ],

        isOnline: {
            type: Boolean,
            default: true
        },

        ageCategory: {
            from: {
                type: Number,
                default: 18
            },
            to: {
                type: Number,
                default: 30
            }
        },

        additionalSkills: [
            {
                type: String
            }
        ],

        /**
         * Индикатор "На рассмотрении"
         */
        isVerify: {
            type: Boolean,
            default: false
        },
    }
);

module.exports = model(helpRequest.name, HelpRequestSchema);