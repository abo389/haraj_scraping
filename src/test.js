const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );

( async () =>
{
  const browser = await puppeteer.launch( {
    headless: false,
    defaultViewport: false,
    userDataDir: './tmp'
  });
  const page = await browser.newPage();
  await page.goto( 'https://haraj.com.sa', {
    waitUntil: 'load'
  } );
  await page.waitForSelector( 'button[data-testid="posts-load-more"]', {visible: true} );
  await page.click( 'button[data-testid="posts-load-more"]' );
  async function ScrapInfinety ( page, itemsCount )
  {
    let items = [];
    while ( items.length < itemsCount )
    {
      items = await page.evaluate( () =>
      {
        const elements = Array.from( document.querySelectorAll( 'div.box-border.w-full.relative > div' ) );
        return elements.map( element => {
          let title='NULL', city='NULL', img = 'NULL';
          try {
            title = element.querySelector( 'a > h3 > span' ).textContent;
          } catch ( error ) { }
          try{
            city = element.querySelector( 'div > a > span.overflow-hidden' ).textContent;
          } catch ( error ) { }
          try {
            img = element.querySelector('a > div > img' ).src;
          } catch ( error ) { }
          if ( title !== 'NULL' ) return { title, city, img }
        } );
      })

      prevHeight = await page.evaluate( 'document.body.scrollHeight' );
      await page.evaluate( 'window.scrollTo(0, document.body.scrollHeight)' );
      await page.waitForFunction( `document.body.scrollHeight > ${ prevHeight }` );
      await new Promise( resolve => setTimeout( resolve, 2000 ) );
    }
    items = items.filter( item => item !== undefined && item !== null );

    fs.writeFileSync( './output/items.json', JSON.stringify( items ) );
  }
  await ScrapInfinety( page, 10 );

  // await browser.close();
})()