const { default: extractData } = require( '../functions/extractData.js' );
const { Cluster } = require( 'puppeteer-cluster' );
const fs = require( 'fs' );
const urlsFile = './output/urls-11.json';
let URLS = [];



if ( fs.existsSync( urlsFile ) )
{
  try
  {
    URLS = JSON.parse( fs.readFileSync( urlsFile, 'utf8' ) );
    if ( !Array.isArray( URLS ) || URLS.length === 0 )
    {
      console.error( "Error: urls.json is empty or not an array." );
      process.exit( 1 );
    }
  } catch ( error )
  {
    console.error( "Error parsing urls.json:", error.message );
    process.exit( 1 );
  }
} else
{
  console.error( "Error: urls.json file not found." );
  process.exit( 1 );
}

( async () =>
{
  const items = [];
  const cluster = await Cluster.launch( {
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 1,
    monitor: true,
    puppeteerOptions: {
      // executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      // userDataDir: "C:\\Users\\abdulrahman\\AppData\\Local\\Google\\Chrome\\User Data",
      // args: [ "--profile-directory=Default" ],
      headless: false,
      defaultViewport: null,
    }
  } );

  // Error handling
  cluster.on( 'taskerror', ( err, data, willRetry ) =>
  {
    if ( willRetry )
    {
      console.warn( `Encountered an error while crawling ${ data }. ${ err.message }\nThis job will be retried` );
    } else
    {
      console.error( `Failed to crawl ${ data }: ${ err.message }` );
    }
  } );

  // Define cluster task
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

  // Queue all URLs
  for ( const url of URLS ) cluster.queue( url );

  await cluster.idle();
  await cluster.close();

  // Save extracted data
  if ( items.length > 0 )
  {
    fs.writeFileSync( './output/cluster.json', JSON.stringify( items, null, 2 ) );
    console.log( `✅ Successfully saved ${ items.length } extracted items.` );
    console.log( 'items without en description: ' + items.filter( e => e.description.en == 'N/A' ).length )
  } else
  {
    console.warn( "⚠️ No items were extracted." );
  }
} )();
