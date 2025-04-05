const express = require( 'express' );
const http = require( 'http' );
const { Server } = require( 'ws' );
const cors = require( 'cors' );
const puppeteer = require( 'puppeteer' );
const { Cluster } = require( 'puppeteer-cluster' );
const { default: extractUrls } = require( './functions/extractUrls' );
const { default: extractData } = require( './functions/extractData' );

const app = express();
const server = http.createServer( app );
const wss = new Server( { server } );

app.use( cors() );
app.use( express.json() );

// Broadcast function to send progress updates
function broadcast ( data )
{
  wss.clients.forEach( client =>
  {
    if ( client.readyState === 1 )
    {
      client.send( JSON.stringify( data ) );
    }
  } );
}

// Scraping endpoint
app.post( '/scrape', async ( req, res ) =>
{
  const { url, number } = req.body;
  if ( !url || !number )
  {
    return res.status( 400 ).json( { error: 'Missing URL or number' } );
  }

  broadcast( { step: 'start', message: '🚀 Scraping started!', progress: 0 } );

  const browser = await puppeteer.launch( {
    userDataDir: './tmp',
    args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
  } );
  const page = await browser.newPage();

  broadcast( { step: 'extracting_urls', message: '📡 Extracting URLs...', progress: 10 } );

  let urls = await extractUrls( page, url, parseInt( number ) );
  await browser.close();

  if ( urls.length === 0 )
  {
    broadcast( { step: 'error', message: '⚠️ No URLs found!', progress: 0 } );
    return res.status( 500 ).json( { error: 'No URLs extracted' } );
  }

  broadcast( { step: 'urls_extracted', message: `✅ Extracted ${ urls.length } URLs!`, progress: 20 } );

  const items = [];
  const cluster = await Cluster.launch(
    {
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: 2,
      puppeteerOptions: {
        userDataDir: './tmp',
        args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
      },
    } );

  let processed = 0;
  await cluster.task( async ( { page, data: url } ) =>
  {
    let extractedData = await extractData( page, url );
    if ( extractedData )
    {
      items.push( extractedData );
      processed++;
      broadcast( {
        step: 'extracting_data',
        message: `📊 Extracting data... (${ processed }/${ urls.length })`,
        progress: Math.round( ( processed / urls.length ) * 100 )
      } );
    }
  } );

  for ( const u of urls ) cluster.queue( u );
  await cluster.idle();
  await cluster.close();

  broadcast( { step: 'completed', message: `✅ Scraping complete!`, progress: 100, finalResponse: items } );

  res.json( { message: 'Scraping in progress, check WebSocket for updates' } );
} );

// Start server
const PORT = 3000;
server.listen( PORT, () =>
{
  console.log( `🚀 Server running on http://localhost:${ PORT }` );
} );
