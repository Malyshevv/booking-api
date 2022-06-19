import readlineSync from 'readline-sync';
import fs from 'fs';
import path from 'path';


class View {

    public nameView;
    public viewPath;
    public rl;

    constructor() {
        this.viewPath = path.resolve(__dirname,`../views/pages`);
        this.rl = readlineSync;
    }

    public async saveView() {

        if (!fs.existsSync(this.viewPath)){
            await fs.promises.mkdir(this.viewPath, {recursive: true}).catch(err => {
                throw err;
            });
        }

        let tpl =
        '<div class="container">' + '\n' +
            '<div class="jumbotron mt-3">' + '\n' +
                '<h1>Auto generate</h1>' + '\n' +
                '<p class="lead">Your generate this page</p>' + '\n' +
                '<a class="btn btn-lg btn-primary" href="/" role="button">Go home »</a>' + '\n' +
            '</div>' + '\n' +
        '</div>';

        await fs.appendFileSync(`${this.viewPath}/${this.nameView}.hbs`, tpl);

        return true;
    }

    public make()
    {

        while (!this.nameView) {
            this.nameView = this.rl.question("Pleas enter view name [example: contact] \n");
            if (this.nameView) {
                this.nameView = this.nameView.toLowerCase();
            }
        }

        if (this.nameView) {
            let save= this.saveView();
            if (save) {
                console.log('========= complete ===========')
                process.exit();
            }
        } else {
            console.log('View name required');
            process.exit();
        }

    }

}

/* START */
console.log('================================ START MAKE VIEW ================================');
new View().make();
