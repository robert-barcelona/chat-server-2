const axios = require('axios')


const notFounds = {}

const getSWCharacters = async (text, sessionID, limit = 25) => {
  if (!notFounds[sessionID]) notFounds[sessionID] = false // yes, this will grow without bounds, but for a quick and dirty solution it'll work
  const wasFoundBefore = notFounds[sessionID]
  if (text.toLowerCase().includes('I couldn\'t find any information relating to your question') && !wasFoundBefore) {
    notFounds[sessionID] = true
    return []
  } else if (!text.toLowerCase().includes('not found')) {
    notFounds[sessionID] = false
    return []
  } else {
    notFounds[sessionID] = false

    try {
      const data = await axios({
        method: 'get',
        url: `https://swapi.co/api/people/`,
      })

      return data.data.results.map(entry => entry.name).slice(0, limit)
    } catch (e) {
      throw new Error(`Error in getting Star Wars characters: ${e.message}`)
    }
  }

}

const getSWFilms = async (text, limit = 25) => {
  if (!text.toLowerCase().includes('force')) return []
  try {
    const data = await axios({
      method: 'get',
      url: `https://swapi.co/api/films/`,

    })

    return data.data.results.map(entry => entry.title).slice(0, limit)
  } catch (e) {

    throw new Error(`Error in getting Star Wars films: ${e.message}`)
  }

}


module.exports = async (sessionID, conversationFragment) => {

  let returnValue = []

  const SWCharacters = await getSWCharacters(conversationFragment.reply, sessionID)
  returnValue = [...returnValue, ...SWCharacters]

  const SWFilms = await getSWFilms(conversationFragment.message)
  returnValue = [...returnValue, ...SWFilms]

  return returnValue

}
