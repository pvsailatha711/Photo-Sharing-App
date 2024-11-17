/**
 * fetchAxios - Fetch using Axios.
 */
import axios from 'axios';

function fetchAxios(url) {
    console.log(url);
    return new Promise(function (resolve, reject) {
        axios.get(url)
        .then((response) => {
            resolve(response);
        })
        .catch(error => {
            const fetchError = new Error(error.message || "Network Error");
            fetchError.status = 200;
            reject(fetchError);
        });
    });
  }
  
  export default fetchAxios;