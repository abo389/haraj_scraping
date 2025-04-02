const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );
const { Cluster } = require( 'puppeteer-cluster' );
const { default: extractUrls } = require( '../functions/extractUrls' );
const { default: extractData } = require( '../functions/extractData' );

let URLS = [];

( async () =>
{
  // Step 1: Extract URLs
  const browser = await puppeteer.launch( {
    headless: false,
    defaultViewport: null,
    userDataDir: './tmp',
  } );
  const page = await browser.newPage();
  URLS = await extractUrls( page, 'https://haraj.com.sa/', 20 );
  await browser.close();

  if ( URLS.length === 0 )
  {
    console.error( "Error: No URLs extracted." );
    process.exit( 1 );
  }
  console.log( `✅ Successfully saved ${ URLS.length } extracted URLs.` );
  
  // Step 2: Process extracted URLs using Puppeteer Cluster
  const items = [];
  const cluster = await Cluster.launch( {
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 1,
    monitor: true,
    puppeteerOptions: {
      headless: false,
      defaultViewport: null,
      userDataDir: './tmp',
    }
  } );

  cluster.on( 'taskerror', ( err, data, willRetry ) =>
  {
    if ( willRetry )
    {
      console.warn( `Encountered an error while crawling ${ data }. ${ err.message }\nThis job will be retried.` );
    } else
    {
      console.error( `Failed to crawl ${ data }: ${ err.message }` );
    }
  } );

  await cluster.task( async ( { page, data: url } ) =>
  {
    try
    {
      let data = await extractData( page, url );
      if ( data )
      {
        items.push( data );
      } else
      {
        console.warn( `No data extracted from ${ url }` );
      }
    } catch ( error )
    {
      console.error( `Error processing ${ url }: ${ error.message }` );
    }
  } );

  for ( const url of URLS ) cluster.queue( url );

  await cluster.idle();
  await cluster.close();

  if ( items.length > 0 )
  {
    fs.writeFileSync( './output/cluster.json', JSON.stringify( items, null, 2 ) );
    console.log( `✅ Successfully saved ${ items.length } extracted items.` );
    console.log( 'Items without English description: ' + items.filter( e => e.description.en === 'N/A' ).length );
  } else
  {
    console.warn( "⚠️ No items were extracted." );
  }
} )();
