import axios from 'axios';
import { useEffect, useState } from 'react';
import RequestModal from '../modules/overseerr/RequestModal';

export default function TryRequest(props: any) {
  const [OverseerrResults, setOverseerrResults] = useState<any[]>([]);
  useEffect(() => {
    // Use the overseerr API get the media info.
    axios
      .get('/api/modules/overseerr?query=Lucifer')
      .then((res) => {
        setOverseerrResults(res.data.results);
      })
      .catch((err) => {
        throw err;
      });
  }, [props]);
  if (!OverseerrResults || OverseerrResults.length === 0) {
    return null;
  }
  return <RequestModal base={OverseerrResults[0]} />;
}
