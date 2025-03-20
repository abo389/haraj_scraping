import extractData from '../functions/extractData.js';
import { Cluster } from 'puppeteer-cluster';
import fs from 'fs';

const URLS = JSON.parse( fs.readFileSync( './output/urls.json', 'utf8' ) );

( async () =>
{
  const items = [];
  const cluster = await Cluster.launch( {
    concurrency: Cluster.CONCURRENCY_PAGE,
    monitor: true,
    maxConcurrency: 5
  } );

  for ( const url of URLS ) cluster.queue( url );

  // error handling
  cluster.on( 'taskerror', ( err, data, willRetry ) =>
  {
    if ( willRetry )
    {
      console.warn( `Encountered an error while crawling ${data}. ${err.message}\nThis job will be retried` );
    }
    else
    {
      console.error( `Failed to crawl ${data}: ${err.message}` );
    }
  } );
  
  await cluster.task( async ( { page, data: url } ) =>
  {
    items.push(await extractData(page, url))
  } );
  
  await cluster.idle();
  await cluster.close();
  fs.writeFileSync( './output/cluster.json', JSON.stringify( items ) );
} )();