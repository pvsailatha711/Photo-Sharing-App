/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
function fetchModel(url) {
  console.log(url);
  return new Promise(function (resolve, reject) {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          const error = new Error(response.statusText);
          error.status = response.status;
          return reject(error);
        }
        return response.json();
      })
      .then(data => {
        resolve({ data });
      })
      .catch(error => {
        const fetchError = new Error(error.message || "Network Error");
        fetchError.status = 500;
        reject(fetchError);
      });
  });
}

export default fetchModel;
