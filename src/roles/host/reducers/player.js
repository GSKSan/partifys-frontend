import { getAlbumCover } from 'helpers/tracks'
import * as actions from '../actions/player'

export default function playerReducer (state = null, action) {
  switch (action.type) {
    case actions.UPDATE_PLAYER_STATE:
      return action.state
      
    default:
      return state
  }
}

export const getPlayer = state => state

export const isPlayerAvailable = state => state !== null

export const getPosition = state => state.position

export const getDuration = state => state.duration

export const getProgress = state => state.position / state.duration

export const isPlaying = state => !state.paused

export const getCurrentTrack = state => ({
  id: state.track_window.current_track.id,
  name: state.track_window.current_track.name,
  durationMs: state.track_window.current_track.duration_ms,
  uri: state.track_window.current_track.uri
})

export const getCurrentAlbum = state => ({
  id: state.track_window.current_track.album.uri,
  name: state.track_window.current_track.album.name,
  cover: getAlbumCover(state.track_window.current_track)
})

export const getCurrentArtists = state =>
  state.track_window.current_track.artists.map(x => ({
    id: x.uri,
    name: x.name
  }))
