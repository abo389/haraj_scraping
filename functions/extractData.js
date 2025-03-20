import convertArabicRelativeTimeToISO from "./convertArabicRelativeTimeToISO.js";
export default async function extractData ( page, url )
{
  await page.goto( url );
  let title = 'null', city = 'null', description = 'null', time = 'null';
  let tags = [], imgs = [], reviews = [];

  try
  {
    title = await page.evaluate( () => document.querySelector( 'h1' ).textContent );
  } catch ( error ) { }
  try
  {
    city = await page.evaluate( () => document.querySelector( 'a[data-testid="post-city"] > span' ).textContent );
  } catch ( error ) { }
  try
  {
    await page.waitForSelector( 'p.block.max-w-full.overflow-hidden.break-words', { visible: true, timeout: 2000 } );
    reviews = await page.evaluate( () =>
    {
      const comments = Array.from( document.querySelectorAll( 'p.block.max-w-full.overflow-hidden.break-words' ) );
      return comments.map( comment => comment.textContent );
    } );

  } catch ( error ) { }
  try
  {
    await page.waitForSelector( 'div.items-enter.bg-background-card.mt-5.flex.w-full.flex-wrap.justify-start.rounded-xl.px-7.py-5 > a', { visible: true, timeout: 2000 } );
    tags = await page.evaluate( () =>
    {
      const tags = Array.from( document.querySelectorAll( 'div.items-enter.bg-background-card.mt-5.flex.w-full.flex-wrap.justify-start.rounded-xl.px-7.py-5 > a' ) );
      return tags.map( tag => tag.textContent );
    } );
  } catch ( error ) { }
  try
  {
    description = await page.evaluate( () => document.querySelector( 'article[data-testid="post-article"]' ).textContent );
  } catch ( error ) { }
  try
  {
    await page.waitForSelector( 'span[data-testid="post-time"]', { visible: true, timeout: 2000 } );
    time = await page.evaluate( () =>
    {
      return document.querySelector( 'span[data-testid="post-time"]' ).textContent;
    } );
    time = convertArabicRelativeTimeToISO( time );
  } catch ( error ) { }
  try
  {
    await page.waitForSelector( 'img[data-nimg="1"]', { visible: true, timeout: 2000 } );
    imgs = await page.evaluate( () =>
    {
      const images = Array.from( document.querySelectorAll( 'img[data-nimg="1"]' ) );
      return images.map( img => img.src );
    } );
  } catch ( error ) { }


  if ( city !== 'null' ) return { title, city, time, description, url, tags, reviews, imgs } ;
}