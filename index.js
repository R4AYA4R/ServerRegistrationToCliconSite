// прописали npm init в проект,чтобы инициализировать npm менеджер пакетов,чтобы устанавливать зависимости и пакеты(после npm init на все вопросы можно нажать enter и они будут тогда по дефолту указаны),устанавливаем express,cors(для отправки запросов через браузер),cookie-parser, устанавливаем с помощью npm i,устанавливаем nodemon(npm i nodemon --save-dev(чтобы устанавилось только для режима разработки)),чтобы перезагружался сервер автоматически при изменении файлов,указываем в package json в поле scripts поле dev и значение nodemon index.js(чтобы запускался index.js с помощью nodemon,чтобы перезагружался сервер автоматически при изменении файлов),используем команду npm run dev,чтобы запустить файл index.js,добавляем поле type со значение module в package.json,чтобы работали импорты типа import from,устанавливаем dotenv(npm i dotenv),чтобы использовать переменные окружения,создаем файл .env в корне папки server,чтобы указывать там переменные окружения(переменные среды),устанавливаем npm i mongodb mongoose,для работы с базой данных mongodb,на сайте mongodb создаем новый проект для базы данных,и потом берем оттуда ссылку для подключения к базе данных,устанавливаем еще jsonwebtoken(для генерации jwt токена),bcrypt(для хеширования пароля),uuid(для генерации рандомных строк) (npm i jsonwebtoken bcrypt uuid),все модули для backend(бэкэнда,в данном случае в папке server) нужно устанавливать в папку для бэкэнда(в данном случае это папка server),для этого нужно каждый раз из корневой папки переходить в папку server(cd server) и уже там прописывать npm i,устанавливаем еще пакет nodemailer(npm i nodemailer) для работы с отправкой сообщений на почту,устанавливаем библиотеку express-validator(npm i express-validator) для валидации паролей,почт и тд(для их проверки на правилно введенную информацию),для работы с файлами в express, нужно установить модуль npm i express-fileupload

//authMiddleware нужен,чтобы защитить пользователя от мошенников,так как,когда истекает access токен,идет запрос на refresh токен,и после этого обновляется и access токен,и refresh токен,соответственно мошенник уже не может получить доступ к этому эндпоинту(маршруту по url),так как его refresh и access токен будут уже не действительны,а функция checkAuth нужна для проверки только refresh токена(то есть,если пользователь вообще не пользовался сервисом какое-то время(которое указали у жизни refresh токена),нужно именно не переобновлять страницы и тд,чтобы не шел запрос на /refresh(иначе refresh токен будет переобновляться с каждым запросом,нужно,чтобы refresh токен истек до запроса на /refresh),то его refresh токен истечет и его выкинет с аккаунта после обновления страницы,но если пользователь будет использовать в данном случае,например,функцию authMiddleware,то его access токен и refresh токен будут заново перезаписаны и таймер на время жизни refresh токена будет обновлен и заново запущен,поэтому его не будет выкидывать из аккаунта) 


import express from 'express'; // импортируем express

import cookieParser from 'cookie-parser'; // импортируем cookieParser

import cors from 'cors'; // импортируем cors

import dotenv from 'dotenv'; // импортируем dotenv

import mongoose from 'mongoose';

import bcrypt from 'bcrypt';

import router from './router/router.js'; // импортируем наш router(в данном случае указываем расширение .js у файла router,иначе не работает )
import errorMiddleware from './middlewares/errorMiddleware.js';
import roleModel from './models/roleModel.js';
import userModel from './models/userModel.js';

import fileUpload from 'express-fileupload'; // импортируем fileUpload для работы с загрузкой файлов 

const app = express(); // создаем экземпляр нашего приложения с помощью express()

dotenv.config(); // используем config() у dotenv,чтобы работал dotenv и можно было использовать переменные окружения

const PORT = process.env.PORT || 5001; // получаем переменную PORT из файла .env,с помощью process.env и помещаем ее значение в переменную PORT,если эта переменная не объявлена,то указываем переменной PORT значение 5001

// подключать этот fileUpload нужно в начале всех подключений use,или хотя бы выше,чем router,иначе не работает
app.use(fileUpload({})); // регистрируем модуль fileUpload с помощью use(),чтобы он работал,передаем в fileUpload() объект

app.use(express.static('static')); // делаем возможность отдавать изображение,то есть показывать изображение из папки static в браузере,когда,например, используем картинку,чтобы в src картинки можно было вставить путь до этой картинки на нашем node js сервере,и она показывалась

app.use(express.json()); // подключаем express json,чтобы наш сервер(наше серверное приложение) мог обрабатывать json формат

app.use(cookieParser()); // подключаем cookieParser для cookie

// подключаем cors,чтобы взаимодействовать с сервером(отправлять запросы) через браузер,указываем,с каким доменом нужно этому серверу обмениваться куками(cookies),для этого передаем объект в cors(),указываем поле credentials true(разрешаем использовать cookies) и указываем в origin url нашего фронтенда(в данном случае это http://localhost:3000),указываем этот url через переменную окружения CLIENT_URL(мы вынесли туда этот url)
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

app.use('/api', router); // подключаем наш router,указываем первым параметром по какому маршруту он будет отрабатывать(в данном случае указываем /api,в таком случае все эндпоинты этого router будут идти по маршруту localhost:5001/api/название маршрута эндпоинта(/login,например)) и вторым параметром указываем сам router

app.use(errorMiddleware); // подключаем наш middleware для обработки ошибок,middleware для обработки ошибок нужно подключать в самом конце всех подключений use()

const start = async () => {
    // оборачиваем в try catch,чтобы отлавливать ошибки
    try {

        await mongoose.connect(process.env.DB_URL); // подключаемся к базе данных,используя функцию connect(),в ее параметрах указываем ссылку для подключения к базе данных,которую взяли на сайте mongodb,в данном случае вынесли эту ссылку в конфигурационный файл .env,и берем его оттуда с помощью process.env


        // использовали это 1 раз,чтобы создать такие объекты в базе данных 1 раз,чтобы они просто там были,после этого этот код закомментировали
        // await roleModel.create({value:"USER"}); // создали в базе данных в сущности ролей объект роли с полем value и значением USER для роли пользователя

        // await roleModel.create({value:"ADMIN"}); // создали в базе данных в сущности ролей объект роли с полем value и значением ADMIN для роли админа


        // создаем объект пользователя в сущности users(пользователи) в базе данных 1 раз с ролью ADMIN,чтобы там он просто был и потом можно было только входить в аккаунт этого админа,после этого код закомментировали
        // const adminPass = "adminClicon";

        // const hashPass = await bcrypt.hash(adminPass,3);

        // await userModel.create({email:"admin@gmail.com",password:hashPass,activationLink:'Admin doesn`t have activationLink',userName:"ADMIN",roles:["ADMIN"]});


        app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`)); // запускаем сервер,говоря ему прослушивать порт 5001(указываем первым параметром у listen() нашу переменную PORT) с помощью listen(),и вторым параметром указываем функцию,которая выполнится при успешном запуске сервера

    } catch (e) {
        console.log(e);
    }
}

start(); // вызываем нашу функцию start()