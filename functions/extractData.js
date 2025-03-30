import convertArabicRelativeTimeToISO from "./convertArabicRelativeTimeToISO.js";

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

  let title = "N/A", city = "N/A", description = "N/A", description_en = "N/A", time = "N/A", price = "N/A";
  let tags = [], imgs = [], reviews = [];

  try
  {
    title = await page.evaluate( () => document.querySelector( 'h1' )?.textContent || "N/A" );
  } catch ( error ) { }

  try
  {
    city = await page.evaluate( () => document.querySelector( 'a > span.city' )?.textContent || "N/A" );
  } catch ( error ) { }

  try
  {
    price = await page.evaluate( () => document.querySelector( 'strong.text-text-primary' )?.textContent || "N/A" );
  } catch ( error ) { }

  try
  {
    if ( await page.$( 'p.block.max-w-full.overflow-hidden.break-words' ) )
    {
      reviews = await page.evaluate( () =>
        Array.from( document.querySelectorAll( 'p.block.max-w-full.overflow-hidden.break-words' ) )
          .map( comment => comment.textContent )
      );
    }
  } catch ( error ) { }

  try
  {
    if ( await page.$( 'div.items-enter.bg-background-card.mt-5.flex.w-full.flex-wrap.justify-start.rounded-xl.px-7.py-5 > a' ) )
    {
      tags = await page.evaluate( () =>
        Array.from( document.querySelectorAll( 'div.items-enter.bg-background-card.mt-5.flex.w-full.flex-wrap.justify-start.rounded-xl.px-7.py-5 > a' ) )
          .map( tag => tag.textContent )
      );
    }
  } catch ( error ) { }

  try
  {
    description = await page.evaluate( () => document.querySelector( 'article[data-testid="post-article"]' )?.textContent || "N/A" );
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
    description_en = await page.evaluate( () =>
      document.querySelector( 'article[data-testid="post-article"].moveLeft' )?.textContent || "N/A"
    );
  } catch ( error ) { }


  try
  {
    if ( await page.$( 'span[data-testid="post-time"]' ) )
    {
      time = await page.evaluate( () => document.querySelector( 'span[data-testid="post-time"]' ).textContent );
      if ( time && time !== "N/A" )
      {
        time = convertArabicRelativeTimeToISO( time );
      }
    }
  } catch ( error ) { }

  try
  {
    if ( await page.$( 'img[data-nimg="1"]' ) )
    {
      imgs = await page.evaluate( () =>
        Array.from( document.querySelectorAll( 'img[data-nimg="1"]' ) )
          .map( img => img.src )
          .filter( img => img && img.startsWith( "http" ) ) // Remove empty/broken links
      );
    }
  } catch ( error ) { }

  return { title, city, price, time, description, description_en, url, tags, reviews, imgs };
}
