
import {model, Schema} from 'mongoose'; // импортируем schema и model,для описани модели в базе данных mongodb(в данном случае импортируем вручную,потому что автоматически не работает)


// создаем schema(схему),она описывает какие поля будет содержать сущность(в данном случае пользователя) в базе данных mongodb,указываем поле email с типом String,указываем,что оно будет уникальное(unique:true),то есть одинаковых таких записей в базе данных быть не должно,и указываем,что оно должно быть обязательным(required:true),также указываем другие поля password,isActivated(для того,чтобы узнать,подтвердил пользователь почту или нет,указываем ему тип Boolean и значение по дефолту false(default:false)),activationLink(в нем будем хранить ссылку для активации)
const UserSchema = new Schema({
    email:{type:String,unique:true,required:true},
    password:{type:String,required:true},
    isActivated:{type:Boolean,default:false},
    activationLink:{type:String},
    userName:{type:String,required:true},
    roles:[{type:String,ref:'Role'}] // указываем полю roles массив,чтобы пользователь обладал массивом каких-то ролей,указываем в объекте поле ref название файла сущности(или название модели сущности,которую создали и экспортировали для базы данных) (другой схемы,в данном случае для ролей) и указываем ссылку на другую сущность
})

export default model('User',UserSchema); // экспортируем модель,которая будет называться 'User'(указываем это первым параметром),и построена на основе нашей схемы UserSchema(передаем ее вторым параметром)