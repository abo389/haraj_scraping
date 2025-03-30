const { Cluster } = require( 'puppeteer-cluster' );
const fs = require( 'fs' );
const all = [];

const urls = [
  'https://haraj.com.sa/tags/%D8%AD%D8%B1%D8%A7%D8%AC%20%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA/',
  'https://haraj.com.sa/tags/%D8%AD%D8%B1%D8%A7%D8%AC%20%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1/',
  'https://haraj.com.sa/tags/%D8%AD%D8%B1%D8%A7%D8%AC%20%D8%A7%D9%84%D8%A3%D8%AC%D9%87%D8%B2%D8%A9/'
];

( async () =>
{
  const cluster = await Cluster.launch( {
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 3,
    monitor: true,
    puppeteerOptions: {
      headless: false,
      defaultViewport: false,
      userDataDir: './tmp'
    }
  } );

  cluster.on( 'taskerror', ( err, data ) =>
  {
    console.error( `Error while crawling ${ data }: ${ err.message }` );
  } );

  // Define the cluster task before queueing
  await cluster.task( async ( { page, data: url } ) =>
  {
    await page.goto( url, { waitUntil: 'load' } );

    try
    {
      await page.waitForSelector( 'button[data-testid="posts-load-more"]', { visible: true, timeout: 5000 } );
      await page.click( 'button[data-testid="posts-load-more"]' );
      await page.click( 'button[data-testid="posts-load-more"]' );
    } catch ( error )
    {
      console.warn( `Load More button not found or already clicked.` );
    }

    async function ScrapInfinety ( page, itemsCount )
    {
      let ids = [];
      let prevHeight = 0; // Define prevHeight properly
      while ( ids.length < itemsCount )
      {
        ids = await page.evaluate( () =>
        {
          const elements = Array.from( document.querySelectorAll( 'div.box-border.w-full.relative > div[data-testid="post-item"]' ) ).slice( 0, 10 );
          return elements
            .map( element => element.getAttribute( 'data-test-postid' ) )
            .filter( id => id && id !== 'NULL' )
            .map( id => `https://haraj.com.sa/11${ id }` );
        } );

        prevHeight = await page.evaluate( () => document.body.scrollHeight );
        await page.evaluate( () => window.scrollTo( 0, document.body.scrollHeight ) );
        await page.waitForFunction( `document.body.scrollHeight > ${ prevHeight }`, { timeout: 5000 } ).catch( () => { } );
        await new Promise( resolve => setTimeout( resolve, 2000 ) );
      }

      all.push( ...ids );
    }

    await ScrapInfinety( page, 10 );
  } );

  // Queue URLs after defining the cluster task
  for ( const url of urls )
  {
    cluster.queue( url );
  }

  await cluster.idle();
  await cluster.close();

  console.log( `Total collected URLs: ${ all.length }` );

  // Ensure output directory exists
  fs.mkdirSync( './output', { recursive: true } );
  fs.writeFileSync( './output/urls.json', JSON.stringify( all, null, 2 ) );
} )();
