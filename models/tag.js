const {Schema, Types, model} = require("mongoose");
const { tag } = require("./index");

const TagSchema = new Schema (
    {
        name: {
            type: String,
            required: true,
            unique: true
        }
    }
);

module.exports = model(tag.name, TagSchema);