fs = require('fs');

filesNameArray = ['colleges/prof.txt', 'colleges/specs.txt',
'vuzs/bakalavriat.txt', 'vuzs/magistratura.txt', 'vuzs/specialitet.txt'];

function jsonCreator(fileName){
    fs.readFile(fileName, 'utf8', (err, data) => {
        let jsonObject = [];
        let currentLine;
        const countLines = data.split('\n').length;
        console.log(countLines);
        for (let i = 1; i < countLines; i++) {
            currentLine = data.split('\n')[i];
            jsonObject.push({id: i-1, code: currentLine.substring(0, 8), name: currentLine.substring(11).replace(/\r?\n|\r/, '')}); 
        }
        jsonObject = JSON.stringify(jsonObject);

        fs.writeFile(`${fileName.replace('txt', 'json')}`, jsonObject, function(error){
            if(error) throw error; // если возникла ошибка
        });
        console.log('end');
    });
}

for (let i = 0; i < filesNameArray.length; i++) {
    jsonCreator(filesNameArray[i]);
}