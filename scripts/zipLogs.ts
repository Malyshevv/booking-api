import path from 'path';
import AdmZip  from 'adm-zip';

async function createZipArchive() {
    try {
        const zip = new AdmZip();
        let date = new Date();
        let dateString = date.getDate()  + "_" + (date.getMonth()+1) + "_" + date.getFullYear() + "_" + date.getHours() + "_" + date.getMinutes();
        const outputFile = path.resolve(__dirname,`../logger/log/${dateString}_logs.zip`);
        const pathLogs = path.resolve(__dirname,`../logger/log/`);

        zip.addLocalFolder(pathLogs);
        zip.writeZip(outputFile);

        console.log(`Created ${outputFile} successfully`);
    } catch (e) {
        console.log(`Something went wrong. ${e}`);
    }
}

createZipArchive();
