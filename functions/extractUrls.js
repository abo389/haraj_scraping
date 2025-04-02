export default async function extractUrls ( page, url, n )
{
  let all = [];
  await page.goto( url, { waitUntil: 'load' } );

  try
  {
    await page.waitForSelector( 'button[data-testid="posts-load-more"]', { visible: true, timeout: 5000 } );
    await page.focus( 'button[data-testid="posts-load-more"]' );
    await page.click( 'button[data-testid="posts-load-more"]' );
    await page.click( 'button[data-testid="posts-load-more"]' );
  } catch ( error ) { }

  let ids = [];
  let prevHeight = 0;
  let selector = 'div.bg-background-card.min-h-screen.w-full > div > div > div.box-border.w-full.relative';

  while ( ids.length < +n )
  {
    ids = await page.evaluate( ( selector ) =>
    {
      const elements = Array.from( document.querySelectorAll( `${ selector } > div[data-testid="post-item"]` ) );
      return elements
        .map( element => element.getAttribute( 'data-test-postid' ) )
        .filter( id => id && id !== 'NULL' )
        .map( id => `https://haraj.com.sa/11${ id }` );
    }, selector );

    prevHeight = await page.evaluate( ( selector ) =>
    {
      return document.querySelector( selector )?.scrollHeight || 0;
    }, selector );

    await page.evaluate( ( selector ) =>
    {
      const element = document.querySelector( selector );
      if ( element ) window.scrollTo( 0, element.scrollHeight ); 
    }, selector );

    await page.waitForFunction(
      ( selector, prevHeight ) => document.querySelector( selector )?.scrollHeight > prevHeight,
      { timeout: 5000 },
      selector, prevHeight
    ).catch( () => { } );

    await new Promise( resolve => setTimeout( resolve, 2000 ) );
  }

  ids = ids.slice( 0, +n );
  all.push( ...ids );

  return all;
}
