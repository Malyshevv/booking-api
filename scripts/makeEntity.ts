import readlineSync from 'readline-sync';
import fs from 'fs';
import path from 'path';

class Entity
{
    public rl;
    public replace;
    public entityName;
    public routerPath;
    public allRoutersFile;
    public serverFile;
    public controllerPath;
    public controllerAllFiles;

    constructor()
    {
        this.routerPath = path.resolve(__dirname,`../routes`);
        this.allRoutersFile =  path.resolve(__dirname,`../routes/allRoutes.ts`);
        this.serverFile = path.resolve(__dirname,`../Server.ts`);
        this.controllerPath = path.resolve(__dirname,`../controllers`);
        this.replace = require('line-replace');
        this.controllerAllFiles =  path.resolve(__dirname,`../controllers/index.ts`);
        this.rl = readlineSync;
    }

    public async appendData(path, file, type, json, line, tpl, newLine, doubleCall) {

        let res = await this.replace({
            file: path,
            line: line,
            text: tpl,
            addNewLine: newLine,
            callback: async ({ files, line, text, replacedText, error }) => {
                if (error) {
                    console.log(error)
                    process.exit();
                }
                console.log(`Edit file complete ${path} on line ${line}`);
                if (doubleCall) {
                    switch (type) {
                        case 'allRoutersImport':
                            let findImport = await this.findStringInFile(this.allRoutersFile, '/*Generate Import*/')
                            if (findImport) {
                                let importAllRoutesText = `${file[findImport]}\n${json.allRoutes.import}`;
                                await this.appendData(
                                    this.allRoutersFile,
                                    file,
                                    'bodyServer',
                                    json,
                                    findImport+1,
                                    importAllRoutesText,
                                    true,
                                    true
                                );
                            }
                            break;
                        case 'bodyServer':
                            let findBodyServer = await this.findStringInFile(this.serverFile, '/*Generate Body*/')
                            if (findBodyServer) {
                                let serverFile = fs.readFileSync(this.serverFile).toString().split("\n");
                                let bodyAllRoutesText = `\n        ${json.routes.bodyServer}`;
                                await this.appendData(
                                    this.serverFile,
                                    serverFile,
                                    'importServer',
                                    json,
                                    findBodyServer+1,
                                    bodyAllRoutesText,
                                    true,
                                    true
                                );
                            }
                            break;
                        case 'importServer':
                            let findImportServer = await this.findStringInFile(this.serverFile, '/*Generate Import*/')
                            if (findImportServer) {
                                let serverFile = fs.readFileSync(this.serverFile).toString().split("\n");
                                let importAllRoutesText = `${file[findImportServer]}\n    ${json.allRoutes.name},`;
                                await this.appendData(
                                    this.serverFile,
                                    serverFile,
                                    null,
                                    null,
                                    findImportServer+1,
                                    importAllRoutesText,
                                    true,
                                    false
                                );
                            }
                            break;
                        case 'constController':
                            let findControllerConst = await this.findStringInFile(this.controllerAllFiles, '/*Generate Const*/')
                            if (findControllerConst) {
                                let constAllRoutesText = `${file[findControllerConst]}\n${json.controller.const}`;
                                await this.appendData(
                                    this.controllerAllFiles,
                                    file,
                                    null,
                                    json,
                                    findControllerConst+1,
                                    constAllRoutesText,
                                    false,
                                    false
                                );
                            }
                            break;
                        case 'importController':
                            let findControllerImport = await this.findStringInFile(this.controllerAllFiles, '/*Generate Import*/')
                            if (findControllerImport) {
                                let importAllRoutesText = `${file[findControllerImport]}\n${json.controller.import}`;
                                await this.appendData(
                                    this.controllerAllFiles,
                                    file,
                                    'constController',
                                    json,
                                    findControllerImport+1,
                                    importAllRoutesText,
                                    true,
                                    true
                                );
                            }
                            break;
                    }
                }
            }
        });
        return res;
    }

    public async findStringInFile(file, text)
    {
        let index = 0;
        let data = fs.readFileSync(file).toString().split("\n");
        data.forEach(function (value, i) {
            if (value.includes(text)) {
                index = i + 1;
            }
        });

        return index !== 0 ? index : false;
    }

    public async appendController(entityName, data, lineBody)
    {
        if (!fs.existsSync(`${this.controllerPath}/${entityName}`)){
            await fs.promises.mkdir(`${this.controllerPath}/${entityName}`, {recursive: true}).catch(err => {
                throw err;
            });
        }

        await fs.promises.appendFile(`${this.controllerPath}/${entityName}/${entityName}.controller.ts`, data.controller.tpl)
            .then((res) => {
                console.log('Controller file and dir create');
            })
            .catch((err) => {
                console.log(err);
                process.exit();
            });

        let controllerAllFiles = fs.readFileSync(this.controllerAllFiles).toString().split("\n");
        let bodyAllControllerText = `${controllerAllFiles[lineBody]}\n    ${data.controller.body}, \n`;

        await this.appendData(this.controllerAllFiles, controllerAllFiles, 'importController', data, lineBody + 1, bodyAllControllerText, false, true)
    }

    public async appendRoutes(entityName, data, lineBody)
    {
        if (!fs.existsSync(`${this.routerPath}/${entityName}`)){
            await fs.promises.mkdir(`${this.routerPath}/${entityName}`, {recursive: true}).catch(err => {
                throw err;
            });
        }

        await fs.promises.appendFile(`${this.routerPath}/${entityName}/router${entityName}.ts`, data.routes.tpl)
            .then((res) => {
                console.log('Router file and dir create');
            })
            .catch((err) => {
                console.log(err);
                process.exit();
            });

        let allRoutesFile = fs.readFileSync(this.allRoutersFile).toString().split("\n");
        let bodyAllRoutesText = `${allRoutesFile[lineBody]}\n    ${data.allRoutes.body}, \n`;

        await this.appendData(this.allRoutersFile, allRoutesFile, 'allRoutersImport', data, lineBody + 1, bodyAllRoutesText, false, true)

    }

    public async saveEntity(res, entityName)
    {
        entityName = entityName[0].toUpperCase() + entityName.slice(1);
        let resController;
        let resRouter;

        let findGenerateStringRouter = await this.findStringInFile(this.allRoutersFile, '/*Generate Body*/')
        if (findGenerateStringRouter) {
            resRouter = await this.appendRoutes(entityName, res, findGenerateStringRouter)
        }

        let findGenerateStringController = await this.findStringInFile(this.controllerAllFiles, '/*Generate Body*/')
        if (findGenerateStringController) {
            resController = await this.appendController(entityName, res, findGenerateStringController)
        }

        return resRouter && resController ? true : false;
    }

    public make()
    {

        while (!this.entityName) {
            this.entityName = this.rl.question("Pleas enter table name [example: users] \n");
            if (this.entityName) {
                this.entityName = this.entityName.toLowerCase();
            }
        }
        if (this.entityName) {
            let res = this.generateEntityTpl(this.entityName);
            let save= this.saveEntity(res, this.entityName);
            if (save) {
                console.log('========= complete ===========')
                process.exit();
            }
        } else {
            console.log('Entity name required');
            process.exit();
        }

    }

    public generateEntityTpl(entityName)
    {
        let entityNameFirstBig = entityName[0].toUpperCase() + entityName.slice(1);

        let tplImportAllRoutes = `import { router as ${entityName}Router } from './${entityNameFirstBig}/router${entityNameFirstBig}';`;
        let tplBodyAllRoutes = `${entityName}Router`;

        let jwtRequire = '';
        while (!jwtRequire) {
            jwtRequire = this.rl.question("JWT auth required ? [yes | no] \n");
            if (jwtRequire) {
                jwtRequire = jwtRequire.toLowerCase();
            }
        }

        let tplBodyServer;
        if (jwtRequire === 'yes') {
            tplBodyServer = `this.app.use('/api/${entityName}',verifyToken, ${entityName}Router);`;
        } else {
            tplBodyServer = `this.app.use('/api/${entityName}',verifyToken, ${entityName}Router);`;
        }

let tplRoutes = `
import express from 'express';
import { ${entityName}Controller } from '../../controllers';
            
export const router = express.Router({
    strict: true
});
            
router.get('/', (req, res) => {
    ${entityName}Controller.read(req, res);
});
`;

        let tplImportControllerMain = `import { ${entityNameFirstBig}Controller } from './${entityNameFirstBig}/${entityNameFirstBig}.controller';`;
        let tplConstControllerMain = `const ${entityName}Controller = new ${entityNameFirstBig}Controller();`;
        let tplBodyControllerMain = `${entityName}Controller`;

        let tplController = `
import { Request, Response } from 'express';
import { MainController } from '../MainController';
import {sendQuery} from "../../config/db.config";
import {globalMessages} from "../../config/globalMessages";

export class ${entityNameFirstBig}Controller extends MainController {
    /*Не забываем конструктор*/
    constructor(){
        super();
    }
        
    public async create(req: Request, res: Response): Promise<void> {
        this.logger.error(globalMessages['api.not_found.method'], req);
        res.status(500).json(globalMessages['api.not_found.method']);
    }
            
    public async read(req: Request, res: Response): Promise<void> {
        this.logger.error(globalMessages['api.not_found.method'], req);
        res.status(500).json(globalMessages['api.not_found.method']);
    }
        
    public async update(req: Request, res: Response): Promise<void> {
        this.logger.error(globalMessages['api.not_found.method'], req);
        res.status(500).json(globalMessages['api.not_found.method']);
    }
        
    public async delete(req: Request, res: Response): Promise<void> {
        this.logger.error(globalMessages['api.not_found.method'], req);
        res.status(500).json(globalMessages['api.not_found.method']);
    }
        
    public async readAll(req: Request, res: Response): Promise<void> {
        this.logger.error(globalMessages['api.not_found.method'], req);
        res.status(500).json(globalMessages['api.not_found.method']);
    }
}`;


        let res = {
            'allRoutes': {
                'name': `${entityName}Router`,
                'body': tplBodyAllRoutes,
                'import': tplImportAllRoutes
            },
            'routes': {
                'bodyRoutes': tplBodyAllRoutes,
                'bodyServer': tplBodyServer,
                'tpl': tplRoutes
            },
            'controller': {
                'import': tplImportControllerMain,
                'const': tplConstControllerMain,
                'body': tplBodyControllerMain,
                'tpl': tplController
            }
        }

        return res;
    }
}

/* START */
console.log('================================ START MAKE ENTITY ================================');
new Entity().make();
