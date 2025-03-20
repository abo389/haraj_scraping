const { Cluster } = require( 'puppeteer-cluster' );
const fs = require( 'fs' );

( async () =>
{
  const items = [];
  const cluster = await Cluster.launch( {
    concurrency: Cluster.CONCURRENCY_PAGE,
    monitor: true,
    maxConcurrency: 5,
    puppeteerOptions: {
      headless: false,
      defaultViewport: false,
      userDataDir: './tmp'
    }
  } );

  for ( let i = 0; i < 10; i++ )
  {
    cluster.queue( 'https://haraj.com.sa/1115524441' + i );
  }

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
    await page.goto( url );
    let title = 'null';
    let city = 'null';
    let tag = 'null';
    let description = 'null';
    let imgs = [];

    try {
      title = await page.evaluate( () => document.querySelector( 'h1' ).textContent );
    } catch (error) {}
    try {
      city = await page.evaluate( () => document.querySelector( 'a[data-testid="post-city"] > span' ).textContent );
    } catch (error) {}
    try {
      tag = await page.evaluate( () => document.querySelector( 'div > span:last-child > span > a' ).textContent );
    } catch (error) {}
    try {
      description = await page.evaluate( () => document.querySelector( 'article[data-testid="post-article"]' ).textContent );
    } catch ( error ) { }
    try
    {
      await page.waitForSelector( 'img[data-nimg="1"]', { visible: true, timeout: 2000 } );
      imgs = await page.evaluate( () =>
      {
        const images = Array.from( document.querySelectorAll( 'img[data-nimg="1"]' ) );
        return images.map( img => img.src );
      } );
    } catch ( error ){}

    
    if ( city !== 'null' )
    {
      items.push( { title, city, tag, description, imgs } );
    }
  } );
  
  await cluster.idle();
  await cluster.close();
  fs.writeFileSync( './output/cluster.json', JSON.stringify( items ) );
} )();