const express = require('express');
const {ApolloServer, gql} = require('apollo-server-express');
var cors = require('cors');
var axios = require('axios')
const {prisma} = require('./generated/prisma-client/index.js');


const typeDefs = require('./graphql/schema')
const resolvers = require('./graphql/resolvers')

let currentExpiration, currentAccessToken

const API_KEY = 'nyUl7wzXoKtgoHnd2fB0uRrAv0dDyLC+b4Y6xngpJDY='


const getAuthorization = async (apiKey) => {
  console.log('in authorization',currentExpiration,currentAccessToken)

  const secret = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0IjoieW9kYV9jaGF0Ym90X2VuIn0.anf_eerFhoNq6J8b36_qbD4VqngX79-yyBKWih_eA1-HyaMe2skiJXkRNpyWxpjmpySYWzPGncwvlwz5ZRE7eg'
  if (currentExpiration && currentAccessToken && (Date.now() - currentExpiration > 120000)) return {accessToken:currentAccessToken,expiration:currentExpiration}

  console.log('in authorization, getting new tokens')

  try {
    const results = await axios({
      method: 'post',
      url: 'https://api.inbenta.io/v1/auth',
      data: {secret},
      headers: {
        'x-inbenta-key': apiKey,
        'Content-Type': 'application/json'
      }

    })
    currentAccessToken = results.data.accessToken
    currentExpiration = results.data.expiration
    return results.data

  } catch (e) {
    console.log(`Error in authorization: ${e.message}`)
  }

}

const getApiURL = async (apiKey, accessToken) => {

  try {
    const results = await axios({
      method: 'get',
      url: 'https://api.inbenta.io/v1/apis',
      headers: {
        'x-inbenta-key': apiKey,
        'Authorization': `Bearer ${accessToken}`
      }
    })
    return results.data

  } catch
    (e) {
    console.log(`Error  getting API URL: ${e.message}`)
  }
}


const init = async () => {


  const server = new ApolloServer({
    typeDefs, resolvers,
    context: async ({req}) => {
      const {accessToken, expiration} = await getAuthorization(API_KEY)
      console.log('in INIT: accessToken = ', accessToken)
      const {apis: {chatbot: chatbotURL}} = await getApiURL(API_KEY, accessToken)
      return {prisma, accessToken, chatbotURL: `${chatbotURL}/v1`, apiKey: API_KEY}
    },
    debug: true,
  });

  const app = express();
  app.use(cors());


  server.applyMiddleware({app});

  app.listen({port: 4000}, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
  );
}

init()


