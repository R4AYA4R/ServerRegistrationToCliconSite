
import jwt from 'jsonwebtoken'; // импортируем jwt для работы с jwt токенами,в данном случае импортируем вручную,так как автоматически не импортируется

import tokenModel from '../models/tokenModel.js';

// создаем класс TokenService для сервиса токена
class TokenService{
    // создаем функцию,которая будет генерировать пару токенов,access и refresh токены,в параметре принимает payload,данные,которые будем прятать в токен
    generateTokens(payload){
        const accessToken = jwt.sign(payload,process.env.JWT_ACCESS_SECRET,{expiresIn:'30m'}); // вызываем функцию sign у jwt,она создает access токен,передаем первым параметром payload(данные,которые будут помещены в токен),а вторым параметром передаем секретный ключ(это любая рандомная строка,только чтобы ее никто не знал,в данном случае вынесли секретный ключ в файл .env в переменную окружения),третьим параметром передаем объект опций для генерации токена,указываем поле expiresIn:'30m'(это сколько будет жить токен,в данном случае указываем,что он будет действителен в течении 30 мин),для теста можно указать время жизни access токена 5s(секунд) и refresh токена 10s(секунд),тогда когда access токен истечет,будет повторный запрос на /refresh и обновление access токена,но после 10s когда истечет refresh токен,уже будут недоступны функции,которые доступны авторизованным пользователям(потому что уже истечет refresh токен и пользователь будет не авторизован) и пользователя выкинет из аккаунта после обновления страницы

        const refreshToken = jwt.sign(payload,process.env.JWT_REFRESH_SECRET,{expiresIn:'30d'}); // создаем refreshToken,также как и accessToken,только секретный ключ для refresh токена указываем другой и время жизни токена 30d(30 дней),чтобы если пользователь не заходил на сайт 30 дней,ему придется заново логиниться

        // возвращаем объект с полями accessToken и refreshToken
        return {
            accessToken,
            refreshToken
        }
    }

    // создаем функцию для сохранения refreshToken в базу данных,передаем в параметрах userId(id пользователя) и сам refreshToken
    async saveToken(userId,refreshToken){
        const tokenData = await tokenModel.findOne({user:userId}); // ищем в базе данных токен по такому userId и помещаем найденный объект в переменную tokenData(если вообще был найден такой объект)

        // если tokenData true,то есть если токен у этого userId уже есть
        if(tokenData){
            tokenData.refreshToken = refreshToken; // изменяем поле refreshToken у найденного объекта по такому userId на refreshToken который мы передадим в параметре этой функции saveToken

            return tokenData.save(); // возвращаем и сохраняем объект tokenData в базу данных, save() - сохраняем объект tokenData в базу данных,то есть сохраняем наш новый refreshToken у этого объекта
        }

        // если токен по такому userId не был найден,то скорее всего пользователь логинится первый раз,то создаем новый объект в базе данных с рефреш токеном и userId
        const token = await tokenModel.create({user:userId,refreshToken}); // создаем объект в базе данных с полями userId и рефреш токеном,который передадим этой функции saveToken,помещаем созданный объект в переменную token

        return token; // возвращаем созданный объект token
    }
}

export default new TokenService(); // экспортируем уже объект на основе нашего класса TokenService