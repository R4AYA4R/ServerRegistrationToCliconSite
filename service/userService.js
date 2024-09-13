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
    async registration(email,password,userName){
        const candidate = await userModel.findOne({email}); // ищем в базе данных пользователя с таким же email с помощью функции findOne() у нашей UserModel,передаем в параметре объект и поле email(по этому полю будет осуществляться поиск) и помещаем результат функции findOne(true или false,в зависимости,найден ли такой объект с таким же значением в поле email) в переменную candidate

        // если candidate true,то есть такой пользователь с таким email уже есть в базе данных
        if(candidate){
            throw ApiError.BadRequest(`Пользователь с адресом ${email} уже существует`);  // вместо throw new Error указываем throw ApiError(наш класс для обработки ошибок),указываем у него функцию BadRequest,то есть показываем ошибку с сообщением
        }

        const hashPassword = await bcrypt.hash(password,3);  // хешируем пароль с помощью функции hash() у bcrypt,первым параметром передаем пароль,а вторым - соль,степень хеширования(чем больше - тем лучше захешируется,но не нужно слишком большое число,иначе будет долго хешироваться пароль)

        const activationLink = uuid.v4(); // вызываем v4() - возвращает рандомную уникальную строку,у uuid,и помещаем это значение в переменную activationLink,делаем эту строку,чтобы пользователь потом подтверждал аккаунт,что эта почта пренадлежит ему

        const user = await userModel.create({email,password:hashPassword,activationLink,userName}); // создаем объект с полями email и password в базу данных и помещаем этот объект в переменную user,в поле password помещаем значение из переменной hashPassword,то есть уже захешированный пароль,и указываем в объекте еще поле activationLink

        // await mailService.sendActivationMail(email,`${process.env.API_URL}/api/activate/${activationLink}`); // вызываем нашу функцию sendActivationMail для отправки письма на почту,передаем в параметре email,куда надо отправить сообщение и вторым параметром указываем url(ссылку,по которой пользователь перейдет,которая будет отправлена ему по почте(это мы описали в функции sendActivationMail),чтобы активировать аккаунт),указываем в этом url в начале путь до названия сайта(в данном случае это будет http://localhost:5000,мы вынесли это в переменную окружения),потом указываем эндпоинт /api по которому будет работать наш router,потом эндпоинт /activate(отдельный эндпоинт для активации аккаунта по ссылке) и потом саму ссылку,которая была сгенерирована рандомно выше с помощью uuid,нужно сделать двухэтапную аутентификацию у аккаунта,с которого нужно отправлять письма по gmail,и создать пароль для сторонних приложений и его вставить вместо пароля от аккаунта(в данном случае вместо SMTP_PASSWORD в нашем файле .env),с которого нужно отправлять письма по gmail,иначе выдает ошибку и письма не отправляются

        const userDto = new UserDto(user); // помещаем в переменную userDto объект,созданный на основе нашего класса UserDto и передаем в параметре конструктора модель(в данном случае объект user,который мы создали в базе данных,в коде выше),в итоге переменная userDto(объект) будет обладать полями id,email,isActivated,которую можем передать как payload(данные,которые будут помещены в токен) в токене

        const tokens = tokenService.generateTokens({...userDto}); // помещаем в переменную tokens пару токенов,refresh и access токены,которые создались в нашей функции generateTokens(),передаем в параметре payload(данные,которые будут спрятаны в токен),в данном случае передаем в параметре объект,куда разворачиваем все поля объекта userDto

        await tokenService.saveToken(userDto.id,tokens.refreshToken); // сохраняем refresh токен в базу данных,используя нашу функцию saveToken,передаем в параметрах userDto.id(id пользователя,который создали в базе данных) и refreshToken,который мы сгенерировали выше и поместили в объект tokens

        // возвращаем все поля объекта tokens(то есть access и refresh токены),и в поле user указываем значение userDto
        return{
            ...tokens,
            user:userDto
        }

    }

    async login(email,password){
        const user = await userModel.findOne({email}); // ищем в базе данных объект с полем email и значением как параметр email этой функции login,то есть проверяем,зарегестрирован ли пользователь вообще,и помещаем найденный(если он найден) объект в переменную user

        // если user false,то есть такой пользователь не найден
        if(!user){
            throw ApiError.BadRequest('Пользователь с таким email не найден'); // бросаем ошибку с помощью нашего ApiError,указываем у него функцию BadRequest и передаем туда сообщение
        }

        const isPassEquals = await bcrypt.compare(password,user.password); // сравниваем пароль,который отправил пользователь с захешированным паролем в базе данных,используем функцию compare() у bcrypt,передаем туда первым параметром пароль,который пользователь отправил(параметр этой функции login),а вторым параметром передаем пароль из базы данных(то есть пароль,который есть у объекта user(мы его нашли в переменной user по email))

        // если isPassEquals false,то есть пароли не одинаковы
        if(!isPassEquals){
            throw ApiError.BadRequest('Неверный пароль'); // бросаем ошибку с помощью нашего ApiError,указываем у него функцию BadRequest и передаем туда сообщение
        }

        const userDto = new UserDto(user); // создаем дтошку,то есть выбрасываем из модели user базы данных все не нужное,помещаем в переменную userDto объект,созданный на основе нашего класса UserDto и передаем в параметре конструктора модель(в данном случае объект user,который мы нашли в базе данных по email,в коде выше),в итоге переменная userDto(объект) будет обладать полями id,email,isActivated,которую можем передать как payload(данные,которые будут помещены в токен) в токене

        const tokens = tokenService.generateTokens({...userDto}); // помещаем в переменную tokens пару токенов(наша функция generateTokens() их возвращает),refresh и access токены,которые создались в нашей функции generateTokens(),передаем в параметре payload(данные,которые будут спрятаны в токен),в данном случае передаем в параметре объект,куда разворачиваем все поля объекта userDto

        await tokenService.saveToken(userDto.id,tokens.refreshToken); // сохраняем refresh токен в базу данных,используя нашу функцию saveToken,передаем в параметрах userDto.id(id пользователя,который создали в базе данных,в данном случае,id пользователя,который мы нашли в базе данных по email,так как эта функция login) и refreshToken,который мы сгенерировали выше и поместили в объект tokens

        // возвращаем все поля объекта tokens(то есть access и refresh токены),и в поле user указываем значение userDto
        return {
            ...tokens,
            user:userDto
        }

    }

    // функция для выхода из аккаунта,параметром принимает refreshToken 
    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken); // удаляем refreshToken из базы данных,вызывая нашу функцию removeToken(),передавая в параметре refreshToken

        return token; // возвращаем токен(в данном случае это будет удаленный объект из базы данных с таким значением refreshToken как и в параметре этой функции logout)
    }   

    // создаем функцию,которая будет отрабатывать по эндпоинту /activate,для активации аккаунта,в параметре принимает activationLink(ссылку активации аккаунта,которая хранится у пользователя в базе данных)
    async activate(activationLink){
        const user = await userModel.findOne({activationLink}); // ищем пользователя в базе данных по полю activationLink с таким же значением,как параметр activationLink этой функции activate,и найденный объект пользователя(если он был найден) помещаем в переменную user

        if(!user){
            throw ApiError.BadRequest('Некорректная ссылка активации'); // бросаем ошибку,вместо throw new Error указываем throw ApiError(наш класс для обработки ошибок),указываем у него функцию BadRequest
        }

        // если пользователь с таким activationLink был найден,то меняем его поле isActivated на true
        user.isActivated = true;

        await user.save(); // сохраняем обновленного пользователя в базе данных(в данном случае обновленное поле isActivated) с помощью функции save()

    }

    async refresh(refreshToken){

        // если refreshToken false,то есть его нету
        if(!refreshToken){
            throw ApiError.UnauthorizedError(); // бросаем ошибку с помощью нашего ApiError,указываем у него функцию UnauthorizedError(),если у пользователя токена нет,то он и не авторизован
        }

        const userData = tokenService.validateRefreshToken(refreshToken); // вызываем нашу функцию validateRefreshToken(),передаем туда refreshToken,помещаем в переменную userData,payload данные(данные,которые мы помещали в токен,id пользователя и тд),которые верифицировали с помощью jwt.verify() в нашей фукнции validateRefreshToken(),если будет ошибка при верификации токена в нашей функции validateRefreshToken(),то будет возвращен null(это мы прописали в нашей функции validateRefreshToken())

        const tokenFromDb = await tokenService.findToken(refreshToken); // ищем такой токен в базе данных,помещаем найденный токен в переменную tokenFromDb,используя нашу функцию findToken(),куда передаем в параметре refreshToken

        // если userData false(или null) или tokenFromDb false,то есть пользователь не авторизован
        if(!userData || !tokenFromDb){
            throw ApiError.UnauthorizedError(); // бросаем ошибку с помощью нашего ApiError,указываем у него функцию UnauthorizedError(),если у пользователя токена нет,то он и не авторизован
        }

        const user = await userModel.findById(userData.id); // находим пользователя по id,который верифицировали из токена выше в коде с помощью нашей функции validateRefreshToken()

        const userDto = new UserDto(user); // создаем дтошку,то есть выбрасываем из модели user базы данных все не нужное,помещаем в переменную userDto объект,созданный на основе нашего класса UserDto и передаем в параметре конструктора модель(в данном случае объект user,который мы нашли в базе данных по email,в коде выше),в итоге переменная userDto(объект) будет обладать полями id,email,isActivated,которую можем передать как payload(данные,которые будут помещены в токен) в токене

        const tokens = tokenService.generateTokens({...userDto});  // помещаем в переменную tokens пару токенов(наша функция generateTokens() их возвращает),refresh и access токены,которые создались в нашей функции generateTokens(),передаем в параметре payload(данные,которые будут спрятаны в токен),в данном случае передаем в параметре объект,куда разворачиваем все поля объекта userDto

        await tokenService.saveToken(userDto.id,tokens.refreshToken);  // сохраняем refresh токен в базу данных,используя нашу функцию saveToken,передаем в параметрах userDto.id(id пользователя,который создали в базе данных,в данном случае,который нашли в базе данных по id,который достали из refresh токена с помощью нашей функции validateRefreshToken) и refreshToken,который мы сгенерировали выше и поместили в объект tokens

        // возвращаем все поля объекта tokens(то есть access и refresh токены),и в поле user указываем значение userDto
        return {
            ...tokens,
            user:userDto
        }

    }


    // функция для изменения данных пользователя в базе данных
    async changeInfo(userId,name,email){

        const user = await userModel.findById(userId); // находим объект пользователя по id,который передали с фронтенда

        // если user false,то есть такой пользователь не найден
        if(!user){
            throw ApiError.BadRequest('Такой пользователь не найден'); // бросаем ошибку
        }

        // если userName у user равен name,который передали с фронтенда,то показываем ошибку,что такое имя уже и так стоит
        if(user.userName === name){
            throw ApiError.BadRequest('This name is already used in this user account'); // бросаем ошибку
        }

        if(user.email === email){
            throw ApiError.BadRequest('This email is already used in this user account'); // бросаем ошибку
        }

        user.userName = name; // изменяем поле userName у user на name,который передали с фронтенда

        user.email = email; // изменяем поле email у user на email,который передали с фронтенда

        user.save(); // сохраняем объект пользователя в базе данных

        const userDto = new UserDto(user); // создаем дтошку,то есть выбрасываем из модели user базы данных все не нужное,помещаем в переменную userDto объект,созданный на основе нашего класса UserDto и передаем в параметре конструктора модель(в данном случае объект user,который мы нашли в базе данных по email,в коде выше),в итоге переменная userDto(объект) будет обладать полями id,email,isActivated,userName,которую можем передать как payload(данные,которые будут помещены в токен) в токене

        return userDto; // возвращаем объект userDto только с определенными полями,не всеми,которые есть в базе данных

    }

}

export default new UserService(); // экспортируем уже объект на основе нашего класса UserService