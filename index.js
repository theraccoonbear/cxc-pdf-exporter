const fs = require('fs');
const sleep = require('system-sleep');
const { exec, execSync } = require("child_process");

const pexec = (cmd) => {
    return new Promise((resolve, reject) => {
        console.log(`RUN: ${cmd}`);
        exec(cmd, (err, stdout, stderr) => {
            if (err) { return reject(stderr); }
            resolve(stdout);
        });
    });
}

const run = (cmd) => {
    console.log(`RUN: ${cmd}`);
    const res = execSync(cmd);
    return res.toString();
}

const pageRgx = /Pages:\s+(?<pages>\d+)/ism;


function main() {
    const raw = fs.readFileSync('archive.json', { encoding: 'utf-8' });
    const data = JSON.parse(raw);
    let cnt = 0;
    data.map((arch) => {
        try {
            console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
            const dateStr = arch.fullText
                .replace(/^.+?\,\s+([^,]+)$/, '$1');

            const cleanTitle = [arch.title, dateStr]
                .join('-')
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/gi, '-');

            const filePath = `pdfs/${cleanTitle}.pdf`;

            if (!fs.existsSync(filePath)) {
                const initCommand = `wkhtmltopdf \'${arch.url}\' _tmp.pdf 2>/dev/null`;
                try {
                    const res1 = run(initCommand);
                } catch (initErr) {
                    // console.log(`ERROR1: ${initErr.message}`);
                }

                // sleep(250);
                
                const checkCommand = `pdfinfo _tmp.pdf`;
                const res2 = run(checkCommand);
                // console.log(res2);
                const matches = pageRgx.exec(res2);
                // console.log(matches);
                if (matches && matches.groups && matches.groups.pages) {
                    const pages = parseInt(matches.groups.pages);
                    const mmHeight = 297 * pages;
                    const finalCommand = `wkhtmltopdf -T 0 -B 0 --page-width 210mm --page-height ${mmHeight}mm \'${arch.url}\' ${filePath} 2>/dev/null`;
                    try {
                        const res3 = run(finalCommand);
                    } catch (finalErr) {
                        // console.log(`ERROR2: ${finalErr.message}`);
                    }
                } else {
                    
                    console.log(`NO PAGES! ${filePath}`);
                    process.exit(0);
                }
            } else {
                console.log(`SKIPPING: ${filePath}`);
            }
        } catch (err) {
            console.error('ERROR:', err);
        }
        cnt++;
        const per = (cnt /data.length) * 100;
        console.log(`${cnt}/${data.length} ${per.toFixed(1)}% complete`);
    });
}

main();