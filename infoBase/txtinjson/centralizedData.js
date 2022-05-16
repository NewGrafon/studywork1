const AllData = {
                    CollegeProff: require('./colleges/prof.json'),
                    CollegeSpecs: require('./colleges/specs.json'),
                    VuzBakalavriat: require('./vuzs/bakalavriat.json'),
                    VuzMagistratura: require('./vuzs/magistratura.json'),
                    VuzSpecialitet: require('./vuzs/specialitet.json'),
                    studyTypes: [
                        "Очный", // 0
                        "Заочный",  // 1
                        "Вечерняя", // 2
                        "Экстернат", // 3
                        "Дистанционный" // 4
                    ],
                    studyPlace: [
                        "Школа", // 0
                        "Колледж", // 1
                        "ВУЗ" // 2
                    ]
                }
module.exports = {AllData: AllData}; 