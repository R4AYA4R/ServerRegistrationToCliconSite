import ApiError from "../exceptions/ApiError.js";
import userModel from "../models/userModel.js";

import bcrypt from 'bcrypt'; // импортируем bcrypt для хеширования пароля(в данном случае импортируем вручную)

import * as uuid from 'uuid'; // импортируем все(*) под названием uuid из модуля uuid 

// создаем класс UserService для сервиса пользователей(их удаление,добавление и тд)
class UserService{
    // функция регистрации,принимает в параметрах email и password(которые мы будем получить в теле запроса)
    async registration(email,password){
        const candidate = await userModel.findOne({email}); // ищем в базе данных пользователя с таким же email с помощью функции findOne() у нашей UserModel,передаем в параметре объект и поле email(по этому полю будет осуществляться поиск) и помещаем результат функции findOne(true или false,в зависимости,найден ли такой объект с таким же значением в поле email) в переменную candidate

        // если candidate true,то есть такой пользователь с таким email уже есть в базе данных
        if(candidate){
            throw ApiError.BadRequest(`Пользователь с адресом ${email} уже существует`);  // вместо throw new Error указываем throw ApiError(наш класс для обработки ошибок),указываем у него функцию BadRequest,то есть показываем ошибку с сообщением
        }

        const hashPassword = await bcrypt.hash(password,3);  // хешируем пароль с помощью функции hash() у bcrypt,первым параметром передаем пароль,а вторым - соль,степень хеширования(чем больше - тем лучше захешируется,но не нужно слишком большое число,иначе будет долго хешироваться пароль)

        const activationLink = uuid.v4(); // вызываем v4() - возвращает рандомную уникальную строку,у uuid,и помещаем это значение в переменную activationLink,делаем эту строку,чтобы пользователь потом подтверждал аккаунт,что эта почта пренадлежит ему

        const user = await userModel.create({email,password:hashPassword,activationLink}); // создаем объект с полями email и password в базу данных и помещаем этот объект в переменную user,в поле password помещаем значение из переменной hashPassword,то есть уже захешированный пароль,и указываем в объекте еще поле activationLink

    }
}

export default new UserService(); // экспортируем уже объект на основе нашего класса UserService