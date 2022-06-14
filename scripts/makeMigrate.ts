import readlineSync from 'readline-sync';
import prompt from 'prompt';
import fs from 'fs';
import path from 'path';

const rl = readlineSync;

/*
* SAVE
* */

function saveMigrate(res, tableName)
{
    let dir = tableName[0].toUpperCase() + tableName.slice(1)
    let date = new Date();
    let dateString = date.getDate()  + "_" + (date.getMonth()+1) + "_" + date.getFullYear() + "_" + date.getHours() + "_" + date.getMinutes();

    if (!fs.existsSync(`./migrations/helpers/${dir}`)){
        fs.mkdirSync(`./migrations/helpers/${dir}`, { recursive: true})
    }

    try {
        fs.writeFileSync(
            path.resolve(__dirname,`../migrations/helpers/${dir}/${dateString}_${tableName}.js`),
            res);
        console.log(`Migrate script save - ./migrations/${dir}/${dateString}_${tableName}.js`);
        console.log('================================ END MAKE MIGRATE ================================')
        process.exit();
    } catch (err) {
        console.log('Error writing: ' + err.message);
        process.exit();
    }

}

// Ask a question
function make()
{
    let tpl;
    let tableName;
    let methodWork;

    while (!methodWork) {
        methodWork = rl.question("What your want (Update or Insert) [insert | update] \n");
        if (methodWork) {
            methodWork = methodWork.toLowerCase();
        }
    }

    while (!tableName) {
        tableName = rl.question("Pleas enter table name [example: users] \n");
        if (tableName) {
            tableName = tableName.toLowerCase();
        }
    }
    if (tableName && methodWork) {
        switch (methodWork) {
            case 'insert':
                let resIns = generateInsertTpl(tableName);
                saveMigrate(resIns, tableName);
                break;
            case 'update':
                let resUpd = generateUpdateTpl(tableName);
                saveMigrate(resUpd, tableName);
                break;
            default:
                console.log('Method invalid');
                process.exit()
        }
    } else {
        console.log('Your not enter required data for make migrate file', 'table name =' + tableName, 'method work =' + methodWork);
        process.exit();
    }

}
/*
* INSERT
* */

//work with body ins
function generateBodyTpl(lengthBody)
{
    let tableColumn = '';
    let varchar = '';
    let typeColumn = '';
    let othersSettings = '';
    let settings = '';

    console.log('ID COLUMN GENERATE AUTO');
    tableColumn = rl.question("Pleas enter column name [example: title] \n");
    if (tableColumn) {
        tableColumn = tableColumn.toLowerCase();
    }

    typeColumn = rl.question("Pleas enter type [example: VARCHAR or INT4] PLS CHECK -> https://www.geeksforgeeks.org/postgresql-data-types/ \n");
    if (typeColumn) {
        typeColumn = typeColumn.toUpperCase();
    }

    if (typeColumn === 'VARCHAR') {
        varchar = rl.question("Pleas enter varchar limit [example: 255 or empty] \n");
        if (varchar) {
            varchar = varchar.toLowerCase()
        }
    }

    othersSettings = rl.question("Pleas enter other [example: NOT NULL] \n");
    if (othersSettings) {
        othersSettings = othersSettings.toUpperCase();
    }

    let sep = (lengthBody > 0) ? ', \n' : '';
    let varcharLimit = (varchar) ? '(' + varchar + ')' : '';

    settings = sep + '' + tableColumn + ' ' + typeColumn + '' + varcharLimit + ' ' + othersSettings ;

    return settings;

}

//main func generate insert tpl
function generateInsertTpl(tableName)
{
    let body = '';
    let query = '';
    let finish = false;
    let lengthBody = 0;
    do {
        body += generateBodyTpl(lengthBody);
        lengthBody++;

        let result = rl.question("You wont add more column? [yes | no] \n");
        if (result === 'no') {
            finish = true;
        }

    } while (!finish);

    query = `
        CREATE TABLE public.${tableName} (
            id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
            ${body}
        );
    `
    let response = "module.exports = `" + query + "`;";

    return response;
}


/*
* UPDATE
* */

//work with body upd
function generateUpdateBodyTpl(lengthBody, method) {
 // ADD COLUMN contact_name VARCHAR IS NULL
 // DROP COLUMN column_name;
 // ALTER COLUMN contact_name SET NOT NULL;
    let tableColumn = '';
    let varchar = '';
    let typeColumn = '';
    let othersSettings = '';
    let settings = '';
    let varcharLimit = '';
    let sep = (lengthBody > 0) ? ', \n' : '';


        tableColumn = rl.question("Pleas enter column name [example: title] \n");
        if (tableColumn) {
            tableColumn = tableColumn.toLowerCase();
        }
   if (method !== 'delete') {
        typeColumn = rl.question("Pleas enter type [example: VARCHAR or INT4] PLS CHECK -> https://www.geeksforgeeks.org/postgresql-data-types/ \n");
        if (typeColumn) {
            typeColumn = typeColumn.toUpperCase();
        }

        if (typeColumn === 'VARCHAR') {
            varchar = rl.question("Pleas enter varchar limit [example: 255 or empty] \n");
            if (varchar) {
                varchar = varchar.toLowerCase()
            }
        }

        othersSettings = rl.question("Pleas enter other [example: NOT NULL] \n");
        if (othersSettings) {
            othersSettings = othersSettings.toUpperCase();
        }

        varcharLimit = (varchar) ? '(' + varchar + ')' : '';
    }
    switch (method) {
        case 'insert':
            settings = sep + 'ADD COLUMN ' + tableColumn + ' ' + typeColumn + '' + varcharLimit + ' ' + othersSettings ;
            break;
        case 'edit':
            settings = sep + 'ALTER COLUMN ' + tableColumn + ' ' + typeColumn + '' + varcharLimit + ' ' + othersSettings ;
            break;
        case 'delete':
            settings = 'DROP COLUMN ' + tableColumn;
            break;
    }

    return settings;
}

// main func generate update tpl
function generateUpdateTpl(tableName) {
    let methodUpdate;
    let body = '';
    let query = '';
    let finish = false;
    let lengthBody = 0;
    do {
        methodUpdate = rl.question("What your want update ? (Insert new column / Edit old column) [insert | edit | delete] \n");
        if (methodUpdate) {
            methodUpdate = methodUpdate.toLowerCase();
        }

        body += generateUpdateBodyTpl(lengthBody, methodUpdate);
        lengthBody++;

        let result = rl.question("You wont update more column? [yes | no] \n");
        if (result === 'no') {
            finish = true;
        }

    } while (!finish);


    query = `
        ALTER TABLE public.${tableName} 
        ${body};
    `;
    let response = "module.exports = `" + query + "`;";

    return response;
}

/* START */
console.log('================================ START MAKE MIGRATE ================================')
make();


