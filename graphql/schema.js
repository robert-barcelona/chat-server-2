const {gql} = require('apollo-server-express/dist/index');


const typeDefs = gql`

  
  type ConversationCredentials {
    sessionToken:String!
    sessionID:String!
  }

  type ConversationFragment {
    id: ID!
    added: String!
    message: String!
    reply: String
    sessionID:String!
  }
  
  type MessageReply {
    conversationFragment: ConversationFragment!
    addlData: [String]!
  }


  type Query {
    getConversations(sessionID:String!):[ConversationFragment]!
    getConversationCredentials:ConversationCredentials!
  }


  type Mutation {
    sendMessage(sessionToken:String!,sessionID:String!,message:String):MessageReply!
  }



`


module.exports = typeDefs

