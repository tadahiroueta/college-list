const crawler = require('./src/crawler');
const fs = require('fs');
const yargs = require('yargs/yargs');
const cliProgress = require('cli-progress');

const KEYS = [
    "name",
    "rank",
    "isInstitute",
    "size",
    "setting",
    "state",
    "region",
    "cost",
    "yield",
    "collegeVineChances",
    "acceptance",
    "difficulty"
]

/**
 * Gets data from multiple colleges
 * 
 * @param {string[]} colleges - Array of college names matching the collegevine.com's
 * @returns {Promise<Object[]>} - Array of objects containing college data
 */
const getCollegesData = async (colleges) => {
    // progress bar
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(colleges.length, 0);

    const browser = await crawler.getBrowser();
    let collegesData = []
    for (const college of colleges) {
        collegeData = await crawler.getCollegeData(college, browser)
        if (collegeData) collegesData.push(collegeData) // if collegeData is null, then the college name was invalid
        bar.increment()
    }
    return collegesData
}


/**
 * Converts to CSV
 * 
 * @param {Object[]} data - Array of objects containing college data
 * @returns {string} - CSV string
 */
const toCSV = (data) => {
    const csv = [ KEYS.join(',') ];

    data.forEach((row) => {
        const values = KEYS.map((key) => `"${row[key]}"`);
        csv.push(values.join(','));
    });

    return csv.join('\n');
}


// CLI commands and options
const argv = yargs(process.argv.slice(2))
    .usage('Usage: $0 <command> [options]')
    .command('scrape', 'scrape [options]')
    .example('$0 scrape Stanford-University', 'Scrapes data for Stanford University')
    .example('$0 scrape input', 'Scrapes data from input.txt')
    .alias('s', 'scrape')
    .demandOption(['s']);

const option = argv.argv.s;

(async () => {
    let data
    if (option === 'input') {
        const colleges = fs.readFileSync('data/input.txt', 'utf8').split('\r\n')
        data = await getCollegesData(colleges);
    }
    else {
        data = await getCollegesData([ option ]);
        console.log(data)
    }

    fs.writeFileSync('data/output.csv', toCSV(data));
    process.exit()
})()