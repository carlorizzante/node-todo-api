const env = process.env.NODE_ENV || "dev";

if (env === "dev" || env === "test") {
  const config = require("./config.json");
  // console.log(JSON.stringify(config, null, 2));
  const configEnv = config[env];
  Object.keys(configEnv).forEach(key => {
    process.env[key] = configEnv[key];
    // console.log(JSON.stringify(process.env, null, 2));
  });
}
