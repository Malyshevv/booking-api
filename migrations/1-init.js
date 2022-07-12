const insertUsers =  require("./helpers/Users/createUsersTable");
const insertUserTokens =  require("./helpers/Users/createUsersTokensTable");
const insertSession =  require("./helpers/Session/createSessionTable");
const usersGroups =  require("./helpers/Usersgroups/1_7_2022_8_35_usersgroups");
const postsTable = require('./helpers/Posts/createPostsTable')

module.exports.generateSql = () => `
${insertSession}
${insertUsers}
${insertUserTokens}
${usersGroups}
${postsTable}
`
