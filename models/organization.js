const {Schema, Types, model} = require("mongoose");
const { account, specification, organization } = require("./index");

const OrganizationSchema = new Schema (
    {
        contactAccountId: {
            type: Types.ObjectId,
            ref: account.name,
            required: true
        },

        title: {
            type: String,
            required: true
        },

        isCommerical: {
            type: String,
            default: true
        },

        address: {
            type: String
        },

        specifications: [
            {
                type: Types.ObjectId,
                ref: specification.name
            }
        ],

        isVerify: {
            type: Boolean,
            default: false
        }
    }
);

module.exports = model(organization.name, OrganizationSchema);