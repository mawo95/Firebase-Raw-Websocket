const axios = require("axios");
const jwt = require('jsonwebtoken');
const fs = require("fs");

function isTokenExpired(token) {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded.exp !== 'number') {
    return true;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

async function getIdToken() {
  const url = 'https://securetoken.googleapis.com/v1/token?key=AIzaSyA_8SvhiK_zOQsWII5SCJARuDIqV0gqvwY';

  let idToken = '';

  try {
    if (fs.existsSync('session.txt')) {
      const sessionData = fs.readFileSync('session.txt', 'utf8')
      const token = sessionData;
      if (!isTokenExpired(token)) {
          return token;
      }
    }
     
    
	const data = {
      grantType: 'refresh_token',
      refreshToken: 'AMf-vBw6NKRExRwEoCpll3WJvZyQ2UpL_QounbmnWTQC-58fRR_Q1Z8xc9fthVzhmDXihqs9d7y42WEY4NX0CMjS63_GEUgClBh2GiFDiQkp4VWRjJmEKtD5DoRsh73srfgSW1IJ9b8v9I_EiYu47hHIuXoSdHU7h547l6etyU5XxpFQNJgAbwzcBXy6ablec-7jV8M-XwvyBYPe8R2Hv1R8lqTibLgEfqRDRR5q7y251eg1PcsP_whbIqimJyDx6IyKmxNhwA66Q7xwrGcWyGzkRr5Ks97yDDpuh5slFoKQ1TfIcsmpzNCgTSL2nyHHbunQLvvHTVWAB2ouQCyknhuFK4N7s55S1bBMZkJ-V_Ek5SBLgp_qXlOCB6-IJ6c1lxpEgx84wd8bGAEIQeN_bkl93bSnsC9C6g',
    };
      var response
      try{
   response = await axios.post(url, new URLSearchParams(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        "Accept": "application/json",
        "X-Android-Package": "com.madfut.madfut24",
        "X-Android-Cert": "8107BCAD1FAF017984D5D1F3DB3A158FB3401364",
        "Accept-Language": "de-DE, en-US",
        "X-Client-Version": "Android/Fallback/X22001002/FirebaseCore-Android",
        "X-Firebase-GMPID": "1:660557070780:android:3a7903b8f068d8859c2bb9",
        "X-Firebase-Client": "H4sIAAAAAAAAAKtWykhNLCpJSk0sKVayio7VUSpLLSrOzM9TslIyUqoFAFyivEQfAAAA",
        "X-Firebase-AppCheck": "eyJlcnJvciI6IlVOS05PV05fRVJST1IifQ==",
        "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 8.1.0; Moto G (5) Build/OPP28.85-19-4-2)",
        "Host": "securetoken.googleapis.com",
        "Connection": "Keep-Alive",
        "Accept-Encoding": "gzip",
      },
    });
      }catch{
          console.log("USER BANNED!!!!!!!!!!!!!!!!!!!!!!!")
      }

    idToken = response.data.id_token;
    console.log("needed to fetch new token!")
    fs.writeFileSync('session.txt', `${idToken}`, 'utf8');
  } catch (error) {
    console.error('Error fetching or saving the token:', error);
  }

  return idToken;
}

module.exports = {
  getIdToken
};
