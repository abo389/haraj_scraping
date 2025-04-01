export default function convertEnglishRelativeTimeToISO ( englishTime )
{
  const now = new Date();

  // Normalize input (remove "Updated" and trim)
  englishTime = englishTime.trim().toLowerCase().replace( /^Updated \s*/i, '' );

  if ( englishTime === "now" ) return now.toISOString();

  // Updated regex to support variations
  const regex = /(\d+)\s*(minute|min|minutes|hour|hr\.?|hours|day|days)\s*(ago|before)?/i;
  const match = englishTime.match( regex );

  if ( !match ) return "Invalid format";

  let value = parseInt( match[ 1 ], 10 );
  let unit = match[ 2 ].toLowerCase();

  switch ( unit )
  {
    case "minute":
    case "minutes":
    case "min":
      now.setMinutes( now.getMinutes() - value );
      break;
    case "hour":
    case "hours":
    case "hr.":
    case "hr":
      now.setHours( now.getHours() - value );
      break;
    case "day":
    case "days":
      now.setDate( now.getDate() - value );
      break;
    default:
      return "Unsupported time unit";
  }

  return now.toISOString();
}
