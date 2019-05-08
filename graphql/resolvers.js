const axios = require('axios')

const messageDecorator = require('../helpers/messageDecorator')

let conversation = null
let sessionToken, sessionID

const resolvers = {
  Mutation: {

    sendMessage: async (parent, {sessionToken, sessionID, message}, {apiKey, chatbotURL, accessToken, prisma}) => {
    console.log(`in send message ${chatbotURL}/conversation/message`,'sessionToken',`Bearer ${sessionToken}`)
    console.log('accessToken',`Bearer ${accessToken}`)
    const data = JSON.stringify({message})
  //    console.log('data', data)
console.log('apiKey',apiKey)
      try {
        const results = await axios({
          method: 'post',
          data: {message},
          
          url: `${chatbotURL}/conversation/message`,
          headers: {
            'x-inbenta-key': apiKey,
            'Authorization': `Bearer ${accessToken}`,
            'x-inbenta-session': `Bearer ${sessionToken}`
          }

        })
       console.log('got request result',results.data)
        const conversationFragment = await prisma.createConversationFragment({sessionID, message, reply: results.data.answers[0].message})
      //  console.log('created fragment', conversationFragment)
        const addlData = await messageDecorator(sessionID,conversationFragment)
        return {conversationFragment, addlData}
      } catch (e) {
        throw new Error(`Error in sending message: ${e.message}`)
      }

    }
  },

  Query: {
    getConversationCredentials: async (parent, args, {apiKey, chatbotURL, accessToken}) => {
    //  console.log('convo creds')
      try {
        const results = await axios({
          method: 'post',
          url: `${chatbotURL}/conversation`,
          headers: {
            'x-inbenta-key': apiKey,
            'Authorization': `Bearer ${accessToken}`
          }

        })
        sessionToken = results.data.sessionToken
        sessionID = results.data.sessionId
       // console.log('GetCredentials: sessionToken = ',sessionToken, 'sessionID = ', sessionID)
        return {sessionToken,sessionID}

      } catch (e) {
        throw new Error(`Error in getting credentials: ${e.message}`)
      }

    },
    getConversations: async (parent, {sessionID}, {prisma}) => {
    //  console.log('sessionID on server is!', sessionID)
      return await prisma.conversationFragments({orderBy: 'added_DESC', where: {sessionID}})
    }
  },
  ConversationFragment: {
    added: async (parent, args) => {
      const d = new Date(parent.added)
      return d.toUTCString()
    }
  }

}


module.exports = resolvers
