// прописали npm init в проект,чтобы инициализировать npm менеджер пакетов,чтобы устанавливать зависимости и пакеты(после npm init на все вопросы можно нажать enter и они будут тогда по дефолту указаны),устанавливаем express,cors(для отправки запросов через браузер),cookie-parser, устанавливаем с помощью npm i,устанавливаем nodemon(npm i nodemon --save-dev(чтобы устанавилось только для режима разработки)),чтобы перезагружался сервер автоматически при изменении файлов,указываем в package json в поле scripts поле dev и значение nodemon index.js(чтобы запускался index.js с помощью nodemon,чтобы перезагружался сервер автоматически при изменении файлов),используем команду npm run dev,чтобы запустить файл index.js,добавляем поле type со значение module в package.json,чтобы работали импорты типа import from,устанавливаем dotenv(npm i dotenv),чтобы использовать переменные окружения,создаем файл .env в корне папки server,чтобы указывать там переменные окружения(переменные среды),устанавливаем npm i mongodb mongoose,для работы с базой данных mongodb,на сайте mongodb создаем новый проект для базы данных,и потом берем оттуда ссылку для подключения к базе данных,устанавливаем еще jsonwebtoken(для генерации jwt токена),bcrypt(для хеширования пароля),uuid(для генерации рандомных строк) (npm i jsonwebtoken bcrypt uuid),все модули для backend(бэкэнда,в данном случае в папке server) нужно устанавливать в папку для бэкэнда(в данном случае это папка server),для этого нужно каждый раз из корневой папки переходить в папку server(cd server) и уже там прописывать npm i,устанавливаем еще пакет nodemailer(npm i nodemailer) для работы с отправкой сообщений на почту,устанавливаем библиотеку express-validator(npm i express-validator) для валидации паролей,почт и тд(для их проверки на правилно введенную информацию)


import express from 'express'; // импортируем express

import cookieParser from 'cookie-parser'; // импортируем cookieParser

import cors from 'cors'; // импортируем cors

import dotenv from 'dotenv'; // импортируем dotenv

import mongoose from 'mongoose';

const app = express(); // создаем экземпляр нашего приложения с помощью express()

dotenv.config(); // используем config() у dotenv,чтобы работал dotenv и можно было использовать переменные окружения

const PORT = process.env.PORT || 5001; // получаем переменную PORT из файла .env,с помощью process.env и помещаем ее значение в переменную PORT,если эта переменная не объявлена,то указываем переменной PORT значение 5001

app.use(express.json()); // подключаем express json,чтобы наш сервер(наше серверное приложение) мог обрабатывать json формат

app.use(cookieParser()); // подключаем cookieParser для cookie

// подключаем cors,чтобы взаимодействовать с сервером(отправлять запросы) через браузер,указываем,с каким доменом нужно этому серверу обмениваться куками(cookies),для этого передаем объект в cors(),указываем поле credentials true(разрешаем использовать cookies) и указываем в origin url нашего фронтенда(в данном случае это http://localhost:3000),указываем этот url через переменную окружения CLIENT_URL(мы вынесли туда этот url)
app.use(cors({
    credentials:true,
    origin:process.env.CLIENT_URL
}));

const start = async ()=>{
    // оборачиваем в try catch,чтобы отлавливать ошибки
    try{    

        await mongoose.connect(process.env.DB_URL); // подключаемся к базе данных,используя функцию connect(),в ее параметрах указываем ссылку для подключения к базе данных,которую взяли на сайте mongodb,в данном случае вынесли эту ссылку в конфигурационный файл .env,и берем его оттуда с помощью process.env

        app.listen(PORT,()=>console.log(`Server started on PORT = ${PORT}`)); // запускаем сервер,говоря ему прослушивать порт 5001(указываем первым параметром у listen() нашу переменную PORT) с помощью listen(),и вторым параметром указываем функцию,которая выполнится при успешном запуске сервера

    }catch(e){
        console.log(e);
    }
}

start(); // вызываем нашу функцию start()