export default function convertArabicRelativeTimeToISO ( arabicTime )
{
  const now = new Date();

  if ( arabicTime.trim() === "الآن" ) return now.toISOString();

  arabicTime = arabicTime.replace( /[٠-٩]/g, d => String( "٠١٢٣٤٥٦٧٨٩".indexOf( d ) ) );

  const regex = /(?:منذ|قبل)\s+(\d*)\s*(دقيقة|دقيقتين|دقائق|ساعتين|ساعة|ساعات|يوم|أيام)/;
  const match = arabicTime.match( regex );

  if ( !match ) return  "تنسيق غير صالح";

  let value = match[ 1 ] ? parseInt( match[ 1 ], 10 ) : 1;
  let unit = match[ 2 ];

  switch ( unit )
  {
    case "دقيقة":
    case "دقائق":
      now.setMinutes( now.getMinutes() - value );
      break;
    case "دقيقتين":
      now.setMinutes( now.getMinutes() - 2 );
      break;
    case "ساعة":
    case "ساعات":
      now.setHours( now.getHours() - value );
      break;
    case "ساعتين":
      now.setHours( now.getHours() - 2 );
      break;
    case "يوم":
    case "أيام":
      now.setDate( now.getDate() - value );
      break;
    default:
      return "وحدة زمنية غير مدعومة";
  }

  return now.toISOString();
}


