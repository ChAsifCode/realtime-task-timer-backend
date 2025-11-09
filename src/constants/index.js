const HttpStatusCode = {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER: 500,
};

const customLevels = {
    levels: {
        trace: 5,
        debug: 4,
        info: 3,
        warn: 2,
        error: 1,
        fatal: 0,
    },
    colors: {
        trace: "white",
        debug: "green",
        info: "green",
        warn: "yellow",
        error: "red",
        fatal: "red",
    },
};
const ExpirySeconds = Object.freeze({
    s30: 30,
    m1: 60,
    m5: 300,
    m10: 600,
    m15: 900,
    m30: 1800,
    h1: 3600,
    h3: 10800,
    h6: 21600,
    h12: 43200,
    d1: 86400,
});
const JwtTokenUsageTypes = Object.freeze({
    ForgetPassword: 'forgetPassword',
    Application: 'application',
    verifySignin: 'verifySignin',
    verifyforgetPassEmail: 'verifyforgetPassEmail',
    verifyforgetPassNumber: 'verifyforgetPassNumber',
});

export {
    HttpStatusCode,
    customLevels,
    ExpirySeconds,
    // RedisConnectionObject,
    JwtTokenUsageTypes,
};
