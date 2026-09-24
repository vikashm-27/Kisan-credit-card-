export const msalConfig = {
  auth: {
    clientId: "93f648b7-94dd-41e2-b64c-4a6c8fc6021d",
    authority: "https://login.microsoftonline.com/3067f30e-f3ff-429c-adbc-2a8946ef668d",
    redirectUri: "http://localhost:3000",
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: true,
  },
};

export const loginRequest = {
  scopes: ["User.Read"],
};
