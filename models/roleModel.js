import { model, Schema } from "mongoose";

// создаем схему,которая описывает то,как будет выглядеть объект в базе данных mongodb,описываем поля
const Role = new Schema({
    value: {type:String,unique:true,default:"USER"}, // указываем,что поле username будет с типом String,уникальным и по дефолту значение у этого поля будет USER
})

export default model('Role',Role); // экспортируем модель,которая будет называться 'Role',и построена на основе нашей схемы Role