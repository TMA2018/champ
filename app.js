/*
Дано 4 html файла. Это выгрузки из софта, работающего на детских соревнованиях по плаванию. 
Каждый файл - это один этап.
Нужно написать воркер, который:
1) Парсит все эти выгрузки
2) сохраняет в локальный json файл массив с объектами, 
где каждый объект представляет отдельного спортсмена (аггрегировано по всем этапам):
{name: "ИВАНОВ Иван", sex: "male", year: "2012", school: "СШОР-9", totalPoints: 5601, totalDistances: 23, totalStages: 2 }
*/

//const http = require('http');
//const express = require('express');
//const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');
//const app = express();

class Users {
    constructor(name, sex, year, school, totalPoints, totalDistances = 0, totalStages) {
        this.name = name,
        this.sex = sex,
        this.year = `20${year}`, 
        this.school = school,
        this.totalPoints = +totalPoints, 
        this.totalDistances = +totalDistances, 
        this.totalStages = +totalStages,
        this.id = this.sex + this.year + this.name
    }
} 
const usersListTotal = {Data:[]};

/*
app.use('/', function(request, response) {
    response.sendFile(__dirname + '/public/2.htm');
});
*/
const parse = (filePath) => {
    const usersList = [];
    // const getHTML = async(url) => {
    //     /*const data =  fetch('http://localhost:3000/')
    //         .then((response) => response.text())
    //         .then((data) => { return data} )
    //         .catch(err => console.log(err));
    //     console.log( data);*/
    //     const { data } = await axios.get(url);
    //     //console.log(data);
    //     return cheerio.load(data);
    // }
    // const url = 'http://localhost:3000/';
    // const $ = await getHTML(url); 
    //console.log($('td').html());
    const data = fs.readFileSync(filePath);
    const $ = cheerio.load(data);
    const trs = $('tr');
    //console.log(`trs \n${trs}`);
    let trsList = [];
    let countNewTr = 0;
    let addSex='';

    trs.each( function(i, item) {
        //tr = cheerio.load(trs[i]);      
        if ($(this).text()) {
            //console.log(`trs= ${$(this)}`);
            td='';
            if ($(this).text().toLowerCase().match('девочки')) {
                addSex='Female | ';
            } else if ($(this).text().toLowerCase().match('мальчики')) {
                addSex='Male | ';
            } else {
                td+=addSex;
            }
            
            $(this).find('td').each(function(j, item) {
                if ($(this).text()) {
                    //console.log(`td ${$(this).text()}`); 
                    //if ( i > 2 && j == 0) { continue; }
                    td += $(this).text().trim().replace(/"/g,'') + ' | ';
                }
            });  
            //console.log(`tds= ${td}` );
            trsList[countNewTr] = td.slice(0, td.length - 3);
            countNewTr++;  
        }  
        // trs[i].find('td').each(function(i,elm){
        //     trsList[i] = `${$(this).text()} | `;
        // })
    });
    let userInArr = [];
    for (let i=0; i<trsList.length; i++) {
        //console.log(`trs ${i}) [${trsList[i]}] of ${trsList.length}`);
        userInArr[i] = trsList[i].split(' | ');
    }
    const userInArrWithOutNumber = userInArr.filter((item) => {
        return item[0] == 'Female' || item[0] == 'Male';
    });
    
    for (let i = 0; i < userInArrWithOutNumber.length; i++) {
        userInArrWithOutNumber[i].splice(1, 1);
        const [sex, name, year, school, totalPoints, totalDistances] = userInArrWithOutNumber[i];
        //console.log(name, sex, year, school, totalPoints, totalStages);
        const s = new Users(name, sex, year, school, totalPoints, totalDistances , totalStages = 1)
        //console.log(s);
        usersList.push(s);
    }
    return usersList;
}
const db = [];
for (let i=1; i<6; i++) {
    db[i-1] = parse(`./public/${i}.htm`);
    //usersListTotal.Data = [...db[i-1]];
    for (let k of db[i-1]) {
        usersListTotal.Data.push(k); 
    }
}
//usersListTotal.Data = [...db[0],...db[1], ...db[2], ...db[3], ...db[4]];
usersListTotal.Data
    //.sort( (a,b) => a.sex + a.year + a.name > b.sex + b.year + b.name ? 1 : -1); //a.sex + a.age + a.totalPoints + a.name > b.sex + b.age + b.totalPoints + b.name
    .sort( (a,b) => a.id > b.id ? 1 : -1);

usersListAgregate = {Data: []};
//usersListAgregateObj = {Data: []};
let lastAgregateList = 0;
const ult = usersListTotal.Data;

//outer: 
usersListAgregate.Data.push(ult[0]);
for (let k=1; k < ult.length; k++) {
    //console.log('k',k);
    lastAgregateList=usersListAgregate.Data.length - 1;

    //if (k==0) { countAgregateList++; continue;}

    if (ult[k].id !== usersListAgregate.Data[lastAgregateList].id) {
        usersListAgregate.Data.push(ult[k]);
        continue;
    }
    else {  
        usersListAgregate.Data[lastAgregateList].totalDistances += +ult[k].totalDistances;
        usersListAgregate.Data[lastAgregateList].totalPoints += +ult[k].totalPoints;
        usersListAgregate.Data[lastAgregateList].totalStages++;
    }
    //countAgregateList++;
}

//usersListTotalJson = JSON.stringify(usersListTotal);
usersListAgregateJson = JSON.stringify(usersListAgregate);
//console.log(usersListTotal);
//console.log(usersListAgregate);

//app.listen(3000);
fs.writeFileSync("./db.json", usersListAgregateJson.toString().replace(/:\[/,':[\n').replace(/},/g,'},\n')); //$('td').html()
//fs.writeFileSync("./db2.json", usersListTotalJson.toString().replace(/:\[/,':[\n').replace(/},/g,'},\n')); //$('td').html()