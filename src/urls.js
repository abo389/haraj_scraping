const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );
const { default: extractUrls } = require( '../functions/extractUrls' );
let data = [];

( async () => {
  const browser = await puppeteer.launch( {
    // headless: false,
    userDataDir: './tmp',
  });
  const page = await browser.newPage();
  data = await extractUrls( page, 'https://haraj.com.sa/', 20 );
  await browser.close();
  fs.writeFileSync( './output/urls-11.json', JSON.stringify( data, null, 2 ) );
  console.log( `✅ Successfully saved ${ data.length } extracted items.` );
})()