import { Schema } from "mongoose";


// создаем schema(схему),она описывает какие поля будет содержать сущность(в данном случае токена) в базе данных mongodb,указываем поле user и refreshToken,указываем полю user(в нем мы будем хранить ссылку на пользователя) тип Schema.Types.ObjectId и указываем ему,что оно будет ссылаться на нашу модель с названием 'User'(ref:'User'),чтобы связать эту модель токена 'Token' с моделью User 'User'
const TokenSchema = new Schema({
    user:{type:Schema.Types.ObjectId,ref:'User'},
    refreshToken:{type:String,required:true}
})

export default model('Token',TokenSchema);  // экспортируем модель,которая будет называться 'Token'(указываем это первым параметром),и построена на основе нашей схемы TokenSchema(передаем ее вторым параметром)