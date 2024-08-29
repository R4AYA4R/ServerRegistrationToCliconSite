import ApiError from "../exceptions/ApiError.js";
import userModel from "../models/userModel.js";

import bcrypt from 'bcrypt'; // импортируем bcrypt для хеширования пароля(в данном случае импортируем вручную)

import * as uuid from 'uuid'; // импортируем все(*) под названием uuid из модуля uuid 
import mailService from "./mailService.js";
import UserDto from "../dtos/userDto.js";
import tokenService from "./tokenService.js";

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

        await mailService.sendActivationMail(email,`${process.env.API_URL}/api/activate/${activationLink}`); // вызываем нашу функцию sendActivationMail для отправки письма на почту,передаем в параметре email,куда надо отправить сообщение и вторым параметром указываем url(ссылку,по которой пользователь перейдет,которая будет отправлена ему по почте(это мы описали в функции sendActivationMail),чтобы активировать аккаунт),указываем в этом url в начале путь до названия сайта(в данном случае это будет http://localhost:5000,мы вынесли это в переменную окружения),потом указываем эндпоинт /api по которому будет работать наш router,потом эндпоинт /activate(отдельный эндпоинт для активации аккаунта по ссылке) и потом саму ссылку,которая была сгенерирована рандомно выше с помощью uuid,нужно сделать двухэтапную аутентификацию у аккаунта,с которого нужно отправлять письма по gmail,и создать пароль для сторонних приложений и его вставить вместо пароля от аккаунта(в данном случае вместо SMTP_PASSWORD в нашем файле .env),с которого нужно отправлять письма по gmail,иначе выдает ошибку и письма не отправляются

        const userDto = new UserDto(user); // помещаем в переменную userDto объект,созданный на основе нашего класса UserDto и передаем в параметре конструктора модель(в данном случае объект user,который мы создали в базе данных,в коде выше),в итоге переменная userDto(объект) будет обладать полями id,email,isActivated,которую можем передать как payload(данные,которые будут помещены в токен) в токене

        const tokens = tokenService.generateTokens({...userDto}); // помещаем в переменную tokens пару токенов,refresh и access токены,которые создались в нашей функции generateTokens(),передаем в параметре payload(данные,которые будут спрятаны в токен),в данном случае передаем в параметре объект,куда разворачиваем все поля объекта userDto

        await tokenService.saveToken(userDto.id,tokens.refreshToken); // сохраняем refresh токен в базу данных,используя нашу функцию saveToken,передаем в параметрах userDto.id(id пользователя,который создали в базе данных) и refreshToken,который мы сгенерировали выше и поместили в объект tokens

        // возвращаем все поля объекта tokens(то есть access и refresh токены),и в поле user указываем значение userDto
        return{
            ...tokens,
            user:userDto
        }

    }
}

export default new UserService(); // экспортируем уже объект на основе нашего класса UserService