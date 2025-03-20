const { Cluster } = require( 'puppeteer-cluster' );
const fs = require( 'fs' );
const all = [];

const urls = [
  'https://haraj.com.sa/tags/%D8%AD%D8%B1%D8%A7%D8%AC%20%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA/',
  'https://haraj.com.sa/tags/%D8%AD%D8%B1%D8%A7%D8%AC%20%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1/',
  'https://haraj.com.sa/tags/%D8%AD%D8%B1%D8%A7%D8%AC%20%D8%A7%D9%84%D8%A3%D8%AC%D9%87%D8%B2%D8%A9/'
];

( async () => {
  const cluster = await Cluster.launch( {
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 3,
    monitor: true,
    // puppeteerOptions: {
    //   headless: false,
    //   defaultViewport: false,
    //   userDataDir: './tmp'
    // }
  } );

  for (const url of urls) {
    cluster.queue( url );
  }

  cluster.on('taskerror', ( err, data, willRetry ) => {
      console.error(`Encountered an error while crawling ${data}: ${err.message}`);
  });

  await cluster.task( async ( { page, data: url } ) =>
  {
    await page.goto( url, {
      waitUntil: 'load'
    } );
    await page.waitForSelector( 'button[data-testid="posts-load-more"]', { visible: true } );
    try {
      await page.click( 'button[data-testid="posts-load-more"]' );
      await page.click( 'button[data-testid="posts-load-more"]' );
    } catch (error) { }
    async function ScrapInfinety ( page, itemsCount )
    {
      let ids = [];
      while ( ids.length < itemsCount )
      {
        ids = await page.evaluate( () =>
        {
          const elements = Array.from( document.querySelectorAll( 'div.box-border.w-full.relative > div[data-testid="post-item"]' ) );
          return elements.map( element =>
          {
            let id = 'NULL' ;
            try
            {
              id = element.getAttribute( 'data-test-postid' );
            } catch ( error ) { }
            if ( id !== 'NULL' && id !== null && id !== undefined ) return 'https://haraj.com.sa/11'+id;
          } );
        } );

        prevHeight = await page.evaluate( 'document.body.scrollHeight' );
        await page.evaluate( 'window.scrollTo(0, document.body.scrollHeight)' );
        await page.waitForFunction( `document.body.scrollHeight > ${ prevHeight }` );
        await new Promise( resolve => setTimeout( resolve, 2000 ) );
      }
      all.push( ...ids );
    }
    await ScrapInfinety( page, 10 );

  } );

  await cluster.idle();
  await cluster.close();
  console.log( all.length )
  fs.writeFileSync( './output/urls.json', JSON.stringify( all ) );
} )();