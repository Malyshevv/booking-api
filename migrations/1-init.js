const insertUsers =  require("./helpers/Users/createUsersTable");
const insertUserTokens =  require("./helpers/Users/createUsersTokensTable");
const insertSession =  require("./helpers/Session/createSessionTable");

module.exports.generateSql = () => `
${insertSession}
${insertUsers}
${insertUserTokens}
`
