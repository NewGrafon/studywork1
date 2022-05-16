

/* ПОДКЛЮЧЕНИЕ БИБЛИОТЕК */

const   fs = require('fs'),
        { networkInterfaces } = require('os'),
        express = require('express'),
        app = express(),
        mongoose = require("mongoose"),
        ejs = require('ejs'),
        path = require('path'),
        passport = require("passport"),
        users = require("./models/users"),
        schools = require("./models/schools"),
        infoBase = require("./infoBase/txtinjson/centralizedData.js").AllData,
        schools_EorC_Request = require("./models/schools_EorC_Request"),
        bodyParser = require("body-parser"),
        multer = require("multer"),
        bcrypt = require("bcrypt"),
        initializePassport = require("./configs/passport-config"),
        flash = require('express-flash'),
        session = require('express-session'),
        methodOverride = require('method-override');



/* РАЗЛИЧНЫЕ НАСТРОЙКИ СЕРВАКА */

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(session({
    secret: 'PEDIKES',
    resave: false,
    saveUninitialized: false,
    httpOnly: true,
    secure: true
    // cookie: {maxAge: 1000 * 60 * 60 * 24 * 1}
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

/* НАСТРОЙКА multer */

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "localImgStorage");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {

    if
        (file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/gif") {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

const upload = multer({ 
    storage: storageConfig, 
    fileFilter: fileFilter, 
});


/* ПОДКЛЮЧЕНИЕ К БД И СТАРТ СЕРВАКА */

const nets = networkInterfaces();
const results = {};
for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}

const SERVER_PORT = 3011;
let localURL = results.Ethernet[0] || `127.0.0.1:${SERVER_PORT}`;

if (process.env.npm_lifecycle_event == 'dev') {
    require('dotenv').config();
    localURL = '127.0.0.1:3011';
}

console.log('localURL: ', localURL);

async function start() {
    try {
        const DB_LOG_PASS = /*fs.readFileSync('DB_LOG_PASS.txt', 'utf-8')*/ null;
        const DB_PORT = /*fs.readFileSync('DB_PORT.txt', 'utf-8')*/ null;
        const DB = process.env.DB_URI || `mongodb://${DB_LOG_PASS}@127.0.0.1:${DB_PORT}/studywork`;
        console.log('CONNECTIONG TO DATABASE: ' + DB);
        await mongoose.connect(DB, {
            useNewUrlParser: true,
            autoIndex: false,
            useUnifiedTopology: true
        });
        console.log('SUCCESFUL CONNECTION TO DB');
        
        app.listen(SERVER_PORT, () => {
            console.log(`Link to site: ${localURL}\nЧтобы закрыть сервер, нажмите 2 комбинации: CTRL + C и после Y + ENTER`);
        })

    } catch (e) {
        console.log('Error: \n', e);
    }
}
start();

/* ИНИЦИАЛИЗАЦИЮ В СЕССИЮ ПРИ ЛОГИРОВАНИИ */

initializePassport(
    passport,
    email => users.findOne({ email: email }),
    id => users.findOne({ _id: id }),
)

/* ВСЕ ЗАПРОСЫ */

app.get('/', async (req, res) => {
    try {
        const allSchools = await schools.find();
        res.render('mainPage', {
            user: await req.user,
            allSchools, localURL, currentPlace: 'Список заведений'
        })
    } catch (e) { console.log(e); res.redirect('/') }
})

app.get('/preview/:id', async (req, res) => {
    try {
        let currentPlace;
        if ((req.params.id).split('-')[1] == 'yours') currentPlace = 'Ваше заведение';
        else currentPlace = 'Список заведений';
        const schoolInfo = await schools.findOne({ _id: (req.params.id).split('-')[0] });

        res.render('preview', {
            user: await req.user,
            currentPlace, schoolInfo, typeOfPreview: 1,
            infoBase, localURL
        })
    } catch (e) { console.log(e); res.redirect('/') }
})

app.get('/registration', checkNotAuthenticated, async (req, res) => {
    try {
        let errStatus = '';
        if (req.query.errStatus == '1')
            errStatus = 'Аккаунт с таким email/телефоном уже зарегистрирован';
        if (req.query.errStatus == '2')
            errStatus = 'Произошла какая-то ошибка! Попробуйте снова.';

        res.render('registration', {
            errStatus
        })
    } catch (e) { console.log(e); res.redirect('/') }
})

app.post("/registrationStatus", checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 12);

        let doesExist = await users.findOne({ email: req.body.email });
        if (!doesExist) doesExist = await users.findOne({ telephone: req.body.telephone });
        if (doesExist != (null || undefined)) {
            res.redirect('/registration?errStatus=1');
        }
        else {
            const regUser = new users({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: hashedPassword,
                email: req.body.email,
                telephone: req.body.telephone
            })
            regUser.save();
            res.redirect('enter');
        }

    } catch {
        res.redirect('/registration?errStatus=2');
    }
})

app.get('/enter', checkNotAuthenticated, async (req, res) => {
    try {
        res.render('enter', {
        })
    } catch (e) { console.log(e); res.redirect('/') }
})

app.post("/enter", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/enter",
    failureFlash: true
}), async (req, res) => {
});

app.get('/profile', checkAuthenticated, async (req, res) => {
    try {
        res.render('profile', {
            user: await req.user,
            localURL,
            currentPlace: 'Профиль'
        })
    } catch (e) { console.log(e); res.redirect('/') }
})

app.post('/profileEditLogoConfirm', checkAuthenticated, upload.single('avatarlogo'), async (req, res) => {
    try {
        const user = await req.user;

        let finalLogo = null;
        try {
            if (req.file.path && req.file.size < 5243260) {
                let logo = fs.readFileSync(req.file.path);

                let encode_image = logo.toString('base64');
                finalLogo = {
                    contentType: req.file.mimetype,
                    image: new Buffer(encode_image, 'base64')
                }
                fs.unlinkSync(req.file.path);
            }
        } catch { }

        if (finalLogo != (null || undefined))
        await users.findOneAndUpdate({_id: user._id}, {
            logo: finalLogo
        });

        res.redirect('/profile');
    } catch (e) {
        console.log(e)
        res.redirect('/')
    }
})

app.post('/profileEditBIOConfirm', checkAuthenticated, async (req, res) => {
    try {
        const user = await req.user;
        let needLogOut = false;
        //
        if (req.body.firstName != (null || '' || undefined) && req.body.firstName != user.firstName) {
            await users.findOneAndUpdate({ _id: user._id }, {
                firstName: req.body.firstName
            })
        }
        //
        if (req.body.lastName != (null || '' || undefined) && req.body.lastName != user.lastName) {
            await users.findOneAndUpdate({ _id: user._id }, {
                lastName: req.body.lastName
            })
        }
        //
        if (req.body.patronymic != (null || '' || undefined) && req.body.patronymic != user.patronymic) {
            await users.findOneAndUpdate({ _id: user._id }, {
                patronymic: req.body.patronymic
            })
        }
        //
        if (req.body.telephone != (null || '' || undefined) && req.body.telephone != user.telephone) {
            await users.findOneAndUpdate({ _id: user._id }, {
                telephone: req.body.telephone
            })
        }
        //
        if (req.body.email != (null || '' || undefined) && req.body.email != user.email) {
            needLogOut = true;

            const userSchools = await schools.find({ creator: user.email })
            userSchools.forEach(async (elem) => {
                await schools.findOneAndUpdate({ _id: elem._id }, {
                    creator: req.body.email
                })
            })
            const userSchoolsReq = await schools_EorC_Request.find({ creator: user.email })
            userSchoolsReq.forEach(async (elem) => {
                await schools_EorC_Request.findOneAndUpdate({ _id: elem._id }, {
                    creator: req.body.email
                })
            })

            await users.findOneAndUpdate({ _id: user._id }, {
                email: req.body.email
            })

        }
        //
        if (needLogOut) { req.logOut; res.clearCookie("connect.sid"); res.redirect('/'); }
        else res.redirect('/profile')
    } catch (e) {
        console.log(e)
        res.redirect('/')
    }
})

app.post('/profileEditPassConfirm', checkAuthenticated, async (req, res) => {
    try {
        const user = await req.user;
        if (req.body.currentPass !== null && await bcrypt.compare(req.body.currentPass, user.password)
            && req.body.newPass !== null && req.body.newPassConfirm !== null
            && req.body.newPass === req.body.newPassConfirm) {
            const newPass = await bcrypt.hash(req.body.newPass, 12)
            await users.findOneAndUpdate({ email: user.email }, {
                password: newPass
            })
            req.logOut();
            res.clearCookie("connect.sid");
            res.redirect('/');
        } else res.redirect('/profile?status=err');  // status err = чет пошло не так   
    } catch (e) {
        console.log(e)
        res.redirect('/')
    }
})

//////

app.get('/yourSchools', checkAuthenticated, async (req, res) => {
    try {
        let Status;
        if (req.query.Status == '1')
            Status = 'Запрос на создание заведения отправлен успешно.';
        if (req.query.Status == '2')
            Status = 'Запрос на изменение заведения отправлен успешно.';

        const user = await req.user;

        const yourSchools = await schools.find({ creator: user.email });
        res.render('yourSchools', {
            user, localURL, currentPlace: 'Ваши заведения', zone: 1, yourSchools,
            Status, editer: false, concreteSchool: null, educHTML: null, proffHTML: null
        });
    } catch (e) { console.log(e); res.redirect('/') }
})

app.get('/schoolCreate', checkAuthenticated, async (req, res) => {
    try {

        res.render('yourSchoolEditZone', {
            user: await req.user,  localURL,
            currentPlace: 'Окно создания', editer: false,
            concreteSchool: false, localURL,
            infoBase
        });
    } catch (e) { console.log(e); res.redirect('/') }
})

app.post('/schoolCreate', checkAuthenticated, upload.single('logo'), async (req, res) => {
    try {
        if (await schools_EorC_Request.findOne({ shortName: req.body.lowName }) != null ||
            await schools_EorC_Request.findOne({ fullName: req.body.fullName }) != null) {

            errStatus = 'Уже существует заведение с таким коротким и/или полным названием.';

        } else {

            const user = await accountInfoChecker(await req.user);

            //
            let educationTypes;
            if (typeof (req.body.EducType) === 'object')
                educationTypes = req.body.EducType;
            else educationTypes = [req.body.EducType];

            let educationTypesTemp = {}
            educationTypes.forEach(elem => {
                educationTypesTemp[elem] = true;
            })
            educationTypes = educationTypesTemp;
            //

            let CollegeProff = {},
                CollegeSpecs = {},
                VuzBakalavriat = {},
                VuzMagistratura = {},
                VuzSpecialitet = {};

            let tempCollegeProff = typeChanger(req.body.CollegeProff),
                tempCollegeSpecs = typeChanger(req.body.CollegeSpecs),
                tempVuzBakalavriat = typeChanger(req.body.VuzBakalavriat),
                tempVuzMagistratura = typeChanger(req.body.VuzMagistratura),
                tempVuzSpecialitet = typeChanger(req.body.VuzSpecialitet);
            function typeChanger(data) {
                if (data == (undefined || null))
                    return null;
                if (typeof data === 'object')
                    return data;
                else
                    return [data];
            }


            if (req.body.TypeOfSchool == '1') {
                if (tempCollegeProff)
                    for (let i = 0; i < tempCollegeProff.length; i++) {
                        CollegeProff[tempCollegeProff[i]] = infoBase.CollegeProff[i].code;
                    }

                if (tempCollegeSpecs)
                    for (let i = 0; i < tempCollegeSpecs.length; i++) {
                        CollegeSpecs[tempCollegeSpecs[i]] = infoBase.CollegeSpecs[i].code;
                    }
            }

            if (req.body.TypeOfSchool == '2') {
                if (tempVuzBakalavriat)
                    for (let i = 0; i < tempVuzBakalavriat.length; i++) {
                        VuzBakalavriat[tempVuzBakalavriat[i]] = infoBase.VuzBakalavriat[i].code;
                    }

                if (tempVuzMagistratura)
                    for (let i = 0; i < tempVuzMagistratura.length; i++) {
                        VuzMagistratura[tempVuzMagistratura[i]] = infoBase.VuzMagistratura[i].code;
                    }

                if (tempVuzSpecialitet)
                    for (let i = 0; i < tempVuzSpecialitet.length; i++) {
                        VuzSpecialitet[tempVuzSpecialitet[i]] = infoBase.VuzSpecialitet[i].code;
                    }
            }




            let finalLogo = null;
            try {
                if (req.file.path && req.file.size < 5243260) {
                    let logo = fs.readFileSync(req.file.path);

                    let encode_image = logo.toString('base64');
                    finalLogo = {
                        contentType: req.file.mimetype,
                        image: new Buffer(encode_image, 'base64')
                    }
                    fs.unlinkSync(req.file.path);
                }
            } catch { }

            const SchoolRequest = await new schools_EorC_Request({
                shortName: req.body.lowName,
                fullName: req.body.fullName,
                shortDescription: req.body.lowDesc,
                fullDescription: req.body.fullDesc,
                educationType: educationTypes,
                schoolType: req.body.TypeOfSchool,
                dormitory: !!req.body.dormitory,
                govermentOwnership: !!req.body.govermentOwnership,
                educationPriceTypes: {
                    budget: !!req.body.ePT_budget,
                    paid: !!req.body.ePT_paid,
                },
                CollegeProff: CollegeProff,
                CollegeSpecs: CollegeSpecs,
                VuzBakalavriat: VuzBakalavriat,
                VuzMagistratura: VuzMagistratura,
                VuzSpecialitet: VuzSpecialitet,
                logo: finalLogo,
                schoolLink: req.body.educ_link,
                creator: user.email,
                requestType: 1
            })
            SchoolRequest.save();
        }
        //errStatus = 'Запрос на создание заведения отправлен успешно.';
        res.redirect('/yourSchools?Status=1');
    } catch (e) { console.log(e); res.redirect('/') }
})

app.get('/schoolEdit/:id', checkAuthenticated, async (req, res) => {
    try {
        let concreteSchool = await schools.findOne({ _id: (req.params.id).split('-')[0] });

        res.render('yourSchoolEditZone', {
            user: await req.user, localURL,
            currentPlace: 'Окно изменений',
            editer: true, infoBase, concreteSchool, localURL
        })
    } catch (e) { console.log(e); res.redirect('/') }
})

app.post('/schoolEditSave', checkAuthenticated, upload.single('logo'), async (req, res) => {

    try {
        const existSchool = await schools.findOne({_id: req.query.id})
        
        //
        let educationTypes;
        if (typeof (req.body.EducType) === 'object')
            educationTypes = req.body.EducType;
        else educationTypes = [req.body.EducType];

        let educationTypesTemp = {}
        educationTypes.forEach(elem => {
            educationTypesTemp[elem] = true;
        })
        educationTypes = educationTypesTemp;
        //

        let CollegeProff = {},
            CollegeSpecs = {},
            VuzBakalavriat = {},
            VuzMagistratura = {},
            VuzSpecialitet = {};

        let tempCollegeProff = typeChanger(req.body.CollegeProff),
            tempCollegeSpecs = typeChanger(req.body.CollegeSpecs),
            tempVuzBakalavriat = typeChanger(req.body.VuzBakalavriat),
            tempVuzMagistratura = typeChanger(req.body.VuzMagistratura),
            tempVuzSpecialitet = typeChanger(req.body.VuzSpecialitet);
        function typeChanger(data) {
            if (data == (undefined || null))
                return null;
            if (typeof data === 'object')
                return data;
            else
                return [data];
        }



        let currentSchoolType;
        if (req.body.TypeOfSchool == (undefined || null)) currentSchoolType = existSchool.schoolType
        else currentSchoolType = req.body.TypeOfSchool;

        if (currentSchoolType == '1') {
            if (tempCollegeProff)
                for (let i = 0; i < tempCollegeProff.length; i++) {
                    CollegeProff[tempCollegeProff[i]] = infoBase.CollegeProff[i].code;
                }

            if (tempCollegeSpecs)
                for (let i = 0; i < tempCollegeSpecs.length; i++) {
                    CollegeSpecs[tempCollegeSpecs[i]] = infoBase.CollegeSpecs[i].code;
                }
        }

        if (currentSchoolType == '2') {
            if (tempVuzBakalavriat)
                for (let i = 0; i < tempVuzBakalavriat.length; i++) {
                    VuzBakalavriat[tempVuzBakalavriat[i]] = infoBase.VuzBakalavriat[i].code;
                }

            if (tempVuzMagistratura)
                for (let i = 0; i < tempVuzMagistratura.length; i++) {
                    VuzMagistratura[tempVuzMagistratura[i]] = infoBase.VuzMagistratura[i].code;
                }

            if (tempVuzSpecialitet)
                for (let i = 0; i < tempVuzSpecialitet.length; i++) {
                    VuzSpecialitet[tempVuzSpecialitet[i]] = infoBase.VuzSpecialitet[i].code;
                }
        }



        let finalLogo = undefined;
        try {
            if (req.file.path && req.file.size < 5243260) {
                console.log('start reading image');
                let logo = fs.readFileSync(req.file.path);

                let encode_image = logo.toString('base64');
                finalLogo = {
                    contentType: req.file.mimetype,
                    image: new Buffer(encode_image, 'base64')
                }
                console.log('delete image');
                fs.unlinkSync(req.file.path);
                
            }
        } catch { }

        const user = await accountInfoChecker(await req.user);
        if (await schools_EorC_Request.findOne({ _id: req.query.id })) {
            await schools_EorC_Request.findOneAndUpdate({ _id: req.query.id }, {
                shortName: req.body.lowName,
                fullName: req.body.fullName,
                shortDescription: req.body.lowDesc,
                fullDescription: req.body.fullDesc,
                educationType: educationTypes,
                schoolType: req.body.TypeOfSchool,
                dormitory: !!req.body.dormitory,
                govermentOwnership: !!req.body.govermentOwnership,
                educationPriceTypes: {
                    budget: !!req.body.ePT_budget,
                    paid: !!req.body.ePT_paid,
                },
                CollegeProff: CollegeProff,
                CollegeSpecs: CollegeSpecs,
                VuzBakalavriat: VuzBakalavriat,
                VuzMagistratura: VuzMagistratura,
                VuzSpecialitet: VuzSpecialitet,
                schoolLink: req.body.educ_link,
                creator: user.email,
                requestType: 2
            });
            if (finalLogo != (undefined || null))
            await schools_EorC_Request.findOneAndUpdate({ _id: req.query.id }, {
                logo: finalLogo
            });
        } else {
            const EditSchool = await new schools_EorC_Request({
                _id: req.query.id,
                shortName: req.body.lowName,
                fullName: req.body.fullName,
                shortDescription: req.body.lowDesc,
                fullDescription: req.body.fullDesc,
                educationType: educationTypes,
                schoolType: req.body.TypeOfSchool,
                dormitory: !!req.body.dormitory,
                govermentOwnership: !!req.body.govermentOwnership,
                educationPriceTypes: {
                    budget: !!req.body.ePT_budget,
                    paid: !!req.body.ePT_paid,
                },
                CollegeProff: CollegeProff,
                CollegeSpecs: CollegeSpecs,
                VuzBakalavriat: VuzBakalavriat,
                VuzMagistratura: VuzMagistratura,
                VuzSpecialitet: VuzSpecialitet,
                schoolLink: req.body.educ_link,
                creator: user.email,
                requestType: 2
            });
            if (finalLogo != (undefined || null))
            EditSchool.logo = finalLogo;
            else if (existSchool.logo != (undefined || null))
            EditSchool.logo = existSchool.logo;

            EditSchool.save();
        }

        //errStatus = 'Запрос на изменение заведения отправлен успешно.';

        res.redirect('/yourSchools?Status=2');
    } catch (e) { console.log(e); res.redirect('/') }
})

app.delete('/schoolDelete', checkAuthenticated, async (req, res) => {
    try {
        const user = await accountInfoChecker(await req.user);

        await schools.findOneAndDelete({ creator: user.email, _id: req.query.id });
        res.redirect('/yourSchools');
    } catch (e) { console.log(e); res.redirect('/') }
})

//////

app.get('/adminPanel', checkAdmined, async (req, res) => {
    try {
        const allRequests = await schools_EorC_Request.find();
        res.render('adminPanel', {
            user: await (req.user).clone(), localURL,
            currentPlace: 'Админ панель', allRequests
        })
    } catch (e) { console.log(e); res.redirect('/') }
})

app.get('/request_preview/:id', checkAdmined, async (req, res) => {
    try {
        const schoolInfo = await schools_EorC_Request.findOne({ _id: req.params.id });

        res.render('preview', {
            user: await req.user.clone(), localURL, 
            currentPlace: 'Админ панель', schoolInfo, typeOfPreview: 2,
            infoBase
        })
    } catch (e) { console.log(e); res.redirect('/') }
})

app.post('/acceptRequestStatus', checkAdmined, async (req, res) => {
    try {
        if (req.query.requestType === '1') {
            const RequestSchool = await schools_EorC_Request.findOne({ _id: req.body.id });

            const RegSchool = await new schools({
                shortName: RequestSchool.shortName,
                fullName: RequestSchool.fullName,
                shortDescription: RequestSchool.shortDescription,
                fullDescription: RequestSchool.fullDescription,
                schoolType: RequestSchool.schoolType,
                educationType: RequestSchool.educationType,
                dormitory: RequestSchool.dormitory,
                govermentOwnership: RequestSchool.govermentOwnership,
                educationPriceTypes: RequestSchool.educationPriceTypes,
                CollegeProff: RequestSchool.CollegeProff,
                CollegeSpecs: RequestSchool.CollegeSpecs,
                VuzBakalavriat: RequestSchool.VuzBakalavriat,
                VuzMagistratura: RequestSchool.VuzMagistratura,
                VuzSpecialitet: RequestSchool.VuzSpecialitet,
                logo: RequestSchool.logo,
                schoolLink: RequestSchool.schoolLink,
                creator: RequestSchool.creator
            });

            await schools_EorC_Request.findOneAndDelete({ _id: req.body.id });

            RegSchool.save();
        }

        if (req.query.requestType === '2') {
            const RequestSchool = await schools_EorC_Request.findOne({ _id: req.body.id });
            await schools.findOneAndUpdate({ _id: req.body.id }, {
                shortName: RequestSchool.shortName,
                fullName: RequestSchool.fullName,
                shortDescription: RequestSchool.shortDescription,
                fullDescription: RequestSchool.fullDescription,
                schoolType: RequestSchool.schoolType,
                educationType: RequestSchool.educationType,
                dormitory: RequestSchool.dormitory,
                govermentOwnership: RequestSchool.govermentOwnership,
                educationPriceTypes: RequestSchool.educationPriceTypes,
                CollegeProff: RequestSchool.CollegeProff,
                CollegeSpecs: RequestSchool.CollegeSpecs,
                VuzBakalavriat: RequestSchool.VuzBakalavriat,
                VuzMagistratura: RequestSchool.VuzMagistratura,
                VuzSpecialitet: RequestSchool.VuzSpecialitet,
                logo: RequestSchool.logo,
                schoolLink: RequestSchool.schoolLink,
                creator: RequestSchool.creator
            })
            await schools_EorC_Request.findOneAndDelete({ _id: req.body.id });
        }

        res.redirect('/adminPanel');
    } catch (e) { console.log(e); res.redirect('/') }
})

app.delete('/deleteRequestStatus', checkAdmined, async (req, res) => {
    try {
        await schools_EorC_Request.findOneAndDelete({ _id: req.body.id });
        res.redirect('/adminPanel');
    } catch { }
})

//////

app.get('/pictures/:id', async (req, res) => {
    try {
        const img = await schools.findOne({ _id: req.params.id });

        res.contentType(img.logo.contentType);
        res.send((img.logo).image.buffer);

    } catch (e) { console.log(e); res.redirect('/') }
})

app.get('/profile-pictures/:id', async (req, res) => {
    try {
        const img = await users.findOne({ _id: req.params.id });

        res.contentType(img.logo.contentType);
        res.send((img.logo).image.buffer);

    } catch (e) { console.log(e); res.redirect('/') }
})

app.get('/adminpictures/:id', async (req, res) => {
    try {
        const img = await schools_EorC_Request.findOne({ _id: req.params.id });

        res.contentType(img.logo.contentType);
        res.send((img.logo).image.buffer);

    } catch (e) { console.log(e); res.redirect('/') }
})

//////

app.get('/nojavascript', (req, res) => {
    res.render('nojavascript.ejs');
})

app.delete('/logout', checkAuthenticated, async (req, res) => {
    try {
        req.logOut();
        res.redirect('/');
    } catch (e) { console.log(e) }
})



/* ПРОВЕРКИ НА АУТЕНТИФИКАЦИЮ */

async function checkAdmined(req, res, next) {
    const user = await req.user;

    if (req.isAuthenticated() && user.accountType === 2)
        return next();

    res.redirect('/');
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}