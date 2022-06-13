const {Schema, Types, model} = require("mongoose");
const { specification } = require("./index");

const SpecificationSchema = new Schema (
    {
        name: {
            type: String,
            required: true,
            unique: true
        }
    }
);

module.exports = model(specification.name, SpecificationSchema);