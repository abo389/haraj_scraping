import convertEnglishRelativeTimeToISO from "./convertEnglishRelativeTimeToISO.js";

async function s (s)
{
    return await page.evaluate( () => document.querySelector( s )?.textContent );
}

const cookie = {
  name: 'Next-Locale',
  value: 'en',
  domain: 'haraj.com.sa',
  path: '/',
  httpOnly: false,
  secure: false
};
export default async function extractData ( page, url )
{
  await page.setCookie( cookie );
  await page.goto( url, { waitUntil: "load" } );

  const data = {
    title: "N/A",
    city: "N/A",
    price: "N/A",
    tags: [],
    imgs: [],
    reviews: [],
    phone: [],
    author: {
      name: "N/A",
      url: "N/A"
    },
    time: {
      native: "N/A",
      iso: "N/A"
    },
    description: {
      ar: "N/A",
      en: "N/A" 
    }
  }

  data.city = await s( 'a > span.city' );
  if(data.city === "N/A") return null;
  data.title = await s( 'h1' );
  data.price = await s( 'strong.text-text-primary' );
  data.description.ar = await s( 'article[data-testid="post-article"]' );

  try
  {
    if ( await page.$( 'p.block.max-w-full.overflow-hidden.break-words' ) )
    {
      data.reviews = await page.evaluate( () =>
        Array.from( document.querySelectorAll( 'p.block.max-w-full.overflow-hidden.break-words' ) )
          .map( comment => comment?.textContent )
      );
    }
  } catch ( error ) { }

  try
  {
    if ( await page.$( 'div.items-enter.bg-background-card.mt-5.flex.w-full.flex-wrap.justify-start.rounded-xl.px-7.py-5 > a' ) )
    {
      data.tags = await page.evaluate( () =>
        Array.from( document.querySelectorAll( 'div.items-enter.bg-background-card.mt-5.flex.w-full.flex-wrap.justify-start.rounded-xl.px-7.py-5 > a' ) )
          .map( tag => tag.textContent )
      );
    }
  } catch ( error ) { }

  try
  {
    await page.waitForSelector( '#translate_btn', { visible: true, timeout: 1000 } );
    await page.focus( '#translate_btn' );
    await page.click( '#translate_btn' );
    await page.evaluate( () =>
    {
      const translateButton = document.querySelector( '#translate_btn' );
      const tt = document.querySelector( '#translate_btn > span' ).textContent;
      if ( tt === 'Translate post' )
      {
        translateButton.click();
      }
    } );
    await page.waitForSelector( 'article[data-testid="post-article"].moveLeft', { visible: true, timeout: 5000 } );
    data.description.en = await page.evaluate( () =>
      document.querySelector( 'article[data-testid="post-article"].moveLeft' )?.textContent || "N/A"
    );
  } catch ( error ) { }


  try
  {
    data.time.native = await page.evaluate( () =>
    {
      const selectors = [
        'span[data-testid="post-time"]',
        'span > div > div > span'
      ];
      for ( const selector of selectors )
      {
        const element = document.querySelector( selector );
        if ( element && element.textContent.trim() )
        {
          return element.textContent.trim();
        }
      }
      return "N/A";
    } );
    if ( data.time.native !== "N/A" ) data.time.iso = convertEnglishRelativeTimeToISO( data.time.native );
  } catch ( error ) { }

  try
  {
    if ( await page.$( 'img[data-nimg="1"]' ) )
    {
      data.imgs = await page.evaluate( () =>
        Array.from( document.querySelectorAll( 'img[data-nimg="1"]' ) )
          .map( img => img.src )
          .filter( img => img && img.startsWith( "http" ) )
      );
    }
  } catch ( error ) { }

  try
  {
    if ( data.description.en !== "N/A" )
    {
      const regex = /\b05\d{8}\b/g;
      const matches = data.description.en.match( regex );
      if ( matches ) data.phone = [ ...matches ];
    }
  } catch ( error ) { }

  try
  {
    data.author.name = await page.evaluate( () => document.querySelector( 'a[data-testid="post-author"]' )?.textContent || "N/A" );
    data.author.url = await page.evaluate( () => document.querySelector( 'a[data-testid="post-author"]' )?.href || "N/A" );
  } catch ( error ) { }

  return data;
}
