const ws = new WebSocket( 'ws://localhost:3000' );
let isProcessing = false;

const container = document.querySelector( '.container' );
const btnText = document.getElementById( 'btn-text' );
const btnSpinner = document.getElementById( 'btn-spinner' );
const progressBar = document.getElementById( 'progress-bar' );
const progressText = document.getElementById( 'progress-text' );
const statusMessage = document.getElementById( 'status-message' );
const statusText = document.getElementById( 'status-text' );
const responseContainer = document.getElementById( 'response-container' );
const responseElement = document.getElementById( 'response' );
const copyBtn = document.querySelector( '.copy-btn' );


// Animate container on load
setTimeout( () =>
{
  container.style.transform = 'translateY(0)';
  container.style.opacity = '1';
}, 100 );

ws.onmessage = ( event ) =>
{
  const data = JSON.parse( event.data );
  console.log( data );

  // Update status message
  statusMessage.classList.add( 'show' );

  if ( data.step === 'extracting_urls' || data.step === 'urls_extracted' )
  {
    statusMessage.className = 'status-message status-processing show';
    statusText.textContent = data.message;
  }

  if ( data.step === 'extracting_data' )
  {
    statusMessage.className = 'status-message status-processing show';
    statusText.textContent = data.message;

    // Update progress
    const progress = data.progress || 0;
    progressBar.style.width = progress + "%";
    progressText.textContent = progress + "% completed";

    // Show processing state
    if ( !isProcessing )
    {
      isProcessing = true;
      btnText.textContent = "Scraping...";
      btnSpinner.style.display = 'block';
    }
  }
  else if ( data.step === 'completed' )
  {
    statusMessage.className = 'status-message status-complete show';
    statusText.textContent = 'Scraping completed successfully!';
    progressBar.style.width = "100%";
    progressText.textContent = "100% completed";

    // Reset button state
    isProcessing = false;
    btnText.textContent = "Start Scraping";
    btnSpinner.style.display = 'none';

    // Format and show response
    formatResponse( data.finalResponse );
    responseContainer.classList.add( 'expanded' );

    // Animate success
    progressBar.style.animation = 'none';
    void progressBar.offsetWidth; // Trigger reflow
    progressBar.style.animation = 'shimmer 1.5s infinite linear';
  }
  else if ( data.error )
  {
    statusMessage.className = 'status-message status-error show';
    statusText.textContent = 'Error: ' + data.message;

    // Reset button state
    isProcessing = false;
    btnText.textContent = "Try Again";
    btnSpinner.style.display = 'none';
  }
};

function processInput ()
{
  const url = document.getElementById( 'url' ).value;
  const number = document.getElementById( 'number' ).value;

  if ( !url || !number )
  {
    showError( 'Please fill in both fields' );
    return;
  }

  // Reset UI
  responseContainer.classList.remove( 'expanded' );
  responseElement.textContent = "Processing your request...";
  progressBar.style.width = "0%";
  progressText.textContent = "0% completed";
  statusMessage.className = 'status-message status-processing show';
  statusText.textContent = 'Starting scraping process...';

  // Show loading state
  isProcessing = true;
  btnText.textContent = "Scraping...";
  btnSpinner.style.display = 'block';

  fetch( 'http://localhost:3000/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify( { url, number } )
  } )
    .then( response =>
    {
      if ( !response.ok )
      {
        throw new Error( 'Network response was not ok' );
      }
      return response.json();
    } )
    .catch( error =>
    {
      showError( 'Connection error: ' + error.message );
      isProcessing = false;
      btnText.textContent = "Try Again";
      btnSpinner.style.display = 'none';
    } );
}

function formatResponse ( response )
{
  if ( typeof response === 'string' )
  {
    try
    {
      response = JSON.parse( response );
    } catch ( e )
    {
      responseElement.textContent = response;
      return;
    }
  }

  const formattedJson = JSON.stringify( response, null, 2 );
  const coloredJson = syntaxHighlight( formattedJson );
  responseElement.innerHTML = coloredJson;
}

function syntaxHighlight ( json )
{
  json = json.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
  return json.replace( /("(\\u[a-zA-Z0-9]{ 4 }|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function ( match )
    {
      let cls = 'json-value';
      if ( /^"/.test( match ) )
      {
        if ( /:$/.test( match ) )
        {
          cls = 'json-key';
        } else
        {
          cls = 'json-string';
        }
      } else if ( /true|false/.test( match ) )
      {
        cls = 'json-boolean';
      } else if ( /null/.test( match ) )
      {
        cls = 'json-null';
      } else if ( !isNaN( match ) )
      {
        cls = 'json-number';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    } );
}

function copyResponse ( event )
{
  event.stopPropagation();

  let textToCopy = responseElement.innerText || responseElement.textContent;

  navigator.clipboard.writeText( textToCopy ).then( () =>
  {
    copyBtn.innerHTML = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
  <span>Copied!</span>
  `;

    setTimeout( () =>
    {
      copyBtn.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span>Copy</span>
                        <span class="tooltiptext">Copy to clipboard</span>
                    `;
    }, 2000 );
  } ).catch( err =>
  {
    showError( 'Failed to copy: ' + err );
  } );
}

function toggleResponse ()
{
  responseContainer.classList.toggle( 'expanded' );
}

function showError ( message )
{
  statusMessage.className = 'status-message status-error show';
  statusText.textContent = message;

  // Add shake animation to error message
  statusMessage.style.animation = 'shake 0.5s';
  setTimeout( () =>
  {
    statusMessage.style.animation = '';
  }, 500 );
}

// Add shake animation for errors
const style = document.createElement( 'style' );
style.textContent = `
  @keyframes shake {
    0 %, 100 % { transform: translateX( 0 ); }
                20%, 60% { transform: translateX(-5px); }
  40%, 80% { transform: translateX(5px); }
            }
  `;
document.head.appendChild( style );
